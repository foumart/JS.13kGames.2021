let idle;
let count = 0;

let scales;
let basescale;
let sunscale;

const baseSkew = 0.45;
let skewed = true;
let zoomed;
let selectedPlanet = 0;

// initial view
const tween = {
	scale: 0.1,
	rotation: 0,
	offset: -960,
	skew: 0.4
}

let sun;
let planets;
let sky;
let stars = [];
function addStars() {
	for (let i = 0; i < 500; i++) {
		stars.push(new Star(spaceCanvas.width, spaceCanvas.height, spaceContext, true));
	}
}

function getInitialZoom() {
	return [1, 1, 2.8, 1, 2, 2.4, 2.6, 3][system];
}
function getTransitionZoom() {
	return [1, 1, 0.95, 1, 1.05, .62, .5, .4][system];
}

function getMoons(sys, size = 1, type = 1) {
	return [
		,
		,
		[// Earth
			new Planet(size > 1 ? 25 : 4.8, size > 1 ? 16 : 120, size > 1 ? 150 : 35, 'ccc', 'Moon', 3 - size) // 1737
		],
		[// Mars
			new Planet(.9, -200, 22, 666, 'Phobos', 3),
			new Planet(.7, 160, 29, 666, 'Deimos', 3)
		],
		[// Jupiter
			new Planet(5 * size, 126 / type, 31 * type + 21, 'ec6', 'Io', 2),      // 1822
			new Planet(4 * size, 64 / type, 42 * type + 26, 'ade', 'Europa', 2),   // 1560
			new Planet(8 * size, 34 / type, 54 * type + 34, 'db9', 'Ganymede', 2), // 2634
			new Planet(7 * size, 20 / type, 67 * type + 42, 678, 'Callisto', 2)    // 2410
		],
		// Saturn
		(size > 1 ? [
			//new Planet(1.2 * size, 36 / type, 60 * type, 666, 'Mimas', 2),       // 199
			new Planet(1.6 * size, 84 / type, 60.75 * type, 836, 'Enceladus', 2),  // 249
			new Planet(2.4 * size, 90 / type, 68.25 * type, 974, 'Tethys', 2),     // 530
			new Planet(2.5 * size, 96 / type, 75.75 * type, 486, 'Dione', 2),      // 560
		] : []).concat(
		[
			new Planet(2.8 * size, 64 / type, 87 * type - 11, 955, 'Rhea', 2),     // 764
			new Planet(7.5 * size, 34 / type, 98 * type - 9, 'fa8', 'Titan', 2),   // 2574
			new Planet(2.7 * size, 26 / type, 107 * type - 1, 589, 'Iapetus', 2),  // 718
			new Planet(1 * size, 27 / type, 31 * type + 15, 0, ''),
			new Planet(1 * size, 18 / type, 35 * type + 16, 0, ''),
			new Planet(1 * size, 24 / type, 39 * type + 17, 0, ''),
			new Planet(1 * size, 21 / type, 44 * type + 19, 0, ''),
			new Planet(1 * size, 15 / type, 48 * type + 20, 0, '')
		]),
		// Uranus
		(size > 1 ? [
			new Planet(1.5 * size, 12 / type, 35 * type, 'bbb', 'Miranda', 2),     // 235.8
			new Planet(2.5 * size, 16 / type, 42.25 * type, 999, 'Ariel', 2),      // 578.9
			new Planet(2.5 * size, 22 / type, 49.5 * type, 766, 'Umbriel', 2),     // 584.7
		] : []).concat(
		[
			new Planet(2.9 * size, 36 / type, 64 * type - 22, 986, 'Titania', 2),  // 788.4
			new Planet(2.8 * size, 32 / type, 70 * type - 18, 'c9a', 'Oberon', 2), // 761.4
		]),
		// Neptune
		[
			//new Planet(0.5, 36 / type, 40, 'e9a', 'Naiad'),     // 29
			//new Planet(0.6, 32 / type, 43, 'e9a', 'Thalassa'),  // 40
			//new Planet(0.7, 26 / type, 47, 'e9a', 'Despina'),   // 78
			//new Planet(0.8, 22 / type, 50, 'e9a', 'Galatea'),   // 87
			//new Planet(0.9, 16 / type, 54, 'e9a', 'Larissa'),   // 97
			//new Planet(1.2, 12 / type, 60, 'e9a', 'Proteus'),   // 210
			new Planet(4 * size, -12 / type, 46 * type, 'e9a', 'Triton', 2)  // 1353
			//new Planet(1.1, 6 / type, 120, 999, 'Nereid'),      // 170
		]
	][sys];
}

function prepareSystem(sys = 0) {
	let oldsys = system;
	system = sys;

	scales = system >= 5 ? [5.8, 5.7, 5.5, 5.2, 4.5, 4] : [5.8, 5.2, 3.8, 2.9, 2.1, 1.46, 1.18, 1.05]
	basescale = getInitialZoom();
	sunscale = basescale;

	// clear previous systems
	Array.from(spaceDiv.children).forEach(div => {
		div.link = div.onclick = div.ondblclick = div.onmouseover = div.onmouseout = null;
	});
	spaceDiv.innerHTML = '';

	// Solar system / Earth / Jupiter setting:
	planets = system < 2 ? [                                   // radi,  revolving,  year length in days
		new Planet(10, 60, 113, 888, 'Mercury', 1),            // 2440,  0.161  : 1, 59
		new Planet(18, 28, 160, 'fa0', 'Venus', 1),            // 6052,  0.615  : 1, 224.7
		new Planet(20, 16, 229, '03f', 'Earth', getMoons(2)),  // 6371,  1
		new Planet(16, 9, 303, 'f20', 'Mars', getMoons(3)),    // 3390,  1.88   : 1, 686.93
		new Planet(42, 1, 453, 'f94', 'Jupiter', getMoons(4)), // 70000, 11.86  : 1
		new Planet(38, .4, 680, 'fca', 'Saturn', getMoons(5)), // 58232, 29.4   : 1
		new Planet(32, .2, 847, '8bf', 'Uranus', getMoons(6)), // 25362, 84     : 1
		new Planet(31, .1, 956, '76f', 'Neptune', getMoons(7)) // 24622, 163.72 : 1
	] : getMoons(system, 2, 3);

	// On the Terrestrial system (system == 1) draw the outer planets much farther away to be more reallistic
	if (!system) {
		planets[4].orbitRadius += 275;
		planets[5].orbitRadius += 750;
		planets[6].orbitRadius += 1250;
		planets[7].orbitRadius += 1750;
	}

	// An invisible button that is present when a planet is zoomed - clicking it gets you out of the nested planetary/moon system
	sky = new Planet(200, 0, 1200, 0, 'Sky', 1);
	planets.push(sky);

	// The Sun or a zoomed planet when inside a nested planetary/moon system
	sun = new Planet(90, 1, 0,
		['ff3', 'ff3', '03f', 0, 'f94', 'fca', 669, 969][system],
		['Terrestrial planetary', 'The Solar', 'Earth and Moon', 0, 'Galilean', 'Saturn Ringlet', 'Uranian', 'Neptunian'][system] + ' system',
		planets
	);
	spaceDiv.append(sun.div);

	if (state) {
		if (system < 2) {
			// getting back from planet system
			selectedPlanet = oldsys > 2 ? oldsys : 2;
			zoomed = true;
			const planet = sun.moons[selectedPlanet];
			tween.scale = scales[selectedPlanet];
			tween.offset = -960 + planet.orbitRadius * scales[selectedPlanet];
			tween.rotation = 360 - Math.atan2(sun.y - planet.y, sun.x - planet.x) * 180 / Math.PI;
			//updateUI();
		} else {
			// getting deeper into a nested planetary system
			idle = false;
			zoomed = false;
			sunscale = getTransitionZoom();
			tween.rotation = 0;
			tween.scale = sunscale;
			tween.offset = -960;
			TweenFX.to(tween, 30, {
				scale: getInitialZoom(),
				offset: -960,
				rotation:0
			}, 0, () => idle = true);
		}
		updateUI();
	}
}

function initialZoom() {
	// initial zoom
	if (system >= 2) {
		sunscale = getInitialZoom();
		tween.skew = 1;
		skewed = false;
		TweenFX.to(tween, 50, {scale: sunscale}, 0, () => idle = true);
	} else {
		TweenFX.to(tween, 50, {scale: sunscale * .6, skew: baseSkew}, 1, () => {
			toggleSkew();
			TweenFX.to(tween, 40, {scale: sunscale}, 2, () => idle = true);
		});
	}
}

function runSolarSystem() {
	game.onwheel = onWheel;
	updateUI();
	animate();
}

function zoom() {
	sunscale = Math.min(Math.max(!system ? 1.6 : system > 1 ? basescale/2 : skewed ? 1 : 0.55, sunscale), 3);
	TweenFX.to(tween, 30, {scale: sunscale}, 2);
}

function onWheel(event) {
	let trueEvent = event.hasOwnProperty('preventDefault');
	if (trueEvent) event.preventDefault();
	if (!zoomed) {
		sunscale += event.deltaY * - sunscale * 0.002;
		zoom();
	} else if (!trueEvent) {
		return;
	} else if (event.deltaY > 0) {
		if (selectedPlanet < sun.moons.length - 1) {
			tweenToPlanet(selectedPlanet + 1);
		} else {
			toggleZoom();
			sunscale = 0.6;
			zoom();
		}
	} else if (event.deltaY < 0) {
		if (selectedPlanet > 0) {
			tweenToPlanet(selectedPlanet - 1);
		} else {
			toggleZoom();
			sunscale = 5;
			zoom();
		}
	}
}

function onClick(e) {
	if (idle && (tween.skew == 1 || tween.skew == baseSkew)) {
		//e.target.style.opacity = 0;
		if (e.target.link == sky) {
			if (zoomed) {
				toggleZoom();
			} else if (system > 1) {
				idle = false;
				TweenFX.to(tween, 15, {scale: getTransitionZoom()}, 0, () => {
					idle = true;
					prepareSystem(system == 2 ? 0 : 1);
				});
			} else {
				toggleSkew();
			}
		} else if (!e.target.link.velocity) {
			prepareSystem();
		} else if (zoomed) {
			if (e.target.link == sun) {
				toggleZoom();
			} else {
				const selected = sun.moons.indexOf(e.target.link);
				if (selected > -1) {
					if (selectedPlanet != selected) {
						tweenToPlanet(selected);
					} else {
						if (system < 2 && (selectedPlanet == 2 || selectedPlanet > 3)) {
							// dive deeper into a nested planetary/moon system
							prepareSystem(selectedPlanet);
						} else {
							// enter planet/moon surface mode
							switchState(2);
						}
					}
				}
			}
		} else if (e.target.link == sun) {
			if (system == 2) {
				// enter planet Earth surface mode
				selectedPlanet = -1;
				switchState(2);
			} else {
				toggleSkew();
			}
		} else {
			if (skewed) toggleSkew();
			const selected = sun.moons.indexOf(e.target.link);
			if (selected > -1) {
				tweenToPlanet(selected);
			}
		}
	}
}

function tweenToPlanet(selected) {
	idle = false;
	zoomed = false;
	selectedPlanet = selected;
	const planet = sun.moons[selectedPlanet];
	TweenFX.to(tween, 30, {
		scale: scales[selectedPlanet],
		offset: -960 + planet.orbitRadius * scales[selectedPlanet],
		rotation: (360 - planet.velocity * 1800) - Math.atan2(sun.y - planet.y, sun.x - planet.x) * 180 / Math.PI
	}, 3, () => {
		idle = true;
		zoomed = true;
		updateUI();
	});
}

function toggleZoom() {
	zoomed = !zoomed;
	if (!zoomed) {
		sunscale = getInitialZoom();
		selectedPlanet = system;
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

function toggleSkew() {
	skewed = !skewed;
	if (skewed) {
		normalizePlanetsRotation();
	}
	const tweenObject = {skew: skewed ? baseSkew : 1};
	if (!skewed && tween.scale < 1) tweenObject.scale = 1;
	TweenFX.to(tween, 30, tweenObject);
}

function normalizePlanetsRotation() {
	sun.moons.forEach(planet => {
		planet.radian += tween.rotation * Math.PI / 180;
	});
	tween.rotation = 0;
}

function updateUI(text, x = 50, y = 50, size = 48, color = '#ccc') {
	if (!text) overContext.clearRect(0, 0, overCanvas.width, overCanvas.height);
	overContext.font = size+'px Arial';
	overContext.fillStyle = color;
	overContext.fillText(text || (zoomed ? sun.moons[selectedPlanet].name : sun.name), x, y);
}

function animate() {
	if (state == 1) {
		count ++;
		// OPT: clearRect the whole canvas, nomatter the rotation
		if (tween.rotation) spaceContext.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
		else spaceContext.clearRect(spaceCanvas.width / 4 - 2, spaceCanvas.height / 4 - 2, spaceCanvas.width / 2 + 4, spaceCanvas.height / 2 + 4);
		stars.forEach(star => star.draw());
		requestAnimationFrame(animate);
		sun.update();
		spaceCanvas.style.transform = `translateX(${tween.offset}px) translateY(-1380px) rotate(${tween.rotation}deg)`;
	}
}
