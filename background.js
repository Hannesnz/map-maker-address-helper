var supportedLanguages = [];//['en', 'en-US', 'en-GB'];

function OverlayData() {
	this.showHints = false;
}

OverlayData.prototype.loadData = function (sendResponse) {
	var data = this;
	chrome.storage.sync.get(null, function (items) {
		if (!chrome.runtime.error) {
			if (items.showHints != null) {
				data.showHints = items.showHints;
			}
		}
		sendResponse();
	});
};

OverlayData.prototype.saveData = function() {
	var data = this;
	chrome.storage.sync.set({showHints: data.showHints}, function() {});
};

var addressingTab = null;
var currentStreetNum;
var currentStreetName;
var currentCity;
var currentAutoInc = true;
var currentIncBy = 2;

function addAddress() {
	setPageActionIcon(addressingTab, currentStreetNum);
	chrome.tabs.sendMessage(addressingTab.id, {
		action: 'startAddressAdding',
		streetNum: currentStreetNum, 
		streetName: currentStreetName,
		city: currentCity}, function (response) {});			
}

function startAddressAdding(tab, streetNum, streetName, city, autoInc, incBy) {
	addressingTab = tab;
	currentStreetNum = streetNum;   
	currentStreetName = streetName;
	currentCity = city;
	currentAutoInc = autoInc;
	currentIncBy = +incBy;
	addAddress();
}

chrome.runtime.onMessage.addListener(

function (request, sender, sendResponse) {
    if (request.action === 'createdAddress') {
		if (currentAutoInc) {
			currentStreetNum = +currentStreetNum + currentIncBy;
			addAddress();
		}
    } else if (request.action === 'abortedAddress') {
		currentStreetNum = null;
		setPageActionIcon(addressingTab, currentStreetNum);
		addressingTab = null;
	}
});


function setPageActionIcon(tab, number) {
    var canvas = document.createElement('canvas');
    var img = document.createElement('img');
    img.onload = function () {
		/* Draw the background image */
		var context = canvas.getContext('2d');
		context.drawImage(img, 0, 0);

		if (number != null) {
			/* Draw the "badge" */
			var grd = context.createLinearGradient(0, 10, 0, 19);
			grd.addColorStop(0, 'rgb(255, 100, 100)');
			grd.addColorStop(1, 'rgb(150,  50,  50)');

			context.fillStyle = grd;
			context.fillRect(0, 9, 19, 10);

			context.strokeStyle = 'rgb(255, 255, 255)';
			context.strokeRect(0,  10, 1, 1);
			context.strokeRect(0,  19, 1, 1);
			context.strokeRect(19, 10, 1, 1);
			context.strokeRect(19, 19, 1, 1);

			/* Draw some text */
			context.fillStyle = "white";
			context.font = "bold 10px Sans-Serif";
			context.fillText(number, 2, 17, 17);
		}

        chrome.pageAction.setIcon({
            imageData: context.getImageData(0, 0, 19, 19),
            tabId:     tab.id
        });
    };
    img.src = "images/icon19.png";
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: '/mapmaker' }
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'showPageAction') {
		chrome.pageAction.show(sender.tab.id);
	}
});

if (supportedLanguages.indexOf(chrome.i18n.getUILanguage()) < 0) {
	chrome.contextMenus.removeAll();
	chrome.contextMenus.create({
		  title: "Help Translate...",
		  contexts: ["page_action"],
		  onclick: function() {
			chrome.tabs.create({ url: "translate.html" });;
		  }
	});
}