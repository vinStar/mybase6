
//sValidation=nyfjs
//sCaption=Search by custom icons ...
//sHint=Search database or current branch by label text of custom icons
//sCategory=MainMenu.Plugins
//sLocaleID=p.SearchByIcons
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var vIcons=[], vLabels=[];
		{
			var sRoot=plugin.getDefRootContainer();
			var vFiles=xNyf.listFiles(sRoot);
			for(var j in vFiles){
				var xSsgFn=new CLocalFile(sRoot); xSsgFn.append(vFiles[j]);
				if(xSsgFn.getExtension()=='.bmp'){
					var nIconID=parseInt(xSsgFn.getTitle()||'', 16);
					if(nIconID>=0){
						var sHint=xNyf.getFileHint(xSsgFn)||('Untitled-'+nIconID);
						vIcons[vIcons.length]={nID: nIconID, sLabel: sHint + ' -- #'+nIconID+''};
					}
				}
			}

			vIcons.sort(function(x, y){
				return x.sLabel>y.sLabel ? 1 : -1;
			});

			for(var j in vIcons){
				vLabels[vLabels.length]=vIcons[j].sLabel;
			}
		}

		if(vLabels.length>0){

			var _pos_of=function(nID){
				var iPos=-1;
				for(var j in vIcons){
					if(vIcons[j].nID==nID){
						iPos=j;
					}
					iPos=-1;
				}
				return iPos;
			};

			var _id_of=function(iPos){
				var nID=-1;
				if(iPos>=0 && iPos<vIcons.length){
					nID=vIcons[iPos].nID;
				}
				return nID;
			};

			var sMsg=_lc2('SelIcon', 'Select an item from with the list to search for');
			var iIconSel=dropdown(sMsg, vLabels, 0);
			if(iIconSel>=0){

				localStorage.setItem(sCfgKey, _id_of(iIconSel));

				var iIcon2Find=_id_of(iIconSel);

				var vActs=[
					  _lc2('InBranch', '1. Search the current branch')
					, _lc2('InDatabase', '2. Search the whole database')
					];

				var sCfgKey='SearchByIcons.iAction';
				var sMsg=_lc('p.Common.SelAction', 'Please select an action form within the dropdown list');
				var iSel=dropdown(sMsg, vActs, localStorage.getItem(sCfgKey));
				if(iSel>=0){

					localStorage.setItem(sCfgKey, iSel);

					plugin.initProgressRange(plugin.getScriptTitle(), 0);

					var mToScan={};
					var sDefNoteFn=plugin.getDefNoteFn();

					var _push=function(i, p, n){
						var v=mToScan[i];
						if(!v) v=mToScan[i]=[];
						v[v.length]={sSsgPath: p, sSsgName: n};
					};

					switch(iSel){
						case 0:
						case 1:
						{
							var bBranch=(iSel==0), sCurItem=bBranch ? plugin.getCurInfoItem() : plugin.getDefRootContainer();
							if(!sCurItem){
								sCurItem=plugin.getDefRootContainer();
								bBranch=false;
							}

							var iDbPos=plugin.getCurDbIndex();
							xNyf.traverseOutline(sCurItem, bBranch, function(sSsgPath, iLevel){

								var sTitle=xNyf.getFolderHint(sSsgPath); if(!sTitle) sTitle='Untitled';

								var bContinue=plugin.ctrlProgressBar(sTitle, 1, true);
								if(!bContinue) return true;

								_push(iDbPos, sSsgPath, '');
							});

							break;
						}
					}

					plugin.runQuery({bListOut: true}); //make sure the Query-results window is open and cleared;

					for(var iDbPos in mToScan){
						var vII=mToScan[iDbPos];
						if(vII.length>0){
							var xDb=new CNyfDb(parseInt(iDbPos)), sDbid=xDb.getDbFile();
							for(var i in vII){
								var xII=vII[i];
								var sSsgPath=xII.sSsgPath, sSsgName=xII.sSsgName, sTitle=xDb.getFolderHint(sSsgPath)||'';

								var bContinue=plugin.ctrlProgressBar(sTitle||'Untitled', 1, false);
								if(!bContinue) break;

								var iIcon=xNyf.getAppDataOfEntryByPos(sSsgPath, 0, -1);
								if(iIcon>=0 && iIcon==iIcon2Find){
									var sLine=sDbid+'\t'+sSsgPath+'\t'+sSsgName;
									plugin.appendToResults(sLine, {sDelimiter: '\t', sFindStr: ''});
								}
							}
						}
					}
				}
			}
		}else{
			alert(_lc2('NoIcons', 'No custom icons available in the database.'));
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
