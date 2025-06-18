import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// initialize the scene
const scene = new THREE.Scene();

// MOBILE DETECTION AND TOUCH CONTROLS! 📱🎮
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
                 window.innerWidth <= 768;

console.log(`📱 Device detected: ${isMobile ? 'Mobile' : 'Desktop'}`);

// Mobile control state
let mobileControls = {
  joystick: {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    centerX: 0,
    centerY: 0,
    maxDistance: 50
  },
  buttons: {
    jump: false,
    interact: false
  },
  movement: {
    forward: 0,
    turn: 0
  }
};

// Initialize mobile controls function
function initMobileControls() {
  const mobileControlsDiv = document.getElementById('mobile-controls');
  if (!mobileControlsDiv) return;
  
  const joystickKnob = document.getElementById('joystick-knob');
  const jumpBtn = document.getElementById('jump-btn');
  const interactBtn = document.getElementById('interact-btn');
  const joystickContainer = document.querySelector('.joystick-container');
  const joystickBase = document.querySelector('.joystick-base');
  
  if (!joystickKnob || !jumpBtn || !interactBtn || !joystickContainer || !joystickBase) return;
  
  mobileControlsDiv.classList.add('active');
  
  // Joystick center calculation
  function updateJoystickCenter() {
    const rect = joystickBase.getBoundingClientRect();
    mobileControls.joystick.centerX = rect.left + rect.width / 2;
    mobileControls.joystick.centerY = rect.top + rect.height / 2;
  }
  
  updateJoystickCenter();
  window.updateJoystickCenter = updateJoystickCenter; // Make globally accessible
  window.addEventListener('resize', updateJoystickCenter);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateJoystickCenter, 100);
  });
  
  // Touch handlers
  function handleJoystickStart(e) {
    e.preventDefault();
    mobileControls.joystick.active = true;
    updateJoystickCenter();
  }
  
  function handleJoystickMove(e) {
    if (!mobileControls.joystick.active) return;
    e.preventDefault();
    
    const touch = e.touches ? e.touches[0] : e;
    const deltaX = touch.clientX - mobileControls.joystick.centerX;
    const deltaY = touch.clientY - mobileControls.joystick.centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;
    
    if (distance <= maxDistance) {
      mobileControls.joystick.currentX = deltaX;
      mobileControls.joystick.currentY = deltaY;
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      mobileControls.joystick.currentX = Math.cos(angle) * maxDistance;
      mobileControls.joystick.currentY = Math.sin(angle) * maxDistance;
    }
    
    joystickKnob.style.transform = `translate(${mobileControls.joystick.currentX - 20}px, ${mobileControls.joystick.currentY - 20}px)`;
    
    mobileControls.movement.forward = -mobileControls.joystick.currentY / maxDistance;
    mobileControls.movement.turn = mobileControls.joystick.currentX / maxDistance;
  }
  
  function handleJoystickEnd(e) {
    e.preventDefault();
    mobileControls.joystick.active = false;
    mobileControls.joystick.currentX = 0;
    mobileControls.joystick.currentY = 0;
    mobileControls.movement.forward = 0;
    mobileControls.movement.turn = 0;
    joystickKnob.style.transform = 'translate(-50%, -50%)';
  }
  
  // Add event listeners
  joystickContainer.addEventListener('touchstart', handleJoystickStart, { passive: false });
  document.addEventListener('touchmove', handleJoystickMove, { passive: false });
  document.addEventListener('touchend', handleJoystickEnd, { passive: false });
  
  // Button handlers
  jumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileControls.buttons.jump = true;
    jumpBtn.style.background = 'rgba(255, 255, 255, 0.4)';
    jumpBtn.style.transform = 'scale(0.95)';
  }, { passive: false });
  
  jumpBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    mobileControls.buttons.jump = false;
    jumpBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    jumpBtn.style.transform = 'scale(1)';
  }, { passive: false });
  
  interactBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileControls.buttons.interact = true;
    interactBtn.style.background = 'rgba(255, 255, 255, 0.4)';
    interactBtn.style.transform = 'scale(0.95)';
  }, { passive: false });
  
  interactBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    mobileControls.buttons.interact = false;
    interactBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    interactBtn.style.transform = 'scale(1)';
  }, { passive: false });
  
  console.log('📱 Mobile controls initialized!');
}

// Initialize mobile controls when DOM is ready
if (isMobile) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMobileControls, 100);
  });
}

// Create a gradient sky background
const skyGeometry = new THREE.SphereGeometry(15000, 32, 15); // Much bigger sky
const skyMaterial = new THREE.MeshBasicMaterial({
  color: 0x87CEEB, // Sky blue
  side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Create the CLEAN sized ground (8km x 8km countryside!)
const groundGeometry = new THREE.PlaneGeometry(8000, 8000, 100, 100); // Clean 8km x 8km!

// Create a grass-like texture using canvas
function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  // Create grass base colour
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#4a7c59'); // Darker green
  gradient.addColorStop(1, '#6b8e23'); // Olive green
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add some grass texture noise
  for (let i = 0; i < 1000; i++) {
    context.fillStyle = Math.random() > 0.5 ? '#5a8b3a' : '#3d5a2a';
    context.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 3 + 1,
      Math.random() * 3 + 1
    );
  }
  
  return canvas;
}

const grassTexture = new THREE.CanvasTexture(createGrassTexture());
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(80, 80); // Perfect repetition for the 8km field

const groundMaterial = new THREE.MeshLambertMaterial({
  map: grassTexture
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
ground.position.y = -1; // Slightly below origin
ground.receiveShadow = true;
scene.add(ground);

// Create fences to divide fields
function createFence(startX, startZ, endX, endZ, height = 80) { // Much taller fences!
  const fenceGroup = new THREE.Group();
  
  const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2));
  const posts = Math.floor(distance / 50) + 1; // Post every 50 units
  
  for (let i = 0; i < posts; i++) {
    const t = i / (posts - 1);
    const x = startX + (endX - startX) * t;
    const z = startZ + (endZ - startZ) * t;
    
    // Fence post - much bigger!
    const postGeometry = new THREE.BoxGeometry(8, height, 8);
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(x, height / 2, z);
    post.castShadow = true;
    fenceGroup.add(post);
    
    // Horizontal rails (if not the last post)
    if (i < posts - 1) {
      const nextT = (i + 1) / (posts - 1);
      const nextX = startX + (endX - startX) * nextT;
      const nextZ = startZ + (endZ - startZ) * nextT;
      
      const railLength = Math.sqrt(Math.pow(nextX - x, 2) + Math.pow(nextZ - z, 2));
      const angle = Math.atan2(nextZ - z, nextX - x);
      
      // Three horizontal rails - much bigger!
      for (let railY of [height * 0.25, height * 0.5, height * 0.75]) {
        const railGeometry = new THREE.BoxGeometry(railLength, 6, 20); // Much bigger rails
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
        const rail = new THREE.Mesh(railGeometry, railMaterial);
        rail.position.set(
          x + (nextX - x) / 2,
          railY,
          z + (nextZ - z) / 2
        );
        rail.rotation.y = angle;
        rail.castShadow = true;
        fenceGroup.add(rail);
      }
    }
  }
  
  return fenceGroup;
}

// Create field boundaries with fences - CLEAN 2x2 GRID!
const fences = [];
const fenceBoundaries = []; // Store fence line data for collision detection

// Create a simple 2x2 grid of themed fields!
const fieldSize = 2000; // Each field is 2km x 2km - perfect size!
const numFields = 2; // 2x2 = 4 themed fields total!

// Create the CLEAN fence grid - PROPERLY DEFINED!
// Outer boundary fences
fences.push(createFence(-2000, -2000, 2000, -2000)); // North fence
fenceBoundaries.push({startX: -2000, startZ: -2000, endX: 2000, endZ: -2000});

fences.push(createFence(-2000, 2000, 2000, 2000)); // South fence
fenceBoundaries.push({startX: -2000, startZ: 2000, endX: 2000, endZ: 2000});

fences.push(createFence(-2000, -2000, -2000, 2000)); // West fence
fenceBoundaries.push({startX: -2000, startZ: -2000, endX: -2000, endZ: 2000});

fences.push(createFence(2000, -2000, 2000, 2000)); // East fence
fenceBoundaries.push({startX: 2000, startZ: -2000, endX: 2000, endZ: 2000});

// Internal dividers - CLEAN CROSS
fences.push(createFence(-2000, 0, 2000, 0)); // Horizontal divider
fenceBoundaries.push({startX: -2000, startZ: 0, endX: 2000, endZ: 0});

fences.push(createFence(0, -2000, 0, 2000)); // Vertical divider
fenceBoundaries.push({startX: 0, startZ: -2000, endX: 0, endZ: 2000});

// Add 4 gate openings - one per field boundary
fences.push(createFence(-150, -1, 150, -1, 60)); // North-South gate
fences.push(createFence(-1, -150, -1, 150, 60)); // East-West gate

fences.forEach(fence => scene.add(fence));

// EPIC FARM BUILDINGS! 🏠🚜
function createBarn(x, z) {
  const barn = new THREE.Group();
  
  // Main barn structure - MASSIVE!
  const barnGeometry = new THREE.BoxGeometry(300, 200, 500);
  const barnMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // Dark red
  const barnMain = new THREE.Mesh(barnGeometry, barnMaterial);
  barnMain.position.y = 100;
  barnMain.castShadow = true;
  
  // Barn roof
  const roofGeometry = new THREE.ConeGeometry(250, 80, 4);
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 240;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  
  // Barn doors
  const doorGeometry = new THREE.BoxGeometry(80, 120, 5);
  const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
  const door1 = new THREE.Mesh(doorGeometry, doorMaterial);
  door1.position.set(-20, 60, 252);
  const door2 = new THREE.Mesh(doorGeometry, doorMaterial);
  door2.position.set(20, 60, 252);
  
  barn.add(barnMain, roof, door1, door2);
  barn.position.set(x, 0, z);
  return barn;
}

function createSilo(x, z) {
  const silo = new THREE.Group();
  
  // Main silo cylinder
  const siloGeometry = new THREE.CylinderGeometry(60, 60, 400, 12);
  const siloMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 }); // Silver
  const siloMain = new THREE.Mesh(siloGeometry, siloMaterial);
  siloMain.position.y = 200;
  siloMain.castShadow = true;
  
  // Silo top
  const topGeometry = new THREE.ConeGeometry(60, 80, 12);
  const topMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 440;
  top.castShadow = true;
  
  silo.add(siloMain, top);
  silo.position.set(x, 0, z);
  return silo;
}

function createTractor(x, z) {
  const tractor = new THREE.Group();
  
  // Tractor body
  const bodyGeometry = new THREE.BoxGeometry(80, 40, 120);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Green
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 40;
  body.castShadow = true;
  
  // Tractor cabin
  const cabinGeometry = new THREE.BoxGeometry(50, 60, 60);
  const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.set(0, 80, -20);
  cabin.castShadow = true;
  
  // Wheels - bigger back wheels!
  const frontWheelGeometry = new THREE.CylinderGeometry(25, 25, 15, 8);
  const backWheelGeometry = new THREE.CylinderGeometry(40, 40, 20, 8);
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
  
  const frontWheelL = new THREE.Mesh(frontWheelGeometry, wheelMaterial);
  frontWheelL.position.set(-50, 25, 40);
  frontWheelL.rotation.z = Math.PI / 2;
  
  const frontWheelR = new THREE.Mesh(frontWheelGeometry, wheelMaterial);
  frontWheelR.position.set(50, 25, 40);
  frontWheelR.rotation.z = Math.PI / 2;
  
  const backWheelL = new THREE.Mesh(backWheelGeometry, wheelMaterial);
  backWheelL.position.set(-50, 40, -40);
  backWheelL.rotation.z = Math.PI / 2;
  
  const backWheelR = new THREE.Mesh(backWheelGeometry, wheelMaterial);
  backWheelR.position.set(50, 40, -40);
  backWheelR.rotation.z = Math.PI / 2;
  
  tractor.add(body, cabin, frontWheelL, frontWheelR, backWheelL, backWheelR);
  tractor.position.set(x, 0, z);
  tractor.rotation.y = Math.random() * Math.PI * 2; // Random rotation
  return tractor;
}

// ANIMATED FARM ANIMALS! 🐔🐄
function createChicken(x, z) {
  const chicken = new THREE.Group();
  
  // Chicken body
  const bodyGeometry = new THREE.SphereGeometry(15, 8, 6);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 15;
  body.castShadow = true;
  
  // Chicken head
  const headGeometry = new THREE.SphereGeometry(8, 8, 6);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(0, 28, 12);
  head.castShadow = true;
  
  // Beak
  const beakGeometry = new THREE.ConeGeometry(3, 8, 4);
  const beakMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
  const beak = new THREE.Mesh(beakGeometry, beakMaterial);
  beak.position.set(0, 28, 20);
  beak.rotation.x = Math.PI / 2;
  
  chicken.add(body, head, beak);
  chicken.position.set(x, 0, z);
  
  // Add movement animation data
  chicken.userData.moveSpeed = 2 + Math.random() * 2;
  chicken.userData.direction = Math.random() * Math.PI * 2;
  chicken.userData.changeTime = 0;
  chicken.userData.type = 'chicken';
  
  return chicken;
}

function createCow(x, z) {
  const cow = new THREE.Group();
  
  // Cow body - much bigger!
  const bodyGeometry = new THREE.BoxGeometry(80, 40, 120);
  const bodyMaterial = new THREE.MeshLambertMaterial({ 
    color: Math.random() > 0.5 ? 0xFFFFFF : 0x8B4513 // White or brown
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 50;
  body.castShadow = true;
  
  // Cow head
  const headGeometry = new THREE.BoxGeometry(30, 25, 40);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(0, 60, 80);
  head.castShadow = true;
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(8, 8, 50);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
  
  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    const x_pos = i < 2 ? -30 : 30;
    const z_pos = i % 2 === 0 ? -40 : 40;
    leg.position.set(x_pos, 25, z_pos);
    leg.castShadow = true;
    cow.add(leg);
  }
  
  cow.add(body, head);
  cow.position.set(x, 0, z);
  
  // Add movement animation data
  cow.userData.moveSpeed = 1 + Math.random();
  cow.userData.direction = Math.random() * Math.PI * 2;
  cow.userData.changeTime = 0;
  cow.userData.type = 'cow';
  
  return cow;
}

// CLEAN FARM ANIMALS - declare before themed fields!
const animals = [];

// CLEAN 4 THEMED FIELDS! 🌾🌽🌻🐄
// Define the 4 themed fields (2x2 grid)
const fieldThemes = [
  // Top row
  { type: 'wildflowers', x: -1000, z: -1000, name: 'Wildflower Field' },
  { type: 'wheat', x: 1000, z: -1000, name: 'Wheat Field' },
  
  // Bottom row
  { type: 'pasture', x: -1000, z: 1000, name: 'Cattle Pasture' },
  { type: 'hay_field', x: 1000, z: 1000, name: 'Hay Field' }
];

// Create FOCUSED themed content for each field
function populateThemedField(theme) {
  const fieldX = theme.x;
  const fieldZ = theme.z;
  const fieldContent = [];
  
  // Add ONE farm building per field - CLEAN placement
  const buildingX = fieldX + (Math.random() - 0.5) * 800;
  const buildingZ = fieldZ + (Math.random() - 0.5) * 800;
  
  switch (theme.type) {
    case 'wildflowers':
      // Wildflower field with barn and flowers
      fieldContent.push(createBarn(buildingX, buildingZ));
      
      // 15 wildflower patches - REDUCED for clean approach
      for (let i = 0; i < 15; i++) {
        const x = fieldX + (Math.random() - 0.5) * 1600;
        const z = fieldZ + (Math.random() - 0.5) * 1600;
        fieldContent.push(createWildflowerPatch(x, z));
      }
      
      // 5 trees around the field
      for (let i = 0; i < 5; i++) {
        const x = fieldX + (Math.random() - 0.5) * 1800;
        const z = fieldZ + (Math.random() - 0.5) * 1800;
        fieldContent.push(createTree(x, z, 1 + Math.random() * 0.5));
      }
      
      // 3 boulders
      for (let i = 0; i < 3; i++) {
        const x = fieldX + (Math.random() - 0.5) * 1600;
        const z = fieldZ + (Math.random() - 0.5) * 1600;
        fieldContent.push(createRock(x, z));
      }
      break;
      
    case 'wheat':
      // Wheat field with silo and tractor
      fieldContent.push(createSilo(buildingX, buildingZ));
      fieldContent.push(createTractor(buildingX + 200, buildingZ + 200));
      
      // 12 wheat patches - REDUCED
      for (let i = 0; i < 12; i++) {
        const x = fieldX + (Math.random() - 0.5) * 1400;
        const z = fieldZ + (Math.random() - 0.5) * 1400;
        fieldContent.push(createWheatField(x, z));
      }
      break;
      
    case 'pasture':
      // Cattle pasture with barn and cows
      fieldContent.push(createBarn(buildingX, buildingZ));
      
      // 8 cows grazing - REDUCED and kept within field bounds
      for (let i = 0; i < 8; i++) {
        const x = fieldX + (Math.random() - 0.5) * 1200; // Reduced range to stay in field
        const z = fieldZ + (Math.random() - 0.5) * 1200;
        const cow = createCow(x, z);
        cow.userData.fieldType = 'pasture'; // Store field information
        cow.userData.fieldCenter = { x: fieldX, z: fieldZ }; // Store field center
        fieldContent.push(cow);
        animals.push(cow); // Add to global animals array!
      }
      
      // 4 shade trees
      for (let i = 0; i < 4; i++) {
        const x = fieldX + (Math.random() - 0.5) * 1400; // Slightly reduced
        const z = fieldZ + (Math.random() - 0.5) * 1400;
        fieldContent.push(createTree(x, z, 1.2 + Math.random() * 0.3));
      }
      break;
      
    case 'hay_field':
      // Hay field with barn and NO EXTRA HAYSTACKS (only the main 12 count!)
      fieldContent.push(createBarn(buildingX, buildingZ));
      fieldContent.push(createTractor(buildingX - 200, buildingZ + 150));
      
      // REMOVED extra haystacks - only the main 12 scattered haystacks count for the game!
      
      // 15 chickens running about - REDUCED and kept within bounds
      for (let i = 0; i < 15; i++) {
        const x = fieldX + (Math.random() - 0.5) * 1200; // Reduced range to stay in field
        const z = fieldZ + (Math.random() - 0.5) * 1200;
        const chicken = createChicken(x, z);
        chicken.userData.fieldType = 'hay_field'; // Store field information
        chicken.userData.fieldCenter = { x: fieldX, z: fieldZ }; // Store field center
        fieldContent.push(chicken);
        animals.push(chicken); // Add to global animals array!
      }
      break;
  }
  
  return fieldContent;
}

// Create all themed field content
const allFieldContent = [];
fieldThemes.forEach(theme => {
  const content = populateThemedField(theme);
  content.forEach(item => {
    allFieldContent.push(item);
    scene.add(item);
  });
  
  console.log(`🌾 Created ${theme.name} at (${theme.x}, ${theme.z})`);
});

// Add 12 haystacks scattered around the fields (CLEAN approach)
const haystacks = [];

for (let i = 0; i < 12; i++) {
  const x = (Math.random() - 0.5) * 3000; // Much tighter range to stay well within grass
  const z = (Math.random() - 0.5) * 3000;
  const haystack = createHaystack(x, z);
  
  // Add a subtle glow effect to make these the OFFICIAL game haystacks! ✨
  const glowGeometry = new THREE.SphereGeometry(120, 16, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFD700, // Golden glow
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.y = 50;
  
  // HIDE haystacks initially - only show when challenge starts! 🎮
  haystack.visible = false;
  
  haystack.add(glow);
  
  haystacks.push(haystack);
  scene.add(haystack);
}

// Animals are now created within the themed fields and added to the global array!

// INTERACTIVE FARMER! 👨‍🌾
let farmer = null;
let farmerInteractionDistance = 300; // Increased for bigger farmer!
let isNearFarmer = false;
let farmerSpeechBubble = null;

// FARMER STEVE FOR TIPS! 👨‍🌾💡
let farmerSteve = null;
let steveInteractionDistance = 300;
let isNearSteve = false;
let steveSpeechBubble = null;

// FARMER STEVE FOR AI CHAT! 👨‍🌾🤖
let steveChatInterface = null;

// Create the farmer NPC with collision-free positioning!
function createFarmer() {
  const farmerGroup = new THREE.Group();
  
  // For now, create a simple farmer placeholder (we can replace with GLTF model later)
  // Farmer body - MUCH BIGGER!
  const bodyGeometry = new THREE.BoxGeometry(80, 160, 40); // Doubled size!
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513  }); // Brown shirt
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 80; // Adjusted for bigger size
  body.castShadow = true;
  
  // Farmer head - MUCH BIGGER!
  const headGeometry = new THREE.SphereGeometry(40, 8, 6); // Doubled size!
  const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 }); // Skin colour
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 180; // Adjusted for bigger size
  head.castShadow = true;
  
  // Farmer hat - MUCH BIGGER!
  const hatGeometry = new THREE.CylinderGeometry(50, 50, 30, 8); // Doubled size!
  const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 }); // Brown hat
  const hat = new THREE.Mesh(hatGeometry, hatMaterial);
  hat.position.y = 210; // Adjusted for bigger size
  hat.castShadow = true;
  
  // Farmer legs - MUCH BIGGER!
  const legGeometry = new THREE.BoxGeometry(30, 80, 30); // Doubled size!
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x000080 }); // Blue jeans
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-20, 40, 0); // Adjusted for bigger size
  leftLeg.castShadow = true;
  
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(20, 40, 0); // Adjusted for bigger size
  rightLeg.castShadow = true;
  
  // Farmer arms - MUCH BIGGER!
  const armGeometry = new THREE.BoxGeometry(24, 100, 24); // Doubled size!
  const armMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-60, 100, 0); // Adjusted for bigger size
  leftArm.castShadow = true;
  
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(60, 100, 0); // Adjusted for bigger size
  rightArm.castShadow = true;
  
  farmerGroup.add(body, head, hat, leftLeg, rightLeg, leftArm, rightArm);
  
  // Add a subtle ground marker to show farmer's clear area! 🎯
  const markerGeometry = new THREE.RingGeometry(200, 250, 16);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0x8B4513,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.rotation.x = -Math.PI / 2; // Lay flat on ground
  marker.position.y = 1; // Slightly above ground
  farmerGroup.add(marker);
  
  // SMART POSITIONING - find a clear area in the Wildflower Field! 🧠
  const clearPositions = [
    { x: -1400, z: -1400 }, // Far corner
    { x: -1600, z: -800 }, // Edge position
    { x: -800, z: -1600 }, // Another edge
    { x: -1500, z: -1000 }, // Middle edge
    { x: -1000, z: -1500 }, // Another middle edge
  ];
  
  // Try each position until we find one that's clear
  let farmerPosition = clearPositions[0]; // Default fallback
  
  for (let pos of clearPositions) {
    // Check if this position has enough clear space (500 units radius)
    let isClear = true;
    
    // Simple check - make sure we're not too close to field center where buildings spawn
    const distanceFromFieldCenter = Math.sqrt(Math.pow(pos.x + 1000, 2) + Math.pow(pos.z + 1000, 2));
    if (distanceFromFieldCenter < 600) { // Too close to field center where barn spawns
      isClear = false;
    }
    
    if (isClear) {
      farmerPosition = pos;
      break;
    }
  }
  
  farmerGroup.position.set(farmerPosition.x, 0, farmerPosition.z);
  farmerGroup.userData.type = 'farmer';
  
  console.log(`👨‍🌾 Farmer Joe positioned at (${farmerPosition.x}, ${farmerPosition.z}) with clear space!`);
  
  return farmerGroup;
}

// Create Farmer Steve (Tips Farmer) with BLUE HAT! 👨‍🌾💙
function createFarmerSteve() {
  const steveGroup = new THREE.Group();
  
  // Steve body - MUCH BIGGER!
  const bodyGeometry = new THREE.BoxGeometry(80, 160, 40); // Same size as Joe
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Green shirt (different from Joe)
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 80;
  body.castShadow = true;
  
  // Steve head - MUCH BIGGER!
  const headGeometry = new THREE.SphereGeometry(40, 8, 6);
  const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 }); // Same skin colour
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 180;
  head.castShadow = true;
  
  // Steve hat - BLUE HAT! 💙
  const hatGeometry = new THREE.CylinderGeometry(50, 50, 30, 8);
  const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF }); // BLUE hat!
  const hat = new THREE.Mesh(hatGeometry, hatMaterial);
  hat.position.y = 210;
  hat.castShadow = true;
  
  // Steve legs
  const legGeometry = new THREE.BoxGeometry(30, 80, 30);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown jeans (different from Joe)
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-20, 40, 0);
  leftLeg.castShadow = true;
  
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(20, 40, 0);
  rightLeg.castShadow = true;
  
  // Steve arms
  const armGeometry = new THREE.BoxGeometry(24, 100, 24);
  const armMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Green arms
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-60, 100, 0);
  leftArm.castShadow = true;
  
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(60, 100, 0);
  rightArm.castShadow = true;
  
  steveGroup.add(body, head, hat, leftLeg, rightLeg, leftArm, rightArm);
  
  // Add ground marker for Steve too! 🎯
  const markerGeometry = new THREE.RingGeometry(200, 250, 16);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000FF, // Blue marker to match his hat
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 1;
  steveGroup.add(marker);
  
  // POSITION STEVE IN WHEAT FIELD! 🌾
  const wheatFieldPositions = [
    { x: 1400, z: -1400 }, // Far corner of wheat field
    { x: 1600, z: -800 }, // Edge position
    { x: 800, z: -1600 }, // Another edge
    { x: 1500, z: -1000 }, // Middle edge
    { x: 1000, z: -1500 }, // Another middle edge
  ];
  
  // Try each position until we find one that's clear
  let stevePosition = wheatFieldPositions[0]; // Default fallback
  
  for (let pos of wheatFieldPositions) {
    let isClear = true;
    
    // Make sure we're not too close to wheat field center where buildings spawn
    const distanceFromFieldCenter = Math.sqrt(Math.pow(pos.x - 1000, 2) + Math.pow(pos.z + 1000, 2));
    if (distanceFromFieldCenter < 600) {
      isClear = false;
    }
    
    if (isClear) {
      stevePosition = pos;
      break;
    }
  }
  
  steveGroup.position.set(stevePosition.x, 0, stevePosition.z);
  steveGroup.userData.type = 'farmerSteve';
  
  console.log(`👨‍🌾 Farmer Steve positioned at (${stevePosition.x}, ${stevePosition.z}) with clear space!`);
  
  return steveGroup;
}

// Create speech bubble UI
function createSpeechBubble() {
  const speechBubble = document.createElement('div');
  speechBubble.id = 'speech-bubble';
  speechBubble.style.position = 'fixed';
  speechBubble.style.top = '30%';
  speechBubble.style.left = '50%';
  speechBubble.style.transform = 'translate(-50%, -50%)';
  speechBubble.style.background = 'rgba(255, 255, 255, 0.95)';
  speechBubble.style.border = '3px solid #8B4513';
  speechBubble.style.borderRadius = '20px';
  speechBubble.style.padding = '20px 30px';
  speechBubble.style.fontFamily = 'Arial, sans-serif';
  speechBubble.style.fontSize = '18px';
  speechBubble.style.color = '#2F4F2F';
  speechBubble.style.textAlign = 'center';
  speechBubble.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
  speechBubble.style.zIndex = '1001';
  speechBubble.style.maxWidth = '400px';
  speechBubble.style.display = 'none';
  
  speechBubble.innerHTML = `
    <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #8B4513;">
      🚜 Farmer Joe 👨‍🌾
    </div>
    <div style="margin-bottom: 20px; line-height: 1.4;">
      "Howdy there, partner! 🤠<br>
      Would you like to take on my<br>
      <strong>Haystack Collection Challenge?</strong><br>
      Collect all 12 haystacks in 60 seconds!"
    </div>
    <div style="margin-top: 20px;">
      <button id="farmer-yes-btn" style="
        padding: 12px 25px; margin: 0 10px;
        font-size: 18px; font-weight: bold;
        background: #4CAF50; border: none;
        border-radius: 10px; color: white;
        cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      ">🌾 YES!</button>
      <button id="farmer-no-btn" style="
        padding: 12px 25px; margin: 0 10px;
        font-size: 18px; font-weight: bold;
        background: #f44336; border: none;
        border-radius: 10px; color: white;
        cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      ">❌ No thanks</button>
    </div>
  `;
  
  document.body.appendChild(speechBubble);
  
  // Add event listeners
  document.getElementById('farmer-yes-btn').addEventListener('click', () => {
    speechBubble.style.display = 'none';
    startGame();
  });
  
  document.getElementById('farmer-no-btn').addEventListener('click', () => {
    speechBubble.style.display = 'none';
  });
  
  return speechBubble;
}

// Create Farmer Steve's Tips Speech Bubble! 💡
function createSteveSpeechBubble() {
  const steveBubble = document.createElement('div');
  steveBubble.id = 'steve-speech-bubble';
  steveBubble.style.position = 'fixed';
  steveBubble.style.top = '30%';
  steveBubble.style.left = '50%';
  steveBubble.style.transform = 'translate(-50%, -50%)';
  steveBubble.style.background = 'rgba(135, 206, 250, 0.95)'; // Light blue background
  steveBubble.style.border = '3px solid #0000FF';
  steveBubble.style.borderRadius = '20px';
  steveBubble.style.padding = '20px 30px';
  steveBubble.style.fontFamily = 'Arial, sans-serif';
  steveBubble.style.fontSize = '18px';
  steveBubble.style.color = '#000080';
  steveBubble.style.textAlign = 'center';
  steveBubble.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
  steveBubble.style.zIndex = '1001';
  steveBubble.style.maxWidth = '400px';
  steveBubble.style.display = 'none';
  
  steveBubble.innerHTML = `
    <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #0000FF;">
      🌾 Farmer Steve 👨‍🌾
    </div>
    <div style="margin-bottom: 20px; line-height: 1.4;">
      "G'day mate! 🤠<br>
      Would you like some helpful<br>
      <strong>Tips for the Farm?</strong><br>
      I've got some great advice!"
    </div>
    <div style="margin-top: 20px;">
      <button id="steve-yes-btn" style="
        padding: 12px 25px; margin: 0 10px;
        font-size: 18px; font-weight: bold;
        background: #4CAF50; border: none;
        border-radius: 10px; color: white;
        cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      ">💡 YES!</button>
      <button id="steve-no-btn" style="
        padding: 12px 25px; margin: 0 10px;
        font-size: 18px; font-weight: bold;
        background: #f44336; border: none;
        border-radius: 10px; color: white;
        cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      ">❌ No thanks</button>
    </div>
  `;
  
  document.body.appendChild(steveBubble);
  
  // Add event listeners
  document.getElementById('steve-yes-btn').addEventListener('click', () => {
    steveBubble.style.display = 'none';
    showTips();
  });
  
  document.getElementById('steve-no-btn').addEventListener('click', () => {
    steveBubble.style.display = 'none';
  });
  
  return steveBubble;
}

// Check if horse is near farmer
function checkFarmerInteraction() {
  if (!horse || !farmer) return;
  
  const distance = horse.position.distanceTo(farmer.position);
  
  if (distance < farmerInteractionDistance && !isNearFarmer && gameMode === 'freeroam') {
    isNearFarmer = true;
    farmerSpeechBubble.style.display = 'block';
    
    // Make Farmer Joe speak! 🎤
    speakFarmerLine('joe', 'Howdy there, partner! Want to try the haystack challenge?');
    
    console.log('👨‍🌾 Farmer Joe: "Howdy! Want to try the haystack challenge?"');
  } else if (distance >= farmerInteractionDistance && isNearFarmer) {
    isNearFarmer = false;
    farmerSpeechBubble.style.display = 'none';
  }
}

// Create haystacks for eating!
function createHaystack(x, z) {
  const haystackGroup = new THREE.Group();
  
  // Main haystack body - MUCH BIGGER!
  const hayGeometry = new THREE.CylinderGeometry(60, 80, 100, 8);
  const hayMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 }); // Golden hay colour
  const haystack = new THREE.Mesh(hayGeometry, hayMaterial);
  haystack.position.y = 50;
  haystack.castShadow = true;
  
  // Top of haystack (slightly smaller) - MUCH BIGGER!
  const topGeometry = new THREE.CylinderGeometry(50, 60, 50, 8);
  const topMaterial = new THREE.MeshLambertMaterial({ color: 0xB8860B });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 90;
  top.castShadow = true;
  
  // Add some hay strands sticking out for realism
  for (let i = 0; i < 8; i++) {
    const strandGeometry = new THREE.CylinderGeometry(2, 2, 30, 4);
    const strandMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
    const strand = new THREE.Mesh(strandGeometry, strandMaterial);
    const angle = (i / 8) * Math.PI * 2;
    strand.position.set(
      Math.cos(angle) * 70,
      60 + Math.random() * 20,
      Math.sin(angle) * 70
    );
    strand.rotation.z = (Math.random() - 0.5) * 0.5;
    haystackGroup.add(strand);
  }
  
  haystackGroup.add(haystack);
  haystackGroup.add(top);
  haystackGroup.position.set(x, 0, z);
  haystackGroup.userData.type = 'haystack';
  haystackGroup.userData.used = false;
  
  return haystackGroup;
}

// Add loads more trees around the landscape
function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  
  // Tree trunk - much bigger!
  const trunkGeometry = new THREE.CylinderGeometry(15 * scale, 25 * scale, 120 * scale);
  const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 60 * scale;
  trunk.castShadow = true;
  
  // Tree foliage - much bigger!
  const foliageGeometry = new THREE.SphereGeometry(80 * scale, 8, 6);
  const foliageMaterial = new THREE.MeshLambertMaterial({ 
    color: new THREE.Color().setHSL(0.3, 0.6, 0.3 + Math.random() * 0.2) // Varied greens
  });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = 150 * scale;
  foliage.castShadow = true;
  
  tree.add(trunk);
  tree.add(foliage);
  tree.position.set(x, 0, z);
  
  return tree;
}

// Create forest edges and scattered trees
const trees = [];

// Forest along the edges - CLEAN APPROACH!
for (let i = 0; i < 20; i++) { // Much reduced for clean 2x2 approach
  const edge = Math.floor(Math.random() * 4);
  let x, z;
  
  switch (edge) {
    case 0: // North edge
      x = (Math.random() - 0.5) * 7000; // Reduced to stay on grass
      z = -3500 + Math.random() * 300;
      break;
    case 1: // South edge
      x = (Math.random() - 0.5) * 7000;
      z = 3200 + Math.random() * 300;
      break;
    case 2: // West edge
      x = -3500 + Math.random() * 300;
      z = (Math.random() - 0.5) * 7000;
      break;
    case 3: // East edge
      x = 3200 + Math.random() * 300;
      z = (Math.random() - 0.5) * 7000;
      break;
  }
  
  const scale = 1.2 + Math.random() * 0.8;
  trees.push(createTree(x, z, scale));
}

// Scattered trees within fields - CLEAN APPROACH!
for (let i = 0; i < 15; i++) { // Much reduced
  const x = (Math.random() - 0.5) * 5000; // Reduced to stay well within grass
  const z = (Math.random() - 0.5) * 5000;
  const scale = 0.8 + Math.random() * 1.2;
  trees.push(createTree(x, z, scale));
}

trees.forEach(tree => scene.add(tree));

// Add some rocks/boulders - CLEAN APPROACH!
for (let i = 0; i < 10; i++) { // Much reduced
  const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 50 + 25);
  const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  rock.position.set(
    (Math.random() - 0.5) * 5000, // Reduced to stay well within grass
    Math.random() * 15,
    (Math.random() - 0.5) * 5000
  );
  rock.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  rock.castShadow = true;
  scene.add(rock);
}

// Lighting setup - more natural outdoor lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // Soft ambient light
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(500, 800, 200);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 2000;
sunLight.shadow.camera.left = -1000;
sunLight.shadow.camera.right = 1000;
sunLight.shadow.camera.top = 1000;
sunLight.shadow.camera.bottom = -1000;
scene.add(sunLight);

// GAME SYSTEM VARIABLES
let horse = null;
let mixer = null;
let prevTime = Date.now();
let isJumping = false;
let jumpStartY = 0;
let jumpProgress = 0;

// Game state
let gameMode = 'freeroam'; // 'freeroam' or 'challenge'
let score = 0;
let timeLeft = 60;
let health = 100;
let gameTimer = null;

// UI Elements
function createUI() {
  // Free roam UI - just a simple message now
  const freeRoamUI = document.createElement('div');
  freeRoamUI.id = 'freeroam-ui';
  freeRoamUI.style.position = 'fixed';
  freeRoamUI.style.top = '20px';
  freeRoamUI.style.left = '50%';
  freeRoamUI.style.transform = 'translateX(-50%)';
  freeRoamUI.style.zIndex = '1000';
  freeRoamUI.innerHTML = `
    <div style="text-align: center; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); font-family: Arial, sans-serif;">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">🌾 Free Roam Mode 🐎</div>
      <div style="font-size: 16px;">Explore the countryside! Find Farmer Joe to start the challenge!</div>
      <div style="font-size: 16px;">Or find Farmer Steve for AI-powered tips! 🤖</div>
    </div>
  `;
  
  // Game UI - timer, score, health
  const gameUI = document.createElement('div');
  gameUI.id = 'game-ui';
  gameUI.style.display = 'none';
  gameUI.style.position = 'fixed';
  gameUI.style.top = '20px';
  gameUI.style.left = '20px';
  gameUI.style.zIndex = '1000';
  gameUI.style.fontFamily = 'Arial, sans-serif';
  gameUI.style.color = 'white';
  gameUI.style.fontSize = '20px';
  gameUI.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
  gameUI.innerHTML = `
    <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 10px;">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">⏰ TIME: <span id="timer">60</span>s</div>
      <div style="font-size: 24px; margin-bottom: 10px;">🌾 SCORE: <span id="score">0</span>/12</div>
      <div style="margin-bottom: 10px;">
        <div>Health: <span id="health-text">100</span></div>
        <div style="width: 200px; height: 15px; background: rgba(255,0,0,0.3); border: 2px solid white; border-radius: 8px;">
          <div id="health-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #ff4444, #ff8888); border-radius: 6px; transition: width 0.3s;"></div>
        </div>
      </div>
      <div style="font-size: 14px;">Find and eat all 12 haystacks before time runs out!</div>
      <div style="font-size: 12px; margin-top: 5px;">🌾 Explore 4 themed fields: Wildflowers, Wheat, Cattle Pasture & Hay Field!</div>
    </div>
  `;
  
  // End game UI
  const endGameUI = document.createElement('div');
  endGameUI.id = 'endgame-ui';
  endGameUI.style.display = 'none';
  endGameUI.style.position = 'fixed';
  endGameUI.style.top = '50%';
  endGameUI.style.left = '50%';
  endGameUI.style.transform = 'translate(-50%, -50%)';
  endGameUI.style.zIndex = '1001';
  endGameUI.style.background = 'rgba(0,0,0,0.8)';
  endGameUI.style.padding = '40px';
  endGameUI.style.borderRadius = '20px';
  endGameUI.style.textAlign = 'center';
  endGameUI.style.color = 'white';
  endGameUI.style.fontFamily = 'Arial, sans-serif';
  endGameUI.innerHTML = `
    <div id="endgame-content"></div>
    <div style="margin-top: 30px;">
      <button id="play-again-btn" style="
        padding: 15px 25px; margin: 10px;
        font-size: 18px; background: #4CAF50;
        border: none; border-radius: 10px; color: white;
        cursor: pointer;
      ">🔄 PLAY AGAIN</button>
      <button id="free-roam-btn" style="
        padding: 15px 25px; margin: 10px;
        font-size: 18px; background: #2196F3;
        border: none; border-radius: 10px; color: white;
        cursor: pointer;
      ">🌄 FREE ROAM</button>
    </div>
  `;
  
  document.body.appendChild(freeRoamUI);
  document.body.appendChild(gameUI);
  document.body.appendChild(endGameUI);
  
  // Remove old button event listener - farmer interaction handles this now
  // document.getElementById('start-game-btn').addEventListener('click', startGame);
  document.getElementById('play-again-btn').addEventListener('click', startGame);
  document.getElementById('free-roam-btn').addEventListener('click', returnToFreeRoam);
}

// Start the hay collection challenge
function startGame() {
  gameMode = 'challenge';
  score = 0;
  timeLeft = 60;
  health = 100;
  
  // Reset all haystacks and MAKE THEM VISIBLE! 🌾
  haystacks.forEach(haystack => {
    haystack.userData.used = false;
    haystack.scale.set(1, 1, 1);
    haystack.visible = true; // Show haystacks when challenge starts!
    haystack.children.forEach(child => {
      if (child.material) {
        if (child === haystack.children[haystack.children.length - 2]) { // Main haystack
          child.material.color.setHex(0xDAA520);
        } else if (child === haystack.children[haystack.children.length - 1]) { // Top
          child.material.color.setHex(0xB8860B);
        } else { // Strands
          child.material.color.setHex(0xDAA520);
        }
      }
    });
  });
  
  // Show game UI, hide others
  document.getElementById('freeroam-ui').style.display = 'none';
  document.getElementById('game-ui').style.display = 'block';
  document.getElementById('endgame-ui').style.display = 'none';
  
  // Start timer
  gameTimer = setInterval(updateGameTimer, 1000);
  
  console.log('🌾 HAY CHALLENGE STARTED! Collect all 12 haystacks in 60 seconds!');
}

// Return to free roam mode
function returnToFreeRoam() {
  gameMode = 'freeroam';
  
  // Hide haystacks again in free roam mode! 🌾
  haystacks.forEach(haystack => {
    haystack.visible = false;
  });
  
  // Show free roam UI, hide others
  document.getElementById('freeroam-ui').style.display = 'block';
  document.getElementById('game-ui').style.display = 'none';
  document.getElementById('endgame-ui').style.display = 'none';
  
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  
  console.log('🌄 Back to Free Roam mode! Explore the countryside!');
}

// Update game timer
function updateGameTimer() {
  timeLeft--;
  
  // Update health to match timer (health decreases as time runs out)
  health = (timeLeft / 60) * 100;
  
  // Update UI
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('health-text').textContent = Math.floor(health);
  document.getElementById('health-bar').style.width = `${health}%`;
  
  // Check for game end
  if (timeLeft <= 0 || score >= 12) { // Back to 12 haystacks!
    endGame();
  }
}

// End the game
function endGame() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  
  const endContent = document.getElementById('endgame-content');
  
  if (score >= 12) { // Back to 12 haystacks!
    endContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🏆</div>
      <div style="font-size: 32px; color: #4CAF50; margin-bottom: 10px;">INCREDIBLE!</div>
      <div style="font-size: 24px; margin-bottom: 20px;">You collected all 12 haystacks!</div>
      <div style="font-size: 20px;">Final Score: ${score}/12</div>
      <div style="font-size: 18px;">Time Left: ${timeLeft} seconds</div>
    `;
  } else {
    endContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">⏰</div>
      <div style="font-size: 32px; color: #ff6b6b; margin-bottom: 10px;">TIME'S UP!</div>
      <div style="font-size: 24px; margin-bottom: 20px;">You collected ${score} out of 12 haystacks</div>
      <div style="font-size: 20px;">Final Score: ${score}/12</div>
    `;
  }
  
  // Show end game UI
  document.getElementById('game-ui').style.display = 'none';
  document.getElementById('endgame-ui').style.display = 'block';
}

// Initialize UI
createUI();

// Create the farmer and speech bubble
farmer = createFarmer();
scene.add(farmer);
farmerSpeechBubble = createSpeechBubble();

// Create Farmer Steve and his AI chat interface! 🤖💡
farmerSteve = createFarmerSteve();
scene.add(farmerSteve);
steveChatInterface = createSteveChatInterface();

// Keyboard controls
const keys = {};
const horseSpeed = 8.0;
const rotationSpeed = 0.04;
const jumpHeight = 100;

// Collision detection function
function checkFenceCollision(newX, newZ) {
  if (isJumping && horse.position.y > 50) { // If jumping high enough, allow passage
    return false;
  }
  
  const horseRadius = 30; // Horse collision radius
  
  for (let fence of fenceBoundaries) {
    // Calculate distance from horse to fence line
    const A = fence.endZ - fence.startZ;
    const B = fence.startX - fence.endX;
    const C = fence.endX * fence.startZ - fence.startX * fence.endZ;
    
    const distance = Math.abs(A * newX + B * newZ + C) / Math.sqrt(A * A + B * B);
    
    // Check if horse is close to fence line
    if (distance < horseRadius) {
      // Check if horse is actually on the fence segment (not beyond endpoints)
      const dotProduct = (newX - fence.startX) * (fence.endX - fence.startX) + 
                        (newZ - fence.startZ) * (fence.endZ - fence.startZ);
      const lengthSquared = Math.pow(fence.endX - fence.startX, 2) + Math.pow(fence.endZ - fence.startZ, 2);
      const t = Math.max(0, Math.min(1, dotProduct / lengthSquared));
      
      const closestX = fence.startX + t * (fence.endX - fence.startX);
      const closestZ = fence.startZ + t * (fence.endZ - fence.startZ);
      
      const distToClosest = Math.sqrt(Math.pow(newX - closestX, 2) + Math.pow(newZ - closestZ, 2));
      
      if (distToClosest < horseRadius) {
        return true; // Collision detected!
      }
    }
  }
  
  return false; // No collision
}

// Check interaction with haystacks (only during challenge mode)
function checkHaystackInteractions() {
  if (!horse || gameMode !== 'challenge') return;
  
  for (let haystack of haystacks) {
    const distance = horse.position.distanceTo(haystack.position);
    
    if (distance < 150 && !haystack.userData.used) {
      // Eat haystack - get points!
      score += 1;
      haystack.userData.used = true;
      
      // Visual feedback - make it smaller and darker
      haystack.scale.set(0.5, 0.5, 0.5);
      haystack.children.forEach(child => {
        if (child.material) {
          child.material.color.setHex(0x8B7355); // Darker, eaten colour
        }
      });
      
      // Update score display
      document.getElementById('score').textContent = score;
      
      console.log(`Delicious hay! Score: ${score}/12`);
      
      // Check for win condition
      if (score >= 12) { // Updated to 12!
        endGame();
      }
    }
  }
}

// Track which keys are pressed
window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

// Function to update horse movement
function updateHorseMovement() {
  if (!horse) return; // Wait for horse to load
  
  // CHECK IF STEVE'S AI CHAT IS OPEN - DISABLE CONTROLS! 🤖
  const chatInterface = document.getElementById('steve-chat-interface');
  const isChatOpen = chatInterface && chatInterface.style.display === 'flex';
  
  if (isChatOpen) {
    // Chat is open, don't process horse movement!
    return;
  }
  
  // Store current position for collision checking
  const currentX = horse.position.x;
  const currentZ = horse.position.z;
  
  // UNIFIED INPUT SYSTEM - works for both desktop and mobile! 🎮📱
  let moveForward = 0;
  let moveBackward = 0;
  let turnLeft = 0;
  let turnRight = 0;
  let shouldJump = false;
  let shouldInteract = false;
  
  if (isMobile) {
    // Mobile touch controls
    moveForward = Math.max(0, mobileControls.movement.forward);
    moveBackward = Math.max(0, -mobileControls.movement.forward);
    turnLeft = Math.max(0, -mobileControls.movement.turn);
    turnRight = Math.max(0, mobileControls.movement.turn);
    shouldJump = mobileControls.buttons.jump;
    shouldInteract = mobileControls.buttons.interact;
  } else {
    // Desktop keyboard controls
    moveForward = (keys['ArrowUp'] || keys['KeyW']) ? 1 : 0;
    moveBackward = (keys['ArrowDown'] || keys['KeyS']) ? 1 : 0;
    turnLeft = (keys['ArrowLeft'] || keys['KeyA']) ? 1 : 0;
    turnRight = (keys['ArrowRight'] || keys['KeyD']) ? 1 : 0;
    shouldJump = keys['Space'] || keys['KeyE'];
    shouldInteract = keys['KeyF'] || keys['KeyR']; // Added interaction keys for desktop
  }
  
  // Jumping (unified for both platforms)
  if (shouldJump && !isJumping) {
    isJumping = true;
    jumpStartY = horse.position.y;
    jumpProgress = 0;
  }
  
  // Handle jump physics
  if (isJumping) {
    jumpProgress += 0.02; // Jump speed
    
    if (jumpProgress <= 1) {
      // Parabolic jump arc
      const jumpArc = Math.sin(jumpProgress * Math.PI);
      horse.position.y = jumpStartY + jumpArc * jumpHeight;
    } else {
      // Land
      horse.position.y = jumpStartY;
      isJumping = false;
      jumpProgress = 0;
    }
  }
  
  // Calculate new position (unified movement system)
  let newX = currentX;
  let newZ = currentZ;
  
  // Forward/Backward movement
  if (moveForward > 0) {
    const direction = new THREE.Vector3();
    horse.getWorldDirection(direction);
    const intensity = isMobile ? moveForward : 1; // Mobile has variable intensity
    newX += direction.x * horseSpeed * intensity;
    newZ += direction.z * horseSpeed * intensity;
  }
  if (moveBackward > 0) {
    const direction = new THREE.Vector3();
    horse.getWorldDirection(direction);
    const intensity = isMobile ? moveBackward : 1;
    newX -= direction.x * horseSpeed * intensity;
    newZ -= direction.z * horseSpeed * intensity;
  }
  
  // Check for fence collision before moving
  if (!checkFenceCollision(newX, newZ)) {
    horse.position.x = newX;
    horse.position.z = newZ;
  }
  
  // Left/Right turning (unified)
  if (turnLeft > 0) {
    const intensity = isMobile ? turnLeft : 1;
    horse.rotation.y += rotationSpeed * intensity;
  }
  if (turnRight > 0) {
    const intensity = isMobile ? turnRight : 1;
    horse.rotation.y -= rotationSpeed * intensity;
  }
  
  // Check haystack interactions (only during challenge)
  checkHaystackInteractions();
  
  // Check farmer interactions (only during free roam)
  // Auto-trigger on mobile when near, manual trigger on desktop
  if (isMobile || shouldInteract) {
    checkFarmerInteraction();
    checkSteveInteraction();
  } else {
    // Still check for proximity on desktop for speech
    checkFarmerInteraction();
    checkSteveInteraction();
  }
}

// Load the horse model
const loader = new GLTFLoader();
loader.load('https://threejs.org/examples/models/gltf/Horse.glb', function (gltf) {
  horse = gltf.scene.children[0];
  horse.scale.set(1.5, 1.5, 1.5);
  horse.position.set(-600, 0, -600); // Spawn horse away from farmer! Different corner of Wildflower Field
  horse.castShadow = true;
  scene.add(horse);

  // Set up animation mixer
  mixer = new THREE.AnimationMixer(horse);
  mixer.clipAction(gltf.animations[0]).setDuration(1).play();
  
  console.log('🐎 CLEAN 2x2 THEMED FARM LOADED! 🐎');
  console.log('🌄 Free Roam Mode: Explore the 8km x 8km countryside!');
  console.log('🌾 4 Themed Fields: Wildflowers, Wheat, Cattle Pasture, Hay Field!');
  console.log('🏠 Each field has clean buildings and themed content!');
  console.log('👨‍🌾 Find Farmer Joe in the Wildflower Field to start the challenge!');
  console.log('🚜 Ride close to the farmer to see his speech bubble!');
}, function (progress) {
  console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
}, function (error) {
  console.error('Error loading horse model:', error);
  
  // Fallback: create a simple box if horse doesn't load
  const boxGeometry = new THREE.BoxGeometry(20, 10, 40);
  const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  horse = new THREE.Mesh(boxGeometry, boxMaterial);
  horse.position.set(-600, 5, -600); // Same different spawn position for fallback box!
  scene.add(horse);
  console.log('Fallback box created');
});

// initialize the camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  1,
  15000 // Clean view distance for the 8km world!
);

camera.position.set(0, 300, 1000);

// initialize the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: !isMobile, // Disable antialiasing on mobile for better performance
  powerPreference: isMobile ? "low-power" : "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 2 : 2)); // Limit pixel ratio on mobile
renderer.shadowMap.enabled = !isMobile; // Disable shadows on mobile for performance
if (!isMobile) {
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

// instantiate the controls (disabled for third-person view, but kept for desktop debugging)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 100;
controls.maxDistance = 2000;
controls.enabled = false; // Disabled by default for third-person view

// Mobile-specific touch prevention for canvas
if (isMobile) {
  canvas.addEventListener('touchstart', (e) => {
    // Allow touch events to pass through to mobile controls
    if (!e.target.closest('.mobile-controls')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
  }, { passive: false });
}

// Make camera follow the horse (third-person view)
function updateCameraFollow() {
  if (horse) {
    // Mobile-optimized camera positioning
    let idealOffset;
    
    if (isMobile) {
      // Mobile: Higher and further back for better view on small screen
      idealOffset = new THREE.Vector3(0, 600, -800); // Higher and further back
    } else {
      // Desktop: Original positioning
      idealOffset = new THREE.Vector3(0, 500, -600); // Behind and above
    }
    
    // Rotate the offset based on horse's rotation so camera follows horse's direction
    idealOffset.applyQuaternion(horse.quaternion);
    
    // Set camera position with smoother following on mobile
    const idealPosition = horse.position.clone().add(idealOffset);
    const lerpFactor = isMobile ? 0.08 : 0.1; // Slightly smoother on mobile
    camera.position.lerp(idealPosition, lerpFactor);
    
    // Make camera look at the horse
    const lookAtPosition = horse.position.clone();
    lookAtPosition.y += isMobile ? 80 : 50; // Look slightly higher on mobile
    camera.lookAt(lookAtPosition);
  }
}

// Handle window resize and mobile orientation changes
window.addEventListener('resize', () => {
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Mobile-specific handling
  if (isMobile) {
    // Recalculate pixel ratio on mobile orientation change
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Small delay to ensure DOM has updated before recalculating joystick position
    setTimeout(() => {
      if (window.updateJoystickCenter) {
        window.updateJoystickCenter();
      }
    }, 100);
  }
});

// Handle mobile orientation changes specifically
if (isMobile) {
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      // Force a resize event after orientation change
      window.dispatchEvent(new Event('resize'));
    }, 500); // Longer delay for orientation change
  });
}

// render the scene
const renderloop = () => {
  updateHorseMovement(); // Update horse position based on keyboard input
  updateAnimals(); // Update animal movements! 🐔🐄
  
  // Update animations
  if (mixer) {
    const time = Date.now();
    mixer.update((time - prevTime) * 0.001);
    prevTime = time;
  }
  
  // Update camera to follow horse - NOW ENABLED!
  updateCameraFollow();
  
  // Disable orbit controls when following
  // controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();

// DIFFERENT PLANT TYPES! 🌾🌽🌻
function createWheatField(x, z) {
  const wheatField = new THREE.Group();
  
  // Create multiple wheat stalks
  for (let i = 0; i < 20; i++) {
    const wheatGeometry = new THREE.CylinderGeometry(2, 2, 60, 4);
    const wheatMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
    const wheat = new THREE.Mesh(wheatGeometry, wheatMaterial);
    
    wheat.position.set(
      (Math.random() - 0.5) * 100,
      30,
      (Math.random() - 0.5) * 100
    );
    wheat.castShadow = true;
    wheatField.add(wheat);
  }
  
  wheatField.position.set(x, 0, z);
  return wheatField;
}

function createWildflowerPatch(x, z) {
  const flowerPatch = new THREE.Group();
  
  // Create various wildflowers
  for (let i = 0; i < 25; i++) {
    const stemGeometry = new THREE.CylinderGeometry(1, 1, 20, 4);
    const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    
    // Flower head
    const flowerGeometry = new THREE.SphereGeometry(4, 6, 4);
    const flowerColors = [0xFF69B4, 0xFF4500, 0xFFFF00, 0x9370DB, 0xFF1493];
    const flowerMaterial = new THREE.MeshLambertMaterial({ 
      color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
    });
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
    flower.position.y = 20;
    
    stem.add(flower);
    stem.position.set(
      (Math.random() - 0.5) * 80,
      10,
      (Math.random() - 0.5) * 80
    );
    stem.castShadow = true;
    flowerPatch.add(stem);
  }
  
  flowerPatch.position.set(x, 0, z);
  return flowerPatch;
}

function createRock(x, z) {
  const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 30 + 15);
  const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  rock.position.set(x, Math.random() * 10, z);
  rock.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  rock.castShadow = true;
  return rock;
}

// ANIMAL ANIMATION SYSTEM WITH FENCE COLLISION! 🐔🐄
function updateAnimals() {
  const currentTime = Date.now() * 0.001; // Convert to seconds
  
  animals.forEach(animal => {
    // Update change time counter
    animal.userData.changeTime += 0.016; // Roughly 60fps
    
    // Change direction randomly every 3-8 seconds
    if (animal.userData.changeTime > 3 + Math.random() * 5) {
      animal.userData.direction = Math.random() * Math.PI * 2;
      animal.userData.changeTime = 0;
    }
    
    // Calculate new position
    const moveSpeed = animal.userData.moveSpeed;
    const newX = animal.position.x + Math.cos(animal.userData.direction) * moveSpeed;
    const newZ = animal.position.z + Math.sin(animal.userData.direction) * moveSpeed;
    
    // Check for fence collision before moving
    if (!checkFenceCollision(newX, newZ)) {
      animal.position.x = newX;
      animal.position.z = newZ;
    } else {
      // Bounce off fence - reverse direction with some randomness
      animal.userData.direction = animal.userData.direction + Math.PI + (Math.random() - 0.5) * 0.5;
    }
    
    // Keep animals within their themed field boundaries
    const fieldBounds = getAnimalFieldBounds(animal);
    if (fieldBounds) {
      // Check if animal is outside its field bounds
      if (animal.position.x < fieldBounds.minX || animal.position.x > fieldBounds.maxX ||
          animal.position.z < fieldBounds.minZ || animal.position.z > fieldBounds.maxZ) {
        // Turn animal back towards center of field
        const centerX = (fieldBounds.minX + fieldBounds.maxX) / 2;
        const centerZ = (fieldBounds.minZ + fieldBounds.maxZ) / 2;
        animal.userData.direction = Math.atan2(centerZ - animal.position.z, centerX - animal.position.x);
      }
    }
    
    // Keep animals within overall grass bounds as backup
    const maxDistance = 3000;
    if (Math.abs(animal.position.x) > maxDistance) {
      animal.userData.direction = Math.atan2(
        animal.position.z,
        -animal.position.x
      );
    }
    if (Math.abs(animal.position.z) > maxDistance) {
      animal.userData.direction = Math.atan2(
        -animal.position.z,
        animal.position.x
      );
    }
    
    // Face movement direction
    animal.rotation.y = animal.userData.direction + Math.PI;
    
    // Add some vertical bobbing for chickens
    if (animal.userData.type === 'chicken') {
      animal.position.y = Math.sin(currentTime * 8 + animal.position.x * 0.01) * 2;
    }
  });
}

// Get field boundaries for an animal based on where it spawned
function getAnimalFieldBounds(animal) {
  // Use stored field information if available
  if (animal.userData.fieldCenter) {
    const fieldX = animal.userData.fieldCenter.x;
    const fieldZ = animal.userData.fieldCenter.z;
    
    // Return bounds for the specific field (1000 units from center = 2000x2000 field)
    return {
      minX: fieldX - 900, // Slightly smaller than field to keep away from fences
      maxX: fieldX + 900,
      minZ: fieldZ - 900,
      maxZ: fieldZ + 900
    };
  }
  
  // Fallback: Determine field based on current position
  const x = animal.position.x;
  const z = animal.position.z;
  
  // Wildflower Field (top-left)
  if (x < 0 && z < 0) {
    return { minX: -1900, maxX: -100, minZ: -1900, maxZ: -100 };
  }
  // Wheat Field (top-right)  
  else if (x > 0 && z < 0) {
    return { minX: 100, maxX: 1900, minZ: -1900, maxZ: -100 };
  }
  // Cattle Pasture (bottom-left)
  else if (x < 0 && z > 0) {
    return { minX: -1900, maxX: -100, minZ: 100, maxZ: 1900 };
  }
  // Hay Field (bottom-right)
  else if (x > 0 && z > 0) {
    return { minX: 100, maxX: 1900, minZ: 100, maxZ: 1900 };
  }
  
  return null; // No specific field bounds
}

// Show helpful tips! 💡
function showTips() {
  const tipsOverlay = document.createElement('div');
  tipsOverlay.id = 'tips-overlay';
  tipsOverlay.style.position = 'fixed';
  tipsOverlay.style.top = '0';
  tipsOverlay.style.left = '0';
  tipsOverlay.style.width = '100%';
  tipsOverlay.style.height = '100%';
  tipsOverlay.style.background = 'rgba(0, 0, 0, 0.8)';
  tipsOverlay.style.zIndex = '1002';
  tipsOverlay.style.display = 'flex';
  tipsOverlay.style.alignItems = 'center';
  tipsOverlay.style.justifyContent = 'center';
  
  tipsOverlay.innerHTML = `
    <div style="
      background: rgba(135, 206, 250, 0.95);
      border: 3px solid #0000FF;
      border-radius: 20px;
      padding: 30px;
      max-width: 500px;
      text-align: center;
      font-family: Arial, sans-serif;
      color: #000080;
    ">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #0000FF;">
        🌾 Farmer Steve's Tips! 💡
      </div>
      
      <div style="text-align: left; font-size: 18px; line-height: 1.6; margin-bottom: 25px;">
        <div style="margin-bottom: 15px;">
          <strong>Tip 1:</strong> Press <kbd style="background: #fff; padding: 3px 8px; border-radius: 5px; border: 1px solid #ccc;">SPACE</kbd> to jump! 🐎
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Tip 2:</strong> Clear a whole field before moving on! 🌾
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Tip 3:</strong> Use <kbd style="background: #fff; padding: 3px 8px; border-radius: 5px; border: 1px solid #ccc;">WASD</kbd> or <kbd style="background: #fff; padding: 3px 8px; border-radius: 5px; border: 1px solid #ccc;">Arrow Keys</kbd> to move! 🎮
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Tip 4:</strong> Look for the golden glow around haystacks during challenges! ✨
        </div>
        
        <div>
          <strong>Tip 5:</strong> Explore all 4 themed fields: Wildflowers, Wheat, Cattle Pasture & Hay Field! 🏞️
        </div>
      </div>
      
      <button id="close-tips-btn" style="
        padding: 15px 30px;
        font-size: 20px;
        font-weight: bold;
        background: #4CAF50;
        border: none;
        border-radius: 10px;
        color: white;
        cursor: pointer;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      ">👍 Got it, thanks Steve!</button>
    </div>
  `;
  
  document.body.appendChild(tipsOverlay);
  
  // Close tips when button clicked
  document.getElementById('close-tips-btn').addEventListener('click', () => {
    document.body.removeChild(tipsOverlay);
  });
  
  console.log('💡 Farmer Steve shared some helpful tips!');
}

// Check if horse is near Farmer Steve for AI chat! 🤖💡
function checkSteveInteraction() {
  if (!horse || !farmerSteve) return;
  
  const distance = horse.position.distanceTo(farmerSteve.position);
  
  if (distance < steveInteractionDistance && !isNearSteve && gameMode === 'freeroam') {
    isNearSteve = true;
    
    // Show AI chat interface instead of speech bubble
    const chatInterface = document.getElementById('steve-chat-interface');
    if (chatInterface) {
      chatInterface.style.display = 'flex';
      // Focus on input
      setTimeout(() => {
        const input = document.getElementById('user-input');
        if (input) input.focus();
      }, 100);
    }
    
    // Make Farmer Steve speak welcome message! 🎤
    speakFarmerLine('steve', 'G\'day mate! I\'ve got AI powers now! Ask me anything about the farm!');
    
    console.log('🤖 Farmer Steve: AI Chat Interface opened!');
  } else if (distance >= steveInteractionDistance && isNearSteve) {
    isNearSteve = false;
    // Don't auto-close chat - let user close it manually
  }
}

// SIMPLE FARMER SPEECH WITH SPECIFIC VOICES! 🎤✨
function speakFarmerLine(farmer, message) {
  // Check if browser supports Speech Synthesis
  if (!('speechSynthesis' in window)) {
    console.log('Speech Synthesis not supported');
    return;
  }
  
  // Function to actually speak once voices are loaded
  function doSpeak() {
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Get all available voices
    const voices = speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (voices.length > 0) {
      if (farmer === 'joe') {
        // Farmer Joe - Use Oliver
        selectedVoice = voices.find(v => v.name.includes('Oliver'));
        utterance.pitch = 0.8; // Lower pitch for Joe
        utterance.rate = 0.9; // Slightly slower
        utterance.volume = 0.8;
        
      } else if (farmer === 'steve') {
        // Farmer Steve - Use Tom
        selectedVoice = voices.find(v => v.name.includes('Tom'));
        utterance.pitch = 1.0; // Normal pitch for Steve
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.volume = 0.8;
      }
      
      // Apply the selected voice
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`🎤 Using voice: ${selectedVoice.name} for ${farmer === 'joe' ? 'Farmer Joe' : 'Farmer Steve'}`);
      } else {
        console.log(`🎤 Voice not found for ${farmer === 'joe' ? 'Farmer Joe' : 'Farmer Steve'}, using default`);
      }
    }
    
    // Speak the line
    speechSynthesis.speak(utterance);
    console.log(`🎤 ${farmer === 'joe' ? 'Farmer Joe' : 'Farmer Steve'} says: "${message}"`);
  }
  
  // Wait for voices to load if needed
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    // Voices not loaded yet, wait for them
    speechSynthesis.onvoiceschanged = () => {
      doSpeak();
      speechSynthesis.onvoiceschanged = null; // Clean up
    };
  } else {
    // Voices already loaded, speak immediately
    doSpeak();
  }
}

// Create Farmer Steve's AI Chat Interface! 🤖💡
function createSteveChatInterface() {
  const chatInterface = document.createElement('div');
  chatInterface.id = 'steve-chat-interface';
  chatInterface.style.position = 'fixed';
  chatInterface.style.top = '50%';
  chatInterface.style.left = '50%';
  chatInterface.style.transform = 'translate(-50%, -50%)';
  chatInterface.style.width = '500px';
  chatInterface.style.height = '600px';
  chatInterface.style.background = 'rgba(135, 206, 250, 0.95)';
  chatInterface.style.border = '3px solid #0000FF';
  chatInterface.style.borderRadius = '20px';
  chatInterface.style.padding = '20px';
  chatInterface.style.fontFamily = 'Arial, sans-serif';
  chatInterface.style.color = '#000080';
  chatInterface.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  chatInterface.style.zIndex = '1002';
  chatInterface.style.display = 'none';
  chatInterface.style.flexDirection = 'column';
  
  chatInterface.innerHTML = `
    <div style="text-align: center; margin-bottom: 15px;">
      <div style="font-size: 24px; font-weight: bold; color: #0000FF;">
        🤖 Chat with Farmer Steve! 🌾
      </div>
      <div style="font-size: 14px; margin-top: 5px;">
        Ask me anything about the farm game!
      </div>
    </div>
    
    <div id="chat-messages" style="
      flex: 1;
      overflow-y: auto;
      background: rgba(255,255,255,0.8);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      border: 2px solid #0000FF;
      max-height: 400px;
    ">
      <div class="steve-message" style="
        background: rgba(0,0,255,0.1);
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 10px;
        border-left: 4px solid #0000FF;
      ">
        <strong>Farmer Steve:</strong> G'day mate! Welcome to my AI chat! Ask me anything about the farm, horse controls, or game tips. I'm here to help! 🐎🌾
      </div>
    </div>
    
    <div style="display: flex; gap: 10px;">
      <input type="text" id="user-input" placeholder="Ask Farmer Steve a question..." style="
        flex: 1;
        padding: 12px;
        border: 2px solid #0000FF;
        border-radius: 10px;
        font-size: 16px;
        outline: none;
      ">
      <button id="send-btn" style="
        padding: 12px 20px;
        background: #4CAF50;
        border: none;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        font-size: 16px;
      ">Send</button>
    </div>
    
    <div style="text-align: center; margin-top: 15px;">
      <button id="close-chat-btn" style="
        padding: 10px 20px;
        background: #f44336;
        border: none;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        cursor: pointer;
      ">Close Chat</button>
    </div>
  `;
  
  document.body.appendChild(chatInterface);
  
  // Chat functionality
  const messagesDiv = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const closeBtn = document.getElementById('close-chat-btn');
  
  let conversationHistory = [];
  
  // Add message to chat
  function addMessage(sender, message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'steve-message';
    messageDiv.style.cssText = `
      background: ${isUser ? 'rgba(76,175,80,0.1)' : 'rgba(0,0,255,0.1)'};
      padding: 10px;
      border-radius: 10px;
      margin-bottom: 10px;
      border-left: 4px solid ${isUser ? '#4CAF50' : '#0000FF'};
    `;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
  
  // Send message function
  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage('You', message, true);
    conversationHistory.push({ role: 'user', content: message });
    userInput.value = '';
    
    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.style.cssText = `
      background: rgba(0,0,255,0.1);
      padding: 10px;
      border-radius: 10px;
      margin-bottom: 10px;
      border-left: 4px solid #0000FF;
      font-style: italic;
    `;
    loadingDiv.innerHTML = '<strong>Farmer Steve:</strong> <em>Thinking...</em> 🤔';
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    try {
      // Get AI response
      const response = await window.openAIService.chatWithSteve(message, conversationHistory);
      
      // Remove loading message
      messagesDiv.removeChild(loadingDiv);
      
      // Add Steve's response
      addMessage('Farmer Steve', response);
      conversationHistory.push({ role: 'assistant', content: response });
      
      // Speak the response
      speakFarmerLine('steve', response);
      
      // Keep conversation history manageable
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-8);
      }
      
    } catch (error) {
      // Remove loading message
      messagesDiv.removeChild(loadingDiv);
      
      // Show error
      addMessage('Farmer Steve', "Sorry mate, I'm having trouble with my AI brain right now. Try again in a moment! 🤖❌");
      console.error('AI chat error:', error);
    }
  }
  
  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  closeBtn.addEventListener('click', () => {
    chatInterface.style.display = 'none';
  });
  
  return chatInterface;
}