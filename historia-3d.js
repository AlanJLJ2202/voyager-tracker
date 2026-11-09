import { buildEnvironment } from './historia-ambientes.js';
// First-person dioramas. All geometry is generated locally; no model downloads.
const host = document.getElementById('first-person');
const enter = document.getElementById('enter-game');
let THREE, renderer, scene, camera, active=false, ready=false, yaw=0, pitch=0, previous=0;
let creatures=[], obstacles=[], materials=[], geometries=[], target=null, elapsed=0, environment=null;
let materialCache=new Map();
const discoveries=new Map();
const keys=new Set(), look={id:null,x:0,y:0}, world=window.historyWorld;
const player={x:0,z:20};
const hud=document.createElement('div');hud.className='game-hud';
hud.innerHTML=`<span class="crosshair" aria-hidden="true">+</span>
<div class="game-top"><span id="discovery-count" title="Lugares descubiertos en esta época">0 / 3 lugares</span><details class="popover"><summary>Opciones</summary><div><label>Época <select id="game-era" aria-label="Época en el escenario"></select></label><p class="game-help">WASD: caminar · Mayús: acelerar<br>Flechas o arrastrar: mirar<br>E: descubrir · Esc: liberar ratón</p><div class="controls"><button id="lock-look">Capturar ratón</button><button id="game-fullscreen">Pantalla completa</button><button id="leave-game">Volver al mapa</button></div></div></details></div>
<div class="game-note-card" id="game-notes" role="region" aria-labelledby="game-note-name" hidden><button id="close-game-note" aria-label="Cerrar ficha">×</button><h3 id="game-note-name"></h3><p id="game-note-detail"></p></div>
<div class="game-bottom"><span id="game-status" role="status"></span><button id="inspect" disabled>Descubrir · E</button></div>
<div class="touch-controls"><div class="touch-pad" aria-label="Caminar"><span></span><button data-move="KeyW" aria-label="Avanzar">↑</button><span></span><button data-move="KeyA" aria-label="Desplazarse a la izquierda">←</button><button data-move="KeyS" aria-label="Retroceder">↓</button><button data-move="KeyD" aria-label="Desplazarse a la derecha">→</button></div><div class="touch-look"><button data-move="ArrowLeft" aria-label="Mirar a la izquierda">↶</button><button data-move="ArrowRight" aria-label="Mirar a la derecha">↷</button></div></div>`;
const status=()=>document.getElementById('game-status');
function clearInput(){keys.clear();look.id=null;}
function material(color){if(materialCache.has(color))return materialCache.get(color);const m=new THREE.MeshStandardMaterial({color,roughness:.9});materials.push(m);materialCache.set(color,m);return m;}
function mesh(geometry,mat,parent,x=0,y=0,z=0){geometries.push(geometry);const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,mat,x,y,z,sx,sy,sz){return mesh(new THREE.BoxGeometry(sx,sy,sz),mat,parent,x,y,z);}
function ball(parent,mat,x,y,z,sx,sy,sz){const m=mesh(new THREE.SphereGeometry(1,10,8),mat,parent,x,y,z);m.scale.set(sx,sy,sz);return m;}
function cone(parent,mat,x,y,z,r,height){return mesh(new THREE.ConeGeometry(r,height,9),mat,parent,x,y,z);}
function cylinder(parent,mat,x,y,z,r,height){return mesh(new THREE.CylinderGeometry(r,r,height,8),mat,parent,x,y,z);}
function person(g,body,skin){box(g,body,0,1.05,0,.52,.7,.32);ball(g,skin,0,1.7,0,.23,.25,.23);box(g,body,-.35,1,0,.16,.7,.16);box(g,body,.35,1,0,.16,.7,.16);}
function creature(type,index){const g=new THREE.Group(),era=world.era;const body=material(era===6?'#79634e':era>=7?(type===0?'#767c81':'#c3b99b'):(type===0?'#819461':'#9b7353')),dark=material('#3d4935'),ivory=material('#e2d6b6');const legs=[];let height=1.5;
if(era===0){cone(g,material('#54413c'),0,1,0,2.2,3);cone(g,material('#ed8a35'),0,2.3,0,.6,.5);height=3;}
else if(era===1){for(let k=0;k<4;k++)ball(g,body,0,.2+k*.14,0,1-k*.18,.25,1-k*.18);height=.8;}
else if(era===2||era===3){const flying=type===0;for(let k=0;k<7;k++){ball(g,body,0,.5,k*.27-.8,.38,.28,.24);for(const sign of [-1,1])box(g,dark,sign*.43,.35,k*.27-.8,.5,.08,.08);}if(flying){for(const sign of [-1,1])ball(g,ivory,sign*.8,.65,0,.85,.035,.28);}height=1;}
else if(era>=7||era===6&&type===1){if(era===6||type===0){person(g,body,ivory);if(era>=7){const hat=cylinder(g,dark,0,1.96,0,.28,era===9?.3:.1);if(era===9)hat.position.y=2.05;box(g,ivory,0,1,-.18,.26,.6,.06);}for(const x of [-.15,.15])legs.push(box(g,dark,x,.35,0,.19,.7,.23));height=1.95;}else{ball(g,body,0,.8,0,.55,.45,.95);ball(g,body,0,1.2,-.8,.3,.35,.35);for(const x of [-.35,.35])for(const z of [-.6,.6])legs.push(box(g,dark,x,.35,z,.15,.7,.15));if(era===8){for(let k=0;k<7;k++)ball(g,ivory,Math.sin(k)*.35,.95,Math.cos(k)*.55,.3,.3,.3);}if(era===7){for(const x of [-.15,.15])cone(g,dark,x,1.65,-.85,.07,.45);}height=1.6;}}
else{const long=era===4&&type===0,mammoth=era===6,ceratops=era===5&&type===0;const scale=long?1.65:mammoth?1.5:1.2;ball(g,body,0,1.5,0,.8,.8,1.5);if(long){const neck=cylinder(g,body,0,2.6,-1.3,.28,3);neck.rotation.x=-.5;ball(g,body,0,4,-2,.4,.35,.6);height=4.5;}else{ball(g,body,0,2,-1.5,.65,.6,.85);height=2.8;}const tail=cone(g,body,0,1.4,2,.35,2);tail.rotation.x=Math.PI/2;if(!long&&!mammoth&&!ceratops){for(const x of [-.5,.5]){legs.push(box(g,body,x,.6,.5,.4,1.2,.5));box(g,dark,x,.1,.2,.45,.2,.8);box(g,body,x,1.65,-1,.18,.5,.18);}}else for(const x of [-.5,.5])for(const z of [-.8,.8])legs.push(box(g,body,x,.6,z,.35,1.2,.4));if(mammoth){box(g,body,0,1.2,-2.2,.3,1.6,.3);for(const x of [-.4,.4]){const tusk=cone(g,ivory,x,1.3,-2,.13,1.2);tusk.rotation.x=-1;}}if(ceratops){ball(g,body,0,2.3,-1,.95,1,.18);for(const x of [-.4,.4]){const horn=cone(g,ivory,x,2.7,-1.9,.13,.9);horn.rotation.x=-.5;}}g.scale.setScalar(scale);height*=scale;}
let ax=index===0?0:Math.sin(index*2.4)*22,az=index===0?8:-5+Math.cos(index*2.4)*20;if(!valid(ax,az)){ax=3+(index%3)*2;az=-5-index*2;}g.position.set(ax,0,az);if(era>=4&&era<=6&&!(era===6&&type===1)){for(const x of [-.4,.4])ball(g,dark,x,era===4&&type===0?4.1:2.2,era===4&&type===0?-2.2:-1.9,.07,.07,.07);}g.userData={type};scene.add(g);creatures.push({g,type,legs,height,phase:index*1.8,heading:index*2.4,origin:g.position.clone()});}
function build(){
  clearInput();document.getElementById('game-notes').hidden=true;
  if(scene)scene.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.shadow?.map)o.shadow.map.dispose();});renderer.renderLists.dispose();
  for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
  geometries=[];materials=[];materialCache=new Map();creatures=[];obstacles=[];elapsed=0;target=null;
  scene=new THREE.Scene();const era=world.era;
  const skies=['#857168','#a1c4bd','#377e91','#94b4a1','#b0c6b3','#b9c9b6','#becfce','#c5d2bb','#c2cfc4','#adb6ae'];
  const sky=skies[era];scene.background=new THREE.Color(sky);scene.fog=new THREE.Fog(sky,38,115);
  scene.add(new THREE.HemisphereLight('#f6f3dd','#777f6a',1.8));
  const sun=new THREE.DirectionalLight('#fff0cf',2.1);sun.position.set(-30,45,20);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:130});sun.shadow.bias=-.001;scene.add(sun);
  environment=buildEnvironment({THREE,scene,era,box,ball,cone,cylinder,material,mesh,geometries,materials,obstacles});
  for(let i=0;i<(era<2?4:12);i++)creature(i%world.data.life.length,i);
  player.x=0;player.z=20;yaw=0;pitch=0;updateCamera();document.getElementById('game-era').value=era;
  if(!discoveries.has(era))discoveries.set(era,new Set());updateCount();status().textContent='';
}
function updateCount(){document.getElementById('discovery-count').textContent=discoveries.get(world.era).size+' / 3 lugares';}
function updateCamera(){camera.position.set(player.x,1.7,player.z);camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);}
function resize(){if(!renderer)return;const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
function stop(){if(ready)hud.querySelector('.popover').open=false;active=false;clearInput();if(document.pointerLockElement===renderer?.domElement)document.exitPointerLock();host.hidden=true;host.parentElement.classList.remove('playing');enter.textContent='Entrar en primera persona';if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});enter.focus();}
function inspect(){
  if(!target)return;
  let title,text;
  if(target.discovery){const d=target.discovery;title=d.title;text=d.text;discoveries.get(world.era).add(d.id);updateCount();}
  else{world.select(target.type);const a=world.data.life[target.type];title=a.name;text=a.detail;}
  const notes=document.getElementById('game-notes');notes.hidden=false;
  document.getElementById('game-note-name').textContent=title;document.getElementById('game-note-detail').textContent=text;
  if(document.pointerLockElement===renderer.domElement)document.exitPointerLock();
  clearInput();document.getElementById('close-game-note').focus();
}
function valid(x,z){
  if(Math.abs(x)>=50||Math.abs(z)>=50)return false;
  if(world.era>=3&&Math.abs(x-environment.riverX(z))<3.7&&Math.abs(z-22)>1.7)return false;
  return !obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.45);
}
function frame(ms){requestAnimationFrame(frame);const dt=Math.min((ms-previous)/1000,.05);previous=ms;if(!active||document.hidden)return;let forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),side=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));const length=Math.hypot(forward,side)||1;forward/=length;side/=length;yaw+=(Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')))*dt*1.6;pitch=Math.max(-1.15,Math.min(1.15,pitch+(Number(keys.has('ArrowUp'))-Number(keys.has('ArrowDown')))*dt));const speed=keys.has('ShiftLeft')?8:4;const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*dt*speed,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*dt*speed;if(valid(player.x+dx,player.z))player.x+=dx;if(valid(player.x,player.z+dz))player.z+=dz;updateCamera();if(!world.paused){elapsed+=dt*world.speed;environment.animate(elapsed);for(const c of creatures){if(world.era<2)continue;const t=elapsed*.18+c.phase;const resting=Math.sin(elapsed*.35+c.phase)>.72;const nx=c.origin.x+Math.sin(t)*3,nz=c.origin.z+Math.cos(t)*3;if(!resting&&valid(nx,nz)){c.g.position.x=nx;c.g.position.z=nz;}c.g.rotation.y=-t;for(let i=0;i<c.legs.length;i++)c.legs[i].rotation.x=resting?0:Math.sin(elapsed*4+c.phase+(i%2)*Math.PI)*.3;}}
const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),camera);
const hits=ray.intersectObjects(scene.children,true);target=null;
if(hits.length&&hits[0].distance<16){let obj=hits[0].object;while(obj&&obj.userData.type===undefined&&!obj.userData.discovery)obj=obj.parent;if(obj)target=obj.userData.discovery?{discovery:obj.userData.discovery}:creatures.find(c=>c.g===obj);}
document.getElementById('inspect').disabled=!target;
const title=target?(target.discovery?target.discovery.title:world.data.life[target.type].name):'';
if(status().textContent!==title)status().textContent=title;
hud.querySelector('.crosshair').style.color=target?'#d6edb5':'#ffffffaa';renderer.render(scene,camera);
}
async function start(){if(active)return;enter.disabled=true;enter.textContent='Preparando escenario…';try{if(!ready){THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;camera=new THREE.PerspectiveCamera(70,1,.1,130);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Escenario en primera persona. WASD para caminar, flechas para mirar, E para consultar.');host.append(renderer.domElement,hud);bind();ready=true;requestAnimationFrame(frame);}host.hidden=false;host.parentElement.classList.add('playing');active=true;build();resize();renderer.domElement.focus();enter.textContent='Explorando en primera persona';}catch(error){stop();enter.textContent='Reintentar primera persona';let msg=document.getElementById('game-error');if(!msg){msg=document.createElement('p');msg.id='game-error';msg.setAttribute('role','alert');enter.parentElement.after(msg);}msg.textContent='No se pudo iniciar la vista 3D. Revisa tu conexión y que WebGL esté disponible. Puedes seguir explorando el mapa.';console.error(error);}finally{enter.disabled=false;}}
function bind(){const view=renderer.domElement;const eraMenu=document.getElementById('game-era');eraMenu.replaceChildren(...Array.from(document.getElementById('era-select').options,o=>o.cloneNode(true)));eraMenu.onchange=e=>{world.setEra(Number(e.target.value));hud.querySelector('.popover').open=false;view.focus();};new ResizeObserver(resize).observe(host);document.getElementById('leave-game').onclick=stop;document.getElementById('close-game-note').onclick=()=>{document.getElementById('game-notes').hidden=true;view.focus();};document.getElementById('inspect').onclick=inspect;document.getElementById('lock-look').onclick=async()=>{try{await view.requestPointerLock();view.focus();}catch{status().textContent='Puedes arrastrar el escenario o usar las flechas para mirar.';}};document.getElementById('game-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await host.parentElement.requestFullscreen();}catch{status().textContent='La pantalla completa no está disponible; puedes seguir aquí.';}};
view.addEventListener('pointerdown',e=>{if(e.button!==0)return;view.focus();look.id=e.pointerId;look.x=e.clientX;look.y=e.clientY;view.setPointerCapture(e.pointerId);});view.addEventListener('pointermove',e=>{if(document.pointerLockElement!==view&&look.id!==e.pointerId)return;const dx=document.pointerLockElement===view?e.movementX:e.clientX-look.x,dy=document.pointerLockElement===view?e.movementY:e.clientY-look.y;yaw-=dx*.004;pitch=Math.max(-1.15,Math.min(1.15,pitch-dy*.004));look.x=e.clientX;look.y=e.clientY;});view.addEventListener('pointerup',()=>{look.id=null;});view.addEventListener('pointercancel',clearInput);
for(const b of hud.querySelectorAll('[data-move]')){b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.move);b.setPointerCapture(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.move));}
window.addEventListener('keydown',e=>{if(!active||!host.contains(document.activeElement))return;if(e.code==='Escape'){document.getElementById('game-notes').hidden=true;clearInput();}if(e.target!==view)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ShiftLeft','KeyE'].includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==='KeyE'&&!e.repeat)inspect();}});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',clearInput);document.addEventListener('pointerlockchange',clearInput);host.addEventListener('focusout',clearInput);window.addEventListener('history-era',()=>{if(active)build();});}
enter.addEventListener('click',start);
