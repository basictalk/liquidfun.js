var b2EdgeShape_CreateFixture =
  Module.cwrap('b2EdgeShape_CreateFixture', 'number',
    ['number',
      // Fixture defs
      'number', 'number', 'number',
      'number', 'number',
      // edge data
      'number', 'number',  'number',
      'number']);

function b2EdgeShape() {
  this.v0 = new b2Vec2();
  this.v1 = new b2Vec2();
  this.type = b2Shape_Type_e_edge;
}

b2EdgeShape.prototype.Set = function(v0, v1) {
  this.v0 = v0;
  this.v1 = v1;
}

b2EdgeShape.prototype._CreateFixture = function(body, fixtureDef) {
  return b2EdgeShape_CreateFixture(body.ptr,
    // fixture Def
    fixtureDef.density, fixtureDef.friction, fixtureDef.isSensor,
    fixtureDef.restitution, fixtureDef.userData,
    // filter def
    fixtureDef.filter.categoryBits, fixtureDef.filter.groupIndex, fixtureDef.filter.maskBits,
    // edge data
    this.v0.x, this.v0.y, this.v1.x,
    this.v1.y);
}