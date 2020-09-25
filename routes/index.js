var express = require("express");
var router = express.Router();

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var userModel = require("./../db/db");

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());


passport.use(
  new GoogleStrategy(
    {
      clientID:
        "425773347497-athni9dhsp3259tllu4as507gkhp89a0.apps.googleusercontent.com",
      clientSecret: "9KwAOXMZgUprUH6gzNnoPMia",
      //   callbackURL: "http://127.0.0.1:3000/index/googleCallback",
      callbackURL:
        "https://young-refuge-40202.herokuapp.com/index/googleCallback",
      proxy: true,
    },
    function (accessToken, refreshToken, profile, done) {
      console.log("done -> :", done);
      console.log("profile -> :", profile);
      console.log("refreshToken -> :", refreshToken);
      console.log("accessToken -> :", accessToken);
      //   在这里保存数据
      var us = new userModel({
        country:'',
        firstName:profile.name.familyName,
        lastName:profile.name.givenName,
        username: profile.name.familyName,
        email:'gugedenglu@qq.com',
        password:profile.name.familyName,
        repassword:'',
        address:'',
        city:'',
        state:'',
        code:'',
        phone:'',
      })
      // us.save()
      userModel.register(us, profile.name.familyName, (err, user) => {
        console.log("保存的 user -> :", user);

        done()
      });
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
  // passport.authenticate("c", {
  //   failureRedirect: "/login",
  //   successRedirect: '/dashboard'
  // }),
  (req, res) => {

    passport.authenticate("google")(req, res, () => {
      res.redirect('/dashboard');
      // return res.json({ code: 200, msg: "success" });
    });

    res.redirect('/dashboard');
  }
);

module.exports = router;
