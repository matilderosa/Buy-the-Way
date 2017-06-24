$(function(){




  $("#search").keyup(function(){

    var search_term = $(this).val();

    $.ajax({
      method: "POST",
      url: "/api/search",
      data: {
        search_term
      },
      dataType: "json",
      success: function(json) {
        var data = json.hits.hits.map(function(hit){
          return hit;
        });
        $("#searchResults").empty();
        for (var i = 0; i < data.length; i++) {
          var html = "";
          html += '<div class = "col-md-4">';
          html += '<a href="/product/' +  data[i]._source._id + '">';
          html += '<div class = "thumbnail">';
          html += '<img src="' +  data[i]._source.image + '">';
          html += '<div class = "caption">';
          html += '<h3>' + data[i]._source.name + '</h3>';
          html += '<p>' + data[i]._source.category.name + '</p>';
          html += '<p>' + data[i]._source.price + '</p>';
          html += '</div></div></a></div>';

          $("#searchResults").append(html);

        }
      },
      error: function(error){
        console.log(err);
      }
    });
  });


//ADD PLUS
$(document).on("click", "#plus", function(e){
  e.preventDefault();
  var priceValue = parseFloat($("#priceValue").val());
  var quantity = parseInt($("#quantity").val());

  priceValue += parseFloat($("#priceHidden").val());
  quantity += 1;

  $("#quantity").val(quantity);
  $("#priceValue").val(priceValue.toFixed(2));
  $("#total").html(quantity);
});

//ADD MINUS
$(document).on("click", "#minus", function(e){
  e.preventDefault();
  var priceValue = parseFloat($("#priceValue").val());
  var quantity = parseInt($("#quantity").val());

  if (quantity == 1) {
    priceValue = $("#priceHidden").val();
    quantity = 1;
  } else {
    priceValue -= parseFloat($("#priceHidden").val());
  quantity -= 1;
  }



  $("#quantity").val(quantity);
  $("#priceValue").val(priceValue.toFixed(2));
  $("#total").html(quantity);
});



//STRIPE

// var stripe = Stripe('pk_test_RMPb12uNjRCuoSDMgVyFe17e');

// function stripeResponseHandler(status, response){
//     console.log("=================");
//     console.log(response.id);
//   var $form = $('#payment-form');
//   if (response.error) {
//     // Show the errors on the form
//     $form.find('.payment-errors').text(response.error.message)
//     $form.find('button').prop('disabled', false);
//   } else {
//     // response contains id and card, which contains additional card details
//     var token = response.id;

//     // Insert the token into the form so it gets submitted to the server
//     $form.append($('<input type="hidden" name="stripeToken" />').val(token));
//     // and submit
//     $form.get(0).submit();
//   }
// };

//   $('#payment-form').submit(function(event) {
//     var $form = $(this);
//     // Disable the submit button to prevent repeated clicks
//     $form.find('button').prop('disabled', true);

//     Stripe.card.createToken($form, stripeResponseHandler);
//     // Prevent the form from submitting with the default action
//   return false;
// });

// Create a Stripe client
var stripe = Stripe('pk_test_RMPb12uNjRCuoSDMgVyFe17e');

// Create an instance of Elements
var elements = stripe.elements();

var opts = {
  lines: 13 // The number of lines to draw
, length: 28 // The length of each line
, width: 14 // The line thickness
, radius: 42 // The radius of the inner circle
, scale: 1 // Scales overall size of the spinner
, corners: 1 // Corner roundness (0..1)
, color: '#000' // #rgb or #rrggbb or array of colors
, opacity: 0.25 // Opacity of the lines
, rotate: 0 // The rotation offset
, direction: 1 // 1: clockwise, -1: counterclockwise
, speed: 1 // Rounds per second
, trail: 60 // Afterglow percentage
, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
, zIndex: 2e9 // The z-index (defaults to 2000000000)
, className: 'spinner' // The CSS class to assign to the spinner
, top: '50%' // Top position relative to parent
, left: '50%' // Left position relative to parent
, shadow: false // Whether to render a shadow
, hwaccel: false // Whether to use hardware acceleration
, position: 'absolute' // Element positioning
}

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: '#32325d',
    lineHeight: '24px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server
      stripeTokenHandler(result.token);
    }
  });
});

function stripeTokenHandler(token) {
  // Insert the token ID into the form so it gets submitted to the server
  var form = document.getElementById('payment-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  var spinner = new Spinner(opts).spin();
  $("#loading").append(spinner.el);

  // Submit the form
  form.submit();
}

});


