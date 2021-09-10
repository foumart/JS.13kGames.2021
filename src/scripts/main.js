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

let soundFX;

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
let i, j, k, r, x, y;

// game state
let state;
let system;

const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function init() {
	spaceDiv.style = gameDiv.style = 'width:1920px;height:1080px';

	window.addEventListener("resize", resize, false);
	resize();

	addStars();

	// create the global planets system
	prepareGlobals();

	//system 0: terrestrial planets, 1: solar system, 2: earth system, 3:?, 4: jupiter system, 5: saturn system, 6: uranian system, neptune system
	prepareSystem(0);

	//system<2:-1:?,0:Mercury,1:Venus,2:Earth,3:Mars; | system==2:-1:Earth,0:Moon,1:Sky(not used); | system==3:-1:?,0:Io,1:Europa,2:Ganimede,3:Callisto
	selectedPlanet = -1;//-1

	count = 300;// 0
	tween.speed = 0.018;// 0.9
	earthRad = 365.25;// 0

	//state 0: Menu, 1: Terrestrial planetary system, 2: Solar system, 3: Surface accessed by Terrestrial system, 4: Surface accessed by Solar system
	switchState(3);//3

	addListeners();
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

function clearUI(x, y, width, height = hardHeight) {
	overContext.clearRect(x || 0, y || 0, width || hardWidth, height || hardHeight);
}

function updateUI(text, x = 16, y = 60, size = 60, clear = false, color = 'ccc', font = 'Arial') {
	if (!text) clearUI(0, 0, hardWidth, hardHeight);
	if (clear) clearUI(x-1, y-size*.75, hardWidth-x, size * 1.25);
	overContext.font = size + 'px ' + font;
	overContext.fillStyle = '#' + color;
	const planet = zoomed ? sun.moons[selectedPlanet] : sun;
	overContext.fillText(text || planet.name, x, y);

	// TODO: menu/info for planets
	if (!text) {
		overContext.font = size/2 + 'px ' + font;
		overContext.fillStyle = !system ? '#777' : selectedPlanet == 2 ? '#393' : '#777';
		let description = 'Tap to zoom in';
		if (zoomed) {
			if (!planet.moons || planet.moons.length == 2) {
				description = ['Unexplored. Launch mission from Earth headquarters.','Explored','Yielded','Colonized'][planet.status];
			}
		} else if (planet.moons.length == 9) {
			// terrestrial planetary / solar system
			if (!system) description = 'Gas giants not reachable yet.';
		} else {
			description = 'Naturaly inhabited';
		}
		overContext.fillText(description, x, y+55);
		updateTimeUI();
	}
}

function updateTimeUI(posY = 0) {
	if (count > 340 || posY) {
		tween.speed = +tween.speed.toFixed(3);
		updateUI('Timeflow: ' + (paused ? 'paused' : `${1 + (0 | tween.speed * 55.5)} day/sec`), 12, 955 + posY, 36, 1);
	}
}

function updateYearUI(posY = 0) {
	updateUI(`Year: ${0|year}`, 9, 900 + posY, 48, 1);
	updateUI(month < 10 ? '/ 0' + month : '/ ' + month, 250, 900 + posY, 36, 1);
}

function setUI() {
	spaceCanvas.style.display = spaceDiv.style.display = state && state < 3 ? 'block' : 'none';
	gameCanvas.style.display = bgrCanvas.style.display = state < 3 ? 'none' : 'block';
	gameDiv.style = 'width:1920px;height:1080px;' + (!state ? 'filter:blur(9px) hue-rotate(-40deg)' : state < 3 ? 'margin-top:975px' : '');
	frameDiv.style = state && state < 3 ? 'display:none' : `width:${!state ? hardWidth : frameWidth}px;height:${!state ? hardHeight : surfaceHeight}px;`;
	uiDiv.style = state ? 'filter:hue-rotate(180deg) saturate(0.5);float:right'
						: 'opacity:0.4;font-size:125px;transform:scale(15.7,12) translateX(898px) translateY(-48px)';
	uiDiv.innerHTML = state ? state > 2 ? '<nav>&#x1FA90;</nav>' : '<nav>&#x23EA;</nav><nav>&#x23F8;</nav><nav>&#x23E9;</nav>' : '&#x1F30C;';
}

function switchState(_state = 0, _back = false) {
	state = _state;
	if (!state) {
		showMеnu();
	} else if (state < 3) {
		runSolarSystem(_back);
	} else {
		runSurface();
	}
	setUI();
}

function showMеnu() {
	updateUI("JS13KGames", 575, 420, 128, 'fff');
	updateUI("Start Game", 772, 592, 75, 'fff');
}

// mouse / touch interaction
let interactionDistance = -1;

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
		if (state < 2) {
			onWheel(e);
		}
	};

	// UI button events
	uiDiv.onmousedown = e => {
		soundFX = new SoundFX();
		soundFX.init();

		if (state > 2) {
			// get back from surface mode
			switchState(1, true);
		} else if (!state) {
			switchState(1);// TODO: fetch game progress
		} else {
			// system speed control
			if (e.target.tagName == 'NAV') {
				const btn = e.target.innerHTML.codePointAt(0) % 6;
				if (!btn) {
					unpause(e.target);
				} else if (btn == 1) {
					increaseSpeed();
				} else if (btn == 2) {
					decreaseSpeed();
				} else {
					pause(e.target);
				}
			}
		}
	}
}

function removeInteractions() {
	Array.from(spaceDiv.children).forEach(div => div.style.pointerEvents = 'none');
	structures.forEach(structure => {
		if (structure[4]) structure[4] = false;
		activeStructure = 0;
		menuDiv.innerHTML = '';
	})
}

function touchStartHandler(event) {
	if (frame.speed) {
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
			// minimap frame drag
			if ((event.clientX - offsetX) / scale < frameOffsetX || (event.clientX - offsetX) / scale > frameOffsetX + frameWidth) {
				playerX = -((event.clientX - offsetX) / scale / hardWidth) * stageWidth + stageWidth / planetWidth / 2;
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
	removeInteractions();
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
				if (zoomed && selectedPlanet < (!system ? 3 : sun.moons.length - 2)) {
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
						if (structures[i][0] > 9 && structures[i][0] < 13) {
							const tapX = (stageWidth - playerX + (event.clientX - offsetX) / scale) / 100 + 1;
							const objX = structures[i][1] / 5;
							if (tapX > objX && tapX < objX + 4 && (event.clientY - offsetY) / scale > 700) {
								// interact with an object on the surface
								if (activeStructure) {
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
