import {beginScene, spriteAnchor} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {HOSPITAL_PET_SIZES} from './hospital-core.js?v296';
import {HOSPITAL_FLOOR, HOSPITAL_VIEW} from './hospital-layout.js?v296';

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
  const {width,height,rooms,doors}=HOSPITAL_FLOOR;
  c.fillStyle='#b9b9a7';c.fillRect(0,0,width,height);
  c.fillStyle='#c6cec3';c.fillRect(24,132,width-47,height-132);
  c.strokeStyle='#54676037';c.lineWidth=1;
  for(let x=27;x<width-22;x+=61) {c.beginPath();c.moveTo(x,134);c.lineTo(x,height);c.stroke();}
  for(let y=135;y<=height;y+=52) {c.beginPath();c.moveTo(24,y);c.lineTo(width-23,y);c.stroke();}
  for(const room of rooms) tint(c,room.id==='lobby'||room.id==='rest'?{...room,h:height-room.y}:room);
  rounded(c,33,666,105,49,'#758f829c',7);
  rounded(c,46,842,107,47,'#829c8897',7);
  rounded(c,551,308,82,50,'#abb5a083',7);
  rounded(c,648,823,73,32,'#bba3ab99',7);
  rounded(c,501,708,69,34,'#bba3ab99',7);
  rounded(c,521,878,71,34,'#bba3ab99',7);
  for(const {x,y,w,h} of doors) {
    if(w) {c.fillStyle='#96846e85';c.fillRect(x,y-5,w,10);c.fillStyle='#efddbc9e';c.fillRect(x,y-1,w,2);}
    if(h) {c.fillStyle='#96846e85';c.fillRect(x-5,y,10,h);c.fillStyle='#efddbc9e';c.fillRect(x-1,y,2,h);}
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

function viewingThrough(camera,player,wall) {
  if(player.y>wall.y+wall.h+16 || player.y<wall.y-135) return false;
  const near=project(camera,player.x,player.y,22);
  const left=project(camera,wall.x,wall.y+wall.h);
  const right=project(camera,wall.x+wall.w,wall.y+wall.h);
  return near.x>left.x-19 && near.x<right.x+19 && near.y>left.y-115*left.factor;
}

function facingWall(c,art,camera,wall,player,pets) {
  const room=roomFor(wall.room);
  const H=room?.id==='lobby'?113:121;
  const y=wall.y+wall.h-1;
  const base=project(camera,wall.x,y);
  const end=project(camera,wall.x+wall.w,y);
  const cap=project(camera,wall.x,y,H);
  const top=cap.y;
  if(base.y<-5 || top>505 || end.x<-10 || base.x>400) return;
  c.save();
  if(viewingThrough(camera,player,wall)) c.globalAlpha=.19;
  else if(pets.some(pet=>Math.abs(pet.x-player.x)<160 && Math.abs(pet.y-player.y)<150
    && pet.y<y && viewingThrough(camera,pet,wall))) c.globalAlpha=.36;
  const slab=c.createLinearGradient(base.x,top,base.x,base.y);
  slab.addColorStop(0,'#fff4e3');slab.addColorStop(.36,room?.wall||'#d9ded0');slab.addColorStop(1,'#a49780');
  c.fillStyle=slab;c.fillRect(base.x,top,end.x-base.x,base.y-top);
  if(art.walls && room) {
    const sw=WALL_FACE_TILE_WIDTH,sh=WALL_FACE_TILE_HEIGHT;
    const split=PANEL_SPLITS[room.id];
    const first=wall.x===room.x;
    const start=split && !first?split:0;
    const coverage=split?(first?split:1-split):1;
    c.drawImage(art.walls,(room.column+start)*sw,room.row*sh,coverage*sw,sh,
      base.x,top,end.x-base.x,base.y-top);
  }
  const stride=H*.065*base.factor;
  const shadow=c.createLinearGradient(0,base.y,0,base.y+stride*2.4);
  shadow.addColorStop(0,'#3f34276b');shadow.addColorStop(1,'#3f342700');
  c.fillStyle=shadow;c.fillRect(base.x,base.y,end.x-base.x,stride*2.4);
  c.fillStyle='#cab39b';c.fillRect(base.x,base.y-stride,end.x-base.x,stride);
  c.fillStyle='#e9d7c1';c.fillRect(base.x,base.y-stride,end.x-base.x,Math.max(1,stride*.21));
  const atEdge = !room || wall.x!==room.x ? 1 : 2;
  const profile=6*base.factor;
  for(let i=0;i<atEdge;i++) {
    const x = i===0?end.x-profile:base.x;
    c.fillStyle='#896e568a';c.fillRect(x,top,profile,base.y-top);
    c.fillStyle='#f5dfbf92';c.fillRect(x+.75,top,Math.max(1,profile*.19),base.y-top);
  }
  if(room && wall.w>=room.w*.95) roomSign(c,room.name,base.x+(end.x-base.x)*.5,Math.max(8,top+26*base.factor),12*base.factor);
  c.restore();
}

function entryTrim(c,camera,door,player) {
  const height=82;
  const left=project(camera,door.x,door.y),right=project(camera,door.x+door.w,door.y);
  const highLeft=project(camera,door.x,door.y,height),highRight=project(camera,door.x+door.w,door.y,height);
  if(left.y<0 || highLeft.y>505) return;
  const fade=Math.abs(player.y-door.y)<54 && Math.abs(player.x-door.x-door.w/2)<door.w*.72;
  c.save();
  if(fade) c.globalAlpha=.22;
  const room=roomFor(door.room);
  if(room) {
    const wallHeight=room.id==='lobby'?113:121;
    const wallTop=project(camera,door.x,door.y,wallHeight);
    const panelHeight=highLeft.y-wallTop.y;
    const head=c.createLinearGradient(0,wallTop.y,0,highLeft.y);
    head.addColorStop(0,'#c2a78a');head.addColorStop(1,'#e2c7a4');
    c.fillStyle=head;c.fillRect(left.x,wallTop.y,right.x-left.x,panelHeight);
  }
  const thickness=6*left.factor;
  c.fillStyle='#a48f78';c.fillRect(left.x-thickness*.65,highLeft.y,thickness,left.y-highLeft.y);
  c.fillRect(right.x-thickness*.35,highRight.y,thickness,right.y-highRight.y);
  c.fillStyle='#dcc6aa';c.fillRect(left.x-thickness*.42,highLeft.y,right.x-left.x+thickness*.86,thickness);
  c.fillStyle='#f2dfc6';c.fillRect(left.x-thickness*.42,highLeft.y,right.x-left.x+thickness*.86,1.5);
  if(room) roomSign(c,room.name,(left.x+right.x)/2,Math.max(4,highLeft.y-18*left.factor),11*left.factor);
  c.restore();
}

function sidePieces(camera,w) {
  const sideLength=28;
  const chunks=[];
  for(let y=w.y;y<w.y+w.h;y+=sideLength) {
    const end=Math.min(y+sideLength,w.y+w.h);
    const L1=project(camera,w.x,y),R1=project(camera,w.x+w.w,y),L2=project(camera,w.x,end),R2=project(camera,w.x+w.w,end);
    if(Math.max(R1.x,R2.x)<-18 || Math.min(L1.x,L2.x)>409 || L2.y<-30 || L1.y>545) continue;
    chunks.push({left1:L1,right1:R1,left2:L2,right2:R2,y,end,wall:w});
  }
  return chunks;
}

function sideWalls(c,camera,piece,player) {
  const {left1:L1,right1:R1,left2:L2,right2:R2,y,end,wall}=piece;
  const edge=!wall.room;
  const height=edge?66:58;
  const inward=wall.x+wall.w*.5<camera.x+195;
  const p1=inward?R1:L1,p2=inward?R2:L2;
  const b1={x:p1.x,y:p1.y-height*p1.factor},b2={x:p2.x,y:p2.y-height*p2.factor};
  const outer1=inward?L1:R1,outer2=inward?L2:R2;
  const u1={x:outer1.x,y:outer1.y-height*outer1.factor},u2={x:outer2.x,y:outer2.y-height*outer2.factor};
  const room=roomFor(wall.room);
  c.save();
  if(!edge && Math.abs(player.x-wall.x)<45 && player.y>=y-24 && player.y<=end+51) c.globalAlpha=.15;
  const shade=c.createLinearGradient(b1.x,b1.y,p2.x,p2.y);
  shade.addColorStop(0,room?.wall||'#dfddcc');shade.addColorStop(.57,edge?'#c5c4b5':'#d8c9b5');shade.addColorStop(1,edge?'#8c8b79':'#9a8872');
  const lean=inward?1:-1;
  polygon(c,[p1,p2,{x:p2.x+lean*12*p2.factor,y:p2.y+3},{x:p1.x+lean*12*p1.factor,y:p1.y+3}],'#54433324');
  polygon(c,[b1,b2,p2,p1],shade);
  polygon(c,[b1,b2,u2,u1],'#f5e6d2');
  const rail=.17;
  polygon(c,[{x:p1.x,y:p1.y-height*rail*p1.factor},{x:p2.x,y:p2.y-height*rail*p2.factor},p2,p1],room?.accent||'#779084');
  c.strokeStyle='#f8e9cdca';c.lineWidth=1.3;
  c.beginPath();c.moveTo(p1.x,p1.y-height*.39*p1.factor);c.lineTo(p2.x,p2.y-height*.39*p2.factor);c.stroke();
  c.restore();
}

function floorEdge(c,camera,wall) {
  const p1=project(camera,wall.x,wall.y),p2=project(camera,wall.x+wall.w,wall.y);
  const p3=project(camera,wall.x+wall.w,wall.y+wall.h),p4=project(camera,wall.x,wall.y+wall.h);
  if(p1.y>520 || p4.y<-5) return;
  polygon(c,[p1,p2,p3,p4],'#bba791');
  c.strokeStyle='#ede4d4';c.lineWidth=1.5;c.beginPath();c.moveTo(p1.x,p1.y);c.lineTo(p2.x,p2.y);c.stroke();
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
    return a.x>pox-8 && a.x<p.x+size*.37+8 && a.y>poy+8;
  });
  c.save();
  if(overlaps) c.globalAlpha=.39;
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
    for (const obstacle of HOSPITAL_FLOOR.walls) {
      if(obstacle.kind==='side') {
        for(const part of sidePieces(camera,obstacle)) layers.push({y:part.end,draw:()=>sideWalls(c,camera,part,player)});
      } else if(obstacle.kind==='face' || obstacle.kind==='edge') {
        layers.push({y:obstacle.y+obstacle.h,draw:()=>facingWall(c,this.images,camera,obstacle,player,pets)});
      } else if(obstacle.room) {
        floorEdge(c,camera,obstacle);
      }
    }
    for(const door of HOSPITAL_FLOOR.doors) if(door.face) {
      layers.push({y:door.y,draw:()=>entryTrim(c,camera,door,player)});
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
        {species:'cat',breed:'tuxedo',x:345,y:688,elevation:58,depth:689,dir:'left',action:'sleep',age:time},
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
