const game = document.getElementById("game");
const bgrCanvas = document.getElementById("bgrCanvas");
const spaceCanvas = document.getElementById("spaceCanvas");
const gameCanvas = document.getElementById("gameCanvas");
const overCanvas = document.getElementById("overCanvas");
const spaceDiv = document.getElementById("spaceDiv");
const gameDiv = document.getElementById("gameDiv");
const frameDiv = document.getElementById("frameDiv");
const uiDiv = document.getElementById("uiDiv");

window.addEventListener("load", init);

const bgrContext = bgrCanvas.getContext("2d");
const spaceContext = spaceCanvas.getContext("2d");
const gameContext = gameCanvas.getContext("2d");
const overContext = overCanvas.getContext("2d");

// global sizes
const hardWidth = 1920;
const hardHeight = 1080;
let width;
let height;
let scale;
let offsetY;

// mouse/touch interaction vars
let frame = {
	speed: 0,
	killed: false
}
let frameDragging;
let frameX;
let framePlayerX;

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

	//state 0: Menu, 1: Terrestrial planetary system, 2: Solar system, 3: Surface accessed by Terrestrial system, 4: Surface accessed by Solar system
	switchState(3);//3

	addListeners();
}

function resize(e) {
	width = document.documentElement["clientWidth"];
	height = document.documentElement["clientHeight"];
	scale = getScale();
	game.style.transform = `scale(${height / width > hardHeight / hardWidth ? width / hardWidth : scale})`;
	game.style.width = hardWidth + 'px';
	game.style.height = hardHeight + 'px';
	game.style.top = `${(height - hardHeight) / 2}px`;
	game.style.left = `${(width - hardWidth) / 2}px`;
	offsetY = overCanvas.getBoundingClientRect().top;
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
	if (clear || !text) clearUI(x-1, y-size*.75, hardWidth-x, size * 1.25);
	overContext.font = size + 'px ' + font;
	overContext.fillStyle = '#' + color;
	overContext.fillText(text || (zoomed ? sun.moons[selectedPlanet].name : sun.name), x, y);
	if (!text) {

	}
}

function updateTimeUI(posY = 0) {
	tween.speed = +tween.speed.toFixed(3);
	updateUI('Timeflow: ' + (paused ? 'paused' : `${1 + (0 | tween.speed * 55.5)} day/s`), 12, 955 + posY, 36, 1);//(system > 1 ? 5.55 : 55.5)
}

function updateYearUI(posY = 0) {
	updateUI(`Year: ${0|year}`, 9, 900 + posY, 48, 1);
	updateUI(month < 10 ? '/ 0' + month : '/ ' + month, 250, 900 + posY, 36, 1);
}

function setUI() {
	spaceCanvas.style.display = spaceDiv.style.display = state && state < 3 ? 'block' : 'none';
	gameCanvas.style.display = bgrCanvas.style.display = state < 3 ? 'none' : 'block';
	gameDiv.style = 'width:1920px;height:1080px;' + (!state ? 'filter:blur(9px) hue-rotate(-40deg)' : state < 3 ? 'margin-top:975px' : '');
	frameDiv.style = !state || state > 2 ? `width:${!state ? hardWidth : frameWidth}px;height:${!state ? hardHeight : surfaceHeight}px;` : 'display:none';
	uiDiv.style = state ? state > 2 ? `filter:hue-rotate(180deg) saturate(0.2);float:right;` : 'display:none'
						: 'opacity:0.4;font-size:125px;transform:scale(15.7,12) translateX(898px) translateY(-48px)';
	uiDiv.innerHTML = state ? state > 2 ? '<nav>&#x1FA90;&nbsp;</nav>' : '<nav>&#x23EA;</nav><nav>&#x23F8;</nav><nav>&#x23E9;</nav>' : '&#x1F30C;';
}

function switchState(_state = 0) {
	state = _state;
	if (!state) {
		showMеnu();
	} else if (state < 3) {
		runSolarSystem();
		if (tween.scale == 0.1) {
			// solar system game intro zoom
			initialZoom();
		} else {
			// get back from surface view with a slight zoom-out
			idle = false;
			TweenFX.to(tween, 20, {scale: previousScale, alpha: 1, offset: previousOffset}, 0, () => idle = true);
		}
	} else {
		runSurface();
	}
	setUI();
}

function showMеnu() {
	//frameDiv.innerHTML="🌎🌍🌏🌐🪐 ☿️ ♀️ ♁ ♂️ ♃ ♄ ♅ ♆"
	/*updateUI("☿️    ♁    ♃ ♄ ♅ ♆", 605, 90, 92);
	for (i = 0; i < 5; i ++) {
		updateUI("♀️    ♂️", 678 + i, 88 + i % 3, 80);
	}*/

	updateUI("JS13KGames Space", 575, 420, 128, 'fff');
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
		if (state > 2) {
			switchState(1);//
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
		game.onmouseup = game.onmouseleave = touchEndHandler;// game.onmouseout
	}
	interactionDistance = -2;

	if ((event.clientY - offsetY) / scale < surfaceHeight) {
		if (event.clientX / scale < frameOffsetX || event.clientX / scale > frameOffsetX + frameWidth) {
			playerX = -(event.clientX / scale / hardWidth) * stageWidth + stageWidth / planetWidth / 2;
		}
		frameDragging = true;
		frameX = event.clientX;
		framePlayerX = playerX;
	}
}

function assignClient(event) {
	event.clientX = event.targetTouches[0].clientX;
	event.clientY = event.targetTouches[0].clientY;
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
	if (interactionDistance == -2) {
		frame.killed = true;
		frame.speed = 0;
	}
	if (!frameDragging) {
		touchInteraction(event);
		if (state > 2) {
			let frameSpeed = Math.abs(frame.speed / scale);
			if (frameSpeed > 10) {
				if (frameSpeed > 60) {
					frameSpeed = 60;
				}
				TweenFX.to(frame, frameSpeed, {speed: 0});
			} else {
				frame.killed = true;
				frame.speed = 0;
			}
		}
	}
	frameDragging = false;
	interactionDistance = -1;
	Array.from(spaceDiv.children).forEach(div => div.style.pointerEvents = 'auto');
	game.ontouchmove = null;
	game.onmousemove = null;
	game.onmouseup = game.onmouseleave = null;//game.onmouseout
}
