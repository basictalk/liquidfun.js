/**
 * Created by joshualitt on 4/11/14.
 */

// TODO I can do a much better job reusing geometry by attaching it to a given shape
// todo circles don't take into account their center
// todo rotate

function initUnitCircle() {
  var resolution = 8,
    radius = 1,
    size = 360 / resolution,
    geometry = new THREE.Geometry();
  for(var i = 0; i <= resolution; i++) {
    var segment = ( i * size ) * Math.PI / 180;
    var vertex = new THREE.Vector3(Math.cos( segment ) * radius, Math.sin( segment ) * radius, 0);
    geometry.vertices.push(vertex);
  }
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  return geometry;
}

function init() {
  this.updateColorParticles = false;
  world.unitCircle = initUnitCircle();
  for (var i = 0, max = world.bodies.length; i < max; i++) {
    var body = world.bodies[i];
    var maxFixtures = body.fixtures.length;
    var transform = body.GetTransform_Test();
    //test code TODo REMOVE
    var bGood = body.GetTransform();
    var bTest = body.GetTransform_Test();
    if (bGood.p.x === bTest.p.x && bGood.p.y === bTest.p.y &&
      bGood.q.s === bTest.q.s && bTest.q.c === bGood.q.c) {
      //console.log("alright!");
    } else {
      console.log("not good")
    }
    for (var j = 0; j < maxFixtures; j++) {
      var fixture = body.fixtures[j];
      fixture.shape.drawInit(fixture, transform);
    }
  }

  // draw particle systems
  for (var i = 0, max = world.particleSystems.length; i < max; i++) {
    initParticleSystem(world.particleSystems[i]);
  }
}
function draw() {
  for (var i = 0, max = world.bodies.length; i < max; i++) {
    var body = world.bodies[i];
    var maxFixtures = body.fixtures.length;
    var transform = body.GetTransform_Test();
    //test code TODo REMOVE
    var bGood = body.GetTransform();
    var bTest = body.GetTransform_Test();
    if (bGood.p.x === bTest.p.x && bGood.p.y === bTest.p.y &&
      bGood.q.s === bTest.q.s && bTest.q.c === bGood.q.c) {
      //console.log("alright!");
    } else {
      console.log("not good")
    }
    for (var j = 0; j < maxFixtures; j++) {
      var fixture = body.fixtures[j];
      fixture.shape.draw(fixture, transform);
    }
  }

  // draw particle systems
  for (var i = 0, max = world.particleSystems.length; i < max; i++) {
    drawParticleSystem(world.particleSystems[i]);
  }
}

// geometry init code
b2ChainShape.prototype.drawInit = function(fixture, transform) {
  var geometry = new THREE.Geometry(),
    material =  new THREE.LineBasicMaterial({color: 0x000000}),
    transformedV = new b2Vec2(),
    vertices = this.vertices;

  var v1 = vertices[0];
  b2Vec2.Mul(transformedV, transform, v1);
  geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));
  for (var i = 1, max = vertices.length; i < max; i++) {
    var v2 = vertices[i];
    b2Vec2.Mul(transformedV, transform, v2);
    geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));
    v1 = v2;
  }

  var line = new THREE.Line(geometry, material);
  fixture.graphic = line;
  scene.add(line);
};

// todo this should se the transform
b2CircleShape.prototype.drawInit = function(fixture, transform) {
  var radius = this.radius,
    material = new THREE.LineBasicMaterial( { color: 0x0000ff });

  // draw line from midpoint out
  var line = new THREE.Line(world.unitCircle, material);
  line.scale.x = radius;
  line.scale.y = radius;
  line.scale.z = radius;
  fixture.graphic = line;
  scene.add(line);
};

b2EdgeShape.prototype.drawInit = function(fixture, transform) {
  var geometry = new THREE.Geometry(),
    material =  new THREE.LineBasicMaterial({color: 0x000000}),
    transformedV = new b2Vec2();

  b2Vec2.Mul(transformedV, transform, this.vertex1);
  geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));

  b2Vec2.Mul(transformedV, transform, this.vertex2);
  geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));

  var line = new THREE.Line(geometry, material);
  fixture.graphic = line;
  scene.add(line);
};

b2PolygonShape.prototype.drawInit = function(fixture, transform) {
  var vertexCount = this.vertices.length,
    geometry, material,
    transformedV = new b2Vec2();

  geometry = new THREE.Geometry();
  material = new THREE.LineBasicMaterial({color: 0x000000})
  for (var i = 0; i < vertexCount; i++) {
    var vertex = this.vertices[i];
    b2Vec2.Mul(transformedV, transform, vertex);
    geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));
  }
  // Create a loop
  geometry.vertices.push(geometry.vertices[0]);

  var line = new THREE.Line(geometry, material);
  fixture.graphic = line;
  scene.add(line);
};

function initParticleSystem(system) {
  var particles = system.GetPositionBuffer(),
    maxParticles = particles.length;
  var color = system.GetColorBuffer();

  for (var i = 0, c = 0; i < maxParticles; i += 2, c += 4) {
    var col = new THREE.Color("rgb(" + color[c] + "," + color[c+1] + "," + color[c+2] +")");
    var material = new THREE.LineBasicMaterial( { color: col } );
    material.color = col;
    var line = new THREE.Line(world.unitCircle, material);
    line.position.x = particles[i];
    line.position.y = particles[i + 1];
    line.scale.x = system.radius;
    system.graphics.push(line);
    scene.add(line);
  }
}

b2CircleShape.prototype.draw = function(fixture, transform) {
  var line = fixture.graphic;
  if (line === undefined) {
    this.drawInit(fixture, transform);
    return;
  }
  var geometry = line.geometry,
    circlePosition = this.position,
    center = new b2Vec2(circlePosition.x, circlePosition.y);

  line.rotation.z = fixture.body.GetAngle();
  b2Vec2.Mul(center, transform, center);
  line.position.x = center.x;
  line.position.y = center.y;

  geometry.verticesNeedUpdate = true;
};

b2ChainShape.prototype.draw = function(fixture, transform) {
  var transformedV = new b2Vec2(),
    chainVertices = this.vertices,
    line = fixture.graphic;
  if (line === undefined) {
    this.drawInit(fixture, transform);
    return;
  }
  var geometry = line.geometry,
    vertices = geometry.vertices,
    vertexCount = chainVertices.length;

  for(var i = 0; i < vertexCount; i++) {
    var vertex = chainVertices[i];
    b2Vec2.Mul(transformedV, transform, vertex);
    vertices[i].x = transformedV.x;
    vertices[i].y = transformedV.y;
  }
  geometry.verticesNeedUpdate = true;
}

b2EdgeShape.prototype.draw = function(fixture, transform) {
  var transformedV = new b2Vec2(),
    line = fixture.graphic,
    geometry = line.geometry;

  b2Vec2.Mul(transformedV, transform, this.vertex1);
  geometry.vertices[0].x = transformedV.x;
  geometry.vertices[0].y = transformedV.y;

  b2Vec2.Mul(transformedV, transform, this.vertex2);
  geometry.vertices[1].x = transformedV.x;
  geometry.vertices[1].y = transformedV.y;
  geometry.verticesNeedUpdate = true;
}

b2PolygonShape.prototype.draw = function(fixture, transform) {
  var vertexCount = this.vertices.length,
    transformedV = new b2Vec2(),
    line = fixture.graphic;
  if (line === undefined) {
    this.drawInit(fixture, transform);
    return;
  }
  var geometry = line.geometry;

  for (var i = 0; i < vertexCount; i++) {
    var vertex = this.vertices[i];
    b2Vec2.Mul(transformedV, transform, vertex);
    geometry.vertices[i].x = transformedV.x;
    geometry.vertices[i].y = transformedV.y;
  }
  geometry.vertices[vertexCount] = geometry.vertices[0];
  geometry.verticesNeedUpdate = true;
}

function drawParticleSystem(system) {
  var particles = system.GetPositionBuffer();
  var color = system.GetColorBuffer();
  var maxParticles = particles.length;

  if (system.graphics === undefined) {
    initParticleSystem(system);
  }

  for (var i = 0, j = 0, c = 0; i < maxParticles; i += 2, j++, c+=4) {
    var index = j;
    if (system.graphics[index] == undefined) {
      var material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      for (; i < maxParticles; i += 2, j++) {
        index = j;
        var line = new THREE.Line(world.unitCircle, material);
        line.position.x = particles[i];
        line.position.y = particles[i + 1];
        line.scale.x = system.radius;
        line.scale.y = system.radius;
        line.scale.z = system.radius;
        system.graphics.push(line);
        scene.add(line);
      }
      return;
    }
    var line = system.graphics[index];
    line.position.x = particles[i];
    line.position.y = particles[i + 1];
    line.scale.x = system.radius;
    line.scale.y = system.radius;
    line.scale.z = system.radius;
    if (renderer.updateColorParticles) {
    line.material.color = new THREE.Color("rgb(" + color[c] + "," + color[c + 1] + "," + color[c + 2] + ")");
    }
  }
}