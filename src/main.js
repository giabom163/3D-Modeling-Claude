import './style.css';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createCharacter} from './character.js';
import {createSword} from './sword.js';
import {createAnimator} from './animation.js';
import {FX,POSES} from './config.js';
function showError(e){document.querySelector('#error').hidden=false;document.querySelector('#error').textContent='场景无法加载：'+(e.message||e)+'。请使用支持 WebGL 2 的浏览器，并通过 npm run dev 启动。';}
window.addEventListener('error',e=>showError(e.error||e.message));
try{
  const viewport=document.querySelector('#viewport');const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,FX.pixelRatio));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;viewport.appendChild(renderer.domElement);
  const scene=new T.Scene();scene.background=new T.Color(0xf5f1ea);scene.environmentIntensity=.45;scene.fog=new T.Fog(0xf5f1ea,15,32);
  const camera=new T.PerspectiveCamera(33,1,.1,60);camera.position.set(4.8,3.8,10.2);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2.3,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=6.5;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.48;controls.enablePan=false;controls.autoRotateSpeed=.65;
  const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
  scene.add(new T.HemisphereLight(0xfff6e9,0xb9b7aa,1.2));
  const key=new T.DirectionalLight(0xffedda,1.7);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=8;key.shadow.camera.bottom=-6;key.shadow.normalBias=.035;key.shadow.bias=-.0002;scene.add(key);
  const fill=new T.DirectionalLight(0xe2f4ff,.8);fill.position.set(5,4,4);scene.add(fill);
  const rim=new T.DirectionalLight(0xffd2a0,1.1);rim.position.set(1,5,-4);scene.add(rim);
  const stage=new T.Mesh(new T.CylinderGeometry(1.55,1.62,.13,64),new T.MeshStandardMaterial({color:0xe8e2d6,roughness:.9}));stage.position.y=-.02;stage.receiveShadow=true;scene.add(stage);
  const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.11}));floor.rotation.x=-Math.PI/2;floor.position.y=-.09;floor.receiveShadow=true;scene.add(floor);
  const ring=new T.Mesh(new T.TorusGeometry(1.37,.006,4,80),new T.MeshStandardMaterial({color:0xc7bcaa,roughness:.9}));ring.rotation.x=Math.PI/2;ring.position.y=.05;scene.add(ring);
  const character=createCharacter();scene.add(character.root);const sword=createSword(character.arms.right.hand);scene.add(sword.trail);const animator=createAnimator(character,sword);
  const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new T.Vector2(1,1),FX.bloom,.5,FX.threshold);composer.addPass(bloom);composer.addPass(new OutputPass());
  const info=document.querySelector('#model-info');let triangles=0;character.root.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});info.textContent=Math.round(triangles/100)/10+'K TRIANGLES · WEBGL';
  function setPose(id){const previous=animator.pose;animator.setPose(id);if(id==="charge"||previous==="charge"){viewTween={start:camera.position.clone(),end:new T.Vector3(...(id==="charge"?[6.8,4.7,17]:[4.8,3.8,10.2])),time:0};}const p=POSES.find(p=>p.id===id);document.querySelector('#pose-description').textContent=p.description;document.querySelector('.edition b').textContent=String(POSES.indexOf(p)+1).padStart(2,'0')+' / 05';document.querySelectorAll('[data-pose]').forEach(b=>{const active=b.dataset.pose===id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
  document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',()=>setPose(b.dataset.pose)));
  window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;const n=Number(e.key);if(n>=1&&n<=5)setPose(POSES[n-1].id);if(e.code==='Space'){e.preventDefault();setPose(animator.pose);}});
  document.querySelector('#auto-rotate').addEventListener('change',e=>controls.autoRotate=e.target.checked);
  let viewTween=null;
  const views={front:[0,3.3,11.2],side:[11.2,3.3,0],back:[0,3.3,-11.2],hero:[4.8,3.8,10.2]};
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{viewTween={start:camera.position.clone(),end:new T.Vector3(...views[b.dataset.view]),time:0};controls.autoRotate=false;document.querySelector('#auto-rotate').checked=false;}));
  controls.addEventListener('start',()=>viewTween=null);
  function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);composer.setSize(w,h);camera.aspect=w/h;camera.setViewOffset(w,h,w>760?-w*.13:0,h*.11,w,h);camera.updateProjectionMatrix();}
  window.addEventListener('resize',resize);resize();const clock=new T.Clock();
  function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime;animator.update(time,dt);if(viewTween){viewTween.time+=dt;const t=Math.min(viewTween.time/.65,1);camera.position.lerpVectors(viewTween.start,viewTween.end,t*t*(3-2*t));if(t===1)viewTween=null;}controls.target.y=T.MathUtils.lerp(controls.target.y,animator.pose==="charge"?3.25:2.3,1-Math.exp(-dt*6));controls.update();composer.render();}
  frame();
  // 仅提供只读状态给用户检查；不向外发送信息。
  window.characterStudy={get pose(){return animator.pose;},get triangles(){return triangles;},get sockets(){return ['head','torso','right-arm','left-arm','right-leg','left-leg','hand-socket'];}};
}catch(e){showError(e);console.error(e);}





