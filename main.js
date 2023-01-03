import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import p5 from 'p5';

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
let RenderTargetClass = null
let effectComposer

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/*
* Main Camera
*/
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, -0.2, 2)
scene.add(camera)

/*
* Controls
*/
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

/*
* POSTPRO
*/
if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2){
  RenderTargetClass = THREE.WebGLRenderTarget 
  console.log('Using WebGLMultisampleRenderTarget')
}else{
  RenderTargetClass = THREE.WebGLRenderTarget
  console.log('Using WebGLRenderTarget')
}

const targetConfigs = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat
}
const renderTarget = new RenderTargetClass(800,600, targetConfigs)


effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85)
unrealBloomPass.enabled = true
effectComposer.addPass(unrealBloomPass)

unrealBloomPass.strength = 0.1
unrealBloomPass.radius = 0.2
unrealBloomPass.threshold = 0.1

/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.02 );
directionalLight.position.set(0,0.2,4.42)
scene.add( directionalLight );

const rectLight = new THREE.RectAreaLight("#7C94A6", 30,  2, 2 );
rectLight.position.set(0,0,2.42);
// const ambientLight = new THREE.AmbientLight("0xffffff", 2)
// scene.add(ambientLight)
scene.add(rectLight)

const boxGeo = new THREE.BoxGeometry(1,1,1)
const boxMaterial = new THREE.MeshPhysicalMaterial({  
    color: "#F0B123",
    transmission: 0.9,
    thickness: 0.5,
    roughness: 0,
});
const box = new THREE.Mesh(boxGeo, boxMaterial);
box.rotation.y = 2
box.position.y = -0.45
box.position.z = -0.5
scene.add(box)

/**
 * Debug floor
 */
const gfloor = new THREE.PlaneGeometry( 30, 16 );
const wallMaterial = {
  color: "#F0B123",
  clearcoat: 1,
  clearcoatRoughness: 0,
  roughness: 0,
  metalness: 0,
  reflectivity: 1,
  side: THREE.DoubleSide
}
const mFloor = new THREE.MeshPhysicalMaterial(wallMaterial);
const floor = new THREE.Mesh( gfloor, mFloor );
floor.position.y = -2
floor.rotation.x = 1.5708
scene.add( floor );


let canvasTexture;
function initWalls(canvas){
  canvasTexture = new THREE.CanvasTexture(canvas)
  const gfloor = new THREE.PlaneGeometry( 4,6 );

  const gBackWall = new THREE.PlaneGeometry(4,2);
  const gTopwall = new THREE.PlaneGeometry(4,6);
  const gSideWall = new THREE.PlaneGeometry(6, 2);
  const materialWithCanvas = {
    side: THREE.DoubleSide, 
    color: "#F0B123", 
    map: canvasTexture,
    clearcoat: 0.5,
    clearcoatRoughness: 0,
    roughness: 0,
    metalness: 0,
    reflectivity: 1,
  }
  const materialWall = new THREE.MeshPhysicalMaterial(materialWithCanvas);

  const floor = new THREE.Mesh( gfloor, materialWall );
  floor.position.y = -1
  floor.rotation.x = 1.5708
  floor.position.z = 1

  const wallBack = new THREE.Mesh(gBackWall, materialWall)
  wallBack.position.z = -2;

  const wallTop = new THREE.Mesh(gTopwall, materialWall)
  wallTop.rotation.x = Math.PI/2
  wallTop.position.y = 1;
  wallTop.position.z = 1;

  const wallLeft = new THREE.Mesh(gSideWall, materialWall)
  wallLeft.position.x = -2;
  
  const wallRight = new THREE.Mesh(gSideWall, materialWall)
  wallLeft.rotation.y = Math.PI/2;
  wallRight.rotation.y = Math.PI/2;
  wallRight.position.x = 2;
  wallLeft.position.z = 1;
  wallRight.position.z = 1;

  const walls = new THREE.Group();
  walls.position.z = -2
  walls.add(wallTop, wallBack, wallLeft, wallRight, floor)
  scene.add(walls);
}


const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    controls.update()
    effectComposer.render()
    window.requestAnimationFrame(tick)
    sketchInstance.draw()
    canvasTexture.needsUpdate = true;
    box.rotation.y = Math.sin(elapsedTime * 0.2) * 1.2
    
}


/*
* P5js Texture
*/
const sketch = (s) => {
  s.setup = () => {
      // This is harcoded, can be read from the canvas
      s.createCanvas(2560, 1440);
      s.background("#F0B123")
      const canvas = document.getElementById("defaultCanvas0");
      const ctx = canvas.getContext('2d');
      initWalls(ctx.canvas)
      tick()
  }

  s.draw = () => {
      if(s.frameCount % 10 === 0){
        s.fill(0)
        s.circle(s.random(s.width), s.random(s.height), 20)
      }
  }
}
const sketchInstance = new p5(sketch, 'p5sketch');