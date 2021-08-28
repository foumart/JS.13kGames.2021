let idle;
let count = 0;

const scales = [6, 5.5, 4.25, 3.4, 2.25, 1.46, 1.18, 1.05, 1.6];
const basescale = scales.pop();
let sunscale = basescale;

const baseSkew = 0.45;
let skewed = true;
let zoomed;
let selectedPlanet;

// initial view
const tween = {
	scale: 0.1,
	rotation: 0,
	offset: -960,
	skew: 0.4,
	speed: 0
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

function getJupiterMoons(size = 1, type = 1) {
	return [
		new Planet(5 * size, 126 / type, 31 * type + 21, 'ec6', 'Io', 2),      // 1822
		new Planet(4 * size, 64 / type, 42 * type + 26, 'ade', 'Europa', 2),   // 1560
		new Planet(8 * size, 34 / type, 54 * type + 34, 'db9', 'Ganymede', 2), // 2634
		new Planet(7 * size, 20 / type, 67 * type + 42, 678, 'Callisto', 2)    // 2410
	];
}

function getSaturnMoons() {
	return [
		new Planet(1, 9, 46, 249, ''),
		new Planet(1, 6, 50, 369, ''),
		new Planet(1, 8, 54, 679, ''),
		new Planet(1, 7, 59, 597, ''),
		new Planet(1, 5, 63, 694, ''),
		new Planet(.9, 12, 65, 666, 'Mimas'),     // 199
		new Planet(1.2, 28, 68, 836, 'Enceladus'),// 249
		new Planet(1.7, 40, 70, 974, 'Tethys'),   // 530
		new Planet(1.8, 32, 74, 486, 'Dione'),    // 560
		new Planet(2.6, 24, 78, 955, 'Rhea'),     // 764
		new Planet(7.5, 18, 88, 'fa8', 'Titan'),  // 2574
		new Planet(2.5, 12, 104, 589, 'Iapetus')  // 718
	];
}

/*function getUranusMoons(size = 1, type = 1) {
	return [
		new Planet(6 * size, 36 / type, 54, 'wheat', 'Titania'), // 788
		new Planet(5 * size, 32 / type, 54, 'wheat', 'Oberon'),  // 761
		new Planet(4 * size, 22 / type, 54, 'wheat', 'Umbriel'), // 585
		new Planet(4 * size, 16 / type, 54, 'wheat', 'Ariel'),   // 579
	];
}*/

function prepareSystem(sys = 0) {
	let oldsys = system;
	system = sys;
	// clear previous systems
	Array.from(spaceDiv.children).forEach(div => {
		div.link = div.onclick = div.ondblclick = div.onmouseover = div.onmouseout = null;
	});
	spaceDiv.innerHTML = '';

	// Solar system / Earth / Jupiter setting:
	planets = system < 2 ? [
		new Planet(10, 80, 113, 888, 'Mercury', 1),    // 2440, 0.161, 59
		new Planet(18, 28, 160, 'fa0', 'Venus', 1),    // 6052, 0.615, 224.7
		new Planet(20, 16, 229, '03f', 'Earth', [      // 6371
			new Planet(4.8, 120, 35, 'ccc', 'Moon', 2) // 1737
		]),
		new Planet(16, 9, 303, 'f20', 'Mars', [        // 3390, 1.88 : 1, 686.93
			new Planet(.9, -200, 22, 666, 'Phobos', 3),
			new Planet(.7, 160, 29, 666, 'Deimos', 3)
		]),
		new Planet(42, 1.2, 453, 'f94', 'Jupiter',     // 70000, 11.86 : 1
			getJupiterMoons()
		),
		new Planet(38, .4, 680, 'fca', 'Saturn',       // 58232, 29.4 : 1
			getSaturnMoons()
		),
		new Planet(32, .2, 840, '8bf', 'Uranus', 1),   // 25362, 84 : 1
		new Planet(31, .1, 942, '76f', 'Neptune', [    // 24622, 163.72 : 1
			new Planet(4, -12, 45, 'e9a', 'Triton'),   // 1353
		])
	] : system == 2 ? [
		new Planet(25, 16, 150, 'ccc', 'Moon', 1)
	] : getJupiterMoons(2, 3);

	if (!system) {
		planets[4].orbitRadius += 275;
		planets[5].orbitRadius += 750;
		planets[6].orbitRadius += 1250;
		planets[7].orbitRadius += 1750;
	}

	sky = new Planet(200, 0, 1200, 0, 'Sky', 1);
	planets.push(sky);

	sun = new Planet(90, 1, 0, ['ff3','ff3','03f','f94','fca'][system], ['Terrestrial planetary', 'The Solar', 'Earth','Jupiter','Saturn'][system] + ' system', planets);
	spaceDiv.append(sun.div);

	if (!state) {
		// initial zoom
		if (system == 2) {
			selectedPlanet = 2;
			sunscale = 2.8;
			tween.skew = 1;
			skewed = false;
			TweenFX.to(tween, 50, {scale: sunscale}, 0, () => idle = true);
		} else {
			TweenFX.to(tween, 50, {scale: sunscale * .6, skew: baseSkew}, 1, () => {
				toggleSkew();
				TweenFX.to(tween, 40, {scale: sunscale}, 2, () => idle = true);
			});
		}
	} else if (system < 2) {
		// getting back from planet system
		selectedPlanet = oldsys > 2 ? oldsys + 1 : 2;
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
		sunscale = 1.05;
		tween.rotation = 0;
		tween.scale = sunscale;
		tween.offset = -960;
		TweenFX.to(tween, 30, {scale: system == 2 ? 2.8 : 2, offset: -960, rotation:0}, 0, () => idle = true);
	}
	updateUI();
}

function runSolarSystem() {
	game.onwheel = onWheel;
	updateUI();
	animate();
}

function zoom() {
	sunscale = Math.min(Math.max(!system ? 1.6 : system > 1 ? 2 : skewed ? 1 : 0.55, sunscale), 3);
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
				TweenFX.to(tween, 15, {scale: system == 3 ? 1.1 : 1}, 0, () => {
					idle = true;
					prepareSystem(system == 2 ? 0 : 1);
				});
				//prepareSystem(system == 2 ? 0 : 1);
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
						if (selectedPlanet == 2 || selectedPlanet == 4) {
							// enter planetary system view mode
							prepareSystem(1 + selectedPlanet / 2);
						} else {
							// enter planet surface mode
							switchState(2);
						}
					}
				}
			}
		} else if (e.target.link == sun) {
			if (system == 2) {
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

/*function onDoubleClick() {
	sunscale = basescale;
	TweenFX.to(tween, 30, {scale: sunscale});
}*/

function updateUI() {
	overContext.clearRect(0, 0, overCanvas.width, overCanvas.height);
	overContext.font = '48px Arial';
	overContext.fillStyle = "#ccc";
	overContext.fillText(zoomed ? sun.moons[selectedPlanet].name : sun.name, 50, 50);
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
		if (system == 2) {
			selectedPlanet = 2;
			sunscale = 2.8;
		} else if (system == 3) {
			selectedPlanet = 4;
			sunscale = 2;
		}
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

function animate() {
	if (state == 1) {
		count ++;
		if (tween.rotation) spaceContext.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
		else spaceContext.clearRect(spaceCanvas.width / 4 - 2, spaceCanvas.height / 4 - 2, spaceCanvas.width / 2 + 4, spaceCanvas.height / 2 + 4);
		stars.forEach(star => star.draw());
		requestAnimationFrame(animate);
		sun.update();
		spaceCanvas.style.transform = `translateX(${tween.offset}px) translateY(-1380px) rotate(${tween.rotation}deg)`;
	} else {
		/*spaceCanvas.style.display = 'none';
		spaceDiv.style.display = 'none';
		gameCanvas.style.display = 'block';
		gameDiv.style.display = 'block';

		gameDiv.onclick = () => {
			state = 1;
			gameDiv.onclick = null;
			gameDiv.style.display = 'none';
			game.onwheel = zoom;
			updateUI();
			animate();
		}*/
	}
}
