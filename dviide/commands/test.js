this.prefix = 'test';
this.call = function(args, mh) {
  for(i=0;i<args.length;i++) {
    mh.clog(args[i].green);
  }
}
