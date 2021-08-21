//window.addEventListener("load", runSimulation);

const rotations = [308, 316, 342, 346, 354, 356, 358, 360];
const scales = [5.5, 5.25, 4.25, 4, 2.4, 1.8, 1.5, 1.3];

let zoomed;
var scale = 2;
var sunscale = 2;
var rotation = 0;
var offset = -960;
let selectedPlanet = 4;

let sun;
let stars;

function runSimulation() {
	stars = [];

	const planets = [
		// mercury
		new Planet(9.5, 36, 120, 'gray', 'Mercury'),
		// venus
		new Planet(16, 25, 160, 'orange', 'Venus'),
		// earth
		new Planet(20, 10, 220, 'blue', 'Earth', [
			// moon
			new Planet(6, 120, 32, 'silver')
		]),
		// mars
		new Planet(13, 8, 280, 'red', 'Mars'),
		// jupiter
		new Planet(36, 4, 425, 'gold', 'Jupiter', [
			// io
			new Planet(6, 36, 50, 'orange'),
			// europe
			new Planet(5, 24, 68, 'silver'),
			// ganymede
			new Planet(10.5, 16, 90, 'tan'),
			// callisto
			new Planet(8, 12, 115, 'dimgray')
		]),
		// saturn
		new Planet(32, 3, 600, 'yellow', 'Saturn', [
			// titan
			new Planet(10, 18, 54, 'wheat'),
		]),

		// uranus
		new Planet(26, 2, 700, 'blue', 'Uranus'),
		
		// neptune
		new Planet(24, 1, 780, 'purple', 'Neptune', [
			// triton
			new Planet(7.5, 12, 36, 'gray'),
		])
	]

	sun = new Planet(80, 0, 0, 'yellow', 'The Sun System', planets);

	for (let i = 0; i < 300; i++) {
		stars.push(new Star());
	}

	game.addEventListener('click', onClick);

	game.onwheel = zoom;

	updateUI();

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
		sunscale += event.deltaY * -0.001;
		sunscale = Math.min(Math.max(0.65, sunscale), 3);
		TweenFX.to(app, 30, {scale: sunscale});
	}
}

function onClick() {
	zoomed = !zoomed;
	if (!zoomed) {
		if (rotation) {
			TweenFX.to(app, 30, {scale: sunscale, rotation: 0, offset: -960});
		}
	}
	updateUI();
}

function animate() {
	requestAnimationFrame(animate);
	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	stars.forEach(star => star.draw());
	sun.update();
	gameCanvas.style.transform = `translateX(${offset}px) translateY(-1380px) rotate(${rotation}deg)`;
}

class Star {
	constructor() {
		this.x = Math.random() * gameCanvas.width;
		this.y = Math.random() * gameCanvas.height;
		this.radius = Math.random() * 2;
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
			this.moons = moons;
			moons.forEach(planet => {
				planet.updateSource(this);
			});
		}
	}

	updateSource(source) {
		this.source = source;
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
			this.orbitRadius * scale,
			0,
			Math.PI * 2,
			false
		);
		gameContext.strokeStyle = 'rgba(255, 255, 255, 0.25)';
		gameContext.stroke();

		// Planet
		gameContext.shadowBlur = ((this == sun ? 100 : 50) + this.radius) / 5;
		gameContext.shadowColor = this.color;
		gameContext.beginPath();
		gameContext.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2, false);
		gameContext.fillStyle = this.color;
		gameContext.fill();
		gameContext.shadowBlur = 0;
	}

	update() {
		if (this.velocity > 0) {
			this.radian += this.velocity;
			this.x = this.startX + Math.cos(this.radian) * this.orbitRadius * scale;
			this.y = this.startY + Math.sin(this.radian) * this.orbitRadius * scale;
		}

		if (zoomed) {
			if (sun.moons.indexOf(this) == selectedPlanet) {
				TweenFX.to(app, 30, {
					scale: scales[selectedPlanet],
					offset: -960 + this.orbitRadius * scales[selectedPlanet],
					rotation: (360 - this.velocity * 1800)/*rotations[selectedPlanet]*/ - Math.atan2(sun.y - this.y, sun.x - this.x) * 180 / Math.PI
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
