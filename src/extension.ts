import * as vscode from 'vscode';
import { markFile, unmarkFile } from './file';


// Todo: 多项选择 画框选择
export function activate(context: vscode.ExtensionContext) {
	// 标记为杂项
	let markAsSundry = vscode.commands.registerCommand("pantry.markAsSundry", (uri: vscode.Uri) => {
		markFile(uri);	// 将文件标记到 Exclude
	});

	// 取消标记
	let unmarkAsSundry = vscode.commands.registerCommand("pantry.unmarkAsSundry", (uri: vscode.Uri) => {
		unmarkFile(uri);
	});

	// 打开文件
	let openFile = vscode.commands.registerCommand('pantry.openFile', (file: string) => {
		vscode.workspace.openTextDocument(file).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	});

	context.subscriptions.push(markAsSundry, unmarkAsSundry, openFile);
}

// 扩展取消激活时
export function deactivate() {
	vscode.window.showInformationMessage('取消激活');
}