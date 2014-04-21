// Ropes will leak unless you call delete
/**@constructor*/
function b2Rope() {
  this.ptr = null;
}

b2Rope.prototype.Initialize = function(def) {
  this.ptr = b2Rope_Initialize(
    def.count, def.damping, def.gravity.x,
    def.gravity.y, def.k2, def.k3)
};

b2Rope.prototype.SetAngle = function(angle) {
  b2Rope_SetAngle(this.ptr, angle);
};

/**@constructor*/
function b2RopeDef() {
  this.damping = 0.1;
  this.gravity = new b2Vec2();
  this.k2 = 0.9;
  this.k3 = 0.1;
  this.masses = [];
  this.vertices = [];
}
