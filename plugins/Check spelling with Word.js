
//sValidation=nyfjs
//sCaption=Check spelling with MS-Word ...
//sHint=Check spelling for selected text by utilizing Microsoft Word
//sCategory=MainMenu.Edit
//sLocaleID=Menu.Plugin.CheckSpelling
//sAppVerMin=6.0
//sShortcutKey=Ctrl+F11

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};

try{

	if(plugin.isRichEditVisible() && plugin.isEditMode()){
		var bSelected=plugin.getSelectedText(0)?true:false;
		var xTmpFn=new CLocalFile(platform.getTempFile('', '', '.rtf')); platform.deferDeleteFile(xTmpFn);
		if(plugin.rtfStreamOut(xTmpFn, 0, bSelected)>0){
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

				if(bModified) plugin.rtfStreamIn(xTmpFn, 0, bSelected); //else alert('Unchanged.');

			}
		}else{
			alert('No text is available to check spelling.');
		}

		xTmpFn.delete();

	}else{
		alert('Make sure to first have text content open within RTF editor.');
	}

}catch(e){
	alert(e);
}

/*
var xNyf=new CNyfDb(-1);
if(xNyf.isOpen()){

	if(!xNyf.isReadonly()){

		var sCurItem=plugin.getCurInfoItem();
		if(sCurItem){
			var xSsgFn=new CLocalFile(sCurItem); xSsgFn.append(plugin.getDefNoteFn());
			var xTmpFn=new CLocalFile(platform.getTempFile('', '', '.rtf')); platform.deferDeleteFile(xTmpFn);

			if(xNyf.exportFile(xSsgFn, xTmpFn)>0){
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
								bModified=true;
								xDoc.save();
							}
							xDoc.close();
						}
					}catch(e){
						alert(e);
					}

					xMsw.quit();

					//nyf6 maintains a copy of text content for viewing within TEMP buffer;
					//and this would prevent from updating the modified content;
					//if(xNyf.updateFile(xSsgFn, xTmpFn)>=0){
					//	plugin.refreshDocViews(-1, sCurItem);
					//}

					//let the RTF text stream in to the editor instead;
					//var t0=xNyf.getModifyTime(xSsgFn);
					//var t1=xTmpFn.getModifyTime();
					if(bModified) plugin.rtfStreamIn(xTmpFn, 0, false); //else alert('Unchanged.');

					xTmpFn.delete();
				}
			}
		}else{
			alert('No info item is currently selected.');
		}

	}else{
		alert('Cannot modify the database which is open as Readonly.');
	}

}else{
	alert('No database is currently opened.');
}
*/