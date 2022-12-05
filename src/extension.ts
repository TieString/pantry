import * as vscode from 'vscode';
import { markFile, unmarkFile } from './file';


export function activate(context: vscode.ExtensionContext) {
	// 标记为杂项
	let markAsSundry = vscode.commands.registerCommand("pantry.markAsSundry", (uri: vscode.Uri) => {
		markFile(uri);	// 将文件标记到 Exclude
	});

	// 取消标记
	let unmarkAsSundry = vscode.commands.registerCommand("pantry.unmarkAsSundry", (uri: vscode.Uri) => {
		unmarkFile(uri);
	});

	context.subscriptions.push(markAsSundry, unmarkAsSundry);
}

// 扩展取消激活时
export function deactivate() {
	vscode.window.showInformationMessage('取消激活');
}