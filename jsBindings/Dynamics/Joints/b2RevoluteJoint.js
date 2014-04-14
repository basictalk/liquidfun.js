var b2RevoluteJoint_InitializeAndCreate =
  Module.cwrap('b2RevoluteJoint_InitializeAndCreate', 'number',
    ['number',
      // joint def
     'number', 'number', 'number', 'number',
      //revoluteJointDef
     'number', 'number', 'number', 'number', 'number', 'number', 'number',  'number']);

var b2RevoluteJoint_SetMotorSpeed =
  Module.cwrap('b2RevoluteJoint_SetMotorSpeed', 'number',
    ['number', 'number']);

function b2RevoluteJointDef() {
  this.collideConnected = false;
  this.enableLimit = false;
  this.enableMotor = false;
  this.lowerAngle = 0;
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
  this.upperAngle = 0;
  this.userData = null;
}
// todo refactor this to have a separate initialize and create(create being called
// from world
b2RevoluteJointDef.prototype.InitializeAndCreate = function(bodyA, bodyB, anchor) {
  var revoluteJoint = new b2RevoluteJoint(bodyA, bodyB, this);
  revoluteJoint.ptr =
    b2RevoluteJoint_InitializeAndCreate(world.ptr,
    // joint def
      bodyA.ptr, bodyB.ptr, anchor.x, anchor.y,
    // revolute joint def
    this.collideConnected, this.enableLimit, this.enableMotor, this.lowerAngle,
    this.maxMotorTorque, this.motorSpeed, this.upperAngle, this.lowerAngle,
    this.userData);
  world.joints.push(revoluteJoint);
  return revoluteJoint;
}

function b2RevoluteJoint(bodyA, bodyB, revoluteJointDef) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.collideConnected = revoluteJointDef.collideConnected;
  this.enableLimit = revoluteJointDef.enableLimit;
  this.enableMotor = revoluteJointDef.enableMotor;
  this.lowerAngle = revoluteJointDef.lowerAngle;
  this.maxMotorTorque = revoluteJointDef.maxMotorTorque;
  this.motorSpeed = revoluteJointDef.motorSpeed;
  this.ptr = null;
  this.upperAngle = revoluteJointDef.upperAngle;
  this.userData = revoluteJointDef.userData;
}

b2RevoluteJoint.prototype.SetMotorSpeed = function(speed) {
  b2RevoluteJoint_SetMotorSpeed(this.ptr, speed);
  this.speed = speed;
}

