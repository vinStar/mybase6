//sValidation=nyfjs
//sCaption=Items for today
//sHint=List out today's items by calendar
//sCategory=
//sLocaleID=p.ItemsForToday
//sAppVerMin=6.0
//sShortcutKey=Shift+ESC

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{
	if(plugin.getCurDbIndex()>=0){

		var t0=new Date();

		plugin.runQuery(
			{
				  iDbPos: -1
				, tCalendarStart: t0
				, tCalendarEnd: t0
				, bListOut: true
			}
		);

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}
}catch(e){
	alert(e);
}
