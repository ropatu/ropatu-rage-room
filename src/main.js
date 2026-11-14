import * as THREE from 'three';
import { TARGETS, TOOLS } from './game.js';

const canvas = document.querySelector('#game');
const dialog = document.querySelector('#intro');
const start = document.querySelector('#start');
const score = document.querySelector('#score');
const status = document.querySelector('#game-status');
const lowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowEnd, powerPreference: 'low-power', alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowEnd ? 1 : 1.5));
renderer.shadowMap.enabled = !lowEnd;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#10151c');
scene.fog = new THREE.Fog('#10151c', 12, 26);
const camera = new THREE.PerspectiveCamera(43, 1, .1, 60);
camera.position.set(0, 4.1, 10.8);
camera.lookAt(0, 1.5, 0);
scene.add(new THREE.HemisphereLight('#d8e2f4', '#34251d', 2.1));
const key = new THREE.DirectionalLight('#ffe3b0', 3.2); key.position.set(-4, 8, 5); key.castShadow = !lowEnd; scene.add(key);
const fill = new THREE.PointLight('#6b9aca', 32, 12); fill.position.set(4, 4, -3); scene.add(fill);
const warm = new THREE.PointLight('#ff9c4a', 18, 9); warm.position.set(-5, 3, -2); scene.add(warm);

const mat = (color, roughness = .75, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const wallMat = mat('#30313a'), floorMat = mat('#29282c'), metal = mat('#68717b', .42, .72);
const room = new THREE.Group(); scene.add(room);
function box(parent, size, position, material, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.castShadow = opts.castShadow ?? true; mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}
box(room, [14, .18, 12], [0, -.12, -1], floorMat);
box(room, [14, 6, .2], [0, 2.8, -6.8], wallMat);
box(room, [.2, 6, 12], [-7, 2.8, -1], mat('#272a32'));
box(room, [.2, 6, 12], [7, 2.8, -1], mat('#272a32'));
// Concrete wall panels, seams, base trim, ceiling rails, and a warm practical light give the room real depth.
for (let x = -6; x <= 6; x += 2) {
  box(room, [.035, 5.5, .035], [x, 2.7, -6.66], mat('#48454a'), { castShadow: false });
  box(room, [1.65, .04, .04], [x + 1, 1.55, -6.62], mat('#66594c'), { castShadow: false });
}
box(room, [13.8, .12, .16], [0, .08, -6.5], mat('#604c3e'));
box(room, [12, .08, .14], [0, 5.3, -5.9], mat('#5e626d'));
box(room, [3.5, .14, .6], [-2.6, 5.12, -5.75], mat('#f1bd68', .3), { castShadow: false });
const lamp = new THREE.PointLight('#ffc66f', 28, 7); lamp.position.set(-2.6, 4.7, -4.3); room.add(lamp);
// Floor tile joints and drains.
for (let x = -6; x <= 6; x += 2) box(room, [.025, .012, 11], [x, -.02, -1], mat('#3b393d'), { castShadow: false });
for (let z = -6; z <= 4; z += 2) box(room, [13.8, .012, .025], [0, -.018, z], mat('#3b393d'), { castShadow: false });

const targets = new Map();
function addTarget(id, label, position, build) {
  const group = new THREE.Group(); group.position.set(...position); group.userData.targetId = id; group.userData.label = label;
  build(group); scene.add(group); targets.set(id, { group, label, hp: TARGETS.find(t => t.id === id).hp, maxHp: TARGETS.find(t => t.id === id).maxHp, broken: false });
}
const screen = mat('#0b1117', .25, .28), screenGlow = new THREE.MeshStandardMaterial({ color: '#173b47', emissive: '#16b7ca', emissiveIntensity: .65, roughness: .2 });
addTarget('monitor', 'CRT monitor', [-3.2, 0, -2.1], g => {
  box(g,[1.65,1.12,.72],[0,1.45,0],mat('#454852',.48,.3));
  box(g,[1.42,.86,.08],[0,1.48,.4],screen);
  box(g,[1.28,.72,.04],[0,1.48,.45],screenGlow);
  box(g,[.3,.25,.26],[0,.76,-.02],metal); box(g,[.85,.1,.7],[0,.65,.03],metal);
  for (let i=0;i<3;i++) box(g,[.04,.04,.025],[.53+i*.09,1.06,.46],mat('#e6a450'));
});
addTarget('chair', 'Office chair', [0, 0, -1], g => {
  const leather = mat('#843d48',.5,.06);
  box(g,[.92,1.05,.38],[0,1.72,0],leather);
  box(g,[1.02,.22,.88],[0,1.12,.08],mat('#a24951',.52));
  box(g,[.14,.62,.14],[0,.66,.1],metal);
  for (const [x,z] of [[-.42,-.28],[.42,-.28],[-.42,.42],[.42,.42]]) {
    const leg=box(g,[.52,.09,.09],[x/2,.28,z/2],metal); leg.rotation.y=Math.atan2(z,x);
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.12,12),mat('#15171a',.45)); wheel.rotation.z=Math.PI/2; wheel.position.set(x,.13,z); wheel.castShadow=true; g.add(wheel);
  }
  box(g,[.12,.82,.1],[-.58,1.43,.03],metal); box(g,[.12,.82,.1],[.58,1.43,.03],metal);
});
addTarget('cabinet', 'Filing cabinet', [3.25, 0, -2], g => {
  const body=mat('#9b7845',.55,.25); box(g,[1.24,1.95,.85],[0,1.02,0],body);
  for (let y of [.45,1.03,1.61]) {
    box(g,[1.1,.52,.035],[0,y,.45],mat('#b89458',.43,.2));
    box(g,[.22,.055,.07],[0,y+.02,.5],mat('#37383b',.32,.65));
    box(g,[.38,.025,.03],[0,y-.13,.49],mat('#d2c19a',.65));
  }
  box(g,[1.35,.12,.95],[0,.08,0],metal);
});
// Add scuffed steel workbench, conduit, hanging cable, and a red emergency sign.
box(room,[2.4,.12,.9],[0,.7,-5],mat('#51545a',.4,.72));
for (const x of [-1,1]) box(room,[.12,.7,.12],[x,.34,-5],metal);
for (const x of [-5.6,5.6]) { const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,5.7,10),metal); pipe.position.set(x,2.8,-6.48); pipe.castShadow=true; room.add(pipe); }
box(room,[.82,.48,.08],[5.6,4.4,-6.45],mat('#7d322c'));

const tool = new THREE.Group(); tool.position.set(1.1, 1.15, 3.5); camera.add(tool); scene.add(camera);
const handle=box(tool,[.16,.95,.16],[0,-.25,0],mat('#6f4a35'));
let toolMeshes=[];
function buildTool(type) {
  for(const m of toolMeshes){ tool.remove(m); m.geometry.dispose(); }
  toolMeshes=[];
  const headMat=mat(type==='bat'?'#95724c':'#65707c',.4,type==='bat'?.2:.75);
  if(type==='bat') { const b=new THREE.Mesh(new THREE.CylinderGeometry(.085,.16,1.12,12),mat('#976847')); b.rotation.z=-.52; b.position.set(.2,.12,-.2); tool.add(b); toolMeshes.push(b); }
  else { const h=new THREE.Mesh(new THREE.BoxGeometry(type==='sledge'?.9:.56,.23,.28),headMat); h.position.set(.05,.2,-.1); tool.add(h); toolMeshes.push(h); }
  handle.visible=type!=='bat'; tool.userData.type=type;
}
buildTool('bat');

const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
let selected='chair', selectedTool='bat', smashes=0, swingUntil=0, debris=[], lastDraw=0;
const hitMaterial=mat('#f0ba70',.36,.08);
function selectTarget(id, announce=true) {
  if(!targets.has(id)) return;
  selected=id;
  document.querySelectorAll('[data-target]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.target===id)));
  const target=targets.get(id);
  document.querySelector('#target-label').textContent=target.label;
  if(announce) status.textContent=`${target.label} selected. ${target.hp} hits remaining.`;
}
function makeDebris(target, power) {
  const source=target.group; const origin=source.position.clone();
  const color=target.group.children[0]?.material?.color?.getHex() ?? 0x8a7770;
  const count=lowEnd?5:9;
  for(let i=0;i<count;i++) {
    const size=.09+Math.random()*.19;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(size,size*(.5+Math.random()),size*.6),new THREE.MeshStandardMaterial({color,roughness:.65}));
    mesh.position.copy(origin).add(new THREE.Vector3((Math.random()-.5)*1.1,1+Math.random()*1.2,(Math.random()-.5)*.6));
    mesh.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3); mesh.castShadow=!lowEnd; scene.add(mesh);
    debris.push({mesh,velocity:new THREE.Vector3((Math.random()-.5)*power,Math.random()*power*.8+.7,(Math.random()-.5)*power),spin:new THREE.Vector3(Math.random()*8,Math.random()*8,Math.random()*8),life:1.5+Math.random()});
  }
}
function smash() {
  if(dialog.open) return;
  const target=targets.get(selected); if(!target || target.broken) { status.textContent=`${target?.label ?? 'Target'} is already wrecked. Reset the room to play again.`; return; }
  const power={bat:1,crowbar:2,sledge:3}[selectedTool]; target.hp=Math.max(0,target.hp-power); smashes++; score.textContent=`SMASHES: ${smashes}`;
  const mesh=target.group.children[0];
  if(mesh?.material) {
    const original=mesh.material; mesh.material=hitMaterial;
    setTimeout(()=>{ if(mesh.material===hitMaterial) mesh.material=original; },110);
  }
  // Damage changes the silhouette/material state of each prop as it wears down.
  if(selected==='chair') target.group.rotation.z=Math.min(.18,(target.maxHp-target.hp)*.035);
  if(selected==='cabinet') {
    const drawer=target.group.children[1]; if(drawer) drawer.position.z=.45+(target.maxHp-target.hp)*.07;
  }
  if(selected==='monitor' && target.hp<target.maxHp) {
    const glow=target.group.children[2]; if(glow?.material) glow.material.emissiveIntensity=Math.min(1.4,.65+(target.maxHp-target.hp)*.18);
  }
  makeDebris(target,.6+power*.36); swingUntil=performance.now()+220;
  if(target.hp===0) { target.broken=true; target.group.visible=false; status.textContent=`${target.label} smashed to pieces. Choose another target.`; }
  else status.textContent=`${target.label} hit. ${target.hp} hits remaining.`;
  render(performance.now());
}
function reset() {
  for(const d of debris){scene.remove(d.mesh);d.mesh.geometry.dispose();d.mesh.material.dispose();} debris=[];
  for(const [id,t] of targets){t.hp=t.maxHp;t.broken=false;t.group.visible=true;t.group.rotation.set(0,0,0);}
  smashes=0;score.textContent='SMASHES: 0';selectTarget('chair',false);status.textContent='Room reset. Choose a target and smash.';render(performance.now());
}
function render(now=performance.now()) {
  const elapsed=lastDraw?Math.min((now-lastDraw)/1000,.05):0; lastDraw=now;
  for(const d of debris){d.velocity.y-=5.8*elapsed;d.mesh.position.addScaledVector(d.velocity,elapsed);d.mesh.rotation.x+=d.spin.x*elapsed;d.mesh.rotation.y+=d.spin.y*elapsed;d.life-=elapsed; if(d.mesh.position.y<.12){d.mesh.position.y=.12;d.velocity.y*=-.28;d.velocity.x*=.78;d.velocity.z*=.78;}}
  debris=debris.filter(d=>{if(d.life>0)return true;scene.remove(d.mesh);d.mesh.geometry.dispose();d.mesh.material.dispose();return false;});
  if(swingUntil>now && !reducedMotion.matches) { const p=1-(swingUntil-now)/220; tool.rotation.x=-Math.sin(p*Math.PI)*.9; tool.rotation.z=Math.sin(p*Math.PI)*.65; }
  else { tool.rotation.set(0,0,0); swingUntil=0; }
  renderer.render(scene,camera);
  if((debris.length || swingUntil) && !reducedMotion.matches) requestAnimationFrame(render);
}
function resize() {
  const r=canvas.getBoundingClientRect(); if(!r.width||!r.height)return;
  renderer.setSize(r.width,r.height,false); camera.aspect=r.width/r.height; camera.updateProjectionMatrix(); render();
}
function pick(event) {
  const r=canvas.getBoundingClientRect(); pointer.set((event.clientX-r.left)/r.width*2-1,-((event.clientY-r.top)/r.height)*2+1); raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects([...targets.values()].filter(t=>!t.broken).map(t=>t.group),true);
  if(hits.length){let o=hits[0].object;while(o&&!o.userData.targetId)o=o.parent; if(o)selectTarget(o.userData.targetId);}
}
canvas.addEventListener('pointerdown',e=>{canvas.focus();pick(e);smash();});
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>selectTarget(b.dataset.target)));
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{selectedTool=b.dataset.tool;buildTool(selectedTool);document.querySelectorAll('[data-tool]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});document.querySelector('#tool-label').textContent=`TOOL: ${TOOLS[selectedTool].label}`;status.textContent=`${TOOLS[selectedTool].label} selected.`;render();}));
document.querySelector('#smash').addEventListener('click',smash);
document.querySelector('#reset').addEventListener('click',reset);
document.querySelector('#help-button').addEventListener('click',()=>{dialog.showModal();start.focus();});
function closeHelp(){dialog.close();canvas.focus();}
start.addEventListener('click',closeHelp);
document.querySelector('#skip-link').addEventListener('click',e=>{e.preventDefault();closeHelp();history.replaceState(null,'','#game');});
document.addEventListener('keydown',e=>{
 if(dialog.open||e.altKey||e.ctrlKey||e.metaKey)return;
 if(['ArrowLeft','ArrowRight',' ','Enter'].includes(e.key))e.preventDefault();
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const ids=[...targets.keys()],i=ids.indexOf(selected),step=e.key==='ArrowRight'?1:-1;selectTarget(ids[(i+step+ids.length)%ids.length]);}
 if(e.key===' '||e.key==='Enter')smash(); if(e.key.toLowerCase()==='r')reset(); if(/^[1-3]$/.test(e.key))document.querySelector(`[data-tool="${['bat','crowbar','sledge'][Number(e.key)-1]}"]`).click();
});
const observer=new ResizeObserver(resize);observer.observe(canvas);reducedMotion.addEventListener('change',()=>render());resize();
requestAnimationFrame(()=>{dialog.showModal();start.focus();});
