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
		var pl = new Actor(players[i].character);
		if (players[i].controllerType == "gamepad") {
			pl.controller = new GamepadController(players[i].controllerIndex);
		} else {
			pl.controller = new KeyboardController(players[i].controllerIndex);
		}
		pl.position.x = Math.round(game.world.map.w / 2) - 1 + i * 2;
		pl.position.y = Math.round(game.world.map.h / 2) - 2;
		dom("#player-" + (i+1) + " .name").innerHTML = players[i].character.name;
		dom("#player-" + (i+1) + " .name").className += " " + players[i].character.css;
		ui.track(pl);
	}

	for (i = 0; i < 50; ++i) {
		var monster = new Actor({ model: "ghoul", monster: true });
		var pos = game.world.map.findRandomPosition();
		monster.position.x = pos.x;
		monster.position.y = pos.y;
	}

	for (i = 0; i < 50; ++i) {
		game.spawnRandomItem();
	}

	for (i = 0; i < Figurines.length; ++i) {
		var fig = new Item(Figurines[i]);
		var pos = game.world.map.findRandomPosition(function(x, y, c) {
			//return distSq(x, y, game.world.map.w * 0.5, game.world.map.h * 0.5) < 40;
			return x < 0.25 * game.world.map.w
				|| x > 0.75 * game.world.map.w
				|| y < 0.25 * game.world.map.h
				|| y > 0.75 * game.world.map.h;
		});
		fig.position.x = pos.x;
		fig.position.y = pos.y;
		game.items.push(fig);
		game.figurines++;
	}

	render();
}
