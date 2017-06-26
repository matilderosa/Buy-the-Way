$(function(){

  //GET
  $(".reviews").on("click", ".edit-button", function(){
    var btn = this.getAttribute("id");
    var split = btn.split("edit");
    var reviewId = split[1];
    var productId = $("#product-id")[0].getAttribute("value");


    $.ajax({
      url: "/products/" + productId + "/reviews/" + reviewId + "/edit",
      contentType: "application/json",
      success: function(response){
        var pId = $("#pbody" + reviewId);

        pId.html("");
        pId.append('\
          <input type = "text" class = "name form-control" id = "update-input' + reviewId + '"  value = "' + response.review.text + '" required>\
          <p>Rate from 1 to 5</p>\
          <input class = "form-control" type="number" min="1" max="5" id = "update-rating' + reviewId + '" name = "review[rating]" value = "' + response.review.rating + '" required>\
          <button class = "btn btn-xs btn-primary update-button" id = "update' + reviewId + '">Update</button>\
          ');
      }
    });
  });

//CREATE/POST
$("#create-form").on("submit", function(event){
  event.preventDefault();
  var productId = $("#product-id")[0].getAttribute("value");

  var createInput = $("#create-input");
  var createRating = $("#create-rating");
  var createRatingNumber = Number(createRating.val());
  var well = $(".reviews");
  var colorStar = '<span>';
  var emptyStar = '<span>';
  var avgRating = $(".rating");
  var avgEmptyStar = '<span class = "emptyStar">';
  var avgColorStar = '<span class = "colorStar">';

  $.ajax({
    url: "/products/" + productId + "/reviews",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({text: createInput.val(), rating: createRating.val()}),
    success: function(response){

      createInput.val("");
      createRating.val("");
//USER REVIEW RATING
if (createRatingNumber >= 1) {
  for (var i = 0; i < createRatingNumber; i++) {
   colorStar +='<i class="fa fa-star" style="color: #ffb400"></i>';
 }
 colorStar += '</span>';
}
for (var i = 0; i < (5 - createRatingNumber); i++) {
 emptyStar +='<i class="fa fa-star"></i>';
}
emptyStar += '</span>';

      // AVERAGE RATING
      if (response.product.reviews.length === 0) {

        var avg = 0;
      } else {
        var sum = 0;
        response.product.reviews.forEach(function(review){
          sum += review.rating;
        });
        var avg = Math.round(sum / response.product.reviews.length);
      }
      for (var i = 0; i < avg; i++) {
        avgColorStar += '<i class="fa fa-star" style="color: #ffb400"></i>';
      }
      avgColorStar += '</span>';

      for (var i = 0; i < (5 - avg) ; i++) {
        avgEmptyStar += '<i class="fa fa-star"></i>';

      }
      avgEmptyStar += '</span>';

      well.append('\
        <div class = "row" id = "row' + response.review._id +'">\
        <div class = "col-md-12">\
        ' + colorStar + emptyStar + ' \
        <strong>' + response.review.author.username + '</strong>\
        <span class = "pull-right">' + response.review.createdAt + '</span>\
        <p id = "pbody' + response.review._id +'">\
        ' + response.review.text +'\
        </p>\
        <input type="hidden" name = "product-id" value = "' + productId + '" id = "' + productId + '">\
        <button class = "btn btn-xs btn-warning edit-button" id = "edit' + response.review._id + '">Edit</button>\
        <button class = "btn btn-xs btn-danger delete-button" id = "delete' + response.review._id + '">Delete</button>\
        </div>\
        </div>\
        ');

      avgRating.empty();
      avgRating.append(avgColorStar + avgEmptyStar);
    },
    error: function(response){
      console.log(response.responseText);
    },
  });
});


//PUT/UPDATE
$(".reviews").on("click", ".update-button", function(){
  var btn = this.getAttribute("id");
  var split = btn.split("update");
  var reviewId = split[1];
  var productId = $("#product-id")[0].getAttribute("value");
  var newReviewText = $("#update-input" + reviewId).val();
  var newReviewRating = $("#update-rating" + reviewId).val();
  var pId = $("#pbody" + reviewId);
  var userRating = $("#user-rating" + reviewId);
  var emptyStar = '<span class = "emptyStar">';
  var colorStar = '<span class = "colorStar">';
  var avgEmptyStar = '<span class = "avgEmptyStar">';
  var avgColorStar = '<span class = "avgColorStar">';
  var avgRating = $(".rating");



  $.ajax({
    url: "/products/" + productId + "/reviews/" + reviewId,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify({text:  newReviewText, rating: newReviewRating}),
    success: function(response){
      for (var i = 0; i < newReviewRating; i++) {
        colorStar += '<i class="fa fa-star" style="color: #ffb400"></i>';
      }
      colorStar += '</span>';

      for (var i = 0; i < (5 - newReviewRating) ; i++) {
        emptyStar += '<i class="fa fa-star"></i>';
      }
      emptyStar += '</span>';

      pId.html("");
      userRating.html("");
      pId.append(response.foundReview.text);
      userRating.append(colorStar + emptyStar);


            // AVERAGE RATING
            if (response.product.reviews.length === 0) {

              var avg = 0;
            } else {
              var sum = 0;
              response.product.reviews.forEach(function(review){
                sum += review.rating;
              });
              var avg = Math.round(sum / response.product.reviews.length);
            }
            for (var i = 0; i < avg; i++) {
              avgColorStar += '<i class="fa fa-star" style="color: #ffb400"></i>';
            }
            avgColorStar += '</span>';

            for (var i = 0; i < (5 - avg) ; i++) {
              avgEmptyStar += '<i class="fa fa-star"></i>';

            }
            avgEmptyStar += '</span>';
            console.log(avg);

            avgRating.empty();
            avgRating.append(avgColorStar + avgEmptyStar);

          },
          error: function(response){
            console.log(response.responseText);
          }
        });
});

//DELETE
$(".reviews").on("click", ".delete-button", function(){
  var btn = this.getAttribute("id");
  var split = btn.split("delete");
  var reviewId = split[1];
  var productId = $("#product-id")[0].getAttribute("value");
  var rowId = $("#row" + reviewId);
  var avgRating = $(".rating");
  var avgEmptyStar = '<span class = "avgEmptyStar">';
  var avgColorStar = '<span class = "avgColorStar">';

  $.ajax({
    url: "/products/" + productId + "/reviews/" + reviewId,
    method: "DELETE",
    contentType: "application/json",
    success: function(response){
      rowId.html("");
           // AVERAGE RATING
           if (response.product.reviews.length === 0) {

            var avg = 0;
          } else {
            var sum = 0;
            response.product.reviews.forEach(function(review){
              sum += review.rating;
            });
            var avg = Math.round(sum / response.product.reviews.length);
          }
          for (var i = 0; i < avg; i++) {
            avgColorStar += '<i class="fa fa-star" style="color: #ffb400"></i>';
          }
          avgColorStar += '</span>';

          for (var i = 0; i < (5 - avg) ; i++) {
            avgEmptyStar += '<i class="fa fa-star"></i>';

          }
          avgEmptyStar += '</span>';
          avgRating.empty();
          avgRating.append(avgColorStar + avgEmptyStar);

        },
        error: function(response){
          console.log(response.responseText);
        }
      });
});





});
