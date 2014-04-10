var b2FixtureDef_Create = Module.cwrap('b2FixtureDef_Create', 'number');
var b2FixtureDef_SetDensity = Module.cwrap('b2FixtureDef_SetDensity', 'null', 
  ['number', 'number']);
var b2FixtureDef_SetFriction = Module.cwrap('b2FixtureDef_SetFriction', 'null',
  ['number', 'number'])
var b2FixtureDef_SetShape = Module.cwrap('b2FixtureDef_SetShape', 'null', 
  ['number', 'number']);


function b2FixtureDef() {
  this.ptr = b2FixtureDef_Create();
}

b2FixtureDef.prototype.SetDensity = function(density) {
  b2FixtureDef_SetDensity(this.ptr, density);
}

b2FixtureDef.prototype.SetFriction = function(friction) {
  b2FixtureDef_SetFriction(this.ptr, friction);
}

b2FixtureDef.prototype.SetShape = function(shape) {
  b2FixtureDef_SetShape(this.ptr, shape.ptr);
}

