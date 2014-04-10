var b2World_Create = Module.cwrap('b2World_Create', 'number', ['number']);
var b2World_CreateBody = Module.cwrap('b2World_CreateBody', 'number', ['number', 'number']);
var b2World_Step = Module.cwrap('b2World_Step', 'null', ['number', 'number', 'number']);
var b2World_Delete = Module.cwrap('b2World_Delete', 'null', ['number']);

function b2World(gravity) {
  this.ptr = b2World_Create(gravity.ptr);
}

b2World.prototype.CreateBody = function(bodyDef) {
  return new b2Body(b2World_CreateBody(this.ptr, bodyDef.ptr));
}

b2World.prototype.Step = function(steps, vIterations, pIterations) {
  b2World_Step(this.ptr, steps, vIterations, pIterations);
}

