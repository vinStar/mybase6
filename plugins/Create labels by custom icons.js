
//sValidation=nyfjs
//sCaption=Create labels by custom icons ...
//sHint=Create labels by custom icons applied to info items
//sCategory=MainMenu.Plugins
//sLocaleID=p.LabelByIcon
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{

	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			if(confirm(_lc2('Confirm', 'Creating labels and labeling items by icons applied to the info items. Proceed?'))){

				plugin.initProgressRange('Labeling...');

				var sCurItem=plugin.getCurInfoItem(-1);

				var _validate_label=function(sLabel){
					return sLabel.replace(/[\\\/\s\r\n\t]/g, '_');
				};

				var nDone=0;
				var _act_on_treeitem=function(sSsgPath, iLevel){

					var sHint=xNyf.getFolderHint(sSsgPath);

					var bContinue=plugin.ctrlProgressBar(sHint, 1, true);
					if(!bContinue) return true;

					var iIcon=plugin.getInfoItemIcon(-1, sSsgPath);
					if(iIcon>=0){
						var sLabel=plugin.getIconHint(-1, iIcon);
						sLabel=_validate_label(sLabel);
						if(sLabel){
							if(plugin.labelNew(-1, sLabel)>0){
								if(plugin.labelApply(-1, sLabel, sSsgPath)>0){
									//Succeeded;
									nDone++;
								}
							}
						}
					}
				};

				xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

				plugin.ctrlProgressBar('');

				if(nDone>0){
					plugin.refreshLabelTree(-1);
					plugin.refreshOverview(-1);
				}

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
