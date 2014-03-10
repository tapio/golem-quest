"use strict";

function Game() {
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	this.camera.position.z = 7;

	this.actors = [];

	this.world = new World();

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(this.renderer.domElement);
	window.addEventListener('resize', function() {
		game.camera.aspect = window.innerWidth / window.innerHeight;
		game.camera.updateProjectionMatrix();
		game.renderer.setSize(window.innerWidth, window.innerHeight);
	});

	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.bottom = '0px';
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
		if (map.isWalkable(newx, newy))
			actor.target = new THREE.Vector3(newx, newy, actor.position.z);
	}
}

function lerp(a, b, f) { return a + (b - a) * f; }

Game.prototype.render = function(dt) {
	for (var i = 0; i < this.actors.length; ++i) {
		var actor = this.actors[i];
		if (actor.target === null) continue;
		actor.position.y = lerp(actor.position.y, actor.target.y, dt * 15);
		actor.position.y = lerp(actor.position.y, actor.target.y, dt * 15);
		if (actor.position.distanceToSquared(actor.target) < 0.001) {
			actor.position.copy(actor.target);
			actor.target = null;
		}
	}

	this.camera.position.x = lerp(this.camera.position.x, this.actors[0].position.x, dt * 5);
	this.camera.position.y = lerp(this.camera.position.y, this.actors[0].position.y, dt * 5);
	this.world.update(dt);
	this.renderer.render(this.world.scene, this.camera);
	this.stats.update();
};
