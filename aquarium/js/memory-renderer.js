import {FieldRenderer,box,oval,text} from './field-renderer.js?v245';
import {beginScene} from './layout.js';
import {drawExplorer} from './heroes.js?v=155';
import {loadMotion} from './motions.js';
import {drawMemoryPencil,prepareMemoryPencil} from './memory-pencil.js?v211';
import {MEMORY,MEMORY_BOARD,MEMORY_DEMO_PLAN,MEMORY_SIZE} from './memory-core.js?v224';
import {MEMORY_SCENES} from './memory-scenes.js?v224';
import {MEMORY_MARK_INSET} from './memory-targets.js?v209';

const comparisonPlan=MEMORY_DEMO_PLAN[0];
const comparisonSpots=MEMORY_SCENES.find(scene=>scene.id===comparisonPlan.scene).spots
 .filter(spot=>comparisonPlan.spots.includes(spot.id));
const comparisonAnswer=comparisonSpots[1];
const muralFloorTop=496;
// Full-body pose heights from the four original expression atlases.
const thinkingHeight={haru:215,narin:212,doyun:205,soi:214};

function picture(file){
 return new Promise((resolve,reject)=>{
  const im=new Image();
  im.onload=()=>im.decode?im.decode().then(()=>resolve(im),reject):resolve(im);
  im.onerror=()=>reject(Error('기억연구소 그림을 불러오지 못했어요.'));
  const url=new URL('../assets/'+file,import.meta.url);
  if(file.startsWith('memory-lab/scenes/'))url.search='v224';
  im.src=url.href;
 });
}
export async function loadMemoryAssets(){
 const files=new Map(),demonstration=new Map();
 const read=file=>{
  if(!files.has(file))files.set(file,picture(file).catch(error=>{files.delete(file);throw error;}));
  return files.get(file);
 };
 const loadRound=async (scene,ids)=>{
  const folder='memory-lab/scenes/'+scene.id+'/';
  // The tray and bucket can share the same floor layer. The step keeps
  // its own overlay so it does not alter the cloth under the ladder.
  const floorIds=scene.id==='27'?ids.filter(id=>id===5||id===6).sort():[];
  const individualIds=ids.filter(id=>!floorIds.includes(id));
  const [original,floor,...overlays]=await Promise.all([
   read(folder+'original.webp'),
   floorIds.length?read(folder+'floor-'+floorIds.join('')+'.webp'):null,
   ...individualIds.map(id=>read(folder+(scene.spots.find(spot=>spot.id===id).file||'p'+id+'.png'))),
  ]);
  return {original,floor,overlays:new Map(individualIds.map((id,i)=>[id,overlays[i]]))};
 };
 const [entrance,circle,cross]=await Promise.all([
  read('memory-lab/scenes/81/original.webp'),
  read('memory-lab/pencil-circle.webp'),
  read('memory-lab/pencil-cross.webp'),
  ...MEMORY_DEMO_PLAN.map(async plan=>{
   const art=await loadRound(MEMORY_SCENES.find(scene=>scene.id===plan.scene),plan.spots);
   demonstration.set(plan.scene,art);
  }),
 ]);
 const images={entrance,circle:prepareMemoryPencil(circle),cross:prepareMemoryPencil(cross),demonstration,loadRound};
 images.loadExplorer=async character=>{
  const file=character.id+'-idle.webp';
  const [idle,thinking]=await Promise.all([read('hero-v153/'+file),loadMotion(character,'wrong')]);
  images[file]=idle;images.thinking=thinking;
 };
 return images;
}

export function drawMemoryPicture(c,art,spots=[]){
 c.drawImage(art.original,0,0);
 if(spots.length&&art.floor)c.drawImage(art.floor,0,muralFloorTop);
 for(const spot of spots){
  const overlay=art.overlays.get(spot.id);
  if(overlay)c.drawImage(overlay,...spot.patch);
 }
}

function drawComparisonCard(c,art,x,label,focus,spots=[]){
 const y=31,w=46,h=w*MEMORY_SIZE.height/MEMORY_SIZE.width;
 box(c,x-3,y-3,w+6,h+6,focus?'#efc97f':'#fff7e4',4);
 c.strokeStyle=focus?'#a87436':'#b4ab91';c.lineWidth=1;c.stroke();
 text(c,label,x+w/2,20,9,'#526353');
 c.save();c.translate(x,y);c.scale(w/MEMORY_SIZE.width,w/MEMORY_SIZE.width);
 drawMemoryPicture(c,art,spots);
 c.restore();
}

export class MemoryRenderer extends FieldRenderer{
 draw(game,_character,_time=0,_dt=0,active=false){
  const c=this.c,{x,y,w,h}=MEMORY_BOARD;
  beginScene(c);c.clearRect(0,0,390,844);c.save();c.translate(0,170);
  box(c,0,0,390,500,'#eadfc9',0);
  text(c,game.statusDescription,195,17,14,'#5c6350');
  box(c,x-5,y-5,w+10,h+10,'#fff8e9',8);
  c.save();c.beginPath();c.roundRect(x,y,w,h,4);c.clip();
  c.fillStyle='#d6d0bc';c.fillRect(x,y,w,h);
  const art=game.art||(!game.loadRound?this.images.demonstration.get(game.scene.id):null);
  const changed=['search','review','complete'].includes(game.phase);
  const observing=game.phase==='observe';
  if(game.phase==='countdown'){
   c.fillStyle='#273f39';c.fillRect(x,y,w,h);
   text(c,String(Math.ceil(game.phaseLeft)),x+w/2,y+h/2-10,78,'#fff7df');
   text(c,'곧 달라진 그림이 나와요',x+w/2,y+h/2+49,15,'#e9dcc2');
  }else if(art&&(!observing||active||!game.loadRound)){
   c.translate(x,y);c.scale(w/MEMORY_SIZE.width,h/MEMORY_SIZE.height);
   c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
   drawMemoryPicture(c,art,changed?game.targets:[]);
   if(changed){
    if(game.hint){
     const [left,top,width,height]=game.hint.box;
     c.fillStyle='#ffdb4a37';c.fillRect(left,top,width,height);
     c.strokeStyle='#fff3a2';c.lineWidth=5;c.setLineDash([11,7]);
     c.strokeRect(left+2.5,top+2.5,width-5,height-5);c.setLineDash([]);
    }
    for(const {x:mx,y:my} of game.misses){
     const inset=MEMORY_MARK_INSET;
     const origin=[Math.max(inset,Math.min(MEMORY_SIZE.width-inset,mx)),Math.max(inset,Math.min(MEMORY_SIZE.height-inset,my))];
     drawMemoryPencil(c,this.images.cross,origin);
    }
    for(const spot of game.targets){
     if(game.foundSpots.has(spot.id)||game.showMissing)drawMemoryPencil(c,this.images.circle,spot.mark);
    }
    if(active&&game.canAct&&game.cursor.visible){
     const {x:cx,y:cy}=game.cursor;
     c.beginPath();c.arc(cx,cy,17,0,Math.PI*2);c.moveTo(cx-7,cy);c.lineTo(cx+7,cy);c.moveTo(cx,cy-7);c.lineTo(cx,cy+7);
     c.lineWidth=5;c.strokeStyle='#233230';c.stroke();c.lineWidth=2.3;c.strokeStyle='#fff8bc';c.stroke();
    }
    if(game.demoTap){
     const [tx,ty]=game.demoTap;
     c.beginPath();c.arc(tx,ty,17,0,Math.PI*2);
     c.lineWidth=8;c.strokeStyle='#354944';c.stroke();
     c.lineWidth=4;c.strokeStyle='#fff7da';c.stroke();
    }
   }
  }else if(game.phase==='loading'||game.phase==='error'){
   text(c,game.phase==='loading'?'그림을 불러오고 있어요':'그림을 불러오지 못했어요',
    195,y+h/2,13,'#625f50');
  }else if(observing){
   text(c,'그림을 볼 준비를 해요',195,y+h/2,14,'#625f50');
  }
  c.restore();
  if(changed){
   text(c,'남은 기회 '+game.remainingAttempts+'번',39,484,12,'#5c6959','left');
   text(c,'찾은 곳 '+game.foundSpots.size+' / '+MEMORY.changes,350,484,12,'#5c6959','right');
  }
  c.restore();
 }
 entrance(c){
  const im=this.images.entrance,h=142,w=h*im.width/im.height;
  c.drawImage(im,130-w/2,115-h/2,w,h);
 }
 briefing(c,character,time=0){
  const age=time%5.6,original=age<1.25,thinking=age>=2.5&&age<4.3,found=age>=4.3;
  const art=this.images.demonstration.get(comparisonPlan.scene);
  drawComparisonCard(c,art,10,'원본',original);
  drawComparisonCard(c,art,124,'바뀐 그림',!original&&!thinking,comparisonSpots);
  if(found){
   const [x,y]=comparisonAnswer.mark,scale=46/MEMORY_SIZE.width;
   drawMemoryPencil(c,this.images.circle,[124+x*scale,31+y*scale],14);
  }
  const x=90,foot=104;
  oval(c,x,foot+1,12,3,'#52796e32');
  if(thinking){
   const cell=256,frame=Math.min(3,Math.floor((age-2.5)*2.5));
   const size=50*cell/thinkingHeight[character.id];
   c.drawImage(this.images.thinking,frame*cell,3*cell,cell,cell,
    x-size/2,foot-size*239/cell,size,size);
  }else{
   drawExplorer(c,this.images,character,{x,y:foot,dir:original?'left':'right',moving:false,hammerAge:99});
  }
 }
}

export function syncMemoryStats(game,find){
 const timed=game.clockTotal>0;
 const seconds=timed?Math.ceil(game.phaseLeft):0;
 const clock=find('time-value');
 const value=timed?'00:'+String(seconds).padStart(2,'0'):game.phase==='loading'?'준비 중':'—';
 if(clock.textContent!==value)clock.textContent=value;
 const timer=clock.closest('.timer');
 const label={observe:'관찰 시간',countdown:'바뀌기까지',search:'찾기 시간',review:'정답 공개'};
 timer.querySelector('.hud-label').textContent=label[game.phase]||'관찰 시간';
 timer.classList.toggle('urgent',timed&&seconds<=4);
 find('time-fill').style.transform='scaleX('+(timed?game.phaseLeft/game.clockTotal:0)+')';
 find('clue-value').textContent=String(game.banked.size);
 find('history-era').hidden=false;find('history-era').textContent=(game.room+1)+' / '+MEMORY.rounds;
 find('health-value').hidden=true;
}
