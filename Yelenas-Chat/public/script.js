const socket = io();

let userEle = document.querySelector("#newUser");
let userInput = document.querySelector("#newUserName");
let formEle = document.querySelector("#chatForm");
let msgInput = document.querySelector("#newMessage");

let chatThreadList = document.querySelector("#messageList");
let userNameList = document.querySelector("#userList");

formEle.addEventListener("submit", newMessagesSubmitted);
userEle.addEventListener("submit",newUserSubmitted);

function newMessagesSubmitted(event){
  // console.log(event);

  //to print the message and stop form element from refreshing the page
  event.preventDefault();

  let newMsg = msgInput.value;
 
  appendMessage(newMsg);
  socket.emit("message",newMsg);

  msgInput.value = "";
}

function newUserSubmitted(userEvent){

  //to print the message and stop form element from refreshing the page
  userEvent.preventDefault();

  let newUser = userInput.value;
 
  appendUser(newUser);
  socket.emit("user",newUser);

  newUser.value = "";
}

function appendMessage(txt) {
  let chatThreadList = document.querySelector("#threadWrapper ul");
  console.log(chatThreadList);
  let newListItem = document.createElement("li")
  newListItem.innerText = txt;
  //append new li to the list
  chatThreadList.append(newListItem);
  //scroll to the buttom
  chatThreadList.scrollTop = chatThreadList.scrollHeight;

}

function appendUser(name){
  // console.log(name);
  let userNameList = document.querySelector("#userWrapper ul");
  let newUserItem = document.createElement("li")
  newUserItem.innerText = name;
  userNameList.append(newUserItem);
  userNameList.scrollTop = userNameList.scrollHeight;
}

