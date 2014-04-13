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

var b2World_Delete = Module.cwrap('b2World_Delete', 'null', ['number']);
var b2World_GetBodyList = Module.cwrap("b2World_GetBodyList", 'number', ['number']);
var b2World_SetGravity = Module.cwrap('b2World_SetGravity', 'null', 
  ['number', 'number', 'number']);
var b2World_Step = Module.cwrap('b2World_Step', 'null', ['number', 'number', 'number']);

function b2World(gravity) {
  this.bodies = [];
  this.joints = [];
  this.particleSystems = [];
  this.ptr = b2World_Create(gravity.x, gravity.y);
}

b2World.prototype.CreateBody = function(bodyDef) {
  var body = new b2Body(b2World_CreateBody(this.ptr, bodyDef.active, bodyDef.allowSleep,
    bodyDef.angle, bodyDef.angularVelocity, bodyDef.angularDamping, bodyDef.awake,
    bodyDef.bullet, bodyDef.fixedRotation, bodyDef.gravityScale, bodyDef.linearDamping,
    bodyDef.linearVelocity.x, bodyDef.linearVelocity.y, bodyDef.position.x,
    bodyDef.position.y, bodyDef.type, bodyDef.userData));
  this.bodies.push(body);
  return body;
}

b2World.prototype.CreateParticleSystem = function(psd) {
  var ps = new b2ParticleSystem(b2World_CreateParticleSystem(this.ptr, psd.colorMixingStrength,
    psd.dampingStrength, psd.destroyByAge, psd.ejectionStrength, psd.elasticStrength,
    psd.lifetimeGranularity, psd.powderStrength, psd.pressureStrength, psd.radius,
    psd.repulsiveStrength, psd.springStrength, psd.staticPressureIterations,
    psd.staticPressureRelaxation, psd.staticPressureStrength, psd.surfaceTensionNormalStrength,
    psd.surfaceTensionPressureStrength, psd.viscousStrength));
  this.particleSystems.push(ps);
  return ps;
}

b2World.prototype.GetBodyList = function() {
  return b2World_GetBodyList(this.ptr);
}

b2World.prototype.ForEachBody = function(func) {
  var body = new b2Body(b2World_GetBodyList(this.ptr));
  while (body.ptr !== 0) {
    func(body);
    body = body.GetNext();
  }
}

b2World.prototype.SetGravity = function(gravity) {
  b2World_SetGravity(this.ptr, gravity.x, gravity.y);
}

b2World.prototype.Step = function(steps, vIterations, pIterations) {
  b2World_Step(this.ptr, steps, vIterations, pIterations);
}

