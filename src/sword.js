import * as T from 'three';
import {COLORS as C,SIZE as S,FX} from './config.js';
import {mesh,ball,curve,v} from './geometry.js';
export function createSword(socket){
  const root=new T.Group();root.name='energy-sword';socket.add(root);
  const metal=new T.MeshStandardMaterial({color:0x414955,metalness:.8,roughness:.47});
  const dark=new T.MeshStandardMaterial({color:0x212a32,metalness:.5,roughness:.75});
  const luminous=new T.MeshStandardMaterial({color:C.cyan,emissive:C.cyan,emissiveIntensity:FX.energy,roughness:.25,toneMapped:false});
  mesh(root,new T.CylinderGeometry(.065,.08,.42,12),dark,[0,.005,0]);
  for(let i=0;i<5;i++)mesh(root,new T.TorusGeometry(.068,.014,6,14),metal,[0,-.15+i*.075,0]).rotation.x=Math.PI/2;
  mesh(root,new T.BoxGeometry(.035,.29,.015),luminous,[0,.01,.077]);
  ball(root,metal,[0,-.24,0],[.115,.075,.105]);
  const guard=mesh(root,new T.BoxGeometry(.48,.10,.19),metal,[0,.29,0]);guard.rotation.z=.04;
  for(const side of [-1,1])mesh(root,new T.BoxGeometry(.13,.035,.03),luminous,[side*.16,.28,.106]);
  ball(root,metal,[0,.32,.10],[.14,.13,.085]);ball(root,luminous,[0,.32,.17],[.076,.073,.025]);
  const shape=new T.Shape();shape.moveTo(-.09,0);shape.lineTo(.09,0);shape.lineTo(.11,S.bladeLength-.35);shape.lineTo(0,S.bladeLength);shape.lineTo(-.11,S.bladeLength-.35);shape.closePath();
  const plasma=new T.MeshPhysicalMaterial({color:0x5eefff,emissive:0x2ac6ee,emissiveIntensity:1.8,metalness:.05,roughness:.13,transparent:true,opacity:.47,depthWrite:false,side:T.DoubleSide,toneMapped:false});
  mesh(root,new T.ExtrudeGeometry(shape,{depth:.05,bevelEnabled:true,bevelSize:.025,bevelThickness:.015,bevelSegments:1,steps:1}),plasma,[0,.40,-.025]);
  const core=mesh(root,new T.CylinderGeometry(.013,.024,S.bladeLength-.1,6),luminous,[0,.40+(S.bladeLength-.1)/2,0]);
  const flows=[];
  for(let i=0;i<4;i++){
    const p=[];for(let j=0;j<16;j++)p.push([Math.sin(j*.83+i*2)*.055,.43+j*(S.bladeLength-.16)/15,.048]);
    const f=curve(root,p,.007,luminous,32);flows.push(f);
  }
  const sparkGeo=new T.BufferGeometry();const sparkPositions=new Float32Array(36*3);sparkGeo.setAttribute('position',new T.BufferAttribute(sparkPositions,3));
  const arc=new T.LineSegments(sparkGeo,new T.LineBasicMaterial({color:0x9bffff,transparent:true,opacity:.7,toneMapped:false,depthWrite:false}));root.add(arc);
  const light=new T.PointLight(C.cyan,.5,3,2);light.position.set(0,1.5,0);root.add(light);
  const tip=new T.Object3D();tip.position.y=.40+S.bladeLength;root.add(tip);
  const trailGeo=new T.BufferGeometry();trailGeo.setAttribute('position',new T.BufferAttribute(new Float32Array((FX.trailFrames-1)*6*3),3));
  const trailMat=new T.MeshBasicMaterial({color:0x53eaff,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  const trail=new T.Mesh(trailGeo,trailMat);trail.frustumCulled=false;const history=[];
  function update(time,power,active){
    luminous.emissiveIntensity=power;plasma.emissiveIntensity=power*.60;light.intensity=power*.17;
    flows.forEach((f,i)=>{f.rotation.y=Math.sin(time*2+i)*.5;f.position.x=Math.sin(time*3+i)*.012;});
    for(let i=0;i<18;i++){const y=.45+((i*.153+time*.48)%S.bladeLength), x=Math.sin(i*13+time*14)*.085; sparkPositions.set([x,y,.06,x+Math.sin(time*23+i)*.035,y+.045,.061],i*6);}sparkGeo.attributes.position.needsUpdate=true;
    if(active){root.updateWorldMatrix(true,true);history.unshift([root.localToWorld(v(0,.65,0)),tip.getWorldPosition(v())]);if(history.length>FX.trailFrames)history.pop();}else if(history.length)history.pop();
    const buffer=trailGeo.attributes.position.array;let cursor=0;
    for(let i=0;i<FX.trailFrames-1;i++){const a=history[i],b=history[i+1];const ps=a&&b?[a[0],a[1],b[0],b[0],a[1],b[1]]:Array(6).fill(v(0,-10,0));for(const p of ps){buffer[cursor++]=p.x;buffer[cursor++]=p.y;buffer[cursor++]=p.z;}}
    trailGeo.attributes.position.needsUpdate=true;trail.visible=history.length>1;
  }
  return {root,tip,trail,update};
}
