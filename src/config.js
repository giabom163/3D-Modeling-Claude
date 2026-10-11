// 所有尺寸单位一致；角色朝 +Z，角色右侧为 -X（正面观察时在画面左侧）。
export const COLORS = { hair: 0xe87532, hairLight: 0xf8aa62, hairDark: 0xc36232, skin: 0xffe4d2, cloth: 0xfff8ee, lace: 0xffffff, black: 0x27282b, orange: 0xf08a35, gold: 0xdba15b, cyan: 0x51e8ff };
export const SIZE = { height: 3.85, head: [0.83, 0.73, 0.64], headY: 3.02, waistY: 1.68, swordLength: 3.03, bladeLength: 2.43, armRadius: 0.105, radialSegments: 16 };
export const FX = { bloom: 0.38, threshold: 2.2, energy: 2.6, chargeEnergy: 5.0, trailFrames: 20, pixelRatio: 1.6 };
export const POSES = [
  { id:'idle', name:'待机', description:'单手持剑，自然呼吸' },
  { id:'charge', name:'蓄力', description:'双手举剑，汇聚青蓝能量' },
  { id:'slash', name:'横挥', description:'侧向横扫，光刃留下弧形轨迹' },
  { id:'thrust', name:'突刺', description:'压低重心，向前直刺' },
  { id:'guard', name:'格挡', description:'横剑身前，双手稳固防御' },
];

