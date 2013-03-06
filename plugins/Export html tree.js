
//sValidation=nyfjs
//sCaption=Export html tree ...
//sHint=Export content as webpages and make into HTML tree
//sCategory=MainMenu.Share
//sLocaleID=p.ExportHtmlTree
//sAppVerMin=6.0
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_l=function(s){return (s||'').replace(/^\s+/g, '');};
var _trim_r=function(s){return (s||'').replace(/\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

var _html_encode=function(s)
{
	//http://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references
	s=s.replace(/&/g,	'&amp;');
	s=s.replace(/</g,	'&lt;');
	s=s.replace(/>/g,	'&gt;');
	s=s.replace(/\"/g,	'&quot;');
	s=s.replace(/\'/g,	'&apos;');
	s=s.replace(/  /g,	' &nbsp;'); //&nbsp; = non-breaking space;
	//and more ...
	return s;
};

var _html_decode=function(s)
{
	s=s.replace(/&lt;/g,		'<');
	s=s.replace(/&gt;/g,		'>');
	s=s.replace(/&quot;/g,		'"');
	s=s.replace(/&apos;/g,		'\'');
	s=s.replace(/&nbsp;/g,		' ');
	s=s.replace(/&circ;/g,		'^');
	s=s.replace(/&tilde;/g,		'~');
	//and more ...
	s=s.replace(/&amp;/g,		'&');
	return s;
};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var vActs=[
				  _lc2('CurBranch', '1. Export the current branch as HTML Tree')
				, _lc2('WholeDb', '2. Export the whole database as HTML Tree')
			];

		var sCfgKey='ExportHtmlTree.iAction';
		var sMsg=_lc('p.Common.SelAction', 'Please select an action form within the dropdown list');
		var iSel=dropdown(sMsg, vActs, localStorage.getItem(sCfgKey));
		if(iSel>=0){

			localStorage.setItem(sCfgKey, iSel);

			sCfgKey='ExportHtmlTree.sPathDst';
			var sDstDir=platform.browseForFolder(_lc2('SelDest', 'Select a destination folder to store the HTML tree'), localStorage.getItem(sCfgKey));
			if(sDstDir){

				localStorage.setItem(sCfgKey, sDstDir);

				var bCurBranch=(iSel==0);
				var sCurItem=bCurBranch ? plugin.getCurInfoItem(-1) : plugin.getDefRootContainer();
				var sTitle=bCurBranch ? xNyf.getFolderHint(sCurItem) : xNyf.getDbTitle();

				{
					//copy static files to the destination folder;
					var xNames={
						'jquery.js': 'jquery-1.5.min.js'
						, 'index.html': '_htmltree_index.html'
						, 'nav.html': '_htmltree_navpane.html'
					};
					var sPathSrc=new CLocalFile(plugin.getScriptFile()).getDirectory();
					for(var sFn in xNames){
						var xSrc=new CLocalFile(sPathSrc); xSrc.append(xNames[sFn]);
						var xDst=new CLocalFile(sDstDir); xDst.append(sFn);
						var s=xSrc.loadText();
						if(xSrc.getExtension().toLowerCase()=='.html'){
							s=s.replace(/%DbTitle%/g, sTitle);
						}
						xDst.saveUtf8(s);
					}
				}

				var _validate_filename=function(s){
					s=s||'';
					s=s.replace(/[\*\?\.\(\)\[\]\{\}\<\>\\\/\!\$\^\&\+\|,;:\"\'`~@#]/g, ' ');
					s=s.replace(/\s{2,}/g, ' ');
					s=_trim(s);
					if(s.length>64) s=s.substr(0, 64);
					s=_trim(s);
					s=s.replace(/\s/g, '_');
					return s;
				};

				var _unique_filename=function(sDir, sName, sExt){
					var sRes=sName+sExt, xFn=new CLocalFile(sDir); xFn.append(sRes);
					while(xFn.exists()){
						sRes=sName+'-'+Math.round(Math.random()*1000)+sExt;
						xFn=new CLocalFile(sDir); xFn.append(sRes);
					}
					return sRes;
				};

				var _hash_name=function(s1, s2, sExt){
					//2011.2.8 make signed into unsigned by using the operator 'n>>>0';
					//http://hi.baidu.com/ebiyuan/blog/item/d0691adb9c78156ed1164e4b.html
					var sName=(adler32(s1)>>>0).toString(16).toLowerCase();
					if(s2) sName+='-'+(adler32(s2)>>>0).toString(16).toLowerCase();
					return sName+sExt;
				};

				var _default_name=function(vFiles, bWebOnly){
					var sDef='';
					{
						var vDefNames=[sDefNoteFn, 'index.html', 'index.htm', 'home.html', 'home.htm', 'default.html', 'default.htm'];
						for(var i in vDefNames){
							if(i==0 && bWebOnly) continue;
							var sName=vDefNames[i];
							if((vFiles||[]).indexOf(sName)>=0){
								sDef=sName;
								break;
							}
						}
					}

					if(!sDef){
						var vBands='.html;.htm;.url>.xml;.eml>.gif;.png;.jpg;.jpeg;.bmp'.split('>');
						for(var j in vBands){
							var vExts=vBands[j].split(';');
							for(var i in vFiles){
								var sName=vFiles[i];
								var sExt=new CLocalFile(sName).getExtension().toLowerCase();
								if(vExts.indexOf(sExt)>=0){
									sDef=sName;
									break;
								}
							}
							if(sDef) break;
						}
					}
					return sDef;
				};

				var _updated=function(sSsgFn, sWinFn){
					var xWinFn=new CLocalFile(sWinFn), t1=xNyf.getModifyTime(sSsgFn), bUpd=true;
					if(xWinFn.exists()){
						var t2=xWinFn.getModifyTime();
						bUpd=t1>t2;
					}
					return bUpd;
				}

				plugin.initProgressRange(plugin.getScriptTitle());

				var sCss='table{border: 1px solid gray;} td{border: 1px solid gray;}';
				var sDefNoteFn=plugin.getDefNoteFn();

				var nDone=0, vItems=[], vFails=[];
				var _act_on_treeitem=function(sSsgPath, iLevel){

					var xLI={}, sTitle=xNyf.getFolderHint(sSsgPath);

					var bContinue=plugin.ctrlProgressBar(sTitle||'Untitled', 1, true);
					if(!bContinue) return true;

					xLI['sSsgPath']=sSsgPath;
					xLI['sTitle']=sTitle;
					xLI['iLevel']=iLevel;
					xLI['sLink']='';
					xLI['vFiles']=[];

					var vFiles=xNyf.listFiles(sSsgPath), sDef=_default_name(vFiles);

					//first handle and export default content for the info item;
					if(sDef){
						var xSrc=new CLocalFile(sSsgPath); xSrc.append(sDef);
						if(!xNyf.isShortcut(xSrc)){
							if(sDef==sDefNoteFn){
								var sExt='.html', sName=_hash_name(xSrc, '', sExt);
								var xDst=new CLocalFile(sDstDir); xDst.append(sName);
								if(_updated(xSrc, xDst)){
									var s=xNyf.loadText(xSrc);
									s=platform.convertRtfToHtml(s, {bInner: false, bPicture: true, sImgDir: sDstDir, sTitle: sTitle, sStyle: sCss, sJsFiles: ''});
									xDst.saveUtf8(s);
								}
								xLI['sLink']=sName;
							}else{
								var sExt=xSrc.getExtension();
								var sName=_hash_name(xSrc, '', sExt);
								var xDst=new CLocalFile(sDstDir); xDst.append(sName);
								if(_updated(xSrc, xDst)){
									if(xNyf.exportFile(xSrc, xDst)<0){
										sName='';
									}
								}
								xLI['sLink']=sName;
							}
						}
					}

					//then export image or CSS files linked with webpages;
					for(var i in vFiles){
						var sName=vFiles[i];
						if(sName!=sDef){
							var xSrc=new CLocalFile(sSsgPath); xSrc.append(sName);
							if(!xNyf.isShortcut(xSrc)){
								if('.gif;.jpg;.jpeg;.png;.bmp;.css'.split(';').indexOf(xSrc.getExtension().toLowerCase())>=0){
									var xDst=new CLocalFile(sDstDir); xDst.append(sName);
									if(_updated(xSrc, xDst)){
										if(xNyf.exportFile(xSrc, xDst)<0){
											sName='';
										}
									}
									if(sName){
										var v=xLI['vFiles']; v[v.length]=sFn;
									}
								}
							}
						}
					}

					vItems[vItems.length]=xLI;

				};

				xNyf.traverseOutline(sCurItem, bCurBranch, _act_on_treeitem);

				/*if(iSel==0){
					xNyf.traverseOutline(sCurItem, true, _act_on_treeitem);
				}else if(iSel==1){
					xNyf.traverseOutline(plugin.getDefRootContainer(), false, _act_on_treeitem);
				}*/

				if(vItems.length>0){
					var sHtm='';
					for(var j in vItems){
						var xLI=vItems[j];

						var sAttach='';
						for(var i in xLI.vFiles){
							if(sAttach) sAttach+=';';
							sAttach+=xLI.vFiles[i];
						}

						if(sHtm) sHtm+='\r\n';

						sHtm+='\t<li';
						sHtm+=' level=\"'+xLI.iLevel+'\"';
						if(xLI.sLink) sHtm+=' href=\"'+(xLI.sLink||'')+'\"';
						if(sAttach) sHtm+=' attach=\"'+sAttach+'\"';
						sHtm+='>';
						sHtm+=_html_encode(xLI.sTitle);
						sHtm+='</li>';
					}

					if(sHtm){
						var xFn=new CLocalFile(sDstDir); xFn.append('nav.html');
						var sHtml=xFn.loadText();
						xFn.saveUtf8(sHtml.replace(/%InfoItems%/, sHtm));
					}

					if(confirm(_lc2('Done', 'The HTML tree successfully generated. View it now?'))){
						var xStartPage=new CLocalFile(sDstDir); xStartPage.append('index.html');
						xStartPage.launch('open');
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
