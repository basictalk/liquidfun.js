var b2RevoluteJoint_InitializeAndCreate =
  Module.cwrap('b2RevoluteJoint_InitializeAndCreate', 'null',
    ['number', 'number', 'number',
     'number', 'number',
      //revoluteJointDef
     'number', 'number', 'number', 'number', 'number', 'number', 'number',  'number']);

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

b2RevoluteJointDef.prototype.InitializeAndCreate = function(bodyA, bodyB, anchor) {
  b2RevoluteJoint_InitializeAndCreate(world.ptr, bodyA.ptr, bodyB.ptr, anchor.x, anchor.y,
    // revolute joint def
    this.collideConnected, this.enableLimit, this.enableMotor, this.lowerAngle,
    this.maxMotorTorque, this.motorSpeed, this.upperAngle, this.lowerAngle,
    this.userData);
}