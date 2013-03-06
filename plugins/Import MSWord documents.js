
//sValidation=nyfjs
//sCaption=Import MSWord documents ...
//sHint=Import MSWord documents as RTF notes by OLE-Automation
//sCategory=MainMenu.Capture
//sLocaleID=p.ImportMSWordDocs
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{

	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			var xMsw=new CAppWord();
			if(xMsw){

				xMsw.setVisible(false);
				var xDocs=xMsw.getDocuments();

				var vFiles=platform.getOpenFileName(
					{ sTitle: ''
					, sFilter: 'MSWord documents (*.doc;*.docx)|*.doc;*.docx|All files (*.*)|*.*'
					, bMultiSelect: true
					, bHideReadonly: true
					});

				var sCurItem=plugin.getCurInfoItem(-1), nDone=0;
				if(!sCurItem) sCurItem=plugin.getDefRootContainer();

				plugin.initProgressRange(plugin.getScriptTitle());

				var _find_unique_id=function(sSsgPath){
					return xNyf.getChildEntry(sSsgPath, 0);
				};

				var _fix_bad_controlwords=function(s)
				{
					//2011.8.19 alter the obsolete word '\chcbpat#' to '\highlight#';
					return (s||'').replace(/(\\chcbpat)(\d+)/g, '\\highlight$2');
				}

				var _import_docs=function(){
					for(var i in vFiles){
						var xDocFn=new CLocalFile(vFiles[i]);

						var bContinue=plugin.ctrlProgressBar(xDocFn.getLeafName(), 1, true);
						if(!bContinue) break;

						var xTmpFn=new CLocalFile(platform.getTempFile('', '', '.rtf')); platform.deferDeleteFile(xTmpFn);

						var xDoc=xDocs.open(xDocFn);
						xDoc.saveAs(xTmpFn, 6); //wdFormatRTF: 6;
						xDoc.close();

						var xChild=new CLocalFile(sCurItem); xChild.append(_find_unique_id(sCurItem));
						if(xNyf.createFolder(xChild)){
							xNyf.setFolderHint(xChild, xDocFn.getTitle());
							var xSsgFn=new CLocalFile(xChild); xSsgFn.append(plugin.getDefNoteFn());

							{
								//2011.9.13 fix bad control words in RTF text;
								var sRtf=xTmpFn.loadText();
								var sNew=_fix_bad_controlwords(sRtf);
								if(sRtf!=sNew){
									xTmpFn.saveAnsi(sNew);
								}
							}

							var nBytes=xNyf.createFile(xSsgFn, xTmpFn);

							xTmpFn.delete();

							if(nBytes>=0){
								nDone++;
							}else{
								var sMsg=_lc2('Fail.GoAnyway', 'Failed to import the document. Continue with next?');
								if(i<vFiles.length-1 && !confirm(sMsg+'\n\n'+xDocFn)){
									break;
								}
							}
						}
					}
				};

				if(vFiles && vFiles.length>0){
					try{
						_import_docs();
					}catch(e){
						alert(e);
					}
				}

				xMsw.quit();

				if(nDone>0){
					plugin.refreshOutline(-1, sCurItem);
				}

			}else{
				alert(_lc('p.Common.Fail.LoadMSWord', 'Failed to invoke Microsoft Word.'));
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
