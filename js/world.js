"use strict";

function World() {
	this.scene = new THREE.Scene();
	this.map = MapGen.generateOverworld();
	this.root = null;
	this.scene.add(new THREE.AmbientLight(0x222222));

	this.rebuildScene();
}

World.prototype.rebuildScene = function() {
	if (this.root) this.scene.remove(this.root);
	this.root = new THREE.Object3D();
	var i, j;
	var map = this.map;

	// Ground
	var groundPlane = new THREE.PlaneGeometry(map.w, map.h);
	var groundMat = cache.getMaterial(randElem([ "grass-01", "grass-02", "grass-03" ]));
	groundMat.map.wrapS = groundMat.map.wrapT = THREE.RepeatWrapping;
	groundMat.map.repeat.set(map.w / 3, map.h / 3);
	groundMat.normalMap.wrapS = groundMat.normalMap.wrapT = THREE.RepeatWrapping;
	groundMat.normalMap.repeat.set(map.w / 4, map.h / 4);
	groundMat.specularMap.wrapS = groundMat.specularMap.wrapT = THREE.RepeatWrapping;
	groundMat.specularMap.repeat.set(map.w / 4, map.h / 4);
	var ground = new THREE.Mesh(groundPlane, groundMat);
	ground.position.set(map.w / 2 - 0.5, map.h / 2 - 0.5, 0);
	this.root.add(ground);

	var rocks = [ "rock-01", "rock-02", "rock-03", "rock-04" ];
	var bushes = [ "fern-01", "fern-02" ];
	var pillars = [ "obelisk-01", "obelisk-02", "pillar-broken-01", "pillar-broken-02" ];

	function objectHandler(parent, pos, def) {
		return function(geometry, materials) {
			def = def || {};
			if (!geometry.boundingBox) geometry.computeBoundingBox();
			geometry.dynamic = false;

			var material = materials.length > 1 ? new THREE.MeshFaceMaterial(materials) : materials[0];

			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.copy(pos);
			mesh.position.z = 0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y) + 0.001;
			mesh.rotation.x = Math.PI / 2;
			mesh.rotation.y = Math.PI * 2 * Math.random();

			if (!def.noShadows) {
				mesh.castShadow = true;
				mesh.receiveShadow = true;
			}
			mesh.matrixAutoUpdate = false;
			mesh.updateMatrix();
			parent.add(mesh);
		};
	}

	for (j = 0; j < map.h; ++j) {
		for (i = 0; i < map.w; ++i) {
			var tile = map.get(i, j);
			var model = null;
			if (tile == ROCK) model = randElem(rocks);
			else if (tile == BUSH) model = randElem(bushes);
			else if (tile == PILLAR) model = randElem(pillars);
			else if (tile == TOWER) model = "tower";
			if (model) cache.loadModel("assets/models/" + model + "/" + model + ".js",
				objectHandler(this.root, new THREE.Vector3(i, j, 1.0)));
		}
	}

	this.scene.add(this.root);
};
