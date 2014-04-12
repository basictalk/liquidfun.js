function b2PolygonShape() {
  this.count = 0;
  this.position = new b2Vec2();
  this.vertices = [];
  this.type = b2Shape_Type_e_polygon;
}

b2PolygonShape.prototype.SetAsBoxXY = function(hx, hy) {
  this.count = 4;
  this.vertices[0] = new b2Vec2(-hx, -hy);
  this.vertices[1] = new b2Vec2( hx, -hy);
  this.vertices[2] = new b2Vec2( hx,  hy);
  this.vertices[3] = new b2Vec2(-hx,  hy);
}