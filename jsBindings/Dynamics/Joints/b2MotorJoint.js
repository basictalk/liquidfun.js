var b2MotorJointDef_Create = Module.cwrap("b2MotorJointDef_Create",
  'number',
  ['number',
    // joint Def
    'number', 'number', 'number',
    // motor joint def
    'number', 'number', 'number',
    'number', 'number', 'number']);

var b2MotorJointDef_InitializeAndCreate = Module.cwrap("b2MotorJointDef_InitializeAndCreate",
  'number',
  ['number',
    // initialize args
    'number', 'number', 'number',
    'number',
    // motor joint def
    'number', 'number', 'number']);

function b2MotorJointDef() {
  // joint def
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;

  // motor joint def
  this.angularOffset = 0;
  this.correctionFactor = 0.3;
  this.linearOffset = new b2Vec2();
  this.maxForce = 0;
  this.maxTorque = 0;
}

b2MotorJointDef.prototype.Create = function(world) {
  var motorJoint = new b2MotorJoint(this);
  motorJoint.ptr = b2MotorJointDef_Create(
    world.ptr,
    // joint def
    this.bodyA.ptr, this.bodyB.ptr, this.collideConnected,
    //motor joint def
    this.angularOffset, this.correctionFactor, this.linearOffset.x,
    this.linearOffset.y, this.maxForce, this.maxTorque);
  return motorJoint;
}

b2MotorJointDef.prototype.InitializeAndCreate  = function(bodyA, bodyB) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var motorJoint = new b2MotorJoint(this);
  motorJoint.ptr = b2MotorJointDef_InitializeAndCreate(
    world.ptr,
    // InitializeArgs
    this.bodyA.ptr, this.bodyB.ptr,
    // joint def
    this.collideConnected,
    //motor joint def
    this.correctionFactor, this.maxForce, this.maxTorque);
  world.joints.push(motorJoint);
  return motorJoint;
}

function b2MotorJoint(def) {
  this.bodyA = def.bodyA;
  this.bodyB = def.bodyB;
  this.ptr = null;
  this.next = null;
}