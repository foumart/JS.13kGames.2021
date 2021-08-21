// web monetization functionality
let _monetization;

function checkMonetization() {
	if (document.monetization) {
		if (document.monetization.state == "started") {
			updateMonetization();
		} else {
			document.monetization.addEventListener("monetizationstart", () => {
				if (!_monetization) {
					updateMonetization();
				}
			});
		}
	}
}

function updateMonetization() {
	_monetization = true;
	//...
}


// fullscreen functionality
/*document.addEventListener("fullscreenchange", updateFullscreen);

function updateFullscreen() {
	//document.fullscreenElement;
	//...
}*/

// toggle fullscreen mode
/*function toggleFullscreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
		//window.document.dispatchEvent("fullscreen", _loadEvent, false);
	} else if (document.exitFullscreen) {
		document.exitFullscreen();
	}
}*/


// loader
function init() {
	checkMonetization();
	//toggleFullscreen();
}
