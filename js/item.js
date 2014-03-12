var Items = {
	"health-potion": {
		health: 1
	}
};


function Item(def) {
	THREE.Mesh.call(this);
	this.geometry = new THREE.CubeGeometry(0.3, 0.3, 0.3);
	this.material = new THREE.MeshPhongMaterial({
		color: 0xff22ff
	})
	this.item = {};
	for (var i in def) {
		if (def[i] instanceof Array) this.item[i] = randElem(def[i]);
		else this.item[i] = def[i];
	}
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
