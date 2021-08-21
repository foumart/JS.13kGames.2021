class TweenFX {

	//static tweenedElements = [];

	static to(_element, _duration, _object) {
		/*if (TweenFX.tweenedElements.indexOf(_element) > -1) {
			return;
		}
		TweenFX.tweenedElements.push(_element);*/

		const tweenedKeys = [];
		const tweenedStart = [];
		const tweenedEnd = [];

		Object.keys(_object).forEach(key => {
			tweenedKeys.push(key);
			tweenedStart.push(_element[key]);
			tweenedEnd.push(_object[key]);
		})
		let count = 0;
		let eased;
		const duration = _duration;
		const element = _element;
		//const object = _object;
		const tween = () => {
			if (count < duration) {
				count ++;
				tweenedKeys.forEach((key, i) => {
					eased = duration * .5 * (Math.sin((count / duration - .5) * Math.PI) + 1);
					if (tweenedStart[i] > tweenedEnd[i]) {
						element[key] = tweenedEnd[i] + (tweenedStart[i] - tweenedEnd[i]) / duration * (duration - eased);
					} else {
						element[key] = tweenedStart[i] - (tweenedStart[i] - tweenedEnd[i]) / duration * eased;
					}
				});
				requestAnimationFrame(tween);
			} else {
				//TweenFX.tweenedElements.splice(TweenFX.tweenedElements.indexOf(_element), 1);
				// callback
			}
		}
		requestAnimationFrame(tween);
	}
}
