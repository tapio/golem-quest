
function UI() {
	this.scene = new THREE.Scene();

	this.players = [];

	this.renderer = new THREE.CSS3DRenderer();
	document.getElementById("container").appendChild(this.renderer.domElement);

	this.elems = [];
	for (var i = 0; i < 3; ++i) {
		var elem = document.createElement("div");
		elem.className = "hud-elem";
		var sprite = new THREE.CSS3DSprite(elem);
		var scale = 0.02;
		sprite.scale.set(scale, scale, scale);
		document.body.appendChild(elem);
		this.scene.add(sprite);
		this.elems.push(sprite);
	}

	this.track = function(actor) {
		this.players.push(actor);
	};
}

UI.prototype.inWorldMsg = function(msg, position) {
	var notif = this.elems[0];
	notif.element.innerHTML = msg;
	notif.position.x = position.x;
	notif.position.y = position.y;
	notif.position.z = 3;
};

UI.prototype.render = function() {
	this.renderer.render(this.scene, game.camera);
};

