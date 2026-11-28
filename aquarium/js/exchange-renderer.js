import {exchangeBriefing} from './briefing-scenes.js?v=155';
import {loadPlayerActions} from './player-actions.js?v=155';
import {beginScene,drawRoom,sceneText} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {EXCHANGE_ROOM} from './exchange-core.js';
export async function loadExchangeAssets(character){
 const images={},files=['room-v311.webp','desk-v20.webp','room-v13.png','clerk-v19.webp',`${character.id}-walk.webp`,`${character.id}-idle.webp`];
 await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[file]=im;resolve();};im.onerror=()=>reject(Error('증권거래소 그림을 불러오지 못했어요.'));im.src=new URL('../assets/'+(file.includes(character.id)?'hero-v153':'exchange')+'/'+file,import.meta.url).href;})));await loadPlayerActions(images,character);return images;
}
export class ExchangeRenderer{
 briefing(c,character,t){exchangeBriefing(this,c,character,t);}
 constructor(canvas,images){this.c=canvas.getContext('2d');this.images=images;this.effects=[];}
 draw(game,character,time){const c=this.c;beginScene(c);c.clearRect(0,0,390,844);c.fillStyle='#234c52';c.fillRect(0,0,390,844);drawRoom(c,this.images['room-v311.webp']);c.fillStyle='#eaf3ea';c.fillRect(0,678,390,166);if(!game)return;
  c.save();c.translate(0,170);
  // Reference-based trading post: monitor canopy, visible central support,
  // workstations and a clear service counter are one structural asset.
  const desk=this.images['desk-v20.webp'],deskW=EXCHANGE_ROOM.deskWidth,deskH=deskW*desk.height/desk.width,deskY=EXCHANGE_ROOM.deskY,deskX=EXCHANGE_ROOM.deskX;
  c.drawImage(desk,deskX,deskY,deskW,deskH);
  const clerk=this.images['clerk-v19.webp'],clerkW=42,clerkH=clerkW*clerk.height/clerk.width;
  c.drawImage(clerk,195-clerkW/2,deskY+deskH*.72-clerkH,clerkW,clerkH);
  // Front countertop occludes the employee's lower body, rather than floating
  // the portrait over the furniture.
  const front=.72;c.drawImage(desk,0,desk.height*front,desk.width,desk.height*(1-front),deskX,deskY+deskH*front,deskW,deskH*(1-front));
  if(game.phase==='walk'){c.strokeStyle='#987843';c.setLineDash([4,5]);c.lineWidth=1.5;c.beginPath();c.ellipse(EXCHANGE_ROOM.counterX,EXCHANGE_ROOM.counterY,EXCHANGE_ROOM.counterRadiusX,EXCHANGE_ROOM.counterRadiusY,0,0,7);c.stroke();c.setLineDash([]);c.fillStyle='#35565e';c.font='bold 11px sans-serif';c.textAlign='center';sceneText(c,'안내 창구',EXCHANGE_ROOM.counterX,EXCHANGE_ROOM.labelY);}
  c.fillStyle='#173c4430';c.beginPath();c.ellipse(game.player.x,game.player.y+2,13,5,0,0,7);c.fill();drawExplorer(c,this.images,character,game.player);c.restore();
 }
}
