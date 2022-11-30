import * as vscode from 'vscode';

// 扩展激活时
export function activate(context: vscode.ExtensionContext) {
	// 执行时的输出
	console.log('Hello VS Codes');

	// 在 package.json 中注册的命令 pantry.helloWorld
	let disposable = vscode.commands.registerCommand('pantry.helloWorld', () => {
		// 当命令被执行时 显示消息
		vscode.window.showInformationMessage('Hello World from pantry!');
	});

	context.subscriptions.push(disposable);

	// 标记为杂项：移动到 Pantry 栏
	let markAsSundry = vscode.commands.registerCommand("pantry.markAsSundry", async () => {
		let answer = await vscode.window.showInformationMessage("How was your day ?", "good", "bad",);
		if (answer === "bad") {
			vscode.window.showInformationMessage("sorry to hear it");
		} else {
			console.log({ answer });
		}
	});

	context.subscriptions.push(markAsSundry);
}

// 扩展取消激活时
export function deactivate() {
	vscode.window.showInformationMessage('取消激活');
}
