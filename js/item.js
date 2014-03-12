var Items = {
	"health": {
		model: "health-potion",
		message: "Health",
		health: 1
	}
};


function Item(params) {
	THREE.Mesh.call(this);

	// Item effects from params
	this.item = {};
	for (var i in params) {
		if (params[i] instanceof Array) this.item[i] = randElem(params[i]);
		else if (typeof params[i] == "number") this.item[i] = params[i];
	}
	this.message = params.message || "Loot";

	// Model
	var self = this;
	cache.loadModel("assets/models/" + params.model + "/" + params.model + ".js", function(geometry, materials) {
		if (!geometry.boundingBox) geometry.computeBoundingBox();
		geometry.dynamic = false;
		self.geometry = geometry;
		self.material = materials.length > 1 ? new THREE.MeshFaceMaterial(materials) : materials[0];
		self.rotation.x = Math.PI / 2.5;
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
};
