$(function(){
  //GET
  $(".reviews").on("click", ".edit-button", function(){
    console.log("TESTE");
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
          <input type = "text" class = "name" id = "input' + reviewId + '"  value = "' + response.review.text + '">\
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
  var well = $(".reviews");

  $.ajax({
    url: "/products/" + productId + "/reviews",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({text: createInput.val()}),
    success: function(response){
      console.log(response.review.createdAt.getDate());
      createInput.val("");
      well.append('\
        <div class = "row" id = "row' + response.review._id +'">\
          <div class = "col-md-12">\
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
  var newreview = $("#input" + reviewId).val();
  var pId = $("#pbody" + reviewId);



  $.ajax({
    url: "/products/" + productId + "/reviews/" + reviewId,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify({newreview: newreview}),
    success: function(response){
      console.log(response);
        pId.html("");
        pId.append(response.foundreview.text);
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
  console.log(reviewId);
  var productId = $("#product-id")[0].getAttribute("value");
  // var row = "row";
  // var rowconc = row.concat(String(reviewId));
  var rowId = $("#row" + reviewId);

  $.ajax({
    url: "/products/" + productId + "/reviews/" + reviewId,
    method: "DELETE",
    contentType: "application/json",
    success: function(response){
      console.log(response);
      rowId.html("");

    },
    error: function(response){
      console.log(response.responseText);
    }
  });
});


});
