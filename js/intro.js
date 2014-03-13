
function populateControllerSelectors() {
	var i, j;
	var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
	var numKeyboards = KeyboardController.DefaultMappings.length;
	var numGamepads = gamepads.length;
	for (i = 0; i < 3; ++i) {
		var html = '<option value="-1">None</option>';
		for (j = 0; j < numKeyboards; ++j)
			if (i > 0 || j > 0) html += '<option value="' +j+ '">' + KeyboardController.DefaultMappings[j].name + '</option>';
			else html += '<option value="' +j+ '" selected>' + KeyboardController.DefaultMappings[j].name + '</option>';
		for (j = 0; j < numGamepads; ++j)
			if (gamepads[j])
				html += '<option value="' +j+ '">' + gamepads[j].id + '</option>';
		dom("#select-controller-" + i).innerHTML = html;
	}
}

(function () {
	// Feature detects
	var supportsWebGL = (function() { try { return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl'); } catch(e) { return false; } } )();
	var supportsGamepads = !!navigator.getGamepads;
	if (!supportsWebGL) dom("#webgl-error").style.display = "block";
	if (supportsGamepads) dom("#gamepad-info").style.display = "block";
	else dom("#gamepad-warning").style.display = "block";

	populateControllerSelectors();
	window.addEventListener("gamepadconnected", populateControllerSelectors);

})();

var golems = [ "golem-01", "golem-02", "golem-03" ];

if (window.location.hash != "#menu") {
	start([{ character: randElem(golems), controllerType: "keyboard", controllerIndex: 0 }]);
}

dom("#start").addEventListener("click", function() {
	var players = [];
	for (var i = 0; i < 3; ++i) {
		var elem = dom("#select-controller-" + i);
		if (elem.selectedIndex == 0) continue;
		players.push({
			character: golems[i],
			controllerType: elem.selectedIndex <= KeyboardController.DefaultMappings.length ? "keyboard" : "gamepad",
			controllerIndex: elem.options[elem.selectedIndex].value
		});
	}
	if (players.length == 0) return;
	if (players.length > 2) return;
	start(players);
});
