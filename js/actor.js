"use strict";

function Actor(params) {
	THREE.Mesh.call(this,
		new THREE.CubeGeometry(0.75, 0.75, 0.85),
		new THREE.MeshPhongMaterial({
			color: params.monster ? 0xff2222 : 0x0000ff
		})
	);

	if (params.torch) {
		var light = new THREE.PointLight(0xffff88, 1, 20);
		light.position.set(0, 0, 1);
		this.add(light);
	}

	this.position.set((game.world.map.w / 2)|0, (game.world.map.h / 2)|0, 0.5 * 0.85);
	this.target = null;
	this.done = false;

	this.ai = !params.monster ? null : {
		waypoints: null,
		activated: false
	};

	this.controller = params.monster ? new AIController(this) : null;

	this.faction = params.monster ? -1 : 1;
	this.health = 5;
}
Actor.prototype = Object.create(THREE.Mesh.prototype);


Actor.prototype.runAI = function() {
	if (this.health <= 0 || !this.ai) return;

	var target = game.actors[0];
	if (target.health <= 0) return;

	var v1 = new THREE.Vector2();

	// Activate monsters
	if (!this.ai.activated && distSq(this.position.x, this.position.y, target.position.x, target.position.y) < 10 * 10) {
		this.ai.activated = true;
	}

	// Update path
	if (this.ai.activated) {
		var path = game.world.map.pathFinder.findPath(
			this.position.x|0, this.position.y|0,
			target.position.x|0, target.position.y|0,
			game.world.map.grid.clone());
		this.ai.waypoints = [];
		for (var j = 1; j < path.length; ++j) {
			v1.set(path[j][0], path[j][1]);
			this.ai.waypoints.push(v1.clone());
		}
	}

	// Does the monster have waypoints?
	if (this.ai.waypoints) {
		if (!this.ai.waypoints.length) {
			this.ai.waypoints = null;
		} else if (!this.target) {
			// Move on to the next waypoint
			v1.set(this.position.x, this.position.y);
			this.controller.moveInput.subVectors(this.ai.waypoints[0], v1);
			this.ai.waypoints.splice(0, 1);
		}
	}
}
