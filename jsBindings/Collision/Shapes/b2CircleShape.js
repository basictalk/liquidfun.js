var b2CircleShape_CreateFixture =
  Module.cwrap('b2CircleShape_CreateFixture', 'number',
    ['number',
      // Fixture defs
      'number', 'number', 'number', 'number', 'number',
      // Circle members
      'number', 'number',
      'number']);

var b2CircleShape_CreateParticleGroup =
  Module.cwrap('b2CircleShape_CreateParticleGroup', 'number',
    ['number',
      // particleGroupDef
      'number', 'number', 'number', 'number', 'number', 'number', 'number',
      'number', 'number', 'number', 'number', 'number', 'number', 'number',
      'number', 'number', 'number', 'number', 'number',
      //Circle
      'number', 'number', 'number'
    ]);

function b2CircleShape() {
  this.position = new b2Vec2();
  this.radius = 0;
  this.type = b2Shape_Type_e_circle;
}

b2CircleShape.prototype._CreateFixture = function(body, fixtureDef) {
  return b2CircleShape_CreateFixture(body.ptr,
    // fixture Def
    fixtureDef.density, fixtureDef.friction, fixtureDef.isSensor,
    fixtureDef.restitution, fixtureDef.userData,
    // circle data
    this.position.x, this.position.y, this.radius);
}

b2CircleShape.prototype._CreateParticleGroup = function(particleSystem, pgd) {
  var pg = new b2ParticleGroup(b2CircleShape_CreateParticleGroup(
    particleSystem.ptr,
    // particle group def
    pgd.angle,  pgd.angularVelocity, pgd.color.r, pgd.color.g, pgd.color.b, pgd.color.a,
    pgd.flags, pgd.group.ptr, pgd.groupFlags, pgd.lifetime, pgd.linearVelocity.x,
    pgd.linearVelocity.y, pgd.position.x, pgd.position.y, pgd.positionData, pgd.particleCount,
    pgd.strength, pgd.stride, pgd.userData,
    // circle
    this.position.x, this.position.y, this.radius));
  return pg;
}