const socket = io();

// let userEle = document.querySelector("#newUser");
let userInput = document.querySelector("#newUserName");
// let formEle = document.querySelector("#chatForm");
let msgInput = document.querySelector("#newMessage");

let chatThreadList = document.querySelector("#messageList");
let userNameList = document.querySelector("#userList");

document.querySelector("#chatForm").addEventListener("submit", newMessagesSubmitted);
// document.querySelector("#newUser").addEventListener("submit",newUserSubmitted);


function newMessagesSubmitted(event){
  event.preventDefault();

  let newMsg = msgInput.value;
  let newUser = userInput.value;

  let packet = {
    sender: newUser,
    msg: newMsg
  }
  console.log("sending to server:", packet)
 
  socket.emit("message-from-client",packet);
  // send the message(which is in the packet) from client to server
  msgInput.value = "";
  // clear the text box

}


// listen the message(packet) from the server
socket.on("message-from-server", function(data){
  appendMessage(data);
})


// function newUserSubmitted(userEvent){
//   //to print the message and stop form element from refreshing the page
//   userEvent.preventDefault();

//   let newUser = userInput.value;
 
//   appendUser(newUser);
//   socket.emit("user",newUser);

//   newUser.value = "";
// }

  // socket.on("newMessage", appendMessage(newMsg))

  // socket.on("newUserName",appendUser(newUser))



function appendMessage(data) {
  let chatThreadList = document.querySelector("#threadWrapper ul");

  let newUserAndMessage = document.createElement("li");

  let userSpan = document.createElement("span");
  userSpan.classList.add("who");
  userSpan.innerText = data.sender;

  let msgSpan = document.createElement("span");
  msgSpan.classList.add("words");
  msgSpan.innerText = data.msg;

  newUserAndMessage.append(userSpan, document.createTextNode(": "), msgSpan); // this appends to the "li"
  chatThreadList.append(newUserAndMessage); //this appends to the "ul"
  chatThreadList.scrollTop = chatThreadList.scrollHeight;

  // we dont want to do this in the funciton
  // because it creates a listener, and we only need to create a listeneer once
    // socket.on("newMsg", function (data) {
    // console.log(data)
    // })

}

// function appendUser(name){
//   console.log(name);
//   let userNameList = document.querySelector("#userWrapper ul");
//   console.log(userNameList)
//   let newUserItem = document.createElement("li")
//   newUserItem.innerText = name;
//   userNameList.append(newUserItem);
//   userNameList.scrollTop = userNameList.scrollHeight;

//   // we dont want to do this in the funciton
//   // because it creates a listener, and we only need to create a listeneer once

//   // socket.on("user", function (data) {
//   //   console.log(data)
//   //   })
// }



