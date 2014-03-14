"use strict";

var Items = {
	"health": {
		model: "potion-health",
		message: "Health+1",
		health: 1
	},
	"health2": {
		model: "potion-health",
		message: "Health+2",
		health: 2
	},
	"attack": {
		model: "potion-attack",
		message: "Attack+1",
		attack: 1
	},
	"defense": {
		model: "potion-defense",
		message: "Defense+1",
		defense: 1
	}
};

function getFigurineAction(figId) {
	return function(actor) {
		game.figurines--;
		dom(figId).className += " figurine-found";
		if (game.figurines <= 0)
			dom("#all-found").style.display = "block";
	};
}

var Figurines = [
	{
		model: "figurine-bear",
		message: "Bear found!",
		action: getFigurineAction("#bear")
	},{
		model: "figurine-cat",
		message: "Cat found!",
		action: getFigurineAction("#cat")
	},{
		model: "figurine-owl",
		message: "Owl found!",
		action: getFigurineAction("#owl")
	},{
		model: "figurine-turtle",
		message: "Turtle found!",
		action: getFigurineAction("#turtle")
	}
];


function Item(params) {
	THREE.Mesh.call(this);

	// Item effects from params
	this.item = {};
	for (var i in params) {
		if (params[i] instanceof Array) this.item[i] = randElem(params[i]);
		else if (typeof params[i] == "number") this.item[i] = params[i];
	}
	this.message = params.message || "Loot";
	this.action = params.action || null;

	// Model
	var self = this;
	cache.loadModel("assets/models/" + params.model + "/" + params.model + ".js", function(geometry, materials) {
		if (!geometry.boundingBox) geometry.computeBoundingBox();
		geometry.dynamic = false;
		self.geometry = geometry;
		self.material = materials.length > 1 ? new THREE.MeshFaceMaterial(materials) : materials[0];
		self.rotation.x = Math.PI / 2.5;
		self.rotation.y = 2 * Math.PI * Math.random();
		self.position.z = 0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y) + 0.001;
		game.world.scene.add(self);
	});
}
Item.prototype = Object.create(THREE.Mesh.prototype);

Item.prototype.applyToActor = function(actor) {
	for (var i in this.item) {
		var attrib = this.item[i];
		if (attrib && typeof attrib == "number") {
			actor[i] += attrib;
		} else throw "Illegal item attribute value: " + i + " = " + attrib;
	}
	if (this.action)
		this.action(actor);
};
