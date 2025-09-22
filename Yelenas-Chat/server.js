const express = require('express');
const https = require("https");
const fs = require("fs");

const app = express(); 
const portHTTPS = 3001; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static('public')); 
// our front end should be in the public folder


// to unpack json
const bodyParser = require('body-parser')//add this
app.use(bodyParser.json())


// Creating object of key and certificate
// for SSL
const options = {
    key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
    // this keys-for-local-https was generated automatically with my terminal
    cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};



// additional server endpoints could be made here:

app.post('/xyz', (req, res) => {
  res.status(200).end();
});

app.get('/zyx', (req, res) => {
  res.status(200).end();
});


// Creating https server by passing
// options and app object
// http.createServer(app).listen(portHTTP, function (req, res) {
//     console.log("HTTP Server started at port", portHTTP);
// });

const HTTPSserver = https.createServer(options, app);

const{Server} = require('socket.io')
const io = new Server(HTTPSserver)

io.on('connection',(socket)=>{
  // we match the connection inside here
  console.log('a user connected',socket.id);

  socket.on("message",function(incomingMessage){
    console.log("got new msg:", incomingMessage)
  })

  let messageToAllClients = {
    sender:"unknown"
    // message: "incomingMessage"
  }


  socket.on("disconnect", function(){
    console.log('a user disconnect',socket.id);
  })

})


HTTPSserver.listen(portHTTPS,function(req,res){
  console.log("HTTPS Server started at port", portHTTPS);
})

// this can be separated into 2, now it is both creating and listening 
// https.createServer(options, app).listen(portHTTPS, function (req, res) {
//     console.log("HTTPS Server started at port", portHTTPS);
// });






