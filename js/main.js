
var game = new Game();
var clock = new THREE.Clock();

function render() {
	requestAnimationFrame(render);
	var dt = clock.getDelta();
	if (dt > 0.05) dt = 0.05;
	game.render(dt);
};

render();
