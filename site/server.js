var sqlite3 = require('sqlite3');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const bcrypt = require('bcrypt');
var https = require('https');
var fs = require('fs')
var http = require('http');

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const httpsOptions = {
	cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
	key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))

}
const saltRounds = 12;
var db = new sqlite3.Database("plananadata.db");

db.run("CREATE TABLE IF NOT EXISTS users (userid INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT)",
  function (err) {
        if (err !== null) {
            console.log("Error: " + err);
        }
    });

db.run("CREATE TABLE IF NOT EXISTS plans (planid INTEGER, userid INTEGER, mealid TEXT, timeid TEXT, name TEXT)",
    function (err) {
        if (err !== null) {
            console.log("Error: " + err);
        }
    });

db.run("CREATE TABLE IF NOT EXISTS meals (mealid TEXT, name TEXT, imgurl TEXT, userid INTEGER)",
    function (err) {
        if (err !== null) {
            console.log("Error: " + err);
        }
    });

console.log("--------------CONNECTED TO DATABASE-------------")

app.get('/', function(request, response) {
	if(request.session.loggedin){
		response.redirect("/searchrecipes")

	}else{
		response.sendFile(path.join(__dirname + '/public/templates/landing.html'));
	}
});

app.get('/welcome', function(request, response) {
	if(request.session.loggedin){
		response.redirect("/searchrecipes")
	}else{
		response.sendFile(path.join(__dirname + '/public/templates/welcome.html'));
	}
});

app.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;

		db.get("SELECT * FROM users WHERE username = ?", [username], function(err, rows) {
			if (typeof rows != "undefined") {

        bcrypt.compare(password, rows.password, function(err, res) {
          if(res) {
            request.session.loggedin = true;
    				request.session.username = rows.username;
            request.session.userid = rows.userid
    			  response.send(JSON.stringify({validcredentials: true}))
          } else {
						response.send(JSON.stringify({validcredentials: false}))

         }
       });

			} else {
				response.send(JSON.stringify({validcredentials: false}))

			}
		});
});

app.post('/signup', function(request, response) {
	var validcredentials = false;
  db.get("SELECT * FROM users WHERE username=(?) OR email=(?)", [request.body.username, request.body.email], function(err, row){
		  if(typeof row == "undefined"){
				validcredentials = true;
				bcrypt.hash(request.body.password, saltRounds, function(err, hash) {
			    let username = request.body.username
			    let email = request.body.email
			    var stmt = db.prepare("INSERT INTO users (userid, username, password, email) VALUES (?, ?, ?, ?)")
			    stmt.run(null, username, hash, email)
			  });
				response.send(JSON.stringify({validcredentials: true}))
			}else{
				response.send(JSON.stringify({validcredentials: false}))
			}
	});
});

app.get('/authorised', function(request, response) {
	if(request.session.loggedin){
		response.redirect("/searchrecipes")
	}else{
		response.sendFile(path.join(__dirname + '/public/templates/landing.html'));
	}
});

app.get('/landing', function(request, response) {
	if (request.session.loggedin) {
		request.session.loggedin = false;
    response.sendFile(path.join(__dirname + '/public/templates/landing.html'));
	} else {
		response.redirect("/welcome");
	}
});

app.get('/searchrecipes', function(request, response) {
	if (request.session.loggedin) {
    response.sendFile(path.join(__dirname + '/public/templates/searchrecipes.html'));
	} else {
		response.redirect("/welcome");
	}
});

app.get('/savedmealplans', function(request, response) {
	if (request.session.loggedin) {
    response.sendFile(path.join(__dirname + '/public/templates/savedmealplans.html'));
	} else {
		response.redirect("/welcome");
	}
});

app.get('/createweekplan', function(request, response) {
	if (request.session.loggedin) {
    response.sendFile(path.join(__dirname + '/public/templates/createweekplan.html'));
	} else {
		response.redirect("/welcome");
	}
});

app.get('/getSavedMeals', function(request, response) {
	if (request.session.loggedin) {
		var savedData = []
			db.each("SELECT * FROM meals WHERE userid = (?)", [request.session.userid], function(err, row){
				 savedData.push(row);
			}, function(){
				response.send(JSON.stringify(savedData))
			});
  	} else {
			response.redirect("/welcome");
	}
});

app.get('/getsavedplans', function(request, response) {
	if (request.session.loggedin) {
		var planids = []
		var names = []
		db.each("SELECT * FROM plans WHERE userid = (?)", [request.session.userid], function(err, row){
			var id = row.planid;
			var name = row.name
			if(!(planids.includes(id))){
				 	planids.push(id)
					names.push(name)
			}
		}, function(){
				response.send(JSON.stringify({finalArray: [planids, names]}))
		});
  	} else {
			response.redirect("/welcome");
		}
});


app.post('/savemeal', function(request, response) {
	  db.get("SELECT * FROM meals WHERE userid = (?) AND mealid = (?)", [request.session.userid, request.body.id], function(err, rows) {
		if (typeof rows == "undefined") {
    var stmt = db.prepare("INSERT INTO meals (mealid, name, imgurl, userid) VALUES (?, ?, ?, ?)")
    var meal = request.body
    var name = meal.name;
		var id = meal.id;
		var img = meal.img;
    stmt.run(id, name, img, request.session.userid);
	}
	response.status(200);

});

});

app.post('/saveplan', function(request, response) {
		console.log(request.body);
    var plan = request.body
		var stmt = db.prepare("INSERT INTO plans (planid, userid, mealid, timeid, name) VALUES (?, ?, ?, ?, ?)");
		var d = new Date();
		var finalArray = plan.finalArray;
    var mealArray = finalArray[0];
		var timeArray = finalArray[1];
		var name = plan.name;
		var i;
		for(i = 0; i < mealArray.length; i++){
			var stmt = db.prepare("INSERT INTO plans (planid, userid, mealid, timeid, name) VALUES (?, ?, ?, ?, ?)");
			stmt.run(d, request.session.userid, mealArray[i], timeArray[i], name);
		}
});

app.post('/getmealsinplan', function(request, response) {
	 if (request.session.loggedin) {
			var meals = []
			db.each("SELECT * FROM (SELECT * FROM plans WHERE planid = (?)) P JOIN (SELECT * FROM meals WHERE userid = (?)) Q ON P.mealid = Q.mealid", [request.body.planid, request.session.userid], function(err, row){
					meals.push(row)
			}, function(){
					console.log(meals)
					response.send(JSON.stringify(meals))
			});
		  } else {
				response.redirect("/welcome");
			}
});

app.get('*', function(req, res){
  res.status(404).send('404 Error: Page Could Not Be Found');
});

http.createServer(app).listen(3000)
https.createServer(httpsOptions, app).listen(4000)

console.log("HTTP SERVER RUNNING AT: http://localhost:3000")
console.log("HTTPS SERVER RUNNING AT: https://localhost:4000")
