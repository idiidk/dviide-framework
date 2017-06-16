this.name = 'reinject'
this.start = function () {
  Dviide.disconnect()
  Dviide.connect()
  Dviide.callbackText('Done Reinjecting.')
}
