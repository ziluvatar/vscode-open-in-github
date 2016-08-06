// Based on https://github.com/Microsoft/vscode/blob/master/extensions/vscode-api-tests/src/utils.ts
'use strict';

var assert = require('assert');
var vscode = require('vscode');

module.exports.cleanUp = function cleanUp() {
	return new Promise((c, e) => {
		if (vscode.window.visibleTextEditors.length === 0) {
			return c();
		}

		// TODO: the visibleTextEditors variable doesn't seem to be
		// up to date after a onDidChangeActiveTextEditor event, not
		// even using a setTimeout 0... so we MUST poll :(
		const interval = setInterval(() => {
			if (vscode.window.visibleTextEditors.length > 0) {
				return;
			}

			clearInterval(interval);
			c();
		}, 10);

		vscode.commands.executeCommand('workbench.action.closeAllEditors')
			.then(null, err => {
				clearInterval(interval);
				e(err);
			});
	}).then(() => {
		assert.equal(vscode.window.visibleTextEditors.length, 0);
		assert(!vscode.window.activeTextEditor);

		// TODO: we can't yet make this assertion because when
		// the phost creates a document and makes no changes to it,
		// the main side doesn't know about it and the phost side
		// assumes it exists. Calling closeAllFiles will not
		// remove it from textDocuments array. :(

		// assert.equal(vscode.workspace.textDocuments.length, 0);
	});
}