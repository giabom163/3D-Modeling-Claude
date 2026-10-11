import * as T from 'three';
import {SIZE,FX} from './config.js';
import {v} from './geometry.js';
const q=(x,y,z)=>new T.Quaternion().setFromEuler(new T.Euler(x,y,z,'XYZ'));
// 手的位置是角色根坐标，剑局部 +Y 为刃尖方向。
const targets={
  idle:{hand:[-.78,1.68,.22],sword:q(.8,0,2.15),body:q(0,0,0),left:[.73,1.77,.20],double:false,power:FX.energy},
  charge:{hand:[-.12,4.05,.68],sword:q(-.12,0,-.12),body:q(0,0,0),double:true,power:FX.chargeEnergy},
  slash:{hand:[-.86,2.08,.66],sword:q(1.36,.1,-1.06),body:q(.03,-.35,-.05),double:false,left:[.76,2.00,.1],power:3.3},
  thrust:{hand:[-.23,2.03,.85],sword:q(Math.PI/2,0,.06),body:q(.22,.12,0),double:true,power:3.2},
  guard:{hand:[-.51,2.35,.91],sword:q(0,0,-Math.PI/2),body:q(-.04,0,0),double:true,power:2.8},
};
export function createAnimator(character,sword){
  let pose='idle',elapsed=0;const hand=v(...targets.idle.hand),left=v(...targets.idle.left),rotation=targets.idle.sword.clone();let power=FX.energy;
  const leftGrip=v(),desired=v(),desiredLeft=v();
  function setPose(id){if(!targets[id])return;pose=id;elapsed=0;}
  function update(time,dt){
    elapsed+=dt;const t=targets[pose],ease=1-Math.exp(-dt*7.5), breathing=Math.sin(time*2.3)*.018;
    character.torso.quaternion.slerp(t.body,ease);character.head.rotation.y=Math.sin(time*.8)*.025;character.hairBack.rotation.z=Math.sin(time*1.3)*.012;
    desired.set(...t.hand);const targetRot=t.sword.clone();let trail=false;
    if(pose==='idle')desired.y+=breathing;
    if(pose==='charge'){desired.y+=Math.sin(time*4)*.013;}
    if(pose==='slash'){
      // 横挥是可重播的一次完整扫击，结尾保留收势。
      const phase=T.MathUtils.smoothstep(elapsed,.15,1.05),angle=1.25-phase*2.5;
      desired.set(-.30+Math.sin(angle)*.72,2.17,.55+Math.cos(angle)*.45);
      targetRot.copy(q(0,angle,-Math.PI/2));trail=elapsed>.18&&elapsed<1.18;
    }
    if(pose==='thrust'){const phase=T.MathUtils.smoothstep(elapsed,.1,.62);desired.z=.48+phase*.55;desired.y=2.03;}
    hand.lerp(desired,ease);rotation.slerp(targetRot,ease);power=T.MathUtils.lerp(power,t.power,ease);
    character.root.updateMatrixWorld(true);
    const worldHand=character.root.localToWorld(hand.clone()),worldRotation=character.root.getWorldQuaternion(new T.Quaternion()).multiply(rotation);
    character.poseArm('right',worldHand,worldRotation);character.root.updateMatrixWorld(true);
    if(t.double){leftGrip.set(0,-.16,0);sword.root.localToWorld(leftGrip);desiredLeft.copy(character.root.worldToLocal(leftGrip));}
    else desiredLeft.set(...t.left);
    left.lerp(desiredLeft,ease);character.poseArm('left',character.root.localToWorld(left.clone()),worldRotation);
    character.legs[0].rotation.x=T.MathUtils.lerp(character.legs[0].rotation.x,pose==='thrust'?-.18:0,ease);
    character.legs[1].rotation.x=T.MathUtils.lerp(character.legs[1].rotation.x,pose==='thrust'?.22:0,ease);
    character.root.position.y=breathing*.4;character.root.updateMatrixWorld(true);sword.update(time,power,trail);
  }
  return {setPose,update,get pose(){return pose;}};
}


