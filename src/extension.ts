import * as vscode from 'vscode';
import { markFile, unmarkFile, PantryTree } from './file';

const rootPath = vscode.workspace.workspaceFolders![0].uri.path + '/';

export function activate(context: vscode.ExtensionContext) {
	// 标记为杂项
	let markAsSundry = vscode.commands.registerCommand("pantry.markAsSundry", (uri: vscode.Uri) => {
		const fullPath = uri.path;
		const relativePath = "**/" + fullPath.split(rootPath).join('');

		// markFile(relativePath);	// 将文件标记到 Exclude
		// 将文件添加到 Pantry 中
		vscode.window.registerTreeDataProvider('pantry', new PantryTree(uri.fsPath));
	}
	);

	// 取消标记
	let unmarkAsSundry = vscode.commands.registerCommand("pantry.unmarkAsSundry",
		(uri: vscode.Uri) => {
			const fullPath = uri.path,
				relativePath = "**" + fullPath.split(rootPath).join('');
			unmarkFile(relativePath);
		}
	);

	context.subscriptions.push(markAsSundry, unmarkAsSundry);
}

// 扩展取消激活时
export function deactivate() {
	vscode.window.showInformationMessage('取消激活');
}