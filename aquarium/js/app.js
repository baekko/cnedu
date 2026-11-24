import {connectTitleModes,showStartupError} from './opening.js?v252';
import {PursuitGame,PURSUIT} from './pursuit-game.js?v252';
import {PursuitRenderer,loadPursuitAssets,pursuitMapHit,pursuitClueHit,pursuitStatus,syncPursuitStats} from './pursuit-renderer.js?v245';
import {MemoryGame,MEMORY} from './memory-core.js?v224';
import {MemoryRenderer,loadMemoryAssets,syncMemoryStats} from './memory-renderer.js?v245';
import {ExpeditionScores,threePuzzleHints} from './expedition-score.js?v231';
import {headerActionsHTML,statusMenuHTML,syncPlaceHeaders,scoresHTML,emptyInventoryHTML} from './expedition-shell.js?v249';
import {CINEMA,CinemaGame} from './cinema-core.js?v204-final40';
import {CinemaRenderer,loadCinemaAssets} from './cinema-renderer.js?v245';
import {CinemaUI,syncCinemaStats} from './cinema-ui.js?v204-final40';
import {GYM,GymGame} from './gym-core.js?v212';
import {GymRenderer,loadGymAssets} from './gym-renderer.js?v245';
import {isRetiredPlace,isWithdrawnResearchPlace} from './retired-places.js?v227';
import {CLUE_PUZZLES,prepareCluePuzzle} from './clue-puzzles.js?v243';
import {DATACENTER,DataCenterGame} from './datacenter-core.js';
import {DataCenterRenderer,loadDataCenterAssets} from './datacenter-renderer.js?v245';
import {CityHallGame,CITYHALL} from './cityhall-core.js?v=144';
import {CityHallGame as LegacyCityHallGame} from './cityhall-legacy.js';
import {CityHallUI,syncCityStats,syncCityAction,citySummaryHTML} from './cityhall-ui.js?v252';
import {CityHallRenderer,loadCityHallAssets} from './cityhall-renderer.js?v245';
import {CONSERVATION,ConservationGame} from './conservation-core.js';
import {ConservationRenderer,loadConservationAssets} from './conservation-renderer.js?v245';
import {WorkshopUI} from './workshop-ui.js';
import {instructionHTML} from './instructions.js?v252';
import {briefingCopy} from './briefing-copy.js';
import {restoreSources} from './clue-order.js';
import {CLUE_CARD_URL,cardPositionLabel,setCoinRewards} from './clue-card-art.js?v245';
import {PHOTO,PhotoGame,PHOTO_ROOMS} from './photo-core.js';
import {PhotoRenderer,loadPhotoAssets} from './photo-renderer.js?v245';
import {GARDEN,GardenGame,GARDEN_ROOMS} from './garden-core.js';
import {GardenRenderer,loadGardenAssets} from './garden-renderer.js?v245';
import {MONASTERY,MonasteryGame} from './monastery-core.js?v228';
import {loadMonasteryAssets,MonasteryRenderer} from './monastery-renderer.js?v228';
import {createWriterCardCollider} from './writer-card-collision.js?v=155';
import {createWriterGiantCollider} from './writer-giant-collision.js?v=155';
import {DETECTIVE,DetectiveGame} from './detective-core.js';
import {DetectiveRenderer,loadDetectiveAssets} from './detective-renderer.js?v245';
import {createTutorial} from './play-tutorials.js?v252';
import {TutorialFinance} from './tutorial-finance.js?v249';
import {TutorialChrome} from './tutorial-chrome.js?v252';
import {TutorialPlayback} from './tutorial-playback.js';
import {TUTORIAL_COPY} from './tutorial-pages.js?v249';
import {breakBriefSentences} from './brief-sentences.js';
import {POWER_WORDS,ENV_WORDS} from './ai-inference.js';
import {DessertFinishUI} from './dessert-finish-ui.js';
import {DESSERT,DessertGame,PASTRIES} from './dessert-core.js';
import {loadDessertAssets,DessertRenderer} from './dessert-renderer.js?v245';
import {AI,AIGame,LABELS} from './ai-core.js';
import {loadAIAssets,AIRenderer} from './ai-renderer.js?v245';
import {ZOO,ZooGame,ZOO_ZONES} from './zoo-core.js?v=155';
import {loadZooAssets,ZooRenderer} from './zoo-renderer.js?v245';
import {LITERATURE,LiteratureGame,BOOKS} from './literature-core.js?v249';
import {loadLiteratureAssets,LiteratureRenderer} from './literature-renderer.js?v249';
import {DREAM,DreamGame,DREAM_ROOMS} from './dream-core.js';
import {loadDreamAssets,DreamRenderer} from './dream-renderer.js?v245';
import {NEWSPAPER,NewspaperGame} from './newspaper-core.js';
import {loadNewspaperAssets,NewspaperRenderer} from './newspaper-renderer.js?v245';
import {LANGUAGE,LanguageGame,LAB_ROOMS} from './language-core.js';
import {loadLanguageAssets,LanguageRenderer} from './language-renderer.js?v245';
import {WRITER,WriterGame,WRITER_CARDS,STORIES,VINE,GIANT} from './writer-core.js?v214';
import {loadWriterAssets,WriterRenderer} from './writer-renderer.js?v245';
import {SPACE,SpaceGame} from './space-core.js';
import {loadSpaceAssets,SpaceRenderer} from './space-renderer.js?v245';
import {createSpaceSpriteCollider} from './space-collision.js';
import {ROBOT,RobotGame,partInfo,robotTypeFor} from './robot-core.js';
import {loadRobotAssets,RobotRenderer} from './robot-renderer.js?v245';
import {TEMPLE,TempleGame} from './temple-core.js?v=157';
import {DirectionPadState,padDirection} from './direction-pad.js';
import {loadTempleAssets,TempleRenderer} from './temple-renderer.js?v245';
import {PLACES,placeId,placeInfo,replayPlaces,nextPlace as followingPlace,placeIcon} from './places.js?v231';
import {previousScene,installBackNavigation} from './navigation.js?v231';
import {icon,applyIcons} from './icons.js?v245';
import {FinishTransition,keepsClues,canSolveCollection} from './finish.js';
import {drawExplorer} from './heroes.js?v=155';
import {GameLayout,sceneGeometry} from './layout.js?v214';
import {EXCHANGE,ExchangeGame,cardPrice} from './exchange-core.js';
import {loadExchangeAssets,ExchangeRenderer} from './exchange-renderer.js?v=155';
import {ExchangeUI} from './exchange-ui.js?v249';
import {HISTORY,HistoryGame} from './history-core.js?v=185';
import {loadHistoryAssets,HistoryRenderer} from './history-renderer.js?v245';
import {MUSEUM,COLORS,MuseumGame} from './museum-core.js';
import {loadMuseumAssets,MuseumRenderer} from './museum-renderer.js?v245';
import { GAME, CHARACTERS, PUZZLE } from './config.js?v214';
import { AquariumGame, readProgress, saveProgress, puzzleTiles } from './core.js';
import { loadAssets, Renderer, drawSubmarine, createSpriteCollider } from './renderer.js?v245';

import { readJourney, saveJourney, resetJourney, recoverJourneyUnlocks, visitPlace, checkAnswer, hintView, normalizePlayerName, PURSUIT_TRACE_RULE } from './journey.js?v243';
import { loadMotion, SpritePlayer } from './motions.js';

import {ArcadeRuns,arcadeMenuExclusions,arcadePlaces,COINS_PER_GAME} from './arcade-run.js?v252';
import {ARCADE_SCREENS,drawArcadeMap,drawArcadeRecords,fillArcadeRecords,drawArcadeResult,showArcadeStatus,showArcadeShareStatus,popArcadeCoins} from './arcade-view.js?v252';
import {drawArcadeChoices} from './arcade-choice-view.js?v252';
import {drawPlaceEntry} from './place-entry-view.js?v251';
import {arcadeCoinPosition} from './arcade-coin-position.js?v246';
import {getArcadeTicket,loadSharedArcadeRecords,registerArcadePlayer,shareArcadeRecord} from './arcade-share.js?v252';
import {ModeCharacters} from './mode-characters.js?v252';
const $ = id => document.getElementById(id);
$('common-header-actions').innerHTML=headerActionsHTML();
for(const [id,name] of [['shoot-button','slingshot'],['jump-button','jump'],['hammer-button','hammer']])$(id).innerHTML=icon(name);
applyIcons(document);
const soundOff = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5 5 9H2v6h3l5 4Z"/><path d="m16 9 6 6m0-6-6 6"/></svg>';
const soundOn = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5 5 9H2v6h3l5 4Z"/><path d="M14 8q5 4 0 8m3-11q8 7 0 14"/></svg>';
let storage;
try { storage = window.localStorage; } catch { storage = { getItem: () => null, setItem: () => { throw new Error('storage unavailable'); } }; }
const publicGamePath='/aquarium/';
const publicGame=['/aquarium',publicGamePath,publicGamePath+'index.html'].includes(location.pathname);
if(publicGame&&(location.pathname!==publicGamePath||location.search||location.hash)){
 history.replaceState(history.state,'',publicGamePath);
}
const requestedEntry=new URLSearchParams(location.search).get('start');
const requestedPlace=requestedEntry||location.hash.slice(1);
const withdrawnEntry=isWithdrawnResearchPlace(requestedPlace);
if(withdrawnEntry)history.replaceState(null,'',location.pathname);
const entry=withdrawnEntry?null:isRetiredPlace(requestedPlace)?'cityhall':requestedPlace==='travel'?'pursuit':requestedEntry;
const trialKind=entry==='pursuit'||location.hash==='#pursuit'?'pursuit':entry==='memory'||location.hash==='#memory'?'memory':entry==='cinema'||location.hash==='#cinema'?'cinema':entry==='gym'||location.hash==='#gym'?'gym':entry==='cityhall'||location.hash==='#cityhall'?'cityhall':entry==='datacenter'||location.hash==='#datacenter'?'datacenter':entry==='conservation'||location.hash==='#conservation'?'conservation':entry==='photo'||location.hash==='#photo'?'photo':entry==='garden'||location.hash==='#garden'?'garden':entry==='monastery'||location.hash==='#monastery'?'monastery':entry==='detective'||location.hash==='#detective'?'detective':entry==='dessert'||location.hash==='#dessert'?'dessert':entry==='ai'||location.hash==='#ai'?'ai':entry==='zoo'||location.hash==='#zoo'?'zoo':entry==='literature'||location.hash==='#literature'?'literature':entry==='dream'||location.hash==='#dream'?'dream':entry==='newspaper'||location.hash==='#newspaper'?'newspaper':entry==='language'||location.hash==='#language'?'language':entry==='writer'||location.hash==='#writer'?'writer':entry==='space'||location.hash==='#space'?'space':entry==='robot'||location.hash==='#robot'?'robot':entry==='temple'||location.hash==='#temple'?'temple':entry==='exchange'||location.hash==='#exchange'?'exchange':entry==='museum'||location.hash==='#museum'?'museum':null;
const trial=!!trialKind;
const normalStorage=storage;
const arcadeRuns=new ArcadeRuns(normalStorage);
const modeCharacters=new ModeCharacters(normalStorage,()=>{$('storage-warning').hidden=false;});
const modeNames={escape:'방탈출+미니게임',arcade:'미니게임 챌린지'};
let characterMode=null;
let arcadeMode=null,arcadePlace=null,arcadeCoins=0,arcadeLoading=false,arcadeSettled=false;
let arcadeRecordRequest=0,arcadeRecordScope='mine';
const postingArcadeRuns=new Map(),arcadeShareErrors=new Map();
let registeringCharacter=false;
const scores=new ExpeditionScores(normalStorage,()=>{$('storage-warning').hidden=false;});
scores.importJourneys(normalStorage);
const preferredPlayer=savedModeCharacter('escape');
const preferredCharacter=preferredPlayer?.character||readProgress(storage).character;
if(trial)storage={getItem:key=>normalStorage.getItem(trialKind+'_trial_'+key),setItem:(key,v)=>normalStorage.setItem(trialKind+'_trial_'+key,v)};
if(entry==='character'||entry==='title'){
 resetJourney(normalStorage);
 history.replaceState(null,'',location.pathname);
}else if(entry==='pursuit'||entry==='memory'||entry==='cinema'||entry==='gym'||entry==='cityhall'||entry==='datacenter'||entry==='conservation'||entry==='photo'||entry==='garden'||entry==='monastery'||entry==='detective'||entry==='dessert'||entry==='ai'||entry==='zoo'||entry==='museum'||entry==='exchange'||entry==='temple'||entry==='robot'||entry==='space'||entry==='writer'||entry==='language'||entry==='newspaper'||entry==='dream'||entry==='literature'){
 // A direct game link starts this game anew, even when an older trial is saved.
 // Keep the regular adventure and its chosen explorer in normalStorage.
 const next=visitPlace(null,entry==='museum'?'history':entry,preferredCharacter||'haru',preferredPlayer?.name||'플레이어');
 saveJourney(storage,recoverJourneyUnlocks(normalStorage,next));
 saveProgress(storage,{...readProgress(storage),character:preferredCharacter||'haru',clues:[],clueSources:[]});
 history.replaceState(null,'',location.pathname+'#'+trialKind);
}
const progress = readProgress(storage);
let journey=recoverJourneyUnlocks(normalStorage,readJourney(storage));
if(journey)progress.character=journey.character;
let character = {...(CHARACTERS.find(c => c.id === progress.character) || CHARACTERS[0])};
character.name=journey?.playerName||'플레이어';
let nameMotion=null,nameToken=0;
let cinemaImages=null,cinemaUI=null,memoryImages=null,pursuitImages=null;
let gymImages=null,photoImages=null,gardenImages=null,dataCenterImages=null,conservationImages=null,cityHallImages=null,cityHallUI=null;
const FIELD={pursuit:{
 rules:PURSUIT,Game:PursuitGame,Renderer:PursuitRenderer,rooms:['세계 지도'],name:'국제수사본부',
 item:'추가 단서',itemTip:`이번 단계의 네 번째 그림 공개 · 총 ${PURSUIT.flashes}회`,result:'범인을 붙잡았어요',unit:'맞힌 도시'
},memory:{rules:MEMORY,Game:MemoryGame,Renderer:MemoryRenderer,rooms:['그림 조사'],name:'기억연구소',item:'범위 힌트',itemTip:'아직 못 찾은 한 곳의 주변을 표시 · 1회',result:'달라진 아홉 곳을 모두 찾았어요!',unit:'찾은 곳'},cinema:{rules:CINEMA,Game:CinemaGame,Renderer:CinemaRenderer,load:loadCinemaAssets,rooms:['상영관'],name:'영화관',item:'영화 정보',itemTip:'지금 영화의 이야기 힌트 · 2회',result:'아홉 영화를 모두 맞혔어요!',unit:'맞힌 영화'},gym:{rules:GYM,Game:GymGame,Renderer:GymRenderer,load:loadGymAssets,rooms:['피구 코트'],name:'체육관',item:'타임아웃 휘슬',itemTip:'공과 상대가 3초 멈춰요 · 2회',result:'아홉 단서를 모두 모았어요!',unit:'모은 단서'},datacenter:{rules:DATACENTER,Game:DataCenterGame,Renderer:DataCenterRenderer,load:loadDataCenterAssets,rooms:['분기 회로실'],name:'데이터센터',item:'바이러스 제거',itemTip:'현재 연결된 경로의 바이러스 제거 · 2회',result:'아홉 자료를 모두 보냈어요!',unit:'전송한 자료'},conservation:{rules:CONSERVATION,Game:ConservationGame,Renderer:ConservationRenderer,load:loadConservationAssets,rooms:['복원 작업대'],name:'고서보존실',item:'보호 받침',itemTip:'지금 펼친 책의 작업 실수 한 번 보호 · 2회',result:'아홉 고서를 모두 복원했어요!',unit:'복원한 책'},photo:{rules:PHOTO,Game:PhotoGame,Renderer:PhotoRenderer,load:loadPhotoAssets,rooms:PHOTO_ROOMS,name:'사진관'},garden:{rules:GARDEN,Game:GardenGame,Renderer:GardenRenderer,load:loadGardenAssets,rooms:GARDEN_ROOMS,name:'식물원'}};
const isField=()=>!!FIELD[activePlace];
const isWorkshop=()=>activePlace==='datacenter'||activePlace==='conservation';
function createFieldGame(place,runPlan){const options={onEvent:handleGameEvent,characterId:character.id,runPlan};if(place==='cinema'){cinemaImages.movies.reset();options.filmReady=id=>{cinemaImages.ensureFilm(id).catch(()=>{});return cinemaImages.movies.ready(id);};options.filmTime=id=>cinemaImages.movies.time(id);}if(place==='memory')options.loadRound=memoryImages.loadRound;const g=new FIELD[place].Game(options);renderer.bindContacts?.(g,character);if(place==='pursuit')renderer.prepare(g);return g;}
const isCinema=()=>activePlace==='cinema';
const isMemory=()=>activePlace==='memory';
const isPursuit=()=>activePlace==='pursuit';
const isGym=()=>activePlace==='gym';
const isPhoto=()=>activePlace==='photo';
const isCityHall=()=>activePlace==='cityhall';
let activePlace='aquarium', monasteryImages=null, detectiveImages=null, dessertImages=null, aiImages=null, museumImages=null, historyImages=null, exchangeImages=null, templeImages=null, robotImages=null, spaceImages=null, writerImages=null, languageImages=null, zooImages=null, literatureImages=null, dreamImages=null, newspaperImages=null, exchangeUI=null, shootHeld=false;
const aquariumClues=[...progress.clues];
const isMonastery=()=>activePlace==='monastery';
const isDetective=()=>activePlace==='detective';
const isDessert=()=>activePlace==='dessert';
const isAI=()=>activePlace==='ai';
const isZoo=()=>activePlace==='zoo';
const isLiterature=()=>activePlace==='literature';
const isDream=()=>activePlace==='dream';
const isNewspaper=()=>activePlace==='newspaper';
const isLanguage=()=>activePlace==='language';
const isWriter=()=>activePlace==='writer';
function createWriterGame(){const guardTouches=createWriterCardCollider(writerImages,character);return new WriterGame({onEvent:handleGameEvent,guardTouches,giantTouches:createWriterGiantCollider(writerImages,character,{x:VINE.x,size:GIANT.size},guardTouches.heroMask)});}
const isSpace=()=>activePlace==='space';
function createSpaceGame(){return new SpaceGame({onEvent:handleGameEvent,collides:createSpaceSpriteCollider(spaceImages,character)});}
const isRobot=()=>activePlace==='robot';
const isTemple=()=>activePlace==='temple';
const isExchange=()=>activePlace==='exchange';
const isMuseum=()=>activePlace==='museum';
const isHistory=()=>activePlace==='history';
const duration=()=>isField()?FIELD[activePlace].rules.duration:isMonastery()?MONASTERY.duration:isDetective()?DETECTIVE.duration:isDessert()?DESSERT.duration:isAI()?AI.duration:isZoo()?ZOO.duration:isLiterature()?LITERATURE.duration:isDream()?DREAM.duration:isNewspaper()?NEWSPAPER.duration:isLanguage()?LANGUAGE.duration:isWriter()?WRITER.duration:isSpace()?SPACE.duration:isRobot()?ROBOT.duration:isTemple()?TEMPLE.duration:isHistory()?HISTORY.duration:isMuseum()?MUSEUM.duration:GAME.duration;
const runRecord=()=>isCityHall()?journey.cityhall:isField()?journey[activePlace]:isMonastery()?journey.monastery:isDetective()?journey.detective:isDessert()?journey.dessert:isAI()?journey.ai:isZoo()?journey.zoo:isLiterature()?journey.literature:isDream()?journey.dream:isNewspaper()?journey.newspaper:isLanguage()?journey.language:isWriter()?journey.writer:isSpace()?journey.space:isRobot()?journey.robot:isTemple()?journey.temple:isExchange()?journey.exchange:isHistory()?journey.history:isMuseum()?journey.museum:journey;
const currentPuzzle=()=>CLUE_PUZZLES[activePlace]||(isCityHall()?CITYHALL:isField()?FIELD[activePlace].rules:isMonastery()?MONASTERY:isDetective()?DETECTIVE:isDessert()?DESSERT:isAI()?AI:isZoo()?ZOO:isLiterature()?LITERATURE:isDream()?DREAM:isNewspaper()?NEWSPAPER:isLanguage()?LANGUAGE:isWriter()?WRITER:isSpace()?SPACE:isRobot()?ROBOT:isTemple()?TEMPLE:isExchange()?EXCHANGE:isHistory()?HISTORY:isMuseum()?MUSEUM:PUZZLE);
let state = 'loading', game = null, renderer, images;
let aquariumLoading;

function loadAquarium(){
 if(images)return Promise.resolve();
 aquariumLoading ||= loadAssets().then(loaded=>{images=loaded;}).finally(()=>{aquariumLoading=null;});
 return aquariumLoading;
}
let animationTime = 0, lastFrame = 0, countdownLeft = 3, lastCount = 0;
let toastTimeout, endReason, audioContext, activeMotion=null, motionNext=null, answerBusy=false;
let motionLoading=false;
const finishTransition=new FinishTransition(1);
let countdownTarget='playing',finishTimeout;
let playLesson=null;
let utilityOrigin=null,menuReturn=null,tutorialReturn=null,quitOpen=false,quitScreen=null,scoreRun=null,scoreClues=-1;
let briefingAge=0,replayOpen=false,replayScreen=null,replayOrigin=null,replayTarget=null;
const companion=()=>`${character.name}님과`;
const pressed = new Set();
const padState=new DirectionPadState();
let padInput = {x:0,y:0}, padHadMotion = false, padTapApplied = false;
const keyHadMotion = new Map();
const keyDirections={ArrowUp:{x:0,y:-1},KeyW:{x:0,y:-1},ArrowDown:{x:0,y:1},KeyS:{x:0,y:1},ArrowLeft:{x:-1,y:0},KeyA:{x:-1,y:0},ArrowRight:{x:1,y:0},KeyD:{x:1,y:0}};
const focusStack = [];

const layout=new GameLayout({app:$('app'),viewport:$('viewport'),canvas:$('ocean')});
const fitScreen=()=>layout.refresh();
const workshopUI=new WorkshopUI($('game-ui'),()=>{if(state!=='playing'||activePlace!=='conservation')return;advanceLiteratureInput();game.rotate();hud();});

function persist() {
  if(arcadeMode)return;
  progress.character=character.id;
  const aquarium=activePlace==='aquarium';
  if(aquarium){aquariumClues.length=0;aquariumClues.push(...progress.clues);}
  else{runRecord().clues=[...progress.clues];persistJourney();}
  const saved=saveProgress(storage,aquarium?progress:{...progress,clues:aquariumClues});
  if(!saved)$('storage-warning').hidden=false;
}
function unlockAudio() {
  if(!progress.sound)return;
  try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{}); } catch {}
}
function tone(frequency=600,length=.09,delay=0,type='sine',volume=.035) {
  if(!progress.sound || !audioContext)return;
  const oscillator=audioContext.createOscillator(), gain=audioContext.createGain();
  oscillator.type=type;oscillator.frequency.value=frequency;
  const start=audioContext.currentTime+delay;
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+length);
  oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+length+.03);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
}
function syncSound() {
  document.querySelectorAll('.sound-button').forEach(button=>{
    button.innerHTML=progress.sound?soundOn:soundOff;
    button.setAttribute('aria-label',progress.sound?'소리 끄기':'소리 켜기');
    button.title=progress.sound?'소리 끄기':'소리 켜기';
    button.setAttribute('aria-pressed',String(progress.sound));
  });
  const menuSound=$('menu-action-sound');
  if(menuSound){
    menuSound.querySelector('.menu-action-icon').innerHTML=icon(progress.sound?'sound':'muted');
    menuSound.setAttribute('aria-pressed',String(progress.sound));
  }
}
function toggleSound(){
 progress.sound=!progress.sound;unlockAudio();syncSound();
 const audioStorage=arcadeMode?normalStorage:storage;
 if(!saveProgress(audioStorage,{...readProgress(audioStorage),sound:progress.sound}))$('storage-warning').hidden=false;
 if(progress.sound)tone(680);
}
document.addEventListener('click',event=>{
  if(event.target.closest('.sound-button'))toggleSound();
});syncSound();

function clearInput(){
  if(isField())game?.cancelAction?.();
  game?.cancelThrow?.();
  game?.releaseAction?.();
  if(game?.finishing?.holding){game.finishing.holding=false;game.finishing.amount=0;}
  if(game?.player)game.player.moving=false;
  if(game?.queuedMove)game.queuedMove=null;
  if(exchangeUI)exchangeUI.keyup();
  shootHeld=false;pressed.clear();keyHadMotion.clear();padInput={x:0,y:0};padState.clear();padHadMotion=false;padTapApplied=false;
  document.querySelectorAll('.dir').forEach(b=>b.classList.remove('pressed'));
}
function isPursuitMenuInterlude(screen) {
  return isPursuit()&&['briefing','pursuit-report','pursuit-capture-report'].includes(screen);
}
function canOpenStatusMenu(screen) {
  return isExchange()?screen==='exchange':['playing','countdown'].includes(screen)||isPursuitMenuInterlude(screen);
}
function setState(next) {
  const arcadeScreen=ARCADE_SCREENS.has(next);
  $('arcade-screen').hidden=!arcadeScreen;
  $('game-viewport').hidden=arcadeScreen||['loading','title','select','naming','stage'].includes(next);
  $('app').classList.toggle('arcade-mode',!!arcadeMode);
  $('clue-label').textContent=arcadeMode?'모은 금화':'모은 단서';
  $('city-clue-label').textContent=arcadeMode?'예상 금화':'예상 단서';
  $('pause-save-hint').textContent=arcadeMode?'이어서 시작하기를 누르면 지금 위치에서 계속해요.':'점수와 힌트 기록은 그대로 보관돼요.';
  if(arcadeScreen)$('arcade-coin-effects').replaceChildren();
  if(!['playing','tutorial'].includes(next))cinemaImages?.movies?.pause();
  if(next==='briefing'||next==='help'){
    const copy=briefingCopy(activePlace,character.name,duration());
    $('brief-kicker').textContent=arcadeRewardText(copy.kicker);
    $('brief-title').textContent=copy.title;
    $('brief-lead').textContent=arcadeMode&&isExchange()
      ?'다섯 번 투자하고 마지막 자본 300만 원당 금화 한 개를 얻어요.'
      :arcadeRewardText(copy.lead);
    const list=document.querySelector('.instruction-list');
    const rows=instructionHTML(activePlace,{coins:!!arcadeMode});
    list.innerHTML=arcadeRewardText(rows);
    applyIcons(list);
  }
  if(state==='tutorial'&&next!=='tutorial'){playLesson?.chrome?.destroy();playLesson=null;$('tutorial-finance').replaceChildren();}
  dessertFinish?.render(game,false);
  state=next;$('app').dataset.screen=next;clearInput();syncCurrentPlaceHeaders();
  if(['title','loading','select','naming','stage'].includes(next)&&$('app').classList.contains('aligned-layout'))layout.measure(activePlace);
  cinemaUI?.render(game,isCinema()&&next==='playing');
  if(!isCinema())document.querySelector('#game-ui .timer .hud-label').textContent=isPursuit()?'남은 비행':'남은 시간';
  $('app').classList.toggle('configured-puzzle',!!CLUE_PUZZLES[activePlace]);
  $('app').classList.toggle('field-mode',isField());$('app').classList.toggle('photo-mode',isPhoto());$('app').classList.toggle('garden-mode',activePlace==='garden');for(const id of ['datacenter','conservation','gym','cinema','memory','pursuit'])$('app').classList.toggle(id+'-mode',activePlace===id);workshopUI.render(game,next==='playing',activePlace);
  $('field-act').disabled=next!=='playing';$('field-room-nav').hidden=activePlace!=='garden'||!['playing','countdown','paused','help'].includes(next);
  for(const dir of ['up','down'])document.querySelector('.dir.'+dir).disabled=isMonastery()&&next!=='playing';
  for(const id of ['home-button','failure-home'])$(id).textContent='지난 게임 다시하기';
  if(['briefing','help'].includes(next)){
    briefingAge=0;breakBriefSentences($('brief-overlay'));
    $('brief-title').closest('[role="dialog"]').setAttribute('aria-modal',String(!isPursuitMenuInterlude(next)));
    $('brief-play-button').textContent=menuReturn?'돌아가기':'START';
  }
  $('loading').hidden=next!=='loading';
  $('title-screen').hidden=next!=='title';
  if(next==='title')refreshTitleModes();
  if(next==='select'&&!$('character-grid').firstElementChild)createCharacterGrid();
  $('select-screen').hidden=!['select','naming','welcome'].includes(next);
  $('name-overlay').hidden=next!=='naming';
  $('exchange-ui').hidden=arcadeScreen||!isExchange()||['title','select','naming','welcome','loading','stage'].includes(next);
  $('exchange-ui').inert=next!=='exchange';
  $('app').classList.toggle('cityhall-mode',isCityHall());
  $('cityhall-act').disabled=next!=='playing';$('cityhall-prev').hidden=true;
  if(next!=='playing'||!isCityHall())$('cityhall-paper').hidden=true;
  $('game-ui').hidden=arcadeScreen||isExchange()||['title','select','naming','welcome','loading','stage'].includes(next);
  $('brief-overlay').hidden=!['briefing','help'].includes(next);$('ai-tutorial-overlay').hidden=next!=='tutorial';
  $('pursuit-report-overlay').hidden=next!=='pursuit-report';
  $('pursuit-capture-report-overlay').hidden=next!=='pursuit-capture-report';
  $('pursuit-selection-status').hidden=next!=='playing'||!isPursuit();
  $('countdown').hidden=next!=='countdown';
  $('cityhall-summary').hidden=next!=='city-summary';
  $('pause-overlay').hidden=next!=='paused';
  $('result-overlay').hidden=!['result','feedback'].includes(next);
  $('failure-overlay').hidden=!['failed','stopped'].includes(next);
  $('motion-overlay').hidden=!['welcome','feedback'].includes(next);
  $('stage-screen').hidden=next!=='stage';
  $('monastery-balance').disabled=next!=='playing';$('ai-act').disabled=next!=='playing';$('zoo-act').disabled=next!=='playing';$('literature-act').disabled=next!=='playing';
  $('dream-act').disabled=next!=='playing';$('dream-jump').disabled=next!=='playing';
  $('dessert-act').disabled=next!=='playing';$('detective-act').disabled=next!=='playing';$('detective-hide').disabled=next!=='playing';
  $('newspaper-act').disabled=next!=='playing';
  $('language-jump').disabled=next!=='playing';$('language-act').disabled=next!=='playing';$('writer-jump').disabled=next!=='playing';$('writer-act').disabled=next!=='playing';$('brake-button').disabled=next!=='playing';$('work-button').disabled=next!=='playing';$('shoot-button').disabled=next!=='playing';$('jump-button').disabled=next!=='playing';$('hammer-button').disabled=next!=='playing';$('interact-button').disabled=next!=='playing'||!game?.interaction;
  const menu=$(isExchange()?'ex-menu-button':'menu-button');
  if(menu)menu.disabled=!game||!canOpenStatusMenu(next);
  $('flash-button').disabled=next!=='playing'||!game?.flashes;
  $('memory-revisit').hidden=!isMemory();
  $('memory-revisit').disabled=next!=='playing'||!game?.canRevisit;
  $('dpad').querySelectorAll('.dir').forEach(b=>b.disabled=next!=='playing');
  if(['briefing','help'].includes(next))$('brief-title').focus({preventScroll:true});
  if(next==='tutorial')$('tutorial-start').focus({preventScroll:true});
  if(next==='paused')$('pause-title').focus({preventScroll:true});
  if(next==='result'){$('result-title').focus({preventScroll:true});updateResultScore();}
}
function toast(text) {
  clearTimeout(toastTimeout);$('game-toast').textContent=text;$('game-toast').classList.add('show');
  toastTimeout=setTimeout(()=>$('game-toast').classList.remove('show'),2000);
}
function syncCharacters() {
  document.querySelectorAll('.character-card').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.character===character.id)));
  $('pilot-label').textContent=`${character.name}의 잠수함`;
}
function clearCharacterAssets(){
  cinemaImages?.movies?.pause();cinemaImages=null;gymImages=null;
  photoImages=null;gardenImages=null;cityHallImages=null;cityHallUI=null;dataCenterImages=null;conservationImages=null;monasteryImages=null;detectiveImages=null;dessertImages=null;aiImages=null;museumImages=null;historyImages=null;exchangeImages=null;templeImages=null;robotImages=null;spaceImages=null;writerImages=null;languageImages=null;zooImages=null;literatureImages=null;dreamImages=null;newspaperImages=null;exchangeUI=null;
}
function usePlayer(player){
 if(character.id!==player.character)clearCharacterAssets();
 character={...CHARACTERS.find(c=>c.id===player.character),name:player.name};
 syncCharacters();
}
function createCharacterGrid() {
  $('character-grid').innerHTML=CHARACTERS.map((c,i)=>`<button class="character-card" data-character="${c.id}" style="--character-color:${c.color}" aria-pressed="false" aria-label="${i+1}번 캐릭터 선택"><span class="character-check" aria-hidden="true">✓</span><img src="./assets/${c.asset}" alt="" draggable="false"></button>`).join('');
  $('character-grid').addEventListener('click',async event=>{
    const button=event.target.closest('[data-character]');if(!button||state!=='select')return;
    usePlayer({character:button.dataset.character,name:''});
    $('player-name').value='';$('name-error').textContent='';setState('naming');
    const c=$('name-character').getContext('2d');c.clearRect(0,0,512,512);
    const token=++nameToken;nameMotion=null;$('player-name').focus({preventScroll:true});
    const portrait=button.querySelector('img');
    const drawPortrait=()=>{
     if(token!==nameToken||state!=='naming'||nameMotion||!portrait.naturalHeight)return;
     const h=420,w=portrait.naturalWidth/portrait.naturalHeight*h;
     c.drawImage(portrait,(512-w)/2,40,w,h);
    };
    if(portrait.naturalHeight)drawPortrait();
    else portrait.addEventListener('load',drawPortrait,{once:true});
    try{const img=await loadMotion(character,'start');if(token===nameToken&&state==='naming')nameMotion=new SpritePlayer($('name-character'),img);}catch{}
  });
}
function savedModeCharacter(mode){
 const profile=modeCharacters.get(mode);
 if(profile)return profile;
 if(mode==='escape'){
  const adventure=readJourney(normalStorage);
  return adventure?modeCharacters.register(mode,{character:adventure.character,name:adventure.playerName||'플레이어'}):null;
 }
 arcadeRuns.refresh();
 const legacy=arcadeRuns.run?.player||arcadeRuns.records[0]?.player;
 return legacy?modeCharacters.register(mode,legacy):null;
}
function refreshTitleModes(){
 arcadeRuns.refresh();
 $('title-escape').textContent=modeNames.escape+(savedModeCharacter('escape')?' 이어하기':' 시작하기');
 $('title-arcade').textContent=modeNames.arcade+(arcadeRuns.canResume?' 이어하기':' 시작하기');
}
async function resumeEscape(adventure){
 setState('loading');
 journey=recoverJourneyUnlocks(normalStorage,adventure);
 usePlayer({character:journey.character,name:journey.playerName||'플레이어'});
 const saved=readProgress(normalStorage);
 aquariumClues.splice(0,aquariumClues.length,...saved.clues);
 Object.assign(progress,saved,{character:character.id,clues:[...saved.clues]});
 syncSound();
 try{await restoreAdventureScreen();}catch(error){console.error(error);showStage();}
}
$('select-back').addEventListener('click',()=>{if(state==='select')returnToArcadeTitle();});
function cancelCharacterName(){
 if(state!=='naming'||registeringCharacter)return;
 ++nameToken;nameMotion=null;setState('select');
 $('character-grid').querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
}
$('name-cancel').addEventListener('click',cancelCharacterName);
function arcadeRewardText(text){
 if(!arcadeMode||isPursuit())return text;
 if(isGym())text=text.replace(/카드(?=\s*(?:줍기|를 주우세요))/g,'금화');
 return text.replace(/단서\s*카드|단서/g,'금화')
  .replace(/(금화\s*(?:\d+|아홉|세|두|한)\s*)장/g,'$1개');
}
function focusArcade(){
 document.getElementById('arcade-title')?.focus({preventScroll:true});
}
function showArcadeChoices(){
 arcadeRuns.refresh();drawArcadeChoices(arcadeRuns);setState('arcade-choice');focusArcade();
}
function chooseMode(mode){
 const player=savedModeCharacter(mode);
 if(player){openMode(mode,player);return;}
 characterMode=mode;
 $('select-mode-label').textContent=modeNames[mode];
 $('select-mode-label').hidden=false;
 $('select-back').hidden=false;
 $('character-grid').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed','false'));
 setState('select');$('select-title').focus({preventScroll:true});
}
function openMode(mode,player){
 characterMode=null;
 if(mode==='escape'){
  const adventure=readJourney(normalStorage);
  if(adventure){void resumeEscape(adventure);return;}
  startEscapeMode(player);
 }else{
  usePlayer(player);
  arcadeRuns.refresh();
  if(arcadeRuns.run)enterArcadeMap('challenge');
  else showArcadeChoices();
 }
}
function startEscapeMode(player){
 usePlayer(player);
 setCoinRewards(false);activePlace='aquarium';
 aquariumClues.length=0;progress.clues=[];progress.clueSources=[];
 persist();journey={character:character.id,playerName:character.name,stage:'aquarium',phase:'briefing',elapsed:0,survived:false,hintsSeen:0};
 if(!saveJourney(storage,journey))$('storage-warning').hidden=false;
 showStage();
}
function enterArcadeMap(mode){
 const player=savedModeCharacter('arcade');
 if(!player)return;
 arcadeMode=mode;setCoinRewards(true);
 let notice='';
 if(mode==='challenge'){
  arcadeRuns.refresh();
  if(!arcadeRuns.canResume)arcadeRuns.start(player);
  if(arcadeRuns.run.active){
   arcadeRuns.finish(arcadeRuns.run.active.place,{abandoned:true});
   notice='창을 닫을 때 플레이 중이던 게임은 중단으로 표시했어요. 남은 게임은 이어서 할 수 있어요.';
  }
  usePlayer(arcadeRuns.run.player);
  prepareArcadeTicket();
  void sharePendingArcadeRecords();
 }else usePlayer(player);
 showArcadeMap({reset:true,notice});
}
function showArcadeMap(options){
 if(!arcadeMode)return;
 showArcadeSurface();drawArcadeMap(arcadeMode,arcadeRuns,options);setState('arcade-map');updateArcadeShareStatus();focusArcade();
}
function showArcadeSurface(){
 clearTimeout(finishTimeout);finishTransition.reset();clearInput();
 cinemaImages?.movies?.pause();tutorialReturn=null;menuReturn=null;
 if(utilityOrigin)closeUtility();
}
function leaveArcadeMap(){
 showArcadeSurface();arcadeMode=null;arcadePlace=null;game=null;setCoinRewards(false);
 journey=readJourney(storage);showArcadeChoices();
}
function returnToArcadeTitle(){
 showArcadeSurface();arcadeMode=null;arcadePlace=null;characterMode=null;game=null;
 journey=readJourney(storage);replayOrigin=null;replayTarget=null;setCoinRewards(false);
 prepareAquarium();setState('title');
 $('title-escape').focus({preventScroll:true});
}
function askArcadeReset(){
 if(state!=='arcade-map'||arcadeMode!=='challenge'||!arcadeRuns.canResume)return;
 $('arcade-screen').inert=true;
 openExtra('arcade-reset-overlay','arcade-reset-no');
}
function closeArcadeReset(){
 $('arcade-screen').inert=false;
 closeExtra('arcade-reset-overlay');
}
$('arcade-reset-no').addEventListener('click',closeArcadeReset);
$('arcade-reset-yes').addEventListener('click',()=>{
 const player=savedModeCharacter('arcade');
 closeArcadeReset();if(!player)return;
 arcadeRuns.start(player);
 usePlayer(arcadeRuns.run.player);prepareArcadeTicket();showArcadeMap({reset:true});
});
async function selectArcadePlace(place){
 if(arcadeLoading||!arcadeMode||!arcadePlaces().some(p=>p.id===place))return;
 if(arcadeMode==='challenge'&&!arcadeRuns.canPlay(place))return;
 arcadeLoading=true;
 showArcadeSurface();
 arcadePlace=place;arcadeCoins=0;arcadeSettled=false;game=null;
 journey=visitPlace(null,place,character.id,character.name);
 showArcadeStatus(placeInfo(place).name+' 준비 중…');
 try{
  if(place==='aquarium'){
   await loadAquarium();
   board();
  }else await openPlaceBriefing(place,true);
  if(state==='arcade-map'||state==='arcade-result')throw Error('게임 화면을 준비하지 못했어요.');
 }catch(error){
  console.error(error);
  showArcadeMap({notice:'게임을 불러오지 못했어요. 장소를 다시 눌러 주세요.'});
 }finally{arcadeLoading=false;}
}
function syncArcadeCoins(event){
 if(!arcadeMode||!game)return;
 const count=Math.min(COINS_PER_GAME,game.banked?.size||0);
 if(count<=arcadeCoins)return;
 if(arcadeMode==='challenge')arcadeRuns.progress(arcadePlace,count);
 const position=arcadeCoinPosition({place:arcadePlace,game,event,layout,overlay:$('arcade-coin-effects')});
 popArcadeCoins(count-arcadeCoins,position);arcadeCoins=count;
 tone(784,.07,0,'sine',.027);tone(988,.1,.055,'sine',.023);
}
function settleArcadeExchange(){
 if(game.phase!=='finished')return;
 const count=Math.min(COINS_PER_GAME,Math.max(0,Math.floor(game.cash/cardPrice())));
 game.openShop();game.buy(Array.from({length:count},(_,i)=>i+1));
 queueFinish({survived:true,elapsed:0,found:[...game.banked]});
}
function recordArcadeResult(abandoned){
 if(arcadeMode!=='challenge'||arcadeSettled)return;
 syncArcadeCoins();
 arcadeSettled=arcadeRuns.finish(arcadePlace,{abandoned});
 if(arcadeRuns.canRecord)void sharePendingArcadeRecords();
}
function showArcadeResult(result){
 const detail=endReason==='leave'?'게임을 중단했어요.':!result.survived?(isPursuit()?'범인을 놓쳤어요.':isExchange()?'투자 자본이 소진됐어요.':'도전이 끝났어요. · '+Math.floor(result.elapsed||0)+'초'):isExchange()?
  `최종 자본 ${(game.ledger.at(-1)?.after??game.cash).toLocaleString('ko-KR')}만원`:isCityHall()?
  `최종 지지율 ${game.approval}%`:result.elapsed>0?`플레이 시간 ${Math.floor(result.elapsed)}초`:'게임을 마쳤어요.';
 drawArcadeResult({place:arcadePlace,mode:arcadeMode,coins:arcadeCoins,detail,finished:arcadeMode==='challenge'&&arcadeRuns.canRecord},arcadeRuns);
 setState('arcade-result');updateArcadeShareStatus();focusArcade();
}
function arcadeScoreHTML(){
 return `<div class="score-summary"><span>챌린지 누적<strong>${arcadeRuns.total}<small> / ${arcadeRuns.maximum}점</small></strong></span><span>이번 게임<strong>${arcadeCoins}<small> / 9점</small></strong></span></div><p class="panel-note">금화 한 개는 기록에서 1점이에요.</p>`;
}
function prepareArcadeTicket(){
 const run=arcadeRuns.run;
 if(!run||run.ticket||arcadeRuns.canRecord)return;
 getArcadeTicket(run.id).then(ticket=>arcadeRuns.ticket(run.id,ticket)).catch(()=>{});
}
function updateArcadeShareStatus(){
 if(!arcadeRuns.canRecord)return;
 const id=arcadeRuns.run.id;
 const record=arcadeRuns.records.find(row=>row.id===id);
 if(!record)return;
 const error=arcadeShareErrors.get(id);
 const status=record.shared?'완주 기록이 공유 기록실에 등록됐어요.':postingArcadeRuns.has(id)?'26개 게임 완주! 공유 기록실에 등록 중이에요.':
  error==='name_taken'?'같은 이름이 먼저 등록되어 이번 완주 기록은 내 기록에 저장했어요.':
  error?'완주 기록을 내 기록에 저장했어요. 공유 기록실은 연결되면 다시 시도해요.':
  '26개 게임 완주! 공유 기록실에 등록 중이에요.';
 showArcadeShareStatus(status);
}
async function sharePendingArcadeRecords(){
 arcadeRuns.refresh();
 const pending=arcadeRuns.records.filter(record=>!record.shared);
 const requests=pending.map(record=>{
  if(postingArcadeRuns.has(record.id))return postingArcadeRuns.get(record.id);
  const request=shareArcadeRecord(record).then(()=>{
   arcadeRuns.markShared(record.id);arcadeShareErrors.delete(record.id);
  }).catch(error=>arcadeShareErrors.set(record.id,error.code||'connection')).finally(()=>{
   postingArcadeRuns.delete(record.id);updateArcadeShareStatus();
  });
  postingArcadeRuns.set(record.id,request);
  return request;
 });
 updateArcadeShareStatus();
 await Promise.all(requests);
}
async function showArcadeRecords(scope){
 arcadeRecordScope=scope;
 const request=++arcadeRecordRequest;
 setState('arcade-records');
 drawArcadeRecords(scope,scope==='mine'?arcadeRuns.records:[],scope==='mine'?'아직 완주한 기록이 없어요.':'공유 기록을 불러오는 중…');focusArcade();
 if(scope==='mine'){void sharePendingArcadeRecords();return;}
 try{
  await sharePendingArcadeRecords();
  const {records}=await loadSharedArcadeRecords();
  if(state==='arcade-records'&&arcadeRecordScope===scope&&request===arcadeRecordRequest)fillArcadeRecords(records,'아직 공유된 완주 기록이 없어요.');
 }catch{
  if(state==='arcade-records'&&arcadeRecordScope===scope&&request===arcadeRecordRequest)fillArcadeRecords([],'공유 기록실에 연결할 수 없어요. 공유 기록을 다시 눌러 주세요.');
 }
}
const arcadeActions={
 practice:()=>enterArcadeMap('practice'),challenge:()=>enterArcadeMap('challenge'),
 title:returnToArcadeTitle,quit:askToQuit,reset:askArcadeReset,map:()=>showArcadeMap(),
 again:()=>selectArcadePlace(arcadePlace),records:()=>showArcadeRecords('mine'),shared:()=>showArcadeRecords('shared'),
};
$('arcade-screen').addEventListener('click',event=>{
 if(arcadeLoading||quitOpen)return;
 const button=event.target.closest('button');
 if(!button||button.disabled)return;
 if(button.dataset.arcadePlace)void selectArcadePlace(button.dataset.arcadePlace);
 else arcadeActions[button.dataset.arcadeAction]?.();
});
window.addEventListener('online',()=>void sharePendingArcadeRecords());

$('name-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if(state!=='naming'||registeringCharacter)return;
  const name=normalizePlayerName($('player-name').value);
  if(!name){$('name-error').textContent='이름을 입력해 주세요.';return;}
  const mode=characterMode,token=nameToken,draft={character:character.id,name};
  unlockAudio();
  const register=async()=>{
   if(state!=='naming'||nameToken!==token)return null;
   if(!mode)return draft;
   const existing=savedModeCharacter(mode);
   if(existing)return existing;
   const profile=mode==='arcade'?await registerArcadePlayer(normalStorage,draft):draft;
   return modeCharacters.register(mode,profile);
  };
  const submit=event.currentTarget.querySelector('button[type="submit"]');
  const cancel=$('name-cancel');
  let player;
  registeringCharacter=true;
  submit.disabled=cancel.disabled=true;
  $('name-error').textContent=mode==='arcade'?'이름을 확인하는 중이에요…':'';
  try{
   player=mode&&window.navigator.locks
    ?await window.navigator.locks.request('ptb_aquarium_character_'+mode,register)
    :await register();
  }catch(error){
   $('name-error').textContent=error.code==='name_taken'?'이미 사용 중인 이름이에요. 다른 이름을 입력해 주세요.':
    error.code==='already_registered'?`이 브라우저에 ‘${error.registeredName}’ 이름이 등록되어 있어요. 그 이름을 입력해 주세요.`:
    error.code==='invalid player'?'이름에 사용할 수 있는 글자를 입력해 주세요.':
    error.code==='storage_unavailable'?'이 브라우저에서 캐릭터를 저장할 수 없어요.':
    '공유 기록실에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.';
   $('player-name').focus({preventScroll:true});
  }finally{
   registeringCharacter=false;
   submit.disabled=cancel.disabled=false;
  }
  if(!player||state!=='naming'||nameToken!==token)return;
  $('name-error').textContent='';nameMotion=null;++nameToken;document.activeElement?.blur();
  if(mode)openMode(mode,player);
  else if(trial)startEscapeMode(player);
  Promise.all(['correct','wrong'].map(action=>loadMotion(character,action))).catch(()=>{});
});
let dessertFinish=null;
function hud() {
  if(!game||isExchange())return;
  if(arcadeMode){
   const count=String(game.banked?.size||0);
   if($('clue-value').textContent!==count)$('clue-value').textContent=count;
  }
  if(isCityHall()){cityHallHud();return;}
  if(isCinema()){cinemaHud();return;}
  if(isMemory()){memoryHud();return;}
  if(isPursuit()){pursuitHud();return;}
  const remaining=Math.ceil(Math.max(0,isHistory()?game.remaining:duration()-game.elapsed));
  const timeText=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  if($('time-value').textContent!==timeText)$('time-value').textContent=timeText;
  $('time-fill').style.transform=`scaleX(${isHistory()?game.remaining/20:(duration()-game.elapsed)/duration()})`;
  $('time-value').closest('.timer').classList.toggle('urgent',remaining<=(isHistory()?5:10));
  $('clue-value').textContent=String(game.banked.size);
  $('health-value').setAttribute('aria-label',`${activePlace==='aquarium'?'내구도':'체력'} ${game.health}칸`);
  $('health-value').classList.toggle('danger',game.health===1);
  [...$('health-value').children].forEach((pip,i)=>pip.classList.toggle('empty',i>=game.health));
  const iconKind=isField()?(isPhoto()?'autoCamera':game?.itemKind||'thermostat'):isMonastery()?'shield':isDetective()?'decoy':isDessert()?'remote':isAI()?'autoChip':isZoo()?'whistle':isLiterature()?'bookmark':isDream()?'eraser':isNewspaper()?'satchel':isLanguage()?'magnet':isWriter()?'bookmark':isSpace()?'booster':isRobot()?'magnet':isTemple()?'shield':isHistory()?'run':isMuseum()?'time':'light';
  if($('flash-button').dataset.icon!==iconKind){$('flash-button').dataset.icon=iconKind;$('flash-button').querySelector('svg').outerHTML=icon(iconKind);}
  $('flash-value').textContent=String(game.flashes);
  $('flash-button').setAttribute('aria-label',`${isField()?(isPhoto()?'자동 촬영':game?.itemLabel||'온도 유지'):isMonastery()?'바람막이':isDetective()?'태엽쥐':isDessert()?'오븐 리모컨':isAI()?'자동완성 칩':isZoo()?'사육사 호루라기':isLiterature()?'고쳐 쓰기 책갈피':isDream()?'꿈 지우개':isNewspaper()?'취재 가방':isLanguage()?'글자 자석':isWriter()?'마법 책갈피':isSpace()?'부스터':isRobot()?'자석 공구':isTemple()?'아테나의 가호':isHistory()?'속도업':isMuseum()?'시간 정지':'빛 발사'}, ${game.flashes}회 남음`);
  if(isField())fieldHud();
  if(isMonastery()){
    $('history-era').textContent=(game.zoneIndex+1)+' / 3';$('pilot-label').textContent=character.name+' · '+game.zone.name;
    $('monastery-balance').disabled=state!=='playing'||!game.held||game.retryLeft>0;$('monastery-balance').setAttribute('aria-pressed',String(game.balancing));$('monastery-balance').classList.toggle('action-ready',game.balancing);
    $('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.toggle('danger',Math.abs(game.angle)>.85||game.retryLeft>0);
    for(const dir of ['up','down'])document.querySelector('.dir.'+dir).disabled=state!=='playing';
    $('ocean').setAttribute('aria-label','사찰 연등 행렬 · '+game.zone.name+' · '+(game.lane<.5?'안쪽 길':'바깥쪽 길')+' · 걸어 둔 연등 '+game.banked.size+'/9 · '+(game.held?'연등 운반 중 · 안정도 '+Math.round(game.stability*100)+'%':'빈손')+' · '+(game.wind.phase==='gust'?'바람 부는 중':game.wind.phase==='warning'?'바람 예고':'잔잔함'));
  }
  if(isMuseum()){
    $('shoot-button').disabled=state!=='playing'||game.player.climbing;
    $('shoot-button').setAttribute('aria-label',game.player.climbing?'사다리 이동 중에는 새총을 쏠 수 없어요':'새총 발사');
    $('pilot-label').textContent=`${character.name} · ${game.player.climbing?'사다리 이동 중':(game.player.floor+1)+'층'}`;
    [...$('museum-colors').children].forEach((el,i)=>{el.style.background=!game.monsters[i].alive?COLORS[i].hex:'#d5dcd9';el.classList.toggle('owned',!game.monsters[i].alive);el.setAttribute('aria-label',`${COLORS[i].name} ${!game.monsters[i].alive?'되찾음':'미수집'}`);});
  }
  if(isHistory()){
    const phase=game.phase;
    $('time-value').textContent=phase==='explore'||game.ended?timeText:phase==='travel'?'이동 중':'대기';
    $('history-era').textContent=game.eraIndex<0?'박물관':`${game.eraIndex+1} / 3`;
    $('pilot-label').textContent=`${character.name} · ${game.era?.name||'박물관'}`;
    $('hammer-button').disabled=state!=='playing'||!game.canMove;
    $('interact-button').disabled=state!=='playing'||!game.interaction;
    $('interact-button').textContent=game.interaction?.startsWith('하차')?'하차':'탑승';
    const text=phase==='intro'?'박물관을 둘러보세요.':phase==='ready'?'타임머신에 탑승하세요':phase==='docked'?`${game.era.name} 도착! 하차해 주세요.`:phase==='explore'?(remaining<=5?'서둘러 타임머신으로 돌아오세요!':`${game.era.name} · 단서 3개를 찾아 돌아오세요`):phase==='boarding'?'의자에 앉아 출발을 준비해요':phase==='disembarking'?'문이 열리면 계단으로 내려와요':phase==='travel'?`시간 여행 중 · ${Math.max(1,Math.ceil(5-game.phaseTime))}초`:phase==='returned'?'박물관으로 무사히 돌아왔어요!':'';
    $('history-message').textContent=text;$('history-message').hidden=!text||!['playing','countdown'].includes(state);
    $('history-message').classList.toggle('danger',phase==='explore'&&remaining<=5);
  }
  const fishingCue=isLiterature()&&state==='playing'?game.fishingCue:null;
  for(const dir of ['left','right'])document.querySelector('.dir.'+dir).classList.toggle('fishing-brace',fishingCue?.mode==='brace'&&fishingCue.direction===dir);
  $('literature-act').classList.toggle('fishing-reel',fishingCue?.mode==='reel');
  if(isLiterature()){$('pilot-label').textContent=character.name+' · 명작 둘러보기';$('literature-act').textContent=game.actionLabel;$('literature-act').disabled=state!=='playing'||!game.canMove||!!game.scene.job;$('literature-act').classList.toggle('action-ready',game.nearAction&&game.canMove);$('literature-act').setAttribute('aria-label',game.actionLabel);$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');}
  if(isAI()){const aim=game.target,shots=game.order.slots.map(k=>game.photos[k]?LABELS[game.photos[k].kind]:'빈칸'),inf=game.phase==='infer';const tune=$('ai-tunes');tune.hidden=state!=='playing'||!inf;if(inf){for(const b of tune.children){const ch=Number(b.dataset.ch),n=Number(b.dataset.level);b.hidden=ch===1&&!game.photos.ink;const label=ch?ENV_WORDS[n]:POWER_WORDS[game.photos.part.kind][n];if(b.textContent!==label)b.textContent=label;const pressed=String((ch?game.draft.inkLevel:game.draft.powerLevel)===n);if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);}}$('ai-original').hidden=!inf;$('ai-original').disabled=state!=='playing'||!inf;$('ai-act').disabled=state!=='playing'||!game.canAct;$('ai-act').classList.toggle('action-ready',game.canAct&&(!!aim||inf));$('ai-act').textContent=game.actionLabel;$('ai-act').setAttribute('aria-label',game.actionLabel);$('pilot-label').textContent=character.name+' · 생성 연구실';$('history-era').textContent=(game.orderIndex+1)+' / 9';$('history-message').hidden=true;$('ocean').setAttribute('aria-label','AI상상출력실 · 의뢰 '+(game.orderIndex+1)+' '+game.order.title+' · 원본 '+game.order.slots.map(s=>LABELS[game.reference[s]]).join(' + ')+' · 단서 '+game.banked.size+'/9 · '+({collect:'특징 스캔 · 벽 모니터에 주문 표시',infer:'생성 초안',print:'생성 결과',complete:'완료'}[game.phase])+' · 가까운 대상 '+(aim?aim.type==='press'?'생성 코어':LABELS[aim.kind]:'없음')+' · 입력 '+shots.join(', ')+(inf?' · 동작 '+(game.draft.powerLevel+1)+(game.draft.ink?' · 효과 '+(game.draft.inkLevel+1):''):''));}
  if(isZoo()){$('ocean').setAttribute('aria-label',game.active.spec.name+' 먹이 '+game.active.fed+'/2 · 각도 '+Math.round(game.angle)+'도 · 던진 먹이 '+game.throwCount+'개');$('history-era').textContent=(game.room+1)+' / 9';$('pilot-label').textContent=character.name+' · '+ZOO_ZONES[game.zone];$('zoo-act').disabled=state!=='playing'||(!game.canThrow&&!game.charging);$('zoo-act').classList.toggle('action-ready',game.charging);$('zoo-act').setAttribute('aria-label',game.charging?'손을 떼면 먹이 던지기':'누르고 힘을 모아 먹이 던지기');$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');}
  if(isDream()){$('history-era').textContent=(game.room+1)+' / 3';$('pilot-label').textContent=character.name+' · '+DREAM_ROOMS[game.room];$('dream-act').disabled=state!=='playing'||!game.canShift;$('dream-jump').disabled=state!=='playing'||!game.canJump;$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');}
  dessertFinish?.render(game,isDessert()&&state==='playing');
  if(isDetective()){$('pilot-label').textContent=character.name+' · '+game.room.name;$('detective-act').textContent=game.actionLabel;$('detective-act').disabled=state!=='playing'||!game.canAct;$('detective-act').setAttribute('aria-label','누르고 조사하기');$('detective-hide').textContent=game.hidden?'나오기':'숨기';$('detective-hide').setAttribute('aria-label',game.hidden?'가구에서 나오기':'가구 뒤에 숨기');$('detective-hide').disabled=state!=='playing'||!game.canHide;$('detective-hide').classList.toggle('action-ready',game.canHide);$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing';$('history-message').classList.toggle('danger',game.suspicion>.5);$('ocean').setAttribute('aria-label','탐정사무소 · '+game.room.name+' · 이 방 증거 '+game.roomCollected+'/3 · 모은 단서 '+game.banked.size+'/9 · '+(game.hidden?'숨는 중':'이동 중')+' · '+(game.pursued?'추격 또는 수색 중':'순찰 중')+' · 경계 '+Math.round(game.suspicion*100)+'퍼센트');}
  if(isDessert()){$('history-era').textContent=game.handLabel;$('pilot-label').textContent=character.name+' · 오븐 대소동';$('dessert-act').textContent=game.actionLabel;$('dessert-act').disabled=state!=='playing'||!game.canAct;$('dessert-act').setAttribute('aria-label',game.actionLabel);$('dessert-act').classList.toggle('action-ready',game.target&&['ready','finishing'].includes(game.ovens[game.target.id].status)&&game.canAct);$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!!game.finishing||!game.prompt;$('history-message').classList.remove('danger');$('ocean').setAttribute('aria-label','디저트 공방 · '+PASTRIES.map(p=>p.name+' '+game.delivered[p.id]+'/3').join(', ')+' · 단서 '+game.banked.size+'/9 · '+game.ovens.map(o=>PASTRIES[o.id].name+' '+({baking:'굽는 중',ready:'꺼낼 때',burnt:'새 반죽 교체 중',cooling:'자동 포장',finishing:'장식 대기',done:'완료'}[o.status])).join(' · '));}

  if(isNewspaper()){$('history-era').textContent=game.packed?'사진 + 제목':game.held?(game.held.kind==='photo'?'사진':'제목'):game.bagActive?'가방 준비':'빈손';$('pilot-label').textContent=character.name+' · 신문 편집';$('newspaper-act').textContent=game.actionLabel;$('newspaper-act').disabled=state!=='playing'||!game.canMove||!!game.motion||game.actionWait>0;$('newspaper-act').setAttribute('aria-label',game.actionLabel==='인쇄'?'완성한 기사 인쇄':'사진·제목 집기 또는 배치');$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');}
  if(isLanguage()){$('history-era').textContent=(game.room+1)+' / 3';$('pilot-label').textContent=character.name+' · '+LAB_ROOMS[game.room];$('language-act').textContent=game.actionLabel;$('language-act').disabled=state!=='playing'||!game.canMove||game.actionWait>0||game.player.climbing;$('language-act').setAttribute('aria-label',game.held?'글자 던지기':'글자 집기');$('language-jump').disabled=state!=='playing'||!game.canMove;$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');}
  if(isWriter()){$('history-era').textContent=(game.chapter+1)+' / '+STORIES.length;$('pilot-label').textContent=character.name+' · 이야기 둘러보기';$('writer-act').textContent=game.actionLabel;$('writer-act').classList.toggle('three-letters',game.actionLabel.length>2);$('writer-act').disabled=state!=='playing'||!game.canAct;$('writer-act').setAttribute('aria-label',game.chapter===0?(game.player.hidden?'집에서 나오기':'집 안에 숨기'):game.chapter===1?'크기 바꾸기':game.chapter===2?(game.player.flying?'비행 끝내기':'비행 시작'):game.chapter===3?'피노키오에게 거짓말하기':'이 구간은 방향키를 사용해요');$('writer-jump').disabled=state!=='playing'||!game.canMove;$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');}
  if(isSpace()){$('history-era').textContent=game.phase==='depart'?'출발 중':game.stunLeft>0?'회전 중':'안정';$('pilot-label').textContent=character.name+' · 우주유영';$('brake-button').disabled=state!=='playing'||!game.canMove;$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');}
  if(isRobot()){$('history-era').textContent=game.held?partInfo(game.held.kind).name:game.job?'작업 중':'빈손';$('pilot-label').textContent=character.name+' · 로봇 수리';$('work-button').disabled=state!=='playing'||!game.canMove||game.actionWait>0;$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');}
  if(isTemple()){$('history-era').textContent=game.delays+'회';$('pilot-label').textContent=`${character.name} · ${game.zone.name}`;$('interact-button').disabled=state!=='playing'||!game.interaction;$('interact-button').textContent=game.interaction||'탑승';$('health-value').setAttribute('aria-label',`체력 ${game.health}칸`);for(const direction of ['left','up'])document.querySelector('.dir.'+direction).classList.toggle('temple-brace',state==='playing'&&game.windActive);}
  $('flash-button').disabled=state!=='playing'||game.flashes===0||(isPhoto()&&(!!game.autoShot||!game.target))||(activePlace==='garden'&&!game.canCallGardener)||(activePlace==='datacenter'&&!game.canCleanVirus)||(activePlace==='conservation'&&(game.book.protected||game.book.done))||(isMonastery()&&!game.canShield)||((isSpace()||isWriter())&&!game.canRecover)||(isLiterature()&&!game.canShield)||((isRobot()||isLanguage())&&!game.canMagnet)||(isDetective()&&!game.canDecoy)||(isDessert()&&!game.canFreeze)||(isNewspaper()&&!game.canUseBag)||(isAI()&&!game.canAutoMatch)||(isZoo()&&!game.canShield)||(isDream()&&!game.canErase)||(isTemple()&&!game.canShield)||((isMuseum()||isGym())&&game.freezeLeft>0)||(isHistory()&&(game.phase!=='explore'||game.boostLeft>0));
}
function handleGameEvent(event) {
  if(arcadeMode&&event.type==='card'){syncArcadeCoins(event);return;}
  if(isField()&&journey?.[activePlace]&&game)Object.assign(journey[activePlace],{room:game.room,flashes:game.flashes});
  if(event.type==='pursuitTakeoff')tone(420,.18,0,'sine',.025);
  if(event.type==='pursuitArrival'&&!event.correct)tone(260,.12,0,'triangle',.02);
  if(event.type==='pursuitClue')tone(630,.12,0,'triangle',.025);
  if(event.type==='memoryMiss')tone(245,.085,0,'triangle',.018);
  if(event.type==='memoryHint')tone(620,.12,0,'sine',.026);
  if(event.type==='gymHit')tone(190,.14,0,'triangle',.025);
  if(event.type==='gymThrow')tone(370,.04,0,'triangle',.008);
  if(event.type==='gymWhistle'){tone(1200,.12,0,'sine',.02);tone(1500,.15,.14,'sine',.02);}
  if(event.type==='photoShutter')tone(event.good?740:280,.07,0,'triangle',.018);
  if(['dataLever','dataSend','bookWork','bookRotate'].includes(event.type))tone(470,.045,0,'triangle',.012);
  if(['dataArrive','bookPinned','bookProtected'].includes(event.type))tone(820,.08,0,'sine',.018);
  if(['dataFail','bookMistake'].includes(event.type))tone(230,.1,0,'triangle',.018);
  if(['gardenSeed','gardenCover','gardenHeat','gardenVent','gardenPollen','gardenPestHit','fieldRoom'].includes(event.type))tone(440,.055,0,'triangle',.012);
  if(['gardenBloom','gardenPollinate','gardenHelp','gardenHold','gardenHelperCall','gardenHelperComplete','photoAuto'].includes(event.type))tone(880,.13);
  if((event.type==='studioPrint'||event.type==='studioRemix')&&journey?.ai){journey.ai.album=game.album.map(w=>({...w}));persistJourney();}
  if(event.type==='monasteryHang'){tone(523,.16);tone(784,.16,.12);}
  if(event.type==='monasteryShield'){tone(820,.15);}
  if(event.type==='monasteryBump'){tone(215,.08,0,'triangle',.012);}
  if(event.type==='monasteryFumble'){tone(240,.12,0,'triangle',.012);}
  if(event.type==='card'){
    if(!isExchange()&&runRecord())Object.assign(runRecord(),{clueSources:[...game.clueSources],clueRule:'count-v1'});
    if(activePlace==='aquarium')progress.clueSources=[...game.clueSources];
    if(isMonastery()&&journey?.monastery){Object.assign(journey.monastery,{lit:[...game.clueSources],mistakes:game.mistakes,flashes:game.flashes});}
    if(isDetective()&&journey?.detective){Object.assign(journey.detective,{room:game.roomIndex,caught:game.caught,flashes:game.flashes,evidence:game.rooms.flatMap(r=>r.evidence.filter(e=>e.collected).map(e=>e.id))});}
    if(isDessert()&&journey?.dessert){journey.dessert.pastries=game.packages.map(p=>p.kind);}
    progress.clues=[...game.banked].sort((a,b)=>a-b);persist();trackRunScore();
    renderer.effect('card',event.x,event.y);

    tone(660,.12);tone(880,.15,.09);
  }else if(event.type==='detectiveChase'){tone(570,.09,0,'triangle',.016);tone(760,.09,.13,'triangle',.016);
  }else if(event.type==='detectiveCaught'){tone(200,.15,0,'triangle',.02);tone(270,.12,.1);
  }else if(event.type==='detectiveDecoy'){tone(740,.08);tone(980,.08,.14);
  }else if(event.type==='detectiveRoom'){tone(490,.1);
  }else if(event.type==='detectiveSearch'){tone(390,.05,0,'triangle',.008);
  }else if(event.type==='dessertReady'){tone(940,.11);tone(1190,.09,.12);
  }else if(event.type==='dessertBurn'){tone(220,.14,0,'triangle',.018);
  }else if(event.type==='dessertPack'){tone(490,.06);
  }else if(event.type==='dessertFreeze'){tone(760,.13);tone(980,.12,.12);
  }else if(event.type==='studioEmpty'){tone(180,.05,0,'triangle',.01);
  }else if(event.type==='studioGenerate'){tone(425,.08);tone(635,.13,.1);
  }else if(event.type==='studioRevise'){tone(600,.075);
  }else if(event.type==='studioScan'){tone(750,.055);tone(1020,.05,.06);
  }else if(event.type==='studioPrint'){tone(580,.10);tone(790,.10,.12);
  }else if(event.type==='studioRemix'){tone(540,.08);tone(690,.12,.09);
  }else if(event.type==='studioAutoMatch'){tone(440,.15);
  }else if(event.type==='zooThrow'){tone(420,.045,0,'triangle',.012);
  }else if(event.type==='zooFeed'){tone(760,.09);tone(1020,.1,.08);
  }else if(event.type==='zooWhistle'){tone(1200,.14,0,'sine',.022);
  }else if(['pickup','repairPart','magnet'].includes(event.type)){tone(event.type==='magnet'?810:610,.1);
  }else if(event.type==='newsPlace'){tone(560,.07);
  }else if(event.type==='newsPrint'){tone(270,.12,0,'triangle',.018);tone(420,.1,.18,'triangle',.015);
  }else if(event.type==='literatureHit'){tone(190,.12,0,'triangle',.025);
  }else if(['literatureSuccess','literatureParry','literatureShield'].includes(event.type)){tone(620,.1);tone(860,.12,.1);
  }else if(event.type==='literatureAction'){tone(360,.04,0,'triangle',.012);
  }else if(event.type==='dreamHit'){tone(200,.12,0,'triangle',.02);
  }else if(['dreamShift','dreamErase','dreamRoom','dreamSpring','dreamSwitch'].includes(event.type)){tone(610,.1);tone(850,.16,.12);
  }else if(event.type==='dreamSlam'){tone(135,.1,0,'triangle',.02);
  }else if(event.type==='newsBag'){tone(760,.12);tone(950,.12,.1);
  }else if(event.type==='repairStart'){tone(330,.07,0,'triangle');tone(440,.07,.3,'triangle');
  }else if(event.type==='misfit'){tone(200,.12,0,'triangle');
  }else if(event.type==='languageHit'){tone(190,.13,0,'triangle',.025);
  }else if(['languageCorrect','languageSolved'].includes(event.type)){tone(660,.1);if(event.type==='languageSolved')tone(880,.16,.12);
  }else if(event.type==='languageJump'){tone(410,.06,0,'sine',.015);
  }else if(event.type==='writerHit'){tone(190,.13,0,'triangle',.025);
  }else if(['writerMagic','writerRecover','writerChapter','writerHide'].includes(event.type)){tone(650,.12);tone(870,.12,.09);
  }else if(event.type==='writerJump'){tone(410,.06,0,'sine',.015);
  }else if(event.type==='spaceHit'){tone(190,.13,0,'triangle',.025);
  }else if(event.type==='spaceRecover'){tone(620,.12);tone(880,.18,.1);
  }else if(event.type==='brake'){tone(440,.06,0,'sine',.012);
  }else if(['templeHit','pig'].includes(event.type)){tone(event.type==='pig'?390:170,.18,0,'triangle',.03);
  }else if(['recovery','windClear','templeBoard'].includes(event.type)){tone(730,.16);
  }else if(event.type==='boardPrompt'){tone(740,.2);
  }else if(event.type==='arrival'){clearInput();tone(660,.2);
  }else if(event.type==='travel'){clearInput();clearTimeout(toastTimeout);$('game-toast').classList.remove('show');tone(240,.7,0,'sine',.025);
  }else if(event.type==='hammer'){tone(280,.07,0,'triangle',.025);
  }else if(event.type==='break'){tone(190,.1,0,'triangle',.04);
  }else if(event.type==='boost'){tone(850,.15);
  }else if(event.type==='shoot'){tone(480,.06,0,'triangle',.015);
  }else if(event.type==='jump'){tone(390,.07,0,'sine',.015);
  }else if(event.type==='freeze'){clearTimeout(toastTimeout);$('game-toast').classList.remove('show');tone(900,.2);
  }else if(event.type==='heal'){
    renderer.effect('heal',event.x,event.y);
    tone(520,.12);tone(780,.12,.1);
  }else if(event.type==='hit'){
    renderer.effect('hit',game.player.x,game.player.y);

    tone(170,.18,0,'triangle',.06);
  }else if(event.type==='flash'){
    renderer.effect('flash',event.x,event.y);tone(400,.08);tone(720,.16,.04);
  }else if(event.type==='end'){
    queueFinish(event);
  }
}
function board() {
  // Replay can arrive here with any stage's renderer and HUD still active.
  // Switch the whole scene before persisting clues or creating its game.
  prepareAquarium();finishTransition.reset();unlockAudio();persist();
  game=new AquariumGame({onEvent:handleGameEvent,collides:createSpriteCollider(images,character)});renderer.effects=[];endReason=null;
  if(journey){journey.aquariumBoarded=true;journey.phase='briefing';persistJourney();}
  $('game-toast').classList.remove('show');setState('briefing');hud();
}
function persistJourney(){if(arcadeMode||!journey)return;journey=recoverJourneyUnlocks(normalStorage,journey);if(!saveJourney(storage,journey))$('storage-warning').hidden=false;}
async function showMotion(action,title,message,buttonText,onNext){
  if(motionLoading)return;
  motionLoading=true;activeMotion=null;motionNext=null;
  $('motion-title').textContent=title;$('motion-message').textContent=message;
  $('motion-kicker').textContent=action==='start'?'이제 게임을 시작해요':action==='correct'?'단서 해독 성공':'다시 생각해 볼까요?';
  $('motion-next').textContent='잠시만요…';$('motion-next').disabled=true;
  $('motion-canvas').dataset.action=action;
  $('motion-canvas').setAttribute('aria-label',`${character.name}의 ${action==='start'?'게임 시작':action==='correct'?'정답 축하':'오답 반응'} 동작`);
  const c=$('motion-canvas').getContext('2d');c.clearRect(0,0,512,512);
  setState(action==='start'?'welcome':'feedback');$('motion-title').focus({preventScroll:true});
  try{
    const img=await loadMotion(character,action);
    activeMotion=new SpritePlayer($('motion-canvas'),img);
    motionNext=onNext;$('motion-next').textContent=buttonText;
  }catch(error){
    $('motion-message').textContent='캐릭터 동작을 불러오지 못했어요. 다시 눌러 주세요.';
    $('motion-next').textContent='동작 다시 불러오기';$('motion-next').disabled=false;
    motionNext=()=>showMotion(action,title,message,buttonText,onNext);
    console.error(error);
  }finally{motionLoading=false;}
}
$('motion-next').addEventListener('click',()=>{if(!motionNext)return;const next=motionNext;motionNext=null;activeMotion=null;next();});
function beginCountdown(target=isExchange()?'exchange':'playing') {
  countdownTarget=target;trackRunScore();
  unlockAudio();countdownLeft=3;lastCount=3;lastFrame=performance.now();
  $('count-number').textContent='3';$('count-number').classList.remove('pop');void $('count-number').offsetWidth;$('count-number').classList.add('pop');
  $('countdown').querySelector('p').textContent=isPursuit()?'그림 단서를 살펴볼 준비를 해요':isMemory()?'원본 그림을 볼 준비를 해요':isCinema()?'영화 장면을 살펴보세요':isMonastery()?'연등을 받아 걸이까지 운반해요':isCityHall()?'정책을 선택할 준비를 해요':'방향키에 손을 올려 주세요';
  setState('countdown');tone(480,.1);
}
function resetAdventure(keepPursuitPlan=false){
  const runPlan=keepPursuitPlan&&isPursuit()&&game instanceof PursuitGame&&game.elapsed===0?game.runPlan:undefined;
  finishTransition.reset();
  progress.clues=[];if(activePlace==='aquarium')progress.clueSources=[];persist();
  game=isCityHall()?new CityHallGame():isExchange()?new ExchangeGame():isField()?createFieldGame(activePlace,runPlan):isMonastery()?new MonasteryGame({onEvent:handleGameEvent}):isDetective()?new DetectiveGame({onEvent:handleGameEvent}):isDessert()?new DessertGame({onEvent:handleGameEvent}):isAI()?new AIGame({onEvent:handleGameEvent}):isZoo()?new ZooGame({onEvent:handleGameEvent,character:character.id}):isLiterature()?new LiteratureGame({onEvent:handleGameEvent}):isDream()?new DreamGame({onEvent:handleGameEvent}):isNewspaper()?new NewspaperGame({onEvent:handleGameEvent}):isLanguage()?new LanguageGame({onEvent:handleGameEvent,characterId:character.id}):isWriter()?createWriterGame():isSpace()?createSpaceGame():isRobot()?new RobotGame({onEvent:handleGameEvent}):isTemple()?new TempleGame({onEvent:handleGameEvent}):isHistory()?new HistoryGame({onEvent:handleGameEvent}):isMuseum()?new MuseumGame({onEvent:handleGameEvent}):new AquariumGame({onEvent:handleGameEvent,collides:createSpriteCollider(images,character)});
  if(isCityHall())bindCityHallUI();if(isExchange())bindExchangeUI();
  renderer.effects=[];endReason=null;
  if(journey){const rec=runRecord();if(game.runPlan)rec.runPlan=[...game.runPlan];if(isCityHall()||isExchange())rec.run=game.snapshot();Object.assign(rec,{phase:'briefing',elapsed:0,survived:false,clueSources:[],clueRule:'count-v1'});if(isField())Object.assign(rec,{room:0,flashes:FIELD[activePlace].rules.flashes??2});if(isPursuit())Object.assign(rec,{clues:[],captured:null,round:1,attemptsUsed:0,trace:[],traceRule:PURSUIT_TRACE_RULE});if(isMonastery())Object.assign(rec,{lit:[],mistakes:0,flashes:MONASTERY.flashes});if(isAI())rec.album=[];if(isDetective())Object.assign(rec,{evidence:[],room:0,caught:0,flashes:DETECTIVE.flashes});if(isDessert())rec.pastries=[];if(isWriter())rec.reachedCastle=false;persistJourney();}
  $('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
  hud();
}
$('start-button').addEventListener('click',()=>{
 if(state==='briefing')showPlayTutorial();
 else if(state==='help')openHowTo();
});
$('brief-play-button').addEventListener('click',startFromInstructions);
function showHelp(){
 if(!canOpenStatusMenu(state)||homeConfirmOpen||replayOpen)return;
 clearTimeout(toastTimeout);$('game-toast').classList.remove('show');setState('help');
}
function resumeFromHelp(){
 if(state!=='help'||returnToStatusMenu())return;
 if(isCityHall())startCityHallPlay();else beginCountdown();
}

function startFromInstructions(){
 if(state==='help'){resumeFromHelp();return;}
 if(!['briefing','tutorial'].includes(state))return;
 if(state==='tutorial'&&returnFromHowTo())return;
 if(arcadeMode==='challenge'&&!arcadeRuns.begin(arcadePlace)){
  showArcadeMap({notice:'이미 진행한 게임이에요.'});return;
 }
 if(isCityHall()){startCityHallPlay();return;}
 if(isExchange()){startExchangePlay();return;}
 resetAdventure(true);
 if(isPursuit()){showPursuitReport();return;}
 beginCountdown();
}
function pause() {if(['playing','countdown','exchange'].includes(state)&&!homeConfirmOpen){setState('paused');}}
function resume(){if(state!=='paused')return;if(isCityHall())startCityHallPlay();else if(isExchange()){lastFrame=performance.now();setState('exchange');}else beginCountdown();}
$('resume-button').addEventListener('click',resume);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cinemaImages?.movies?.pause();pause();}});
window.addEventListener('pagehide',()=>cinemaImages?.movies?.pause());
window.addEventListener('blur',()=>{clearInput();pause();});

function flash() {
 if(state!=='playing')return;
 if(isMonastery()||isPursuit())advanceLiteratureInput();
 if(state!=='playing')return;
 unlockAudio();const used=game.flash();
 if(used&&isAI())clearInput();
 if(used&&isCityHall()){saveCityHall();tone(740,.1,0,'sine',.04);}
 hud();
}
$('flash-button').addEventListener('pointerdown',event=>{
  if(state!=='playing')return;event.preventDefault();flash();
});
$('flash-button').addEventListener('click',event=>{if(event.detail===0)flash();});
function syncPad(){
  padInput=padState.value;
  for(const [name,on] of Object.entries({up:padInput.y<0,down:padInput.y>0,left:padInput.x<0,right:padInput.x>0}))document.querySelector(`.dir.${name}`).classList.toggle('pressed',on);
}
function pointerDirection(event){return padDirection(event.clientX,event.clientY,$('dpad').getBoundingClientRect());}
function updatePlay(dt){
 const elapsed=game.elapsed;
 game.update(dt,input());
 if(isMonastery()&&game.elapsed===elapsed)return;
 if(padState.size){padState.advance();if(padInput.x||padInput.y)padHadMotion=true;}
 for(const key of pressed)keyHadMotion.set(key,true);
}
// Apply elapsed movement before changing an input. Delayed drawing frames must
// not apply a newly pressed direction to time that elapsed while it was idle.
function advanceLiteratureInput(){
 if(state!=='playing'||(!isField()&&!isLiterature()&&!isZoo()&&!isAI()&&!isDessert()&&!isDetective()&&!isMonastery())||!game||homeConfirmOpen)return;
 const now=performance.now(),dt=lastFrame?Math.min(65,Math.max(0,(now-lastFrame)/1000)):0;lastFrame=now;
 if(dt<=0)return;
 updatePlay(dt);
}

$('dpad').addEventListener('pointerdown',event=>{
  if(state!=='playing'||padState.has(event.pointerId))return;advanceLiteratureInput();event.preventDefault();
  if(isCityHall()||isCinema()||isPursuit())return;
  padState.press(event.pointerId,pointerDirection(event));padHadMotion=false;padTapApplied=false;
  $('dpad').setPointerCapture(event.pointerId);syncPad();unlockAudio();
});
$('dpad').addEventListener('pointermove',event=>{if(padState.has(event.pointerId)){advanceLiteratureInput();event.preventDefault();padState.move(event.pointerId,pointerDirection(event));syncPad();}});
function shortMove(direction){if(isPursuit()){game.moveSelection(direction.x,direction.y);hud();return;}if(isCityHall()||isCinema()){game.selectByOffset(direction.y||direction.x);hud();return;}if(isAI()||isZoo()||isLiterature()||isDream()||isLanguage()||isTemple()||isSpace()||isWriter())game.queueMove(direction);else game.movePlayer(.08,direction);}
function releasePad(event){
  if(!padState.has(event.pointerId))return;
  advanceLiteratureInput();
  const released=padState.release(event.pointerId);padHadMotion=released.advanced;
  if(event.type==='pointerup'&&state==='playing'&&!released.advanced){shortMove(released.direction);padTapApplied=true;}
  syncPad();
}
['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('dpad').addEventListener(type,releasePad));
$('dpad').addEventListener('contextmenu',event=>event.preventDefault());
// 키보드/보조기기의 버튼 활성화도 짧은 이동으로 응답합니다.
document.querySelectorAll('.dir').forEach(button=>button.addEventListener('click',event=>{
  if(state!=='playing')return;
  const selecting=isCityHall()||isCinema()||isPursuit();
  if(!selecting&&event.detail!==0&&(padHadMotion||padTapApplied))return;
  const direction={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[button.dataset.direction];
  shortMove(direction);padTapApplied=true;
}));

window.addEventListener('keydown',event=>{
  // Preserve browser navigation shortcuts such as Alt+Left while playing.
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  advanceLiteratureInput();
  if(quitOpen){if(event.key==='Escape'){event.preventDefault();cancelQuit();}else if(event.key==='Tab')trapModalFocus(event);return;}
  if(utilityOrigin){if(event.key==='Escape'){event.preventDefault();closeUtilityFromControl();}else if(event.key==='Tab')trapModalFocus(event);return;}
  if(replayOpen){if(event.key==='Escape'){event.preventDefault();closeReplay();}else if(event.key==='Tab')trapModalFocus(event);return;}
  if(homeConfirmOpen){if(event.key==='Escape'){event.preventDefault();cancelHome();}else if(event.key==='Tab')trapModalFocus(event);return;}
  if(state==='tutorial'&&['ArrowLeft','ArrowRight'].includes(event.code)){event.preventDefault();if(!event.repeat)moveTutorialPage(event.code==='ArrowLeft'?-1:1);return;}
  if(['Enter','Space'].includes(event.code)&&event.target.closest?.('.status-menu-button'))return;
  if(state==='exchange'&&exchangeUI){if(exchangeUI.key(event))return;}
  const movement=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'];
  if(event.code==='Escape'){
    if(!$('arcade-reset-overlay').hidden){event.preventDefault();closeArcadeReset();return;}
    if(state==='naming'){event.preventDefault();cancelCharacterName();return;}
    if(state==='select'&&characterMode){event.preventDefault();returnToArcadeTitle();return;}
    if(state==='tutorial'){event.preventDefault();if(!returnFromHowTo())setState('briefing');return;}
    if(state==='help'){event.preventDefault();resumeFromHelp();return;}
    if(!$('hint-overlay').hidden){closeExtra('hint-overlay');return;}
    if(state==='pursuit-report'){event.preventDefault();setState('briefing');hud();return;}
    if(state==='pursuit-capture-report'){event.preventDefault();finishPursuitCaptureReport();return;}
    if(['welcome','feedback','stage'].includes(state))return;
    if(!$('puzzle-overlay').hidden){closeExtra('puzzle-overlay');return;}
    if(!$('card-overlay').hidden){closeCard();return;}
    if(!$('reset-overlay').hidden){closeExtra('reset-overlay');return;}
    if(!$('collection-overlay').hidden){closeExtra('collection-overlay');return;}
    if(state==='playing'&&isPursuit()&&game.enlargedClue){game.closeClue();hud();return;}
    if(['playing','countdown','exchange'].includes(state))pause();else if(state==='paused')resume();return;
  }
  if(state==='playing'&&isPursuit()){
    if(movement.includes(event.code)){
      event.preventDefault();
      if(!event.repeat){const d=keyDirections[event.code];game.moveSelection(d.x,d.y);hud();}
      return;
    }
    if(['Space','Enter','KeyJ','KeyE'].includes(event.code)){
      if(event.target.closest?.('button')&&['Space','Enter'].includes(event.code))return;
      event.preventDefault();
      if(!event.repeat){unlockAudio();game.act();hud();}
      return;
    }
  }
  if(state==='playing'&&isCinema()){
    if(movement.includes(event.code)){event.preventDefault();if(!event.repeat){const d=keyDirections[event.code];game.selectByOffset(d.y||d.x);hud();}return;}
    if(['Space','KeyE','KeyJ','Enter'].includes(event.code)){if(event.target.closest?.('.cinema-choice-hit'))return;event.preventDefault();if(!event.repeat){game.act();hud();}return;}
  }
  if(state==='playing'&&isCityHall()){
    if(['Space','KeyE','KeyJ'].includes(event.code)&&!(event.code==='Space'&&event.target.closest?.('button'))){event.preventDefault();if(!event.repeat)cityHallAction();return;}
    if(event.code==='KeyL'){event.preventDefault();if(!event.repeat)flash();return;}
    if(movement.includes(event.code)){event.preventDefault();if(!event.repeat){const d=keyDirections[event.code];game.selectByOffset(d.y||d.x);hud();}return;}
  }
  if(state==='playing'&&activePlace==='conservation'&&event.code==='KeyR'){event.preventDefault();if(!event.repeat){game.rotate();hud();}return;}
  if(state==='playing'&&isField()&&['Space','KeyJ','KeyE','KeyL','Digit1','Digit2','Digit3'].includes(event.code)){event.preventDefault();if(!event.repeat){if(event.code==='KeyL')flash();else if(event.code.startsWith('Digit')){if(activePlace==='garden'){game.goRoom(Number(event.code.at(-1))-1);hud();}}else{game.beginAction();hud();}}return;}
  if(state==='playing'&&isMonastery()&&['Space','KeyJ','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(event.code==='KeyL'){if(!event.repeat)flash();}else game.beginBalance();hud();return;}
  if(state==='playing'&&isDetective()&&['Space','KeyJ','KeyE','KeyK','KeyH','KeyL'].includes(event.code)){event.preventDefault();advanceLiteratureInput();unlockAudio();if(!event.repeat){if(event.code==='KeyL')flash();else if(event.code==='KeyK'||event.code==='KeyH')game.hide();else game.beginAction();hud();}return;}
  if(state==='playing'&&isZoo()&&['Space','KeyJ','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(event.code==='KeyL'){if(!event.repeat)flash();}else if(!event.repeat)game.beginThrow();hud();return;}
  if(state==='playing'&&isDessert()&&game.finishing){if(event.target.closest?.('.dessert-finish')&&['Space','Enter'].includes(event.code))return;const t=game.finishing;if(['Space','Enter','Digit1','Digit2','Digit3','Escape','KeyL'].includes(event.code)){event.preventDefault();if(!event.repeat){if(event.code==='Escape')game.leaveFinishing();else if(event.code==='KeyL')flash();else if(t.kind==='cookie'&&['Space','Enter'].includes(event.code))game.decorate('stamp');else if(t.kind==='muffin'&&['Space','Enter'].includes(event.code))game.decorate('press');else if(t.kind==='tart'&&event.code.startsWith('Digit'))game.decorate('fruit',Number(event.code.slice(-1))-1);hud();}return;}}
  if(state==='playing'&&(isDessert()||isAI()||isLiterature())&&['Space','KeyJ','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(!event.repeat){if(event.code==='KeyL')flash();else game.act();hud();}return;}
  if(state==='playing'&&isDream()&&['Space','KeyK','KeyJ','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(!event.repeat){if(event.code==='KeyL')flash();else if(event.code==='Space'||event.code==='KeyK')game.jump();else game.act();hud();}return;}
  if(state==='playing'&&isNewspaper()&&['Space','KeyJ','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(!event.repeat){if(event.code==='KeyL')flash();else game.act();hud();}return;}
  if(state==='playing'&&isLanguage()&&['Space','KeyJ','KeyK','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(!event.repeat){if(event.code==='KeyL')flash();else if(event.code==='KeyE'||event.code==='KeyJ')game.act();else game.jump();hud();}return;}
  if(state==='playing'&&isWriter()&&['Space','KeyJ','KeyK','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(!event.repeat){if(event.code==='KeyL')flash();else if(event.code==='KeyE')game.act();else game.jump();hud();}return;}
  if(state==='playing'&&isSpace()&&['Space','KeyJ','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(!event.repeat){if(event.code==='KeyL')flash();else{game.brake();hud();}}return;}
  if(state==='playing'&&isRobot()&&['Space','KeyJ','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(!event.repeat){if(event.code==='KeyL')flash();else{game.work();hud();}}return;}
  if(state==='playing'&&isTemple()&&event.code==='KeyE'){event.preventDefault();if(!event.repeat){clearInput();game.interact();hud();}return;}
  if(state==='playing'&&isTemple()&&event.code==='KeyL'){event.preventDefault();if(!event.repeat)flash();return;}
  if(state==='playing'&&isHistory()&&['Space','KeyJ','KeyE','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(event.code==='Space'||event.code==='KeyJ'){if(!event.repeat)game.hammer();}else if(event.code==='KeyE'){if(!event.repeat){clearInput();game.interact();hud();}}else if(!event.repeat)flash();return;}
  if(state==='playing'&&isMuseum()&&['Space','KeyJ','KeyK','KeyL'].includes(event.code)){event.preventDefault();unlockAudio();if(event.code==='Space'||event.code==='KeyJ'){pressed.add('KeyJ');if(!event.repeat)game.shoot();}else if(event.code==='KeyK'){if(!event.repeat)game.jump();}else if(!event.repeat)flash();return;}
  if(state==='playing'&&(movement.includes(event.code)||event.code==='Space')){
    event.preventDefault();unlockAudio();
    if(event.code==='Space'){if(!event.repeat)flash();}else {pressed.add(event.code);if(!event.repeat)keyHadMotion.set(event.code,false);}
  }
  if(event.key==='Tab')trapModalFocus(event);
});
window.addEventListener('keyup',event=>{
  if(isField()&&['Space','KeyJ','KeyE'].includes(event.code)){event.preventDefault();advanceLiteratureInput();if(state==='playing')game?.releaseAction();else game?.cancelAction();hud();}
  if(isMonastery()&&['Space','KeyJ','KeyE'].includes(event.code)){event.preventDefault();advanceLiteratureInput();game?.releaseBalance();hud();}
  if(isDessert()&&game?.finishing?.kind==='muffin'&&['Space','Enter'].includes(event.code)){event.preventDefault();if(state==='playing')game.decorate('release');hud();}
  if(isDetective()&&['Space','KeyJ','KeyE'].includes(event.code)){event.preventDefault();advanceLiteratureInput();game.releaseAction();hud();}
  if(isZoo()&&['Space','KeyJ','KeyE'].includes(event.code)){event.preventDefault();advanceLiteratureInput();if(state==='playing')game?.releaseThrow();else game?.cancelThrow();}
  advanceLiteratureInput();
  if(state==='exchange'&&exchangeUI)exchangeUI.keyup();
  if(state==='playing' && pressed.has(event.code) && !keyHadMotion.get(event.code) && keyDirections[event.code])shortMove(keyDirections[event.code]);
  if(event.code==='Space')pressed.delete('KeyJ');
  pressed.delete(event.code);keyHadMotion.delete(event.code);
});
function input() {
  return {shoot:isMuseum()&&(shootHeld||pressed.has('KeyJ')),x:padInput.x+(pressed.has('ArrowRight')||pressed.has('KeyD')?1:0)-(pressed.has('ArrowLeft')||pressed.has('KeyA')?1:0),y:padInput.y+(pressed.has('ArrowDown')||pressed.has('KeyS')?1:0)-(pressed.has('ArrowUp')||pressed.has('KeyW')?1:0)};
}

function pieceStyle(card){return `--piece-x:${card.column*50}%;--piece-y:${card.row*50}%;`;}
function drawClues(container) {
  container.innerHTML=puzzleTiles(progress.clues).map(card=>
    `<button class="clue-card ${card.owned?'':'locked'}" data-card="${card.id}" ${card.owned?'':'disabled'} aria-label="${cardPositionLabel(card.id)}, ${card.owned?'수집':'미수집'}"><img class="clue-back" src="${CLUE_CARD_URL}" alt="">${card.owned?'':'<small>미수집</small>'}</button>`
  ).join('');
}
function openPuzzle(){
  document.querySelector('.puzzle-placeholder').textContent=CLUE_PUZZLES[activePlace]?.prompt||(isWorkshop()?'완성한 그림 속 '+(activePlace==='datacenter'?'컴퓨터':'복원 도구')+'의 이름을 찾아보세요.':isField()?(isPhoto()?'완성한 그림 속 촬영 도구의 이름을 찾아보세요.':'완성한 그림 속 원예 도구의 이름을 찾아보세요.'):isMonastery()?'사찰에서 소리를 내는 이 물건의 이름을 찾아보세요.':isDetective()?'증거를 모아 완성한 물건의 이름을 찾아보세요.':isDessert()?'그림 속 디저트의 이름을 찾아보세요.':'그림 조각을 모아 정답을 찾아보세요.');
  $('puzzle-grid').innerHTML=puzzleTiles(progress.clues).map(card=>
    `<div class="puzzle-tile ${card.owned?'owned':'missing'}" style="${pieceStyle(card)}" role="img" aria-label="${cardPositionLabel(card.id)} ${card.owned?'그림 조각':'빈칸'}">${card.owned?'':`<span><img src="${CLUE_CARD_URL}" alt=""><small>미수집</small></span>`}</div>`
  ).join('');
  $('puzzle-count').textContent=`${progress.clues.length} / 9장 조합`;
  $('puzzle-note').textContent=progress.clues.length===9?'아홉 조각이 모두 모여 하나의 그림이 되었어요!':`모으지 못한 ${9-progress.clues.length}칸은 비워 두었어요.`;
  openExtra('puzzle-overlay','close-puzzle');
}
$('combine-button').addEventListener('click',openPuzzle);
$('home-combine-button').addEventListener('click',openPuzzle);
$('close-puzzle').addEventListener('click',()=>closeExtra('puzzle-overlay'));
function queueFinish(result){
 if(!finishTransition.start(result))return;trackRunScore();
 if(arcadeMode)recordArcadeResult(endReason==='leave');
 // Use wall time: a busy rendering frame must not turn one second into several.
 clearTimeout(finishTimeout);const pending=finishTransition.pending;
 finishTimeout=setTimeout(()=>{if(state!=='ending'||finishTransition.pending!==pending)return;const ready=finishTransition.update(finishTransition.seconds);if(ready)presentCompletedRun(ready);},finishTransition.seconds*1000);
 clearTimeout(toastTimeout);$('game-toast').classList.remove('show');$('history-message').hidden=true;
 if(!result.survived&&!isMuseum()&&!isHistory()&&!isExchange()&&!isTemple()&&!isRobot()&&!isSpace()&&!isWriter()&&!isLanguage()&&!isNewspaper()&&!isDream()&&!isLiterature()&&!isZoo()&&!isAI()&&!isDessert()&&!isDetective()&&!isMonastery()&&endReason!=='leave')game.health=0;
 if(arcadeMode){setState('ending');hud();return;}
 const usable=keepsClues(placeId(activePlace),result,endReason);
 const rec=runRecord();if(rec){if(isCinema())rec.answered=game.answers.length;if(game.runPlan)rec.runPlan=[...game.runPlan];if(isMemory())rec.revisits=game.revisits;if(isPursuit())Object.assign(rec,{captured:game.captured,round:game.round,attemptsUsed:game.attemptsUsed,flashes:game.flashes,trace:game.trace.map(leg=>({...leg})),traceRule:PURSUIT_TRACE_RULE});if(!isExchange())Object.assign(rec,{clueSources:[...game.clueSources],clueRule:'count-v1'});rec.phase=usable?'result':'briefing';rec.survived=result.survived;rec.elapsed=result.elapsed;if(isMonastery())Object.assign(rec,{lit:[...game.clueSources],mistakes:game.mistakes,flashes:game.flashes});if(isDetective())Object.assign(rec,{room:game.roomIndex,caught:game.caught,flashes:game.flashes,evidence:game.rooms.flatMap(r=>r.evidence.filter(e=>e.collected).map(e=>e.id))});if(isTemple()){rec.reachedIthaca=game.reachedIthaca;rec.delays=game.delays;}if(isWriter())rec.reachedCastle=game.reachedCastle;if(usable){progress.clues=[...game.banked];persist();}persistJourney();}
 setState('ending');hud();
}
function presentCompletedRun(result){
 if(arcadeMode){showArcadeResult(result);return;}
 if(isPursuit()&&endReason!=='leave'&&game.captured===true){showPursuitCaptureReport();return;}
 showResult(result);
}
function showPursuitReport(){
 $('pursuit-report-name').textContent=`${character.name} 지리전문수사관님`;
 setState('pursuit-report');hud();
 $('pursuit-report-title').focus({preventScroll:true});
}
$('pursuit-report-continue').addEventListener('click',()=>{
 if(state!=='pursuit-report')return;
 unlockAudio();beginCountdown();
});
function showPursuitCaptureReport(){
 $('pursuit-capture-report-name').textContent=`${character.name} 지리전문수사관님`;
 const city=game.arrival?.city?.name;
 $('pursuit-capture-report-details').textContent=city
  ? city+'에서 현지 수사팀과 함께 범인을 체포하고, 황금 나침반을 되찾았습니다.'
  : '현지 수사팀과 함께 범인을 체포하고, 황금 나침반을 되찾았습니다.';
 setState('pursuit-capture-report');hud();
 $('pursuit-capture-report-title').focus({preventScroll:true});
}
function finishPursuitCaptureReport(){
 if(state!=='pursuit-capture-report')return;
 showResult({survived:true,elapsed:game.elapsed,found:[...game.banked]});
}
$('pursuit-capture-report-continue').addEventListener('click',finishPursuitCaptureReport);
function showFailure(){queueFinish({survived:false,elapsed:game?.elapsed||0,found:[...(game?.banked||[])]});}
function presentFailure(){
  if(!isField()&&!isMuseum()&&!isHistory()&&!isExchange()&&!isTemple()&&!isRobot()&&!isSpace()&&!isWriter()&&!isLanguage()&&!isNewspaper()&&!isDream()&&!isLiterature()&&!isZoo()&&!isAI()&&!isDessert()&&!isDetective()&&!isMonastery()&&endReason!=='leave')game.health=0;
  clearTimeout(toastTimeout);$('game-toast').classList.remove('show');
  progress.clues=[];if(activePlace==='aquarium')progress.clueSources=[];persist();
  const rec=runRecord();if(rec){rec.phase='briefing';rec.survived=false;rec.elapsed=0;persistJourney();}
  $('failure-title').textContent=endReason==='leave'?'게임을 중단했어요':isMuseum()?'물감에 뒤덮였어요!':'잠수함이 부서졌어요!';
  $('failure-message').textContent=isMuseum()&&game.hitColor?`${COLORS[game.hitColor-1].name} 몬스터에 닿았어요. 다시 도전해 주세요.`:'다시 도전하거나 지난 장소를 골라요.';
  if(isHistory()){ $('failure-title').textContent=endReason==='leave'?'게임을 중단했어요':game.failureReason==='timeout'?'타임머신을 놓쳤어요!':'붙잡히고 말았어요!';$('failure-message').textContent='박물관에서 다시 시작해요. 이번 여행의 단서는 초기화됩니다.';$('history-message').hidden=true;}
  if(isTemple()){$('failure-title').textContent=endReason==='leave'?'게임을 중단했어요':game.failureReason==='timeout'?'귀환 시간이 지났어요':'귀환에 실패했어요';$('failure-message').textContent='신전에서 다시 출발해요. 공격의 예고를 보고 피해 보세요.';}
  if(isLanguage()){$('failure-title').textContent='언어 실험을 중단했어요';$('failure-message').textContent='다시 도전하면 첫 번째 실험실부터 시작해요.';$('history-message').hidden=true;}
  if(isWriter()){$('failure-title').textContent='이야기 속 도전을 중단했어요';$('failure-message').textContent='다시 도전하면 첫 번째 이야기부터 시작해요.';$('history-message').hidden=true;}
  if(isSpace()){$('failure-title').textContent='우주유영을 중단했어요';$('failure-message').textContent='다시 도전하면 단서를 처음부터 모아요.';$('history-message').hidden=true;}
  if(isAI()){$('failure-title').textContent='출력을 중단했어요';$('failure-message').textContent='다시 도전하거나 지난 장소를 골라요.';$('history-message').hidden=true;}
  if(isLiterature()){$('failure-title').textContent='문학관 게임을 중단했어요';$('failure-message').textContent='다시 도전하거나 지난 장소를 골라요.';$('history-message').hidden=true;}
  if(isZoo()){$('failure-title').textContent='동물원 게임을 중단했어요';$('failure-message').textContent='다시 도전하거나 지난 장소를 골라요.';$('history-message').hidden=true;}
  if(isDream()){$('failure-title').textContent='꿈속 게임을 중단했어요';$('failure-message').textContent='다시 도전하거나 지난 장소를 골라요.';$('history-message').hidden=true;}
  if(isMonastery()){$('failure-title').textContent='연등 달기를 중단했어요';$('failure-message').textContent='산문에서 연등을 받아 다시 출발할 수 있어요.';$('history-message').hidden=true;}
  if(isDetective()){$('failure-title').textContent='조사를 중단했어요';$('failure-message').textContent='탐정사무소에서 새 조사로 다시 시작할 수 있어요.';}
  if(isDessert()){$('failure-title').textContent='디저트 만들기를 중단했어요';$('failure-message').textContent='다시 도전하면 세 오븐이 처음부터 굽기 시작해요.';$('history-message').hidden=true;}
  if(isNewspaper()){$('failure-title').textContent='신문 편집을 중단했어요';$('failure-message').textContent='다시 도전하면 새 기사로 시작해요.';$('history-message').hidden=true;}
  if(isRobot()){$('failure-title').textContent='수리를 중단했어요';$('failure-message').textContent='다시 도전하면 부품과 단서를 처음부터 모아요.';$('history-message').hidden=true;}
  if(isPursuit()){
   $('failure-title').textContent='추적을 중단했어요';
   $('failure-message').textContent='다시 도전하면 새로운 도시들을 추적해요.';
  }
  if(isMemory()){$('failure-title').textContent='그림 조사를 중단했어요';$('failure-message').textContent='다시 도전하면 새 그림 세 장을 뽑아요.';}
  if(isCinema()){$('failure-title').textContent='영화 관람을 중단했어요';$('failure-message').textContent='다시 도전하면 새로운 아홉 편이 상영돼요.';}
  if(isCityHall()){$('failure-title').textContent='시청 결재를 중단했어요';$('failure-message').textContent='다시 도전하면 새 안건으로 시작해요.';}
  if(isExchange()){$('failure-title').textContent=endReason==='leave'?'게임을 중단했어요':'투자 자본이 소진됐어요';$('failure-message').textContent=endReason==='leave'?'100만원으로 다시 시작할 수 있어요.':'100만원으로 다시 시작할 수 있어요. 더블업은 손실도 두 배로 늘어나요.';}
  setState('failed');hud();$('failure-title').focus({preventScroll:true});tone(180,.2);
}
function retryAdventure(){restartCurrentGame();}
$('failure-retry').addEventListener('click',retryAdventure);
function showResult(result) {
  if(!keepsClues(placeId(activePlace),result,endReason)){presentFailure();return;}

  if(journey){const rec=runRecord();rec.phase='result';rec.elapsed=result.elapsed;rec.survived=result.survived;persistJourney();}
  progress.clues=[...game.banked].sort((a,b)=>a-b);persist();clearTimeout(toastTimeout);$('game-toast').classList.remove('show');
  const complete=progress.clues.length===9;
  $('result-title').textContent=result.survived?(complete?'모든 단서를 찾았어요!':'게임을 마쳤어요!'):endReason==='leave'?'잠시 쉬어 가도 좋아요':'이번에 모은 단서예요';
  $('result-description').textContent=result.survived?'안전하게 돌아왔어요. 찾은 단서를 확인해 보세요.':'이번에 찾은 단서로 그림을 조합해 보세요.';
  if(isMuseum()){
    $('result-title').textContent=complete?'모든 색을 되찾았어요!':'되찾은 색의 단서예요';
    $('result-description').textContent=`색 ${progress.clues.length}개와 단서 ${progress.clues.length}장을 되찾았어요.`;
  }
  if(isHistory()){$('history-message').hidden=true;$('result-title').textContent=result.survived?'박물관에 무사히 돌아왔어요!':'여행에서 모은 단서예요';$('result-description').textContent=`시간 여행에서 단서 ${progress.clues.length}장을 찾았어요.`;}
  if(isTemple()){$('result-title').textContent=game.reachedIthaca?'이타카에 도착했어요!':'귀환길의 단서를 모았어요!';$('result-description').textContent=`귀환길에서 단서 ${progress.clues.length}장을 찾았어요.`;}
  if(isAI()){journey.ai.album=game.album.map(w=>({...w}));persistJourney();$('history-message').hidden=true;$('result-title').textContent=complete?'아홉 작품을 모두 출력했어요!':'AI상상출력실에서 모은 단서예요';$('result-description').textContent='모은 단서 '+progress.clues.length+'장으로 그림을 조합해 보세요.';}
  if(isLiterature()){$('history-message').hidden=true;$('result-title').textContent=complete?'아홉 명작의 단서를 모두 찾았어요!':'문학관에서 모은 단서예요';$('result-description').textContent=`${result.survived?'':'체력을 모두 썼어요. '}단서 ${progress.clues.length}장으로 그림을 조합해 보세요.`;}
  if(isZoo()){$('history-message').hidden=true;$('result-title').textContent=complete?'동물 친구들의 단서를 모두 모았어요!':'동물원에서 모은 단서예요';$('result-description').textContent=`동물원에서 받은 단서 ${progress.clues.length}장을 조합해 보세요.`;}
  if(isDream()){$('history-message').hidden=true;$('result-title').textContent='꿈에서 깨어났어요';$('result-description').textContent=`꿈속에서 모은 단서 ${progress.clues.length}장으로 그림을 조합해 보세요.`;}
  if(isField()&&!isPursuit()){Object.assign(journey[activePlace],{room:game.room,flashes:game.flashes});persistJourney();$('history-message').hidden=true;$('result-title').textContent=(isWorkshop()||isGym()||isCinema()||isMemory())?(complete?FIELD[activePlace].result:FIELD[activePlace].name+'에서 모은 단서예요'):complete?(isPhoto()?'아홉 사진을 모두 찍었어요!':'아홉 꽃밭을 모두 피웠어요!'):(isPhoto()?'사진관에서 모은 단서예요':'식물원에서 모은 단서예요');$('result-description').textContent=isMemory()?'달라진 곳을 찾아 단서 '+progress.clues.length+'장을 모았어요.':isCinema()?'맞힌 영화 '+progress.clues.length+'편에서 얻은 단서를 조합해 보세요.':isGym()?'공을 피하며 모은 단서 '+progress.clues.length+'장으로 그림을 조합해 보세요.':isWorkshop()?FIELD[activePlace].unit+' '+progress.clues.length+'개에 담긴 그림을 확인해요.':isPhoto()?'성공한 사진 '+progress.clues.length+'장에 담긴 그림을 확인해요.':'피운 꽃밭 '+progress.clues.length+'곳의 그림을 확인해요.';}
  if(isPursuit()){
   $('result-title').textContent=game.captured===true?'범인을 붙잡았어요':'범인을 놓쳤어요';
   $('result-description').textContent='도시를 맞혀 모은 단서 '+progress.clues.length+'장을 이번 수사 기록에 남겼어요.';
  }
  if(isMonastery()){Object.assign(journey.monastery,{lit:[...game.clueSources],mistakes:game.mistakes,flashes:game.flashes});persistJourney();$('history-message').hidden=true;$('result-title').textContent=complete?'아홉 연등을 모두 걸었어요!':'산사에서 모은 단서예요';$('result-description').textContent='연등을 걸고 단서 '+progress.clues.length+'장을 모았어요.';}
  if(isDetective()){$('history-message').hidden=true;$('result-title').textContent=complete?'사라진 원고의 증거를 모두 찾았어요!':'확보한 증거를 확인해요';$('result-description').textContent='세 방에서 모은 증거 '+progress.clues.length+'장으로 그림을 조합해 보세요.';}
  if(isDessert()){journey.dessert.pastries=game.packages.map(p=>p.kind);persistJourney();$('history-message').hidden=true;$('result-title').textContent=complete?'아홉 상자를 모두 완성했어요!':'공방의 마감 시간이에요';$('result-description').textContent='디저트 '+progress.clues.length+'상자를 포장하고 단서 '+progress.clues.length+'장을 받았어요.';}
  if(isNewspaper()){$('history-message').hidden=true;$('result-title').textContent=complete?'아홉 기사를 모두 발행했어요!':'마감 시간이에요';$('result-description').textContent=`기사 ${progress.clues.length}개를 인쇄하고 단서 ${progress.clues.length}장을 받았어요.`;}
  if(isLanguage()){$('history-message').hidden=true;$('result-title').textContent=complete?'아홉 낱말의 단서를 모두 찾았어요!':'언어연구소에서 모은 단서예요';$('result-description').textContent=`단서 ${progress.clues.length}장으로 그림을 조합해 보세요.`;}
  if(isWriter()){$('history-message').hidden=true;$('result-title').textContent=game.reachedCastle?'에메랄드 성에 도착했어요!':complete?'여섯 이야기의 단서를 모두 찾았어요!':'이야기 속 단서를 모았어요!';$('result-description').textContent=`단서 ${progress.clues.length}장으로 그림을 조합해 보세요.`;}
  if(isSpace()){$('history-message').hidden=true;$('result-title').textContent=complete?'모든 관측 기록을 찾았어요!':'우주에서 단서를 모았어요!';$('result-description').textContent=`단서 ${progress.clues.length}장을 회수했어요. 그림을 조합해 보세요.`;}
  if(isRobot()){$('history-message').hidden=true;$('result-title').textContent=complete?'모든 로봇이 깨어났어요!':'고친 로봇들의 선물이에요!';$('result-description').textContent=`로봇 ${progress.clues.length}대를 고치고 단서 ${progress.clues.length}장을 받았어요.`;}
  $('result-time').innerHTML=`${Math.floor(result.elapsed)}<small>초</small>`;
  $('result-new').innerHTML=`+${result.found.length}<small>장</small>`;
  document.querySelector('.result-stats>div:first-child>span').textContent=isExchange()?'최종 투자 자본':isPursuit()?'비행 횟수':'게임 시간';
  if(isPursuit()){
   const current=runRecord()?.traceRule===PURSUIT_TRACE_RULE;
   const total=current?game.attemptsUsed:Math.max(game.trace.length,game.banked.size);
   $('result-time').innerHTML=total+(current?'<small> / '+PURSUIT.attempts+'</small>':'<small>회</small>');
  }
  if(isExchange()){$('result-title').textContent='투자의 결실을 모았어요!';$('result-description').textContent=`단서 ${progress.clues.length}장을 구입했어요. 모은 그림으로 문제를 풀어 보세요.`;$('result-time').innerHTML=`${(game.ledger.at(-1)?.after||game.cash).toLocaleString('ko-KR')}<small>만원</small>`;}
  if(isCityHall()){
   $('result-title').textContent='여섯 안건의 결재를 마쳤어요!';
   $('result-description').textContent=`최종 지지율 ${game.approval}%로 단서카드 ${progress.clues.length}장을 얻었어요.`;
   document.querySelector('.result-stats>div:first-child>span').textContent='최종 지지율';
   $('result-time').innerHTML=`${game.approval}<small>%</small>`;
  }
  $('answer-form').hidden=false;
  $('result-total').textContent=String(progress.clues.length);
  drawClues($('clue-grid'),result.found);
  $('retry-note').textContent='이 게임을 다시 하면 단서를 새로 모아요.';
  setState('result');$('result-content').scrollTop=0;hud();
  if(result.survived){tone(523,.18);tone(659,.18,.13);tone(784,.3,.26);}else tone(330,.2);
  window.dispatchEvent(new CustomEvent(isField()||isCityHall()?activePlace+':complete':isMonastery()?'monastery:complete':isDetective()?'detective:complete':isDessert()?'dessert:complete':isAI()?'ai:complete':isZoo()?'zoo:complete':isLiterature()?'literature:complete':isDream()?'dream:complete':isNewspaper()?'newspaper:complete':isLanguage()?'language:complete':isWriter()?'writer:complete':isSpace()?'space:complete':isRobot()?'robot:complete':isTemple()?'temple:complete':isExchange()?'exchange:complete':isHistory()?'history:complete':isMuseum()?'museum:complete':'aquarium:complete',{detail:{survived:result.survived,elapsed:result.elapsed,newClues:[...result.found],collectedClues:[...progress.clues],character:character.id}}));
}
$('retry-button').addEventListener('click',retryAdventure);
let homeConfirmOpen=false,homeFromReplay=false;
function returnHome(){
 if(homeConfirmOpen)return;homeFromReplay=replayOpen;if(replayOpen)closeReplay();clearInput();homeConfirmOpen=true;
 openExtra('home-confirm-overlay','home-confirm-no');
 for(const el of $('app').children)if(el.id!=='home-confirm-overlay'){el.dataset.homeWasInert=String(el.inert);el.inert=true;}
}
function cancelHome(){
 for(const el of $('app').children)if(el.dataset.homeWasInert!==undefined){el.inert=el.dataset.homeWasInert==='true';delete el.dataset.homeWasInert;}
 homeConfirmOpen=false;closeExtra('home-confirm-overlay');if(homeFromReplay){homeFromReplay=false;openReplay();}
}
$('home-confirm-no').addEventListener('click',cancelHome);
$('home-confirm-yes').addEventListener('click',()=>{
 homeFromReplay=false;cancelHome();returnToArcadeTitle();
});
$('replay-home').addEventListener('click',returnHome);
$('home-button').addEventListener('click',openReplay);$('failure-home').addEventListener('click',openReplay);
function openReplay(){
 if(replayOpen)return;
 const focused=document.activeElement;
 const options=replayPlaces(journey||{stage:activePlace});
 replayOpen=true;replayScreen=freezePlayForModal();
 const current=placeInfo(activePlace);
 $('replay-route').innerHTML=options.map(p=>`<li><button data-replay-place="${p.id}" class="replay-place${p.id===current.id?' is-current':''}"${p.id===current.id?' aria-current="location"':''}><span class="replay-node">${placeIcon(p.id)}</span><strong>${p.name}</strong>${p.id===current.id?'<small class="replay-current-label">현재 장소</small>':''}<span class="replay-arrow" aria-hidden="true">→</span></button></li>`).join('');
 openExtra('replay-overlay','replay-cancel',focused);
 for(const el of $('app').children)if(el.id!=='replay-overlay'){el.dataset.replayWasInert=String(el.inert);el.inert=true;}
}
function closeReplay(){
 if(!replayOpen)return;
 for(const el of $('app').children)if(el.dataset.replayWasInert!==undefined){el.inert=el.dataset.replayWasInert==='true';delete el.dataset.replayWasInert;}
 replayOpen=false;
 restorePlayFromModal(replayScreen);replayScreen=null;
 closeExtra('replay-overlay');
}
$('replay-cancel').addEventListener('click',closeReplay);
$('replay-route').addEventListener('click',event=>{
 const place=event.target.closest('[data-replay-place]')?.dataset.replayPlace;
 if(!place||!replayPlaces(journey).some(p=>p.id===place))return;
 const origin={place:placeId(activePlace),screen:replayScreen,game,renderer,clues:[...progress.clues],endReason};
 closeReplay();replayOrigin=origin;replayTarget=place;
 journey.stage=place;persistJourney();showStage();
});
async function restoreReplayOrigin(){
 const origin=replayOrigin;replayOrigin=null;replayTarget=null;
 journey.stage=origin.place;
 if(origin.place==='cityhall')await prepareCityHall();else if(FIELD[origin.place])await prepareField(origin.place);else if(origin.place==='monastery')await prepareMonastery();else if(origin.place==='detective')await prepareDetective();else if(origin.place==='dessert')await prepareDessert();else if(origin.place==='ai')await prepareAI();else if(origin.place==='zoo')await prepareZoo();else if(origin.place==='literature')await prepareLiterature();else if(origin.place==='dream')await prepareDream();else if(origin.place==='newspaper')await prepareNewspaper();else if(origin.place==='language')await prepareLanguage();else if(origin.place==='writer')await prepareWriter();else if(origin.place==='space')await prepareSpace();else if(origin.place==='robot')await prepareRobot();else if(origin.place==='temple')await prepareTemple();else if(origin.place==='exchange')await prepareExchange();else if(origin.place==='history')await prepareHistory();else if(origin.place==='art')await prepareMuseum();else prepareAquarium();
 game=origin.game;renderer=origin.renderer;endReason=origin.endReason;progress.clues=origin.clues;
 if(isExchange())bindExchangeUI();
 if(isCityHall())bindCityHallUI();
 if(origin.screen==='result')showResult({survived:runRecord()?.survived===true,elapsed:game.elapsed,found:origin.clues});
 else if(['paused','playing','countdown','exchange'].includes(origin.screen)||isPursuitMenuInterlude(origin.screen)){lastFrame=performance.now();setState(origin.screen);hud();}
 else presentFailure();
 persistJourney();openReplay();
}
function openExtra(id,focusId,returnFocus=document.activeElement) {focusStack.push(returnFocus);$(id).hidden=false;$(focusId).focus({preventScroll:true});}
function closeExtra(id) {$(id).hidden=true;const previous=focusStack.pop();if(previous?.isConnected)previous.focus({preventScroll:true});}
function freezePlayForModal(){
 const screen=state;
 if(['playing','countdown','exchange'].includes(screen))setState('panel');
 else clearInput();
 return screen;
}
function restorePlayFromModal(screen){
 if(state!=='panel')return;
 lastFrame=performance.now();setState(screen);
}
function openCollection() {
  drawClues($('home-clue-grid'));$('home-collection-count').textContent=`${progress.clues.length} / 9장 수집`;
  openExtra('collection-overlay','close-collection');
}
$('collection-button').addEventListener('click',openCollection);
$('close-collection').addEventListener('click',()=>closeExtra('collection-overlay'));
$('reset-button').addEventListener('click',()=>openExtra('reset-overlay','cancel-reset'));
$('cancel-reset').addEventListener('click',()=>closeExtra('reset-overlay'));
$('confirm-reset').addEventListener('click',()=>{
  progress.clues=[];if(activePlace==='aquarium')progress.clueSources=[];persist();syncCharacters();closeExtra('reset-overlay');drawClues($('home-clue-grid'));$('home-collection-count').textContent='0 / 9장 수집';
});
function openCard(event) {
  const button=event.target.closest('[data-card]');if(!button||button.disabled)return;
  const card=puzzleTiles(progress.clues).find(c=>c.id===Number(button.dataset.card));
  $('card-piece').style.cssText=pieceStyle(card);
  $('card-title').textContent='찾아낸 그림 조각';
  openExtra('card-overlay','close-card');
}
$('clue-grid').addEventListener('click',openCard);$('home-clue-grid').addEventListener('click',openCard);
function closeCard(){closeExtra('card-overlay');}
$('close-card').addEventListener('click',closeCard);
function drawHints(){
  const view=hintView(Math.max(1,scores.get(activePlace).hints,runRecord()?.hintsSeen||0),threePuzzleHints(currentPuzzle()));
  $('hint-list').innerHTML=view.messages.map((message,i)=>`<li><span>힌트 ${i+1}</span><p>${message}</p></li>`).join('');
  $('hint-next').hidden=view.complete;
  $('hint-back').textContent='다시 문제 풀기';
}
$('hint-button').addEventListener('click',()=>{
  if(state!=='result'||!canSolveCollection(placeId(activePlace),runRecord()))return;
  if(journey){const rec=runRecord();rec.hintsSeen=Math.min(3,Math.max(1,rec.hintsSeen||0,scores.get(activePlace).hints));scores.hint(activePlace,rec.hintsSeen);persistJourney();updateResultScore();}
  drawHints();openExtra('hint-overlay','hint-back');
});
$('hint-back').addEventListener('click',()=>closeExtra('hint-overlay'));
$('hint-next').addEventListener('click',()=>{
  const seen=Math.max(runRecord()?.hintsSeen||1,scores.get(activePlace).hints);
  if(seen>=3){closeExtra('hint-overlay');return;}
  runRecord().hintsSeen=seen+1;scores.hint(activePlace,seen+1);persistJourney();updateResultScore();drawHints();$('hint-back').focus();
});
$('answer-form').addEventListener('submit',async event=>{
  event.preventDefault();if(state!=='result'||!canSolveCollection(placeId(activePlace),runRecord())||answerBusy)return;
  const answer=$('answer-input').value;
  if(!answer.trim()){$('answer-help').textContent='정답을 입력해 주세요.';$('answer-input').focus();return;}
  answerBusy=true;$('answer-input').blur();unlockAudio();
  if(checkAnswer(answer,currentPuzzle().answer)){
    scores.solve(activePlace);updateResultScore();
    const nextPlace=followingPlace(activePlace);tone(523,.18);tone(659,.18,.13);tone(784,.3,.26);
    if(!nextPlace)await showMotion('correct','정답이에요!',`${placeInfo(activePlace).name}에 숨은 그림을 완성했어요.`,'지난 게임 보기',()=>{answerBusy=false;setState('result');openReplay();});
    else await showMotion('correct','정답이에요!',`${companion()} 다음 장소로 떠나요.`,'다음 장소로 이동',()=>{answerBusy=false;replayOrigin=null;replayTarget=null;journey.stage=nextPlace;persistJourney();showStage();});
  }else{
    tone(240,.13,0,'triangle');
    await showMotion('wrong','아직 정답이 아니에요','단서를 살펴보고 다시 도전해 보세요.','다시 풀기',()=>{answerBusy=false;$('answer-input').value='';setState('result');$('answer-help').textContent='다른 답을 생각해 볼까요?';});
  }
});
function showStage(){
 const place=placeInfo(journey?.stage||'aquarium');
 drawPlaceEntry($('stage-screen'),{place,character,enterButton:$('museum-enter')});
 setState('stage');$('stage-title').focus({preventScroll:true});
 if(place.id==='aquarium')void loadAquarium().catch(()=>{});
}

function syncCurrentPlaceHeaders(){syncPlaceHeaders(document,activePlace);}
function trackRunScore(){
 if(!game)return;
 if(arcadeMode){syncArcadeCoins();return;}
 const count=game.banked?.size||0;
 if(scoreRun!==game||scoreClues!==count){scoreRun=game;scoreClues=count;scores.finish(activePlace,[...(game.banked||[])]);}
}
function updateResultScore(){
 const row=scores.get(activePlace);
 $('result-score').innerHTML=`<span>게임 ${row.game} / 9 · 문제 ${row.problem} / 6</span><strong>${row.total} / 15점</strong><button type="button" class="icon-button inline-score" data-shell-action="score" aria-label="점수 자세히 보기">${icon('score')}</button>`;
}
function openUtility(kind,trigger){
 if(utilityOrigin||quitOpen||homeConfirmOpen||replayOpen||!game||arcadeMenuExclusions(arcadeMode).includes(kind))return;
 const menu=kind==='menu',score=kind==='score';
 if(menu&&(!canOpenStatusMenu(state)||isExchange()&&exchangeUI?.confirming))return;
 if(menu)trigger.setAttribute('aria-expanded','true');
 utilityOrigin=state;setState('panel');
 $('utility-overlay').dataset.view=kind;
 $('utility-title').textContent=menu?'게임 메뉴':score?'나의 점수':'나의 아이템 가방';
 $('utility-icon').hidden=menu;
 $('utility-icon').innerHTML=menu?'':icon(score?'score':'backpack');
 $('utility-content').innerHTML=menu?statusMenuHTML(arcadeMenuExclusions(arcadeMode)):score?(arcadeMode==='challenge'?arcadeScoreHTML():scoresHTML(scores,activePlace)):emptyInventoryHTML();
 $('utility-close').innerHTML=menu?icon('close'):'돌아가기';
 $('utility-close').setAttribute('aria-label',menu?'메뉴 닫기':'돌아가기');
 if(menu)syncSound();
 openExtra('utility-overlay','utility-close',menu?trigger:undefined);
 for(const el of $('app').children)if(el.id!=='utility-overlay'){el.dataset.utilityWasInert=String(el.inert);el.inert=true;}
}
function closeUtility(){
 if(!utilityOrigin)return;const origin=utilityOrigin;utilityOrigin=null;
 if($('utility-overlay').dataset.view==='menu')$(isExchange()?'ex-menu-button':'menu-button')?.setAttribute('aria-expanded','false');
 for(const el of $('app').children)if(el.dataset.utilityWasInert!==undefined){el.inert=el.dataset.utilityWasInert==='true';delete el.dataset.utilityWasInert;}
 lastFrame=performance.now();setState(origin);closeExtra('utility-overlay');
}
function returnToStatusMenu(){
 if(!menuReturn)return false;
 const origin=menuReturn;
 menuReturn=null;tutorialReturn=null;
 if(state!==origin)setState(origin);
 openUtility('menu',$(isExchange()?'ex-menu-button':'menu-button'));
 return true;
}
function closeUtilityFromControl(){
 if(!utilityOrigin)return;
 const closingMenu=$('utility-overlay').dataset.view==='menu';
 const returnToReport=isPursuitMenuInterlude(utilityOrigin);
 closeUtility();
 if(!closingMenu)returnToStatusMenu();
 else if(!returnToReport)beginCountdown();
}
function openHowTo(){
 if(!(canOpenStatusMenu(state)||['paused','help'].includes(state))||utilityOrigin||quitOpen||replayOpen)return;
 tutorialReturn=state==='help'?(isExchange()?'exchange':'playing'):state;
 showPlayTutorial();
}
function returnFromHowTo(){
 if(returnToStatusMenu())return true;
 if(!tutorialReturn)return false;const origin=tutorialReturn;tutorialReturn=null;
 if(origin==='paused')setState('paused');else beginCountdown(origin==='exchange'?'exchange':'playing');
 hud();return true;
}
function restartCurrentGame(){
 if(!game||homeConfirmOpen||quitOpen||arcadeMode==='challenge')return;
 if(arcadeMode==='practice'){selectArcadePlace(arcadePlace).then(()=>{if(state==='briefing')startFromInstructions();});return;}
 if(utilityOrigin)closeUtility();if(replayOpen)closeReplay();tutorialReturn=null;
 clearTimeout(finishTimeout);finishTransition.reset();answerBusy=false;activeMotion=null;motionNext=null;
 resetAdventure();beginCountdown();
}
function askToQuit(){
 if(quitOpen)return;
 const focused=document.activeElement;
 quitOpen=true;quitScreen=freezePlayForModal();
 openExtra('quit-overlay','quit-no',focused);
}
function cancelQuit(){
 if(!quitOpen)return;
 quitOpen=false;restorePlayFromModal(quitScreen);quitScreen=null;
 closeExtra('quit-overlay');
}
function quitExpedition(){
 if(!quitOpen)return;
 trackRunScore();persistJourney();clearInput();cinemaImages?.movies?.pause();
 if(arcadeMode==='challenge')recordArcadeResult(true);
 if(publicGame&&!arcadeMode){
  cancelQuit();prepareAquarium();game=null;setState('title');
  return;
 }
 setState('closed');document.title='게임 종료';
 // A directly opened browser tab may reject close(); leave no game page behind.
 try{window.close();}catch{}
 setTimeout(()=>{if(!window.closed)location.replace('about:blank');},100);
}
$('utility-close').addEventListener('click',closeUtilityFromControl);
$('quit-no').addEventListener('click',cancelQuit);
$('quit-yes').addEventListener('click',quitExpedition);
const menuHandlers={
 score:()=>openUtility('score'),
 items:()=>openUtility('items'),
 howto:openHowTo,
 help:showHelp,
 restart:restartCurrentGame,
 replay:openReplay,
 quit:askToQuit,
};
document.addEventListener('click',event=>{
 const menuAction=event.target.closest('[data-menu-action]')?.dataset.menuAction;
 if(menuAction&&utilityOrigin&&$('utility-overlay').dataset.view==='menu'&&!arcadeMenuExclusions(arcadeMode).includes(menuAction)){
  if(menuAction==='sound'){toggleSound();return;}
  if(['score','items','howto','help'].includes(menuAction))menuReturn=utilityOrigin;
  closeUtility();menuHandlers[menuAction]?.();
  return;
 }
 const button=event.target.closest('[data-shell-action]');
 if(button?.dataset.shellAction==='menu')openUtility('menu',button);
 else if(button?.dataset.shellAction==='score')openUtility('score');
});

function trapModalFocus(event){
  const ids=['quit-overlay','arcade-reset-overlay','utility-overlay','replay-overlay','name-overlay','home-confirm-overlay','failure-overlay','motion-overlay','pursuit-report-overlay','pursuit-capture-report-overlay','hint-overlay','puzzle-overlay','reset-overlay','card-overlay','collection-overlay','result-overlay','pause-overlay','ai-tutorial-overlay','brief-overlay'];
  const active=ids.map($).find(el=>!el.hidden);if(!active)return;
  const buttons=[...active.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]):not([hidden]),[tabindex="0"]:not([hidden])')];
  const menu=isPursuitMenuInterlude(state)&&!quitOpen&&!homeConfirmOpen&&!replayOpen&&!utilityOrigin?$('menu-button'):null;
  if(menu&&!menu.disabled)buttons.unshift(menu);
  if(!buttons.length)return;
  const first=buttons[0],last=buttons[buttons.length-1];
  if(event.shiftKey&&(document.activeElement===first||!buttons.includes(document.activeElement))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(document.activeElement===last||(!active.contains(document.activeElement)&&document.activeElement!==menu))){event.preventDefault();first.focus();}
}

function frame(timestamp) {
  const dt=lastFrame?Math.min(65,Math.max(0,(timestamp-lastFrame)/1000)):0;
  lastFrame=isMonastery()?Math.max(lastFrame,timestamp):timestamp;
  if(!['help','paused','panel','closed','countdown','city-summary','result','failed','stopped'].includes(state))animationTime+=dt;
  if(state==='naming'&&nameMotion)nameMotion.draw(dt);
  if(!renderer||ARCADE_SCREENS.has(state)||['title','loading','select','naming','stage','closed'].includes(state)){requestAnimationFrame(frame);return;}
  layout.prepare(game,activePlace);
  if(state==='tutorial'&&playLesson){if(!document.hidden)renderPlayTutorial(Math.min(dt,.2));requestAnimationFrame(frame);return;}
  if(state==='exchange'&&!homeConfirmOpen){
   exchangeUI?.update(dt);
   if(arcadeMode&&game.phase==='finished')settleArcadeExchange();
  }
  if(state==='countdown'&&!homeConfirmOpen){
    countdownLeft-=dt;
    const count=Math.max(1,Math.ceil(countdownLeft));
    if(count!==lastCount){lastCount=count;$('count-number').textContent=String(count);$('count-number').classList.remove('pop');void $('count-number').offsetWidth;$('count-number').classList.add('pop');tone(480,.1);}
    if(countdownLeft<=0){setState(countdownTarget);tone(850,.18);}
  }else if(state==='playing'&&!homeConfirmOpen){
    updatePlay(dt);if(arcadeMode)syncArcadeCoins();hud();
  }
  renderer.draw(game,character,animationTime,['help','paused','panel','closed','countdown'].includes(state)||(['failed','stopped'].includes(state)&&!isMuseum())?0:dt,isCinema()?state==='playing'&&!homeConfirmOpen&&!document.hidden:state==='playing');
  layout.present(game,activePlace,dt);
  if(isPursuit())renderer.presentZoom(game);
  const status=$('camera-status');status.hidden=!(isMuseum()&&game?.freezeLeft>0&&!game.ended);if(!status.hidden)status.textContent=`Ⅱ 몬스터만 정지 ${game.freezeLeft.toFixed(1)}초`;

  if(activeMotion && ['welcome','feedback'].includes(state)){activeMotion.draw(dt);if(activeMotion.done)$('motion-next').disabled=false;}
  if(['briefing','help'].includes(state)){
    briefingAge+=Math.min(dt,.1);
    const c=$('brief-sub').getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,180,115);
    if(!isCityHall()){c.fillStyle='#e2f4ec';c.beginPath();c.ellipse(90,58,54,47,0,0,Math.PI*2);c.fill();}
    if(isCityHall()||isField()){renderer.briefing(c,character,briefingAge);}
    else if(isMonastery()){renderer.briefing(c,character,briefingAge);}
    else if(isDetective()){renderer.briefing(c,character,briefingAge);}
    else if(isDessert()){renderer.briefing(c,character,briefingAge);}
    else if(isAI()){renderer.briefing(c,character,briefingAge);}
    else if(isZoo()){renderer.briefing(c,character,briefingAge);}
    else if(isLiterature()){renderer.briefing(c,character,briefingAge);}
    else if(isDream()){renderer.briefing(c,character,briefingAge);}
    else if(isNewspaper()){renderer.briefing(c,character,briefingAge);}
    else if(isLanguage()){renderer.briefing(c,character,briefingAge);}
    else if(isWriter()){renderer.briefing(c,character,briefingAge);}
    else if(isSpace()){renderer.briefing(c,character,briefingAge);}
    else if(isRobot()){renderer.briefing(c,character,briefingAge);}
    else if(isTemple()){renderer.briefing(c,character,briefingAge);}
    else if(isHistory()){
      renderer.briefing(c,character,briefingAge);
    }else if(isMuseum()){
      const cycle=briefingAge%2.36,shotAge=cycle<.36?cycle:99;
      renderer.hero(character,{x:66,y:108,face:1,shotFace:1,vy:0,shotAge,walking:false},animationTime,c,1.5);
      if(cycle>=.18&&cycle<.55){const x=101+(cycle-.18)*180;c.fillStyle='#fff4be';c.strokeStyle='#9b704a';c.lineWidth=1;c.beginPath();c.arc(x,64,3.5,0,Math.PI*2);c.fill();c.stroke();}
    }else if(isExchange()){
      renderer.briefing(c,character,briefingAge);
    }
    else drawSubmarine(c,images,character,93,54+Math.sin(animationTime*1.8)*2,1.6,3,animationTime);
  }
  requestAnimationFrame(frame);
}

async function boot(){
 try {
  if(entry==='character'||entry==='title'||(!entry&&!trial))setState('title');
  else await restoreAdventureScreen();
  connectTitleModes(mode=>{
   if(state!=='title')return;
   unlockAudio();
   chooseMode(mode);
  });
  requestAnimationFrame(frame);
 }catch(error){showStartupError();console.error(error);}
}
async function restoreAdventureScreen(){
  if(!entry&&journey?.stage==='cinema'&&journey.cinema?.phase==='result'&&!journey.memory&&scores.get('cinema').solved){
    journey=visitPlace(journey,'memory');persistJourney();
  }
  if(!entry&&!trial&&journey?.stage==='memory'&&journey.memory?.phase==='result'&&!journey.pursuit&&scores.get('memory').solved){
    journey=visitPlace(journey,'pursuit');persistJourney();
  }
  if(journey?.stage==='cityhall'){if(journey.cityhall?.phase==='result')await restoreCollection('cityhall');else if(journey.cityhall?.phase==='summary')await restoreCityHallSummary();else showStage();}
  else if(FIELD[journey?.stage]){if(journey[journey.stage]?.phase==='result')await restoreCollection(journey.stage);else showStage();}
  else if(journey?.stage==='monastery'){if(journey.monastery?.phase==='result')await restoreCollection('monastery');else showStage();}
  else if(journey?.stage==='detective'){if(journey.detective?.phase==='result')await restoreCollection('detective');else showStage();}
  else if(journey?.stage==='dessert'){if(journey.dessert?.phase==='result')await restoreCollection('dessert');else showStage();}
  else if(journey?.stage==='ai'){if(journey.ai?.phase==='result')await restoreCollection('ai');else showStage();}
  else if(journey?.stage==='literature'){if(journey.literature?.phase==='result')await restoreCollection('literature');else showStage();}
  else if(journey?.stage==='zoo'){if(journey.zoo?.phase==='result')await restoreCollection('zoo');else showStage();}
  else if(journey?.stage==='dream'){if(journey.dream?.phase==='result')await restoreCollection('dream');else showStage();}
  else if(journey?.stage==='newspaper'){if(journey.newspaper?.phase==='result')await restoreCollection('newspaper');else showStage();}
  else if(journey?.stage==='language'){if(journey.language?.phase==='result')await restoreCollection('language');else showStage();}
  else if(journey?.stage==='writer'){if(journey.writer?.phase==='result')await restoreCollection('writer');else showStage();}
  else if(journey?.stage==='space'){if(journey.space?.phase==='result')await restoreCollection('space');else showStage();}
  else if(journey?.stage==='robot'){if(journey.robot?.phase==='result')await restoreCollection('robot');else showStage();}
  else if(journey?.stage==='temple'){if(journey.temple?.phase==='result')await restoreCollection('temple');else showStage();}
  else if(journey?.stage==='exchange'){if(journey.exchange?.phase==='result'){await prepareExchange();game=new ExchangeGame({saved:journey.exchange.run});game.banked=new Set(journey.exchange.clues);game.found=new Set(game.banked);bindExchangeUI();showResult({survived:journey.exchange.survived,elapsed:5,found:[...game.banked]});}else showStage();}
  else if(journey?.stage==='history'){
    if(journey.history?.phase==='result'){await prepareHistory();game=new HistoryGame({onEvent:handleGameEvent});game.banked=new Set(progress.clues);game.found=new Set(progress.clues);game.elapsed=journey.history.elapsed;game.phase='returned';game.ended=true;showResult({survived:journey.history.survived,elapsed:game.elapsed,found:progress.clues});}else showStage();
  }
  else if(journey?.stage==='art'){
    if(journey.museum?.phase==='result'){await prepareMuseum();game=new MuseumGame({onEvent:handleGameEvent});game.banked=new Set(progress.clues);game.found=new Set(progress.clues);game.elapsed=journey.museum.elapsed;game.clueSources=restoreSources(journey.museum);game.ended=true;for(const m of game.monsters)m.alive=!game.clueSources.has(m.id);showResult({survived:journey.museum.survived,elapsed:game.elapsed,found:progress.clues});}
    else showStage();
  }
  else if(journey?.phase==='result'){
    await loadAquarium();
    prepareAquarium();
    game=new AquariumGame({onEvent:handleGameEvent,collides:createSpriteCollider(images,character)});
    game.banked=new Set(progress.clues);game.found=new Set(progress.clues);game.elapsed=journey.elapsed;game.ended=true;
    showResult({survived:journey.survived,elapsed:journey.elapsed,found:progress.clues});
  }else if(journey)showStage();else setState('title');
}
async function prepareMuseum(){
  museumImages ||= await loadMuseumAssets(character);
  journey.museum ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};
  activePlace='museum';progress.clues=[...journey.museum.clues];
  renderer=new MuseumRenderer(layout.world,museumImages);
  $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('museum-mode');$('history-actions').hidden=true;$('history-era').hidden=true;
  syncCurrentPlaceHeaders();
  document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 02';
  document.querySelector('.health-stat .hud-label').textContent='되찾은 색';
  $('health-value').hidden=true;$('museum-colors').hidden=false;
  $('museum-colors').innerHTML=COLORS.map(c=>`<i title="${c.name}" role="img" aria-label="${c.name} 미수집"></i>`).join('');
  $('museum-actions').hidden=false;
  document.querySelector('.control-label span').textContent='이동 · 사다리는 위아래';
  document.querySelector('#flash-button b').textContent='시간 정지';
  document.querySelector('.flash-tip').textContent='몬스터만 3초 정지';
  document.querySelector('#pause-overlay .modal-lead').textContent='시간과 몬스터도 함께 멈췄어요.';
  applyIcons(document.querySelector('.instruction-list'));
  document.querySelector('.desktop-keys').textContent='방향키 이동 · J/SPACE 새총 · K 점프 · L 정지';
  $('ocean').setAttribute('aria-label','4층 미술관에서 색을 훔친 몬스터를 잡는 게임');
  $('dpad').setAttribute('aria-label','이동 및 사다리 방향키');
  $('brief-sub').setAttribute('aria-label',`${character.name}, 새총을 든 모습`);
  $('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
$('museum-enter').addEventListener('click',async()=>{
  if(state!=='stage'||!PLACES.some(p=>p.id===journey?.stage&&p.playable))return;
  if(journey.stage==='cityhall'){await enterCityHall(replayTarget==='cityhall');return;}
  if(FIELD[journey.stage]){await enterField(journey.stage);return;}
  if(journey.stage==='monastery'){await enterMonastery();return;}
 if(journey.stage==='detective'){await enterDetective();return;}
  if(journey.stage==='dessert'){await enterDessert();return;}
  if(journey.stage==='ai'){await enterAI();return;}
  if(journey.stage==='zoo'){await enterZoo();return;}
  if(journey.stage==='literature'){await enterLiterature();return;}
  if(journey.stage==='dream'){await enterDream();return;}
  if(journey.stage==='newspaper'){await enterNewspaper();return;}
  if(journey.stage==='language'){await enterLanguage();return;}
  if(journey.stage==='writer'){await enterWriter();return;}
  if(journey.stage==='space'){await enterSpace();return;}
  if(journey.stage==='robot'){await enterRobot();return;}
  if(journey.stage==='temple'){await enterTemple();return;}
  if(journey.stage==='aquarium'){
   const button=$('museum-enter'),pendingJourney=journey;
   button.disabled=true;button.textContent='수족관을 준비하는 중…';
   unlockAudio();
   try{
    await loadAquarium();
    if(state==='stage'&&journey===pendingJourney)board();
   }catch(error){
    if(state==='stage'&&journey===pendingJourney){
     button.textContent='다시 입장하기';
     document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 눌러 주세요.';
    }
    console.error(error);
   }finally{button.disabled=false;}
   return;
  }
  if(journey.stage==='exchange'){await enterExchange();return;}
  if(journey.stage==='history'){await enterHistory();return;}
  $('museum-enter').disabled=true;$('museum-enter').textContent='미술관을 준비하는 중…';
  try{await prepareMuseum();game=new MuseumGame({onEvent:handleGameEvent});endReason=null;journey.museum.phase='briefing';persistJourney();setState('briefing');hud();}
  catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 눌러 주세요.';}
  finally{$('museum-enter').disabled=false;if(isMuseum())$('museum-enter').textContent='미술관 입장하기 →';}
});
$('shoot-button').addEventListener('pointerdown',event=>{if(state!=='playing'||!isMuseum())return;event.preventDefault();unlockAudio();shootHeld=true;$('shoot-button').setPointerCapture(event.pointerId);game.shoot();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('shoot-button').addEventListener(type,()=>{shootHeld=false;});
$('shoot-button').addEventListener('click',event=>{if(event.detail===0&&state==='playing'&&isMuseum())game.shoot();});
$('jump-button').addEventListener('pointerdown',event=>{if(state!=='playing'||!isMuseum())return;event.preventDefault();unlockAudio();game.jump();});
$('jump-button').addEventListener('click',event=>{if(event.detail===0&&state==='playing'&&isMuseum())game.jump();});

async function prepareHistory(){
 historyImages ||= await loadHistoryAssets(character);journey.history ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='history';progress.clues=[...journey.history.clues];renderer=new HistoryRenderer(layout.world,historyImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('history-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 03';
 document.querySelector('.health-stat .hud-label').textContent='여행 장소';$('health-value').hidden=true;$('museum-colors').hidden=true;$('history-era').hidden=false;$('history-actions').hidden=false;$('hammer-button').hidden=false;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동 · 망치로 단서 찾기';document.querySelector('#flash-button b').textContent='속도업';document.querySelector('.flash-tip').textContent='5초간 2배 · 여행 전체 3회';
 document.querySelector('#pause-overlay .modal-lead').textContent='시간과 적도 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));
 document.querySelector('.desktop-keys').textContent='방향키 이동 · J/SPACE 망치 · E 탑승/하차 · L 속도업';$('ocean').setAttribute('aria-label','45도 위에서 보는 박물관 시간 여행 게임');$('dpad').setAttribute('aria-label','캐릭터 이동 방향키');$('brief-sub').setAttribute('aria-label',`${character.name}, 타임머신에 탑승한 모습`);
 $('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterHistory(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='시간 여행을 준비하는 중…';
 try{await prepareHistory();game=new HistoryGame({onEvent:handleGameEvent});endReason=null;journey.history.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 눌러 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
const useHammer=()=>{if(state==='playing'&&isHistory()){unlockAudio();game.hammer();}};
$('hammer-button').addEventListener('pointerdown',event=>{event.preventDefault();useHammer();});
$('hammer-button').addEventListener('click',event=>{if(event.detail===0)useHammer();});
$('interact-button').addEventListener('click',()=>{if(state==='playing'&&(isHistory()||isTemple())){unlockAudio();clearInput();game.interact();hud();}});
async function prepareCityHall(){
 await prepareCluePuzzle($('app'),'cityhall');
 cityHallImages ||= await loadCityHallAssets(character);
 activePlace='cityhall';
 journey.cityhall ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0,run:null};
 progress.clues=[...journey.cityhall.clues];renderer=new CityHallRenderer(layout.world,cityHallImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','temple-mode','robot-mode','exchange-mode');
 syncCurrentPlaceHeaders();
 document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 22';
 $('history-actions').hidden=true;$('museum-actions').hidden=true;
 $('ocean').setAttribute('aria-label','위에서 내려다본 시청 집무실');$('dpad').setAttribute('aria-label','방향키');
 document.querySelector('.control-label span').textContent='방향키로 정책 선택';
 document.querySelector('#pause-overlay .modal-lead').textContent='결재는 이어서 할 수 있어요.';
 document.querySelector('.desktop-keys').textContent='방향키 정책 선택 · E 결재 · L 전문가 조언';
 const item=$('flash-button');item.dataset.icon='special';item.querySelector('svg').outerHTML=icon('special');
 item.querySelector('b').textContent='정책 전문가 조언';
 document.querySelector('.flash-tip').textContent='현재 안건의 판단 기준을 한 번 확인해요';
 $('brief-sub').setAttribute('aria-label','선택한 캐릭터가 책상에서 결재하는 모습');
 $('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterCityHall(fresh=false){
 const enter=$('museum-enter');enter.disabled=true;
 try{
  await prepareCityHall();
  const rec=journey.cityhall,resume=!fresh&&rec.run?.rules===4&&rec.run.phase!=='complete';
  game=new CityHallGame({saved:resume?rec.run:null});
  if(!resume){
   Object.assign(rec,{clues:[],clueSources:[],clueRule:'count-v1',elapsed:0,survived:false,hintsSeen:0});
   progress.clues=[];
  }
  finishTransition.reset();endReason=null;
  rec.run=game.snapshot();rec.phase='briefing';persistJourney();
  bindCityHallUI();setState('briefing');hud();
 }catch(e){
  console.error(e);document.querySelector('.stage-placeholder').textContent='시청 그림을 불러오지 못했어요. 다시 입장해 주세요.';
 }finally{enter.disabled=false;}
}
function bindCityHallUI(){
 cityHallUI=new CityHallUI($('cityhall-paper'),game,id=>{if(state==='playing'&&game.selectPolicy(id))hud();},!!arcadeMode);
}
function startCityHallPlay(){beginCountdown('playing');hud();}
async function restoreCityHallSummary(){
 await prepareCityHall();game=new CityHallGame({saved:journey.cityhall.run});bindCityHallUI();showCityHallSummary();
}
function showCityHallSummary(){
 $('cityhall-summary-content').innerHTML=citySummaryHTML(game,!!arcadeMode);
 journey.cityhall.phase='summary';persistJourney();setState('city-summary');hud();$('cityhall-leave').focus({preventScroll:true});
}
function leaveCityHall(){
 if(state==='city-summary'&&isCityHall())queueFinish({survived:true,elapsed:0,found:[...game.banked]});
}
$('cityhall-leave').addEventListener('click',leaveCityHall);
function cityHallHud(){
 if(state==='playing')trackRunScore();
 const active=state==='playing';
 syncCityStats(game,$,!!arcadeMode);syncCityAction(game,$('cityhall-act'),active);
 const prev=$('cityhall-prev');prev.hidden=!active||game.deskOpened;prev.disabled=!active||!game.canGoBack;
 const item=$('flash-button'),uses=game.flashes??0,label=`정책 전문가 조언, ${uses}회 남음`;
 if($('flash-value').textContent!==String(uses))$('flash-value').textContent=uses;
 if(item.getAttribute('aria-label')!==label)item.setAttribute('aria-label',label);
 item.disabled=!active||!game.canAsk;
 cityHallUI?.render(active);
 $('history-message').hidden=true;
}
function saveCityHall(){journey.cityhall.run=game.snapshot();persistJourney();}
function cityHallAction(){
 if(state!=='playing'||!isCityHall()||!game.act())return;
 clearInput();unlockAudio();
 if(game.stamping)tone(140,.1,.14,'triangle',.07);
 saveCityHall();
 if(game.ended){
  if(arcadeMode)queueFinish({survived:true,elapsed:game.elapsed||0,found:[...game.banked]});
  else showCityHallSummary();
 }else hud();
}
$('cityhall-act').addEventListener('click',cityHallAction);
$('cityhall-prev').addEventListener('click',()=>{
 if(state==='playing'&&isCityHall()&&game.previous()){saveCityHall();hud();}
});

async function prepareExchange(){
 exchangeImages ||= await loadExchangeAssets(character);activePlace='exchange';journey.exchange ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0,run:null};progress.clues=[...journey.exchange.clues];
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','temple-mode','robot-mode');$('app').classList.add('exchange-mode');renderer=new ExchangeRenderer(layout.world,exchangeImages);$('ocean').setAttribute('aria-label','45도 위에서 보는 증권거래소 모의투자 게임');
 document.querySelector('#pause-overlay .modal-lead').textContent='투자 진행과 시간의 흐름이 멈췄어요.';
 document.querySelector('.desktop-keys').textContent='방향키 이동·선택 · ENTER 다음 · 터치로 직접 선택';
 $('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterExchange(fresh=false){
 $('museum-enter').disabled=true;
 try{await prepareExchange();if(fresh){journey.exchange={phase:'briefing',clues:[],elapsed:0,survived:false,hintsSeen:0,run:null};progress.clues=[];}
 finishTransition.reset();game=new ExchangeGame({saved:journey.exchange.run});endReason=null;
 if(game.phase==='bankrupt'||game.phase==='complete')game=new ExchangeGame();
 bindExchangeUI();journey.exchange.run=game.snapshot();journey.exchange.phase='briefing';persistJourney();showExchangeBriefing();
 }catch(e){console.error(e);document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}finally{$('museum-enter').disabled=false;}
}
function bindExchangeUI(){
 const save=()=>{journey.exchange.run=game.snapshot();journey.exchange.phase='briefing';persistJourney();};
 exchangeUI=new ExchangeUI({root:$('exchange-ui'),game,character,onChange:save,onComplete:()=>{save();queueFinish({survived:true,elapsed:5,found:[...game.banked]});},onFailure:()=>{save();showFailure();},onHome:arcadeMode?()=>{endReason='leave';showFailure();}:returnHome,onPause:pause,onHelp:showHelp,coinMode:!!arcadeMode});syncSound();
}
function showExchangeBriefing(){
 applyIcons(document.querySelector('.instruction-list'));$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 주식 그래프 모니터를 보는 모습');setState('briefing');
}
function startExchangePlay(){unlockAudio();trackRunScore();setState('exchange');}
function prepareAquarium(){
 activePlace='aquarium';renderer=images?new Renderer(layout.world,images):null;progress.clues=[...aquariumClues];
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');
 syncCurrentPlaceHeaders();
 document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 01';
 document.querySelector('.health-stat .hud-label').textContent='잠수함 내구도';
 $('health-value').hidden=false;$('museum-colors').hidden=true;$('history-era').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 $('history-message').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동';
 document.querySelector('#flash-button b').textContent='빛 발사';
 document.querySelector('.flash-tip').textContent='위험할 때 눌러요';
 document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE 빛 발사';
 $('brief-sub').setAttribute('aria-label',`${character.name}, 잠수함에 탑승한 모습`);
 $('ocean').setAttribute('aria-label','수족관 게임 화면');$('dpad').setAttribute('aria-label','잠수함 방향키');
 $('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
 document.querySelector('#pause-overlay .modal-lead').textContent='시간과 상어도 함께 멈췄어요.';syncCharacters();
}
async function openPlaceBriefing(place,fresh=false){
 journey.stage=place;persistJourney();
 if(place==='cityhall'){await enterCityHall(fresh);return;}
 if(place==='exchange'){await enterExchange(fresh);return;}
 if(FIELD[place])await prepareField(place);else if(place==='monastery')await prepareMonastery();else if(place==='detective')await prepareDetective();else if(place==='dessert')await prepareDessert();else if(place==='ai')await prepareAI();else if(place==='zoo')await prepareZoo();else if(place==='literature')await prepareLiterature();else if(place==='dream')await prepareDream();else if(place==='newspaper')await prepareNewspaper();else if(place==='language')await prepareLanguage();else if(place==='writer')await prepareWriter();else if(place==='space')await prepareSpace();else if(place==='robot')await prepareRobot();else if(place==='temple')await prepareTemple();else if(place==='history')await prepareHistory();else if(place==='art')await prepareMuseum();else{await loadAquarium();prepareAquarium();}
 resetAdventure();setState('briefing');hud();
}
async function restoreCollection(place){
 journey.stage=place;persistJourney();
 if(place==='cityhall'){await prepareCityHall();const saved=journey.cityhall.run;game=saved&&!saved.rules?new LegacyCityHallGame({saved}):new CityHallGame({saved});bindCityHallUI();}
 else if(place==='exchange'){await prepareExchange();game=new ExchangeGame({saved:journey.exchange.run});bindExchangeUI();}
 else if(FIELD[place]){await prepareField(place);game=createFieldGame(place,journey[place]?.runPlan);}
 else if(place==='monastery'){await prepareMonastery();game=new MonasteryGame({onEvent:handleGameEvent});}
 else if(place==='detective'){await prepareDetective();game=new DetectiveGame({onEvent:handleGameEvent});game.enterRoom(journey.detective.room||0);for(const r of game.rooms)for(const e of r.evidence)e.collected=journey.detective.evidence?.includes(e.id);game.caught=journey.detective.caught||0;game.health=Math.max(0,3-game.caught);game.flashes=journey.detective.flashes??DETECTIVE.flashes;}
 else if(place==='dessert'){await prepareDessert();game=new DessertGame({onEvent:handleGameEvent});}
 else if(place==='ai'){await prepareAI();game=new AIGame({onEvent:handleGameEvent,runPlan:journey[place]?.runPlan});}
 else if(place==='zoo'){await prepareZoo();game=new ZooGame({onEvent:handleGameEvent,character:character.id});}
 else if(place==='literature'){await prepareLiterature();game=new LiteratureGame({onEvent:handleGameEvent});game.phase='complete';}
 else if(place==='dream'){await prepareDream();game=new DreamGame({onEvent:handleGameEvent});game.phase='complete';}
 else if(place==='newspaper'){await prepareNewspaper();game=new NewspaperGame({onEvent:handleGameEvent,runPlan:journey[place]?.runPlan});}
 else if(place==='language'){await prepareLanguage();game=new LanguageGame({onEvent:handleGameEvent,characterId:character.id});}
 else if(place==='writer'){await prepareWriter();game=createWriterGame();}
 else if(place==='space'){await prepareSpace();game=createSpaceGame();}
 else if(place==='robot'){await prepareRobot();game=new RobotGame({onEvent:handleGameEvent,runPlan:journey[place]?.runPlan});}
 else if(place==='temple'){await prepareTemple();game=new TempleGame({onEvent:handleGameEvent});game.player.z=TEMPLE.goal;game.cameraZ=TEMPLE.goal-80;game.mode='shore';game.phase='returned';game.reachedIthaca=journey.temple.reachedIthaca===true;game.delays=journey.temple.delays||0;}
 else if(place==='history'){await prepareHistory();game=new HistoryGame({onEvent:handleGameEvent});game.phase='returned';}
 else if(place==='art'){await prepareMuseum();game=new MuseumGame({onEvent:handleGameEvent});}
 else{await loadAquarium();prepareAquarium();game=new AquariumGame({onEvent:handleGameEvent,collides:createSpriteCollider(images,character)});}
 const rec=runRecord();if(!canSolveCollection(place,rec)){showStage();return;}
 endReason=null;
 game.banked=new Set(progress.clues);game.found=new Set(progress.clues);if(!isExchange())game.clueSources=restoreSources(activePlace==='aquarium'?progress:rec);game.elapsed=rec.elapsed;game.ended=true;
 if(isField())game.restoreResult(rec);
 if(isMonastery())game.restoreResult(rec);
 if(isDessert()){game.packages=[...game.banked].map((id,i)=>({id,kind:rec.pastries?.[i]||PASTRIES[i%3].id}));for(const p of game.packages)game.delivered[p.kind]++;for(const o of game.ovens)if(!game.needs(o.kind))o.status='done';}
 if(isAI()){game.album=[...(rec.album||[])];game.orderIndex=Math.min(8,game.banked.size);game.setupOrder();game.phase='complete';}
 if(isWriter()){const last=WRITER_CARDS.find(c=>c.id===(Array.from(game.clueSources).at(-1)||1));game.reachedCastle=rec.reachedCastle===true;game.chapter=game.reachedCastle?5:last.chapter;const x=game.reachedCastle?9485:last.x;Object.assign(game.player,{x,y:440});game.camera.x=Math.max(0,Math.min(WRITER.width-390,x-150));game.phase='complete';}
 if(isLanguage()){for(const station of game.stations)if(game.clueSources.has(station.id)){station.solved=true;station.inserted=[...station.word];station.solvedAge=2;}const last=(Array.from(game.clueSources).at(-1)||1);game.player.x=320+(last-1)*520;game.camera.x=Math.min(LANGUAGE.width-390,game.player.x-155);}
 if(isSpace())game.phase='returned';
 if(isRobot())for(const station of game.stations){station.round=[0,1,2].filter(i=>game.clueSources.has(station.id*3+i+1)).length;station.status=station.round===3?'done':'waiting';station.type=game.modelFor(station.id,station.round);}
 if(isMuseum())for(const m of game.monsters)m.alive=!game.clueSources.has(m.id);
 showResult({survived:rec.survived===true,elapsed:rec.elapsed,found:[...progress.clues]});
}
async function goBackScene(){
 if(!$('arcade-reset-overlay').hidden){closeArcadeReset();return true;}
 if(quitOpen){cancelQuit();return true;}
 if(arcadeLoading)return true;
 if(state==='arcade-choice'||(state==='select'&&characterMode)){returnToArcadeTitle();return true;}
 if(state==='naming'){cancelCharacterName();return true;}
 if(state==='arcade-records'||state==='arcade-result'){showArcadeMap();return true;}
 if(state==='arcade-map'){leaveArcadeMap();return true;}
 if(arcadeMode&&!utilityOrigin&&!menuReturn&&['briefing','pursuit-report'].includes(state)){
  if(arcadeMode==='challenge'&&arcadeRuns.run?.active)recordArcadeResult(true);
  showArcadeMap();return true;
 }
 if(utilityOrigin){closeUtilityFromControl();return true;}
 if(state==='tutorial'){if(!returnFromHowTo())setState('briefing');return true;}
 if(state==='help'){resumeFromHelp();return true;}
 if(replayOpen){closeReplay();return true;}
 if(state==='pursuit-report'){setState('briefing');hud();return true;}
 if(state==='pursuit-capture-report'){finishPursuitCaptureReport();return true;}
 if(state==='stage'&&replayOrigin&&journey.stage===replayTarget){await restoreReplayOrigin();return true;}
 if(state==='stage'&&!trial&&journey?.stage==='aquarium'){returnToArcadeTitle();return true;}
 if(state==='paused'){resume();return true;}
 if(arcadeMode&&['playing','exchange','countdown','ending'].includes(state)){pause();return true;}
 if(homeConfirmOpen){cancelHome();return;}
 for(const id of ['hint-overlay','card-overlay','puzzle-overlay','reset-overlay','collection-overlay'])if(!$(id).hidden){closeExtra(id);return;}
 if(isExchange()&&exchangeUI?.confirming){exchangeUI.action('cancel-bankrupt');return;}
 const place=state==='stage'?journey?.stage:activePlace==='museum'?'art':activePlace;
 const target=previousScene(state,place);if(!target)return false;
 document.activeElement?.blur();clearInput();finishTransition.reset();activeMotion=null;motionNext=null;answerBusy=false;
 if(target.screen==='select'){prepareAquarium();game=null;journey=null;if(trial)saveJourney(storage,null);++nameToken;nameMotion=null;setState('select');}
 else if(target.screen==='title'){prepareAquarium();game=null;journey=null;if(trial)saveJourney(storage,null);setState('title');}
 else if(target.screen==='stage'){journey.stage=target.place;persistJourney();showStage();}
 else if(target.screen==='tutorial')showPlayTutorial();
 else if(target.screen==='briefing')await openPlaceBriefing(target.place);
 else if(target.screen==='play'){
  await openPlaceBriefing(target.place,true);
  if(isExchange())startExchangePlay();else if(isCityHall())startCityHallPlay();
  else beginCountdown();
 }
 else if(target.screen==='result')await restoreCollection(target.place);
 return true;
}
installBackNavigation(window,goBackScene);
boot();

async function prepareTemple(){
 templeImages ||= await loadTempleAssets(character);journey.temple ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='temple';progress.clues=[...journey.temple.clues];renderer=new TempleRenderer(layout.world,templeImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','robot-mode');$('app').classList.add('temple-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 05';document.querySelector('.health-stat .hud-label').textContent='체력';
 $('health-value').hidden=false;$('museum-colors').hidden=true;$('history-era').hidden=true;$('history-message').hidden=true;$('history-actions').hidden=false;$('hammer-button').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동 · 바람은 왼쪽 + 위쪽 함께 누르기';document.querySelector('#flash-button b').textContent='가호';document.querySelector('.flash-tip').textContent='4초 보호막 · 전체 3회';
 document.querySelector('#pause-overlay .modal-lead').textContent='귀환 시간과 신들의 시련이 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · E 탑승/하차 · SPACE/L 가호';$('ocean').setAttribute('aria-label','신전과 숲, 바다를 지나 이타카로 돌아가는 모험');$('dpad').setAttribute('aria-label','캐릭터와 배의 방향키');$('brief-sub').setAttribute('aria-label','투구와 갑옷을 입은 캐릭터와 그리스 신전');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterTemple(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='귀환길을 준비하는 중…';
 try{await prepareTemple();game=new TempleGame({onEvent:handleGameEvent});endReason=null;journey.temple.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}

async function prepareRobot(){
 robotImages ||= await loadRobotAssets(character);journey.robot ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='robot';progress.clues=[...journey.robot.clues];renderer=new RobotRenderer(layout.world,robotImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode');$('app').classList.add('robot-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 06';document.querySelector('.health-stat .hud-label').textContent='운반 부품';
 $('health-value').hidden=true;$('museum-colors').hidden=true;$('history-era').hidden=false;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동';document.querySelector('#flash-button b').textContent='자석 공구';document.querySelector('.flash-tip').textContent='필요한 부품을 당겨요 · 3회';
 document.querySelector('#pause-overlay .modal-lead').textContent='시간과 컨베이어도 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE/J 작업 · L 자석 공구';$('ocean').setAttribute('aria-label','컨베이어의 부품을 운반해 로봇을 수리하는 연구소');$('dpad').setAttribute('aria-label','캐릭터 이동 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 로봇을 수리하는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterRobot(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='연구소를 준비하는 중…';
 try{await prepareRobot();game=new RobotGame({onEvent:handleGameEvent});endReason=null;journey.robot.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
const useWork=()=>{if(state==='playing'&&isRobot()){unlockAudio();game.work();hud();}};
$('work-button').addEventListener('pointerdown',event=>{event.preventDefault();useWork();});
$('work-button').addEventListener('click',event=>{if(event.detail===0)useWork();});

async function prepareSpace(){
 spaceImages ||= await loadSpaceAssets(character);journey.space ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='space';progress.clues=[...journey.space.clues];renderer=new SpaceRenderer(layout.world,spaceImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('space-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 07';document.querySelector('.health-stat .hud-label').textContent='체력';
 $('health-value').hidden=false;$('museum-colors').hidden=true;$('history-era').hidden=true;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 우주유영';document.querySelector('#flash-button b').textContent='부스터';document.querySelector('.flash-tip').textContent='3초간 속도 1.5배 · 3회';document.querySelector('#pause-overlay .modal-lead').textContent='시간과 우주의 움직임이 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE/J 제동 · L 부스터';$('ocean').setAttribute('aria-label','사방으로 펼쳐진 우주정거장에서 단서 카드를 회수하는 게임');$('dpad').setAttribute('aria-label','우주유영 이동 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 우주복을 입고 회전하다 자세를 바로잡는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterSpace(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='우주복을 준비하는 중…';
 try{await prepareSpace();game=createSpaceGame();finishTransition.reset();endReason=null;journey.space.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
const useBrake=()=>{if(state==='playing'&&isSpace()){unlockAudio();game.brake();hud();}};
$('brake-button').addEventListener('pointerdown',event=>{event.preventDefault();useBrake();});
$('brake-button').addEventListener('click',event=>{if(event.detail===0)useBrake();});

async function prepareWriter(){
 writerImages ||= await loadWriterAssets(character);journey.writer ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='writer';progress.clues=[...journey.writer.clues];renderer=new WriterRenderer(layout.world,writerImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('writer-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 08';document.querySelector('.health-stat .hud-label').textContent='체력';
 $('health-value').hidden=false;$('museum-colors').hidden=true;$('history-era').hidden=true;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이야기 둘러보기';document.querySelector('#flash-button b').textContent='마법 책갈피';document.querySelector('.flash-tip').textContent='4초 보호막 · 3회';document.querySelector('#pause-overlay .modal-lead').textContent='시간과 이야기 속 움직임이 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE/J/K 점프 · ↑ 콩나무 · E 행동 · L 책갈피';$('ocean').setAttribute('aria-label','동화작가의 방에서 여섯 문학작품 속을 이동하는 게임');$('dpad').setAttribute('aria-label','이야기 속 캐릭터 이동 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 펼쳐진 책 위를 달리고 점프하여 단서를 줍는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterWriter(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='이야기를 펼치는 중…';
 try{await prepareWriter();game=createWriterGame();finishTransition.reset();endReason=null;journey.writer.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
for(const [id,action] of [['writer-jump','jump'],['writer-act','act']]){
 const use=()=>{if(state==='playing'&&isWriter()){unlockAudio();game[action]();hud();}};
 $(id).addEventListener('pointerdown',e=>{e.preventDefault();use();});$(id).addEventListener('click',e=>{if(e.detail===0)use();});
}

async function prepareLanguage(){
 languageImages ||= await loadLanguageAssets(character);journey.language ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='language';progress.clues=[...journey.language.clues];renderer=new LanguageRenderer(layout.world,languageImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('language-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 09';document.querySelector('.health-stat .hud-label').textContent='체력';
 $('health-value').hidden=false;$('museum-colors').hidden=true;$('history-era').hidden=true;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동 · 사다리 위아래';document.querySelector('#flash-button b').textContent='글자 자석';document.querySelector('.flash-tip').textContent='필요한 글자를 당겨요 · 3회';document.querySelector('#pause-overlay .modal-lead').textContent='시간과 언어 실험이 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE/K 점프 · E/J 집기·던지기 · L 자석';$('ocean').setAttribute('aria-label','글자를 운반해 낱말을 완성하는 언어연구소 게임');$('dpad').setAttribute('aria-label','이동 및 사다리 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 글자 블록을 던져 낱말을 완성하는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterLanguage(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='출력실을 준비하는 중…';
 try{await prepareLanguage();game=new LanguageGame({onEvent:handleGameEvent,characterId:character.id});finishTransition.reset();endReason=null;journey.language.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
for(const [id,action] of [['language-jump','jump'],['language-act','act']]){
 const use=()=>{if(state==='playing'&&isLanguage()){unlockAudio();game[action]();hud();}};
 $(id).addEventListener('pointerdown',e=>{e.preventDefault();use();});$(id).addEventListener('click',e=>{if(e.detail===0)use();});
}

async function prepareNewspaper(){
 newspaperImages ||= await loadNewspaperAssets(character);journey.newspaper ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='newspaper';progress.clues=[...journey.newspaper.clues];renderer=new NewspaperRenderer(layout.world,newspaperImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('newspaper-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 10';document.querySelector('.health-stat .hud-label').textContent='운반 재료';
 $('health-value').hidden=true;$('museum-colors').hidden=true;$('history-era').hidden=false;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동';document.querySelector('#flash-button b').textContent='취재 가방';document.querySelector('.flash-tip').textContent='사진·제목 함께 운반 · 3회';document.querySelector('#pause-overlay .modal-lead').textContent='마감 시간과 컨베이어가 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE/J/E 작업·인쇄 · L 취재 가방';$('ocean').setAttribute('aria-label','기사판에 사진과 제목을 배치하고 신문을 인쇄하는 게임');$('dpad').setAttribute('aria-label','편집실 이동 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 기사판에 사진을 붙이는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterNewspaper(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='편집실을 준비하는 중…';
 try{await prepareNewspaper();game=new NewspaperGame({onEvent:handleGameEvent});finishTransition.reset();endReason=null;journey.newspaper.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
const useNewspaperWork=()=>{if(state==='playing'&&isNewspaper()){unlockAudio();game.act();hud();}};
$('newspaper-act').addEventListener('pointerdown',e=>{e.preventDefault();useNewspaperWork();});
$('newspaper-act').addEventListener('click',e=>{if(e.detail===0)useNewspaperWork();});

async function prepareDream(){
 dreamImages ||= await loadDreamAssets(character);journey.dream ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='dream';progress.clues=[...journey.dream.clues];renderer=new DreamRenderer(layout.world,dreamImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('dream-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 11';document.querySelector('.health-stat .hud-label').textContent='체력';
 $('health-value').hidden=false;$('museum-colors').hidden=true;$('history-era').hidden=true;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동';document.querySelector('#flash-button b').textContent='꿈 지우개';document.querySelector('.flash-tip').textContent='앞쪽 장애물을 4초간 지우기 · 3회';document.querySelector('#pause-overlay .modal-lead').textContent='꿈과 게임 시간이 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='← → 이동 · SPACE 점프 · J/E 반전 · L 지우개';$('ocean').setAttribute('aria-label','바닥과 천장을 뒤집어 달리며 단서를 찾는 꿈속 게임');$('dpad').setAttribute('aria-label','꿈속 이동 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 바닥과 천장을 오가는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterDream(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='꿈을 준비하는 중…';
 try{await prepareDream();game=new DreamGame({onEvent:handleGameEvent});finishTransition.reset();endReason=null;journey.dream.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
const useDreamAction=()=>{if(state==='playing'&&isDream()){unlockAudio();game.act();hud();}};
$('dream-act').addEventListener('pointerdown',e=>{e.preventDefault();useDreamAction();});
$('dream-act').addEventListener('click',e=>{if(e.detail===0)useDreamAction();});

const useDreamJump=()=>{if(state==='playing'&&isDream()){unlockAudio();game.jump();hud();}};
$('dream-jump').addEventListener('pointerdown',e=>{e.preventDefault();useDreamJump();});
$('dream-jump').addEventListener('click',e=>{if(e.detail===0)useDreamJump();});

async function prepareLiterature(){
 literatureImages ||= await loadLiteratureAssets(character);journey.literature ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='literature';progress.clues=[...journey.literature.clues];renderer=new LiteratureRenderer(layout.world,literatureImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','zoo-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('literature-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 13';document.querySelector('.health-stat .hud-label').textContent='체력';
 $('health-value').hidden=false;$('museum-colors').hidden=true;$('history-era').hidden=true;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동';document.querySelector('#flash-button b').textContent='책갈피';document.querySelector('.flash-tip').textContent='공격을 '+LITERATURE.shieldSeconds+'초 동안 막아요 · 3회';document.querySelector('#pause-overlay .modal-lead').textContent='시간과 이야기 속 움직임이 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE/J/E 행동 · L 책갈피';$('ocean').setAttribute('aria-label','아홉 세계 명작의 과제를 해결하는 문학관 모험');$('dpad').setAttribute('aria-label','문학관 이동 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 유리 덮개를 장미에게 가져가는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterLiterature(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='문학관을 준비하는 중…';
 try{await prepareLiterature();game=new LiteratureGame({onEvent:handleGameEvent});finishTransition.reset();endReason=null;journey.literature.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
const useLiteratureAction=()=>{if(state==='playing'&&isLiterature()){advanceLiteratureInput();unlockAudio();game.act();hud();}};
$('literature-act').addEventListener('pointerdown',e=>{e.preventDefault();useLiteratureAction();});
$('literature-act').addEventListener('click',e=>{if(e.detail===0)useLiteratureAction();});

async function prepareZoo(){
 zooImages ||= await loadZooAssets(character);journey.zoo ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='zoo';progress.clues=[...journey.zoo.clues];renderer=new ZooRenderer(layout.world,zooImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','ai-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('zoo-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 12';document.querySelector('.health-stat .hud-label').textContent='동물 친구';
 $('health-value').hidden=true;$('museum-colors').hidden=true;$('history-era').hidden=false;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='좌우 이동 · 위아래 조준';document.querySelector('#flash-button b').textContent='호루라기';document.querySelector('.flash-tip').textContent='받기 동작을 도와줘요 · 2회';document.querySelector('#pause-overlay .modal-lead').textContent='먹이와 동물들의 움직임이 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='← → 이동 · ↑ ↓ 조준 · SPACE 길게 눌러 던지기 · L 호루라기';$('ocean').setAttribute('aria-label','먹이를 조준해서 아홉 동물에게 던져 주는 동물원 게임');$('dpad').setAttribute('aria-label','좌우 이동, 위아래 던지는 각도');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 힘을 모아 먹이를 던지는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterZoo(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='동물원을 준비하는 중…';
 try{await prepareZoo();game=new ZooGame({onEvent:handleGameEvent,character:character.id});finishTransition.reset();endReason=null;journey.zoo.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
$('zoo-act').addEventListener('pointerdown',e=>{if(state!=='playing'||!isZoo())return;e.preventDefault();advanceLiteratureInput();$('zoo-act').setPointerCapture(e.pointerId);unlockAudio();game.beginThrow();hud();});
$('zoo-act').addEventListener('pointerup',()=>{if(isZoo()&&state==='playing'){advanceLiteratureInput();game?.releaseThrow();hud();}});
for(const type of ['pointercancel','lostpointercapture'])$('zoo-act').addEventListener(type,()=>{if(isZoo())game?.cancelThrow();});
$('zoo-act').addEventListener('click',e=>{if(e.detail===0&&state==='playing'&&isZoo()){game.act();hud();}});

function showPlayTutorial(page=0,loopCount=0){
 const world=document.createElement('canvas');world.width=780;world.height=1688;world.scene=sceneGeometry(activePlace==='aquarium'?536:500,activePlace);
 const types={pursuit:[PursuitRenderer,pursuitImages],memory:[MemoryRenderer,memoryImages],cinema:[CinemaRenderer,cinemaImages],gym:[GymRenderer,gymImages],cityhall:[CityHallRenderer,cityHallImages],datacenter:[DataCenterRenderer,dataCenterImages],conservation:[ConservationRenderer,conservationImages],photo:[PhotoRenderer,photoImages],garden:[GardenRenderer,gardenImages],monastery:[MonasteryRenderer,monasteryImages],detective:[DetectiveRenderer,detectiveImages],dessert:[DessertRenderer,dessertImages],aquarium:[Renderer,images],museum:[MuseumRenderer,museumImages],history:[HistoryRenderer,historyImages],exchange:[ExchangeRenderer,exchangeImages],temple:[TempleRenderer,templeImages],robot:[RobotRenderer,robotImages],space:[SpaceRenderer,spaceImages],writer:[WriterRenderer,writerImages],language:[LanguageRenderer,languageImages],newspaper:[NewspaperRenderer,newspaperImages],dream:[DreamRenderer,dreamImages],zoo:[ZooRenderer,zooImages],literature:[LiteratureRenderer,literatureImages],ai:[AIRenderer,aiImages]};
 const [Type,assets]=types[activePlace],lesson=createTutorial(activePlace,character.id),painter=new Type(world,assets);
 if(activePlace==='aquarium')lesson.game.collides=createSpriteCollider(images,character);
 if(activePlace==='space')lesson.game.collides=createSpaceSpriteCollider(spaceImages,character);
 painter.bindContacts?.(lesson.game,character);
 // Reach the selected page with its synchronous simulation before attaching
 // decoded video time; an unplayed video cannot advance off-screen actions.
 const playback=new TutorialPlayback(lesson,page);
 if(activePlace==='cinema'){cinemaImages.movies.reset();lesson.game.filmReady=id=>{cinemaImages.ensureFilm(id).catch(()=>{});return cinemaImages.movies.ready(id);};lesson.game.filmTime=id=>cinemaImages.movies.time(id);}
 // Keep the current demonstration intact until its replacement is ready.
 playLesson?.chrome?.destroy();
 lesson.onEvent=e=>{if(activePlace==='aquarium')painter.effect?.(e.type,e.x??lesson.game.player.x,e.y??lesson.game.player.y);};
 playLesson={lesson,world,painter,playback,ended:false,loopCount,repeatDelay:0,city:isCityHall()?new CityHallUI($('tutorial-cityhall'),lesson.game,null,!!arcadeMode):null,finance:isExchange()?new TutorialFinance(lesson.game,character,$('tutorial-finance'),!!arcadeMode):null};
 $('tutorial-finance').hidden=!isExchange();$('tutorial-cityhall').hidden=true;
 playLesson.finance?.render();
 playLesson.chrome=new TutorialChrome($('tutorial-device'),activePlace,lesson,playLesson.finance?.root||$('game-ui'),duration(),!!arcadeMode);
 if(loopCount===0){
  $('tutorial-start').textContent=menuReturn?'돌아가기':'START';
  setState('tutorial');
 }
 renderPlayTutorial(0);
}
function renderPlayTutorial(dt){
 const a=playLesson;if(!a)return;const {lesson,world,painter,playback}=a;
 if(a.ended){a.repeatDelay+=dt;if(a.repeatDelay>=.6){showPlayTutorial(playback.page,a.loopCount+1);return;}}
 if(!a.ended)playback.update(dt);
 painter.draw(lesson.game,character,lesson.age,a.ended?0:playback.frameDelta,!a.ended&&!lesson.readingPause);
 const canvas=$('tutorial-scene'),c=canvas.getContext('2d'),aquarium=activePlace==='aquarium';
 const height=aquarium?1072:1000;if(canvas.height!==height)canvas.height=height;
 c.clearRect(0,0,780,height);c.drawImage(world,0,aquarium?284:340,780,height,0,0,780,height);
 // This is demonstration state only; the real HUD, timer and inventory stay untouched.
 if(lesson.fade>0){c.fillStyle=`rgba(17,47,60,${lesson.fade})`;c.fillRect(0,0,780,height);}
 a.finance?.render();a.city?.render(true);a.chrome.render();
 const title=arcadeRewardText(lesson.title);
 const baseCopy=TUTORIAL_COPY[activePlace][playback.page];
 const copy=arcadeRewardText(baseCopy);
 if($('tutorial-step').textContent!==title)$('tutorial-step').textContent=title;
 if($('tutorial-caption').textContent!==copy)$('tutorial-caption').textContent=copy;
 $('tutorial-page').textContent=(playback.page+1)+' / '+lesson.total;
 $('tutorial-previous').disabled=playback.page===0;
 $('tutorial-next').disabled=playback.page===lesson.total-1;
 $('tutorial-next').classList.toggle('is-ready',(playback.done||a.loopCount>0)&&!$('tutorial-next').disabled);
 canvas.setAttribute('aria-label',title+' · '+copy);
 if(playback.done){a.ended=true;}
}
$('tutorial-start').addEventListener('click',startFromInstructions);
function moveTutorialPage(direction){
 if(state!=='tutorial'||!playLesson)return;
 const next=playLesson.playback.page+direction;
 if(next<0||next>=playLesson.lesson.total)return;
 showPlayTutorial(next);
}
$('tutorial-previous').addEventListener('click',()=>moveTutorialPage(-1));
$('tutorial-next').addEventListener('click',()=>moveTutorialPage(1));

async function prepareAI(){
 aiImages ||= await loadAIAssets(character);journey.ai ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0};activePlace='ai';progress.clues=[...journey.ai.clues];renderer=new AIRenderer(layout.world,aiImages);
 $('app').classList.remove('monastery-mode','detective-mode','dessert-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('ai-mode');
 journey.ai.edition='studio';syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 14';document.querySelector('.health-stat .hud-label').textContent='현재 주문';
 $('health-value').hidden=true;$('museum-colors').hidden=true;$('history-era').hidden=false;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동';document.querySelector('#flash-button b').textContent='자동완성 칩';document.querySelector('.flash-tip').textContent='원본에 자동 맞춤 · 2회';document.querySelector('#pause-overlay .modal-lead').textContent='게임과 생성이 잠시 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동·조건 변경 · SPACE/J/E 스캔·생성·출력 · R 스캐너로 돌아가기 · L 자동완성 칩';$('dpad').setAttribute('aria-label','AI상상출력실 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 날개 특징을 코어에 보내 여우의 날개를 바꾸는 모습');$('answer-input').value='';$('answer-help').textContent='그림 단서를 보고 정답을 입력해 보세요.';
}
async function enterAI(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='출력실을 준비하는 중…';
 try{await prepareAI();game=new AIGame({onEvent:handleGameEvent});finishTransition.reset();endReason=null;journey.ai.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
const useAIAction=()=>{if(state==='playing'&&isAI()){advanceLiteratureInput();unlockAudio();game.act();hud();}};
$('ai-act').addEventListener('pointerdown',e=>{e.preventDefault();useAIAction();});
$('ai-act').addEventListener('click',e=>{if(e.detail===0)useAIAction();});

function peekAI(){if(state==='playing'&&isAI()&&game?.peek()){clearInput();hud();}}
$('ai-original').addEventListener('click',peekAI);
window.addEventListener('keydown',e=>{if(e.code==='KeyR'&&isAI()&&state==='playing'&&!e.repeat){e.preventDefault();peekAI();}});

$('ai-tunes').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!isAI()||state!=='playing')return;if(game.setInfluence(Number(b.dataset.ch),Number(b.dataset.level)))hud();});


async function prepareDessert(){
 dessertImages ||= await loadDessertAssets(character);journey.dessert ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0,pastries:[]};activePlace='dessert';progress.clues=[...journey.dessert.clues];renderer=new DessertRenderer(layout.world,dessertImages);
 $('app').classList.remove('monastery-mode','detective-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('dessert-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 15';document.querySelector('.health-stat .hud-label').textContent='가까운 오븐';
 $('health-value').hidden=true;$('museum-colors').hidden=true;$('history-era').hidden=false;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='방향키로 이동';document.querySelector('#flash-button b').textContent='오븐 리모컨';document.querySelector('.flash-tip').textContent='오븐만 4초 정지 · 3회';document.querySelector('#pause-overlay .modal-lead').textContent='제한시간과 모든 오븐이 함께 멈췄어요.';

 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE/J/E 꺼내기 · L 오븐 정지';$('ocean').setAttribute('aria-label','세 오븐의 초록 구간을 보고 완성된 디저트를 꺼내는 게임');$('dpad').setAttribute('aria-label','디저트 공방 이동 방향키');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 초록불이 켜진 오븐에서 쿠키를 꺼내는 모습');$('answer-input').value='';$('answer-help').textContent='그림 속 디저트의 이름을 입력해 보세요.';
}
async function enterDessert(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='공방을 준비하는 중…';
 try{await prepareDessert();game=new DessertGame({onEvent:handleGameEvent});finishTransition.reset();endReason=null;journey.dessert.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
const useDessertWork=()=>{if(state==='playing'&&isDessert()){advanceLiteratureInput();unlockAudio();game.act();hud();}};
$('dessert-act').addEventListener('pointerdown',e=>{e.preventDefault();useDessertWork();});
$('dessert-act').addEventListener('click',e=>{if(e.detail===0)useDessertWork();});

dessertFinish=new DessertFinishUI($('game-ui'),{getGame:()=>game,active:()=>state==='playing'&&isDessert(),onChange:()=>hud()});

async function prepareDetective(){
 detectiveImages ||= await loadDetectiveAssets(character);journey.detective ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0,evidence:[],room:0,caught:0};activePlace='detective';progress.clues=[...journey.detective.clues];renderer=new DetectiveRenderer(layout.world,detectiveImages);
 $('app').classList.remove('monastery-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('detective-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 16';document.querySelector('.health-stat .hud-label').textContent='남은 기회';
 $('health-value').hidden=false;$('museum-colors').hidden=true;$('history-era').hidden=true;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 document.querySelector('.control-label span').textContent='시야를 피해 이동';document.querySelector('#flash-button b').textContent='태엽쥐';document.querySelector('.flash-tip').textContent='바라보는 쪽으로 소리 유인 · 3회';document.querySelector('#pause-overlay .modal-lead').textContent='조사 시간과 경비원의 순찰이 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE/J/E 누르고 조사 · H/K 숨기 · L 태엽쥐';$('ocean').setAttribute('aria-label','경비원의 시야를 피해 증거를 조사하는 탐정사무소');$('dpad').setAttribute('aria-label','탐정사무소 이동 방향키');$('brief-sub').setAttribute('aria-label','가구 뒤에서 움직이는 캐릭터');$('answer-input').value='';$('answer-help').textContent='증거를 모아 완성한 물건의 이름을 입력해 보세요.';
}
async function enterDetective(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='사건 파일을 준비하는 중…';
 try{await prepareDetective();game=new DetectiveGame({onEvent:handleGameEvent});finishTransition.reset();endReason=null;journey.detective.phase='briefing';persistJourney();setState('briefing');hud();}catch(e){console.error(e);$('museum-enter').textContent='다시 입장하기';}finally{$('museum-enter').disabled=false;}
}
function detectiveAction(){if(state!=='playing'||!isDetective())return;advanceLiteratureInput();unlockAudio();game.beginAction();hud();}
$('detective-act').addEventListener('pointerdown',e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);detectiveAction();});
for(const name of ['pointerup','pointercancel'])$('detective-act').addEventListener(name,e=>{e.preventDefault();if(isDetective()){advanceLiteratureInput();game.releaseAction();hud();}});
$('detective-act').addEventListener('click',e=>{if(e.detail===0)detectiveAction();});
$('detective-hide').addEventListener('click',()=>{if(state==='playing'&&isDetective()){advanceLiteratureInput();unlockAudio();game.hide();hud();}});

async function prepareMonastery(){
 monasteryImages ||= await loadMonasteryAssets(character);journey.monastery ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0,lit:[],mistakes:0,flashes:MONASTERY.flashes};activePlace='monastery';progress.clues=[...journey.monastery.clues];renderer=new MonasteryRenderer(layout.world,monasteryImages);
 $('app').classList.remove('detective-mode','dessert-mode','ai-mode','zoo-mode','literature-mode','dream-mode','newspaper-mode','language-mode','writer-mode','space-mode','museum-mode','history-mode','exchange-mode','temple-mode','robot-mode');$('app').classList.add('monastery-mode');
 syncCurrentPlaceHeaders();document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · 17';document.querySelector('.health-stat .hud-label').textContent='지나는 곳';
 $('health-value').hidden=true;$('museum-colors').hidden=true;$('history-era').hidden=false;$('history-message').hidden=true;$('history-actions').hidden=true;$('museum-actions').hidden=true;
 $('monastery-balance').innerHTML='<b>균형</b>';$('monastery-balance').setAttribute('aria-label','누르고 연등 균형 잡기');
 document.querySelector('.control-label span').textContent='방향키로 이동 · ↑↓ 길 바꾸기';document.querySelector('#flash-button b').textContent='바람막이';document.querySelector('.flash-tip').textContent='5초 동안 바람 보호 · 2회';document.querySelector('#pause-overlay .modal-lead').textContent='제한시간과 바람, 연등의 흔들림이 함께 멈췄어요.';

 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent='← → / A D 이동 · SPACE/J/E 누르고 균형 · L 바람막이';$('ocean').setAttribute('aria-label','바람과 목교에서 연등의 균형을 잡아 아홉 불빛을 밝히는 사찰');$('dpad').setAttribute('aria-label','사찰 방향키 · 위아래로 길 바꾸기');$('brief-sub').setAttribute('aria-label','선택한 캐릭터가 연등을 들고 균형을 잡는 모습');$('answer-input').value='';$('answer-help').textContent='사찰에서 소리를 내는 이 물건의 이름은 무엇일까요?';
}
async function enterMonastery(){
 $('museum-enter').disabled=true;$('museum-enter').textContent='산문을 여는 중…';
 try{await prepareMonastery();game=new MonasteryGame({onEvent:handleGameEvent});finishTransition.reset();endReason=null;journey.monastery.phase='briefing';persistJourney();setState('briefing');hud();}
 catch(error){console.error(error);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='사찰 그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
function balanceMonastery(){if(state!=='playing'||!isMonastery())return;advanceLiteratureInput();unlockAudio();game.beginBalance();hud();}
$('monastery-balance').addEventListener('pointerdown',e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);balanceMonastery();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('monastery-balance').addEventListener(type,e=>{e.preventDefault();if(isMonastery()&&game){advanceLiteratureInput();game.releaseBalance();hud();}});
$('monastery-balance').addEventListener('click',e=>{if(e.detail===0&&isMonastery()&&state==='playing'){advanceLiteratureInput();game.balancing?game.releaseBalance():game.beginBalance();hud();}});

async function fieldAssets(place){
 if(place==='pursuit'){
  if(pursuitImages?.characterId!==character.id)
   pursuitImages={...await loadPursuitAssets(character),characterId:character.id};
  return pursuitImages;
 }
 if(place==='memory')return memoryImages ||= await loadMemoryAssets();
 if(place==='cinema')return cinemaImages ||= await loadCinemaAssets(character);
 if(place==='gym')return gymImages ||= await loadGymAssets(character);
 if(place==='datacenter')return dataCenterImages ||= await loadDataCenterAssets(character);
 if(place==='conservation')return conservationImages ||= await loadConservationAssets(character);
 if(place==='photo')return photoImages ||= await loadPhotoAssets(character);
 return gardenImages ||= await loadGardenAssets(character);
}
async function prepareField(place){
 const spec=FIELD[place],assets=await fieldAssets(place);
 if(place==='memory')await assets.loadExplorer(character);
 if(CLUE_PUZZLES[place])await prepareCluePuzzle($('app'),place);
 journey[place] ||= {phase:'title',clues:[],elapsed:0,survived:false,hintsSeen:0,room:0,flashes:spec.rules.flashes??1};
 if(place==='gym')journey[place].edition='dodgeball';
 if(place==='cinema'){journey[place].edition='moviequiz';cinemaUI ||= new CinemaUI($('cinema-choices'),i=>{if(isCinema()&&state==='playing'){advanceLiteratureInput();game.choose(i);hud();}});}
 activePlace=place;progress.clues=[...journey[place].clues];
 renderer=place==='pursuit'?new PursuitRenderer(layout.world,assets,layout.ctx):new spec.Renderer(layout.world,assets);
 $('app').classList.remove(...PLACES.map(p=>p.id+'-mode'),'museum-mode');$('app').classList.add('field-mode',place+'-mode');
 $('history-actions').hidden=true;$('museum-actions').hidden=true;$('history-era').hidden=false;$('museum-colors').hidden=true;
 document.querySelector('.game-header .wordmark').textContent='PLAY THE BOOK · '+(PLACES.findIndex(p=>p.id===place)+1);
 syncCurrentPlaceHeaders();document.querySelector('.health-stat .hud-label').textContent=place==='photo'?'촬영실':place==='garden'?'온실':place==='datacenter'?'전송 중':'작업 종류';
 document.querySelector('.control-label span').textContent=place==='conservation'?'방향키로 도구 이동':'방향키로 이동';document.querySelector('#flash-button b').textContent=spec.item||(place==='photo'?'자동 촬영':'정원사 호출벨');document.querySelector('.flash-tip').textContent=spec.itemTip||(place==='photo'?'피사체를 따라가 자동으로 한 장 촬영 · 1회':'가까운 식물 한 곳을 정원사가 마무리 · 1회');document.querySelector('#pause-overlay .modal-lead').textContent=spec.item?'제한시간과 작업이 함께 멈췄어요.':place==='photo'?'제한시간과 촬영 대상이 함께 멈췄어요.':'제한시간과 온실의 온도가 함께 멈췄어요.';
 applyIcons(document.querySelector('.instruction-list'));document.querySelector('.desktop-keys').textContent=spec.item?'방향키 / WASD '+(place==='conservation'?'도구 이동':'이동')+' · SPACE/J/E 작업'+(place==='conservation'?' · R 종이 회전':'')+' · L 아이템':'방향키 / WASD 이동 · SPACE/J/E '+(place==='photo'?'누르고 놓아 촬영':'장치 조작')+(place==='photo'?' · 양옆 출입구로 공간 이동':' · 1/2/3 공간 이동')+' · L 아이템';
 $('dpad').setAttribute('aria-label',spec.name+' 방향키');$('brief-sub').setAttribute('aria-label',spec.name+' 캐릭터');$('answer-input').value='';$('answer-help').textContent='완성한 그림 속 도구의 이름은 무엇일까요?';
 if(place==='gym'){$('history-era').hidden=true;$('health-value').hidden=false;document.querySelector('.health-stat .hud-label').textContent='체력';syncCurrentPlaceHeaders();document.querySelector('.desktop-keys').textContent='방향키 / WASD 이동 · L 타임아웃 휘슬';document.querySelector('#pause-overlay .modal-lead').textContent='제한시간과 공이 함께 멈췄어요.';}
 if(place==='cinema'){$('health-value').hidden=true;document.querySelector('.health-stat .hud-label').textContent='상영 영화';syncCurrentPlaceHeaders();document.querySelector('.control-label span').textContent='방향키로 보기 선택';document.querySelector('.desktop-keys').textContent='방향키 보기 선택 · SPACE 결정 · L 영화 정보';document.querySelector('#pause-overlay .modal-lead').textContent='상영 중인 영화가 멈췄어요.';}
 if(place==='pursuit'){
  $('health-value').hidden=true;
  document.querySelector('.health-stat .hud-label').textContent='추적 단계';
  document.querySelector('.control-label span').textContent='방향키로 지도 핀 선택';
  document.querySelector('.desktop-keys').textContent='지도 핀 누르기 / 방향키로 선택 · SPACE 비행 · L 추가 단서';
  document.querySelector('#pause-overlay .modal-lead').textContent='추적을 잠시 멈췄어요. 이어서 남은 비행 기회를 사용할 수 있어요.';
  $('brief-sub').setAttribute('aria-label',character.name+'의 국제수사본부. 그림 단서와 일곱 후보 도시가 표시된 세계 지도');
 }
 if(place==='memory'){
  $('health-value').hidden=true;document.querySelector('.health-stat .hud-label').textContent='그림';
  document.querySelector('.control-label span').textContent='방향키로 표시 이동';
  document.querySelector('.desktop-keys').textContent='방향키 이동 · SPACE 찾기 · 그림 직접 누르기 · L 범위 힌트';
  document.querySelector('#pause-overlay .modal-lead').textContent='그림을 살펴보는 시간이 멈췄어요.';
  $('brief-sub').setAttribute('aria-label',`${character.name}의 그림 비교 시범. 원본과 바뀐 그림을 번갈아 보고 달라진 곳을 찾아요.`);
 }
 if(place==='garden')for(const b of $('field-room-nav').querySelectorAll('button'))b.setAttribute('aria-label',spec.rooms[Number(b.dataset.fieldRoom)]+' · 자유 이동');
}
async function enterField(place){
 $('museum-enter').disabled=true;$('museum-enter').textContent='문을 여는 중…';
 try{
  await prepareField(place);
  game=createFieldGame(place);finishTransition.reset();endReason=null;journey[place].phase='briefing';persistJourney();
  setState('briefing');hud();
 }
 catch(e){console.error(e);$('museum-enter').textContent='다시 입장하기';document.querySelector('.stage-placeholder').textContent='그림을 불러오지 못했어요. 다시 입장해 주세요.';}
 finally{$('museum-enter').disabled=false;}
}
function cinemaHud(){
 syncCinemaStats(game,$);$('pilot-label').textContent=character.name+' · 영화 관람';$('history-message').hidden=true;
 const item=$('flash-button');if(item.dataset.icon!=='filmInfo'){item.dataset.icon='filmInfo';item.querySelector('svg').outerHTML=icon('filmInfo');}
 item.disabled=state!=='playing'||game.flashes<1||game.hintShown||game.phase==='feedback';item.setAttribute('aria-label','영화 정보, '+game.flashes+'회 남음');
 $('field-act').textContent='결정';$('field-act').disabled=state!=='playing'||!game.canAct;$('field-act').setAttribute('aria-label','고른 영화 결정');
 cinemaUI?.render(game,state==='playing');$('ocean').setAttribute('aria-label','영화관 · '+game.statusDescription+' · 모은 단서 '+game.banked.size+'/9'+(game.hintShown?' · '+game.film.hint:''));
}
function pursuitHud(){
 syncPursuitStats(game,$);
 $('pilot-label').textContent=character.name+' · 세계 지도';
 $('history-message').hidden=true;
 const playing=state==='playing';
 const action=$('field-act'),item=$('flash-button');
 action.disabled=!playing||!game.canAct;
 action.textContent=game.actionLabel;
 action.setAttribute('aria-label',game.selectedCity?game.actionLabel+' · 목적지 '+game.selectedCity.name:game.actionLabel);
 action.classList.toggle('action-ready',!action.disabled);
 if(item.dataset.icon!=='memorySearch'){item.dataset.icon='memorySearch';item.querySelector('svg').outerHTML=icon('memorySearch');}
 $('flash-value').textContent=String(game.flashes);
 item.disabled=!playing||!game.canHint;
 item.setAttribute('aria-label','추가 단서, '+game.flashes+'회 남음');
 for(const btn of $('dpad').querySelectorAll('.dir')){
  const direction=btn.dataset.direction;
  const dx=direction==='left'?-1:direction==='right'?1:0;
  const dy=direction==='up'?-1:direction==='down'?1:0;
  btn.disabled=!playing||!game.canMoveSelection(dx,dy);
 }
 const cityName=game.selectedCity?.name;
 const choiceStatus=$('pursuit-selection-status');
 const statusText=playing&&!game.enlargedClue?pursuitStatus(game).join(' '):'';
 const selection=playing&&game.canAct&&cityName?cityName+' 선택. 비행 버튼을 눌러 출발해요.':'';
 const announcement=[statusText,selection].filter(Boolean).join(' ');
 if(choiceStatus.textContent!==announcement)choiceStatus.textContent=announcement;
 const status=game.phase==='flying'?(game.destination?.name||'목적지')+' 이동 중':game.phase==='arrival'?'도착':game.phase==='complete'?'추적 종료':game.enlargedClue?'그림 단서 확대':(cityName?'선택 도시 '+cityName:'지도에서 핀 선택');
 const remaining=game.phase==='choosing'&&!game.enlargedClue?' · 남은 후보 '+game.choices.length+'곳':'';
 const retry=game.phase==='choosing'&&game.retryNotice?.city?' · '+game.retryNotice.city.name+' 제외':'';
 const report=game.phase==='arrival'&&game.arrival?.correct&&game.round<PURSUIT.rounds?' · 범인은 이미 다른 도시로 달아났어요':'';
 const label='국제수사본부 · 남은 비행 '+game.remainingAttempts+'회 · '+game.round+'/9단계 · '+status+report+retry+remaining+' · 모은 카드 '+game.banked.size+'/9';
 if($('ocean').getAttribute('aria-label')!==label)$('ocean').setAttribute('aria-label',label);
}
let pursuitTap=null;
$('ocean').addEventListener('pointerdown',event=>{
 if(isPursuit()&&state==='playing'&&game.phase==='choosing'&&event.isPrimary&&event.button===0)
  pursuitTap={x:event.clientX,y:event.clientY,id:event.pointerId,game,choices:game.choices};
});
$('ocean').addEventListener('pointerup',event=>{
 const start=pursuitTap;
 if(!start||start.id!==event.pointerId)return;
 pursuitTap=null;
 if(!isPursuit()||state!=='playing'||start.game!==game||start.choices!==game.choices||Math.hypot(event.clientX-start.x,event.clientY-start.y)>9)return;
 const rect=$('ocean').getBoundingClientRect();
 const x=(event.clientX-rect.left)*390/rect.width,y=(event.clientY-rect.top)*500/rect.height;
 advanceLiteratureInput();
 if(state!=='playing'||start.choices!==game.choices)return;
 unlockAudio();
 if(game.enlargedClue){game.closeClue();hud();return;}
 const clue=pursuitClueHit(game,x,y);
 if(clue){game.toggleClue(clue);hud();return;}
 const candidate=pursuitMapHit(game,x,y);
 if(candidate>=0&&game.select(candidate))hud();
});
$('ocean').addEventListener('pointercancel',()=>{pursuitTap=null;});
function memoryHud(){
 syncMemoryStats(game,$);$('history-message').hidden=true;$('pilot-label').textContent=character.name+' · 그림 조사';
 const playing=state==='playing',item=$('flash-button'),action=$('field-act');
 if(item.dataset.icon!==game.itemKind){item.dataset.icon=game.itemKind;item.querySelector('svg').outerHTML=icon(game.itemKind);}
 $('flash-value').textContent=String(game.flashes);item.disabled=!playing||!game.canHint;
 item.setAttribute('aria-label','범위 힌트, '+game.flashes+'회 남음');
 const revisit=$('memory-revisit');
 revisit.disabled=!playing||!game.canRevisit;
 $('memory-revisit-value').textContent=String(game.revisits);
 revisit.setAttribute('aria-label','원본 10초 더보기, '+game.revisits+'회 남음');
 action.textContent='찾기';action.setAttribute('aria-label','표시한 위치 찾기');
 action.disabled=!playing||!game.canAct;action.classList.toggle('action-ready',!action.disabled);
 for(const btn of $('dpad').querySelectorAll('.dir'))btn.disabled=!playing||!game.canMove;
 $('ocean').setAttribute('aria-label','기억연구소 · 그림 '+(game.room+1)+' / 3 · '+game.statusDescription+' · 기회 '+game.remainingAttempts+'번 · 단서 '+game.banked.size+'/9');
}
function fieldHud(){
 if(isGym()){$('history-era').hidden=true;$('health-value').hidden=false;$('pilot-label').textContent=character.name+' · 피구 코트';$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');$('flash-button').disabled=state!=='playing'||game.flashes<=0||game.freezeLeft>0;$('ocean').setAttribute('aria-label','체육관 피구 · 체력 '+game.health+'칸 · 단서 '+game.banked.size+'/9'+(game.freezeLeft>0?' · 타임아웃 '+game.freezeLeft.toFixed(1)+'초':''));return;}

 if(isWorkshop()){workshopHud();return;}
 const spec=FIELD[activePlace];$('history-era').textContent=(game.room+1)+' / 3';$('pilot-label').textContent=character.name+' · '+spec.rooms[game.room];
 if(!isPhoto()){document.querySelector('#flash-button b').textContent=game.itemLabel;document.querySelector('.flash-tip').textContent=game.itemTip;}else syncCurrentPlaceHeaders();
 $('field-room-name').textContent=spec.rooms[game.room]+(!isPhoto()?'\n'+(game.room===0?'실내 '+game.climate.temperature.toFixed(1)+'℃ · '+game.climate.weather.label:game.room===1?(game.pollen===null?'꽃가루를 받아요':['금빛','분홍','파란'][game.pollen]+' 꽃가루'):'남은 벌레 '+game.bugs.filter(b=>b.hp>0).length):'');for(const b of $('field-room-nav').querySelectorAll('button')){b.setAttribute('aria-pressed',String(Number(b.dataset.fieldRoom)===game.room));b.disabled=state!=='playing';const n=Number(b.dataset.fieldRoom),label=isPhoto()?String(n+1):String(n+1)+'\n'+['온도','꽃가루','해충'][n];if(b.textContent!==label)b.textContent=label;b.setAttribute('aria-label',spec.rooms[n]+' · 자유 이동'+(!isPhoto()&&n===0?' · '+game.rooms[n].temperature.toFixed(1)+'도':''));}
 $('field-act').textContent=game.actionLabel;$('field-act').disabled=state!=='playing'||!!game.autoShot||(!game.canAct&&!game.focusing);$('field-act').classList.toggle('action-ready',isPhoto()?game.focusing&&game.quality().good:game.canAct);$('field-act').setAttribute('aria-label',isPhoto()?(game.autoShot?'자동 촬영 중':game.focusing&&game.quality().good?'촬영 준비 완료 · 손을 떼어 찍기':'누르고 초점 맞춘 뒤 놓아 촬영하기'):game.actionLabel+' · 가까운 화분 또는 온실 장치');
 $('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');
 $('ocean').setAttribute('aria-label',spec.name+' · '+spec.rooms[game.room]+' · 단서 '+game.banked.size+'/9 · '+game.prompt+(isPhoto()?' · 목표 '+(game.target?.name||'촬영실 완료')+' · 초점 '+Math.round(game.focus*100)+'%':' · '+game.statusDescription));
}
$('field-room-nav').addEventListener('click',e=>{const button=e.target.closest('[data-field-room]');if(!button||!isField()||state!=='playing')return;advanceLiteratureInput();game.goRoom(Number(button.dataset.fieldRoom));hud();});
$('field-act').addEventListener('pointerdown',e=>{if(!isField()||state!=='playing')return;e.preventDefault();advanceLiteratureInput();unlockAudio();e.currentTarget.setPointerCapture(e.pointerId);game.beginAction();hud();});
$('field-act').addEventListener('pointerup',e=>{if(!isField())return;e.preventDefault();advanceLiteratureInput();if(state==='playing')game.releaseAction();else game?.cancelAction?.();hud();});
for(const type of ['pointercancel','lostpointercapture'])$('field-act').addEventListener(type,()=>{if(isField())game?.cancelAction?.();});
$('field-act').addEventListener('click',e=>{if(e.detail===0&&isField()&&state==='playing'){advanceLiteratureInput();game.act();hud();}});
let photoTap=null;
$('ocean').addEventListener('pointerdown',e=>{if(isPhoto()&&state==='playing')photoTap={x:e.clientX,y:e.clientY,id:e.pointerId};});
$('ocean').addEventListener('pointerup',e=>{const start=photoTap;photoTap=null;if(!isPhoto()||state!=='playing'||!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>9)return;advanceLiteratureInput();const r=$('ocean').getBoundingClientRect(),x=(e.clientX-r.left)*390/r.width,y=(e.clientY-r.top)*500/r.height;if(game.selectAt(x,y))hud();});
$('ocean').addEventListener('pointercancel',()=>{photoTap=null;});
$('memory-revisit').addEventListener('click',()=>{
 if(!isMemory()||state!=='playing'||!game.revisitOriginal())return;
 clearInput();unlockAudio();hud();
});
let memoryTap=null;
$('ocean').addEventListener('pointerdown',event=>{
 if(isMemory()&&state==='playing'&&game.canAct&&event.isPrimary&&event.button===0)memoryTap={x:event.clientX,y:event.clientY,id:event.pointerId,game,round:game.room};
});
$('ocean').addEventListener('pointerup',event=>{
 const start=memoryTap;
 if(!start||start.id!==event.pointerId)return;
 memoryTap=null;
 if(!isMemory()||state!=='playing'||start.game!==game||start.round!==game.room||Math.hypot(event.clientX-start.x,event.clientY-start.y)>9)return;
 const r=$('ocean').getBoundingClientRect();
 unlockAudio();
 if(game.pressPicture((event.clientX-r.left)*390/r.width,(event.clientY-r.top)*500/r.height))hud();
});
$('ocean').addEventListener('pointercancel',()=>{memoryTap=null;});

function workshopHud(){
 const spec=FIELD[activePlace];$('history-era').textContent=activePlace==='datacenter'?game.packets.length+' / 2':['먼지','종이','압착'][game.book.mode];$('pilot-label').textContent=character.name+' · '+(game.file?.name||game.book?.name);document.querySelector('#flash-button b').textContent=game.itemLabel;document.querySelector('.flash-tip').textContent=game.itemTip;
 $('field-act').textContent=game.actionLabel;$('field-act').disabled=state!=='playing'||!game.canAct;$('field-act').setAttribute('aria-label',game.actionLabel);$('field-act').classList.toggle('action-ready',game.holding||!!game.work);$('history-message').textContent=game.prompt;$('history-message').hidden=state!=='playing'||!game.prompt;$('history-message').classList.remove('danger');workshopUI.render(game,state==='playing',activePlace);$('ocean').setAttribute('aria-label',spec.name+' · '+game.statusDescription+' · 단서 '+game.banked.size+'/9 · '+game.prompt);
}
