
//sValidation=nyfjs
//sCaption=Import Outlook items ...
//sHint=Import selected items from within Microsoft Outlook
//sCategory=MainMenu.Capture
//sLocaleID=Menu.Plugin.ImportOutlook
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};

try{
	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			var sCurItem=plugin.getCurInfoItem();
			if(sCurItem){

				if(confirm('Starting to import Microsoft Outlook items. Please launch Outlook and be sure to select items thereby before importing. Ready?')){

					var _find_unique_id=function(sSsgPath){
						return xNyf.getChildEntry(sSsgPath, 0);
					};

					plugin.initProgressRange('Import Outlook ...');

					var xMsol=new CAppOutlook();
					if(xMsol){

						var bQuit=false;

						try{
							var ns=xMsol.getNameSpace('MAPI');
							ns.logon();

							var xExp;
							try{
								xExp=xMsol.getActiveExplorer();
							}catch(e){
								bQuit=true;
							}

							if(xExp){

								var xSel;
								try{
									xSel=xExp.getSelection();
								}catch(e){
								}

								if(xSel){

									var nSel=xSel.getCount(), nDone=0;

									if(nSel>0){

										plugin.initProgressRange('Import Outlook', nSel);

										for(var j=0; j<nSel; ++j){
											var xItem=xSel.getItem(j+1);
											if(xItem){
												var sSubject=xItem.getSubject();

												plugin.ctrlProgressBar(sSubject || '***', 1);

												var sTmpFn=new CLocalFile(platform.getTempFile('', '', '.tmp')); platform.deferDeleteFile(sTmpFn);

												var bHtml=false, iSaveAs=1; //olRTF:1
												if(xItem.getClass()==43){ //olMail:43
													iSaveAs=5; //olHTML:5
													bHtml=true;
												}

												try{
													xItem.saveAs(sTmpFn, iSaveAs);
												}catch(e){
													xItem.saveAs(sTmpFn, 0); //olTXT:0
													bHtml=false;
												}

												var xChild=new CLocalFile(sCurItem); xChild.append(_find_unique_id(sCurItem));
												if(xNyf.createFolder(xChild)){
													xNyf.setFolderHint(xChild, sSubject);
													var xSsgFn=new CLocalFile(xChild);

													if(bHtml){
														xSsgFn.append('_olitem.html');
													}else{
														xSsgFn.append(plugin.getDefNoteFn());
													}

													var nBytes=xNyf.createFile(xSsgFn, sTmpFn);

													sTmpFn.delete();

													if(nBytes>=0){

														nDone++;

														//import attachments if any;
														var xFiles;
														try{
															xFiles=xItem.getAttachments();
														}catch(e){
														}

														if(xFiles){
															var nFiles=xFiles.getCount();
															for(var i=0; i<nFiles; ++i){
																var xFile=xFiles.getItem(i+1), sFn=xFile ? xFile.getFileName() : '';
																if(xFile && sFn){
																	xFile.saveAsFile(sTmpFn);
																	xSsgFn=new CLocalFile(xChild); xSsgFn.append(sFn);
																	nBytes=xNyf.createFile(xSsgFn, sTmpFn);
																}
															}
														}
														
													}else{
														if(j<nSel-1 && !confirm('Failed to import the document. Continue with next?'+'\n\n'+xDocFn)){
															break;
														}
													}
												}

											}
										}

										if(nDone>0){
											plugin.refreshOutline(-1, sCurItem);
										}

										alert('Total '+nDone+' item(s) successfully imported.');

									}else{
										alert('No items currently selected within Microsoft Outlook.');
									}
								}else{
									alert('The selection is currently not available.');
								}
							}else{
								alert('Please be sure to launch Microsoft Outlook and select some items before importing.');
							}

							ns.logoff();

						}catch(e){
							alert(e);
						}
					}

					if(bQuit) xMsol.quit();
				}

			}else{
				alert('No info item is currently selected.');
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
