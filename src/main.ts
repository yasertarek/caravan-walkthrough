import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { PointerLockControls } from 'three-stdlib';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
camera.position.set(0, 2, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(10, 20, 10);
scene.add(light);

// Pointer Lock Controls
const controls = new PointerLockControls(camera, renderer.domElement);
const blocker = document.getElementById('blocker')!;

blocker.addEventListener('click', () => {
  controls.lock();
});
controls.addEventListener('lock', () => {
  blocker.style.display = 'none';
});
controls.addEventListener('unlock', () => {
  blocker.style.display = 'flex';
});

// Keyboard movement state
const move = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

document.addEventListener('keydown', (event: KeyboardEvent) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      move.forward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      move.left = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      move.backward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      move.right = true;
      break;
  }
});

document.addEventListener('keyup', (event: KeyboardEvent) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      move.forward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      move.left = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      move.backward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      move.right = false;
      break;
  }
});

// Load Caravan Model
const loader = new GLTFLoader();
loader.load(
  '/caravan.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Center model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Scale down large models
    const size = box.getSize(new THREE.Vector3()).length();
    if (size > 100) model.scale.setScalar(100 / size);

    console.log('Caravan loaded:', center);
    animate();
  },
  undefined,
  (error) => console.error(error)
);

// Animation loop
function animate(): void {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  direction.z = Number(move.forward) - Number(move.backward);
  direction.x = Number(move.right) - Number(move.left);
  direction.normalize();

  if (move.forward || move.backward)
    velocity.z -= direction.z * 50.0 * delta;
  if (move.left || move.right)
    velocity.x -= direction.x * 50.0 * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  renderer.render(scene, camera);
}

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
