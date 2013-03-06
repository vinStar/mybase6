
//sValidation=nyfjs
//sCaption=Word count for item ...
//sHint=Count words for the current info item
//sCategory=MainMenu.Plugins
//sLocaleID=Menu.Plugin.WordCountItem
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};

function _reveal(obj, sMsg)
{
	var s='';
	if(obj){
		
		var type=typeof(obj);

		//s='TYPE = '+type;

		if(type == 'object'){
			for(var x in obj){

				if(x=='typeDetail') continue; //weird thing in IE7
			
				var val=obj[x];
				if(val){
					type=typeof(val);
					if(type=='string' || type=='number'){
						val=obj[x];
					}else if(type=='function'){
						val='{function}';
					}else{
						val='['+type+']';
					}
				}else{
					val='';
				}

				if(s) s+='\n';

				s+=x;
				s+=' : ';
				s+=val;
			}
		}else if(type=='string'){
			s+='\n';
			s+=obj;
		}else{
		}
	}
	if(sMsg) s=sMsg+'\n\n'+s;
	alert(s);
}

var _wc=function(sTxt){

	var nWest=0, nEast=0, nPara=0;

	var s=sTxt.toUpperCase(), sTrackWord='', sTrackPara='';

	for(var i=0; i<s.length; ++i){

		var c=s.charCodeAt(i), A=0x41, Z=0x5a, D0=0x30, D9=0x39, CR=0x0d, LF=0x0a;

		if( (c>=A && c<=Z) || (c>=D0 && c<=D9) || (c>=0x7f && c<=0xff) ){
			sTrackWord=c;
			sTrackPara=c;
		}else if(c>0xff){
			sTrackPara=c;
			nEast++;
			if(sTrackWord){
				nWest++;
				sTrackWord='';
			}
		}else{
			if(c==LF){
				if(sTrackPara){
					nPara++;
					sTrackPara='';
				}
			}
			if(sTrackWord){
				nWest++;
				sTrackWord='';
			}
		}
	}
	return {'Count of western words': nWest
		, 'Count of eastern words': nEast
		, 'Count of paragraphs': nPara
	};
};

var xNyf=new CNyfDb(-1);

var _action=function(){
	var sSsgPath=plugin.getCurInfoItem(-1);
	if(sSsgPath){
		var xSsgFn=new CLocalFile(sSsgPath); xSsgFn.append(plugin.getDefNoteFn());
		var sRtf=xNyf.loadText(xSsgFn);
		if(sRtf!=undefined){
			var sTxt=platform.extractTextFromRtf(sRtf);
			var xRes=_wc(sTxt);
			_reveal(xRes, '** Word count for the current info item **');
		}
	}
};

if(xNyf.isOpen()){
	try{_action();}catch(e){alert(e);}
}else{
	alert('No database is currently opened.');
}
