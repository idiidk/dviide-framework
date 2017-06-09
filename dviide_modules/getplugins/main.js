this.name = 'getplugins';
this.start = function() {
  var temppl = '';
  for(i=0;i<navigator.plugins.length;i++) {
    temppl += i.toString() + '. ' + navigator.plugins[i].name + '\n';
  }
  dviide.callback(temppl);
}
