// shouldnt be a global :(
var world;
var renderer;
var camera;
var scene;
var objects = [];
var timeStep = 1.0 / 60.0;
var velocityIterations = 2;
var positionIterations = 2;
var test;
var canvasWidth = 640;
var canvasHeight = 480;

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

  // Init world
  var gravity = new b2Vec2(0, -20);
  world = new b2World(gravity);

  Testbed();
}

function Testbed(inTest) {

  //test = inTest;
  // Init test
  //test = new TestAddPair();
  //test = new TestAntiPointy();
  test = new TestApplyForce();
  //test = new TestBridge();
  //test = new TestBullet();
  //test = new TestChain();
  //test = new TestDamBreak();
 // test = new TestElasticParticles();
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



  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

var Step = function() {
  world.Step(timeStep, velocityIterations, positionIterations);
}