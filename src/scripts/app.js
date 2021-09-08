// Solar / Planetary system view script
// ------------------------------------

// prevents interactions during transitions
let idle;
// global pause and counter
let paused;
let count = 0;
// variables used to calculate the time passed
let earthRad = 0;
let moonRad = 0;
let month;
let year;

// a radian value
const rad = 6.2831853072;

// view settings
let scales;
let basescale;
let sunscale;
const baseSkew = 0.45;
const baseOffset = -960;
let previousOffset;
let previousScale;
let skewed = true;
let zoomed;
let axisRotation = 0;

// default view settings (before initial zoom)
// speed: global velocity, initially set to 30 days per second)
const tween = {
	scale: 0.1,
	rotation: 0,
	offset: baseOffset,
	skew: 0.35,
	alpha: 1,
	speed: 0.9
}

// current active planet / moon
let selectedPlanet = 0;

// global objects
let globalPlanets;
let sun;
let planets;
let sky;
let stars = [];

// interactive website to view planets positions at given time: https://in-the-sky.org/solarsystem.php

function addStars() {
	for (let i = 0; i < 400; i++) {
		stars.push(new Star(spaceCanvas.width, spaceCanvas.height, spaceContext, true));
	}
}

function getInitialZoom() {
	return [1.6, 1, 2.8, 1, 2, 2.4, 2.6, 3][system];
}
function getTransitionZoom() {
	return [1, 1, 0.85, 1, 1.05, .62, .5, .4][system];
}

function prepareGlobals() {
	globalPlanets = [                                                  // Radius, Orbital period,      Gravity,       Density,      Semi-major axis
		new Planet(10, 71.6, 113, 988, 'Mercury', 1, 1),               // 2439.7, 88d,       0.241y,   3.7 dm/s²,     5.427 g/cm³,  57.909,050 km
		new Planet(18, 28.1, 160, 'fb7', 'Venus', 1, 2.6),             // 6051.8, 224.7d,    0.615y,   8.87 dm/s²,    5.243 g/cm³,  108.208,000 km
		new Planet(20, 17.2, 229, '03f', 'Earth', getMoons(2), 4.4),   // 6371,   365.25d,   1y,       9.80665 dm/s², 5.514 g/cm³,  149.598,023 km
		new Planet(16, 9.2,  303, 'f20', 'Mars', getMoons(3), 5.4),    // 3389.5, 686.93d,   1.881y,   3.72076 dm/s², 3.9335 g/cm³, 227.939,200 km (1.523679 AU)
		new Planet(42, 1.46, 453, 'f94', 'Jupiter', getMoons(4), 0.6), // 69911,  4332.6d,   11.862y,  24.79 dm/s²,   1,326 g/cm³,  778.57 Gm (5.2044 AU)
		new Planet(38, .59,  680, 'fca', 'Saturn', getMoons(5), 1),    // 58232,  10759.22d, 29.457y,  10.44 dm/s²,   0.687 g/cm³,  1,433.53 million km (9.5826 AU)
		new Planet(32, .206, 847, '8ad', 'Uranus', getMoons(6), 5.5),  // 25362,  30688.5d,  84.0205y, 8.69 dm/s²,    1.27 g/cm³,   2875.04 Gm (19.2185 AU)
		new Planet(31, .105, 956, '96f', 'Neptune', getMoons(7), 0.2), // 24622,  60182d,    164.8y,   11.15 dm/s²,   1.638 g/cm³,  4.50 billion km (30.07 AU)
		new Planet(435, 0, 990, 0, 0, 1)
	];
}

function getMoons(sys, size = 1, type = 1) {
	return [,,//       Radius,     Velocity,  Orbit, Color, Name, Type       // Radius, Orbit,  Gravity,   Density,     Semi-major axis
		[// Earth
			new Planet(20*size-15, 208, 115*size-85, 999, 'Moon', 3-size)    // 1737.4, 27.32d, 1.62 m/s², 3.344 g/cm³, 384,399 km
		],
		[// Mars
			new Planet(.9, -200, 22), new Planet(.7, 160, 29)
		],
		[// Jupiter
			new Planet(5.2 * size, 252, 31 * type + 21, 'ec6', 'Io', 2),     // 1821.6, 1.77d, 1.796 m/s², 3.528 g/cm³, 421,700 km
			new Planet(4.2 * size, 128, 42 * type + 26, 'a9e', 'Europa', 2), // 1560.8, 3.55d, 1.314 m/s², 3.013 g/cm³, 670,900 km
			new Planet(8 * size, 68, 54 * type + 34, 'db9', 'Ganymede', 2),  // 2634.1, 7.15d, 1.428 m/s², 1.936 g/cm³, 1.070,400 km
			new Planet(7 * size, 32, 67 * type + 42, 979, 'Callisto', 2)     // 2410.3, 16.7d, 1.235 m/s², 1.834 g/cm³, 1.882,700 km
		],
		// Saturn
		(size > 1 ? [
			new Planet(1.6 * size, 280, 60.75 * type, 779, 'Enceladus', 2),  // 252.1,  1.37d, 0.113 m/s², 1.609 g/cm³, 238,020 km
			new Planet(2.4 * size, 220, 68.25 * type, 777, 'Tethys', 2),     // 531.1,  1.89d, 0.146 m/s², 0.984 g/cm³, 294,660 km
			new Planet(2.5 * size, 160, 75.75 * type, 999, 'Dione', 2),      // 561.4,  2.74d, 0.232 m/s², 1.478 g/cm³, 377,400 km
		] : []).concat(
		[
			new Planet(2.8 * size, 96, 87 * type - 11, 766, 'Rhea', 2),      // 763.8,  4.52d,  0.264 m/s², 1.236 g/cm³  527,040 km
			new Planet(7.5 * size, 30, 98 * type - 9, 'fc8', 'Titan', 2),    // 2574.7, 15.95d, 1.352 m/s², 1.88 g/cm³,  1.221,830 km
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
			new Planet(4 * size, -12, 46 * type, 'e9a', 'Triton', 2)         // 1353.4, 5.875d, 0,779 m/s², 2.061 g/cm³, 354.800 km
		]
	][sys];
}

function prepareSystem(sys = 0) {
	let oldsys = system;
	system = sys;

	// clear previous systems
	Array.from(spaceDiv.children).forEach(div => {
		div.onclick = div.onmouseover = div.onmouseout = null;
	});
	spaceDiv.innerHTML = '';

	scales = system >= 5 ? [5.8, 5.7, 5.5, 5.2, 4.5, 4] : [5.8, 5.2, 3.8, 2.9, 2.1, 1.46, 1.18, 1.05]
	basescale = getInitialZoom();
	sunscale = basescale;

	// Solar system setting:
	if (system < 2) {
		globalPlanets.forEach(planet => {
			planet.addInteractions();
		});
		planets = globalPlanets;
		sky = planets[planets.length - 1]
	} else {
		planets = getMoons(system, 2, 3);
		sky = new Planet(435, 0, 990, 0, 0, 1);
		planets.push(sky);
	}
	// sky: invisible button outside the solar/planetary system - clicking it gets you one level out of the nested system.

	// On the Terrestrial system draw the outer planets much farther away to be more realistic during the initial zoom.
	// Also don't include them in the render cicle. // OPT: not that necessary - can be deleted to save space.
	if (system < 2) {
		planets[4].orbitRadius = planets[4].baseRadius * (!system ? 1.5 : 1);
		planets[5].orbitRadius = planets[5].baseRadius * (!system ? 2 : 1);
		planets[6].orbitRadius = planets[6].baseRadius * (!system ? 3 : 1);
		planets[7].orbitRadius = planets[7].baseRadius * (!system ? 4 : 1);
		if (system) {
			planets[6].velocity = planets[6].baseVelocity;
			planets[7].velocity = planets[7].baseVelocity;
		}
	}

	// The Sun or a zoomed planet when inside a nested planetary/moon system
	sun = new Planet(90, 1, 0,
		['ff3', 'ff3', '03f', 0, 'f94', 'fca', '8ad', '96f'][system],
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
			tween.offset = baseOffset + planet.orbitRadius * tween.scale;
			tween.rotation = 360 - Math.atan2(sun.y - planet.y, sun.x - planet.x) * 180 / Math.PI;
		} else {
			// getting deeper into a nested planetary system
			idle = false;
			zoomed = false;
			sunscale = getTransitionZoom();
			tween.rotation = 0;
			tween.scale = sunscale;
			tween.offset = baseOffset;
			TweenFX.to(tween, 30, {scale: getInitialZoom()}, 0, () => idle = true);
		}
	}
}

function runSolarSystem() {
	clearUI();
	updateUI();
	animate();
}

function pause() {
	uiDiv.children[1].innerHTML = '&#x25B6;';
	paused = tween.speed;
	tween.speed = 0;
	updateTimeUI();
}

function unpause() {
	tween.speed = paused;
	paused = 0;
	uiDiv.children[1].innerHTML = '&#x23F8;';
	updateTimeUI();
}

function increaseSpeed() {
	if (!paused) {
		if (tween.speed < 0.02) tween.speed = .036;
		else if (tween.speed < 0.05) tween.speed += .054;
		else if (tween.speed < 0.1) tween.speed += .09;
		else if (tween.speed < 1.8) tween.speed += 0.18;
		else tween.speed = 1.8;
		updateTimeUI();
	}
}

function decreaseSpeed() {
	if (!paused) {
		if (tween.speed > 0.3) tween.speed -= .18;
		else if (tween.speed > 0.1) tween.speed -= .09;
		else if (tween.speed > 0.05) tween.speed -= .054;
		else if (tween.speed > 0.04) tween.speed = .036;
		else tween.speed = 0.018;
		updateTimeUI();
	}
}

function onClick(event) {
	if (idle && (tween.skew == 1 || tween.skew == baseSkew)) {
		//event.target.style.opacity = 0;
		if (event.target.link == sky) {
			if (zoomed) {
				toggleZoom();
			} else if (system > 1) {
				// get back from planet system
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
			} else {
				toggleSkew();
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
					} else {
						if (system < 2 && (selectedPlanet == 2 || selectedPlanet > 3)) {
							// dive deeper into a nested planetary/moon system
							// normalize moons rotations
							const rotations = getPlanetsRotation(selectedPlanet);
							prepareSystem(selectedPlanet);
							sun.moons.forEach((moon, index) => {
								if (moon.name != 0) {
									moon.radian = rotations[index];
								}
							});
						} else {
							enterSurface();
						}
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
			else {
				if (selected > -1) {
					tweenToPlanet(selected);
				}
			}
		}
	}
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

function zoom() {
	sunscale = Math.min(Math.max(getInitialZoom() * .4, sunscale), 3.5);
	TweenFX.to(tween, 30, {scale: sunscale}, 2);
}

// initial zoom on start game or reload
function initialZoom() {
	if (system >= 2) {
		sunscale = getInitialZoom();
		tween.skew = 1;
		skewed = false;
		TweenFX.to(tween, 50, {scale: sunscale}, 0, () => idle = true);
	} else {
		TweenFX.to(tween, 180, {scale: sunscale, skew: 1}, 0, () => {
			TweenFX.to(tween, 160, {speed:0.018}, 0, () => {
				uiDiv.style = '';
				toggleSkew(2);
				// TODO: tutorial?
			});
		});
	}
}

// enter planet/moon surface mode
function enterSurface() {
	idle = false;
	previousScale = tween.scale;
	previousOffset = tween.offset;
	// perform a slight zoom-in
	TweenFX.to(tween, 20, {
		alpha: 0,
		scale: 9,
		offset: zoomed ? baseOffset + sun.moons[selectedPlanet].orbitRadius * 9 : baseOffset
	}, 0, () => {
		idle = true;
		switchState(state + 2);
	});
}

function tweenToPlanet(selected) {
	idle = false;
	zoomed = false;
	selectedPlanet = selected;
	const planet = sun.moons[selectedPlanet];
	TweenFX.to(tween, 30, {
		scale: scales[selectedPlanet],
		offset: baseOffset + planet.orbitRadius * scales[selectedPlanet],
		rotation: (360 + planet.velocity * 1800 * tween.speed) - Math.atan2(sun.y - planet.y, sun.x - planet.x) * 180 / Math.PI
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

function toggleSkew(selected) {
	skewed = !skewed;
	if (skewed) {
		normalizePlanetsRotation();
	}
	idle = false;
	TweenFX.to(tween, 30, {skew: skewed ? baseSkew : 1}, 0, () => {
		if (selected > -1) {
			tweenToPlanet(selected);
		} else {
			idle = true;
		}
	});
}

function normalizePlanetsRotation() {
	sun.moons.forEach(planet => {
		planet.radian += tween.rotation * Math.PI / 180;
	});
	axisRotation = (axisRotation + tween.rotation) % 360;
	tween.rotation = 0;
}

function getPlanetsRotation(selected) {
	const rotations = [];
	const moons = selected ? sun.moons[selected].moons : sun.moons || [];
	moons.forEach(moon => {
		if (moon.name != 0) {
			rotations.push(moon.radian % rad + (selected ? (tween.rotation % 360) * Math.PI / 180 : 0));
		}
	});
	return rotations;
}

function animate() {
	if (state && state < 3) {
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
		
		if (system < 2) {
			earthRad += tween.speed;
		} else {
			moonRad += tween.speed;
		}

		const _year = (2021 + (earthRad + moonRad) / 365.25);
		const _month = 1 + (0|(year - (0|year)) * 12);
		if (year != _year || month != _month) {
			year = _year;
			month = _month;
			if (count > 345) updateYearUI();
		}

		if (count < 346) {
			r = count < 336 ? 100 : (345 - count) * 10;
			updateYearUI(r);
			updateTimeUI(r);
		}

		// don't render planets which are outside the visible area
		if (system < 2) {
			planets[4].velocity = state == 2 || tween.scale < 2 / tween.skew ? planets[4].baseVelocity : 0;
			planets[5].velocity = state == 2 || tween.scale < 1 / tween.skew ? planets[5].baseVelocity : 0;
			planets[6].velocity = state == 2 ? planets[6].baseVelocity : 0;
			planets[7].velocity = state == 2 ? planets[7].baseVelocity : 0;
		}

		sun.update();
		if (system > 1) {
			globalPlanets.forEach(planet => {
				if (planet != sun) {
					planet.update(true);
				}
			})
		}
		spaceCanvas.style.transform = `translateX(${tween.offset}px) translateY(-1380px) rotate(${tween.rotation}deg)`;
		spaceCanvas.style.opacity = tween.alpha;

		requestAnimationFrame(animate);
	}
}
