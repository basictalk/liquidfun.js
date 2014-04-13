function b2PolygonShape() {
  this.position = new b2Vec2();
  this.vertices = [];
  this.type = b2Shape_Type_e_polygon;
}

b2PolygonShape.prototype.SetAsBoxXY = function(hx, hy) {
  this.vertices[0] = new b2Vec2(-hx, -hy);
  this.vertices[1] = new b2Vec2( hx, -hy);
  this.vertices[2] = new b2Vec2( hx,  hy);
  this.vertices[3] = new b2Vec2(-hx,  hy);
}

b2PolygonShape.prototype.SetAsBoxXYCenterAngle = function(hx, hy, center, angle) {
  this.vertices[0] = new b2Vec2(-hx, -hy);
  this.vertices[1] = new b2Vec2( hx, -hy);
  this.vertices[2] = new b2Vec2( hx,  hy);
  this.vertices[3] = new b2Vec2(-hx,  hy);

  var xf = new b2Transform();
  xf.p = center;
  xf.q.Set(angle);

  for (var i = 0; i < 4; i++) {
    b2Vec2.Mul(this.vertices[i], xf, this.vertices[i]);
  }
}