class Slice {
	constructor(label, val, strt, fll) {
		this.label = label;
		this.value = constrain(val, 0.0, 1.0);
		this.start = constrain(strt, 0.0, TWO_PI);
		var valAngle = map(this.value, 0.0, 1.0, 0.0, TWO_PI);
		this.middle = this.start + valAngle * 0.5;
		this.stop = this.start + valAngle;
		this.fillFocus = color(fll, 99, 99, 255);//when hover?
		this.fillNoFocus = color(fll, 89, 49, 189);//not hover?
		this.fill = this.fillNoFocus;
		this.hasFocus = false;
		this.labelInset = 0.667; //position of label?
	}

	toString() {
		return this.label + ": " + (this.value * 100).toFixed(2) + "%";
	} ///I think this labels what is highlighted

	draw(cx, cy, radius) {
		if (this.hasFocus) {
			this.fill = lerpColor(this.fill,
					this.fillFocus,
					Slice.focusFadeIn);
		} else {
			this.fill = lerpColor(this.fill,
					this.fillNoFocus,
					Slice.focusFadeOut);
		}

		fill(this.fill);
		arc(cx, cy, radius, radius,
			this.start, this.stop);
	}

	showLabel(cx, cy, radius) {
		var x = cx + cos(this.middle) * radius * this.labelInset;
		var y = cy + sin(this.middle) * radius * this.labelInset;
		fill(0, 0, 0);
		text(this, x, y);
		fill(0, 0, 99);
		text(this, x - 1, y - 1);
	}

	// atan2 returns a value in the range of -PI to PI.
	// If the angle is less than 0 radians, we can fix the
	// problem by adding TWO_PI to it.
	hover(angle) {
		angle = angle < 0 ? angle + TWO_PI : angle;
		return angle > this.start && angle < this.stop;
	}
}

Slice.focusFadeIn = 0.05;
Slice.focusFadeOut = 0.025;

class PieChart {
	constructor(x, y, rad, name, data) {
		this.scale(x, y, rad);
		this.hasFocus = false;
		this.name = name;

		// Assumes data is an ES6 map.
		// Sum the values in the data so as to
		// normalize them to a percent.
		var sum = 0;
		var itr = data.entries();
		for (var value of data.values()) {
			sum += value;
			console.log(value);
		}
		sum = sum <= 1 ? 1 : sum;
		console.log("sum: ", sum);

		this.slices = [];
		var i = 0;
		for (var[key, value] of data.entries()) {
			this.slices.push(new Slice(
					key,
					isNaN(value) ? 0 : value / sum,
					i === 0 ? 0 : this.slices[i - 1].stop,
					i / data.size * 360));
			i++;
		}
	}

	draw() {
		push();
		noStroke();
		ellipseMode(RADIUS);
    textSize(16);
		textAlign(CENTER, CENTER);
		for (var i = 0, size = this.slices.length; i < size; ++i) {
			this.slices[i].draw(this.x, this.y, this.radius);
		}
		if (this.hasFocus) {
			var y = this.y + this.radius + 16;
			fill(0, 0, 0);
			text(this.name, this.x, y);
			fill(0, 0, 99);
			text(this.name, this.x - 1, y - 1);
		}
		pop();
		this.hover(mouseX, mouseY);

	}

	hover(x, y) {
		if (dist(x, y, this.x, this.y) < this.radius) {
			this.hasFocus = true;
			for (var i = 0, size = this.slices.length; i < size; ++i) {
				var a = atan2(y - this.y, x - this.x);
				if (this.slices[i].hover(a)) {
					this.slices[i].hasFocus = true;
					this.slices[i].showLabel(this.x,
						this.y,
						this.radius);
				} else {
					this.slices[i].hasFocus = false;
				}
			}
		} else {
			this.hasFocus = false;
			for (var i = 0, size = this.slices.length; i < size; ++i) {
				this.slices[i].hasFocus = false;
			}
		}
	}
  
  scale(x, y, rad) {
		this.x = x;
		this.y = y;
		this.radius = rad;
	}
}

var cnvs = null;
var data = new Map();
var pie = null;

function setup() {
	cnvs = createCanvas(windowWidth, windowHeight);
	pixelDensity(displayDensity());
	smooth();
  colorMode(HSB, 359, 99, 99);
	data.set('Alpha', random(1, 50));
	data.set('Bravo', random(1, 50));
	data.set('Charlie', random(1, 50));
	data.set('Delta', random(1, 50));
	data.set('Echo', random(1, 50));
	data.set('Foxtrot', random(1, 50));
  data.set('3', random(1, 50));
  data.set('2', random(1, 50));
  data.set('1', random(1, 50));
  data.set('', random(1, 50));


	pie = new PieChart(width * 0.5,
			height * 0.5,
			min(width, height) * 0.333,
			"Cycle",
			data);
}

function draw() {
	background(0, 0, 0);
	pie.draw();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	pie.scale(width * 0.5, height * 0.5,
		min(width, height) * 0.333);
}
