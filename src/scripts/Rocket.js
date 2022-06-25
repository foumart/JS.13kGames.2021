// Rock'n Scroll class
// -------------------

class Rocket {
	constructor(code) {
		const div = document.createElement('div');
		this.div = div;
		gameDiv.prepend(div);
		div.style.transform = "rotate(315deg) scale(2)";
		
		const div2 = document.createElement('div');
		this.div2 = div2;
		gameDiv.prepend(div2);
		div.style.position = div2.style.position = 'absolute';
		div.style.width = div2.style.width = '100px';
		div2.style.transform = "rotate(45deg) scaleX(-2) scaleY(2)";
		div.innerHTML = div2.innerHTML = String.fromCodePoint(code);

		div.style.opacity = div2.style.opacity = 0;
	}
}
