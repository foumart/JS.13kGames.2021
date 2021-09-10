class SoundFX {
	constructor() {
		this.oscTypes = ["sawtooth", "square", "triangle", "sine"];
		this.initialized = false;
		this.volume = 1;
	}

	init() {
		this.context = new (
			window.AudioContext ||
			window.webkitAudioContext
		)();
	}

	// start frequency HZ
	// frequency change in time + / -
	// duration (number of frames taking to play the sound)
	// oscillator type 0 - 3
	// volume 0.0 - 1.0
	playSound(frequency, change, duration, type = 0, volume = 1) {
		// instantiate a new oscillator
		const oscillator = this.context.createOscillator();
		oscillator.type = this.oscTypes[type];

		// instantiate modulation for sound volume control
		const modulationGain = this.context.createGain();
		// set the initial volume to 0 to prevent an ugly tick noise at the beginning
		modulationGain.gain.value = 0;

		// frame counter
		let i = 0;

		const playTune = () => {
			if (!i) {
				oscillator.connect(modulationGain).connect(this.context.destination);
				oscillator.start();
			} else {
				modulationGain.gain.value = (i < 4 ? .05 * i * i : 1 - i / duration) * volume * this.volume;
			}

			oscillator.frequency.value = frequency + change * i;

			if (i++ < duration) {
				setTimeout(playTune, 17);
			}
		}

		playTune();
	}
}