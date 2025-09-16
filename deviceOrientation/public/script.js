

// window.addEventListener("deviceorientation", handleOrientation, true); // can be deleted later


function handleOrientation(eventData){
    console.log(eventData);
// the browser give to the function, we receive from the phone

    document.querySelector('#alpha').innerText = "alpha: " + Math.round(eventData.alpha);
    document.querySelector('#beta').innerText = "beta: " + Math.round(eventData.beta);
    document.querySelector('#gamma').innerText = "gamma: " + Math.round(eventData.gamma);
// using javascript to change the ptext; to show the orientation data (just as the one in the console.log)

    document.querySelector('h1').style.display = "none";
    document.querySelector('#requestOrientationButton').style.display = "none";
// if the phone gets orientation data, it hides the title and the button 

    document.querySelector('#square').style.transform = "rotate("+eventData.alpha+"deg)";
    // reflect the data to the css script - controls the squre
}







