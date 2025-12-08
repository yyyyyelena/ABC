function getOrCreateUserId() {
    // check if we have a userID already in local storage
    // if yes, return it
    // if not, create one and return it
    let id = localStorage.getItem("chat-user-id");
    if(id == undefined){
        id = 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        localStorage.setItem("chat-user-id", id);
    }
    return id;
}

const myIdentity = getOrCreateUserId();
let editingMemoryId = null;
let editingMemoryImgURL = null;


let mappa = new Mappa('Leaflet');
let myMap;
let canvas;

if (location.hostname.toLowerCase().startsWith('browsercircus') || location.hostname.toLowerCase().startsWith('www')) {
  socket = io({ path: "/yelena/port-4290/socket.io" });
} else {
  socket = io();
}

let allMemories = [];
let currentMemories = [];
let currentCity = 'SH';
let selectedFileData = null;
let selectedFileType = null;


let currentOpenMemoryKey = null;
let newMemoryLocation = null;
// Flag to block interaction during map reload
let isChangingCity = false;
let input = document.querySelector("#memory-file-input");

// for displaying location or not
let showLocation = false;
let userLocation;
let shimmer = 150;
let shimmerDirection = 1;
let heatLayer;

let mode = 'browse'
window.addEventListener('DOMContentLoaded', () => {
  let btn = document.querySelector("#edit-or-browse-btn");
  let locBtn = document.querySelector("#loc-btn")
  btn.addEventListener('click', () => {
    // Toggle mode
    if (mode === 'browse') {
      mode = 'edit';
      btn.textContent = 'browse!📖';
    } else {
      mode = 'browse';
      btn.textContent = 'join!📝';
    }

    // console.log("Mode changed:", mode);
  });

  locBtn.addEventListener('click', () => {
    showLocation = !showLocation;
    if (showLocation) {
      startGPS();
      locBtn.textContent = 'hide loc 📡';
    } else {
      locBtn.textContent = 'show loc 📍';
    }
  })
});

// window.addEventListener('load', () => {
//   const btn = document.querySelector("#edit-or-browse-btn");
//   if (!btn) return; 
//   btn.addEventListener('click', () => {
//     if (mode === 'browse') {
//       mode = 'edit';
//       btn.textContent = 'browse';
//     } else {
//       mode = 'browse';
//       btn.textContent = 'join!📝';
//     }
//   });
//   const locBtn = document.querySelector("#loc-btn");
//   if (locBtn) {
//     locBtn.addEventListener('click', () => {
//       showLocation = !showLocation;
//       if (showLocation) {
//         startGPS();
//         locBtn.textContent = 'hide loc 📡';
//       } else {
//         locBtn.textContent = 'show loc 📍';
//       }
//     });
//   }
// });


function startGPS() {
  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.watchPosition(
    handleNewPosition,
    (err) => console.error(err),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}
function handleNewPosition(pos) {
  let lonlat = fixForChineseMap(pos);
  userLocation = {
    lat: lonlat[1],
    lon: lonlat[0]
  };
  socket.emit("locationFromClient", userLocation);
}

function isEditMode() {
  return mode === 'edit';
}


// City Configurations
const CITY_CONFIG = {
  'BA': {
    lat: -34.6037, lng: -58.3816, zoom: 15,
    style: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
  },
  'SH': {
    lat: 31.2304, lng: 121.4737, zoom: 15,
    style: 'https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}'
  },
  'NY': {
    lat: 40.747224, lng: -73.9900, zoom: 15,
    style: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
  }
};

let mappa_options = CITY_CONFIG['SH'];


function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");

  // console.log("Leaflet object:", L);
  // console.log("Heatlayer function:", L.heatLayer);

  initMap();

  // Get Data from server to initialize the map
  socket.on("initMemories", function (data) {
    allMemories = data;
    filterMemories();
  });

  // receive new memory from server
  socket.on("newMemoryAdded", function (newMemory) {
    // Update local list
    allMemories.push(newMemory);

    // If the new memory is in the current city, update the current view
    if (newMemory.city === currentCity) {
      currentMemories.push(newMemory);
    }
    // updateHeatmap();
  });


  socket.on("memoryDeleted", id => {
    allMemories = allMemories.filter(m => m.id !== id);
    currentMemories = currentMemories.filter(m => m.id !== id);
    closePopup();
    // updateHeatmap();
  });

  socket.on("memoryUpdated", function (updatedMem) {
    let index = allMemories.findIndex(m => m.id === updatedMem.id);
    if (index > -1) {
      allMemories[index] = updatedMem;
      filterMemories(); 

      if (currentOpenMemoryKey === updatedMem.id) {
        document.getElementById('popup-title').innerText = updatedMem.title;
        document.getElementById('popup-text').innerText = updatedMem.text;
      }
    }
  });


}

function draw() {
  clear();
  //making the clickable node/ dot for the existing notes
  //further development: 
  for (let i = 0; i < currentMemories.length; i++) {
    let m = currentMemories[i];
    let pos = myMap.latLngToPixel(m.lat, m.lon);
    let icon = "⭐️"


    // fill(255, 182, 193);
    // stroke(255);
    // strokeWeight(1);
    // // noStroke();
    // circle(pos.x, pos.y, 20);

    textAlign(CENTER, CENTER);
    textSize(20);
    text(icon, pos.x, pos.y);

  }
  // display my loc
  if (showLocation && userLocation && myMap) {
    let p = myMap.latLngToPixel(userLocation.lat, userLocation.lon);

    shimmer += shimmerDirection * 4;
    if (shimmer >= 255) shimmerDirection = -1;
    if (shimmer <= 50) shimmerDirection = 1;
    push()
    fill(120, 81, 255, shimmer);
    circle(p.x, p.y, 10);
    pop()
  }
}

//setting up the map, based on city selection
function initMap() {
  myMap = mappa.tileMap(mappa_options);
  myMap.overlay(canvas);

  if (myMap.map) {
    // updateHeatmap();
  }

  isChangingCity = false;
}

function changeCity(cityCode) {
  isChangingCity = true;
  heatLayer = null;

  currentCity = cityCode;
  mappa_options = CITY_CONFIG[cityCode];
  filterMemories();

  // when changing city, the map is re-initialized
  let container = document.getElementById("p5-canvas-container");
  container.innerHTML = ""; //clears the existing content in the "container"
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  document.querySelector("#Leaflet").remove();
  initMap();
}

// to avoid memory from clustering (otherwise the dots will overflow the page) 
// only allows memories (& dots) from the current city to be shown 
function filterMemories() {
  currentMemories = allMemories.filter(m => m.city === currentCity);
  // updateHeatmap();
}

function touchStarted() {
  const menu = document.querySelector('.menu-bar');
  const rect = menu.getBoundingClientRect();

  if (touches[0].x >= rect.left || touches[0].x<= rect.right || touches[0].y >= rect.top || touches[0].y <= rect.bottom) {
    return
  }
  let popup = document.getElementById('memory-popup');
  let creationPopup = document.getElementById('new-memory-popup');

  //check if there is a pop-up displaying on the screen
  //if there is already a pop-up, stop running any following actions
  if (popup.style.display === "block" || creationPopup.style.display === "block" || isChangingCity) {
    return;
  }

  // clicks on EXISTING Dots
  for (let i = 0; i < currentMemories.length; i++) {
    let m = currentMemories[i];
    let pix = myMap.latLngToPixel(m.lat, m.lon);
    let d = dist(touches[0].x, touches[0].y, pix.x, pix.y);
    if (d < 15) {
      openMemory(m);
      return;  // if we clikc on existing dot, we stop this function (return) so we dont open the new memeory popup
    }
  }

  // if no dot was clicked, treat it as a "New Memory" tap
  if (!isEditMode()) return;
  let clickCoordinate = myMap.pixelToLatLng(touches[0].x, touches[0].y);
  newMemoryLocation = {
    lat: clickCoordinate.lat,
    lon: clickCoordinate.lng
  };

  openNewMemoryCreation();
}

//view existing notes 
function openMemory(memory) {
  currentOpenMemoryKey = memory.id;

  let popup = document.getElementById('memory-popup');
  popup.style.display = "block";

  document.getElementById('popup-title').innerText = memory.title;

  document.getElementById('popup-text').innerText = memory.text;
  document.getElementById('popupImg').src = memory.imgURL;

  let deleteBtn = document.getElementById('delete-memory');
  let editBtn = document.getElementById('edit-memory');

  if (isEditMode() && memory.userId === myIdentity) {
    deleteBtn.style.display = "inline-block";
    editBtn.style.display = "inline-block";

    deleteBtn.onclick = () => deleteMemory(memory.id);
    editBtn.onclick = () => editMemory(memory.id);

  } else {
    deleteBtn.style.display = "none";
    editBtn.style.display = "none";
  }


}

function deleteMemory(id) {
  socket.emit("deleteMemory", id);
  allMemories = allMemories.filter(m => m.id !== id);
  currentMemories = currentMemories.filter(m => m.id !== id);
  closePopup();
}

function editMemory(id) {
  if (!isEditMode()) return;
  let memory = allMemories.find(m => m.id === id);
  if (!memory) return;

  editingMemoryId = id;
  editingMemoryImgURL = memory.imgURL;

  document.getElementById('new-memory-title').value = memory.title;
  document.getElementById('new-memory-text').value = memory.text;

  let saveBtn = document.querySelector(".save-btn");
  saveBtn.innerText = "Update Memory";//change the button interface

  document.querySelector("#memory-file-input").style.display = "none";
  document.getElementById('new-memory-popup').style.display = 'block'; 
  closePopup();

}

function closePopup() {
  document.getElementById('memory-popup').style.display = "none";

  currentOpenMemoryKey = null;
}


//creating new memory, to be shared with everyone
function openNewMemoryCreation() {
  editingMemoryId = null;
  // selectedEmoji = "📍";
  document.getElementById('new-memory-popup').style.display = 'block';
  document.getElementById('new-memory-title').value = '';
  document.getElementById('new-memory-text').value = '';

  let saveBtn = document.querySelector(".save-btn");
  saveBtn.innerText = "Create & Share";
  document.querySelector("#memory-file-input").style.display = "block";
}

function closeNewMemoryPopup() {
  editingMemoryId = null;

  document.getElementById('new-memory-title').value = '';
  document.getElementById('new-memory-text').value = '';
  document.querySelector("#memory-file-input").value = "";
  document.getElementById('new-memory-popup').style.display = 'none';
  newMemoryLocation = null;
}

function saveNewMemory() {
  if (!isEditMode()) return;
  const title = document.getElementById('new-memory-title').value.trim();
  const text = document.getElementById('new-memory-text').value.trim();
  let imgFileBlob = input.files[0];

  if (editingMemoryId) {
    // const imageUrlToUse = editingMemoryImgURL;
    let m = allMemories.find(m => m.id === editingMemoryId);
    if (!m) { 
        closeNewMemoryPopup();
        return; 
    }

    if (m) { m.title = title; m.text = text}
    

     socket.emit("updateMemory", {
      id: editingMemoryId,
      title: title,
      text: text,
      imgURL: m.imgURL
    });

    closeNewMemoryPopup();
    return; 
  }

  fetch('upload-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    body: imgFileBlob
  })
    .then(r => r.json())
    .then(data => {
      const memoryData = {
        id: Date.now(),
        city: currentCity,
        lat: newMemoryLocation.lat,
        lon: newMemoryLocation.lon,
        title: title,
        text: text,
        imgURL: data.url,
        userId: myIdentity,
        // emoji: selectedEmoji
      };

      socket.emit("newMemoryFromClient", memoryData);
      closeNewMemoryPopup();
    });
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};