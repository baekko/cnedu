import {beginScene, spriteAnchor} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {HOSPITAL_PET_SIZES} from './hospital-core.js?v298';
import {HOSPITAL_FLOOR, HOSPITAL_VIEW, HOSPITAL_WALL_HEIGHT} from './hospital-layout.js?v297';

const FURNITURE = ['desk','sofa','table','exam','cabinet','sink','treadmill','ramp','markers','bed','tree','plant'];
const VETERINARY_FIXTURES = ['desk','sofa','exam','sink','treadmill','ramp','cabinet','bed'];
const FURNITURE_TILE = 200;
const FURNITURE_COLUMNS = 4;
const FURNITURE_GROUND = 192 / FURNITURE_TILE;
const PET_BEDS = HOSPITAL_FLOOR.fixtures.filter(fixture=>fixture.kind==='bed');
const ORIGINAL_COATS = {tabby:1,tuxedo:2};
const CAT_ACTION_ROWS = {tabby:0,tuxedo:1,korean:2,russian:3};
const WALK = new Set(['walk','run','hop','binky','jump']);
const SLEEP = new Set(['sleep','curl']);
const EXPRESSIONS = new Set(['groom','bark','fight','ear','nose','sniff']);

const asset = path => new URL('../assets/' + path, import.meta.url).href;
function loadImage(path) {
  return new Promise((resolve,reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`동물병원 그림을 불러오지 못했어요. ${path}`));
    image.src = asset(path);
  });
}

let sharedAssets;
async function loadRoomArt() {
  const [animals,furniture,postalCats,catActions,walls,diagonal,vet,manifest] = await Promise.all([
    loadImage('hospital/animals.webp'),
    loadImage('hospital/furniture.webp'),
    loadImage('postal/village-cats.webp?v265'),
    loadImage('hospital/cat-actions.webp').catch(()=>null),
    loadImage('hospital/walls-facing-v296.webp'),
    loadImage('hospital/animals-diagonal-v296.webp'),
    loadImage('hospital/fixtures-perspective-v296.webp'),
    fetch(asset('hospital/animals.json')).then(response => {
      if (!response.ok) throw new Error('동물 그림 목록을 불러오지 못했어요.');
      return response.json();
    }),
  ]);
  return {animals,furniture,postalCats,catActions,walls,diagonal,vet,manifest};
}

export async function loadHospitalAssets(character) {
  sharedAssets ||= loadRoomArt().catch(error => { sharedAssets = null; throw error; });
  const [room,walk,idle] = await Promise.all([
    sharedAssets,
    loadImage(`hero-v153/${character.id}-walk.webp`),
    loadImage(`hero-v153/${character.id}-idle.webp`),
  ]);
  return {...room,[`${character.id}-walk.webp`]:walk,[`${character.id}-idle.webp`]:idle};
}

function rounded(c,x,y,w,h,color,r=4) {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x,y,w,h,r);
  c.fill();
}

function oval(c,x,y,rx,ry,color) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  c.fill();
}

// A single camera-space homography governs the whole connected building. Its
// width grows from 80% to 133% with distance along the viewing axis.
function project(camera,x,y,elevation=0) {
  const dy = y-camera.y;
  const factor = .8 / (1-.0008*dy);
  return {x:195+(x-camera.x-195)*factor,y:16+(dy*.75-elevation)*factor,factor};
}

function cameraWithClearance(camera,player,width) {
  const p=project(camera,player.x,player.y);
  const margin=31;
  const correction=Math.min(width-margin,Math.max(margin,p.x))-p.x;
  return correction?{x:camera.x-correction/p.factor,y:camera.y}:camera;
}

function polygon(c,points,fill) {
  c.beginPath();
  c.moveTo(points[0].x,points[0].y);
  for(const p of points.slice(1)) c.lineTo(p.x,p.y);
  c.closePath();
  c.fillStyle=fill;
  c.fill();
}

function tint(c,room) {
  const {x,y,w,h,floor,id} = room;
  c.save();
  c.beginPath();
  c.rect(x,y,w,h);
  c.clip();
  const mineral = id==='exam' || id==='rest';
  const spread = c.createLinearGradient(x,y,x+w,y+h);
  spread.addColorStop(0,floor);
  spread.addColorStop(.45,mineral?'#e8ded1':'#ecdbc4');
  spread.addColorStop(1,floor);
  c.fillStyle=spread;
  c.fillRect(x,y,w,h);
  c.strokeStyle=mineral?'#776c5b39':'#7258403b';
  c.lineWidth=.64;
  const tileX=mineral?49:36;
  for(let xx=x;xx<x+w;xx+=tileX) {
    c.beginPath();
    c.moveTo(xx,y);
    c.lineTo(xx,y+h);
    if(!mineral) for(let yy=y+((xx-x)/tileX%2)*29;yy<y+h;yy+=58) {
      c.moveTo(xx,yy);c.lineTo(xx+tileX,yy);
    }
    c.stroke();
  }
  if(mineral) for(let yy=y;yy<y+h;yy+=52) {
    c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke();
  }
  c.fillStyle='#67635426';
  c.fillRect(x,y,w,11);
  c.transform(1,0,mineral?-.27:.44,1,(mineral?.27:-.44)*y,0);
  const spacing=mineral?96:72;
  for(let beamX=x-100;beamX<x+w+100;beamX+=spacing) {
    const beam=c.createLinearGradient(beamX-28,y,beamX+28,y);
    beam.addColorStop(0,'#fff9e500');beam.addColorStop(.5,mineral?'#fff9e532':'#fff5d04e');beam.addColorStop(1,'#fff9e500');
    c.fillStyle=beam;c.fillRect(beamX-28,y,56,h);
  }
  c.restore();
}

function floorTexture(c) {
  const {width,height,rooms,doors,fixtures,hall}=HOSPITAL_FLOOR;
  c.fillStyle='#b9b9a7';c.fillRect(0,0,width,height);
  for(const room of rooms) tint(c,room.id==='lobby'||room.id==='rest'?{...room,h:height-room.y}:room);
  const hallLight=c.createLinearGradient(0,hall.y,0,hall.bottom);
  hallLight.addColorStop(0,'#afbbac');hallLight.addColorStop(.37,'#d1d9c8');hallLight.addColorStop(1,'#bac6b5');
  c.fillStyle=hallLight;c.fillRect(hall.x,hall.y,hall.w,hall.h);
  c.strokeStyle='#586d5547';c.lineWidth=.75;
  for(let x=hall.x+10;x<hall.x+hall.w;x+=48) {c.beginPath();c.moveTo(x,hall.y);c.lineTo(x,hall.bottom);c.stroke();}
  for(let y=hall.y+12;y<hall.bottom;y+=42) {c.beginPath();c.moveTo(hall.x,y);c.lineTo(hall.x+hall.w,y);c.stroke();}
  c.fillStyle='#808b6c45';
  c.fillRect(hall.x,hall.y,hall.w,4);c.fillRect(hall.x,hall.bottom-4,hall.w,4);
  for(const bench of fixtures.filter(fixture=>fixture.kind==='sofa')) {
    rounded(c,bench.x-bench.width*.58,bench.y-bench.depth*.97,bench.width*1.16,bench.depth*1.45,'#829c8895',7);
  }
  rounded(c,551,308,82,50,'#abb5a083',7);
  for(const bed of PET_BEDS) {
    rounded(c,bed.x-bed.width*.53,bed.y-bed.depth*.98,bed.width*1.06,bed.depth*1.32,'#bba3ab89',7);
  }
  for(const {x,y,w} of doors) {
    c.fillStyle='#96846e85';c.fillRect(x,y-5,w,10);c.fillStyle='#efddbc9e';c.fillRect(x,y-1,w,2);
  }
  const paint=c.getImageData(0,0,width,height);
  let noise=0x432fe9;
  for(let i=0;i<paint.data.length;i+=4) {
    noise=(Math.imul(noise,1664525)+1013904223)>>>0;
    const shade=((noise>>>24)-127)*.032;
    paint.data[i]+=shade;
    paint.data[i+1]+=shade;
    paint.data[i+2]+=shade;
  }
  c.putImageData(paint,0,0);
}

function paintGround(c,cache,camera) {
  const {width,height}=HOSPITAL_FLOOR;
  for(let sy=Math.max(0,Math.floor(camera.y-28));sy<Math.min(height,Math.ceil(camera.y+HOSPITAL_VIEW.height));sy+=4) {
    const end=Math.min(sy+4,height);
    const a=project(camera,0,sy),b=project(camera,width,end);
    const middle=project(camera,0,(sy+end)/2);
    c.drawImage(cache,0,sy,width,end-sy,middle.x,a.y,width*middle.factor,b.y-a.y+.18);
  }
}

function roomSign(c,label,x,y,size) {
  const width=Math.max(45,label.length*size*.90+20);
  rounded(c,x-width/2,y-3,width,size*1.5,'#e7eaddf0',4);
  c.fillStyle='#373e3a';c.font=`700 ${size}px "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", sans-serif`;
  c.textAlign='center';c.fillText(label,x,y+size*.81);
}

const roomFor = id => HOSPITAL_FLOOR.rooms.find(room=>room.id===id);
const WALL_FACE_TILE_WIDTH=384;
const WALL_FACE_TILE_HEIGHT=128;
const PANEL_SPLITS={lobby:.43,rest:.49};
const DOOR_HEIGHT=84;

// These are sampled from the neutral points of the painted rear panels. The
// same rail elevation follows each panel onto the adjoining plaster walls.
const WALL_FINISH={
  lobby:{plaster:'#cfa176',shadow:'#9d784f',wood:'#555640',rail:'#8d7955',base:'#686b53',railAt:35,cap:'#e6c6a1'},
  exam:{plaster:'#999269',shadow:'#767251',wood:'#935526',rail:'#b18249',base:'#825020',railAt:38,cap:'#d5c098'},
  therapy:{plaster:'#d6a777',shadow:'#aa7e55',wood:'#8c511f',rail:'#b07b45',base:'#7e461b',railAt:40,cap:'#e0c29d'},
  rest:{plaster:'#d5ab7a',shadow:'#a38460',wood:'#82867a',rail:'#a29e8a',base:'#73766b',railAt:44,cap:'#dec4a7'},
  hall:{plaster:'#bdbda0',shadow:'#91917c',wood:'#7a8475',rail:'#a4a491',base:'#6f796f',railAt:37,cap:'#d9d4b9'},
};

function smooth01(value) {
  const x=Math.max(0,Math.min(1,value));
  return x*x*(3-2*x);
}

function boundedOpacity(points,revealActors,camera,depth,baseline=1) {
  const left=Math.min(...points.map(point=>point.x));
  const right=Math.max(...points.map(point=>point.x));
  const top=Math.min(...points.map(point=>point.y));
  const bottom=Math.max(...points.map(point=>point.y));
  let reveal=0;
  for(const actor of revealActors) {
    if(actor.y>depth+6 || actor.y<depth-185) continue;
    const p=project(camera,actor.x,actor.y,(actor.elevation||0)+(actor.jump||0));
    const width=actor.species?Math.max(8,(actor.width||34)*.25):18;
    const height=actor.species?Math.max(13,(actor.width||34)*.48):43;
    const xInset=Math.min(p.x-left,right-p.x)+width;
    const yInset=Math.min(p.y-top,bottom-p.y+height);
    const across=smooth01((xInset+6)/17);
    const above=smooth01((yInset+6)/22);
    const behind=smooth01((depth-actor.y+6)/17);
    const weight=actor.species?.59:.80;
    reveal=Math.max(reveal,weight*across*above*behind);
  }
  return Math.min(baseline,1-reveal);
}

function cutaways(points,actors,camera,depth) {
  const left=Math.min(points[0].x,points[3].x);
  const right=Math.max(points[1].x,points[2].x);
  const top=Math.min(points[2].y,points[3].y);
  const bottom=Math.max(points[0].y,points[1].y);
  const spots=[];
  for(const actor of actors) {
    if(actor.y>depth+6 || actor.y<depth-179) continue;
    const p=project(camera,actor.x,actor.y,(actor.elevation||0)+(actor.jump||0));
    const species=actor.species;
    const width=species?(actor.width||34)*.42:24;
    const height=species?(actor.width||34)*.48:49;
    const y=p.y-height*.47;
    const rx=width+10,ry=height*.57+9;
    if(p.x+rx<left || p.x-rx>right || y+ry<top || y-ry>bottom) continue;
    const depthFade=smooth01((depth-actor.y+6)/24);
    if(depthFade>0) spots.push({x:p.x,y,rx,ry,strength:(species?.77:.90)*depthFade});
  }
  return {left,right,top,bottom,spots};
}

function drawWallSection(c,buffer,points,actors,camera,depth,alpha,draw) {
  const {left,right,top,bottom,spots}=cutaways(points,actors,camera,depth);
  c.save();
  c.globalAlpha=alpha;
  if(!spots.length) {
    draw(c);
  } else {
    const x=Math.max(0,Math.floor(left)-10);
    const y=Math.max(0,Math.floor(top)-10);
    const w=Math.min(HOSPITAL_VIEW.width,Math.ceil(right)+10)-x;
    const h=Math.min(HOSPITAL_VIEW.height,Math.ceil(bottom)+20)-y;
    if(w>0 && h>0) {
      buffer.clearRect(x,y,w,h);
      buffer.save();
      buffer.beginPath();buffer.rect(x,y,w,h);buffer.clip();
      draw(buffer);
      buffer.globalCompositeOperation='destination-out';
      for(const spot of spots) {
        buffer.save();
        buffer.translate(spot.x,spot.y);buffer.scale(spot.rx,spot.ry);
        const reveal=buffer.createRadialGradient(0,0,0,0,0,1);
        reveal.addColorStop(0,`rgba(0 0 0 / ${spot.strength})`);
        reveal.addColorStop(.43,`rgba(0 0 0 / ${spot.strength})`);
        reveal.addColorStop(1,'transparent');
        buffer.fillStyle=reveal;buffer.fillRect(-1,-1,2,2);
        buffer.restore();
      }
      buffer.restore();
      c.drawImage(buffer.canvas,x*2,y*2,w*2,h*2,x,y,w,h);
    }
  }
  c.restore();
}

function pointsFor(camera,start,end,bottom,top) {
  return [project(camera,start.x,start.y,bottom),project(camera,end.x,end.y,bottom),
    project(camera,end.x,end.y,top),project(camera,start.x,start.y,top)];
}

function band(c,camera,start,end,bottom,top,color) {
  polygon(c,pointsFor(camera,start,end,bottom,top),color);
}

function paintPlaster(c,camera,start,end,material,paneled=true) {
  const height=HOSPITAL_WALL_HEIGHT;
  const base=project(camera,start.x,start.y);
  const top=project(camera,end.x,end.y,height);
  const upper=c.createLinearGradient(top.x,top.y,base.x,base.y);
  upper.addColorStop(0,material.plaster);upper.addColorStop(.74,material.plaster);
  upper.addColorStop(1,material.shadow);
  band(c,camera,start,end,material.railAt,height,upper);
  band(c,camera,start,end,0,material.railAt,material.wood);
  if(paneled) {
    const length=Math.hypot(end.x-start.x,end.y-start.y);
    for(let step=13;step<length;step+=13) {
      const n=step/length;
      const point=project(camera,start.x+(end.x-start.x)*n,start.y+(end.y-start.y)*n,5);
      c.strokeStyle='#251a1140';c.lineWidth=Math.max(.48,point.factor*.65);
      c.beginPath();c.moveTo(point.x,point.y);c.lineTo(point.x,point.y-(material.railAt-8)*point.factor);c.stroke();
      c.strokeStyle='#ffe5bd20';c.beginPath();c.moveTo(point.x+.6,point.y);c.lineTo(point.x+.6,point.y-(material.railAt-8)*point.factor);c.stroke();
    }
  }
  band(c,camera,start,end,material.railAt-2,material.railAt+1.5,material.rail);
  band(c,camera,start,end,material.railAt+1.5,material.railAt+2.9,'#fff0c94f');
  band(c,camera,start,end,0,5,material.base);
  band(c,camera,start,end,4.3,5.3,'#ffe7bf49');
  band(c,camera,start,end,height-2.5,height,material.cap);
}

function viewFloorOpacity(camera,player,room,line) {
  if(!room) return 1;
  const inWidth=smooth01((Math.min(player.x-room.x,room.x+room.w-player.x)+20)/48);
  const distance=line-player.y;
  const indoors=smooth01((distance+7)/59);
  const atBottom=project(camera,room.x,line).y;
  const inFrame=1-smooth01((atBottom-515)/75);
  return 1-.13*inWidth*indoors*inFrame;
}

function paintedRear(c,art,camera,wall,room,points) {
  const [base,end,top]=points;
  const sw=WALL_FACE_TILE_WIDTH,sh=WALL_FACE_TILE_HEIGHT;
  const split=PANEL_SPLITS[room.id];
  const first=wall.segment==='left';
  const start=split && !first?split:0;
  const coverage=split?(first?split:1-split):1;
  c.drawImage(art.walls,(room.column+start)*sw,room.row*sh,coverage*sw,sh,
    base.x,top.y,end.x-base.x,base.y-top.y);
  if(!wall.segment && top.y>-2) {
    roomSign(c,room.name,base.x+(end.x-base.x)*.5,Math.max(6,top.y+10*base.factor),10*base.factor);
  }
}

function facingWall(c,buffer,art,camera,wall,player,revealActors) {
  const room=roomFor(wall.room);
  const material=WALL_FINISH[wall.room]||WALL_FINISH.hall;
  const y=wall.lineY;
  const start={x:wall.x,y},end={x:wall.x+wall.w,y};
  const points=pointsFor(camera,start,end,0,HOSPITAL_WALL_HEIGHT);
  const [base,right,top,highLeft]=points;
  if(base.y<-6 || top.y>506 || right.x<-10 || base.x>400) return;
  const baseAlpha=wall.edge==='front'?viewFloorOpacity(camera,player,room,y):1;
  drawWallSection(c,buffer,points,revealActors,camera,y,baseAlpha,wallCanvas=>{
    if(wall.edge==='rear' && art.walls && room) paintedRear(wallCanvas,art,camera,wall,room,points);
    else paintPlaster(wallCanvas,camera,start,end,material);
    const cap=pointsFor(camera,{x:start.x,y:y-3.7},{x:end.x,y:y-3.7},HOSPITAL_WALL_HEIGHT,HOSPITAL_WALL_HEIGHT);
    polygon(wallCanvas,[highLeft,top,cap[1],cap[0]],material.cap);
    const shadow=wallCanvas.createLinearGradient(0,base.y,0,base.y+10*base.factor);
    shadow.addColorStop(0,'#3f34275c');shadow.addColorStop(1,'#3f342700');
    wallCanvas.fillStyle=shadow;wallCanvas.fillRect(base.x,base.y,right.x-base.x,10*base.factor);
  });
}

function entryTrim(c,camera,door,player,revealActors) {
  const material=WALL_FINISH[door.room];
  const start={x:door.x,y:door.y},end={x:door.x+door.w,y:door.y};
  const points=pointsFor(camera,start,end,DOOR_HEIGHT,HOSPITAL_WALL_HEIGHT);
  const [left,right,cap,otherCap]=points;
  const floorLeft=project(camera,start.x,start.y);
  const floorRight=project(camera,end.x,end.y);
  if(floorLeft.y<0 || cap.y>505) return;
  const inside=door.edge==='front'?viewFloorOpacity(camera,player,roomFor(door.room),door.y):1;
  const nearX=project(camera,player.x,player.y).x;
  const through=(1-smooth01((Math.abs(nearX-(left.x+right.x)/2)-11)/32))*(1-smooth01((Math.abs(player.y-door.y)-18)/40));
  c.save();
  c.globalAlpha=boundedOpacity(points,revealActors,camera,door.y,Math.min(inside,1-.64*through));
  const head=c.createLinearGradient(0,cap.y,0,left.y);
  head.addColorStop(0,material.plaster);head.addColorStop(1,material.shadow);
  polygon(c,[left,right,cap,otherCap],head);
  const recessed=pointsFor(camera,{x:start.x,y:door.y-4},{x:end.x,y:door.y-4},DOOR_HEIGHT,DOOR_HEIGHT);
  polygon(c,[left,right,recessed[1],recessed[0]],material.shadow);
  const width=5.2*left.factor;
  c.fillStyle=material.rail;
  c.fillRect(left.x-width*.85,left.y,width,floorLeft.y-left.y);
  c.fillRect(right.x-width*.13,right.y,width,floorRight.y-right.y);
  c.fillStyle=material.cap;
  c.fillRect(left.x-width*.20,left.y,width*.31,floorLeft.y-left.y);
  c.fillRect(right.x-width*.20,right.y,width*.31,floorRight.y-right.y);
  c.fillRect(left.x-width*.85,left.y,right.x-left.x+width*1.70,width*.47);
  c.fillRect(otherCap.x,otherCap.y,right.x-left.x,1.25);
  const room=roomFor(door.room);
  if(room) roomSign(c,room.name,(left.x+right.x)*.5,(cap.y+left.y)*.5-6*left.factor,10*left.factor);
  c.restore();
}

function sidePieces(camera,wall,sides) {
  const line=wall.lineX;
  const opposite=sides.find(other=>other!==wall && other.lineX===line && other.side!==wall.side
    && other.y<wall.y+wall.h && other.y+other.h>wall.y);
  const wanted=(camera.x+HOSPITAL_VIEW.width*.5>=line?'left':'right');
  const cuts=[wall.y,wall.y+wall.h];
  if(opposite) {
    if(opposite.y>wall.y && opposite.y<wall.y+wall.h) cuts.push(opposite.y);
    if(opposite.y+opposite.h<wall.y+wall.h && opposite.y+opposite.h>wall.y) cuts.push(opposite.y+opposite.h);
  }
  cuts.sort((a,b)=>a-b);
  const parts=[];
  for(let i=0;i<cuts.length-1;i++) {
    if(opposite && wanted!==wall.side && cuts[i]>=opposite.y && cuts[i+1]<=opposite.y+opposite.h) continue;
    for(let y=cuts[i];y<cuts[i+1];y+=28) {
      const end=Math.min(y+28,cuts[i+1]);
      const a=project(camera,line,y);
      const b=project(camera,line,end,HOSPITAL_WALL_HEIGHT);
      if(Math.max(a.x,b.x)<-16 || Math.min(a.x,b.x)>406 || project(camera,line,end).y<-5 || Math.min(a.y,b.y)>540) continue;
      parts.push({wall,y,end});
    }
  }
  return parts;
}

function sideWall(c,camera,part,revealActors) {
  const {wall,y,end}=part;
  const material=WALL_FINISH[wall.room]||WALL_FINISH.hall;
  const line=wall.lineX;
  const start={x:line,y},finish={x:line,y:end};
  const points=pointsFor(camera,start,finish,0,HOSPITAL_WALL_HEIGHT);
  const [base,near,high,far]=points;
  const thickness=(wall.side==='right'?1:-1)*3.7;
  const cap=pointsFor(camera,{x:line+thickness,y},{x:line+thickness,y:end},HOSPITAL_WALL_HEIGHT,HOSPITAL_WALL_HEIGHT);
  c.save();
  c.globalAlpha=boundedOpacity(points,revealActors,camera,end);
  const side=wall.side==='right'?-1:1;
  polygon(c,[base,near,{x:near.x+side*8*near.factor,y:near.y+1},{x:base.x+side*8*base.factor,y:base.y+1}],'#54433332');
  paintPlaster(c,camera,start,finish,material,false);
  // Narrow groove seams keep the same board orientation all along a wall.
  for(let mark=Math.ceil(y/15)*15;mark<end;mark+=15) {
    const p=project(camera,line,mark,6);
    c.strokeStyle='#2d211840';c.lineWidth=.7;
    c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y-(material.railAt-9)*p.factor);c.stroke();
  }
  polygon(c,[far,high,cap[1],cap[0]],material.cap);
  c.restore();
}

function furniture(c,art,object,camera,residents) {
  const alternative=art.vet?VETERINARY_FIXTURES.indexOf(object.kind):-1;
  const tile=alternative>=0?alternative:FURNITURE.indexOf(object.kind);
  const image=alternative>=0?art.vet:art.furniture;
  const p=project(camera,object.x,object.y);
  const size=object.width*p.factor;
  oval(c,p.x+2,p.y-1,size*.36,object.depth*p.factor*.13,'#47372a31');
  const height={desk:.71,sofa:.57,table:.60,exam:.56,cabinet:.76,sink:.78,
    treadmill:.83,ramp:.7,markers:.30,bed:.46,tree:.86,plant:.9}[object.kind];
  const pox=p.x-size*.37,poy=p.y-size*height;
  const overlaps=residents.some(actor=>{
    if(animalDepth(actor)>=object.y || object.y-actor.y>object.width*.68) return false;
    const a=project(camera,actor.x,actor.y,actor.elevation||0);
    const actorHeight=actor.species?(actor.width||34)*.56:49;
    return a.x>pox && a.x<p.x+size*.37 && a.y-actorHeight*.65>poy;
  });
  c.save();
  if(overlaps) c.globalAlpha=.82;
  c.drawImage(image,tile%FURNITURE_COLUMNS*FURNITURE_TILE,Math.floor(tile/FURNITURE_COLUMNS)*FURNITURE_TILE,
    FURNITURE_TILE,FURNITURE_TILE,p.x-size/2,p.y-size*FURNITURE_GROUND,size,size);
  c.restore();
}

function originalCatFrame(action,age) {
  if (SLEEP.has(action)) return 7;
  if (action==='stretch') return age<.22?8:age<.45?9:age<.85?10:11;
  if (action==='sit' || action==='perch') return 5;
  if (action==='groom') return Math.floor(age*2.5)%2?5:6;
  if (action==='fight') return Math.floor(age*10)%2?8:10;
  if (WALK.has(action)) return Math.floor(age*(action==='run'?15:9))%4;
  return 4;
}

function atlasColumn(action,age,moving) {
  if (SLEEP.has(action)) return 2;
  if (EXPRESSIONS.has(action)) return Math.floor(age*(action==='fight'?8:3))%2?0:3;
  if (action==='sit' || action==='perch') return 3;
  if (action==='stretch') return age>.18&&age<.95?1:0;
  if (moving || WALK.has(action)) return Math.floor(age*(action==='run'?14:8))%2;
  return 0;
}

function catActionColumn(action,age) {
  if (action==='stretch' && age>.35 && age<1.45) return 0;
  if (action==='jump' && age>.08) return 1;
  if (action==='fight' && Math.floor(age*7)%2===0) return 2;
  if (action==='run' && Math.floor(age*12)%2===0) return 3;
  return null;
}

function bark(c,w,age) {
  if (age%0.4>.16) return;
  c.strokeStyle = '#82574cc2';
  c.lineWidth = 1.1;
  for (const offset of [0,4]) {
    c.beginPath();
    c.arc(w*.39+offset,-w*.41,w*.15,-.8,.32);
    c.stroke();
  }
}

function animal(c,art,pet,camera) {
  const {species,breed,x,y,dir,action,age=0,jump=0,elevation=0} = pet;
  const groundPoint=project(camera,x,y);
  const petPoint=project(camera,x,y,elevation+jump);
  const scale=Math.min(1.12,Math.max(.88,groundPoint.factor));
  const petWidth = (pet.width ?? HOSPITAL_PET_SIZES[breed] ?? 37)*scale;
  const coat = species==='cat'?ORIGINAL_COATS[breed]:undefined;
  const lifted = elevation+jump;
  if (elevation===0 || action==='jump') {
    const spread=Math.max(.52,1-lifted/155);
    oval(c,groundPoint.x,groundPoint.y+1,petWidth*.33*spread,petWidth*.085*spread,'#394d382e');
  } else {
    oval(c,petPoint.x,petPoint.y+.4,petWidth*.28,petWidth*.046,'#42372624');
  }
  c.save();
  spriteAnchor(c,petPoint.x,petPoint.y);

  const {cellWidth,cellHeight,ground,breeds} = art.manifest;
  const h = petWidth*cellHeight/cellWidth;
  const diagonal = art.diagonal && WALK.has(action) && ['fr','fl','br','bl'].includes(pet.facing);
  const left = diagonal ? pet.facing.endsWith('l') : dir==='left';
  if (left) c.scale(-1,1);
  const specialRow = species==='cat'?CAT_ACTION_ROWS[breed]:undefined;
  const specialColumn = specialRow===undefined?null:catActionColumn(action,age);
  if (diagonal) {
    const row=breeds[species][breed];
    const column=(pet.facing[0]==='b'?2:0)+Math.floor(age*(action==='run'?14:8))%2;
    c.drawImage(art.diagonal,column*cellWidth,row*cellHeight,cellWidth,cellHeight,
      -petWidth/2,-h*ground/cellHeight,petWidth,h);
  } else if (art.catActions && specialColumn!==null) {
    c.drawImage(art.catActions,specialColumn*cellWidth,specialRow*cellHeight,cellWidth,cellHeight,
      -petWidth/2,-h*ground/cellHeight,petWidth,h);
  } else if (coat!==undefined) {
    const original = art.postalCats;
    const tile = original.width/4;
    const frame = originalCatFrame(action,age);
    const row = coat*3+Math.floor(frame/4);
    c.drawImage(original,(frame%4)*tile,row*tile,tile,tile,-petWidth/2,-petWidth*.87,petWidth,petWidth);
  } else {
    const row = breeds[species][breed];
    const column = atlasColumn(action,age,pet.moving);
    if (row===undefined) throw new Error(`동물 그림 ${species}/${breed}이 없어요.`);
    c.drawImage(art.animals,column*cellWidth,row*cellHeight,cellWidth,cellHeight,
      -petWidth/2,-h*ground/cellHeight,petWidth,h);
  }
  if (action==='bark') bark(c,petWidth,age);
  c.restore();
}

function visible(x,y,camera,padding) {
  const p=project(camera,x,y);
  return p.x>-padding && p.x<HOSPITAL_VIEW.width+padding && p.y>-padding && p.y<HOSPITAL_VIEW.height+padding;
}

function animalDepth(pet) {
  if (pet.depth!=null) return pet.depth;
  const restingOn = PET_BEDS.find(bed=>Math.abs(pet.x-bed.x)<bed.width*.30
    && pet.y>bed.y-bed.depth*.86 && pet.y<=bed.y);
  return restingOn?restingOn.y+.1:pet.y;
}

export class HospitalRenderer {
  constructor(canvas,images) {
    this.canvas = canvas;
    this.c = canvas.getContext('2d');
    this.images = images;
    this.architecture = document.createElement('canvas');
    this.architecture.width = HOSPITAL_FLOOR.width;
    this.architecture.height = HOSPITAL_FLOOR.height;
    floorTexture(this.architecture.getContext('2d'));
    const wallMask=document.createElement('canvas');
    wallMask.width=HOSPITAL_VIEW.width*2;
    wallMask.height=HOSPITAL_VIEW.height*2;
    this.wallMask=wallMask.getContext('2d');
    this.wallMask.scale(2,2);
  }

  effect() {}

  draw(game,character) {
    const c = this.c;
    const {width,height,top} = HOSPITAL_VIEW;
    beginScene(c);
    c.clearRect(0,0,width,844);
    if (!game) return;
    c.save();
    c.translate(0,top);
    c.beginPath();
    c.rect(0,0,width,height);
    c.clip();
    this.paintWorld(c,game,character);
    c.restore();
  }

  paintWorld(c,game,character) {
    const {player,animals} = game;
    const {width,height} = HOSPITAL_VIEW;
    const camera=cameraWithClearance(game.camera,player,width);
    const pets=game.phase==='explore'?animals:[];
    const residents=[player,...pets.filter(pet=>Math.abs(pet.x-player.x)<185 && Math.abs(pet.y-player.y)<170)];
    c.save();
    c.fillStyle='#b5aa95';c.fillRect(0,0,width,height);
    paintGround(c,this.architecture,camera);
    const layers = [];
    const sides=HOSPITAL_FLOOR.walls.filter(wall=>wall.kind==='side');
    for (const obstacle of HOSPITAL_FLOOR.walls) {
      if(obstacle.kind==='side') {
        for(const part of sidePieces(camera,obstacle,sides)) {
          layers.push({y:part.end,draw:()=>sideWall(c,camera,part,residents)});
        }
      } else if(obstacle.kind==='face') {
        layers.push({y:obstacle.lineY,draw:()=>facingWall(c,this.wallMask,this.images,camera,obstacle,player,residents)});
      }
    }
    for(const door of HOSPITAL_FLOOR.doors) {
      layers.push({y:door.y,draw:()=>entryTrim(c,camera,door,player,residents)});
    }
    for (const object of HOSPITAL_FLOOR.fixtures) if (visible(object.x,object.y,camera,150)) {
      layers.push({y:object.y,draw:()=>furniture(c,this.images,object,camera,residents)});
    }
    for (const pet of pets) if (visible(pet.x,pet.y,camera,95)) {
      layers.push({y:animalDepth(pet),draw:()=>animal(c,this.images,pet,camera)});
    }
    layers.push({y:player.y,draw:()=>{
      const p=project(camera,player.x,player.y);
      oval(c,p.x,p.y,12.5,4.3,'#44362533');
      drawExplorer(c,this.images,character,{...player,x:p.x,y:p.y,hammerAge:99});
    }});
    layers.sort((a,b)=>a.y-b.y).forEach(layer=>layer.draw());
    c.restore();
  }

  drawPreview(c,character,time) {
    const x = 206+Math.sin(time*1.45)*45;
    const game = {
      phase:'explore',camera:{x:18,y:522},
      player:{x,y:780,dir:Math.cos(time*1.45)>0?'right':'left',moving:true,walk:time},
      animals:[
        {species:'cat',breed:'tabby',x:110,y:733,dir:'right',action:'groom',age:time},
        {species:'dog',breed:'golden',x:95+Math.sin(time*1.8)*13,y:801,dir:Math.cos(time*1.8)>0?'right':'left',action:'walk',age:time},
        {species:'rabbit',breed:'lop',x:274,y:747,dir:'left',action:'ear',age:time},
        {species:'cat',breed:'tuxedo',x:345,y:826,elevation:58,depth:827,dir:'left',action:'sleep',age:time},
      ],
    };
    c.save();
    c.beginPath();
    c.roundRect(2,2,176,111,9);
    c.clip();
    c.scale(.47,.47);
    this.paintWorld(c,game,character);
    c.restore();
  }

  briefing(c,character,time) {
    this.drawPreview(c,character,time);
  }
}
