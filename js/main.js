"use strict";

var cache = new Cache();
var ui = new UI();
var game = new Game();
var clock = new THREE.Clock();

var pl = new Actor({ model:"ghoul", torch: true });
pl.controller = new KeyboardController(KeyboardController.DefaultMapping1);
ui.track(pl);

//var pl2 = new Actor({ torch: true });
//pl2.controller = new GamepadController(0);
//game.addActor(pl2);
//ui.track(pl2);

for (var i = 0; i < 50; ++i) {
	var monster = new Actor({ model: "ghoul", monster: true });
	monster.position.x = (Math.random() * game.world.map.w)|0;
	monster.position.y = (Math.random() * game.world.map.h)|0;
}

function render() {
	requestAnimationFrame(render);
	var dt = clock.getDelta();
	if (dt > 0.05) dt = 0.05;

	game.update();
	game.render(dt);
	ui.render();
};

render();
