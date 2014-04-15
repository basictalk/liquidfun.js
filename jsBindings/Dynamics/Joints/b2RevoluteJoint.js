var b2RevoluteJointDef_Create =
  Module.cwrap('b2RevoluteJointDef_Create', 'number'
    ['number',
     //joint def
    'number', 'number', 'number',
    // revolute joint def
    'number', 'number', 'number',
    'number', 'number', 'number',
    'number', 'number', 'number',
    'number', 'number']);

var b2RevoluteJointDef_InitializeAndCreate =
  Module.cwrap('b2RevoluteJointDef_InitializeAndCreate', 'number',
    ['number',
      //initialize args
     'number', 'number', 'number',
     'number',
      //revoluteJointDef
     'number', 'number', 'number',
     'number', 'number', 'number',
     'number']);

var b2RevoluteJoint_SetMotorSpeed =
  Module.cwrap('b2RevoluteJoint_SetMotorSpeed', 'number',
    ['number', 'number']);

function b2RevoluteJointDef() {
  this.collideConnected = false;
  this.enableLimit = false;
  this.enableMotor = false;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.lowerAngle = 0;
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
  this.referenceAngle = 0;
  this.upperAngle = 0;
  this.userData = null;
}

b2RevoluteJointDef.prototype.Create = function(world) {
  var revoluteJoint = new b2RevoluteJoint(this)
  revoluteJoint.ptr = b2RevoluteJointDef_Create(
    world.ptr,
    // joint def
    this.bodyA.ptr, this.bodyB.ptr, this.collideConnected,
    //revoluteJointDef
    this.enableLimit, this.enableMotor, this.lowerAngle,
    this.localAnchorA.x, this.localAnchorA.y, this.localAnchorB.x,
    this.localAnchorB.y, this.maxMotorTorque, this.motorSpeed,
    this.referenceAngle, this.upperAngle);
  return revoluteJoint;
}

// todo Initialize and create probably shouldnt use the global world ptr
b2RevoluteJointDef.prototype.InitializeAndCreate = function(bodyA, bodyB, anchor) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var revoluteJoint = new b2RevoluteJoint(this);
  revoluteJoint.ptr =
    b2RevoluteJointDef_InitializeAndCreate(world.ptr,
      // initialize args
      bodyA.ptr, bodyB.ptr, anchor.x,
      anchor.y,
      // joint def
      this.collideConnected,
      // revloute joint def
      this.enableLimit, this.enableMotor, this.lowerAngle,
      this.maxMotorTorque, this.motorSpeed, this.upperAngle);
  world._Push(revoluteJoint, world.joints);
  return revoluteJoint;
}

function b2RevoluteJoint(revoluteJointDef) {
  this.bodyA = this.bodyA;
  this.bodyB = this.bodyB;
  this.collideConnected = revoluteJointDef.collideConnected;
  this.enableLimit = revoluteJointDef.enableLimit;
  this.enableMotor = revoluteJointDef.enableMotor;
  this.lowerAngle = revoluteJointDef.lowerAngle;
  this.maxMotorTorque = revoluteJointDef.maxMotorTorque;
  this.motorSpeed = revoluteJointDef.motorSpeed;
  this.next = null;
  this.ptr = null;
  this.upperAngle = revoluteJointDef.upperAngle;
  this.userData = revoluteJointDef.userData;

}

b2RevoluteJoint.prototype.SetMotorSpeed = function(speed) {
  b2RevoluteJoint_SetMotorSpeed(this.ptr, speed);
  this.motorSpeed = speed;
}

