import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

/* =====================================================================
   MARS OUTPOST — app.js
   Complete single-file game logic: world, player, systems, UI, audio.
===================================================================== */

/* ---------------------------- GLOBAL STATE ---------------------------- */
const state = {
  started:false, paused:false, uiOpen:false, gameOver:false, victory:false,
  flashlightOn:false,
  health:100, oxygen:100, energy:100,
  sensitivity:1, volume:0.6,
  flags:{ power:false, oxygen:false, research:false, tower:false, beacon:false },
  inventory:{ scrap:0, wiring:0, coolant:0, antenna:0, repairTool:0, redCard:false, blueCard:false },
  keys:{},
  velocity:new THREE.Vector3(),
  grounded:true,
  lastFootstep:0,
  moving:false,
  _alarmPlaying:false,
};

const MISSIONS = [
  { id:'power',    title:'Restore Electricity',              desc:'Craft a Repair Tool and restore power at the Power Station console.', done:false },
  { id:'oxygen',   title:'Repair Oxygen Generators',          desc:'Bring a Coolant Canister to the Oxygen Console in the Laboratory.', done:false },
  { id:'keycards', title:'Find Missing Access Cards',         desc:'Locate the Red and Blue keycards hidden around the outpost.', done:false },
  { id:'research', title:'Recover Lost Research Data',        desc:'Unlock the Data Archive with the Blue Keycard and read the recovered logs.', done:false },
  { id:'tower',    title:'Repair the Communication Tower',    desc:'Unlock the tower with the Red Keycard and install the Antenna Part.', done:false },
  { id:'beacon',   title:'Activate the Emergency Beacon',     desc:'Activate the beacon at the Communication Tower.', done:false },
  { id:'escape',   title:'Escape Using the Rescue Shuttle',   desc:'Reach the Shuttle Pad and launch for Earth.', done:false },
];

const RESEARCH_TEXT = "Crew Log 114: Hull breach detected in Sector 7 during the storm. Emergency protocol forced evacuation into the lava-tube caves for shelter. Final entry, timestamp corrupted: sensors registered movement in the tunnels that did not match any crew biosignature. Then silence. No further transmissions were logged.";

const RECIPES = [
  { id:'repairTool', label:'Repair Tool', need:{ scrap:2, wiring:1 }, resultKey:'repairTool' },
];

const SAVE_KEY = 'marsOutpostSave';

/* ---------------------------- THREE.JS CORE ---------------------------- */
let scene, camera, renderer, controls, clock;
let sunLight, flashlight, dustParticles;

let colliders = [];
let interiorLights = [];
let interactables = [];
let sealedZones = [];
let lockedDoors = {};
let activeInteractable = null;

/* ---------------------------- AUDIO ---------------------------- */
let audioCtx = null, masterGain = null;
let alarmInterval = null;

/* ============================================================
   INITIALISATION
============================================================ */
function initThree(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xC97B4A);
  scene.fog = new THREE.FogExp2(0xB5651D, 0.012);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 800);
  camera.position.set(0, 1.7, 6);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(controls.getObject());

  clock = new THREE.Clock();

  addLights();
  addSky();
  addGround();
  addFlashlight();
  buildWorld();
  addDustParticles();

  window.addEventListener('resize', onResize);
}

function onResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addLights(){
  const hemi = new THREE.HemisphereLight(0xffc59a, 0x552b12, 0.65);
  scene.add(hemi);

  sunLight = new THREE.DirectionalLight(0xffb37a, 1.25);
  sunLight.position.set(60, 90, 20);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -130;
  sunLight.shadow.camera.right = 130;
  sunLight.shadow.camera.top = 130;
  sunLight.shadow.camera.bottom = -130;
  sunLight.shadow.camera.far = 320;
  sunLight.shadow.bias = -0.0015;
  scene.add(sunLight);
  scene.add(sunLight.target);

  scene.add(new THREE.AmbientLight(0x442211, 0.55));
}

function addSky(){
  const skyGeo = new THREE.SphereGeometry(400, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    uniforms:{
      topColor:{ value:new THREE.Color(0x7a2f10) },
      bottomColor:{ value:new THREE.Color(0xe8a468) },
      offset:{ value:20 },
      exponent:{ value:0.6 },
    },
    vertexShader:`
      varying vec3 vWorldPosition;
      void main(){
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader:`
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main(){
        float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));
}

function createMarsTexture(){
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#a3502b');
  grad.addColorStop(1, '#7a3a1f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  for(let i=0;i<2600;i++){
    const x = Math.random()*512, y = Math.random()*512, r = Math.random()*2.2;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(55,22,8,0.25)' : 'rgba(205,125,75,0.2)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }
  for(let i=0;i<40;i++){
    const x = Math.random()*512, y = Math.random()*512, r = 8 + Math.random()*22;
    ctx.strokeStyle = 'rgba(35,14,5,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(40, 40);
  return tex;
}

function addGround(){
  const geo = new THREE.PlaneGeometry(400, 400);
  const mat = new THREE.MeshStandardMaterial({ map:createMarsTexture(), roughness:1 });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function addFlashlight(){
  flashlight = new THREE.SpotLight(0xffffff, 0, 32, Math.PI/7, 0.5, 1.3);
  flashlight.position.set(0, 0, 0);
  const target = new THREE.Object3D();
  target.position.set(0, 0, -1);
  camera.add(target);
  camera.add(flashlight);
  flashlight.target = target;
  flashlight.castShadow = false;
}

function addDustParticles(){
  const count = 900;
  const positions = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    positions[i*3]   = (Math.random()-0.5)*220;
    positions[i*3+1] = Math.random()*16;
    positions[i*3+2] = (Math.random()-0.5)*220;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color:0xd9a066, size:0.18, transparent:true, opacity:0.5 });
  dustParticles = new THREE.Points(geo, mat);
  scene.add(dustParticles);
}

function updateDustStorm(delta){
  dustParticles.rotation.y += delta*0.02;
  const t = performance.now()*0.0002;
  scene.fog.density = 0.012 + Math.sin(t)*0.004 + 0.004;
  const pos = dustParticles.geometry.attributes.position;
  for(let i=0;i<pos.count;i++){
    pos.array[i*3] += Math.sin(t + i)*0.01;
  }
  pos.needsUpdate = true;
}

/* ============================================================
   WORLD BUILDING
============================================================ */
function createBuilding(opts){
  const { x, z, w, d, h, color, open } = opts;
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color, roughness:0.8, metalness:0.3 });
  const thickness = 0.3;
  const wallsSpec = [
    { side:'N', pos:[x, h/2, z-d/2], size:[w, h, thickness] },
    { side:'S', pos:[x, h/2, z+d/2], size:[w, h, thickness] },
    { side:'W', pos:[x-w/2, h/2, z], size:[thickness, h, d] },
    { side:'E', pos:[x+w/2, h/2, z], size:[thickness, h, d] },
  ];
  wallsSpec.forEach(ws=>{
    if(ws.side === open) return;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(ws.size[0], ws.size[1], ws.size[2]), wallMat);
    mesh.position.set(ws.pos[0], ws.pos[1], ws.pos[2]);
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh);
    const box = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(ws.pos[0], ws.pos[1], ws.pos[2]),
      new THREE.Vector3(ws.size[0], ws.size[1], ws.size[2])
    );
    colliders.push(box);
  });

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w+0.4, 0.3, d+0.4),
    new THREE.MeshStandardMaterial({ color:0x2b2b30, roughness:0.9 })
  );
  roof.position.set(x, h+0.15, z);
  roof.castShadow = true;
  group.add(roof);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.15, d),
    new THREE.MeshStandardMaterial({ color:0x55555f, roughness:0.9 })
  );
  floor.position.set(x, 0.075, z);
  floor.receiveShadow = true;
  group.add(floor);

  const light = new THREE.PointLight(0xff3b30, 0.35, Math.max(w, d)*1.7, 2);
  light.position.set(x, h-0.6, z);
  group.add(light);
  interiorLights.push(light);

  scene.add(group);
  return opts;
}

function addLockedDoor(b, color){
  let pos, size;
  if(b.open === 'N'){ pos = [b.x, b.h/2, b.z-b.d/2]; size = [b.w, b.h, 0.3]; }
  else if(b.open === 'S'){ pos = [b.x, b.h/2, b.z+b.d/2]; size = [b.w, b.h, 0.3]; }
  else if(b.open === 'W'){ pos = [b.x-b.w/2, b.h/2, b.z]; size = [0.3, b.h, b.d]; }
  else { pos = [b.x+b.w/2, b.h/2, b.z]; size = [0.3, b.h, b.d]; }

  const hex = color === 'red' ? 0xff3b3b : 0x2fa5ff;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    new THREE.MeshStandardMaterial({ color:hex, emissive:hex, emissiveIntensity:0.5, metalness:0.6, roughness:0.4 })
  );
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  scene.add(mesh);

  const box = new THREE.Box3().setFromCenterAndSize(
    new THREE.Vector3(pos[0], pos[1], pos[2]),
    new THREE.Vector3(size[0], size[1], size[2])
  );
  colliders.push(box);

  const id = 'door_' + color;
  lockedDoors[color] = { mesh, box, id, unlocked:false };

  interactables.push({
    id, type:'door', position:new THREE.Vector3(pos[0], pos[1], pos[2]), range:3,
    label:`Locked Door — Requires ${color === 'red' ? 'Red' : 'Blue'} Keycard`,
    onInteract:()=>{
      const has = color === 'red' ? state.inventory.redCard : state.inventory.blueCard;
      if(has){ unlockDoor(color); }
      else { playDenied(); showToast(`Requires ${color === 'red' ? 'Red' : 'Blue'} Keycard`); }
    },
  });
}

function unlockDoor(color, silent){
  const entry = lockedDoors[color];
  if(!entry || entry.unlocked) return;
  entry.unlocked = true;
  scene.remove(entry.mesh);
  const idx = colliders.indexOf(entry.box);
  if(idx >= 0) colliders.splice(idx, 1);
  interactables = interactables.filter(o => o.id !== entry.id);
  if(!silent){ playUnlock(); showToast('Door unlocked.'); }
}

function addPickup(x, y, z, kind, color, label){
  const geo = new THREE.IcosahedronGeometry(0.3, 0);
  const mat = new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:0.6, roughness:0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  scene.add(mesh);

  const id = 'pickup_' + kind + '_' + Math.random().toString(36).slice(2);
  interactables.push({
    id, type:'pickup', position:mesh.position, range:2.2, label:`Pick up ${label} (E)`,
    onInteract:()=>{
      if(kind === 'red') state.inventory.redCard = true;
      else if(kind === 'blue') state.inventory.blueCard = true;
      else state.inventory[kind] += 1;
      scene.remove(mesh);
      interactables = interactables.filter(o => o.id !== id);
      playPickup();
      showToast(`+ ${label}`);
      updateInventoryUI();
      checkKeycardsMission();
    },
  });

  return { mesh, animate:(t)=>{ mesh.rotation.y = t; mesh.position.y = y + Math.sin(t*2)*0.08; } };
}

const spinPickups = [];

function addPickupSpinning(x, y, z, kind, color, label){
  const p = addPickup(x, y, z, kind, color, label);
  spinPickups.push(p);
}

function addConsole(x, y, z, id, label, kind){
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.3, 0.5),
    new THREE.MeshStandardMaterial({ color:0x1c2230, emissive:0x2fa5ff, emissiveIntensity:0.5, roughness:0.4, metalness:0.5 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  scene.add(mesh);

  const screenLight = new THREE.PointLight(0x2fa5ff, 0.6, 3);
  screenLight.position.set(x, y+0.5, z);
  scene.add(screenLight);

  interactables.push({
    id, type:'console', position:mesh.position, range:2.6, label:`${label} (E)`,
    onInteract:()=>handleConsole(kind, mesh, screenLight),
  });
}

function handleConsole(kind, mesh, screenLight){
  switch(kind){
    case 'power':
      if(state.flags.power){ showToast('Power already restored.'); return; }
      if(state.inventory.repairTool < 1){ playDenied(); showToast('Requires a Repair Tool. Craft one (C).'); return; }
      state.inventory.repairTool -= 1;
      state.flags.power = true;
      completeMission('power');
      turnOnPower();
      playPowerUp();
      showToast('Electricity restored across the outpost.');
      markConsoleFixed(mesh, screenLight);
      updateInventoryUI();
      break;
    case 'oxygen':
      if(state.flags.oxygen){ showToast('Oxygen generators already stable.'); return; }
      if(!state.flags.power){ playDenied(); showToast('The generators need power first.'); return; }
      if(state.inventory.coolant < 1){ playDenied(); showToast('Requires a Coolant Canister.'); return; }
      state.inventory.coolant -= 1;
      state.flags.oxygen = true;
      completeMission('oxygen');
      playPowerUp();
      showToast('Oxygen generators stabilized.');
      markConsoleFixed(mesh, screenLight);
      updateInventoryUI();
      break;
    case 'research':
      if(state.flags.research){ showToast('Data already recovered.'); return; }
      state.flags.research = true;
      completeMission('research');
      playBeep(900);
      markConsoleFixed(mesh, screenLight);
      showCutscene('RECOVERED LOG — CREW LOG 114', RESEARCH_TEXT);
      break;
    case 'tower':
      if(state.flags.tower){ showToast('Antenna already repaired.'); return; }
      if(!state.flags.power){ playDenied(); showToast('The tower has no power.'); return; }
      if(state.inventory.antenna < 1){ playDenied(); showToast('Requires an Antenna Part.'); return; }
      state.inventory.antenna -= 1;
      state.flags.tower = true;
      completeMission('tower');
      playPowerUp();
      showToast('Communication array repaired.');
      markConsoleFixed(mesh, screenLight);
      updateInventoryUI();
      break;
    case 'beacon':
      if(!state.flags.tower){ playDenied(); showToast('Repair the antenna first.'); return; }
      if(state.flags.beacon){ showToast('Beacon already active.'); return; }
      state.flags.beacon = true;
      completeMission('beacon');
      playAlarmOnce();
      showToast('Emergency beacon activated!');
      markConsoleFixed(mesh, screenLight);
      break;
    case 'shuttle':
      if(!state.flags.beacon){ playDenied(); showToast('Activate the beacon before launch.'); return; }
      triggerVictory();
      return;
    case 'save':
      saveGame();
      playBeep(1000);
      showToast('Progress saved.');
      return;
  }
  saveGame();
}

function markConsoleFixed(mesh, screenLight){
  mesh.material.emissive.set(0x35ff9c);
  mesh.material.emissiveIntensity = 0.7;
  screenLight.color.set(0x35ff9c);
}

function turnOnPower(){
  interiorLights.forEach(l=>{ l.color.set(0xbfe3ff); l.intensity = 1.15; });
}

function solarFarm(){
  for(let i=0;i<12;i++){
    const row = Math.floor(i/4), col = i%4;
    const x = 14 + col*4, z = 14 + row*5;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,1.4,6), new THREE.MeshStandardMaterial({ color:0x333333 }));
    pole.position.set(x, 0.7, z);
    pole.castShadow = true;
    scene.add(pole);
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.1, 1.6),
      new THREE.MeshStandardMaterial({ color:0x14203a, metalness:0.6, roughness:0.3, emissive:0x0a2a4a, emissiveIntensity:0.2 })
    );
    panel.position.set(x, 1.5, z);
    panel.rotation.x = -0.5;
    panel.castShadow = true;
    scene.add(panel);
  }
}

function shuttlePad(){
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(10,10,0.4,24), new THREE.MeshStandardMaterial({ color:0x444444, roughness:0.7 }));
  pad.position.set(0, 0.2, 60);
  pad.receiveShadow = true;
  scene.add(pad);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,6,16), new THREE.MeshStandardMaterial({ color:0xdddddd, metalness:0.6, roughness:0.3 }));
  body.position.set(0, 3.4, 60);
  body.castShadow = true;
  scene.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.6,3,16), new THREE.MeshStandardMaterial({ color:0xff5533, metalness:0.4, roughness:0.4 }));
  nose.position.set(0, 7.9, 60);
  nose.castShadow = true;
  scene.add(nose);

  for(let i=0;i<3;i++){
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2,2,1.2), new THREE.MeshStandardMaterial({ color:0x999999 }));
    const ang = i*(Math.PI*2/3);
    fin.position.set(Math.cos(ang)*1.7, 1.4, 60 + Math.sin(ang)*1.7);
    fin.rotation.y = -ang;
    fin.castShadow = true;
    scene.add(fin);
  }

  const padLight = new THREE.PointLight(0x66ccff, 1, 22);
  padLight.position.set(0, 4, 60);
  scene.add(padLight);
}

function scatterRocks(){
  const mat = new THREE.MeshStandardMaterial({ color:0x8a4a2f, roughness:1 });
  for(let i=0;i<130;i++){
    const x = (Math.random()-0.5)*190, z = (Math.random()-0.5)*190;
    if(Math.hypot(x, z) < 10) continue;
    const s = 0.3 + Math.random()*0.9;
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), mat);
    rock.position.set(x, s*0.3, z);
    rock.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    rock.castShadow = true; rock.receiveShadow = true;
    scene.add(rock);
  }
}

function buildWorld(){
  const living  = createBuilding({ x:0,   z:0,   w:14, d:14, h:4,   color:0x3a3f4a, open:'S' });
  const lab     = createBuilding({ x:20,  z:-8,  w:12, d:10, h:4,   color:0x33475a, open:'W' });
  const archive = createBuilding({ x:34,  z:-8,  w:6,  d:6,  h:3.5, color:0x24304a, open:'W' });
  const power   = createBuilding({ x:-20, z:-8,  w:10, d:10, h:5,   color:0x5a4a2a, open:'E' });
  const storage = createBuilding({ x:-20, z:20,  w:14, d:10, h:4.5, color:0x4a3a2f, open:'S' });
  const tower   = createBuilding({ x:0,   z:-46, w:8,  d:8,  h:5,   color:0x3a3a3a, open:'N' });
  createBuilding({ x:42, z:36, w:10, d:16, h:3.2, color:0x151515, open:'W' });

  sealedZones.push({ x:living.x, z:living.z, w:living.w, d:living.d });
  sealedZones.push({ x:lab.x, z:lab.z, w:lab.w, d:lab.d });
  sealedZones.push({ x:archive.x, z:archive.z, w:archive.w, d:archive.d });
  sealedZones.push({ x:power.x, z:power.z, w:power.w, d:power.d });
  sealedZones.push({ x:storage.x, z:storage.z, w:storage.w, d:storage.d });

  addLockedDoor(archive, 'blue');
  addLockedDoor(tower, 'red');

  // Communication mast + dish
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,22,8), new THREE.MeshStandardMaterial({ color:0x888888, metalness:0.7, roughness:0.4 }));
  mast.position.set(0, 5+11, -46); mast.castShadow = true; scene.add(mast);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 16, 12, 0, Math.PI*2, 0, Math.PI/2),
    new THREE.MeshStandardMaterial({ color:0xdddddd, side:THREE.DoubleSide, metalness:0.5, roughness:0.5 })
  );
  dish.rotation.x = Math.PI*0.15;
  dish.position.set(0, 5+22, -46); dish.castShadow = true; scene.add(dish);

  // dim eerie light in the cave
  const caveLight = new THREE.PointLight(0x2fff9c, 0.4, 20, 2);
  caveLight.position.set(42, 1.6, 36);
  scene.add(caveLight);

  // Consoles
  addConsole(0,   1.2, -4,  'c_save',     'Checkpoint Terminal', 'save');
  addConsole(-23, 1.2, -8,  'c_power',    'Power Console',       'power');
  addConsole(19,  1.2, -8,  'c_oxygen',   'Oxygen Console',      'oxygen');
  addConsole(33,  1.2, -8,  'c_research', 'Research Terminal',   'research');
  addConsole(-1.2,1.2, -46, 'c_tower',    'Antenna Console',     'tower');
  addConsole(1.6, 1.2, -46, 'c_beacon',   'Beacon Console',      'beacon');
  addConsole(0,   1.2, 58,  'c_shuttle',  'Shuttle Launch Console', 'shuttle');

  // Pickups
  addPickupSpinning(-24, 0.5, -14, 'scrap',   0xb0b0b0, 'Scrap Metal');
  addPickupSpinning(-16, 0.5, -4,  'scrap',   0xb0b0b0, 'Scrap Metal');
  addPickupSpinning(-22, 0.5, 22,  'wiring',  0xffd23f, 'Wiring Spool');
  addPickupSpinning(-16, 0.5, 24,  'antenna', 0x9fd8ff, 'Antenna Part');
  addPickupSpinning(-24, 0.5, 18,  'blue',    0x2fa5ff, 'Blue Keycard');
  addPickupSpinning(46,  0.5, 40,  'coolant', 0x7fffd4, 'Coolant Canister');
  addPickupSpinning(38,  0.5, 32,  'red',     0xff3b3b, 'Red Keycard');

  solarFarm();
  shuttlePad();
  scatterRocks();
}

function isInSealedZone(pos){
  return sealedZones.some(z => Math.abs(pos.x - z.x) < z.w/2 && Math.abs(pos.z - z.z) < z.d/2);
}

/* ============================================================
   PLAYER CONTROLLER
============================================================ */
function tryMove(obj, dx, dz){
  if(dx === 0 && dz === 0) return;
  const newX = obj.position.x + dx;
  const newZ = obj.position.z + dz;
  const r = 0.4;
  const playerBox = new THREE.Box3(
    new THREE.Vector3(newX-r, obj.position.y-1.6, newZ-r),
    new THREE.Vector3(newX+r, obj.position.y+0.3, newZ+r)
  );
  for(let i=0;i<colliders.length;i++){
    if(playerBox.intersectsBox(colliders[i])) return;
  }
  obj.position.x = newX;
  obj.position.z = newZ;
}

function updatePlayer(delta){
  const obj = controls.getObject();

  state.velocity.y -= 18*delta;

  const forwardInput = (state.keys['KeyW'] ? 1 : 0) - (state.keys['KeyS'] ? 1 : 0);
  const rightInput   = (state.keys['KeyD'] ? 1 : 0) - (state.keys['KeyA'] ? 1 : 0);
  state.moving = forwardInput !== 0 || rightInput !== 0;

  const sprintKey = state.keys['ShiftLeft'] || state.keys['ShiftRight'];
  const canSprint = sprintKey && state.energy > 1 && forwardInput > 0;
  const speed = canSprint ? 7.5 : 4.2;

  if(canSprint){ state.energy = Math.max(0, state.energy - 14*delta); }
  else { state.energy = Math.min(100, state.energy + 10*delta); }

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

  const move = new THREE.Vector3();
  move.addScaledVector(forward, forwardInput);
  move.addScaledVector(right, rightInput);
  if(move.lengthSq() > 0) move.normalize().multiplyScalar(speed*delta);

  tryMove(obj, move.x, 0);
  tryMove(obj, 0, move.z);

  if(state.keys['Space'] && state.grounded){
    state.velocity.y = 6.2;
    state.grounded = false;
  }

  obj.position.y += state.velocity.y*delta;
  if(obj.position.y < 1.7){
    obj.position.y = 1.7;
    state.velocity.y = 0;
    state.grounded = true;
  }

  obj.position.x = THREE.MathUtils.clamp(obj.position.x, -98, 98);
  obj.position.z = THREE.MathUtils.clamp(obj.position.z, -98, 98);

  if(state.moving && state.grounded){
    state.lastFootstep -= delta;
    if(state.lastFootstep <= 0){
      playFootstep();
      state.lastFootstep = canSprint ? 0.28 : 0.44;
    }
  }
}

function updateOxygen(delta){
  const obj = controls.getObject();
  const sealed = isInSealedZone(obj.position);

  if(sealed && state.flags.oxygen){
    state.oxygen = Math.min(100, state.oxygen + 6*delta);
  } else if(sealed && !state.flags.oxygen){
    state.oxygen = Math.max(0, state.oxygen - 1.5*delta);
  } else {
    const rate = state.flags.power ? 2.2 : 3;
    state.oxygen = Math.max(0, state.oxygen - rate*delta);
  }

  if(state.oxygen <= 0){
    state.health = Math.max(0, state.health - 8*delta);
  }

  if(state.oxygen < 18 && !state._alarmPlaying) startAlarm();
  if(state.oxygen >= 18 && state._alarmPlaying) stopAlarm();

  if(state.health <= 0 && !state.gameOver){
    triggerGameOver('Your suit ran out of oxygen.');
  }
}

function updateInteraction(){
  const obj = controls.getObject();
  const camPos = obj.position;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  let nearest = null, nearestDist = Infinity;
  for(let i=0;i<interactables.length;i++){
    const it = interactables[i];
    const d = camPos.distanceTo(it.position);
    if(d > it.range) continue;
    const dir = it.position.clone().sub(camPos).normalize();
    if(forward.dot(dir) < 0.45) continue;
    if(d < nearestDist){ nearest = it; nearestDist = d; }
  }
  activeInteractable = nearest;

  const promptEl = document.getElementById('interactPrompt');
  if(nearest){ promptEl.textContent = nearest.label; promptEl.classList.remove('hidden'); }
  else { promptEl.classList.add('hidden'); }
}

/* ============================================================
   MISSIONS / INVENTORY / UI
============================================================ */
function completeMission(id){
  const m = MISSIONS.find(x => x.id === id);
  if(!m || m.done) return;
  m.done = true;
  refreshQuestUI();
  updateObjectiveBanner();
  showToast(`Objective Complete: ${m.title}`);
}

function checkKeycardsMission(){
  if(state.inventory.redCard && state.inventory.blueCard){
    completeMission('keycards');
  }
}

function refreshQuestUI(){
  const list = document.getElementById('questList');
  list.innerHTML = '';
  MISSIONS.forEach(m=>{
    const li = document.createElement('li');
    li.className = m.done ? 'done' : '';
    li.innerHTML = `<span class="check">${m.done ? '&#10003;' : '&#9675;'}</span><div><strong>${m.title}</strong><p>${m.desc}</p></div>`;
    list.appendChild(li);
  });
}

function updateObjectiveBanner(){
  const next = MISSIONS.find(m => !m.done);
  document.getElementById('objectiveText').textContent = next ? next.title : 'Mission Complete — Escape Achieved';
}

function updateInventoryUI(){
  const bar = document.getElementById('inventoryBar');
  bar.innerHTML = '';
  const items = [
    ['scrap', '&#9935;', state.inventory.scrap],
    ['wiring', '&#128268;', state.inventory.wiring],
    ['coolant', '&#10052;', state.inventory.coolant],
    ['antenna', '&#128225;', state.inventory.antenna],
    ['repairTool', '&#128295;', state.inventory.repairTool],
    ['redCard', '&#128992;', state.inventory.redCard ? 1 : 0],
    ['blueCard', '&#128998;', state.inventory.blueCard ? 1 : 0],
  ];
  items.forEach(([key, icon, count])=>{
    if(!count) return;
    const div = document.createElement('div');
    div.className = 'inv-item';
    div.innerHTML = `<span class="inv-icon">${icon}</span><span class="inv-count">${count}</span>`;
    bar.appendChild(div);
  });
}

function renderCraftPanel(){
  const list = document.getElementById('craftList');
  list.innerHTML = '';
  RECIPES.forEach(r=>{
    const can = Object.entries(r.need).every(([k, v]) => state.inventory[k] >= v);
    const div = document.createElement('div');
    div.className = 'craft-item';
    const needText = Object.entries(r.need).map(([k, v]) => `${v} ${k}`).join(', ');
    div.innerHTML = `<div><strong>${r.label}</strong><p>Requires: ${needText}</p></div>`;
    const btn = document.createElement('button');
    btn.textContent = 'CRAFT';
    btn.disabled = !can;
    btn.className = 'btn-secondary';
    btn.onclick = ()=>{
      Object.entries(r.need).forEach(([k, v]) => { state.inventory[k] -= v; });
      state.inventory[r.resultKey] += 1;
      updateInventoryUI();
      renderCraftPanel();
      showToast(`Crafted ${r.label}`);
      playBeep(1000);
    };
    div.appendChild(btn);
    list.appendChild(div);
  });
}

function updateHUDBars(){
  document.getElementById('healthBar').style.width = state.health + '%';
  document.getElementById('oxygenBar').style.width = state.oxygen + '%';
  document.getElementById('energyBar').style.width = state.energy + '%';
  document.getElementById('healthBar').classList.toggle('low', state.health < 25);
  document.getElementById('oxygenBar').classList.toggle('low', state.oxygen < 25);
}

function showToast(msg){
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  c.appendChild(el);
  requestAnimationFrame(()=> el.classList.add('show'));
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=> el.remove(), 400); }, 3200);
}

function showCutscene(title, text, after){
  state.paused = true;
  if(document.pointerLockElement === renderer.domElement) controls.unlock();
  document.getElementById('cutsceneTitle').textContent = title;
  document.getElementById('cutsceneText').textContent = text;
  const panel = document.getElementById('cutscene');
  panel.classList.remove('hidden');
  const btn = document.getElementById('btnCutsceneContinue');
  const handler = ()=>{
    panel.classList.add('hidden');
    state.paused = false;
    btn.removeEventListener('click', handler);
    if(state.started && !state.gameOver && !state.victory) controls.lock();
    if(after) after();
  };
  btn.addEventListener('click', handler);
}

/* ============================================================
   FLASHLIGHT / CRAFT / QUEST TOGGLES
============================================================ */
function toggleFlashlight(){
  state.flashlightOn = !state.flashlightOn;
  flashlight.intensity = state.flashlightOn ? 2.4 : 0;
}

function toggleCraftPanel(){
  const panel = document.getElementById('craftPanel');
  const opening = panel.classList.contains('hidden');
  document.getElementById('questLog').classList.add('hidden');
  if(opening){
    renderCraftPanel();
    panel.classList.remove('hidden');
    state.uiOpen = true;
    if(document.pointerLockElement === renderer.domElement) controls.unlock();
  } else {
    panel.classList.add('hidden');
    state.uiOpen = false;
    if(state.started && !state.gameOver && !state.victory) controls.lock();
  }
}

function toggleQuestLog(){
  const panel = document.getElementById('questLog');
  const opening = panel.classList.contains('hidden');
  document.getElementById('craftPanel').classList.add('hidden');
  if(opening){
    refreshQuestUI();
    panel.classList.remove('hidden');
    state.uiOpen = true;
    if(document.pointerLockElement === renderer.domElement) controls.unlock();
  } else {
    panel.classList.add('hidden');
    state.uiOpen = false;
    if(state.started && !state.gameOver && !state.victory) controls.lock();
  }
}

/* ============================================================
   GAME OVER / VICTORY
============================================================ */
function triggerGameOver(reason){
  state.gameOver = true;
  stopAlarm();
  if(document.pointerLockElement === renderer.domElement) controls.unlock();
  document.getElementById('gameOverReason').textContent = reason;
  document.getElementById('gameOverScreen').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
}

function triggerVictory(){
  state.victory = true;
  if(document.pointerLockElement === renderer.domElement) controls.unlock();
  completeMission('escape');
  document.getElementById('victoryScreen').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  playPowerUp();
  localStorage.removeItem(SAVE_KEY);
}

/* ============================================================
   SAVE / LOAD
============================================================ */
function saveGame(){
  const obj = controls.getObject();
  const data = {
    pos:[obj.position.x, obj.position.y, obj.position.z],
    health: state.health, oxygen: state.oxygen, energy: state.energy,
    flags: state.flags, inventory: state.inventory,
    missions: MISSIONS.map(m => ({ id:m.id, done:m.done })),
    sensitivity: state.sensitivity, volume: state.volume,
  };
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }
  catch(e){ console.warn('Save failed', e); }
}

function loadGame(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return false;
  try{
    const data = JSON.parse(raw);
    const obj = controls.getObject();
    obj.position.set(data.pos[0], data.pos[1], data.pos[2]);
    state.health = data.health; state.oxygen = data.oxygen; state.energy = data.energy;
    Object.assign(state.flags, data.flags);
    Object.assign(state.inventory, data.inventory);
    (data.missions || []).forEach(m=>{
      const mm = MISSIONS.find(x => x.id === m.id);
      if(mm) mm.done = m.done;
    });
    state.sensitivity = data.sensitivity || 1;
    state.volume = data.volume !== undefined ? data.volume : 0.6;
    controls.pointerSpeed = state.sensitivity;

    if(state.flags.power) turnOnPower();
    if(state.inventory.redCard) unlockDoor('red', true);
    if(state.inventory.blueCard) unlockDoor('blue', true);

    updateInventoryUI();
    refreshQuestUI();
    updateObjectiveBanner();
    updateHUDBars();
    return true;
  } catch(e){
    console.warn('Failed to load save', e);
    return false;
  }
}

/* ============================================================
   PROCEDURAL AUDIO
============================================================ */
function initAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = state.volume;
  masterGain.connect(audioCtx.destination);
  startWind();
}

function noiseBuffer(duration){
  const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate*duration));
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i] = Math.random()*2 - 1;
  return buffer;
}

function startWind(){
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer(4);
  src.loop = true;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  const windGain = audioCtx.createGain();
  windGain.gain.value = 0.12;
  src.connect(filter); filter.connect(windGain); windGain.connect(masterGain);
  src.start();

  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 250;
  lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
  lfo.start();
}

function playFootstep(){
  if(!audioCtx) return;
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer(0.12);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 180 + Math.random()*80;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  src.connect(filter); filter.connect(gain); gain.connect(masterGain);
  src.start(); src.stop(audioCtx.currentTime + 0.12);
}

function playBeep(freq){
  if(!audioCtx) return;
  const f = freq || 880;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine'; osc.frequency.value = f;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
  osc.connect(gain); gain.connect(masterGain);
  osc.start(); osc.stop(audioCtx.currentTime + 0.2);
}

function playPickup(){ playBeep(1200); setTimeout(()=>playBeep(1600), 80); }
function playDenied(){ playBeep(220); }
function playUnlock(){ playBeep(700); setTimeout(()=>playBeep(1000), 100); }

function playPowerUp(){
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.6);
  osc.frequency.setValueAtTime(80, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1.5);
  osc.connect(gain); gain.connect(masterGain);
  osc.start(); osc.stop(audioCtx.currentTime + 1.6);
}

function playAlarmOnce(){ playBeep(600); setTimeout(()=>playBeep(900), 150); setTimeout(()=>playBeep(1200), 300); }

function startAlarm(){
  if(state._alarmPlaying || !audioCtx) return;
  state._alarmPlaying = true;
  document.getElementById('vignette').classList.add('critical');
  alarmInterval = setInterval(()=>{
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.4);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime + 0.45);
  }, 600);
}

function stopAlarm(){
  state._alarmPlaying = false;
  document.getElementById('vignette').classList.remove('critical');
  if(alarmInterval){ clearInterval(alarmInterval); alarmInterval = null; }
}

/* ============================================================
   INPUT / UI BINDING
============================================================ */
function onKeyDown(e){
  state.keys[e.code] = true;
  if(e.code === 'Space' || e.code === 'Tab') e.preventDefault();
  if(!state.started) return;

  if(e.code === 'KeyE' && activeInteractable && !state.paused && !state.uiOpen){ activeInteractable.onInteract(); }
  if(e.code === 'KeyF' && !state.paused && !state.uiOpen){ toggleFlashlight(); }
  if(e.code === 'KeyC' && !state.paused){ toggleCraftPanel(); }
  if((e.code === 'KeyQ' || e.code === 'Tab') && !state.paused){ toggleQuestLog(); }
  if(e.code === 'Escape'){
    if(state.uiOpen){
      document.getElementById('craftPanel').classList.add('hidden');
      document.getElementById('questLog').classList.add('hidden');
      state.uiOpen = false;
      if(!state.gameOver && !state.victory) controls.lock();
    } else if(document.pointerLockElement === renderer.domElement){
      controls.unlock();
    }
  }
}

function onKeyUp(e){ state.keys[e.code] = false; }

function bindUI(){
  const sens1 = document.getElementById('sensSlider');
  const sens2 = document.getElementById('sensSlider2');
  const vol1 = document.getElementById('volSlider');
  const vol2 = document.getElementById('volSlider2');

  function syncSens(v){
    state.sensitivity = parseFloat(v);
    controls.pointerSpeed = state.sensitivity;
    sens1.value = v; sens2.value = v;
  }
  function syncVol(v){
    state.volume = parseFloat(v);
    if(masterGain) masterGain.gain.value = state.volume;
    vol1.value = v; vol2.value = v;
  }
  sens1.addEventListener('input', e => syncSens(e.target.value));
  sens2.addEventListener('input', e => syncSens(e.target.value));
  vol1.addEventListener('input', e => syncVol(e.target.value));
  vol2.addEventListener('input', e => syncVol(e.target.value));

  document.getElementById('btnBegin').addEventListener('click', ()=> startGame(false));
  document.getElementById('btnContinue').addEventListener('click', ()=> startGame(true));
  document.getElementById('btnResume').addEventListener('click', ()=> controls.lock());
  document.getElementById('btnSave').addEventListener('click', ()=>{ saveGame(); showToast('Game saved.'); });
  document.getElementById('btnRestart').addEventListener('click', ()=>{ localStorage.removeItem(SAVE_KEY); location.reload(); });
  document.getElementById('btnRetry').addEventListener('click', ()=>{ localStorage.removeItem(SAVE_KEY); location.reload(); });
  document.getElementById('btnPlayAgain').addEventListener('click', ()=>{ localStorage.removeItem(SAVE_KEY); location.reload(); });

  document.getElementById('gameCanvas').addEventListener('click', ()=>{
    if(state.started && !state.paused && !state.gameOver && !state.victory && !state.uiOpen &&
       document.pointerLockElement !== renderer.domElement){
      controls.lock();
    }
  });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', ()=>{ state.keys = {}; });

  controls.addEventListener('lock', ()=>{
    document.getElementById('pauseMenu').classList.add('hidden');
    state.paused = false;
  });
  controls.addEventListener('unlock', ()=>{
    const cutsceneHidden = document.getElementById('cutscene').classList.contains('hidden');
    if(state.started && !state.gameOver && !state.victory && !state.uiOpen && cutsceneHidden){
      state.paused = true;
      document.getElementById('pauseMenu').classList.remove('hidden');
    }
  });
}

function startGame(loadExisting){
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  state.started = true;
  initAudio();
  if(loadExisting) loadGame();
  updateInventoryUI();
  refreshQuestUI();
  updateObjectiveBanner();
  updateHUDBars();
  controls.lock();
  setTimeout(()=>{ if(!state.flags.power) showToast("Restore the outpost's power to begin."); }, 1500);
}

/* ============================================================
   MAIN LOOP
============================================================ */
function animate(){
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);

  if(state.started && !state.paused && !state.gameOver && !state.victory){
    updatePlayer(delta);
    updateOxygen(delta);
    updateInteraction();
    updateHUDBars();
  }

  const t = performance.now()*0.002;
  spinPickups.forEach(p => p.animate(t));

  updateDustStorm(delta);
  renderer.render(scene, camera);
}

/* ============================================================
   BOOTSTRAP
============================================================ */
initThree();
bindUI();
if(localStorage.getItem(SAVE_KEY)){
  document.getElementById('btnContinue').style.display = 'inline-block';
}
animate();