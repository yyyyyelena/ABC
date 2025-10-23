// const CUT = 1;
// const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
// // const base  = parts.length ? '/' + parts.slice(0, -CUT).join('/') : ''; // on SERVER...
// const base  = parts.length ? parts.slice(0, -CUT).join('/') : '';
// console.log(base);
// const socket = io({ path: base + '/socket.io' });  
// yields '/leon/port-4100/socket.io' or '/socket.io'
// the conductor is connected to the socket in the very beginning
// let base = '/yelena/port-4290'
// let socket = io({ port:base + '/socket.io' }); 


// const prefix = location.pathname.replace(/\/$/, '');      
// const socket = io({ path: prefix + '/socket.io' });

const CUT = 1;
const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
console.log(parts)
// const base  = parts.length ? '/' + parts.slice(0, -CUT).join('/') : ''; // on SERVER...
// const base  = parts.length ? parts.slice(0, -CUT).join('/') : ''; // on LOCAL...
// console.log(base);

let importantParts = []
for(p of parts){
    importantParts.push(p);
    if(p.startsWith("port-")){
        break
    }
}

const socket = io({ path: "/"+importantParts.join("/") + '/socket.io' });

// let socket = io();
socket.emit("my-role", { role: "displayer" });
// the display script communications all other designs

let users = {};
let ball = { x: 0, y: 0, vx: 4, vy: 2 };
let basket = { x: 30, y: 300 }; // use 'basket' consistently
let margin = 100;
let basketSize = 70;
let radius = 8;
let baseHalf = 50; //control the length of the baseline
let gravity = 0.001;
let scored = false; 
// let gameStarted = false;
let halfW
let halfH
let score = 0;


  socket.on("userUpdate", (data) => {
    users = data.users;// the data of user get put into the "user" object
    console.log("UserUpdate received:", data);
  });

function setup() {
  let canvas = createCanvas(390, 800);
  canvas.parent("p5-canvas-container");
  angleMode(DEGREES);

  // socket.emit("displaySize", { width: windowWidth, height: windowHeight });

  // gameStarted = true;

  // socket.on("updateGameState", (data) => {
  //   ball = data.ball;
  //   // basket = data.basket;
  // });
}


function draw() {
  background(30);
  halfW = width / 2;
  halfH = height / 2;
  push()
  translate(halfW, halfH);

  // if (gameStarted) {
    updateBall();
    // socket.emit("gameState", { ball });   
  // }

  drawBasket();
  drawBall();
  drawBaselines();

  pop();

  push();
  noStroke();
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 20, 30);
  pop()

}


// ball movement
function updateBall() {
  ball.vy += gravity;
  ball.x += ball.vx;
  ball.y += ball.vy;

  handleBoundaryCollision();
  handleBaseCollision();
}

function drawBall() {
  noStroke();
  fill("white");
  circle(ball.x, ball.y, radius * 2);
}

function resetBall() {
  ball.x = random(-width / 2 + radius, width / 2 - radius);
  ball.y = -height / 2 + radius * 3; 
  ball.vx = random(-1, 1); 
  ball.vy = 2;             
}

function drawBaselines() {
  strokeWeight(4);
for (let id in users) {
  let u = users[id];
  if (!u.baselines || u.baselines.length === 0) continue; 
  //if there's no user baseline data, it continues
  
  stroke(u.color);

  for (let lineData of u.baselines) {
  const { baseLeft, baseRight } = getBaseVectors(lineData, u.beta);
                                // this comes from the socket communication, and gives value to the getBaseVectors() function 
  line(baseLeft.x, baseLeft.y, baseRight.x, baseRight.y);
}
}

}

function handleBoundaryCollision() {
  let leftX = -width / 2 + radius;
  let rightX = width / 2 - radius;
  let topY = -height / 2 + radius;
  let bottomY = height / 2 - radius;

  if (ball.x < leftX ||ball.x > rightX ||ball.y < topY ||  ball.y > bottomY) {
   resetBall();
  }
  // if the ball touches the border, it gets restarted
}

function handleBaseCollision() {
  for (let id in users) {
    let u = users[id];//this (x,y) is assigned in the server
    if (!u.baselines || u.baselines.length === 0) continue;


  // for (let b of u.baselines) {
  //   // ‼️‼️‼️‼️‼️‼️‼️this chunk might be too repetitive //
  //   // Convert to centered coords like drawBaselines
  //   let left = createVector(b.p1.x * width - width / 2, b.p1.y * height - height / 2);
  //   let right = createVector(b.p2.x * width - width / 2, b.p2.y * height - height / 2);

  //   let baseDir = p5.Vector.sub(right, left);
  //   let baseLen = baseDir.mag();
  //   let baseDirN = baseDir.copy().normalize();
    
  //   let toBall = createVector(ball.x - left.x, ball.y - left.y);
  //   let proj = toBall.dot(baseDirN);
  //   let projClamped = constrain(proj, 0, baseLen);
  //   let closest = p5.Vector.add(left, baseDirN.copy().mult(projClamped));

  //   let diff = createVector(ball.x - closest.x, ball.y - closest.y);
  //   let dist = diff.mag();

  //   if (dist < radius && dist > 0.001) {
  //     let normal = diff.copy().normalize();
  //     let vDotN = ball.vx * normal.x + ball.vy * normal.y;
  //     if (vDotN < 0) {
  //       ball.vx -= 2 * vDotN * normal.x;
  //       ball.vy -= 2 * vDotN * normal.y;

  //       // push the ball slightly out
  //       ball.x += normal.x * (radius - dist + 0.9);
  //       ball.y += normal.y * (radius - dist + 0.9);
  //     }
  //   }
  // }
  for (let b of u.baselines) {
  const { baseLeft, baseRight } = getBaseVectors(b, u.beta);
  // using const because I only want this to be identified in the for loop 
  // to avoid confusion with the one above

  let baseDir = p5.Vector.sub(baseRight, baseLeft);
  let baseLen = baseDir.mag();
  let baseDirN = baseDir.copy().normalize();

  let toBall = createVector(ball.x - baseLeft.x, ball.y - baseLeft.y);
  let proj = toBall.dot(baseDirN);
  let projClamped = constrain(proj, 0, baseLen);
  let closest = p5.Vector.add(baseLeft, baseDirN.copy().mult(projClamped));

  let diff = createVector(ball.x - closest.x, ball.y - closest.y);
  let dist = diff.mag();

  if (dist < radius && dist > 0.001) {
    let normal = diff.copy().normalize();
    let vDotN = ball.vx * normal.x + ball.vy * normal.y;
    if (vDotN < 0) {
      ball.vx -= 2 * vDotN * normal.x;
      ball.vy -= 2 * vDotN * normal.y;
      ball.x += normal.x * (radius - dist + 0.9);
      ball.y += normal.y * (radius - dist + 0.9);
    }
  }
}
}
}

function getBaseVectors(lineData, beta) {
  let mid = createVector(
    lineData.p1.x * width - width / 2,
    lineData.p1.y * height - height / 2
  );
  let rotateVector = createVector(cos(90 - beta), sin(90 - beta));
  let baseLeft = p5.Vector.add(mid, rotateVector.copy().mult(-baseHalf));
  let baseRight = p5.Vector.add(mid, rotateVector.copy().mult(baseHalf));
  return { baseLeft, baseRight };
  // returns a value, keep being updated
}


function makeBasket() {
  // let margin = basketSize / 2 + 10; 

  // let minX = -halfW + margin;
  // let maxX = halfW - margin;

  // let minY = height / 4;
  // let maxY = halfH - margin;

  // basket.x = random(-halfW + basketSize/2, halfW-basketSize/2);
  // basket.y = random(0 + margin, halfH - margin);

  basket.x = 30;
  basket.y = 300;

  scored = false;
}


function drawBasket() {
  push();
  rectMode(CENTER);
  noFill();
  strokeWeight(4);
  stroke(scored ? 'white' : 'orange');
  rect(basket.x, basket.y, basketSize, basketSize);
  pop();

  let left = basket.x - basketSize / 2;
  let right = basket.x + basketSize / 2;
  let top = basket.y - basketSize / 4;
  let bottom = basket.y + basketSize / 4;

  if (!scored && ball.x > left && ball.x < right && ball.y > top && ball.y < bottom) {
    scored = true;
    score++;
    socket.emit("updateScore", { score });
    
    ball.vx = 0;
    ball.vy = 0;
    setTimeout(makeBasket, 700);
    setTimeout(() => { ball.vx = random(-1, 1); }, 1000);
    setTimeout(() => { ball.vy = 2; }, 1000);

  }

  // if (scored = true){
  //   console.log("scored")
  //   setTimeout(resetBall, 1000);
  // }
}

