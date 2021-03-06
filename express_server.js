const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const {
  getUrlsByUserId,
  generateRandomString,
  templateVarMaker,
  isLoginValid,
  isRegistrationValid,
  handleLogout
} = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    secret: "purple-monkey-dishwasher",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "abcdef" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "abcdef" },
  A2xVn2: { longURL: "https://www.lighthousebrewing.com", userId: "123456" },
  Asm5xK: { longURL: "http://www.bing.com", userId: "123456" }
};

const users = {
  abcdef: {
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
  },
  errorMessage: ""
};

app.get("/u/:shortURL", (req, res) => {
  // checks url database from shortened string
  // redirects to url list if invalid
  const longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  // if user is already logged in based off session id, redirects to their url list
  // otherwise sends them to registration page
  if (req.session.userId) {
    res.render(
      "urls_index",
      templateVarMaker(req.session.userId, urlDatabase, users)
    );
  } else {
    res.render("register", defaultTemplate);
  }
});

app.get("/login", (req, res) => {
  // if user is already logged in based off session id, redirects to their url list
  // otherwise sends them to login page
  if (req.session.userId) {
    res.render(
      "urls_index",
      templateVarMaker(req.session.userId, urlDatabase, users)
    );
  } else {
    res.render("login", defaultTemplate);
  }
});

app.get("/logout", (req, res) => {
  handleLogout(req, res);
});

app.get("/urls/new", (req, res) => {
  if (req.session.userId) {
    res.render(
      "urls_new",
      templateVarMaker(req.session.userId, urlDatabase, users)
    );
  } else {
    res.redirect(200, "/login");
  }
});

app.get("/urls", (req, res) => {
  // Shows users' urls based off session id
  // redirects to login if invalid session id
  if (req.session.userId) {
    res.render(
      "urls_index",
      templateVarMaker(req.session.userId, urlDatabase, users)
    );
  } else {
    res.redirect(200, "/login");
  }
});

app.get("/", (req, res) => {
  // Shows users' urls based off session id
  // redirects to login if invalid session id
  if (req.session.userId) {
    res.render(
      "urls_index",
      templateVarMaker(req.session.userId, urlDatabase, users)
    );
  } else {
    res.render("login", defaultTemplate);
  }
});

////////// POSTS ///////////

app.post("/register", (req, res) => {
  // registration route that takes in valid user info from body
  // registers into user list
  // failure returns template object to render error
  let error = isRegistrationValid(req.body, users);

  if (error) {
    res.render("register", {
      ...defaultTemplate,
      errorMessage: error
    });
  } else {
    let newID = generateRandomString();

    users[newID] = {
      id: newID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };

    req.session.userId = newID;
    res.redirect(200, "urls");
  }
});

app.post("/login", (req, res) => {
  // returns userId if valid login
  // other wise returns variables that update the page to show error
  let loginResult = isLoginValid(req.body.email, req.body.password, users);

  if (loginResult) {
    req.session.userId = loginResult;
    res.render(
      "urls_index",
      templateVarMaker(req.session.userId, urlDatabase, users)
    );
  } else {
    res.status(403).render("login", {
      ...defaultTemplate,
      errorMessage: "Incorrect email or password"
    });
  }
});

app.post("/logout", (req, res) => {
  handleLogout(req, res);
});

app.post("/urls", (req, res) => {
  let newKey = generateRandomString();
  if (Object.prototype.hasOwnProperty.call(users, req.session.userId)) {
    urlDatabase[newKey] = {
      longURL: req.body.longURL,
      userId: req.session.userId
    };
  }
  res.render(
    "urls_index",
    templateVarMaker(req.session.userId, urlDatabase, users)
  );
});

app.post("/urlEdit/:shortURL", (req, res) => {
  if (
    urlDatabase[req.params.shortURL] &&
    req.session.userId === urlDatabase[req.params.shortURL].userId
  ) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(200, "/urls");
  } else {
    res.redirect(200, "/login");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.shortURL].userId) {
    if (
      Object.prototype.hasOwnProperty.call(urlDatabase, req.params.shortURL)
    ) {
      delete urlDatabase[req.params.shortURL];
    }
    res.render(
      "urls_index",
      templateVarMaker(req.session.userId, urlDatabase, users)
    );
    return "";
  }
  res.redirect(401, "/login");
});

app.get("/urls/:shortURL", (req, res) => {
  if (
    req.session &&
    urlDatabase[req.params.shortURL] &&
    req.session.userId === urlDatabase[req.params.shortURL].userId
  ) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.userId]
    };
    res.render("urls_show", templateVars);
    return "";
  }
  if (req.session && req.session.userId) {
    res.redirect(
      200,
      "/urls"
      //templateVarMaker(req.session.userId, urlDatabase, users)
    );
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
