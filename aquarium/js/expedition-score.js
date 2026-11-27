import {PLACES,placeId} from './places.js?v295';

export const SCORE_KEY='ptb_expedition_scores_v1';
export const STAGE_MAX=15;
const ids=new Set(PLACES.map(p=>p.id));
const clamp=(value,max)=>Math.max(0,Math.min(max,Math.floor(Number(value)||0)));
export const puzzlePoints=hints=>[6,4,2,0][clamp(hints,3)];
export const cluePoints=clues=>typeof clues==='number'?clamp(clues,9):Math.min(9,new Set(Array.from(clues||[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=9)).size);
const empty=()=>({played:false,game:0,solved:false,hints:0});
function record(value={}){return {played:value.played===true,game:clamp(value.game,9),solved:value.solved===true,hints:clamp(value.hints,3)};}
export function scoreRow(place,value={}){
 const r=record(value),problem=r.solved?puzzlePoints(r.hints):0;
 return {place:placeId(place),...r,problem,total:r.game+problem};
}
export function readScores(storage){
 try{const data=JSON.parse(storage.getItem(SCORE_KEY)||'{}');return Object.fromEntries(PLACES.map(p=>[p.id,record(data?.stages?.[p.id])]));}
 catch{return Object.fromEntries(PLACES.map(p=>[p.id,empty()]));}
}
export class ExpeditionScores{
 constructor(storage,onError=()=>{}){this.storage=storage;this.onError=onError;this.stages=readScores(storage);}
 get(place){const id=placeId(place);return scoreRow(id,this.stages[id]);}
 rows(){return PLACES.map(p=>this.get(p.id));}
 get total(){return this.rows().reduce((sum,r)=>sum+r.total,0);}
 change(place,update){
  const id=placeId(place);if(!ids.has(id))return false;
  const latest=readScores(this.storage);
  // Hints can only increase, including after a second tab writes an old view.
  for(const p of PLACES){const a=latest[p.id],b=this.stages[p.id];a.hints=Math.max(a.hints,b.hints);a.solved=a.solved||b.solved;}
  const current=latest[id],next=record(update({...current}));next.hints=Math.max(current.hints,next.hints);next.solved=current.solved||next.solved;
  latest[id]=next;this.stages=latest;
  try{this.storage.setItem(SCORE_KEY,JSON.stringify({version:1,stages:latest}));return true;}
  catch{this.onError();return false;}
 }
 finish(place,clues){return this.change(place,r=>({...r,played:true,game:cluePoints(clues)}));}
 hint(place,level){return this.change(place,r=>({...r,hints:Math.max(r.hints,clamp(level,3))}));}
 solve(place){return this.change(place,r=>({...r,solved:true}));}
 importJourneys(storage){
  // Migrate before a direct link or a new adventure resets its journey save.
  const prefixes=['',...PLACES.map(p=>(p.id==='art'?'museum':p.id)+'_trial_')];
  for(const prefix of prefixes){
   let data;try{data=JSON.parse(storage.getItem(prefix+'ptb_journey_v1')||'null');}catch{continue;}if(!data||typeof data!=='object')continue;
   for(const p of PLACES){const old=p.id==='aquarium'?data:data[p.record||p.id];if(!old||typeof old!=='object')continue;
    const level=clamp(old.hintsSeen,3);if(level>this.get(p.id).hints)this.hint(p.id,level);
    if(!this.get(p.id).played&&old.phase==='result'&&Array.isArray(old.clues))this.finish(p.id,old.clues);
   }
  }
 }
}

// Temporary third hints are kept outside the individual game rules/art inputs.
export function threePuzzleHints(puzzle){
 const hints=[...(puzzle.hints||[])].slice(0,3);
 while(hints.length<2)hints.push('조합한 그림에서 눈에 띄는 특징을 살펴보세요.');
 if(hints.length<3)hints.push(`정답은 ‘${puzzle.answer}’입니다.`);
 return hints;
}
