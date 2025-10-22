const CUT = 1;
const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
// const base  = parts.length ? '/' + parts.slice(0, -CUT).join('/') : ''; // on SERVER...
const base  = parts.length ? parts.slice(0, -CUT).join('/') : '';
console.log(base);
const socket = io({ path: base + '/socket.io' });  
// yields '/leon/port-4100/socket.io' or '/socket.io'
// the conductor is connected to the socket in the very beginning

// let readyButton = document.querySelector("#ready");
let mainWrapper = document.querySelector(".main-wrapper")
let w = window.innerWidth;
let h = window.innerHeight;
let frogs = []

// socket communication
socket.emit("my-role",{role: "conductor"});

socket.on("all-frogs",function(data){
    //the data is an array of many frogs
    console.log(data);
    for (i=0; i< data.length; i++){
        let frog=data[i]
        addFrog(frog.id, frog.frogIdx);

    }
}) // the conductor can know the frogs online WHEN loggING in

    socket.on("new-frog", function(frog){
        console.log(frog);
        addFrog(frog.id, frog.frogIdx);
    })
    // the conductor can know the frogs online AFTER loggED in

    socket.on("delete-frog",function(data){
        //delete frog
        console.log(data);
        // the data refer to the frog id
        // looking for an html element with this ID, and remove
        document.querySelector("#A"+data).remove();

    })

    



// addFrog("sdfobjweq", 0); // function test
// one frog will show up with this if log in the conductor

function addFrog(socketID, frogIdx){
    let imgWrapper = document.createElement("div");
    imgWrapper.className = "img-wrap"
    imgWrapper.id = "A"+socketID;
    // "A" was added only to make sure the ID begins with a letter not a number
    imgElm = document.createElement("img");
    imgElm.src = "../imgs/frog"+frogIdx+".png";
    imgWrapper.append(imgElm)
    mainWrapper.append(imgWrapper);


    // button socket communication:
    imgElm.addEventListener("click", function(){
        document.querySelector("#A"+socketID).style.opacity = 0.3;
        // change the opacity of the clicked image
        setTimeout(function(){
            document.querySelector("#A"+socketID).style.opacity = 1;
        }, 500)
        socket.emit("trigger-frog",socketID);

    })
}
