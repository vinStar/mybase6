
//sValidation=nyfjs
//sCaption=Make uppercase
//sHint=Make the currently selected text uppercase
//sCategory=MainMenu.Edit
//sLocaleID=p.MakeUpperCase
//sAppVerMin=6.0
//sShortcutKey=Ctrl+Alt+U

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _conv=function(s){return (s||'').toUpperCase()};

var sTxt=plugin.getSelectedText(false);
if(sTxt){
	plugin.replaceSelectedText(_conv(sTxt), false);
}else{
	alert(_lc('Prompt.Warn.NoTextSelected', 'No text is currently selected.'));
}
