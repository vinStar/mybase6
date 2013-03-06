
//sValidation=nyfjs
//sCaption=Create calendar links by parsing timestamp ...
//sHint=Parse timestamp in the item title and convert into calendar links
//sCategory=MainMenu.Plugins
//sLocaleID=Menu.Plugin.CalendarByTimestamp
//sAppVerMin=6.0
//sShortcutKey=

//---------------------------------------------------------
// The date format in item title to be parsed is supposed to be:
// [year-month-day] item-title
// or
// [year.month.day] item title
//
// For particular date formats, please try to revise the regular expression at the follining code line.

//---------------------------------------------------------

var xDatePic=/(\d+)[-_.](\d+)[-_.](\d+)\s*(.*)$/;

//---------------------------------------------------------


var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};

var xNyf=new CNyfDb(-1);

if(xNyf.isOpen()){

	if(!xNyf.isReadonly()){

		if(confirm('Linking items with calendar by parsing timestamp written in item titles. Proceed?\n\nThe date format is assumed as [year-month-day] or [year.month.day]. For particular date formats, please try to revise the script file below.\n\n'+plugin.getScriptFile())){

			plugin.initProgressRange('Converting...');

			var sCurItem=plugin.getCurInfoItem(-1);

			var _act_on_treeitem=function(sSsgPath, iLevel){

				var sHint=xNyf.getFolderHint(sSsgPath);
				plugin.showProgressMsg(sHint);

				var vFail=[];
				//var m=(sHint||'').match(/(\d+)[-_.](\d+)[-_.](\d+)\s*(.*)$/);
				var m=(sHint||'').match(xDatePic);
				if(m){
					var i=1, wYear=parseInt(m[i++]), wMonth=parseInt(m[i++]), wDay=parseInt(m[i++]), sTitle=m[i++];
					if(wYear>1900 && wMonth>=1 && wMonth<=12 && wDay>=1 && wDay<=31){
						var t=new Date();
						t.setFullYear(wYear);
						t.setMonth(wMonth-1);
						t.setDate(wDay);
						//if(plugin.calendarLink(-1, sSsgPath, t)>0){
						if(plugin.calendarLink({sSsgPath: sSsgPath, tStart: t})>0){
							sTitle=sTitle.replace(/\[\s*(.*)\s*\]/, '$1');
							xNyf.setFolderHint(sSsgPath, _trim(sTitle));
						}
					}else{
						alert('Bad date string: '+m[0]);
					}
				}else{
					vFail[vFail.length]=sHint;
				}
			};

			xNyf.traverseOutline(sCurItem, false, _act_on_treeitem);

			plugin.showProgressMsg('');

			//if(vFail) alert(vFail);

			plugin.refreshOutline(-1, sCurItem);
			plugin.refreshCalendar(-1);
			plugin.refreshOverview(-1);
		}

	}else{
		alert('Cannot modify the database which is open as Readonly.');
	}

}else{
	alert('No database is currently opened.');
}
