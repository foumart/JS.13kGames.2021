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
let navDiv;

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
let i, j, k, r, x, y, interval;

// game state
let state = 0;
let system;

const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function displayLoading() {
	state = state == 11 ? 0 : state + 1;
	menuDiv.innerHTML = `<div style=margin-top:480px>${String.fromCodePoint(128336 + state)}</div>`;
}

function init() {
	window.addEventListener("resize", resize, false);
	resize();

	addStars();
	addBgrStars();

	spaceDiv.style = gameDiv.style = 'width:1920px;height:1080px';

	displayLoading();
	interval = setInterval(displayLoading, 90);

	// wait for the emoji font to load
	document.fonts.ready.then(() => {
		clearInterval(interval);
		menuDiv.innerHTML = '';
		state = 0;

		// load Menu and tutorial
		load();

		// load Terrestrial system
		//load(1, 1, 1);

		// load Venus
		//load(1, 1, 3);

		// load Earth
		//load(2, -1, 3, 350, 0.018, 0, true);

		// load mars in year 2022
		//load(1, 3, 3, 300, 0.018, 365.25);
	});
}

function load(_system = 0, _selectedPlanet = 0, _state = 0, _count = 0, _speed = 0.9, _rad = 0, _idle = false) {

	// initial setup
	system = _system;

	// create all global planets
	prepareGlobals();

	//system 0: terrestrial planets, 1: solar system, 2: earth system, 3:?, 4: jupiter system, 5: saturn system, 6: uranian system, neptune system
	prepareSystem(_system);

	//system<2:-1:?,0:Mercury,1:Venus,2:Earth,3:Mars; | system==2:-1:Earth,0:Moon,1:Sky(not used); | system==3:-1:?,0:Io,1:Europa,2:Ganimede,3:Callisto
	selectedPlanet = _selectedPlanet;// == -1 ? 2 : _selectedPlanet;
	planet = globalPlanets[selectedPlanet == -1 ? 2 : selectedPlanet];

	count = _count;
	tween.speed = _speed;
	earthRad = _rad;
	idle = _idle;

	// run the main loop where the time pass is handled
	animate();

	//state 0: Menu, 1: Terrestrial planetary system, 2: Solar system, 3: Surface accessed by Terrestrial system, 4: Surface accessed by Solar system
	switchState(_state);//3

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

function switchState(_state = 0, _back = false, _callback) {
	state = _state;
	if (!state) {
		showMеnu();
	} else if (state < 3) {
		if (!_back) selectPlanet(0);
		runSolarSystem(_back, _callback);
	} else {
		runSurface();
	}
	setUI();
}
