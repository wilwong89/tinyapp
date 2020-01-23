const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const path = require('path');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
let cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");
//app.set('views', path.join(__dirname, 'views'));

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", user_id: "abcdef"}, 
  "9sm5xK": {longURL: "http://www.google.com", user_id: "abcdef"}, 
  "A2xVn2": {longURL: "https://www.lighthousebrewing.com", user_id: "123456"}, 
  "Asm5xK": {longURL: "http://www.bing.com", user_id: "123456"}
};

const getUrlsByUserId = function (userId) {
  let resultObj = {};
  if (userId) {
    for (let key in urlDatabase) {
      console.log("getURL",urlDatabase[key].user_id, userId)
      if (urlDatabase[key].user_id === userId) {
        resultObj[key] = urlDatabase[key];
      }
    }
  }
  return resultObj;
}

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
  console.log("register", !!req.body.email, !!req.body.password)
  if (req.body && req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email)) {
      let newID = generateRandomString();
      let newUserObj = {
        id: newID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      }
      users[newID] = newUserObj;
      res.cookie('user_id',newID).redirect("urls");
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
      let templateVars = { urls: getUrlsByUserId(users[user].id), user: users[user] };

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
  if (users.hasOwnProperty(req.cookies['user_id'])) {
    urlDatabase[newKey] = {longURL:req.body.longURL, user_id: req.cookies['user_id']};
  } 
  res.send("ok");  // Respond with 'Ok' (we will replace this)
});

app.post("/urlEdit/:shortURL", (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].user_id) {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect("/urls");  // Respond with 'Ok' (we will replace this)
    return;
  }
  res.redirect("/login")
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: getUrlsByUserId(req.cookies['user_id']), user: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].user_id) {
    if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
      delete urlDatabase[req.params.shortURL];
    }
    let templateVars = { urls: getUrlsByUserId(req.cookies['user_id']), user: users[req.cookies['user_id']] };
    res.render("urls_index", templateVars); 
    return '';
  }
  res.redirect("/login")
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(getUrlsByUserId(req.cookies['user_id']));
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});