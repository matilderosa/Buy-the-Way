var passport          = require("passport"),
Localstrategy     = require("passport-local").Strategy,
FacebookStrategy  = require("passport-facebook").Strategy,
secret            = require("../config/secret"),
User              = require("../models/user");

var async = require("async");
var Cart = require("../models/cart");


//serialize and deserialize
passport.serializeUser(function(user, done){
  done(null, user._id);
});
//serialization is the process of transforming information in a form
//so as to be stored. We want to translate User so tha it can be store in
//Mongodb. The user._id is saved in the session and is used to retrieve the object
//via deserialize function



passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});
//the deserialize function receives as fisrt argument the id that
//was used in the serialized function


//middleware
passport.use("local-login", new Localstrategy({
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true
}, function(req, email, password, done) {
  User.findOne({email: email}, function(err, user){
    if (err) return done(err); //generic error

    if (!user) { //doesn't find user
      return done(null, false, req.flash("loginMessage", "No user has been found"));
  }
    if (!user.comparePassword(password)) { //compares the password the user typed in with the one in the DB
      return done(null, false, req.flash("loginMessage", "Oops! Wrong password"));
    }
    return done(null, user);
  });
}));
//local-login is the name we give to the middleware
//by default LocalStrategy uses username and password but we can override it
//In the anonymous function we want to find in the DB the specific
//email that we passed



passport.use(new FacebookStrategy(secret.facebook, function(token, refreshToken, profile, done){
  User.findOne({facebook: profile.id}, function(err, user){
    if (err) return next(err);

    if (user) {
      return done(null, user);
    } else {
      async.waterfall([
        function(callback){
          var newUser = new User();
          console.log(profile);
          newUser.email = profile._json.email;
          newUser.tokens.push({kind: "facebook", token: token});
          newUser.profile.name = profile.displayName;
          newUser.profile.picture = "http://graph.facebook.com/" + profile.id + "/picture?type=large";

          newUser.save(function(err){
            if (err) throw err;

            callback(err, newUser);
          });

        },

        function(newUser){
          var cart = new Cart();
          cart.owner = newUser._id;
          cart.save(function(err){
            if (err) return done(err);
            return done(err, newUser)
          });
        }


        ]);
    }
  });
}));



//custom function to validate
exports.isAuthenticated = function(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}


