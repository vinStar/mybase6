
//sValidation=nyfjs
//sCaption=Export email addresses ...
//sHint=Extract email addresses from within text notes and save results to a file
//sCategory=MainMenu.Share
//sLocaleID=p.ExportEmailAddr
//sAppVerMin=6.0
//sShortcutKey=

//6:11 PM 6/4/2010 this utility traverses the current branch
//and attempts to extract Email addresses found in text notes.
//The email addresses will be saved in a text file.

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sCurItem=plugin.getCurInfoItem(-1);

		var nFolders=0;

		//To estimate the progress range;
		//xNyf.traverseOutline(sCurItem, true, function(){
		//	nFolders++;
		//});

		plugin.initProgressRange(plugin.getScriptTitle(), nFolders);

		var _isDigit=function(ch){return (ch>='0' && ch<='9');};
		var _isAlpha=function(ch){return (ch>='a' && ch<='z') || (ch>='A' && ch<='Z');};

		var mAddrs={};

		var _act_on_treeitem=function(sSsgPath, iLevel){

			var xSsgFn=new CLocalFile(sSsgPath); xSsgFn.append(plugin.getDefNoteFn());

			var bContinue=plugin.ctrlProgressBar(xNyf.getFolderHint(sSsgPath), 1, true);
			if(!bContinue) return true;

			var sRtf=xNyf.loadText(xSsgFn);
			var sTxt=platform.extractTextFromRtf(sRtf);
			var vLines=sTxt.split('\n');

			for(var i=0; i<vLines.length; ++i){
				var s=(vLines[i]||'').toLowerCase();
				while(s){
					var p=s.indexOf('@');
					if(p==0){
						s=s.substr(1);
					}else if(p>0){
						var p1=p-1, p2=p+1;
						while(p1>=0){
							var ch=s.charAt(p1);
							if( _isDigit(ch) || _isAlpha(ch) || ch=='-' || ch=='_' || ch=='.' || ch=='+' ){
								p1--;
								continue;
							}else{
								break;
							}
						}
						while(p2<s.length){
							var ch=s.charAt(p2);
							if( _isDigit(ch) || _isAlpha(ch) || ch=='-' || ch=='_' || ch=='.' ){
								p2++;
								continue;
							}else{
								break;
							}
						}
						var email=s.substring(p1+1, p2); s=s.substring(p2);

						//TODO: validating the email address using RegExp;

						if(email.length>5 && email.indexOf('@')>0 && email.indexOf('@')<email.length-4){
							var n=mAddrs[email]||0;
							mAddrs[email]=n+1;
						}
					}else{
						break;
					}
				}
			}
		};

		var sFn=platform.getSaveFileName(
			{ sTitle: ''
			, sFilter: 'Text files (*.txt)|*.txt|All files (*.*)|*.*'
			, sDefExt: '.txt'
			, bOverwritePrompt: true
			});

		if(sFn){

			xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);

			var s='', nAddr=0;
			for(var a in mAddrs){
				if(s) s+='\r\n';
				s+=a;
				//s+=(' ('+mAddrs[a]+')'); //num of occurrences;
				nAddr++;
			}

			if(s){
				var f=new CLocalFile(sFn);
				f.saveUtf8(s);

				var sMsg=_lc2('Done', 'Total %nCount% Email address(es) extracted and saved in the file. View it now?');
				sMsg=sMsg.replace(/%nCount%/gi, ''+nAddr);
				if(confirm(sMsg+'\n\n'+sFn)){
					f.launch('open');
				}
			}else{
				alert(_lc2('None', 'No Email addresses found.'));
			}
		}

	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
