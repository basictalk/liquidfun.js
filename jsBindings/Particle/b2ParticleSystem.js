function b2ParticleSystemDef() {
  // Initialize physical coefficients to the maximum values that
  // maintain numerical stability.
  this.colorMixingStrength = 0.5;
  this.dampingStrength = 1.0;
  this.destroyByAge = true;
  this.ejectionStrength = 0.5;
  this.elasticStrength = 0.25;
  this.lifetimeGranularity = 1.0 / 60.0;
  this.powderStrength = 0.5;
  this.pressureStrength = 0.05;
  this.radius = 1.0;
  this.repulsiveStrength = 1.0;
  this.springStrength = 0.25;
  this.staticPressureIterations = 8;
  this.staticPressureRelaxation = 0.2;
  this.staticPressureStrength = 0.2;
  this.surfaceTensionNormalStrength = 0.2;
  this.surfaceTensionPressureStrength = 0.2;
  this.viscousStrength = 0.25;
}

var b2ParticleSystem_CreateParticle =
  Module.cwrap('b2ParticleSystem_CreateParticle', 'number',
  ['number',
    //particle def
    'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
    'number', 'number', 'number', 'number'
  ]);

var b2ParticleSystem_CreateParticleGroup_b2CircleShape =
  Module.cwrap('b2ParticleSystem_CreateParticleGroup_b2CircleShape', 'number',
  ['number',
    // particleGroupDef
   'number', 'number', 'number', 'number', 'number', 'number', 'number',
   'number', 'number', 'number', 'number', 'number', 'number', 'number',
   'number', 'number', 'number', 'number', 'number',
   //Circle
   'number', 'number', 'number'
  ]);

var b2ParticleSystem_CreateParticleGroup_b2PolygonShape_4 =
  Module.cwrap('b2ParticleSystem_CreateParticleGroup_b2PolygonShape_4', 'number',
    ['number',
      // particleGroupDef
      'number', 'number', 'number', 'number', 'number', 'number', 'number',
      'number', 'number', 'number', 'number', 'number', 'number', 'number',
      'number', 'number', 'number', 'number', 'number',
      // polygon
      'number', 'number',
      'number', 'number',
      'number', 'number',
      'number', 'number'
    ]);

var b2ParticleSystem_GetParticleCount =
  Module.cwrap('b2ParticleSystem_GetParticleCount', 'number', ['number']);

var b2ParticleSystem_GetPositionBuffer =
  Module.cwrap('b2ParticleSystem_GetPositionBuffer', 'null', ['number', 'number']);

function b2ParticleSystem(ptr) {
  this.ptr = ptr;
  this.particleGroups = [];
  this.graphics = [];
}

b2ParticleSystem.prototype.CreateParticle = function(pd) {
  return b2ParticleSystem_CreateParticle(this.ptr,
    pd.color.r, pd.color.g, pd.color.b, pd.color.a, pd.flags, pd.group,
    pd.lifetime, pd.position.x, pd.position.y, pd.userData,
    pd.velocity.x, pd.velocity.y);
}


b2ParticleSystem.prototype.CreateParticleGroup = function(pgd) {
  var particleGroup = new b2ParticleGroup();
  switch (pgd.shape.type) {
    case b2Shape_Type_e_circle:
      particleGroup.ptr = this._CreateParticleGroupFromCircle(pgd);
      break;
    case b2Shape_Type_e_edge:
      break;
    case b2Shape_Type_e_polygon:
      particleGroup.ptr = this._CreateParticleGroupFromPolygon(pgd);
      break;
    case b2Shape_Type_e_chain:
      break;
  }
  this.particleGroups.push(particleGroup);
}

// particle group creation helpers
b2ParticleSystem.prototype._CreateParticleGroupFromCircle = function(pgd) {
  var circle = pgd.shape;
  var pg = new b2ParticleGroup(b2ParticleSystem_CreateParticleGroup_b2CircleShape(
    this.ptr,
    // particle group def
    pgd.angle,  pgd.angularVelocity, pgd.color.r, pgd.color.g, pgd.color.b, pgd.color.a,
    pgd.flags, pgd.group.ptr, pgd.groupFlags, pgd.lifetime, pgd.linearVelocity.x,
    pgd.linearVelocity.y, pgd.position.x, pgd.position.y, pgd.positionData, pgd.particleCount,
    pgd.strength, pgd.stride, pgd.userData,
    // circle
    circle.position.x, circle.position.y, circle.radius));
  return pg;
}

b2ParticleSystem.prototype._CreateParticleGroupFromPolygon = function(pgd) {
  var v = pgd.shape.vertices;
  switch (v.length) {
    case 3:
      break;
    case 4:
      var pg = new b2ParticleGroup(b2ParticleSystem_CreateParticleGroup_b2PolygonShape_4(
        this.ptr,
        // particle group def
        pgd.angle,  pgd.angularVelocity, pgd.color.r, pgd.color.g, pgd.color.b, pgd.color.a,
        pgd.flags, pgd.group.ptr, pgd.groupFlags, pgd.lifetime, pgd.linearVelocity.x,
        pgd.linearVelocity.y, pgd.position.x, pgd.position.y, pgd.positionData, pgd.particleCount,
         pgd.strength, pgd.stride, pgd.userData,
        // polygon
        v[0].x, v[0].y,
        v[1].x, v[1].y,
        v[2].x, v[2].y,
        v[3].x, v[3].y));
      return pg;
      break;
  }

}


// was just about to wire this up, gl hf

//this function can be optimized to reuse its buffer potentially
b2ParticleSystem.prototype.GetPositionBuffer = function() {
  var count = b2ParticleSystem_GetParticleCount(this.ptr);
  //Create example data to test float_multiply_array
  var data = new Float32Array(2 * count);

  // Get data byte size, allocate memory on Emscripten heap, and get pointer
  var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
  var dataPtr = Module._malloc(nDataBytes);

  // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
  var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
  dataHeap.set(new Uint8Array(data.buffer));

  // Call function and get result
  b2ParticleSystem_GetPositionBuffer(this.ptr, dataHeap.byteOffset);
  var result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, data.length);

  this.bufferPtr = dataHeap.byteOffset;
  //Module._free(dataHeap.byteOffset);

  return result;
}

b2ParticleSystem.prototype.DeletePositionBuffer = function() {
  Module._free(this.bufferPtr);
}