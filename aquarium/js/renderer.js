import {drawClueCard} from './clue-card-art.js';
import {beginScene,spriteAnchor,sceneText} from './layout.js';
import { GAME, CHARACTERS, SHARKS } from './config.js';
import { alphaMask, masksTouch } from './collision.js';
import {LIGHT_FX_SECONDS,drawLightWater,drawLightSurface} from './aquarium-light.js';

export async function loadAssets() {
  const files = [...CHARACTERS.map(c => c.asset), ...Object.values(SHARKS).map(s => s.asset), 'jelly.png', 'aquarium-v21/reef-left.webp', 'aquarium-v21/reef-right.webp', 'aquarium-v21/shells.webp', 'aquarium-v8/fish.webp', 'aquarium-v89/water.webp', 'aquarium-v8/submarine.webp', 'aquarium-v8/submarine-window-mask.webp'];
  const images = {};
  await Promise.all(files.map(file => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { images[file] = img; resolve(); };
    img.onerror = () => reject(new Error(`그림을 불러오지 못했어요: ${file}`));
    img.src = new URL(`../assets/${file}`, import.meta.url).href;
  })));
  return images;
}
function ellipse(ctx, x, y, rx, ry, fill, stroke, width = 1.5) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
function line(ctx, points, color, width = 1.5) {
  ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
}
export function submarineCabin(images,character){
  // Resolve a saved/replayed identity to its actual asset before consulting the cache.
  if(character)character=CHARACTERS.find(c=>c.id===character.id)||CHARACTERS[0];
  const id=character?.id||'empty';images.cabins ||= new Map();if(images.cabins.has(id))return images.cabins.get(id);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');
  const glass=c.createLinearGradient(184,151,402,347);glass.addColorStop(0,'#d2f2e9');glass.addColorStop(1,'#78bac5');c.fillStyle=glass;c.fillRect(0,0,512,512);
  if(character){const img=images[character.asset],crop=img.height*.7,h=182,w=img.width/crop*h;c.drawImage(img,0,0,img.width,crop,292.5-w/2,158,w,h);}
  c.globalCompositeOperation='destination-in';c.drawImage(images['aquarium-v8/submarine-window-mask.webp'],0,0,512,512);c.globalCompositeOperation='source-over';
  images.cabins.set(id,canvas);return canvas;
}
export function drawSubmarine(ctx, images, character, x, y, scale = 1, health = 3, time = 0) {
  ctx.save();spriteAnchor(ctx,x,y);ctx.scale(scale,scale);ctx.rotate(Math.sin(time*1.6)*.025);
  // A detailed body is separate from the chosen pilot, so all four friends remain visible.
  ctx.drawImage(submarineCabin(images,character),-36,-34,72,68);
  const body=images['aquarium-v8/submarine.webp'];
  // Isolate the existing propeller strip and rotate it about its horizontal shaft.
  // The changing projected blade height is rotation in perspective, not hull scaling.
  ctx.drawImage(body,68,0,444,512,-36+68/512*72,-34,444/512*72,68);
  ctx.save();ctx.translate(-36+44/512*72,-34+275/512*68);
  const turn=Math.cos(time*24),bladeScale=.12+.88*Math.abs(turn);
  ctx.scale(1,bladeScale);ctx.drawImage(body,0,0,68,512,-44/512*72,-275/512*68,68/512*72,68);ctx.restore();
  ellipse(ctx,-36+42/512*72,-34+275/512*68,2.4,3.1,'#c28a33','#754c20',.6);
  ctx.save();ctx.translate(5.13,-1);
  if(health<3){const crack=[[-5,-11],[-2,-6],[-5,-2],[0,3]];line(ctx,crack,'#205a73',1.45);line(ctx,crack,'#edffff',.65);line(ctx,[[-2,-6],[3,-7]],'#e6ffff',.8);}
  if(health<2){const crack=[[7,-10],[5,-4],[10,0],[4,8]];line(ctx,crack,'#1d516b',1.65);line(ctx,crack,'#edffff',.75);line(ctx,[[10,0],[12,4]],'#e6ffff',1);line(ctx,[[-10,3],[-6,5],[-7,10]],'#e6ffff',1.2);}
  ctx.restore();ctx.restore();
}

const TAIL_FRAMES=16;
function tailAngle(enemy,time){return Math.sin(time*(enemy.type==='baby'?11:6)+enemy.phase)*.085;}
function sharkRotation(enemy,time){return enemy.type==='sturgeon'?Math.cos(enemy.age*2.2+enemy.phase)*-.09:Math.sin(time*2+enemy.phase)*.018;}
function drawSharkBody(c,images,type,angle){
  const cfg=SHARKS[type],img=images[cfg.asset],w=cfg.width,h=cfg.height;
  const cut=Math.round(img.width*.77),overlap=Math.round(img.width*.04);
  c.save();c.translate(w*.27,0);c.rotate(angle);
  c.drawImage(img,cut,0,img.width-cut,img.height,0,-h/2,w*.23,h);c.restore();
  c.drawImage(img,0,0,cut+overlap,img.height,-w/2,-h/2,w*.81,h);
}
export function createSpriteCollider(images,character){
  function makeMask(width,height,draw){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const c=canvas.getContext('2d',{willReadFrequently:true});c.translate(width/2,height/2);draw(c);
    return alphaMask(c.getImageData(0,0,width,height).data,width,height);
  }
  const sub=makeMask(108,96,c=>drawSubmarine(c,images,character,0,0,GAME.submarineScale,3,0));
  const sharkMasks={};
  for(const [type,cfg] of Object.entries(SHARKS))sharkMasks[type]=Array.from({length:TAIL_FRAMES},(_,i)=>
    makeMask(Math.ceil(cfg.width)+12,Math.ceil(cfg.height)+16,c=>drawSharkBody(c,images,type,-.085+i/(TAIL_FRAMES-1)*.17)));
  return (enemy,player,time,ratio=1)=>{
    const cfg=SHARKS[enemy.type];
    if(Math.abs(player.x-enemy.x)>cfg.width/2+54 || Math.abs(player.y-enemy.y)*ratio>cfg.height/2+48)return false;
    const index=Math.round((tailAngle(enemy,time)+.085)/.17*(TAIL_FRAMES-1));
    return masksTouch(sub,player.x,player.y*ratio,Math.sin(time*1.6)*.025,sharkMasks[enemy.type][index],enemy.x,enemy.y*ratio,sharkRotation(enemy,time));
  };
}

export class Renderer {
  constructor(canvas, images) {
    this.ctx = canvas.getContext('2d'); this.images = images;
    this.ctx.setTransform(2,0,0,2,0,0);
    this.effects=[];
    this.backdrop=document.createElement('canvas');this.backdrop.width=780;this.backdrop.height=1688;
    const bg=this.backdrop.getContext('2d');bg.scale(2,2);this.background(bg);
  }
  background(c) {
    const water=c.createLinearGradient(0,0,0,700);water.addColorStop(0,'#176981');water.addColorStop(.2,'#238eab');water.addColorStop(.44,'#3ab3c5');water.addColorStop(.76,'#248ca6');water.addColorStop(1,'#1b6c87');c.fillStyle=water;c.fillRect(0,0,390,844);
    const im=this.images['aquarium-v89/water.webp'],sourceWidth=im.height*390/536;
    c.drawImage(im,(im.width-sourceWidth)/2,0,sourceWidth,im.height,0,142,390,536);

  }
  seaLife(c,time) {
    // 배경 생물은 오직 그림으로만 존재하며 게임의 적/아이템 목록에 넣지 않습니다.
    const left=this.images['aquarium-v21/reef-left.webp'],right=this.images['aquarium-v21/reef-right.webp'],shells=this.images['aquarium-v21/shells.webp'];
    for(const [im,x,w,phase] of [[left,46,114,0],[right,349,116,2],[shells,197,86,0]]){
      c.save();spriteAnchor(c,x,676);if(im!==shells)c.transform(1,0,Math.sin(time*.8+phase)*.013,1,0,0);
      const h=w*im.height/im.width;c.drawImage(im,-w/2,-h,w,h);c.restore();
    }
    // 작은 물고기 떼는 서로 다른 높이와 속도로 수조를 지나갑니다.
    for(let school=0;school<3;school++){
      const baseX=470-((time*(school===1?27:20)+school*217)%610);
      const baseY=[248,456,575][school]+Math.sin(time*.6+school)*12;
      for(let i=0;i<6;i++){
        const x=baseX+(i%3)*24,y=baseY+Math.floor(i/3)*19+(i%3)*5+Math.sin(time*2+i)*2;
        c.save();spriteAnchor(c,x,y);
        c.globalAlpha=.82;c.rotate(Math.sin(time*2+i)*.035);
        const w=[27,25,28][school],h=w*.72;c.drawImage(this.images['aquarium-v8/fish.webp'],0,school*256,256,256,-w/2,-h/2,w,h);c.restore();
      }
    }
  }
  effect(type,x,y) { this.effects.push({type,x,y,age:0}); }
  draw(game, character, time, dt, active) {
    character=CHARACTERS.find(p=>p.id===character?.id)||CHARACTERS[0];
    if(active)for(const fx of this.effects)fx.age+=dt;
    const c=this.ctx;beginScene(c);c.clearRect(0,0,390,844);c.drawImage(this.backdrop,0,0,390,844);
    c.save();c.beginPath();c.rect(0,142,390,535);c.clip();
    for(let i=0;i<18;i++){
      const x=18+(i*73.2)%364+Math.sin(time*.3+i)*3;
      const y=150+((i*77-time*(4+i%3))%520+520)%520;
      ellipse(c,x,y,1.4+i%3*.6,1.4+i%3*.6,i%3?'#c3f5f352':null,'#d9ffff69',.6);
    }
    this.seaLife(c,time);
    if(game){
      for(const fx of this.effects)if(fx.type==='flash')drawLightWater(c,fx,game.player,game.elapsed,GAME.submarineScale);
      for(const warning of game.warnings) this.warning(warning,time);
      for(const enemy of game.enemies) this.shark(enemy,game.elapsed);
      for(const pickup of game.pickups) this.pickup(pickup,time);
      for(let i=0;i<3;i++){
        const drift=((time*24+i*14)%45);
        ellipse(c,game.player.x-35-drift,game.player.y+10-drift*.1,1.5-i*.3,1.5-i*.3,null,'#d5fafa77',.8);
      }
      c.save();
      // Keep the pilot fully visible; the surrounding ring signals invulnerability.
      drawSubmarine(c,this.images,character,game.player.x,game.player.y,GAME.submarineScale,game.health,game.elapsed);
      c.restore();
      if(game.invincible>0){ellipse(c,game.player.x,game.player.y,45,44,null,'#fff7bf88',1);}
    }else{
      drawSubmarine(c,this.images,character,100,380+Math.sin(time)*3,1,3,time);
    }
    for(const fx of this.effects){
      const duration=fx.type==='flash'?LIGHT_FX_SECONDS:1;
      const p=fx.age/duration;
      if(p>1)continue;
      c.save();c.globalAlpha=1-p;
      if(fx.type==='flash'){
        c.globalAlpha=1;if(game)drawLightSurface(c,fx,game.player,game.elapsed,GAME.submarineScale);
      }else{
        const colors=fx.type==='hit'?'#fff1d5':fx.type==='heal'?'#d8ffe5':'#fff3c2';
        for(let i=0;i<7;i++){const a=i/7*Math.PI*2;ellipse(c,fx.x+Math.cos(a)*p*40,fx.y+Math.sin(a)*p*40-p*12,2*(1-p)+.5,2*(1-p)+.5,colors);}
        c.fillStyle=colors;c.textAlign='center';c.font='bold 13px sans-serif';sceneText(c,fx.type==='heal'?'+1':fx.type==='card'?'+1 카드':'',fx.x,fx.y-25-p*20);
      }
      c.restore();
    }
    this.effects=this.effects.filter(e=>e.age<(e.type==='flash'?LIGHT_FX_SECONDS:1));
    c.restore();
  }
  shark(enemy,time){
    const c=this.ctx;c.save();spriteAnchor(c,enemy.x,enemy.y);
    if(enemy.flee)c.scale(-1,1);
    c.rotate(sharkRotation(enemy,time));
    drawSharkBody(c,this.images,enemy.type,tailAngle(enemy,time));c.restore();
  }
  pickup(item,time){
    const c=this.ctx;c.save();spriteAnchor(c,item.x,item.y+Math.sin(time*2+item.phase)*2);
    if(item.type==='heal'){
      const img=this.images['jelly.png'];const h=33+Math.sin(time*4)*1.2;c.drawImage(img,-13,-h/2,26,h);
    }else{
      c.rotate(Math.sin(time*1.5+item.phase)*.07);
      drawClueCard(c,0,0,20,28);
    }
    c.restore();
  }
  warning(warning,time){
    const c=this.ctx;c.save();c.globalAlpha=.6+Math.sin(time*18)*.3;
    c.fillStyle='#fff0a7';c.beginPath();c.roundRect(355,warning.y-13,26,26,9);c.fill();
    c.fillStyle='#bb7043';c.textAlign='center';c.font='900 18px sans-serif';c.fillText('!',368,warning.y+7);
    c.setLineDash([3,6]);line(c,[[313,warning.y],[350,warning.y]],'#fff0a766',1.5);c.restore();
  }
}
