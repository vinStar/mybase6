
//sValidation=nyfjs
//sCaption=Reveal internal data file ...
//sHint=Reveal internal data files stored in the SSG root container
//sCategory=
//sLocaleID=
//sAppVerMin=6.0
//sShortcutKey=

var xNyf=new CNyfDb(-1);

if(xNyf.isOpen()){

	var sName=prompt('Enter an internal file name to view its text content.', '');
	if(sName){
		var xFn=new CLocalFile(plugin.getDefRootContainer()); xFn.append(sName); //e.g. '__custom_labels.txt'
		alert(xNyf.loadText(xFn));
	}

}else{
	alert('No database is currently opened.');
}
