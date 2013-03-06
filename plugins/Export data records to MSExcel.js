
//sValidation=nyfjs
//sCaption=Export data records to MSExcel ...
//sHint=Extract data records from within text notes and save with MSExcel
//sCategory=MainMenu.Share
//sLocaleID=p.ExportToMSExcel
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

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sCfgKey='ExportToMSExcel.sFieldNames';
		var sMsg=_lc2('Fields', 'Enter filed names for extracting data records;');
		var sFieldNames=prompt(sMsg, localStorage.getItem(sCfgKey)||'Last Name|First Name|Company|Street|ZIP|City|FullCity|Country|State|Phone|Fax|E-Mail');
		if(sFieldNames){

			localStorage.setItem(sCfgKey, sFieldNames);

			vFieldNames=sFieldNames.split('|');
			if(vFieldNames.length>0){

				sMsg=_lc2('Confirm', 'Extracting data records by the following field names; Proceed now?');
				sMsg+='\n';
				for(var i in vFieldNames){
					if(sMsg) sMsg+='\n';
					sMsg+=vFieldNames[i]+' =';
				}

				if(confirm(sMsg)){

					var xls=new CAppExcel();

					var wbs=xls.getWorkbooks(), wb=wbs.add(), wss=wb.getWorksheets(), ws=wss.getItem(1), rng=ws.getCells();;

					ws.setName("Resulting Records");

					var sCurItem=plugin.getCurInfoItem(-1), iRow=1;

					for(var i=0; i<vFieldNames.length; ++i){
						var sName=vFieldNames[i];
						rng.setItem(iRow, i+1, sName);
					};

					iRow++;

					var nFolders=0;
					xNyf.traverseOutline(sCurItem, true, function(){
						nFolders++;
					});

					plugin.initProgressRange(plugin.getScriptTitle(), nFolders);

					var _pos_of_key=function(sKey0){
						//2010.7.8 The 'i' in the first 'for-statement', it doesn't work with '+1';
						//for(var i in vFieldNames){
						for(var i=0; i<vFieldNames.length; ++i){
							var sKey=vFieldNames[i].toUpperCase();
							if(sKey==(sKey0||'').toUpperCase()){
								return i;
							}
						}
						return -1;
					};

					var _act_on_treeitem=function(sSsgPath, iLevel){

						if(xNyf.folderExists(sSsgPath, false)){

							var sTitle=xNyf.getFolderHint(sSsgPath); if(!sTitle) sTitle='New info item ...';

							var bContinue=plugin.ctrlProgressBar(sTitle, 1, true);
							if(!bContinue) return true;

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
						{ sTitle: ''
						, sFilter: 'MSExcel Spreadsheet (*.xls)|*.xls|All files(*.*)|*.*'
						, sDefExt: '.xls'
						, bOverwritePrompt: true
						});

					if(sFn){

						xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

						var f=new CLocalFile(sFn);
						if(f.exists()) f.delete();

						wb.saveAs(f);

						_gc(); //let js perform garbage collecting;

						sMsg=_lc2('Done', 'Total %nCount% data records extracted and saved in the file. View it now?');
						sMsg=sMsg.replace(/%nCount%/gi, ''+(iRow-2));
						sMsg+='\n\n'+f;
						if(confirm(sMsg)){
							xls.setVisible(true); //f.launch('open', '', '', false);
						}else{
							xls.quit();
						}
					}else{
						xls.quit();
					}
				}
			}
		}
	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}
}catch(e){
	alert(e);
}
