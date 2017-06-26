var express       = require("express"),
    app           = express(),
    morgan        = require("morgan"),
    mongoose      = require("mongoose"),
    bodyParser    = require("body-parser"),
    ejs           = require("ejs"),
    ejsMate       = require("ejs-mate"),
    session       = require("express-session"),
    cookieParser  = require("cookie-parser"),
    flash         = require("express-flash"),
    MongoStore    = require("connect-mongo/es5")(session), //stores sessions on the server side
    passport      = require("passport"),
    cloudinary    = require("cloudinary"),
    secret        = require("./config/secret");


// Require Schemas
var User          = require("./models/user"),
    Category      = require("./models/category"),
    Product       = require("./models/product"),
    Cart          = require("./models/cart"),
    Review        = require("./models/review");

var cartLength    = require("./middleware/middleware");



mongoose.connect(secret.database, function(err){
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

cloudinary.config({
  cloud_name: secret.cloudinaryName,
  api_key: '468163595992795',
  api_secret: secret.cloudinarySecreyApi
});

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore( {url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());//accesses the middleware to alter the req object and change
//the user value that is currently the session id from the client cookie into the true
//deserialized user object
app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
});

app.use(cartLength);

app.use(function(req, res, next){
  Category.find({}, function(err, categories){
    if (err) return next(err);
    res.locals.categories = categories;
    next();
  });
});



app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

//app.get("/*")

// Requiring Routes
var mainRoutes   = require("./routes/main"),
    userRoutes   = require("./routes/user"),
    adminRoutes  = require("./routes/admin"),
    reviewRoutes = require("./routes/review"),
    apiRoutes    = require("./api/api");

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use("/api", apiRoutes),
app.use("/products/:id/reviews", reviewRoutes);

app.use(function(req, res, next){
   res.locals.errors = req.flash("errors");
   res.locals.success = req.flash("success");
   next();
});



app.listen(secret.port, function(){
    console.log("server has started");
});
