var express   = require("express"),
router        = express.Router(),
User          = require("../models/user"),
Cart          = require("../models/cart"),
async         = require("async"),
passport      = require("passport"),
passportConf  = require("../config/passport"),
cloudinary    = require("cloudinary"),
multer        = require("multer"),
upload        = multer ({dest: "../public/uploads/"});

// It will upload a file which is received in form-data from the client. Key for the file is 'photo1'.
//router.put('/me', cloudinaryUpload.fields([{name: 'cover', maxCount:1}]));

var bodyParser    = require("body-parser");


router.get("/signup", function(req, res){
  res.render("accounts/signup" , {errors: req.flash("errors")});
});


//CREATE ROUTE (creates new user)
router.post("/signup", upload.single('image'), function(req, res, next){

  async.waterfall([
    function(callback){
      var user = new User();

      user.profile.name = req.body.name;
      user.password = req.body.password;
      user.email = req.body.email;
      // user.profile.picture = user.gravatar();



      User.findOne({email: req.body.email}, function(err, existingUser){

        if (existingUser) {
          req.flash("errors", "An account with that email already exists");

          return res.redirect("/signup");
        } else {
          user.save(function(err, user){
            if (err) return next(err);
            callback(null, user);
          });
        }
      });
    },
    function(user){
      var cart = new Cart();
      cart.owner = user._id;
      cart.save(function(err){
        if (err) return next(err);
        req.logIn(user, function(err){
          if (err) return next(err);
          res.redirect("/profile");
        });
      });
    }
    ]);
});

//LOGIN
router.get("/login", function(req, res){
  if (req.user) return res.redirect("/");
  res.render("accounts/login", {message: req.flash("loginMessage")});
});

router.post("/login", passport.authenticate("local-login", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}));

router.get("/profile", passportConf.isAuthenticated, function(req, res, next){
  User
  .findOne({_id: req.user._id})
  .populate()
  .exec(function(err, foundUser){
    if (err) next(err);
    res.render("accounts/profile", {user: foundUser})
  });
});

//LOGOUT
router.get("/logout", function(req, res, next){
  req.logout();
  res.redirect("/");
});

// EDIT ROUTS
router.get("/profile/edit", function(req, res, next){
  res.render("accounts/edit-profile", {message: req.flash("success")});
});

router.post("/profile/edit", function(req, res, next){
  User.findOne({_id: req.user._id}, function(err, user){
    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    user.save(function(err){
      if (err) return next(err);
      req.flash("success", "Successfully edited your profile");
      return res.redirect("/profile/edit");
    });
  });
});

router.post("/upload", upload.any(), function(req, res, next){
  User.findOne({_id: req.user._id}, function(err, user){
    if (err) return next(err);
  console.log(req.files[0].path);
  cloudinary.uploader.upload(req.files[0].path,
   function(result) {
    user.profile.picture = result.url;
    user.save(function(err){
      if (err) return next(err);
      req.flash("success", "Successfully edited your profile");
      return res.redirect("/profile");
    });
  });

});
  });

//FACEBOOK
//send the user to facebook to get info
router.get("/auth/facebook", passport.authenticate("facebook", {scope: "email"}));

//after facebook authenticated the user we redirect the user
router.get("/auth/facebook/callback", passport.authenticate("facebook", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}));



module.exports = router;
