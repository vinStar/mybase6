
//sValidation=nyfjs
//sCaption=Import MSIE bookmarks ...
//sHint=Import MSIE bookmarks as hyperlinks in RTF notes
//sCategory=MainMenu.Capture
//sLocaleID=p.ImportIeBkmk
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{

	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			plugin.initProgressRange(plugin.getScriptTitle());

			var _find_unique_id=function(sSsgPath){
				return xNyf.getChildEntry(sSsgPath, 0);
			};

			var nDone=0, sDefNoteFn=plugin.getDefNoteFn();

			var _import_bkmk=function(sPathBkmk, sPathSsg){
				var sRes='', cUrl=0;
				var xPathBkmk=new CLocalFile(sPathBkmk);
				var sCategory=xPathBkmk.getTitle();
				var vFiles=xPathBkmk.listFiles(), vFolders=xPathBkmk.listFolders();
				for(var j in vFiles){
					var xFn=new CLocalFile(sPathBkmk); xFn.append(vFiles[j]);
					var sSiteTitle=xFn.getTitle();
					var sExt=xFn.getExtension().toLowerCase();

					var bContinue=plugin.ctrlProgressBar(sSiteTitle||'Untitled', 1, false);
					if(!bContinue) break;

					if(sExt=='.url'){
						var s=xFn.loadText(), vLines=(s||'').split('\r\n');
						for(var i in vLines){
							var sLine=vLines[i], sKey='URL=', p=sLine.indexOf(sKey);
							if(p==0){
								nDone++; cUrl++;
								sUrl=sLine.substr(p+sKey.length);
								if(sRes) sRes+='\r\n\r\n';
								sRes+=''+cUrl+') '+sSiteTitle;
								sRes+='\r\n';
								sRes+=sUrl;
							}
						}
					}
				}

				if(sRes){
					var xSsgFn=new CLocalFile(sPathSsg); xSsgFn.append(sDefNoteFn);
					if(xNyf.createTextFile(xSsgFn, sRes)<0){
						//on error ...
					}
				}

				for(var j in vFolders){
					var xBkmkSub=new CLocalFile(sPathBkmk); xBkmkSub.append(vFolders[j]);
					var sCategory=xBkmkSub.getTitle();
					var xSsgSub=new CLocalFile(sPathSsg); xSsgSub.append(_find_unique_id(sPathSsg));
					if(xNyf.createFolder(xSsgSub)){
						xNyf.setFolderHint(xSsgSub, sCategory);
						_import_bkmk(xBkmkSub, xSsgSub);
					}
				}
			};

			var sCurItem=plugin.getCurInfoItem(-1);
			if(!sCurItem) sCurItem=plugin.getDefRootContainer();

			var sPathBkmk=platform.getSpecialFolder('FAVORITES');
			sPathBkmk=platform.browseForFolder('Select the location of the [Favorites] folder.', sPathBkmk);
			if(sPathBkmk){
				var xSsgSub=new CLocalFile(sCurItem); xSsgSub.append(_find_unique_id(sCurItem));
				if(xNyf.createFolder(xSsgSub)){
					xNyf.setFolderHint(xSsgSub, 'MSIE Favorites');
					_import_bkmk(sPathBkmk, xSsgSub);
				}

				if(nDone>0){
					plugin.refreshOutline(-1, sCurItem);
					var sMsg=_lc2('Done', 'Total %nCount% bookmark(s) successfully imported.');
					sMsg=sMsg.replace(/%nCount%/gi, ''+nDone);
					alert(sMsg);
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
