this.prefix = 'ashram';
this.call = function(args, mh) {
  var ashramport = 1337;
  if(args.length == 2) {
    var http = mh.require('http');
    var net = mh.require('net');
    var url = mh.require('url');
    var enableDestroy = mh.require('server-destroy');
    if(args[1] == 'enable') {
      if(mh.varRet('ashramproxy')) {
        mh.clog('[AshRam] Proxy already running!'.red)
      } else {
        mh.clog('[AshRam] Starting AshramProxy on port '.green + ashramport.toString().green.bold + '...'.green);
        mh.varAdd('ashramproxy', http.createServer(function (req, res) {
          mh.clog('[AshRam] Injecting into: '.green + req.url.green.bold);
          res.end('okay');
        }));
        mh.varRet('ashramproxy').on('connect', function(req, cltSocket, head) {
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

        mh.varRet('ashramproxy').listen(ashramport, '127.0.0.1', function () {
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
