
//sValidation=nyfjs
//sCaption=Link calendar by parsing date ...
//sHint=Parse date strings written in titles and convert them into calendar links
//sCategory=MainMenu.Plugins
//sLocaleID=p.parseDate
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};

var xNyf=new CNyfDb(-1);

if(xNyf.isOpen()){

	if(!xNyf.isReadonly()){

		if(confirm(_lc2('Confirm', 'Linking info items with calendar by parsing date strings manually written in titles. Proceed?'))){

			var vActs=[
				  _lc2('ymd', '1. Year-Month-Day')
				, _lc2('mdy', '2. Month-Day-Year')
				, _lc2('dmy', '3. Day-Month-Year')
				];

			var sMsg=_lc2('SelFmt', 'Select an appropriate date format to parse date strings');
			var iSel=dropdown(sMsg, vActs, 0);
			if(iSel>=0){

				plugin.initProgressRange('Converting...');

				var sCurItem=plugin.getCurInfoItem(-1);

				var _parse_date=function(s1, s2, s3){
					var xDate;
					var n1=parseInt(s1|''), n2=parseInt(s2||''), n3=parseInt(s3||'');
					if(n1>0 && n2>0 && n3>0){
						var d;
						switch(iSel){
							case 0:
								//y-m-d
								d={wYear: n1, wMonth: n2, wDay: n3};
								break;
							case 1:
								//m-d-y
								d={wMonth: n1, wDay: n2, wYear: n3};
								break;
							case 2:
								//d-m-y
								d={wDay: n1, wMonth: n2, wYear: n3};
								break;
						}
						if(d && d.wYear>1900 && d.wMonth>=1 && d.wMonth<=12 && d.wDay>=1 && d.wDay<=31){
							xDate=d;
						}
					}
					return xDate;
				};

				var vFail=[];
				var _act_on_treeitem=function(sSsgPath, iLevel){

					var sHint=xNyf.getFolderHint(sSsgPath);
					plugin.showProgressMsg(sHint);

					var xRE=/(\d+)[-_.\/](\d+)[-_.\/](\d+)\s*(.*)$/;
					var m=(sHint||'').match(xRE);
					if(m){
						var i=1, s1=m[i++], s2=m[i++], s3=m[i++], sTitle=m[i++];
						var d=_parse_date(s1, s2, s3);
						if(d){
							var t=new Date();
							t.setFullYear(d.wYear);
							t.setMonth(d.wMonth-1);
							t.setDate(d.wDay);
							if(plugin.calendarLink({sSsgPath: sSsgPath, tStart: t})>0){
								sTitle=sTitle.replace(/\[\s*(.*)\s*\]/, '$1');
								xNyf.setFolderHint(sSsgPath, _trim(sTitle));
							}
						}else{
							//alert('Bad date string: '+m[0]);
							vFail[vFail.length]=m[0]||'';
						}
					}
				};

				xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

				plugin.showProgressMsg('');

				plugin.refreshOutline(-1, sCurItem);
				plugin.refreshCalendar(-1);
				plugin.refreshOverview(-1);

				if(vFail.length>0){
					var s='';
					for(var i in vFail){
						if(s) s+='\n';
						s+=(vFail[i]||'New info item');
					}
					alert(_lc2('Bad', 'Cannot parse the following date strings.')+'\n\n'+s);
				}
			}
		}

	}else{
		alert('Cannot modify the database which is open as Readonly.');
	}

}else{
	alert('No database is currently opened.');
}
