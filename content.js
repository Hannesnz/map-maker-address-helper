chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		var values = {};
		for(var k in request) values[k]=request[k];
		window.postMessage(values, '*');
	}
);

window.addEventListener("message", function (e) {
	chrome.runtime.sendMessage(e.data);
});

function injectJs(link) {
	var scr = document.createElement('script');
	scr.type="text/javascript";
	scr.src=link;
	document.getElementsByTagName('head')[0].appendChild(scr)
}

injectJs(chrome.extension.getURL('injected.js'));