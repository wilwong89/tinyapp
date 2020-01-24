const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require('cookie-session');
const { getUrlsByUserId, generateRandomString, getUserByEmail, templateVarMaker } = require("./helpers");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  secret: "purple-monkey-dishwasher",

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "abcdef"},
  "9sm5xK": {longURL: "http://www.google.com", userId: "abcdef"},
  "A2xVn2": {longURL: "https://www.lighthousebrewing.com", userId: "123456"},
  "Asm5xK": {longURL: "http://www.bing.com", userId: "123456"}
};

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
};

// Default object for users no logged in
const defaultTemplate = {
  user: {
    email: "",
    id: ""
  }
};

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
      };
      users[newID] = newUserObj;
      req.session.userId = newID;
      res.redirect("urls");
      return "";
    }
  }
  res.redirect(400, 'back');
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
      req.session.userId = users[user].id;
      res.render("urls_index", templateVars);
      return "";
    }
  }
  res.status(403).render("login", defaultTemplate);
  return "";
  //
});

app.get("/logout", (req, res) => {
  req.session.userId = "";
  res.redirect("/login");
});
app.post("/logout", (req, res) => {
  req.session.userId = "";
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  let newKey = generateRandomString();
  if (Object.prototype.hasOwnProperty.call(users, req.session.userId)) {
    urlDatabase[newKey] = {longURL:req.body.longURL, userId: req.session.userId};
  }
  res.render("urls_index", templateVarMaker(req.session.userId, urlDatabase, users));
});

app.post("/urlEdit/:shortURL", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.shortURL].userId) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");
});

app.get("/urls/new", (req, res) => {
  if (req.session.userId) {
    let templateVars = { user: users[req.session.userId] };
    res.render("urls_new", templateVars);
  } else {
    res.render("login", defaultTemplate);
  }
});

app.get("/urls", (req, res) => {
  if (req.session.userId) {
    res.render("urls_index", templateVarMaker(req.session.userId, urlDatabase, users));
  } else {
    res.render("login", defaultTemplate);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.shortURL].userId) {
    if (Object.prototype.hasOwnProperty.call(urlDatabase, req.params.shortURL)) {
      delete urlDatabase[req.params.shortURL];
    }
    res.render("urls_index", templateVarMaker(req.session.userId, urlDatabase, users));
    return '';
  }
  res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userId] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(getUrlsByUserId(req.session.userId, urlDatabase));
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});