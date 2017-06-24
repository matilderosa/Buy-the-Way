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
    Product.findById(req.params.id, function(err, foundProduct){
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
                    review.author.username = req.user.username;
                    //save review
                    review.save();
                    // Connect new review to product
                    foundProduct.reviews.push(review);
                    foundProduct.save();
                    // Redirect to products show page
                    // req.flash("success", "Successfully added review");
                    res.send({review: review});
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
          foundReview.text = req.body.newReview;
          foundReview.save();
          res.send({foundReview: foundReview});
        }

    });
});

// DESTROY ROUTE
router.delete("/:review_id", function(req, res){
Review.findByIdAndRemove(req.params.review_id, function (err){
        if (err) {
            res.redirect("back");
        } else {
            res.send("Successfully deleted");
        }
    });
});



module.exports = router;
