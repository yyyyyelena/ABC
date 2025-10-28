// const CUT = 1;
// const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
// console.log(parts)


// let importantParts = []
// for(p of parts){
//     importantParts.push(p);
//     if(p.startsWith("port-")){
//         break
//     }
// }

// console.log("/"+importantParts.join("/") + '/socket.io')

// const socket = io({ path: "/"+importantParts.join("/") + '/socket.io' });


let socket = io();

socket.emit("my-role", { role: "user" });
let touchesLoc =[]
let placedLine =[]


const requestOrientationButton = document.getElementById("requestOrientationButton");
requestOrientationButton.addEventListener("click", () => {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
  requestOrientationButton.disabled = true;
});


function handleOrientation(event) {
  const beta = event.beta;
  socket.emit("gyroUpdate", { beta });
}


// socket.on("gameStarted", () => {
//   readyButton.innerText = "Game Started!";
//   readyButton.style.display = "none";
// });

function setup(){
createCanvas(390, 800);
background(30);

}

function draw() {
  // background(30);
  stroke(0, 255, 150);
  strokeWeight(4);
  noFill();


 if (touches.length === 2) {
    line(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    // console.log(touches[0],touches[1])
  }
}



function touchEnded() {
  if (touches.length === 0 && touchesLoc.length === 2) {

      let p1 = { x: touchesLoc[0].x , y: touchesLoc[0].y };
      let p2 = { x: touchesLoc[1].x , y: touchesLoc[1].y };

      socket.emit("linePlaced", { p1, p2 });
 
  }

  touchesLoc = [];
}

function touchStarted() {
  if (touches.length === 2) {
    touchesLoc = touches.map((t) => ({ x: t.x / width, y: t.y / height })); 
    console.log(touchesLoc);
  }
}