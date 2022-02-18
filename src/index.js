import "./style/main.styl";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";
import gsap from "gsap";
import GUI from "lil-gui";

/**
 * Debug
 */
const debug = new GUI();

if (window.location.hash !== debug) debug.hide();


/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {};
sizes.width = window.innerWidth;
sizes.height = window.innerHeight;

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.2,
  100
);
camera.position.set(0,0, 0);
scene.add(camera);
window.camera=camera

//mimir
const gltfLoader = new GLTFLoader();
const loadModel = () => {
  gltfLoader.load("models/tete.glb", (gltf) => {
    scene.add(gltf.scene);
    debug.add(gltf.scene.position, "x").min(-5).max(5);
    debug.add(gltf.scene.position, "z").min(-5).max(5);
    debug.add(gltf.scene.position, "y").min(-5).max(5);

    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.material.envMap = environmentMap;
        object.material.envMapIntensity = 1;
        object.material.needsUpdate = true;
      }
    });
  });
};

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.x = 5;
directionalLight.position.y = 5;
directionalLight.position.z = 5;
scene.add(directionalLight);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha:true
});
renderer.setSize(sizes.width, sizes.height);
document.body.append(renderer.domElement);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

  /**
   * Environnement Map
   */
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const exrLoader = new EXRLoader();
  let environmentMap = null;
  exrLoader.load("textures/smt.exr", function (texture) {
    const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    environmentMap = exrCubeRenderTarget.texture;

    texture.dispose();
    loadModel();
  });
/**
 * Resize
 */
window.addEventListener("resize", () => {
  // Update size
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (_event) => {
  cursor.x = _event.clientX / sizes.width - 0.5;

  cursor.y = _event.clientY / sizes.height - 0.5;
});

/**
 * Animation
 */
gsap.fromTo(camera.position, { x: 4.39, y: -1.79, z: -3.58 } , {x: -0.003, y: -0.007, z: 0.03, duration: 10, delay:5});

const timeline = gsap.timeline({ repeat: -1 });
/**
 * Animate
 */
const tick = () => {
  const time = Date.now();

  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};
tick();
