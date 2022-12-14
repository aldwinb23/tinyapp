
const express = require("express");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers.js');
const { urlDatabase, users } = require('./database.js');

app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'captainawesome',
  keys: ["arya stark"],
}));


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/////// GETS ///////

// Get Homepage/Index
app.get("/", (req,res) => {
  if (req.session.userid) {
    res.redirect("/urls")
  } else {
    res.redirect("/login");
  }
})

app.get("/urls", (req, res) => {
  if (!req.session.userid) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.userid]
    };
    return res.render("urls_index", templateVars);
  }

  const id = req.session.userid;
  const url = urlsForUser(id);

  const templateVars = {
    url: url,
    user: users[req.session.userid]
  };

  res.render("urls_index", templateVars);
});


// GET Login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userid]
    
  };

  console.log("users:", );
  
  if (templateVars.user) {
    return res.redirect("/urls");
  }
  
  res.render("urls_login", templateVars);
});


// GET Register
app.get("/register", (req, res) => {
  

  // console.log("userIdtop:", userId)

  const templateVars = {
    user: users[req.session.userid]
  };

  console.log("userIdbottom:", templateVars)
  
  if (templateVars.user) {
    return res.redirect("/urls");
  }
  
  res.render("urls_register", templateVars);
});
    
    
// Get New
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.userid]
  };
  
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  
  res.render("urls_new", templateVars);
});


// Get New Id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  
  if (!urlDatabase[id]) {
    return res.send("<strong>That URL does not exist!</strong>");
  }
 
  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);
});


// Get New Id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.userid;

  if (!urlDatabase[id]) {
    return res.send("<strong>That URL does not exist!</strong>");
  }

  if (!req.session.userid) {
    return res.send("<strong>Please login!!</strong>");
  }

  const userURL = urlsForUser(userID);
  if (!userURL[id]) {
    return res.send("<strong>Not your URL to delete!</strong>");
  }

  const newURL = urlDatabase[id].longURL;
  const templateVars = {
    id: req.params.id,
    longURL: newURL,
    user: users[req.session.userid]
  };

  res.render("urls_show", templateVars);
});


/////// POSTS ///////

// POST Login
app.post("/login", (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('Invalid email and/or password!');
  }
  
  const user = findUserByEmail(email, users);
  
  if (!user) {
    return res.status(403).send("Email not found!!");
  }
    
  const hashedPassword = bcrypt.compareSync(password, user.password);
  
  if (!hashedPassword) {
    return res.status(403).send("Wrong password!!");
  }

  const id = user.id;

  req.session.userid = id;
  
  res.redirect("/urls");
});

    
// POST logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


// POST Register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Please fill in your email And password!");
  }
  
  const userFromDb = findUserByEmail(email, users);
  
  if (userFromDb) {
    return res.status(400).send("Email already in use!");
  }
  
  const id = generateRandomString();
  
  users[id] = { id, email, password: hashedPassword };

  req.session.userid = users[id].id;
  
  res.redirect("/urls");
});


// Post Delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session.userid;
  
  if (!urlDatabase[id]) {
    return res.send("<strong>That URL does not exist!</strong>");
  }

  if (!userID) {
    return res.send("<strong>Please login!!</strong>");
  }

  const userURL = urlsForUser(userID);
  if (!userURL[id]) {
    return res.send("<strong>Not your URL to delete!</strong>");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});


// POST for creating short urls
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userid;
  urlDatabase[id] = { longURL, userID };
  
  const templateVars = {
    userId: req.session.userid,
    id
  };
  if (!templateVars.userId) {
    return res.send("<strong>Please log in to shorten urls!</strong>");
  }
  res.redirect(`urls/${id}`);
});


// POST to edit url in index to show
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});


// POST for editing existing short urls
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const userID = req.session.userid;

  if (!urlDatabase[id]) {
    return res.send("<strong>That URL does not exist!</strong>");
  }

  if (!req.session.userid) {
    return res.send("<strong>Please login!!</strong>");
  }

  const userURL = urlsForUser(userID);
  if (!userURL[id]) {
    return res.send("<strong>Not your URL to delete!</strong>");
  }

  const newURL = req.body.longURL;
  
  urlDatabase[id].longURL = newURL;

  res.redirect(`/urls`);
});


// Listen here port!!
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


