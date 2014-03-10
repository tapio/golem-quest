"use strict";

function Actor(params) {
	THREE.Mesh.call(this,
		new THREE.CubeGeometry(0.85, 0.85, 0.85),
		new THREE.MeshPhongMaterial({
			color: 0x0000ff
		})
	);

	if (params.torch) {
		var light = new THREE.PointLight(0xffff88, 1, 20);
		light.position.set(0, 0, 1);
		this.add(light);
	}

	this.position.set((game.world.map.w / 2)|0, (game.world.map.h / 2)|0, 0.5 * 0.85);
}
Actor.prototype = Object.create(THREE.Mesh.prototype);
