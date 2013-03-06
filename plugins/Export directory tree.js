
//sValidation=nyfjs
//sCaption=Export directory tree ...
//sHint=Export the current branch as directory tree
//sCategory=MainMenu.Share
//sLocaleID=p.ExportDirTree
//sAppVerMin=6.0
//sShortcutKey=

//4:43 PM 12/21/2010 this utility exports the current branch as a directory tree on disk.
//	Notes:
//	0. Each info item creates a sub directory, in which the attachments are exported and saved.
//	1. Default RTF text of each info items are saved in the specific file named with 'defnote.rtf';
//	2. Shortcuts are ignored while exporting attachments.


//10:41 AM 12/23/2010 defines a filename to save default text notes of each info items. (*customizable*)
var sRenameDefNote='defnote.rtf';

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sCfgKey='ExportDirTree.sDestDir';
		var sDstDir=platform.browseForFolder(_lc2('SelDest', 'Select a destination folder to store files'), localStorage.getItem(sCfgKey));

		if(sDstDir){

			localStorage.setItem(sCfgKey, sDstDir);

			var sCurItem=plugin.getCurInfoItem(-1);

			var sItemTitle=xNyf.getFolderHint(sCurItem); if(!sItemTitle) sItemTitle='== Untitled ==';

			var nFolders=0;

			//To estimate the progress range;
			//xNyf.traverseOutline(sCurItem, true, function(){
			//	nFolders++;
			//});

			plugin.initProgressRange(plugin.getScriptTitle(), nFolders);

			var _validate_dir=function(s){
				s=s||'';
				s=s.replace(/[\*\?\.\(\)\[\]\{\}\<\>\\\/\!\$\^\&\+\|,;:\"\'`~@]/g, ' ');
				s=s.replace(/\s{2,}/g, ' ');
				s=_trim(s);
				if(s.length>64) s=s.substr(0, 64);
				s=_trim(s);
				s=s.replace(/\s/g, '_');
				return s;
			};

			var _unique_name=function(sDir, sName){
				var sRes=sName, xFn=new CLocalFile(sDir); xFn.append(sRes);
				while(xFn.exists()){
					sRes=sName+'-'+Math.round(Math.random()*1000);
					xFn=new CLocalFile(sDir); xFn.append(sRes);
				}
				return sRes;
			};

			var xCurDir=[sDstDir], vFails=[], sDefNoteFn=plugin.getDefNoteFn(), nFolders=0, nFiles=0;
			var _act_on_treeitem=function(sSsgPath, iLevel){
				var sDir=(iLevel>=0 && iLevel<xCurDir.length) ? xCurDir[iLevel] : '';
				if(xNyf.folderExists(sSsgPath, false)){

					var sTitle=xNyf.getFolderHint(sSsgPath); if(!sTitle) sTitle='Untitled';

					var bContinue=plugin.ctrlProgressBar(sTitle, 1, true);
					if(!bContinue) return true;

					var sSub=_validate_dir(sTitle);
					sSub=_unique_name(sDir, sSub);

					var xDir=new CLocalFile(sDir); xDir.append(sSub);
					if(xDir.exists() || xDir.createDirectory()){
						nFolders++;
						xCurDir[iLevel+1]=xDir.toString();
						var vFiles=xNyf.listFiles(sSsgPath);
						for(var i in vFiles){
							var sFn=vFiles[i];
							var xSrc=new CLocalFile(sSsgPath); xSrc.append(sFn);
							if(!xNyf.isShortcut(xSrc)){
								var sFn2=(sFn==sDefNoteFn) ? sRenameDefNote : sFn;
								var sFn2=_unique_name(xDir, sFn2);
								var xDst=new CLocalFile(xDir); xDst.append(sFn2);
								if(xNyf.exportFile(xSrc, xDst)<0){
									vFails[vFails.length]=sFn;
								}else{
									nFiles++;
								}
							}
						}
					}
				}
			};

			xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

			if(vFails.length>0){
				alert(_lc2('Fail.Export', 'Failed to export the following files.')+'\n\n'+vFails);
			}else{
				//var sMsg=_lc2('Done', 'Total %nFolders% folders and %nFiles% files are successfully exported to the folder.');
				//sMsg=sMsg.replace(/%nFolders%/gi, ''+nFolders);
				//sMsg=sMsg.replace(/%nFiles%/gi, ''+nFiles);
				var sMsg=_lc2('Done', 'The current branch successfully exported as the directory tree.');
				alert(sMsg+'\n\n'+sDstDir);
			}
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
