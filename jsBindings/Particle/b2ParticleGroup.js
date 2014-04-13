/// Prevents overlapping or leaking.
var b2_solidParticleGroup = 1 << 0;
/// Keeps its shape.
var b2_rigidParticleGroup = 1 << 1;
/// Won't be destroyed if it gets empty.
var b2_particleGroupCanBeEmpty = 1 << 2;
/// Will be destroyed on next simulation step.
var b2_particleGroupWillBeDestroyed = 1 << 3;
/// Updates depth data on next simulation step.
var b2_particleGroupNeedsUpdateDepth = 1 << 4;
var b2_particleGroupInternalMask =
    b2_particleGroupWillBeDestroyed |
    b2_particleGroupNeedsUpdateDepth;

function b2ParticleGroupDef() {
  this.angle = 0;
  this.angularVelocity = 0;
  this.color = new b2ParticleColor(0, 0, 0, 0);
  this.flags = 0;
  this.group = new b2ParticleGroup(null);
  this.groupFlags = 0;
  this.lifetime = 0.0;
  this.linearVelocity = new b2Vec2();
  this.position = new b2Vec2();
  this.positionData = null;
  this.particleCount = 0;
  this.shape = null;
  //this.shapeCount = 0;
  //this.shapes = null; // not supported currently
  this.strength = 1;
  this.stride = 0;
  this.userData = null;
}

function b2ParticleGroup(ptr) {
  this.ptr = ptr;
}