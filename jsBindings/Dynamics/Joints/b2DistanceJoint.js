var b2DistanceJointDef_Create = Module.cwrap("b2DistanceJointDef_Create",
  'number',
  ['number',
    // joint Def
    'number', 'number', 'number',
    // friction joint def
    'number', 'number', 'number',
    'number', 'number', 'number',
    'number']);

var b2DistanceJointDef_InitializeAndCreate = Module.cwrap("b2DistanceJointDef_InitializeAndCreate",
  'number',
  ['number',
    // initialize args
    'number', 'number', 'number',
    'number', 'number', 'number',
    // friction joint def
    'number', 'number', 'number']);

function b2DistanceJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.dampingRatio = 0;
  this.length = 1;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.frequencyHz = 0;
}

b2DistanceJointDef.prototype.Create = function(world) {
  var distanceJoint = new b2DistanceJoint(this);
  distanceJoint.ptr = b2DistanceJointDef_Create(
    world.ptr,
    // joint def
    this.bodyA.ptr, this.bodyB.ptr, this.collideConnected,
    //distance joint def
    this.dampingRatio, this.frequencyHz, this.length,
    this.localAnchorA.x, this.localAnchorA.y,
    this.localAnchorB.x, this.localAnchorB.y);
  return distanceJoint;
}

b2DistanceJointDef.prototype.InitializeAndCreate  = function(bodyA, bodyB, anchor) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var distanceJoint = new b2DistanceJoint(this);
  distanceJoint.ptr = b2DistanceJointDef_InitializeAndCreate(
    world.ptr,
    // InitializeArgs
    this.bodyA.ptr, this.bodyB.ptr, anchor.x,
    anchor.y,
    // joint def
    this.collideConnected,
    //distance joint def
    this.dampingRatio, this.frequencyHz);
  world.joints.push(distanceJoint);
  return distanceJoint;
}

function b2DistanceJoint(def) {
  this.bodyA = def.bodyA;
  this.bodyB = def.bodyB;
  this.ptr = null;
  this.next = null;
}