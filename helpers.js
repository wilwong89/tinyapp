const bcrypt = require("bcrypt");

// Given userId string, Url db object, returns an object with url object entries
const getUrlsByUserId = function(userId, urlDb) {
  let resultObj = {};
  if (userId) {
    for (let key in urlDb) {
      if (urlDb[key].userId === userId) {
        resultObj[key] = urlDb[key];
      }
    }
  }
  return resultObj;
};

// Returns 6 digit case sensitive alphanumeric string at random
const generateRandomString = function() {
  const length = 6;
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Given an email string, iterates through users object and returns the user
// Returns false if no email match
const getUserByEmail = function(inputEmail, users) {
  for (let user in users) {
    if (users[user].email === inputEmail) {
      return user;
    }
  }
  return undefined;
};

// Given userId string, url database, and users database,
// Returns an object to be inserted into ejs templates
const templateVarMaker = function(userId, urlDatabase, users) {
  return {
    urls: getUrlsByUserId(userId, urlDatabase),
    user: users[userId],
    errorMessage: ""
  };
};

//Given user email, pass, and user db, returns true if user exists
const isLoginValid = function(userEmail, userPass, users) {
  let result = "";

  for (let user in users) {
    if (
      users[user].email === userEmail &&
      bcrypt.compareSync(userPass, users[user].password)
    ) {
      result = users[user].id;
    }
  }
  return result;
};

const isRegistrationValid = function(body, users) {
  const failedToRegisterMessage = "Registration failed, account exists";
  const emptyUsernameOrPassMessage =
    "Cannot register with empty username or password";

  if (!body || !body.email || !body.password) {
    return emptyUsernameOrPassMessage;
  }

  if (getUserByEmail(body.email, users)) {
    return failedToRegisterMessage;
  }
};

const handleLogout = function(req, res) {
  res.clearCookie("session");
  res.clearCookie("session.user_id");
  res.clearCookie("session.visitor_id");
  res.clearCookie("session.sig");
  req.session = null;
  res.redirect("/login");
};

module.exports = {
  getUrlsByUserId,
  generateRandomString,
  getUserByEmail,
  templateVarMaker,
  isLoginValid,
  isRegistrationValid,
  handleLogout
};
