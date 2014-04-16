var b2GearJointDef_Create = Module.cwrap("b2GearJointDef_Create",
  'number',
  ['number',
    // joint Def
    'number', 'number', 'number',
    // gear joint def
    'number', 'number', 'number']);

function b2GearJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.joint1 = null;
  this.joint2 = null;
  this.ratio = 0;
}

b2GearJointDef.prototype.Create = function(world) {
  var gearJoint = new b2GearJoint(this);
  gearJoint.ptr = b2GearJointDef_Create(
    world.ptr,
    // joint def
    this.bodyA.ptr, this.bodyB.ptr, this.collideConnected,
    //gear joint def
    this.joint1, this.joint2, this.ratio);
  return gearJoint;
};

function b2GearJoint(def) {
  this.ptr = null;
  this.next = null;
}