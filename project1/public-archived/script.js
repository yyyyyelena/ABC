let Blocks = [];
let Balls = [];
let socket = io();//connect to server
let alpha, beta, gamma =0; // for gyroscope


function setup() {
  createCanvas(windowWidth, windowHeight);

  // listen for new block from server
  socket.on("newBlock", data => {
    Blocks.push(new Block(data.x, data.y, data.x1, data.y1));
  });

  // listen for new ball from server
  socket.on("newBall", data => {
    Balls.push(new Ball(data.x, data.y, data.r));
  });
}

function draw() {
  background(240);

  for (let ball of Balls) {
    ball.update();
    ball.show();
    ball.checkEdges();

    // check collision with blocks
    for (let i = 0; i < Blocks.length; i++) {
      if (ball.hits(Blocks[i])) {
        ball.bounceToNext(i); 
      }
    }
  }

  // show blocks
  for (let block of Blocks) {
    block.show();
  }

  fill('white');
  text("alpha: " + round(alpha), 10, 30);
  text("beta: " + round(beta), 10, 40);
  text("gamma: " + round(gamma), 10, 50);

}



class Block {
  constructor(x, y, x1, y1) {
    this.x = x;
    this.y = y;
    this.x1 = x1;
    this.y1 = y1;
  }

  show() {
    stroke(25,125,25);
    strokeWeight(5)

    line (this.x, this.y, this.x1, this.y1)
  }

 
}

class Ball {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.vx = 0;// velocity
    this.vy = 0;
    // this.speed = 1; 
  }

  update() {
    this.vx = round(alpha), 0.001, 0.005;
    this.vy = round(beta), 0.001, 0.005;

    this.x += this.vx;
    this.y += this.vy;

    this.checkEdges();
  }

  show() {
    fill(0, 100, 255);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }

  checkEdges() {
    // keep ball inside canvas (instead of bouncing)
    if (this.x > width - this.size/2 || this.x<this.size/2){
      this.vx *= -1
    }
    if(this.y<this.size/2 ||this.y>height - this.size/2){
      this.vy *= -1
    }

  }

 hits(block) {
  // circle center
  let cX = this.x;
  let cY = this.y;
  let r = this.size / 2;

  // line
  let x1 = block.x;
  let y1 = block.y;
  let x2 = block.x1;
  let y2 = block.y2;

  // dX, dY are the victor from line start to circle center
  let dX = x2 - x1;
  let dY = y2 - y1;
  let t = ((cX - x1) * dX + (cY - y1) * dY) / (dX * dX+ dY * dY);

  // constrain makes a number to stay within this range
  t = constrain(t, 0, 1);

  // closest point on line -> circle
  let closestX = x1 + t * dX;
  let closestY = y1 + t * dY;

  // distance from circle center to closest point
  let distToLine = dist(cX, cY, closestX, closestY);

  return distToLine <= r; 
  //the function will give true if distToLine is smaller or equal to the radius r, 
  //and false otherwise
}


 bounceToNext(index) {
    if (Blocks.length > 1) {
      let nextIndex = (index + 1) % Blocks.length;
      //identify block sequence to 
      let target = Blocks[nextIndex];
      //identify the direction
      let dir = createVector(target.x - this.x, target.y - this.y);
      dir.normalize();
      dir.mult(4); 
      this.vx = dir.x; // changing the velocity of the ball
      this.vy = dir.y;
    } else {
      this.vy *= -1; 
    }
  }
}

// touch creates an array - coordinates of the finger touch

function touchStarted() {
  if (touches.length === 1) {
    let newBall = new Ball(touches[0].x, touches[0].y, 20);
    Balls.push(newBall);

    socket.emit("newBall", {
      x: newBall.x,
      y: newBall.y,
      r: newBall.size
    });
  }

  if (touches.length === 2) {
    // two fingers → create a block (line)
    let newBlock = new Block(
      touches[0].x, 
      touches[0].y,
      touches[1].x, 
      touches[1].y
    );
    Blocks.push(newBlock);

    socket.emit("newBlock", {
      x: newBlock.x,
      y: newBlock.y,
      x1: newBlock.x1,
      y1: newBlock.y1
    });
  }
}

function touchmove(){

}

function touchEnd(){

}


function handleOrientation(eventData){
  document.querySelector('#requestOrientationButton').style.display = "none";  
  alpha = eventData.alpha;
  beta = eventData.beta;
  gamma = eventData.gamma;
  
// console.log(alpha,beta,gamma)
    
}