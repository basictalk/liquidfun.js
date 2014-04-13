/**
 * Created by joshualitt on 4/11/14.
 */

// TODO I can do a much better job reusing geometry by attaching it to a given shape
// todo circles don't take into account their center
function init() {
  world.particleGeometry = initParticleGeometry();
  for (var i = 0, max = world.bodies.length; i < max; i++) {
    var body = world.bodies[i];
    var maxFixtures = body.fixtures.length;
    var transform = body.GetTransform();
    for (var j = 0; j < maxFixtures; j++) {
      initFixture(body.fixtures[j], transform);
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
    var transform = body.GetTransform();
    for (var j = 0; j < maxFixtures; j++) {
      drawFixture(body.fixtures[j], transform);
    }
  }

  // draw particle systems
  for (var i = 0, max = world.particleSystems.length; i < max; i++) {
    drawParticleSystem(world.particleSystems[i]);
  }
}

// geometry init code
function initFixture(fixture, transform) {
  switch (fixture.shape.type) {
    case b2Shape_Type_e_circle:
      initCircle(fixture, transform);
      break;
    case b2Shape_Type_e_edge:
      initEdge(fixture, transform);
      break;
    case b2Shape_Type_e_polygon:
      initPolygon(fixture, transform);
      break;
    case b2Shape_Type_e_chain:
      initChain(fixture, transform);
      break;
    default:
      console.log("Shape unsupported");
  }
}

function initCircle(circleFixture, transform) {
  var radius = circleFixture.shape.radius,
    material = new THREE.LineBasicMaterial( { color: 0x0000ff }),
    resolution = 8,
    size = 360 / resolution,
    geometry = new THREE.Geometry(),
    transformedV = new b2Vec2();

  // draw line from midpoint out
  geometry.vertices.push(new THREE.Vector3(0, 0));
  circleFixture.vertices.push(new b2Vec2(0, 0));
  for(var i = 0; i <= resolution; i++) {
    var segment = ( i * size ) * Math.PI / 180;
    var vertex = new THREE.Vector3(Math.cos( segment ) * radius, Math.sin( segment ) * radius, 0);
    b2Vec2.Mul(transformedV, transform, vertex);
    circleFixture.vertices.push(vertex);
    geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y));
  }

  var line = new THREE.Line(geometry, material);
  circleFixture.graphic = line;
  scene.add(line);
}

function initChain(chainFixture, transform) {
  var geometry = new THREE.Geometry(),
    material =  new THREE.LineBasicMaterial({color: 0x000000}),
    transformedV = new b2Vec2(),
    chain = chainFixture.shape,
    vertices = chain.vertices;

  var v1 = vertices[0];
  for (var i = 1, max = vertices.length; i < max; i++) {
    b2Vec2.Mul(transformedV, transform, v1);
    geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));

    var v2 = vertices[i];
    b2Vec2.Mul(transformedV, transform, v2);
    geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));
    v1 = v1;
  }

  var line = new THREE.Line(geometry, material);
  chainFixture.graphic = line;
  scene.add(line);
}

function initEdge(edgeFixture, transform) {
  var geometry = new THREE.Geometry(),
    material =  new THREE.LineBasicMaterial({color: 0x000000}),
    transformedV = new b2Vec2(),
    edge = edgeFixture.shape;

  b2Vec2.Mul(transformedV, transform, edge.v0);
  geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));

  b2Vec2.Mul(transformedV, transform, edge.v1);
  geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));

  var line = new THREE.Line(geometry, material);
  edgeFixture.graphic = line;
  scene.add(line);
}

function initPolygon(polygonFixture, transform) {
  var polygon = polygonFixture.shape,
    vertexCount = polygon.vertices.length,
    geometry, material,
    transformedV = new b2Vec2();

  geometry = new THREE.Geometry();
  material = new THREE.LineBasicMaterial({color: 0x000000})
  for (var i = 0; i < vertexCount; i++) {
    var vertex = polygon.vertices[i];
    b2Vec2.Mul(transformedV, transform, vertex);
    geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));
  }
  // Create a loop
  geometry.vertices.push(geometry.vertices[0]);

  var line = new THREE.Line(geometry, material);
  polygonFixture.graphic = line;
  scene.add(line);
}

function initParticleGeometry() {
  var resolution = 4,
    radius = 0.025,
    size = 360 / resolution,
    geometry = new THREE.Geometry();
  for(var i = 0; i <= resolution; i++) {
    var segment = ( i * size ) * Math.PI / 180;
    var vertex = new THREE.Vector3(Math.cos( segment ) * radius, Math.sin( segment ) * radius, 0);
    geometry.vertices.push(vertex);
  }
  return geometry;
}

function initParticleSystem(system) {
  var particles = system.GetPositionBuffer(),
    maxParticles = particles.length,
    material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

  for (var i = 0; i < maxParticles; i += 2) {
    var line = new THREE.Line(world.particleGeometry, material);
    line.position.x = particles[i];
    line.position.y = particles[i + 1];
    system.graphics.push(line);
    scene.add(line);
  }

  system.DeletePositionBuffer();
}

// redraw code
function drawFixture(fixture, transform) {
  switch (fixture.shape.type) {
    case b2Shape_Type_e_circle:
      drawCircle(fixture, transform);
      break;
    case b2Shape_Type_e_edge:
      drawEdge(fixture, transform);
      break;
    case b2Shape_Type_e_polygon:
      drawPolygon(fixture, transform);
      break;
    case b2Shape_Type_e_chain:
      drawChain(fixture, transform);
      break;
    default:
      console.log("Shape unsupported");
  }
}

function drawCircle(circleFixture, transform) {
  var line = circleFixture.graphic,
    geometry = line.geometry,
    vertexCount = geometry.vertices.length,
    transformedV = new b2Vec2(),
    circlePosition = circleFixture.shape.position,
    center = new b2Vec2(circlePosition.x, circlePosition.y);

  //b2Vec2.Mul(center, transform, center);
  //line.position.x = center.x;
  //line.position.y = center.y;
  for (var i = 0; i < vertexCount; i++) {
    var vertex = circleFixture.vertices[i];
    b2Vec2.Mul(transformedV, transform, vertex);
    geometry.vertices[i].x = transformedV.x + center.x;
    geometry.vertices[i].y = transformedV.y + center.y;

  }
  geometry.verticesNeedUpdate = true;
}

function drawChain(chainFixture, transform) {
  var transformedV = new b2Vec2(),
    chain = chainFixture.shape,
    chainVertices = chain.vertices,
    line = chainFixture.graphic,
    geometry = line.geometry,
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

function drawEdge(edgeFixture, transform) {
  var transformedV = new b2Vec2(),
    edge = edgeFixture.shape,
    line = edgeFixture.graphic,
    geometry = line.geometry;

  b2Vec2.Mul(transformedV, transform, edge.v0);
  geometry.vertices[0].x = transformedV.x;
  geometry.vertices[0].y = transformedV.y;

  b2Vec2.Mul(transformedV, transform, edge.v1);
  geometry.vertices[1].x = transformedV.x;
  geometry.vertices[1].y = transformedV.y;
  geometry.verticesNeedUpdate = true;
}

function drawPolygon(polygonFixture, transform) {
  var polygon = polygonFixture.shape,
    vertexCount = polygon.vertices.length,
    transformedV = new b2Vec2(),
    line = polygonFixture.graphic,
    geometry = line.geometry;

  for (var i = 0; i < vertexCount; i++) {
    var vertex = polygon.vertices[i];
    b2Vec2.Mul(transformedV, transform, vertex);
    geometry.vertices[i].x = transformedV.x;
    geometry.vertices[i].y = transformedV.y;
  }
  geometry.vertices[vertexCount] = geometry.vertices[0];
  geometry.verticesNeedUpdate = true;
}

function drawParticleSystem(system) {
  var particles = system.GetPositionBuffer();
  var maxParticles = particles.length;

  if (system.graphics === undefined) {
    initParticleSystem(system);
  }

  for (var i = 0, j = 0; i < maxParticles; i += 2, j++) {
    var index = j;
    if (system.graphics[index] == undefined) {
      var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
      for (; i < maxParticles; i += 2, j++) {
        index = j;
        var line = new THREE.Line(world.particleGeometry, material);
        line.position.x = particles[i];
        line.position.y = particles[i + 1];
        system.graphics.push(line);
        scene.add(line);
      }
      system.DeletePositionBuffer();
      return;
    }
    system.graphics[index].position.x = particles[i];
    system.graphics[index].position.y = particles[i + 1];
  }

  system.DeletePositionBuffer();
}