const game = document.getElementById("game");
const bgrCanvas = document.getElementById("bgrCanvas");
const spaceCanvas = document.getElementById("spaceCanvas");
const gameCanvas = document.getElementById("gameCanvas");
const overCanvas = document.getElementById("overCanvas");
const spaceDiv = document.getElementById("spaceDiv");
const gameDiv = document.getElementById("gameDiv");
const frameDiv = document.getElementById("frameDiv");

let frame = {
	speed: 0,
	killed: false
}
let frameDragging;
let frameX;
let framePlayerX;

window.addEventListener("load", init);

const bgrContext = bgrCanvas.getContext("2d");
const spaceContext = spaceCanvas.getContext("2d");
const gameContext = gameCanvas.getContext("2d");
const overContext = overCanvas.getContext("2d");

const hardWidth = 1920;
const hardHeight = 1080;
let width;
let height;
let scale;
let offsetY;

// 0:menu, 1:planetary system view, 2:planet surface view
let state = 0;

// 0:terrestrial planets, 1: solar system, 2: earth system, 3: jupiter system, 4: saturn system, etc.
let system = 0;

const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function init() {
	spaceDiv.style = gameDiv.style = 'width:1920px;height:1080px';
	frameDiv.style = 'width:1920px;height:99px;cursor:pointer';

	window.addEventListener("resize", resize, false);
	resize();

	addStars();

	prepareSystem(1);//

	selectedPlanet = 0;//system<2:-1:?,0:Mercury,1:Venus,2:Earth,3:Mars; | system==2:-1:Earth,0:Moon,1:Sky(not used); | system==3:-1:?,0:Io,1:Europa,2:Ganimede,3:Callisto

	switchState(0);//state 0: Game Menu, 1: Solar / Planetary / Moon system, 2: Planet / Moon surface

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
	offsetY = gameCanvas.getBoundingClientRect().top;
}

function getScale(h, w){
	h = (height / hardHeight);
	w = (width / hardWidth)
	return h < w ? h : w;
}

function switchState(_state = 0) {
	state = _state;
	spaceCanvas.style.display = spaceDiv.style.display = state == 1 ? 'block' : 'none';
	gameCanvas.style.display = gameDiv.style.display = state == 1 ? 'none' : 'block';
	if (!state) {
		showMеnu();
	} else if (state == 1) {
		runSolarSystem();
		initialZoom();
	} else {
		runSurface();
	}
}

function showMеnu() {
	updateUI("Rock'n Scroll", 665, 360, 92);
	updateUI("Start Game", 810, 550);
	gameDiv.onclick = () => {
		gameDiv.onclick = null;
		switchState(1);
	}
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
		game.onmouseup = game.onmouseleave = game.onmouseout = touchEndHandler;
	}
	interactionDistance = -2;
	if ((event.clientY - offsetY) / scale < 100) {
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
			if (state == 1) {
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
			if (state == 1) {
				// solar system view
				if (zoomed && selectedPlanet < (system == 1 ? sun.moons.length - 2 : 3)) {
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
		playerX = (framePlayerX + ((frameX - clientX) / scale / hardWidth) * stageWidth) % stageWidth;
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
		if (state == 2) {
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
	game.onmouseup = game.onmouseleave = game.onmouseout = null;
}
