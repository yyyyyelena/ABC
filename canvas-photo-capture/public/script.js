let video;
let snapped = false;
let canvas;

function setup() {
  canvas = createCanvas(480, 640);
  canvas.parent("canvas-wrapper");
  canvas.elt.style.width = width/2 + "px";
  canvas.elt.style.height = height/2 + "px";
    
    // Create a video capture (aka webcam input)
    // video = createCapture(VIDEO);
    video = createCapture({
        video: { facingMode: "environment" },
        audio: false            // 👈 important
    });

    // Specify the resolution of the webcam input (too high and you may notice performance issues, especially if you're extracting info from it or adding filters)
    video.size(480, 640);

    // In some browsers, you may notice that a second video appears onscreen! That's because p5js actually creates a <video> html element, which then is piped into the canvas – the added command below ensures we don't see it :)
    video.hide();
    background(0)
}

function draw() { 
    

    if(snapped == false){
          //move image by the width of image to the left
        image(video, 0,0, 480, 640);
        
        //keep drawing the video feed, only when the "snapped" is false
    }
    // Display the video just like an image! 
    
    fill(255)
    text(width + " " + video.width + " " + video.height, 20, 20)
}

let camSound = document.querySelector("#camSound");
let sendButton = document.querySelector("#sendButton");
let captureButton = document.querySelector("#captureButton");
captureButton.addEventListener("click", function(){
    if(snapped == false){   // CLICK OF "SNAP!" BUTTON -- the "snapped" become true
        snapped = true;
        sendButton.style.display = "block";
        captureButton.innerText = "Try Again";
        //when clicks, the capture button beomes "try again"
        captureButton.style.width = "30%";
        camSound.play();
    }else{                  // CLICK OF "Try Again" BUTTON
        resetCamera();
    }
})

function resetCamera(){
    snapped = false;
    sendButton.style.display = "none";
    captureButton.innerText = "SNAP!"; 
    captureButton.style.width = "50%";
}

sendButton.addEventListener("click", function(){
    canvas.elt.toBlob(sendImageToServer, 'image/png')
    //turning it into the blob
})

function sendImageToServer(blob){
    //blob: sending media in chuncks
    console.log(blob);
    fetch('upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' }, // or jpg
        body: blob
    })
    //how to send the string using http
    .then(r => r.json())
    .then(data => {
        console.log("URL:", data.url);

        // could send that URL to socket server here manually

        // could also append as img
        let album = document.querySelector("#album");
        let img = document.createElement("img");
        let images = album.querySelector("#images")
        img.src = data.url;
        images.prepend(img);
        album.style.display = "block";
        resetCamera();
    }); 
}
