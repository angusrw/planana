"use strict";
const menu = document.getElementById('burger');
menu.addEventListener('click', menuClick);

function menuClick() {
  var x = document.getElementById("myLinks");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
