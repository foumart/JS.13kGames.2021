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
let air = -1;
let nuke = 0;
let special = 0;

// depot random resource selection
let monthRandom;
let toRandom;

// buildings data
// char id, x, scale, y,  status (0: non existent, 1: non selected, 2: highlighted, 3: selected), circ offset, name, menu id, menu total, cost
let buildings = [
	[50, 472.5, 10,  -9,    1,   235.15, 'Headquarters',      '0f0', 0, [[46,474.3,7.6,-30], [48,474.3,7.6,-30]]],

	[51, 202,  4, -4,    _monetization ? 1 : 0,   185.14,  'Observatory',      'f60', 1, [[13,207,6,-4], [17,210.4,1.4,-43], [46,209.1,3.2,-42], [48,209.3,3,-43], [46,207,4,-22], [48,207.2,3.8,-23], [46,210,4,-22], [48,210.1,3.8,-23]],
		10,10,20,2,0,     0,0,10,5,5,0
	],
	[52, 842,   3,  3,      0,   240, 'Launch Site',       'fc0', 0, [[23,834,5,3], [17,834.5,1.5,-9]],
		75,25,0,10,2,    250,0,50,20,10
	],
	[53, 508,   4,   4,     0,   160.06, 'Comsat Station',    '0f0', 0, [[11,508,6.6,-12]],
		5,5,5,1,0,       1,10,0,10,0,0
	],
	[54, 107,  6,  -2,      0,   225.03, 'Planetarium',       '39f', 0, [[15,101,4.5], [12,108.8,3.6,-29], [46,102,6,-15], [48,102,6,-15], [43,104.8,2.5,-38], [17,110,2,-27]],
		25,5,50,5,5,     5,0,25,0,10,0
	],//[13,97,6], 

	[55, 433,   6,  -2,     0,   160.09, 'Resource Depot',    '0f0', 0, 0,
		20,5,10,0,0
	],
	[56, 716,   5,   1,     0,   245.18, 'Refinery',          'fff', 0, [[14,723,7.3,-6], [9,715.5,4,-28], [16,727,2.5,5], [16,730,2.5,5], [16,733,2.5,5]],
		30,10,0,5,0,     50,25,0,5,0,0
	],
	[57, 775,   6,   0,     0,   230.15, 'Ore Mine',          'fff', 0, [[8,775,4,-28], [11,784,2], [25,784.4,2.5,-4], [11,787,3,6], [25,787.6,3]],
		20,25,0,5,0,    0,50,0,25,5,0
	],
	[58, 375, 5.6,  -5,     0, 160.088,  'Aramid Factory',    'fff', 0, [[10,376.7,3.35,-29], [46,375,3,-24], [48,375,3,-24], [46,377,3,-37], [48,377,3,-37], [46,378.9,3,-24], [48,378.9,3,-24]],
		5,5,30,15,5,     1,0,60,30,5,0
	],

	[59, 404.7,   7,  -8,   0,   180.105, 'Science Facility',  '0f0', 0, [[46,404.6,7,-26],[48,404.6,7,-26],[18,407,4.2,-45]],
		25,25,0,20,5,   75,0,0,20,5,1
	],
	[60, 148.5,   6,  0,    0,   200.05, 'Research Lab', '39f', 0, [[47,148,5,-14],[48,148,5,-14],[12,150,4,-4],[29,146.5,3.5,-6],[29,147.9,2.55,-14],[20,142.6,5.8],[24,145.2,1],[27,145.5,1,-41]],
		0,10,20,15,3,    20,0,50,0,20,1
	],
	[61, 347,   4.5,  9,    0,   160.05,  'Conservatory',  '0f0', 0, [[46,341.8,6.6,15],[46,348.9,5.3,7],[47,349,4.5,4],[45,351,2.8,-5],[48,349,5.2,7],[47,342.2,6,12],[45,343.4,4.2,2],[48,342,6.4,14],[1,345,3.55,9]],
		60,20,30,5,0,    
	],
	[62, 547,   4.5,  0,    0,   160.068, 'Aquaponics',  '0f0', 0, [[47,546.6,5.1,-20],[22,546.7,5,-18],[46,546.8,4.8,-20],[47,547.4,4,-19],[18,548,3.2,-28]],
		5,5,30,20,10,     0,10,20,10,5
	],
	[63, 691,   5,  0,      0,     190.03, 'Hotel1',  '0f0', 0, [[23,686,6.7], [17,686.5,1,-24], [17,688.4,1,-24], [17,686.5,1,-14], [17,688.4,1,-14]],
		5,5,30,20,10
	],
	[64, 756,   4,  0,      0,     180, 'Hotel2',  '0f0', 0, [[23,750,4.8], [17,750.5,1.5,-11]],
		5,5,30,20,10
	],
	[65, 808,   4,  0,      0,     190, 'Hotel3',  '0f0', 0, [[15,802,6.35], [26,807.7,2.6,-35], [27,808.1,2.1,-37]],
		5,5,30,20,10
	],
	[66, 454.6,   6,  -2,   0,     160.09, 'Hotel4',  '0f0', 0, [[17,455,1.5,-19], [17,456,1.5,-19], [17,455,1.5,-5], [17,456,1.5,-5]],
		5,5,30,20,10
	],
	[67, 690.2,   5,  0,    0,     190.03, 'Hotel',  '0f0', 0, [[23,686,7], [17,687,2,-17]],
		5,5,30,20,10
	],
	[68, 690.2,   5,  0,    0,     190.03, 'Hotel',  '0f0', 0, [[23,686,7], [17,687,2,-17]],
		5,5,30,20,10
	],

	[69, 430,   8,  22,     0,   210.095, 'Venus Colony', '0f0', 0,
		[
			[33,432.2,5,9], [48,430,8,22],
			[18,440,5,9], [19,446.6,3.6,9], [21,420.5,3,13],
			[47,424,6,46], [45,426,3,22], [48,424,6,26], [47,448.5,5,18]
		]
	],

	[70, 430,   8,  22,     0,   210.095, 'Venus Colony', '0f0', 0, []],
	[71, 406.5, 4, 16,      0,   120.095, 'Landing Site', 'ff0', 0,
		[
			[20,406,3.5,11]
		]
	]
];

// resource characters data (&#x1F{xxx};)
const resources = ['6e2', 'aa8', '9ca', '4a0', '48e', 300, '9e0', '96b', '9d1', '53a'];//127744//'30a', 468, 94f

// dynamic game objects
let gameObjects = [
	[128640, 16000, 920, 5, 0],// landed rocket ready to take off - usualy on Earth
	[128640, 7120, 160, 5, 0],// landing rocket
	[128752, 320, 220, 6, 0],// satellite
	[128752, 5320, 230, 9, 0],// satellite
	[129666, 5331, 255, 4, 0],// parachute
	[127792, 4011, 255, 4, 0]// nut
];
let rocket;

let bgrStars = [];
function addBgrStars() {
	for (i = 0; i < 90; i++) {
		bgrStars.push(new Star(bgrCanvas.width / 2, bgrCanvas.height - 250, bgrContext));
	}
}

function getStructureOffset(structure) {
	const offset = buildings[structure[0] - 50][5];
	return structure[1] * 20 + (offset - (0|offset)) * 1000;
}

// office:127971, hospital:127973, satellite:128225/128752, rocket:128640, ufo:128760, helicopter:128641,
// measure:128476, telescope:128301, microscope:128300, crane: 127959, vulcano: 127755, mountine2: 127956,
// salad: 129367, fountain: 9970, orange planet with rings: 129680, gear: 9881, milky way:127756,
// ice block:129482, rock: 129704, diamond:128142, parachute: 129666, nut: 127792, microphone: 127897

// character codes for surface emoji elements
const structureMap = [
// Front layer
//  0       1       2       3       4       5       6       7       8       9
//  hut     house   jar     leafs   cactus  pine    tree    palm,   rock   oil
    128726, 127969, 9905,   127806, 127797, 127794, 127795, 127796, 129704, 128738,

//  10      11      12      13      14      15      16      17      18      19
//  diamond satelli train   office  factory build   fuel    window  cabin1  cabin2
    128142, 128225, 128646, 127973, 127981, 127980, 9981,   129695, 128672, 128673,

//  20      21      22      23      24      25      26      27      28      29
//  bboard  bus     fount   hotel   alarm   metal   cd-gray cd-brow globe   metro
    128655, 128654, 9970,   127976, 128680, 128160, 128191, 128192, 127760, 128669,

// Back layer
//  30      31      32      33      34      35      36      37      38      39
//  mount.w mount   microsc c.plant mount   fuji    full m  half m  red c   amoeb//orange
    127956, 9968,   128300, 127885, 9968,   128507, 127765, 127764, 128308, 129440,//128992,

//  40      41      42 ?    43      44      45      46      47      48      49
//  paprat  bus     yellow  telesco iglu    lotus   cd-gray cd-brow globe   ananas
    129716, 128654, 128993, 128301, 127833, 127989, 128191, 128192, 127760, 127821,

// Interactive map Objects
//  50      51      52      53      54      55      56      57      58      59
//  headqua observa launch  comsat  planet  depot   refiner oremine aramid  researc
//          telesco crane   train   office  build   24h     24h     hospit  microsc
    127970, 128301, 127959, 128646, 127971, 127980, 127978, 127978, 127973, 127979,

//  60      61      62      63      64      65      66      67      68      69
//  microbi conserv hidropo ?       ?
//  microsc house   train   hotel   depot   depot   hotel   hotel   hotel   train
    128300, 127969, 128646, 127976, 127980, 127980, 127976, 127976, 127976, 128646,

//  70      71      72      73      74      75      76      77      78      79
//  cd-gray crane
    128191, 127959, 127976, 127976, 127976, 127976, 127976, 127976, 127976,127976,

//  80      81      82      83      84      85      86      87      88      89    90
//  full m  half m  red c   orange  yellow  brown   violet  green   blue    white black
    127765, 127764, 128308, 128992, 128993, 128996, 128995, 128994, 128309, 9898, 9899
];

// data for shapes to be drawn on the minimap 
const structureMiniMap = [
	[2,2, 1,7, 5,7, 5,9, 7.5,10, 10,9, 10,7, 14,7, 13,2, 15,0],
	[2,3, 6,2, 6,4, 2,6, 3,7, 7,5, 11,6, 15,5, 15,2, 17,0],//observatory
	[0,5, 4,5, 4,7, 8,7, 8,4, 6,4, 6,2, 8,0, 13,2, 18,0],//nN
	[2,1, 4,4, 2,8, 8,7, 11.5,8, 10.5,6, 13,2, 7.5,3, 8,2, 11,0],// satellite
	[0,2, 2,4, 4,5, 3,7, 4,8, 8,6, 12,5, 14,4, 16,2, 16,0],//circ (planetarium)
	[2,1, 2,8, 8,8, 8,6, 13,6, 13,1, 15,0],// depot
	[0,5, 3,7, 6,5, 9,7, 12,5, 16,8, 19,8, 19,0],// refinery
	[0,6, 3,8, 6,6, 6,5, 11,6, 14,5, 14,0],// ore mine
	[2,1, 2,4, 6,5, 5,7, 8,8, 11,7, 10,5, 14,4, 14,1, 16,0],//aramid factory
	
	[1,1, 2,3, 4,4, 2,7, 4,9, 6,10, 9,10, 11,9, 13,7, 11,4, 13,3, 14,1, 15,0],//arc (research facility)
	[1,1, 1,6, 2,6, 2,5, 5,6, 8,6.5, 11,6, 13,5, 15,3, 15,1, 16,0],//circ
	[0,2, 2,4, 4,5, 8,6, 12,5, 14,4, 16,2, 16,0],//circ (conservatory)
	[3,2, 2,3, 1,5, 2,8, 6,7.5, 10,8, 11,5, 10,3, 9,2, 12,0],//hydro

	[2,1, 2,5, 6,5, 6,7, 11,7, 11,4, 14,4, 14,1, 15,0, 18,3, 21,0],// hotel 1
	[2,1, 2,4, 5,4, 5,6, 10,6, 10,5, 12,5, 12,3, 14,3, 14,1, 16,0],// hotel 2
	[2,1, 2,7, 6,7, 6,5, 11,5, 11,4, 14,4, 14,1, 15,0, 18,3, 21,0],//
	[2,1, 2,4, 6,4, 6,6, 11,6, 11,1, 13,0],//
	[2,1, 2,8, 8,8, 8,6, 13,6, 13,1, 15,0],//

	[0,2, 2,3, 3,5, 6,8, 9,5, 10,3, 12,2, 12,0, 6,1],//rocket
	[0,3, 5,3, 5,0, 0,0],
	[2,3, 6,2, 11,9, 16,2, 20,3, 22,0],//aAa
	[-2,2, 1,3, 2,5, 5,8, 8,5, 9,3, 12,2, 10,0, 5,2],
	[0,2, 3,3, 4,5, 7,8, 10,5, 11,3, 14,2, 14,0, 7,1],
	[0,3, 5,3, 5,0, 0,0],
	[0,3, 5,3, 5,0, 0,0]
]

function runSurface() {
	bgrX = 0;
	offset = 0 | system / 2;
	structures = [];//onclick="console.log(this.innerHTML.codePointAt(0))"
	isEarth = selectedPlanet == -1;
	if (isEarth) {
		selectedPlanet = 2;
		structures.push(
			[30,237,3], [30,245,2], [30,240,4],
			[30,32,3], [30,40,2], [30,35,4],
			[34,607,3], [34,615,2], [34,610,4], [34,620], [34,617,3],
			[34,364,6], [34,381,4,-22], [34,370,10], [34,391,5], [34,382,8],
			[44,97.5,3], [44,94,3.5,2], [44,124.5,2.5,2], [44,128,3.5,2], [44,133,2],
			[5,358,3,-3], [1,354,4,5], [5,365,4,-2], [5,360,5,3],
			[39,384,11,76], [49,394,12,70], [35,417,4,-12], [35,422,9], [35,433.5,6], [6,442,3,-2], [6,447,4,3],
			[39,455,12,86], [49,468,9,50], [40,496,14,66], 
			[7,558,4,9], [40,543,11,55], [6,536,3,3], [6,540,4],
			[7,680,4,9], [49,697,8,35], [0,702,3.5,-6], [3,707,2,-9], [2,709], [4,742,3], [4,763],
			[4,816], [0,818,3.5], [4,824,3,3], [3,854,3,6],
			[34,764,6], [34,781,4,-22], [34,770,10], [34,791,5], [34,782,8]
		);
		if (tutorial) buildings[0][4] = 2;
	} else {
		structures.push(
			[34,791,5]
		);
	}

	rocket = new Rocket(128640);
	/*if (isEarth) {
		gameObjects[0][4] = 1;// is probe sent?
	} else {
		gameObjects[1][4] = 1;// is building launch site built?
	}*/

	updateStructures();

	isMoon = system == 2 && !selectedPlanet;

	stageWidth = Math.ceil(isEarth ? 10 : isMoon ? 5 : planet.radius / 2) * hardWidth;
	//console.log('surface width:', stageWidth/1920, stageWidth);

	planetWidth = stageWidth / hardWidth;
	playerX = -stageWidth / 2 + stageWidth / planetWidth / 2 + (isEarth ? 0 : 758);
	frameWidth = hardWidth / planetWidth;

	drawBgr();
	generateSurface();
	resize();
	updateResourcesUI();
	updateUI();

	//interactSurface(structures.indexOf(buildings[0]));
}

function updateStructures() {
	buildings.forEach(building => {
		if (building[4] && structures.indexOf(building) == -1) {
			if (building[0] == 52) {
				gameObjects[0][4] = 1;

			}
			structures.push(building);
			if (Array.isArray(building[9])) {
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
	if (!bgrMountines) {
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
					// Venus
					0 | x / (2 + r*3) % 3 ? -25 + r * (0 | x / 20 % 2 ? r*90 : r*30) * (- x % 3 || r) : r*90 - r*90 * r
						:
				selectedPlanet == 1 && system > 2
						?
					(x % 2 == 0 ? -r/2 : r) * 40 * (x % 2 == 0 ? 1 : -1)
						:
				isEarth || selectedPlanet == 3
						?
					(0 | x / 16.2) % 2 == 0 && x > 7 || [3,4,5,19,20,21,22,32,50,51,52,64].indexOf(x) > -1
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
}

function drawMinimapObject(color, id, x, y) {
	gameContext.beginPath();
	gameContext.strokeStyle = '#' + color;
	gameContext.fillStyle = "#ccc";
	gameContext.lineWidth = 4;
	r = structureMiniMap[id];

	gameContext.moveTo(x, y);
	for (j = 0; j < r.length; j+=2) {
		gameContext.lineTo(x + r[j] * 2.5, y + r[j+1] * -4);
	}
	gameContext.closePath();
	gameContext.fill();
	gameContext.stroke();
}

function draw() {
	step++;
	moveBgr();

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
	gameContext.strokeStyle = '#666';
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
	for(i = 0; i < structures.length; i++) {
		if (structures[i][0] > 49) {
			drawMinimapObject(isEarth ? 496 : 984, structures[i][0] - 50, getStructureOffset(structures[i]) / 10 - 20, surfaceHeight - 12);
		}
	}

	gameObjects.forEach((obj, index) => {
		if (obj[4]) {
			if (index == 1) {
				// rocket flying
				if (obj[2] < 940) {
					drawMinimapObject(289, 20, -(playerX-stageWidth)/planetWidth + 60, obj[2] / (hardHeight / surfaceHeight));
				}
			} else {
				// satellite
				drawMinimapObject(289, 21, obj[1] / 10 + 90, obj[2] / (hardHeight / surfaceHeight) + 10);
			}
		}
	});

	let structureData;
	// clear the game area
	gameContext.clearRect(0, surfaceHeight, gameCanvas.width, gameCanvas.height - surfaceHeight);

	// draw big mountines
	gameContext.save();
	gameContext.translate(playerX-stageWidth, 0);
	for (i = 0; i < 6; i++) {
		// draw surface emoji objects
		for (j = 0; j < structures.length; j++) {
			structureData = structures[j % structures.length];
			for (k = 0; k < (structureData[1] > 50 ? 1 : 2); k++) {//TODO
				gameContext.fillStyle = gameContext.strokeStyle = '#' + structureData[7];
				if (i == 3) {// draw selection
					if (structureData[4] == 3) {
						gameContext.beginPath();
						gameContext.lineWidth = 16;
						gameContext.arc(
							stageWidth * k + getStructureOffset(structureData),
							(isEarth ? 920 : 940) + structureData[3], structureData[5],
							0, Math.PI * 2
						);
						gameContext.closePath();
						gameContext.stroke();
					}
				} else if (i == 5) {// highlight building by blinking the selection
					if (structureData[4] == 1 || structureData[4] == 2 && 0|step/45%2) {
						gameContext.lineWidth = 16;
						gameContext.beginPath();
						gameContext.ellipse(
							stageWidth * k  + getStructureOffset(structureData),
							(isEarth ? 1010 : 1050) + structureData[3] * 2, structureData[5]*.8, structureData[5] / 5, 0,
							0, Math.PI * 2
						);
						gameContext.closePath();
						gameContext.stroke();
					}
				}
				// z-index of emoji in regards the landscape color layers
				if ((structureData[0] == 30 && !i) || (structureData[0] > 30 && structureData[0] < 50 && i == 3) || ((structureData[0] < 30 || structureData[0] > 49) && i == 5)) {
					gameContext.font = structuresSize * (structureData[2] || 2) + 'px emoji';
					//if (structureData[0] )
					gameContext.fillText(String.fromCodePoint(structureMap[structureData[0]]), stageWidth * k + structureData[1] * 20 + (j<11?-((bgrX<1000?bgrX:bgrX-1920)/1.5):0), 999 + (structureData[3] * 3 || 0));
				}
			}
		}

		gameContext.beginPath();
		const reds = isEarth ? playerX < 2000 || playerX > 14500 ? i == 1 ? 5 : i > 3 ? i*2 : i*4 : playerX > 7800 ? i : 1 + i*3
					: isMoon ? 1+i*2 : !selectedPlanet ? 2-offset+i*2 : selectedPlanet == 1 ? 3+i%3+i*i : selectedPlanet == 3 ? i%2*2+i*3 : i;

		const greens = isEarth ? playerX < 2000 || playerX > 14500 ? !i ? 0 : i == 1 ? 9 : i > 3 ? 6 + i*2 : 6 + i*3 : playerX > 7800 ? i*3 : i*3
					: isMoon ? 1+i*2 : !selectedPlanet ? offset+i*2 : selectedPlanet == 1 ? i%3+i*i : selectedPlanet == 3 ? i : i == 1 ? 3 : i;

		const blues = isEarth ? !i ? 8 : playerX < 2000 || playerX > 14500 ? i == 1 ? 12 : i > 3 ? 6 + i*2 : 9 + i*2 : 2
					: isMoon ? 1+i*2 : !selectedPlanet ? 1+i*2 : selectedPlanet == 1 ? 1+i%2*i : selectedPlanet == 3 ? i : i==1 ? 5 : 2;

		gameContext.fillStyle = getRGBA(reds, greens, blues, isEarth && i && i < 3 && (playerX < 2000 || playerX > 14500) ? 0.4 : 1);
		gameContext.moveTo(0, hardHeight-90);
		const ii = i > 5 ? 5 : i;
		const surfaceHeight = !selectedPlanet ? (200-ii*ii*5) : selectedPlanet == 2 ? (175-ii*15) : (200-ii*25);
		let distance, previousX = 0;
		if (!isEarth || i) {
			for (r = 0; r < bgrMountines.length + bgrMountines.length / (planetWidth - 1); r++) {
				x = (r >= bgrMountines.length ? stageWidth : 0) + bgrMountines[r % bgrMountines.length][0];
				y = hardHeight - surfaceHeight + bgrMountines[r % bgrMountines.length][1] * (i==3 ? 0.5 : i==4 ? 0.2 : i==5 ? 0.5 : 1 + ii/6) + ii * (i > 2 ? ii*5 : 10);
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
					gameContext.lineTo(x, isEarth ? y : i < 3 ? y : (y + 1060) / 2);
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
	//if (i == 5) {
		gameObjects.forEach((obj, index) => {
			if (obj[4]) {
				if (!index && obj[2] == 920) {
					rocket.div.style.opacity = 1;
					rocket.div2.style.opacity = 1;
					rocket.div.style.marginTop = `${obj[2]}px`;
					rocket.div2.style.marginTop = `${obj[2]}px`;
					rocket.div2.style.marginLeft = `${obj[1] + 890 + (playerX-stageWidth)}px`;
					rocket.div.style.marginLeft = `${obj[1] + 900 + (playerX-stageWidth)}px`;
					rocket.div.style.height = rocket.div2.style.height = `42px`;
				} else if (index == 1 || !index && obj[2] < 920) {
					// rocket fly animation
					// check if rocket leaves the surface
					if (obj[2] < 100) {
						obj[1] = 16000;
						obj[2] = 920;
						idle = true;
						frame.speed = 0;
						// gott moon 
						switchState(2, true, tweenToPlanet);
					}
					if (obj[2] < 940) {
						if (step % 2 == 0) {
							rocket.div.style.opacity = 1;
							rocket.div2.style.opacity = 1;
							obj[1] += 1;
							obj[2] += (index ? 4 : -5);
							idle = false;
							frame.speed = -1;
							rocket.div.style.marginTop = `${obj[2]+3}px`;
							rocket.div2.style.marginTop = `${obj[2]+3}px`;
							const rand = Math.random()*20;
							rocket.div.style.height = rocket.div2.style.height = `${56 + rand/1.4}px`;
							rocket.div2.style.marginLeft = `${989-rand/2}px`;
							rocket.div.style.marginLeft = `${1021+rand/2}px`;
						}
					} else {
						if (obj[2] < 950) {
							obj[2] += 1;
							if (obj[2] == 945) {
								idle = true;
								frame.speed = 0;
								buildings[14][4] = 3;
								buildings[15][4] = 1;
								updateStructures();
							} else if (obj[2] == 946) {
								updateStructures();
								interactSurface(structures.indexOf(buildings[14]));
							}
						}
						rocket.div.style.marginTop = `${obj[2]}px`;
						rocket.div2.style.marginTop = `${obj[2]}px`;
						rocket.div2.style.marginLeft = `${obj[1] + 890 + (playerX-stageWidth)}px`;
						rocket.div.style.marginLeft = `${obj[1] + 900 + (playerX-stageWidth)}px`;
						rocket.div.style.height = rocket.div2.style.height = `42px`;
					}
				}/* else if (index > 1) {
					if (obj[0] == 1) {
						obj[1] += 1;
						if (obj[1] > stageWidth) obj[1] = 0;
					} else if (obj[3] == 2) {
						obj[1] += 1;
						if (obj[1] > stageWidth) obj[1] = 0;
						if (obj[2] < 980) {
							obj[1] += 1;
							obj[2] += 1;
						} else if (obj[2] == 980) {
							obj[2] = 1200;
							//gameObjects.splice(1, 1);
						}
					} else if (obj[0] == 3) {
						if (obj[2] < 960) {
							obj[1] += 1;
							obj[2] += 1;
						} else if (obj[2] == 960) {
							obj[3] = 6;
							// change to resource (diamond)
							obj[0] = 4;
						}
					}
	
					gameContext.font = obj[3] + '0px emoji';
					gameContext.fillText(String.fromCodePoint(obj[0]), (obj[1] < hardWidth ? stageWidth + obj[1] : obj[1]), obj[2]);
					gameContext.fillText(String.fromCodePoint(obj[0]), (obj[1] > stageWidth - hardWidth ? obj[1] - stageWidth : obj[1]), obj[2]);
				}*/

				/*if (i == 2) {
					gameContext.globalCompositeOperation = 'source-atop';
					gameContext.fillStyle = getRGBA(5,9,16,.3);
					gameContext.beginPath();
					gameContext.arc(obj[0]+20, obj[1]-14, 21, 0, Math.PI * 2);
					gameContext.closePath();
					gameContext.fill();
				}*/
			}
		});
	//}
	
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

function getInlineClick(index, name = "head") {
	return ` onclick='document.dispatchEvent(new CustomEvent("${name}",{"detail":${index}}))'`;
}

function getMission(_planet, structure, order, structureId, index, type = 0) {
	let cost = !type ? _planet.exploreCost : type == 1 ? _planet.mineCost : _planet.colonyCost;
	let disabled = (type && !buildings[7][4]) || !buildings[2][4] || !buildings[3][4] || !buildings[8][4] || !buildings[9][4] || planet.resources[0] < cost[0] || planet.resources[1] < cost[1] || planet.resources[2] < cost[2] || planet.resources[3] < cost[3] || planet.resources[4] < cost[4];
	let div = `<div style=float:left;width:150px;height:150px;line-height:152px;font-size:128px;border-radius:20px>${String.fromCodePoint(structureMap[_planet.char])}</div>`;
	let html = `<nav style=${disabled?'opacity:0.4;':''}margin-top:${(order-structure[8])*200}px${disabled ? '' : getInlineClick(`"${type+_planet.name}"`, 'misn')}>${div}<b>${!type?'Send Probe to':type==1?'Send Miner to':'Colonize'} ${_planet.name}<br></b>`;
	for (j = 0; j < 5; j++) {
		if (cost[j]) {
			html += ` -<b>${cost[j]}</b>&#x1f${resources[j]};`;
		}
	}
	html += '</nav>';
	return html;
}

function interactSurface(id = activeStructure, launch = false) {
	const structure = structures[id];
	const newX = stageWidth + stageWidth / planetWidth / 2 - getStructureOffset(structure);
	frame.speed = (newX - playerX) / 5.5;
	activeStructure = id;
	TweenFX.to(frame, !frame.speed ? 0 : 10, {speed: 0}, 0, () => {
		if (!paused) pause(true);
		idle = true;
		playerX = newX;
		const reselect = structure[4] == 3;
		removeInteractions();
		structure[4] = 3;
		const structureId = structure[0] - 50;
		if (launch) {
			menuDiv.innerHTML = "";
			gameObjects[0][2] = 919;
			gameObjects[0][4] = 1;
			structure[4] = 1;
		} else {
			menuDiv.style = 'top:180px;left:410px;width:1100px;height:520px';
			let html = `<b style="background-color:#445;border-radius:30px 30px 0 0;padding:5px 50px 7px;${structureId?'margin-left:-440px">':'"><u>'}${structure[6]}${structureId?'':'</u>'}</b><div id="lst" style=overflow:auto;scrollbar-width:none;position:fixed;width:1064px;height:${structureId < 1 ? 40 : 31}0px;border-radius:40px;padding-right:32px;background-color:${getRGBA(9,9,9,.3)}>`;
			if (!structureId) {
				let order = 0;
				/*'Headquarters','Observatory','Launch Site','Comsat Station',
				'Planetarium', 'Resource Depot', 'Refinery', 'Ore Mine', 'Aramid Factory',
				'Science Facility', 'Research Lab', 'Conservatory', 'Aquaponics',
				'Hotel1', 'Hotel2', 'Hotel3', 'Hotel4', 'Hotel', 'Hotel', 'Venus Colony', 'Venus Colony', 'Landing Site',
				*/
				buildings.forEach((building, index) => {
					if (!building[4] && index < 15) {
						let expensive = planet.resources[0] < building[10]
							|| planet.resources[1] < building[11]
							|| planet.resources[2] < building[12]
							|| planet.resources[3] < building[13]
							|| planet.resources[4] < building[14];
						let disabled = expensive
							|| index > 1 && index < 5 && !buildings[1][4]
							|| index > 5 && index < 9 && !buildings[5][4]
							|| index > 9 && index < 13 && !buildings[9][4]
							|| index == 3 && !buildings[2][4];
						let visible = !(
							index > 1 && index < 5 && !buildings[1][4] ||
							index > 5 && index < 9 && !buildings[5][4] ||
							index > 9 && index < 13 && !buildings[9][4] ||
							index == 13 && (!buildings[5][4] || !buildings[9][4]) ||
							index > 13 && index < 17 && !buildings[13][4]
						);
						if (visible) {
							let mines = index > 4 && index < 10 || index == 12;
							let div = `<div style=${mines && index > 5 && index < 9 ?'position:absolute':'float:left'};width:150px;height:150px;${mines?'line-height:160px;':''}font-size:${mines?112:128}px;border-radius:20px>${String.fromCodePoint(structureMap[building[0]])}</div>`;
							if (mines && index > 5 && index < 9) {
								div += `<div style=float:left;background-color:transparent;width:${index==8||index==12?150:110}px;height:100px;font-size:99px>&#x${index == 12 ? '26f2': '1f' + resources[index == 8 ? 4 : index - 6]};</div>`;
							}
							html += `<nav style=${disabled?'opacity:0.4;':''}margin-top:${(order-structure[8])*200}px${disabled ? '' : getInlineClick(index)}>${div}<b>Build ${building[6]}<br></b>`;
							for (j = 0; j < 5; j++) {
								if (building[10 + j]) {
									html += ` -<b>${building[10 + j]}</b>&#x1F${resources[j]};`;
								}
							}
							html += '</nav>';
							order ++;
						}
					}
					structure[9] = order;
				});
				/*
				for (r = 0; r < 3; r ++) {
					html += getMission(globalPlanets[2].moons[0], structure, order, structureId, r, r);
					order ++;
					globalPlanets.forEach((_planet, index) => {
						if (!_planet.status && index < 4) {
							html += getMission(_planet, structure, order, structureId, 3 + r * 4 + index, r);
							order ++;
						}// TODO: fetch moons
						structure[9] = order;
					});
				}*/

				html += "</div>";
				html += `<nav onclick='document.dispatchEvent(new CustomEvent("menu",{"detail":-1}))' style=right:8;width:128;font-size:128>&#x1f53c;</nav><nav onclick='document.dispatchEvent(new CustomEvent("menu",{"detail":1}))' style=right:8;bottom:50;width:128;font-size:128>&#x1f53d;</nav>`;
			} else {
				// 314 luna
				// 48e diamond
				// 6f0 satell
				// 3ed refinerr
				// 4ca bars
				// 4a0 metal
				// 52c microscope
				// 52d telesc
				// 4e1 satelite dish
				// Icons on the building selected page
				let icon = [314, 680, '6f0', 'a90', '4ca', '3ed', '4a0', '48e', '4c9', '52c', '38d', '30a', '30a', '30a', '30a', '30a', '30a', '30a', '30a', '30a', '30a', '30a'][structureId - 1];
				//String.fromCodePoint(structureMap[building[0]])
				html += `<div style=float:left;margin:25px;width:260px;height:240px;padding-top:20px;font-size:200px;border-radius:35px>&#x1f${icon};</div>`;
				if (structureId == 5) {
					if (monthRandom > 0) {
						let quantities = [25,10,10,5,1];
						let _from = month % 5;
						let quant1 = 0 | quantities[_from] / monthRandom + 1;
						let quant2 = 0 | quantities[toRandom] * monthRandom + 1;
						buildings[5][8] = _from;
						buildings[5][9] = toRandom;

						html += `<br><br><b>This month's offer:<br><br>Get ${quant1} </b>${getEmojiCode(_from)}`;
						html += `<b> for ${quant2} </b>${getEmojiCode(toRandom)}<b><br><br><br><nav onclick='document.dispatchEvent(new CustomEvent("deal",{"detail":[${quant1},${quant2}]}))' style="position:fixed;width:auto;right:440px;color:#fff;background-color:#766;border-radius:0 0 25px 25px;padding:9px 30px 6px;margin:25px">Deal ?</nav>`;// -${quant2}</b>${getEmojiCode(toRandom)} +${quant1}</b>${getEmojiCode(_from)}
					} else {
						html += `<br><br><b>New offer will be<br><br>available in ${-monthRandom+1} months.`;
					}
				} else {
					const built = buildings[structureId][8];
					let upgradeButton = '';
					let enabled = true;
					for (let i = 0; i < 5; i++) {
						if (buildings[structureId][15 + i]) {
							if (buildings[structureId][15 + i] > planet.resources[i]) enabled = false;
							upgradeButton += ` -${buildings[structureId][15 + i] + getEmojiCode(i)}`;
						}
					
					}
					let upgradePrice = `<br><nav ${enabled?`onclick='document.dispatchEvent(new CustomEvent("upgr",{"detail":${structureId}}))'`:''} style="${enabled?'':'opacity:0.3;'}position:fixed;width:auto;right:440px;color:#fff;background-color:#766;border-radius:0 0 25px 25px;padding:9px 30px 6px;margin:${structureId > 4 && structureId < 9 ? 6 : 25}px">${getEmojiCode(9)} Upgrade` + upgradeButton;
					
					const mine = `Production per year:<br>${built?24:12}*${getEmojiCode(structureId - 6)}, ${(built?12:6)/(structureId==8?2:structureId==7?.5:1)}*${getEmojiCode(structureId - 4)}<br>${built?'':`<br><b style=color:#b89;font-size:36px>*Upgrade to double the yield.</b>${upgradePrice}</nav>`}`

					html += `<b><br><br>${
						[
							`Allows observation<br>of the Moon${built?' and the closer terrestrial planets.':`.<b style=color:#b89;font-size:38px><br><br>*Upgrade for terrestrial planets.</b>${upgradePrice}</nav>`}`,

							`Launches spacecraft<br>to the Moon and the closer terrestrial planets.`,

							`Communicate with satellites${built?' and launched probes.':`.<b style=color:#b89;font-size:38px><br><br>*Upgrade to connect with probes.</b>${upgradePrice}</nav>`}`,

							`Observes the<br>${built?'Galilean moons and other terrestrial bodies.':`Gas giant systems.<b style=color:#b89;font-size:38px><br><br>*Upgrade for Gallilean moons</b>${upgradePrice}</nav>`}`,

							, mine, mine, mine,

							`${built?'Launches colonization missions.':`Launches space exploration probes.<b style=color:#b89;font-size:38px><br><br>*Upgrade colonization missions.</b>${upgradePrice}</nav>`}`,
							
							`${built?'Launch microbial tracking programs.':`Perform microbial experiments.<b style=color:#b89;font-size:38px><br><br>*Upgrade microbial tracking.</b>${upgradePrice}</nav>`}`,

							`Cultivation center for colonial food supply.`,

							`Provides ingredients for colonial mineral supply.`,

							`Colony...`,
							
							``
						][structureId - 1]
					}</b>`;
				}
				html += `<nav style=top:10px;width:60px;height:55px;right:0;padding-top:0;border-radius:30px;background-color:#223 onclick='document.dispatchEvent(new CustomEvent("clos"))'><b>&#10006;</b></nav>`;
			}

			menuDiv.innerHTML = html;
			let list = Array.from(menuDiv.children[1].children);
			let first = getMargin(list[0]);
			let offset = getMargin(list[list.length - 1]);

			list.forEach(nav => {
				if (getMargin(nav) < 0) {
					nav.style.marginTop = 200 + offset - first + getMargin(nav);
				}
			});
		}
	});
}

function getEmojiCode(code) {
	return `</b>&#x1F${resources[code]};<b>`;
}

function getMargin(element) {
	return parseInt(element.style.marginTop);
}

function _menu(event) {
	structures[activeStructure][8] += event.detail;
	if (structures[activeStructure][8] < 0) structures[activeStructure][8] += structures[activeStructure][9];
	else if (structures[activeStructure][8] > structures[activeStructure][9]) structures[activeStructure][8] -= structures[activeStructure][9];
	interactSurface();
	setUI();
}

function _head(event) {
	let building = buildings[event.detail];
	if (!building[4]) {
		building[4] = 3;
		updateStructures();
		interactSurface(structures.indexOf(building));
		planet.resources[0] -= building[10];
		planet.resources[1] -= building[11];
		planet.resources[2] -= building[12];
		planet.resources[3] -= building[13];
		planet.resources[4] -= building[14];
		updateResourcesUI();
		setUI();
	}
}

function _misn(event) {//console.log(event);
	const planetName = event.detail.substr(1);
	const missionType = +event.detail.charAt(0);
	let targetPlanet;
	globalPlanets.forEach(_planet => {
		if (_planet.name == planetName) {
			targetPlanet = _planet;
		}
		if (Array.isArray(_planet.moons)) _planet.moons.forEach(_moon => {
			if (_moon.name == planetName) {
				targetPlanet = _moon;
			}
		});
	});
	let missionCost = [targetPlanet.exploreCost, targetPlanet.mineCost, targetPlanet.colonyCost][missionType];
	planet.resources[0] -= missionCost[0];
	planet.resources[1] -= missionCost[1];
	planet.resources[2] -= missionCost[2];
	planet.resources[3] -= missionCost[3];
	planet.resources[4] -= missionCost[4];
	targetPlanet.status = missionType + 1;
	updateResourcesUI();
	interactSurface(structures.indexOf(buildings[2]), true);
}

function _deal(event) {
	if (planet.resources[buildings[5][8]] >= event.detail[0]) {
		planet.resources[buildings[5][8]] += event.detail[0];
		planet.resources[buildings[5][9]] -= event.detail[1];
		updateResourcesUI();
		monthRandom = -3;
		interactSurface();
	}
}

function _close(event) {
	menuDiv.style = '';
	menuDiv.innerHTML = '';
	if (event && event.detail == 1) {
		tutorial = 0;
		unpause();
		idle = true;
	} else {
		removeInteractions();
	}
}

function _upgr(event) {//console.log.log(event.detail, buildings[event.detail][8]);
	if (!(
			buildings[event.detail][8] ||
			planet.resources[0] < buildings[event.detail][15] ||
			planet.resources[1] < buildings[event.detail][16] ||
			planet.resources[2] < buildings[event.detail][17] ||
			planet.resources[3] < buildings[event.detail][18] ||
			planet.resources[4] < buildings[event.detail][19]
		)
	) {
		planet.resources[0] -= buildings[event.detail][15];
		planet.resources[1] -= buildings[event.detail][16];
		planet.resources[2] -= buildings[event.detail][17];
		planet.resources[3] -= buildings[event.detail][18];
		planet.resources[4] -= buildings[event.detail][19];
		buildings[event.detail][8] = 1;
		updateResourcesUI();
		interactSurface(structures.indexOf(buildings[Number(event.detail)]));
		setUI();
	}
}