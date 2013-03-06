
//sValidation=nyfjs
//sCaption=Export branch to .nyf file ...
//sHint=Export info items in the branch to another .nyf file
//sCategory=MainMenu.Share
//sLocaleID=p.ExportNyf
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{

	if(plugin.getCurDbIndex()>=0){

		var sDbDst=platform.getSaveFileName(
			{ sTitle: ''
			, sFilter: 'myBase .nyf files (*.nyf)|*.nyf|All files (*.*)|*.*'
			, sDefExt: '.nyf'
			, bOverwritePrompt: false
			});

		if(sDbDst){

			var sPathDst='', sDefRoot=plugin.getDefRootContainer();

			var f=new CLocalFile(sDbDst);
			if(f.exists()){
				var sMsg=_lc2('SelDest', 'Select a destination location to accept data.');
				var xDbDst=new CNyfDb(sDbDst, false);
				if(xDbDst.isOpen()){
					sPathDst=xDbDst.browseOutline(sMsg, sDefRoot);
					xDbDst.close();
				}
			}else{
				if(f.createFile()){
					sPathDst=sDefRoot;
				}else{
					alert(_lc2('Fail.CreateFile', 'Failed to create the .nyf file.')+'\n\n'+sDbDst);
				}
			}

			if(sPathDst){
				var bSucc=plugin.exportNyfFile(-1, sDbDst, sPathDst);
				if(bSucc){
					alert(_lc2('Done', 'Successfully exported data to the .nyf file.')+'\n\n'+sDbDst);
				}else{
					alert(_lc2('Fail.ExportNyf', 'Failed to export data to the .nyf file.')+'\n\n'+sDbDst);
				}
			}

		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}
}catch(e){
	alert(e);
}
