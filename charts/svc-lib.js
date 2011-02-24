/***************************************************************************
 *  Copyright (C) 2008-2009  Rafał Miłecki <zajec5@gmail.com>              *
 *                                                                         *
 *  This program is free software; you can redistribute it and/or modify   *
 *  it under the terms of the GNU Lesser General Public License as         *
 *  published by the Free Software Foundation; either version 2.1 of the   *
 *  License, or (at your option) any later version.                        *
 *                                                                         *
 *  This program is distributed in the hope that it will be useful,        *
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of         *
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the          *
 *  GNU Lesser General Public License for more details.                    *
 *                                                                         *
 *  You should have received a copy of the GNU Lesser General Public       *
 *  License along with this program; if not, write to the                  *
 *  Free Software Foundation, Inc.,                                        *
 *  51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA               *
 ***************************************************************************/

var EXPERIMENTAL = false;

function parseParams() {
	var params = location.search.substr(1).split('&');
	for (var i = 0; i < params.length; ++i) {
		var param = params[i].split('=', 2);
		if (param[0] == 'cht') {
			if (param[1] == 'bhs') {
				TYPE = 'BarsH';
				COL_OVERLAY = 60;
			} else if (param[1] == 'bhg') {
				TYPE = 'BarsH';
				COL_OVERLAY = 0;
			} else if (param[1] == 'bvs') {
				TYPE = 'BarsV';
				COL_OVERLAY = 60;
			} else if (param[1] == 'bvg') {
				TYPE = 'BarsV';
				COL_OVERLAY = 0;
			} else if (param[1] == 'p') {
				TYPE = 'Pie';
			} else if (param[1] == 'lc') {
				TYPE = 'Points';
			} else if (param[1] == 'ls') {
				TYPE = 'Points';
			} else if (param[1] == 'lxy') {
				TYPE = 'Points';
			} else if (param[1] == 's') {
				TYPE = 'Points';
				OPTIONS = OPTIONS & (~OPT_LINE);
			}
		} else if (param[0] == 'chtt') {
			if (param[1].length == 0) TITLE = undefined;
			else TITLE = decodeURI(param[1]).replace('+', ' ');
		} else if (param[0] == 'chp') {
			START_ANGLE = getDegrees(decodeURI(param[1]));
		} else if (param[0] == 'anim') {
			if (param[1] == 1) OPTIONS |= OPT_ANIM;
			else OPTIONS = OPTIONS & (~OPT_ANIM);
		} else if (param[0] == 'hackit') {
			EXPERIMENTAL = true;
		}
	}
}

function getRad(degrees) {
	return degrees * (Math.PI / 180);
}

function getDegrees(radians) {
	return radians / (Math.PI / 180);
}

var toolTip = {
	text : 0,
	rect : 0,
	width : 0,
	height: 0,

	init: function() {
		this.text = document.getElementById('toolTipText');
		this.rect = document.getElementById('tooltip');
		this.width = document.getElementsByTagName('svg')[0].getAttribute('width');
		this.height = document.getElementsByTagName('svg')[0].getAttribute('height');
	},

	show: function(e) {
		this.text.textContent = e.target.getAttribute('value');
		this.rect.setAttribute('width', this.text.getComputedTextLength() + 15);

		this.move(e);

		this.text.style.visibility = 'visible';
		this.rect.style.visibility = 'visible';
	},

	hide: function(e) {
		this.text.style.visibility = 'hidden';
		this.rect.style.visibility = 'hidden';
	},

	move: function(e) {
		var newX = Math.min(e.clientX, this.width - (this.text.getComputedTextLength() + 30));
		var newY = Math.min(e.clientY, this.height - 50);

		this.text.setAttribute('x', newX + 15);
		this.text.setAttribute('y', newY + 34);

		this.rect.setAttribute('x', newX + 8);
		this.rect.setAttribute('y', newY + 15);
	},

	applyTo: function(obj, val) {
		obj.addEventListener("mouseover", function(event) { toolTip.show(event); }, false);
		obj.addEventListener("mouseout", function(event) { toolTip.hide(event); }, false);
		obj.addEventListener("mousemove", function(event) { toolTip.move(event); }, false);
		obj.setAttribute('value', val);
	}
};

function SVC() {
	this.width = -1;
	this.height = -1;

	this.marginTop = 15;
	this.marginRight = 15;
	this.marginBottom = 15;
	this.marginLeft = 15;

	this.finalGraphWidth = 0;
	this.finalGraphHeight = 0;

	this.maxLabelTextLength = -1;

	/* Position of labels in DATA (DATA[i][labelsPosition] */
	this.labelsPosition = -1;
	this.hasAnyLabel = 0;

	this.svg = document.getElementsByTagName('svg')[0];

	/* Create text element with given content */
	this.createText = function(content) {
		var newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
		newText.textContent = content;
		return newText;
	}

	/* Create animate element for given attribute with given from and to */
	this.createAnimate = function(attrName, from, to) {
		var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
		anim.setAttribute("attributeType", "XML");
		anim.setAttribute("attributeName", attrName);
		anim.setAttribute("begin", "0s");
		anim.setAttribute("dur", "1s");
		anim.setAttribute("fill", "freeze");
		anim.setAttribute("from", from);
		anim.setAttribute("to", to);
		return anim;
	}

	/* Insert text into title text element */
	this.addTitle = function() {
		var tmp = document.getElementById('title');
		tmp.textContent = TITLE;
		if ((OPTIONS & OPT_ANIM) > 0)
			tmp.appendChild(this.createAnimate('y', -5, 26));
	}

	/* Validates given DATA and options */
	this.validate = function() {
		alert('validate not overrided');
		return false;
	}

	/* Add labels with texts from DATA[i][posInDATA] and calculate maxLabelTextLength */
	this.addLabels = function(posInDATA) {
		for (var i = 0; i < DATA.length; ++i) {
			if (typeof DATA[i][posInDATA] !== 'undefined' && DATA[i][posInDATA] != '') {
				document.getElementById("labels").appendChild(this.createText(DATA[i][posInDATA]));
				this.hasAnyLabel = 1;
			} else {
				document.getElementById("labels").appendChild(this.createText(''));
			}
		}

		/* Space for labels */
		var tmp = document.getElementById("labels").getElementsByTagName('text');
		for (var i = 0; i < tmp.length; ++i)
			this.maxLabelTextLength = Math.max(this.maxLabelTextLength, tmp[i].getComputedTextLength());
	}

	this.addPrivateElements = function() {
	}

	this.calculateMargins = function() {
		alert('calculateMargins not overrided');
	}

	this.calculateSize = function() {
		alert('calculateSize not overrided');
	}

	this.placeLabels = function() {
		alert('placeLabels not overrided');
	}

	this.placePrivateElements = function() {
	}

	this.placeGraph = function() {
		var tmp = document.getElementById("graph");
		tmp.setAttribute("x", this.marginLeft);
		tmp.setAttribute("y", this.marginTop);
		tmp.setAttribute("width", this.finalGraphWidth);
		tmp.setAttribute("height", this.finalGraphHeight);

		document.getElementById("columns").setAttribute("transform", "translate("+ (this.marginLeft) +", "+this.marginTop+")");
		document.getElementById("columns").setAttribute("transform", "translate("+ (this.marginLeft) +", "+this.marginTop+")");
		document.getElementById("lines").setAttribute("transform", "translate("+ (this.marginLeft) +", "+this.marginTop+")");
	}

	this.addFinalElements = function() {
		alert('addFinalElements not overrided');
	}

	this.generate = function() {
		this.firstCalculations();

		if (!this.validate())
			return;

		if (typeof TITLE !== "undefined")
			this.addTitle();
		if (this.labelsPosition >= 0)
			this.addLabels(this.labelsPosition);
		this.addPrivateElements();

		this.calculateMargins();
		this.calculateSize();

		/* Set SVG size */
		this.svg.setAttribute('width', this.width);
		this.svg.setAttribute('height', this.height);

		/* Width and height of graph */
		this.finalGraphWidth = this.width - this.marginLeft - this.marginRight;
		this.finalGraphHeight = HEIGHT - this.marginTop - this.marginBottom;

		if (this.hasAnyLabel)
			this.placeLabels();
		this.placePrivateElements();
		this.placeGraph();

		this.addFinalElements();
	}
}

function Grid() {
	this.inheritFrom = SVC;
	this.inheritFrom();

	/* These values contains info how many lines (of grid) and values we use */
	this.linesV = -1;
	this.linesH = -1;

	this.hasAxisX = 0;
	this.hasAxisY = 0;

	this.maxValueTextLength = -1;

	/* Add values for XY grid and calculates maxValueTextLength */
	this.addPrivateElements = function() {
		var values = document.getElementById("values").getElementsByTagName('g');

		if (this.hasAxisX) {
			for (var i = 0; i < this.linesV + 1; ++i) {
				var tmp = this.createText(i * GRID_STEP);
				values[0].appendChild(tmp);
				this.maxValueTextLength = Math.max(this.maxValueTextLength, tmp.getComputedTextLength());
			}
		}

		if (this.hasAxisY) {
			for (var i = 0; i < this.linesH + 1; ++i) {
				var tmp = this.createText(i * GRID_STEP);
				values[1].appendChild(tmp);
				this.maxValueTextLength = Math.max(this.maxValueTextLength, tmp.getComputedTextLength());
			}
		}
	}

	/* Place values for XY grid */
	this.placePrivateElements = function() {
		alert('placePrivateElements not overrided');
	}

	/* Draws horizontal lines (for y values) */
	this.addGridH = function() {
		var tmp = this.finalGraphHeight / this.linesH;
		var plines = document.getElementById("lines");
		for (var i = 0; i <= this.linesH; ++i) {
			var linia = document.createElementNS("http://www.w3.org/2000/svg", "line");
			linia.setAttribute("x1", 0);
			linia.setAttribute("y1", i*tmp);
			linia.setAttribute("x2", this.finalGraphWidth);
			linia.setAttribute("y2", i*tmp);
			plines.appendChild(linia);
		}
	}

	/* Draws vertical lines (for x values) */
	this.addGridV = function() {
		var tmp = this.finalGraphWidth / this.linesV;
		var plines = document.getElementById("lines");
		for (var i = 0; i <= this.linesV; ++i) {
			var linia = document.createElementNS("http://www.w3.org/2000/svg", "line");
			linia.setAttribute("x1", i*tmp);
			linia.setAttribute("y1", 0);
			linia.setAttribute("x2", i*tmp);
			linia.setAttribute("y2", this.finalGraphHeight);
			plines.appendChild(linia);
		}
	}
}

function Points() {
	this.inheritFrom = Grid;
	this.inheritFrom();

	this.r = 5;

	this.firstCalculations = function() {
		/* Find max value and calculate amount of horizontal lines*/
		var maxValX = -1;
		for (var i = 0; i < DATA.length; ++i)
			maxValX = Math.max(maxValX, DATA[i][0]);
		this.linesV = Math.ceil(maxValX / GRID_STEP) + 1;

		/* Find max value and calculate amount of horizontal lines*/
		var maxValY = -1;
		for (var i = 0; i < DATA.length; ++i)
			maxValY = Math.max(maxValY, DATA[i][1]);
		this.linesH = Math.ceil(maxValY / GRID_STEP) + 1;

		/* Axises decisions */
		if ((OPTIONS & OPT_AXIS_X) > 0)
			this.hasAxisX = 1;
		if ((OPTIONS & OPT_AXIS_Y) > 0)
			this.hasAxisY = 1;
	}

	/* Validates given DATA and options */
	this.validate = function() {
		if (typeof WIDTH === "undefined" || typeof HEIGHT === "undefined") {
			alert('Brak podanych rozmiarów. Wymagane: WIDTH i HEIGHT');
			return false;
		}

		return true;
	}

	this.addFinalElements = function() {
		this.addGrid();
		this.addColumns();
	}

	this.calculateMargins = function() {
		if (typeof TITLE !== "undefined")
			this.marginTop += 10 + 16; //16px is font-size
		if (this.hasAxisX)
			this.marginBottom += 25;
		if (this.hasAxisY)
			this.marginLeft += 10 + this.maxValueTextLength;
	}

	this.calculateSize = function() {
		this.width = WIDTH;
		this.height = HEIGHT;
	}

	this.placePrivateElements = function() {
		/* Y axis */
		var tmp = document.getElementById("values").getElementsByTagName('g')[1].getElementsByTagName('text');
		var tmpx = this.finalGraphHeight / this.linesH;
		for (var i = 0; i < tmp.length; ++i) {
			tmp[i].setAttribute("x", 15);
			tmp[i].setAttribute("y", this.finalGraphHeight - (i * tmpx) + 5);
		}

		/* X axis */
		var tmp = document.getElementById("values").getElementsByTagName('g')[0].getElementsByTagName('text');
		var tmpx = this.finalGraphWidth / this.linesV;
		for (var i = 0; i < tmp.length; ++i) {
			tmp[i].setAttribute("x", i * tmpx + this.marginLeft);
			tmp[i].setAttribute("y", (this.finalGraphHeight + 20));
			tmp[i].setAttribute("text-anchor", "middle");
		}

		document.getElementById("values").setAttribute("transform", "translate(0, " + (this.marginTop) + ")");
	};

	this.addGrid = function() {
		if ((OPTIONS & OPT_GRID_V) > 0)
			this.addGridV();
		if ((OPTIONS & OPT_GRID_H) > 0)
			this.addGridH();
	}

	this.addColumns = function() {
		var prev = { x: -1, y: -1 }
		var pathD = '';
		var usedTime = 0;
		var timePerLine = 1 / (DATA.length - 1);
		var linia = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
		for (var i = 0; i < DATA.length; ++i) {
			var cx = DATA[i][0] / (this.linesV * GRID_STEP) * this.finalGraphWidth;
			var cy = DATA[i][1] / (this.linesH * GRID_STEP) * this.finalGraphHeight;
			cy = this.finalGraphHeight - cy;
			var col = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			col.setAttribute("cx", cx);
			col.setAttribute("cy", cy);
			col.setAttribute("r", this.r);
			toolTip.applyTo(col, DATA[i][0] + ',' + DATA[i][1] + ((typeof DATA[i][2] === 'undefined') ? '' : (' (' + DATA[i][2] + ')')));
			if ((OPTIONS & OPT_ANIM) > 0) {
				var anim = document.createElementNS("http://www.w3.org/2000/svg", "set");
				anim.setAttribute("attributeType", "XML");
				anim.setAttribute("attributeName", "r");
				anim.setAttribute("begin", "0s");
				anim.setAttribute("to", "0");
				anim.setAttribute("fill", "freeze");
				col.appendChild(anim);

				var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
				anim.setAttribute("attributeType", "XML");
				anim.setAttribute("attributeName", "r");
				anim.setAttribute("begin", (usedTime) + "s");
				anim.setAttribute("dur", timePerLine + "s");
				anim.setAttribute("from", 0);
				anim.setAttribute("to", 2 * this.r);
				col.appendChild(anim);

				var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
				anim.setAttribute("attributeType", "XML");
				anim.setAttribute("attributeName", "r");
				anim.setAttribute("begin", (usedTime + timePerLine) + "s");
				anim.setAttribute("dur", timePerLine + "s");
				anim.setAttribute("from", 2 * this.r);
				anim.setAttribute("to", this.r);
				anim.setAttribute("fill", "freeze");
				col.appendChild(anim);
			}
			document.getElementById('columns').appendChild(col);

			if ((OPTIONS & OPT_LINE) > 0) {
				if ((OPTIONS & OPT_ANIM) > 0 && i > 0) {
					var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
					anim.setAttribute("attributeType", "XML");
					anim.setAttribute("attributeName", "points");
					anim.setAttribute("begin", (usedTime - timePerLine) + "s");
					anim.setAttribute("dur", timePerLine + "s");
					anim.setAttribute("from", pathD + ' ' + prev.x + ',' + prev.y);
					anim.setAttribute("to", pathD + ' ' + cx + ',' + cy);
					anim.setAttribute("additive", "sum");
					linia.appendChild(anim);
				}
				pathD += ' ' + cx + ' ' + cy;
			}

			usedTime += timePerLine;

			//gr.appendChild(this.createText(DATA[i][j]));
			//document.getElementById('columns').appendChild(gr);
			prev.x = cx;
			prev.y = cy;
		}
		linia.setAttribute("points", pathD);

		document.getElementById('columns').insertBefore(linia, document.getElementById('columns').firstChild);
	}

	document.getElementById('columns').setAttribute('class', "v");
}

function Bars() {
	this.inheritFrom = Grid;
	this.inheritFrom();

	this.labelsPosition = 0;

	this.maxColsTogether = -1;

	this.firstCalculations = function() {
		/* Find max cols together */
		for (var i = 0; i < DATA.length; ++i)
			this.maxColsTogether = Math.max(this.maxColsTogether, DATA[i].length - 1);

		/* Find max value */
		var maxVal = -1;
		for (var i = 0; i < DATA.length; ++i) {
			for (var j = 1; j < DATA[i].length; ++j)
				maxVal = Math.max(maxVal, DATA[i][j]);
		}

		/* Calculate both, only one will be used */
		this.linesV = Math.ceil(maxVal / GRID_STEP) + 1;
		this.linesH = Math.ceil(maxVal / GRID_STEP) + 1;

		/* BarsV and BarsH have some different calculations */
		this.privateCalculations();

		if (typeof COL_OVERLAY === 'undefined')
			COL_OVERLAY = 0;
	}

	this.addFinalElements = function() {
		this.addGrid();
		this.addColumns();
	}
}

function BarsV() {
	this.inheritFrom = Bars;
	this.inheritFrom();

	this.my_COL_WIDTH = 0;

	this.privateCalculations = function() {
		this.linesV = -1;

		if ((OPTIONS & OPT_AXIS_Y) > 0)
			this.hasAxisY = 1;
	}

	/* Validates given DATA and options */
	this.validate = function() {
		if (typeof HEIGHT === "undefined" ||
			typeof GRID_STEP === "undefined" ||
			(typeof COL_WIDTH === "undefined" && typeof WIDTH === "undefined") ) {
			alert('Brak podanych rozmiarów. Wymagane: HEIGHT, GRID_STEP i jeden z: COL_WIDTH, WIDTH');
			return false;
		}

		if (COL_OVERLAY < 0 || COL_OVERLAY > 100) {
			alert('Zła wartość COL_OVERLAY (' + COL_OVERLAY + ')');
			return false;
		}

		return true;
	}

	this.calculateMargins = function() {
		if (typeof TITLE !== "undefined")
			this.marginTop += 10 + 16; //16px is font-size
		if (this.hasAnyLabel)
			this.marginBottom += this.maxLabelTextLength; //FIXME: division by sqrt(2)?
		if ((OPTIONS & OPT_AXIS_Y) > 0)
			this.marginLeft += 10 + this.maxValueTextLength;
	}

	this.calculateSize = function() {
		/* n(my_COL_WIDTH * maxColsTogether * ((100 - COL_OVERLAY) / 100) + (my_COL_WIDTH * COL_OVERLAY/100) + 0.5 * my_COL_WIDTH ) - (0.5 * my_COL_WIDTH) == szerokosc */
		if (typeof COL_WIDTH == "undefined") { /* Calculate my_COL_WIDTH using WIDTH */
			this.width = WIDTH;
			this.my_COL_WIDTH = this.width - this.marginLeft - this.marginRight - 20; /* 20 is 2 * 10px margin from border of graphBg */
			this.my_COL_WIDTH /= (this.maxColsTogether * ((100 - COL_OVERLAY) / 100) * DATA.length) + ((COL_OVERLAY / 100) * DATA.length) + (0.5 * (DATA.length)) - 0.5;
		} else { /* Calculate WIDTH using my_COL_WIDTH */
			this.my_COL_WIDTH = COL_WIDTH;
			this.width = this.marginLeft + this.marginRight + 20;
			this.width += DATA.length * (this.my_COL_WIDTH * this.maxColsTogether * ((100 - COL_OVERLAY) / 100) + (this.my_COL_WIDTH * COL_OVERLAY/100) + 0.5 * this.my_COL_WIDTH ) - (0.5 * this.my_COL_WIDTH);
		}

		this.height = HEIGHT;
	}

	this.placeLabels = function() {
		var tmp = document.getElementById("labels").getElementsByTagName('text');
		var tmpx = (this.finalGraphWidth + (this.my_COL_WIDTH / 2) - 20) / DATA.length;
		for (var i = 0; i < tmp.length; ++i) {
			var colsWidth = this.my_COL_WIDTH * (DATA[i].length - 1) * ((100 - COL_OVERLAY) / 100) + (this.my_COL_WIDTH * COL_OVERLAY/100);
			//tmp[i].setAttribute('x', (i * tmpx));
			tmp[i].setAttribute('x', (i * tmpx) + (colsWidth / 2) - (this.my_COL_WIDTH / 2));
			tmp[i].setAttribute('y', 0);
			tmp[i].setAttribute('transform', "rotate(45, " + tmp[i].getAttribute('x') + ", 0)");
		}
		document.getElementById("labels").setAttribute("transform", "translate(" + (this.marginLeft + 25) + ", " + (this.marginTop + this.finalGraphHeight + 20) + ")");
	};

	this.placePrivateElements = function() {
		if ((OPTIONS & OPT_AXIS_Y) == 0)
			return;

		var tmp = document.getElementById("values").getElementsByTagName('text');
		var tmpx = this.finalGraphHeight / this.linesH;
		for (var i = 0; i < tmp.length; ++i) {
			tmp[i].setAttribute("x", 15);
			tmp[i].setAttribute("y", this.finalGraphHeight - (i * tmpx));
		}
		document.getElementById("values").setAttribute("transform", "translate(0, " + (this.marginTop + 3) + ")");
	};

	this.addGrid = function() {
		if ((OPTIONS & OPT_GRID_H) > 0)
			this.addGridH();
	}

	this.addColumns = function() {
		var x = 10;
		for (var i = 0; i < DATA.length; ++i) {
			var gr = document.createElementNS("http://www.w3.org/2000/svg", "g");
			for (var j = 1; j < DATA[i].length; ++j) {
				var realHeight = DATA[i][j] / (this.linesH * GRID_STEP) * this.finalGraphHeight;
				var col = document.createElementNS("http://www.w3.org/2000/svg", "rect");
				col.setAttribute("x", x);
				col.setAttribute("y", this.finalGraphHeight - realHeight);
				col.setAttribute("width", this.my_COL_WIDTH);
				col.setAttribute("height", realHeight);
				toolTip.applyTo(col, DATA[i][j]); //FIXME: names here (tar.bz2)

				if ((OPTIONS & OPT_ANIM) > 0) {
					col.appendChild(this.createAnimate('height', 0, realHeight));
					col.appendChild(this.createAnimate('y', this.finalGraphHeight, this.finalGraphHeight - realHeight));
				}

				gr.appendChild(col);

				x += (100 - COL_OVERLAY) / 100 * this.my_COL_WIDTH;
			}
			document.getElementById('columns').appendChild(gr);
			for (; j <= this.maxColsTogether; ++j)
				x += (100 - COL_OVERLAY) / 100 * this.my_COL_WIDTH;
			x += COL_OVERLAY / 100 * this.my_COL_WIDTH;
			x += this.my_COL_WIDTH / 2;
		}
	}

	document.getElementById('columns').setAttribute('class', "v");
}

function BarsH() {
	this.inheritFrom = Bars;
	this.inheritFrom();

	this.my_COL_WIDTH = 0;

	this.privateCalculations = function() {
		this.linesH = -1;

		if ((OPTIONS & OPT_AXIS_X) > 0)
			this.hasAxisX = 1;
	}

	/* Validates given DATA and options */
	this.validate = function() {
		if (typeof WIDTH === "undefined" ||
			typeof GRID_STEP === "undefined" ||
			(typeof COL_WIDTH === "undefined" && typeof HEIGHT === "undefined") ) {
			alert('Brak podanych rozmiarów. Wymagane: WIDTH, GRID_STEP i jeden z: COL_WIDTH, HEIGHT');
			return false;
		}

		if (COL_OVERLAY < 0 || COL_OVERLAY > 100) {
			alert('Zła wartość COL_OVERLAY (' + COL_OVERLAY + ')');
			return false;
		}

		return true;
	}

	this.calculateMargins = function() {
		if (typeof TITLE !== "undefined")
			this.marginTop += 10 + 16; //16px is font-size
		if (this.hasAnyLabel)
			this.marginLeft += this.maxLabelTextLength;
		if ((OPTIONS & OPT_AXIS_X) > 0)
			this.marginBottom += 10 + 16;
	}

	this.calculateSize = function() {
		/* n(my_COL_WIDTH * maxColsTogether * ((100 - COL_OVERLAY) / 100) + (my_COL_WIDTH * COL_OVERLAY/100) + 0.5 * my_COL_WIDTH ) - (0.5 * my_COL_WIDTH) == szerokosc */
		if (typeof COL_WIDTH == "undefined") { /* Calculate my_COL_WIDTH using HEIGHT */
			this.height = HEIGHT;
			this.my_COL_WIDTH = this.height - this.marginTop - this.marginBottom - 20; /* 20 is 2 * 10px margin from border of graphBg */
			this.my_COL_WIDTH /= (this.maxColsTogether * ((100 - COL_OVERLAY) / 100) * DATA.length) + ((COL_OVERLAY / 100) * DATA.length) + (0.5 * (DATA.length)) - 0.5;
		} else { /* Calculate HEIGHT using my_COL_WIDTH */
			this.my_COL_WIDTH = COL_WIDTH;
			this.height = this.marginTop + this.marginBottom + 20;
			this.height += DATA.length * (this.my_COL_WIDTH * this.maxColsTogether * ((100 - COL_OVERLAY) / 100) + (this.my_COL_WIDTH * COL_OVERLAY/100) + 0.5 * this.my_COL_WIDTH ) - (0.5 * this.my_COL_WIDTH);
		}

		this.width = WIDTH;
	}

	this.placeLabels = function() {
		var tmp = document.getElementById("labels").getElementsByTagName('text');
		var tmpx = (this.finalGraphHeight + (this.my_COL_WIDTH / 2) - 20) / DATA.length;
		for (var i = 0; i < tmp.length; ++i) {
			var colsWidth = this.my_COL_WIDTH * (DATA[i].length - 1) * ((100 - COL_OVERLAY) / 100) + (this.my_COL_WIDTH * COL_OVERLAY/100);
			//tmp[i].setAttribute('x', (i * tmpx));
			tmp[i].setAttribute('x', 0);
			tmp[i].setAttribute('y', (i * tmpx) + (colsWidth / 2) - (this.my_COL_WIDTH / 2));
		}
		document.getElementById("labels").setAttribute("transform", "translate(10, " + (this.marginTop + 20) + ")");
	};

	this.placePrivateElements = function() {
		var tmp = document.getElementById("values").getElementsByTagName('text');
		var tmpx = this.finalGraphWidth / this.linesV;
		for (var i = 0; i < tmp.length; ++i) {
			tmp[i].setAttribute("x", i * tmpx + this.marginLeft);
			tmp[i].setAttribute("y", (this.height - this.marginBottom + 18));
			tmp[i].setAttribute("text-anchor", "middle");
		}
	};

	this.addGrid = function() {
		if ((OPTIONS & OPT_GRID_V) > 0)
			this.addGridV();
	}

	this.addColumns = function() {
		var y = 10;
		for (var i = 0; i < DATA.length; ++i) {
			var gr = document.createElementNS("http://www.w3.org/2000/svg", "g");
			for (var j = 1; j < DATA[i].length; ++j) {
				var realWidth = DATA[i][j] / (this.linesV * GRID_STEP) * this.finalGraphWidth;
				var col = document.createElementNS("http://www.w3.org/2000/svg", "rect");
				col.setAttribute("x", 0);
				col.setAttribute("y", y);
				col.setAttribute("width", realWidth);
				col.setAttribute("height", this.my_COL_WIDTH);
				toolTip.applyTo(col, DATA[i][j]);

				if ((OPTIONS & OPT_ANIM) > 0) {
					col.appendChild(this.createAnimate('width', 0, realWidth));
				}

				gr.appendChild(col);

				y += (100 - COL_OVERLAY) / 100 * this.my_COL_WIDTH;
			}
			document.getElementById('columns').appendChild(gr);
			for (; j <= this.maxColsTogether; ++j)
				y += (100 - COL_OVERLAY) / 100 * this.my_COL_WIDTH;
			y += COL_OVERLAY / 100 * this.my_COL_WIDTH;
			y += this.my_COL_WIDTH / 2;
		}
	}

	document.getElementById('columns').setAttribute('class', "h");
}

function Pie() {
	this.inheritFrom = SVC;
	this.inheritFrom();

	this.labelsPosition = 1;

	this.paddingTop = 15;
	this.paddingRight = 15;
	this.paddingBottom = 15;
	this.paddingLeft = 15;

	this.r = -1;

	this.firstCalculations = function() {
		/* Remove additinal series */
		for (var i = 0; i < DATA.length; ++i)
			DATA[i].splice(2, DATA[i].length - 2);

		/* Sum values */
		var sum = 0;
		for (var i = 0; i < DATA.length; ++i)
			sum += DATA[i][0];

		/* Scale values according to 100% == 360 */
		for (var i = 0; i < DATA.length; ++i)
			DATA[i][2] = DATA[i][0] * (360)  / sum;

		if (typeof START_ANGLE === "undefined")
			START_ANGLE = 0;
	}

	/* Validates given DATA and options */
	this.validate = function() {
		if (typeof WIDTH === "undefined" ||
			typeof HEIGHT === "undefined") {
			alert('Brak podanych rozmiarów. Wymagane: WIDTH i HEIGHT');
			return false;
		}

		return true;
	}

	this.calculateMargins = function() {
		if (typeof TITLE !== "undefined")
			this.marginTop += 10 + 16; //16px is font-size
		this.paddingLeft += this.maxLabelTextLength + 10;
		this.paddingRight += this.maxLabelTextLength + 10;
	}

	this.calculateSize = function() {
		this.width = WIDTH;
		this.height = HEIGHT;

		var tmp1 = this.width - this.marginLeft - this.paddingLeft - this.paddingRight - this.marginRight;
		var tmp2 = this.height - this.marginTop - this.paddingTop - this.paddingBottom - this.marginBottom;
		this.r = Math.min(tmp1, tmp2) / 2;

		var restX = this.width - this.paddingLeft - (2 * this.r) - this.paddingRight;
		this.marginLeft = restX / 2;
		this.marginRight = restX / 2;

		var restY = this.height - this.marginTop - this.paddingTop - (2 * this.r) - this.paddingBottom - this.marginBottom;
		this.marginTop += restY / 2;
		this.marginBottom += restY / 2;
	}

	this.placeLabels = function() {
		var angle = START_ANGLE;
		var textX = this.marginLeft + this.paddingLeft + (2 * this.r) + 10;

		var tmp = document.getElementById("labels").getElementsByTagName('text');
		for (var i = 0; i < tmp.length; ++i) {
			angle += DATA[i][2] / 2;

			if (typeof DATA[i][1] != 'undefined') {
				if (angle > 90) textX = this.marginLeft + this.paddingLeft - 10;
				if (angle > 270) textX = this.marginLeft + this.paddingLeft + (2 * this.r) + 10;

				var x = Math.cos(getRad(angle)) * this.r;
				var y = Math.sin(getRad(angle)) * this.r;

				tmp[i].setAttribute('x', textX);
				tmp[i].setAttribute('y', this.r + this.paddingTop + y + 5);
				if (textX < (this.width / 2)) tmp[i].setAttribute('text-anchor', 'end');

				var linia = document.createElementNS("http://www.w3.org/2000/svg", "line");
				linia.setAttribute("x1", textX);
				linia.setAttribute("y1", this.r + this.paddingTop + y);
				linia.setAttribute("x2", this.marginLeft + this.paddingLeft + this.r + x);
				linia.setAttribute("y2", this.r + this.paddingTop + y);
				document.getElementById("labels").appendChild(linia);
			}

			angle += DATA[i][2] / 2;
		}
		document.getElementById("labels").setAttribute("transform", "translate(0, " + (this.marginTop) + ")");
	};

	this.addCircle = function() {
		var angle = START_ANGLE;
		var gap = this.r / 20;
		if (gap < 2)
			gap = 0;
		var cx = this.paddingLeft + this.r;
		var cy = this.paddingTop + this.r;
		for (var i = 0; i < DATA.length; ++i) {
			var dr = gap / Math.sin(getRad(DATA[i][2] / 2));
			var sinGamma = gap / this.r;
			var gamma = getDegrees(Math.asin(sinGamma));
			var pathD = '';
			var tmpx = cx + (Math.cos(getRad(angle + DATA[i][2] / 2)) * dr);
			var tmpy = cy + (Math.sin(getRad(angle + DATA[i][2] / 2)) * dr);
			pathD += 'M ' + (tmpx) + ',' + (tmpy);

			var tmpAngle = angle + gamma;
			var x1 = Math.cos(getRad(tmpAngle)) * this.r;
			var y1 = Math.sin(getRad(tmpAngle)) * this.r;
			pathD += ' L ' + (cx + x1) + ',' + (cy + y1);

			angle += DATA[i][2];

			var tmpAngle = angle - gamma;
			var x2 = Math.cos(getRad(tmpAngle)) * this.r;
			var y2 = Math.sin(getRad(tmpAngle)) * this.r;
			if (DATA[i][2] > 180)
				pathD += ' A ' + this.r + ',' + this.r + ' 1 1,1 ' + (cx + x2) + ',' + (cy + y2);
			else
				pathD += ' A ' + this.r + ',' + this.r + ' 1 0,1 ' + (cx + x2) + ',' + (cy + y2);
			pathD += ' Z';

			var linia = document.createElementNS("http://www.w3.org/2000/svg", "path");
			linia.setAttribute("d", pathD);
			document.getElementById('columns').appendChild(linia);
			toolTip.applyTo(linia, DATA[i][0]);
		}

		if ((OPTIONS & OPT_ANIM) > 0) {
			var anim = document.createElementNS("http://www.w3.org/2000/svg", "set");
			anim.setAttribute("attributeType", "XML");
			anim.setAttribute("attributeName", "transform");
			anim.setAttribute("begin", "0s");
			anim.setAttribute("to", "translate(0,0)");
			//anim.setAttribute("fill", "freeze"); FIXME: ???
			document.getElementById("columns").appendChild(anim);

			var anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
			anim.setAttribute("attributeType", "XML");
			anim.setAttribute("attributeName", "transform");
			anim.setAttribute("type", "scale");
			anim.setAttribute("begin", "0s");
			anim.setAttribute("dur", "1s");
			anim.setAttribute("fill", "freeze");
			anim.setAttribute("from", 0);
			anim.setAttribute("to", 1);
			anim.setAttribute("additive", "sum");
			document.getElementById('columns').appendChild(anim);

			var anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
			anim.setAttribute("attributeType", "XML");
			anim.setAttribute("attributeName", "transform");
			anim.setAttribute("type", "translate");
			anim.setAttribute("begin", "0s");
			anim.setAttribute("dur", "1s");
			anim.setAttribute("fill", "freeze");
			anim.setAttribute("from", (this.marginLeft+this.paddingLeft+this.r) + "," + ((this.finalGraphHeight / 2) + this.marginTop));
			anim.setAttribute("to", this.marginLeft+","+this.marginTop);
			anim.setAttribute("additive", "sum");
			document.getElementById('columns').parentNode.appendChild(anim);
		}
	}

	this.addFinalElements = function() {
		this.addCircle();
	}
}

function Meter() {
	this.inheritFrom = SVC;
	this.inheritFrom();

	this.padding;
	this.r = -1;

	this.firstCalculations = function() {
		/* Remove additinal series */
		for (var i = 0; i < DATA.length; ++i)
			DATA[i].splice(2, DATA[i].length - 2);

		/* Sum values */
		var sum = 0;
		for (var i = 0; i < DATA.length; ++i)
			sum += DATA[i][0];

		/* Scale values according to 100% == 360 */
		for (var i = 0; i < DATA.length; ++i)
			DATA[i][2] = DATA[i][0] * (360)  / sum;

		if (typeof START_ANGLE === "undefined")
			START_ANGLE = 0;
	}

	/* Validates given DATA and options */
	this.validate = function() {
		if (typeof WIDTH === "undefined" ||
			typeof HEIGHT === "undefined") {
			alert('Brak podanych rozmiarów. Wymagane: WIDTH i HEIGHT');
			return false;
		}

		return true;
	}

	this.calculateMargins = function() {
		if (typeof TITLE !== "undefined")
			this.marginTop += 10 + 16; //16px is font-size
	}

	this.calculateSize = function() {
		this.width = WIDTH;
		this.height = HEIGHT;

		var maxFinalGraphWidth = this.width - this.marginLeft - this.marginRight;
		var maxFinalGraphHeight = this.height - this.marginTop - this.marginBottom;
		var maxFinalGraphSize = Math.min(maxFinalGraphWidth, maxFinalGraphHeight);

		if (maxFinalGraphSize < 150)
			this.padding = 5;
		else if (maxFinalGraphSize < 250)
			this.padding = 10;
		else
			this.padding = 15;

		this.r = (Math.min(maxFinalGraphWidth, maxFinalGraphHeight) / 2) - this.padding;

		var restX = this.width - this.padding - (2 * this.r) - this.padding;
		this.marginLeft = restX / 2;
		this.marginRight = restX / 2;

		var restY = this.height - this.marginTop - this.padding - (2 * this.r) - this.padding - this.marginBottom;
		this.marginTop += restY / 2;
		this.marginBottom += restY / 2;
	}

	this.addCircle = function() {
		document.getElementById("colshack").setAttribute("transform", document.getElementById("columns").getAttribute("transform"));

		belt = this.finalGraphWidth / 10;
		arrowLength = belt / 2.5;

		var angle = START_ANGLE;
		var smallR = this.r - belt;
		var perone = 360 / DATA.length;

		var gap = (this.finalGraphWidth < 120) ? 0 : (belt / 2);
		var cx = this.padding + this.r;
		var cy = this.padding + this.r;

		var angle_left = 270 - (perone / 2);
		var angle_right = 270 + (perone / 2);
		var pathD;

		var pointerPathD = '';
		if (this.r > 20) {
			pointerPathD = 'M ' + (cx) + ',' + (cy - (smallR - this.padding));
			pointerPathD += ' l ' + (-arrowLength / 1.5) + ',' + (arrowLength);
			pointerPathD += ' l ' + (arrowLength / 1.5 * 2) + ',' + (0);
			pointerPathD += ' Z';
			pointerPathD += 'M ' + (cx) + ',' + (cy - (smallR - this.padding - arrowLength));
			pointerPathD += ' L ' + (cx) + ',' + (cy);
		} else {
			pointerPathD += 'M ' + (cx) + ',' + (cy - smallR);
			pointerPathD += ' L ' + (cx) + ',' + (cy);
		}

		var sinGammaB = gap / this.r;
		var gammaB = getDegrees(Math.asin(sinGammaB));

		var sinGammaS = gap / smallR;
		var gammaS = getDegrees(Math.asin(sinGammaS));

		var tmpAngle = angle_left + gammaS;
		var x1 = Math.cos(getRad(tmpAngle)) * smallR;
		var y1 = Math.sin(getRad(tmpAngle)) * smallR;

		var tmpAngle = angle_left + gammaB;
		var x2 = Math.cos(getRad(tmpAngle)) * this.r;
		var y2 = Math.sin(getRad(tmpAngle)) * this.r;

		var tmpAngle = angle_right - gammaB;
		var x3 = Math.cos(getRad(tmpAngle)) * this.r;
		var y3 = Math.sin(getRad(tmpAngle)) * this.r;

		var tmpAngle = angle_right - gammaS;
		var x4 = Math.cos(getRad(tmpAngle)) * smallR;
		var y4 = Math.sin(getRad(tmpAngle)) * smallR;

		pathD = 'M ' + (cx + x1) + ',' + (cy + y1);
		pathD += ' L ' + (cx + x2) + ',' + (cy + y2);
		if (perone > 180)
			pathD += ' A ' + this.r + ',' + this.r + ' 1 1,1 ' + (cx + x3) + ',' + (cy + y3);
		else
			pathD += ' A ' + this.r + ',' + this.r + ' 1 0,1 ' + (cx + x3) + ',' + (cy + y3);
		pathD += ' L ' + (cx + x4) + ',' + (cy + y4);
		if (perone > 180)
			pathD += ' A ' + smallR + ',' + smallR + ' 1 1,0 ' + (cx + x1) + ',' + (cy + y1);
		else
			pathD += ' A ' + smallR + ',' + smallR + ' 1 0,0 ' + (cx + x1) + ',' + (cy + y1);

		for (var i = 0; i < DATA.length; ++i) {
			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", pathD);
			path.setAttribute('transform', "rotate("+ (START_ANGLE + (i * perone)) + ", " + (cx) + ", " + (cy) + ")");
			document.getElementById('columns').appendChild(path);
			if (typeof DATA[i][1] !== "undefined")
				toolTip.applyTo(path, DATA[i][1] + ': ' + DATA[i][0] + '%');
			else
				toolTip.applyTo(path, DATA[i][0] + '%');

			var addAngle = -(perone / 2) + DATA[i][0] / 100 * (perone - gammaS - gammaS);
			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", pointerPathD);
			path.setAttribute('transform', "rotate("+ (START_ANGLE + (i * perone) + addAngle) + ", " + (cx) + ", " + (cy) + ")");
			path.setAttribute("class", "pointer");
			document.getElementById("colshack").appendChild(path);
		}

		if ((OPTIONS & OPT_ANIM) > 0) {
			var anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
			anim.setAttribute("attributeType", "XML");
			anim.setAttribute("attributeName", "transform");
			anim.setAttribute("type", "rotate");
			anim.setAttribute("begin", "0s");
			anim.setAttribute("dur", "2s");
			anim.setAttribute("fill", "freeze");
			anim.setAttribute("from", "-1080 "+cx+" "+cy);
			anim.setAttribute("to", "0 "+cx+" "+cy);
			anim.setAttribute("additive", "sum");
			anim.setAttribute("calcMode", "spline");
			anim.setAttribute("keySplines", "0 0.5 0 1");
			document.getElementById('columns').appendChild(anim);

			var anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
			anim.setAttribute("attributeType", "XML");
			anim.setAttribute("attributeName", "transform");
			anim.setAttribute("type", "rotate");
			anim.setAttribute("begin", "0s");
			anim.setAttribute("dur", "2s");
			anim.setAttribute("fill", "freeze");
			anim.setAttribute("from", "0 "+cx+" "+cy);
			anim.setAttribute("to", "-1080 "+cx+" "+cy);
			anim.setAttribute("additive", "sum");
			anim.setAttribute("calcMode", "spline");
			anim.setAttribute("keySplines", "0 0.5 0 1");
			document.getElementById("colshack").appendChild(anim);
		}
	}

	this.addFinalElements = function() {
		this.addCircle();
	}

	document.getElementById('columns').setAttribute('class', "meter");
}

parseParams();

var obj;
if (typeof TYPE === "undefined") alert('No TYPE specified');
else if (TYPE == 'BarsH') obj = new BarsH;
else if (TYPE == 'BarsV') obj = new BarsV;
else if (TYPE == 'Points') obj = new Points;
else if (TYPE == 'Pie') obj = new Pie;
else if (TYPE == 'Meter') obj = new Meter;
else alert('Wrong chart TYPE');
if (obj) obj.generate()

toolTip.init();
