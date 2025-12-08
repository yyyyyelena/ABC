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

let players = {};
let territories = {};

// territory is moved entirely to the server script
const territoriesData = [
  {
    name: "campus",
    corners: [
      { lat: 31.149304, lon: 121.480687 },
      { lat: 31.148068, lon: 121.480928 },
      { lat: 31.148615, lon: 121.482405 },
      { lat: 31.149570, lon: 121.482198 }
    ],
    trigger: { lat: 31.148769, lon: 121.481580 },
    triggerRadius: 0.00018
  },
  {
    name: "apt_north",
    corners: [
      { lat: 31.150568, lon: 121.480325 },
      { lat: 31.149600, lon: 121.480743 },
      { lat: 31.149880, lon: 121.482138 },
      { lat: 31.150798, lon: 121.48194 }
    ],
    trigger: { lat: 31.150045, lon: 121.481865 },
    triggerRadius: 0.00018
  },
 
     {
    name: "lawn",
    corners: [
      { lat: 31.147814, lon: 121.481033 }, // top left
      { lat: 31.147437, lon: 121.481205 }, // bottom left
      { lat: 31.147492, lon: 121.482514 }, // bottom right
      { lat: 31.148273, lon: 121.482288 }  // top right
    ],
    trigger: { lat: 31.147768, lon: 121.481848},
    triggerRadius: 0.00018,
  },

       {
    name: "cstore_apts",
    corners: [
      { lat: 31.150697, lon: 121.482095 }, // top left
      { lat: 31.149935, lon: 121.482278 }, // bottom left
      { lat: 31.150210, lon: 121.483565 }, // bottom right
      { lat: 31.150913, lon: 121.483286 }  // top right
    ],
    trigger: { lat: 31.150224, lon: 121.483034},
    triggerRadius: 0.00018,
  },

{
  name:"metro",
  corners:[
    {lat: 31.151473, lon:121.481548},
    {lat:31.150995, lon:121.481612},
    {lat:31.151096, lon:121.482186},
    {lat:31.151542, lon:121.482101}
  ],
  trigger: {lat:31.151257, lon:121.481865},
  triggerRadius: 0.00018,
 
},

{
  name:"metro_west",
  corners:[
    {lat: 31.151285, lon:121.480373},
    {lat: 31.150848, lon:121.480470},
    {lat:31.151009, lon:121.481500},
    {lat:31.151436, lon:121.481387}
  ],
  trigger: {lat:31.150917, lon:121.480985},
  triggerRadius: 0.00018,

},

{
  name: "campus_east",
  corners:[
    {lat:31.149441, lon:121.482487},
    {lat:31.149150, lon:121.482492},
    {lat:31.149200, lon:121.483168},
    {lat:31.149503, lon:121.483120}
  ],
  trigger:{lat:31.149421, lon:121.482675},
  triggerRadius: 0.00018,
 
},

{
  name: "west_apt",
  corners:[
    {lat:31.148897, lon:121.479290}, //top left
    {lat:31.147759, lon:121.479526}, // bottom left
    {lat:31.147924, lon:121.480566}, //bottom right
    {lat:31.149076, lon:121.480246} //top right
  ],
  trigger:{lat:31.148957, lon:121.479987},
  triggerRadius: 0.00018,


},

{
  name: "west_apt2",
  corners:[
{lat:31.150210, lon:121.479134}, //top left
    {lat:31.149393, lon:121.479359}, // bottom left
    // {lat:31.149678, lon:121.480304}, //bottom right
    {lat:31.149485, lon:121.480325}, //bottom right

    {lat:31.150458, lon:121.480035} //top right
  ],
  trigger:{lat:31.149632, lon:121.480116},
  triggerRadius: 0.00018,
 
},
{
  name: "east2",
  corners:[
    {lat:31.148994, lon:121.482621}, //top left
    {lat:31.148732, lon:121.482605}, // bottom left
    {lat:31.148833, lon:121.483302}, //bottom right
    {lat:31.149099, lon:121.483297} //top right
  ],
  trigger:{lat:31.148865, lon:121.482573},
  triggerRadius: 0.00018,

},
{
  name: "idk",
  corners:[
    {lat:31.153176, lon:121.480658}, //top left
    {lat:31.151753, lon:121.480443}, // bottom left
    {lat:31.152056, lon:121.482760}, //bottom right
    {lat:31.152616, lon:121.482717} //top right
  ],
  trigger:{lat:31.152763, lon:121.481194},
  triggerRadius: 0.00018,
 
},
{
  name: "idk_second",
  corners:[
    {lat:31.154526, lon:121.481634}, //top left
    {lat:31.153305, lon:121.480840}, // bottom left
    {lat:31.152781, lon:121.482632}, //bottom right
    {lat:31.153901, lon:121.482245} //top right
  ],
  trigger:{lat:31.153764, lon:121.481612},
  triggerRadius: 0.00018,

},
{
  name: "idk_third",
  corners:[
    {lat:31.156243, lon:121.477010}, //top left
    {lat:31.153929, lon:121.476259}, // bottom left
    {lat:31.152974, lon:121.479971}, //bottom right
    {lat:31.155306, lon:121.481022} //top right
  ],
  trigger:{lat:31.153396, lon:121.479756},
  triggerRadius: 0.00018,

},
{
  name: "idk_fourth",
  corners:[
    {lat:31.151826, lon:121.478662}, //top left
    {lat:31.150899, lon:121.478426}, // bottom left
    {lat:31.150826, lon:121.479917}, //bottom right
    {lat:31.151487, lon:121.479917} //top right
  ],
  trigger:{lat:31.151009, lon:121.479774},
  triggerRadius: 0.00018,

},
{
  name: "westwest1",
  corners:[
    {lat:31.148746, lon:121.477589}, //top left
    {lat:31.147474, lon:121.477820}, // bottom left
    {lat:31.147713, lon:121.479402}, //bottom right
    {lat:31.148971, lon:121.479215} //top right
  ],
  trigger:{lat:31.148824, lon:121.478297},
  triggerRadius: 0.00018,

},

{
  name: "westwest2",
  corners:[
    {lat:31.150614, lon:121.478195}, //top left
    {lat:31.149127, lon:121.477632}, // bottom left
    {lat:31.149343, lon:121.479134}, //bottom right
    {lat:31.150417, lon:121.478936} //top right
  ],
  trigger:{lat:31.150541, lon:121.478313},
  triggerRadius: 0.00018,

},

{
  name: "westwest3",
  corners:[
    {lat:31.148489, lon:121.475722}, //top left
    {lat:31.147189, lon:121.476028}, // bottom left
    {lat:31.147414, lon:121.477600}, //bottom right
    {lat:31.148718, lon:121.477321} //top right
  ],
  trigger:{lat:31.148066, lon:121.477428},
  triggerRadius: 0.00018,

},
{
  name: "westwest4",
  corners:[
    {lat:31.151349, lon:121.475358}, //top left
    {lat:31.148769, lon:121.475701}, // bottom left
    {lat:31.149118, lon:121.477428}, //bottom right
    {lat:31.150715, lon:121.478072} //top right
  ],
  trigger:{lat:31.1505781, lon:121.477675},
  triggerRadius: 0.00018,

},

{
  name: "crystal_plaza",
  corners:[
    {lat:31.153699, lon:121.475733}, //top left
    {lat:31.151670, lon:121.475218}, // bottom left
    {lat:31.150871, lon:121.478040}, //bottom right
    {lat:31.152919, lon:121.478844} //top right
  ],
  trigger:{lat:31.152331, lon:121.476956},
  triggerRadius: 0.00018,

},

{
  name: "crystal_bridge",
  corners:[
    {lat:31.152841, lon:121.478957}, //top left
    {lat:31.151886, lon:121.478646}, // bottom left
    {lat:31.151615, lon:121.479864}, //bottom right
    {lat:31.152575, lon:121.479837} //top right
  ],
  trigger:{lat:31.152409, lon:121.479649},
  triggerRadius: 0.00018,

},

{
  name: "easteast1",
  corners:[
    {lat:31.149568, lon:121.483281}, //top left
    {lat:31.148847, lon:121.483410}, // bottom left
    {lat:31.148985, lon:121.484246}, //bottom right
    {lat:31.149695, lon:121.484069} //top right
  ],
  trigger:{lat:31.149535, lon:121.483710},
  triggerRadius: 0.00018,

},

{
  name: "south1",
  corners:[
    {lat:31.146795, lon:121.481269}, //top left
    {lat:31.144940, lon:121.481333}, // bottom left
    {lat:31.145142, lon:121.485292}, //bottom right
    {lat:31.147079, lon:121.484971} //top right
  ],
  trigger:{lat:31.146997, lon:121.484756},
  triggerRadius: 0.00018,

},

{
  name: "south2",
  corners:[
    {lat:31.144839, lon:121.481301}, //top left
    {lat:31.143644, lon:121.481612}, // bottom left
    {lat:31.144187, lon:121.4855289}, //bottom right
    {lat:31.144967, lon:121.485325} //top right
  ],
  trigger:{lat:31.144325, lon:121.485410},
  triggerRadius: 0.00018,

},

{
  name: "ne1",
  corners:[
    {lat:31.154746, lon:121.472375}, //top left
    {lat:31.152671, lon:121.471645}, // bottom left
    {lat:31.151744, lon:121.474928}, //bottom right
    {lat:31.153754, lon:121.475325} //top right
  ],
  trigger:{lat:31.152956, lon:121.474767},
  triggerRadius: 0.00018,

},

{
  name: "ne2",
  corners:[
    {lat:31.152588, lon:121.471581}, //top left
    {lat:31.151138, lon:121.470787}, // bottom left
    {lat:31.148842, lon:121.475186}, //bottom right
    {lat:31.151340, lon:121.475014} //top right
  ],
  trigger:{lat:31.151652, lon:121.473255},
  triggerRadius: 0.00018,

},

{
  name: "ne3",
  corners:[
    {lat:31.148365, lon:121.461882}, //top left
    {lat:31.143774, lon:121.461582}, // bottom left
    {lat:31.146675, lon:121.476130}, //bottom right
    {lat:31.155086, lon:121.469821} //top right
  ],
  trigger:{lat:31.153470, lon:121.469693},
  triggerRadius: 0.00018,

},

{
  name: "campus_east2",
  corners:[
    {lat:31.148482, lon:121.482792}, //top left
    {lat:31.147428, lon:121.482803}, // bottom left
    {lat:31.147759, lon:121.484756}, //bottom right
    {lat:31.148879, lon:121.484316} //top right
  ],
  trigger:{lat:31.148401, lon:121.484316},
  triggerRadius: 0.00018,

}


];

territoriesData.forEach(b => {
  territories[b.name] = { owner: null, trigger: b.trigger, cooldownEnd: 0 };
});

function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on("playerJoin", (data) => {
    const { name, team } = data;
    players[socket.id] = { name, team, lat: null, lon: null };
    socket.emit("territoriesInit", territoriesData);
    socket.emit("territoriesUpdate", territories);
    io.emit("playersUpdate", players);
  });

  socket.on("playerPosition", (data) => {
    if (!players[socket.id]) return;
    const player = players[socket.id];
    player.lat = data.lat;
    player.lon = data.lon;

    let changed = false;
    for (const [id, block] of Object.entries(territories)) {
      const trigger = block.trigger;
      if (!trigger) continue;
      const dist = distanceInMeters(trigger.lat, trigger.lon, data.lat, data.lon);
      if (block.cooldownEnd && block.cooldownEnd > Date.now()) continue;
      if (dist < 20 && block.owner !== player.team) {
        block.owner = player.team;
        block.cooldownEnd = Date.now() + 30000;
        console.log(`Territory "${id}" captured by ${player.team}`);
        changed = true;
      }
    }
    if (changed) io.emit("territoriesUpdate", territories);
    io.emit("playersUpdate", players);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playersUpdate", players);
  });
});

HTTPSserver.listen(portHTTPS, () => {
  console.log(`HTTPS Server started at port ${portHTTPS}`);
});
