"use strict";

function UI() {
	this.scene = new THREE.Scene();

	this.players = [];
	this.elems = [];
	this.domUpdateTimer = 0;

	this.renderer = new THREE.CSS3DRenderer();
	document.getElementById("container").appendChild(this.renderer.domElement);

	this.track = function(actor) {
		this.players.push(actor);
		dom("#player-" + this.players.length).style.display = "block";
	};
}

UI.prototype.inWorldMsg = function(msg, position) {
	var elem = document.createElement("div");
	elem.className = "hud-elem";
	elem.innerHTML = msg;
	document.body.appendChild(elem);

	var sprite = new THREE.CSS3DSprite(elem);
	var scale = 0.02, r = 0.2;
	sprite.scale.set(scale, scale, scale);
	sprite.position.set(position.x - r + 2 * Math.random() * r, position.y - 2 * Math.random() * r, 2.5);
	sprite.timeout = Date.now() + 2000;

	this.scene.add(sprite);
	this.elems.push(sprite);
};

UI.prototype.render = function() {
	var time = Date.now();

	// Sidebar
	if (time > this.domUpdateTimer) {
		for (var i = 0; i < this.players.length; ++i) {
			var pl = this.players[i];
			dom("#player-" + (i+1) + " .health").innerHTML = buildString("♥", pl.health);
			dom("#player-" + (i+1) + " .attack").innerHTML = buildString("★", pl.attack);
			dom("#player-" + (i+1) + " .defense").innerHTML = buildString("✚", pl.defense);
			if (this.players.length > 1)
				dom("#player-" + (i+1) + " .turn-indicator").style.display = pl.myturn ? "inline" : "none";
		}
		this.domUpdateTimer = time + 500;
	}

	// In-world hud
	if (this.elems.length)
		this.renderer.render(this.scene, game.camera);

	// Reap faded elements
	for (var i = this.elems.length - 1; i >= 0; --i) {
		var elem = this.elems[i];
		if (time >= elem.timeout) {
			this.scene.remove(elem);
			this.elems.splice(i, 1);
		}
	}
};

