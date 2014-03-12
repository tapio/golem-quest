"use strict";
function Cache() {
	this.models = {};
	this.modelMaterials = {};
	this.geometries = {};
	this.materials = {};
	var self = this;
	var loader = new THREE.JSONLoader(true);
	loader.statusDomElement = dom("#loading");
	var modelsPending = 0;

	this.loadModel = function(path, callback, texturePath) {
		var m = this.models[path];
		if (!m) { // First time request for this model
			this.models[path] = [ callback ];
			loader.statusDomElement.style.display = "block";
			modelsPending++;
			loader.load(path, function(geometry, materials) {
				var mm = self.models[path];
				for (var i = 0; i < mm.length; ++i)
					mm[i](geometry, materials);
				self.models[path] = geometry;
				self.modelMaterials[path] = materials;
				modelsPending--;
				window.setTimeout(function() {
					if (modelsPending === 0)
						loader.statusDomElement.style.display = "none";
				}, 1000);
			}, texturePath);
		} else if (m instanceof Array) { // Pending
			m.push(callback);
		} else // Already loaded
			callback(m, this.modelMaterials[path]);
	};

	this.getGeometry = function(name, generator) {
		var g = this.geometries[name];
		if (g) return g;
		this.geometries[name] = g = generator();
		return g;
	};

	function createMaterial(name) {
		var texturePath = "assets/textures/";
		return new THREE.MeshPhongMaterial({
			ambient: 0xffffff,
			diffuse: 0xffffff,
			specular: 0xffffff,
			shininess: 20,
			perPixel: true,
			map: THREE.ImageUtils.loadTexture(texturePath + name + ".jpg"),
			specularMap: THREE.ImageUtils.loadTexture(texturePath  + "specular/" + name + ".jpg"),
			normalMap: THREE.ImageUtils.loadTexture(texturePath + "normal/" + name + ".jpg"),
			normalScale: new THREE.Vector2(2, 2)
		});
	}

	this.getMaterial = function(name) {
		var m = this.materials[name];
		if (m) return m;
		this.materials[name] = m = createMaterial(name);
		return m;
	};
};
