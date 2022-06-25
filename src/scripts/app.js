// Solar / Planetary system view script
// ------------------------------------

const maxScale = 3.5;
const baseSkew = 0.45;
const baseOffset = -960;
const rad = Math.PI * 2;

// default view settings (before initial zoom)
// speed: global velocity of the solar system (0.018 1d, 0.036 2d, etc.)
const tween = {
	scale: 0.1,
	rotation: 0,
	offset: baseOffset,
	skew: 0.45,
	alpha: 1,
	speed: 0.9
}

// prevents interactions during transitions
let idle;
// global pause and counter
let userPaused;
let paused;
let count;
// variable used to calculate the time passed
let earthRad;
let month;
let year;
let day;
let tutorial;
let playTutorial = 1;

// current active planet / moon
let selectedPlanet;

// global objects
let globalPlanets;
let sun;
let planets;
let sky;
let stars = [];
let planet;

// planetary / solar system view settings
let scales;
let basescale;
let sunscale;
//let previousOffset = baseOffset;
//let previousScale;
let skewed = true;
let zoomed;
let axisRotation = 0;

// temp:
let probeToMoonSent;
let minerToMoonSent;
let colonyToMoonSent;

// interactive website to view planets positions at given time: https://in-the-sky.org/solarsystem.php

function addStars() {
	for (let i = 0; i < 400; i++) {
		stars.push(new Star(spaceCanvas.width, spaceCanvas.height, spaceContext, true));
	}
}

function prepareGlobals() {
	globalPlanets = [                                                              // Radius, Orbital period,      Gravity,       Density,      Semi-major axis
	    new Planet(10, 71.6, 113, 988, 'Mercury', 1, 0.9,                          // 2439.7, 88d,       0.241y,   3.7 dm/s²,     5.427 g/cm³,  57.909,050 km
	        [100,0,10,40,5], [120,0,20,80,10], [150,0,30,100,25]),
	    new Planet(18, 28.1, 160, 'fb7', 'Venus', 1, 2.3,                          // 6051.8, 224.7d,    0.615y,   8.87 dm/s²,    5.243 g/cm³,  108.208,000 km
	        [60,0,10,30,5], [80,0,25,60,10], [100,0,60,30,15], 40),
	    new Planet(20, 17.2, 229, '06f', 'Earth-Moon system', getMoons(2), 4.5),   // 6371,   365.25d,   1y,       9.80665 dm/s², 5.514 g/cm³,  149.598,023 km
	    new Planet(16, 9.2,  303, 'f20', 'Mars', getMoons(3), 5.4,                 // 3389.5, 686.93d,   1.881y,   3.72076 dm/s², 3.9335 g/cm³, 227.939,200 km (1.523679 AU)
	        [80,0,10,25,5], [100,0,15,50,15], [120,0,50,30,10], 38),
	    new Planet(42, 1.46, 453, 'f94', 'Jovian system', getMoons(4), 0.6),     // 69911,  4332.6d,   11.862y,  24.79 dm/s²,   1,326 g/cm³,  778.57 Gm (5.2044 AU)
	    new Planet(38, .59,  680, 'fca', 'Saturn Ringlet system', getMoons(5), 1), // 58232,  10759.22d, 29.457y,  10.44 dm/s²,   0.687 g/cm³,  1,433.53 million km (9.5826 AU)
	    new Planet(32, .206, 847, '8ad', 'Uranian system', getMoons(6), 5.5),      // 25362,  30688.5d,  84.0205y, 8.69 dm/s²,    1.27 g/cm³,   2875.04 Gm (19.2185 AU)
	    new Planet(31, .105, 956, '96f', 'Neptunian system', getMoons(7), 0.2),    // 24622,  60182d,    164.8y,   11.15 dm/s²,   1.638 g/cm³,  4.50 billion km (30.07 AU)
	    new Planet(435, 0, 990, 0, 0, 1)
	];
}

//const moonDetails = {}

function getMoons(sys, size = 1, type = 1) {
	return [,,//       Radius,     Velocity,  Orbit, Color, Name, Type       // Radius, Orbit,  Gravity,   Density,     Semi-major axis
		[// Earth
		    new Planet(20*size-15, 208, 115*size-85, 999, 'Moon', 3-size, 0, // 1737.4, 27.32d, 1.62 m/s², 3.344 g/cm³, 384,399 km
				[50,0,10,15,2], [60,0,10,40,5], [80,0,40,20,10], 37)//,
		],
		[// Mars
		    new Planet(.9, -200, 22), new Planet(.7, 160, 29)
		],
		[// Jupiter
		    new Planet(5.2 * size, 3150, 31 * type + 21, 'ec6', 'Io', 2),     // 1821.6, 1.77d, 1.796 m/s², 3.528 g/cm³, 421,700 km
		    new Planet(4.2 * size, 1600, 42 * type + 26, 'a9e', 'Europa', 2), // 1560.8, 3.55d, 1.314 m/s², 3.013 g/cm³, 670,900 km
		    new Planet(8 * size, 850, 54 * type + 34, 'db9', 'Ganymede', 2),  // 2634.1, 7.15d, 1.428 m/s², 1.936 g/cm³, 1.070,400 km
		    new Planet(7 * size, 400, 67 * type + 42, 979, 'Callisto', 2)     // 2410.3, 16.7d, 1.235 m/s², 1.834 g/cm³, 1.882,700 km
		],
		// Saturn
		(size > 1 ? [
		    new Planet(1.6 * size, 5000, 60.75 * type, 779, 'Enceladus', 2),  // 252.1,  1.37d, 0.113 m/s², 1.609 g/cm³, 238,020 km
		    new Planet(2.4 * size, 3000, 68.25 * type, 777, 'Tethys', 2),     // 531.1,  1.89d, 0.146 m/s², 0.984 g/cm³, 294,660 km
		    new Planet(2.5 * size, 1950, 75.75 * type, 999, 'Dione', 2),      // 561.4,  2.74d, 0.232 m/s², 1.478 g/cm³, 377,400 km
		] : []).concat(
		[
		    new Planet(2.8 * size, 1350, 87 * type - 11, 766, 'Rhea', 2),      // 763.8,  4.52d,  0.264 m/s², 1.236 g/cm³  527,040 km
		    new Planet(7.5 * size, 450, 98 * type - 9, 'fc8', 'Titan', 2),    // 2574.7, 15.95d, 1.352 m/s², 1.88 g/cm³,  1.221,830 km
		    new Planet(2.7 * size, 8, 107 * type - 1, 869, 'Iapetus', 2),    // 734.5,  79.32d, 0.223 m/s², 1.088 g/cm³, 3.561,300 km
		    new Planet(1*size, 1, 31*type+15), new Planet(1*size, 1, 35*type+16),
		    new Planet(1*size, 1, 39*type+17), new Planet(1*size, 1, 44*type+19),
		    new Planet(1*size, 1, 48*type+20)// saturn rings
		]),
		// Uranus
		(size > 1 ? [
		    new Planet(1.5 * size, 12, 35 * type, 'bbb', 'Miranda', 2),      // 235.8, 1.4135d, 0.079 m/s², 1.20 g/cm³,  129,900 km
		    new Planet(2.5 * size, 16, 42.25 * type, 999, 'Ariel', 2),       // 578.9, 2.520d,  0.269 m/s², 1.592 g/cm³, 190,900 km
		    new Planet(2.5 * size, 22, 49.5 * type, 555, 'Umbriel', 2),      // 584.7, 4.144d,  0.2 m/s²,   1.39 g/cm³,  266,000 km
		] : []).concat(
		[
		    new Planet(2.9 * size, 36, 64 * type - 22, 986, 'Titania', 2),   // 788.4, 8.7d,    0,367 m/s², 1,71 g/cm³,  435,840 km
		    new Planet(2.8 * size, 32, 70 * type - 18, 'a9c', 'Oberon', 2),  // 761.4, 13.46d,  0,346 m/s², 1.63 g/cm³,  582,600 km
		]),
		// Neptune
		[
		    new Planet(4 * size, -1200, 46 * type, 'e9a', 'Triton', 2)         // 1353.4, 5.875d, 0,779 m/s², 2.061 g/cm³, 354.800 km
		]
	][sys];
}

function getInitialZoom() {
	return [1.6, 1, 2.8, 1, 2, 2.4, 2.6, 3][system];
}
function getTransitionZoom() {
	return [1, 1, 0.88, 1, 1.05, .62, .5, .4][system];
}

function setScales() {
	scales = system >= 5 ? [5.8, 5.7, 5.5, 5.2, 4.5, 4] : [5.5, 5, 4, 3, 2.1, 1.46, 1.18, 1.05];
}

function prepareSystem(sys = 0) {
	let oldsys = system;
	system = sys;

	// clear previous systems
	Array.from(spaceDiv.children).forEach(div => {
		div.onclick = div.onmouseover = div.onmouseout = null;
	});
	spaceDiv.innerHTML = '';

	setScales();
	basescale = getInitialZoom();
	sunscale = basescale;

	// Solar system setting:
	if (system < 2) {
		globalPlanets.forEach(globalPlanet => {
			globalPlanet.addInteractions();
		});
		planets = globalPlanets;
		sky = planets[planets.length - 1];
	} else {
		planets = getMoons(system, 2, 3);
		sky = new Planet(435, 0, 990, 0, 0, 1);
		planets.push(sky);
	}
	// sky: invisible button outside the solar/planetary system - clicking it gets you one level out of the nested system.

	// On the Terrestrial system draw the outer planets much farther away to be more realistic during the initial zoom.
	// Also don't include them in the render cicle. // OPT: not that necessary - can be deleted to save some bytes.
	if (system < 2) {
		planets[4].orbitRadius = planets[4].baseRadius * (!system && !buildings[4][4] ? 1.2 : 1);
		planets[5].orbitRadius = planets[5].baseRadius * (!system && !buildings[4][4] ? 1.4 : 1);
		planets[6].orbitRadius = planets[6].baseRadius * (!system && !buildings[4][4] ? 1.8 : 1);
		planets[7].orbitRadius = planets[7].baseRadius * (!system && !buildings[4][4] ? 3 : 1);
	}

	// The Sun or a zoomed planet when inside a nested planetary/moon system
	sun = new Planet(90, 1, 0,
		['ff3', 'ff3', '06f', 0, 'f94', 'fca', '8ad', '96f'][system],
		['Terrestrial system', 'The Solar system', 'Earth', 0, 'Jupiter', 'Saturn', 'Uranus', 'Neptune'][system],
		planets
	);
	spaceDiv.append(sun.div);

	if (state) {
		if (system < 2) {
			// getting back from planet system
			selectPlanet(oldsys > 2 ? oldsys : 2);
			zoomed = true;
			tween.scale = scales[selectedPlanet];
			tween.offset = baseOffset + planet.orbitRadius * tween.scale;
			tween.rotation = 360 - Math.atan2(sun.y - planet.y, sun.x - planet.x) * 180 / Math.PI;
			updateUI();
			//updateYearUI();
		} else {
			// getting deeper into a nested planetary system
			idle = false;
			zoomed = false;
			sunscale = getTransitionZoom();
			tween.rotation = 0;
			tween.scale = sunscale;
			tween.offset = baseOffset;
			if (tutorial && !playTutorial) tutorial = 0;
			TweenFX.to(tween, 30, {scale: getInitialZoom()}, 0, () => idle = !tutorial);
		}
	}
}

function selectPlanet(selected) {
	selectedPlanet = selected;
	planet = system > 1 && selectedPlanet > sun.moons.length - 1 ? globalPlanets[system] : sun.moons[selectedPlanet];
}

function runSolarSystem(_back, _callback) {
	setScales();
	clearUI();
	updateUI();
	if (_back) {
		// getting back from surface view with a slight zoom-out, or just perform a quick intro when reloading the game
		updateTimeUI();
		idle = false;
		skewed = false;
		const offset = baseOffset + (globalPlanets.indexOf(planet) > -1 && globalPlanets != planets ? 0 : planet.orbitRadius * scales[selectedPlanet]);
		TweenFX.to(tween, 20, {scale: scales[selectedPlanet] || getInitialZoom(), alpha: 1, offset: offset, skew: 1}, 0, () => {
			idle = true;
			if (_callback) _callback();
		});
	} else if (tween.scale == 0.1) {
		// initial slow intro zoom on new game start and the display of tutorial instructions
		TweenFX.to(tween, 180, {scale: sunscale, skew: 1}, 0, () => {
			TweenFX.to(tween, 198, {speed: 0.018}, 0, () => {
				uiDiv.style = '';
				tutorial = 1;
				toggleSkew(2);
			});
		});
	}
}

function getBackFromPlanetSystem() {
	idle = false;
	TweenFX.to(tween, 15, {scale: getTransitionZoom()}, 0, () => {
		idle = true;
		// normalize the zoomed planet's moons rotations
		const rotations = getPlanetsRotation();
		const oldSystem = system;
		prepareSystem(state == 2 ? 1 : 0);
		sun.moons[oldSystem].moons.forEach((moon, index) => {
			moon.radian = rotations[index] - tween.rotation * Math.PI / 180;
		});
	});
}

// Planet div onclick
function onClick(event) {
	if (idle && (tween.skew == 1 || tween.skew == baseSkew)) {
		event.target.style.opacity = 0;
		if (event.target.link == sky) {
			if (zoomed) {
				toggleZoom();
			} else if (system > 1) {//&& buildings[2][4]
				// get back from planet system
				if (buildings[1][8]) {
					getBackFromPlanetSystem();
				} else {
					observatoryNotification(2, 'the Terrestrial planetary system');
				}
			} else {
				if (system != 2 || state != 1) toggleSkew();
			}
		} else if (!event.target.link.velocity) {
			prepareSystem();
		} else if (zoomed) {
			if (event.target.link == sun) {
				toggleZoom();
			} else {
				const selected = sun.moons.indexOf(event.target.link);
				if (selected > -1) {
					if (selectedPlanet != selected) {
						tweenToPlanet(selected);
					} else if (system > 1 || !system && !sun.moons[selected].system) {
						if (sun.moons[selected].status) {
							enterSurface();
						} else {
							colonyNotification(selected);
						}
					} else {
						// dive deeper into a nested planetary/moon system
						getIntoNestedSystem();
					}
				}
			}
		} else if (event.target.link == sun) {
			if (system < 2) {
				// toggle skew mode on solar system view
				toggleSkew();
			} else if (system > 2) {
				// reset zoom on a nested planetary view
				sunscale = getInitialZoom();
				zoom();
			} else {
				// enter Earth surface mode
				selectedPlanet = -1;
				enterSurface();
			}
		} else {
			// zoom to a planet / moon in a solar / planetary system
			const selected = sun.moons.indexOf(event.target.link);
			if (skewed) toggleSkew(selected);
			else if (selected > -1) {
				tweenToPlanet(selected);
			}
		}
	} else if (!idle) {
		if(event.target.link.name == "Earth" && tutorial == 1 && playTutorial == 1) {
			selectedPlanet = -1;
			enterSurface();
		}
	}
}

function onWheel(event) {
	//if (tutorial) return;
	if (!zoomed) {
		sunscale += event.deltaY * - sunscale * 0.002;
		zoom();
		if (sunscale == maxScale) {
			tweenToPlanet();
		}
	} else if (event.deltaY > 0) {
		if (selectedPlanet < (state == 1 && system < 2 ? 3 : sun.moons.length - 2)) {
			tweenToPlanet(selectedPlanet + 1);
		} else {
			toggleZoom();
		}
	} else if (event.deltaY < 0) {
		if (selectedPlanet > 0) {
			tweenToPlanet(selectedPlanet - 1);
		} else {
			toggleZoom();
			sunscale = maxScale;
			zoom();
		}
	}
}

function zoom() {
	sunscale = Math.min(Math.max(getInitialZoom() * .6, sunscale), maxScale);
	TweenFX.to(tween, 30, {scale: sunscale}, 2);
}

function getIntoNestedSystem() {
	// normalize moons rotations
	const rotations = getPlanetsRotation(selectedPlanet);
	prepareSystem(selectedPlanet);
	sun.moons.forEach((moon, index) => {
		if (moon.name != 0) {
			moon.radian = rotations[index];
		}
	});
	updateUI();
}

// enter planet/moon surface mode
function enterSurface() {
	idle = false;
	//previousScale = tween.scale;
	//previousOffset = tween.offset;
	// perform a slight zoom-in
	TweenFX.to(tween, 20, {
		alpha: 0,
		scale: 9,
		offset: zoomed ? baseOffset + planet.orbitRadius * 9 : baseOffset
	}, 0, () => {
		idle = true;
		switchState(state + 2);
		if (tutorial && playTutorial) {
			menuDiv.style = `width:1920px;height:780px`;
			//<div style=width:1320px;height:550px;left:380px;top:180px><div style=width:1260px;height:490px;font-size:45px;padding:10px;top:20px;left:20px;line-height:65px;background-color:rgba(66,66,66,0.5)><b>
			menuDiv.innerHTML = `${drawTutorialFrame(0,0,0,0,180,380,1320,550)}Here is your base anual income:<br>24*${getEmojiCode(0)}, 12*${getEmojiCode(1)}, 12*${getEmojiCode(2)}, 6*${getEmojiCode(3)} and 1*${getEmojiCode(4)}<br><br>Select the Headquarters to view a list of structures and facilities you can build.<br><br>Launching of space missions will be available, when conditions are met.</div></div>`;
			tutorial = 0;
			idle = true;
		}
	});
}

function tweenToPlanet(selected = 0) {//console.log(state, system, selected, isEarth, buildings);
	if (system == 2 && !selected && !buildings[1][4] || system < 2 && selected > 3 && !buildings[4][4] || system < 2 && selected < 4 && selected != 2 && !buildings[1][8]) {
		observatoryNotification(selected);
		idle = true;
		return;
	}

	idle = false;
	zoomed = false;
	selectPlanet(selected);
	TweenFX.to(tween, 30, {
		scale: scales[selectedPlanet],
		offset: baseOffset + planet.orbitRadius * scales[selectedPlanet],
		rotation: ((count < 450 ? 0 : 360) + planet.velocity * 1800 * tween.speed) - Math.atan2(sun.y - planet.y, sun.x - planet.x) * 180 / Math.PI
	}, tutorial ? 1 : 3, () => {
		idle = !tutorial;
		zoomed = true;
		updateUI();
		if (tutorial) {
			prepareSystem(selected);
		}
	});
}

function toggleZoom() {
	zoomed = !zoomed;
	if (!zoomed) {
		sunscale = getInitialZoom();
		selectPlanet(system);
		idle = false;
		if (tween.rotation) {
			TweenFX.to(tween, 30, {scale: sunscale, offset: -960}, 0, () => idle = true);
		}
	} else if (skewed) {
		normalizePlanetsRotation();
		TweenFX.to(tween, 5, {skew: 1});
	}
	updateUI();
}

function toggleSkew(selected) {
	skewed = !skewed;
	if (skewed) {
		normalizePlanetsRotation();
	}
	idle = false;
	TweenFX.to(tween, tween.skew == (skewed ? baseSkew : 1) ? 0 : 30, {skew: skewed ? baseSkew : 1}, 0, () => {
		if (selected > -1) {
			tweenToPlanet(selected);
		} else {
			idle = true;
		}
	});
}

function normalizePlanetsRotation() {
	sun.moons.forEach(moon => {
		moon.radian += tween.rotation * Math.PI / 180;
	});
	axisRotation = (axisRotation + tween.rotation) % 360;
	tween.rotation = 0;
}

function getPlanetsRotation(selected) {
	const rotations = [];
	const moons = selected ? sun.moons[selected].moons : sun.moons || [];
	if (Array.isArray(moons)) moons.forEach(moon => {
		if (moon.name != 0) {
			rotations.push(moon.radian % rad + (selected ? (tween.rotation % 360) * Math.PI / 180 : 0));
		}
	});
	return rotations;
}

function drawTutorialFrame(borderTL, borderTR, borderBL, borderBR, top, left, width = 580, height = 140, opacity = 0.45) {
	const borders = `${borderTL?'border-top-left-radius:65px;':''}${borderTR?'border-top-right-radius:65px;':''}${borderBL?'border-bottom-left-radius:65px;':''}${borderBR?'border-bottom-right-radius:65px;':''}`;
	const borders2 = borders.replace(/65/g, '45');
	return `<div style=width:${width}px;height:${height}px;top:${top}px;left:${left}px;background-color:rgba(45,128,54,${opacity});${borders}><div style=width:${width-66}px;height:${height-66}px;top:20px;left:20px;font-size:50px;padding:10px;background-color:rgba(66,192,78,${opacity/2});${borders2};border-color:rgba(92,192,92,${opacity/2});border-width:3px;border-style:solid><b>`;
}

function getResourcesCap() {
	let baseCaps = [200,100,100,50,25,air==-1 ? '∞' : air, '', 10];
	if (buildings[6][4]) {
		baseCaps[0] += buildings[6][8] ? 100 : 50;
		baseCaps[2] += buildings[6][8] ? 50 : 25;
	}
	if (buildings[7][4]) {
		baseCaps[1] += buildings[7][8] ? 100 : 50;
		baseCaps[3] += buildings[7][8] ? 50 : 25;
	}
	if (buildings[8][4]) {
		baseCaps[2] += buildings[8][8] ? 50 : 25;
		baseCaps[4] += buildings[8][8] ? 50 : 25;
	}

	return baseCaps;
}

function getResourcesIncome() {
	const res = [24, 12, 12, 6, 1, 0, 50, 0];
	if (isEarth) {
		if (buildings[6][4]) {
			res[0] += buildings[6][8] ? 24 : 12;
			if (buildings[6][8]) res[2] += 6;
		}
		if (buildings[7][4]) {
			res[1] += buildings[7][8] ? 24 : 12;
			res[3] += buildings[7][8] ? 24 : 12;
		}
		if (buildings[8][4]) {
			res[2] += buildings[8][8] ? 24 : 12;
			if (buildings[8][8]) res[4] += 4;
		}
	}
	return res;
}

function animate() {
	if (state) {
		// run time (1 day per second is the slowest)
		earthRad += tween.speed;
		const _year = (2021 + earthRad / 365.25);
		const _month = 1 + (0|(year - (0|year)) * 12);
		const _day = 1 + (0|(year - (0|year)) * 360 % 30);
		if (year != _year || month != _month || (day != _day && state > 2)) {
			if (month != _month) {
				// update ui progres bars
				setUI();
				// update randomness for depot
				if (monthRandom < 0) {
					monthRandom ++;
				} else {
					monthRandom = 0.5 + Math.random();
				}
				toRandom = 0|Math.random()*5;
				while (toRandom == _month % 5) {
					toRandom = 0|Math.random()*5;
				}

				// add resources for the headquarters
				globalPlanets[2].resources[0] += 2;
				globalPlanets[2].resources[1] ++;
				globalPlanets[2].resources[2] ++;
				if (_month % 2 == 0) globalPlanets[2].resources[3] ++;
				if (_month == 1) globalPlanets[2].resources[4] ++;

				// add resources for each available mine
				if (isEarth) {
					if (buildings[6][4]) {
						globalPlanets[2].resources[0] += buildings[6][8] ? 2 : 1;
						if (_month % 2 || buildings[6][8]) globalPlanets[2].resources[2] ++;
					}
					if (buildings[7][4]) {
						globalPlanets[2].resources[1] += buildings[7][8] ? 2 : 1;
						globalPlanets[2].resources[3] += buildings[7][8] ? 2 : 1;
					}
					if (buildings[8][4]) {
						globalPlanets[2].resources[2] += buildings[8][8] ? 2 : 1;
						if (_month % 4 == 0 || _month % 2 == 0 && buildings[8][8]) globalPlanets[2].resources[4] ++;
					}
				}

				// cap the resources
				const resourceCaps = getResourcesCap();
				resourceCaps.forEach((cap, index) => {
					if (globalPlanets[2].resources[index] > cap) globalPlanets[2].resources[index] = cap;
				});

				// increase Earth's population
				globalPlanets[2].population += 5;

				if (count > 345) updateResourcesUI();
			}
			year = _year;
			month = _month;
			day = _day;
			if (count > 345) updateYearUI();
		}

		// proceed with tutorial
		if (tutorial && playTutorial) {
			if (count == 520) {
				pause(true);
				menuDiv.style = `width:1920px;height:940px;pointer-events:none`;
				menuDiv.innerHTML = `${drawTutorialFrame(1,0,0,0,20,1160)}Tutorial screen 1</b></div></div>${drawTutorialFrame(0,1,0,1,-120,1760,145,140,0.75)}</b></div></div>${drawTutorialFrame(1,1,1,0,195,1080,640)}◯ &nbsp; &nbsp; &nbsp;← Navigation</b></div></div>${drawTutorialFrame(0,0,1,1,215,1240,480,210)}Tap</b> 🔵 <b> to enter<br>planet mode</b></div></div><nav style=top:35px;width:90px;right:25px;pointer-events:all onclick='document.dispatchEvent(new CustomEvent("clos",{"detail":1}))'><b>&#10006;</b></nav>`;

				//menuDiv.innerHTML = `${drawTutorialFrame(1,1,0,1)}Tutorial screen</b></div></div>${drawTutorialFrame(1,1,1,1,-120,1750,145)}</b></div></div>${drawTutorialFrame(1,1,0,1,-125,420,450)}← Resources</b></div></div>${drawTutorialFrame(1,1,0,0,-72,1270,130)}◯</b></div></div>${drawTutorialFrame(1,1,1,1,-92,1050,580)}◯ &nbsp;&nbsp;← Navigation</b></div></div>${drawTutorialFrame(1,1,0,1,10,420,520)}↙ Time control</b></div></div>${drawTutorialFrame(0,1,1,1,-135,1080,460,200)}↖ Tap</b> 🔵 <b> to&nbsp;<br>continue.</b></div></div><nav style=top:35px;width:90px;right:20px;pointer-events:all onclick='document.dispatchEvent(new CustomEvent("clos",{"detail":1}))'><b>&#10006;</b></nav>`;//or</b> ▶ <b>
				//uiDiv.innerHTML += `<nav style=top:35px;width:90px;right:70px onclick='document.dispatchEvent(new CustomEvent("clos",{"detail":1}))'>✕</nav>`;
			} else if (count == tutorial + 15) {
				selectedPlanet = -1;
				enterSurface();
			}
		}

		// clear notification
		if (count == clearNotification) {
			clearNotification = 0;
			notify();
		}

		// draw the solar / planetary system
		if (state < 3) {
			count += 1;
			// OPT: clearRect the whole canvas, nomatter the rotation
			if (tween.rotation) {
				spaceContext.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
			} else {
				spaceContext.clearRect(spaceCanvas.width / 4 - 2, spaceCanvas.height / 4 - 2, spaceCanvas.width / 2 + 4, spaceCanvas.height / 2 + 4);
			}
			stars.forEach(star => star.draw());

			// draw axis
			if (system < 2) {
				spaceContext.strokeStyle = '#222';
				spaceContext.lineWidth = 3;
				for (r = 0; r < 4; r++) {
					spaceContext.moveTo(spaceCanvas.width/2, spaceCanvas.height/2);
					spaceContext.lineTo(
						spaceCanvas.width/2 + Math.cos(Math.PI * (axisRotation + r*90) / 180) * spaceCanvas.width/2,
						spaceCanvas.height/2 + Math.sin(Math.PI * (axisRotation + r*90) / 180) * spaceCanvas.height/2*tween.skew
					);
				}
				spaceContext.stroke();
			}

			// custom intro ui animation - slide in the speed control buttons
			if (count < 346) {
				r = count < 331 ? 151 : (345 - count) * 10;
				uiDiv.style = `margin-top:${r}px`;
				updateYearUI(r);
			} else if (count == 346) {
				uiDiv.style = '';
			} else if (count < 347 + 32) {
				navDiv.style.right = (count - 379) * 5 + 'px';
			}

			// don't render planets which are outside the visible area
			if (system < 2) {
				planets[4].render = zoomed || state == 2 || tween.scale < 1.8 / tween.skew ? 1 : 0;
				planets[5].render = state == 2 || tween.scale < 1.2 / tween.skew ? 1 : 0;
				planets[6].render = state == 2 || tween.scale < 0.5 / tween.skew ? 1 : 0;
				planets[7].render = state == 2 || tween.scale < 0.2 / tween.skew ? 1 : 0;
			}

			sun.update();
			if (system > 1) {
				globalPlanets.forEach(globalPlanet => {
					if (globalPlanet != sun) {
						globalPlanet.update(true);
					}
				})
			}
			spaceCanvas.style.transform = `translateX(${tween.offset}px) translateY(-1380px) rotate(${tween.rotation}deg)`;
			spaceCanvas.style.opacity = tween.alpha;
		} else {
			// draw surface
			draw();
		}
	}

	requestAnimationFrame(animate);
}
