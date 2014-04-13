function b2FixtureDef() {
  this.density = 0.0;
  this.friction = 0.2;
  this.isSensor = false;
  this.restitution = 0.0;
  this.shape = null;
  this.userData = null;
}

// fixture globals
function b2Fixture() {
  this.ptr = null;
  this.shape = null;
}

b2Fixture.prototype.FromFixtureDef = function(fixtureDef) {
  this.density = fixtureDef.density;
  this.friction = fixtureDef.friction;
  this.isSensor = fixtureDef.isSensor;
  this.restitution = fixtureDef.restitution;
  this.shape = fixtureDef.shape;
  this.userData = fixtureDef.userData;
  this.vertices = [];
}