"use strict";
const signup = document.querySelector(".signup");
const login = document.querySelector(".login");
const container = document.querySelector(".container");
var buttons = document.querySelectorAll(".button");
var close = document.querySelectorAll(".closebtn");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

for(var i = 0; i < buttons.length; i++){
  if(i == 0){
    buttons[0].addEventListener("click", () =>{
      document.querySelector("#popup-signup").style.display = "flex";
    });
  }else{
    buttons[1].addEventListener("click", () =>{
      document.querySelector("#popup-login").style.display = "flex";
  });
}
}

signup.addEventListener("mouseenter", () => {
  container.classList.add("hover-signup");
});

signup.addEventListener("mouseleave", () => {
  container.classList.remove("hover-signup");
});

login.addEventListener("mouseenter", () => {
  container.classList.add("hover-login");
});

login.addEventListener("mouseleave", () => {
  container.classList.remove("hover-login");
});


for(var i = 0; i < close.length; i++){
  if(i == 0){
    close[0].addEventListener("click", () =>{
      document.querySelector("#popup-login").style.display = "none";
    });

  }else{
    close[1].addEventListener("click", () =>{
      document.querySelector("#popup-signup").style.display = "none";
    });

  }
}

signupForm.addEventListener("submit", function(event){
  event.preventDefault();
  var values = document.getElementById("signup-form").elements;
  var url = "http://localhost:3000/signup";
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if(request.readyState == 4 && request.status == 200){
      var validcredentials = JSON.parse(request.responseText).validcredentials;
      if(validcredentials){
        window.location.href = "http://localhost:3000/welcome";
      }else{
         alert("Account with that username or password already exists!")
      }
      }
    }

  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({username: values[0].value, password: values[1].value, email: values[2].value}));
});

loginForm.addEventListener("submit", function(event){
  event.preventDefault();
  var values = document.getElementById("login-form").elements;
  var url = "http://localhost:3000/login";
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if(request.readyState == 4 && request.status == 200){
      var validcredentials = JSON.parse(request.responseText).validcredentials;
      if(validcredentials){
        window.location.href = "http://localhost:3000/searchrecipes";
      }else{
         alert("Incorrect username or password!")
      }
      }
    }

  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({username: values[0].value, password: values[1].value}));
});
