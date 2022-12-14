
const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

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

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual( user.id , expectedUserID );
  });
  it("should return undefined if no email is found", function() {
    const user = findUserByEmail("abab@ab.com", testUsers)
    if (user === null) {
      return undefined;
    }
    const expectedUserID = "userRandomID";
    assert.strictEqual( user.id , undefined );
  })
});
