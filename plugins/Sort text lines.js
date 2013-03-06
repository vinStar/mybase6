
//sValidation=nyfjs
//sCaption=Sort text lines ...
//sHint=Sort the selected text lines by alphabet
//sCategory=MainMenu.Edit
//sLocaleID=p.SortTextLines
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim_crlf=function(s){return (s||'').replace(/[\r\n]/g, '');};

var _compare=function(x, y){
	if(x>y) return 1;
	else if(x<y) return -1;
	else return 0;
};

try{
	var sTxt=plugin.getSelectedText(false);
	if(sTxt){

		var vActs=[
			  'Asc/Case|'+_lc2('Asc', '1. Ascending')
			, 'Asc/NoCase|'+_lc2('AscIC', '2. Ascending, ignore case')
			, 'Desc/Case|'+_lc2('Desc', '3. Descending')
			, 'Desc/NoCase|'+_lc2('DescIC', '4. Descending, ignore case')
		];

		var sCfgKey='SortTextLines.iAction';
		var sMsg=_lc('p.Common.SelAction', 'Please select an action form within the dropdown list');
		var iSel=dropdown(sMsg, vActs, localStorage.getItem(sCfgKey));
		if(iSel>=0){

			localStorage.setItem(sCfgKey, iSel);

			var bAsc=vActs[iSel].indexOf('Asc/')>=0;
			var bCase=vActs[iSel].indexOf('/Case')>=0;

			var v=sTxt.split('\n');
			v.sort(function(x,y){
				var j=bCase ? _compare(x, y) : _compare(x.toLowerCase(), y.toLowerCase());
				return (j==0) ? 0 : (bAsc ? j : -j);
			});

			var r='';
			for(var i in v){
				if(r) r+='\n';
				r+=v[i]; //_trim_crlf(v[i]);
			}

			plugin.replaceSelectedText(r, false);
		}
	}else{
		alert(_lc('Prompt.Warn.NoTextSelected', 'No text is currently selected.'));
	}
}catch(e){
	alert(e);
}

