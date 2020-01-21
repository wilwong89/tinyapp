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

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  // console.log(urlDatabase)
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls");
  }
});

app.set("view engine", "ejs");
//app.set('views', path.join(__dirname, 'views'));

app.post("/login", (req, res) => {
  console.log(req.body.username)
  res.cookie('username',req.body.username).redirect("/urls");  
});
app.get("/logout", (req, res) => {
  console.log(req.body.username)
  res.cookie('username',"").redirect("/urls");  
});
app.post("/logout", (req, res) => {
  console.log(req.body.username)
  res.cookie('username',"").redirect("/urls");  
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
  let templateVars = { username: "test" };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
  }
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] }//username: res.cookie['username'] };
  res.render("urls_index", templateVars); 
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    username: req.cookies["username"]  };
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