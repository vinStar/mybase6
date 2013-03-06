
//sValidation=nyfjs
//sCaption=Export data records to Excel ...
//sHint=Extract data records from within text notes and save results with Excel
//sCategory=MainMenu.Share
//sLocaleID=Menu.Plugin.ExportDataRecords
//sAppVerMin=6.0
//sShortcutKey=

//21:54 2/5/2009 this utility traverses the current branch ( including sub branches )
//and attempts to extract data records from text notes in the form below,
//
//	Last Name           =
//	First Name          =
//	Company             =
//	Street              =
//	ZIP                 =
//	City                =
//	FullCity            =
//	Country             =
//	State / Province    =
//	Phone               =
//	Fax                 = 
//	E-Mail              =
//
//The resulting data records will be transferred to and saved as Microsoft Excel Spreadsheet.
//You have the convenience of customizing your own record field names by the '_vFieldNames' array below;

var _vFieldNames='Last Name|First Name|Company|Street|ZIP|City|FullCity|Country|State|Phone|Fax|E-Mail'.split('|');

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

/*Array.prototype._indexOf=function(xPred)
{
	if(typeof(xPred)=='function'){
		for(var i=0; i < this.length; ++i){
			if(xPred(i, this[i])) return i;
		}
	}else{
		for(var i=0; i < this.length; ++i){
			if(this[i]==xPred) return i;
		}
	}
	return -1;
};*/

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sMsg='Extracting data records by the field names and saving results with Micrsoft Excel, proceed now?\n';
		for(var i in _vFieldNames){
			if(sMsg) sMsg+='\n';
			sMsg+=_vFieldNames[i];
		}
		sMsg+='\n\nNote: To customize the field names, edit the script file.\n'+plugin.getScriptFile();

		if(confirm(sMsg)){

			var xls=new CAppExcel();

			var wbs=xls.getWorkbooks(), wb=wbs.add(), wss=wb.getWorksheets(), ws=wss.getItem(1), rng=ws.getCells();;

			ws.setName("Resulting Records");

			var sCurItem=plugin.getCurInfoItem(-1), iRow=1;

			for(var i=0; i<_vFieldNames.length; ++i){
				var sName=_vFieldNames[i];
				rng.setItem(iRow, i+1, sName);
			};

			iRow++;

			var nFolders=0;
			//xNyf.traverseOutline(sCurItem, true, function(){
			//	nFolders++;
			//});

			plugin.initProgressRange('Traversing...', nFolders);

			var _pos_of_key=function(sKey0){
				//2010.7.8 The 'i' in the first 'for-statement', it doesn't work with '+1';
				//for(var i in _vFieldNames){
				for(var i=0; i<_vFieldNames.length; ++i){
					var sKey=_vFieldNames[i].toUpperCase();
					if(sKey==(sKey0||'').toUpperCase()){
						return i;
					}
				}
				return -1;
			};

			var _act_on_treeitem=function(sSsgPath, iLevel){

				if(xNyf.folderExists(sSsgPath, false)){

					var sTitle=xNyf.getFolderHint(sSsgPath); if(!sTitle) sTitle='New info item ...';
					plugin.ctrlProgressBar(sTitle, 1);

					var xSsgFn=new CLocalFile(sSsgPath); xSsgFn.append(plugin.getDefNoteFn());
					var sRtf=xNyf.loadText(xSsgFn);
					var sTxt=platform.extractTextFromRtf(sRtf);
					var bFound=false;
					var vLines=(sTxt||'').split('\n');
					for(var i in vLines){
						var sLine=vLines[i];
						var p=sLine.indexOf('=');
						if(p>0){
							var sKey=_trim(sLine.substring(0, p)), sVal=_trim(sLine.substring(p+1));
							p=_pos_of_key(sKey);
							if(p>=0 && sVal){
								rng.setItem(iRow, p+1, sVal);
								bFound=true;
							}
						}
					}
					if(bFound) iRow++;
				}
			};

			var sFn=platform.getSaveFileName(
				{ sTitle: 'Export data records'
				, sFilter: 'MS-Excel Spreadsheet (*.xls)|*.xls|All files(*.*)|*.*'
				, sDefExt: '.xls'
				, bOverwritePrompt: true
				});

			if(sFn){

				xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

				var f=new CLocalFile(sFn);
				if(f.exists()) f.delete();

				wb.saveAs(f);

				_gc(); //let js perform garbage collection;

				if(confirm('Total '+(iRow-2)+' data record(s) extracted and saved in: '+f+'.\n\nDo you want to view the spreadsheet?')){
					xls.setVisible(true); //f.launch('open', '', '', false);
				}else{
					xls.quit();
				}
			}else{
				xls.quit();
			}
		}

	}else{
		alert('No database is currently opened.');
	}

}catch(e){
	alert(e);
}
