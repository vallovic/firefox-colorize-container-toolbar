// Credits : https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
// Version 3.1
const shadeBlendConvert = function (p, from, to) {
	if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(to&&typeof(to)!="string"))return null; //ErrorCheck
	if(!this.sbcRip)this.sbcRip=(d)=>{
		let l=d.length,RGB={};
		if(l>9){
			d=d.split(",");
			if(d.length<3||d.length>4)return null;//ErrorCheck
			RGB[0]=i(d[0].split("(")[1]),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
		}else{
			if(l==8||l==6||l<4)return null; //ErrorCheck
			if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 or 4 digit
			d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=-1;
			if(l==9||l==5)RGB[3]=r((RGB[2]/255)*10000)/10000,RGB[2]=RGB[1],RGB[1]=RGB[0],RGB[0]=d>>24&255;
		}return RGB;}
	var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=this.sbcRip(from),t=this.sbcRip(to);
	if(!f||!t)return null; //ErrorCheck
	if(h)return "rgb"+(f[3]>-1||t[3]>-1?"a(":"(")+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
	else return "#"+(0x100000000+r((t[0]-f[0])*p+f[0])*0x1000000+r((t[1]-f[1])*p+f[1])*0x10000+r((t[2]-f[2])*p+f[2])*0x100+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)).toString(16).slice(1,f[3]>-1||t[3]>-1?undefined:-2);
}

// Save current theme settings
let currentTheme = null;

class containersTheme {
	constructor() {
		browser.tabs.onActivated.addListener((activeInfo) => {
			this.updateTabContainerTheme(activeInfo.tabId, activeInfo.windowId);
		});
	}

	isUnpaintedTheme(currentCookieStore) {
		return (currentCookieStore == "firefox-default" ||
						currentCookieStore == "firefox-private");
	}

	async updateTabContainerTheme(tabId, windowId) {
		// Check if current theme settings have already been set
		if (currentTheme === null) {
			currentTheme = await browser.theme.getCurrent();
		} else {
			// If they were, check if the theme hasn't changed, like from Light to Dark or from Dark to Light
			const newCurrentTheme = await browser.theme.getCurrent();

			// Popup color could be different if theme changed so set new current theme
			if (newCurrentTheme.colors.popup !== currentTheme.colors.popup)
				currentTheme = JSON.parse(JSON.stringify(newCurrentTheme));
		}

		const tab = await browser.tabs.get(tabId);

		if (!this.isUnpaintedTheme(tab.cookieStoreId)) {
			// Deep copy current theme
			const auxCurrentTheme = JSON.parse(JSON.stringify(currentTheme));

			const container = await browser.contextualIdentities.get(tab.cookieStoreId);

			// If popup isn't white, shade it darker, if it is, shade it lighter
			const toolbarColor = shadeBlendConvert(auxCurrentTheme.colors.popup !== '#fff' ? -0.6 : 0.75, container.colorCode);

			// Finally set theme with new toolbar color
			auxCurrentTheme.colors.tab_selected = toolbarColor
			auxCurrentTheme.colors.toolbar = toolbarColor
			// auxCurrentTheme.colors.toolbar_field = toolbarColor
			browser.theme.update(windowId, auxCurrentTheme);
		} else {
			// Keep current theme toolbar
			browser.theme.update(windowId, currentTheme);
		}
	}
}

new containersTheme();