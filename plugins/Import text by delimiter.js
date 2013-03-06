
//sValidation=nyfjs
//sCaption=Import text by delimiter ...
//sHint=Import text by a delimiter and save as child items
//sCategory=MainMenu.Capture
//sLocaleID=p.ImportTextByDelimiter
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

try{
	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			var sSrcFn=platform.getOpenFileName(
				{ sTitle: ''
				, sFilter: 'Text files (*.txt)|*.txt|All files (*.*)|*.*'
				, bMultiSelect: false
				, bHideReadonly: true
				});

			if(sSrcFn){

				plugin.initProgressRange(plugin.getScriptTitle());

				var sCurItem=plugin.getCurInfoItem(-1), nDone=0;

				if(!sCurItem) sCurItem=plugin.getDefRootContainer();

				var _find_unique_id=function(sSsgPath){
					/*var nID=xNyf.getFolderCount(sSsgPath, 0x00);
					do{
						var xPath=new CLocalFile(sSsgPath); xPath.append(nID);
						if(!xNyf.folderExists(xPath)) break;
						nID++;
					}while(nID<0xffff);
					return nID;*/
					return xNyf.getChildEntry(sSsgPath, 0);
				};

				var _save_item=function(sTitle, sNotes){

					plugin.ctrlProgressBar(sTitle);

					var xSubItem=new CLocalFile(sCurItem); xSubItem.append(_find_unique_id(sCurItem));

					xNyf.createFolder(xSubItem);
					xNyf.setFolderHint(xSubItem, sTitle);

					var xSsgFn=new CLocalFile(xSubItem); xSsgFn.append(plugin.getDefNoteFn());

					//var xTmpFn=new CLocalFile(platform.getTempFile()); xTmpFn.saveUtf8(sNotes);
					//var nBytes=xNyf.createFile(xSsgFn, xTmpFn);
					//xTmpFn.delete();

					var nBytes=xNyf.createTextFile(xSsgFn, sNotes);

					if(nBytes>=0) nDone++;

					return nBytes;
				};

				var sCfgKey='ImportTextByDelimiter.sDelimiter';
				var sMsg=_lc2('Delimiter', 'Enter a delimiter to split the text notes');
				var sDelimiter=prompt(sMsg, localStorage.getItem(sCfgKey)||'----------');

				if(sDelimiter){

					localStorage.setItem(sCfgKey, sDelimiter);

					var bCRLF=(sDelimiter=='\\r' || sDelimiter=='\\n' || sDelimiter=='\\r\\n');

					var xSrcFn=new CLocalFile(sSrcFn), sTxt=xSrcFn.loadText();
					var v=sTxt.split('\n'), sNotes='', sTitle='', nMax=260;
					for(var i in v){
						var sLine=v[i];
						if(bCRLF){
							sLine=_trim(sLine);
							if(sLine){
								sTitle=sLine; if(sTitle.length>nMax) sTitle.length=nMax;
								_save_item(sTitle, sLine);
							}
						}else{
							if(sLine.indexOf(sDelimiter)==0){
								if(sNotes) _save_item(sTitle, sNotes);
								sNotes=''; sTitle='';
							}else{
								if(sNotes) sNotes+='\n'; sNotes+=sLine;
								if(!sTitle) sTitle=_trim(sLine);
								if(sTitle.length>nMax) sTitle.length=nMax;
							}
						}
					}

					if(sNotes) _save_item(sTitle, sNotes);

					if(nDone>0){
						plugin.refreshOutline(-1, sCurItem);
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
