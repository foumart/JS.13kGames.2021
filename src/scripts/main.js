const game = document.getElementById("game");
const bgrCanvas = document.getElementById("bgrCanvas");
const gameCanvas = document.getElementById("gameCanvas");
const gameDiv = document.getElementById("gameDiv");
const overCanvas = document.getElementById("overCanvas");

window.addEventListener("load", init);

const bgrContext = bgrCanvas.getContext("2d");
const gameContext = gameCanvas.getContext("2d");
const overContext = overCanvas.getContext("2d");

const hardWidth = 1920;
const hardHeight = 1080;
let width;
let height;

const app = this;

function resize(e) {
	width = document.documentElement["clientWidth"];
	height = document.documentElement["clientHeight"];
	//offsetX = parseInt(gameCanvas.getBoundingClientRect().left);
	//offsetY = parseInt(gameCanvas.getBoundingClientRect().top);
	game.style.transform = "scale("+(height/width > hardHeight/hardWidth ? (width/hardWidth) : getScale())+")"
	game.style.width = hardWidth + "px";
	game.style.height = hardHeight + "px";
	game.style.top = ((height-hardHeight)/2)+"px";
	game.style.left = ((width-hardWidth)/2)+"px";
}
function getScale(h, w){
	h = (height/hardHeight);
	w = (width/hardWidth)
	return h < w ? h : w;
}

function init() {
	window.addEventListener("resize", resize, false);
	resize();

	runSolarSystem();
}
