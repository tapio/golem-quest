"use strict";

function Game() {
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	this.camera.position.z = 7;
	this.camera.rotation.x = Math.PI / 11;

	this.actors = [];
	this.players = [];
	this.items = [];
	this.round = 1;
	this.roundTimer = 0;
	this.over = false;

	this.figurines = 0;

	this.world = new World();

	var self = this;
	function resize() {
		var w = window.innerWidth, h = window.innerHeight;
		self.camera.aspect = w / h;
		self.camera.updateProjectionMatrix();
		self.renderer.setSize(w, h);
		ui.renderer.setSize(w, h);
	}

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	document.getElementById("container").prependChild(this.renderer.domElement);

	window.addEventListener("resize", resize);
	resize();

	this.rendererInfo = document.getElementById("renderer-info");
	this.stats = new Stats();
	document.body.appendChild(this.stats.domElement);
}

Game.prototype.addActor = function(actor) {
	if (!actor.ai) {
		if (!this.players.length) {
			this.camera.position.x = actor.position.x;
			this.camera.position.y = actor.position.y;
		}
		this.players.push(actor);
	}
	this.actors.push(actor);
	this.world.scene.add(actor);
};

Game.prototype.removeActor = function(actor) {
	if (!actor.ai)
		removeElem(this.players, actor);
	this.world.scene.remove(actor);
	removeElem(this.actors, actor);
};

Game.prototype.findActor = function(x, y) {
	for (var i = 0; i < this.actors.length; ++i) {
		var actor = this.actors[i];
		var pos = actor.getPosition();
		if (distSq(x, y, pos.x, pos.y) < 0.2 * 0.2)
			return actor;
	}
	return null;
};

Game.prototype.spawnRandomItem = function(pos) {
	var item = new Item(randProp(Items));
	pos = pos || this.world.map.findRandomPosition();
	item.position.x = pos.x;
	item.position.y = pos.y;
	this.items.push(item);
};

Game.prototype.removeItem = function(item) {
	this.world.scene.remove(item);
	removeElem(this.items, item);
};

Game.prototype.findItem = function(x, y) {
	for (var i = 0; i < this.items.length; ++i) {
		var item = this.items[i];
		if (distSq(x, y, item.position.x, item.position.y) < 0.4 * 0.4)
			return item;
	}
	return null;
};


Game.prototype.update = function() {
	if (Date.now() < this.roundTimer || this.over || !this.players.length)
		return;
	var map = this.world.map;
	for (var i = 0; i < this.actors.length; ++i) {
		var actor = this.actors[i];
		if (actor.done) continue;

		var controller = actor.controller;
		if (!controller) continue;

		if (controller.poll()) {
			actor.done = true;
			actor.myturn = false;
			if (controller.moveInput.x == 0 && controller.moveInput.y == 0)
				continue;
			actor.rotation.z = Math.atan2(controller.moveInput.y, controller.moveInput.x);
			var newx = Math.round(actor.position.x + controller.moveInput.x);
			var newy = Math.round(actor.position.y + controller.moveInput.y);
			// Win?
			if (!actor.ai && game.figurines <= 0) {
				var tile = map.get(newx, newy);
				if (tile == TOWER || tile == PLACEHOLDER) { // FIXME: Placeholder is a poor name here
					dom("#winscreen").style.display = "block";
					this.over = true;
					return;
				}
			}
			// Attack?
			var other = this.findActor(newx, newy);
			if (other) {
				if (actor.fight(other)) {
					this.roundTimer = Date.now() + 300;
					return;
				}
				continue;
			}
			// Pick up item?
			if (!actor.ai) {
				var item = this.findItem(newx, newy);
				if (item) {
					item.applyToActor(actor);
					ui.inWorldMsg(item.message, actor.getPosition());
					this.removeItem(item);
					continue;
				}
			}
			// Move?
			if (map.isWalkable(newx, newy))
				actor.target = new THREE.Vector3(newx, newy, actor.position.z);
		} else {
			actor.myturn = true;
			return;
		}
	}
	// If we got here, everybody has had their turn
	for (var i = 0; i < this.actors.length; ++i)
		this.actors[i].done = false;
	++this.round;
	this.roundTimer = Date.now() + 150;
};

Game.prototype.render = function(dt) {
	if (!this.players.length) return;
	var i;

	var torchAngle = (Date.now() % 1000) / 1000 * 2 * Math.PI;

	for (i = 0; i < this.actors.length; ++i) {
		var actor = this.actors[i];
		// Light animation
		if (actor.light) {
			actor.light.position.x = Math.cos(torchAngle) * 0.1;
			actor.light.position.y = Math.sin(torchAngle) * 0.1;
		}
		// Movement animation
		if (actor.target === null) continue;
		lerp2d(actor.position, actor.target, dt * 15);
		if (actor.position.distanceToSquared(actor.target) < 0.01) {
			actor.position.copy(actor.target);
			actor.target = null;
		}
	}

	var camTarget = this.players[0].position.clone();
	for (i = 1; i < this.players.length; ++i)
		camTarget.add(this.players[i].position);
	camTarget.divideScalar(this.players.length);
	camTarget.y -= 2;
	lerp2d(this.camera.position, camTarget, dt * 5);
	this.renderer.render(this.world.scene, this.camera);
	this.stats.update();

	var info = this.renderer.info;
	var report = [
		"Prog:", info.memory.programs,
		"Geom:", info.memory.geometries,
		"Tex:", info.memory.textures,
		"Calls:", info.render.calls,
		"Verts:", info.render.vertices,
		"Faces:", info.render.faces,
		"Pts:", info.render.points
	];
	this.rendererInfo.innerHTML = report.join(' ');
};
