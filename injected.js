function findMapAddressHelper(F) {
	for (func in F) {
		if (func.length == 3 && typeof F[func] == "function") {
			parent = F[func]();
			if (parent != null)	{
				props = Object.getOwnPropertyNames(parent);
				for (i = 0; i <= props.length - 1; i++) {
					subProps = Object.getOwnPropertyNames(parent[props[i]]);
					for (j = 0; j <= subProps.length - 1; j++) {
						if (parent[props[i]][subProps[j]] instanceof google.maps.Map) {
							return parent[props[i]][subProps[j]]
						}
					}
				}
			}
		}
	}
}

var mapForAddressHelper = null;

function getMapAddressHelper() {
	var checkExist = setInterval(function() {
		mapForAddressHelper = findMapAddressHelper(gGeowikiApplication.D);
		if (mapForAddressHelper !=  null) {
			clearInterval(checkExist);

			window.postMessage({action: 'showPageAction'}, '*');
		}
	}, 300);
}

getMapAddressHelper();

var currentPos = null;
window.addEventListener("message", function (e) {
    if (e.data.action === 'startAddressAdding') {
		posSet = false;
		if (e.data.firstTime) {
			currentPos = null;
		}
		var checkReady = setInterval(function() {
			if ((currentPos != null) && (!posSet)) {
				console.log("Setting Center");
				mapForAddressHelper.setCenter(currentPos);
				posSet = true;
			}
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
					currentPos = mapForAddressHelper.getCenter();
					if (document.getElementById('kd-toolbar-floater').style.display == "") {
						clearInterval(checkCateogry);
						document.getElementById('kd-category-selection-input').value = e.data.addressValue + '\n';
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
												if (subElements[j].innerText.toUpperCase() === e.data.streetName.toUpperCase()) {
													streetNameElement = subElements[j].parentNode;
													break;
												}
											}
											if (streetNameElement != null) {
												break;
											}
										}

										if (streetNameElement == null) {
											window.postMessage({action: 'abortedAddress', invalidStreetName: true}, '*');
											return;
										}

										streetNameElement.dispatchEvent(new MouseEvent("mousedown", {bubbles: true,  cancelable: true,  view: window}))
										streetNameElement.dispatchEvent(new MouseEvent("mouseup", {bubbles: true,  cancelable: true,  view: window}))

										if (e.data.city !== "") {
											elements = document.getElementsByClassName('goog-menu goog-menu-vertical');
											var cityElement = null;
											for (var i = elements.length - 1; i >= 0; --i) {
												var subElements = elements[i].getElementsByClassName('goog-menuitem-content');
												for (var j = subElements.length - 1; j >= 0; --j) {
													if (subElements[j].innerText.toUpperCase() === e.data.city.toUpperCase()) {
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
										}

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
				}, 500);
			}
		}, 100);
    }
});