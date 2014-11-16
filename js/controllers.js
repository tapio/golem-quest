"use strict";

// Gamepad support stuff
navigator.getGamepads = navigator.getGamepads || navigator.webkitGetGamepads || navigator.mozGetGamepads;
if (!!navigator.getGamepads) console.log("Gamepads are supported");
else console.log("No gamepad support");
window.addEventListener("gamepadconnected", function(e) {
	// This event listener is currently needed for Firefox
	console.log("Gamepad connected:", e.gamepad);
});

// Polyfill for Chrome missing the events
(function() {
	if (!navigator.webkitGetGamepads) return;
	var gamepads = [null, null, null, null];

	setInterval(function() {
		for(var i = 0, l = navigator.getGamepads().length; i < l; ++i) {
			var gamepad = navigator.getGamepads()[i];
			if (gamepad && !gamepads[i]) {
				var e = new Event("gamepadconnected");
				e.gamepad = gamepad;
				window.dispatchEvent(e);
				gamepads[i] = gamepad;
			} else if (!gamepad && gamepads[i]) {
				var e = new Event("gamepaddisconnected");
				e.gamepad = gamepads[i];
				window.dispatchEvent(e);
				gamepads[i] = null;
			}
		}
	}, 1500);
})();


var Controller = function() {
	this.moveInput = new THREE.Vector2(0, 0);
};

Controller.prototype.poll = function() {
	return this.moveInput.x != 0 || this.moveInput.y != 0;
};


//
// KeyboardController
//
var KeyboardController = function(index) {
	Controller.call(this);
	this.mapping = KeyboardController.DefaultMappings[index || 0];

	var pressed = [];

	function onKeyDown(event) {
		pressed[event.keyCode] = true;
		if (pressed[17] || pressed[18]) // CTRL/ALT for browser hotkeys
			return;
		if (event.keyCode >= 112 && event.keyCode <= 123) // F1-F12
			return;
		event.preventDefault();
	}

	function onKeyUp(event) {
		pressed[event.keyCode] = false;
		event.preventDefault();
	}

	document.addEventListener('keydown', onKeyDown, true);
	document.addEventListener('keyup', onKeyUp, true);

	this.poll = function() {
		this.moveInput.set(0, 0);
		var m = this.mapping;

		if (pressed[m.nw]) this.moveInput.set(-1, 1);
		else if (pressed[m.ne]) this.moveInput.set(1, 1);
		else if (pressed[m.sw]) this.moveInput.set(-1, -1);
		else if (pressed[m.se]) this.moveInput.set(1, -1);
		else {
			if (pressed[m.left]) this.moveInput.x = -1;
			else if (pressed[m.right]) this.moveInput.x = 1;
			if (pressed[m.up]) this.moveInput.y = 1;
			else if (pressed[m.down]) this.moveInput.y = -1;
		}

		return Controller.prototype.poll.call(this);
	};
};
KeyboardController.prototype = Object.create(Controller.prototype);
KeyboardController.DefaultMappings = [
	{   name: "Arrows + Ins,Del,PgUp,PgDn (keyboard)",
		up: 38, down: 40, left: 37, right: 39,
		nw: 45, ne: 33, sw: 46, se: 34
	},{ name: "Numpad (keyboard)",
		up: 104, down: 98, left: 100, right: 102,
		nw: 103, ne: 105, sw: 97, se: 99
	},{ name: "WASD QEZC (keyboard)",
		up: 87, down: 83, left: 65, right: 68,
		nw: 81, ne: 69, sw: 90, se: 67
	}, { name: 'HJKL YUBN (keyboard)',
		up: 75, down: 74, left: 72, right: 76,
		nw: 89, ne: 85, sw: 66, se: 78
	}
];


//
// GamepadController
//
var GamepadController = function(index) {
	Controller.call(this);
	this.index = index;
};
GamepadController.prototype = Object.create(Controller.prototype);

GamepadController.prototype.poll = function() {
	var gamepads = navigator.getGamepads();
	if (!gamepads) return;

	if (this.index >= gamepads.length) return;

	var gamepad = gamepads[this.index];
	if (!gamepad) return;

	this.moveInput.x = Math.round(gamepad.axes[0]);
	this.moveInput.y = -Math.round(gamepad.axes[1]);

	return Controller.prototype.poll.call(this);
};


//
// AIController
//
var AIController = function(actor) {
	Controller.call(this);
	this.actor = actor;
};
AIController.prototype = Object.create(Controller.prototype);

AIController.prototype.poll = function() {
	this.actor.runAI();
	return true;
};
