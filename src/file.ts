import * as vscode from 'vscode';

let config = vscode.workspace.getConfiguration();
let excluded: Record<string, boolean> | undefined;

/**
 * @description 移除文件/文件夹
 * @author TieString
 * @date 2022/11/30
 */
export async function hideFile(filePath: string) {
	// Todo: 在 excluded 中标记杂物间的杂项
	await config.update("files.exclude",
		excluded = {
			...excluded,
			[filePath]: true, // markAsSundry
		},
		vscode.ConfigurationTarget.Workspace
	);
}

export async function showFile(filePath: string) {
    
}