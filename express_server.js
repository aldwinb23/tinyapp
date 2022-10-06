
const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
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

// GET login
app.get("/urls/login", (req, res) => {
  res.render("urls_login");
})

// POST login
app.post("/login", (req, res) =>{
  const userName = req.body.username;
  res.cookie("user_id", users[id].email);  //res.cookie("username", userName);
  res.redirect("/urls");
})

// POST logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

// GET register
app.get("/register", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userId: req.cookies["user_id"]  //username: req.cookies["username"]
    };
  res.render("urls_register", templateVars);
})


// POST register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  console.log("id:", id);
  console.log("email:", email);
  console.log("password:", password);
  users[id] = { id, email, password };

  console.log("users[id]:", users[id]);
  console.log("users:", users);

  res.cookie("user_id", users[id].email);

  res.redirect("/urls");  
})

// Get Homepage/Index
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    userId: req.cookies["user_id"] //username: req.cookies["username"]
  }
  res.render("urls_index", templateVars);
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]
  res.redirect("/urls");  
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    userId: req.cookies["user_id"] // username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

// Route for creating short urls
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`urls/${id}`);  
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userId: req.cookies["user_id"]  // username: req.cookies["username"]
    };
  res.render("urls_show", templateVars);
});

// Route to edit url in index to show
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  res.redirect(`/urls/${id}`); 
})

// Route for editing existing short urls
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;

  res.redirect(`/urls`);
})


const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};  


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



