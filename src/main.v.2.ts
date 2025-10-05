import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'
import { PointerLockControls } from 'three-stdlib'

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xbfd1e5) // light blue background so it's never black

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000)
camera.position.set(0, 2, 10)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Lights — strong enough to show models
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2)
hemiLight.position.set(0, 200, 0)
scene.add(hemiLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 2)
dirLight.position.set(50, 50, 50)
scene.add(dirLight)

// Scene setup (keep your existing scene, camera, lights, renderer)

// Controls
const controls = new PointerLockControls(camera, document.body)

// Overlay to click and start control (to enable pointer lock)
const blocker = document.createElement('div')
blocker.style.position = 'absolute'
blocker.style.top = '0'
blocker.style.left = '0'
blocker.style.width = '100%'
blocker.style.height = '100%'
blocker.style.backgroundColor = 'rgba(0,0,0,0.5)'
blocker.style.display = 'flex'
blocker.style.alignItems = 'center'
blocker.style.justifyContent = 'center'
blocker.style.color = 'white'
blocker.style.fontSize = '24px'
blocker.style.cursor = 'pointer'
blocker.innerText = 'Click to Start Walking'
document.body.appendChild(blocker)

blocker.addEventListener('click', () => {
  controls.lock()
})

controls.addEventListener('lock', () => {
  blocker.style.display = 'none'
})
controls.addEventListener('unlock', () => {
  blocker.style.display = 'flex'
})

// Movement variables
const move = { forward: false, backward: false, left: false, right: false }
const velocity = new THREE.Vector3()
const direction = new THREE.Vector3()
const speed = 20.0 // adjust walking speed
const clock = new THREE.Clock()

// Keyboard input
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW': move.forward = true; break
    case 'ArrowLeft':
    case 'KeyA': move.left = true; break
    case 'ArrowDown':
    case 'KeyS': move.backward = true; break
    case 'ArrowRight':
    case 'KeyD': move.right = true; break
  }
})
document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW': move.forward = false; break
    case 'ArrowLeft':
    case 'KeyA': move.left = false; break
    case 'ArrowDown':
    case 'KeyS': move.backward = false; break
    case 'ArrowRight':
    case 'KeyD': move.right = false; break
  }
})

// Load Caravan Model
const loader = new GLTFLoader()
loader.load(
  '/caravan.glb',
  (gltf) => {
    const model = gltf.scene
    scene.add(model)

    // Position & scale model for test
    model.scale.set(10, 10, 10)

    // Compute bounding box to position camera
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    // Position camera roughly "in front of the door" (you’ll adjust later)
    camera.position.set(center.x, center.y + size.y * 0.2, center.z + size.z * 0.8)
    camera.lookAt(center)

    console.log('📏 Model size:', size)
    console.log('📍 Camera start:', camera.position)
  },
  undefined,
  (error) => console.error('❌ Model load error', error)
)

// Render loop
function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()
  velocity.x -= velocity.x * 10.0 * delta
  velocity.z -= velocity.z * 10.0 * delta

  direction.z = Number(move.forward) - Number(move.backward)
  direction.x = Number(move.right) - Number(move.left)
  direction.normalize()

  if (move.forward || move.backward) velocity.z -= direction.z * speed * delta
  if (move.left || move.right) velocity.x -= direction.x * speed * delta

  controls.moveRight(-velocity.x * delta)
  controls.moveForward(-velocity.z * delta)

  renderer.render(scene, camera)

  // Log zoom (distance from model center)
  if (Math.random() < 0.02) { // log every few frames
    const distance = camera.position.length()
    console.log('🔎 Camera distance:', distance.toFixed(2))
  }
}
animate()
