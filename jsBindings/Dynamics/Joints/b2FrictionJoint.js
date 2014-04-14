var b2FrictionJointDef_CreateJoint = Module.cwrap("b2FrictionJointDef_CreateJoint",
  'number',
  ['number',
   // joint Def
   'number', 'number', 'number',
   // friction joint def
   'number', 'number', 'number', 'number', 'number', 'number']);

function b2FrictionJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.maxForce = 0;
  this.maxTorque = 0;
  this.userData = null;
}

b2FrictionJointDef.prototype.Create = function(world) {
  var frictionJoint = new b2FrictionJoint(this)
  frictionJoint.ptr = b2FrictionJointDef_CreateJoint(
    world.ptr,
    // joint def
    this.bodyA.ptr, this.bodyB.ptr, this.collideConnected,
    //friction joint def
    this.localAnchorA.x, this.localAnchorA.y,
    this.localAnchorB.x, this.localAnchorB.y,
    this.maxForce, this.maxTorque);
  return frictionJoint;
}

function b2FrictionJoint(def) {
  this.bodyA = def.bodyA;
  this.bodyB = def.bodyB;
  this.ptr = null;
}