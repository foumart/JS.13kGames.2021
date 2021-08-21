
var running;

var stageWidth = 7680;

var globalSpeed = 1;
var backgroundSpeed = 10;
var distance = 0;
var bgrX = 0;
var step = 0;

var shipX = hardWidth/2-230;
var shipY = 400;
var playerX = 0;

var bgrMountines;
var mountineHills = 50;
var mapOffsetY = 120;//height of mountines

//var bgr_image;
var n, c;

var shipSpeedX = 45;
var shipSpeedY = -15;
var shipSightY = 5;
var speedLimit = 50;
var speedEase = 8;

function runSurface() {
	//bgr_image = new Image();
	//bgr_image.src = 'assets/bgr.jpg';
	//bgr_image.onload = ready;
	ready();
}

function ready() {
	drawBgr(true);
	drawMenuBgr();

	//setTimeout(startGame, 500);
	startGame();
}

function drawBgr(overlay) {
	//bgrContext.drawImage(bgr_image, 0, 0, hardWidth, hardHeight);
	//bgrContext.drawImage(bgr_image, hardWidth, 0, hardWidth, hardHeight);
	if (overlay) {
		bgrContext.beginPath();
		var gradient = bgrContext.createLinearGradient(0, 50, 0, hardHeight);
		gradient.addColorStop(0, 'rgba(32,64,92, 0.25)');
		gradient.addColorStop(0.1, 'rgba(0,64,92, 0.2)');
		gradient.addColorStop(.4, 'rgba(0,0,64, 0.1)');
		gradient.addColorStop(.6, 'rgba(0,0,32, 0.25)');
		gradient.addColorStop(1, 'rgba(60,0,0, 0.75)');
		bgrContext.fillStyle = gradient;
		bgrContext.rect(0,0, hardWidth*2, hardHeight);
		bgrContext.fill();
		bgrContext.closePath();
	}
}

function drawMenuBgr(){
	moveBgr();
	if(!step) requestAnimationFrame(drawMenuBgr);
}

// side scrolling
function moveBgr(){//stageWidth//playerX
	if(globalSpeed>0){
		distance += Math.abs(globalSpeed);//console.log(Math.round(Math.abs(globalSpeed)));
		bgrX += Math.abs(globalSpeed/2);
		if(bgrX > hardWidth){
			bgrX = bgrX - hardWidth;
		}
		playerX += Math.round(Math.abs(globalSpeed));
		if(playerX > stageWidth){
			playerX = playerX - stageWidth;
		}
		bgrCanvas.style.transform = "translateX("+(-hardWidth+bgrX)+"px)";// translateY(-"+(shipY/4)+"px)";
	} else {
		distance += Math.abs(globalSpeed);
		bgrX -= Math.abs(globalSpeed/2);
		if(bgrX < 0){
			bgrX = hardWidth+bgrX;
		}
		playerX -= Math.round(Math.abs(globalSpeed));
		if(playerX < 0){
			playerX = stageWidth+playerX;
		}
		bgrCanvas.style.transform = "translateX("+(-hardWidth+bgrX)+"px)";// translateY(-"+(shipY/4)+"px)";
	}
}


function startGame(){
	//document.getElementById("controls").style.display = "none";
	//document.removeEventListener("keydown", menuDownHandler);
	//menuCanvas.removeEventListener("click", menuClick);
	//menuCanvas.style.cursor="auto";
	//menuContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	//if(!level) level = 1;
	distance = 0;
	bgrX = 0;
	playerX = 0;
	initGame();
}

function initGame(){//console.log("init level:"+level);
	drawBgr();
	generateLevel();
	//addEventListeners();
	draw();
	resize();
}

function generateLevel() {
	//generate mountines
	bgrMountines = [[0, 0]];
	for(c=1; c<mountineHills; c++) {
		bgrMountines.push([(stageWidth/mountineHills) * c + Math.random()*(stageWidth/mountineHills)/2, 25 + Math.random()*25*(c%2==0?1:-1)]);
	}
	bgrMountines.push([stageWidth, 0]);
}

function draw() {
	step++;
	//if(invulnerable) invulnerable--;
	moveBgr();
	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

	//if(leftPressed) {
		if(shipSpeedX > -speedLimit+2) shipSpeedX -= (speedLimit-Math.abs(shipSpeedX))/speedEase;
	//}

	// draw minimap
	//menuContext.clearRect(0, mapOffsetY-120, gameCanvas.width, 70);
	gameContext.globalAlpha = 0.08;
	gameContext.beginPath();
	gameContext.fillStyle = "#ddeeff";
	gameContext.rect(gameCanvas.width-160 - playerX/4 + (hardWidth-320)/10, mapOffsetY-122, hardWidth/4, 70);
	if(playerX<hardWidth) gameContext.rect(0, mapOffsetY-118, (hardWidth-playerX)/4, 66);
	gameContext.fill();
	gameContext.closePath();
	gameContext.globalAlpha = 1;
	gameContext.beginPath();
	gameContext.fillStyle = "#86939b";//"#ffffff"
	gameContext.rect(gameCanvas.width - playerX/4 + (hardWidth-320)/(globalSpeed>0?7:7.2), mapOffsetY-120 + 56*(shipY/850), 30, 6);
	gameContext.rect(gameCanvas.width - playerX/4 + (hardWidth-320)/(globalSpeed>0?7:7.2)+10, mapOffsetY-125 + 56*(shipY/850), 10, 16);
	if(playerX<hardWidth) {
		gameContext.rect((hardWidth-playerX)/4 - (hardWidth-320)/(globalSpeed>0?6.4:6.2), mapOffsetY-120 + 56*(shipY/850), 30, 6);
		gameContext.rect((hardWidth-playerX)/4 - (hardWidth-320)/(globalSpeed>0?6.4:6.2)+10, mapOffsetY-125 + 56*(shipY/850), 10, 16);
	}
	gameContext.fill();
	gameContext.closePath();
	
	// draw mountines on the minimap
	gameContext.beginPath();
	gameContext.fillStyle = "#0c3c35";//#339944";
	gameContext.moveTo(0, mapOffsetY-60);
	for(n = 0; n < bgrMountines.length; n++){
		gameContext.lineTo(bgrMountines[n][0]/4, mapOffsetY-65 + bgrMountines[n][1]/4);
	}
	gameContext.lineTo(gameCanvas.width, mapOffsetY-60);
	gameContext.lineTo(gameCanvas.width, mapOffsetY-50);
	gameContext.lineTo(0, mapOffsetY-50);
	gameContext.fill();
	gameContext.closePath();

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
	gameContext.beginPath();
	gameContext.fillStyle = "#143e37";//"#339944";
	gameContext.moveTo(0, hardHeight-(shipY/3));
	for(n = 0; n < bgrMountines.length; n++){
		gameContext.lineTo(bgrMountines[n][0] + 25 - n, hardHeight-(shipY/3) + bgrMountines[n][1]);
	}
	for(n = 0; n < bgrMountines.length/4; n++){
		gameContext.lineTo(stageWidth+bgrMountines[n][0], hardHeight-(shipY/3) + bgrMountines[n][1]);
	}
	gameContext.lineTo(stageWidth+hardWidth, hardHeight-(shipY/3));
	gameContext.lineTo(stageWidth+hardWidth, hardHeight);
	gameContext.lineTo(0, hardHeight);
	gameContext.closePath();
	gameContext.fill();

	gameContext.beginPath();
	gameContext.fillStyle = "#205a3e";//"#44aa55";
	gameContext.moveTo(0, 10+hardHeight-(shipY/3));
	for(n = 0; n < bgrMountines.length; n++){
		gameContext.lineTo(bgrMountines[n][0], 10+hardHeight-(shipY/3) + bgrMountines[n][1]*1.5);
	}
	for(n = 0; n < bgrMountines.length/4; n++){
		gameContext.lineTo(stageWidth+bgrMountines[n][0], 10+hardHeight-(shipY/3) + bgrMountines[n][1]*1.5);
	}
	gameContext.lineTo(stageWidth+hardWidth, 10+hardHeight-(shipY/3));
	gameContext.lineTo(stageWidth+hardWidth, hardHeight);
	gameContext.lineTo(0, hardHeight);
	gameContext.closePath();
	gameContext.fill();
	
	gameContext.translate(0, 0);
	gameContext.restore();

	if (state == 2) {
		if (running) requestAnimationFrame(draw);
	} else {
		bgrContext.clearRect(0,0, hardWidth*2, hardHeight);
		toggleZoom();
	}
}
