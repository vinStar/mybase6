
//sValidation=nyfjs
//sCaption=Export files to a folder ...
//sHint=Export all text files and attachments under the current branch to a directory
//sCategory=MainMenu.Share
//sLocaleID=p.ExportFilesToDir
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

//4:43 PM 7/5/2010 this utility traverses the current branch
//and exports all attached files to a specified disk folder.

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sDstDir=platform.browseForFolder(_lc2('SelDest', 'Select a destination folder to store the files'));

		if(sDstDir){

			var sCurItem=plugin.getCurInfoItem(-1);

			var sItemTitle=xNyf.getFolderHint(sCurItem); if(!sItemTitle) sItemTitle='== Untitled ==';

			var nFolders=0;

			//To estimate the progress range;
			//xNyf.traverseOutline(sCurItem, true, function(){
			//	nFolders++;
			//});

			plugin.initProgressRange(plugin.getScriptTitle(), nFolders);

			var vFails=[], sDefFn=plugin.getDefNoteFn();

			var _validate_filename=function(sFn){
				sFn=sFn.replace(/[\*\?\.\(\)\[\]\{\}\<\>\\\/\!\$\^\&\+\|,;:\"\'`~@]/g, ' ');
				sFn=sFn.replace(/\s{2,}/g, ' ');
				sFn=sFn.replace(/\s/g, '_');
				if(sFn.length>128) sFn=sFn.substr(0, 128);
				sFn=_trim(sFn); if(sFn) sFn+='.rtf';
				return sFn;
			};

			var _act_on_treeitem=function(sSsgPath, iLevel){

				if(xNyf.folderExists(sSsgPath, false)){

					var sTitle=xNyf.getFolderHint(sSsgPath); if(!sTitle) sTitle='Untitled';

					var bContinue=plugin.ctrlProgressBar(sTitle, 1, true);
					if(!bContinue) return true;

					var vFiles=xNyf.listFiles(sSsgPath);
					for(var i in vFiles){
						var sFn=vFiles[i];
						var xSrc=new CLocalFile(sSsgPath); xSrc.append(sFn);
						var xDst=new CLocalFile(sDstDir);
						if(sFn==sDefFn) sFn=_validate_filename(sTitle);
						if(sFn){
							xDst.append(sFn);
							var bOW=true;
							if(xDst.exists()){
								bOW=confirm(_lc2('Overwrite', 'The file already exists. Overwrite?')+'\n\n'+xDst);
							}
							if(bOW){
								if(xNyf.exportFile(xSrc, xDst)<0){
									vFails[vFails.length]=sFn;
								}
							}
						}
					}
				}
			};

			xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

			if(vFails.length>0){
				alert(_lc2('Fail.Export', 'Failed to export the following files;')+'\n\n'+vFails);
			}
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
