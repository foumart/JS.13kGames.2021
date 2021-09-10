// Planet / Moon surface view script
// ---------------------------------

let running;

// height of the minimap
const surfaceHeight = 150;
// width of the minimap frame
let frameWidth;
let frameOffsetX;
// total stage width in pixels
let stageWidth;
// total window screens contained within a stage
let planetWidth;
// number of drawn frames so far
let step = 0;

let bgrX = 0;
let playerX = 0;
let isEarth;
let isMoon;
let bgrMountines;

const offset = 0 | system / 2;
const structuresSize = 30;
let structures;
let activeStructure;

// Progress related:

let ore = 10;
let silica = 10;
let metal = 5;
let carbon = 1;

let gameObjects = [
	[320, 220, 6, 128752],
	[5320, 230, 9, 129666],
	[5331, 255, 4, 127792]
];

/*
let shipY = 400;
var shipSpeedX = 45;
var shipSpeedY = -15;
var shipSightY = 5;
var speedLimit = 50;
var speedEase = 8;*/

//
let bgrStars = [];
addBgrStars();
function addBgrStars() {
	for (i = 0; i < 90; i++) {
		bgrStars.push(new Star(bgrCanvas.width / 2, bgrCanvas.height - 400, bgrContext));
	}
}
// office:127971, hospital:127973, ice block:129482, satellite:128225/128752, rocket:128640, ufo:128760, helicopter:128641, rock: 129704
// diamond:128142, measure:128476, milky way:127756, telescope:128301, microscope:128300, parachute: 129666, nut: 127792, crane: 127959
// vulcano: 127755, 9968, 127956
//                    0       1       2     3       4       5       6       7       8       9       10      11      12      13      14
//                    hut     house   jar   leafs   cactus  pine    tree    palm,   leafs   oil     headq   factury store   tele    sat
const structureMap = [128726, 127969, 9905, 127806, 127797, 127794, 127795, 127796, 127807, 128738, 127970, 127978, 127980, 128301, 128225,
//                  15      16      17      18      19      20      21      22      23    24      25  
//                  24h     tele b  brokol  brokol  fuji    paprat  amoeb   vulcano mount mount2  fuji
					127981, 127971, 129382, 129382, 128507, 129716, 129440, 127755, 9968, 127956, 128507];

const structureMiniMap = [
	[0,7, 4,7, 4,9, 9,9, 9,7, 13,7, 13,0],
	[0,5, 3,7, 6,5, 9,7, 12,5, 16,8, 19,8, 19,0],
	[0,8, 7,8, 7,6, 12,6, 12,0],
	[2,3, 6,2, 11,9, 16,2, 20,3, 22,0]
]

function runSurface() {
	clearUI();
	running = true;
	bgrX = 0;
	structures = [];//onclick="console.log(this.innerHTML.codePointAt(0))"
	isEarth = selectedPlanet == -1;
	if (isEarth) {
		selectedPlanet = 2;
		structures.push(
			//[13,206.6,5.5,-5], [16,213,5], //observatory
			[5,358,3,-3], [1,353,4.4,3], [5,365,4,-2], [5,360,5,3],
			[12,375,6,-10,0,145,'Depot'],
			[17,395,12,79], [25,417,4,-12], [25,422,9], [25,433.5,6], [6,442,3], [6,447,4,3], [20,498,13,50], 
			[10,473.2,9,-8,0,195,'Headquarters'],// [14,554,5,5], // radar
			[8,515,3], [20,543,8,36], [6,536,3,3], [6,540,4], [7,554,4,5],
			[7,678,5,12],
			[3,698,3,-9], [0,692,4.4,-4], [2,701,2], [4,759,3], [4,763.5],
			[4,826], [0,828,4], [4,834,3,2], [3,854,3,6],
			[15,722,8,-5], [11,716,5,0,0,235,'Refinery'], [9,716,2,-27], [9,718,2,-27],
			[23,764,6], [23,781,4,-22], [23,770,10], [23,791,5], [22,772.7,5.6,-39.5], [23,782,8], [21,842,9,59]
		);
	}
	isMoon = system == 2 && !selectedPlanet;

	stageWidth = Math.ceil(isEarth ? 10 : isMoon ? 5 : sun.moons[selectedPlanet].radius / 2) * 1920;
	console.log('surface width:', stageWidth/1920, stageWidth);

	planetWidth = stageWidth / hardWidth;
	playerX = -stageWidth / 2 + stageWidth / planetWidth / 2;
	frameWidth = hardWidth / planetWidth;

	drawBgr();
	generateSurface();
	draw();
	resize();

	//draw resources:
	if (isEarth) {
		resDiv.innerHTML = `&#x1FAA8; : <b>${ore}</b><br/>&#x1F9CA; : <b>${silica}</b><br/>&#x1F4A0; : <b>${metal}</b><br/>&#x1F48E; : <b>${carbon}</b>`;
	}
	//Res:<div>&#x1F6E2;</div><div>&#x1F4A7;</div>
}

// draw the sky gradient
function drawBgr() {
	bgrContext.clearRect(0, surfaceHeight, hardWidth*2, hardHeight - surfaceHeight);
	bgrStars.forEach(star => star.draw(0, surfaceHeight));
	bgrStars.forEach(star => star.draw(hardWidth, surfaceHeight));
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
	for (i = 0; i < 5; i++) {
		gradient.addColorStop(
			i / 4.2,
			getRGBA(red*colors[selectedPlanet][i][0], green*colors[selectedPlanet][i][1], blue*colors[selectedPlanet][i][2], colors[selectedPlanet][5][i])
		);
	}
	bgrContext.fillStyle = gradient;
	bgrContext.rect(0, surfaceHeight, hardWidth*2, hardHeight - surfaceHeight);
	bgrContext.fill();
	bgrContext.closePath();
}

function generateSurface() {
	//generate mountines
	bgrMountines = [[0, 0]];
	let len = isEarth ? 90 : (system < 2 ? [59, 80, 90, 60] : [59, 32, 60, 50])[selectedPlanet];
	for (x = 1; x < len; x++) {
		r = Math.random();
		bgrMountines.push([
			(stageWidth / len) * x + r * (stageWidth / len) / 2,
			!selectedPlanet
					?
				(0|x/4%2?-50:-5) + r * 25 * (x % 2 == 0 ? 1 : -1)
					: 
			selectedPlanet == 1 && system < 2
					?
				0 | x / (2 + r*3) % 3 ? -25 + r * 90 * (- x % 3 || r) : 90 - 90 * r
					:
			selectedPlanet == 1 && system > 2
					?
				(x % 2 == 0 ? -r/2 : r) * 40 * (x % 2 == 0 ? 1 : -1)
					:
			isEarth || selectedPlanet == 3
					?
				(0 | x / 16.2) % 2 == 0 && x > 2 || [2,19,20,21,32,50,51,52,64].indexOf(x) > -1
								?
							!isEarth && x%10==0  ? -220 : (0 | x / 5 % 2 && x < 70 || x == 20 ? -80 : -25) + r * 25 * selectedPlanet * (x % 2 == 0 ? 1 : -1)
								:
							isEarth ? 175 : 125 * r
					:
				r * 10 * selectedPlanet * (x % 2 == 0 ? 1 : -1)
		]);
	}
	bgrMountines.push([stageWidth, 0]);
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
	gameContext.rect(0, 0, gameCanvas.width, surfaceHeight-16);
	gameContext.fill();
	gameContext.closePath();
	gameContext.beginPath();
	gameContext.fillStyle = "#223";
	gameContext.rect(0, surfaceHeight-16, gameCanvas.width, surfaceHeight);
	gameContext.fill();
	gameContext.closePath();

	// draw mountines on the minimap
	gameContext.beginPath();
	gameContext.fillStyle = "#333";
	gameContext.strokeStyle = '#666';//'#' + (isEarth ? 284 : isMoon ? 555 : (system < 2 ? [534, 740, , 822] : [541, 245, 433, 514])[selectedPlanet]);
	gameContext.lineWidth = 6;
	gameContext.moveTo(0, surfaceHeight);
	for (x = 0; x < bgrMountines.length; x++) {
		gameContext.lineTo(bgrMountines[x][0] / planetWidth, surfaceHeight - 20 + bgrMountines[x][1] / 6);
	}
	gameContext.lineTo(gameCanvas.width, surfaceHeight);
	gameContext.stroke();
	gameContext.fill();
	gameContext.closePath();

	// draw minimap frame
	gameContext.beginPath();
	gameContext.fillStyle = getRGBA(9,9,9,.2);

	frameOffsetX = hardWidth-160 - playerX/planetWidth + (hardWidth-320)/10;
	frameDiv.style.marginLeft = frameOffsetX + 'px';
	gameContext.rect(frameOffsetX, 0, frameWidth, surfaceHeight);
	if (playerX < hardWidth) {
		gameContext.rect(0, 0, (hardWidth - playerX) / planetWidth, surfaceHeight);
	}
	gameContext.fill();
	gameContext.closePath();

	// draw structures on the minimap
	for(i = 0; i < structures.length; i++){
		if (structures[i][0] > 9 && structures[i][0] < 13) {
			gameContext.beginPath();
			gameContext.strokeStyle = '#284';
			gameContext.fillStyle = "#ccc";
			gameContext.lineWidth = 4;
			r = structureMiniMap[structures[i][0] - 10];

			gameContext.moveTo(structures[i][1] * 2, surfaceHeight - 12);
			for (j = 0; j < r.length; j+=2) {
				gameContext.lineTo(structures[i][1] * 2 + r[j] * 2.5, surfaceHeight + r[j+1] * -4 - 12);
			}
			gameContext.closePath();
			gameContext.fill();
			gameContext.stroke();
		}
	}

	// clear the game area
	gameContext.clearRect(0, surfaceHeight, gameCanvas.width, gameCanvas.height - surfaceHeight);

	// draw big mountines
	gameContext.save();
	gameContext.translate(playerX-stageWidth, 0);
	for (i = 0; i < 5; i++) {
		// draw surface emoji objects
		if (i == 3 || i == 4) {
			for (j = 0; j < structures.length; j++) {
				const structureData = structures[j % structures.length];
				for (k = 0; k < (structureData[1] > 50 ? 1 : 2); k++) {
					gameContext.font = structuresSize * (structureData[2] || 2) + 'px emoji';
					if (i == 3) {
						if (structureData[0] > 17) gameContext.fillText(String.fromCodePoint(structureMap[structureData[0]]), stageWidth * k + structureData[1] * 20, 999 + (structureData[3] * 3 || 0));
						if (structureData[4]) {
							gameContext.strokeStyle ='#0f0';
							gameContext.lineWidth = 16;
							gameContext.beginPath();
							gameContext.arc(
								stageWidth * k + structureData[1] * 20 + [136, 180, 85][structureData[0]-10],
								900, structureData[5],
								0, Math.PI * 2
							);
							gameContext.closePath();
							gameContext.stroke();
							// TODO: draw structure menu

						}
					} else {
						if (structureData[0] < 18) gameContext.fillText(String.fromCodePoint(structureMap[structureData[0]]), stageWidth * k + structureData[1] * 20, 999 + (structureData[3] * 3 || 0));
					}
				}
			}
		}

		//let objOffset = stageWidth - structures[id][1] * 20 + stageWidth / planetWidth / 2 - [50, 60, 30][structures[id][0]-10] / scale;

		gameContext.beginPath();
		const reds = isEarth ? playerX < 2000 || playerX > 14500 ? i == 1 ? 5 : i > 3 ? i*2 : i*4 : playerX > 7800 ? i : 1 + i*3
					: isMoon ? 1+i*2 : !selectedPlanet ? 2-offset+i*2 : selectedPlanet == 1 ? 3+i%3+i*i : selectedPlanet == 3 ? i%2*2+i*3 : i;

		const greens = isEarth ? playerX < 2000 || playerX > 14500 ? !i ? 0 : i == 1 ? 9 : i > 3 ? 6 + i*2 : 6 + i*3 : playerX > 7800 ? i*3 : i*3
					: isMoon ? 1+i*2 : !selectedPlanet ? offset+i*2 : selectedPlanet == 1 ? i%3+i*i : selectedPlanet == 3 ? i : i == 1 ? 3 : i;

		const blues = isEarth ? !i ? 8 : playerX < 2000 || playerX > 14500 ? i == 1 ? 12 : i > 3 ? 6 + i*2 : 9 + i*2 : 2
					: isMoon ? 1+i*2 : !selectedPlanet ? 1+i*2 : selectedPlanet == 1 ? 1+i%2*i : selectedPlanet == 3 ? i : i==1 ? 5 : 2;

		gameContext.fillStyle = `#${reds.toString(16)}0${greens.toString(16)}0${blues.toString(16)}0`;
		gameContext.moveTo(0, hardHeight-90);
		const surfaceHeight = !selectedPlanet ? (200-i*i*5) : selectedPlanet == 2 ? (175-i*15) : (200-i*25);
		let distance, previousX = 0;
		if (!isEarth || i) {
			for (r = 0; r < bgrMountines.length + bgrMountines.length / (planetWidth - 1); r++) {
				x = (r >= bgrMountines.length ? stageWidth : 0) + bgrMountines[r % bgrMountines.length][0];
				y = hardHeight - surfaceHeight + bgrMountines[r % bgrMountines.length][1] * (i==3 ? 0.5 : i==4 ? 0.2 : 1 + i/6) + i * (i > 2 ? i*5 : 10);
				distance = x - previousX;
				if (isMoon && (((r % 5 == 0 || r % 2 == 0) && r % 4 > 0 && i < 3) || (r % 6 == 0 && r != 30 && i == 3) || (r % 4 == 0 && r % 5 > 0 && r % 6 > 0 && i == 4))) {
					// moon surface full with craters
					gameContext.bezierCurveTo(x - distance, y + 60 - i * 5, x, y + 60 - i * 5, x, y);
				} else if (!selectedPlanet && ((r % 5 == 0 && i < 3) || (r % 2 == 0 && r % 5 > 0 && r % 6 > 0 && i == 4))) {
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

// TODO: implement game objects

	gameObjects[0][0] += 1;
	gameObjects[1][0] += 1;
	gameObjects[1][1] += 1;
	gameObjects[2][0] += 1;
	gameObjects[2][1] += 1;



	gameObjects.forEach((obj, i) => {
		gameContext.font = obj[2] + '0px emoji';
		gameContext.fillText(String.fromCodePoint(obj[3]), obj[0], obj[1]);
		if (i == 2) {
			gameContext.globalCompositeOperation = 'source-atop';
			gameContext.fillStyle = getRGBA(5,9,16,.3);
			gameContext.beginPath();
			gameContext.arc(obj[0]+20, obj[1]-14, 21, 0, Math.PI * 2);
			gameContext.closePath();
			gameContext.fill();
		}
	})
	
	gameContext.translate(0, 0);
	gameContext.restore();

	

	if (state > 2 && running) {
		requestAnimationFrame(draw);
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
	bgrCanvas.style.transform = `translateX(${-hardWidth + bgrX}px)`;
}

function interactSurface(id) {console.log(structures[id][0], id)
	const newX = stageWidth - structures[id][1] * 20 + stageWidth / planetWidth / 2 - [136, 180, 85][structures[id][0]-10];
	frame.speed = (newX - playerX) / 5.5;
	TweenFX.to(frame, 10, {speed: 0}, 0, () => {
		playerX = newX;
		structures[id][4] = true;
		activeStructure = id;
		menuDiv.innerHTML = `<div><b><u>${structures[id][6]}</u></b></div>`;//<nav style=font-size:42px;width:1790px>Test button</nav><nav style=font-size:40px;width:1890px>Test button</nav>`;//&#x1F6E2;
		if (structures[id][0] == 10) {
			menuDiv.innerHTML += '<nav>Build Observatory - (&#x1FAA8;&#x1FAA8;&#x1FAA8;&#x1F4A0;&#x1F4A0;&#x1F48E;)</nav>';
			menuDiv.innerHTML += '<nav>Build Launch site - (&#x1FAA8;&#x1FAA8;&#x1F4A0;&#x1F4A0;&#x1F9CA)</nav>';
			menuDiv.innerHTML += `<nav onclick='console.log("clicked")'>Build Radar - (&#x1FAA8;&#x1F4A0;&#x1F9CA)</nav>`;
		} else if (structures[id][0] == 11) {
			menuDiv.innerHTML += '<br/><b>Provides 2*</b>&#x1FAA8;<b>, 2*</b>&#x1F9CA<b> and 1*</b>&#x1F4A0;<b> each month</b>';
		}

		//TODO: menu functionality
		
		//menuDiv.innerHTML += '<nav>Launch exploration mission to the Moon</nav>';
		/*for (let i = 0; i < 2; i ++) {
			menuDiv.innerHTML += '<nav>Launch exploration mission to ' + globalPlanets[i].name + '</nav>';
		}*/

		//resDiv.innerHTML = `&#x1FAA8; : <b>${ore}</b><br/>&#x1F9CA; : <b>${silica}</b><br/>&#x1F4A0; : <b>${metal}</b><br/>&#x1F48E; : <b>${carbon}</b>`;

	});
}
