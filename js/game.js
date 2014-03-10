"use strict";

function Game() {
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	this.camera.position.z = 7;

	this.actors = [];

	this.world = new World();

	var self = this;
	function resize() {
		var w = window.innerWidth - 200, h = window.innerHeight;
		self.camera.aspect = w / h;
		self.camera.updateProjectionMatrix();
		self.renderer.setSize(w, h);
	}

	this.renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById("canvas"),
		antialias: true
	});
	resize();
	document.getElementById("container").appendChild(this.renderer.domElement);
	window.addEventListener("resize", resize);

	this.rendererInfo = document.getElementById("renderer-info");
	this.stats = new Stats();
	document.body.appendChild(this.stats.domElement);
}

Game.prototype.addActor = function(actor) {
	if (!this.actors.length) {
		this.camera.position.x = actor.position.x;
		this.camera.position.y = actor.position.y;
	}
	this.actors.push(actor);
	this.world.scene.add(actor);
};

Game.prototype.findActor = function(x, y) {
	for (var i = 0; i < this.actors.length; ++i) {
		var actor = this.actors[i];
		if (distSq(x, y, actor.position.x, actor.position.y) < 0.2 * 0.2)
			return actor;
	}
	return null;
};

Game.prototype.update = function(dt) {
	var map = this.world.map;
	for (var i = 0; i < this.actors.length; ++i) {
		var actor = this.actors[i];
		var controller = actor.controller;
		if (!controller || actor.target !== null) continue;
		controller.update(dt);
		if (controller.moveInput.x == 0 && controller.moveInput.y == 0) continue;
		var newx = Math.round(actor.position.x + controller.moveInput.x);
		var newy = Math.round(actor.position.y + controller.moveInput.y);
		var other = this.findActor(newx, newy);
		if (other && other.visible) {
			if (actor.faction != other.faction) {
				--other.health;
				if (other.health <= 0)
					other.visible = false;
			}
		} else if (map.isWalkable(newx, newy))
			actor.target = new THREE.Vector3(newx, newy, actor.position.z);
	}
}

Game.prototype.render = function(dt) {
	for (var i = 0; i < this.actors.length; ++i) {
		var actor = this.actors[i];
		if (actor.target === null) continue;
		lerp2d(actor.position, actor.target, dt * 15);
		if (actor.position.distanceToSquared(actor.target) < 0.001) {
			actor.position.copy(actor.target);
			actor.target = null;
		}
	}

	lerp2d(this.camera.position, this.actors[0].position, dt * 5);
	this.world.update(dt);
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
