this.prefix = 'clients'
this.call = function (args, mh) {
  if (args[1]) {
    if (args[1] === 'list') {
      if (mh.clients.length > 0) {
        for (var i = 0; i < mh.clients.length; i++) {
          mh.clog('[C] '.green + i.toString().green + '. '.green + mh.clients[i].id.green.bold)
        }
      } else {
        mh.clog('[C] No clients connected'.green)
      }
    } else if (args[1] === 'clear') {
      mh.clients = []
    } else {
      mh.clog('[C] Invalid argument: '.red + args[1].toString().red)
    }
  } else {
    mh.clog('[C] Invalid arguments.'.red)
  }
}
