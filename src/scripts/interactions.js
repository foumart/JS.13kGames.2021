// mouse / touch interaction
let interactionDistance = -1;

function addListeners() {
	if (mobile) {
		// mobile events
		game.ontouchstart = touchStartHandler;
	} else {
		// desktop events
		game.onmousedown = touchStartHandler;
	}

	// mouse wheel event
	game.onwheel = e => {
		if (state < 3 && idle) {
			onWheel(e);
		}
	};

	// UI button events
	uiDiv.onmousedown = e => {
		//soundFX = new SoundFX();
		//soundFX.init();
		//if (!idle) return;
		if (!state) {
			if (getClientX(e) > 800 && getClientY(e) > 800 && getClientX(e) < 1100 && getClientY(e) < 880) {
				playTutorial = !playTutorial;
				clearUI();
				showMеnu();
			} else {
				switchState(1);// TODO: fetch game progress
			}
		} else {
			if (state > 2) {
				if (e.target == uiDiv) {
					if (activeStructure && getClientX(e) > 750 && getClientX(e) < 1170 && getClientY(e) > 700) {
						// deselect
						activeStructure = -1;
					}
				} else if (e.target.id == 'base') {
					// center surface
					idle = false;
					removeInteractions();
					interactSurface(structures.indexOf(buildings[0]));
				} else if (e.target.id == 'earth') {
					// get back from surface mode
					removeInteractions();
					switchState(buildings[4][4] ? 2 : 1, true, () => zoom());
				} else if (e.target.id == 'moon') {
					removeInteractions();
					switchState(buildings[4][4] ? 2 : 1, true, () => tweenToPlanet(0));
				} else if (e.target.id == 'sys') {
					removeInteractions();
					switchState(buildings[4][4] ? 2 : 1, true, () => getBackFromPlanetSystem());
				}
			} else if (state < 3) {
				if (e.target.id == 'base') {
					removeInteractions();
					const shouldTween = selectedPlanet != 2;
					if (shouldTween) {
						tweenToPlanet(2);
					}
					const dummy = {a: 0, b: 0};
					TweenFX.to(dummy, shouldTween ? 30 : 1, {a: 30}, 0, () => {
						const shouldNest = system != 2;
						if (shouldNest) {
							getIntoNestedSystem();
						}
						TweenFX.to(dummy, shouldNest ? 30 : 1, {a: 30}, 0, () => {
							selectedPlanet = -1;
							enterSurface();
						});
					});
				} else if (e.target.id == 'earth') {
					removeInteractions();
					if (system == 2) {
						if (!zoomed) {
							selectedPlanet = -1;
							enterSurface();
						} else {
							toggleZoom();
						}
					} else {
						if (zoomed && selectedPlanet == 2) {
							if (system) {
								selectedPlanet = -1;
								enterSurface();
							} else {
								getIntoNestedSystem();
							}
						} else {
							tweenToPlanet(2);
						}
					}
				} else if (e.target.id == 'moon') {
					removeInteractions();
					if (selectedPlanet) {
						tweenToPlanet(0);
					} else if (zoomed) {
						if (sun.moons[selectedPlanet].status) {
							enterSurface();
						} else {
							colonyNotification(selectedPlanet);
						}
					}
				} else if (e.target.id == 'sys') {
					removeInteractions();
					if (system == 2) {
						getBackFromPlanetSystem();
					} else if (zoomed) {
						//sunscale = getInitialZoom();
						toggleZoom();
					}
				}
			}
			// system speed control
			if (e.target.id.substr(0,3) == 'nav') {
				const btn = e.target.innerHTML.codePointAt(0) % 6;
				removeInteractions();
				if (!btn) {
					unpause(true, true);
				} else if (btn == 1) {
					increaseSpeed();
				} else if (btn == 2) {
					decreaseSpeed();
				} else {
					pause(true, true);
				}
				e.stopPropagation();
			}
		}
	}

	// html inlined event dispatches from the structure menues
	document.addEventListener("head", _head);
	document.addEventListener("misn", _misn);
	document.addEventListener("menu", _menu);
	document.addEventListener("deal", _deal);
	document.addEventListener("clos", _close);
	document.addEventListener("upgr", _upgr);
	document.addEventListener("expm", _expm);
}

function removeInteractions() {
	if (paused) unpause();
	Array.from(spaceDiv.children).forEach(div => div.style.pointerEvents = 'none');
	if (structures) structures.forEach(structure => {
		if (structure[4] == 3) structure[4] = 1;
		activeStructure = 0;
		menuDiv.innerHTML = '';
		menuDiv.style = '';
	})
}

function touchStartHandler(event) {
	if (!idle) return;
	const lst = menuDiv.children[1];
	if (tutorial || event.target == lst || lst && lst.contains(event.target)) return;
	if (frame.speed && !activeStructure) {
		frame.killed = true;
		frame.speed = 0;
	}
	if (mobile) {
		assignClient(event);
		game.ontouchmove = touchMoveHandler;
		game.ontouchend = game.ontouchcancel = touchEndHandler;
	} else {
		game.onmousemove = touchMoveHandler;
		game.onmouseup = game.onmouseleave = touchEndHandler;
	}
	interactionDistance = -2;

	if (state > 2) {
		if ((event.clientY - offsetY) / scale < surfaceHeight) {
			removeInteractions();
			// minimap frame drag
			if (getClientX(event) < frameOffsetX || getClientX(event) > frameOffsetX + frameWidth) {
				playerX = -(getClientX(event) / hardWidth) * stageWidth + stageWidth / planetWidth / 2;
			}

			frameDragging = true;
			frameX = event.clientX;
			framePlayerX = playerX;
		}
	}
}

function getClientX(e) {
	return (e.clientX - offsetX) / scale;
}

function getClientY(e) {
	return (e.clientY - offsetY) / scale;
}

function assignClient(event) {
	event.clientX = event.changedTouches[0].clientX;
	event.clientY = event.changedTouches[0].clientY;
}

function touchMoveHandler(event) {
	if (state > 2 && interactionDistance > -1) removeInteractions();
	if (mobile) {
		assignClient(event);
	}
	if (touchInteraction(event)) interactionDistance = event.clientX;
}

function touchInteraction(event) {
	if (interactionDistance > -1) {
		if (event.clientX < interactionDistance) {
			if (state < 3) {
				// solar system view
				if (zoomed && selectedPlanet > 0) {
					tweenToPlanet(selectedPlanet - 1);
					return;
				} else if (idle) {
					onWheel({deltaY: -100});
				}
			} else {
				// planet surface view
				moveSurfaceFrame(event.clientX);
			}
		} else if (event.clientX > interactionDistance) {
			if (state < 3) {
				// solar system view
				if (zoomed && selectedPlanet < (!system ? 3 : sun.moons.length - 2)) {
					tweenToPlanet(selectedPlanet + 1);
					return;
				} else if (idle) {
					onWheel({deltaY: 100});
				}
			} else {
				// planet surface view
				moveSurfaceFrame(event.clientX);
			}
		}
	}
	return true;
}

function moveSurfaceFrame(clientX) {
	if (frameDragging) {
		clientX = (framePlayerX + ((frameX - clientX) / scale / hardWidth) * stageWidth);
		playerX = clientX % stageWidth;
		bgrX = clientX / 2 % hardWidth;
	} else {
		frame.speed = (clientX - interactionDistance) / scale;
	}
}

function touchEndHandler(event) {
	if (mobile) {
		assignClient(event);
	}
	if (interactionDistance == -2) {
		frame.killed = true;
		frame.speed = 0;
	}
	if (!frameDragging) {
		touchInteraction(event);
		if (state > 2) {
			const frameSpeed = Math.abs(frame.speed / scale);
			if (frameSpeed > 10) {
				TweenFX.to(frame, frameSpeed > 60 ? 60 : frameSpeed, {speed: 0});
			} else {
				if (!frame.speed) {
					// interaction has ended with no drag, so checking for clicked map elements
					for (let i = 0; i < structures.length; i++) {
						if (structures[i][0] > 49) {
							const tapX = (stageWidth - playerX + getClientX(event)) / 100 + 1;
							const objX = structures[i][1] / 5;
							if (tapX > objX && tapX < objX + 4 && getClientY(event) > 700) {
								// interact with an object on the surface
								if (activeStructure == -1) {
									removeInteractions();
								} else {
									interactSurface(i);
								}
							}
						}
					}
				} else {
					frame.killed = true;
					frame.speed = 0;
				}
			}
		}
	}
	frameDragging = false;
	interactionDistance = -1;
	Array.from(spaceDiv.children).forEach(div => div.style.pointerEvents = 'auto');
	game.ontouchmove = null;
	game.onmousemove = null;
	game.onmouseup = game.onmouseleave = null;
}


function pause(force, user) {
	if (idle || force) {
		if (user) userPaused = 1;
		uiDiv.children[1].innerHTML = '&#x25B6;';
		paused = tween.speed;
		tween.speed = 0;
		updateTimeUI();
	}
}

function unpause(force, user) {
	if (tween.speed || !paused) return;
	tween.speed = paused;
	paused = 0;
	if (user) userPaused = 0;
	uiDiv.children[1].innerHTML = '&#x23F8;';
	updateTimeUI();

	if (tutorial && playTutorial) {
		_close();
		tutorial = count;
	}
}

function increaseSpeed() {
	if (!paused && idle) {
		//soundFX.playSound(100 + 100 * tween.speed, 10, 10);
		if (tween.speed < 0.02) tween.speed = .036;
		else if (tween.speed < 0.05) tween.speed += .054;
		else if (tween.speed < 0.1) tween.speed += .09;
		else if (tween.speed < 1.8) tween.speed += 0.18;
		else tween.speed = 1.8;
		updateTimeUI();
	}
}

function decreaseSpeed() {
	if (!paused && idle) {
		//soundFX.playSound(200 + 100 * tween.speed, -10, 10);
		if (tween.speed > 0.3) tween.speed -= .18;
		else if (tween.speed > 0.1) tween.speed -= .09;
		else if (tween.speed > 0.05) tween.speed -= .054;
		else if (tween.speed > 0.04) tween.speed = .036;
		else tween.speed = 0.018;
		updateTimeUI();
	}
}