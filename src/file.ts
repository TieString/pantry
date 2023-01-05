import * as vscode from 'vscode';
import * as  fs from "fs";
import * as path from "path";

const rootPath = vscode.workspace.workspaceFolders![0].uri.path + '/';
let config = vscode.workspace.getConfiguration();
let excluded: Record<string, boolean>;
let globalTreeDir: PantryItem[] = [];

/**
 * @description 标记文件
 * @author TieString
 * @date 2022/11/30
 * @param {string} uri
 */
export async function markFile(uri: vscode.Uri, context: vscode.ExtensionContext) {
	const fullPath = uri.path;	// 完整路径
	const relativePath = "**/" + fullPath.split(rootPath).join('');	// 相对根目录路径

	// 将文件添加到 Pantry 中
	vscode.window.createTreeView('pantry', {
		treeDataProvider: new PantryTree(uri.fsPath, 'add')
	});

	// Todo: 在 excluded 中标记杂物间的杂项
	await config.update("files.exclude",
		excluded = {
			...excluded,
			[relativePath]: true, // markAsSundry
		},
		vscode.ConfigurationTarget.Workspace
	);

	// 添加到工作空间域中
	context.workspaceState.update('globalTreeDir', globalTreeDir);
	context.workspaceState.update('excluded', excluded);
}

/**
 * @description 取消标记 
 * @author TieString
 * @date 2022/12/03
 * @param {string} uri
 */
export async function unmarkFile(uri: { fsPath: string, label: string }, context: vscode.ExtensionContext) {
	const fullFspath = uri.fsPath + uri.label;
	vscode.window.createTreeView('pantry', {
		treeDataProvider: new PantryTree(fullFspath, 'remove')
	});

	/* 将路径格式 [F:\\a.js] 转为 [/F:/a.js] */
	const fullPath = '/' + fullFspath.replace(/\\/g, '/'),
		relativePath = "**/" + fullPath.split(rootPath).join('');

	await config.update("files.exclude",
		(Reflect.deleteProperty(excluded, relativePath), excluded),
		vscode.ConfigurationTarget.Workspace
	);

	// 添加到工作空间域中
	context.workspaceState.update('globalTreeDir', globalTreeDir);
	context.workspaceState.update('excluded', excluded);
}

// 文件/文件夹点击
export function pantryItemClick(path: string) {
	if (fs.statSync(path).isDirectory()) {
		// vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(path), false);
	} else {
		vscode.workspace.openTextDocument(path).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	}
}

export function activateData(context: vscode.ExtensionContext) {
	const treeDir = context.workspaceState.get('globalTreeDir') as PantryItem[];
	if (treeDir) { globalTreeDir = treeDir; }
	const ex = context.workspaceState.get('excluded') as Record<string, boolean>;
	if (ex) { excluded = ex; }
	vscode.window.createTreeView('pantry', {
		treeDataProvider: new PantryTree('', 'add')
	});
}

class PantryTree implements vscode.TreeDataProvider<PantryItem>{
	constructor(
		private rootPath: string,
		private mode: string,
	) { }

	// 添加的是目录项，而非展开的内容
	private flag = true;

	getTreeItem(element: PantryItem): PantryItem | Thenable<PantryItem> {
		return element;
	}

	getChildren(element?: PantryItem | undefined): vscode.ProviderResult<PantryItem[]> {
		if (element === undefined) {
			// 根目录
			if (this.mode === "add") {
				let treeDir = this.searchFiles(this.rootPath);
				globalTreeDir = [...treeDir, ...globalTreeDir];
			} else if (this.mode === "remove") {
				// 取消标记文件，从全局树目录中去除该路径
				globalTreeDir = globalTreeDir.filter(item => item.fsPath + item.label !== this.rootPath);
			}
			return Promise.resolve(globalTreeDir);
		}
		else {
			// 展开后的内容
			let treeDir = this.searchFiles(path.join(element.fsPath, element.label));
			return Promise.resolve(treeDir);
		}
	}

	//查找文件，文件夹
	private searchFiles(parentPath: string): PantryItem[] {
		let treeDir: PantryItem[] = [];
		const name = path.basename(parentPath);
		const fsPath = parentPath.split(name)[0];

		if (this.pathExists(parentPath)) {
			if (fs.statSync(parentPath).isDirectory()) {	// 路径是否文件夹
				if (this.flag === true) {	// 目录项
					treeDir.push(new PantryItem(name, fsPath, vscode.TreeItemCollapsibleState.Collapsed));
					this.flag = false;
				}
				else {	// 目录下拉列表内容
					let fsReadDir = fs.readdirSync(parentPath, 'utf-8');
					fsReadDir.forEach(fileName => {
						let filePath = path.join(parentPath, fileName);	//用绝对路径
						if (fs.statSync(filePath).isDirectory()) {	//目录
							treeDir.push(new PantryItem(fileName, parentPath, vscode.TreeItemCollapsibleState.Collapsed));
						}
						else {	//文件
							treeDir.push(new PantryItem(fileName, parentPath, vscode.TreeItemCollapsibleState.None));
						}
					});
				}
			}
			else {
				treeDir.push(new PantryItem(name, fsPath, vscode.TreeItemCollapsibleState.None));
			}

		}
		return treeDir;
	}

	/* 判断路径是否存在 */
	private pathExists(filePath: string): boolean {
		try {
			fs.accessSync(filePath);
		}
		catch (err) {
			return false;
		}
		return true;
	}

	// 更新
	private _onDidChangeTreeData: vscode.EventEmitter<undefined | null | void> = new vscode.EventEmitter<undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<undefined | null | void> = this._onDidChangeTreeData.event;
	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}

class PantryItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,      //存储当前标签
		public readonly fsPath: string,   //存储当前标签的路径，不包含该标签名称
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
	}
	//为每项添加点击事件的命令
	command = {
		title: this.label,          // 标题
		command: 'pantry.openFile',
		arguments: [
			this.fsPath + this.label
		],
		tooltip: this.label,        // 鼠标覆盖时的小小提示框
	};
	contextValue = 'PantryItem'; //提供给 when 使用

	// iconPath = PantryItem.getIconUriForLabel(this.label);

	// // __filename：当前文件的路径
	// // Uri.file(join(__filename,'..','assert', ITEM_ICON_MAP.get(label)+''));   写成这样图标出不来
	// static getIconUriForLabel(label: string): vscode.Uri {
	// 	return vscode.Uri.file(path.join(__filename, '..', '..', 'src', 'assert', ITEM_ICON_MAP.get(label) + ''));
	// }

}
