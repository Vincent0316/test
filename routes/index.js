var express = require("express");
var router = express.Router();

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "425773347497-athni9dhsp3259tllu4as507gkhp89a0.apps.googleusercontent.com",
      clientSecret: "9KwAOXMZgUprUH6gzNnoPMia",
      //   callbackURL: "http://127.0.0.1:3000/index/googleCallback",
      callbackURL:
        "https://desolate-beach-55628.herokuapp.com/index/googleCallback",

      proxy: true,
    },
    function (accessToken, refreshToken, profile, done) {
      console.log("done -> :", done);
      console.log("profile -> :", profile);
      console.log("refreshToken -> :", refreshToken);
      console.log("accessToken -> :", accessToken);
      //   在这里保存数据
    }
  )
);

router.get(
  "/googleLogin",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login"],
  })
);

router.get(
  "/googleCallback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failWithError: true,
  }),
  function (req, res) {
    res.redirect("/");
  }
);

module.exports = router;
