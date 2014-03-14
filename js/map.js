"use strict";
var VOID = " ";
var OPEN = ".";
var WALL = "#";
var DIAG = "%";
var TREE = "T";
var ROCK = "o";
var BUSH = "b";
var PILLAR = "p";
var TOWER = "X";
var PLACEHOLDER = "x";

function Map(w, h, data) {
	this.map = new Array(w * h);
	this.w = w;
	this.h = h;
	this.grid = new PF.Grid(this.w, this.h);
	this.pathFinder = new PF.AStarFinder({
		allowDiagonal: true,
		heurestic: PF.Heuristic.euclidean
	});

	if (data && data.length && data instanceof Array) {
		for (var j = 0; j < h; ++j) {
			for (var i = 0; i < w; ++i) {
				this.map[j * w + i] = data[j][i];
			}
		}
	} else if (data) {
		for (var k = 0; k < w * h; ++k) this.map[k] = data;
	}

	this.get = function(x, y, fallback) {
		if (x < 0 || x >= w || y < 0 || y >= h) return fallback || null;
		return this.map[y * w + x];
	};

	this.put = function(x, y, what) {
		if (x < 0 || x >= w || y < 0 || y >= h) return;
		this.map[y * w + x] = what;
	};

	this.toJSON = function() {
		var res = new Array(h);
		for (var j = 0; j < h; ++j) {
			res[j] = "";
			for (var i = 0; i < w; ++i) {
				res[j] += this.map[j * w + i];
			}
		}
		return res;
	};

	this.replace = function(oldval, newval) {
		for (var j = 0; j < h; ++j) {
			for (var i = 0; i < w; ++i) {
				if (this.map[j * w + i] == oldval)
					this.map[j * w + i] = newval;
			}
		}
	};

	function floodFill(map, x, y, target, filler, skip) {
		var cell = map.get(x, y);
		if (cell != target && cell != skip) return;
		if (cell != skip)
			map.map[y * w + x] = filler;
		floodFill(map, x-1, y, target, filler, skip);
		floodFill(map, x+1, y, target, filler, skip);
		floodFill(map, x, y-1, target, filler, skip);
		floodFill(map, x, y+1, target, filler, skip);
	}

	this.fill = function(x, y, target, filler, skip) {
		floodFill(this, x, y, target, filler, skip);
	};

	this.raycast = function(x1, y1, x2, y2, step) {
		step = step || 0.5;
		var angle = Math.atan2(y2 - y1, x2 - x1);
		var dx = Math.cos(angle) * step;
		var dy = Math.sin(angle) * step;
		while (distSq(x1, y1, x2, y2) > step * step) {
			if (this.map[(y1|0) * w + (x1|0)] == WALL)
				return false;
			x1 += dx;
			y1 += dy;
		}
		return true;
	};

	this.findRandomPosition = function(filter) {
		for (var i = 0; i < 1000; ++i) {
			var x = Math.floor(Math.random() * w);
			var y = Math.floor(Math.random() * h);
			var c = this.get(x, y);
			if (c != VOID && c != OPEN) continue;
			if (filter && !filter(x, y, c)) continue;
			return { x: x, y: y };
		}
		return { // Fail safe, should not come here
			x: Math.floor(Math.random() * w),
			y: Math.floor(Math.random() * h)
		};
	}

	this.isWalkable = function(x, y) {
		if (x < 0 || x >= w || y < 0 || y >= h) return;
		var c = this.map[y * w + x];
		return c != WALL && c != ROCK && c != TREE && c != PILLAR && c != TOWER && c!= PLACEHOLDER;
	};

	this.updatePathFindingGrid = function() {
		for (var j = 0; j < this.h; ++j)
			for (var i = 0; i < this.w; ++i)
				this.grid.setWalkableAt(i, j, this.isWalkable(i, j) ? 1 : 0);
	};

	this.getPath = function(startX, startY, goalX, goalY) {
		var path = this.pathFinder.findPath(startX, startY, goalX, goalY, this.grid.clone());
		var waypoints = [];
		for (var i = 0; i < path.length; ++i)
			waypoints.push({ x: path[i][0], y: path[i][1] });
		return waypoints;
	};

}
