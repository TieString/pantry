import * as vscode from 'vscode';
import { hideFile } from './file';

const rootPath = vscode.workspace.workspaceFolders![0].uri.path;

export function activate(context: vscode.ExtensionContext) {
	// 标记为杂项
	let markAsSundry = vscode.commands.registerCommand("pantry.markAsSundry",
		(uri: vscode.Uri) => {
			const filePath = uri.path,
				relativePath = "**" + filePath.split(rootPath).join('');
			hideFile(relativePath);
		}
	);
	context.subscriptions.push(markAsSundry);
}

// 扩展取消激活时
export function deactivate() {
	vscode.window.showInformationMessage('取消激活');
}