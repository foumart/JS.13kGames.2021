let playTutorial = 1;

function clearUI(x, y, width, height = hardHeight) {
	overContext.clearRect(x || 0, y || 0, width || hardWidth, height || hardHeight);
}

function updateUI(text, x = 16, y = 64, size = 70, clear, bold) {
	if (!text) clearUI(0, 0, hardWidth, hardHeight);
	if (clear) clearUI(x-5, y-size, hardWidth-x, size * 1.55);
	if (text || count > 340 || !state) {
		overContext.textAlign = !x ? 'center' : 'left';
		overContext.shadowColor = '#000';
		overContext.shadowBlur = 5;
		overContext.font = `${state > 2 || !text || !state || bold ? 'bold ' : ''}${size}px Arial`;
		overContext.fillStyle = '#fff';
		if (!text) overContext.fillRect(x, y + 12, overContext.measureText(planet.name).width, 5);
		overContext.fillText(text || planet.name, x || hardWidth / 2, y);

		// TODO: menu/info for planets
		if (!text && state < 3) {
			overContext.font = '36px Arial';
			overContext.fillStyle = '#888';
			let description = `Population: ${planet.population / 1000}m.`;
			if (zoomed) {
				if (!planet.moons || planet.moons.length == 2) {
					description = ['Unexplored.','Explored.','Being mined.','Colonized.'][planet.status];
				}
			}/* else if (planet.moons.length == 9) {
				// terrestrial planetary / solar system
				if (!system) description = 'Gas giants currently unreachable.';
			}*/// else {
			//	description = `Population: ${planet.population / 1000}m`;
			//}
			overContext.fillText(description, x, y+64);

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

function getResources(moon) {
	oil += !moon ? -oil : moon.resources[0];
	ore += !moon ? -ore : moon.resources[1];
	silica += !moon ? -silica : moon.resources[2];
	metal += !moon ? -metal : moon.resources[3];
	carbon += !moon ? -carbon : moon.resources[4];
}

function browseForResources(moon) {
	moon.moons.forEach((moon, index) => {
		//if (index < state * 4) getResources(moon); ??
		if (moon.moons) browseForResources(moon);
	});
}

function updateResourcesUI() {
	//const basePlanet = planet;//!zoomed && state < 3 ? sun : planet;
	//console.log(basePlanet)
	getResources();
	getResources(planet);
	/*if (planet.moons && system < 5 && system < 2) {
		browseForResources(planet); // ??
	}*/
	//display resources:
	if (planet.status || (!selectedPlanet && !zoomed)) {
		resDiv.innerHTML = '<b><u>Resources:</u>';
		for (i = 0; i < 5; i++) {
			resDiv.innerHTML += `<br>&#x1F${resources[i]}; <b>${[oil,ore,silica,metal,carbon][i]}</b>`;
		}
	} else {
		resDiv.innerHTML = '';
	}
}

function getNavButton(id) {
	return `<nav id=nav${id} ${state > 2 ? 'style="margin:829px 0 0 0;font-size:92px;padding:3px 12px 9px 0;background-color:#000"' : ''}>&#x23`;
}

function setUI() {
	spaceCanvas.style.display = spaceDiv.style.display = state && state < 3 ? 'block' : 'none';
	gameCanvas.style.display = bgrCanvas.style.display = state < 3 ? 'none' : 'block';
	gameDiv.style = 'width:1920px;height:1080px;' + (!state ? 'filter:blur(9px) hue-rotate(-40deg)' : state < 3 ? 'margin-top:940px' : '');
	frameDiv.style = state && state < 3 ? 'display:none' : `width:${!state ? hardWidth : frameWidth}px;height:${!state ? hardHeight : surfaceHeight}px;`;
	uiDiv.style = state ? '' : 'opacity:0.4;font-size:125px;transform:scale(15.7,12) translateX(898px) translateY(-48px)';
	uiDiv.innerHTML = state ? `${getNavButton(0)}EA;</nav>${getNavButton(1)}F8;</nav>${getNavButton(2)}E9;</nav>` : '&#x1F30C;';
	if (state > 2) uiDiv.innerHTML += '<nav id=sys style="filter:hue-rotate(180deg) saturate(0.5);font-size:160px;float:right">&#x1FA90;</nav>'
									+ (state == 3 ? '<nav id=base style="float:right;margin:0 42px 0 1400px;width:99px;height:99px;line-height:120px">&#x1F3E2;</nav>' : '');
}

function showMеnu() {
	updateUI("in ASCENT", 0, 500, 220);
	updateUI("Start Game", 0, 720, 70);
	updateUI(`${String.fromCodePoint(playTutorial ? 9989 : 9209)} Tutorial`, 0, 850, 40);
	updateUI("Developed by Noncho Savov, FoumartGames © 2021. Submission for JS13K games, theme SPACE.", 0, 999, 32);
}