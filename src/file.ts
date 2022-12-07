import * as vscode from 'vscode';
import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, ProviderResult, window } from "vscode";
import * as  fs from "fs";
import * as path from "path";

const rootPath = vscode.workspace.workspaceFolders![0].uri.path + '/';
let config = vscode.workspace.getConfiguration();
let excluded: Record<string, boolean>;
let treeDir: PantryItem[] = [];

/**
 * @description 标记文件
 * @author TieString
 * @date 2022/11/30
 * @param {string} uri
 */
export async function markFile(uri: vscode.Uri) {
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
}

/**
 * @description 取消标记 
 * @author TieString
 * @date 2022/12/03
 * @param {string} uri
 */
export async function unmarkFile(uri: vscode.Uri) {
	vscode.window.createTreeView('pantry', {
		treeDataProvider: new PantryTree(uri.fsPath, 'remove')
	});

	/* 将路径格式 [F:\\a.js] 转为 [/F:/a.js] */
	const fullPath = '/' + uri.fsPath.replace(/\\/g, '/'),
		relativePath = "**/" + fullPath.split(rootPath).join('');

	await config.update("files.exclude",
		(Reflect.deleteProperty(excluded, relativePath), excluded),
		vscode.ConfigurationTarget.Workspace
	);
}

class PantryTree implements TreeDataProvider<PantryItem>{
	constructor(
		private rootPath: string,
		private mode: string,
	) { }

	getTreeItem(element: PantryItem): PantryItem | Thenable<PantryItem> {
		return element;
	}

	getChildren(element?: PantryItem | undefined): ProviderResult<PantryItem[]> {
		if (!this.rootPath) {
			window.showInformationMessage('No file in empty directory');
			return Promise.resolve([]);
		}
		if (element === undefined) {
			return Promise.resolve(this.searchFiles(this.rootPath));
		}
		else {
			return Promise.resolve(this.searchFiles(path.join(element.fsPath, element.label)));
		}
	}
	//查找文件，文件夹
	private searchFiles(parentPath: string): PantryItem[] {
		if (this.pathExists(parentPath)) {
			if (this.mode === "add") {
				/* 判断是否文件夹 将其添加到 treeDir 数组中 */
				if (fs.statSync(parentPath).isDirectory()) {
					// treeDir.push(new PantryItem(path.basename(parentPath) , parentPath, TreeItemCollapsibleState.Collapsed));
					let fsReadDir = fs.readdirSync(parentPath, 'utf-8');
					fsReadDir.forEach(fileName => {
						let filePath = path.join(parentPath, fileName);//用绝对路径
						if (fs.statSync(filePath).isDirectory()) {//目录
							treeDir.push(new PantryItem(fileName, parentPath, TreeItemCollapsibleState.Collapsed));
						}
						else {	//文件
							treeDir.push(new PantryItem(fileName, parentPath, TreeItemCollapsibleState.None));
						}
					});
				}
				else {
					treeDir.push(new PantryItem(path.basename(parentPath), parentPath, TreeItemCollapsibleState.None));
				}
			} else if (this.mode === "remove") {
				treeDir = treeDir.filter(item => item.fsPath !== parentPath);
			}

		}
		return treeDir;
	}
	//判断路径是否存在
	private pathExists(filePath: string): boolean {
		try {
			fs.accessSync(filePath);
		}
		catch (err) {
			return false;
		}
		return true;
	}

	private _onDidChangeTreeData: vscode.EventEmitter<undefined | null | void> = new vscode.EventEmitter<undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<undefined | null | void> = this._onDidChangeTreeData.event;
	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}

class PantryItem extends TreeItem {
	constructor(
		public readonly label: string,      //存储当前标签
		public readonly fsPath: string,   //存储当前标签的路径，不包含该标签这个目录
		public readonly collapsibleState: TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
	}
	//为每项添加点击事件的命令
	command = {
		title: this.label,          // 标题
		command: 'PantryItem.itemClick',
		arguments: [    //传递两个参数
			this.label,
			path.join(this.fsPath, this.label)
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
