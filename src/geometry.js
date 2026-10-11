import * as T from 'three';
export const sphere = new T.SphereGeometry(1, 12, 8);
export const v = (x,y,z) => new T.Vector3(x,y,z);
export function mesh(parent, geometry, material, position=[0,0,0], scale=[1,1,1]) {
  const m = new T.Mesh(geometry,material); m.position.set(...position); m.scale.set(...scale); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
export const ball = (parent,mat,pos,scale) => mesh(parent,sphere,mat,pos,scale);
export function curve(parent,points,radius,mat,segments=20) {
  const path=new T.CatmullRomCurve3(points.map(p=>Array.isArray(p)?v(...p):p));
  return mesh(parent,new T.TubeGeometry(path,segments,radius,6,false),mat);
}
export function tubeBetween(m,a,b,radius=1) { m.position.copy(a).add(b).multiplyScalar(.5); m.scale.set(radius,a.distanceTo(b),radius); m.quaternion.setFromUnitVectors(v(0,1,0),b.clone().sub(a).normalize()); }
export function flower(parent,mat,centerMat,r=.18,petals=9) {
  const g=new T.Group(); parent.add(g);
  for(let i=0;i<petals;i++){const a=i/petals*Math.PI*2; const petal=ball(g,mat,[Math.sin(a)*r*.65,Math.cos(a)*r*.65,.016],[r*.26,r*.58,r*.16]); petal.rotation.z=-a;}
  ball(g,centerMat,[0,0,.055],[r*.32,r*.32,r*.22]); return g;
}
export function bow(parent,mat,r=.23) {
  const g=new T.Group(); parent.add(g);
  for(const side of [-1,1]){const wing=ball(g,mat,[side*r*.58,0,0],[r*.67,r*.43,r*.18]);wing.rotation.z=side*.35; const tail=mesh(g,new T.BoxGeometry(r*.45,r*.95,r*.1),mat,[side*r*.3,-r*.57,0]);tail.rotation.z=side*.23;}
  ball(g,mat,[0,0,.055],[r*.2,r*.24,r*.22]); return g;
}
// 同一个网格构造褶裙：围绕 Y 轴的起伏半径 + 可见外裙/内裙层。
export function pleatedSkirt(topR,bottomR,height,folds=16) {
  const geom=new T.BufferGeometry(), positions=[],uv=[],indices=[]; const count=96,rows=8;
  for(let j=0;j<=rows;j++){const t=j/rows;for(let i=0;i<=count;i++){const a=i/count*Math.PI*2;const r=topR+(bottomR-topR)*t+Math.cos(a*folds)*.025*t;positions.push(Math.sin(a)*r,-height*t,Math.cos(a)*r);uv.push(i/count,t);}}
  for(let j=0;j<rows;j++)for(let i=0;i<count;i++){const a=j*(count+1)+i,b=a+count+1;indices.push(a,b,a+1,b,b+1,a+1);}geom.setAttribute('position',new T.Float32BufferAttribute(positions,3));geom.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geom.setIndex(indices);geom.computeVertexNormals();return geom;
}
