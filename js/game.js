"use strict";

function Game() {
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	this.camera.position.z = 10;

	this.world = new World();

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(this.renderer.domElement);

	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.bottom = '0px';
	document.body.appendChild(this.stats.domElement);
}

Game.prototype.render = function(dt) {
	this.world.update(dt);
	this.renderer.render(this.world.scene, this.camera);
	this.stats.update();
};
