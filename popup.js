var background = null;

document.onreadystatechange = function (e) {
    if (document.readyState === 'complete') {
        chrome.runtime.getBackgroundPage(function (bg) {
            background = bg;
            if (bg.overlayData == null) {
                bg.overlayData = new bg.OverlayData();
            }
            bg.overlayData.loadData(function () {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    $(function () {
						$("#loading").hide();
						$("#container").show();
						$("#addressStreetNum").val(bg.currentStreetNum);
						$("#addressStreetName").val(bg.currentStreetName);
						$("#addressTownCity").val(bg.currentCity);
						$("#incBy").val(bg.currentIncBy);
						$('#autoInc').prop('checked', bg.currentAutoInc);
						$("#incBy").selectmenu();
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

						window.addEventListener('unload', function () {
							bg.overlayData.saveData();
						});
                    });
                });
            });
        });
    }
};

chrome.runtime.onMessage.addListener(

function (request, sender, sendResponse) {
    if (request.action === 'displayKmlStatusMessage') {
        if (request.status == 'OK') {
            $('label[for="kmlError"]').css('display', 'none');
        } else {
            var engMessage;
            switch (request.status) {
                case 'DOCUMENT_NOT_FOUND':
                    engMessage = 'The document could not be found. Most likely it is an invalid URL, or the document is not publicly available.';
                    break;
                case 'DOCUMENT_TOO_LARGE':
                    engMessage = 'The document exceeds the file size limits of KmlLayer.';
                    break;
                case 'FETCH_ERROR':
                    engMessage = 'The document could not be fetched.';
                    break;
                case 'INVALID_DOCUMENT':
                    engMessage = 'The document is not a valid KML, KMZ or GeoRSS document.';
                    break;
                case 'INVALID_REQUEST':
                    engMessage = 'The KmlLayer is invalid.';
                    break;
                case 'LIMITS_EXCEEDED':
                    engMessage = 'The document exceeds the feature limits of KmlLayer.';
                    break;
                case 'TIMED_OUT':
                    engMessage = 'The document could not be loaded within a reasonable amount of time.';
                    break;
                case 'UNKNOWN':
                    engMessage = 'The document failed to load for an unknown reason.';
                    break;
            }
            $('label[for="kmlError"]').text(engMessage);
            $('label[for="kmlError"]').css('display', 'block');
        }
    } else if (request.action === 'sendSaveInfo') {
		if (!background.overlayData.hasSavedImageName(request.saveAs)) {
			$('#images-saved').append(new Option(request.saveAs));
		}
        background.overlayData.addSavedImage({
            name: request.saveAs,
            neLat: request.neLat,
            neLng: request.neLng,
            swLat: request.swLat,
            swLng: request.swLng,
            imageUrl: request.imageUrl,
            opacity: request.opacity,
            rotation: request.rotation
        });
    }
});