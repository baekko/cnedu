import {beginScene, spriteAnchor} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {HOSPITAL_PET_SIZES} from './hospital-core.js';
import {HOSPITAL_FLOOR, HOSPITAL_VIEW} from './hospital-layout.js';

const FURNITURE = ['desk','sofa','table','exam','cabinet','sink','treadmill','ramp','markers','bed','tree','plant'];
const FURNITURE_TILE = 200;
const FURNITURE_COLUMNS = 4;
const FURNITURE_GROUND = 192 / FURNITURE_TILE;
const ARCHITECTURE_DENSITY = 2;
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
  const [animals,furniture,postalCats,catActions,manifest] = await Promise.all([
    loadImage('hospital/animals.webp'),
    loadImage('hospital/furniture.webp'),
    loadImage('postal/village-cats.webp?v265'),
    loadImage('hospital/cat-actions.webp').catch(()=>null),
    fetch(asset('hospital/animals.json')).then(response => {
      if (!response.ok) throw new Error('동물 그림 목록을 불러오지 못했어요.');
      return response.json();
    }),
  ]);
  return {animals,furniture,postalCats,catActions,manifest};
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

function paintFloor(c,room) {
  const {x,y,w,h,floor,id} = room;
  c.save();
  c.beginPath();
  c.rect(x,y,w,h);
  c.clip();
  c.fillStyle = floor;
  c.fillRect(x,y,w,h);
  const tile = id === 'exam' || id === 'rest';
  const step = tile ? 32 : 18;
  c.lineWidth = .7;
  c.strokeStyle = tile ? '#5472841b' : '#82724b22';
  c.beginPath();
  for (let xx=x;xx<=x+w;xx+=step) {
    c.moveTo(xx,y);
    c.lineTo(xx,y+h);
    if (tile) continue;
    const offset = (Math.round((xx-x)/step)%2)*27;
    for (let yy=y+offset;yy<=y+h;yy+=55) {
      c.moveTo(xx,yy);
      c.lineTo(xx+step,yy);
    }
  }
  if (tile) for (let yy=y;yy<=y+h;yy+=step) {
    c.moveTo(x,yy);
    c.lineTo(x+w,yy);
  }
  c.stroke();
  const light = c.createLinearGradient(x,y,x+w,y+h);
  light.addColorStop(0,'#fffffb42');
  light.addColorStop(1,'#756e5c12');
  c.fillStyle = light;
  c.fillRect(x,y,w,h);
  c.restore();
}

function insetWindow(c,x,y,w) {
  rounded(c,x-3,y-4,w+6,39,'#9fb9b3',3);
  rounded(c,x,y,w,33,'#f8faf0',3);
  const glass = c.createLinearGradient(x,y,x,y+29);
  glass.addColorStop(0,'#abd7e2');
  glass.addColorStop(1,'#dfedea');
  rounded(c,x+3,y+3,w-6,26,glass,2);
  c.fillStyle = '#f8faf0';
  c.fillRect(x+w/2-1,y+2,2,29);
  c.fillRect(x+1,y+15,w-2,1.5);
  c.fillStyle = '#ffffff77';
  c.beginPath();
  c.moveTo(x+8,y+5);
  c.lineTo(x+20,y+5);
  c.lineTo(x+12,y+14);
  c.lineTo(x+4,y+14);
  c.fill();
  rounded(c,x-5,y+29,w+10,5,'#f8f7ec',1.5);
}

function wall(c,object,room) {
  const {x,y,w,h,type} = object;
  const tone = room?.wall || '#dce7e2';
  const rise = {back:43,interior:0,partition:8,edge:7,front:6,south:6}[type];
  const fullFace = type === 'back' || type === 'interior';
  c.fillStyle = '#304d4520';
  c.fillRect(x+3,y+h,w+2,fullFace?10:5);
  c.fillStyle = tone;
  c.fillRect(x,y-rise,w,h+rise);
  c.fillStyle = '#89a59c';
  c.fillRect(x,y+h-3,w,3);
  c.fillStyle = '#f8faf2';
  c.fillRect(x,y-rise,w,4);
  if (fullFace) {
    c.fillStyle = '#ffffff7d';
    c.fillRect(x,y+h-22,w,3);
  } else if (type==='edge' || type==='partition') {
    c.fillStyle = '#c3d5ce';
    c.fillRect(x+w-3,y-rise,3,h+rise);
  }
}

function sign(c,room,x,y) {
  const w = room.id==='lobby'?76:59;
  rounded(c,x-w/2,y,w,21,'#faf8ef',3);
  rounded(c,x-w/2+4,y+4,3,13,room.accent,1.5);
  c.fillStyle = '#354f49';
  c.textAlign = 'center';
  c.font = '600 10px "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", system-ui, sans-serif';
  c.fillText(room.name,x+2,y+14);
}

function doorway(c,x,y,w,h,vertical=false) {
  c.fillStyle = '#a6b4a9';
  c.fillRect(x,y,w,h);
  c.fillStyle = '#f4f2e8';
  if (vertical) {
    c.fillRect(x+2,y,w-4,5);
    c.fillRect(x+2,y+h-5,w-4,5);
  } else {
    c.fillRect(x,y+2,5,h-2);
    c.fillRect(x+w-5,y+2,5,h-2);
  }
}

function paintArchitecture(c) {
  const {width,height,rooms,walls} = HOSPITAL_FLOOR;
  c.fillStyle = '#d8e3de';
  c.fillRect(0,0,width,height);
  rounded(c,11,36,width-22,height-66,'#b8cec5',13);
  c.fillStyle = '#e4e9df';
  c.fillRect(33,58,width-66,890);
  c.strokeStyle = '#617e741e';
  c.lineWidth = .7;
  for (let y=66;y<945;y+=34) {
    c.beginPath();
    c.moveTo(33,y);
    c.lineTo(width-33,y);
    c.stroke();
  }
  c.fillStyle = '#d5e0d5';
  c.fillRect(357,85,3,855);
  c.fillRect(420,85,3,855);
  c.fillRect(42,443,width-84,3);
  c.fillRect(42,544,width-84,3);
  for (const room of rooms) paintFloor(c,room);

  rounded(c,45,120,95,45,'#b5cec087',7);
  rounded(c,73,278,82,52,'#bed2ba63',10);
  rounded(c,117,780,118,71,'#bdd2c787',9);
  rounded(c,210,640,94,48,'#e0b9a184',5);
  rounded(c,467,649,103,46,'#d2bfdc7e',8);
  rounded(c,465,864,103,51,'#d2bfdc72',8);
  rounded(c,642,844,92,50,'#d2bfdc72',8);

  for (const obstacle of walls) {
    const bottom = obstacle.y+obstacle.h;
    const room = rooms.find(r=>obstacle.x>=r.x && obstacle.x<r.x+r.w && bottom>=r.y-12 && bottom<r.y+r.h+12);
    wall(c,obstacle,room);
  }
  insetWindow(c,47,16,83);
  insetWindow(c,243,16,66);
  insetWindow(c,505,16,76);
  insetWindow(c,646,16,72);
  insetWindow(c,51,528,68);
  insetWindow(c,664,528,58);
  for (const [x,y] of [[138,410],[548,410],[138,565],[548,565]]) doorway(c,x,y,87,10);
  for (const [x,y] of [[336,199],[432,199],[336,709],[432,709]]) doorway(c,x,y,12,82,true);
  sign(c,rooms[0],181,23);
  sign(c,rooms[1],613,23);
  sign(c,rooms[2],285,533);
  sign(c,rooms[3],491,533);
  for (const [x,y] of [[139,422],[549,422],[139,577],[549,577]]) {
    c.fillStyle = '#7a948659';
    c.fillRect(x,y,85,2);
  }
}

function furniture(c,art,object) {
  const tile = FURNITURE.indexOf(object.kind);
  const unit = object.width / FURNITURE_TILE;
  const size = unit * FURNITURE_TILE;
  oval(c,object.x+2,object.y-1,object.width*.34,object.depth*.20,'#314c3a22');
  c.drawImage(art,tile%FURNITURE_COLUMNS*FURNITURE_TILE,Math.floor(tile/FURNITURE_COLUMNS)*FURNITURE_TILE,
    FURNITURE_TILE,FURNITURE_TILE,object.x-size/2,object.y-size*FURNITURE_GROUND,size,size);
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

function animal(c,art,pet) {
  const {species,breed,x,y,dir,action,age=0,jump=0,elevation=0} = pet;
  const petWidth = pet.width ?? HOSPITAL_PET_SIZES[breed] ?? 37;
  const coat = species==='cat'?ORIGINAL_COATS[breed]:undefined;
  const lifted = elevation+jump;
  if (elevation===0) oval(c,x,y+1,petWidth*(lifted>5?.26:.33),petWidth*.085,'#394d382a');
  c.save();
  spriteAnchor(c,x,y-lifted);
  if (dir==='left') c.scale(-1,1);

  const {cellWidth,cellHeight,ground,breeds} = art.manifest;
  const h = petWidth*cellHeight/cellWidth;
  const specialRow = species==='cat'?CAT_ACTION_ROWS[breed]:undefined;
  const specialColumn = specialRow===undefined?null:catActionColumn(action,age);
  if (art.catActions && specialColumn!==null) {
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
  return x>camera.x-padding && x<camera.x+HOSPITAL_VIEW.width+padding
    && y>camera.y-padding && y<camera.y+HOSPITAL_VIEW.height+padding;
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
    this.architecture.width = HOSPITAL_FLOOR.width*ARCHITECTURE_DENSITY;
    this.architecture.height = HOSPITAL_FLOOR.height*ARCHITECTURE_DENSITY;
    const floor = this.architecture.getContext('2d');
    floor.scale(ARCHITECTURE_DENSITY,ARCHITECTURE_DENSITY);
    paintArchitecture(floor);
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
    const {camera,player,animals} = game;
    const {width,height} = HOSPITAL_VIEW;
    c.drawImage(this.architecture,camera.x*ARCHITECTURE_DENSITY,camera.y*ARCHITECTURE_DENSITY,
      width*ARCHITECTURE_DENSITY,height*ARCHITECTURE_DENSITY,0,0,width,height);
    c.save();
    c.translate(-camera.x,-camera.y);
    const layers = [];
    for (const object of HOSPITAL_FLOOR.fixtures) if (visible(object.x,object.y,camera,150)) {
      layers.push({y:object.y,draw:()=>furniture(c,this.images.furniture,object)});
    }
    for (const pet of game.phase==='explore'?animals:[]) if (visible(pet.x,pet.y,camera,95)) {
      layers.push({y:animalDepth(pet),draw:()=>animal(c,this.images,pet)});
    }
    layers.push({y:player.y,draw:()=>{
      oval(c,player.x,player.y,12.5,4.3,'#2c48432c');
      drawExplorer(c,this.images,character,{...player,hammerAge:99});
    }});
    layers.sort((a,b)=>a.y-b.y).forEach(layer=>layer.draw());
    c.restore();
  }

  drawPreview(c,character,time) {
    const x = 194+Math.sin(time*1.45)*48;
    const game = {
      phase:'explore',camera:{x:12,y:84},
      player:{x,y:255,dir:Math.cos(time*1.45)>0?'right':'left',moving:true,walk:time},
      animals:[
        {species:'cat',breed:'tabby',x:108,y:162,dir:'right',action:'groom',age:time},
        {species:'dog',breed:'golden',x:99+Math.sin(time*1.8)*13,y:251,dir:Math.cos(time*1.8)>0?'right':'left',action:'walk',age:time},
        {species:'rabbit',breed:'lop',x:261,y:185,dir:'left',action:'ear',age:time},
        {species:'cat',breed:'tuxedo',x:281,y:263,dir:'left',action:'sleep',age:time},
      ],
    };
    c.save();
    c.beginPath();
    c.roundRect(2,2,176,111,9);
    c.clip();
    c.scale(.6,.6);
    this.paintWorld(c,game,character);
    c.restore();
  }

  briefing(c,character,time) {
    this.drawPreview(c,character,time);
  }
}
