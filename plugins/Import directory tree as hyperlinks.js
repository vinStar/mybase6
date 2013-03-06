
//sValidation=nyfjs
//sCaption=Import directory tree as hyperlinks ...
//sHint=Import directory tree with files saved as hyperlinks (e.g. CD-ROM indexes)
//sCategory=MainMenu.Capture
//sLocaleID=Menu.Plugin.ImportDirTreeAsHyperlinks
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};

var xNyf=new CNyfDb(-1);

if(xNyf.isOpen()){

	if(!xNyf.isReadonly()){

		var sDirToImport=platform.browseForFolder('Please select a folder location to import.', '');

		if(sDirToImport){

			plugin.initProgressRange('Import directory tree as attachments');

			var sCurItem=plugin.getCurInfoItem(-1), nFolders=0, nFiles=0;

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

			var _encode=function(sFn){
				var p=(''+sFn).indexOf(':'), sDrv='', sPath=''+sFn;
				if(p>=0){
					sDrv=sFn.substring(0, p+1);
					sPath=sFn.substring(p+1);
				}
				var sUrl=sDrv, v=sPath.split('\\');
				for(var i in v){
					var sTmp=v[i];
					if(sUrl) sUrl+='/';
					sUrl+=encodeURIComponent(sTmp);
				}
				return sUrl;
			};

			var vFails=[];

			var _import_files=function(xSsgPath, xWinPath){
				var xSsgFn=new CLocalFile(xSsgPath); xSsgFn.append(plugin.getDefNoteFn());

				var v=xWinPath.listFiles(), sTxt='';
				for(var i in v){
					var xWinFn=new CLocalFile(xWinPath); xWinFn.append(v[i]);
					plugin.ctrlProgressBar(xWinFn);
					if(sTxt) sTxt+='\n\n\n';
					sTxt+=(v[i]+'\n'+'file://'+_encode(''+xWinFn)+'\nSize: '+xWinFn.getFileSize()+'   Updated: '+xWinFn.getModifyTime());
				}

				//var xTmpFn=new CLocalFile(platform.getTempFile()); xTmpFn.saveUtf8(sTxt);
				//var nBytes=xNyf.createFile(xSsgFn, xTmpFn);
				//xTmpFn.delete();

				var nBytes=xNyf.createTextFile(xSsgFn, sTxt);
				return nBytes>=0;
			};

			var _import_folder=function(sSsgPath, sWinPath){
				plugin.ctrlProgressBar(sWinPath);
				var xWinPath=new CLocalFile(sWinPath);
				var xSubItem=new CLocalFile(sSsgPath); xSubItem.append(_find_unique_id(sSsgPath));
				if(xNyf.createFolder(xSubItem)){
					xNyf.setFolderHint(xSubItem, xWinPath.getLeafName());
					_import_files(xSubItem, xWinPath);
					var v=xWinPath.listFolders();
					for(var i in v){
						var xSubDir=new CLocalFile(xWinPath); xSubDir.append(v[i]);
						_import_folder(xSubItem, xSubDir);
					}
					nFolders++;
				}
			};

			_import_folder(sCurItem, sDirToImport);

			if(nFolders>0){
				plugin.refreshOutline(-1, sCurItem);
			}

			if(vFails.length>0){
				alert('Failed to import the following files.\n\n'+vFails);
			}else{
				alert('Successfully imported the folder and files as hyperlinks.\n\n'+sDirToImport);
			}

		}

	}else{
		alert('Cannot modify the database which is open as Readonly.');
	}

}else{
	alert('No database is currently opened.');
}
