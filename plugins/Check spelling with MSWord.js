
//sValidation=nyfjs
//sCaption=Check spelling with MSWord ...
//sHint=Check spelling for selected text by using Microsoft Word
//sCategory=MainMenu.Edit
//sLocaleID=p.ChkSpellByMSWord
//sAppVerMin=6.0
//sShortcutKey=Ctrl+F11

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};

try{

	if(plugin.isRichEditVisible() && plugin.isEditMode()){
		var sSel=plugin.getSelectedText(0)||'';
		var bSel=sSel.length>0?true:false;
		var xTmpFn=new CLocalFile(platform.getTempFile('', '', '.rtf')); platform.deferDeleteFile(xTmpFn);
		if(plugin.rtfStreamOut(xTmpFn, 0, bSel)>0){
			var xMsw=new CAppWord();
			if(xMsw){
				var bModified=false;
				try{
					xMsw.setVisible(true);
					xMsw.resetIgnoreAll();
					var xDocs=xMsw.getDocuments();
					var xDoc=xDocs.open(xTmpFn);
					if(xDoc){
						xDoc.setSaved(true);
						xDoc.checkSpelling();
						if(!xDoc.getSaved()){
							xDoc.save();
							bModified=true;
						}
						xDoc.close();
					}
				}catch(e){
					alert(e);
				}

				xMsw.quit();

				if(bModified) plugin.rtfStreamIn(xTmpFn, 0, bSel); //else alert('Unchanged.');

			}else{
				alert(_lc('p.Common.Fail.LoadMSWord', 'Failed to invoke Microsoft Word.'));
			}
		}else{
			alert(_lc2('NoText', 'No text is available to check spelling.'));
		}

		xTmpFn.delete();

	}else{
		alert(_lc2('NotRichEdit', 'Make sure to first have text content open within the RTF editor.'));
	}

}catch(e){
	alert(e);
}
