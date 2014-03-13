"use strict";

var cache, ui, game, clock;

function render() {
	requestAnimationFrame(render);
	var dt = clock.getDelta();
	if (dt > 0.05) dt = 0.05;

	game.update();
	game.render(dt);
	ui.render();
};


function start(players) {
	dom("#intro").style.display = "none";
	dom("#container").style.display = "block";
	cache = new Cache();
	ui = new UI();
	game = new Game();
	clock = new THREE.Clock();
	var i;

	for (i = 0; i < players.length; ++i) {
		var pl = new Actor({ model: players[i].character, torch: true });
		if (players[i].controllerType == "gamepad") {
			pl.controller = new GamepadController(players[i].controllerIndex);
		} else {
			pl.controller = new KeyboardController(players[i].controllerIndex);
		}
		ui.track(pl);
	}

	for (i = 0; i < 50; ++i) {
		var monster = new Actor({ model: "ghoul", monster: true });
		monster.position.x = (Math.random() * game.world.map.w)|0;
		monster.position.y = (Math.random() * game.world.map.h)|0;
	}

	for (i = 0; i < 50; ++i) {
		game.spawnRandomItem();
	}

	render();
}
