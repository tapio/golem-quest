"use strict";

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

if (window.location.hash == "#dev") {
	DEVMODE = true;
	start([{ character: randElem(Golems), controllerType: "keyboard", controllerIndex: 0 }]);
}

if (window.location.hash == "#coop-dev") {
	DEVMODE = true;
	start([
		{ character: randElem(Golems), controllerType: "keyboard", controllerIndex: 0 },
		{ character: randElem(Golems), controllerType: "keyboard", controllerIndex: 1 }
	]);
}

dom("#start").addEventListener("click", function() {
	var err = "";
	var players = [];
	for (var i = 0; i < 3; ++i) {
		var elem = dom("#select-controller-" + i);
		if (elem.selectedIndex == 0) continue;
		players.push({
			character: Golems[i],
			controllerType: elem.selectedIndex <= KeyboardController.DefaultMappings.length ? "keyboard" : "gamepad",
			controllerIndex: elem.options[elem.selectedIndex].value
		});
		// Verify there's no duplicates
		for (var j = 0, last = players.length-1; j < last; ++j) {
			if (players[last].controllerType == players[j].controllerType && players[last].controllerIndex == players[j].controllerIndex)
				err = "Different controller for each golem, please.";
		}
	}
	if (players.length == 0) err = "Who's going to play?";
	else if (players.length > 2) err = "Sorry, max 2 players...";

	if (err.length) {
		dom("#setup-error").innerHTML = err;
		dom("#setup-error").style.display = "block";
		return;
	}
	var difElem = dom("#difficulty");
	DIFFICULTY = parseInt(difElem.options[difElem.selectedIndex].value, 10);
	start(players);
});
