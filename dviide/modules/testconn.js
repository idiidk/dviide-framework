this.name = 'testconn'
this.start = function () {
  $.getJSON('//freegeoip.net/json/?callback=?', function (data) {
    Dviide.callbackText('Test Completed: \n' + JSON.stringify(data))
  })
}
