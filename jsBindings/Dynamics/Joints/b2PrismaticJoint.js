var b2PrismaticJointDef_Create = Module.cwrap("b2PrismaticJointDef_Create",
  'number',
  ['number',
    // joint Def
    'number', 'number', 'number',
    // prismatic joint def
    'number', 'number', 'number',
    'number', 'number', 'number',
    'number', 'number', 'number',
    'number', 'number', 'number',
    'number']);

var b2PrismaticJointDef_InitializeAndCreate = Module.cwrap("b2PrismaticJointDef_InitializeAndCreate",
  'number',
  ['number',
    // initialize args
    'number', 'number', 'number',
    'number', 'number', 'number',
    // joint def
    'number',
    // prismatic joint def
    'number', 'number', 'number',
    'number', 'number', 'number']);

function b2PrismaticJointDef() {
  // joint def
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;

  // prismatic joint def
  this.enableLimit = false;
  this.enableMotor = false;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.localAxisA = new b2Vec2(1, 0);
  this.lowerTranslation = 0;
  this.maxMotorForce = 0;
  this.motorSpeed = 0;
  this.referenceAngle = 0;
  this.upperTranslation = 0;
}

b2PrismaticJointDef.prototype.Create = function(world) {
  var prismaticJoint = new b2PrismaticJoint(this);
  prismaticJoint.ptr = b2PrismaticJointDef_Create(
    world.ptr,
    // joint def
    this.bodyA.ptr, this.bodyB.ptr, this.collideConnected,
    //prismatic joint def
    this.enableLimit, this.enableMotor, this.localAnchorA.x,
    this.localAnchorA.y, this.localAnchorB.x, this.localAnchorB.y,
    this.localAxisA.x, this.localAxisA.y, this.lowerTranslation,
    this.maxMotorForce, this.motorSpeed, this.referenceAngle,
    this.upperTranslation);
  return prismaticJoint;
}

b2PrismaticJointDef.prototype.InitializeAndCreate  = function(bodyA, bodyB, anchor, axis) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var prismaticJoint = new b2PrismaticJoint(this);
  prismaticJoint.ptr = b2PrismaticJointDef_InitializeAndCreate(
    world.ptr,
    // InitializeArgs
    this.bodyA.ptr, this.bodyB.ptr, anchor.x,
    anchor.y, axis.x, axis.y,
    // joint def
    this.collideConnected,
    // prismatic joint def
    this.enableLimit, this.enableMotor, this.lowerTranslation,
    this.maxMotorForce, this.motorSpeed, this.upperTranslation);
  world.joints.push(prismaticJoint);
  return prismaticJoint;
}

function b2PrismaticJoint(def) {
  this.ptr = null;
  this.next = null;
}