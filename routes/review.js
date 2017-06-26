var express    = require("express"),
    router     = express.Router({mergeParams: true}), //mergeParams merges the params from the product and the review so that we can find th ID
    Product    = require("../models/product"),
    Review     = require("../models/review"),
    bodyParser = require("body-parser");

    router.use(bodyParser.json());

//Review New
router.get("/", function(req, res){
  Product.findById(req.params.id, function(err, foundProduct){
    if(err){
      console.log(err);
    } else {
            //render show template with that product
            res.render("review", {product: foundProduct});
          }
        });
});

// Review Create
router.post("/", function(req, res){
    //Lookup product using ID
    Product.findById(req.params.id).populate('reviews').exec(function(err, foundProduct){

      console.log(foundProduct);
      if(err){
        console.log(err);
        res.redirect("/products");
      } else {
            // Create a new review
            Review.create(req.body, function(err, review){
              if(err){
                console.log(err);
              } else {
                    //add username and id to review
                    review.author.id = req.user._id; // the review.author.id comes from the reviewSchema
                    review.author.username = req.user.profile.name;
                    review.rating = Number(req.body.rating);
                    console.log(review);
                    //save review
                    review.save();
                    // Connect new review to product
                    foundProduct.reviews.push(review);
                    foundProduct.save();
                    // Redirect to products show page
                    // req.flash("success", "Successfully added review");
                    res.send({review: review, product: foundProduct});
                  }
                });
          }
        });
  });


// EDIT ROUTE
router.get("/:review_id/edit", function(req, res) {
  Review.findById(req.params.review_id, function(err, foundReview){
    if (err) {
      res.redirect("back");
    } else {
      res.send({review: foundReview});
    }
  });
});

//UPDATE ROUTE
router.put("/:review_id", function(req, res){
  Review.findById(req.params.review_id, function(err, foundReview){
    if (err) {
      res.redirect("back");
    } else {

      foundReview.text = req.body.text;
      foundReview.rating = Number(req.body.rating);
      foundReview.save();
      Product.findById(req.params.id).populate('reviews').exec(function(err, foundProduct) {
      res.send({foundReview: foundReview, product: foundProduct});
    });
    }

  });
});

// DESTROY ROUTE
router.delete("/:review_id", function(req, res){
  Review.findById(req.params.review_id, function (err, foundReview){
    console.log("REVIEW ID");
    console.log(req.params.review_id);
    if (err) {
      res.redirect("back");
    } else {

     foundReview.remove(function(err){
       if(err){
         console.log(err);
         res.redirect("/products");
       } else {
        Product.findById(req.params.id).populate('reviews').exec(function(err, foundProduct) {
          res.send({product: foundProduct});
        });
      }
    });
      }
      });
});



     module.exports = router;
