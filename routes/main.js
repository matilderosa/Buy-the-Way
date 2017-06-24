var express    = require("express"),
    router     = express.Router(),
    User       = require("../models/user"),
    Product    = require("../models/product"),
    Cart       = require("../models/cart"),
    stripe     = require("stripe")("sk_test_AkEXllEYYSEuiRKfDqqeacwR"),
    async      = require("async");





function paginate(req, res, next) {
   var perPage = 9;
    var page = req.params.page;

    Product
    .find()
    .skip(perPage * page) // if we're on page 2 we skip 18 docs
    .limit(perPage) //limits the number of documents per query
    .populate("category")
    .exec(function(err, products){
      if (err) return next(err);
      Product.count().exec(function(err, count){ //counts the products in the DB
        if (err) return next(err);
        res.render("main/product-main", {
          products: products,
          pages: count / perPage // divide total of items in DB by te items per page
        });
      });
    });
}


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
//=================================

//CART
router.get("/cart", function(req, res, next){
  Cart
  .findOne({owner: req.user._id})
  .populate("items.item")
  .exec(function(err, foundCart){
    if (err) return next(err);
    console.log(foundCart);
    res.render("main/cart", {foundCart: foundCart, message: req.flash("remove")});
  });
});



// Add product to cart rout
router.post("/product/:product_id", function(req, res, next){
  console.log(req.user._id);
  Cart.findOne({owner: req.user._id}, function(err, cart){
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });
    console.log("POST");
    console.log(cart);
    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save(function(err){
      if (err) return next(err);
      return res.redirect("/cart");
    });
  });
});

// Remove item from cart
router.post("/remove", function(req, res, next){
  Cart.findOne({owner: req.user._id}, function(err, foundCart){
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found){
      if (err) return next(err);
      req.flash("remove", "Successfully removed");
      res.redirect("/cart");
    })
  })
})

//Redirect the user to the search ALL
router.post("/search", function(req, res, next){
  res.redirect("/search/?q=" + req.body.q);
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
console.log(data);
        res.render("main/search-result", {
        query: req.query.q,
        data: data,
        category: "all"
      });
    });
  }
});




router.post("/search/:value/:id", function(req, res, next){
  res.redirect("/search/" + req.params.value + "/" + req.params.id + "?q=" + req.body.q);

});


router.get("/search/:value/:id", function(req, res, next){
  if (req.query.q){
    Product.search({
      query_string: {query: req.query.q}
    }, function(err, results){
      if (err) return next(err);
      var data = results.hits.hits.filter(function(hit){
        return hit._source.category == req.params.id
      });
      res.render("main/search-result", {
        query: req.query.q,
        data: data,
        category: req.params.value
      });
    });
  }

});


// HOME ROUTE
router.get("/", function(req, res, next) {
  Product
  .find()
  .populate("category")
  .exec(function(err, products){
      if (err) return next(err);
      Product.count().exec(function(err, count){
        if (err) return next(err);
        res.render("main/home", {products: products});
  });
  });
});

router.get("/products", function(req, res, next) {
paginate(req, res, next);

});

router.get("/page/:page", function(req, res, next){
  paginate(req, res, next);
});

// ABOUT ROUTE
router.get("/about", function(req, res) {
  res.render("main/about");
});

//Category
router.get("/products/:id", function(req, res, next){
  Product
  .find({category: req.params.id})
  .populate("category") // can only use populate if the data type is an object id
  .exec(function(err, products){
    if (err) return next(err);
    console.log(products);
    res.render("main/category", {products: products});
  });
});

// Product
router.get("/product/:id", function(req, res, next){
  Product.findById({_id: req.params.id}, function(err, product){
    if (err) return next(err);
    if (product.reviews.length === 0) {
      var avg = 0;
    } else {
    var sum = 0;
    product.reviews.forEach(function(review){
      sum += review.rating;
    });
    var avg = sum / product.reviews.length;
  }
    res.render("main/product", {product: product, avg: avg});
  });
});

//Payment route

router.post("/payment", function(req, res, next){
console.log(req.body);
  var stripeToken = req.body.stripeToken; //get the token from the client side
  var currentCharges = Math.round(req.body.stripeMoney * 100); // *100 stripe is in cents
  // method for the admin to see who bought the items

  stripe.customers.create({
    source: stripeToken
  }, function(err, customer) {
    if (err) return next(err);
    stripe.charges.create({
      amount: currentCharges,
      currency: "usd",
      customer: customer.id
    });
  }).then(function(charge){
    async.waterfall([
      function(callback){
        //find the cart for that owner
        Cart.findOne({owner: req.user._id}, function(err, cart){
          callback(err, cart); // pass the found cart to the next function
        });
      }, //search for the login user
      function(cart, callback){
        User.findOne({_id: req.user._id}, function(err, user){
          if (user) {
            //if the user exists loop the cart and copy the items cart to the history
            for (var i = 0; i < cart.items.length; i++){
              user.history.push({
                item: cart.items[i].item,
                paid: cart.items[i].price
              });
            }
            //save the user
            user.save(function(err, user){
              if (err) return next(err);
              callback(err, user);
            });
          }
        });
      }, function(user){
        //clean cart
        Cart.update({owner: user._id}, {$set: {items: [], total: 0}}, function(err, updated){ // $set is equivalent to cart.items = []
          if (updated) {
            res.redirect("/profile");
          }
        });
      }
      ]);
  });
});

module.exports = router;
