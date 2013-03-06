
//sValidation=nyfjs
//sCaption=Export MSWord outline ...
//sHint=Export text notes to MSWord within the outline view
//sCategory=MainMenu.Share
//sLocaleID=p.ExportMSWordOutline
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var vActs=[
			  'AllInBranch|'		+_lc2('AllInBranch', '1. Export outline items & text notes in current branch')
			, 'AllInDatabase|'		+_lc2('AllInDatabase', '2. Export outline items & text notes in whole database')
			, 'ItemsInBranch|'		+_lc2('ItemsInBranch', '3. Export outline items in current branch (w/o text body)')
			, 'ItemsInDatabase|'	+_lc2('ItemsInDatabase', '4. Export outline items in whole database (w/o text body)')
		];

		var sCfgKey='ExportMSWordOutline.iAction';
		var sMsg=_lc('p.Common.SelAction', 'Please select an action form within the dropdown list');
		var iSel=dropdown(sMsg, vActs, localStorage.getItem(sCfgKey));
		if(iSel>=0){

			localStorage.setItem(sCfgKey, iSel);

			var bCurBranch=vActs[iSel].indexOf('InBranch')>=0;
			var bInclRTF=vActs[iSel].indexOf('AllIn')>=0;

			var sDstFn=platform.getSaveFileName(
				{ sTitle: ''
				, sFilter: 'MSWord documents (*.doc;*.docx)|*.doc;*.docx|All files (*.*)|*.*'
				, sDefExt: '.doc'
				, bOverwritePrompt: true
				});

			if(sDstFn){
				var xMsw=new CAppWord();
				if(xMsw){

					//2011.8.7 Set it visible, in case users press ESC and select No to continue without losing connection with MSWord;
					xMsw.setVisible(true);

					var xDoc=xMsw.getDocuments().add('');
					if(xDoc){

						var sCurItem=plugin.getCurInfoItem(-1), sDefRtfNoteFn=plugin.getDefNoteFn();

						if(!sCurItem || !bCurBranch){
							sCurItem=plugin.getDefRootContainer();
							bCurBranch=false;
						}

						var nFolders=0, iLastLvl=0, xRng=xDoc.getRange(0, 0);

						xNyf.traverseOutline(sCurItem, true, function(){
							nFolders++;
						});

						plugin.initProgressRange(plugin.getScriptTitle(), nFolders);

						var bAbort=false;
						xNyf.traverseOutline(sCurItem, bCurBranch, function(sSsgPath, iLevel){
							var iBakLvl=iLevel;
							if(xNyf.folderExists(sSsgPath, false)){

								var sTitle=xNyf.getFolderHint(sSsgPath); if(!sTitle) sTitle='Untitled info item';

								var bContinue=plugin.ctrlProgressBar(sTitle, 1, true);
								if(!bContinue) return (bAbort=true);

								//xRng.setStart(xRng.getStoryLength());

								//xRng.setStart(xRng.getEnd());
								//xRng.setText('\n');

								xRng.setStart(xRng.getEnd());
								xRng.setText(sTitle+'\n');

								if(iLevel == iLastLvl){
									xRng.getParagraphs().outlinePromote();
								}else if(iLevel < iLastLvl){
									while(iLevel++ <= iLastLvl) xRng.getParagraphs().outlinePromote();
								}else if(iLevel > iLastLvl){
									xRng.getParagraphs().outlineDemote();
								}

								xRng.setStart(xRng.getEnd());
								if(bInclRTF){
									var xSsgFn=new CLocalFile(sSsgPath); xSsgFn.append(sDefRtfNoteFn);
									var xTmpFn=new CLocalFile(platform.getTempFile('', '', '.rtf')); platform.deferDeleteFile(xTmpFn);
									if(xNyf.exportFile(xSsgFn, xTmpFn)>0){
										xRng.insertFile(xTmpFn);
									}
									xTmpFn.delete();
								}

								xRng.setStart(xRng.getStoryLength());
								xRng.setText('\n');

								iLastLvl=iBakLvl;
							}
						});

						if(!bAbort){
							xDoc.getActiveWindow().getActivePane().getView().setType(2);
							xDoc.saveAs(sDstFn);
						}
					}

					xMsw.quit();

					if(!bAbort){
						sMsg=_lc2('Done', 'The MSWord outline generated successfully. Open it now?');
						if(confirm(sMsg+'\n\n'+sDstFn)){
							new CLocalFile(sDstFn).launch();
						}else{
						}
					}
				}else{
					alert(_lc('p.Common.Fail.LoadMSWord', 'Failed to invoke Microsoft Word.'));
				}
			}
		}
	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
