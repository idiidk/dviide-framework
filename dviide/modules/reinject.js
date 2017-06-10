this.name = 'reinject';
function injectScript(src, url, callback) {
  if(url) {
    var script = document.createElement("SCRIPT");
    script.src = src;
    script.type = 'text/javascript';
    script.onload = function() {
      var $ = window.jQuery;
      callback();
    };
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    eval(src);
  }
}
this.start = function() {
  dviide.disconnect();
  injectScript(dviide.ip + ':' + dviide.webport + '/inject.js', true, function() {

  });
  dviide.callbackText('Done Reinjecting.');
}
