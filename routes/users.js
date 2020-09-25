var express = require("express");
var userModel = require("./../db/db");
var bcryptjs = require("bcryptjs");
var router = express.Router();
const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;


passport.use(userModel.createStrategy());

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
        country: '',
        firstName: profile.name.familyName,
        lastName: profile.name.givenName,
        username: profile.name.familyName + '@qq.com',
        email: profile.name.familyName + '@qq.com',
        password: '88888888',
        repassword: '',
        address: '',
        city: '',
        state: '',
        code: '',
        phone: '',
      })
      // us.save()
      userModel.register(us, '88888888', (err, user) => {
        console.log("保存的 user -> :", user);

        done()
      });
    }
  )
);


passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

var emailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
var phoneReg = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/;

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/reg", function (req, res, next) {
  var {
    country,
    firstName,
    lastName,
    email,
    password,
    repassword,
    address,
    city,
    state,
    code,
    phone,
  } = req.body;

  if (country === undefined) {
    return res.json({ code: 500, msg: "country of residence cannot be empty" });
  }
  if (firstName === undefined) {
    return res.json({ code: 500, msg: "firstName cannot be empty" });
  }
  if (lastName === undefined) {
    return res.json({ code: 500, msg: "lastName cannot be empty" });
  }
  if (email === undefined) {
    return res.json({ code: 500, msg: "email cannot be empty" });
  }
  if (!emailReg.test(email)) {
    return res.json({ code: 500, msg: "Incorrect email address format" });
  }
  if (password === undefined) {
    return res.json({ code: 500, msg: "password cannot be empty" });
  }
  if (password.length < 8) {
    return res.json({
      code: 500,
      msg: "the password must be at least 8 characters",
    });
  }
  if (password !== repassword) {
    return res.json({ code: 500, msg: "The two passwords are different" });
  }
  if (address === undefined) {
    return res.json({ code: 500, msg: "address cannot be empty" });
  }
  if (city === undefined) {
    return res.json({ code: 500, msg: "city cannot be empty" });
  }
  if (state === undefined) {
    return res.json({ code: 500, msg: "state cannot be empty" });
  }
  if (phone && !phoneReg.test(phone)) {
    return res.json({
      code: 500,
      msg: "Incorrect format of mobile phone number",
    });
  }

  var user = new userModel({
    country,
    firstName,
    lastName,
    username: email,
    email,
    password,
    repassword,
    address,
    city,
    state,
    code,
    phone,
  });

  userModel.register(user, password, (err, user) => {
    if (err) {
      return res.json({ code: 500, msg: err.message });
    } else {
      res.json({ code: 200, msg: "success" });
    }
  });
});

router.post("/login", function (req, res, next) {
  var { username, password, rememberPwd } = req.body;

  if (username === undefined) {
    return res.json({ code: 500, msg: "username cannot be empty" });
  }
  if (!emailReg.test(username)) {
    return res.json({ code: 500, msg: "Incorrect username address format" });
  }
  if (password === undefined) {
    return res.json({ code: 500, msg: "password cannot be empty" });
  }
  if (password.length < 8) {
    return res.json({
      code: 500,
      msg: "the password must be at least 8 characters",
    });
  }

  if (rememberPwd) {
    passport.authenticate("local")(req, res, () => {
      return res.json({ code: 200, msg: "success" });
    });
  } else {
    userModel.findByUsername(username, function (err, user) {
      if (err) {
        return res.json({
          code: 500,
          msg: "User does not exist, please register",
        });
      }

      if (bcryptjs.compareSync(password, user.password)) {
        //调用bcryptjs的compareSync方法，比较提交的密码和数据库查询结果密码，注意顺序
        req.session.userName = username;
        return res.json({ code: 200, data: user, msg: "success" });
      } else {
        return res.json({
          code: 500,
          msg: "The password is incorrect",
        });
      }
    });
  }
});

router.post("/upPwd", function (req, res, next) {
  var { username, password, repassword } = req.body;

  if (username === undefined) {
    return res.json({ code: 500, msg: "username cannot be empty" });
  }
  if (password === undefined) {
    return res.json({ code: 500, msg: "password cannot be empty" });
  }
  if (password.length < 8) {
    return res.json({
      code: 500,
      msg: "the password must be at least 8 characters",
    });
  }
  if (password !== repassword) {
    return res.json({ code: 500, msg: "The two passwords are different" });
  }

  var user = new userModel();

  userModel.findByUsername(username).then(
    function (sanitizedUser) {
      if (sanitizedUser) {
        sanitizedUser.setPassword("88888888", function () {
          sanitizedUser.save();
          userModel.update(
            { email: username },
            { $set: { password: "88888888" } },
            { multi: true },
            () => {
              return res.json({
                code: 200,
                msg: "password reset successful",
              });
            }
          );
        });
      } else {
        return res.json({
          code: 500,
          msg: "setPassword fail",
        });
      }
    },
    function (err) {
      console.error(err);
    }
  );

  //   user.setPassword(password, function (err) {
  //     if (err) {
  //       return res.json({
  //         code: 500,
  //         msg: "setPassword fail",
  //       });
  //     }

  //     user.changePassword(password, "88888888", function (err, user) {
  //       if (err) {
  //         console.log("err -> :", err);
  //         return res.json({
  //           code: 500,
  //           msg: "changePassword fail",
  //         });
  //       }

  //       user.authenticate("88888888", function (err, result) {
  //         if (err) {
  //           return res.json({
  //             code: 500,
  //             msg: "authenticate fail",
  //           });
  //         }
  //         console.log("result -> :", result);
  //       });
  //     });
  //   });

  //   user.setPassword(password, function (err) {
  //     if (err) {
  //       return res.json({
  //         code: 500,
  //         msg: "setPassword fail",
  //       });
  //     }

  //     user.save(function (err) {
  //       if (err) {
  //         console.log("err -> :", err);
  //         return res.json({
  //           code: 500,
  //           msg: "save fail",
  //         });
  //       }

  //       userModel.authenticate()(username, password, function (err, result) {
  //         if (err) {
  //           return res.json({
  //             code: 500,
  //             msg: "authenticate fail",
  //           });
  //         }

  //         return res.json({ code: 200, data: user, msg: "success" });
  //       });
  //     });
  //   });
});

module.exports = router;
