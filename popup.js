function setProperty(selector, prop, msg) {
    document.querySelector(selector)[prop] = chrome.i18n.getMessage(msg);
}

function loadI18nMessages() {
	setProperty('#loadingMessage', 'innerText', 'loading');
	setProperty('#addressHelp', 'innerText', 'addressHelperDescription');
	setProperty('#addressStreetNumTitle', 'innerText', 'streetNumTitle');
	setProperty('#addressStreetNum', 'title', 'streetNumHint');
	setProperty('#addressStreetNameTitle', 'innerText', 'streetNameTitle');
	setProperty('#addressStreetName', 'title', 'streetNameHint');
	setProperty('#addressTownCityTitle', 'innerText', 'townCityTitle');
	setProperty('#addressTownCity', 'title', 'townCityHint');
	setProperty('#autoIncLabel', 'innerText', 'autoIncLabel');
	setProperty('#autoInc', 'title', 'autoIncHint');
	setProperty('#incByLabel', 'innerText', 'incByLabel');
	setProperty('#startAddressAdding', 'innerText', 'startAddingLabel');
}

document.onreadystatechange = function (e) {
    if (document.readyState === 'complete') {
		loadI18nMessages();
        chrome.runtime.getBackgroundPage(function (bg) {
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				$(function () {
					$( document ).tooltip({disabled: !bg.savedData.showHints});
					$("#loading").hide();
					$("#container").show();
					$("#addressStreetNum").val(bg.currentStreetNum);
					$("#addressStreetName").val(bg.currentStreetName);
					$("#addressTownCity").val(bg.currentCity);
					$("#incBy").val(bg.currentIncBy);
					$('#autoInc').prop('checked', bg.currentAutoInc);
					$("#incBy").selectmenu();
					if (!bg.savedData.hideTranslateMessage) {
						if (bg.supportedLanguages.indexOf(chrome.i18n.getUILanguage()) < 0) {
							$('#translateHelp').show();
						}	
					}
					$("#startAddressAdding").button()
						.click(function (event) {
						event.preventDefault();
						if ($("#addressStreetNum").val().trim() == "") {
							alert("You must specify a street number.");
							return;
						}
						if ($('#autoInc').prop('checked') && !(+$("#addressStreetNum").val()===parseInt($("#addressStreetNum").val()))) {
							alert("Street number must be a whole number if auto incrementing.");
							return;
						}
						if ($("#addressStreetName").val().trim() == "") {
							alert("You must specify a street name.");
							return;
						}
						bg.startAddressAdding(tabs[0], parseInt($("#addressStreetNum").val()), $("#addressStreetName").val(), $("#addressTownCity").val(), $('#autoInc').prop('checked'), $("#incBy").val());
						window.close();
					});
					$("#closeTranslate").button({icons: {primary: "ui-icon-close"}, text: false})
						.click(function (event) {
						event.preventDefault();
						$("#translateHelp").hide();
						bg.savedData.hideTranslateMessage = true;
						bg.savedData.saveData();
					});
				});
			});
        });
    }
};
