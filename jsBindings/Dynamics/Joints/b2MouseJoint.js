var b2MouseJointDef_Create = Module.cwrap("b2MouseJointDef_Create",
  'number',
  ['number',
    // joint Def
    'number', 'number', 'number',
    // mouse joint def
    'number', 'number', 'number',
    'number', 'number']);

function b2MouseJointDef() {
  // joint def
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;

  // mouse joint def
  this.dampingRatio = null;
  this.frequencyHz = null;
  this.maxForce = null;
  this.target = new b2Vec2();
}

b2MouseJointDef.prototype.Create = function(world) {
  var mouseJoint = new b2MouseJoint(this);
  mouseJoint.ptr = b2MouseJointDef_Create(
    world.ptr,
    // joint def
    this.bodyA.ptr, this.bodyB.ptr, this.collideConnected,
    //mouse joint def
    this.dampingRatio, this.frequencyHz, this.maxForce,
    this.target.x, this.target.y);
  return mouseJoint;
}

function b2MouseJoint(def) {
  this.ptr = null;
  this.next = null;
}