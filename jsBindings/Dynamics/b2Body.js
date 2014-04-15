// General body globals
var b2_staticBody = 0;
var b2_kinematicBody = 1;
var b2_dynamicBody = 2;

function b2BodyDef() {
  this.active = true;
  this.allowSleep = true;
  this.angle = 0;
  this.angularVelocity = 0;
  this.angularDamping = 0;
  this.awake = true;
  this.bullet = false;
  this.fixedRotation = false;
  this.gravityScale = 1.0;
  this.linearDamping = 0;
  this.linearVelocity = new b2Vec2();
  this.position = new b2Vec2();
  this.type = b2_staticBody;
  this.userData = null;
}

// b2Body Globals
var b2Body_ApplyForce = Module.cwrap('b2Body_ApplyForce', 'number',
  ['number', 'number', 'number', 'number', 'number', 'number']);
var b2Body_ApplyTorque = Module.cwrap('b2Body_ApplyTorque', 'number',
  ['number', 'number', 'number']);
var b2Body_GetAngle = Module.cwrap('b2Body_GetAngle', 'number', ['number']);
var b2Body_GetAngularVelocity =
  Module.cwrap('b2Body_GetAngularVelocity', 'number', ['number']);
var b2Body_GetInertia = Module.cwrap('b2Body_GetInertia', 'number', ['number']);
var b2Body_GetLinearVelocity =
  Module.cwrap('b2Body_GetLinearVelocity', 'null', ['number', 'number']);
var b2Body_GetMass = Module.cwrap('b2Body_GetMass', 'number', ['number']);
var b2Body_GetPosition = Module.cwrap('b2Body_GetPosition', 'null', ['number', 'number']);
var b2Body_GetTransform = Module.cwrap('b2Body_GetTransform', 'null',
  ['number', 'number']);
var b2Body_GetType = Module.cwrap('b2Body_GetType', 'number', ['number']);
var b2Body_GetWorldPoint = Module.cwrap('b2Body_GetWorldPoint', 'null',
  ['number', 'number', 'number', 'number']);
var b2Body_GetWorldVector = Module.cwrap('b2Body_GetWorldVector', 'null',
  ['number', 'number', 'number', 'number']);
var b2Body_SetAngularVelocity = Module.cwrap('b2Body_SetAngularVelocity', 'null',
  ['number', 'number']);
var b2Body_SetLinearVelocity = Module.cwrap('b2Body_SetLinearVelocity', 'null',
  ['number', 'number', 'number']);
var b2Body_SetTransform =
  Module.cwrap('b2Body_SetTransform', 'null', ['number', 'number', 'number']);
var b2Body_SetType =
  Module.cwrap('b2Body_SetType', 'null', ['number', 'number']);

function b2Body(ptr) {
  this.ptr = ptr;
  this.fixtures = [];
}

b2Body.prototype.ApplyForce = function(force, point, wake) {
  b2Body_ApplyForce(this.ptr, force.x, force.y, point.x, point.y, wake);
}

b2Body.prototype.ApplyTorque = function(force, wake) {
  b2Body_ApplyTorque(this.ptr, force, wake);
}

b2Body.prototype.CreateFixtureFromDef = function(fixtureDef) {
  var fixture = new b2Fixture();
  fixture.FromFixtureDef(fixtureDef);
  fixture.ptr = fixtureDef.shape._CreateFixture(this, fixtureDef);
  this.fixtures.push(fixture);
  world.fixturesLookup[fixture.ptr] = this;
  return fixture;
}

b2Body.prototype.CreateFixtureFromShape = function(shape, density) {
  var fixtureDef = new b2FixtureDef();
  fixtureDef.shape = shape;
  fixtureDef.density = density;
  return this.CreateFixtureFromDef(fixtureDef);
}

b2Body.prototype.GetAngle = function() {
  return b2Body_GetAngle(this.ptr);
}

b2Body.prototype.GetAngularVelocity = function() {
  return b2Body_GetAngularVelocity(this.ptr);
}

b2Body.prototype.GetInertia = function() {
  return b2Body_GetInertia(this.ptr);
}

b2Body.prototype.GetMass = function() {
  return b2Body_GetMass(this.ptr);
}

b2Body.prototype.GetLinearVelocity = function() {
  b2Body_GetLinearVelocity(this.ptr, _vec2Buf.byteOffset);
  var result = new Float32Array(_vec2Buf.buffer, _vec2Buf.byteOffset, _vec2Buf.length);
  var velocity = new b2Vec2(result[0], result[1]);
  return velocity;
}

b2Body.prototype.GetPosition = function() {
  b2Body_GetPosition(this.ptr, _vec2Buf.byteOffset);
  var result = new Float32Array(_vec2Buf.buffer, _vec2Buf.byteOffset, _vec2Buf.length);
  var position = new b2Vec2(result[0], result[1]);
  return position;
}

b2Body.prototype.GetTransform = function() {
  b2Body_GetTransform(this.ptr, _transBuf.byteOffset);
  var result = new Float32Array(_transBuf.buffer, _transBuf.byteOffset, _transBuf.length);
  var transform = new b2Transform(); 
  transform.FromFloat64Array(result);
  return transform;
}

b2Body.prototype.GetType = function() {
  return b2Body_GetType(this.ptr);
}

b2Body.prototype.GetWorldPoint = function(vec) {
  b2Body_GetWorldPoint(this.ptr, vec.x, vec.y, _vec2Buf.byteOffset);
  var result = new Float32Array(_vec2Buf.buffer, _vec2Buf.byteOffset, _vec2Buf.length);
  return new b2Vec2(result[0], result[1]);
}

b2Body.prototype.GetWorldVector = function(vec) {
  b2Body_GetWorldVector(this.ptr, vec.x, vec.y, _vec2Buf.byteOffset);
  var result = new Float32Array(_vec2Buf.buffer, _vec2Buf.byteOffset, _vec2Buf.length);
  return new b2Vec2(result[0], result[1]);
}

b2Body.prototype.SetAngularVelocity = function(angle) {
  b2Body_SetAngularVelocity(this.ptr, angle);
}

b2Body.prototype.SetLinearVelocity = function(v) {
  b2Body_SetLinearVelocity(this.ptr, v.x, v.y);
}

b2Body.prototype.SetTransform = function(v, angle) {
  b2Body_SetTransform(this.ptr, v.x, v.y, angle);
}

b2Body.prototype.SetType = function(type) {
  b2Body_SetType(this.ptr, type);
}