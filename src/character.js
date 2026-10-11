import * as T from 'three';
import { COLORS as C, SIZE as S } from './config.js';
import {mesh,ball,curve,flower,bow,pleatedSkirt,tubeBetween,v} from './geometry.js';

function fabricTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#ddd';ctx.fillRect(0,0,128,128);ctx.strokeStyle='#fff';ctx.lineWidth=.5;for(let i=0;i<128;i+=4){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(4,4);return t;}
export function createCharacter(){
  const root=new T.Group();root.name='character';
  const torso=new T.Group();torso.name='torso';torso.position.y=S.waistY;root.add(torso);
  const rough=fabricTexture();
  const mat={skin:new T.MeshStandardMaterial({color:C.skin,roughness:.6}),hair:new T.MeshStandardMaterial({color:C.hair,roughness:.38,metalness:.025}),hairLight:new T.MeshStandardMaterial({color:C.hairLight,roughness:.4}),hairDark:new T.MeshStandardMaterial({color:C.hairDark,roughness:.48}),cloth:new T.MeshStandardMaterial({color:C.cloth,roughness:.85,bumpMap:rough,bumpScale:.014,side:T.DoubleSide}),lace:new T.MeshStandardMaterial({color:C.lace,roughness:.9,transparent:true,opacity:.88,side:T.DoubleSide}),black:new T.MeshStandardMaterial({color:C.black,roughness:.76}),gold:new T.MeshStandardMaterial({color:C.gold,roughness:.5,metalness:.4}),orange:new T.MeshStandardMaterial({color:C.orange,roughness:.5})};
  const head=new T.Group();head.name='head';head.position.y=S.headY-S.waistY;torso.add(head);
  ball(head,mat.skin,[0,0,0],S.head);
  for(const side of [-1,1])ball(head,mat.skin,[side*.77,-.15,.015],[.14,.19,.13]);
  // 眼白、棕色虹膜、琥珀色下缘和两点高光，压扁几何保持二维萌系面部。
  const white=new T.MeshStandardMaterial({color:0xffffff,roughness:.42});
  const iris=new T.MeshStandardMaterial({color:0x693729,roughness:.32});
  const amber=new T.MeshStandardMaterial({color:0xe29a43,roughness:.4});
  const ink=new T.MeshStandardMaterial({color:0x38231f,roughness:.7});
  const sparkle=new T.MeshBasicMaterial({color:0xffffff});
  const cheek=new T.MeshStandardMaterial({color:0xf2ab9c,transparent:true,opacity:.45,roughness:.9});
  for(const side of [-1,1]){
    const x=side*.32;
    ball(head,white,[x,-.045,.575],[.244,.284,.06]);
    ball(head,iris,[x,-.047,.630],[.184,.231,.025]);
    ball(head,amber,[x,-.149,.651],[.146,.10,.012]);
    ball(head,ink,[x,-.012,.654],[.101,.164,.014]);
    ball(head,sparkle,[x-.065,.061,.675],[.066,.071,.009]);
    ball(head,sparkle,[x+.069,-.105,.674],[.028,.031,.008]);
    curve(head,[[x-.24,.15,.59],[x-.12,.225,.62],[x+.03,.237,.64],[x+.21,.16,.60]],.019,ink,14);
    curve(head,[[x+side*.18,.16,.60],[x+side*.28,.23,.58],[x+side*.27,.14,.59]],.013,ink,6);
    ball(head,cheek,[side*.55,-.31,.52],[.11,.047,.01]);
  }
  ball(head,mat.skin,[0,-.20,.652],[.04,.04,.022]);
  curve(head,[[-.047,-.355,.596],[0,-.37,.602],[.047,-.353,.596]],.012,ink,10);
  // 后脑半球：前侧裁切，额头与眼睛保持可见。
  mesh(head,new T.SphereGeometry(1,28,18,Math.PI/2,Math.PI*2,0,Math.PI*.53),mat.hair,[0,.02,-.02],[.88,.77,.70]);
  ball(head,mat.hair,[0,.0,-.28],[.98,.77,.57]);
  const hairBack=new T.Group();hairBack.name='back-hair';head.add(hairBack);
  // 后背宽发片延伸到腰以下，低模曲线产生大波浪，不用一束束细圆管代替轮廓。
  for(let i=0;i<9;i++){
    const x=(i-4)*.175;const a=Math.abs(x);const pts=[[x*.8,.28,-.42],[x*1.12,-.15,-.61],[x*1.15,-.73,-.56],[x+Math.sin(i)*.11,-1.35,-.47],[x+Math.sin(i+1)*.14,-1.80,-.30],[x+Math.sin(i+2)*.16,-1.98,-.22]];
    const strand=curve(hairBack,pts,.16,mat.hair,24);strand.scale.z=.9;
    curve(hairBack,pts.map((p,j)=>[p[0]-.025,p[1],p[2]-.145+(j>3?.025:0)]),.008,mat.hairLight,24);
  }
  // 两边卷发垂到腰，末端往外再内收。
  for(const side of [-1,1])for(let i=0;i<3;i++){
    const x=side*(.72+i*.075),z=.02-i*.18;
    curve(head,[[side*.58,.35,z-.10],[side*.89,-.2,z+.05],[side*.87,-.68,z+.12],[side*(.91+i*.05),-1.11,z+.17],[side*(.95+i*.04),-1.46,z+.22],[side*.82,-1.78,z+.26],[side*.72,-1.73,z+.22]],.12,mat.hair,26);
  }
  // 齐刘海：自发顶向额头的扁宽尖瓣，中央两瓣更长。
  for(let i=0;i<7;i++){
    const x=(i-3)*.215,endY=i===3?-.03:(i===2||i===4?.035:.14);
    const path=new T.CatmullRomCurve3([v(x*.6,.67,.33),v(x*.95,.43,.58),v(x,.22,.66),v(x*.93,endY,.655)]);
    const g=new T.TubeGeometry(path,14,.12,7,false);const pos=g.attributes.position;
    for(let k=0;k<pos.count;k++){const t=Math.floor(k/8)/14;const p=v().fromBufferAttribute(pos,k), center=path.getPointAt(Math.min(t,1));const shrink=t>.6?Math.max(.04,(1-t)/.4):1;p.x=center.x+(p.x-center.x)*shrink;p.y=center.y+(p.y-center.y)*shrink;p.z=center.z+(p.z-center.z)*.42*shrink;pos.setXYZ(k,p.x,p.y,p.z);}g.computeVertexNormals();mesh(head,g,mat.hair);
  }
  // 太阳花位于参考正面图的右上角；背面同一饰件也可见。
  const adorn=new T.Group();adorn.position.set(.70,.39,.36);adorn.rotation.set(.08,.45,-.23);head.add(adorn);
  const blackBow=bow(adorn,mat.black,.32);blackBow.position.set(.10,-.23,-.10);
  const sun=flower(adorn,mat.orange,mat.gold,.27,10);sun.position.set(0,.015,.065);
  for(let i=0;i<2;i++){
    curve(adorn,[[.10+i*.14,-.20,-.09],[.14+i*.14,-.45,-.11],[.09+i*.14,-.64,-.10]],.01,mat.gold,10);
    const tassel=mesh(adorn,new T.ConeGeometry(.065,.20,10),mat.cloth,[.09+i*.14,-.70,-.10]);tassel.rotation.z=.1;
    for(let j=0;j<5;j++)curve(adorn,[[.055+i*.14+j*.013,-.64,-.04],[.05+i*.14+j*.016,-.80,-.025]],.006,mat.lace,3);
  }
  // 缎带绕到后脑侧缘，背面也能看到蝴蝶结与白流苏。
  const rearAdorn=new T.Group();rearAdorn.position.set(.78,.22,-.72);rearAdorn.rotation.y=Math.PI-.35;head.add(rearAdorn);
  bow(rearAdorn,mat.black,.27);
  for(let i=0;i<2;i++){
    curve(rearAdorn,[[i*.13,-.13,.025],[i*.13,-.36,.035],[i*.13,-.52,.06]],.009,mat.gold,10);
    mesh(rearAdorn,new T.ConeGeometry(.06,.19,8),mat.cloth,[i*.13,-.59,.06]);
  }
  // 衣领、灯笼袖、黑色腰封与三层褶裙。
  ball(torso,mat.cloth,[0,.43,0],[.43,.47,.29]);
  mesh(torso,new T.CylinderGeometry(.365,.39,.36,24),mat.black,[0,.08,0],[1,1,.81]);
  for(const side of [-1,1]){
    const collar=ball(torso,mat.lace,[side*.19,.73,.23],[.22,.10,.08]);collar.rotation.z=side*.18;
    curve(torso,[[side*.02,.79,.27],[side*.23,.71,.28],[side*.36,.75,.2]],.017,mat.gold,12);
  }
  const chest=flower(torso,mat.orange,mat.gold,.085);chest.position.set(0,.70,.32);
  bow(torso,mat.black,.12).position.set(0,.66,.29);
  mesh(torso,pleatedSkirt(.38,.75,.78),mat.cloth,[0,-.06,0],[1,1,.9]);
  mesh(torso,pleatedSkirt(.45,.80,.74,20),mat.lace,[0,-.18,0],[1,1,.91]);
  mesh(torso,pleatedSkirt(.37,.72,.61),mat.black,[0,-.035,0],[1,1,.90]);
  // 分开前面的黑色裙片：白色中央三角围裙覆盖前面，保留两侧黑裙与花纹。
  const apron=new T.Shape();apron.moveTo(-.20,0);apron.lineTo(.20,0);apron.lineTo(.48,-.70);apron.quadraticCurveTo(0,-.80,-.48,-.70);apron.closePath();
  mesh(torso,new T.ExtrudeGeometry(apron,{depth:.018,bevelEnabled:false}),mat.cloth,[0,-.10,.44]).rotation.x=-.47;
  const waistBow=bow(torso,mat.orange,.19);waistBow.position.set(.12,-.10,.415);
  flower(torso,mat.orange,mat.gold,.092).position.set(.12,-.075,.48);
  for(let i=0;i<32;i++){
    const a=i/32*Math.PI*2,x=Math.sin(a)*.80,z=Math.cos(a)*.72;
    ball(torso,mat.cloth,[x,-.93,z],[.074,.055,.061]);
    const laceRing=mesh(torso,new T.TorusGeometry(.045,.009,4,8),mat.lace,[x,-.92,z+.025]);laceRing.rotation.y=a;
  }
  for(let i=0;i<12;i++){
    const a=(i/12)*Math.PI*2;const f=flower(torso,mat.orange,mat.gold,.054,6);f.position.set(Math.sin(a)*.64,-.52,Math.cos(a)*.58);f.rotation.y=a;
  }
  for(const side of [-1,1]){flower(torso,mat.orange,mat.gold,.062,6).position.set(side*.18,-.64,.79);}
  const legs=[];
  for(const side of [-1,1]){
    const leg=new T.Group();leg.name=side===-1?'right-leg':'left-leg';leg.position.set(side*.26,.60,.025);root.add(leg);legs.push(leg);
    mesh(leg,new T.CapsuleGeometry(.115,.20,4,12),mat.skin,[0,-.16,0]);
    ball(leg,mat.cloth,[0,-.41,.055],[.175,.13,.25]);
    const sole=ball(leg,mat.gold,[0,-.495,.055],[.174,.026,.238]);sole.material=mat.cloth;
    flower(leg,mat.orange,mat.gold,.062,7).position.set(0,-.36,.273);
    curve(leg,[[-.09,-.35,.19],[0,-.32,.23],[.09,-.35,.19]],.012,mat.orange,8);
  }
  const arms={};
  for(const side of [-1,1]){
    const shoulder=new T.Group();shoulder.name=side===-1?'right-arm':'left-arm';shoulder.position.set(side*.47,.63,.015);torso.add(shoulder);
    ball(shoulder,mat.cloth,[0,0,0],[.24,.24,.235]);
    const upper=mesh(torso,new T.CylinderGeometry(1,1,1,12),mat.cloth);
    const lower=mesh(torso,new T.CylinderGeometry(1,1,1,12),mat.cloth);
    const elbow=new T.Group();elbow.name=side===-1?'right-elbow':'left-elbow';torso.add(elbow);
    const hand=new T.Group();hand.name=side===-1?'hand-socket':'left-hand';torso.add(hand);
    ball(hand,mat.skin,[0,0,0],[.13,.145,.13]);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ball(hand,mat.cloth,[Math.cos(a)*.12,.115,Math.sin(a)*.12],[.073,.067,.075]);}
    arms[side===-1?'right':'left']={shoulder,upper,lower,elbow,hand,side};
  }
  function poseArm(which,worldTarget,handQuat){
    const a=arms[which],target=torso.worldToLocal(worldTarget.clone()),start=a.shoulder.position.clone(),delta=target.clone().sub(start),d=delta.length();
    // 简单两段 IK；抬举时按距离略伸展，保留 Q 版表现性，不是人体骨骼仿真。
    const l=Math.max(.42,d*.515),axis=delta.clone().normalize();const bend=v(a.side*.55,-.05,-1);bend.addScaledVector(axis,-bend.dot(axis)).normalize();
    const mid=start.clone().addScaledVector(axis,d*.5).addScaledVector(bend,Math.sqrt(Math.max(.002,l*l-d*d*.25)));
    tubeBetween(a.upper,start,mid,.135);tubeBetween(a.lower,mid,target,.105);a.elbow.position.copy(mid);a.hand.position.copy(target);
    a.hand.quaternion.copy(torso.getWorldQuaternion(new T.Quaternion()).invert().multiply(handQuat));
  }
  return {root,torso,head,arms,legs,hairBack,poseArm,materials:mat};
}






