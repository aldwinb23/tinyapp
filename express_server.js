
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { findUserByEmail } = require('./helpers.js');

app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'captainawesome',
  keys: ["arya stark"],
}));


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// Get Homepage/Index //////////////////
app.get("/urls", (req, res) => {
  if (!req.session.userid) {
    const templateVars = {
      urls: urlDatabase,
      userId: req.session.userid
    };
    return res.render("urls_index", templateVars);
  }

  const id = req.session.userid;
  const url = urlsForUser(id);

  const templateVars = {
    url: url,
    userId: req.session.userid
  };

  res.render("urls_index", templateVars);
});


// GET login //////////////////////////
app.get("/login", (req, res) => {
  const templateVars = {
    userId: req.session.userid
  };
  
  if (templateVars.userId) {
    return res.redirect("/urls");
  }
  
  res.render("urls_login", templateVars);
});

// POST login
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


// GET register ///////////////////////
app.get("/register", (req, res) => {
  const templateVars = {
    userId: req.session.userid
  };
  
  if (templateVars.userId) {
    return res.redirect("/urls");
  }
  
  res.render("urls_register", templateVars);
});
    
// POST register
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


// Post Delete /////////////////////////
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

    
// Get New /////////////////////////////////
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userId: req.session.userid
  };
  
  if (!templateVars.userId) {
    return res.redirect("/login");
  }
  
  res.render("urls_new", templateVars);
});


// POST for creating short urls  //////////////////
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


// POST to edit url in index to show  ////////////
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});


// POST for editing existing short urls /////////////
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


// Get New Id ///////////////////////////
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
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
    userId: req.session.userid
  };

  res.render("urls_show", templateVars);
});



// Helper Functions /////////////////////////////
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


// Listen here port!!
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


