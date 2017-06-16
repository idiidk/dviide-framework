this.prefix = 'send'
this.call = function (args, mh) {
  if (args[1] && args[2]) {
    if (args[1] === 'all') {
      mh.sendModuleToAllClients(args[2])
    } else if (args[1] === 'id') {
      if (args[3]) {
        mh.sendModuleById(args[2], args[3])
      } else {
        mh.clog('[M] Please specify an id to use!'.red)
      }
    } else if (args[1] === 'idnum') {
      if (args[3]) {
        mh.sendModuleByIdNum(args[2], args[3])
      } else {
        mh.clog('[M] Please specify a module and num to use!'.red)
      }
    } else {
      mh.clog('[M] Invalid arguments for send. mode - module name - {id}'.red)
    }
  } else {
    mh.clog('[M] Invalid arguments for send. mode - module name - {id}'.red)
  }
}
