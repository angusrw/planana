"use strict";
addEventListener('load', loadSavedMeals);

let dragged;
let copy;
const app = document.getElementById('root');
const container = document.createElement('div');
container.setAttribute('class', 'container');
app.appendChild(container);

function loadSavedMeals(){
    var url = "http://localhost:3000/getSavedMeals";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if(request.readyState == 4 && request.status == 200){
        var response = JSON.parse(request.responseText);
        var i;
        if(response.length == 0){
           const note = document.createElement('p');
           note.setAttribute('class', 'note');
           note.textContent = "Sorry, looks like you haven't saved any recipes yet!";
           container.appendChild(note);
        }
        else{
           for(i=0; i<response.length; i++) {
              const card = document.createElement('section');
              card.setAttribute('class', 'card');
              card.setAttribute('draggable', 'true');

              const thumbnail = document.createElement('img');
              thumbnail.src = response[i].imgurl;
              thumbnail.setAttribute('class','thumb');
              thumbnail.setAttribute('draggable','false');

              const h2 = document.createElement('h2');
              h2.setAttribute('class', 'cardtxt');
              h2.textContent = response[i].name;

              const foodid = document.createElement('p');
              foodid.style.display = "none";
              foodid.textContent = response[i].mealid;

              container.appendChild(card);
              card.appendChild(thumbnail);
              card.appendChild(h2);
              card.appendChild(foodid);
            }
          }
       }
    }
    request.open('GET', url, true);
    request.send();
    makeDraggable();
    start();
}

function makeDraggable(){
  var choices = document.getElementsByClassName("card");
  for (var i = 0; i < choices.length; i++) {
    choices[i].ondragstart = onDragStart; //triggered at drag start
    choices[i].ondragend = onDragEnd; //triggered when dropped
  }
}

//assign event listeners for buttons
function start() {
  var choices = document.getElementsByClassName("savedmeals");
  for (var i = 0; i < choices.length; i++) {
    choices[i].ondragstart = onDragStart; //triggered at drag start
    choices[i].ondragend = onDragEnd; //triggered when dropped
  };

  var mealStore = document.getElementsByClassName("mealStore");
  for (var i = 0; i < mealStore.length; i++) {
    mealStore[i].ondragover = onDragOver; //triggered repeatedly if draggable is in droppable area
    mealStore[i].ondrop = onDrop; //triggered when draggable item is released and accepted by drop area
    mealStore[i].ondragenter = onDragEnter;
    mealStore[i].ondragleave = onDragLeave;
  }

  var saveplan = document.getElementById("save");
  saveplan.onclick = savePlan;
}

function clearCards(){
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function newDraggable(node) {
  node.onclick = popup; //triggered at drag start
  node.ondragstart = onDragStartClone; //triggered at drag start
  node.ondragend = onDragEnd; //triggered when dropped
}

function onDragStart(ev) {
  let target = ev.target;
  dragged = target;
  ev.dataTransfer.setData("text", ev.target.id);
  ev.dataTransfer.dropEffect = 'copy';
  ev.target.style.opacity = 1;
}

function onDragStartClone(ev) {
  let target = ev.target;
  dragged = target;
  ev.dataTransfer.setData("text", ev.target.id);
  ev.dataTransfer.dropEffect = 'move';
  ev.target.style.opacity = 1;
}

function onDragEnd(ev) {
  ev.target.style.opacity = '';
  dragged = null;
}

function onDragOver(ev) {
  //default is that they cannot be dropped on other elements - to drop in box we must prevent this default
  ev.preventDefault();
}

function onDragLeave(ev){
  ev.target.style.background = '';
}

function onDragEnter(ev){
  const target = ev.target;
  if (!(target.hasChildNodes())) {
      event.preventDefault();
      // Set the dropEffect to move
      event.dataTransfer.dropEffect = 'move'
      target.style.background = '#fffabe';
  }
}

function onDrop(ev) {
  const target = ev.target;
  if (!target.hasChildNodes() && target.className != "StoredMeal") {
    target.style.backgroundColor = '';
    event.preventDefault();
    dragged.style.opacity = '';
    if(dragged.className == "StoredMeal"){
      target.appendChild(dragged);
    }else{
      var nodeCopy = dragged.cloneNode(true);
      nodeCopy.className = "StoredMeal";
      target.appendChild(nodeCopy);
      newDraggable(nodeCopy);
    }
  }
  else{ alert("Box Full!");}
}

function popup(ev) {
    const food = ev.target;
    const box = food.parentNode;
    if(food.className == "StoredMeal"){
      if (confirm("Remove Item?")) {
        box.removeChild(food);
      }
    }
    else{
      const card = box;
      const cardbox = card.parentNode;
      if (confirm("Remove Item?")) {
        cardbox.removeChild(card);
      }
    }
  }

function savePlan(ev) {
  var name = prompt("What would you like to name this plan?");
  while (name == "") {
    name = prompt("Please choose a name to continue...\nWhat would you like to name this plan?");
  }
  if(!(name == null)){
    var mealStore = document.getElementsByClassName("mealStore");
    var mealArray = [];
    var boxArray = [];
    for (var i = 0; i < mealStore.length; i++) {
      if(mealStore[i].hasChildNodes()){
        var mealid = mealStore[i].childNodes[0].childNodes[2].textContent;
        var boxid = mealStore[i].id;
        mealArray.push(mealid);
        boxArray.push(boxid);
      }
    }
    var finalArray = [mealArray, boxArray];
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "saveplan", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      finalArray: finalArray,
      name: name
    }));
  }
}
