// todo use just the pointer and offsets to get this data directly from the heap
var b2Manifold_GetPointCount =
  Module.cwrap('b2Manifold_GetPointCount', 'number', ['number']);

function b2Manifold(ptr) {
  this.ptr = ptr;
}

b2Manifold.prototype.GetPointCount = function() {
  return b2Manifold_GetPointCount(this.ptr);
}