var mongoose   = require("mongoose"),
    bcrypt     = require("bcrypt-nodejs"),
    crypto     = require("crypto");


var UserSchema = new mongoose.Schema({
    email: {type: String, unique: true, lowercase: true},
    password: String,

    facebook: String,
    tokens: Array,

    profile: {
      name: {type: String, default: " "},
      picture: {type: String, default: " "}
    },

    address: String,
    history: [{
      paid: {type: Number, default: 0},
      item: {type: mongoose.Schema.Types.ObjectId, ref: "Product"}
    }]

});

//Hash the password before saving it to the DB

UserSchema.pre("save", function(next){
  var user = this;
  if (!user.isModified("password")){
    return next();
  }
  bcrypt.genSalt(10, function(err, salt){
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, function(err, hash){
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

// Compare the password in the DB and the password that user typed in

//Note: UserSchema.methods allows to set a method of our choice

UserSchema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password); // this refers to the password stored in the DB
}

UserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.email) return "https://gravatar.com/avatar/?s" + size + "&d=retro";
  var md5 = crypto.createHash("md5").update(this.email).digest("hex");
  return "https://gravatar.com/avatar/" + md5 + "?s=" + size + "&d=retro";
}



module.exports = mongoose.model("User", UserSchema);
