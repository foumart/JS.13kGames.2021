
let running;

//const planetsWidth = [19200, 19200, 19200, 19200];

let stageWidth;
let planetWidth;

let bgrX = 0;
let step = 0;

let shipY = 400;
let playerX = 0;

let bgrMountines;
const mountineHills = [20, 50, 100, 50];
const mapOffsetY = 100;//height of mountines on minimap

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
	bgrX = 0;console.log(system, state, selectedPlanet);
	stageWidth = (system == 2 && selectedPlanet ? 18 : (system > 2 ? sun.moons[selectedPlanet].radius / 5 : sun.moons[selectedPlanet].radius - 2)) * 1920;
	console.log(stageWidth, stageWidth/1920);
	planetWidth = stageWidth / hardWidth;
	playerX = -stageWidth / (2 - planetWidth / 10);
	addBgrStars();
	drawBgr();
	generateSurface();
	draw();
	resize();
}

function addBgrStars() {
	for (let i = 0; i < 100; i++) {
		bgrStars.push(new Star(bgrCanvas.width / 2, bgrCanvas.height - 300, bgrContext));
	}
}

function drawBgr() {
	bgrContext.beginPath();
	const gradient = bgrContext.createLinearGradient(0, 50, 0, hardHeight);
	const red = selectedPlanet == 1 ? 3 : selectedPlanet == 3 ? 4 : 1;
	const blue = selectedPlanet == 2 ? 4 : selectedPlanet == 3 ? 2 : 1;
	const green = selectedPlanet == 2 ? 3 : selectedPlanet == 3 ? 0 : 1;
	const colors = [
		[[2,3,4],[0,2,3],[0,0,2],[1,0,2],[3,1,1],.3],
		[[4,3,0],[3,2,0],[2,1,0],[2,0,1],[2,2,4],.4],
		[[2,3,4],[0,3,4],[0,0,3],[0,0,2],[3,0,0],.2],
		[[4,0,2],[3,0,1],[2,0,0],[2,0,1],[3,0,2],.1],
	];
	gradient.addColorStop(0, `rgba(${red*colors[selectedPlanet][0][0]*16},${green*colors[selectedPlanet][0][1]*16},${blue*colors[selectedPlanet][0][2]*16}, ${colors[selectedPlanet][5]*2})`);
	gradient.addColorStop(.2, `rgba(${red*colors[selectedPlanet][1][0]*16},${green*colors[selectedPlanet][1][1]*16},${blue*colors[selectedPlanet][1][2]*16}, ${colors[selectedPlanet][5]*1})`);
	gradient.addColorStop(.4, `rgba(${red*colors[selectedPlanet][2][0]*16},${green*colors[selectedPlanet][2][1]*16},${blue*colors[selectedPlanet][2][2]*16}, ${colors[selectedPlanet][5]*0})`);
	gradient.addColorStop(.6, `rgba(${red*colors[selectedPlanet][3][0]*16},${green*colors[selectedPlanet][3][1]*16},${blue*colors[selectedPlanet][3][2]*16}, ${colors[selectedPlanet][5]*1})`);
	gradient.addColorStop(1, `rgba(${red*colors[selectedPlanet][4][0]*16},${green*colors[selectedPlanet][4][1]*16},${blue*colors[selectedPlanet][4][2]*16}, ${colors[selectedPlanet][5]*2})`);
	bgrContext.fillStyle = gradient;
	bgrContext.rect(0, 100, hardWidth*2, hardHeight - 100);
	bgrContext.fill();
	bgrContext.closePath();

	bgrStars.forEach(star => star.draw(0, 100));
	bgrStars.forEach(star => star.draw(hardWidth, 100));
}

function generateSurface() {
	//generate mountines
	bgrMountines = [[0, 0]];
	for (c = 1; c < mountineHills[selectedPlanet]; c++) {
		r = Math.random();
		bgrMountines.push([
			(stageWidth / mountineHills[selectedPlanet]) * c + r * (stageWidth / mountineHills[selectedPlanet]) / 2,
			!selectedPlanet
					?
				-25 + r * 25 * (c % 2 == 0 ? 1 : -1)
					: 
			selectedPlanet == 1
					?
				~~(c / (2 + r*3)) % 2 ? -25 + r * 25 * (c % 2 == 0 ? 1 : -1) : 150 - 50 * r
					:
			selectedPlanet ==2
					?
				~~(c / 20) % 2 == 0 ? (~~(c / 5) % 2 ? -80 : -25) + r * 25 * (c % 2 == 0 ? 1 : -1) : 150
					: 50
		]);
	}
	bgrMountines.push([stageWidth, 0]);
}

/*function drawMenuBgr(){
	moveBgr();
	if(!step) requestAnimationFrame(drawMenuBgr);
}*/

// side scrolling
function moveBgr() {//stageWidth//playerX
	if (tween.speed > 0) {
		bgrX += Math.abs(tween.speed / 2);
		if (bgrX > hardWidth) {
			bgrX = bgrX - hardWidth;
		}
		playerX += Math.round(Math.abs(tween.speed));
		if (playerX > stageWidth) {
			playerX = playerX - stageWidth;
		}
	} else {
		bgrX -= Math.abs(tween.speed / 2);
		if (bgrX < 0) {
			bgrX = hardWidth+bgrX;
		}
		playerX -= Math.round(Math.abs(tween.speed));
		if (playerX < 0) {
			playerX = stageWidth+playerX;
		}
	}
	bgrCanvas.style.transform = `translateX(${-hardWidth + bgrX}px)`;// translateY(-"+(shipY/4)+"px)";
}


//function startGame(){
	//document.getElementById("controls").style.display = "none";
	//document.removeEventListener("keydown", menuDownHandler);
	//menuCanvas.removeEventListener("click", menuClick);
	//menuCanvas.style.cursor="auto";
	//menuContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	//if(!level) level = 1;
	//distance = 0;
	
//}

function draw() {
	step++;
	//if(invulnerable) invulnerable--;
	moveBgr();
	gameContext.clearRect(0, 100, gameCanvas.width, gameCanvas.height-100);

	//if(leftPressed) {
	//if(shipSpeedX > -speedLimit+2) shipSpeedX -= (speedLimit-Math.abs(shipSpeedX))/speedEase;
	//}

	// draw minimap bgr color
	gameContext.beginPath();
	gameContext.fillStyle = "#111";
	gameContext.rect(0, 0, gameCanvas.width, mapOffsetY);
	gameContext.fill();
	gameContext.closePath();

	// draw mountines on the minimap
	gameContext.beginPath();
	gameContext.fillStyle = selectedPlanet == 2 ? "#143" : "#623";
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
	gameContext.globalAlpha = 0.08;
	gameContext.beginPath();
	gameContext.fillStyle = "#fff";
	gameContext.rect(hardWidth-160 - playerX/planetWidth + (hardWidth-320)/10, 0, hardWidth/planetWidth, mapOffsetY);
	if (playerX < hardWidth) {
		gameContext.rect(0, 0, (hardWidth - playerX) / planetWidth, mapOffsetY);
	}
	gameContext.fill();
	gameContext.closePath();
	gameContext.globalAlpha = 1;
	
	/*gameContext.beginPath();
	gameContext.fillStyle = "#86939b";//"#ffffff"
	gameContext.rect(hardWidth - playerX/planetWidth + (hardWidth-320)/(tween.speed>0?7:7.2), mapOffsetY-120 + 56*(shipY/850), 30, 6);
	gameContext.rect(hardWidth - playerX/planetWidth + (hardWidth-320)/(tween.speed>0?7:7.2)+10, mapOffsetY-125 + 56*(shipY/850), 10, 16);
	if (playerX < hardWidth) {
		gameContext.rect((hardWidth-playerX)/planetWidth - (hardWidth-320)/(tween.speed>0?6.4:6.2), mapOffsetY-120 + 56*(shipY/850), 30, 6);
		gameContext.rect((hardWidth-playerX)/planetWidth - (hardWidth-320)/(tween.speed>0?6.4:6.2)+10, mapOffsetY-125 + 56*(shipY/850), 10, 16);
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
		gameContext.beginPath();
		const reds = selectedPlanet == 1 ? i + i*2 : i;
		const greens = selectedPlanet == 1 ? 0 : i == 1 ? 5 : i+2;
		const blues = selectedPlanet == 2 && !i ? 8 : 3;
		gameContext.fillStyle = `#${reds}0${greens}0${blues}0`;
		gameContext.moveTo(0, hardHeight-90);//(shipY/4));
		const surfaceHeight = selectedPlanet == 2 ? (180-i*15) : (200-i*25);
		if (selectedPlanet != 2 || i) {
			for (n = 0; n < bgrMountines.length; n++) {
				gameContext.lineTo(bgrMountines[n][0], hardHeight - surfaceHeight + bgrMountines[n][1] * (i==3 ? 0.5 : i==4 ? 0.3 : 1 + i/6) + i * (i > 2 ? i*5 : 10));
			}
			for (n = 0; n < bgrMountines.length; n++) {
				gameContext.lineTo(stageWidth+bgrMountines[n][0], hardHeight - surfaceHeight + bgrMountines[n][1] * (i==3 ? 0.5 : i==4 ? 0.3 : 1 + i/6) + i * (i > 2 ? i*5 : 10));
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
