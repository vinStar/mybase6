
//sValidation=nyfjs
//sCaption=Eliminate spaces ...
//sHint=Eliminate unwanted spaces from within the selected text
//sCategory=MainMenu.Edit
//sLocaleID=p.RemoveSpaces
//sAppVerMin=6.0
//sShortcutKey=Ctrl+Shift+E

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_l=function(s){return (s||'').replace(/^\s+/g, '');};
var _trim_r=function(s){return (s||'').replace(/\s+$/g, '');};
var _trim_extra=function(s){return (s||'').replace(/\s{2,}/g, ' ');};
var _trim_all=function(s){return (s||'').replace(/\s/g, '');};
var _trim_crlf=function(s){return (s||'').replace(/[\r\n]/g, '');};

try{

	var sTxt=plugin.getSelectedText(false);
	if(sTxt){

		var vActs=[
			  'LeadingSpaces|'		+_lc2('LeadingSpaces', '1. Remove leading spaces (Blank spaces & Tabs)')
			, 'TrailingSpaces|'		+_lc2('TrailingSpaces', '2. Remove trailing spaces (Blank spaces & Tabs)')
			, 'ExtraSpaces|'		+_lc2('ExtraSpaces', '3. Remove extra spaces (Blank spaces & Tabs)')
			, 'AllSpaces|'			+_lc2('AllSpaces', '4. Remove ALL spaces (Blank spaces & Tabs)')
			, 'AllReturns|'			+_lc2('AllReturns', '5. Remove all Returns (CR/LF)')
			, 'ExtraReturns|'		+_lc2('ExtraReturns', '6. Remove extra Returns (CR/LF)')
		];

		var sCfgKey='RemoveSpaces.iAction';
		var sMsg=_lc('p.Common.SelAction', 'Please select an action form within the dropdown list');
		var iSel=dropdown(sMsg, vActs, localStorage.getItem(sCfgKey));
		if(iSel>=0){

			localStorage.setItem(sCfgKey, iSel);

			switch(iSel){
				case 0:
					//LeadingSpaces
					var v=sTxt.split('\n'), r='';
					for(var i in v){
						if(r) r+='\n';
						r+=_trim_l(v[i]);
					}
					sTxt=r;
					break;
				case 1:
					//TrailingSpaces
					var v=sTxt.split('\n'), r='';
					for(var i in v){
						if(r) r+='\n';
						r+=_trim_r(v[i]);
					}
					sTxt=r;
					break;
				case 2:
					//ExtraSpaces
					var v=sTxt.split('\n'), r='';
					for(var i in v){
						if(r) r+='\n';
						r+=_trim_extra(v[i]);
					}
					sTxt=r;
					break;
				case 3:
					//AllSpaces
					var v=sTxt.split('\n'), r='';
					for(var i in v){
						if(r) r+='\n';
						r+=_trim_all(v[i]);
					}
					sTxt=r;
					break;
				case 4:
					//AllReturns
					var v=sTxt.split('\n'), r='';
					for(var i in v){
						r+=_trim_crlf(v[i]);
					}
					sTxt=r;
					break;
				case 5:
					//ExtraReturns
					var r=sTxt;
					r=r.replace(/\r\n/g, '\n');
					r=r.replace(/\n{2,}/g, '\n');
					sTxt=r;
					break;
			}

			plugin.replaceSelectedText(sTxt, false);
		}
	}else{
		alert(_lc('Prompt.Warn.NoTextSelected', 'No text is currently selected.'));
	}
}catch(e){
	alert(e);
}
