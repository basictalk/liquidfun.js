/**
 * Created by joshualitt on 4/11/14.
 */
function draw(redraw) {
  var maxBodies = world.bodies.length;
  for (var i = 0; i < maxBodies; i++) {
    var body = world.bodies[i];
    var maxFixtures = body.fixtures.length;
    var transform = body.GetTransform();
    console.log(transform.q.s + " " + transform.q.c);
    for (var j = 0; j < maxFixtures; j++) {
      drawFixture(body.fixtures[j], transform, redraw);
    }
  }
}

function drawFixture(fixture, transform, redraw) {
  var shape = fixture.shape;
  switch (shape.type) {
    case b2Shape_Type_e_circle:
      drawCircle(shape, transform, redraw);
      break;
    case b2Shape_Type_e_edge:
      drawEdge(shape, transform, redraw);
      break;
    case b2Shape_Type_e_polygon:
      drawPolygon(shape, transform, redraw);
      break;
    case b2Shape_Type_e_chain:
      break;
    default:
      console.log("Shape unsupported");
  }
}

function drawCircle(circle, transform, redraw) {
  if (redraw === false) {
    var radius = circle.radius;
    var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    var resolution = 32;
    var size = 360 / resolution;

    var geometry = new THREE.Geometry();
    var transformedV = new b2Vec2();
    for(var i = 0; i <= resolution; i++) {
      var segment = ( i * size ) * Math.PI / 180;
      var vertex = new THREE.Vector3(Math.cos( segment ) * radius, Math.sin( segment ) * radius, 0);
      circle.vertices.push(new b2Vec2(vertex.x, vertex.y));
      b2Vec2.Mul(transformedV, transform, vertex);
      geometry.vertices.push(vertex);
    }

    var line = new THREE.Line(geometry, material);
    circle.graphic = line;
    scene.add(line);
  } else {
    var line = circle.graphic;
    geometry = line.geometry;
    var vertexCount = geometry.vertices.length;
    var transformedV = new b2Vec2();
    for (var i = 0; i < vertexCount; i++) {
      var vertex = circle.vertices[i];
      b2Vec2.Mul(transformedV, transform, vertex);
      geometry.vertices[i].x = transformedV.x;
      geometry.vertices[i].y = transformedV.y;
    }
    geometry.verticesNeedUpdate = true;
  }
}

function drawEdge(edge, transform, redraw) {
  var geometry, material;
  var transformedV = new b2Vec2();
  if (redraw === false) {
    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial({color: 0x000000});
    b2Vec2.Mul(transformedV, transform, edge.v0);
    geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));
    b2Vec2.Mul(transformedV, transform, edge.v1);
    geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));
    var line = new THREE.Line(geometry, material);
    edge.graphic = line;
    scene.add(line);
  } else {
    var line = edge.graphic;
    geometry = line.geometry;
    b2Vec2.Mul(transformedV, transform, edge.v0);
    geometry.vertices[0].x = transformedV.x;
    geometry.vertices[0].y = transformedV.y;
    b2Vec2.Mul(transformedV, transform, edge.v1);
    geometry.vertices[1].x = transformedV.x;
    geometry.vertices[1].y = transformedV.y;
    geometry.verticesNeedUpdate = true;
  }
}

function drawPolygon(polygon, transform, redraw) {
  var vertexCount = polygon.count;
  var geometry, material;
  var transformedV = new b2Vec2();

  if (redraw === false) {
    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial({color: 0x000000})
    for (var i = 0; i < vertexCount; i++) {
      var vertex = polygon.vertices[i];
      b2Vec2.Mul(transformedV, transform, vertex);
      geometry.vertices.push(new THREE.Vector3(transformedV.x, transformedV.y, 0));
    }
    geometry.vertices.push(geometry.vertices[0]);
    var line = new THREE.Line(geometry, material);
    polygon.graphic = line;
    scene.add(line);
  } else {
    var line = polygon.graphic;
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
}

