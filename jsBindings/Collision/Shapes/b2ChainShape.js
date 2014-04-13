function b2ChainShape() {
  this.radius = b2_polygonRadius;
  this.type = b2Shape_Type_e_chain;
  this.vertices = [];
}

// working here
 b2ChainShape.prototype.CreateLoop = function() {
   this.vertices.push(this.vertices[0]);
}