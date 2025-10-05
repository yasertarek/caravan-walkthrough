import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'
import { PointerLockControls } from 'three-stdlib'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xdddddd)

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
)
camera.position.set(215.82127119847684, 143.6381054218573, 429.6770230411396)

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
hemiLight.position.set(0, 200, 0)
scene.add(hemiLight)
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
dirLight.position.set(100, 200, 100)
scene.add(dirLight)

// --- PLACEHOLDER ---
const placeholderGeometry = new THREE.BoxGeometry(50, 50, 50)
const placeholderMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial)
scene.add(placeholder)

// load caravan model
const loader = new GLTFLoader()
loader.load(
  '/caravan.glb',
  (gltf) => {
    // Remove placeholder
    scene.remove(placeholder)

    // Add loaded model
    const model = gltf.scene
    scene.add(model)

    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(center)
    console.log('✅ Caravan centered at:', center)
  },
  undefined,
  (err) => console.error('❌ Error loading model:', err)
)

// controls
const controls = new PointerLockControls(camera, renderer.domElement)
document.body.addEventListener('click', () => controls.lock())

// movement flags
const move = { forward: false, backward: false, left: false, right: false }
const velocity = new THREE.Vector3()
const direction = new THREE.Vector3()

document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': move.forward = true; break
    case 'KeyS': move.backward = true; break
    case 'KeyA': move.left = true; break
    case 'KeyD': move.right = true; break
  }
})
document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': move.forward = false; break
    case 'KeyS': move.backward = false; break
    case 'KeyA': move.left = false; break
    case 'KeyD': move.right = false; break
  }
})

// zoom limits
const zoomSpeed = 0.95
let zoomFactor = 1
window.addEventListener('wheel', (event) => {
  const delta = event.deltaY < 0 ? 1 / zoomSpeed : zoomSpeed
  zoomFactor *= delta
  zoomFactor = THREE.MathUtils.clamp(zoomFactor, 0.5, 2.5)
  camera.zoom = zoomFactor
  camera.updateProjectionMatrix()
})

// resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// animate
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()
  const speed = 800.0

  velocity.x -= velocity.x * 10.0 * delta
  velocity.z -= velocity.z * 10.0 * delta

  direction.z = Number(move.forward) - Number(move.backward)
  direction.x = Number(move.right) - Number(move.left)
  direction.normalize()

  if (move.forward || move.backward) velocity.z -= direction.z * speed * delta
  if (move.left || move.right) velocity.x -= direction.x * speed * delta

  controls.moveRight(-velocity.x * delta)
  controls.moveForward(-velocity.z * delta)

  // --- rotate placeholder until model is loaded ---
  placeholder.rotation.x += 0.01
  placeholder.rotation.y += 0.01

  renderer.render(scene, camera)
}
animate()
