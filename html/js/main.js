var pass = "", socket = io("localhost:3030");
$(document).ready(function() {
  $('#login').on('click', function() {
    socket.emit('checklogin', {pass: $('#password').val()});
  });
  socket.on('passreturn', function(data) {
    if(data.correct) {
      pass = $('#password').val();
      openClientsPage();
    }
  });
  socket.on('clientreturn', function(data) {
      $('.flex-center').append('<span onclick="openClient(\''+data.client+'\')">'+data.client+'</span>');
  });
});
