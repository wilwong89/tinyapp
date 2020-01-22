const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const path = require('path');
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "abcdef": {
    id: "abcdef",
    email: "wilwong89@gmail.com",
    password: "testing"
  },
  "123456": {
    id: "123456",
    email: "test01@gmail.com",
    password: "testing"
  }
}

const generateRandomString = function() {
  const length = 6;
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const defaultTemplate = {
  user: {
    email: "",
    id: ""
  }
}

// Given an email string, iterates through users object and returns the user
// Returns false if no email match
const getUserByEmail = function (inputEmail){
  for (let user in users) {
    if (user.email === inputEmail) {
      return user;
    }
  }
  return false;
}

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  // console.log(urlDatabase)
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  res.render("register", defaultTemplate);
});

app.post("/register", (req, res) => {
  console.log("register", !!req.body.email, !!req.body.password)
  if (req.body && req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email)) {
      let newID = generateRandomString();
      let newUserObj = {
        id: newID,
        email: req.body.email,
        password: req.body.password
      }
      users[newID] = newUserObj;
      res.cookie('user_id',newID).redirect("urls");
      return "";
    }
  }
  res.redirect(400, 'back')
  return "";
  
});



app.set("view engine", "ejs");
//app.set('views', path.join(__dirname, 'views'));

app.get("/login", (req, res) => {
  res.render("login", defaultTemplate);
});

app.post("/login", (req, res) => {
  for (let user in users) {
    if (users[user].email === req.body.email && users[user].password === req.body.password) {
      let templateVars = { urls: urlDatabase, user: users[user] };
      res.cookie('user_id', users[user].id).render("urls_index", templateVars);
      return "";
    }
  }
  res.status(403).render("login", defaultTemplate);
  return "";
  //   
});

app.get("/logout", (req, res) => {
  res.cookie('user_id',"").redirect("/login");  
});
app.post("/logout", (req, res) => {
  res.cookie('user_id',"").redirect("/login");  
});

app.post("/urls", (req, res) => {
  let newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  // console.log(req.body);  // Log the POST request body to the console
  res.send("ok");  // Respond with 'Ok' (we will replace this)
});

app.post("/urlEdit/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");  // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
  }
  let templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars); 
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});