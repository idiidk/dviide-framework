this.name = 'udi';
function getRotationDegrees(obj) {
  var matrix = obj.css("-webkit-transform") ||
  obj.css("-moz-transform")    ||
  obj.css("-ms-transform")     ||
  obj.css("-o-transform")      ||
  obj.css("transform");
  if(matrix !== 'none') {
    var values = matrix.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
  } else { var angle = 0; }
  return (angle < 0) ? angle + 360 : angle;
}
this.start = function() {
  var $body = $("body");
  $body.animate(
    {rotation: getRotationDegrees($('body')) == 180 ? 0 : 180},
    {
      duration: 1000,
      step: function(now, fx) {
        $(this).css({"transform": "rotate("+now+"deg)"});
      }
    }
  );
  var res = getRotationDegrees($('body')) == 180 ? 'upside up!' : 'upside down!';
  dviide.callback('Flipped ' + res);
}
