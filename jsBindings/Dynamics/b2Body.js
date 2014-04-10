// b2BodyDef globals
var b2BodyDef_Create = Module.cwrap('b2BodyDef_Create', 'number');
var b2BodyDef_SetPosition = Module.cwrap('b2BodyDef_SetPosition', 'null', 
  ['number', 'number', 'number']);
var b2BodyDef_SetType = Module.cwrap('b2BodyDef_SetType', 'null', 
  ['number', 'number']);

function b2BodyDef() {
  this.ptr = b2BodyDef_Create();
}

b2BodyDef.prototype.SetPosition = function(x, y) {
  b2BodyDef_SetPosition(this.ptr, x, y);
}

b2BodyDef.prototype.SetType = function(type) {
  b2BodyDef_SetType(this.ptr, type);
}

// b2Body Globals
var b2Body_CreateFixture_b2BodyDef = 
  Module.cwrap('b2Body_CreateFixture_b2BodyDef', 'number', 
    ['number', 'number']);
var b2Body_CreateFixture_b2Shape = 
  Module.cwrap('b2Body_CreateFixture_b2Shape', 'number', 
    ['number', 'number', 'number']);
var b2Body_GetPosition = Module.cwrap('b2Body_GetPosition', 'number', ['number']);
var b2Body_GetAngle = Module.cwrap('b2Body_GetAngle', 'number', ['number']);

function b2Body(ptr) {
  this.ptr = ptr;
}

b2Body.prototype.CreateFixtureBodyDef = function(bodyDef) {
  b2Body_CreateFixture_b2BodyDef(this.ptr, bodyDef.ptr);
}

b2Body.prototype.CreateFixtureShape = function(shape, density) {
  b2Body_CreateFixture_b2Shape(this.ptr, shape.ptr, density);
}

b2Body.prototype.GetPosition = function() {
  var position = new b2Vec2(10, 30);
  position.ptr = b2Body_GetPosition(this.ptr);;
  return position;
}

b2Body.prototype.GetAngle = function() {
  return b2Body_GetAngle(this.ptr);
}