// Progressive Web App service worker initialization script - feel free to remove if you are not going to build a PWA.

// Set debug to true if you want to see logs about caching / fetching of resources and other output.
let _debug;

// Service worker detection and installation script:
if ("serviceWorker" in navigator && location.protocol.substring(0, 5) === "https") {
	navigator.serviceWorker.getRegistrations().then(registrations => {
		let isRegistered;
		for (let i = 0; i < registrations.length; i++) {
			if (window.location.href.indexOf(registrations[i].scope) > -1) isRegistered = true;
		}
		if (isRegistered) {
			if (_debug) console.log("ServiceWorker already registered");
		} else {
			navigator.serviceWorker.register("service_worker.js").then(() => {
				if (_debug) console.log("ServiceWorker registered successfully");
			}).catch(() => {
				if (_debug) console.log("ServiceWorker registration failed");
				init();
			});
		}
	}).catch(() => {
		if (_debug) console.log("ServiceWorker bypassed locally");
		init();
	});
	navigator.serviceWorker.ready.then(() => {
		if (_debug) console.log('ServiceWorker is now active');
		init();
	});
} else {
	if (_debug) {
		if (location.protocol.substring(0, 5) != "https") {
			console.log("ServiceWorker is disabled on localhost");
		} else {
			console.log("ServiceWorker not found in navigator");
		}
	}

	window.addEventListener("load", init);
}
