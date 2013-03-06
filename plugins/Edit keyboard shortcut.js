
//sValidation=nyfjs
//sCaption=Edit keyboard shortcut INI file
//sHint=Edit the keyboard shortcut INI file with Notepad
//sCategory=MainMenu.Plugins
//sLocaleID=Menu.Plugin.EditShortcut
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};

if(confirm('Loading/editing the keyboard shortcut INI file, Proceed?\n\nNote that any changes to the INI file will not take effect unless re-launching.')){
	var xFn=new CLocalFile(plugin.getShortcutFile());
	xFn.launch();
}
