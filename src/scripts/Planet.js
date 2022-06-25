// Class handling Planets / Moons
// ------------------------------

class Planet {
	constructor(radius, velocity, orbitRadius, color = 666, name, moons, radian = 0,
		exploreCost = [250,0,25,50,10,0], mineCost = [300,0,20,100,20,2], colonyCost = [500,0,100,150,50,5], char = 39,
		resources = [0,0,0,0,0,0,0,0], status = 0
	) {
		this.name = name;
		this.actualSun = color == 'ff3';
		this.isEarth = color == '06f';
		this.x = spaceCanvas.width / 2,
		this.y = spaceCanvas.height / 2,
		this.startX = this.x;
		this.startY = this.y;
		this.radius = radius;
		this.color = '#' + color;
		this.velocity = velocity / 1000;
		this.render = 1;
		this.radian = radian;
		this.orbitRadius = this.baseRadius = orbitRadius;
		this.width = 3;
		this.system = 0;
		if (moons) {
			if (moons.length) {
				if (moons.length != 2) this.system = 1;
				this.moons = moons;
				moons.forEach(moon => {
					if (this.width < 6) this.width += moon.radius > 6 || moon.radius == 5 ? 1 : moon.radius >= 1 ? 0.25 : moon.radius < 1 ? 0.5 : 0;
				});
			}
			const div = document.createElement('div');
			this.div = div;
			div.link = this;
			div.style = `background-color:#fff;border-radius:2000px;${this.velocity?'cursor:pointer':''};opacity:0`;
			this.addInteractions();
		}

		this.status = this.isEarth ? 4 : status;//1
		this.exploreCost = exploreCost;
		this.mineCost = mineCost;
		this.colonyCost = colonyCost;
		this.char = char;
		this.population = this.isEarth ? 7900 : 0;
		this.resources = this.isEarth ? [91,45,45,28,10,this.population,-1,0] : resources;

		// probes, miners and colonizers must have progress data
	}

	addInteractions() {
		if (this.div) {
			spaceDiv.prepend(this.div);
			this.div.onclick = onClick;
			this.div.onmouseover = () => this == sun ? this.div.style.opacity = !skewed && (idle || tutorial) ? 0.2 : 0 : this.highlighted = !skewed;
			this.div.onmouseout = () => this == sun ? this.div.style.opacity = 0 : this.highlighted = false;
		}
	}

	updateSourcePosition(x, y, dontDraw) {
		this.startX = x;
		this.startY = y;
		this.update(dontDraw);
	}

	update(dontDraw) {
		if (this.velocity) {
			if (system > 1 && this == sun) axisRotation += this.velocity * tween.speed * (180 / Math.PI);
			this.radian -= this.velocity * tween.speed;
			this.x = this.startX + Math.cos(this.radian) * this.orbitRadius * tween.scale;
			this.y = this.startY + Math.sin(this.radian) * this.orbitRadius * tween.scale * tween.skew;

			if (zoomed) {
				if (sun.moons.indexOf(this) == selectedPlanet) {
					tween.rotation = 360 - Math.atan2(sun.y - this.y, sun.x - this.x) * 180 / Math.PI;
				}
			}

			if (!this.render) return;

			if (!dontDraw) this.draw();

			if (this.moons) {
				this.moons.forEach(planet => {
					planet.updateSourcePosition(this.x, this.y, dontDraw);
				});
			}

			if (!dontDraw) this.draw3d();
		} else if (this.radius > 90) {
			this.positionArea();
		}
	}

	draw() {
		// position outer area
		this.positionArea();

		// draw planet orbit interactive top-down area
		if (this.div && (this.highlighted || sun.moons.indexOf(this) == selectedPlanet && zoomed) && idle) {
			spaceContext.globalAlpha = this == sky ? 0.06 : sun.moons.indexOf(this) == selectedPlanet || !zoomed ? this.highlighted ? 0.1 : 0.08 : 0.08;
			this.drawPath((this.radius < 12 ? system == 5 || system == 6 ? 7 : 12 : this.radius) * this.width * (sun.moons.indexOf(this) > 3 && system < 2 && !buildings[4][4] ? 1.79 : 1) * tween.scale, 'fff');
			spaceContext.globalAlpha = 1;
		}

		// draw planet orbit or Saturn rings
		if (this.radius >= 2 || this.radius <= 1) {
			if (this.radius <= 1 || this.radius == 2) spaceContext.globalAlpha = 0.5;
			this.drawPath(
				tween.scale + (this.radius == 1 || this.radius == 2 ? (this.radius == 1 ? 4 : 12) * tween.scale : zoomed ? this.radius < 5 ? -0.5 : this.radius < 10 ? 0 : 1 : 1.5),
				this.radius == 1 || this.radius == 2 ? 359 : 333
			);
			if (this.radius <= 1 || this.radius == 2) spaceContext.globalAlpha = 1;
		}

		if (this.radius != 1 && this.radius != 2) {
			// draw planet color
			this.drawArc(false);
			// draw planet shadow
			this.drawArc();
		}
	}

	positionArea() {
		// planet click area
		if (this.div) {
			this.div.style.transform = `translateX(${1920 + tween.offset}px) translateY(${540}px)`;
			const size = (this.orbitRadius + this.radius * (this == sun ? 1.04 : 2)) * (sun.moons.indexOf(this) > 3 && system < 2 ? 1.2 : 1) * tween.scale;
			this.div.style.width = this.div.style.height = size * 2 + 'px';
			this.div.style.marginLeft = this.div.style.marginTop = `-${size}px`;
		}
	}

	drawPath(lineWidth, color) {
		spaceContext.beginPath();
		spaceContext.lineWidth = lineWidth;
		spaceContext.ellipse(
			this.startX,
			this.startY,
			this.orbitRadius * tween.scale,
			this.orbitRadius * tween.scale * tween.skew,
			0,
			Math.PI * 2,
			false
		);
		spaceContext.strokeStyle = '#' + color;
		spaceContext.stroke();
	}

	drawArc(shadow = true, useSun = false, start = 0, end = Math.PI * 2) {
		let color = this.color;
		if (shadow) {
			const dir = Math.atan2(useSun && !zoomed ? sun.y : this.startY - this.y, useSun && !zoomed ? sun.x : this.startX - this.x);
			const lx = this.actualSun ? 0 : Math.cos(dir);
			const ly = this.actualSun ? 0 : Math.sin(dir);
			color = spaceContext.createRadialGradient(
				this.x + this.radius * lx * tween.scale * 0.6,
				this.y + this.radius * ly * tween.scale * 0.6,
				this.actualSun || this.isEarth ? 2 : this.radius * tween.scale * 0.5,
				this.x + lx * tween.scale,
				this.y + ly * tween.scale,
				this.radius * tween.scale * 1.1
			);
			color.addColorStop(0, getRGBA(16, 16, 16, this.isEarth ? 0.5 : 0.1));
			if (this == sun && !this.isEarth) {
				if (this.actualSun) {
					color.addColorStop(0.6, getRGBA(16, 12, 0, .25));
					color.addColorStop(0.9, getRGBA(16, 6, 0, .5));
				} else {
					color.addColorStop(0.3, getRGBA(6, 6, 6, .1));
				}
			} else {
				color.addColorStop(0.9, getRGBA(0, 0, 0, .5));
			}
			color.addColorStop(1, getRGBA(0, 0, 0, .4));
		}

		spaceContext.beginPath();
		spaceContext.arc(this.x, this.y, this.radius * tween.scale, start, end, false);
		spaceContext.fillStyle = color;
		spaceContext.fill();
		spaceContext.closePath();
	}

	draw3d() {
		if (this.moons && this.velocity && this.render) {
			// draw planet upper part color and shadow to cover other planets in order to create a 3d illusion
			this.drawArc(false, true, Math.PI, 0);
			this.drawArc(true, false, Math.PI, 0);
			this.moons.forEach(planet => planet.draw3d());
		}
	}
}
