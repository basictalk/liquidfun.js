/**
 * Created by joshualitt on 4/11/14.
 */

function b2EdgeShape() {
  this.type = b2Shape_Type_e_edge;
  this.v0 = new b2Vec2();
  this.v1 = new b2Vec2();
}

b2EdgeShape.prototype.Set = function(v0, v1) {
  this.v0 = v0;
  this.v1 = v1;
}