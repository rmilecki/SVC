/* GLOBAL */
var OPT_ANIM =       parseInt('0000001', 2);
var OPT_LAZY_ANIM =  parseInt('0000010', 2);

/* BARS AND POINTS */
var OPT_AXIS_X =     parseInt('0000100', 2);
var OPT_GRID_H =     parseInt('0001000', 2);
var OPT_AXIS_Y =     parseInt('0010000', 2);
var OPT_GRID_V =     parseInt('0100000', 2);

/* POINTS */
var OPT_LINE   =     parseInt('1000000', 2);

var OPTIONS, START_ANGLE, TITLE;

function DOMBuilder() {
    this.add = function(el) {
        this.svg.insertBefore(el, this.script);
    }

    this.newG = function(id) {
        var el = document.createElementNS("http://www.w3.org/2000/svg", "g");
        if (id != "") el.setAttribute("id", id);
        return el;
    }
    this.addG = function(id) {
        this.add(this.newG(id));
    }

    this.newText = function(id, x, y) {
        var el = document.createElementNS("http://www.w3.org/2000/svg", "text");
        el.setAttribute("id", id);
        if (x != 0) el.setAttribute("x", x);
        if (y != 0) el.setAttribute("y", y);
        return el;
    }
    this.addText = function(id, x, y) {
        this.add(this.newText(id, x, y));
    }

    this.newRect = function(id, x, y, width, height, rx, ry) {
        var el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        if (id != "") el.setAttribute("id", id);
        if (x != 0) el.setAttribute("x", x);
        if (y != 0) el.setAttribute("y", y);
        el.setAttribute("width", width);
        el.setAttribute("height", height);
        if (rx != 0) el.setAttribute("rx", rx);
        if (ry != 0) el.setAttribute("ry", ry);
        return el;
    }
    this.addRect = function(id, x, y, width, height, rx, ry) {
        this.add(this.newRect(id, x, y, width, height, rx, ry));
    }

    this.newDefs = function() {
        var el = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        return el;
    }

    this.newStyle = function() {
        var el = document.createElementNS("http://www.w3.org/2000/svg", "style");
        el.setAttribute("type", "text/css");
        return el;
    }

    this.svg = document.getElementsByTagName('svg')[0];
    this.script = this.svg.getElementsByTagName('script')[0];
}

var tmp;
var b = new DOMBuilder();

tmp = b.newDefs();
tmp.appendChild(b.newStyle());
b.add(tmp);

document.styleSheets[0].insertRule('@import url(../svc-style.css);', 0);

tmp = b.newRect("", 0, 0, "100%", "100%", 0, 0);
tmp.setAttribute("class", "bg");
tmp.setAttribute("fill", "url(../svc-defs.svg#gradientBg)");
b.add(tmp);

tmp = b.newText("title", "50%", 26);
tmp.setAttribute("text-anchor", "middle");
b.add(tmp);

tmp = b.newG("values");
tmp.appendChild(b.newG(""));
tmp.appendChild(b.newG(""));
b.add(tmp);

b.addRect("graph", 0, 0, 0, 0, 0, 0);
b.addG("lines");

tmp = b.newG("");
tmp.appendChild(b.newG("columns"));
tmp.appendChild(b.newG("colshack"));
b.add(tmp);

b.addG("labels");
b.addRect("tooltip", 0, 0, 0, 30, 10, 10);
b.addText("toolTipText", 0, 0);
