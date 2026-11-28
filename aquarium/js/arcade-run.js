import {PLACES} from './places.js?v295';
import {CHARACTERS} from './config.js';
import {arcadeCharacterSetupId,canResumeArcade} from './arcade-state.js?v254';
import {isRetiredPlace} from './retired-places.js?v227';

export const arcadePlaces=()=>PLACES.filter(place=>place.playable);
export const COINS_PER_GAME=9;
export const POINTS_PER_COIN=10;
export const coinPoints=coins=>coins*POINTS_PER_COIN;
export const arcadeMenuExclusions=mode=>mode==='practice'?['score','items','replay']:mode==='challenge'?['items','restart','replay']:[];
const saveKey='ptb_aquarium_arcade_v1';
const knownPlace=id=>arcadePlaces().some(place=>place.id===id);
const newId=()=>globalThis.crypto.randomUUID();
const countCoins=value=>Math.max(0,Math.min(COINS_PER_GAME,Math.trunc(Number(value)||0)));
// Runs and local/shared records retain coin counts. Score displays convert them to points.
const totalOf=games=>Object.values(games).reduce((total,game)=>total+game.coins,0);

export function arcadePlayer(value){
 const name=String(value?.name??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f<>]/g,'').trim().slice(0,12);
 return {character:CHARACTERS.some(c=>c.id===value?.character)?value.character:CHARACTERS[0].id,name:name||'플레이어'};
}
function readSaved(storage){
 try{
  const data=JSON.parse(storage.getItem(saveKey)||'null');
  return data?.version===1&&Array.isArray(data.records)?data:{version:1,run:null,records:[]};
 }catch{return {version:1,run:null,records:[]};}
}

export class ArcadeRuns{
 constructor(storage,{createId=newId,clock=()=>new Date()}={}){
  this.storage=storage;this.createId=createId;this.clock=clock;this.refresh();
 }
 get run(){return this.data.run;}
 get records(){return this.data.records;}
 get total(){return totalOf(this.run?.games||{});}
 get maximum(){return (this.run?.places.length??arcadePlaces().length)*COINS_PER_GAME;}
 get completed(){return Object.values(this.run?.games||{}).filter(game=>!game.abandoned).length;}
 get characterSetupId(){return arcadeCharacterSetupId(this.data);}
 get canResume(){return canResumeArcade(this.data);}
 get canRecord(){return !!this.run?.places.length&&this.completed===this.run.places.length;}

 save(){
  try{this.storage.setItem(saveKey,JSON.stringify(this.data));this.unsaved=false;}
  catch{this.unsaved=true;}
 }
 refresh(){
  if(this.unsaved)return;
  this.data=readSaved(this.storage);
  const run=this.run;
  if(!Array.isArray(run?.places)||!run.places.some(isRetiredPlace))return;
  run.places=run.places.filter(place=>!isRetiredPlace(place));
  run.games=Object.fromEntries(Object.entries(run.games??{}).filter(([place])=>!isRetiredPlace(place)));
  if(isRetiredPlace(run.active?.place))run.active=null;
  this.recordCompletion();
  this.save();
 }
 start(player){
  this.refresh();
  this.data.run={id:this.createId(),player:arcadePlayer(player),places:arcadePlaces().map(place=>place.id),games:{},active:null,ticket:null};
  if(player.registrationKey)this.run.registrationKey=player.registrationKey;
  this.save();
  return this.run;
 }
 canPlay(place){
  return !!this.run&&!this.run.active&&this.run.places.includes(place)&&knownPlace(place)&&!this.run.games[place];
 }
 begin(place){
  this.refresh();
  if(!this.canPlay(place))return false;
  this.run.active={place,coins:0};
  this.save();
  return true;
 }
 progress(place,coins){
  const active=this.run?.active,wanted=countCoins(coins);
  if(active?.place!==place||active.coins>=wanted)return;
  active.coins=wanted;
  this.save();
 }
 ticket(id,ticket){
  this.refresh();
  const run=this.run;
  if(run?.id!==id||run.ticket===ticket)return;
  run.ticket=ticket;
  this.save();
 }
 finish(place,{abandoned=false}={}){
  const run=this.run;
  if(run?.active?.place!==place)return false;
  run.games[place]={coins:run.active.coins,abandoned};
  run.active=null;
  this.recordCompletion();
  this.save();
  return true;
 }
 recordCompletion(){
  const run=this.run;
  if(!this.canRecord||this.records.some(record=>record.id===run.id))return;
  this.records.unshift({id:run.id,player:run.player,finishedAt:this.clock().toISOString(),score:this.total,maximum:this.maximum,
   games:run.places.map(id=>({place:id,coins:run.games[id].coins})),ticket:run.ticket,shared:false,
   ...(run.registrationKey?{registrationKey:run.registrationKey}:{})});
 }
 markShared(id){
  this.refresh();
  const record=this.records.find(row=>row.id===id);
  if(!record)return;
  record.shared=true;
  this.save();
 }
}
