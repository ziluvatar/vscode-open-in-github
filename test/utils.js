/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

var assert = require('assert');
var vscode = require('vscode');
var fs = require('fs');
var os = require('os');
var {join} = require('path');

function rndName() {
	return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
}

module.exports.createRandomFile = function createRandomFile(contents) {
	contents = contents || '';
	return new Promise((resolve, reject) => {
		const tmpFile = join(os.tmpdir(), rndName());
		fs.writeFile(tmpFile, contents, (error) => {
			if (error) {
				return reject(error);
			}

			resolve(vscode.Uri.file(tmpFile));
		});
	});
}

module.exports.pathEquals = function pathEquals(path1, path2) {
	if (process.platform !== 'linux') {
		path1 = path1.toLowerCase();
		path2 = path2.toLowerCase();
	}

	return path1 === path2;
}

module.exports.deleteFile = function deleteFile(file) {
	return new Promise((resolve, reject) => {
		fs.unlink(file.fsPath, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}

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