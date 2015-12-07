function getMap() {
	var checkExist = setInterval(function() {
		map = findMap(gGeowikiApplication.D);
		if (map !=  null) {
			clearInterval(checkExist);

			window.postMessage({action: 'mapFound'}, '*');
		}
	}, 300);
}

getMap();
window.addEventListener("message", function (e) {
    if (e.data.action === 'startAddressAdding') {
		var checkReady = setInterval(function() {
			if ([null, "false"].indexOf(document.getElementById('kd-add-toolbar-menubutton').getAttribute('aria-disabled')) != -1) {
				clearInterval(checkReady);
				document.getElementById('kd-add-poi').dispatchEvent(new MouseEvent("mousedown", {bubbles: true,  cancelable: true,  view: window}));
				document.getElementById('kd-add-poi').dispatchEvent(new MouseEvent("mouseup", {bubbles: true,  cancelable: true,  view: window}));
				var checkCateogry = setInterval(function() {
					if (document.getElementById('kd-toolbar').style.display == "" && [null, "false"].indexOf(document.getElementById('kd-add-toolbar-menubutton').getAttribute('aria-disabled')) != -1) {
						clearInterval(checkCateogry);
						window.postMessage({action: 'abortedAddress'}, '*');
						return;
					}
					if (document.getElementById('kd-toolbar-floater').style.display == "") {
						clearInterval(checkCateogry);
						document.getElementById('kd-category-selection-input').value = 'Address\n';
						document.getElementById('kd-category-selection-input').blur();
						var checkEnabled = setInterval(function() {
							if (document.getElementById('kd-select-category-button').getAttribute('aria-disabled') == "false") {
								clearInterval(checkEnabled);
								document.getElementById('kd-select-category-button').dispatchEvent(new MouseEvent("mousedown", {bubbles: true,  cancelable: true,  view: window}));
								document.getElementById('kd-select-category-button').dispatchEvent(new MouseEvent("mouseup", {bubbles: true,  cancelable: true,  view: window}));
								var checkForm = setInterval(function() {
									if (document.getElementById('gw-panelinfo-edit').style.display == "") {
										clearInterval(checkForm);
										var elements = document.getElementsByClassName('cell cols2 gw-edit-binding gw-tip-target');
										for (var i = elements.length - 1; i >= 0; --i) {
											if (elements[i].getAttribute("data-field-id") == "address_street_number") {
												elements[i].querySelector("input").value = e.data.streetNum;
											}
										}
										elements = document.getElementsByClassName('goog-menu goog-menu-vertical');
										var streetNameElement = null;
										for (var i = elements.length - 1; i >= 0; --i) {
											var subElements = elements[i].getElementsByClassName('goog-menuitem-content');
											for (var j = subElements.length - 1; j >= 0; --j) {
												if (subElements[j].innerText == e.data.streetName) {
													streetNameElement = subElements[j].parentNode;
													break;
												}
											}
											if (streetNameElement != null) {
												break;
											}
										}

										if (streetNameElement == null) {
											alert("Could not find street with name: " + e.data.streetName + ". Aborting auto-add.");
											window.postMessage({action: 'abortedAddress'}, '*');
											return;
										}

										streetNameElement.dispatchEvent(new MouseEvent("mousedown", {bubbles: true,  cancelable: true,  view: window}))
										streetNameElement.dispatchEvent(new MouseEvent("mouseup", {bubbles: true,  cancelable: true,  view: window}))

										elements = document.getElementsByClassName('goog-menu goog-menu-vertical');
										var cityElement = null;
										for (var i = elements.length - 1; i >= 0; --i) {
											var subElements = elements[i].getElementsByClassName('goog-menuitem-content');
											for (var j = subElements.length - 1; j >= 0; --j) {
												if (subElements[j].innerText == e.data.city) {
													cityElement = subElements[j].parentNode;
													break;
												}
											}
											if (cityElement != null) {
												break;
											}
										}
										cityElement.dispatchEvent(new MouseEvent("mousedown", {bubbles: true,  cancelable: true,  view: window}))
										cityElement.dispatchEvent(new MouseEvent("mouseup", {bubbles: true,  cancelable: true,  view: window}))

										document.getElementById('gw-saveedit').click();
										var checkSaved = setInterval(function() {
											if (document.getElementById('opanel5').style.display == "") {
												clearInterval(checkSaved);
												document.getElementById('dbutton').click();
												window.postMessage({action: 'createdAddress'}, '*');
											}
										}, 100);
									}
								}, 100);
							}
						}, 100);
					}
				}, 100);
			}
		}, 100);
    }
});