const game = document.getElementById("main");
const bgrCanvas = document.getElementById("bgrCanvas");
const spaceCanvas = document.getElementById("spaceCanvas");
const gameCanvas = document.getElementById("gameCanvas");
const overCanvas = document.getElementById("overCanvas");
const spaceDiv = document.getElementById("spaceDiv");
const gameDiv = document.getElementById("gameDiv");
const frameDiv = document.getElementById("frameDiv");
const uiDiv = document.getElementById("uiDiv");
const menuDiv = document.getElementById("menuDiv");
const resDiv = document.getElementById("resDiv");

window.addEventListener("load", init);

const bgrContext = bgrCanvas.getContext("2d");
const spaceContext = spaceCanvas.getContext("2d");
const gameContext = gameCanvas.getContext("2d");
const overContext = overCanvas.getContext("2d");

//let soundFX;

// global sizes
const hardWidth = 1920;
const hardHeight = 1080;
let width;
let height;
let scale;
let offsetX;
let offsetY;

// mouse/touch interaction vars
let frameDragging;
let frameX;
let framePlayerX;
// surface scroll movement
let frame = {
	speed: 0,
	killed: false
}

// generic vars used for loops
let i, j, k, x, y, r = 0;

// which one of the global planet systems is active
let system;
// menu, solar system, planetary system, surface mode
let state;

const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function displayLoading() {
	r = r == 11 ? 0 : r + 1;
	menuDiv.innerHTML = `<div style=margin-top:480px>${String.fromCodePoint(128336 + r)}</div>`;
}

function init() {
	window.addEventListener("resize", resize, false);
	resize();

	addStars();
	addBgrStars();

	spaceDiv.style = gameDiv.style = 'width:1920px;height:1080px';

	displayLoading();
	i = setInterval(displayLoading, 90);

	// wait for the emoji font to load
	document.fonts.ready.then(() => {
		clearInterval(i);
		menuDiv.innerHTML = '';

		// load Menu and tutorial
		start();

		//start(2, 1, 2);

		// load Terrestrial system
		

		// load Solar system
		//load(1, 0, 2);// tutorial

		// load Earth
		//start(3, 2, -1, 350, 0.018);

		// load mars in year 2022
		//load(1, 3, 3, 300, 0.018, 365.25);
	});
}

function resize(e) {
	width = window.innerWidth;
	height = window.innerHeight;
	scale = getScale();
	game.style.transform = `scale(${scale})`;
	game.style.width = hardWidth + 'px';
	game.style.height = hardHeight + 'px';
	game.style.top = `${(height - hardHeight) / 2}px`;
	game.style.left = `${(width - hardWidth) / 2}px`;
	e = overCanvas.getBoundingClientRect();
	offsetX = e.left;
	offsetY = e.top;
}

function getScale(h, w){
	h = (height / hardHeight);
	w = (width / hardWidth)
	return h < w ? h : w;
}

function getRGBA(red, green, blue, alpha) {
	return `rgba(${red*16},${green*16},${blue*16},${alpha})`;
}

// mouse / touch interaction
let interactionDistance = -1;

function getClientX(e) {
	return (e.clientX - offsetX) / scale;
}
function getClientY(e) {
	return (e.clientY - offsetY) / scale;
}

function addListeners() {
	if (mobile) {
		// mobile events
		game.ontouchstart = touchStartHandler;
	} else {
		// desktop events
		game.onmousedown = touchStartHandler;
	}

	// mouse wheel event
	game.onwheel = e => {
		if (state < 3 && idle) {
			onWheel(e);
		}
	};

	// UI button events
	uiDiv.onmousedown = e => {
		//soundFX = new SoundFX();
		//soundFX.init();

		if (!state) {
			if (getClientX(e) > 800 && getClientY(e) > 800 && getClientX(e) < 1100 && getClientY(e) < 880) {
				playTutorial = !playTutorial;
				clearUI();
				showMеnu();
			} else {
				switchState(1, 1);// TODO: fetch game progress
			}
		} else {
			if (state > 2) {
				if (e.target == uiDiv) {
					if (activeStructure && getClientX(e) > 750 && getClientX(e) < 1170 && getClientY(e) > 700) {
						// deselect
						activeStructure = -1;
					}
				} else if (e.target.id == 'base') {
					// center surface
					removeInteractions();
					interactSurface(structures.indexOf(buildings[0]));
				} else if (e.target.id == 'sys') {
					// get back from surface mode
					removeInteractions();
					switchState(2, system, true);//buildings[8][4] ? 2 : 1, true
				}
			}
			// system speed control
			if (e.target.id.substr(0,3) == 'nav') {
				const btn = e.target.innerHTML.codePointAt(0) % 6;
				removeInteractions();
				if (!btn) {
					unpause(true, true);
				} else if (btn == 1) {
					increaseSpeed();
				} else if (btn == 2) {
					decreaseSpeed();
				} else {
					pause(true, true);
				}
			}
		}
	}

	// html inlined event dispatches from the structure menues
	document.addEventListener("head", _head);
	document.addEventListener("misn", _misn);
	document.addEventListener("menu", _menu);
	document.addEventListener("deal", _deal);
	document.addEventListener("clos", _close);
}

function removeInteractions() {
	if (paused) unpause();//!userPaused
	Array.from(spaceDiv.children).forEach(div => div.style.pointerEvents = 'none');
	if (structures) structures.forEach(structure => {
		if (structure[4] == 3) structure[4] = 1;
		activeStructure = 0;
		menuDiv.innerHTML = '';
		menuDiv.style = '';
	})
}

function touchStartHandler(event) {
	const lst = menuDiv.children[1];
	if (tutorial || event.target == lst || lst && lst.contains(event.target)) return;
	if (frame.speed && !activeStructure) {
		frame.killed = true;
		frame.speed = 0;
	}
	if (mobile) {
		assignClient(event);
		game.ontouchmove = touchMoveHandler;
		game.ontouchend = game.ontouchcancel = touchEndHandler;
	} else {
		game.onmousemove = touchMoveHandler;
		game.onmouseup = game.onmouseleave = touchEndHandler;
	}
	interactionDistance = -2;

	if (state > 2) {
		if ((event.clientY - offsetY) / scale < surfaceHeight) {
			removeInteractions();
			// minimap frame drag
			if (getClientX(event) < frameOffsetX || getClientX(event) > frameOffsetX + frameWidth) {
				playerX = -(getClientX(event) / hardWidth) * stageWidth + stageWidth / planetWidth / 2;
			}

			frameDragging = true;
			frameX = event.clientX;
			framePlayerX = playerX;
		}
	}
}

function assignClient(event) {
	event.clientX = event.changedTouches[0].clientX;
	event.clientY = event.changedTouches[0].clientY;
}

function touchMoveHandler(event) {
	if (state > 2 && interactionDistance > -1) removeInteractions();
	if (mobile) {
		assignClient(event);
	}
	if (touchInteraction(event)) interactionDistance = event.clientX;
}

function touchInteraction(event) {
	if (interactionDistance > -1) {
		if (event.clientX < interactionDistance) {
			if (state < 3) {
				// solar system view
				if (zoomed && selectedPlanet > 0) {
					tweenToPlanet(selectedPlanet - 1);
					return;
				} else if (idle) {
					onWheel({deltaY: -100});
				}
			} else {
				// planet surface view
				moveSurfaceFrame(event.clientX);
			}
		} else if (event.clientX > interactionDistance) {
			if (state < 3) {
				// solar system view
				if (zoomed && selectedPlanet < planets.length-2) {//(zoomed)
					tweenToPlanet(selectedPlanet + 1);
					return;
				} else if (idle) {
					onWheel({deltaY: 100});
				}
			} else {
				// planet surface view
				moveSurfaceFrame(event.clientX);
			}
		}
	}
	return true;
}

function moveSurfaceFrame(clientX) {
	if (frameDragging) {
		clientX = (framePlayerX + ((frameX - clientX) / scale / hardWidth) * stageWidth);
		playerX = clientX % stageWidth;
		bgrX = clientX / 2 % hardWidth;
	} else {
		frame.speed = (clientX - interactionDistance) / scale;
	}
}

function touchEndHandler(event) {
	if (mobile) {
		assignClient(event);
	}

	if (interactionDistance == -2) {
		frame.killed = true;
		frame.speed = 0;
	}

	if (!frameDragging) {
		touchInteraction(event);
		if (state > 2) {
			const frameSpeed = Math.abs(frame.speed / scale);
			if (frameSpeed > 10) {
				TweenFX.to(frame, frameSpeed > 60 ? 60 : frameSpeed, {speed: 0});
			} else {
				if (!frame.speed) {
					// interaction has ended with no drag, so checking for clicked map elements
					for (let i = 0; i < structures.length; i++) {
						if (structures[i][0] > 9 && structures[i][0] < 20) {
							const tapX = (stageWidth - playerX + getClientX(event)) / 100 + 1;
							const objX = structures[i][1] / 5;
							if (tapX > objX && tapX < objX + 4 && getClientY(event) > 700) {
								// interact with an object on the surface
								if (activeStructure == -1) {
									removeInteractions();
								} else {
									interactSurface(i);
								}
							}
						}
					}
				} else {
					frame.killed = true;
					frame.speed = 0;
				}
			}
		}
	}

	frameDragging = false;
	interactionDistance = -1;
	Array.from(spaceDiv.children).forEach(div => div.style.pointerEvents = 'auto');
	game.ontouchmove = null;
	game.onmousemove = null;
	game.onmouseup = game.onmouseleave = null;
}
