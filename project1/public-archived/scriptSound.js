let mic;
let Balls = [];
let socket = io();//connect to server


function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  background(240);

  let vol = mic.getLevel();
  console.log(vol); // the vol usually is a lil above 0.001

  if (vol > 0.01 && frameCount % 10 === 0 ) { // control the number of balls
    
    if (Balls.length >= 4){
      Balls.shift();
      console.log("new array made")
    }
    Balls.push(new Ball(random(width), random(height), 20));
    console.log("yes")

    //socket communication
      socket.emit("newBall", {
      x: newBall.x,
      y: newBall.y,
      r: newBall.size
    });
  }
  
  // if (Balls.length === 4){
  // Balls.shift();
  // // console.log(Balls)
  // }

  //socket communication - update the presence of the ball
  socket.on("newBall", data => {
    Balls.push(new Ball(data.x, data.y, data.r));
  });

  for (let ball of Balls) {
    ball.update();
    ball.show();
  }
  
  // filter balls that exceeds the range of the canvas
  Balls = Balls.filter(ball => 
    ball.x + ball.size / 2 > 0 && ball.x - ball.size / 2 < width && ball.y - ball.size / 2 < height );
}




class Ball {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    
    this.vy = random(0, 2);
    this.vx = random(0, 2);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  show() {
    fill(0, 100, 255);
    ellipse(this.x, this.y, this.size);
  }
}