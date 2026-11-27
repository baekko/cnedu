import {gardenerTarget,callGardener,tickGardener} from './garden-helper.js';
import {FieldGame,clamp} from './field-base.js';
import {POLLEN_NAMES,initGardenCare,careTarget,careLabel,carePrompt,actGardenCare,tickGardenCare} from './garden-care.js';
export const GARDEN=Object.freeze({duration:90,flashes:1,answer:'물뿌리개',hints:['식물에 물을 줄 때 쓰는 도구예요.','그림 속 도구의 이름은 ‘물뿌리개’예요.']});
export const GARDEN_ROOMS=['햇살 온실','나무 정원','열대식물실'];
export const PLANT_NAMES=['붓꽃','백합','제라늄','푸른 꽃','노란 꽃','분홍 꽃','라벤더','난초','동백'];
export const GARDEN_DEVICES=Object.freeze({heater:{part:'heater',x:80,y:365},vent:{part:'vent',x:310,y:365}});
// Displayed cultivation requests are game rules, not botanical temperature claims.
const BANDS=[[[18,22],[24,28],[30,34]],[[19,23],[25,29],[31,35]],[[17,21],[23,27],[29,33]]];
const REQUESTS=BANDS.flatMap(([low,mid,hot])=>[[low],[mid],[hot]]);
const AMBIENT=[17,18,16];
export const GARDEN_STABLE_SPEED=.35;
export function gardenWeather(time,room){
 const phase=(time+room*5)%30;
 if(phase<10)return {kind:'calm',label:'맑음',offset:0,left:10-phase};
 if(phase<13)return {kind:'sunSoon',label:'햇살 강해짐',offset:0,left:13-phase,warning:true};
 if(phase<20)return {kind:'sun',label:'강한 햇살',offset:2,left:20-phase};
 if(phase<23)return {kind:'coldSoon',label:'찬바람 다가옴',offset:0,left:23-phase,warning:true};
 return {kind:'cold',label:'찬바람',offset:-2,left:30-phase};
}
export class GardenGame extends FieldGame{
 constructor({onEvent=()=>{},characterId='haru'}={}){
  super(GARDEN.duration,onEvent);this.speed=142;this.flashes=GARDEN.flashes;this.gardener=null;this.player.x=195;this.actionWait=0;this.turns=0;this.windowOpen=0;this.characterId=characterId;
  this.rooms=AMBIENT.map((outside,i)=>({temperature:[23,26.5,24.5][i],heat:0,heater:false,vent:false,holdLeft:0,velocity:0,outside,weather:gardenWeather(0,i)}));
  this.beds=PLANT_NAMES.map((name,i)=>({id:i+1,name,room:Math.floor(i/3),x:[72,195,318][i%3],y:310,active:false,cover:false,temperature:this.rooms[Math.floor(i/3)].temperature,velocity:0,stage:0,progress:0,stress:0,bloom:false,bloomAge:0,bands:REQUESTS[i].map(b=>[...b]),seconds:[5.5]}));initGardenCare(this);
 }
 get plants(){return this.beds.filter(s=>s.room===this.room);}
 get climate(){return this.rooms[this.room];}
 get controls(){return [...this.plants.filter(s=>!s.bloom&&this.gardener?.id!==s.id).map(s=>({part:s.active?'cover':'seed',id:s.id,x:s.x,y:s.y})),...Object.values(GARDEN_DEVICES)];}
 get target(){if(this.room!==0)return careTarget(this);const p=this.player;return this.controls.map(n=>({...n,d:Math.hypot(n.x-p.x,n.y-p.y)})).filter(n=>n.d<43).sort((a,b)=>a.d-b.d)[0]||null;}
 get canAct(){return !this.ended&&(this.room===0?this.actionWait:this.careWait)<=0&&!!this.target;}
 get itemKind(){return 'gardenerBell';}
 get itemLabel(){return '정원사 호출벨';}
 get itemTip(){return '가까운 식물 한 곳의 남은 작업 완료 · 1회 사용 가능';}
 get helperTarget(){return gardenerTarget(this);}
 get canCallGardener(){return !!this.helperTarget;}
 get actionLabel(){if(this.room!==0)return careLabel(this);const t=this.target;if(!t)return '조작';return t.part==='seed'?'심기':t.part==='cover'?(this.beds[t.id-1].cover?'열기':'덮기'):t.part==='heater'?(this.climate.heater?'끄기':'켜기'):(this.climate.vent?'닫기':'열기');}
 band(s){return s.bands[0];}
 inBand(s){const [low,high]=this.band(s);return s.temperature>=low&&s.temperature<=high;}
 stable(s){return Math.abs(s.velocity)<=GARDEN_STABLE_SPEED;}
 growing(s){return s.active&&!s.bloom&&this.inBand(s)&&this.stable(s);}
 get statusDescription(){if(this.room===1)return (this.pollen===null?'빈 붓':POLLEN_NAMES[this.pollen]+' 꽃가루 '+this.pollenCharges+'회분')+' · '+this.plants.map(s=>s.name+(s.bloom?' 완료':' 꽃가루 '+s.pollinate+' / 3')).join(' · ');if(this.room===2)return '남은 벌레 '+this.bugs.filter(b=>b.hp>0).length+' · '+this.plants.map(s=>s.name+(s.bloom?' 보호 완료':' 벌레 제거 중')).join(' · ');return this.plants.map(s=>s.name+(s.bloom?' 개화 완료':!s.active?' 심기 전':' 현재 '+s.temperature.toFixed(1)+'도 · 목표 '+this.band(s).join('–')+'도 · 덮개 '+(s.cover?'닫힘':'열림')+' · '+Math.round(s.progress/s.seconds[0]*100)+'%')).join(' · ');}
 get prompt(){
  if(this.room!==0)return carePrompt(this);
  if(this.messageLeft>0)return this.message;
  const t=this.target,r=this.climate;
  if(t?.part==='seed')return this.beds[t.id-1].name+' · 심고 적정 온도를 유지해요';
  if(t?.part==='cover'){const s=this.beds[t.id-1];return s.cover?'덮개 안은 온도가 천천히 변해요 · 온도가 벗어나면 열어서 다시 맞춰요':'초록 온도에 들어오면 덮어서 안정시켜요';}
  if(t?.part==='heater')return r.heater?'히터를 미리 꺼요 · 잔열로 온도가 더 올라요':'히터를 켜면 온실이 따뜻해져요';
  if(t?.part==='vent')return r.vent?'환기창을 닫으면 천천히 식어요':'환기창을 열면 빠르게 식어요';
  if(!this.plants.some(s=>s.active))return '원하는 화분에 다가가 심기를 눌러요';
  if(r.weather.warning)return r.weather.label+' · '+Math.ceil(r.weather.left)+'초 뒤';
  return '화분마다 온도가 달라요 · 초록 온도에서 덮어 유지해요';
 }
 act(){
  if(this.room!==0)return actGardenCare(this);
  if(!this.canAct)return false;const t=this.target,r=this.climate;this.actionWait=.22;this.turns++;
  if(t.part==='seed'){const s=this.beds[t.id-1];s.active=true;this.say(s.name+' · '+this.band(s).join('–')+'℃에서 꽃을 키워요',1.2);this.onEvent({type:'gardenSeed',id:s.id});}
  else if(t.part==='cover'){const s=this.beds[t.id-1];s.cover=!s.cover;this.onEvent({type:'gardenCover',id:s.id,on:s.cover});}
  else if(t.part==='heater'){r.heater=!r.heater;this.onEvent({type:'gardenHeat',room:this.room,on:r.heater});}
  else{r.vent=!r.vent;this.onEvent({type:'gardenVent',room:this.room,on:r.vent});}
  return true;
 }
 beginAction(){return this.act();}
 releaseAction(){this.working=false;}
 cancelAction(){this.working=false;}
 flash(){return callGardener(this);}
 tick(dt){
  this.actionWait=Math.max(0,this.actionWait-dt);tickGardenCare(this,dt);this.windowOpen=clamp(this.windowOpen+(this.rooms[0].vent?1:-1)*dt/.9,0,1);if(this.windowOpen<1e-6)this.windowOpen=0;else if(this.windowOpen>1-1e-6)this.windowOpen=1;
  this.rooms.forEach((r,i)=>{
   r.weather=gardenWeather(this.elapsed,i);r.outside=AMBIENT[i]+r.weather.offset;
   r.heat+=(Number(r.heater)-r.heat)*(1-Math.exp(-dt/1.0));
   r.velocity=r.heat*3.1+(r.outside-r.temperature)*(.045+(r.vent?.34:0));
   if(r.holdLeft>0){r.holdLeft=Math.max(0,r.holdLeft-dt);r.velocity=0;}else r.temperature=clamp(r.temperature+r.velocity*dt,10,38);
  });
  for(const s of this.beds){
   if(this.gardener?.id===s.id&&!this.gardener.complete)continue;
   const room=this.rooms[s.room];s.velocity=room.holdLeft>0?0:(room.temperature-s.temperature)*(s.cover?.008:1.25);s.temperature=clamp(s.temperature+s.velocity*dt,10,38);
   if(s.bloom){s.bloomAge+=dt;continue;}if(s.room!==0||!s.active)continue;
   if(this.growing(s)){s.stress=0;s.progress+=dt;}
   else{s.stress+=dt;if(s.stress>1)s.progress=Math.max(0,s.progress-dt*.6);}
   if(s.progress>=s.seconds[0]){s.bloom=true;s.bloomAge=0;s.progress=s.seconds[0];this.award(s.id,s.x,245);if(s.room===this.room)this.say(s.name+'에 꽃이 피었어요',1.1);this.onEvent({type:'gardenBloom',id:s.id});}
  }
  tickGardener(this,dt);
 }
 restoreResult(rec){super.restoreResult(rec);for(const s of this.beds)if(this.clueSources.has(s.id)){s.active=true;s.bloom=true;s.stage=0;s.progress=s.seconds[0];s.bloomAge=2;if(s.room===1)s.pollinate=3;}for(const b of this.bugs)if(this.clueSources.has(b.source))b.hp=0;}
}
