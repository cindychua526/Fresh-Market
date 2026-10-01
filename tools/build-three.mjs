// Rebuilds vendor/three.custom.js: three.js r128 with only the classes the game uses (tree-shaken).
// Run: npm install  then  npm run build:three
// If game code starts using another THREE.* class, add it to the list below and rebuild.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
const USED = `CylinderGeometry Group SphereGeometry Mesh BoxGeometry MeshLambertMaterial ConeGeometry Vector3 MeshBasicMaterial Matrix4
CanvasTexture PlaneGeometry Color BufferAttribute InstancedMesh BufferGeometry Sphere Plane Float32BufferAttribute SpriteMaterial Sprite
RingGeometry PCFSoftShadowMap Matrix3 CircleGeometry WebGLRenderer Vector2 TorusGeometry Scene Raycaster Quaternion PerspectiveCamera
PCFShadowMap LinearFilter LineSegments LineBasicMaterial HemisphereLight Frustum Fog DirectionalLight AdditiveBlending`.split(/\s+/);
const game = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const missing = [...new Set(game.match(/THREE\.[A-Za-z0-9]+/g).map(s => s.slice(6)))].filter(n => !USED.includes(n));
if (missing.length) { console.error('Add these to USED first:', missing.join(', ')); process.exit(1); }
await esbuild.build({ stdin: { contents: `export { ${USED.join(', ')} } from 'three';`, resolveDir: process.cwd() },
  bundle: true, minify: true, format: 'iife', globalName: 'THREE', target: 'es2017', legalComments: 'none',
  outfile: new URL('../vendor/three.custom.js', import.meta.url).pathname });
console.log('vendor/three.custom.js rebuilt');
