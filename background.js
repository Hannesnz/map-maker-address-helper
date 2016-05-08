var supportedLanguages = ['en', 'en-US', 'en-GB', 'uk'];
var letterAddress = /[\d]+[\D]{1}/;
var unitAddress = /([\d]+)\/([\d]+)\b/;
var collectedStreetNames = [];
var collectedCities = [];

function SavedData() {
	this.showHints = true;
	this.hideTranslateMessage = false;
}

SavedData.prototype.loadData = function (sendResponse) {
	var data = this;
	chrome.storage.sync.get(null, function (items) {
		if (!chrome.runtime.error) {
			if (items.showHints != null) {
				data.showHints = items.showHints;
			}
			if (items.hideTranslateMessage != null) {
				data.hideTranslateMessage = items.hideTranslateMessage;
			}
		}
		sendResponse();
	});
};

SavedData.prototype.saveData = function() {
	var data = this;
	chrome.storage.sync.set({showHints: data.showHints}, function() {});
	chrome.storage.sync.set({hideTranslateMessage: data.hideTranslateMessage}, function() {});
};

var addressingTab = null;
var currentStreetNum;
var currentStreetName;
var currentCity;
var currentAutoInc = true;
var currentIncBy = 2;

function addAddress(isFirstTime) {
	setPageActionIcon(addressingTab, currentStreetNum);
	chrome.tabs.sendMessage(addressingTab.id, {
		action: 'startAddressAdding',
		addressValue: chrome.i18n.getMessage("addressValue"),
		firstTime: isFirstTime,
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
	currentIncBy = incBy;
	addAddress(true);
}

function findStreetNames(tab) {
	addressingTab = tab;
	chrome.tabs.sendMessage(addressingTab.id, {
		action: 'findStreetNames',
		addressValue: chrome.i18n.getMessage("addressValue")}, function (response) {});			
};

function stopAddressing() {
	currentStreetNum = null;
	setPageActionIcon(addressingTab, currentStreetNum);
	addressingTab = null;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'showPageAction') {
		chrome.pageAction.show(sender.tab.id);
    } else if (request.action === 'createdAddress') {
		if (currentAutoInc) {
			if (letterAddress.test(currentStreetNum)) {
				currentStreetNum = currentStreetNum.slice(0, -1) + String.fromCharCode(currentStreetNum.slice(-1).charCodeAt() + 1);
			} else if (unitAddress.test(currentStreetNum)) {
				currentStreetNum = +currentStreetNum.replace(unitAddress, "$1") + +currentIncBy + "/" + currentStreetNum.replace(unitAddress, "$2");
			} else {
				currentStreetNum = +currentStreetNum + +currentIncBy;
			}
			setTimeout(function() {addAddress(false);}, 1500);
		} else {
			stopAddressing();
		}
    } else if (request.action === 'abortedAddress') {
		stopAddressing();
		if (request.invalidStreetName) {
			alert(chrome.i18n.getMessage("streetNameNotFoundError", currentStreetName));
		}
    } else if (request.action === 'detailsFound') {
		collectedStreetNames = request.streetNamesFound;
		collectedCities = request.citiesFound;
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

var savedData = null;

if (savedData == null) {
	savedData = new SavedData();
}
savedData.loadData(function () {
	chrome.contextMenus.removeAll();
	if (supportedLanguages.indexOf(chrome.i18n.getUILanguage()) < 0) {
		chrome.contextMenus.create({
			title: "Help Translate...",
			contexts: ["page_action"],
			onclick: function() {
				chrome.tabs.create({ url: "translate.html" });
			}
		});
	}
	chrome.contextMenus.create({
		title: chrome.i18n.getMessage("showHints"),
		id: "addressHelperShowHints",
		type: "checkbox",
		contexts: ["page_action"],
		checked: savedData.showHints,
		onclick: function() {
			savedData.showHints = !savedData.showHints;
			savedData.saveData();
			chrome.contextMenus.update("addressHelperShowHints", {checked: savedData.showHints})
		}
	});
});
