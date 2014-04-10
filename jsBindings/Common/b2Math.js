var b2_dynamicBody = 2;

var b2Vec2_GetX = Module.cwrap('b2Vec2_GetX', 'number', ['number']);
var b2Vec2_GetY = Module.cwrap('b2Vec2_GetY', 'number', ['number']);
var b2Vec2_Create = Module.cwrap('b2Vec2_Create', 'number', ['number', 'number']);
var b2Vec2_Delete = Module.cwrap('b2Vec2_Delete', 'null', ['number']);

function b2Vec2(x, y) {
  if (x === undefined && y === undefined) {
    this.ptr = undefined;
  } else {
    this.ptr = b2Vec2_Create(x, y);
  }
}

b2Vec2.prototype.GetX = function() {
  return b2Vec2_GetX(this.ptr);
}

b2Vec2.prototype.GetY = function() {
  return b2Vec2_GetY(this.ptr);
}

b2Vec2.prototype.SetPtr = function(ptr) {
  this.ptr = ptr;
}