//window.addEventListener("load", runSimulation);

// solar
const scales = [6, 5.5, 4.25, 3.75, 2.25, 1.8, 1.5, 1.3, 1.8];

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
		new Planet(10, 36, 120, 'gray', 'Mercury'),
		new Planet(16, 25, 160, 'orange', 'Venus'),
		new Planet(20, 10, 220, 'blue', 'Earth', [
			new Planet(6, 120, 32, 'silver', 'Moon')
		]),
		new Planet(15, 8, 280, 'red', 'Mars'),
		new Planet(36, 4, 425, 'gold', 'Jupiter', [
			new Planet(6, 36, 50, 'orange', 'Io'),
			new Planet(5, 24, 68, 'silver', 'Europa'),
			new Planet(10.5, 16, 90, 'tan', 'Ganymede'),
			new Planet(8, 12, 115, 'dimgray', 'Callisto')
		]),
		new Planet(32, 3, 600, 'yellow', 'Saturn', [
			new Planet(9, 18, 54, 'wheat', 'Titan'),
		]),
		new Planet(26, 2, 700, 'blue', 'Uranus'),
		new Planet(24, 1, 780, 'purple', 'Neptune', [
			new Planet(7.5, 12, 36, 'gray', 'Triton'),
		])
	];
	sun = new Planet(80, 0, 0, 'yellow', 'The Solar System', planets);

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

function toggleZoom() {
	zoomed = !zoomed;
	if (!zoomed) {
		if (tween.rotation) {
			TweenFX.to(tween, 30, {scale: sunscale, offset: -960, rotation : 0});//  
		}
	}
	updateUI();
}

function animate() {
	requestAnimationFrame(animate);
	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	stars.forEach(star => star.draw());
	sun.update();
	gameCanvas.style.transform = `translateX(${tween.offset}px) translateY(-1380px) rotate(${tween.rotation}deg)`;
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
		this.moons = moons;

		const div = document.createElement('div');
		gameDiv.appendChild(div);
		this.div = div;
		div.link = this;
		div.style = `background-color:${color};border-radius:900px;cursor:pointer;`;
		div.addEventListener('click', onClick);
	}

	updateSourcePosition(x, y) {
		this.startX = x;
		this.startY = y;
		this.update();
	}

	draw() {
		// Planet Path
		gameContext.beginPath();
		gameContext.lineWidth = 2;
		gameContext.arc(
			this.startX,
			this.startY,
			this.orbitRadius * tween.scale,
			0,
			Math.PI * 2,
			false
		);
		gameContext.strokeStyle = 'rgba(255, 255, 255, 0.25)';
		gameContext.stroke();

		// Planet
		// note: shadow blur lags alot on phones
		//gameContext.shadowBlur = ((this == sun ? 100 : 50) + this.radius) / 5;
		//gameContext.shadowColor = this.color;
		gameContext.beginPath();
		gameContext.arc(this.x, this.y, this.radius * tween.scale, 0, Math.PI * 2, false);
		gameContext.fillStyle = this.color;
		gameContext.fill();
		//gameContext.shadowBlur = 0;

		if ((zoomed && this != sun) || (!zoomed && tween.rotation)) {
			this.div.style.display = 'none';
		} else {
			this.div.style.display = 'block';
			this.div.style.transform = `translateX(${this.x + tween.offset}px) translateY(${this.y - 1380}px)`;
			this.div.style.width = this.div.style.height = `${this.radius * 2 * tween.scale}px`;
			this.div.style.marginLeft = this.div.style.marginTop = `-${this.radius * 1 * tween.scale}px`;
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
				TweenFX.to(tween, 30, {
					scale: scales[selectedPlanet],
					offset: -960 + this.orbitRadius * scales[selectedPlanet],
					rotation: (360 - this.velocity * 1800) - Math.atan2(sun.y - this.y, sun.x - this.x) * 180 / Math.PI
				});
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
