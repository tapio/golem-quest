"use strict";

function World() {
	this.scene = new THREE.Scene();
	this.map = MapGen.generateOverworld();
	this.root = null;
	this.scene.add(new THREE.AmbientLight(0x404040));

	var light = new THREE.PointLight(0xffff88, 1, 20);
	light.position.set(0, 0, 8);
	this.scene.add(light);

	this.rebuildScene();
};

World.prototype.update = function(dt) {
	
};


World.prototype.rebuildScene = function() {
	if (this.root) this.scene.remove(this.root);
	this.root = new THREE.Object3D();
	var i, j;
	var map = this.map;
	var dummy = new THREE.Mesh();
	var geometry = new THREE.Geometry();
	var cube = new BlockGeometry(1, 1, 1);
	var plane = new THREE.PlaneGeometry(1, 1);
	var materials = [
		new THREE.MeshPhongMaterial({ color: 0x005500 }),
		new THREE.MeshPhongMaterial({ color: 0x550000 })
	];

	for (j = 0; j < map.h; ++j) {
		for (i = 0; i < map.w; ++i) {
			var tile = map.get(i, j);
			var isFloor = tile == OPEN;
			var materialIndex = isFloor ? 0 : 1;
			dummy.position.set(i - map.w / 2, j - map.h / 2, isFloor ? 0 : 0.5);
			dummy.geometry = isFloor ? plane : cube;
			THREE.GeometryUtils.merge(geometry, dummy, materialIndex);
		}
	}
	geometry.mergeVertices();
	var worldMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	this.root.add(worldMesh);
	this.scene.add(this.root);
};
