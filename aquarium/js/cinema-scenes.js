import {programmeFrame,programmeBeat,onePassIndex} from './cinema-motion.js?v178';
import {CINDERELLA_FOOT_ANCHORS178} from './asset-performance178.js?v178';
import {rockyBagPose} from './cinema-physics178.js?v178';
export const CINEMA_ACTOR_HEIGHT=56;
export const CINEMA_CAST=Object.freeze(['haru','doyun','narin','soi']);
export const CINEMA_CLIP=Object.freeze({columns:3,rows:3,frames:8,width:320,height:180});
const background=Object.freeze([0,0,320,180]);
export const shotProgress=(n,a,b)=>Math.max(0,Math.min(1,(n-a)/(b-a)));
const ease=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};
const cellSource=frame=>{const n=frame+1;return[n%3*320,Math.floor(n/3)*180,320,180]};
const beatIndex=(t,beats)=>Math.max(0,beats.findLastIndex(a=>t>=a));
export function cinemaScene(film,age){
 const elapsed=Math.max(0,Number.isFinite(age)?age:0),time=Math.min(7.99999,elapsed);
 let frame=programmeFrame(film,time),offset=[0,0],rotation=0,flip=false,pivot=[160,99],panoramaX=null,extra=null,actionSheet=null;
 const performerBeats={
 matrix:[0,.25,.55,.9,1.3,1.8,2.3,2.9,3.5,4.2,4.8,5.2,5.7,6.2,6.9,7.5],
 backfuture:[0,.35,.7,1.2,1.6,2,2.6,3.2,4.5,5.35,5.7,6.1,6.45,6.9,7.3,7.65],
 ghostbusters:[0,.3,.65,1.1,2,2.4,2.9,3.35,3.8,4.25,4.7,5.25,5.85,6.4,6.95,7.5],
 kingsman:[0,.3,.65,1,1.35,1.8,2.3,2.85,3.4,4,4.6,5.25,6.05,6.45,6.9,7.45],
 bohemian:[0,.3,.65,1.1,1.6,2,2.4,2.9,3.5,4,4.6,5.1,5.55,6.2,6.85,7.4],
 mamma:[0,.3,.65,1,1.35,1.8,2.3,2.8,3.3,3.8,4.3,4.85,5.45,6.15,6.9,7.5],
 showman:[0,.35,.7,1.05,1.5,2,2.5,3.05,3.6,4.1,4.65,5.05,5.6,6.25,6.9,7.5],
 castaway:[0,.3,.6,.9,1.2,1.6,2,2.5,3.1,3.7,4.4,4.95,5.55,6.1,6.8,7.4],
 lesmis:[0,.35,.75,1.15,1.65,2.2,2.8,3.4,4,4.6,5.2,5.75,6.25,6.75,7.2,7.6],
 jumanji:[0,.12,.35,.55,.8,1.1,1.65,2.1,2.6,3.1,3.55,4,4.4,5.4,6.5,7.3],
 singinrain:[0,.4,.8,1.2,1.6,2.15,2.65,3.1,3.6,4.1,4.6,5.1,5.65,6.3,6.9,7.45]
 };
 const performanceIndex=performerBeats[film.id]?beatIndex(time,performerBeats[film.id]):onePassIndex(time,0,8,['lalaland','whiplash','rocky'].includes(film.id)?32:film.id==='topgun'?8:16);
 if(film.id==='inception'){const phase=time/8*Math.PI*2;offset=[Math.sin(phase)*13,Math.sin(phase*2)*7];rotation=phase-.35;}
 if(film.id==='wizardoz'){panoramaX=time*18;offset=[-38+time*8.5,0]}
 if(film.id==='leon')offset=[-105+time*23,5];
 if(film.id==='peterpan')offset=[68-time*17,Math.sin(time/8*Math.PI*2)*8];
 // Explicitly approved shots retain their movement. They are not slowed.
 if(film.id==='gravity'){
  if(time<5.4){frame=Math.floor(time*5)%4;const p=ease(time/5.4);offset=[-66+152*p,Math.sin(time*Math.PI/2.7)*7*(1-p)];pivot=[130,98];rotation=Math.sin(time*Math.PI/2.7)*.16*(1-p);extra={kind:'gravity',phase:'swim',back:[115+offset[0],101+offset[1]]};}
  else{frame=time<5.7?4:time<6?5:6+Math.floor((time-6)*5)%2;extra={kind:'gravity',phase:'grip',back:[201,105]};}
 }
 if(film.id==='panslabyrinth'){
  const girlFrame=time<.7?0:time<1.35?1:time<2?2:time<3.5?3:4+Math.floor((time-3.5)*8)%4;
  const monsterFrame=time<1.35?0:time<2?1:time<2.8?2:time<3.8?3:time<4.6?4:5+Math.floor((time-4.6)*5)%3;
  extra={kind:'pale-man',girlFrame,monsterFrame,girlX:time<3.5?118:118-(time-3.5)*24,monsterX:time<3.8?225:225-31*(time-3.8),ate:time>=1.35,eyesAtFace:time>=2,standing:time>=3.8,chasing:time>=4.6};
 }
 if(film.id==='titanic')extra={kind:'open-arms',index:beatIndex(time,[0,.35,.7,1.1,2.1,3.5,5,6.5])};
 if(film.id==='rocky')extra={kind:'boxing',bag:rockyBagPose(time,performanceIndex)};
 if(film.id==='lalaland')extra={kind:'dance-phrase',index:onePassIndex(time,0,8,32)};
 if(film.id==='soundmusic')extra={kind:'song-phrase',index:beatIndex(time,[0,.35,.7,1.15,1.7,2.2,2.65,3.15,3.6,4,4.2,4.4,4.95,5.65,6.45,7.15])};
 if(film.id==='mission'){
  const index=beatIndex(time,[0,.25,.5,.8,1.1,1.4,1.7,2,2.35,2.7,3.1,3.5,4,4.5,5.1,5.7]);
  extra={kind:'spy',index,drop:time<1.5?-22+22*ease(time/1.5):time>5.8?-26*ease(shotProgress(time,5.8,8)):0,copied:time>=3.1,copyProgress:shotProgress(time,2.05,3.1)};
 }
 if(film.id==='indiana'){
  const p=shotProgress(time,1.5,2.8),jump=time>=1.5&&time<2.8;
  const index=beatIndex(time,[0,.22,.44,.85,1.5,1.72,2.05,2.45,2.8,3.05,3.4,4.1,4.7,5.1,6.9,7.4]);
  const x=time<1.5?47+time*40:time<2.8?107+82*p:189+Math.min(30,(time-2.8)*5);
  extra={kind:'train',index,runnerX:x,runnerY:jump?-31*Math.sin(p*Math.PI):0,beamX:455-time*43,airborne:jump,landed:time>=2.8,ducking:time>=4.7&&time<6.9};
 }
 if(film.id==='jaws'){
  const rise=1-ease(shotProgress(time,2.3,3.05)),sink=ease(shotProgress(time,3.05,4.05));
  extra={kind:'shark',sharkVisible:time>=2.3&&time<4.05,sharkY:65*rise+70*sink,sharkX:62,submerged:time>=4.05};
 }
 if(film.id==='matrix')extra={kind:'bullets',bullets:[0,.35,.7].map(delay=>({x:350-(time-1.35-delay)*110,y:107+delay*5,active:time>=1.35+delay&&time<=5.6+delay}))};
 if(film.id==='backfuture'){const p=shotProgress(time,1.6,5.4);extra={kind:'car',carX:68*p*p*p,carVisible:time<5.4,jumped:time>=5.4,flash:time>=5.4&&time<6?1-(time-5.4)/.6:0,flashX:260};}
 if(film.id==='ghostbusters'){const pull=ease(shotProgress(time,4.2,6.35)),struggle=Math.sin(time*7)*3*(1-pull);extra={kind:'capture',ghost:[203+struggle*(time>1.6?1:.3),123+Math.sin(time*3)*3*(1-pull)+38*pull],ghostScale:1-pull,ghostVisible:time<6.35,beam:time>=2&&time<6.35,sealed:time>=6.35,trap:[206,161]};}
 if(film.id==='jurassic'){
  const index=beatIndex(time,[0,.25,.55,1,1.35,1.7,2,2.35,2.7,3.2,3.65,4.25,4.7,5.15,5.6,6.2]);
  extra={kind:'dinosaur',index,runnersX:time<1.2?25-time*12:time<4.3?10:10-(time-4.3)*23,dinoX:-20*ease(shotProgress(time,.7,4.8)),dinoY:8,dinoFrame:beatIndex(time,[0,.75,4.5,4.95,5.4,5.95,6.8,7.4]),childrenSafe:time>=6.2};
 }
 if(film.id==='interstellar')extra={kind:'water-rescue',index:beatIndex(time,[0,.35,.7,1.1,1.5,1.9,2.25,2.6,3.05,3.5,3.95,4.4,4.95,5.6,6.35,7.1]),groupX:time<2.25?12:12-(time-2.25)*13,waveX:120-time*8,waveBottom:139,feet:[160+(time<2.25?12:12-(time-2.25)*13),148]};
 if(film.id==='martian')extra={kind:'hab-farm',index:beatIndex(time,[0,.3,.6,.9,1.2,1.55,1.9,2.4,3.1,3.55,4.05,4.55,5.1,5.65,6.2,6.9]),machineOn:time>=1.2,planting:time>=4.55,waterProgress:shotProgress(time,1.2,7.5)};
 if(film.id==='jumanji')extra={kind:'stampede',diceIndex:onePassIndex(time,.35,1.05,8),diceProgress:shotProgress(time,.35,1.05),elephantIndex:onePassIndex(time,2.4,6.6,8),elephantX:time<2.4?350:350-(time-2.4)*37,elephantVisible:time>=2.4,duck:time>=2.6};
 if(film.id==='pi'){
  const p=shotProgress(time,1.75,4.7);
  extra={kind:'whale-breach',whaleIndex:onePassIndex(time,1.75,4.7,8),whaleVisible:time>=1.75&&time<4.7,whaleX:316-252*p,whaleY:191-123*Math.sin(Math.PI*p),index:beatIndex(time,[0,.8,1.75,2.5,3.1,4.1,5.2,6.5]),boatBob:time<4.7?Math.sin(time*1.3)*1.1:Math.sin((time-4.7)*2)*4*(1-shotProgress(time,4.7,8)),splashed:time>=4.7};
 }
 if(film.id==='lotr')extra={kind:'bridge',wizardIndex:beatIndex(time,[0,.6,1.1,1.55,2.05,2.45,5.9,6.8]),demonIndex:beatIndex(time,[0,.8,1.4,2.5,3.45,4.05,4.6,5.2]),bridgeBroken:time>=3.45,fall:Math.max(0,time-3.45)**2*26,demonX:95-99*ease(shotProgress(time,0,3.1)),flash:time>=2.05&&time<2.4?1-(time-2.05)/.35:0};
 if(film.id==='nightmuseum')extra={kind:'museum',index:frame,guardX:-Math.max(0,time-3.2)*2.7,dinoX:-Math.min(15,Math.max(0,time-2.15)*3)};
 if(film.id==='cinderella'){offset=[210-time*20.5-CINDERELLA_FOOT_ANCHORS178[performanceIndex][0],0];actionSheet='run16'}
 if(film.id==='harrypotter')extra={kind:'feather',feather:[180+Math.sin(shotProgress(time,2.2,8)*Math.PI*1.3)*14,115-38*ease(shotProgress(time,2.2,4.2))+Math.sin(time*2)*shotProgress(time,3,5)*2]};
 if(film.id==='kingsman')extra={kind:'shield',open:time>=1.35,bullets:[3,3.45,3.9,4.35,4.8].map((at,i)=>({x:340-(time-at)*170,y:120+i%3*6,active:time>=at&&time<at+1})),impact:time>=2.3&&time<5.7};
 if(film.id==='chocolate'){const q=shotProgress(time,2.2,4.4);extra={kind:'chocolate-river',index:beatIndex(time,[0,.35,.7,1.15,1.7,2.2,2.55,2.95,3.35,3.85,4.4,4.9,5.45,6.1,6.75,7.35]),boyX:time<1.7?130:time<2.55?130+35*ease(shotProgress(time,1.7,2.55)):165+73*ease(shotProgress(time,2.55,4.4)),boyFoot:time<2.2?128:132-50*ease(shotProgress(time,4.4,8)),inPipe:time>=4.4};}
 if(film.id==='homealone')extra={kind:'can',swing:shotProgress(time,.35,3.65),hit:time>=2.45,hitAge:Math.max(0,time-2.45)};
 return{frame,performanceIndex,background,offset,rotation,flip,pivot,panoramaX,extra,actionSheet,time,ended:elapsed>=8,beat:programmeBeat(film,time).label,source:cellSource(frame)};
}
