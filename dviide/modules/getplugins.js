this.name = 'getplugins'
this.start = function () {
  var temppl = ''
  for (var i = 0; i < navigator.plugins.length; i++) {
    temppl += i.toString() + '. ' + navigator.plugins[i].name + '\n'
  }
  if (temppl !== '') {
    Dviide.callbackText(temppl)
  } else {
    Dviide.callbackText('No plugins found!')
  }
}
