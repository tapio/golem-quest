"use strict";

var MapGen = {};

MapGen.generateOverworld = function(seed) {
	var rnd = seed === undefined ? new Alea() : new Alea(seed);
	var w = 100;
	var h = 100;
	var map = new Map(w, h, OPEN);
	var i, j;

	for (j = 0; j < h; ++j) {
		for (i = 0; i < w; ++i) {
			var r = rnd.random();
			if (r < 0.1)
				map.put(i, j, ROCK);
			else if (r < 0.4)
				map.put(i, j, BUSH);
		}
	}
	return map;
}
