/**
 * Created by joshualitt on 4/9/14.
 */

// shouldnt be a global :(
var world;
var scene;
var objects = [];

function initTestbed() {
  scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45
    , window.innerWidth / window.innerHeight
    , 0.1, 1000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xEEEEEE);
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = -100;
  camera.lookAt(scene.position);
  document.body.appendChild(renderer.domElement);

  // Init world
  var gravity = new b2Vec2(0, -10);
  world = new b2World(gravity);
  var timeStep = 1.0 / 30.0;
  var velocityIterations = 2;
  var positionIterations = 2;
  
  // Init test
  //TestHW();
  //TestAddPair();
  //TestPyramid();
  TestChain();
  
  //Init
  draw(false);
  function render() {
    // bring objects into world
    world.Step(timeStep, velocityIterations, positionIterations);
    draw(true);
    
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  };
  render();
}

function RandomFloat(min, max) {
  return min + (max - min) * Math.random();
}
