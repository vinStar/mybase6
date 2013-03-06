
//sValidation=nyfjs
//sCaption=Save as text template ...
//sHint=Save the selected text as template file
//sCategory=MainMenu.Edit
//sLocaleID=Menu.Plugin.SaveTextTemplate
//sAppVerMin=6.0
//sShortcutKey=

var sDelimiter='----------------------------------------';

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

var _validate_filename=function(s){
	s=s||'';
	s=s.replace(/[\*\?\.\(\)\[\]\{\}\<\>\\\/\!\$\^\&\+\|,;:\"\'`~@#]/g, ' ');
	s=s.replace(/\s{2,}/g, ' ');
	s=_trim(s);
	if(s.length>64) s=s.substr(0, 64);
	s=_trim(s);
	s=s.replace(/\s/g, '_');
	return s;
};

var _unique_filename=function(sDir, sName, sExt){
	var sRes=sName+sExt, xFn=new CLocalFile(sDir), c=1; xFn.append(sRes);
	while(xFn.exists()){
		sRes=sName+'_'+(c++)+sExt;
		xFn=new CLocalFile(sDir); xFn.append(sRes);
	}
	return sRes;
};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sTxt=plugin.getSelectedText(false), sDir0=plugin.getPathToTemplates(), sFn0='';
		if(sTxt){
			var v=sTxt.split('\n');
			for(var i in v){
				var s=v[i];
				if(s){
					s=_validate_filename(s);
					if(s){
						sFn0=_unique_filename(sDir0, s, '.rtf');
						if(sFn0) break;
					}
				}
			}

			if(sFn0){

				var sFn=platform.getSaveFileName(
					{ sTitle: 'Save text template'
					, sFilter: 'Rich text files (*.rtf)|*.rtf|Plain text files (*.txt)|*.txt'
					, sDefExt: '.rtf'
					, sInitDir: sDir0
					, sFilename: sFn0
					, bOverwritePrompt: true
					});

				if(sFn){
					var sExt=new CLocalFile(sFn).getExtension().toLowerCase();
					var nBytes=plugin.rtfStreamOut(sFn, (sExt=='.rtf') ? 0x02 : 0x01, true);
				}

			}
		}else{
			alert('No text is currently selected.');
		}

	}else{
		alert('No database is currently opened.');
	}

}catch(e){
	alert(e);
}
