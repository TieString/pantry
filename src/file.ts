import * as vscode from 'vscode';
import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, ProviderResult, window } from "vscode";
import * as  fs from "fs";
import * as path from "path";

let config = vscode.workspace.getConfiguration();
let excluded: Record<string, boolean> | undefined;

/**
 * @description 标记文件
 * @author TieString
 * @date 2022/11/30
 * @param {string} filePath 文件相对根目录路径
 */
export async function markFile(filePath: string) {
	// Todo: 在 excluded 中标记杂物间的杂项
	await config.update("files.exclude",
		excluded = {
			...excluded,
			[filePath]: true, // markAsSundry
		},
		vscode.ConfigurationTarget.Workspace
	);
}

/**
 * @description 取消标记 
 * @author TieString
 * @date 2022/12/03
 * @param {string} filePath 文件相对根目录路径
 */
export async function unmarkFile(filePath: string) {
	await config.update("files.exclude",
		excluded = {
			...excluded,
			[filePath]: false, // markAsSundry
		},
		vscode.ConfigurationTarget.Workspace
	);
}

export class PantryTree implements TreeDataProvider<PantryItem>{
	constructor(private rootPath: string) { }

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
			return Promise.resolve(this.searchFiles(path.join(element.parentPath, element.label)));
		}
	}
	//查找文件，文件夹
	private searchFiles(parentPath: string): PantryItem[] {
		var treeDir: PantryItem[] = [];
		if (this.pathExists(parentPath)) {
			if (fs.statSync(parentPath).isDirectory()) {
				var fsReadDir = fs.readdirSync(parentPath, 'utf-8');
				fsReadDir.forEach(fileName => {
					var filePath = path.join(parentPath, fileName);//用绝对路径
					if (fs.statSync(filePath).isDirectory()) {//目录
						treeDir.push(new PantryItem(fileName, parentPath, TreeItemCollapsibleState.Collapsed));
					}
					else {//文件
						treeDir.push(new PantryItem(fileName, parentPath, TreeItemCollapsibleState.None));
					}
				});
			} 
			else {
				treeDir.push(new PantryItem(parentPath.split, parentPath, TreeItemCollapsibleState.None));
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
}

export class PantryItem extends TreeItem {
	constructor(
		public readonly label: string,      //存储当前标签
		public readonly parentPath: string,   //存储当前标签的路径，不包含该标签这个目录
		public readonly collapsibleState: TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
	}
	// //设置鼠标悬停在此项上时的工具提示文本
	// get tooltip(): string {
	// 	return path.join(this.parentPath, this.label);
	// }
	// //为每项添加点击事件的命令
	// command = {
	// 	title: "this.label",
	// 	command: 'PantryItem.itemClick',
	// 	arguments: [    //传递两个参数
	// 		this.label,
	// 		path.join(this.parentPath, this.label)
	// 	]
	// };
	// contextValue = 'PantryItem';//提供给 when 使用
}
