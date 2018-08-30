var smileFactor;
var face;

(function exampleCode() {
	"use strict";

	brfv4Example.initCurrentExample = function(brfManager, resolution) {
		brfManager.init(resolution, resolution, brfv4Example.appId);
	};

	brfv4Example.updateCurrentExample = function(brfManager, imageData, draw) {

		brfManager.update(imageData);

		draw.clear();

		// Face detection results: a rough rectangle used to start the face tracking.

		draw.drawRects(brfManager.getAllDetectedFaces(),	false, 1.0, 0x00a1ff, 0.5);
		draw.drawRects(brfManager.getMergedDetectedFaces(),	false, 2.0, 0xffd200, 1.0);

		var faces = brfManager.getFaces(); // default: one face, only one element in that array.

		for(var i = 0; i < faces.length; i++) {

			face = faces[i];

			if(		face.state === brfv4.BRFState.FACE_TRACKING_START ||
					face.state === brfv4.BRFState.FACE_TRACKING) {

				// Smile Detection

				setPoint(face.vertices, 48, p0); // mouth corner left
				setPoint(face.vertices, 54, p1); // mouth corner right
				//console.log(face.vertices);

				var mouthWidth = calcDistance(p0, p1);

				setPoint(face.vertices, 39, p1); // left eye inner corner
				setPoint(face.vertices, 42, p0); // right eye outer corner

				var eyeDist = calcDistance(p0, p1);
				smileFactor = mouthWidth / eyeDist;

				smileFactor -= 1.40; // 1.40 - neutral, 1.70 smiling

				if(smileFactor > 0.25) smileFactor = 0.25;
				if(smileFactor < 0.00) smileFactor = 0.00;

				smileFactor *= 4.0;

				if(smileFactor < 0.0) { smileFactor = 0.0; }
				if(smileFactor > 1.0) { smileFactor = 1.0; }

				//console.log(smileFactor);
				// Let the color show you how much you are smiling.

				var color =
					(((0xff * (1.0 - smileFactor) & 0xff) << 16)) +
					(((0xff * smileFactor) & 0xff) << 8);

				// Face Tracking results: 68 facial feature points.

				draw.drawTriangles(	face.vertices, face.triangles, false, 1.0, color, 0.4);
				draw.drawVertices(	face.vertices, 2.0, false, color, 0.4);

				// brfv4Example.dom.updateHeadline("BRFv4 - intermediate - face tracking - simple " +
				// 	"smile detection.\nDetects how much someone is smiling. smile factor: " +
				// 	(smileFactor * 100).toFixed(0) + "%");
				brfv4Example.dom.updateHeadline((smileFactor * 100).toFixed(0) + "%");
			}
		}
	};

	var p0				= new brfv4.Point();
	var p1				= new brfv4.Point();

	var setPoint		= brfv4.BRFv4PointUtils.setPoint;
	var calcDistance	= brfv4.BRFv4PointUtils.calcDistance;

	// brfv4Example.dom.updateHeadline("BRFv4 - intermediate - face tracking - simple smile " +
	// 	"detection.\nDetects how much someone is smiling.");
	//
	// brfv4Example.dom.updateCodeSnippet(exampleCode + "");
})();

var overlay = document.getElementById("overlay");
var red;
var blue;
var yellow;
var redDot;
var pink;
var squiggly;
var two;
var status = 0;

var font = null;
var fontSize = 150;
var textToRender = "slm";
var drawPoints = true;
var drawMetrics = false;
var kerning = true;
var ligatures = true;
var hinting = false;
var previewPath = null;
var snapPath = null;
var snapStrength = 0;
var snapDistance = 0;
var snapX = 0;
var snapY = 0;
//var fontSizeSlider = document.getElementById("font-size-range");

function drawPointsChanged(e) {
    drawPoints = e.checked;
    renderText();
}

function drawMetricsChanged(e) {
    drawMetrics = e.checked;
    renderText();
}

function kerningChanged(e) {
    kerning = e.checked;
    renderText();
}

function ligaturesChanged(e) {
    ligatures = e.checked;
    renderText();
}

function fontSizeChanged(e) {
    fontSize = e;
    renderText();
}

function snapStrengthChanged(e) {
    snapStrength = e;
    renderText();
}

function snapDistanceChanged(e) {
    snapDistance = e;
    renderText();
}

function snapXChanged(e) {
    snapX = e * 1.0;
    renderText();
}

function snapYChanged(e) {
    snapY = e * 1.0;
    renderText();
}

// Round a value to the nearest "step".
function snap(v, distance, strength) {
    return (v * (1.0 - strength)) + (strength * Math.round(v / distance) * distance);
}

function doSnap(path) {
    var i;
		var cmd;
    var strength = snapStrength / 100.0;
    for (i = 0; i < path.commands.length; i++) {
        cmd = path.commands[i];
				//console.log(cmd);
        if (cmd.type !== 'Z') {
            cmd.x = snap(cmd.x + snapX, snapDistance, strength) - snapX;
            cmd.y = snap(cmd.y + snapY, snapDistance, strength) - snapY;
        }
        if (cmd.type === 'Q' || cmd.type === 'C') {
            cmd.x1 = snap(cmd.x1 + snapX, snapDistance, strength) - snapX;
            cmd.y1 = snap(cmd.y1 + snapY, snapDistance, strength) - snapY;
        }
        if (cmd.type === 'C') {
            cmd.x2 = snap(cmd.x2 + snapX, snapDistance, strength) - snapX;
            cmd.y2 = snap(cmd.y2 + snapY, snapDistance, strength) - snapY;
        }
    }
		//console.log(path.commands[0]);
		//cmd = path.commands[0];
    //cmd.x = snap(cmd.x + snapX, snapDistance, strength) - snapX;
    //cmd.y = snap(cmd.y + snapY, snapDistance, strength) - snapY;

}

opentype.load('fonts/TaubSans-Regular2018253.otf', function(err, font) {
    if (err) {
        alert('Could not load font: ' + err);
    } else {
				console.log("successful loading of font");
				console.log(font);
				onFontLoaded(font);
        // Use your font here.
    }
});

function onFontLoaded(font) {
    var glyphsDiv, i, x, y, fontSize;
    window.font = font;

    amount = Math.min(100, font.glyphs.length);
    x = 50;
    y = 120;
    fontSize = 200;

    renderText();
}


two = new Two({
    width: 1280,
    height: 720
}).appendTo(overlay);

two.renderer.domElement.style.background = '#30429A';
//two.update();

function renderText() {
    if (!font) return;
    var options = {
        kerning: kerning,
        hinting: hinting,
        features: {
            liga: ligatures,
            rlig: ligatures
        }
    };
    snapPath = font.getPath(textToRender, 300, 200, fontSize, options);
		snapPath.fill = "#EB5D4A";
    doSnap(snapPath);

		// snapPath2 = font.getPath(textToRender, 50, 100, fontSize, options);
		// snapPath2.fill = "#EB5D4A";
    // doSnap(snapPath2);

		snapPath3 = font.getPath(textToRender, 600, 200, fontSize, options);
		snapPath3.fill = "#EB5D4A";
		doSnap(snapPath3);

    var snapCtx = document.getElementById('snap').getContext('2d');
    snapCtx.clearRect(0, 0, 940, 300);
    snapPath.draw(snapCtx);
		//snapPath2.draw(snapCtx);
		snapPath3.draw(snapCtx);
}

let value = 37;

function map (num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

two.bind('update', function(frameCount) {
	var face_Pts = [];
	two.clear();
	if (smileFactor) {
		value = (smileFactor * 100).toFixed(0);
		let n = map(value,0,100,100,0);
		let d = map(value,0,100,37,90);
		console.log(n);
		snapDistanceChanged(d);
		snapStrengthChanged(n);
		fontSizeChanged(150);
	}
	//snapStrengthChanged(smileFactor);

	//reorganize list into dictionary with point objects
	if (face) {
		for(let i=0;i<face.vertices.length-2;i+=2) {
			var point = {};
			point['x'] = face.vertices[i];
			point['y'] = face.vertices[i+1];
			face_Pts.push(point);
		}
		for(let j=0;j<face_Pts.length;j++){
			//var circle = two.makeCircle(face_Pts[j].x, face_Pts[j].y, 5);
		}
		//console.log(face_Pts);

		// EDGES OF FACE

		let line = two.makeLine(face_Pts[0].x,face_Pts[0].y,face_Pts[4].x,face_Pts[4].y);
		line.stroke = '#EB5D4A';
		line.linewidth = 7;
		line.noFill();

		let line2 = two.makeLine(face_Pts[5].x,face_Pts[5].y,face_Pts[8].x,face_Pts[8].y);
		line2.stroke = '#EB5D4A';
		line2.linewidth = 7;
		line2.noFill();

		let line3 = two.makeLine(face_Pts[8].x,face_Pts[8].y,face_Pts[11].x,face_Pts[11].y);
		line3.stroke = '#EB5D4A';
		line3.linewidth = 7;
		line3.noFill();

		let line4 = two.makeLine(face_Pts[12].x,face_Pts[12].y,face_Pts[16].x,face_Pts[16].y);
		line4.stroke = '#EB5D4A';
		line4.linewidth = 7;
		line4.noFill();

		// EYEBROWS

		let line5 = two.makeLine(face_Pts[0].x,face_Pts[0].y,face_Pts[18].x,face_Pts[18].y);
		line5.stroke = '#EB5D4A';
		line5.linewidth = 7;
		line5.noFill();

		let line6 = two.makeLine(face_Pts[19].x,face_Pts[19].y,face_Pts[21].x,face_Pts[21].y);
		line6.stroke = '#EB5D4A';
		line6.linewidth = 7;
		line6.noFill();


		let line7 = two.makeLine(face_Pts[22].x,face_Pts[22].y,face_Pts[24].x,face_Pts[24].y);
		line7.stroke = '#EB5D4A';
		line7.linewidth = 7;
		line7.noFill();

		let line8 = two.makeLine(face_Pts[16].x,face_Pts[16].y,face_Pts[25].x,face_Pts[25].y);
		line8.stroke = '#EB5D4A';
		line8.linewidth = 7;
		line8.noFill();

		// NOSE

		let line9 = two.makeLine(face_Pts[27].x,face_Pts[27].y,face_Pts[30].x,face_Pts[30].y);
		line9.stroke = '#EB5D4A';
		line9.linewidth = 7;
		line9.noFill();

		let line10 = two.makeLine(face_Pts[31].x,face_Pts[31].y,face_Pts[33].x,face_Pts[33].y);
		line10.stroke = '#EB5D4A';
		line10.linewidth = 7;
		line10.noFill();

		let line11 = two.makeLine(face_Pts[33].x,face_Pts[33].y,face_Pts[35].x,face_Pts[35].y);
		line11.stroke = '#EB5D4A';
		line11.linewidth = 7;
		line11.noFill();

		// LEFT EYE

		let line12 = two.makeCurve(face_Pts[36].x,face_Pts[36].y,face_Pts[37].x,face_Pts[37].y,face_Pts[38].x,face_Pts[38].y,face_Pts[39].x,face_Pts[39].y,face_Pts[40].x,face_Pts[40].y,face_Pts[41].x,face_Pts[41].y);
		line12.stroke = '#EB5D4A';
		line12.linewidth = 7;
		line12.noFill();

		// RIGHT EYE

		let line13 = two.makeCurve(face_Pts[42].x,face_Pts[42].y,face_Pts[43].x,face_Pts[43].y,face_Pts[44].x,face_Pts[44].y,face_Pts[45].x,face_Pts[45].y,face_Pts[46].x,face_Pts[46].y,face_Pts[47].x,face_Pts[47].y);
		line13.stroke = '#EB5D4A';
		line13.linewidth = 7;
		line13.noFill();

		// MOUTH

		let line14 = two.makeLine(face_Pts[48].x,face_Pts[48].y,face_Pts[50].x,face_Pts[50].y);
		line14.stroke = '#EB5D4A';
		line14.linewidth = 7;
		line14.noFill();

		let line15 = two.makeLine(face_Pts[51].x,face_Pts[51].y,face_Pts[52].x,face_Pts[52].y);
		line15.stroke = '#EB5D4A';
		line15.linewidth = 7;
		line15.noFill();

		let line16 = two.makeLine(face_Pts[50].x,face_Pts[50].y,face_Pts[51].x,face_Pts[51].y);
		line16.stroke = '#EB5D4A';
		line16.linewidth = 7;
		line16.noFill();

		let line17 = two.makeLine(face_Pts[52].x,face_Pts[52].y,face_Pts[54].x,face_Pts[54].y);
		line17.stroke = '#EB5D4A';
		line17.linewidth = 7;
		line17.noFill();

		let line18 = two.makeLine(face_Pts[54].x,face_Pts[54].y,face_Pts[57].x,face_Pts[57].y);
		line18.stroke = '#EB5D4A';
		line18.linewidth = 7;
		line18.noFill();

		let line19 = two.makeLine(face_Pts[57].x,face_Pts[57].y,face_Pts[48].x,face_Pts[48].y);
		line19.stroke = '#EB5D4A';
		line19.linewidth = 7;
		line19.noFill();

		//var circle = two.makeCircle(face_Pts[65].x, face_Pts[65].y, 5);
		//var circle = two.makeCircle(face_Pts[66].x, face_Pts[66].y, 5);
		//let line20 = two.makeCurve(face_Pts[48].x,face_Pts[48].y,face_Pts[61].x, face_Pts[61].y,face_Pts[62].x, face_Pts[62].y,face_Pts[63].x, face_Pts[63].y,face_Pts[54].x, face_Pts[54].y,true);
		let line20 = two.makeLine(face_Pts[48].x,face_Pts[48].y,face_Pts[62].x, face_Pts[62].y);
		line20.stroke = '#EB5D4A';
		line20.linewidth = 7;
		line20.noFill();

		let line21 = two.makeLine(face_Pts[62].x,face_Pts[62].y,face_Pts[54].x, face_Pts[54].y);
		line21.stroke = '#EB5D4A';
		line21.linewidth = 7;
		line21.noFill();

		//let line22 = two.makeCurve(face_Pts[48].x,face_Pts[48].y,face_Pts[66].x, face_Pts[66].y,face_Pts[65].x, face_Pts[65].y,face_Pts[54].x, face_Pts[54].y,true);
		let line22 = two.makeLine(face_Pts[48].x,face_Pts[48].y,face_Pts[66].x, face_Pts[66].y);
		line22.stroke = '#EB5D4A';
		line22.linewidth = 7;
		line22.noFill();

		let line23 = two.makeLine(face_Pts[66].x,face_Pts[66].y,face_Pts[54].x, face_Pts[54].y);
		line23.stroke = '#EB5D4A';
		line23.linewidth = 7;
		line23.noFill();
	}

	if (smileFactor == 1) {
		//console.log("smiling");
		}

}).play();
