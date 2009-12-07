var Wave = function() {
	this.state = {};
	this.getState = function() {
		return this.state;
	}

	this.util = new Util();
};

var Util = function() {
	this.printJson = function() {
		return;
	}
};

var lastId = undefined;

var curr = undefined;

var words = undefined;

var canvasheight = 290;
var canvaswidth = 290;

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
		wave.getState().submitValue('lastId', lastId);
	}

	this.text = text;
	this.location = location;
	
	this.nextWords = [];
	this.prevWords = [];
	words[this.id] = this;
	wave.getState().submitValue(this.id, wave.util.printJson(this));

	this.addPrev = addPrev;
	this.addNext = addNext;
	this.removePrev = removePrev;
	this.removeNext = removeNext;

	if (type) {
		this.type = type;
	}

}

function addPrev(prev) {
	this.prevWords[this.prevWords.length] = prev;
}
function addNext(next) {
	this.nextWords[this.nextWords.length] = next;
}
function removePrev(word) {
	for (var i=0; i<this.prevWords.length; i++) {
		if (word.id == this.prevWords[i].id) {
			this.prevWords.splice(i, 1);
		}
	}
}
function removeNext(word) {
	for (var i=0; i<this.nextWords.length; i++) {
		if (word.id == this.nextWords[i].id) {
			this.nextWords.splice(i, 1);
		}
	}
}

function toWord(word) {
	word.addPrev = addPrev;
	word.addNext = addNext;
	word.removePrev = removePrev;
	word.removeNext = removeNext;

	return word;
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
	var w;
	//Checking for $("#"+word.id) retrieves an object.
	//Need to read more about $().
	if (!document.getElementById(word.id)) {
		var worddiv = '<div id="' + word.id + '" class="word">' +
			word.text +
			'</div>';
		w = $(worddiv);
		w.draggable({start: recordStartPoint, stop: redrawConnectors});
		w.click(makeCurrent);
		$("#organic-poetry").append(w);
	} else {
		w = $(word.id);
	}
		
	w.css(new Position(word.location.x, word.location.y));
}

function redrawFrom(w) {
	drawWord(w);

	for (var i=0; i<w.nextWords.length; i++) {
		var nextWord = w.nextWords[i];
		drawLine(w.location, nextWord.location);
		redrawFrom(nextWord);
	}
}

function recordStartPoint(e, ui) {
	var w = words[this.id];
	var pos = $(this).position();
	w.oldPos = new Point(pos.left, pos.top);

	wave.getState().submitValue(w.id, wave.util.printJson(w));
}

function redrawConnectors(e, ui) {
	var w = words[this.id];
	var pos = $(this).position();
	w.location = new Point(pos.left, pos.top);
	wave.getState().submitValue(w.id, wave.util.printJson(w));
	
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
	canvasheight = ui.size.height-5;
	canvas.setAttribute("width", ui.size.width-5);
	canvaswidth = ui.size.width-5;

	redrawFrom(words["start-node"]);
}

function makeCurrent(e) {
	if (curr) {
		$("#"+curr.id).removeClass("selected");
	}
	curr = words[this.id];
	wave.getState().submitValue('curr', wave.util.printJson(curr));
	$(this).addClass("selected");
}

/* This function does not update state, for optimization purposes. Callers
 * should ensure state is updated at the right time. 
 */
function updateCurrent(word) {
	if (curr) {
		$("#"+curr.id).removeClass("selected");
	}
	curr = word;
	//wave.getState().submitValue('curr', wave.util.printJson(curr));
	$("#"+word.id).addClass("selected");
}

function addWords(e) {
	if ((curr.id == "start-node")
		&& (curr.nextWords.length != 0)) {
		return;
	}

	var entered = $("#newWord").val().split(" ");

	for(i=0; i<entered.length; i++) {
		if (entered[i] && (entered[i].length>0)) {
			var n = new Word(entered[i],
							 new Point(curr.location.x, curr.location.y+20));
			n.addPrev(curr);
			curr.addNext(n);

			wave.getState().submitValue(n.id, wave.util.printJson(n));

			drawWord(n);
			drawLine(curr.location, n.location);
			updateCurrent(n);
		}
	}
	//Updating curr state only at the end to minimize need to sync.
	wave.getState().submitValue('curr', wave.util.printJson(curr));
}

function deleteSelected(e) {
	if (curr && (curr.id != "start-node")) {
		deleteSubTree(curr);
		curr = undefined;
		wave.getState().submitValue('curr', undefined);
	}
	var canvas = document.getElementById('op-back');
	canvas.setAttribute("width", canvaswidth);
	redrawFrom(words["start-node"]);
}

function deleteSubTree(word) {
	$("#"+word.id).remove();

	for (var i=0; i<word.prevWords.length; i++) {
		var prevWord = word.prevWords[i];
		clearLine(prevWord.location, word.location);
		prevWord.removeNext(word);
		word.removePrev(prevWord);
	}
	for (var i=0; i<word.nextWords.length; i++) {
		var nextWord = word.nextWords[i];
		deleteSubTree(nextWord);
		i--;
	}
	
	words[word.id] = undefined;
	wave.getState().submitValue(word.id, undefined);
}

function clearState() {
	log("<br/>Clearing state.");
	wave.getState().reset();
}

/*
 * This function should be called on first load of the gadget.
 * This should setup initial state of elements if not already set.
 */
function stateUpdated() {

	var state = wave.getState();

	if (state.get('curr') == 'undefined') {
		state.reset();
	}

	wave.log(wave.util.printJson(state));
	log(wave.util.printJson(state));

	//Update last Id from state.
	lastStored = state.get('lastId');
	if (lastStored) {
		lastId = parseInt(lastStored);
	} else {
		lastId = 1;
		wave.getState().submitValue('lastId', 1);
	}

	//Update word list.
	words = {};
	//Loop through state looking for all words
	//This should mean all state variables != lastId and curr.
	for (key in state.getKeys()) {
		if ((key != 'lastId') && (key != 'curr')) {
			word = toWord(eval(state.get(key)));
			words[word.id] = word;
		}
	}

	//Setup curr. If curr doesn't exist in state, assume first load.
	//If it exists in state, then we now have all information required
	//to draw the canvas
	if (!curr) {
		//Setup event handlers.
		root = $("#organic-poetry");
		root.resizable({stop: resizeCanvas});
		var canvas = document.getElementById('op-back');
		canvas.setAttribute("height", root.height()-5);
		canvas.setAttribute("width", root.width()-5);
		
		$("#clear").click(clearState);
		$("#add").click(addWords);
		$("#delete").click(deleteSelected);
	} else {
		log("<br/>But curr was not null");
	}

	//Restore curr from state.
	currStored = state.get('curr');
	if (currStored) {
		curr = toWord(eval(currStored));
		//Deleting all existing nodes, and redrawing.
		//Need to optimize this so only changes are redrawn.
		var firstWord = words["start-node"].nextWord[0];
		if (firstWord) {
			deleteSubTree(firstWord);
		}
		redrawFrom(words["start-node"]);
		updateCurrent(curr);
	} else {
		var s = new Word("Start", new Point(10,10), "start-node", "start");
		drawWord(s);
		updateCurrent(s);
		wave.getState().submitValue('curr', wave.util.printJson(curr));
	}
}

$(document).ready(stateUpdated);
