/* global suite, test */
// Based on https://github.com/Microsoft/vscode/blob/master/extensions/vscode-api-tests/src/editor.test.ts

const assert = require('assert');
const fs = require('fs');

const {commands, workspace, window, Position, Selection} = require('vscode');
const {cleanUp} = require('./utils');
const {join} = require('path');

const proxyquire = require('proxyquire');
var extensionStubs = {};
const myExtension = proxyquire('../src/extension',{
	'copy-paste': {
		copy: link => extensionStubs.copy(link),
	},
	open: link => extensionStubs.open(link)
});

const absPath = (file) => join(workspace.rootPath, file);

function openEditor(file, lineNumber) {
	return workspace.openTextDocument(absPath(file)).then(doc => {
		return window.showTextDocument(doc).then((editor) => {
			const line = new Position(lineNumber - 1,0);
			editor.selection = new Selection(line, line);			
		});
	});	
}

function expectedLink(expected, cb) {
	return (actual) => {
		assert.equal(actual, expected);
		cb();	
	}
}

const providers = [
	{
		folder: 'github',
		lineUrl: (file, line) => `https://github.com/user/repo-name/blob/test-master/${file}#L${line}`,
		fileUrl: (file) => `https://github.com/user/repo-name/blob/test-master/${file}`,
		repoUrl: () => `https://github.com/user/repo-name/tree/test-master`
	},
	{
		folder: 'bitbucket',
		lineUrl: (file, line) => `https://bitbucket.org/user/repo-name/src/test-master/${file}#cl-${line}`,
		fileUrl: (file) => `https://bitbucket.org/user/repo-name/src/test-master/${file}`,
		repoUrl: () => `https://bitbucket.org/user/repo-name/src/test-master`
	},
	{
		folder: 'visualstudio',
		lineUrl: (file, line) => `https://user.visualstudio.com/_git/repo-name#path=/${file}&version=GBtest-master&line=${line}`,
		fileUrl: (file) => `https://user.visualstudio.com/_git/repo-name#path=/${file}&version=GBtest-master`,
		repoUrl: () => `https://user.visualstudio.com/_git/repo-name#&version=GBtest-master`
	}
];

providers.forEach(function(provider) {
	const file = `${provider.folder}/file1.txt`;

	suite(`Extension Tests - ${provider.folder}`, function() {

		suiteSetup(function(done){
			fs.unlink(absPath('.git'), (err) => done());		
		});

		suiteSetup(function(done){
			fs.link(absPath(`./${provider.folder}/.gitted`), absPath('.git'), done);		
		});

		setup(function(){
			extensionStubs = {
				copy: (link) => { console.warn('default copy function called'); },
				open: (link) => { console.warn('default open function called'); }
			}
		});

		teardown(cleanUp);

		suiteTeardown(function (done) {
			fs.unlink(absPath('.git'), done);				
		})

		test('Run copyGitHubLinkToClipboard command on open file', (done) => {
			const line = 3;
			openEditor(`./${file}`, line).then(() => {
				extensionStubs.copy = expectedLink(provider.lineUrl(file, line), done);
				extensionStubs.open = () => done(new Error('Open must not be called'));

				commands.executeCommand('extension.copyGitHubLinkToClipboard');
			});
		});	

		test('Run copyGitHubLinkToClipboard command on empty editor', (done) => {
			extensionStubs.copy = expectedLink(provider.repoUrl(), done);
			extensionStubs.open = () => done(new Error('Open must not be called'));

			commands.executeCommand('extension.copyGitHubLinkToClipboard');
		});	

		test('Run copyGitHubLinkToClipboard command on menu context', (done) => {
			extensionStubs.copy = expectedLink(provider.fileUrl(file), done);
			extensionStubs.open = () => done(new Error('Open must not be called'));

			commands.executeCommand('extension.copyGitHubLinkToClipboard', {
				fsPath: absPath(file)
			});
		});			

		test('Run openInGitHub command on open file', (done) => {
			const line = 2;
			openEditor(`./${file}`, line).then(() => {
				extensionStubs.open = expectedLink(provider.lineUrl(file, line), done);
				extensionStubs.copy = () => done(new Error('Copy must not be called'));

				commands.executeCommand('extension.openInGitHub');
			});
		});

		test('Run openInGitHub command on empty editor', (done) => {
			extensionStubs.open = expectedLink(provider.repoUrl(), done);
			extensionStubs.open = function(link) {
				assert.equal(link, provider.repoUrl());
				done();
			}
			extensionStubs.copy = () => done(new Error('Copy must not be called'));

			commands.executeCommand('extension.openInGitHub');
		});

		test('Run openInGitHub command on menu context', (done) => {
			extensionStubs.open = expectedLink(provider.fileUrl(file), done);
			extensionStubs.copy = () => done(new Error('Copy must not be called'));

			commands.executeCommand('extension.openInGitHub', {
				fsPath: absPath(file)
			});
		});
	});		
});