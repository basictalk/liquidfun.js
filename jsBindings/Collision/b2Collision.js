/**@constructor*/
function b2AABB() {
  this.lowerBound = new b2Vec2();
  this.upperBound = new b2Vec2();
}

b2AABB.prototype.GetCenter = function() {
  var sum = new b2Vec2();
  b2Vec2.Add(sum, this.lowerBound, this.upperBound);
  b2Vec2.MulScalar(sum, sum, 0.5);
};

// todo use just the pointer and offsets to get this data directly from the heap
var b2Manifold_GetPointCount =
  Module.cwrap('b2Manifold_GetPointCount', 'number', ['number']);

/**@constructor*/
function b2Manifold(ptr) {
  this.ptr = ptr;
}

b2Manifold.prototype.GetPointCount = function() {
  return b2Manifold_GetPointCount(this.ptr);
};