"use strict";

var FACTION = { PLAYER: 1, MONSTER: -1 };

function Actor(params) {
	THREE.Mesh.call(this);

	if (params.torch) {
		var light = new THREE.PointLight(0xffffcc, 1, 20);
		light.position.set(0, 0, 1);
		this.add(light);
	}
	this.castShadow = true;
	this.receiveShadow = true;
	this.position.x = (game.world.map.w / 2)|0;
	this.position.y = (game.world.map.h / 2)|0;
	this.target = null;
	this.done = false;

	this.ai = !params.monster ? null : {
		waypoints: null,
		activated: false
	};

	this.controller = params.monster ? new AIController(this) : null;

	this.faction = params.monster ? FACTION.MONSTER : FACTION.PLAYER;
	this.health = params.monster ? 2 : 8;

	var self = this;
	cache.loadModel("assets/models/" + params.model + "/" + params.model + ".js", function(geometry, materials) {
		if (!geometry.boundingBox) geometry.computeBoundingBox();
		geometry.dynamic = false;
		self.geometry = geometry;
		self.material = materials.length > 1 ? new THREE.MeshFaceMaterial(materials) : materials[0];
		self.position.z = 0.5 * (geometry.boundingBox.max.z - geometry.boundingBox.min.z) + 0.001;
		game.addActor(self);
	});
}
Actor.prototype = Object.create(THREE.Mesh.prototype);

Actor.prototype.getPosition = function() {
	return this.target ? this.target : this.position;
}

Actor.prototype.runAI = function() {
	this.controller.moveInput.set(0, 0);
	if (this.health <= 0 || !this.ai || this.target) return;

	var target = game.players[0];
	if (!target || target.health <= 0) return;
	var targetPos = target.getPosition();

	var v1 = new THREE.Vector2();

	// Activate monsters
	if (!this.ai.activated && distSq(this.position.x, this.position.y, targetPos.x, targetPos.y) < 10 * 10) {
		this.ai.activated = true;
	}

	// Update path
	if (this.ai.activated) {
		var path = game.world.map.pathFinder.findPath(
			Math.round(this.position.x), Math.round(this.position.y),
			Math.round(targetPos.x), Math.round(targetPos.y),
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
		} else {
			// Move on to the next waypoint
			v1.set(this.position.x, this.position.y);
			this.controller.moveInput.subVectors(this.ai.waypoints[0], v1);
			this.ai.waypoints.splice(0, 1);
		}
	}
}
