// shouldnt be a global :(
var container;
var world = null;
var threeRenderer;
var renderer;
var camera;
var scene;
var objects = [];
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
var test = null;
var projector = new THREE.Projector();
var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var GenerateOffsets = Module.cwrap("GenerateOffsets", 'null');

function InitTestbed() {
  camera = new THREE.PerspectiveCamera(70
    , windowWidth / windowHeight
    , 1, 1000);
  threeRenderer = new THREE.WebGLRenderer();
  threeRenderer.setClearColor(0xEEEEEE);
  threeRenderer.setSize(windowWidth, windowHeight);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 100;
  scene = new THREE.Scene();
  camera.lookAt(scene.position);

  document.body.appendChild( this.threeRenderer.domElement);

  this.mouseJoint = null;

  // hack
  renderer = new Renderer();
  var gravity = new b2Vec2(0, -10);
  world = new b2World(gravity);
 // Testbed();
}

function Testbed(obj) {
  // Init world
  ResetWorld();
  world.SetGravity(new b2Vec2(0, -10));

  //GenerateOffsets();

  // setup ground body


  var bd = new b2BodyDef;
  this.groundBody = world.CreateBody(bd);
  /*var start = new Date().getTime();
  for (var i = 0; i < 1000000; i++) {
    this.groundBody.ApplyForce(new b2Vec2(10, 30), new b2Vec2(10, 30), true);
  }
  var end = new Date().getTime();
  var time = end - start;
  console.log('Execution time: ' + time);

  start = new Date().getTime();
  for (var i = 0; i < 1000000; i++) {
    this.groundBody.GetTransform_Test();
  }
  end = new Date().getTime();
  time = end - start;
  console.log('Execution time: ' + time);

  var bGood = this.groundBody.GetTransform();
  var bTest = this.groundBody.GetTransform_Test();
  if (bGood.p.x === bTest.p.x && bGood.p.y === bTest.p.y &&
    bGood.q.s === bTest.q.s && bTest.q.c === bGood.q.c) {
    console.log("alright!");
  }*/

  test = new obj;
  //test = new TestAddPair();
  //test = new TestCornerCase();
  //test = new TestDominos();
  //test = new TestDumpShell();
  //test = new TestConveyorBelt();
  //test = new TestConfined();
  //test = new TestCollisionFiltering();
  //test = new TestBreakable();
  // Init test
  //test = new TestAntiPointy();
  //test = new TestApplyForce();
  //test = new TestBodyTypes();
  //test = new TestBridge();
  //test = new TestBullet();
  //test = new TestChain();
 // test = new TestConvexHull();
  //test = new TestDamBreak();
  //test = new TestDrawingParticles();
  //test = new TestEdgeShape();
  //test = new TestEdgeTest();
  //test = new TestElasticParticles();
  //test = new TestGears();
  //test = new TestRigidParticles();
  //test = new TestRopeJoint();
  //test = new TestHW();
  //test = new TestImpulse();
  //test = new TestMobileBalanced();
  //test = new TestParticles();
  //test = new TestPinball();
  //test = new TestPointy();
  //test = new TestPrismatic();
  //test = new TestPulley();
 // test = new TestPyramid();
 // test = new TestSoup();
  //test = new TestSurfaceTension();
  //test = new TestRamp();
  //test = new TestSensorTest();
  //test = new TestShapeEditing();
  //test = new TestSliderCrank();
  //test = new TestSparky();
  //test = new TestTheoJansen();
  //test = new TestTiles();
  //test = new TestTumbler();
  //test = new TestVaryingFriction();
  //test = new TestVaryingRestitution();
  //test = new TestVerticalStack();
  //test = new TestSphereStack();
  //test = new TestWaveMachine();
  
  //Init
  var that = this;
  document.addEventListener('keypress', function(event) {
    if (test.Keyboard !== undefined) {
      test.Keyboard(String.fromCharCode(event.which) );
    }
  });
  document.addEventListener('keyup', function(event) {
    if (test.KeyboardUp !== undefined) {
      test.KeyboardUp(String.fromCharCode(event.which) );
    }
  });

  document.addEventListener('mousedown', function(event) {
    var p = getMouseCoords(event);
    var aabb = new b2AABB;
    var d = new b2Vec2;

    d.Set(0.001, 0.001);
    b2Vec2.Sub(aabb.lowerBound, p, d);
    b2Vec2.Add(aabb.upperBound, p, d);

    var queryCallback = new QueryCallback(p);
    world.QueryAABB(queryCallback, aabb);

    if (queryCallback.fixture) {
      var body = queryCallback.fixture.body;
      var md = new b2MouseJointDef;
      md.bodyA = that.groundBody;
      md.bodyB = body;
      md.target = p;
      md.maxForce = 1000 * body.GetMass();
      that.mouseJoint = world.CreateJoint(md);
      body.SetAwake(true);
    }
    if (test.MouseDown !== undefined) {
      test.MouseDown(p);
    }

  });

  document.addEventListener('mousemove', function(event) {
    var p = getMouseCoords(event);
    if (that.mouseJoint) {
      that.mouseJoint.SetTarget(p);
    }
    if (test.MouseMove !== undefined) {
      test.MouseMove(p);
    }
  });

  document.addEventListener('mouseup', function(event) {
    if (that.mouseJoint) {
      world.DestroyJoint(that.mouseJoint);
      that.mouseJoint = null;
    }
    if (test.MouseUp !== undefined) {
      test.MouseUp(getMouseCoords(event));
    }
  });


  window.addEventListener( 'resize', onWindowResize, false );

  render();
}

var render = function() {
  // bring objects into world
  renderer.currentVertex = 0;
  if (test.Step !== undefined) {
    test.Step();
  } else {
    Step();
  }
  renderer.draw();


  threeRenderer.render(scene, camera);
  requestAnimationFrame(render);
};

var ResetWorld = function() {
  if (world !== null) {
    while (world.joints.length > 0) {
      world.DestroyJoint(world.joints[0]);
    }

    while (world.bodies.length > 0) {
      world.DestroyBody(world.bodies[0]);
    }

    while (world.particleSystems.length > 0) {
      world.DestroyParticleSystem(world.particleSystems[0]);
    }
  }
  camera.position.z = 100;
};

var Step = function() {
  world.Step(timeStep, velocityIterations, positionIterations);
};

/**@constructor*/
function QueryCallback(point) {
  this.point = point;
  this.fixture = null;
}

/**@return bool*/
QueryCallback.prototype.ReportFixture = function(fixture) {
  var body = fixture.body;
  if (body.GetType() === b2_dynamicBody) {
    var inside = fixture.TestPoint(this.point);
    if (inside) {
      this.fixture = fixture;
      return true;
    }
  }
  return false;
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  threeRenderer.setSize( window.innerWidth, window.innerHeight );
}

function getMouseCoords(event) {
  var mouse = new THREE.Vector3();
  mouse.x = (event.clientX / windowWidth) * 2 - 1;
  mouse.y = -(event.clientY / windowHeight) * 2 + 1;
  mouse.z = 0.5;

  projector.unprojectVector(mouse, camera);
  var dir = mouse.sub(camera.position).normalize();
  var distance = -camera.position.z / dir.z;
  var pos = camera.position.clone().add(dir.multiplyScalar(distance));
  var p = new b2Vec2(pos.x, pos.y);
  return p;
}