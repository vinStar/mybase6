
//sValidation=nyfjs
//sCaption=Import MSOutlook items ...
//sHint=Import selected items from within Microsoft Outlook
//sCategory=MainMenu.Capture
//sLocaleID=p.ImportOutlookItems
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{
	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			var sCurItem=plugin.getCurInfoItem()||plugin.getDefRootContainer();
			if(sCurItem){

				var sMsg=_lc2('Starting', 'Starting to import Microsoft Outlook items. Please launch Outlook and be sure to select items thereby before importing. Ready?');
				if(confirm(sMsg)){

					var _find_unique_id=function(sSsgPath){
						return xNyf.getChildEntry(sSsgPath, 0);
					};

					plugin.initProgressRange(plugin.getScriptTitle());

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

										plugin.initProgressRange(plugin.getScriptTitle(), nSel);

										for(var j=0; j<nSel; ++j){
											var xItem=xSel.getItem(j+1);
											if(xItem){
												var sSubject=xItem.getSubject();

												var bContinue=plugin.ctrlProgressBar(sSubject || '***', 1, true);
												if(!bContinue) break;

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
														if(j<nSel-1 && !confirm(_lc2('Fail.GoAnyway', 'Failed to import the item. Continue with next?')+'\n\n'+sSubject)){
															break;
														}
													}
												}

											}
										}

										if(nDone>0){
											plugin.refreshOutline(-1, sCurItem);
										}

										sMsg=_lc2('Done', 'Total %nCount% item(s) successfully inserted.');
										sMsg=sMsg.replace(/%nCount%/gi, ''+nDone);
										alert(sMsg);

									}else{
										alert('No items currently selected within Microsoft Outlook.');
									}
								}else{
									alert('The selection is currently not available.');
								}
							}else{
								alert(_lc2('Launch', 'Please be sure to launch Microsoft Outlook and select some items before importing.'));
							}

							ns.logoff();

						}catch(e){
							alert(e);
						}
					}else{
						alert(_lc('p.Common.Fail.LoadMSOutlook', 'Failed to invoke Microsoft Outlook.'));
					}

					if(bQuit) xMsol.quit();
				}

			}else{
				alert(_lc('Prompt.Warn.NoInfoItemSelected', 'No info item is currently selected.'));
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
