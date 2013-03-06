
//sValidation=nyfjs
//sCaption=Evaluate JavaScript Code
//sHint=Evaluate selected script code written in JavaScript
//sCategory=
//sLocaleID=Menu.Plugin.EvalJsCode
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};

try{

	var sTxt=plugin.getSelectedText(false);
	if(!sTxt){
		var xTmpFn=new CLocalFile(platform.getTempFile()); platform.deferDeleteFile(xTmpFn);
		if(plugin.rtfStreamOut(xTmpFn, 0x0001, false)>0){
			sTxt=xTmpFn.loadText();
		}
		xTmpFn.delete();
	}

	if(sTxt){
			var sRes=eval(sTxt);
			if(sRes){
				alert(sRes);
			}
	}else{
		alert('No script code available to evaluate.');
	}

}catch(e){
	alert(e);
}
