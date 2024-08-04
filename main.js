import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

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
document.querySelector("#scene").appendChild(renderer.domElement);
window.addEventListener("resize", onWindowResize);

// camera
let camera = new THREE.PerspectiveCamera(
  22,
  window.innerWidth / window.innerHeight,
  0.25,
  20,
);
camera.position.set(0.85, 0.1, 6.1);

// lights
let ambientLight = new THREE.DirectionalLight(0x7c7c7c, 3.0);
let light = new THREE.DirectionalLight(0xffffff, 3.0);
light.position.set(0.32, 0.39, 0.7);

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

animate();

/**
 * FUNCTION DEFINITION
 */
function render() {
  if (effectController && effectController.wireframe !== _wireFrame) {
    _wireFrame = effectController.wireframe;
    group.traverse((model) => {
      if (!model.isMesh) return;
      model.material.wireframe = _wireFrame;
    });
  }

  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);

  render();
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

// gsap
gsap.registerPlugin(Observer);

// ScrollTrigger
// ScrollTrigger.defaults({
//   immediateRender: false,
//   ease: "power1.inOut",
//   scrub: true,
// });
//
// let anime = gsap.timeline();
//
// anime.to(scene.rotation, {
//   y: 5.5,
//   scrollTrigger: {
//     trigger: "#sec2",
//     endTrigger: "#sec3",
//     end: "top bottom",
//   },
// });
//
// anime.to(camera.position, {
//   x: -0.65,
//   scrollTrigger: {
//     trigger: "#sec2",
//     endTrigger: "#sec3",
//     end: "top bottom",
//   },
// });

// Observer
let sections = document.querySelectorAll("section"),
  textBlock = gsap.utils.toArray(".description"),
  currentIndex = -1,
  wrap = gsap.utils.wrap(0, sections.length),
  animating;

function gotoSection(index, direction) {
  if ((index === -1 && direction === -1) || (index === 2 && direction === 1))
    return;
  console.log(index, direction);
  index = wrap(index); // make sure it's valid
  animating = true;

  let tl = gsap.timeline({
    defaults: { duration: 1, ease: "power1.inOut" },
    onComplete: () => (animating = false),
  });

  if (currentIndex >= 0) {
    // The first time this function runs, current is -1
    tl.to(textBlock[currentIndex], { autoAlpha: 0 });
    if (direction === 1) {
      tl.add("start")
        .to(scene.rotation, { y: 5.5 }, "start")
        .to(scene.rotation, { x: 2 }, "start")
        .to(scene.rotation, { z: -1 }, "start")
        .to(camera.position, { x: -0.65 }, "start");
    } else {
      tl.add("start")
        .to(scene.rotation, { y: 0 }, "start")
        .to(scene.rotation, { x: 0 }, "start")
        .to(scene.rotation, { z: 0 }, "start")
        .to(camera.position, { x: 0.85 }, "start");
    }
  }

  gsap.set(sections[index], { autoAlpha: 1 });
  tl.fromTo(textBlock[index], { autoAlpha: 0 }, { autoAlpha: 1 });

  currentIndex = index;
}

Observer.create({
  type: "wheel,touch,pointer",
  wheelSpeed: -1,
  onDown: () => !animating && gotoSection(currentIndex - 1, -1), // go to previous
  onUp: () => !animating && gotoSection(currentIndex + 1, 1), // go to next
  tolerance: 10,
  preventDefault: true,
});

gotoSection(0, 1);
