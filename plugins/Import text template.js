
//sValidation=nyfjs
//sCaption=Import text from template ...
//sHint=Insert text from a specified template file
//sCategory=MainMenu.Capture
//sLocaleID=p.ImportTextTemplate
//sAppVerMin=6.0
//sShortcutKey=Ctrl+Alt+T

try{
	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			var sCfgKey='TextTemplate.sDir';

			var sDir0=plugin.getPathToTemplates();
			var sFn=platform.getOpenFileName(
				{ sTitle: ''
				, sFilter: 'Text files (*.rtf;*.txt)|*.rtf;*.txt|All files (*.*)|*.*'
				, sInitDir: localStorage.getItem(sCfgKey) || sDir0
				, bMultiSelect: false
				, bHideReadonly: true
				});

			if(sFn){
				var xFn=new CLocalFile(sFn), sExt=xFn.getExtension().toLowerCase(), sDir=xFn.getDirectory(false);
				localStorage.setItem(sCfgKey, sDir);
				plugin.rtfStreamIn(sFn, (sExt=='.rtf') ? 0x02 : 0x01, true);
			}

		}else{
			alert(_lc('Prompt.Warn.ReadonlyDb', 'Cannot modify the database opened as Readonly.'));
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}
}catch(e){
	alert(e);
}
