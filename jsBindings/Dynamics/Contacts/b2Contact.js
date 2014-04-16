// TODO this can all be done better, wayyy too manyy calls between asm and js

var b2Contact_GetManifold = Module.cwrap('b2Contact_GetManifold', 'number', ['number']);
function b2Contact(ptr) {
  this.ptr = ptr;
}

b2Contact.prototype.GetManifold = function() {
  return new b2Manifold(b2Contact_GetManifold(this.ptr));
}