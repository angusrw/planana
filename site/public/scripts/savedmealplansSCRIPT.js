"use strict";
addEventListener('load', loadbuttons);

let ypos = 10;
const app = document.getElementById('root');

function loadbuttons(){
  const container = document.createElement('div');
  container.setAttribute('class', 'container');
  app.appendChild(container);

  var url = "http://localhost:3000/getsavedplans";
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if(request.readyState == 4 && request.status == 200){
        var response = JSON.parse(request.responseText);
        var i;
        if(response.finalArray[0].length == 0){
            const note = document.createElement('p');
            note.setAttribute('class', 'note');
            note.textContent = "Sorry, looks like you haven't saved any meal plans yet!"
            container.appendChild(note);
        }
        else{
          for(i = 0; i < response.finalArray[0].length; i++){
              const btn = document.createElement('button');
              btn.innerHTML = response.finalArray[1][i];
              btn.setAttribute('class', 'openbtn');
              btn.setAttribute('id', response.finalArray[0][i]);
              container.appendChild(btn);
          }
        }
        start();
      }
  }
  request.open('GET', url, true);
  request.send();
}

function start(){
  var openplan = document.getElementsByClassName('openbtn');
  var i;
  for (i = 0; i < openplan.length; i++) {
      let id = openplan[i].id;
      openplan[i].onclick = function(){ openPlan(id); };//triggered at drag start
  }

  var closeplan = document.getElementById("closebtn");
  closeplan.onclick = closePlan;

  var exportButton = document.getElementById("exportbtn");
  exportButton.addEventListener('click',getInfo);
}

function getInfo(){
  let c = document.getElementsByClassName("card");
  let count = c.length;
  let finish = 0;
  console.log(`no. of meals = ${count}`);
  let a;
  for(a = 0; a < count; a++){
    console.log(`MEAL ${a+1}`);
    let mealid = c[a].childNodes[2].textContent;
    console.log(`mealid = ${mealid}`);

    let url = `http://api.yummly.com/v1/api/recipe/${mealid}?_app_id=a7cd4b5a&_app_key=1e8ba7282f5b6a71d5f0c5b75f50c820`;
    let request = new XMLHttpRequest();

    request.onreadystatechange = function() {
      if (this.readyState === 4) {
        finish++;
        console.log(`recipe calls finished = ${finish}`)
      }
    }

    request.open("GET", url, true);

    request.onload = function () {
      let data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        //console.log(---start request---);

        //create new card to add details
        let newcard = document.createElement('section');
        newcard.setAttribute('class','cardB');

        //add name to card
        let mealname = document.createElement('p');
        mealname.textContent = data.name;
        mealname.style.display = "none";
        //console.log(mealname = ${mealname.textContent});

        //add url to card
        let mealurl = document.createElement('p');
        mealurl.textContent = `${data.source.sourceRecipeUrl}`;
        mealurl.style.display = "none";
        //console.log(mealurl = ${mealurl.textContent});

        // //add yield to card
        // let mealyield = document.createElement('p');
        // mealurl.textContent = ${data.yield};
        // mealurl.style.display = "none";
        // console.log(mealyield = ${mealyield.textContent});
        //
        // //add time to card
        // let mealtime = document.createElement('p');
        // mealurl.textContent = ${data.totalTime};
        // mealurl.style.display = "none";
        // console.log(mealtime = ${mealtime.textContent});

        let ititle = document.createElement('p');
        ititle.style.display = "none";
        ititle.textContent = "Ingredients:";

        let ntitle = document.createElement('p');
        ntitle.style.display = "none";
        ntitle.textContent = "Nutrition:";

        let gap = document.createElement('p');
        gap.style.display = "none";
        gap.textContent = "";

        let gap2 = document.createElement('p');
        gap.style.display = "none";
        gap.textContent = "";

        newcard.appendChild(mealname);
        newcard.appendChild(mealurl);
        newcard.appendChild(gap);
        newcard.appendChild(ititle);

        //add ingredients to card
        let ingredient = data.ingredientLines;
        ingredient.forEach( i => {
          let ing = document.createElement('p');
          ing.style.display = "none";
          ing.textContent = i;
          //console.log(- ${ing.textContent});
          newcard.appendChild(ing);
        });

        newcard.appendChild(gap2);
        newcard.appendChild(ntitle);


        let nutrition = data.nutritionEstimates;
        let results;
        let searchField = "description";
        let searchVal = "Energy";
        for (let b = 0 ; b < nutrition.length ; b++){
          if (nutrition[b][searchField] == searchVal) {
            results = nutrition[b];
          }
        }

        let nut = document.createElement('p');
        nut.style.display = "none";
        nut.textContent = `${results.description}: ${results.value} ${results.unit.abbreviation}`;
        //console.log(- ${nut.textContent});
        newcard.appendChild(nut);

        // //add ingredients to card
        // let nutrition = data.nutritionEstimates;
        // nutrition.forEach( n => {
        //   let nut = document.createElement('p');
        //   nut.style.display = "none";
        //   nut.textContent = ${n.description}: ${n.value} ${n.unit.abbreviation};
        //   //console.log(- ${nut.textContent});
        //   newcard.appendChild(nut);
        // });

        app.appendChild(newcard);

      }
      else {alert("Could not retrieve recipes");}
      if(finish==count){writeInfo();}

    }
    request.send();
  }

}

function writeInfo(){
  let doc = new jsPDF();
  doc.setFontSize(12);
  let c = document.getElementsByClassName("cardB");
  let count = c.length;
  let a;
  for(a = 0; a < count; a++){
    console.log(`**** writing card ${a} ****`);
    let kids = c[a].childNodes;
    let kcount = kids.length;
    let b;
    for(b = 0; b < kcount; b++){
      if(ypos > 280){
        doc.addPage();
        ypos=10;
      }
      doc.text(kids[b].textContent,10,ypos);
      ypos += 5;
    }
    doc.addPage();
    ypos=10;
  }
  doc.save('plan.pdf');
}


function loadplan(id){
    var url = "http://localhost:3000/getmealsinplan";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if(request.readyState == 4 && request.status == 200){
        console.log("---------------- CLIENT RECIEVED")
      //  console.log(JSON.parse(request.responseText))
        var response = JSON.parse(request.responseText);
        var i;
        for( i = 0; i < response.length; i++ ){
            var box = document.getElementById(response[i].timeid);

            const card = document.createElement('section');
            card.setAttribute('class', 'card');

            const thumbnail = document.createElement('img');
            thumbnail.src = response[i].imgurl;
            thumbnail.setAttribute('class','thumb');
            thumbnail.setAttribute('draggable','false');

            const link = document.createElement('a');
            link.setAttribute("class", "cardtxt");
            link.href = `http://www.yummly.com/recipe/${response[i].mealid}`;
            link.textContent = response[i].name;
            link.target = "_blank";

            const foodid = document.createElement('p');
            foodid.style.display = "none";
            foodid.textContent = response[i].mealid;

            card.appendChild(thumbnail);
            card.appendChild(link);
            card.appendChild(foodid);
            box.append(card);
        }
      }
    }
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({planid: id}));
}

function openPlan(id) {
  loadplan(id);
  document.getElementById("plan").style.width = "100%";
}

function closePlan() {
  document.getElementById("plan").style.width = "0%";
  var boxes = document.getElementsByClassName('mealStore');
  var i;
  for(i = 0; i < 21; i++){
    while(boxes[i].firstChild){
        boxes[i].removeChild(boxes[i].firstChild);
        console.log("x");
    }
  }
}
