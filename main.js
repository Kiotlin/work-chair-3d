import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";

let effectController;
let _wireFrame;

const group = new THREE.Group();

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

// render
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", onWindowResize);

// camera
let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.25,
  20,
);
camera.position.set(-1.2, 0.6, 1.7);

// lights
let ambientLight = new THREE.DirectionalLight(0x7c7c7c, 3.0);
let light = new THREE.DirectionalLight(0xffffff, 3.0);
light.position.set(0.32, 0.39, 0.7);

// controller
let cameraControls = new OrbitControls(camera, renderer.domElement);
cameraControls.addEventListener("change", render);

// operate
scene.add(ambientLight);
scene.add(light);

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "scene.gltf",
  async (gltf) => {
    const model = gltf.scene;

    await renderer.compileAsync(model, camera, scene);

    group.add(model);
    scene.add(group);

    render();
  },
  undefined,
  (error) => {
    console.error(error);
  },
);

setupGUI();

/**
 * FUNCTION DEFINITION
 */
function render() {
  if (effectController.wireframe !== _wireFrame) {
    _wireFrame = effectController.wireframe;
    group.traverse((model) => {
      if (!model.isMesh) return;
      model.material.wireframe = _wireFrame;
    });
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  renderer.setSize(canvasWidth, canvasHeight);
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();

  render();
}

function setupGUI() {
  effectController = {
    wireframe: false,
  };

  const gui = new GUI();
  gui.add(effectController, "wireframe").name("wireframe").onChange(render);
}
