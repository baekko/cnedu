import {ROOM_HERO_SIZE} from './hero-scale.js';
// One cohesive full-body frame includes both hands and the tool. The shared
// walk/idle atlas and repair job's timing/interaction geometry remain unchanged.
export function repairPose(dir,age,duration){return {row:dir==='up'?1:dir==='left'||dir==='right'?2:0,col:Math.min(3,Math.max(0,Math.floor(age/duration*4))),mirror:dir==='left'};}
export function drawRepair(c,images,character,p,job){const f=repairPose(p.dir,job.age,job.duration);c.save();c.translate(p.x,p.y);if(f.mirror)c.scale(-1,1);c.drawImage(images[character.id+'-repair.webp'],f.col*256,f.row*256,256,256,-ROOM_HERO_SIZE/2,-53.4,ROOM_HERO_SIZE,ROOM_HERO_SIZE);c.restore();}
