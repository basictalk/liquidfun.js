// global call back function
function b2WorldBeginContact(fixA, fixB) {
  var fixLook = world.fixturesLookup;
  console.log(world.fixturesLookup[fixA].detail);
  console.log(world.fixturesLookup[fixB].detail);
  this.listener.BeginContact(fixLook[fixA], fixLook[fixB]);
}

function b2WorldEndContact(fixA, fixB) {
  var fixLook = world.fixturesLookup;
  console.log(world.fixturesLookup[fixA].detail);
  console.log(world.fixturesLookup[fixB].detail);
  this.listener.EndContact(fixLook[fixA], fixLook[fixB]);
}

// Emscripten exports
var b2World_Create = Module.cwrap('b2World_Create', 'number', ['number', 'number']);
var b2World_CreateBody = 
  Module.cwrap('b2World_CreateBody', 'number', 
    ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 
     'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
     'number']);

var b2World_CreateParticleSystem =
  Module.cwrap('b2World_CreateParticleSystem', 'number',
    ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
     'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);

var b2World_SetContactListener = Module.cwrap('b2World_SetContactListener', 'null', ['number']);
var b2World_SetGravity = Module.cwrap('b2World_SetGravity', 'null', 
  ['number', 'number', 'number']);
var b2World_Step = Module.cwrap('b2World_Step', 'null', ['number', 'number', 'number']);

var _transBuf = null;
var _vec2Buf = null;
var _pBuf = null;
var _pBufLength = null;

function b2World(gravity) {
  this.bodies = [];
  this.bodiesLookup = {};
  this.fixturesLookup = {};
  this.joints = [];
  this.particleSystems = [];
  this.ptr = b2World_Create(gravity.x, gravity.y);
  this.listener = null;

  // preallocate some buffers to prevent having to constantly reuse
  var nDataBytes = 4 * Float32Array.BYTES_PER_ELEMENT;
  var dataPtr = Module._malloc(nDataBytes);
  _transBuf = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);

  nDataBytes = 2 * Float32Array.BYTES_PER_ELEMENT;
  dataPtr = Module._malloc(nDataBytes);
  _vec2Buf = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);

  // 5000 is a sensible default for pbuf
  nDataBytes = 5000 * Float32Array.BYTES_PER_ELEMENT;
  dataPtr = Module._malloc(nDataBytes);
  _pBuf = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
  _pBufLength = 5000;
}

b2World.prototype.CreateBody = function(bodyDef) {
  var body = new b2Body(b2World_CreateBody(this.ptr, bodyDef.active, bodyDef.allowSleep,
    bodyDef.angle, bodyDef.angularVelocity, bodyDef.angularDamping, bodyDef.awake,
    bodyDef.bullet, bodyDef.fixedRotation, bodyDef.gravityScale, bodyDef.linearDamping,
    bodyDef.linearVelocity.x, bodyDef.linearVelocity.y, bodyDef.position.x,
    bodyDef.position.y, bodyDef.type, bodyDef.userData));
  this.bodies.push(body);
  this.bodiesLookup[body.ptr] = body;
  return body;
}

b2World.prototype.CreateJoint = function(jointDef) {
  var joint = jointDef.Create(this);
  world.joints.push(joint);
}

b2World.prototype.CreateParticleSystem = function(psd) {
  var ps = new b2ParticleSystem(b2World_CreateParticleSystem(this.ptr, psd.colorMixingStrength,
    psd.dampingStrength, psd.destroyByAge, psd.ejectionStrength, psd.elasticStrength,
    psd.lifetimeGranularity, psd.powderStrength, psd.pressureStrength, psd.radius,
    psd.repulsiveStrength, psd.springStrength, psd.staticPressureIterations,
    psd.staticPressureRelaxation, psd.staticPressureStrength, psd.surfaceTensionNormalStrength,
    psd.surfaceTensionPressureStrength, psd.viscousStrength));
  this.particleSystems.push(ps);
  ps.dampingStrength = psd.dampingStrength;
  ps.radius = psd.radius;
  return ps;
}

b2World.prototype.SetContactListener = function(listener) {
  this.listener = listener;
  b2World_SetContactListener(this.ptr);
}

b2World.prototype.SetGravity = function(gravity) {
  b2World_SetGravity(this.ptr, gravity.x, gravity.y);
}

b2World.prototype.Step = function(steps, vIterations, pIterations) {
  b2World_Step(this.ptr, steps, vIterations, pIterations);
}

