const game = document.getElementById("game");
const bgrCanvas = document.getElementById("bgrCanvas");
const spaceCanvas = document.getElementById("spaceCanvas");
const gameCanvas = document.getElementById("gameCanvas");
const overCanvas = document.getElementById("overCanvas");
const spaceDiv = document.getElementById("spaceDiv");
const gameDiv = document.getElementById("gameDiv");

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

// 0:menu, 1:planetary system view, 2:planet surface view
let state = 0;

// 0:terrestrial planets, 1: solar system, 2: earth system, 3: jupiter system, 4: saturn system, etc.
let system = 0;

const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function init() {
	spaceDiv.style = gameDiv.style = 'width:1920px;height:1080px';

	window.addEventListener("resize", resize, false);
	resize();

	addStars();

	prepareSystem();//

	switchState(1);//

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
		//showMenu();
	} else if (state == 1) {
		runSolarSystem();
	} else {
		runSurface();
	}
}

//function showMеnu() {
	//
//}

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
	if (mobile) {
		game.ontouchmove = touchMoveHandler;
		game.ontouchend = game.ontouchcancel = touchEndHandler;
	} else {
		game.onmousemove = touchMoveHandler;
		game.onmouseup = game.onmouseleave = game.onmouseout = touchEndHandler;
	}
}

function touchMoveHandler(event) {
	removeInteractions();
	if (mobile) {
		event.clientX = event.targetTouches[0].clientX;
	}
	if (touchInteraction(event)) interactionDistance = event.clientX;
}

function touchInteraction(event) {
	if (interactionDistance > -1) {
		if (event.clientX < interactionDistance) {
			if (state == 1) {console.log('-', selectedPlanet)
				// solar system view
				if (zoomed && selectedPlanet > 0) {
					tweenToPlanet(selectedPlanet - 1);
					return;
				} else if (idle) {
					onWheel({deltaY: -10});
				}
			} else {
				// planet surface view
				tween.speed = event.clientX - interactionDistance;
			}
		} else if(event.clientX > interactionDistance) {
			if (state == 1) {console.log('+', selectedPlanet)
				// solar system view
				if (zoomed && selectedPlanet < (system == 1 ? sun.moons.length - 2 : 3)) {
					tweenToPlanet(selectedPlanet + 1);
					return;
				} else if (idle) {
					onWheel({deltaY: 10});
				}
			} else {
				// planet surface view
				tween.speed = event.clientX - interactionDistance;
			}
		}
	} else {
		tween.speed = 0;
	}
	return true;
}

function touchEndHandler(event) {
	touchInteraction(event);
	if (state == 2) {
		let tweenSpeed = Math.abs(tween.speed * scale);
		if (tweenSpeed > 10) {
			if (tweenSpeed > 60) {
				tweenSpeed = 60;
			}
			TweenFX.to(tween, tweenSpeed, {speed: 0});
		} else {
			tween.speed = 0;
		}
	}
	Array.from(spaceDiv.children).forEach(div => div.style.pointerEvents = 'auto');
	game.ontouchmove = null;
	game.onmousemove = null;
	game.onmouseup = game.onmouseleave = game.onmouseout = null;

	interactionDistance = -1;
}
