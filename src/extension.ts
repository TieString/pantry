import * as vscode from 'vscode';

const rootPath = vscode.workspace.workspaceFolders[0].uri.path;
let config = vscode.workspace.getConfiguration();
let excluded: Record<string, boolean> | undefined;

export function activate(context: vscode.ExtensionContext) {
	let markAsSundry = vscode.commands.registerCommand("pantry.markAsSundry",
		(uri: vscode.Uri) => {
			const filePath = uri.path,
				relativePath = "**" + filePath.split(rootPath).join('');
			removeFile(relativePath);
		}
	);
	context.subscriptions.push(markAsSundry);
}

// 扩展取消激活时
export function deactivate() {
	vscode.window.showInformationMessage('取消激活');
}


/**
 * @description 移除文件/文件夹
 * @author TieString
 * @date 2022/11/30
 */
async function removeFile(filepath: string) {
	await config.update("files.exclude",
		{
			...excluded,
			[filepath]: true,
		},
		vscode.ConfigurationTarget.Global
	);
}