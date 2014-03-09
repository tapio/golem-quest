"use strict";

var cache = new Cache();
var game = new Game();
var clock = new THREE.Clock();
var tick = 100;

var pl = new Actor({ torch: true });
pl.controller = new KeyboardController(KeyboardController.DefaultMapping1);
game.addActor(pl);

var pl2 = new Actor({ torch: true });
pl2.controller = new GamepadController(0);
game.addActor(pl2);


function render() {
	requestAnimationFrame(render);
	var dt = clock.getDelta();
	if (dt > 0.05) dt = 0.05;
	game.render(dt);
};

window.setInterval(function() {
	game.update(tick / 1000);
}, tick);

render();
