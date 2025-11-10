let mappa = new Mappa('Leaflet'); // mappa library for rendering maps
let myMap;                        // reference to map object
let canvas;                       // p5 canvas overlay for custom drawing
let currentLongitude = 0; 
let currentLatitude = 0; 
let mapInit = false;              // flag for when the map is ready
let me;                           // player object (the user’s own location)

let playerName = "";              // user's entered name
let teamColor = "";               // user's chosen team color
let joinedTeam = false;           // whether player has joined a team yet

// object storing all teammates (players in the same team)
let teammates = {}; // format: { socketId: {name, lat, lon} }

// shared block color (starts white, changes once triggered)
let blockColor;

// trigger point and radius (approx ~15m)
const triggerPoint = { lat: 31.14887, lon: 121.4815 };
const triggerRadius = 0.00035; // 35 meter radius

// socket.io setup — connects to the same server unless deployed differently
if(location.hostname.toLowerCase().startsWith('browsercircus')){
  socket = io({path: "/YOURPATH-and-PORT/socket.io"});  
}else{
  socket = io(); 
}

// map options — sets the map’s visual style, zoom, and base coordinates
let mappa_options = {
  lat: 0,
  lng: 0,
  zoom: 16,
  style: 'https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}',
};

// FIRST BLOCK - TEST AREA
// GPS coordinates of the corners of first test block
// draw this block to confirm the coordinate mapping works
const firstBlockCoords = [
  { lat: 31.149304, lon: 121.480687 }, // top left
  { lat: 31.148068, lon: 121.480928 }, // bottom left
  { lat: 31.148615, lon: 121.482405 }, // bottom right
  { lat: 31.149570, lon: 121.482198 }  // top right
];

function setup() {
  // create p5 canvas and link to HTML container
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  me = new MyPoint(); // create player point object

  blockColor = color(255, 255, 255, 40);

  // TEAM JOIN LOGIC
  document.getElementById("joinTeamButton").addEventListener("click", () => {
    const nameInput = document.getElementById("playerName").value.trim();
    const teamInput = document.getElementById("teamSelect").value;

    // prevent joining without name
    if(nameInput === ""){
      alert("Please enter your name!");
      return;
    }

    // store player info locally
    playerName = nameInput;
    teamColor = teamInput;
    joinedTeam = true;

    // hide team join form after joining
    document.getElementById("team-join-container").style.display = "none";

    // notify server of player joining and team selection
    socket.emit("playerJoin", { name: playerName, team: teamColor });
  });

  // RECEIVE PLAYER UPDATES
  // server sends periodic updates of all connected players
  // only store those who are on the same team as this player
  socket.on("playersUpdate", (players) => {
    if(!joinedTeam) return;
    teammates = {};
    for(let id in players){
      if(players[id].team === teamColor){
        teammates[id] = players[id];
      }
    }
    updateTeamDisplay(); // update the team info shown on screen
  });
}

// TEAM DISPLAY AT TOP OF SCREEN
// updates the top panel showing the team name and members.
function updateTeamDisplay(){
  if(!joinedTeam) return;

  const teamDisplay = document.getElementById("team-display");
  teamDisplay.style.display = "flex";
  teamDisplay.style.backgroundColor = teamColor; // team color background

  const nameSpan = document.getElementById("my-team-name");
  const membersSpan = document.getElementById("team-members");

  // build a list of teammate names
  let names = [];
  for(let id in teammates){
    names.push(teammates[id].name);
  }

  nameSpan.innerText = `Team ${capitalize(teamColor)}: `;
  membersSpan.innerText = names.join(", ");
}

// capitalizes the first letter of a word (for display)
function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// main draw loop
function draw() {
  clear(); // clear canvas before each frame

  // initialize map once GPS is granted and we have coordinates
  if(!mapInit && GPS_GRANTED && currentLongitude != 0){
    mappa_options.lat = currentLatitude;
    mappa_options.lng = currentLongitude;

    // create the map and overlay the p5 canvas
    myMap = mappa.tileMap(mappa_options); 
    myMap.overlay(canvas);

    // recalculate shapes when map moves or zooms
    myMap.onChange(updateMapContent);

    mapInit = true;
  }

  // draw all content only after map is initialized
  if(mapInit){
    me.update();
    me.display();

    // DRAW TEAMMATES
    for(let id in teammates){
      const player = teammates[id];
      if(player.lat && player.lon){
        let pos = myMap.latLngToPixel(player.lat, player.lon); // convert GPS → pixel position
        fill(player.team);
        stroke("black");
        strokeWeight(2);
        circle(pos.x, pos.y, 20); // player position circle

        // draw player name above circle
        noStroke();
        fill("black");
        textAlign(CENTER);
        text(player.name, pos.x, pos.y - 15);
      }
    }

    // UPDATE AND DRAW TEST BLOCK (FIRST GRID SQUARE)
    checkBlockTrigger(); // check if anyone is near trigger point
    drawFirstBlock();    // draw the block with current color
  }
}

// DRAW FIRST BLOCK FUNCTION
function drawFirstBlock() {
  if (!mapInit || !myMap) return;

  // convert each lat/lon pair into map pixel coordinates
  let blockPixels = firstBlockCoords.map(corner => {
    return myMap.latLngToPixel(corner.lat, corner.lon);
  });

  // draw the polygon shape
  push();
  fill(blockColor);  // semi-transparent fill
  stroke(blockColor);
  strokeWeight(2);
  beginShape();
  for (let p of blockPixels) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);
  pop();
}

// TRIGGER DETECTION FUNCTION
// if any teammate (including you) is within radius of triggerPoint,
// the block changes color to that team's color.
function checkBlockTrigger() {
  let triggered = false;

  // Check current player first
  if (isNearTrigger(currentLatitude, currentLongitude)) {
    triggered = true;
  }

  // Check teammates' positions
  for (let id in teammates) {
    const player = teammates[id];
    if (player.lat && player.lon) {
      if (isNearTrigger(player.lat, player.lon)) {
        triggered = true;
      }
    }
  }

  // If anyone triggered, set the block color to team color
if (triggered) {
  switch (teamColor) {
    case "red": blockColor = color(255, 0, 0, 100); break;
    case "blue": blockColor = color(0, 0, 255, 100); break;
    case "green": blockColor = color(0, 255, 0, 100); break;
    case "yellow": blockColor = color(255, 255, 0, 100); break;
  }
}
}

// helper to check if given coords are within trigger radius
function isNearTrigger(lat, lon) {
  const dLat = lat - triggerPoint.lat;
  const dLon = lon - triggerPoint.lon;
  const distance = sqrt(dLat * dLat + dLon * dLon);
  return distance < triggerRadius;
}

// EVENT HANDLERS
function touchStarted() {
  if(mapInit){
    let pos = myMap.pixelToLatLng(touches[0].x, touches[0].y);
    console.log("TOUCHED", pos);
  }else{
    console.log("TOUCHED", touches);
  }
}
function touchMoved() {}
function touchEnded() {}

// resize canvas when window changes size
function windowResized(){ resizeCanvas(windowWidth, windowHeight); }

// GPS UPDATE HANDLER
function handleNewPosition(pos){
  let lonlat = fixForChineseMap(pos); // converts coordinates for chinese map
  currentLongitude = lonlat[0];
  currentLatitude = lonlat[1];

  // update the user's position on the map
  if(mapInit) updateMapContent();

  // send the player’s live position to the server
  if(joinedTeam){
    socket.emit("playerPosition", {lat: currentLatitude, lon: currentLongitude});
  }
}

// MAP UPDATE HANDLER
function updateMapContent(){
  let myPosOnCanvas = myMap.latLngToPixel(currentLatitude, currentLongitude);
  me.goalX = myPosOnCanvas.x;
  me.goalY = myPosOnCanvas.y;
}

// MYPOINT CLASS (represents player’s own marker)
class MyPoint{
  constructor(){
    this.x = 0;
    this.y = 0;
    this.goalX = 0;
    this.goalY = 0;
    this.size = 14;
    this.col = color(170, 240, 190);
  }

  // smoothly moves the circle toward its target (GPS) position
  update(){
    this.x = lerp(this.x, this.goalX, 0.2);
    this.y = lerp(this.y, this.goalY, 0.2);
  }

  // draws the pulsating marker
  display(){
    push();
    translate(this.x, this.y);
    fill(this.col);
    stroke("pink");
    strokeWeight(3);
    let dia = this.size + sin(frameCount * 0.1);
    circle(0, 0, dia);
    pop();
  }
}
