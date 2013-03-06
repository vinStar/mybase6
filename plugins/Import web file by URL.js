
//sValidation=nyfjs
//sCaption=Import web file by URL ...
//sHint=Download and import a web file by URL
//sCategory=MainMenu.Capture
//sLocaleID=p.ImportFileByUrl
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

function _parse_uri(sUri)
{
	var s=sUri, p=-1;
	var r={
		'sService': ''
		, 'sUserName': ''
		, 'sPassword': ''
		, 'sServerName': ''
		, 'sPort': ''
		, 'sObjName': ''
		, 'sPathName': ''
		, 'sQuery': ''
		, 'sHash': ''
	};

	var sSrvTag='', sService='', bServiceOK=true;

	//s: ftp://username%pwd@www.domain.com:80/dir/filename.html?q=blablabla#hash

	sSrvTag='ftp://';
	p=s.toLowerCase().indexOf(sSrvTag);
	if(p==0){
		sService='ftp';
	}else{
		sSrvTag='gopher://';
		p=s.toLowerCase().indexOf(sSrvTag);
		if(p==0){
			sService='gopher';
		}else{
			sSrvTag='http://';
			p=s.toLowerCase().indexOf(sSrvTag);
			if(p==0){
				sService='http';
			}else{
				sSrvTag='https://';
				p=s.toLowerCase().indexOf(sSrvTag);
				if(p==0){
					sService='https';
				}else{
					bServiceOK=false;
				}
			}
		}
	}

	if(bServiceOK){
		r['sService']=sService;

		s=s.substr(sSrvTag.length);

		//s: username%pwd@www.domain.com:80/dir/filename.html?q=blablabla#hash
		p=s.indexOf('/');
		if(p>=0){
			var n=s.substr(p);
			s=s.substr(0, p);

			//n: /dir/filename.html?q=blablabla#hash
			if(n){
				r['sObjName']=n;

				p=n.indexOf('?');
				if(p>=0){
					var q=n.substr(p+1);
					n=n.substr(0, p);

					//q: q=blablabla#hash
					p=q.indexOf('#');
					if(p>=0){
						r['sHash']=q.substr(p+1);
						q=q.substr(0, p);
					}

					//q: q=blablabla
					if(q){
						r['sQuery']=q;
					}
				}

				//n: //n: /dir/filename.html
				if(n){
					r['sPathName']=n;
				}
			}
		}

		//s: username%pwd@www.domain.com:80
		p=s.indexOf("@");
		if(p>=0){
			var t=s.substr(0, p);
			s=s.substr(p+1);

			//t: name%pwd
			if(t){
				p=t.indexOf('%');
				if(p>=0){
					r['sPassword']=t.substr(p+1);
					t=t.substr(0, p);
				}
				r['sUserName']=t;
			}
		}

		//s: www.domain.com:80
		p=s.indexOf(':');
		if(p>=0){
			r['sPort']=s.substr(p+1);
			s=s.substr(0, p);
		}

		//s: www.domain.com
		if(s){
			r['sServerName']=s;
		}
	}

	return r;
}

try{

	var xNyf=new CNyfDb(-1);

	if(xNyf.isOpen()){

		if(!xNyf.isReadonly()){

			var sCurItem=plugin.getCurInfoItem();
			if(sCurItem){

				var sCfgUrl='ImportFileByUrl.sUrl', sCfgFn='ImportFileByUrl.sFn';
				var sMsg=_lc2('EnterUrl', 'Enter a URL to download the web file');
				var sUrl=prompt(sMsg, localStorage.getItem(sCfgUrl)||'http://');
				if(sUrl){

					//2011.8.21 check to see whether it's retrying to download the same web file;
					var bRetry=(sUrl==localStorage.getItem(sCfgUrl));

					localStorage.setItem(sCfgUrl, sUrl);

					var r=_parse_uri(sUrl);
					var xFn=new CLocalFile(r['sPathName']);
					var sFn=xFn.getLeafName();

					sMsg=_lc2('EnterFn', 'Specify a filename to save the web file as attachment');
					sFn=prompt(sMsg, (bRetry?localStorage.getItem(sCfgFn):'')||sFn||'unnamed.html');
					if(sFn){

						localStorage.setItem(sCfgFn, sFn);

						plugin.initProgressRange('Downloading');

						var xReq=new XMLHttpRequest();
						if(xReq){

							xReq.onreadystatechange=function(){

								var bContinue=plugin.ctrlProgressBar('readyState: '+xReq.readyState+', bytesRead: '+xReq.countOfBytesRead, 1, true);
								if(!bContinue) xReq.abort();

								if(xReq.readyState == 4){
									var xTmpFn=new CLocalFile(platform.getTempFile('', '', '.tmp')); platform.deferDeleteFile(xTmpFn);
									var xSsgFn=new CLocalFile(sCurItem); xSsgFn.append(sFn);
									if(xReq.saveAs(xTmpFn)>0){
										var nBytes=xNyf.createFile(xSsgFn, xTmpFn);
										if(nBytes>=0){
											plugin.refreshDocViews();
										}else{
											alert(_lc2('Fail.ImportFile', 'Failed to save the web file within myBase'));
										}
									}
									xTmpFn.delete();
								}
							};

							xReq.open('GET', sUrl, false);
							xReq.send();

						}else{
							alert(_lc2('Fail.InitAjax', 'Failed to create XMLHttpRequest objects.'));
						}
					}
				}

			}else{
				alert(_lc('Prompt.Warn.NoInfoItemSelected', 'No info item is currently selected.'));
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
