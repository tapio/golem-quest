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
			if (r < 0.075)
				map.put(i, j, ROCK);
			else if (r < 0.2)
				map.put(i, j, BUSH);
			else if (r < 0.21)
				map.put(i, j, PILLAR);
		}
	}
	var tx = (w/2)|0, ty = (h/2)|0;
	map.put(tx, ty, TOWER);
	map.put(tx-1, ty-0, PLACEHOLDER);
	map.put(tx+1, ty+0, PLACEHOLDER);
	map.put(tx-0, ty-1, PLACEHOLDER);
	map.put(tx+0, ty+1, PLACEHOLDER);
	map.put(tx-1, ty-2, OPEN);
	map.put(tx+1, ty-2, OPEN);
	map.updatePathFindingGrid();
	return map;
};
