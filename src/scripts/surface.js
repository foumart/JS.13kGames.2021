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

// surface position
let bgrX = 0;
let playerX = 0;

let isEarth;
let isMoon;

// surface altitude data
let bgrMountines;

const offset = 0 | system / 2;
const structuresSize = 30;
let structures;
let activeStructure;

// Progress related:
let oil = 0;
let ore = 0;
let silica = 0;
let metal = 0;
let carbon = 0;

let observatory = false;
let satelite = false;


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

function getStructureOffset(structure) {
	return structure[1] * 20 + [136, 205, 90, 135, 110, 150, 85, 85, 85][structure[0]-10];
}

// office:127971, hospital:127973, ice block:129482, satellite:128225/128752, rocket:128640, ufo:128760, helicopter:128641, rock: 129704
// diamond:128142, measure:128476, milky way:127756, telescope:128301, microscope:128300, parachute: 129666, nut: 127792, crane: 127959
// vulcano: 127755, 9968, 127956

const structureMap = [
//  0       1       2     3       4       5       6       7       8       9       
//  hut     house   jar   leafs   cactus  pine    tree    palm,   leafs   oil     
    128726, 127969, 9905, 127806, 127797, 127794, 127795, 127796, 127807, 128738,

//  10      11      12      13      14      15      16 17 18
//  headqua refiner depot   observa satelit refiner
    127970, 127978, 127980, 128301, 128225, 127978, 0, 0, 0, 

//  19 20 21    22      23      24      25      26    27
//  0, 0, chain scala   observ2 factory rock    fuel  brokol
    0, 0, 9939, 127898, 127971, 127981, 129704, 9981, 129382,

//  28      29      30      31      32      33    34      35  
//  brokol  fuji    paprat  amoeb   vulcano mount mount2  fuji
    129382, 128507, 129716, 129440, 127755, 9968, 127956, 128507
];

const structureMiniMap = [
	[0,7, 4,7, 4,9, 9,9, 9,7, 13,7, 13,0],
	[0,5, 3,7, 6,5, 9,7, 12,5, 16,8, 19,8, 19,0],
	[0,8, 7,8, 7,6, 12,6, 12,0],
	[2,3, 6,2, 8,4, 4,7, 6,9, 9,4, 12,3, 14,0],
	[0,7, 5,4, 9,5, 8,6, 7,3, 11,0],
	[0,5, 3,7, 6,5, 9,7, 12,5, 16,8, 19,8, 19,0],
	[2,3, 6,2, 11,9, 16,2, 20,3, 22,0],
	[2,3, 6,2, 11,9, 16,2, 20,3, 22,0]
]

function runSurface() {
	//clearUI();
	//updateYearUI(175);
	running = true;
	bgrX = 0;
	structures = [];//onclick="console.log(this.innerHTML.codePointAt(0))"
	isEarth = selectedPlanet == -1;
	if (isEarth) {
		selectPlanet(2);
		structures.push(
			[13,206.6,5.5,-2,0,185,'Observatory'], [23,213,4], //observatory
			[5,358,3,-3], [1,353,4.4,3], [5,365,4,-2], [5,360,5,3],
			[12,375,6,-10,0,160,'Resource Depot'],
			[27,395,12,79], [35,417,4,-12], [35,422,9], [35,433.5,6], [6,442,3], [6,447,4,3], [31,456,12,86], [30,496,14,60], 
			[10,473.2,9,-8,2,210,'Headquarters'],
			[8,515,3], [30,543,8,36], [6,536,3,3], [6,540,4], [7,554,4,5],
			[14,553,7,9,0,160,'Radar'], // radar
			[7,678,5,12],
			[3,698,3,-9], [0,692,4.4,-4], [2,701,2], [4,759,3], [4,763.5],
			[4,826], [0,828,4], [4,834,3,2], [3,854,3,6],
			[11,716,5,1,0,280,'Refinery'], [24,723,7.3,-6], [9,715.5,4,-28], [26,727,2.5,5], [26,730,2.5,5], [26,733,2.5,5],
			[33,764,6], [33,781,4,-22], [33,770,10], [33,791,5], [33,782,8], // [22,772.7,5.6,-39.5],
			//[22,774.9,3,1],
			[15,777,6,0,0,230,'Ore Mine'], [21,786], [21,789], [25,777,4,-28], [25,786,2,-8], [25,789,2,-8]
			
		);
	}
	isMoon = system == 2 && !selectedPlanet;

	stageWidth = Math.ceil(isEarth ? 10 : isMoon ? 5 : planet.radius / 2) * 1920;
	console.log('surface width:', stageWidth/1920, stageWidth);

	planetWidth = stageWidth / hardWidth;
	playerX = -stageWidth / 2 + stageWidth / planetWidth / 2;
	frameWidth = hardWidth / planetWidth;

	drawBgr();
	generateSurface();
	//draw();
	resize();
	updateResourcesUI(planet);
	updateUI();
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
		if (structures[i][0] > 9 && structures[i][0] < 20) {
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

	let structureData;
	// clear the game area
	gameContext.clearRect(0, surfaceHeight, gameCanvas.width, gameCanvas.height - surfaceHeight);

	// draw big mountines
	gameContext.save();
	gameContext.translate(playerX-stageWidth, 0);
	for (i = 0; i < 5; i++) {
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

		// draw surface emoji objects
		if (i > 1) {
			for (j = 0; j < structures.length; j++) {
				structureData = structures[j % structures.length];
				for (k = 0; k < (structureData[1] > 50 ? 1 : 2); k++) {
					gameContext.font = structuresSize * (structureData[2] || 2) + 'px emoji';
					/*if (!i) {
						if (structureData[4]) {
							// draw menu bgr
							gameContext.fillStyle = getRGBA(0,0,0,.7);
							gameContext.beginPath();
							gameContext.fillRect(getStructureOffset(structureData) - hardWidth / 2, 0, hardWidth, hardHeight);
							gameContext.closePath();
							
							gameContext.globalCompositeOperation = 'destination-out';
							gameContext.fillStyle = 1;
							gameContext.beginPath();
							gameContext.arc(getStructureOffset(structureData), 688, hardWidth*.36, 0, 2*Math.PI);
							gameContext.closePath();
							gameContext.fill();
							gameContext.globalCompositeOperation = 'source-over';
						}
					} else */if (i == 2) {
						if (structureData[4] == 1) {
							gameContext.beginPath();
							gameContext.strokeStyle ='#0f0';
							gameContext.lineWidth = 16;
							gameContext.arc(
								stageWidth * k + getStructureOffset(structureData),
								900 + structureData[3], structureData[5],
								0, Math.PI * 2
							);
							gameContext.closePath();
							gameContext.stroke();
						}
					} else if (i == 4) {
						if (structureData[4] == 2 && 0|step/45%2) {
							gameContext.strokeStyle = structureData[0] < 13 ? '#0f0': '#fff';
							gameContext.lineWidth = 16;
							gameContext.beginPath();
							gameContext.ellipse(
								stageWidth * k + getStructureOffset(structureData),
								1010 + structureData[3] * 2, structureData[5]*.8, structureData[5] / 5, 0,
								0, Math.PI * 2
							);
							gameContext.closePath();
							gameContext.stroke();
						}
					}
					if ((structureData[0] > 27 && i == 2) || (structureData[0] < 28 && i == 4)) {
						gameContext.fillText(String.fromCodePoint(structureMap[structureData[0]]), stageWidth * k + structureData[1] * 20, 999 + (structureData[3] * 3 || 0));
					}
				}
			}
		}
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

function interactSurface(id = activeStructure) {
	const newX = stageWidth + stageWidth / planetWidth / 2 - getStructureOffset(structures[id]);
	frame.speed = (newX - playerX) / 5.5;
	TweenFX.to(frame, !frame.speed ? 0 : 10, {speed: 0}, 0, () => {
		playerX = newX;
		structures[id][4] = 1;
		activeStructure = id;
		menuDiv.style = 'top:135px;left:410px;width:1100px;height:520px';
		menuDiv.innerHTML = `<b><u>${structures[id][6]}:</u></b>`;
		menuDiv.innerHTML += `<div style=position:fixed;width:1100px;height:400px;border-radius:30px;background-color:${getRGBA(9,9,9,.3)}><nav style=right:2;width:99px;font-size:99px>&#x1F53C;</nav><nav style=right:2;bottom:0;width:99px;font-size:99px>&#x1F53D;</nav></div>`;
		if (structures[id][0] == 10) {

			menuDiv.innerHTML += '<nav onclick=_build(1)><div style=float:left;width:150px;height:150px;font-size:128px;border-radius:20px>&#x1F52D;</div><b>Build Observatory<br></b><b>20*</b>&#x1F6E2; <b>5*</b>&#x1FAA8; <b>5*</b>&#x1F9CA; <b>3*</b>&#x1F4A0;</nav>';
			menuDiv.innerHTML += '<br><br><br><br>';
			menuDiv.innerHTML += '<nav onclick=build(2)><div style=float:left;width:150px;height:150px;font-size:128px;border-radius:20px>&#x1F52D;</div><b>Build Launch site<br></b><b>50*</b>&#x1F6E2; <b>20*</b>&#x1FAA8; <b>20*</b>&#x1F9CA; <b>10*</b>&#x1F4A0;</nav>';
			menuDiv.innerHTML += '<br><br><br><br>';
			menuDiv.innerHTML += '<nav onclick=build(3)><div style=float:left;width:150px;height:150px;font-size:128px;border-radius:20px>&#x1F52D;</div><b>Build Radar<br></b><b>10*</b>&#x1F6E2; <b>5*</b>&#x1FAA8; <b>2*</b>&#x1F9CA; <b>2*</b>&#x1F4A0;</nav>';
			
		} else if (structures[id][0] == 11) {
			menuDiv.innerHTML += '<b>Provides 12*</b>&#x1F6E2;<b> and 2*</b>&#x1F9CA;<b> per year</b>';
		} else if (structures[id][0] == 12) {
			menuDiv.innerHTML += `<b>Trade 2*</b><nav style=display:inline onclick=_change(1)>&#x1FAA8;</nav><b> for 2*</b><nav style=display:inline onclick=_change(2)>&#x1F9CA</nav><b><br><br><nav onclick=_deal()>Deal ?</nav></b>`;
		} else if (structures[id][0] == 13) {
			menuDiv.innerHTML += '<b>13</b>';
		} else if (structures[id][0] == 14) {
			menuDiv.innerHTML += '<b>14</b>';
		} else if (structures[id][0] == 15) {
			menuDiv.innerHTML += '<br><b>Provides 6*</b>&#x1FAA8;<b>, 2*</b>&#x1F4A0<b> and 1*</b>&#x1F48E;<b> per year</b>';
		} else if (structures[id][0] == 16) {
			menuDiv.innerHTML += '<b>16</b>';
		} else if (structures[id][0] == 17) {
			menuDiv.innerHTML += '<b>17</b>';
		} else if (structures[id][0] == 18) {
			menuDiv.innerHTML += '<b>18</b>';
		}

		//TODO: menu functionality
		
		//menuDiv.innerHTML += '<nav>Launch exploration mission to the Moon</nav>';
		/*for (let i = 0; i < 2; i ++) {
			menuDiv.innerHTML += '<nav>Launch exploration mission to ' + globalPlanets[i].name + '</nav>';
		}*/

		//resDiv.innerHTML = `&#x1FAA8; : <b>${ore}</b><br>&#x1F9CA; : <b>${silica}</b><br>&#x1F4A0; : <b>${metal}</b><br>&#x1F48E; : <b>${carbon}</b>`;

	});
}

function _change(id) {
	console.log('change', id);
}

function _deal() {
	console.log('deal');
}

function _build(id) {
	console.log('build', id);
}