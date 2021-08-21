let state = 1;

// solar
const scales = [6, 5.5, 4.25, 3.75, 2.4, 1.65, 1.4, 1.25, 1.8];

// jupiter
//const scales = [5, 4.5, 3.25, 2.5, 1.25];

// earth
//const scales = [4, 2];

const basescale = scales.pop();
let sunscale = basescale;
const tween = {
	scale: 0.01,
	rotation: 0,
	offset: -960
}

let zoomed;
let selectedPlanet = 4;

let sun;
let stars;

function runSolarSystem() {
	// Solar system setting
	const planets = [
		new Planet(11, 36, 115, 'gray', 'Mercury', 1),
		new Planet(15, 25, 160, 'orange', 'Venus', 1),
		new Planet(20, 10, 220, 'blue', 'Earth', [
			new Planet(6, 120, 32, 'silver', 'Moon')
		]),
		new Planet(16, 8, 285, 'red', 'Mars', 1),
		new Planet(36, 4, 425, 'gold', 'Jupiter', [
			new Planet(6, 36, 50, 'orange', 'Io'),
			new Planet(5, 24, 66, 'silver', 'Europa'),
			new Planet(9, 16, 85, 'tan', 'Ganymede'),
			new Planet(8, 12, 105, 'dimgray', 'Callisto')
		]),
		new Planet(32, 3, 600, 'yellow', 'Saturn', [
			new Planet(8.5, 18, 54, 'wheat', 'Titan'),
		]),
		new Planet(26, 2, 700, 'blue', 'Uranus', 1),
		new Planet(24, 1, 780, 'purple', 'Neptune', [
			new Planet(7.5, 12, 36, 'gray', 'Triton'),
		])
	];
	sun = new Planet(80, 0, 0, 'yellow', 'The Solar System', planets);

	gameDiv.append(sun.div);

	// Earth and Moon setting
	/*const planets = [
		new Planet(22, 12, 220, 'silver', 'Moon')
	];
	sun = new Planet(90, 0, 0, 'blue', 'Earth', planets);*/

	// Jupiter setting
	/*const planets = [
		new Planet(18, 15, 150, 'orange', 'Io'),
		new Planet(15, 8, 220, 'silver', 'Europa'),
		new Planet(32, 5, 300, 'tan', 'Ganymede'),
		new Planet(24, 3, 400, 'dimgray', 'Callisto')
	];
	sun = new Planet(85, 0, 0, 'gold', 'Jupiter', planets);*/

	stars = [];
	for (let i = 0; i < 300; i++) {
		stars.push(new Star());
	}

	//game.addEventListener('click', onClick);

	game.onwheel = zoom;

	updateUI();

	TweenFX.to(tween, 120, {scale: sunscale});

	animate();
}

function updateUI() {
	overContext.clearRect(0, 0, overCanvas.width, overCanvas.height);
	overContext.font = '48px Arial';
	overContext.fillStyle = "#ccc";
	overContext.fillText(zoomed ? sun.moons[selectedPlanet].name : sun.name, 50, 50);
}

function zoom(event) {
	event.preventDefault();
	if (!zoomed) {
		sunscale += event.deltaY * - sunscale * 0.002;
		sunscale = Math.min(Math.max(0.65, sunscale), 3);
		TweenFX.to(tween, 30, {scale: sunscale});
	}
}

function onClick(e) {
	if (zoomed) {
		if (e.target.link == sun) {
			toggleZoom();
		} else {
			const selected = sun.moons.indexOf(e.target.link);
			if (selected > -1) {
				if (selectedPlanet != selected) {
					selectedPlanet = selected;
					tweenToPlanet(e.target.link);
					updateUI();
				} else {
					// enter planet surface mode
					state = 2;
					running = true;
					runSurface();
				}
			}
		}
	} else if (e.target.link == sun) {
		sunscale = basescale;
		TweenFX.to(tween, 30, {scale: sunscale});
	} else {
		const selected = sun.moons.indexOf(e.target.link);
		if (selected > -1) {
			selectedPlanet = selected;
			toggleZoom();
		}
	}
}

function tweenToPlanet(planet) {
	TweenFX.to(tween, 30, {
		scale: scales[selectedPlanet],
		offset: -960 + planet.orbitRadius * scales[selectedPlanet],
		rotation: (360 - planet.velocity * 1800) - Math.atan2(sun.y - planet.y, sun.x - planet.x) * 180 / Math.PI
	});
}

function toggleZoom() {
	zoomed = !zoomed;
	if (!zoomed) {
		if (tween.rotation) {
			TweenFX.to(tween, 30, {scale: sunscale, offset: -960});//  , rotation : 0
		}
	}
	updateUI();
}

function animate() {
	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	stars.forEach(star => star.draw());
	if (state == 1) {
		requestAnimationFrame(animate);
		sun.update();
		gameCanvas.style.transform = `translateX(${tween.offset}px) translateY(-1380px) rotate(${tween.rotation}deg)`;
	} else {
		gameCanvas.style.transform = `translateX(0) translateY(0) rotate(0deg)`;
		while (gameDiv.firstChild) {
			gameDiv.lastChild.onclick = null;
			gameDiv.lastChild.onmouseover = null;
			gameDiv.lastChild.onmouseout = null;
			gameDiv.removeChild(gameDiv.lastChild);

			gameDiv.onclick = () => {
				state = 1;
				runSolarSystem();
				gameDiv.onclick = null;
			}
		}
	}
}

class Star {
	constructor() {
		this.x = Math.random() * gameCanvas.width;
		this.y = Math.random() * gameCanvas.height;
		this.radius = Math.random() * 3;
	}

	draw() {
		gameContext.beginPath();
		gameContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		gameContext.fillStyle = 'gray';
		gameContext.fill();
	}
}

class Planet {
	constructor(radius, velocity, orbitRadius, color, name, moons) {
		this.name = name;
		this.x = gameCanvas.width / 2,
		this.y = gameCanvas.height / 2,
		this.startX = this.x;
		this.startY = this.y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity / 1000;
		this.radian = Math.random() * 6;
		this.orbitRadius = orbitRadius;
		if (moons) {
			if (moons != 1) this.moons = moons;
			const div = document.createElement('div');
			gameDiv.prepend(div);
			this.div = div;
			div.link = this;
			div.style = `background-color:white;border-radius:2000px;cursor:pointer;opacity:0`;
			div.onclick = onClick;
			div.onmouseover = () => this == sun ? this.div.style.opacity = 0.1 : this.highlighted = true;
			div.onmouseout = () => this == sun ? this.div.style.opacity = 0 : this.highlighted = false;
		}
	}

	updateSourcePosition(x, y) {
		this.startX = x;
		this.startY = y;
		this.update();
	}

	drawPath(lineWidth, color) {
		gameContext.beginPath();
		gameContext.lineWidth = lineWidth;
		gameContext.arc(
			this.startX,
			this.startY,
			this.orbitRadius * tween.scale,
			0,
			Math.PI * 2,
			false
		);
		gameContext.strokeStyle = color;
		gameContext.stroke();
	}

	draw() {
		// draw planet orbit
		if (this.div && (this.highlighted || sun.moons.indexOf(this) == selectedPlanet && zoomed)) {
			this.drawPath(this.radius * (2 + (this.moons ? this.moons.length : 1)) * tween.scale, sun.moons.indexOf(this) == selectedPlanet || !zoomed ? '#111' : '#0c0c0c');
		}
		this.drawPath(3, '#333');

		// draw planet
		// note: shadow blur lags alot on phones
		//gameContext.shadowBlur = ((this == sun ? 100 : 50) + this.radius) / 5;
		//gameContext.shadowColor = this.color;
		gameContext.beginPath();
		gameContext.arc(this.x, this.y, this.radius * tween.scale, 0, Math.PI * 2, false);
		gameContext.fillStyle = this.color;
		gameContext.fill();
		//gameContext.shadowBlur = 0;
		if (this.div) {
			this.div.style.transform = `translateX(${(1920+tween.offset)}px) translateY(${540}px)`;
			this.div.style.width = this.div.style.height = `${(this.orbitRadius + this.radius*(this==sun?1.15:2)) * 2 * tween.scale}px`;
			this.div.style.marginLeft = this.div.style.marginTop = `-${(this.orbitRadius + this.radius*(this==sun?1.15:2)) * tween.scale}px`;
		}
	}

	update() {
		if (this.velocity > 0) {
			this.radian += this.velocity;
			this.x = this.startX + Math.cos(this.radian) * this.orbitRadius * tween.scale;
			this.y = this.startY + Math.sin(this.radian) * this.orbitRadius * tween.scale;
		}

		if (zoomed) {
			if (sun.moons.indexOf(this) == selectedPlanet) {
				tweenToPlanet(this);
			}
		}

		this.draw();

		if (this.moons) {
			this.moons.forEach(planet => {
				if (this.velocity > 0) planet.updateSourcePosition(this.x, this.y);
				else planet.update();
			});
		}
	}
}
