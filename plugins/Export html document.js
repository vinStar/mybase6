
//sValidation=nyfjs
//sCaption=Export html document ...
//sHint=Export text notes within current branch and save as a html document
//sCategory=MainMenu.Share
//sLocaleID=p.ExportHtmlDoc
//sAppVerMin=6.0
//sShortcutKey=

//6:10 PM 6/4/2010 this utility traverses the current branch
//and exports text notes into a webpage (html document).

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

var _validate_filename=function(s){
	s=s||'';
	s=s.replace(/[\*\?\.\(\)\[\]\{\}\<\>\\\/\!\$\^\&\+\|,;:\"\'`~@]/g, ' ');
	s=s.replace(/\s{2,}/g, ' ');
	s=_trim(s);
	if(s.length>64) s=s.substr(0, 64);
	s=_trim(s);
	s=s.replace(/\s/g, '_');
	return s;
};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sCurItem=plugin.getCurInfoItem(-1);
		var sItemTitle=xNyf.getFolderHint(sCurItem);

		var sHtmlFile=platform.getSaveFileName(
			{ sTitle: ''
			, sFilter: 'HTML documents (*.html;*.htm)|*.html;*.htm|All files (*.*)|*.*'
			, sDefExt: '.html'
			, bOverwritePrompt: true
			, sFilename: _validate_filename(sItemTitle)||''
			});

		if(sHtmlFile){

			var nFolders=0;

			//To estimate the progress range;
			//xNyf.traverseOutline(sCurItem, true, function(){
			//	nFolders++;
			//});

			plugin.initProgressRange(plugin.getScriptTitle(), nFolders);

			var vItems=[];

			var _act_on_treeitem=function(sSsgPath, iLevel){

				if(xNyf.folderExists(sSsgPath, false)){
					var xSsgFn=new CLocalFile(sSsgPath); xSsgFn.append(plugin.getDefNoteFn());

					var sTitle=xNyf.getFolderHint(sSsgPath); if(!sTitle) sTitle='== Untitled ==';

					var bContinue=plugin.ctrlProgressBar(sTitle, 1, true);
					if(!bContinue) return true;

					var tModi=xNyf.getModifyTime(xSsgFn);
					var sRtf=xNyf.loadText(xSsgFn);
					//var sNote=platform.extractTextFromRtf(sRtf);

					var xObj={sTitle: sTitle
						//, sNote: sNote
						, sRtf: sRtf
						, tModi: tModi
					};

					vItems[vItems.length]=xObj;
				}
			};

			xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

			//2010.6.4 load HTML/CSS template from the .html file;
			var sTmplFile=new CLocalFile(plugin.getScriptFile());
			sTmplFile.changeExtension('.html');
			var sHtml=sTmplFile.loadText();

			var sDocTitle=xNyf.getDbTitle()+' / '+(sItemTitle||'Untitled');
			sHtml=sHtml.replace('%HTML_TITLE%', sDocTitle);

			var sContent='', sDstDir=new CLocalFile(sHtmlFile).getDirectory();
			for(var j in vItems){
				var xObj=vItems[j];
				sContent+='<dt>'+xObj.sTitle+'</dt>\r\n';

				var bContinue=plugin.ctrlProgressBar(xObj.sTitle, 1, true);
				if(!bContinue) break;

				if(xObj.sRtf){
					var s=platform.convertRtfToHtml(xObj.sRtf, {bInner: true, bPicture: true, sImgDir: sDstDir, sTitle: '', sStyle: '', sJsFiles: ''});
					sContent+='<dd>'+s+'</dd>\r\n';
				}else{
						sContent+='<dd>......</dd>\r\n';
				}
				sContent+='\r\n';
			}

			sHtml=sHtml.replace('%HTML_CONTENT%', sContent);

			var f=new CLocalFile(sHtmlFile);
			f.saveUtf8(sHtml);

			var sMsg=_lc2('Done', 'Successfully generated the HTML document. View it now?');
			if(confirm(sMsg+'\n\n'+sHtmlFile)){
				f.launch('open');
			}
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
