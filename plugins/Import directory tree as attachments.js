
//sValidation=nyfjs
//sCaption=Import directory tree as attachments ...
//sHint=Import directory tree with files saved as attachments
//sCategory=MainMenu.Capture
//sLocaleID=Menu.Plugin.ImportDirTreeAsAttachments
//sAppVerMin=6.0
//sShortcutKey=


//10:41 AM 12/23/2010 defines a filename which are saved as default text notes of each info items. (*customizable*)
var sRenameDefNote='defnote.rtf';

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

			var vFails=[], sDefNoteFn=plugin.getDefNoteFn().toLowerCase();

			var _import_files=function(xSsgPath, xWinPath){
				var v=xWinPath.listFiles();
				for(var i in v){
					var sName=v[i];
					var xWinFn=new CLocalFile(xWinPath); xWinFn.append(sName);
					var xSsgFn=new CLocalFile(xSsgPath); xSsgFn.append((sRenameDefNote==sName.toLowerCase()) ? sDefNoteFn : sName);
					plugin.ctrlProgressBar(xWinFn);
					var nBytes=xNyf.createFile(xSsgFn, xWinFn);
					if(nBytes<0) vFails[vFails.length]=sName; else nFiles++;
				}
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
				var sMsg='Total %nFolders% folders and %nFiles% files successfully imported.\n\n%sDirToImport%'
					.replace('%nFolders%', nFolders)
					.replace('%nFiles%', nFiles)
					.replace('%sDirToImport%', sDirToImport);
				alert(sMsg);
			}
		}

	}else{
		alert('Cannot modify the database which is open as Readonly.');
	}

}else{
	alert('No database is currently opened.');
}
