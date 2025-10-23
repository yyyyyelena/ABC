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

console.log("/"+importantParts.join("/") + '/socket.io')

const socket = io({ path: "/"+importantParts.join("/") + '/socket.io' });

// let base = '/yelena/port-4290'
// let socket = io({ port:base + '/socket.io' }); 


// const prefix = location.pathname.replace(/\/$/, '');      
// const socket = io({ path: prefix + '/socket.io' });

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
  const beta = event.gamma;
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

      let p1 = { x: touchesLoc[0].x / width, y: touchesLoc[0].y / height };
      let p2 = { x: touchesLoc[1].x / width, y: touchesLoc[1].y / height };

      socket.emit("linePlaced", { p1, p2 });
 
  }

  touchesLoc = [];
}

function touchStarted() {
  if (touches.length === 2) {
    touchesLoc = touches.map((t) => ({ x: t.x, y: t.y }));
    console.log(touchesLoc);
  }
}