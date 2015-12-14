chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.action === 'startAddressAdding') {
			var values = {};
			for(var k in request) values[k]=request[k];
			window.postMessage(values, '*');
		}
	}
);

window.addEventListener("message", function (e) {
	if (e.data.action === 'abortedAddress') {
		chrome.runtime.sendMessage({action:'abortedAddress'});
	} else if (e.data.action === 'createdAddress') {
		chrome.runtime.sendMessage({action:'createdAddress'});
	} else if (e.data.action === 'addresshelperMapFound') {
		chrome.runtime.sendMessage({action:'showPageAction'});
	}
});

function injectJs(link) {
	var scr = document.createElement('script');
	scr.type="text/javascript";
	scr.src=link;
	document.getElementsByTagName('head')[0].appendChild(scr)
}

injectJs(chrome.extension.getURL('injected.js'));