"use strict";
addEventListener('load', start);

const app = document.getElementById('root');
const container = document.createElement('div');
container.setAttribute('class', 'container');
app.appendChild(container);

//assign event listeners for buttons
function start() {
  clearCards();
  let search = document.getElementById("search");
  search.addEventListener('submit', recipeSearch());
  console.log("Load is finished");
}

//extract params for search
function recipeSearch(){
  clearCards();
  var link;
  var url = window.location.href;
  var q = url.indexOf("=");
  if (q < 0){
     //alert("No search term");
  }
  else{
    var defs = url.substring(q+1);
    if (defs.length == 0){
      //alert("No search term");
    }
    else{
      console.log("term: " + defs)
      url = `http://api.yummly.com/v1/api/recipes?_app_id=a7cd4b5a&_app_key=1e8ba7282f5b6a71d5f0c5b75f50c820&q=${defs}&requirePictures=true&maxResult=100`;
      getRecipes(url);
    }
  }
}

function clearCards(){
  while (container.firstChild) {
  //   container.removeChild(container.firstChild);
  }
}

function getRecipes(url){
  console.log(url)
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function () {

    var data = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) {
      data.matches.forEach(match => {

        const card = document.createElement('section');
        card.setAttribute('class', 'card');
        card.setAttribute('draggable', 'true');

        const thumbnail = document.createElement('img');
        thumbnail.src = match.smallImageUrls;
        thumbnail.width = '80px';
        thumbnail.height = '80px';
        thumbnail.setAttribute('class','thumb');
        thumbnail.setAttribute('draggable','false');

        const link = document.createElement('a');
        link.setAttribute("class", "cardtxt");
        link.href = `http://www.yummly.com/recipe/${match.id}`;
        link.textContent = match.recipeName;
        link.target = "_blank";

        const id = document.createElement('p');
        id.style.display = "none";
        id.textContent = match.id;

        const rating = document.createElement("object");
        rating.setAttribute('class', 'rating');
        rating.type = "image/svg+xml";
        switch (match.rating){
          case 5:
            rating.data = "../images/5star.svg";
            break;
          case 4:
            rating.data = "../images/4star.svg";
            break;
          case 3:
            rating.data = "../images/3star.svg";
            break;
          case 2:
            rating.data = "../images/2star.svg";
            break;
          case 1:
            rating.data = "../images/1star.svg";
            break;
        }

        const save = document.createElement("button");
        save.type = "button";
        save.textContent = "Save"
        save.addEventListener('click', function() {
          var par = this.parentNode;
          var sib = par.childNodes;
          var img = sib[0].src;
          var name = sib[1].textContent;
          var id = sib[2].textContent;
          var xhr = new XMLHttpRequest();
          console.log(name);
          xhr.open("POST", "savemeal", true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({
              name: name,
              id: id,
              img: img
          }));
        });

        container.appendChild(card);
        card.appendChild(thumbnail);
        card.appendChild(link);
        card.appendChild(id);
        card.appendChild(rating);
        card.appendChild(save);
      });
    } else {
      alert("Could not retrieve recipes");
    }
  }
  request.send();
}

function postMeal(name,id,img){
  var xhr = new XMLHttpRequest();
  console.log(name);
  xhr.open("POST", "savemeal", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
      name: name,
      id: id,
      img: img
  }));
}
