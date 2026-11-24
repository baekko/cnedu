import {alphaMask,masksTouch} from './collision.js';
import {SPACE_HERO_SIZE,SPACE_DEBRIS,spaceHeroFrame,spaceHeroAngle,spaceDebrisAngle,spaceDroneAngle} from './space-sprites.js';

export function spaceMasksCollider(heroMasks,obstacleMasks){
 return (kind,obstacle,player,time)=>{
  // Narrow phase uses visible pixels, including glass-helmet and thin debris edges.
  if(Math.abs(player.x-obstacle.x)>82||Math.abs(player.y-obstacle.y)>82)return false;
  const frame=spaceHeroFrame(player),a=heroMasks[frame.key];
  const key=kind==='debris'?`debris:${obstacle.kind}`:`drone:${obstacle.id%2}`;
  const b=obstacleMasks[key];if(!a||!b)return false;
  return masksTouch(a,player.x,player.y,spaceHeroAngle(time),b,obstacle.x,obstacle.y,kind==='debris'?spaceDebrisAngle(obstacle,time):spaceDroneAngle(obstacle,time));
 };
}

export function createSpaceSpriteCollider(images,character){
 const makeMask=draw=>{const canvas=document.createElement('canvas');canvas.width=96;canvas.height=96;const c=canvas.getContext('2d',{willReadFrequently:true});c.translate(48,48);draw(c);return alphaMask(c.getImageData(0,0,96,96).data,96,96);};
 const heroMasks={},obstacleMasks={},im=images[character.id+'-eva'],size=SPACE_HERO_SIZE;
 for(let row=0;row<3;row++)for(let col=0;col<3;col++)for(const flip of row===2?[false,true]:[false])heroMasks[`${row}:${col}:${flip?1:0}`]=makeMask(c=>{if(flip)c.scale(-1,1);c.drawImage(im,col*256,row*256,256,256,-size/2,-size*.54,size,size);});
 for(const [i,d] of SPACE_DEBRIS.entries())obstacleMasks[`debris:${i}`]=makeMask(c=>{const im=images[d.asset],h=d.width*im.height/im.width;c.drawImage(im,-d.width/2,-h/2,d.width,h);});
 for(let i=0;i<2;i++)obstacleMasks[`drone:${i}`]=makeMask(c=>{const im=images[i?'drone-b':'drone-a'],w=47,h=w*im.height/im.width;c.drawImage(im,-w/2,-h/2,w,h);});
 const collides=spaceMasksCollider(heroMasks,obstacleMasks);
 // Exposed as data for the local edge-contact visual verification fixture.
 collides.masks={hero:heroMasks,obstacles:obstacleMasks};return collides;
}
