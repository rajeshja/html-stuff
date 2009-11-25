var lastId = 1;

var curr = "";

var words = {};

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Position(x, y) {
	this.left = x + "px";
	this.top = y + "px";
	this.position = "absolute";
}

function getCanvasCtx() {
	canvas = document.getElementById('op-back');
	if (canvas.getContext) {
		return canvas.getContext('2d');
	} else {
		return undefined;
	}
}

function Word(text, position, frompos) {
	this.id = 'w' + lastId;
	lastId ++;
	this.text = text;
	this.position = position;
	
	this.nextWords = {};
	this.prevWords = {};
	words[this.id] = this;

}

function drawLine(frompos, topos) {
	ctx = getCanvasCtx();
	ctx.fillStyle = "black";
	ctx.beginPath();
	ctx.moveTo(frompos.x, frompos.y);
	ctx.lineTo(topos.x, topos.y);
	ctx.stroke();
}

function drawWord(word) {
	worddiv = '<div id="' + word.id + '" class="word">' +
		word.text +
		'</div>';
	w = $(worddiv);
	w.draggable();
	w.mouseup(makeCurrent);
	w.css(word.position);
	$("#organic-poetry").append(w);
}

function makeCurrent(e) {
	w = e.target;
	pos = w.position();
	for (i=0; i<w.prevWords.length; i++) {
		drawLine(new Point(w.prevWords[i].position().left, w.prevWords[i].position().top),
				 new Point(pos.left, pos.top));
	}
}

function setup() {
	startdiv = '<div id="start-node" class="word">Start</div>';
	start = $(startdiv);
	start.draggable();
	start.css(new Position(10,10));
	
	$("#organic-poetry").append(start);

	w = new Word("If", new Position(50,50));
	drawWord(w);
	drawLine(new Point(10,10), new Point(50,50));
	w.prevWords[0] = start;
}

$(document).ready(setup);
