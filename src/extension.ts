import * as vscode from 'vscode';
import { markFile, unmarkFile, pantryItemClick , activateData} from './file';


// Todo: 多项选择 画框选择
export function activate(context: vscode.ExtensionContext) {
	activateData(context);

	// 标记为杂项
	let markAsSundry = vscode.commands.registerCommand("pantry.markAsSundry", (uri: vscode.Uri) => {
		markFile(uri, context);	// 将文件标记到 Exclude
	});

	// 取消标记
	let unmarkAsSundry = vscode.commands.registerCommand("pantry.unmarkAsSundry", (uri: vscode.Uri) => {
		unmarkFile(uri, context);
	});

	// 打开文件/文件夹
	let openFile = vscode.commands.registerCommand('pantry.openFile', (path: string) => {
		pantryItemClick(path);
	});

	context.subscriptions.push(markAsSundry, unmarkAsSundry, openFile);
}

// 扩展取消激活时
export function deactivate() {
	vscode.window.showInformationMessage('取消激活');
}