
//sValidation=nyfjs
//sCaption=Word count ...
//sHint=Word count for text notes
//sCategory=MainMenu.Plugins
//sLocaleID=p.WordCount
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var xRes={nWestern: 0, nEastern: 0, nParagraphs: 0};

		var _wc=function(sTxt){

			var nWest=0, nEast=0, nPara=0;

			var s=sTxt.toUpperCase(), sTrackWord='', sTrackPara='';

			for(var i=0; i<s.length; ++i){

				var c=s.charCodeAt(i), A=0x41, Z=0x5a, D0=0x30, D9=0x39, CR=0x0d, LF=0x0a;

				if( (c>=A && c<=Z) || (c>=D0 && c<=D9) || (c>=0x7f && c<=0xff) ){
					sTrackWord=c;
					sTrackPara=c;
				}else if(c>0xff){
					sTrackPara=c;
					nEast++;
					if(sTrackWord){
						nWest++;
						sTrackWord='';
					}
				}else{
					if(c==LF){
						if(sTrackPara){
							nPara++;
							sTrackPara='';
						}
					}
					if(sTrackWord){
						nWest++;
						sTrackWord='';
					}
				}
			}

			xRes.nWestern+=nWest;
			xRes.nEastern+=nEast;
			xRes.nParagraphs+=nPara;
		};

		var _wc_on_infoitem=function(sSsgPath){

			var xSsgFn=new CLocalFile(sSsgPath); xSsgFn.append(plugin.getDefNoteFn());
			var sRtf=xNyf.loadText(xSsgFn);
			if(sRtf){
				var sTxt=platform.extractTextFromRtf(sRtf, true);
				_wc(sTxt, xRes);
			}
		};

		var vActs=[
			  _lc2('ForItem', '1. Count words for text of the current info item')
			, _lc2('ForBranch', '2. Count words for text of the current branch')
			, _lc2('ForDatabase', '3. Count words for text of the whole database')
			];

		sCfgKey='WordCount.iAction';
		var sMsg=_lc('p.Common.SelAction', 'Please select an action form within the dropdown list');
		var iSel=dropdown(sMsg, vActs, localStorage.getItem(sCfgKey));
		if(iSel>=0){

			localStorage.setItem(sCfgKey, iSel);

			var bBranch=(iSel==1);
			var sCurItem=(iSel==0 || iSel==1) ? plugin.getCurInfoItem(-1) : plugin.getDefRootContainer();

			if(iSel==0){
				_wc_on_infoitem(sCurItem);
			}else{
				plugin.initProgressRange(plugin.getScriptTitle());
				xNyf.traverseOutline(sCurItem, bBranch, function(sSsgPath, iLevel){
					var sHint=xNyf.getFolderHint(sSsgPath); if(!sHint) sHint='New item ...';
					plugin.ctrlProgressBar(sHint);
					_wc_on_infoitem(sSsgPath);
				});
			}

			var sMsg=_lc2('Done', 'Count of western words: %nWestern%\n\nCount of eastern words: %nEastern%\n\nCount of paragraphs: %nParagraphs%');
			sMsg=sMsg.replace(/\\n/gi, '\n');
			sMsg=sMsg.replace(/%nWestern%/gi, xRes.nWestern);
			sMsg=sMsg.replace(/%nEastern%/gi, xRes.nEastern);
			sMsg=sMsg.replace(/%nParagraphs%/gi, xRes.nParagraphs);

			alert(sMsg);
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
