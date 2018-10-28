var express = require("express")
var router = express.Router()
var mongo = require("mongodb")

var isAuthenticated = function(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) return next()
  // if the user is not authenticated then redirect him to the login page
  res.redirect("/")
}

module.exports = function(passport, db) {
  /* GET login page. */
  router.get("/", function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("index", { message: req.flash("message") })
  })

  /* Handle Login POST */
  router.post(
    "/login",
    passport.authenticate("login", {
      failureRedirect: "/",
      failureFlash: true
    }),
    function(req, res) {
      if (req.user.username === "admin") {
        return res.redirect("/admin")
      }
      return res.redirect("/home")
    }
  )
  /*GET login page*/
  router.get("/login", function(req, res) {
    res.render("login", { message: req.flash("message") })
  })

  /*GET admin panel */
  router.get("/admin", function(req, res) {
    db.collection("users")
      .find({})
      .toArray(function(err, users) {
        res.render("admin", { users: users })
      })
  })

  /*GET edit panel */
  router.get("/edit", function(req, res) {
    db.collection("users").findOne(
      { _id: new mongo.ObjectId(req.query.id) },
      function(err, user) {
        console.log(user)
        res.render("edit", { user: user })
      }
    )
  })

  /*GET update page */
  router.post("/update", function(req, res) {
    db.collection("users").updateOne(
      { _id: new mongo.ObjectId(req.body.id) },
      {
        $set: {
          email: req.body.email,
          firstName: req.body.firstName,
          lastName: req.body.lastName
        }
      },
      function(err, user) {
        db.collection("users")
          .find({})
          .toArray(function(err, users) {
            res.render("admin", { users: users })
          })
      }
    )
  })

  /* GET Registration Page */
  router.get("/signup", function(req, res) {
    res.render("register", { message: req.flash("message") })
  })

  /* Handle Registration POST */
  router.post(
    "/signup",
    passport.authenticate("signup", {
      successRedirect: "/home",
      failureRedirect: "/signup",
      failureFlash: true
    })
  )

  /* GET Home Page */
  router.get("/home", isAuthenticated, function(req, res) {
    res.render("home", { user: req.user })
  })

  /* Handle Logout */
  router.get("/signout", function(req, res) {
    req.logout()
    res.redirect("/")
  })

  return router
}
