//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});


// Login routes
app.route("/login")

  .get(function(req, res) {
    res.render("login");
  })

  .post(function(req, res) {
    User.findOne({
      email: req.body.username
      // password: req.body.password // This filter combination only works for unencrypted string
    }, function(err, foundUser) {
      if (foundUser) {
        if (foundUser.password === req.body.password) {
          res.render("secrets");
        } else {
          res.send("Password doesn't match user");
        }
      } else {
        // If error is not a "null" (as in no object to return)
        if (err) {
          res.send(err + " - Either username ('" + req.body.username + "') or password are incorrect");
        } else {
          res.send("Either username ('" + req.body.username + "') or password are incorrect");
        }
      }
    });
  });


// Register routes
app.route("/register")

  .get(function(req, res) {
    res.render("register");
  })

  .post(function(req, res) {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });

    newUser.save(function(err) {
      if (err) {
        res.send(err);
      } else {
        console.log("Saved '" + req.body.username + "' as a new user");
        res.render("secrets");
      }
    });
  });



app.listen(2210, function() {
  console.log("Server started on port 2210");
});
