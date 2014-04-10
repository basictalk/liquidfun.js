var b2PolygonShape_Create = Module.cwrap('b2PolygonShape_Create', 'number');
var b2PolygonShape_SetAsBox_xy = Module.cwrap('b2PolygonShape_SetAsBox_xy', 
  'null', ['number', 'number', 'number']);

function b2PolygonShape() {
  this.ptr = b2PolygonShape_Create();
}

b2PolygonShape.prototype.SetAsBoxXY = function(x, y) {
  b2PolygonShape_SetAsBox_xy(this.ptr, x, y);
}