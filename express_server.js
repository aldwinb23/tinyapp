
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

// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW",
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW",
//   },
// };


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

// Get Homepage/Index //////////////////
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    userId: req.cookies["user_id"] //username: req.cookies["username"]
  }
  res.render("urls_index", templateVars);
});


// GET login //////////////////////////
app.get("/login", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
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
  
  res.cookie("user_id", email);
  
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
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
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
  
  res.cookie("user_id", users[id].email);
  
  res.redirect("/urls");  
})


// Post Delete /////////////////////////
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
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
  const templateVars = { 
    userId: req.cookies["user_id"] // username: req.cookies["username"]
  }

  if (!templateVars.userId) {
    res.send("Please log in to shorten urls!");
  }

  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;

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
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;

  res.redirect(`/urls`);
})


// Get New Id ///////////////////////////
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  console.log("id:", id);

  res.redirect(longURL);
});

// Get New Id
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userId: req.cookies["user_id"]  // username: req.cookies["username"]
  };

  if (!urlDatabase[req.params.id]) {
    return res.send("<strong>That URL does not exist!</strong>")
  }

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

// Listen here port!!
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



