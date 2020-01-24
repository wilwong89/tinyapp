const { assert } = require('chai');

const { getUrlsByUserId, generateRandomString, getUserByEmail, templateVarMaker } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userId: "userRandomID"},
  "A2xVn2": {longURL: "https://www.lighthousebrewing.com", userId: "userRandomID"},
  "Asm5xK": {longURL: "http://www.bing.com", userId: "user2RandomID"}
};

describe('Helper function tests', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined with invalid email', function() {
    const user = getUserByEmail("notexist@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

  it('should return new strings', function() {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    const string3 = generateRandomString();
    const string4 = generateRandomString();

    assert.notEqual(string1, string2);
    assert.notEqual(string3, string4);
  });

  it('should return the correct url object for a given id string', function() {
    const urlEntry = getUrlsByUserId("user2RandomID", urlDatabase);
    const expectedOutput = "http://www.bing.com";
    const urlKeys = Object.keys(urlEntry);
    assert.equal(urlEntry[urlKeys[0]].longURL, expectedOutput);
  });

  it('should return a proper template object given parameters', function() {
    const templateVars = templateVarMaker("userRandomID", urlDatabase, testUsers);
    const expectedOutput = {
      urls: {
        'b2xVn2': {
          longURL: 'http://www.lighthouselabs.ca',
          userId: 'userRandomID'
        },
        '9sm5xK': {
          longURL: 'http://www.google.com',
          userId: 'userRandomID'
        },
        'A2xVn2': {
          longURL: 'https://www.lighthousebrewing.com',
          userId: 'userRandomID'
        }
      },
      user: {
        id: 'userRandomID',
        email: 'user@example.com',
        password: 'purple-monkey-dinosaur'
      }
    };
    assert.deepEqual(templateVars, expectedOutput);
  });

  it('should return proper empty values for affected params passed incorrect info', function() {
    const templateVars = templateVarMaker("", urlDatabase, testUsers);
    const expectedOutput = {
      urls: {},
      user: undefined
    };
    assert.deepEqual(templateVars, expectedOutput);
  });
});