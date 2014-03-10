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

for (var i = 0; i < 50; ++i) {
	var monster = new Actor({ monster: true });
	monster.position.x = (Math.random() * game.world.map.w)|0;
	monster.position.y = (Math.random() * game.world.map.h)|0;
	game.addActor(monster);
}

function render() {
	requestAnimationFrame(render);
	var dt = clock.getDelta();
	if (dt > 0.05) dt = 0.05;
	game.render(dt);
};

window.setInterval(function() {
	game.update(tick / 1000);
}, tick);

window.setInterval(function() {
	for (var i = 0; i < game.actors.length; ++i)
		game.actors[i].updateAI();
}, tick * 10);

render();
