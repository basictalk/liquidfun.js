// shouldnt be a global :(
var world = null;
var renderer;
var camera;
var scene;
var objects = [];
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
var test = null;

function InitTestbed() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45
    , window.innerWidth / window.innerHeight
    , 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xEEEEEE);
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 100;
  camera.lookAt(scene.position);
  document.body.appendChild( this.renderer.domElement);


  // hack
  Testbed();
}

function Testbed(obj) {
  // Init world
  ResetWorld();
  var gravity = new b2Vec2(0, -10);
  world = new b2World(gravity);

  //test = new obj;
  test = new TestMobile();
  // Init test
  //test = new TestAddPair();
  //test = new TestAntiPointy();
  //test = new TestApplyForce();
  //test = new TestBodyTypes();
  //test = new TestBridge();
  //test = new TestBullet();
  //test = new TestChain();
  //test = new TestDamBreak();
  //test = new TestElasticParticles();
  //test = new TestRigidParticles();
  //test = new TestRopeJoint();
  //test = new TestHW();
  //test = new TestParticles();
  //test = new TestPyramid();
  //test = new TestRamp();
  //test = new TestVaryingFriction();
  //test = new TestVaryingRestitution();
  //test = new TestVerticalStack();
  //test = new TestSphereStack();
  //test = new TestWaveMachine();
  
  //Init
  document.addEventListener('keypress', function(event) {
    if (test.Keyboard !== undefined) {
      test.Keyboard(String.fromCharCode(event.which) );
    }
  });
  init();
  render();
}

var render = function() {
  // bring objects into world

  if (test.Step !== undefined) {
    test.Step();
  } else {
    Step();
  }
  draw();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

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

  // clear three.js
  var obj, i;
  for ( i = scene.children.length - 1; i >= 0 ; i -- ) {
    obj = scene.children[i];
    scene.remove(obj);
  }
  delete test;
  camera.position.z = 100;
  delete world;
}

var Step = function() {
  world.Step(timeStep, velocityIterations, positionIterations);
}