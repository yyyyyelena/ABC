let value = 179;
let x = 200;
let y = 200;
let size = 40;

let origX = 100;
let origY = 150;
let origSize = 40;

let r = origR = 255
let g = origG =200
let b = origB =0

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
}

function draw() {
  background(value, value + 50, value);

  if (touches.length > 0) {
    // First finger controls position
    // lerp: Calculates a number between two numbers at a specific increment.
    //  The lerp() function is convenient for creating motion along a straight path and for drawing dotted lines.
    x = lerp(x, touches[0].x, 0.05);
    y = lerp(y, touches[0].y, 0.1);

  }

  if (touches.length > 1) {
    size = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    r = random(0,255)
    g = random(0,255)
    b = random (0,255)
  }

  if (touches.length === 3) {
    resetCircle();
  }

  fill(r,g,b); 
  ellipse(x, y, size, size);
}


function touchStarted() {
  if (value === 0) {
    value = 204;
  } else {
    value = 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchMoved() {
}

function touchEnded() {
  console.log("Touch ended");
}

function resetCircle() {
  x = origX;
  y = origY;
  size = origSize;
  r = origR;
  g = origG;
  b = origB;
  console.log("Circle reset to original settings!");
}