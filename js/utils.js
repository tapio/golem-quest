
function lerp(a, b, f) { return a + (b - a) * f; }

function lerp2d(a, b, f) { a.x = lerp(a.x, b.x, f); a.y = lerp(a.y, b.y, f); }

function randElem(arr) { return arr[(Math.random() * arr.length) | 0]; }

function Anim(duration, autoStart) {
	this.duration = duration;
	this.timestamp = null;

	this.start = function(newDuration) {
		if (newDuration !== undefined) this.duration = newDuration;
		this.timestamp = Date.now();
	};

	this.get = function() {
		var now = Date.now();
		var dt = (now - this.timestamp) * 0.001;
		if (dt >= this.duration) return 1.0;
		else return dt / duration;
	};

	this.getSmooth = function() {
		var x = this.get();
		return x * x * (3 - 2 * x);
	};

	this.getSmoother = function() {
		var x = this.get();
		return x * x * x * (x * (x * 6 - 15) + 10);
	};

	if (autoStart) start();
}
