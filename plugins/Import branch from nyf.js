
//sValidation=nyfjs
//sCaption=Import data from .nyf file ...
//sHint=Import info items from a .nyf file in a specified branch
//sCategory=MainMenu.Capture
//sLocaleID=p.ImportNyf
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{

	var xNyf=new CNyfDb(-1)

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			var sDbSrc=platform.getOpenFileName(
				{ sTitle: ''
				, sFilter: 'myBase .nyf files (*.nyf)|*.nyf|All files (*.*)|*.*'
				, bMultiSelect: false
				, bHideReadonly: true
				});

			if(sDbSrc){

				var sPathSrc='', sDefRoot=plugin.getDefRootContainer();

				var sMsg=_lc2('SelSrc', 'Select a source branch to import.');
				var xDbSrc=new CNyfDb(sDbSrc, true);
				if(xDbSrc.isOpen()){
					sPathSrc=xDbSrc.browseOutline(sMsg, sDefRoot);
					xDbSrc.close();
				}

				if(sPathSrc){
					var bSucc=plugin.importNyfFile(-1, sDbSrc, sPathSrc);
					if(bSucc){
						//2010.6.23 the branch has already been reloaded;
						//var sCurItem=plugin.getCurInfoItem(-1); if(!sCurItem) sCurItem=plugin.getDefRootContainer();
						//plugin.refreshOutline(-1, sCurItem);
						alert(_lc2('Done', 'Successfully imported data from within the .nyf file.')+'\n\n'+sDbSrc);
					}else{
						sMsg=_lc2('Fail.ImportNyf', 'Failed to import data from within the .nyf file.');
						alert(sMsg+'\n\n'+sDbSrc);
					}
				}

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
