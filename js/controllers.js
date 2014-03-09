"use strict";

// Gamepad support stuff
navigator.getGamepads = navigator.webkitGetGamepads || navigator.mozGetGamepads || navigator.getGamepads;
if (!!navigator.getGamepads) console.log("Gamepads are supported");
else console.log("No gamepad support");
window.addEventListener("gamepadconnected", function(gamepad) {
	// This event listener is currently needed for Firefox
	console.log("Gamepad connected:", gamepad);
});


var Controller = function() {
	this.moveInput = new THREE.Vector2(0, 0);
};

Controller.prototype.update = function(dt) { };


//
// KeyboardController
//
var KeyboardController = function(mapping) {
	Controller.call(this);
	this.mapping = mapping;

	var pressed = [];

	function onKeyDown(event) {
		pressed[event.keyCode] = true;
	}

	function onKeyUp(event) {
		pressed[event.keyCode] = false;
	}

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	this.update = function(dt) {
		this.moveInput.set(0, 0);

		if (pressed[this.mapping.left]) this.moveInput.x = -1;
		else if (pressed[this.mapping.right]) this.moveInput.x = 1;
		if (pressed[this.mapping.up]) this.moveInput.y = 1;
		else if (pressed[this.mapping.down]) this.moveInput.y = -1;
	};
};
KeyboardController.prototype = Object.create(Controller.prototype);
KeyboardController.DefaultMapping1 = { up: 38, down: 40, left: 37, right: 39 } // Arrows
KeyboardController.DefaultMapping2 = { up: 87, down: 83, left: 65, right: 68 } // WASD


//
// GamepadController
//
var GamepadController = function(index) {
	Controller.call(this);
	this.index = index;
};
GamepadController.prototype = Object.create(Controller.prototype);

GamepadController.prototype.update = function(dt) {
	var gamepads = navigator.getGamepads();
	if (!gamepads) return;

	if (this.index >= gamepads.length) return;

	var gamepad = gamepads[this.index];
	if (!gamepad) return;

	this.moveInput.x = Math.round(gamepad.axes[0]);
	this.moveInput.y = -Math.round(gamepad.axes[1]);
};
