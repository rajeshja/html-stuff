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
	var canvas = document.getElementById('op-back');
	if (canvas.getContext) {
		return canvas.getContext('2d');
	} else {
		return undefined;
	}
}

function Word(text, location, id, type) {
	if (id) {
		this.id = id;
	} else {
		this.id = 'w' + lastId;
		lastId ++;
	}

	this.text = text;
	this.location = location;
	
	this.nextWords = [];
	this.prevWords = [];
	words[this.id] = this;

	this.addPrev = function(prev) {
		this.prevWords[this.prevWords.length] = prev;
	}

	this.addNext = function(next) {
		this.nextWords[this.nextWords.length] = next;
	}

	if (type) {
		this.type = type;
	}

}

function drawLine(frompos, topos) {
	var ctx = getCanvasCtx();
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.moveTo(frompos.x+5, frompos.y+5);
	ctx.lineTo(topos.x+5, topos.y+5);
	ctx.stroke();
}

function clearLine(frompos, topos) {
	var ctx = getCanvasCtx();

	var x = frompos.x<topos.x ? frompos.x : topos.x;
	var y = frompos.y<topos.y ? frompos.y : topos.y;
	var w = frompos.x<topos.x ? topos.x-frompos.x : frompos.x-topos.x;
	var h = frompos.y<topos.y ? topos.y-frompos.y : frompos.y-topos.y;

	ctx.clearRect(x+3, y+3, w+2, h+2);
}

function drawWord(word) {
	var worddiv = '<div id="' + word.id + '" class="word">' +
		word.text +
		'</div>';
	var w = $(worddiv);
	w.draggable({start: recordStartPoint, stop: redrawConnectors});
		
	w.mouseup(makeCurrent);
	w.css(new Position(word.location.x, word.location.y));
	$("#organic-poetry").append(w);
}

function redrawLines(w) {
	//drawWord(w);

	for (var i=0; i<w.nextWords.length; i++) {
		var nextWord = w.nextWords[i];
		drawLine(w.location, nextWord.location);
		redrawLines(nextWord);
	}
}

function recordStartPoint(e, ui) {
	var w = words[this.id];
	var pos = $(this).position();
	w.oldPos = new Point(pos.left, pos.top);
}

function redrawConnectors(e, ui) {
	var w = words[this.id];
	var pos = $(this).position();
	w.location = new Point(pos.left, pos.top);
	
	for (var i=0; i<w.prevWords.length; i++) {
		var prevWord = w.prevWords[i];
		clearLine(prevWord.location, w.oldPos);
	}
	for (var i=0; i<w.nextWords.length; i++) {
		var nextWord = w.nextWords[i];
		clearLine(w.oldPos, nextWord.location);
	}
	for (var i=0; i<w.prevWords.length; i++) {
		var prevWord = w.prevWords[i];
		drawLine(prevWord.location, w.location);
	}
	for (var i=0; i<w.nextWords.length; i++) {
		var nextWord = w.nextWords[i];
		drawLine(w.location, nextWord.location);
	}
}

function resizeCanvas(e, ui) {
	var canvas = document.getElementById('op-back');
	canvas.setAttribute("height", ui.size.height-5);
	canvas.setAttribute("width", ui.size.width-5);

	redrawLines(words["start-node"]);
}

function makeCurrent(e) {
}

function setup() {

	$("#organic-poetry").resizable({stop: resizeCanvas});

	var s = new Word("Start", new Point(10,10), "start-node", "start");
	drawWord(s);

	//var startdiv = '<div id="start-node" class="word">Start</div>';
	//var start = $(startdiv);
	//start.draggable();
	//start.css(new Position(10,10));
	//
	//$("#organic-poetry").append(start);

	var w = new Word("If", new Point(50,50));
	s.addNext(w);
	w.addPrev(s);
	drawWord(w);
	drawLine(s.location, w.location);

	var w1 = new Word("you", new Point(100,50));
	w1.addPrev(w);
	w.addNext(w1);
	drawWord(w1);
	drawLine(w.location, w1.location);

}

$(document).ready(setup);
