this.name = 'reinject';
this.start = function() {
  dviide.disconnect();
  dviide.connect();
  dviide.callbackText('Done Reinjecting.');
}
