
//sValidation=nyfjs
//sCaption=Export text with delimiter ...
//sHint=Export text notes in the branch to a file with text delimited
//sCategory=MainMenu.Share
//sLocaleID=p.ExportTextByDelimiter
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sCfgKey='ExportTextByDelimiter.sDelimiter';
		var sMsg=_lc2('Delimiter', 'Enter a delimiter to split the text notes');
		var sDelimiter=prompt(sMsg, localStorage.getItem(sCfgKey)||'----------------------------------------');
		if(sDelimiter){

			localStorage.setItem(sCfgKey, sDelimiter);

			var sDstFn=platform.getSaveFileName(
				{ sTitle: ''
				, sFilter: 'Text files (*.txt)|*.txt|All files (*.*)|*.*'
				, sDefExt: '.rtf'
				, bOverwritePrompt: true
				});

			if(sDstFn){

				var sCurItem=plugin.getCurInfoItem(-1)||plugin.getDefRootContainer();

				var sRes='', sDefNoteFn=plugin.getDefNoteFn(), nDone=0;
				var _act_on_treeitem=function(sSsgPath, iLevel){

					var sTitle=xNyf.getFolderHint(sSsgPath); if(!sTitle) sTitle='== Untitled ==';

					var xSsgFn=new CLocalFile(sSsgPath); xSsgFn.append(sDefNoteFn);

					var s=xNyf.loadText(xSsgFn);
					s=platform.extractTextFromRtf(s);
					s=_trim(s);
					{
						//eliminates extra blank lines;
						s=s.replace(/\r\n/g, '\n');
						s=s.replace(/\r/g, '\n');
						s=s.replace(/\n{3,}/g, '\n\n');
						s=s.replace(/\n/g, '\r\n');
					}
					if(s){
						if(sRes){
							sRes+='\r\n\r\n\r\n'+sDelimiter+'\r\n\r\n\r\n';
						}
						sRes+='('+(nDone+1)+') ';
						sRes+=sTitle;
						sRes+='\r\n\r\n';
						sRes+=s;
						nDone++;
					}

				};

				xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

				var nBytes=-1;
				if(sRes){
					nBytes=new CLocalFile(sDstFn).saveUtf8(sRes);
				}
				if(nBytes<=0){
					alert('Failed to export text notes to file.\n\n'+sDstFn);
				}else{
					sMsg=_lc2('Done', 'Total %nCount% text notes successfully exported to the file. View it now?');
					sMsg=sMsg.replace('%nCount%', nDone)+'\n\n'+sDstFn;
					if(confirm(sMsg)){
						new CLocalFile(sDstFn).launch('open');
					}
				}
			}
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
