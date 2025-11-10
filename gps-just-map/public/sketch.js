let mappa = new Mappa('Leaflet'); // map library
let myMap;
let canvas;
let currentLongitude = 0; // global variables will be updated as we get GPS data
let currentLatitude = 0; // global variables will be updated as we get GPS data
let mapInit = false; // we only do map stuff once mapInit is true (see in draw)
let me; // point object showing our own location
if(location.hostname.toLowerCase().startsWith('browsercircus')){
  socket = io({path: "/YOURPATH-and-PORT/socket.io"});  // yields '/leon/port-4100/socket.io' or '/socket.io'
}else{
  socket = io(); 
}

let zonePolygon = [
  // { lat: 31.149570, lon: 121.482198 },
  // { lat: 31.148615, lon: 121.482405 },
  // { lat: 31.148027, lon: 121.490923 },
  // { lat: 31.149304, lon: 121.480687 }
  {lat:31.412404, lon:120.891720},
  {lat:31.413014, lon:120.906936},
  {lat: 31.406971, lon: 120.906742},
  {lat:31.406018, lon: 120.893460}
];
let zoneActive = false;

// options for map
// we only actually initialize the map once we get data where we are (in draw)
// there are differnt suppliers and styles of maps available
let mappa_options = {
  lat: 0, // will change once we have data
  lng: 0, // will change once we have data
  zoom: 16, // initial zoom level
  // style: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
  // style: "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
  style: 'https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}',
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  me = new MyPoint();
  
}

function draw() {
  clear();

  // Initialize full screen map
  if(!mapInit && GPS_GRANTED && currentLongitude!= 0){
    console.log("starting map");
    mappa_options.lat = currentLatitude;
    mappa_options.lng = currentLongitude;
    myMap = mappa.tileMap(mappa_options); 
    myMap.overlay(canvas);
    myMap.onChange(updateMapContent);
    mapInit = true
  }

  if(mapInit){
    // only update and draw our point if we actually have data
    me.update();
    me.display();
    // console.log(me)

  }
  


}

// P5 touch events: https://p5js.org/reference/#Touch
function touchStarted() {
  if(mapInit){
    let pos = myMap.pixelToLatLng(touches[0].x, touches[0].y);
    console.log("TOUCHED", pos);
  }else{
    console.log("TOUCHED", touches);
  }
}

function touchMoved() {
}

function touchEnded() {
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


function handleNewPosition(pos){
  // fix location for chinese map tiles
  let lonlat = fixForChineseMap(pos);
  currentLongitude = lonlat[0];
  currentLatitude = lonlat[1];
  console.log(currentLatitude, currentLongitude);

  let locForServer = {
    lat:currentLatitude,
    lon:currentLongitude
  }

  socket.emit("locationFromClient", locForServer)

  if(mapInit){
    // if map already displayed, update the point
    updateMapContent();
  }
  
  socket.on("locationFromServer", function(data){
    console.log("data from someone",data);
    let someoneOnCanvas
  })
  
}

function updateMapContent(){
push();
noStroke();
fill(zoneActive ? color(255, 200, 0, 100) : color(200, 200, 200, 80)); // color changes when inside
beginShape();
for (let p of zonePolygon) {
  let pix = myMap.latLngToPixel(p.lat, p.lon);
  vertex(pix.x, pix.y);
}
endShape(CLOSE);
pop();
}

class MyPoint{
  constructor(){
    this.x = 0;
    this.y = 0;
    this.goalX = 0;
    this.goalY = 0;
    this.size = 14;
    this.col = color(170, 240, 190);

  }
  update(){
    // lerp to each new location to keep things smoother
    this.x = lerp(this.x, this.goalX, 0.2)
    this.y = lerp(this.y, this.goalY, 0.2)

  }
  display(){
    push();
    translate(this.x, this.y);
    fill(this.col);
    stroke("pink");
    strokeWeight(3)
    let dia = this.size + sin(frameCount*0.1)
    circle(0, 0, dia);

    pop();
  }
}

function handleNewPosition(pos){
  // fix location for chinese map tiles
  let lonlat = fixForChineseMap(pos);
  currentLongitude = lonlat[0];
  currentLatitude = lonlat[1];
  zoneActive = pointInPolygon(currentLatitude, currentLongitude, zonePolygon);

  console.log(currentLatitude, currentLongitude);


  let locForServer = {
    lat:currentLatitude,
    lon:currentLongitude
  }

  socket.emit("locationFromClient", locForServer)

  if(mapInit){
    // if map already displayed, update the point
    updateMapContent();
  }
  
  socket.on("locationFromServer", function(data){
    console.log("data from someone",data);
    let someoneOnCanvas
  })

}

function pointInPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].lon, yi = polygon[i].lat;
    let xj = polygon[j].lon, yj = polygon[j].lat;

    let intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
