![vscode-open-in-github](images/icon_200.png?raw=true "Open in GitHub / Bitbucket / visualstudio.com")  
**Supports :** GitHub, Bitbucket, Visualstudio.com

> Extension for Visual Studio Code which can be used to jump to a source code line in Github / Bitbucket

## Install

**Tested with VsCode 0.10.1**  

Press <kbd>F1</kbd> and narrow down the list commands by typing `extension`. Pick `Extensions: Install Extension`.

![](screenshots/install.png?raw=true)

Simply pick the `Open in GitHub / Bitbucket` extension from the list

##Install Manual

**Mac & Linux**
```sh
cd $HOME/.vscode/extensions
git clone https://github.com/ziyasal/vscode-open-in-github.git
cd vscode-open-in-github
npm install
```

**Windows**
```
cd %USERPROFILE%\.vscode\extensions
git clone https://github.com/ziyasal/vscode-open-in-github.git
cd vscode-open-in-github
npm install
```

## Usage

**Command**  

Press <kbd>F1</kbd> and type `Open in GitHub`.

![](screenshots/open-in-github.png?raw=true)

Press <kbd>F1</kbd> and type `Copy GitHub link to clipboard`.

![](screenshots/copy.png?raw=true)

**Keybord Shortcut**  

 Press <kbd>Ctrl+L G</kbd> to activate.
 Press <kbd>Ctrl+L C</kbd> to copy active line link to clipboard.
 
**Context menu**  

Right click on explorer item and choose `Open in GitHub` or `Copy GitHub link to clipboard`.

![](screenshots/context-menu.png?raw=true)

**Configure custom github domain**  
 
 Add following line into workspace settings; 
 ```json
{
	"openInGitHub.gitHubDomain":"your custom github domain here"
}
```  
Have fun..

## License

MIT © [Ziya SARIKAYA @ziyasal](https://github.com/ziyasal)
