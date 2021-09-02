class Planet {
	constructor(radius, velocity, orbitRadius, color, name, moons) {
		this.name = name;
		this.x = spaceCanvas.width / 2,
		this.y = spaceCanvas.height / 2,
		this.startX = this.x;
		this.startY = this.y;
		this.radius = radius;
		this.color = '#' + color;
		this.velocity = velocity / 1000;
		this.radian = Math.random() * 6;
		this.orbitRadius = orbitRadius;
		this.width = 3;
		if (moons) {
			if (moons.length) {
				this.moons = moons;
				moons.forEach(moon => {
					if (this.width < 6) this.width += moon.radius > 5 || moon.radius == 4.8 ? 1 : moon.radius >= 1 ? 0.25 : moon.radius < 1 ? 0.5 : 0;
				});
			}
			if ((!system && (radius < 25 || radius == 90 || radius == 200) || system == 1) && (moons.length || moons == 1) || system > 1) {
				const div = document.createElement('div');
				spaceDiv.prepend(div);
				this.div = div;
				div.link = this;
				div.style = `background-color:white;border-radius:2000px;cursor:pointer;opacity:0`;
				div.onclick = onClick;
				div.onmouseover = () => this == sun ? this.div.style.opacity = !skewed && idle ? 0.2 : 0 : this.highlighted = !skewed;
				div.onmouseout = () => this == sun ? this.div.style.opacity = 0 : this.highlighted = false;
			}
		}
	}

	updateSourcePosition(x, y) {
		this.startX = x;
		this.startY = y;
		this.update();
	}

	update() {
		if (this.velocity) {
			this.radian += this.velocity;
			this.x = this.startX + Math.cos(this.radian) * this.orbitRadius * tween.scale;
			this.y = this.startY + Math.sin(this.radian) * this.orbitRadius * tween.scale * tween.skew;
		}

		if (zoomed) {
			if (sun.moons.indexOf(this) == selectedPlanet) {
				tween.rotation = 360 - Math.atan2(sun.y - this.y, sun.x - this.x) * 180 / Math.PI
			}
		}

		this.draw();

		if (this.moons) {
			this.moons.forEach(planet => {
				if (this.velocity > 0) planet.updateSourcePosition(this.x, this.y);
				else planet.update();
			});
		}

		this.draw3d();
	}

	draw() {
		if (this.velocity) {
			// draw planet orbit interactive top-down area
			if (this.div && (this.highlighted || sun.moons.indexOf(this) == selectedPlanet && zoomed)) {
				spaceContext.globalAlpha = sun.moons.indexOf(this) == selectedPlanet || !zoomed ? this.highlighted ? 0.11 : 0.1 : 0.09;
				this.drawPath((this.radius < 12 ? system == 5 || system == 6 ? 7 : 12 : this.radius) * this.width * tween.scale, 'fff');
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

		// planet click area
		if (this.div) {
			this.div.style.transform = `translateX(${(!skewed ? 1920 : this.x) + tween.offset}px) translateY(${!skewed ? 540 : this.y - 1380}px)`;
			this.div.style.width = this.div.style.height = (!skewed || this == sky ? this.orbitRadius + this.radius * (this == sun ? 1.04 : 2) : this.radius) * 2 * tween.scale + 'px';
			this.div.style.marginLeft = this.div.style.marginTop = `-${(!skewed || this == sky ? this.orbitRadius + this.radius * (this == sun ? 1.04 : 2) : this.radius) * tween.scale}px`;
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
			const isSun = this == sun;
			const actualSun = this.color == '#ff3';
			const isEarth = this.color == '#03f';
			const dir = Math.atan2(useSun && !zoomed ? sun.y : this.startY - this.y, useSun && !zoomed ? sun.x : this.startX - this.x);
			const lx = actualSun ? 0 : Math.cos(dir);
			const ly = actualSun ? 0 : Math.sin(dir);
			color = spaceContext.createRadialGradient(
				this.x + this.radius * lx * tween.scale * 0.6,
				this.y + this.radius * ly * tween.scale * 0.6,
				actualSun || isEarth ? 2 : this.radius * tween.scale * 0.5,
				this.x + lx * tween.scale,
				this.y + ly * tween.scale,
				this.radius * tween.scale * 1.1
			);
			color.addColorStop(0, `rgba(255,255,255,${isEarth ? 0.5 : this.color == '#f94' ? 0.1 : 0.2})`);
			if (isSun && !isEarth) {
				if (actualSun) {
					color.addColorStop(0.6, "rgba(255,192,0,0.25)");
					color.addColorStop(0.9, "rgba(255,99,0,0.5)");
				} else {
					color.addColorStop(0.3, "rgba(99,99,99,0.1)");
				}
			} else {
				color.addColorStop(0.9, "rgba(0,0,0,0.5)");
			}
			color.addColorStop(1, "rgba(0,0,0,0.4)");
		}

		spaceContext.beginPath();
		spaceContext.arc(this.x, this.y, this.radius * tween.scale, start, end, false);
		spaceContext.fillStyle = color;
		spaceContext.fill();
		spaceContext.closePath();
	}

	draw3d() {
		if (this.moons) {
			// draw planet upper part color and shadow to cover other planets in order to create a 3d illusion
			this.drawArc(false, true, Math.PI, 0);
			this.drawArc(true, false, Math.PI, 0);
			this.moons.forEach(planet => planet.draw3d());
		}
	}
}
