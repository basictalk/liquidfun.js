// Shape constants
var b2Shape_Type_e_circle = 0;
var b2Shape_Type_e_edge = 1;
var b2Shape_Type_e_polygon = 2;
var b2Shape_Type_e_chain = 3;
var b2Shape_Type_e_typeCount = 4;

// Shape Globals
var b2Shape_GetType = Module.cwrap('b2Shape_GetType', 'number', ['number']);
//var b2Shape_SetRadius = Module.cwrap('b2Shape_SetRadius', 'number', ['number', 'number']);

function b2Shape(ptr) {
  if(ptr === undefined) {
    this.ptr = b2CircleShape_Create;
  } else {
    this.ptr = ptr;
  }
}

b2Shape.prototype.GetType = function() {
  return b2Shape_GetType(this.ptr);
}

b2Shape.prototype.SetRadius = function(radius) {
  return b2Shape_SetRadius(this.ptr, radius);
}
