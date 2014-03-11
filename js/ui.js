
function UI() {
	this.scene = new THREE.Scene();

	this.players = [];
	this.elems = [];

	this.renderer = new THREE.CSS3DRenderer();
	document.getElementById("container").appendChild(this.renderer.domElement);

	this.track = function(actor) {
		this.players.push(actor);
	};
}

UI.prototype.inWorldMsg = function(msg, position) {
	var elem = document.createElement("div");
	elem.className = "hud-elem";
	elem.innerHTML = msg;
	document.body.appendChild(elem);

	var sprite = new THREE.CSS3DSprite(elem);
	var scale = 0.02;
	sprite.scale.set(scale, scale, scale);
	sprite.position.set(position.x, position.y, 3);
	sprite.timeout = Date.now() + 3000;

	this.scene.add(sprite);
	this.elems.push(sprite);
};

UI.prototype.render = function() {
	this.renderer.render(this.scene, game.camera);

	// Reap faded elements
	var time = Date.now();
	for (var i = this.elems.length - 1; i >= 0; --i) {
		var elem = this.elems[i];
		if (time >= elem.timeout) {
			this.scene.remove(elem);
			this.elems.splice(i, 1);
		}
	}
};

