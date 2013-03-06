
//sValidation=nyfjs
//sCaption=Make lowercase
//sHint=Make the currently selected text lowercase
//sCategory=MainMenu.Edit
//sLocaleID=p.MakeLowerCase
//sAppVerMin=6.0
//sShortcutKey=Ctrl+Alt+L

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _conv=function(s){return (s||'').toLowerCase()};

var sTxt=plugin.getSelectedText(false);
if(sTxt){
	plugin.replaceSelectedText(_conv(sTxt), false);
}else{
	alert(_lc('Prompt.Warn.NoTextSelected', 'No text is currently selected.'));
}
