let alpha, beta, gamma = 0;
let gamma1 = 0;
let colors = "ffc857-e9724c-c5283d-481d24-255f85-a9e5bb-2d1e2f-777da7-94c9a9-074f57".split("-").map(a => "#" + a);
let total;
let centerX, centerY;//for moving circles


function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  noStroke();
  total = 1200;
  centerX = width / 2;   //init center
  centerY = height / 2;
  canvas.parent("p5-canvas-container");
}

function draw() {
  background(25);
  

  push();
  // translate(width/2, height/2);
  translate(centerX, centerY);
  // rotate(radians(alpha));
  rotate(frameCount * 0.002);

  for (let i = 0; i < total; i++) {
//  this for loop controls the creation of circles
        let angle = sin(i + alpha) * 10;
        let angle2 = cos(i + alpha) * 650;
  // angle → usually drives rotation around the center (like turning the whole pattern).
  // angle2 → often used as an offset, so that not all circles move the same way. It gives variation.

    let inc = 85;
        let waveX = map(sin(beta), -1, 1, -inc, inc);
        let waveY = map(cos(beta), -1, 1, -inc, inc);

        let a = 94;
        let x = sin(radians(i)) *  (angle2 + a) + waveX;
        let y = cos(radians(i)) *  (angle2 + a) + waveY;

        let w = 860;
        if (touches.length > 1) {
          let size1 = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
          w = size1;
        }
        let x1 = sin(radians(i)) * (w / angle);
        let y1 = cos(radians(i)) * (w / angle);
//    w controls the diameter of the colored circle
				
// 	    white dots:
        fill(255);
        circle(x, y, 1);
      
//      colored dots
        let size = map(sin(i * frameCount * 0.0002), -1, 1, 0, 4); 


      fill(colors[int(abs(gamma % colors.length))]);
      console.log(colors[int(abs(gamma % colors.length))]);
      circle(x1, y1, size);
    // pop();
    }


  pop();

  // fill(255)
  // circle (centerX,centerY,100);
  // this was to test can touch and the gyroscope work at the same time

  fill('white');
  text("alpha: " + round(alpha), 10, 30);
  text("beta: " + round(beta), 10, 40);
  text("gamma: " + round(gamma), 10, 50);

}

// P5 touch events: https://p5js.org/reference/#Touch

function touchStarted() {
  // console.log(touches);

}

function touchMoved() {
  centerX = touches[0].x;
  centerY = touches[0].y;
  return false;
  //In p5.js, when return false; is used at the end of an event handler 
  //function (like keyTyped(), keyReleased(), mouseWheel(), etc.), 
  // its primary purpose is to prevent the browser's default behavior 
  // associated with that event.

}

function touchEnded() {
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function handleOrientation(eventData){
  document.querySelector('#requestOrientationButton').style.display = "none";

  // console.log(eventData.alpha, eventData.beta, eventData.gamma);
  
  alpha = eventData.alpha;
  beta = eventData.beta;
  gamma = eventData.gamma;

// alpha shifts the rotation & spread of the dots.
// beta makes the dots "wobble" side-to-side / up-down.
// gamma helps define the color of the moving dots.
    
}
