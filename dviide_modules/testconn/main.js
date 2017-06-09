this.name = 'testconn';
this.start = function() {
  $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
    dviide.callback('Test Completed: \n' + JSON.stringify(data));
  });
}
