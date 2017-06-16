this.prefix = 'onload'
this.call = function (args, mh) {
  if (args.length === 2 || args.length === 3) {
    if (args[1] === 'clear') {
      mh.setOnLoad('')
      mh.clog('[OnLoad] Cleared module to load... '.green)
    } else if (args[1] === 'set') {
      mh.setOnLoad(args[2])
      mh.clog('[OnLoad] Set: '.green + args[2].toString().green.bold + ' to load on inject.'.green)
    } else {
      mh.clog('[OnLoad] Invalid arguments specified.'.red)
    }
  } else {
    mh.clog('[OnLoad] Invalid arguments specified.'.red)
  }
}
