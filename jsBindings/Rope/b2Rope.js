

/**@constructor*/
function b2RopeDef() {
  this.damping = 0.1;
  this.gravity = new b2Vec2();
  this.k2 = 0.9;
  this.k3 = 0.1;
  this.masses = [];
  this.vertices = [];
}

b2RopeDef.prototype.Initialize = function() {

}