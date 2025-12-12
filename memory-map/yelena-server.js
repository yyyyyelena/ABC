const express = require('express');
const https = require("https");
const fs = require("fs");
const app = express();
const portHTTPS = 4290;
app.use(express.static('public'));

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};
let HTTPSserver = https.createServer(options, app);
const { Server } = require('socket.io');
const io = new Server(HTTPSserver);

app.post('/upload-photo', (req, res) => {
  console.log("someone upload photo")
  const filename = Date.now() + '.png';     // simple readable filename
  const filepath = 'public/uploads/' + filename;

  const writeStream = fs.createWriteStream(filepath);

  req.pipe(writeStream);

  req.on('end', () => {
    res.json({ url: 'uploads/' + filename });

  });
});

//loading local files
let memories = [];
const DATA_PATH = "memory-notes.json";

try {
  if (fs.existsSync(DATA_PATH)) {
    const file = fs.readFileSync(DATA_PATH, 'utf8');
    memories = JSON.parse(file); //turning string into javascript object
    //and update the javascript array
    console.log('Loaded memory:', memories.length, 'memories');

  }
} catch (err) {
  console.log('Could not load memories, starting empty');
  memories = [];
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.emit("initMemories", memories);  //sending over existing memories


  // create new memory
  socket.on("newMemoryFromClient", function (data) {

    const newMemory = {
      id: Date.now(),
      city: data.city,
      lat: data.lat,
      lon: data.lon,
      title: data.title,
      text: data.text,
      imgURL: data.imgURL,
      userId: data.userId
    };

    memories.push(newMemory);
    fs.writeFileSync(DATA_PATH, JSON.stringify(memories, null, 2));

    // send to all clients
    io.emit("newMemoryAdded", newMemory);
  });

  socket.on("deleteMemory", id => {
    memories = memories.filter(m => m.id !== id);
    fs.writeFileSync(DATA_PATH, JSON.stringify(memories, null, 2));
    io.emit("memoryDeleted", id);
  });

  socket.on("updateMemory", (updatedData) => {
    let memoryIndex = memories.findIndex(m => m.id === updatedData.id);
    
    if (memoryIndex > -1) {
      memories[memoryIndex].title = updatedData.title;
      memories[memoryIndex].text = updatedData.text;
      
      if(updatedData.imgURL) {
         memories[memoryIndex].imgURL = updatedData.imgURL;
      }

      fs.writeFileSync(DATA_PATH, JSON.stringify(memories, null, 2));
      io.emit("memoryUpdated", memories[memoryIndex]);
    }
  });

  socket.on("disconnect", function () {
    console.log("User disconnected", socket.id);
  });
});

HTTPSserver.listen(portHTTPS, function () {
  console.log("HTTPS Server started at port", portHTTPS);
});