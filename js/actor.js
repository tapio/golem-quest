"use strict";

var FACTION = { PLAYER: 1, MONSTER: -1 };

var Golems = [
	{
		name: "Stone Golem",
		model: "golem-01",
		css: "stone",
		health: 8,
		attack: 3,
		defense: 4
	},{
		name: "Ice Golem",
		model: "golem-02",
		css: "ice",
		health: 10,
		attack: 3,
		defense: 3
	},{
		name: "Fire Golem",
		model: "golem-03",
		css: "fire",
		health: 8,
		attack: 4,
		defense: 3
	}
];

var Mobs = [
	{
		model: "kerberos",
		amount: 17,
		monster: true,
		health: 2,
		attack: 2,
		defense: 1,
		speed: 1.0
	},{
		model: "spider",
		amount: 15,
		monster: true,
		health: 2,
		attack: 3,
		defense: 2,
		speed: 1.0
	},{
		model: "ghoul",
		amount: 10,
		monster: true,
		health: 3,
		attack: 3,
		defense: 3,
		speed: 1.0

	},{
		model: "horn-head",
		amount: 8,
		monster: true,
		health: 5,
		attack: 7,
		defense: 5,
		speed: 0.85
	}
];

function Actor(params) {
	THREE.Mesh.call(this);

	if (!params.monster) {
		this.light = new THREE.PointLight(0xffffcc, 1, 10);
		this.light.position.set(0, 0, 1);
		this.add(this.light);
	}
	this.castShadow = true;
	this.receiveShadow = true;
	this.target = null;
	this.myturn = false;
	this.done = false;

	this.ai = !params.monster ? null : {
		waypoints: null,
		speed: params.speed || 1
	};

	this.controller = params.monster ? new AIController(this) : null;

	this.faction = params.monster ? FACTION.MONSTER : FACTION.PLAYER;
	this.health = params.health || 2;
	this.attack = params.attack || 2;
	this.defense = params.defense || 2;
	this.figurines = 0;

	var self = this;
	cache.loadModel("assets/models/" + params.model + "/" + params.model + ".js", function(geometry, materials) {
		if (!geometry.boundingBox) geometry.computeBoundingBox();
		geometry.dynamic = false;
		self.geometry = geometry;
		self.material = materials.length > 1 ? new THREE.MeshFaceMaterial(materials) : materials[0];
		self.rotation.z = 2 * Math.PI * Math.random();
		self.position.z = 0.5 * (geometry.boundingBox.max.z - geometry.boundingBox.min.z) + 0.001;
		game.addActor(self);
	});
}
Actor.prototype = Object.create(THREE.Mesh.prototype);

Actor.prototype.getPosition = function() {
	return this.target ? this.target : this.position;
};

Actor.prototype.fight = function(other) {
	if (this.faction == other.faction) return false;
	var maxDice = 10;
	var dice1 = randInt(1, maxDice);
	var dice2 = randInt(1, maxDice);
	if (dice1 == maxDice || this.attack + dice1 >= other.defense + dice2) {
		--other.health;
		if (other.health <= 0) {
			ui.inWorldMsg("Killed!", other.getPosition());
			if (other.faction == FACTION.PLAYER) {
				// Game over
				document.getElementById("deathscreen").style.display = "block";
				game.over = true;
			} else {
				// Loot
				var lootThreshold = 0.7 - (DIFFICULTY * 0.2);
				if (Math.random() < lootThreshold)
					game.spawnRandomItem(other.position);
			}
			game.removeActor(other);
		} else
			ui.inWorldMsg("-1", other.getPosition());
	} else ui.inWorldMsg("Miss!", other.getPosition());
	return true;
};

Actor.prototype.runAI = function() {
	this.controller.moveInput.set(0, 0);
	if (this.health <= 0 || !this.ai || this.target) return;

	var targetPos;
	var closest = { distSq: 8 * 8, actor: null };
	for (var i = 0; i < game.players.length; ++i) {
		targetPos = game.players[i].getPosition();
		var testDistSq = distSq(this.position.x, this.position.y, targetPos.x, targetPos.y);
		if (testDistSq < closest.distSq) {
			closest.distSq = testDistSq;
			closest.actor = game.players[i];
		}
	}

	var target = closest.actor;
	if (!target || target.health <= 0) return;
	else if (closest.distSq >= 3 && Math.random() > this.ai.speed) return;
	targetPos = target.getPosition();

	var v1 = new THREE.Vector2();


	// Update path
	var path = game.world.map.pathFinder.findPath(
		Math.round(this.position.x), Math.round(this.position.y),
		Math.round(targetPos.x), Math.round(targetPos.y),
		game.world.map.grid.clone());
	this.ai.waypoints = [];
	for (var j = 1; j < path.length; ++j) {
		v1.set(path[j][0], path[j][1]);
		this.ai.waypoints.push(v1.clone());
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
};
