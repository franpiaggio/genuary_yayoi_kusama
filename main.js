import './style.css'
import p5 from 'p5';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Packing from './packing'

const colors = ["#F12649", "#E6A409", "#00C26A", "#8E76D6", "#FFAE91"];
const baseColor = colors[Math.floor(Math.random() * colors.length)]

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
camera.position.y = 0.5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
// controls.enabled = false
controls.enableDamping = true

const axesHelper = new THREE.AxesHelper( 10 );
axesHelper.position.y = 0.01
// scene.add( axesHelper );

/**
 * Cube
 */
const box_material = new THREE.MeshPhysicalMaterial({})
box_material.reflectivity = 0
box_material.transmission = 1.0
box_material.roughness = 0.1
box_material.metalness = 0.5
box_material.clearcoat = 0.3
box_material.clearcoatRoughness = 0.25
box_material.color = new THREE.Color(0xffffff)
box_material.ior = 1.2
box_material.thickness = 10.0

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.4, 1.4),
    box_material
)
cube.position.y = 0.6;
cube.rotateY(1)
cube.receiveShadow = true;
cube.castShadow = true
scene.add(cube)

/*
* Lights
*/
const ambient_light = new THREE.AmbientLight(baseColor, 0.2)
scene.add(ambient_light)

/*
* SpotLights
*/
const spotLight_right = new THREE.SpotLight( 0xffffff, 40, 12, 1.2, 1, 4 );
spotLight_right.castShadow = true;
const spotLightX = Math.random() * 3 + 1
const spotLightY = (Math.random() + 1) * 4
spotLight_right.position.set( spotLightX, spotLightY, 0 );
spotLight_right.castShadow = true;
spotLight_right.shadow.mapSize.width = 1920;
spotLight_right.shadow.mapSize.height = 1080;
spotLight_right.shadow.camera.near = 0.8;
spotLight_right.shadow.camera.far = 10;
spotLight_right.shadow.focus = .5
scene.add( spotLight_right );



// const spotLightHelperRight = new THREE.SpotLightHelper( spotLight_right );
// scene.add( spotLightHelperRight );

/**
 * Planes
 */
const wall_sizes = {
  w: 6,
  h: 6
}
const wall_geometry = new THREE.PlaneGeometry(wall_sizes.w, wall_sizes.h);

let canvasTexture
const init_walls = (cnv) => {

  canvasTexture = new THREE.CanvasTexture(cnv)
  const wall_material = new THREE.MeshPhysicalMaterial({ map: canvasTexture})

  // Botom top
  const bottom_wall = new THREE.Mesh(wall_geometry,wall_material)
  bottom_wall.rotateX(-Math.PI / 2)
  bottom_wall.receiveShadow = true
  scene.add(bottom_wall)
  const top_wall = new THREE.Mesh(wall_geometry,wall_material)
  top_wall.position.set(0, wall_sizes.w, 0 )
  top_wall.rotateX(-Math.PI / 2)
  top_wall.rotateY(Math.PI)
  top_wall.receiveShadow = true
  scene.add(top_wall)
  
  // Left right
  const left_wall = new THREE.Mesh(wall_geometry,wall_material)
  left_wall.position.set(-(wall_sizes.w/2),wall_sizes.w/2,0)
  left_wall.rotateY(Math.PI / 2)
  left_wall.receiveShadow = true;
  scene.add(left_wall)
  const right_wall = new THREE.Mesh(wall_geometry,wall_material)
  right_wall.position.set(wall_sizes.w/2,wall_sizes.w/2, 0)
  right_wall.receiveShadow = true;
  right_wall.rotateY(-Math.PI / 2)
  scene.add(right_wall)

  // Back y front
  const back_wall = new THREE.Mesh(wall_geometry,wall_material)
  back_wall.position.set(0,wall_sizes.w/2,-wall_sizes.w/2)
  back_wall.receiveShadow = true;
  scene.add(back_wall)
  const front_wall = new THREE.Mesh(wall_geometry,wall_material)
  front_wall.position.set(0,wall_sizes.w/2,wall_sizes.w/2)
  front_wall.rotateY(Math.PI)
  front_wall.receiveShadow = true;
  scene.add(front_wall)
}



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const mapRange = (val, in_min, in_max, out_min, out_max) => {
    return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const renderThree = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update controls
    controls.update()

    // camera.position.x = Math.sin(elapsedTime * 0.05) * 4
    // camera.position.y = Math.sin(elapsedTime * 0.5) * 2
    // spotLight_right.position.y += mapRange(Math.sin(elapsedTime * 0.02), -1,1, -0.05, 0.05)
    // spotLight_right.position.x += mapRange(Math.sin(elapsedTime * 0.2), -1,1, -0.2, 0.2)

    // Render
    renderer.render(scene, camera)
    sketchInstance.draw()
    canvasTexture.needsUpdate = true;
    // Call tick again on the next frame
    window.requestAnimationFrame(renderThree)
}

/*
* P5 Falopa
*/

// 1. Init sketch p5
// 2. Setup, se crea el canvas 2d de p5
// 3. Inician las paredes usando ese canvas
// 4. Render de threejs - inicia el bucle
let circles
const count = mapRange(Math.random(), 0, 1, 1000, 3000)
const min_size = mapRange(Math.random(), 0, 1, 10, 50)
const max_size = mapRange(Math.random(), 0, 1, 50, 200)
const w = Math.random() + 0.5
const sketch = (s) => {
  s.setup = () => {
    s.createCanvas(3000, 3000)
    circles = new Packing(s, s.width, s.height, count, min_size, max_size, w)
    circles.generate()
    const canvas = document.getElementById("defaultCanvas0");
    const ctx = canvas.getContext('2d');
    init_walls(ctx.canvas)
    renderThree()

    s.background(baseColor)
    circles.pos.forEach( c => {
      s.fill(5)
      s.circle(c.x, c.y, c.z / 2 )
    })
    
  }
  s.draw = () => {
    
  }
}

const sketchInstance = new p5(sketch, 'p5sketch')