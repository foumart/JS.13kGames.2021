
let running;

let stageWidth;
let planetWidth;

let bgrX = 0;
let step = 0;

let shipY = 400;
let playerX = 0;
let isEarth;
let isMoon;
let bgrMountines;
const mapOffsetY = 100;//height of mountines on minimap
let frameOffsetX;
let frameWidth;
const offset = ~~(system / 2);

let r, n, c;

/*var shipSpeedX = 45;
var shipSpeedY = -15;
var shipSightY = 5;
var speedLimit = 50;
var speedEase = 8;*/

let bgrStars = [];

function runSurface() {
	game.onwheel = null;
	running = true;
	bgrX = 0;

	if (selectedPlanet == -1) {
		selectedPlanet = 2;
		isEarth = true;
	}
	if (system == 2 && !selectedPlanet) {
		isMoon = true;
	}

	stageWidth = Math.ceil(isEarth ? 10 : isMoon ? 5 : sun.moons[selectedPlanet].radius / 2) * 1920;
	console.log('surface:', stageWidth/1920, stageWidth);

	planetWidth = stageWidth / hardWidth;
	playerX = -stageWidth / 2 + stageWidth / planetWidth / 2;
	addBgrStars();
	drawBgr();
	generateSurface();
	draw();
	resize();
}

function addBgrStars() {
	for (let i = 0; i < 90; i++) {
		bgrStars.push(new Star(bgrCanvas.width / 2, bgrCanvas.height - 300, bgrContext));
	}
}

// draw the sky gradient
function drawBgr() {
	bgrStars.forEach(star => star.draw(0, 100));
	bgrStars.forEach(star => star.draw(hardWidth, 100));
	bgrContext.beginPath();
	const gradient = bgrContext.createLinearGradient(0, 50, 0, hardHeight);
	const red = isEarth ? 2 : isMoon ? 3 : [4, 4 - offset, 2, 4][selectedPlanet];
	const green = isEarth ? 3 : isMoon ? 3 : [2, 3, 2, 1][selectedPlanet];
	const blue = isEarth ? 4 : isMoon ? 4 : [3, 2 + offset, 1 + offset, 3][selectedPlanet];
	const colors = [
		isMoon
			? [[2,3,4], [4,3,3], [2,2,2], [3,2,2], [3,2,3], [.3,.2,.1,.3,.5]]// Moon
			: [[4-offset,3,3], [4-offset,1,2], [1,0,1], [4-offset,1,2], [4-offset,2,3], [.3,.2,.1,.3,.6]],// Mercury / Io
		[[4-offset,3,1+offset], [3-offset,2,1+offset], [2,1,1+offset], [2,0,1+offset], [3-offset,2,1+offset], [.6,.4,.2,.4,.6]],// Venus / Europa
		isEarth
			? [[2,3,4], [1,3,4], [0,1,3], [1,3,4], [2,3,4], [.3,.1,.2,.3,.5]]// Earth
			: [[4,3,2], [4,3,0], [3,0,0], [2,0,0], [0,0,3], [.3,.2,.1,.1,.2]],// Ganimede
		[[4,0,2], [3,0,1], [2,0,0], [2,0,1], [3,0,2], [.4,.2,.1,.3,.6]],// Mars / Callisto
	];
	for (let i = 0; i < 5; i++) {
		gradient.addColorStop(
			i / 4.2,
			getRGBA(red*colors[selectedPlanet][i][0], green*colors[selectedPlanet][i][1], blue*colors[selectedPlanet][i][2], colors[selectedPlanet][5][i])
		);
	}
	bgrContext.fillStyle = gradient;
	bgrContext.rect(0, 100, hardWidth*2, hardHeight - 90);
	bgrContext.fill();
	bgrContext.closePath();
}

function getRGBA(red, green, blue, alpha) {
	return `rgba(${red*16},${green*16},${blue*16},${alpha})`;
}

function generateSurface() {
	//generate mountines
	bgrMountines = [[0, 0]];
	let len = isEarth ? 90 : (system < 2 ? [59, 60, 90, 60] : [59, 32, 60, 50])[selectedPlanet];
	for (c = 1; c < len; c++) {
		r = Math.random();
		bgrMountines.push([
			(stageWidth / len) * c + r * (stageWidth / len) / 2,
			!selectedPlanet
					?
				-25 + r * 25 * (c % 2 == 0 ? 1 : -1)
					: 
			selectedPlanet == 1 && system < 2
					?
				~~(c / (2 + r*3)) % 2 ? -25 + r * 25 * (c % 2 == 0 ? 1 : -1) : 150 - 50 * r
					:
			selectedPlanet == 1 && system > 2
					?
				(c % 2 == 0 ? -r/2 : r) * 40 * (c % 2 == 0 ? 1 : -1)
					:
			isEarth || selectedPlanet == 3
					?
				~~(c / 16.2) % 2 == 0 && c > 3 || c == 62 || c == 63 || c == 2 || (c > 19 && c < 32)
								?
							(~~(c / 5) % 2 ? -80 : -25) + r * 25 * selectedPlanet * (c % 2 == 0 ? 1 : -1)
								:
							isEarth ? 175 : 100 * r
					:
				r * 10 * selectedPlanet * (c % 2 == 0 ? 1 : -1)
		]);
	}
	bgrMountines.push([stageWidth, 0]);
	console.log(selectedPlanet, system, bgrMountines);
}

function draw() {
	step++;
	//if(invulnerable) invulnerable--;
	moveBgr();

	//if(leftPressed) {
	//if(shipSpeedX > -speedLimit+2) shipSpeedX -= (speedLimit-Math.abs(shipSpeedX))/speedEase;
	//}

	// draw minimap bgr color
	gameContext.beginPath();
	gameContext.fillStyle = "#112";
	gameContext.rect(0, 0, gameCanvas.width, mapOffsetY);
	gameContext.fill();
	gameContext.closePath();

	// draw mountines on the minimap
	gameContext.beginPath();
	gameContext.fillStyle = '#' + (isEarth ? 143 : isMoon ? 555 : (system < 2 ? [534, 740, , 822] : [541, 245, 433, 514])[selectedPlanet]);
	gameContext.moveTo(0, mapOffsetY - 10);
	for (n = 0; n < bgrMountines.length; n++) {
		gameContext.lineTo(bgrMountines[n][0] / planetWidth, mapOffsetY - 15 + bgrMountines[n][1] / planetWidth);
	}
	gameContext.lineTo(gameCanvas.width, mapOffsetY - 10);
	gameContext.lineTo(gameCanvas.width, mapOffsetY);
	gameContext.lineTo(0, mapOffsetY);
	gameContext.fill();
	gameContext.closePath();

	// draw minimap frame
	gameContext.beginPath();
	gameContext.fillStyle = getRGBA(9,9,9,.2);
	frameOffsetX = hardWidth-160 - playerX/planetWidth + (hardWidth-320)/10;
	frameWidth = hardWidth/planetWidth;
	gameContext.rect(frameOffsetX, 0, frameWidth, mapOffsetY);
	if (playerX < hardWidth) {
		gameContext.rect(0, 0, (hardWidth - playerX) / planetWidth, mapOffsetY);
	}
	gameContext.fill();
	gameContext.closePath();

	// clear the game area
	gameContext.clearRect(0, 100, gameCanvas.width, gameCanvas.height-100);
	
	/*gameContext.beginPath();
	gameContext.fillStyle = "#86939b";//"#ffffff"
	gameContext.rect(hardWidth - playerX/planetWidth + (hardWidth-320)/(frame.speed>0?7:7.2), mapOffsetY-120 + 56*(shipY/850), 30, 6);
	gameContext.rect(hardWidth - playerX/planetWidth + (hardWidth-320)/(frame.speed>0?7:7.2)+10, mapOffsetY-125 + 56*(shipY/850), 10, 16);
	if (playerX < hardWidth) {
		gameContext.rect((hardWidth-playerX)/planetWidth - (hardWidth-320)/(frame.speed>0?6.4:6.2), mapOffsetY-120 + 56*(shipY/850), 30, 6);
		gameContext.rect((hardWidth-playerX)/planetWidth - (hardWidth-320)/(frame.speed>0?6.4:6.2)+10, mapOffsetY-125 + 56*(shipY/850), 10, 16);
	}
	gameContext.fill();
	gameContext.closePath();*/

	// draw enemies on the minimap
	/*for(var n = 0; n < enemies.length; n++){
		if(enemies[n].health>0 && enemies[n].y>-120-enemies[n].type*5){
			gameContext.beginPath();
			gameContext.fillStyle = !enemies[n].type?"#334196":enemies[n].type==1?"#86464f":"#338e49";
			gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10 + enemies[n].x/4 , mapOffsetY-120 + 56*(enemies[n].y/1000), 5, enemies[n].cargo.length&&!enemies[n].type?15:5);
			gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10 + enemies[n].x/4-5 , mapOffsetY-115 + 56*(enemies[n].y/1000), 15, 5);
			gameContext.rect(enemies[n].x/4 - (playerX/4), mapOffsetY-120 + 56*(enemies[n].y/1000), 5, enemies[n].cargo.length&&!enemies[n].type?15:5);
			gameContext.rect(enemies[n].x/4-5 - (playerX/4), mapOffsetY-115 + 56*(enemies[n].y/1000), 15, 5);
			gameContext.fill();
			gameContext.closePath();
		}
	}

	// draw houses and cats on the minimap
	for(n = 0; n < objects.length; n++){
		gameContext.beginPath();
		gameContext.fillStyle = "#39934f";//#66ff66";
		gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10 + objects[n].x/4-5 , mapOffsetY-72, 10, 5);
		gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10 + objects[n].x/4-15 , mapOffsetY-67, 30, 5);
		gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10 + objects[n].x/4-10 , mapOffsetY-62, 20, 7);
		gameContext.rect(objects[n].x/4-5 - (playerX/4), mapOffsetY-72, 10, 5);
		gameContext.rect(objects[n].x/4-15 - (playerX/4), mapOffsetY-67, 30, 5);
		gameContext.rect(objects[n].x/4-10 - (playerX/4), mapOffsetY-62, 20, 7);
		gameContext.fill();
		gameContext.closePath();
	}
	for(n = 0; n < cats.length; n++){
		if(!cats[n].abducted){
			gameContext.beginPath();
			gameContext.fillStyle = "#39469c";//"#6666ff";
			var offsetY = cats[n].taken ? (1000 - cats[n].taker.y)/16-20 : (cats[n].initialY-cats[n].y)/20;
			if(offsetY<0) offsetY = 0;
			gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10 + cats[n].x/4 , mapOffsetY-68 - offsetY, 3, 14);
			gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10 + cats[n].x/4+7 , mapOffsetY-68 - offsetY, 3, 14);
			gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10 + cats[n].x/4-3 , mapOffsetY-64 - offsetY, 16, 10);
			gameContext.rect(cats[n].x/4 - (playerX/4), mapOffsetY-68 - offsetY, 3, 14);
			gameContext.rect(cats[n].x/4+7 - (playerX/4), mapOffsetY-68 - offsetY, 3, 14);
			gameContext.rect(cats[n].x/4-3 - (playerX/4), mapOffsetY-64 - offsetY, 16, 10);
			gameContext.fill();
			gameContext.closePath();
		}
	}*/

	// draw big mountines
	gameContext.save();
	gameContext.translate(playerX-stageWidth, 0);
	for (let i = 0; i < 5; i++) {
		if (i == 3) {
			gameContext.beginPath();
			gameContext.fillStyle = `rgba(99,99,99,0.5)`;
			gameContext.arc(2000, 900, 200, Math.PI, 2 * Math.PI);
			gameContext.closePath();
			gameContext.fill();
		}
		gameContext.beginPath();
		const reds = isEarth ? i : isMoon ? 1+i*2 : !selectedPlanet ? 2-offset+i*2 : selectedPlanet == 1 ? 3+i%3+i*i : selectedPlanet == 3 ? i%2*2+i*3 : i;
		const greens = isEarth ? 1+i*2 : isMoon ? 1+i*2 : !selectedPlanet ? offset+i*2 : selectedPlanet == 1 ? i%3+i*i : selectedPlanet == 3 ? i : i == 1 ? 3 : i;
		const blues = isEarth ? !i?8:2 : isMoon ? 1+i*2 : !selectedPlanet ? 1+i*2 : selectedPlanet == 1 ? 1+i%2*i : selectedPlanet == 3 ? i : i==1 ? 5 : 2;
		gameContext.fillStyle = `#${reds.toString(16)}0${greens.toString(16)}0${blues.toString(16)}0`;
		gameContext.moveTo(0, hardHeight-90);//(shipY/4));
		const surfaceHeight = !selectedPlanet ? (200-i*i*5) : selectedPlanet == 2 ? (180-i*15) : (200-i*25);
		let x, y, distance, previousX = 0;
		if (!isEarth || i) {
			for (n = 0; n < bgrMountines.length + bgrMountines.length / (planetWidth - 1); n++) {
				x = (n >= bgrMountines.length ? stageWidth : 0) + bgrMountines[n % bgrMountines.length][0];
				y = hardHeight - surfaceHeight + bgrMountines[n % bgrMountines.length][1] * (i==3 ? 0.5 : i==4 ? 0.3 : 1 + i/6) + i * (i > 2 ? i*5 : 10);
				distance = x - previousX;
				if (isMoon && (((n % 5 == 0 || n % 2 == 0) && n % 4 > 0 && i < 3) || (n % 6 == 0 && n != 30 && i == 3) || (n % 4 == 0 && n % 5 > 0 && n % 6 > 0 && i == 4))) {
					// moon surface full with craters
					gameContext.bezierCurveTo(x - distance, y + 60 - i * 5, x, y + 60 - i * 5, x, y);
				} else if (!selectedPlanet && ((n % 5 == 0 && i < 3) || (n % 2 == 0 && n % 5 > 0 && n % 6 > 0 && i == 4))) {
					// mercury like crater surface
					gameContext.bezierCurveTo(x - distance, y + 60 - i * 4, x, y + 60 - i * 4, x, y);//-250
				} else if (selectedPlanet == 2 && system > 2) {
					// desert like
					gameContext.bezierCurveTo(x - 50, y + 20 + i * 10, x - 25, y + 20 + i * 10, x, y);
				} else if (selectedPlanet == 2 && system == 3) {
					// valleys water like
					gameContext.bezierCurveTo(x - distance/ 2, y + 20 + i * 10, x - distance / 2, y + 20 + i * 10, x, y);
				} else {
					// rocky surface
					gameContext.lineTo(x, y);
				}
				previousX = x;
			}
		}
		gameContext.lineTo(stageWidth+hardWidth, hardHeight - 90);
		gameContext.lineTo(stageWidth+hardWidth, hardHeight);
		gameContext.lineTo(0, hardHeight);
		gameContext.closePath();
		gameContext.fill();
	}
	
	gameContext.translate(0, 0);
	gameContext.restore();

	if (state == 2) {
		if (running) requestAnimationFrame(draw);
	} else {
		// get back to solar system mode
		//bgrContext.clearRect(0,0, hardWidth*2, hardHeight);
		//gameCanvas.style.display = 'none';
		//spaceCanvas.style.display = 'block';
		//spaceDiv.style.display = 'block';
		//toggleZoom();
		//tweenToPlanet(sun.moons[selectedPlanet]);
		//console.log(tween)
	}
}

// side scrolling
function moveBgr() {
	if (frame.speed > 0) {
		bgrX += Math.abs(frame.speed / 2);
		if (bgrX > hardWidth) {
			bgrX = bgrX - hardWidth;
		}
		playerX += Math.round(Math.abs(frame.speed));
		if (playerX > stageWidth) {
			playerX = playerX - stageWidth;
		}
	} else {
		bgrX -= Math.abs(frame.speed / 2);
		if (bgrX < 0) {
			bgrX = hardWidth+bgrX;
		}
		playerX -= Math.round(Math.abs(frame.speed));
		if (playerX < 0) {
			playerX = stageWidth+playerX;
		}
	}
	bgrCanvas.style.transform = `translateX(${-hardWidth + bgrX}px)`;// translateY(-"+(shipY/4)+"px)";
}
