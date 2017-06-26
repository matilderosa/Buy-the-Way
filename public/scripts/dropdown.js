  $(".dropdown-menu li a").click(function(){
    var btn = $(this).parents(".dropdown").find('.btn');
  btn.html($(this).text() + ' <span class="caret"></span>');
  btn.val($(this).data('value'));
  var form = $(".my-form");
  if (btn.val($(this).data('value'))) {

  form.attr('action', '/search/' + $(this).data('value') + '/' + $(this).attr('id'));
} else {
form.attr('action', '/search');
}
});
