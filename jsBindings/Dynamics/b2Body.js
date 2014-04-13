// General body globals
var b2_staticBody = 0;
var b2_kinematicBody = 1;
var b2_dynamicBody = 2;

function b2BodyDef() {
  this.active = true;
  this.allowSleep = true;
  this.angle = 0;
  this.angularVelocity = 0;
  this.angularDamping = 0;
  this.awake = true;
  this.bullet = false;
  this.fixedRotation = false;
  this.gravityScale = 1.0;
  this.linearDamping = 0;
  this.linearVelocity = new b2Vec2();
  this.position = new b2Vec2();
  this.type = b2_staticBody;
  this.userData = null;
}

// b2Body Globals
var b2Body_CreateFixture_b2CircleShape =
  Module.cwrap('b2Body_CreateFixture_b2CircleShape', 'number',
    ['number',
      // Fixture defs
      'number', 'number', 'number', 'number', 'number',
      // Circle members
      'number', 'number',
      'number']);

var b2Body_CreateFixture_b2ChainShape =
  Module.cwrap('b2Body_CreateFixture_b2ChainShape', 'number',
    ['number',
      // Fixture defs
      'number', 'number', 'number', 'number', 'number',
      // Chain vertices and count
      'number', 'number']);

var b2Body_CreateFixture_b2EdgeShape =
  Module.cwrap('b2Body_CreateFixture_b2EdgeShape', 'number',
    ['number',
      // Fixture defs
      'number', 'number', 'number', 'number', 'number',
      // pairs
      'number', 'number',
      'number', 'number']);

var b2Body_CreateFixture_b2PolygonShape_3 =
  Module.cwrap('b2Body_CreateFixture_b2PolygonShape_3', 'number',
    ['number', 
     // Fixture defs
     'number', 'number', 'number', 'number', 'number', 
     // pairs
     'number', 'number', 
     'number', 'number', 
     'number', 'number']);

var b2Body_CreateFixture_b2PolygonShape_4 =
  Module.cwrap('b2Body_CreateFixture_b2PolygonShape_4', 'number',
    ['number', 
     // Fixture defs
     'number', 'number', 'number', 'number', 'number', 
     // b2Vec2
     'number', 'number', 
     'number', 'number', 
     'number', 'number',
     'number', 'number']);

/*var b2Body_CreateFixture_b2BodyDef = 
  Module.cwrap('b2Body_CreateFixture_b2BodyDef', 'number', 
    ['number', 'number']);
var b2Body_CreateFixture_b2Shape = 
  Module.cwrap('b2Body_CreateFixture_b2Shape', 'number', 
    ['number', 'number', 'number']);*/
var b2Body_GetAngle = Module.cwrap('b2Body_GetAngle', 'number', ['number']);
var b2Body_GetFixtureList = 
  Module.cwrap('b2Body_GetFixtureList', 'number', ['number']);
var b2Body_GetNext = Module.cwrap('b2Body_GetNext', 'number', ['number']);
var b2Body_GetPosition = Module.cwrap('b2Body_GetPosition', 'number', ['number']);
var b2Body_GetTransform = Module.cwrap('b2Body_GetTransform', 'null',
  ['number', 'number']);
var b2Body_SetAngularVelocity = Module.cwrap('b2Body_SetAngularVelocity', 'null',
  ['number', 'number']);
var b2Body_SetLinearVelocity = Module.cwrap('b2Body_SetLinearVelocity', 'null',
  ['number', 'number', 'number']);
var b2Body_SetTransform =
  Module.cwrap('b2Body_SetTransform', 'null', ['number', 'number', 'number']);



function b2Body(ptr) {
  this.ptr = ptr;
  this.fixtures = [];
}

b2Body.prototype.CreateFixtureFromDef= function(fixtureDef) {
  var fixture = new b2Fixture();
  fixture.FromFixtureDef(fixtureDef);
  switch (fixtureDef.shape.type) {
    case b2Shape_Type_e_circle:
      fixture.ptr = this._CreateFixtureFromCircle(fixtureDef);
      break;
    case b2Shape_Type_e_edge:
      fixture.ptr = this._CreateFixtureFromEdge(fixtureDef);
      break;
    case b2Shape_Type_e_polygon:
      fixture.ptr = this._CreateFixtureFromPolygon(fixtureDef);
      break;
    case b2Shape_Type_e_chain:
      fixture.ptr = this._CreateFixtureFromChain(fixtureDef);
      break;
  }
  this.fixtures.push(fixture);
}

b2Body.prototype._CreateFixtureFromCircle = function(fixtureDef) {
  var circle = fixtureDef.shape;
  return b2Body_CreateFixture_b2CircleShape(this.ptr,
    // fixture Def
    fixtureDef.density, fixtureDef.friction, fixtureDef.isSensor,
    fixtureDef.restitution, fixtureDef.userData,
    // circle data
    circle.position.x, circle.position.y, circle.radius);
}

b2Body.prototype._CreateFixtureFromChain = function(fixtureDef) {
  var chain = fixtureDef.shape;
  var vertices = chain.vertices;
  var chainLength = vertices.length;
  var dataLength = chainLength * 2;
  var data = new Float32Array(dataLength);

  for (var i = 0, j = 0; i < dataLength; i += 2, j++) {
    data[i] = vertices[j].x;
    data[i+1] = vertices[j].y;
  }

  // Get data byte size, allocate memory on Emscripten heap, and get pointer
  var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
  var dataPtr = Module._malloc(nDataBytes);

  // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
  var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
  dataHeap.set(new Uint8Array(data.buffer));

  // Call function and get result
  var fixture = b2Body_CreateFixture_b2ChainShape(this.ptr,
    // fixture def
    fixtureDef.density, fixtureDef.friction, fixtureDef.isSensor,
    fixtureDef.restitution, fixtureDef.userData,
    // vertices and length
    dataHeap.byteOffset, data.length);

  // Free memory
  Module._free(dataHeap.byteOffset);
  return fixture;
}

b2Body.prototype._CreateFixtureFromEdge = function(fixtureDef) {
  var edge = fixtureDef.shape;
  return b2Body_CreateFixture_b2EdgeShape(this.ptr,
    // fixture Def
    fixtureDef.density, fixtureDef.friction, fixtureDef.isSensor,
    fixtureDef.restitution, fixtureDef.userData,
    // edge data
    edge.v0.x, edge.v0.y,
    edge.v1.x, edge.v1.y);
}


b2Body.prototype._CreateFixtureFromPolygon = function(fixtureDef) {
  var vertices = fixtureDef.shape.vertices;
  switch (vertices.length) {
    case 3:
      var v0 = vertices[0];
      var v1 = vertices[1];
      var v2 = vertices[2];
      return b2Body_CreateFixture_b2PolygonShape_3(this.ptr,
        // fixture Def
        fixtureDef.density, fixtureDef.friction, fixtureDef.isSensor,
        fixtureDef.restitution, fixtureDef.userData,
        // points
        v0.x, v0.y,
        v1.x, v1.y,
        v2.x, v2.y);
      break;
    case 4:
      var v0 = vertices[0];
      var v1 = vertices[1];
      var v2 = vertices[2];
      var v3 = vertices[3];
      return b2Body_CreateFixture_b2PolygonShape_4(this.ptr,
        // fixture Def
        fixtureDef.density, fixtureDef.friction, fixtureDef.isSensor,
        fixtureDef.restitution, fixtureDef.userData,
        // points
        v0.x, v0.y,
        v1.x, v1.y,
        v2.x, v2.y,
        v3.x, v3.y);
      break;
  } 
}

b2Body.prototype.CreateFixtureFromShape = function(shape, density) {
  var fixtureDef = new b2FixtureDef();
  fixtureDef.shape = shape;
  fixtureDef.density = density;
  this.CreateFixtureFromDef(fixtureDef);
}

b2Body.prototype.GetFixtureList = function() {
  return new b2Fixture(b2Body_GetFixtureList(this.ptr));
}

b2Body.prototype.GetNext = function() {
  return new b2Body(b2Body_GetNext(this.ptr));
}

b2Body.prototype.GetAngle = function() {
  return b2Body_GetAngle(this.ptr);
}

b2Body.prototype.GetPosition = function() {
  var position = new b2Vec2(10, 30);
  position.ptr = b2Body_GetPosition(this.ptr);
  return position;
}


// This function is not efficient, optimize it later to allocate the stoarge
// on the heap only once
b2Body.prototype.GetTransform = function() {
//Create example data to test float_multiply_array
  var data = new Float32Array([1, 2, 3, 4, 5]);

  // Get data byte size, allocate memory on Emscripten heap, and get pointer
  var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
  var dataPtr = Module._malloc(nDataBytes);

  // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
  var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
  dataHeap.set(new Uint8Array(data.buffer));

  // Call function and get result
  b2Body_GetTransform(this.ptr, dataHeap.byteOffset);
  var result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, data.length);
  
  var transform = new b2Transform(); 
  transform.FromFloat64Array(result);
  return transform;
  
  // Free memory
  Module._free(dataHeap.byteOffset);
}

b2Body.prototype.SetAngularVelocity = function(angle) {
  b2Body_SetAngularVelocity(this.ptr, angle);
}

b2Body.prototype.SetLinearVelocity = function(v) {
  b2Body_SetLinearVelocity(this.ptr, v.x, v.y);
}

b2Body.prototype.SetTransform = function(v, angle) {
  b2Body_SetTransform(this.ptr, v.x, v.y, angle);
}
