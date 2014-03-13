"use strict";

// Gamepad support stuff
navigator.getGamepads = navigator.webkitGetGamepads || navigator.mozGetGamepads || navigator.getGamepads;
if (!!navigator.getGamepads) console.log("Gamepads are supported");
else console.log("No gamepad support");
window.addEventListener("gamepadconnected", function(gamepad) {
	// This event listener is currently needed for Firefox
	console.log("Gamepad connected:", gamepad);
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
	}

	function onKeyUp(event) {
		pressed[event.keyCode] = false;
	}

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	this.poll = function() {
		this.moveInput.set(0, 0);

		if (pressed[this.mapping.left]) this.moveInput.x = -1;
		else if (pressed[this.mapping.right]) this.moveInput.x = 1;
		if (pressed[this.mapping.up]) this.moveInput.y = 1;
		else if (pressed[this.mapping.down]) this.moveInput.y = -1;

		return Controller.prototype.poll.call(this);
	};
};
KeyboardController.prototype = Object.create(Controller.prototype);
KeyboardController.DefaultMappings = [
	{ name: "Keyboard: Arrows", up: 38, down: 40, left: 37, right: 39 },
	{ name: "Keyboard: WASD", up: 87, down: 83, left: 65, right: 68 },
	{ name: 'Keyboard: HJKL ("Vi keys")', up: 75, down: 74, left: 72, right: 76 }
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
}
