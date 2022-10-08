
const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {       //short id from long url
    longURL: "https://www.google.ca",
    userID: "aJ48lW",    // should match
  },
};


const users = {
  aJ48lW: {              //should match
    id: "aJ48lW",        // should match
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
  if (!req.cookies["user_id"]) {
    // res.send("test");
    const templateVars = { 
      urls: urlDatabase,
      userId: req.cookies["user_id"] //username: req.cookies["username"]
    }
    return res.render("urls_index", templateVars);
  }

  const id = req.cookies["user_id"];
  const url = urlsForUser(id);
  
  console.log("id:", id);
  console.log("url:", url);

  const templateVars = { 
    url: url,
    userId: req.cookies["user_id"] //username: req.cookies["username"]
  }

  // const templateVars = { 
  //   urls: urlDatabase,
  //   userId: req.cookies["user_id"] //username: req.cookies["username"]
  // }

  res.render("urls_index", templateVars);
});


// GET login //////////////////////////
app.get("/login", (req, res) => {
  const templateVars = {
    // id: req.params.id,
    // longURL: urlDatabase[req.params.id],
    // longURL: urlDatabase[req.params.id].longURL,
    userId: req.cookies["user_id"]  //username: req.cookies["username"]
  };
  
  if (templateVars.userId) {
    res.redirect("/urls");
  }
  
  res.render("urls_login", templateVars);
})

// POST login
app.post("/login", (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('Invalid email and/or password!');
  }
  
  const user = findUserByEmail(email);
  
  if (!user) {
    return res.status(403).send("Email not found!!");
  }
  
  if (user.password !== password) {
    return res.status(403).send("Wrong password!!");
  }
  
  const id = user.id

  res.cookie("user_id", id);
  
  res.redirect("/urls"); 
})


// GET logout ///////////////////////////////
// app.get("/logout", (req, res) => {
  //   res.clearCookie("user_id");
  //   const templateVars = { 
    //     urls: urlDatabase,
    //     userId: req.cookies["user_id"] //username: req.cookies["username"]
    //   }
    //   res.render("urls_index", templateVars);
    // })
    
// POST logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})


// GET register ///////////////////////
app.get("/register", (req, res) => {
  const templateVars = {
    // id: req.params.id,
    // longURL: urlDatabase[req.params.id],
    // longURL: urlDatabase[req.params.id].longURL,
    userId: req.cookies["user_id"]  //username: req.cookies["username"]
  };
  
  if (templateVars.userId) {
    res.redirect("/urls");
  }
  
  res.render("urls_register", templateVars);
})
    
// POST register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("Please fill in your email And password!");
  }
  
  const userFromDb = findUserByEmail(email);
  
  if (userFromDb) {
    return res.status(400).send("Email already in use!");
  }
  
  const id = generateRandomString();
  
  users[id] = { id, email, password };
  
  res.cookie("user_id", users[id].id);
  
  res.redirect("/urls");  
})


// Post Delete /////////////////////////
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies["user_id"];

  const templateVars = { 
    userId: req.cookies["user_id"] // username: req.cookies["username"]
  }
  
  if (!urlDatabase[id]) {
    return res.send("<strong>That URL does not exist!</strong>")
  }

  if (!userID) {
    return res.send("<strong>Please login!!</strong>");
  }

  const userURL = urlsForUser(userID);
  if (!userURL[id]) {
    return res.send("<strong>Not your URL to delete!</strong>");
  }

  delete urlDatabase[id]
  res.redirect("/urls");  
});

    
// Get New /////////////////////////////////
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    userId: req.cookies["user_id"] // username: req.cookies["username"]
  }
  
  if (!templateVars.userId) {
    res.redirect("/login");
  }
  
  res.render("urls_new", templateVars);
});


// POST for creating short urls  //////////////////
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  urlDatabase[id] = { longURL, userID }
  
  console.log("afudb:", urlDatabase);
  console.log("afuser:", users);
  
  const templateVars = { 
    userId: req.cookies["user_id"], // username: req.cookies["username"]
    id
  }
  if (!templateVars.userId) {
    return res.send("<strong>Please log in to shorten urls!</strong>");
  }
  res.redirect(`urls/${id}`);  
});


// POST to edit url in index to show  ////////////
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  res.redirect(`/urls/${id}`); 
})


// POST for editing existing short urls /////////////
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies["user_id"];

  if (!urlDatabase[id]) {
    return res.send("<strong>That URL does not exist!</strong>")
  }

  if (!req.cookies["user_id"]) {
    return res.send("<strong>Please login!!</strong>");
  }

  const userURL = urlsForUser(userID);
  if (!userURL[id]) {
    return res.send("<strong>Not your URL to delete!</strong>");
  }

  const newURL = req.body.longURL;
  
  urlDatabase[id].longURL = newURL;

  res.redirect(`/urls`);
})


// Get New Id ///////////////////////////
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  // const longURL = urlDatabase[id];
  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);
});


// Get New Id
app.get("/urls/:id", (req, res) => {
  // const id = req.params.id;
  const id = req.params.id;
  const userID = req.cookies["user_id"];

  // console.log("reqparamsid:", req.params.id);
  if (!urlDatabase[id]) {
    return res.send("<strong>That URL does not exist!</strong>")
  }

  if (!req.cookies["user_id"]) {
    return res.send("<strong>Please login!!</strong>");
  }

  const userURL = urlsForUser(userID);
  if (!userURL[id]) {
    return res.send("<strong>Not your URL to delete!</strong>");
  }

  const newURL = urlDatabase[id].longURL;
  // console.log("newURL:", newURL);
  // console.log("uDreqparams:", urlDatabase[req.params.id]);
  // console.log("udb:", urlDatabase);
  
  // urlDatabase[id] = newURL;

  const templateVars = {
    id: req.params.id,
    // longURL: urlDatabase[req.params.id],
    longURL: newURL,
    userId: req.cookies["user_id"]  // username: req.cookies["username"]
  };

  // console.log("templatevars:", templateVars);

  console.log("udbparams:", urlDatabase[req.params.id]);


  res.render("urls_show", templateVars);
});


// Helper Functions /////////////////////////////
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};  

const findUserByEmail = (email) => {
  for (const userEmail in users) {
    const userFromDb = users[userEmail];
    if (userFromDb.email === email) {
      return userFromDb;
    }
  }
  return null;
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
}



// Listen here port!!
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


