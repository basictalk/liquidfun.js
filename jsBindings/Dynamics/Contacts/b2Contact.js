// TODO this can all be done better, wayyy too manyy calls between asm and js
// a b2contact looks like: (actually this is wrong, not sure why, but the values below are correct
/*
uint32 m_flags; // 0
b2Contact* m_prev; // 4
b2Contact* m_next; // 8
b2ContactEdge m_nodeA; // 12 // each of these is 16 bytes, 4 ptrs
b2ContactEdge m_nodeB; // 28
b2Fixture* m_fixtureA; //44
b2Fixture* m_fixtureB; //48
int32 m_indexA;
int32 m_indexB;
b2Manifold m_manifold; a manifold is 20 bytes
int32 m_toiCount;
float32 m_toi;
float32 m_friction;
float32 m_restitution;
float32 m_tangentSpeed;*/

var b2Contact_fixtureA_offset = 48;
var b2Contact_fixtureB_offset = 52;

var b2Contact_GetManifold = Module.cwrap('b2Contact_GetManifold', 'number', ['number']);
/**@constructor*/
function b2Contact(ptr) {
  this.ptr = ptr;
  this.buffer = new DataView(Module.HEAPU8.buffer, ptr);
/*  console.log("test");
  for (var i = 0; i < 128; i += 4) {
    console.log(i, this.buffer.getUint32(i, true).toString(16));
  }*/
/*
  console.log(this.buffer.getUint32(4).toString(16));
  console.log(this.buffer.getUint32(8).toString(16));
  console.log(this.buffer.getUint32(40).toString(16));
  console.log(this.buffer.getUint32(44).toString(16));
  console.log(this.buffer.getUint32(48).toString(16));*/
}

b2Contact.prototype.GetFixtureA = function() {
  var fixAPtr = this.buffer.getUint32(b2Contact_fixtureA_offset, true);
  return world.fixturesLookup[fixAPtr];
  //console.log(world.fixturesLookup[fixAPtr].detail);
};

b2Contact.prototype.GetFixtureB = function() {
  var fixBPtr = this.buffer.getUint32(b2Contact_fixtureB_offset, true);
  return world.fixturesLookup[fixBPtr];
  //console.log(fixBPtr);
  //console.log(world.fixturesLookup[fixBPtr].detail);
};

b2Contact.prototype.GetManifold = function() {
  return new b2Manifold(b2Contact_GetManifold(this.ptr));
};
