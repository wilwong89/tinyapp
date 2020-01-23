const getUrlsByUserId = function (userId, urlDb) {
  let resultObj = {};
  if (userId) {
    for (let key in urlDb) {
      if (urlDb[key].user_id === userId) {
        resultObj[key] = urlDb[key];
      }
    }
  }
  return resultObj;
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

// Given an email string, iterates through users object and returns the user
// Returns false if no email match
const getUserByEmail = function (inputEmail, users){
  for (let user in users) {
    if (users[user].email === inputEmail) {
      return user;
    }
  }
  return undefined;
}

module.exports = { getUrlsByUserId, generateRandomString, getUserByEmail };