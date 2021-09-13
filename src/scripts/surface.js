// Planet / Moon surface view script
// ---------------------------------

// height of the minimap
const surfaceHeight = 150;
const structuresSize = 30;

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
let offset;

let structures;
let activeStructure;

// progress related:
let oil = 0;
let ore = 0;
let silica = 0;
let metal = 0;
let carbon = 0;

// depot random resource selection
let monthRandom = 1;

// buildings data
// char id, x, scale, y, status (0: non existent, 1: non selected, 2: highlighted, 3: selected), circ offset, name, menu id, menu total, cost
const buildings = [
	[10, 473.2, 9,  -8,  1, 220, 'Headquarters',      '0f0', 0, 0],
	[11, 375,   6,  -10, 1, 160, 'Resource Depot',    '0f0', 0, 0,
		5,5,2,0,0
	],
	[12, 206,  5.5, -2,  _monetization ? 1 : 0, 250, 'Observatory',       'f60', 0, [[23,214,6], [22,215.5,4,-28]],
		20,10,5,1,0
	],
	[13, 553,   6,   9,  0, 140, 'Comsat Station',    '0f0', 0, 0,
		10,5,2,5,0
	],
	[14, 414.7, 6,  -4,  _monetization ? 1 : 0, 170, 'Aramid Factory',    'fff', 0, [[20,417,3,-31]],
		15,5,25,10,3
	],
	[15, 716,   5,   1,  0, 280, 'Refinery',          'fff', 0, [[24,723,7.3,-6], [9,715.5,4,-28], [26,727,2.5,5], [26,730,2.5,5], [26,733,2.5,5]],
		20,10,5,1,0
	],
	[16, 777,   6,   0,  0, 230, 'Ore Mine',          'fff', 0, [[21,786], [21,789], [25,777,4,-28], [25,786,2,-8], [25,789,2,-8]],
		25,20,2,5,0
	],
	[17, 135,   8,  -2,  0, 200, 'Research Facility', '39f', 0, [[22,137,5,-4]],
		10,5,25,5,5
	],
	[18, 90.6,  6,  -2,  0, 250, 'Planetarium',       '39f', 0, [[23,98,6], [22,99.5,4,-28]],
		25,8,20,6,4
	],
	[19, 835,   8,  -2,  0, 200, 'Launch Site',       'fc0', 0, 0,
		50,25,20,10,0
	]
];

// resource characters data (&#x1F{xxx};)
const resources = ['6E2', 'AA8', '9CA', '4A0', '48E'];

// dynamic game objects (not saved in progress)
/*let gameObjects = [
	[320, 220, 6, 128752],
	[5320, 230, 9, 129666],
	[5331, 255, 4, 127792]
];*/

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
	return structure[1] * 20 + [136, 90, 185, 65, 90, 205, 150, 120, 185, 125][structure[0] - 10];
}

// office:127971, hospital:127973, ice block:129482, satellite:128225/128752, rocket:128640, ufo:128760, helicopter:128641, rock: 129704
// diamond:128142, measure:128476, milky way:127756, telescope:128301, microscope:128300, parachute: 129666, nut: 127792, crane: 127959
// vulcano: 127755, 9968, 127956

// character codes for surface emoji elements
const structureMap = [
//  0       1       2     3       4       5       6       7       8       9
//  hut     house   jar   leafs   cactus  pine    tree    palm,   leafs   oil
    128726, 127969, 9905, 127806, 127797, 127794, 127795, 127796, 127807, 128738,

//  10      11      12      13      14      15      16      17      18      19
//  headqua depot   observa satelit hospit  refiner oremine microsc observa launch
    127970, 127980, 128301, 128225, 127973, 127978, 127978, 128300, 128301, 127959,

//  20      21    22      23      24      25      26    27
//  diamond chain train   observ2 factory rock    fuel  brokol
    128142, 9939, 128646, 127971, 127981, 129704, 9981, 129382,

//  28      29      30      31      32      33    34      35
//  brokol  ananas  paprat  amoeb   vulcano mount mount2  fuji
    127821, 127821, 129716, 129440, 127755, 9968, 127956, 128507,

//  36      37      38      39      40      41      42      43      44      45    46
//  full m  half m  red c   orange  yellow  brown   violet  green   blue    white black
    127765, 127764, 128308, 128992, 128993, 128996, 128995, 128994, 128309, 9898, 9899
];

// data for shapes to be drawn on the minimap 
const structureMiniMap = [
	[0,7, 4,7, 4,9, 9,9, 9,7, 13,7, 13,0],
	[0,8, 7,8, 7,6, 12,6, 12,0],
	[2,3, 6,2, 8,4, 4,7, 6,9, 9,4, 12,3, 14,0],
	[0,7, 5,4, 9,5, 8,6, 7,3, 11,0],
	[0,5, 4,6, 4,8, 9,8, 9,6, 13,5, 13,0],
	[0,5, 3,7, 6,5, 9,7, 12,5, 16,8, 19,8, 19,0],
	[0,5, 3,7, 6,5, 9,7, 12,5, 16,8, 19,8, 19,0],
	[0,7, 5,4, 9,5, 8,6, 7,3, 11,0],
	[2,3, 6,2, 11,9, 16,2, 20,3, 22,0],
	[2,3, 6,2, 8,4, 4,7, 6,9, 9,4, 12,3, 14,0]
]

function runSurface() {
	bgrX = 0;
	offset = 0 | system / 2;
	structures = [];//onclick="console.log(this.innerHTML.codePointAt(0))"
	isEarth = selectedPlanet == -1;
	if (tutorial) buildings[0][4] = tutorial;
	if (isEarth) {
		selectPlanet(2);
		structures.push(
			[5,358,3,-3], [1,353,4.4,3], [5,365,4,-2], [5,360,5,3],
			[27,394,12,94], [29,388,12,68], [35,417,4,-12], [35,422,9], [35,433.5,6], [6,442,3], [6,447,4,3],
			[31,455,12,86], [29,468,9,56], [30,496,14,60], 
			[8,515,3], [30,543,8,36], [6,536,3,3], [6,540,4], [7,554,4,5],
			[7,678,5,12], [3,698,3,-9], [0,692,4.4,-4], [2,701,2], [4,759,3], [4,763.5],
			[4,816], [0,818,4], [4,824,3,2], [3,854,3,6],
			[33,764,6], [33,781,4,-22], [33,770,10], [33,791,5], [33,782,8]
			//[22,772.7,5.6,-39.5],
			//[22,774.9,3,1],
		);
		updateStructures();
	}
	isMoon = system == 2 && !selectedPlanet;

	stageWidth = Math.ceil(isEarth ? 10 : isMoon ? 5 : planet.radius / 2) * 1920;
	//console.log('surface width:', stageWidth/1920, stageWidth);

	planetWidth = stageWidth / hardWidth;
	playerX = -stageWidth / 2 + stageWidth / planetWidth / 2;
	frameWidth = hardWidth / planetWidth;

	drawBgr();
	generateSurface();
	resize();
	updateResourcesUI(planet);
	updateUI();
}

function updateStructures() {
	buildings.forEach(building => {
		if (building[4] && structures.indexOf(building) == -1) {
			structures.push(building);
			if (building[9] && building.length > 10) {
				building[9].forEach(mapElement => {
					structures.push(mapElement);
				});
			}
		}
	});
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
					gameContext.strokeStyle = '#' + structureData[7];
					if (i == 2) {// draw selection
						if (structureData[4] == 3) {
							gameContext.beginPath();
							gameContext.lineWidth = 16;
							gameContext.arc(
								stageWidth * k + getStructureOffset(structureData),
								920 + structureData[3], structureData[5],
								0, Math.PI * 2
							);
							gameContext.closePath();
							gameContext.stroke();
						}
					} else if (i == 4) {// highlight building by blinking the selection
						if (structureData[4] == 1 || structureData[4] == 2 && 0|step/45%2) {
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

	/*gameObjects[0][0] += 1;
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
	})*/
	
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

function getInlineClick(structureId, index) {
	return ` onclick='document.dispatchEvent(new CustomEvent("intr",{"detail":{"s":${structureId},"i":${index}}}))'`;
}

function getMission(planet, structure, order, structureId, index, type = 0) {
	let cost = !type ? planet.exploreCost : type == 1 ? planet.mineCost : planet.colonyCost;
	let disabled = !buildings[0][4] || !buildings[1][4] || !buildings[7][4] || oil < cost[0] || ore < cost[1] || silica < cost[2] || metal < cost[3] || carbon < cost[4];
	let div = `<div style=float:left;width:150px;height:150px;font-size:128px;border-radius:20px>${String.fromCodePoint(structureMap[planet.char])}</div>`;
	let html = `<nav style=${disabled?'opacity:0.4;':''}margin-top:${(order-structure[8])*200}px${disabled ? '' : getInlineClick(structureId, index)}>${div}<b>${!type?'Send Probe to':type==1?'Send Miner to':'Colonize'} ${planet.name}<br></b>`;
	for (j = 0; j < 5; j++) {
		if (cost[j]) {
			html += ` -<b>${cost[j]}</b>&#x1F${resources[j]};`;
		}
	}
	html += '</nav>';
	return html;
}

function interactSurface(id = activeStructure) {
	const structure = structures[id];
	const newX = stageWidth + stageWidth / planetWidth / 2 - getStructureOffset(structure);
	frame.speed = (newX - playerX) / 5.5;
	activeStructure = id;
	TweenFX.to(frame, !frame.speed ? 0 : 10, {speed: 0}, 0, () => {
		playerX = newX;
		structure[4] = 3;
		let structureId = structure[0] - 10;
		menuDiv.style = 'top:135px;left:410px;width:1100px;height:520px';
		let html = `<b><u>${structure[6]}</u></b><div style=position:fixed;width:1100px;height:400px;border-radius:30px;background-color:${getRGBA(9,9,9,.3)}>`;
		if (!structureId) {
			html+= `<nav onclick='document.dispatchEvent(new CustomEvent("menu",{"detail":{"t":-1,"i":${structureId}}}))' style=right:2;width:99px;font-size:99px>&#x1F53C;</nav><nav onclick='document.dispatchEvent(new CustomEvent("menu",{"detail":{"t":1,"i":${structureId}}}))' style=right:2;bottom:0;width:99px;font-size:99px>&#x1F53D;</nav>`;
			let order = 0;
			buildings.forEach((building, index) => {
				if (!building[4]) {
					let disabled = index > 7 && (!buildings[2][4] || !buildings[3][4]) || index == 7 && !buildings[4][4] || oil < building[10] || ore < building[11] || silica < building[12] || metal < building[13] || carbon < building[14];
					let mines = index > 3 && index < 7;
					let div = `<div style=${mines?'position:absolute':'float:left'};width:150px;height:150px;${mines?'line-height:160px;':''}font-size:${mines?112:128}px;border-radius:20px>${String.fromCodePoint(structureMap[building[0]])}</div>`;
					if (mines) {
						div += `<div style=float:left;background-color:transparent;width:${index==4?150:110}px;height:100px;font-size:99px>&#x1F${index == 4 ? resources[4] : index == 5 ? resources[0] : resources[1]};</div>`;
					}
					html += `<nav style=${disabled?'opacity:0.4;':''}margin-top:${(order-structure[8])*200}px${disabled ? '' : getInlineClick(structureId, index)}>${div}<b>Build ${building[6]}<br></b>`;
					for (j = 0; j < 5; j++) {
						if (building[10 + j]) {
							html += ` -<b>${building[10 + j]}</b>&#x1F${resources[j]};`;
						}
					}
					html += '</nav>';
					order ++;
				}
				structure[9] = order;
			});
			
			for (r = 0; r < 3; r ++) {
				html += getMission(globalPlanets[2].moons[0], structure, order, structureId, 0, r);
				order ++;
				globalPlanets.forEach((planet, index) => {
					if (!planet.status && index < 4) {
						html += getMission(planet, structure, order, structureId, index, r);
						order ++;
					}
					structure[9] = order;
				});
			}

			html += "</div>";
		} else if (structure[0] == 11) {//const resources = ['6E2', 'AA8', '9CA', '4A0', '48E'];
			//console.log(year % 5, month % 5)//monthRandom
			//let _from = ;
			if (resources[month % 5]) {
				// TODO
			}
			html += `<div style=float:right;margin:40px;width:240px;height:200px;font-size:200px;border-radius:20px>👨‍💼</div>`;
			html += `<br><b>This month's deal:<br>Get 1 </b><nav style=display:contents;font-size:99px;width:99px>&#x1F${resources[month % 5]};</nav><b> for 2 </b><nav style=display:contents;font-size:99px;width:99px onclick=_change()>&#x1F9CA;</nav><b><br><br><nav onclick='document.dispatchEvent(new CustomEvent("deal"))'>Okay ?</nav></b>`;
		} else {
			html += `<br><br><b>${
				[
					'<br>Allows observation of the<br>Terrestrial planetary system.',
					'<br>Establishes communication with launched satellites and probes.',
					'Produces<br>12*</b>&#x1F9CA;<b> silica and 3*</b>&#x1F48E;<b> carbon<br><br>pieces per year.',
					'Produces<br>24*</b>&#x1F6E2;<b> oil barrels and 6*</b>&#x1F9CA;<b> silica<br><br>crystals per year.',
					'Produces<br>12*</b>&#x1FAA8;<b> ores and 4*</b>&#x1F4A0;<b> metal<br><br>compounds per year.',
					'Enables you to have extraterrestrial colonization programs and missions for searching of artificial life.',
					'<br>Allows observation of the Gas giants and their moons.',
					'This Station is ideal for launching spacecraft to the Moon and the<br>closer planets.'
				][structure[0]-12]
			}</b>`;
		}
		
		/* if (structure[0] == 12) {
			html += '<br><br><b>Allows observation of the<br>Terrestrial planetary system.<br><br><br>Tip: build a Planetarium to observe<br>the entire Solar system.</b>';
		} else if (structure[0] == 13) {
			html += '<br><br><b>Establishes communication with launched satellites and probes.</b>';//Watches for unidentified flying objects.
		} else if (structure[0] == 14) {
			html += `<br><br><b>Produces<br>12*</b>&#x1F9CA;<b> silica and 3*</b>&#x1F48E;<b> carbon<br><br>pieces per year.`;//The structure is currently Level 1<nav onclick='document.dispatchEvent(new CustomEvent("upgr"))'>Upgrade ?</nav></b>
		} else if (structure[0] == 15) {
			html += `<br><br><b>Produces<br>24*</b>&#x1F6E2;<b> oil barrels and 6*</b>&#x1F9CA;<b> silica<br><br>crystals per year.`;
		} else if (structure[0] == 16) {
			html += `<br><br><b>Produces<br>12*</b>&#x1FAA8;<b> ores and 4*</b>&#x1F4A0;<b> metal<br><br>compounds per year.`;
		} else if (structure[0] == 17) {
			html += `<br><br><b>Enables you to have extraterrestrial colonization programs and missions for searching of artificial life.</b>`;//<br>Provides 3 scientifically trained cosmonauts per year.
		} else if (structure[0] == 18) {
			html += `<br><br><b>Allows observation of the Gas giants and their moons.<br><br>The focus is on Jupiter's Europa, Saturn's Titan and Neptune's Triton.</b>`;
		} else if (structure[0] == 19) {
			html += `<br><br><br><b>This Station is ideal for launching spacecraft to the Moon and the<br>closer planets.</b>`;
		}*/

		menuDiv.innerHTML = html;
	});
}

function _menu(e) {
	if ((structures[activeStructure][8] > 0 && e.detail.t == -1) || (structures[activeStructure][8] < structures[activeStructure][9]-2 && e.detail.t == 1)) {
		structures[activeStructure][8] += e.detail.t;
		interactSurface();
	}
}

function _build(id) {
	let building = buildings[id.detail.i];
	building[4] = 1;
	updateStructures();
	interactSurface(structures.indexOf(building));
	planet.resources[0] -= building[10];
	planet.resources[1] -= building[11];
	planet.resources[2] -= building[12];
	planet.resources[3] -= building[13];
	planet.resources[4] -= building[14];
	updateResourcesUI();
}

function _deal() {
	//console.log('deal');
}
