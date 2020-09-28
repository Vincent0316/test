const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");

const mongoose = require("mongoose");
const passport = require("passport");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("425773347497-athni9dhsp3259tllu4as507gkhp89a0.apps.googleusercontent.com");
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    secret: "123456",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 120000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Connect mongoose
mongoose.connect(
  "mongodb+srv://dbUser:dbUserPassword@cluster0.3rs87.mongodb.net/mongoname?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err) {
    if (err) {
      console.log(
        "Could not connect to mongodb on localhost. Ensure that you have mongodb running on localhost and mongodb accepts connections on standard ports!"
      );
    }
  }
);
mongoose.set("useCreateIndex", true);

app.get("/dashboard", (req, res) => {
  console.log("req.isAuthenticated() -> :", req.isAuthenticated());
  if (req.isAuthenticated() || req.session.userName) {
    res.sendFile(__dirname + "/public/dashboard.html");
  } else {
    res.redirect("/login");
  }
});
app.get("/reg", (req, res) => {
  res.sendFile(__dirname + "/public/reg.html");
});
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});
app.get("/forget", (req, res) => {
  res.sendFile(__dirname + "/public/forget.html");
});

app.get("/logout", function(req, res) {
  req.session.userName = null; // 删除session
  req.logout();
  res.redirect("/login");
});

app.post('/google', function(req, res) {
  async function verify () {
    const ticket = await client.verifyIdToken({
      idToken: req.body.id_token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }
  verify()
  .then(()=>{
    res.json();
  })
  .catch(console.error);
})
app.use("/index", require("./routes/index"));
app.use("/users", require("./routes/users"));

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port: 3000`);
});
