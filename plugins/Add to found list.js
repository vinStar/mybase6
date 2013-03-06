
//sValidation=nyfjs
//sCaption=Add to found list
//sHint=Add info item to found list whereby you can multi-select to drag-drop/move/delete/etc.
//sCategory=MainMenu.Organize
//sLocaleID=p.AddToFoundList
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

try{
	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(plugin.getCurNavigationTab()=='Outline'){

			var sCurItem=plugin.getCurInfoItem();
			if(sCurItem){

				if(!plugin.getQueryResults(false)){
					plugin.runQuery({bListOut: true});
				}

				plugin.mdiTileVertically();

				plugin.appendToResults(xNyf.getDbFile()+'\t'+sCurItem);

			}else{
				alert(_lc('Prompt.Warn.NoInfoItemSelected', 'No info item is currently selected.'));
			}

		}else{
			alert(_lc('Prompt.Warn.OutlineNotSelected', 'The outline tree view is currently not selected.'));
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}
}catch(e){
	alert(e);
}
