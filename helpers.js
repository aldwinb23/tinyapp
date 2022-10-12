
const { urlDatabase, users } = require('./database.js');


const findUserByEmail = (email, database) => {
  for (const userEmail in database) {
    const userFromDb = database[userEmail];
    if (userFromDb.email === email) {
      return userFromDb;
    }
  }
  return null;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

const urlsForUser = (id) => {
  const urls = {};
  const keys = Object.keys(urlDatabase);

  for (let key of keys) {
    const url = urlDatabase[key];
    if (url.userID === id) {
      urls[key] = url;
    }
  }
  return urls;
};

module.exports = { findUserByEmail, generateRandomString, urlsForUser };
