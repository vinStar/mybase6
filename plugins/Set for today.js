
//sValidation=nyfjs
//sCaption=Set for today
//sHint=Link the info item with current calendar date
//sCategory=MainMenu.Organize
//sLocaleID=p.SetForToday
//sAppVerMin=6.0
//sShortcutKey=Ctrl+Alt+F8

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

try{
	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			if(plugin.getCurNavigationTab()=='Outline'){

				var sCurItem=plugin.getCurInfoItem();
				if(sCurItem){

					plugin.calendarLink({iDbPos: -1, sSsgPath: sCurItem, tStart: new Date()});
					plugin.refreshOutline(-1, sCurItem, true); //true: to update display only, without reloading child items;

				}else{
					alert(_lc('Prompt.Warn.NoInfoItemSelected', 'No info item is currently selected.'));
				}

			}else{
				alert(_lc('Prompt.Warn.OutlineNotSelected', 'The outline tree view is currently not selected.'));
			}

		}else{
			alert(_lc('Prompt.Warn.ReadonlyDb', 'Cannot modify the database opened as Readonly.'));
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}
}catch(e){
	alert(e);
}
