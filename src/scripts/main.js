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
let i, j, k, r, x, y;

// game state
let state = 0;
let system;

const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function init() {
	// load Menu and tutorial
	load();

	// load Terrestrial system
	//load(1, 1, 1);

	// load Earth
	//load(2, -1, 3, 350, 0.018);

	// load mars in year 2022
	//load(1, 3, 3, 300, 0.018, 365.25);
}

function load(_system = 0, _selectedPlanet = 0, _state = 0, _count = 0, _speed = 0.9, _rad = 0) {
	spaceDiv.style = gameDiv.style = 'width:1920px;height:1080px';

	window.addEventListener("resize", resize, false);
	resize();

	addStars();

	// initial setup
	system = _system;

	// create all global planets
	prepareGlobals();

	//system 0: terrestrial planets, 1: solar system, 2: earth system, 3:?, 4: jupiter system, 5: saturn system, 6: uranian system, neptune system
	prepareSystem(_system);

	//system<2:-1:?,0:Mercury,1:Venus,2:Earth,3:Mars; | system==2:-1:Earth,0:Moon,1:Sky(not used); | system==3:-1:?,0:Io,1:Europa,2:Ganimede,3:Callisto
	selectedPlanet = _selectedPlanet;

	count = _count;
	tween.speed = _speed;
	earthRad = _rad;

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

function clearUI(x, y, width, height = hardHeight) {
	overContext.clearRect(x || 0, y || 0, width || hardWidth, height || hardHeight);
}

function updateUI(text, x = 16, y = 64, size = 70, clear, bold) {
	if (!text) clearUI(0, 0, hardWidth, hardHeight);
	if (clear) clearUI(x-5, y-size, hardWidth-x, size * 1.55);
	if (text || count > 340 || !state) {
		overContext.shadowColor = '#000';
		overContext.shadowBlur = 5;//state > 2 ? 5 : 0;
		overContext.font = `${state > 2 || !text || !state || bold ? 'bold ' : ''}${size}px Arial`;
		overContext.fillStyle = '#fff';
		const _planet = zoomed ? planet : sun;
		if (!text) overContext.fillRect(x, y + 12, overContext.measureText(text || _planet.name).width, 5);
		overContext.fillText(text || _planet.name, x, y);

		// TODO: menu/info for planets
		if (!text && state < 3) {
			overContext.font = '36px Arial';
			overContext.fillStyle = '#888';
			let description = count > 360 ? 'Tap to zoom in' : '';
			if (zoomed) {
				if (!_planet.moons || _planet.moons.length == 2) {
					description = ['Unexplored.','Explored.','Being mined.','Colonized.'][_planet.status];
				}
			} else if (_planet.moons.length == 9) {
				// terrestrial planetary / solar system
				if (!system) description = 'Gas giants currently unreachable.';
			} else {
				description = `Population: ${_planet.population / 1000}m`;
			}
			overContext.fillText(description, x, y+64);

			if (state < 3) updateTimeUI();
			updateYearUI();
			updateResourcesUI();
		}
	}
}

function updateTimeUI(posY = 0) {
	if (count > 340 || posY) {
		tween.speed = +tween.speed.toFixed(3);
		updateUI('Timeflow: ' + (paused ? 'paused' : `${1 + (0 | tween.speed * 55.5)} day / second`), 14, 915 + posY, 36, 1);
	}
}

function updateYearUI(posY = 0) {
	updateUI(`Year: ${0|year}`, 14, 860 + posY, 52, 1, 1);
	updateUI((month < 10 ? '/ 0' + month : '/ ' + month), 280, 860 + posY, 44, 1);
	updateUI((day < 10 ? '/ 0' + day : '/ ' + day), 364, 860 + posY, 36, 1);
}

function getResources(moon) {
	oil += !moon ? -oil : moon.resources[0];
	ore += !moon ? -ore : moon.resources[1];
	silica += !moon ? -silica : moon.resources[2];
	metal += !moon ? -metal : moon.resources[3];
	carbon += !moon ? -carbon : moon.resources[4];
}

function browseForResources(moon) {
	moon.moons.forEach((moon, index) => {
		if (index < state * 4) getResources(moon);
		if (moon.moons) browseForResources(moon);
	});
}

function updateResourcesUI() {//console.log(selectedPlanet, system, state)
	const basePlanet = !zoomed && state < 3 ? sun : planet;
	//console.log(basePlanet)
	getResources();
	getResources(basePlanet);
	if (basePlanet.moons && state < 3 && system < 2) {
		browseForResources(basePlanet);
	}
	//display resources:
	if (planet.status || (!selectedPlanet && !zoomed)) {
		resDiv.innerHTML = '<b><u>Resources:</u>';
		for (i = 0; i < 5; i++) {
			resDiv.innerHTML += `<br>&#x1F${resources[i]}; <b>${[oil,ore,silica,metal,carbon][i]}</b>`;
		}
	} else {
		resDiv.innerHTML = '';
	}
	//Res:<div>&#x1F6E2;</div><div>&#x1F4A7;</div>
}

function setUI() {////spaceDiv.style = gameDiv.style = 'width:1920px;height:1080px';
	spaceCanvas.style.display = spaceDiv.style.display = state && state < 3 ? 'block' : 'none';
	gameCanvas.style.display = bgrCanvas.style.display = state < 3 ? 'none' : 'block';
	gameDiv.style = 'width:1920px;height:1080px;' + (!state ? 'filter:blur(9px) hue-rotate(-40deg)' : state < 3 ? 'margin-top:940px' : '');
	frameDiv.style = state && state < 3 ? 'display:none' : `width:${!state ? hardWidth : frameWidth}px;height:${!state ? hardHeight : surfaceHeight}px;`;
	uiDiv.style = state ? 'filter:hue-rotate(180deg) saturate(0.5);float:right'
						: 'opacity:0.4;font-size:125px;transform:scale(15.7,12) translateX(898px) translateY(-48px)';
	uiDiv.innerHTML = state ?
		state > 2 ? '<nav style=font-size:160px;float:unset>&#x1FA90;</nav>' + (system == 2 ? '<nav id=base style=margin-left:42px;width:99px;height:99px;line-height:120px>&#x1F3E2;</nav>' : '')
					: '<nav>&#x23EA;</nav><nav>&#x23F8;</nav><nav>&#x23E9;</nav>'
							: '&#x1F30C;';
	//if (state) updateResourcesUI();
	//<nav style=font-size:80px;margin-top:150px;margin-right:-130px>&#x1F315;</nav>
}

function switchState(_state = 0, _back = false) {
	state = _state;
	if (!state) {
		showMеnu();
	} else if (state < 3) {
		selectPlanet(0);
		runSolarSystem(_back);
	} else {
		runSurface();
	}
	setUI();
}

function showMеnu() {
	updateUI("in ASCENT", 380, 500, 220);
	updateUI("Start Game", 790, 760, 70);
	//updateUI("Continue", 830, 820, 70);
	updateUI("Developed by Noncho Savov, FoumartGames © 2021. Submission for JS13K games, theme SPACE.", 220, 999, 32);
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
		if (state < 3 && idle) {
			onWheel(e);
		}
	};

	// UI button events
	uiDiv.onmousedown = e => {
		//soundFX = new SoundFX();
		//soundFX.init();

		if (state > 2) {
			removeInteractions();
			if (e.target.id == 'base') {
				// center surface
				interactSurface(structures.indexOf(buildings[0]));
			} else {
				// get back from surface mode
				switchState(1, true);
			}
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

	// html inlined event dispatches from the structure menues
	document.addEventListener("intr", _build);
	document.addEventListener("menu", _menu);
	document.addEventListener("deal", _deal);
}

function removeInteractions() {
	Array.from(spaceDiv.children).forEach(div => div.style.pointerEvents = 'none');
	structures.forEach(structure => {
		if (structure[4] == 3) structure[4] = 1;
		activeStructure = 0;
		menuDiv.innerHTML = '';
		menuDiv.style = '';
	})
}

function touchStartHandler(event) {
	if (tutorial) return;
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
						if (structures[i][0] > 9 && structures[i][0] < 20) {
							const tapX = (stageWidth - playerX + (event.clientX - offsetX) / scale) / 100 + 1;
							const objX = structures[i][1] / 5;
							if (tapX > objX && tapX < objX + 4 && (event.clientY - offsetY) / scale > 700) {
								// interact with an object on the surface
								if (activeStructure == i) {
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
