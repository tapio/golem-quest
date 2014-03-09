"use strict";

function Game() {
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	this.camera.position.z = 8;

	this.actors = [];

	this.world = new World();

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(this.renderer.domElement);

	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.bottom = '0px';
	document.body.appendChild(this.stats.domElement);
}

Game.prototype.addActor = function(actor) {
	this.actors.push(actor);
	this.world.scene.add(actor);
};

Game.prototype.update = function(dt) {
	for (var i = 0; i < this.actors.length; ++i) {
		var actor = this.actors[i];
		if (!actor.controller) continue;
		actor.controller.update(dt);
		actor.position.x += actor.controller.moveInput.x;
		actor.position.y += actor.controller.moveInput.y;
	}
}

Game.prototype.render = function(dt) {
	this.camera.position.x = this.actors[0].position.x;
	this.camera.position.y = this.actors[0].position.y;
	this.world.update(dt);
	this.renderer.render(this.world.scene, this.camera);
	this.stats.update();
};
