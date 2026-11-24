// Authored eight-pose stride cycles, not translated versions of one cutout.
// Rows: toward camera, away, right. Left mirrors right around the foot anchor.
// Every pose has its lowest support-foot pixel (alpha >=80) aligned to y244.
// The last row contains three planted idle views; empty cells are transparent.
const atlas=kind=>Object.freeze({file:`history-v130/${kind}.webp`,frameWidth:256,frameHeight:256,columns:8,frames:4,sequences:{down:kind==='dino0'||kind==='dino1'?[0,1,4,2]:kind==='dino3'?[0,6,4,2]:[0,2,4,6],up:[0,2,4,6],right:kind==='dino1'?[0,2,4,5]:[0,2,4,6]},walkRows:Object.freeze({down:0,up:1,right:2}),idle:Object.freeze({down:24,up:25,right:26}),foot:Object.freeze([128,244])});
export const HISTORY_DINOSAUR_ART=Object.freeze(Object.fromEntries(['dino0','dino1','dino2','dino3'].map(kind=>[kind,atlas(kind)])));
