const express = require('express');
const https = require("https");
const fs = require("fs");

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

HTTPSserver.listen(portHTTPS, function (req, res) {
  console.log("HTTPS server started at the port", portHTTPS);
})



// additional server endpoints could be made here:
app.post('/xyz', (req, res) => {
  res.status(200).end();
});

app.get('/zyx', (req, res) => {
  res.status(200).end();
});


let userCount = 0;



io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  userCount++;

  io.emit("user-count", userCount);


  //server listen from THE client, and message to other Clients
  socket.broadcast.emit("message-from-server", {
    sender: "Server",
    msg: `A user has entered the chat.`
  });


  //server listen from THE client
  socket.on("message-from-client", function (data) {
    console.log(data);

    // server send out to clientS
    io.emit("message-from-server", data);

  })


// user disconnect
  socket.on("disconnect", () => {
    console.log('a user disconnect', socket.id);
    userCount--;


    io.emit("user-count", userCount);

    socket.broadcast.emit("message-from-server", {
    sender: "Server",
    msg: `A user has left the chat.`
  });
  })  
})



