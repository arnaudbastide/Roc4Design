import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js";
import { kitchenSpec } from "./kitchen-spec.js";

const kitchen = kitchenSpec.dimensions;

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3f4f6);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(7.5, 8.0, 12.0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(kitchen.width / 2, 0.8, kitchen.depth / 2);
controls.enableDamping = true;

const materials = {
  floor: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.86 }),
  grout: new THREE.LineBasicMaterial({ color: 0x4b5563, transparent: true, opacity: 0.45 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 }),
  wallPanel: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.72 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xaeb4ba, metalness: 0.72, roughness: 0.25 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.7, roughness: 0.28 }),
  black: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.45 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.45 }),
  hvac: new THREE.MeshStandardMaterial({ color: 0x60a5fa, metalness: 0.35, roughness: 0.3 }),
  light: new THREE.MeshStandardMaterial({ color: 0xfefce8, emissive: 0xfef08a, emissiveIntensity: 0.55 }),
};

function box(name, x, y, z, w, h, d, material, castShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.name = name;
  mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addFloor() {
  box("12 in matte gray ceramic tile floor", 0, -0.02, 0, kitchen.width, 0.04, kitchen.depth, materials.floor, false);

  const points = [];
  for (let x = 0; x <= kitchen.width + 0.001; x += kitchen.tileSize) {
    points.push(new THREE.Vector3(x, 0.006, 0), new THREE.Vector3(x, 0.006, kitchen.depth));
  }
  for (let z = 0; z <= kitchen.depth + 0.001; z += kitchen.tileSize) {
    points.push(new THREE.Vector3(0, 0.008, z), new THREE.Vector3(kitchen.width, 0.008, z));
  }
  const grid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), materials.grout);
  grid.name = "dark grout grid";
  scene.add(grid);
}

function addWalls() {
  const t = 0.08;
  box("back white wall panels", 0, 0, kitchen.depth - t, kitchen.width, kitchen.height, t, materials.wall, false);
  box("left light gray wall panels", 0, 0, 0, t, kitchen.height, kitchen.depth, materials.wallPanel, false);
  box("right light gray wall panels", kitchen.width - t, 0, 0, t, kitchen.height, kitchen.depth, materials.wallPanel, false);
}

function addCookingLine() {
  const cd = kitchen.counterDepth;
  const z = kitchen.depth - cd;
  box("central cooking line stainless counter", 0.5, 0, z, kitchen.width - 1.0, kitchen.counterHeight, cd, materials.steel);

  const hoodX = (kitchen.width - kitchen.hoodLength) / 2;
  const hoodZ = kitchen.depth - kitchen.hoodDepth - 0.08;
  box("15 ft x 4 ft massive stainless exhaust hood", hoodX, 2.15, hoodZ, kitchen.hoodLength, 0.55, kitchen.hoodDepth, materials.hvac);
  box("hood duct riser", hoodX + kitchen.hoodLength / 2 - 0.25, 2.7, hoodZ + 0.3, 0.5, 0.55, 0.45, materials.darkSteel);

  box("EQ-RANGE-01 6-burner gas range", hoodX + 0.2, 0.02, z + 0.05, 0.95, 0.9, cd - 0.1, materials.darkSteel);
  box("EQ-RANGE-02 6-burner gas range", hoodX + 1.25, 0.02, z + 0.05, 0.95, 0.9, cd - 0.1, materials.darkSteel);
  box("EQ-GRIDDLE-01 flat-top griddle", hoodX + 2.3, 0.94, z + 0.08, 1.05, 0.08, cd - 0.16, materials.black);
  box("EQ-COMBI-01 stacked combi oven", hoodX + kitchen.hoodLength + 0.25, 0, z + 0.05, 1.0, 1.8, cd - 0.1, materials.steel);
  box("combi glass doors", hoodX + kitchen.hoodLength + 0.27, 0.35, z + 0.01, 0.96, 1.1, 0.04, materials.glass, false);
}

function addPrepIslands() {
  const w = 2.4;
  const d = 1.15;
  const x = (kitchen.width - w) / 2;
  const z1 = kitchen.depth * 0.34;
  const z2 = kitchen.depth * 0.58;
  box("multi-tier prep island 1 base", x, 0, z1, w, kitchen.counterHeight, d, materials.steel);
  box("multi-tier prep island 1 upper shelf", x + 0.18, kitchen.counterHeight + 0.32, z1 + 0.18, w - 0.36, 0.08, d - 0.36, materials.steel);
  box("multi-tier prep island 2 base", x, 0, z2, w, kitchen.counterHeight, d, materials.steel);
  box("multi-tier prep island 2 upper shelf", x + 0.18, kitchen.counterHeight + 0.32, z2 + 0.18, w - 0.36, 0.08, d - 0.36, materials.steel);
}

function addWarewashingAndStorage() {
  const cd = kitchen.counterDepth;
  box("right side stainless worktop", kitchen.width - cd, 0, 0.7, cd, kitchen.counterHeight, kitchen.depth - 1.4, materials.steel);
  box("EQ-DISH-01 hood-type dishwasher", kitchen.width - cd - 0.02, 0, kitchen.depth * 0.38, cd, 1.6, 1.15, materials.steel);
  box("dishwasher hood", kitchen.width - cd - 0.05, 1.65, kitchen.depth * 0.38, cd + 0.1, 0.25, 1.15, materials.hvac);
  box("commercial sink basin", kitchen.width - cd + 0.08, kitchen.counterHeight + 0.01, kitchen.depth * 0.22, cd - 0.16, 0.08, 0.65, materials.darkSteel);

  box("cold dry storage shelving left", 0.08, 0, 0.65, 0.62, 2.0, 2.3, materials.steel);
  box("cold dry storage shelving back", 0.9, 0, 0.08, 2.6, 2.0, 0.62, materials.steel);
}

function addCeiling() {
  for (let x = 1.1; x < kitchen.width; x += 2.2) {
    for (let z = 1.4; z < kitchen.depth; z += 2.4) {
      box("ceiling LED panel", x, 2.94, z, 0.9, 0.035, 0.55, materials.light, false);
    }
  }
  for (let z = 2.2; z < kitchen.depth; z += 3.2) {
    box("ceiling HVAC grille", kitchen.width * 0.5 - 0.3, 2.91, z, 0.6, 0.04, 0.6, materials.hvac, false);
  }
}

function addLights() {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9ca3af, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(5, 8, 4);
  key.castShadow = true;
  key.shadow.mapSize.width = 2048;
  key.shadow.mapSize.height = 2048;
  scene.add(key);
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

addFloor();
addWalls();
addCookingLine();
addPrepIslands();
addWarewashingAndStorage();
addCeiling();
addLights();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
