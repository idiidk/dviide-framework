this.name = 'screenshot';
this.start = function() {
  dviide.injectScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js', true, function() {
    html2canvas( [ document.body ], {
      onrendered: function( canvas ) {
        dviide.callbackImageBase64(canvas.toDataURL().split(',')[1]);
      }
    });
  });
}
