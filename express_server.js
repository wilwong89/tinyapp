const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const path = require('path');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
let cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  secret: "purple-monkey-dishwasher",

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", user_id: "abcdef"}, 
  "9sm5xK": {longURL: "http://www.google.com", user_id: "abcdef"}, 
  "A2xVn2": {longURL: "https://www.lighthousebrewing.com", user_id: "123456"}, 
  "Asm5xK": {longURL: "http://www.bing.com", user_id: "123456"}
};

const { getUrlsByUserId, generateRandomString, getUserByEmail } = require("./helpers");

const users = {
  "abcdef": {
    id: "abcdef",
    email: "wilwong89@gmail.com",
    password: bcrypt.hashSync("testing", 10)
  },
  "123456": {
    id: "123456",
    email: "test01@gmail.com",
    password: bcrypt.hashSync("testing", 10)
  }
}


const defaultTemplate = {
  user: {
    email: "",
    id: ""
  }
}

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(urlDatabase)
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls", defaultTemplate);
  }
});

app.get("/register", (req, res) => {
  res.render("register", defaultTemplate);
});

app.post("/register", (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, urlDatabase)) {
      let newID = generateRandomString();
      let newUserObj = {
        id: newID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      }
      users[newID] = newUserObj;
      req.session.user_id = newID;
      res.redirect("urls");
      return "";
    }
  }
  res.redirect(400, 'back')
  return "";
  
});

app.get("/login", (req, res) => {
  res.render("login", defaultTemplate);
});

app.post("/login", (req, res) => {
  for (let user in users) {
    if (
      users[user].email === req.body.email 
      && (bcrypt.compareSync(req.body.password, users[user].password))
    ) {
      let templateVars = { urls: getUrlsByUserId(users[user].id, urlDatabase), user: users[user] };
      req.session.user_id = users[user].id;
      res.render("urls_index", templateVars);
      return "";
    }
  }
  res.status(403).render("login", defaultTemplate);
  return "";
  //   
});

app.get("/logout", (req, res) => {
  req.session.user_id = "";
  res.redirect("/login");  
});
app.post("/logout", (req, res) => {
  req.session.user_id = "";
  res.redirect("/login");  
});

app.post("/urls", (req, res) => {
  let newKey = generateRandomString();
  if (users.hasOwnProperty(req.session.user_id)) {
    urlDatabase[newKey] = {longURL:req.body.longURL, user_id: req.session.user_id};
  }
  let templateVars = { urls: getUrlsByUserId(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.redirect("/urls", templateVars);  // Respond with 'Ok' (we will replace this)
});

app.post("/urlEdit/:shortURL", (req, res) => {
  console.log("edit", req.session.user_id, urlDatabase[req.params.shortURL].user_id)
  if (req.session.user_id === urlDatabase[req.params.shortURL].user_id) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");  // Respond with 'Ok' (we will replace this)
    return;
  }
  res.redirect("/login")
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: getUrlsByUserId(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].user_id) {
    if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
      delete urlDatabase[req.params.shortURL];
    }
    let templateVars = { urls: getUrlsByUserId(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
    res.render("urls_index", templateVars); 
    return '';
  }
  res.redirect("/login")
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(getUrlsByUserId(req.session.user_id, urlDatabase));
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});