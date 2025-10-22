const express = require('express');

const https = require('https');
const fs = require("fs")

const app = express();
const portHTTPS = 4290; // port for https

app.use(express.static('public'));

// to unpack json
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const options = {
  key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
  cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};
const HTTPSserver = https.createServer(options, app);

const { Server } = require('socket.io') // include lib
const io = new Server(HTTPSserver) // start socket io

// ask what is this for
HTTPSserver.listen(portHTTPS, function (req, res) {
  console.log("HTTPS server started at the port", portHTTPS);
})

let users = {}; // { socket.id: { x, y, beta } }
let ball = { x: 0, y: 0, vx: 4, vy: 2 };
// let basket = { x: 100, y: -50 };
// let displaySize = { width: 800, height: 600 }; 
let gameStarted = false;
let score = 0;
let colors = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
  "#C77DFF", "#FF9E00", "#00B4D8", "#FF5D8F"
];
let colorIndex = 0;



io.on("connection", (socket) => { //socekt connection
  console.log("Connected:", socket.id);


  // Display - canvas size
  // socket.on("displaySize", (data) => {
  //   displaySize = data;
  // });

  // Role communication
  socket.on("my-role", (data) => {
    if (data.role === "user") {
      users[socket.id] = { baselines: [], beta: 0,color: getNextColor() };
      // console.log("User joined:", socket.id);
      io.emit("userUpdate", { users });
    }
  });


  //Gyroscope updates
  socket.on("gyroUpdate", (data) => {
    if (users[socket.id]) {
      users[socket.id].beta = data.beta;
      io.emit("userUpdate", { users });
    }
  });

  socket.on("linePlaced", (data) => {
    if (!users[socket.id]) return;
      if (!users[socket.id].baselines) users[socket.id].baselines = [];
      users[socket.id].baselines.push(data);
  io.emit("userUpdate", { users });
  });

  //User clicks Ready
  socket.on("userReady", () => {
    if (!gameStarted) {
      gameStarted = true;
      io.emit("gameStarted"); 
    }
  });

 socket.on("updateScore", (data) => {
  score = data.score;
  io.emit("scoreUpdate", { score });
});



  //User disconnects
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userUpdate", { users });
    // console.log("Disconnected:", socket.id);
  });
});

function getNextColor() {
  let color = colors[colorIndex];
  colorIndex = (colorIndex + 1) % colors.length;
  return color;
}