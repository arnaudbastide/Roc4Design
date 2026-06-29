import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js";
import { kitchenSpec } from "./kitchen-spec.js";

const kitchen = kitchenSpec.dimensions;
const equipmentById = new Map(kitchenSpec.equipment.map((item) => [item.id, item]));
const fixturesById = new Map(kitchenSpec.fixtures.map((item) => [item.id, item]));

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

function equipmentBox(id, material, yOffset = 0) {
  const item = equipmentById.get(id);
  if (!item) {
    return null;
  }

  return box(`${item.id} ${item.label}`, item.x, yOffset, item.y, item.width, item.height, item.depth, material);
}

function fixtureBox(id, material, yOffset = 0) {
  const item = fixturesById.get(id);
  if (!item) {
    return null;
  }

  return box(`${item.id} ${item.label}`, item.x, yOffset, item.y, item.width, item.height, item.depth, material);
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

  equipmentBox("EQ-RANGE-01", materials.darkSteel, 0.02);
  equipmentBox("EQ-RANGE-02", materials.darkSteel, 0.02);

  const griddle = equipmentById.get("EQ-GRIDDLE-01");
  if (griddle) {
    box(`${griddle.id} ${griddle.label} base`, griddle.x, 0.02, griddle.y, griddle.width, griddle.height, griddle.depth, materials.darkSteel);
    box(`${griddle.id} flat-top cooking plate`, griddle.x, griddle.height + 0.04, griddle.y + 0.04, griddle.width, 0.06, griddle.depth - 0.08, materials.black);
  }

  const combi = equipmentById.get("EQ-COMBI-01");
  if (combi) {
    box(`${combi.id} ${combi.label}`, combi.x, 0, combi.y, combi.width, combi.height, combi.depth, materials.steel);
    box("combi glass doors", combi.x + 0.02, 0.35, combi.y - 0.04, combi.width - 0.04, 1.1, 0.04, materials.glass, false);
  }
}

function addPrepIslands() {
  for (const id of ["FX-ISLAND-01", "FX-ISLAND-02"]) {
    const island = fixturesById.get(id);
    if (!island) {
      continue;
    }

    box(`${island.id} ${island.label} base`, island.x, 0, island.y, island.width, island.height, island.depth, materials.steel);
    box(`${island.id} upper shelf`, island.x + 0.18, island.height + 0.32, island.y + 0.18, island.width - 0.36, 0.08, island.depth - 0.36, materials.steel);
  }
}

function addWarewashingAndStorage() {
  const cd = kitchen.counterDepth;
  box("right side stainless worktop", kitchen.width - cd, 0, 0.7, cd, kitchen.counterHeight, kitchen.depth - 1.4, materials.steel);
  const dishwasher = equipmentById.get("EQ-DISH-01");
  if (dishwasher) {
    box(`${dishwasher.id} ${dishwasher.label}`, dishwasher.x, 0, dishwasher.y, dishwasher.width, dishwasher.height, dishwasher.depth, materials.steel);
    box("dishwasher hood", dishwasher.x - 0.03, dishwasher.height + 0.05, dishwasher.y, dishwasher.width + 0.06, 0.25, dishwasher.depth, materials.hvac);
  }
  fixtureBox("EQ-SINK-01", materials.darkSteel, kitchen.counterHeight + 0.01);

  fixtureBox("EQ-SHELF-01", materials.steel);
  fixtureBox("EQ-SHELF-02", materials.steel);
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
