(function (){

  $('.carousel-showmanymoveone .item').each(function(){
    var itemToClone = $(this);

    for (var i=1;i<6;i++) {
      itemToClone = itemToClone.next();

      // wrap around if at end of item collection
      if (!itemToClone.length) {
        itemToClone = $(this).siblings(':first');
      }

      // grab item, clone, add marker class, add to collection
      itemToClone.children(':first-child').clone()
        .addClass("cloneditem-"+(i))
        .appendTo($(this));
    }
  });


$('.carousel-showmanymoveone2 .item').each(function(){
    var itemToClone2 = $(this);


    for (var i=1;i<6;i++) {
      itemToClone2 = itemToClone2.next();

      // wrap around if at end of item collection
      if (!itemToClone2.length) {
        itemToClone2 = $(this).siblings(':first');
      }

      // grab item, clone, add marker class, add to collection
      itemToClone2.children(':first-child').clone()
        .addClass("cloneditem-"+(i))
        .appendTo($(this));
    }
  });


}());




$(window).load(function() {
 // executes when complete page is fully loaded, including all frames, objects and images
console.log("window is loaded");


// window load
});


