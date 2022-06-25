let clearNotification;
let missionsExpanded;

function clearUI(x, y, width, height = hardHeight) {
	overContext.clearRect(x || 0, y || 0, width || hardWidth, height || hardHeight);
}

function observatoryNotification(selected, sys = system) {
	clearNotification = count + 150;
	notify(`${sys != 2 && selected < 4 ? 'Upgrade' : 'Build'} ${selected < 4 ? 'Observatory' : 'Planetarium'} to view ${isNaN(sys) ? sys : sys == 2 ? 'the Moon' : (selected > 3 ? 'the ' : '') + globalPlanets[selected].name}.`);
}

function colonyNotification(selected) {
	clearNotification = count + 150;
	notify(`Send a probe to view ${system == 2 ? 'the Moon' : globalPlanets[selected].name} surface.`);
}

function notify(text = ' ') {
	updateUI(text, 0, 1070, 36, 1);
}

function updateUI(text, x = 20, y = 46, size = 50, clear, bold, face = "Arial") {
	if (!text) clearUI(0, 0, hardWidth, hardHeight);
	if (clear) clearUI(x-5, y-size, hardWidth-x, size * 1.55);
	if (text || count > 340 || !state) {
		overContext.textAlign = !x ? 'center' : 'left';
		overContext.shadowColor = '#000';
		overContext.shadowBlur = 5;
		overContext.font = `${state > 2 || !text || !state || bold ? 'bold ' : ''}${size}px ${face}`;
		overContext.fillStyle = '#fff';
		const _planet = zoomed ? planet : sun;
		if (!text) overContext.fillRect(x, y + 12, overContext.measureText(text || _planet.name).width, 5);
		overContext.fillText(text || _planet.name, x || hardWidth / 2, y);

		// TODO: menu/info for planets
		if (!text) {
			overContext.font = '28px ' + face;
			//overContext.fillStyle = '#bbb';
			let description = `Population:`;//Population://count > 360 ? 'Tap to zoom in' : '';${_planet.population / 1000}m.
			if (zoomed) {
				if (!_planet.moons || _planet.moons.length == 2) {
					description = ['Unexplored.','Explored.','Being mined.','Colonized.'][_planet.status];
					
				}
			}/* else if (_planet.moons.length == 9) {
				// terrestrial planetary / solar system
				if (!system) description = 'Gas giants currently unreachable.';
			}*/// else {
			//	description = `Population: ${_planet.population / 1000}b`;
			//}
			overContext.fillText(description, x, y+50);

			updateTimeUI();
			updateYearUI();
			updateResourcesUI();
		}
	}
}

function updateTimeUI(posY = 0) {
	if (state < 3 && count > 345) {
		tween.speed = +tween.speed.toFixed(3);
		updateUI('Timeflow: ' + (paused ? 'paused' : `${1 + (0 | tween.speed * 55.5)} day / second`), 14, 850 + posY, 36, 1);
	}
}

function updateYearUI(posY = 0, posX) {
	if (state > 2) {
		posX = 1;
		posY = 150;
	}
	updateUI((posX ? '' : 'Year: ') + (0|year), posX ? 330 : 14, 915 + posY, 52, 1, 1);
	updateUI((month < 10 ? '/ 0' + month : '/ ' + month), posX ? 455 : 280, 915 + posY, 44, 1);
	updateUI((day < 10 ? '/ 0' + day : '/ ' + day), posX ? 540 : 364, 915 + posY, 36, 1);
}

function getResources(moon) {//TODO
	oil += !moon ? -oil : moon.resources[0];
	ore += !moon ? -ore : moon.resources[1];
	silica += !moon ? -silica : moon.resources[2];
	metal += !moon ? -metal : moon.resources[3];
	carbon += !moon ? -carbon : moon.resources[4];
	air += !moon ? -air : moon.resources[6];
	special += !moon ? -special : moon.resources[5];
	nuke += !moon ? -nuke : moon.resources[7];
}

function browseForResources(moon) {
	moon.moons.forEach((moon, index) => {
		if (index < state * 4) getResources(moon);
		if (moon.moons) browseForResources(moon);
	});
}

function updateResourcesUI() {
	//const basePlanet = planet;//!zoomed && state < 3 ? sun : planet;
	//console.log(basePlanet)
	getResources();
	getResources(planet);
	if (planet.moons && state < 3 && system < 2) {
		browseForResources(planet);
	}
	//display resources:if (buildings.length < 3) return;
	if (buildings) {
		let resDivHtml = '';
		if (buildings.length > 2 && (planet.status || (!selectedPlanet && !zoomed))) {
			resDivHtml = '<div style=font-size:32px;line-height:25px>Resources:&nbsp; &nbsp; Inc: &nbsp;&nbsp;Cap:<br><br></div>';
			for (i = 0; i < 7; i++) {
				const res = [oil,ore,silica,metal,carbon,air==-1?'<div style=font-size:28px;display:inline-block;line-height:46px>abundant</div>':air,special,nuke];
				if (i != 5) {
					resDivHtml += `<div${
						i==6?' style=position:fixed;top:88px;transform:scale(0.75);transform-origin:left':i==5?' style=opacity:0.4':''
					}>&#x1f${
						resources[i]
					}; <b>${res[i]}${i==6?'':''}</b>${res[i]>99?'':''}<b style=float:right;font-size:36px;color:#889>&nbsp;${getResourcesCap()[i]}</b><b style=line-height:${i==6?92:85}px;float:right;font-size:24px;color:#889>${i==6?'&nbsp;<i style="font-size:36px;color:#aaa">m</i>&nbsp;':''}+${getResourcesIncome()[i]}${i<3||i==6?'&nbsp;':' &nbsp; &nbsp; '}${i==6?'&nbsp;<b style="font-size:36px;color:#a99">15000</b> &nbsp;':''}</b></div>`;
				}
			}
		} else {
			resDivHtml = buildings.length < 3 ? '<b>Landing on Venus...</b>' : '';
		}
		resDiv.innerHTML = resDivHtml;
	}
}

function getNavButton(id) {
	return `<nav id=nav${id} ${state > 2 ? 'style="margin:829px 0 0 0;font-size:92px;padding:3px 12px 9px 0;background-color:#000"' : ''}>&#x23`;
}

function setUI() {
	spaceCanvas.style.display = spaceDiv.style.display = state && state < 3 ? 'block' : 'none';
	gameCanvas.style.display = bgrCanvas.style.display = state < 3 ? 'none' : 'block';
	gameDiv.style = 'width:1920px;height:1080px;' + (!state ? 'filter:blur(8px) hue-rotate(-40deg)' : state < 3 ? 'margin-top:940px' : '');
	frameDiv.style = state && state < 3 ? 'display:none' : `width:${!state ? hardWidth : frameWidth}px;height:${!state ? hardHeight : surfaceHeight}px;`;
	//if (buildings.length < 3) return;
	uiDiv.style = state ? '' : 'opacity:0.4;font-size:125px;transform:scale(15.7,12) translateX(898px) translateY(-48px)';
	uiDiv.innerHTML = state ? `${getNavButton(0)}EA;</nav>${getNavButton(1)}F8;</nav>${getNavButton(2)}E9;</nav>` : '&#x1f30c;<div style=position:absolute;margin-top:-71px;margin-left:44px;font-size:46px;transform:scaleY(1.2)>&#x1f3d4;</div><div style=position:absolute;margin-top:-92px;margin-left:82px;font-size:28px;transform:scaleY(1.25)>&#x2604;</div><div style=position:absolute;margin-top:-104px;margin-left:16px;font-size:25px;transform:scaleY(1.25)>&#x1f31f;</div><div style=position:absolute;margin-top:-46px;margin-left:32px;font-size:18px;transform:scaleY(1.3)>&#x1f4e1;</div>';
	navDiv = document.createElement('div');
	navDiv.style = `${state>2?'float:right':'position:fixed;right:-160px'};padding:0 35px 0 0;margin:${state>2?28:-762}px -28px 0 0;width:150px;border-radius:30px;border:4px solid #335;background-color:${getRGBA(4,4,5,0.6)}`;
	uiDiv.appendChild(navDiv);
	let innerHtml;
	innerHtml = /*(system == 2) ?*/ `<nav id=base class=stroked style="margin:10px 0 0 30px;width:99px;height:99px;line-height:120px">&#x1F3E2;</nav>`// : '';
	innerHtml += `<nav id=launch class=stroked style="${buildings[2][4]?'':'opacity:0.3;pointer-events:none;'}margin:25px 0 0 35px;font-size:90px">&#x1f680;</nav>`;
	innerHtml += `<nav id=earth class=stroked style="padding:0 3px;margin:25px 0 0 32px;font-size:90px">&#x1f30d;</nav>`;
	innerHtml += `<nav id=moon class=stroked style="${buildings[1][4]?'':'opacity:0.2;pointer-events:none;'}padding:0 3px;margin:20px 0 0 35px;font-size:86px">&#x1f315;</nav>`;
	innerHtml += `<nav id=sys class=stroked style="${buildings[1][8]?'':'opacity:0.2;pointer-events:none;'}filter:hue-rotate(180deg) saturate(0.5);margin:-5px 0 0 18px;font-size:130px">&#x1fa90;</nav>`;
	navDiv.innerHTML = innerHtml;

	// TODO: start?
	const beginning = 2020;
	const current_year = (beginning + earthRad / 365.25);
	const impact_start = 4000;
	const impactActive = !(beginning + impact_start / 365.25 > current_year);// && buildings[1][8];
	const impact_end = 4200;
	const impact_year = (beginning + impact_end / 365.25);
	const impact_month = 1 + (0|(impact_year - (0|impact_year)) * 12);
	const impact_day = 1 + (0|(impact_year - (0|impact_year)) * 360 % 30);
	const impactDate = `${0|impact_year}-${(impact_month<10?'0':'') + impact_month}-${(impact_day<10?'0':'') + impact_day}`;
	const impactPercent = (current_year - beginning) / ((impact_year - beginning) / 100);

	const giant_start = 1200;
	const giantActive = beginning + giant_start / 365.25 > current_year;
	const giant_end = 11000;
	const giant_year = (beginning + giant_end / 365.25);
	const giant_month = 1 + (0|(giant_year - (0|giant_year)) * 12);
	const giant_day = 1 + (0|(giant_year - (0|giant_year)) * 360 % 30);
	const giantDate = `${0|giant_year}-${(giant_month<10?'0':'') + giant_month}-${(giant_day<10?'0':'') + giant_day}`;
	const giantPercent = (current_year - beginning) / ((giant_year - beginning) / 100);

	const missionsDiv = document.createElement('div');
	missionsDiv.style = `${state>2?'float:right;width:220px':'float:right'};`;//display:${state<3&&!missionsExpanded?'none':'block'}
	uiDiv.appendChild(missionsDiv);
	const expandMissionsButton = `<nav onclick='document.dispatchEvent(new CustomEvent("expm"))' style="font-size:140px;line-height:140px;">&#x1f7eb;<div style="font-size:92px;margin:-140px 0 0 25px">&#x${missionsExpanded?2716:2755};</div></nav>`;
	if (state<3) {
		missionsDiv.innerHTML += expandMissionsButton;
		if (!missionsExpanded) {
			return;
		}
	}

	if (state<3) {
		if (giantActive) missionsDiv.appendChild(addAlert(0, giantPercent, giantDate, 'Warming'));
	}

	if (impactActive) missionsDiv.appendChild(addAlert(1, impactPercent, impactDate, 'Comet'));

	if (state>2) {
		if (giantActive) missionsDiv.appendChild(addAlert(0, giantPercent, giantDate, 'Warming'));
	}

	if (impactActive) {
		uiDiv.innerHTML += `<div style="font-size:60px;${state>2?'float:right;margin:10px -205px':'position:fixed;right:366px;bottom:86px'};width:70px;height:70px;border-radius:125px;background-color:#d82;"><b>&nbsp;!!</b></div>`;
	}
}

function addAlert(id, percent, date, name) {
	let alertDiv = document.createElement('div');
	alertDiv.style = `${state>2?'float:right;margin:28px 28px 0 0':'float:right;margin:0 15px'};width:${state>2?180:350}px;height:${state>2?260:133 }px;border-radius:${state>2?30:25}px;border:4px solid #533;background-color:${getRGBA(6,3,3,0.6)}`;
	
	let innerHtml;
	innerHtml = `<div style="float:left;font-size:28px;margin:${state>2?18:14}px 0 0 ${state>2?22:172}px"><b>${name}</b></div>`;
	innerHtml += `<div style="margin:${state>2?210:85}px 0 0 ${state>2?11:170}px;width:${state>2?150:160}px;height:32px;border-radius:20px;background-image:linear-gradient(to right,yellow 0%,#f${0|(10-percent/10)}0 ${(percent?percent-1:0)+'%,#222 '+percent+'%, #222 100%'},red 100%);border:4px solid #644"></div>`;
	
	if (!id) {
		innerHtml += `<nav id=alert${id} style="margin:-${state>2?202:125}px 0 0 ${state>2?28:18}px">&#x1f31e;<div style="height:150px;margin:-113px 0 0 24px;font-size:80px">&#x1f534;</div></nav>`;
	} else {
		innerHtml += `<nav id=alert${id} style="margin:-${state>2?200:128}px 0 0 ${state>2?22:12}px">&#x1f4a5;<div style="height:150px;margin:-134px 0 0 48px;font-size:80px">&#x2604;</div></nav>`;
	}

	innerHtml += `<div style="float:left;font-size:22px;font-family:Arial;margin:${state>2?'-66px 0 0 20':'-70px 0 0 28'}px;color:#a88;"><b>Time left:</b></div>`;
	innerHtml += `<div style="float:left;font-size:26px;font-family:Arial;margin:${state>2?'-35px 0 0 25':'-35px 0 0 30'}px;color:#daa;text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;"><b>${date}</b></div>`;

	const interval = setInterval(() => {
		const alert = document.getElementById("alert" + id);
		if (alert) {
			//alert.style.fontSize = (120 + Math.random() * percent / 20) + "px";
			//alert.children[0].style.fontSize = (80 + Math.random() * percent / 20) + "px";
		} else {
			clearInterval(interval);
		}
	}, 160 - percent);

	alertDiv.innerHTML = innerHtml;
	return alertDiv;
}

function showMеnu() {
	updateUI("in ASCENT", 0, 425, 220);
	updateUI("Start Game", 0, 675, 70);
	//updateUI(`${String.fromCodePoint(127970)}`, 0, 1450, 90, false, false, 'emoji');
	updateUI(`${String.fromCodePoint(playTutorial ? 9989 : 9209)} Tutorial`, 0, 850, 40);
	updateUI("Developed by Noncho Savov, FoumartGames © 2021. Submission for JS13K games, theme SPACE.", 0, 999, 32);
}

function _expm() {
	missionsExpanded = !missionsExpanded;
	setUI();
}