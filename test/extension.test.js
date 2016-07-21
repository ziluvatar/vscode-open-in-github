/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
var assert = require('assert');

var proxyquire = require('proxyquire');
var fs = require('fs');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
var {commands, workspace, window, Position, Range, Selection} = require('vscode');
var {createRandomFile, deleteFile, cleanUp, pathEquals} = require('./utils');
var {join} = require('path');


var extensionStubs = {};
var myExtension = proxyquire('../src/extension',{
	'copy-paste': {
		copy: link => extensionStubs.copy(link),
	},
	open: link => extensionStubs.open(link)
});

function openEditor(file, lineNumber) {
	return workspace.openTextDocument(join(workspace.rootPath, file)).then(doc => {
		return window.showTextDocument(doc).then((editor) => {
			var line = new Position(lineNumber - 1,0);
			editor.selection = new Selection(line, line);			
		});
	});	
}

var providers = [
	{
		folder: 'github',
		url: (file, line) => `https://github.com/user/repo-name/blob/test-master/${file}#L${line}`
	},
	{
		folder: 'bitbucket',
		url: (file, line) => `https://bitbucket.org/user/repo-name/src/test-master/${file}#cl-${line}`
	}
];

// Defines a Mocha test suite to group tests of similar kind together
// https://github.com/Microsoft/vscode/blob/master/extensions/vscode-api-tests/src/editor.test.ts
providers.forEach(function(provider) {
	suite(`Extension Tests - ${provider.folder}`, function() {

		suiteSetup(function(done){
			fs.rename(join(workspace.rootPath, `./${provider.folder}/.gitted`), join(workspace.rootPath, '.git'), done);		
		});

		setup(function(){
			extensionStubs = {
				copy: (link) => { console.warn('default copy function called'); },
				open: (link) => { console.warn('default open function called'); }
			}
		});

		teardown(cleanUp);

		suiteTeardown(function (done) {
			fs.rename(join(workspace.rootPath, '.git'), join(workspace.rootPath, `./${provider.folder}/.gitted`), done);				
		})

		test('Run copyGitHubLinkToClipboard command', (done) => {
			var line = 3;
			var file = `${provider.folder}/file1.txt`;
			openEditor(`./${file}`, line).then(() => {
				extensionStubs.copy = function(link) {
					assert.equal(link, provider.url(file, line));
					done();
				}
				extensionStubs.open = () => done(new Error('Open must not be called'));

				commands.executeCommand('extension.copyGitHubLinkToClipboard');
			});
		});	

		test('Run openInGitHub command', (done) => {
			var line = 2;
			var file = `${provider.folder}/file1.txt`;
			openEditor(`./${file}`, line).then(() => {
				extensionStubs.open = function(link) {
					assert.equal(link, provider.url(file, line));
					done();
				}
				extensionStubs.copy = () => done(new Error('Copy must not be called'));

				commands.executeCommand('extension.openInGitHub');
			});
		});
	});		
});