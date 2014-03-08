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
			if (rnd.random() < 0.4)
				map.put(i, j, WALL);
		}
	}
	return map;
}
