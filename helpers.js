
const findUserByEmail = (email, database) => {
  for (const userEmail in database) {
    const userFromDb = database[userEmail];
    if (userFromDb.email === email) {
      return userFromDb;
    }
  }
  return null;
};



module.exports = { findUserByEmail };
