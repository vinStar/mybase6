
//sValidation=nyfjs
//sCaption=Import Word documents ...
//sHint=Import Word documents by utilizing MS-Word
//sCategory=MainMenu.Capture
//sLocaleID=Menu.Plugin.ImportWordDocs
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};

try{

	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			var xMsw=new CAppWord();
			if(xMsw){

				xMsw.setVisible(false);
				var xDocs=xMsw.getDocuments();

				var vFiles=platform.getOpenFileName(
					{ sTitle: 'Import Word documents'
					, sFilter: 'Word documents (*.doc;*.docx)|*.doc;*.docx|All files (*.*)|*.*'
					, bMultiSelect: true
					, bHideReadonly: true
					});

				var sCurItem=plugin.getCurInfoItem(-1), nDone=0;
				if(!sCurItem) sCurItem=plugin.getDefRootContainer();

				plugin.initProgressRange('Import files as items');

				var _find_unique_id=function(sSsgPath){
					return xNyf.getChildEntry(sSsgPath, 0);
				};

				var _import_docs=function(){
					for(var i in vFiles){
						var xDocFn=new CLocalFile(vFiles[i]);
						plugin.ctrlProgressBar(xDocFn.getLeafName());

						var sTmpFn=new CLocalFile(platform.getTempFile('', '', '.rtf')); platform.deferDeleteFile(sTmpFn);

						var xDoc=xDocs.open(xDocFn);
						xDoc.saveAs(sTmpFn, 6); //wdFormatRTF: 6;
						xDoc.close();

						var xChild=new CLocalFile(sCurItem); xChild.append(_find_unique_id(sCurItem));
						if(xNyf.createFolder(xChild)){
							xNyf.setFolderHint(xChild, xDocFn.getTitle());
							var xSsgFn=new CLocalFile(xChild); xSsgFn.append(plugin.getDefNoteFn());

							var nBytes=xNyf.createFile(xSsgFn, sTmpFn);

							sTmpFn.delete();

							if(nBytes>=0){
								nDone++;
							}else{
								if(i<vFiles.length-1 && !confirm('Failed to import the document. Continue with next?'+'\n\n'+xDocFn)){
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
				alert('Failed to invoke Micorsoft Word.');
			}

		}else{
			alert('Cannot modify the database which is open as Readonly.');
		}

	}else{
		alert('No database is currently opened.');
	}

}catch(e){
	alert(e);
}
