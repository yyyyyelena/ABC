const express = require('express');
const https = require("https");
const fs = require("fs");

const app = express();
const portHTTPS = 3001; // port for https


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

HTTPSserver.listen(portHTTPS,function(req,res){
  console.log("HTTPS server started at the port",portHTTPS);
})



// additional server endpoints could be made here:

app.post('/xyz', (req, res) => {
  res.status(200).end();
});

app.get('/zyx', (req, res) => {
  res.status(200).end();
});


io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on("message-from-client", function(data){
    console.log(data);

    io.emit("message-from-server", data);

  })


  // socket.on("message", function (incomingMessage) {
  //   console.log("got new msg:", incomingMessage)

  //   let messageToAllClients = {
  //     sender: "unknown",
  //     message: "incomingMessage"
  //   }
  //   io.emit("newMsg", messageToAllClients);
  // })

  // socket.on("user",function (incomingUser){
  //   console.log("got new uswer:",incomingUser)

  //   let messageToAllClients = {
  //     sender: "unknown",
  //     message: "incomingUser"
  //   }
  //   io.emit("newUser",messageToAllClients);

  // })



  socket.on("disconnect", () => {
    console.log('a user disconnect', socket.id);
  })

})



