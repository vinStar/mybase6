
//sValidation=nyfjs
//sCaption=Insert text template ...
//sHint=Insert text from a template file
//sCategory=MainMenu.Edit_Insert
//sLocaleID=Menu.Plugin.InsertTextTemplate
//sAppVerMin=6.0
//sShortcutKey=Ctrl+Shift+T

var xNyf=new CNyfDb(-1);

if(xNyf.isOpen()){

	if(!xNyf.isReadonly()){

		var sDir0=plugin.getPathToTemplates();
		var sFn=platform.getOpenFileName(
			{ sTitle: 'Insert text template'
			, sFilter: 'Text files (*.rtf;*.txt)|*.rtf;*.txt'
			, sInitDir: sDir0
			, bMultiSelect: false
			, bHideReadonly: true
			});

		if(sFn){
			var sExt=new CLocalFile(sFn).getExtension().toLowerCase();
			plugin.rtfStreamIn(sFn, (sExt=='.rtf') ? 0x02 : 0x01, true);
		}

	}else{
		alert('Cannot modify the database which is open as Readonly.');
	}

}else{
	alert('No database is currently opened.');
}
