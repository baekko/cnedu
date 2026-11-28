import {MEMORY,normalizeMemoryPlan,normalizeMemorySources} from './memory-core.js?v224';
import {CINEMA} from './cinema-core.js?v268';
import {normalizeCinemaPlan} from './cinema-films.js?v204-final40';
import {GYM} from './gym-core.js?v268';
import {withoutRetiredPlaces} from './retired-places.js?v227';
import {DATACENTER} from './datacenter-core.js?v268';
import {CITYHALL,normalizeCityPlan} from './cityhall-core.js';
import {normalizeCityPlan as normalizeLegacyCityPlan} from './cityhall-legacy.js';
import {CONSERVATION} from './conservation-core.js?v268';
import {legacySources,normalizeClueRewards,restoreSources} from './clue-order.js';
import {PHOTO} from './photo-core.js';
import {GARDEN} from './garden-core.js?v268';
import {DETECTIVE} from './detective-core.js';
import {MONASTERY} from './monastery-core.js';
import {DESSERT,PASTRIES} from './dessert-core.js';
import {AI,BODIES,POWERS,INKS} from './ai-core.js';
import {TEMPLE} from './temple-core.js?v268';
import {ZOO} from './zoo-core.js?v=155';
import {LITERATURE} from './literature-core.js';
import {DREAM} from './dream-core.js?v268';
import {NEWSPAPER} from './newspaper-core.js';
import {LANGUAGE} from './language-core.js';
import {WRITER} from './writer-core.js?v=155';
import { CHARACTERS, PUZZLE, GAME } from './config.js';
import {SPACE} from './space-core.js';
import {ROBOT} from './robot-core.js';
import {PURSUIT,getPursuitCity,normalizePursuitRunPlan} from './pursuit-game.js?v243';
import {POSTAL,normalizePostalPlan} from './postal-core.js?v268';
import {HOSPITAL,normalizeHospitalPlan,normalizeHospitalReports} from './hospital-core.js?v301';
import {unlockedPlace,placeInfo,PLACES} from './places.js?v295';
export const JOURNEY_KEY='ptb_journey_v1';
const journeyPrefixes=['', 'museum_trial_', 'exchange_trial_', 'temple_trial_', 'robot_trial_', 'space_trial_', 'writer_trial_', 'language_trial_', 'newspaper_trial_', 'dream_trial_', 'zoo_trial_', 'literature_trial_', 'ai_trial_', 'dessert_trial_', 'detective_trial_', 'monastery_trial_', 'photo_trial_', 'garden_trial_', 'datacenter_trial_', 'conservation_trial_', 'cityhall_trial_', 'science_trial_', 'gym_trial_', 'cinema_trial_', 'memory_trial_', 'travel_trial_', 'pursuit_trial_', 'postal_trial_', 'hospital_trial_'];
export function resetJourney(storage){
  // A new opening starts a new adventure, including separately saved demo links.
  try{for(const prefix of journeyPrefixes){
    storage.setItem(prefix+JOURNEY_KEY,'null');storage.setItem(prefix+GAME.storageKey,'{}');
  }return true;}catch{return false;}
}
// Older direct links have separate saves. Visited places remain accessible
// across those links; only an explicit new adventure clears their history.
export function recoverJourneyUnlocks(storage,journey){
 if(!journey)return null;
 let last=PLACES.findIndex(p=>p.id===unlockedPlace(journey));
 for(const prefix of journeyPrefixes){
  const saved=readJourney({getItem:key=>storage.getItem(prefix+key)});
  if(saved)last=Math.max(last,PLACES.findIndex(p=>p.id===unlockedPlace(saved)));
 }
 return {...journey,unlockedThrough:PLACES[last].id};
}
export function visitPlace(journey,place,character='haru',playerName='플레이어'){
 const info=placeInfo(place),key=info.record||info.id;
 const next={...(journey||{}),character:journey?.character||character,playerName:journey?.playerName||playerName,stage:info.id,phase:'briefing'};
 if(info.id!=='aquarium')next[key]={clues:[],...(journey?.[key]||{}),phase:'title',...(info.id==='gym'?{edition:'dodgeball'}:info.id==='cinema'?{edition:'moviequiz'}:{})};
 next.unlockedThrough=unlockedPlace(next);
 return next;
}
export function readJourney(storage){
  try{
    const data=withoutRetiredPlaces(JSON.parse(storage.getItem(JOURNEY_KEY)||'null'));
    if(!data||!CHARACTERS.some(c=>c.id===data.character))return null;
    // Keep past travel records while using a fresh pursuit record for the same stop.
    if(data.stage==='travel')data.stage='pursuit';
    if(data.unlockedThrough==='travel'||['title','briefing','result'].includes(data.travel?.phase))data.unlockedThrough='pursuit';
    const journey={character:data.character,clueSources:[...restoreSources(data)],clueRule:'count-v1',...(data.aquariumBoarded===true?{aquariumBoarded:true}:{}),...(normalizePlayerName(data.playerName)?{playerName:normalizePlayerName(data.playerName)}:{}),...(data.museum?{museum:readMuseumRecord(data.museum)}:{}),...(data.history?{history:readHistoryRecord(data.history)}:{}),...(data.memory?{memory:readMemoryRecord(data.memory)}:{}),...(data.travel?{travel:readTravelRecord(data.travel)}:{}),...(data.pursuit?{pursuit:readPursuitRecord(data.pursuit)}:{}),...(data.hospital?{hospital:readHospitalRecord(data.hospital)}:{}),...(data.postal?{postal:readPostalRecord(data.postal)}:{}),...(data.cinema?{cinema:{...readFieldRecord(data.cinema,CINEMA.duration,CINEMA.flashes),edition:'moviequiz',runPlan:normalizeCinemaPlan(data.cinema.runPlan),answered:Math.max(0,Math.min(9,Number(data.cinema.answered)||0))}}:{}),...(data.gym?{gym:{...readFieldRecord(data.gym,GYM.duration,GYM.flashes),edition:'dodgeball'}}:{}),...(data.photo?{photo:readFieldRecord(data.photo,PHOTO.duration,PHOTO.flashes)}:{}),...(data.datacenter?{datacenter:readFieldRecord(data.datacenter,DATACENTER.duration,DATACENTER.flashes)}:{}),...(data.conservation?{conservation:readFieldRecord(data.conservation,CONSERVATION.duration,CONSERVATION.flashes)}:{}),...(data.cityhall?{cityhall:readCityHallRecord(data.cityhall)}:{}),...(data.garden?{garden:readFieldRecord(data.garden,GARDEN.duration,GARDEN.flashes)}:{}),...(data.monastery?{monastery:readMonasteryRecord(data.monastery)}:{}),...(data.detective?{detective:readDetectiveRecord(data.detective)}:{}),...(data.dessert?{dessert:readDessertRecord(data.dessert)}:{}),...(data.ai?{ai:readAIRecord(data.ai)}:{}),...(data.literature?{literature:readLiteratureRecord(data.literature)}:{}),...(data.zoo?{zoo:readZooRecord(data.zoo)}:{}),...(data.dream?{dream:readDreamRecord(data.dream)}:{}),...(data.newspaper?{newspaper:readNewspaperRecord(data.newspaper)}:{}),...(data.language?{language:readLanguageRecord(data.language)}:{}),...(data.writer?{writer:readWriterRecord(data.writer)}:{}),...(data.space?{space:readSpaceRecord(data.space)}:{}),...(data.robot?{robot:readRobotRecord(data.robot)}:{}),...(data.temple?{temple:readTempleRecord(data.temple)}:{}),...(data.exchange?{exchange:readExchangeRecord(data.exchange)}:{}),stage:data.stage==='robot'?(data.robot||data.temple?.survived===true||['robot','space','writer','language','newspaper','dream','zoo','literature','ai','dessert','detective','monastery','photo','garden','datacenter','conservation','cityhall','gym','cinema','memory','pursuit','postal','hospital'].includes(data.unlockedThrough)?'robot':'temple'):data.stage==='observatory'?'history':['art','history','exchange','temple','space','writer','language','newspaper','dream','zoo','literature','ai','dessert','detective','monastery','photo','garden','datacenter','conservation','cityhall','gym','cinema','memory','pursuit','postal','hospital'].includes(data.stage)?data.stage:'aquarium',phase:data.phase==='result'?'result':'briefing',elapsed:Math.min(GAME.duration,Math.max(0,Number(data.elapsed)||0)),survived:data.survived===true,hintsSeen:Math.min(3,Math.max(0,Math.floor(Number(data.hintsSeen)||0)))};
    journey.unlockedThrough=unlockedPlace({...journey,unlockedThrough:data.unlockedThrough});
    return journey;
  }catch{return null;}
}
export function saveJourney(storage,journey){
  try{storage.setItem(JOURNEY_KEY,JSON.stringify(journey?{...journey,unlockedThrough:unlockedPlace(journey)}:null));return true;}catch{return false;}
}
export function normalizeAnswer(value){return String(value).normalize('NFKC').trim();}
export function checkAnswer(value,answer=PUZZLE.answer){return normalizeAnswer(value)===answer;}
export function hintView(count,hints=PUZZLE.hints){
  const seen=Math.min(hints.length,Math.max(1,count));
  return {messages:hints.slice(0,seen),complete:seen===hints.length};
}

export function readMuseumRecord(data={}){return {...(Array.isArray(data.runPlan)&&data.runPlan.length===9&&data.runPlan.every(n=>Number.isInteger(n)&&n>=0&&n<10000)?{runPlan:[...data.runPlan]}:{}),phase:['title','briefing','result'].includes(data.phase)?data.phase:'title',clues:normalizeClueRewards(data.clues),clueSources:[...restoreSources(data)],clueRule:'count-v1',elapsed:Math.max(0,Math.min(40,Number(data.elapsed)||0)),survived:data.survived===true,hintsSeen:Math.max(0,Math.min(3,Math.floor(Number(data.hintsSeen)||0))) };}

function readCityHallRecord(data){
 const saved=data.run,updated=[2,3,4].includes(saved?.rules);
 const plan=(updated?normalizeCityPlan:normalizeLegacyCityPlan)(saved?.plan);
 const choices=saved?.choices,phase=saved?.phase,max=updated?3:2;
 const valid=plan&&Array.isArray(choices)&&choices.length<=CITYHALL.rounds&&choices.every(id=>Number.isInteger(id)&&id>=0&&id<=max)&&['report','review','complete'].includes(phase);
 const run=valid?{plan,choices:[...choices],phase,...(saved.deskOpened===true?{deskOpened:true}:{})}:null;
 if(run&&updated){
  run.rules=saved.rules;run.deskOpened=saved.deskOpened===true;run.introPage=saved.introPage===1?1:0;
  run.adviceTurn=Number.isInteger(saved.adviceTurn)&&saved.adviceTurn>=0&&saved.adviceTurn<CITYHALL.rounds?saved.adviceTurn:null;
 }
 return {...readMuseumRecord(data),...(data.phase==='summary'&&run?.phase==='complete'?{phase:'summary'}:{}),elapsed:0,run};
}

export function readHistoryRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(60,Number(data.elapsed)||0))};}

export function readExchangeRecord(data={}){const {clueSources,clueRule,...base}=readMuseumRecord(data);return {...base,clues:[...new Set((Array.isArray(data.clues)?data.clues:[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=9))].sort((a,b)=>a-b),run:data.run&&typeof data.run==='object'?data.run:null};}

export function normalizePlayerName(value){return String(value??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f<>]/g,'').trim().slice(0,12);}

export function readTempleRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(TEMPLE.duration,Number(data.elapsed)||0)),reachedIthaca:data.reachedIthaca===true,delays:Math.max(0,Math.floor(Number(data.delays)||0))};}

export function readRobotRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(ROBOT.duration,Number(data.elapsed)||0))};}

export function readSpaceRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(SPACE.duration,Number(data.elapsed)||0))};}

export function readWriterRecord(data={}){return {...readMuseumRecord(data),reachedCastle:data.reachedCastle===true,elapsed:Math.max(0,Math.min(WRITER.duration,Number(data.elapsed)||0))};}

export function readLanguageRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(LANGUAGE.duration,Number(data.elapsed)||0))};}

export function readNewspaperRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(NEWSPAPER.duration,Number(data.elapsed)||0))};}

export function readDreamRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(DREAM.duration,Number(data.elapsed)||0))};}

export function readLiteratureRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(LITERATURE.duration,Number(data.elapsed)||0))};}

export function readZooRecord(data={}){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(ZOO.duration,Number(data.elapsed)||0))};}

export function readAIRecord(data={}){if(data.edition!=='studio')return {...readMuseumRecord({phase:'title'}),edition:'studio'};return {...readMuseumRecord(data),clueSources:Array.isArray(data.clueSources)?[...restoreSources(data)]:legacySources(data).map(source=>source-1),edition:'studio',album:(Array.isArray(data.album)?data.album:[]).filter(w=>w&&BODIES.includes(w.body)&&POWERS.includes(w.part)&&(!w.ink||INKS.includes(w.ink))).slice(-18).map(w=>({body:w.body,part:w.part,ink:w.ink||null,good:w.good===true,...(Number.isInteger(w.powerLevel)?{powerLevel:Math.max(0,Math.min(2,w.powerLevel))}:{}),...(Number.isInteger(w.inkLevel)?{inkLevel:Math.max(0,Math.min(2,w.inkLevel))}:{})})),elapsed:Math.max(0,Math.min(AI.duration,Number(data.elapsed)||0))};}

export function readDessertRecord(data={}){return {...readMuseumRecord(data),clueSources:Array.isArray(data.clueSources)?[...restoreSources(data)]:legacySources(data).map(source=>'dessert-box-'+source),orderStart:Math.max(0,Math.min(2,Math.floor(Number(data.orderStart)||0))),elapsed:Math.max(0,Math.min(DESSERT.duration,Number(data.elapsed)||0)),pastries:(Array.isArray(data.pastries)?data.pastries:[]).filter(k=>PASTRIES.some(p=>p.id===k)).slice(0,9)};}

export function readDetectiveRecord(data={}){return {...readMuseumRecord(data),clueSources:Array.isArray(data.clueSources)?[...restoreSources(data)]:[...new Set((Array.isArray(data.evidence)?data.evidence:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<9))],flashes:Math.max(0,Math.min(DETECTIVE.flashes,Number.isInteger(data.flashes)?data.flashes:DETECTIVE.flashes)),elapsed:Math.max(0,Math.min(DETECTIVE.duration,Number(data.elapsed)||0)),room:Math.max(0,Math.min(2,Math.floor(Number(data.room)||0))),caught:Math.max(0,Math.min(3,Math.floor(Number(data.caught)||0))),evidence:[...new Set((Array.isArray(data.evidence)?data.evidence:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<9))]};}
export function readMonasteryRecord(data={}){return {...readMuseumRecord(data),clueSources:Array.isArray(data.clueSources)?[...restoreSources(data)]:Array.isArray(data.lit)&&data.lit.length?[...new Set(data.lit.filter(n=>Number.isInteger(n)&&n>=1&&n<=9))]:[...restoreSources(data)],elapsed:Math.max(0,Math.min(MONASTERY.duration,Number(data.elapsed)||0)),mistakes:Math.max(0,Math.floor(Number(data.mistakes)||0)),flashes:Math.max(0,Math.min(MONASTERY.flashes,Number.isInteger(data.flashes)?data.flashes:MONASTERY.flashes)),lit:[...new Set((Array.isArray(data.lit)?data.lit:[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=9))]};}

export function readFieldRecord(data={},duration=100,maxFlashes=2){return {...readMuseumRecord(data),elapsed:Math.max(0,Math.min(duration,Number(data.elapsed)||0)),room:Math.max(0,Math.min(2,Math.floor(Number(data.room)||0))),flashes:Number.isFinite(Number(data.flashes))?Math.max(0,Math.min(maxFlashes,Math.floor(Number(data.flashes)))):maxFlashes};}

function readHospitalRecord(data){
 const runPlan=normalizeHospitalPlan(data.runPlan);
 return {...readFieldRecord(data,HOSPITAL.duration,HOSPITAL.flashes),
  ...(runPlan?{runPlan}:{}),reports:normalizeHospitalReports(data.reports)};
}

function readPostalRecord(data){
 const runPlan=normalizePostalPlan(data.runPlan);
 const lettersByRound=runPlan?POSTAL.rounds.map(round=>round.letters):[3,3,3];
 const reports=Array.isArray(data.reports)?data.reports.slice(0,lettersByRound.length).filter((report,index)=>{
  const letters=lettersByRound[index];
  return typeof report?.village==='string'&&['correct','wrong','unmailed'].every(key=>Number.isInteger(report[key])&&report[key]>=0&&report[key]<=letters)
   &&report.correct+report.wrong+report.unmailed===letters;
 }):[];
 return {...readFieldRecord(data,POSTAL.duration,POSTAL.flashes),...(runPlan?{runPlan}:{}),reports};
}

export function readTravelRecord(data={}){
 const {winner,scores,visits}=data.result||{};
 const pair=(values,max=Infinity)=>Array.isArray(values)&&values.length===2&&values.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=max);
 const result=[-1,0,1].includes(winner)&&pair(scores)&&pair(visits,11)?{winner,scores:[...scores],visits:[...visits]}:null;
 const {positions,coins,owners}=data.finalBoard||{};
 const finalBoard=result&&pair(positions,11)&&pair(coins)&&Array.isArray(owners)&&owners.length===12&&owners.every(n=>[-1,0,1].includes(n))
  ?{positions:[...positions],coins:[...coins],owners:[...owners]}:null;
 return {...readFieldRecord(data,100,0),courseIndex:Number.isInteger(data.courseIndex)&&data.courseIndex>=0&&data.courseIndex<3?data.courseIndex:0,result,finalBoard};
}

const LEGACY_PURSUIT_RETRY='retry-v1';
export const PURSUIT_TRACE_RULE='attempts-v1';
export function readPursuitRecord(data={}){
 const elapsed=Number(data.elapsed);
 const base=readFieldRecord({...data,elapsed:Number.isFinite(elapsed)?elapsed:0,runPlan:undefined},Infinity,PURSUIT.flashes);
 const limited=data.traceRule===PURSUIT_TRACE_RULE;
 const retries=limited||data.traceRule===LEGACY_PURSUIT_RETRY;
 const runPlan=normalizePursuitRunPlan(data.runPlan,{allowRetired:true});
 const trace=[];
 const limit=limited?PURSUIT.attempts:PURSUIT.rounds*(retries?7:1);
 const tried=new Set();
 let solved=0,mistakes=0;
 for(const leg of Array.isArray(data.trace)?data.trace.slice(0,limit):[]){
  if(!leg||!getPursuitCity(leg.city)||!getPursuitCity(leg.expected)||typeof leg.correct!=='boolean'||leg.correct!==(leg.city===leg.expected))break;
  if(runPlan&&leg.expected!==runPlan[retries?solved:trace.length])break;
  if(limited&&mistakes>=2)break;
  if(retries&&(solved===PURSUIT.rounds||tried.has(leg.city)||tried.size===6&&!leg.correct))break;
  trace.push({city:leg.city,expected:leg.expected,correct:leg.correct});
  if(leg.correct){solved++;tried.clear();}
  else {mistakes++;tried.add(leg.city);}
 }
 const storedRound=Math.max(1,Math.min(PURSUIT.rounds,Math.floor(Number(data.round)||1)));
 const mostRecentRound=Math.min(PURSUIT.rounds,solved+(trace.at(-1)?.correct?0:1));
 const round=retries?Math.max(mostRecentRound,Math.min(solved+1,storedRound)):Math.max(trace.length,storedRound);
 const attemptsUsed=Math.max(trace.length,Math.min(PURSUIT.attempts,Math.floor(Number(data.attemptsUsed)||0)));
 let captured=null;
 if(limited){
  if(solved===PURSUIT.rounds&&data.captured===true)captured=true;
  else if(data.captured===false&&(mistakes>=2||attemptsUsed===PURSUIT.attempts))captured=false;
 }else if(retries){
  if(solved===PURSUIT.rounds&&data.captured===true)captured=true;
 }else if(round===PURSUIT.rounds&&typeof data.captured==='boolean')captured=data.captured;
 return {...base,room:0,...(runPlan?{runPlan}:{}),...(retries?{traceRule:data.traceRule}:{}),
  ...(limited?{attemptsUsed}:{}),round,captured,trace};
}
export function readMemoryRecord(data={}){
 const runPlan=normalizeMemoryPlan(data.runPlan);
 return {...readFieldRecord(data,MEMORY.duration,MEMORY.flashes),runPlan,
  clueSources:normalizeMemorySources(data.clueSources,runPlan),
  revisits:data.revisits===0?0:MEMORY.revisits};
}
