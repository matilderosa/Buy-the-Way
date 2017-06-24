var express    = require("express"),
    router     = express.Router(),
    Product    = require("../models/product"),
    Category   = require("../models/category")
    async      = require("async");



//Connect elastic search and Product database
    Product.createMapping(function(err, mapping){
      if (err){
        console.log("error creating mapping");
        console.log(err);
      } else {
        console.log("Mapping created");
        console.log(mapping);
      }
    });

var stream = Product.synchronize();
var count = 0;

stream.on("data", function(){
  count++

});

stream.on("close", function(){
  console.log("Indexed " + count + " documents");
});

stream.on("error", function(err){
console.log(err);

});

//Redirect the user to the search ALL
router.post("/search", function(req, res, next){
  res.redirect("/search?q=" + req.body.q);

});


router.get("/search", function(req, res, next){
  if (req.query.q){
    Product.search({
      query_string: {query: req.query.q}
    }, function(err, results){
      if (err) return next(err);
      var data = results.hits.hits.map(function(hit){
        return hit;
      });
      res.render("main/search-result", {
        query: req.query.q,
        data: data
      });
    });
  }

});


