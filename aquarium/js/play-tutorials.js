import {PursuitGame} from './pursuit-game.js?v252';
import {PostalGame,postalDepartureMountTime} from './postal-core.js?v275';
import {MemoryGame,MEMORY,MEMORY_BOARD,MEMORY_DEMO_PLAN,MEMORY_SIZE} from './memory-core.js?v224';
import {CinemaGame} from './cinema-core.js?v268';
import {GymGame} from './gym-core.js?v268';
import {DataCenterGame} from './datacenter-core.js?v268';
import {ConservationGame,patchTarget,patchSeams,BOOK_WORK} from './conservation-core.js?v268';
import {observeTutorial} from './tutorial-input.js?v268';
import {PhotoGame,photoGlareAt,photoLight} from './photo-core.js';
import {GardenGame} from './garden-core.js?v268';
import {DONORS,gardenBugPose} from './garden-care.js';
import {extendExamples} from './tutorial-examples.js?v=156';
import {groupTutorial} from './tutorial-pages.js?v270';
// Isolated demonstrations. Inputs call the production game rules; no journey or storage access.
import {AquariumGame} from './core.js';
import {MuseumGame} from './museum-core.js';
import {HistoryGame} from './history-core.js';
import {ExchangeGame} from './exchange-core.js';
import {CityHallGame,CITY_DEMO_PLAN} from './cityhall-core.js';
import {TempleGame,routeZ,templeZoneAt} from './temple-core.js?v268';
import {RobotGame} from './robot-core.js';
import {SpaceGame,spaceCamera} from './space-core.js';
import {WriterGame,ALICE_GATE,CASTLE} from './writer-core.js?v214';
import {LanguageGame} from './language-core.js';
import {NewspaperGame} from './newspaper-core.js';
import {DessertGame} from './dessert-core.js';
import {stampTarget} from './dessert-finishing.js';
import {DreamGame} from './dream-core.js?v268';
import {LiteratureGame,roomBase,lockAt} from './literature-core.js?v249';
import {SEWING,seamX} from './literature-rules.js';
import {ZooGame} from './zoo-core.js?v=155';
import {DetectiveGame,canSee} from './detective-core.js';
import {AITutorial} from './ai-tutorial.js';
import {MonasteryGame,LANTERN_ROUTE,TEMPLE_BELLS,bellPassage} from './monastery-core.js?v228';
import {awardClue} from './clue-order.js';

export const TUTORIAL_PLACES=['aquarium','museum','history','exchange','temple','robot','space','writer','language','newspaper','dream','zoo','literature','ai','dessert','detective','monastery','photo','garden','datacenter','conservation','cityhall','gym','cinema','memory','pursuit','postal'];
export class PlayTutorial{
 constructor(game,titles){this.game=game;this.titles=titles;this.total=titles.length;this.seq=[];this.i=0;this.age=0;this.ageHere=0;this.step=0;this.caption='';this.control='';this.done=false;this.fade=0;this.events=[];game.onEvent=e=>{this.events.push(e);this.onEvent?.(e);};}
 get title(){return this.titles[this.step];}
 add(s,txt,op){this.seq.push({s,txt,...op});return this;}
 hold(s,txt,sec=2,control=''){return this.add(s,txt,{sec,control});}
 act(s,txt,fn,control='행동'){return this.add(s,txt,{fn,control});}
 cut(s,txt,fn){return this.add(s,txt,{cut:fn,sec:.65});}
 input(s,txt,sec,input,control='방향키'){return this.add(s,txt,{sec,input,control});}
 walk(s,txt,x,y,control='방향키'){return this.add(s,txt,{point:[x,y],control});}
 until(s,txt,until,input={},max=8,control=''){return this.add(s,txt,{until,input,max,control});}
 still(s,txt,sec=2){return this.add(s,txt,{sec,still:true});}
 update(dt){let left=Math.min(.2,Math.max(0,dt));while(left>1e-8&&!this.done){const d=Math.min(left,1/60);this.advance(d);left-=d;}}
 advance(dt){const o=this.seq[this.i];if(!o){this.done=true;return;}this.age+=dt;this.ageHere+=dt;this.step=o.s;this.caption=o.txt;this.control=o.control||'';this.previewPress=o.press||'';this.fade=0;
  const next=()=>{this.i++;this.ageHere=0;if(this.i===this.seq.length)this.done=true;};
  if(o.cut){this.fade=Math.sin(Math.PI*this.ageHere/o.sec);if(!o.applied&&this.ageHere>=o.sec/2){o.cut();o.applied=true;}if(this.ageHere>=o.sec){this.fade=0;next();}return;}
  if(o.fn){o.fn();next();return;}
  if(o.drag){const d=o.drag,n=this.game.nodes[d.id];if(!d.from){d.from={x:n.x,y:n.y};this.game.beginDrag(n.x,n.y);}const u=Math.min(1,this.ageHere/o.sec),x=d.from.x+(d.to[0]-d.from.x)*u,y=d.from.y+(d.to[1]-d.from.y)*u;this.game.dragTo(x,y);this.game.demoPointer={x,y};this.game.update(dt);if(u===1){this.game.endDrag();this.game.demoPointer=null;next();}return;}
  if(o.point){const p=this.game.player,dx=o.point[0]-p.x,dy=o.point[1]==null?0:o.point[1]-p.y,n=Math.hypot(dx,dy);if(n<3){next();return;}if(this.ageHere>9)throw Error('Tutorial route blocked: '+this.title+' '+JSON.stringify(o.point));this.game.update(Math.min(dt,n/240),{x:dx/n,y:dy/n});return;}
  if(o.until&&o.until()){next();return;}
  if(o.until&&this.ageHere>(o.max||8))throw Error('Tutorial action timed out: '+this.title+' '+o.txt);
  if(!o.still)this.game.update(dt,typeof o.input==='function'?o.input():o.input||{});
  if(o.sec&&this.ageHere>=o.sec)next();
 }
}
const at=(g,x,y)=>{Object.assign(g.player,{x,y,moving:false});if(g.camera){g.camera.x=Math.max(0,x-140);g.camera.y=0;}};
function aquarium(){
 const g=new AquariumGame({random:()=>.4}),t=new PlayTutorial(g,['방향키와 단서','상어 피하기','빛 발사','수리해파리']);g.nextEnemy=g.nextFast=999;g.cardQueue=[];g.healTimes=[];
 t.hold(0,'방향키로 잠수함을 움직여 단서에 닿아요.',2);
 t.act(0,'오른쪽에서 단서 카드가 흘러와요.',()=>g.pickups.push({type:'card',id:1,x:325,y:340,phase:0}),'→ ↑');
 t.walk(0,'위쪽 단서로 다가가요.',170,340).hold(0,'단서 한 장을 모았어요.',1.6);
 t.act(1,'상어가 오는 길을 보고 비켜요.',()=>{g.spawnEnemy('basic');g.enemies.at(-1).y=g.enemies.at(-1).baseY=340;},'↓');
 t.walk(1,'아래쪽 빈 공간으로 피했어요.',170,480).hold(1,'상어가 지나간 뒤 단서를 찾아요.',2.5);
 t.act(2,'위험할 때 빛을 쓰면 가까운 상어가 피해요.',()=>{g.spawnEnemy('hammer');Object.assign(g.enemies.at(-1),{x:450,y:g.player.y,baseY:g.player.y});},'빛');
 t.hold(2,'빛 발사 · 3회 사용 가능',1.9,'빛').act(2,'빛을 발사해 상어를 밀어내요.',()=>g.flash(),'빛').hold(2,'지금처럼 가까운 상어에게 사용해요.',3.2,'빛');
 t.act(3,'이번에는 피하지 않고 상어에 부딪히는 모습을 볼게요.',()=>{g.spawnEnemy('basic');Object.assign(g.enemies.at(-1),{x:440,y:g.player.y,baseY:g.player.y});},'');
 t.until(3,'상어와 닿는 순간 내구도가 세 칸에서 두 칸으로 줄어요.',()=>g.health===2,{},6).hold(3,'잠수함에 생긴 금과 위쪽 내구도를 확인해요.',2.5);
 t.act(3,'금이 간 상태에서 수리해파리를 먹어 봐요.',()=>g.pickups.push({type:'heal',x:365,y:g.player.y,phase:0}),'');
 t.hold(3,'수리해파리에 닿으면 한 칸 회복해요.',.6).walk(3,'해파리를 향해 움직여요.',235,570).hold(3,'금이 사라지고 내구도가 다시 세 칸이 됐어요.',2.4);return t;
}
function museum(){
 const g=new MuseumGame({random:()=>.99}),t=new PlayTutorial(g,['사다리 타기','새총 발사','점프하며 발사','시간 정지']);
 const flying={...g.monsters[6]};g.monsters=[g.monsters[0],g.monsters[1]];g.monsters.forEach((m,i)=>Object.assign(m,{x:220+i*95,y:296,floor:3,decision:99}));
 t.hold(0,'방향키로 걷고, 사다리 앞에서 위를 눌러요.',1.8).walk(0,'사다리 가까이 가요.',29,650).input(0,'위쪽을 누르면 손을 번갈아 잡고 올라가요.',1.25,{y:-1},'↑').hold(0,'사다리를 타는 동안에는 발사할 수 없어요.',1);
 t.cut(1,'몬스터 쪽을 바라보고 새총을 눌러요.',()=>{Object.assign(g.player,{x:65,y:532,floor:1,face:1,climbing:false});g.monsters.forEach(m=>{m.y=m.floor===1?414:m.y;m.floor=m.floor===1?2:m.floor;});Object.assign(g.monsters[0],{x:230,y:532,floor:1,dir:1});});
 t.act(1,'새총알이 몬스터에 닿으면 색과 단서를 되찾아요.',()=>g.shoot(),'새총').input(1,'누르고 있으면 일정한 간격으로 계속 발사해요.',1.2,()=>{g.shoot();return {};},'새총');
 t.cut(2,'떠 있는 몬스터는 점프해서 높이를 맞춰요.',()=>{Object.assign(g.player,{x:80,y:532,floor:1,vy:0});g.monsters.push({...flying,x:205,y:458,floor:1,flight:{x:50,y:458}});});
 t.act(2,'점프한 뒤 새총을 발사해요.',()=>g.jump(),'점프').hold(2,'공중에서도 바라보는 방향으로 쏠 수 있어요.',.25,'점프').act(2,'높이를 맞춰 발사!',()=>g.shoot(),'새총').hold(2,'발사 타이밍을 맞춰 보세요.',1.7);
 t.cut(3,'움직이는 몬스터를 시간 정지로 멈춰요.',()=>{Object.assign(g.player,{x:80,y:532,floor:1,vy:0,climbing:false,face:1});g.monsters.push({...g.monsters[0],id:9,alive:true,x:300,y:532,floor:1,dir:-1,decision:99});}).input(3,'움직이는 몬스터를 살펴요.',.9,{});
 t.act(3,'시간 정지를 누르면 몬스터만 3초 멈춰요.',()=>g.flash(),'시간 정지').hold(3,'몬스터가 멈춘 동안에도 시간은 흘러요.',1.3).input(3,'주인공은 계속 움직이고 새총도 쏠 수 있어요.',.3,{x:1},'→').act(3,'멈춘 동안 새총으로 단서를 모아요.',()=>g.shoot(),'새총').hold(3,'제한시간은 계속 흐른다는 점을 기억하세요.',2.3);return t;
}
function history(){
 const g=new HistoryGame(),t=new PlayTutorial(g,['탑승과 하차','세 번 망치질','단서 줍기와 속도업','시간 안에 귀환']);g.phase='ready';
 t.hold(0,'타임머신 가까이에서 탑승을 눌러요.',1.4).walk(0,'좌석 앞으로 이동해요.',195,310).act(0,'앉고 문이 닫히면 시간 여행을 시작해요.',()=>g.interact(),'탑승').until(0,'시간 여행을 마치면 하차를 눌러요.',()=>g.phase==='docked',{},9).act(0,'완전히 내린 순간부터 20초를 세요.',()=>g.interact(),'하차').until(0,'문이 열리고 계단이 펼쳐져요.',()=>g.phase==='explore',{},3);
 t.walk(1,'반짝이는 나무상자 쪽으로 이동해요.',238,450).walk(1,'망치가 닿는 거리까지 다가가요.',238,325);
 for(let k=0;k<3;k++){t.walk(1,'적이 다가오기 전에 한 번 치고 물러나요.',191,325).act(1,`망치 ${k+1}번 · 금이 갈수록 단서에 가까워져요.`,()=>g.hammer(),'망치').hold(1,'적이 오면 구역 밖으로 물러나요.',.3,'망치');if(k===2)t.walk(2,'상자가 깨져도 단서는 직접 주워야 해요.',152,325);t.walk(k===2?2:1,'쫓아온 기사가 돌아갈 때까지 기다려요.',238,325).hold(k===2?2:1,'다시 다가가 망치질할 수 있어요.',1.25);}
 t.act(3,'속도업은 5초 동안 이동을 두 배 빠르게 해요.',()=>g.flash(),'속도업').walk(3,'돌아갈 시간을 남기고 단서를 모아요.',290,266).hold(3,'바닥 단서는 지나가면 획득해요.',.6).walk(3,'20초 안에 타임머신으로 돌아와야 해요.',238,450).walk(3,'단서가 부족해도 먼저 탑승할 수 있어요.',195,450).act(3,'탑승하면 다음 시대로 이어져요.',()=>g.interact(),'탑승').hold(3,'세 시대에서 모은 단서를 보관함에서 합쳐요.',2);return t;
}
function exchange(){
 const g=new ExchangeGame({random:()=>.3}),t=new PlayTutorial(g,['창구에서 안내 듣기','정보와 종목','금액과 아이템','투자 결과']);
 t.hold(0,'위쪽 안내 창구의 원으로 이동해요.',1.8).until(0,'직원과 대화가 시작돼요.',()=>g.phase==='dialogue',{y:-1},2,'↑').hold(0,'다음·이전으로 안내를 읽을 수 있어요.',2,'다음');
 for(let i=0;i<3;i++)t.act(0,'다음 버튼으로 대화를 넘겨요.',()=>g.next(),'다음').hold(0,'설명을 다 읽으면 투자를 시작해요.',.8);
 t.add(1,'투자 시작하기를 눌러 정보를 읽어요.',{sec:.3,press:'panel:start'}).act(1,'투자 시작하기를 눌러 정보를 읽어요.',()=>g.startRound(),'시작').hold(1,'네 줄의 정보에서 유리한 업종을 찾아보세요.',4.5);
 t.act(1,'종목을 고른 뒤 최대 버튼으로 살 수 있는 수량을 정해요.',()=>{g.select(g.stocks.reduce((a,s,i)=>s.end/s.start>g.stocks[a].end/g.stocks[a].start?i:a,0));g.maxBudget();},'최대').hold(1,'주가의 배수만 투자하고 남은 금액은 현금으로 남아요.',3);
 t.act(2,'특급정보는 가장 유리한 종목을 찾는 도움말이에요.',()=>g.useSpecial(),'특급정보').hold(2,'특급정보와 더블업 · 각 1회 사용 가능',3);
 t.act(2,'더블업은 이번 투자의 이익과 손실을 모두 두 배로 해요.',()=>g.toggleDouble(),'×2').hold(2,'손실도 커지므로 신중하게 사용해요.',2.5);
 t.act(3,'투자하기를 누르면 5년 뒤 결과가 나와요.',()=>g.commit(),'투자').hold(3,'시간이 흘러 주식을 팔고 결과를 확인해요.',2.7).hold(3,'다섯 번 투자한 최종 자본으로 단서를 사요. 한 장에 300만원이에요.',4);return t;
}
function temple(){
 const g=new TempleGame({random:()=>.5}),t=new PlayTutorial(g,['신의 공격 피하기','바람 견디기','부두에서 탑승','보호막과 회복']);
 const scene=(z,x=195,mode='walk')=>{Object.assign(g.player,{x,z:routeZ(z),y:routeZ(z),moving:false});g.cameraZ=routeZ(z)-80;g.zone=templeZoneAt(g.player.z);g.zoneAge=g.zoneClock=0;g.attackWait=.8;g.mode=mode;g.hazards=[];g.orbs=[];g.scyllaGrab=null;g.pigLeft=g.invulnerable=g.shieldLeft=g.sirenSlowLeft=0;g.health=3;g.velocity={x:0,z:0};g.queuedMove=null;};
 scene(260);t.hold(0,'번개가 떨어질 바닥 표시를 살펴요.',1.2).input(0,'옆으로 비킨 뒤 단서 쪽으로 걸어가요.',.42,{x:-1},'←').input(0,'공격에 닿으면 체력이 줄어요. 멈추지는 않아요.',1.7,{y:-1},'↑');
 t.cut(0,'키르케의 마법 구슬에 맞으면 돼지로 변해요.',()=>{scene(1250,250);g.spawnAttack();g.attackWait=99;}).until(0,'마법 구슬에 맞으면 체력 한 칸이 줄어요.',()=>g.pigLeft>0,{},3).input(0,'3초 동안 돼지 모습으로 계속 걸을 수 있어요.',3.1,{y:-1},'↑');
 t.cut(1,'다음은 바람 구간이에요.',()=>scene(1510)).hold(1,'바람이 오른쪽으로 밀어내요.',1).input(1,'왼쪽과 위쪽을 함께 누르면 견디며 앞으로 가요.',3.5,{x:-1,y:-1},'← + ↑');
 t.cut(2,'부두에서 배 가까이 이동해요.',()=>scene(1848)).input(2,'배 앞에서 탑승 버튼을 눌러요.',.45,{y:-1},'↑').act(2,'배를 타면 방향키로 바다를 항해해요.',()=>g.interact(),'탑승').hold(2,'바다에서도 그림자와 파도의 틈을 살펴요.',1.1).input(2,'배에 앉아 노를 저으며 움직여요.',1.5,{y:-1},'↑');
 t.cut(2,'사이렌의 음파에 닿으면 배가 느려져요.',()=>{scene(2190,135,'sail');g.zoneClock=1.15;g.attackWait=99;}).input(2,'반대쪽으로 조종해 음파에서 벗어나요.',1.8,{x:1},'→');
 t.cut(2,'스킬라의 그림자는 머리가 덮칠 자리예요.',()=>{scene(3010,195,'sail');g.spawnAttack();g.attackWait=99;}).hold(2,'예고 중에는 안전해요. 머리가 닿기 전에 비켜요.',1).hold(2,'물리면 동굴로 끌려가며 체력 한 칸이 줄어요.',1.7);
 t.cut(3,'위험한 공격 앞에서 아테나의 가호를 사용해요.',()=>{scene(3795,215,'sail');g.attackWait=99;g.health=2;g.hazards.push({kind:'wave',axis:'z',x:195,z:g.player.z+routeZ(150),gap:75,gapSize:90,v:-routeZ(130),age:0,warn:.35,life:4});}).act(3,'4초 동안 공격을 막는 보호막이 생겨요.',()=>g.flash(),'아테나의 가호').hold(3,'보호막이 있을 때는 파도에 닿아도 체력이 줄지 않아요.',1.8).input(3,'암브로시아에 닿으면 체력 한 칸을 회복해요.',1.3,{y:-1},'↑').hold(3,'회복약은 포세이돈의 바다 앞에만 있어요.',2.2);return t;
}
function robot(){
 const g=new RobotGame({tutorial:true}),t=new PlayTutorial(g,['필요한 부품 찾기','집어서 운반','작업으로 수리','자석 공구']);
 t.hold(0,'로봇 머리 위 그림이 필요한 부품이에요.',2.6).walk(1,'작업대 옆 통로로 컨베이어에 다가가요.',140,453).walk(1,'컨베이어 가까이에서 작업을 눌러 부품을 집어요.',140,212);
 t.until(1,'로봇 팔이 앞을 지날 때 작업을 눌러요.',()=>g.partNear()?.kind==='arm',{},10).act(1,'팔 부품을 손에 들었어요.',()=>g.work(),'작업').hold(1,'부품은 한 번에 하나씩 운반해요.',.7).walk(2,'필요한 로봇의 작업대 가까이 가져가요.',140,365).walk(2,'첫 로봇에 팔을 장착해요.',80,376).act(2,'작업을 누르면 장착 동작이 시작돼요.',()=>g.work(),'작업').hold(2,'수리를 끝내면 로봇이 깨어나고 단서를 받아요.',2.7);
 t.walk(2,'이번에는 작업대 옆 통로로 뒤쪽에 가요.',140,376).walk(2,'다음 로봇에 필요한 배터리를 찾으러 가요.',140,212);
 t.until(2,'배터리를 향해 직접 이동해요.',()=>g.partNear()?.kind==='battery',()=>{
  const part=g.parts.filter(p=>p.kind==='battery'&&p.x<360).sort((a,b)=>Math.abs(a.x-g.player.x)-Math.abs(b.x-g.player.x))[0];
  return {x:Math.sign(Math.max(38,Math.min(352,(part?.x??38)+10))-g.player.x)};
 },10).act(2,'작업으로 배터리를 집어요.',()=>g.work(),'작업').hold(2,'같은 작업 버튼으로 뒤에서도 장착할 수 있어요.',.3);
 t.walk(2,'로봇 뒤쪽 빈 바닥으로 가져가요.',132,260).act(2,'로봇 뒤에서도 작업을 누르면 수리해요.',()=>g.work(),'작업').hold(2,'앞이나 뒤, 가까운 쪽에서 부품을 장착하세요.',1.3);
 t.hold(3,'이 로봇은 센서도 필요해요.',.7).act(3,'빈손으로 로봇 가까이에서 자석을 누르세요.',()=>g.flash(),'자석').hold(3,'필요한 센서가 손으로 날아와요.',.8).act(3,'가져온 부품도 작업 버튼으로 장착해요.',()=>g.work(),'작업').hold(3,'마지막 부품을 장착하면 로봇이 깨어나요.',2.7);return t;
}
function space(){
 const g=new SpaceGame(),t=new PlayTutorial(g,['우주로 출발','이동과 제동','부스터','위험과 회복']);g.nextDebris=999;
 t.hold(0,'출입구에서 출발해 미니맵의 노란 단서를 찾아요.',2.5).walk(1,'방향키로 떠다니는 단서에 다가가요.',900,1638).act(1,'제동을 누르면 미끄러지는 움직임을 멈춰요.',()=>g.brake(),'제동').hold(1,'단서와 직접 닿아야 획득해요.',1.8);
 t.input(2,'아이템을 쓰기 전의 이동 속도를 살펴요.',1.1,{x:-1},'←');
 t.act(2,'부스터는 3초 동안 이동을 1.5배 빠르게 해요.',()=>g.flash(),'부스터').input(2,'넓은 우주에서는 미니맵을 보며 이동해요.',3,{x:-1,y:-1},'← ↑').act(2,'원하는 위치에서 제동으로 멈춰요.',()=>g.brake(),'제동').hold(2,'부스터 효과는 3초 뒤 끝나요.',1.3);
 t.cut(3,'산소 캡슐은 체력을 한 칸 회복해요.',()=>{const oxygen=g.recoveryItems[0];Object.assign(g.player,{x:oxygen.x-90,y:oxygen.y+115,vx:0,vy:0});g.camera=spaceCamera(g.player.x,g.player.y);g.health=2;g.spawnDebris();});
 t.walk(3,'잔해를 피해 산소 캡슐로 이동해요.',g.recoveryItems[0].x,g.recoveryItems[0].y).act(3,'캡슐을 얻으면 사라지고 체력이 회복돼요.',()=>g.brake(),'제동').hold(3,'잔해와 드론에 닿으면 체력이 줄어요.',2.8);return t;
}
function writer(){
 const g=new WriterGame(),t=new PlayTutorial(g,['아기 돼지 삼 형제','앨리스','피터 팬','피노키오','잭과 콩나무','오즈의 마법사','마법 책갈피']);
 const scene=(x,y=440)=>{at(g,x,y);Object.assign(g.player,{vx:0,vy:0,onGround:true,hidden:false,flying:false,climbing:false,size:1});g.hiding=null;g.camera.x=x-160;};
 scene(390);t.act(0,'점프 버튼을 누르면 뛰어올라요.',()=>g.jump(),'점프').hold(0,'착지한 뒤 행동 버튼을 눌러요.',1.25).act(0,'집에 숨으면 늑대의 입김을 피할 수 있어요.',()=>g.act(),'숨기').hold(0,'입김이 멎으면 나와서 앞으로 가요.',2.5).input(0,'집이 무너지면 다음 집으로 이동해요.',1,{x:1},'→');
 t.cut(1,'앨리스 구간에서는 크기를 바꿔요.',()=>{scene(2090);g.chapter=1;}).act(1,'작아져 낮은 문을 통과해요.',()=>g.act(),'변신').walk(1,'방향키를 눌러 작은 문 아래로 이동해요.',ALICE_GATE.x+ALICE_GATE.w-18,null,'→');
 t.cut(2,'피터 팬 구간의 선착장이에요.',()=>{scene(3550);g.chapter=2;}).act(2,'비행을 누르면 위아래로 날 수 있어요.',()=>g.act(),'비행').input(2,'갈고리를 피해 단서를 찾아요.',2,{x:1,y:-1},'→ ↑');
 t.cut(3,'피노키오 앞에서 코 다리를 펼쳐요.',()=>{scene(5900,385);g.chapter=3;}).act(3,'거짓말을 누르면 코가 다리처럼 길어져요.',()=>g.act(),'거짓말').hold(3,'다리가 줄기 전에 건너고 흔들리는 인형을 피해요.',2.3);
 t.cut(4,'콩나무 앞에서 위를 누르면 등반해요.',()=>{scene(7220,20);g.chapter=4;g.player.onGround=false;g.player.climbing=true;g.camera.y=-220;}).input(4,'위아래 방향키로 손 그림자를 피해요.',4.3,()=>({y:g.giant.active&&g.giant.phase!=='retract'?(g.player.y<0?1:0):-1}),'위아래');
 t.cut(5,'오즈에서는 그림자를 피해 노란 길을 걸어요.',()=>{scene(9260);g.chapter=5;});
 t.act(6,'마법 책갈피는 4초 동안 공격을 막아 줘요.',()=>g.flash(),'책갈피').hold(6,'보호막이 생기면 공격을 막을 수 있어요.',1.7).walk(6,'성문 쪽으로 이동해요.',CASTLE.x-CASTLE.range-30,null,'→').hold(6,'성문에 가까이 가면 게임을 마쳐요.',1.2);return t;
}
function language(character='haru'){
 const g=new LanguageGame({characterId:character}),t=new PlayTutorial(g,['집기 · 던짐','방향키 · 점프','글자 자석']);
 t.walk(0,'글자 가까이에서 집기 버튼을 눌러요.',118).act(0,'집으면 글자가 손에 들려요.',()=>g.act(),'집기').hold(0,'들고 있는 동안 버튼이 던짐으로 바뀌어요.',.7).walk(0,'판 가까이에서 던짐 버튼을 눌러요.',175).act(0,'낱말의 첫 글자를 넣어요.',()=>g.act(),'던짐').hold(0,'들어간 글자를 확인해요.',1.1);
 t.walk(0,'다음 글자도 같은 방식으로 집어요.',87).act(0,'낱말 순서에 맞는 글자를 골라요.',()=>g.act(),'집기').hold(0,'글자를 들고 판으로 이동해요.',.5).walk(0,'판 가까이에서 던져요.',175).act(0,'다음 글자를 넣어요.',()=>g.act(),'던짐').hold(0,'낱말이 완성되면 길이 생겨요.',1.3).walk(0,'방향키로 생긴 길을 건너 단서에 닿아요.',525).hold(0,'단서에 닿으면 수집 숫자가 늘어요.',1.2);
 t.cut(1,'방향키로 이동하고 점프로 뛰어올라요.',()=>{at(g,1330,440);g.bots[0].x=g.bots[0].home=1500;Object.assign(g.player,{vy:0,onGround:true,support:null,climbing:false});Object.assign(g.stations[2],{solved:true,solvedAge:2,inserted:['사','다','리']});});
 t.act(1,'점프와 오른쪽을 함께 사용해요.',()=>g.jump(),'점프').input(1,'점프 중에도 좌우로 움직일 수 있어요.',.2,{x:1},'→').until(1,'바닥에 내려와요.',()=>g.player.onGround,{},2).walk(1,'사다리 앞에서 위쪽을 눌러요.',1400).input(1,'위쪽을 누르고 있으면 계속 올라가요.',1.4,{y:-1},'↑').walk(1,'위층에서도 오른쪽으로 계속 이동해요.',1580).hold(1,'단서를 얻은 자리에서 앞으로 나아가면 돼요.',1.8).input(1,'진행 방향으로 이동해요.',.12,{x:1},'→');
 t.cut(2,'빈손으로 판 가까이에서 자석을 사용해요.',()=>{at(g,1870,440);Object.assign(g.player,{vy:0,onGround:true,support:null,climbing:false});});
 for(let k=0;k<2;k++)t.act(2,'자석을 누르면 다음에 필요한 글자가 손으로 와요.',()=>g.flash(),'자석').hold(2,'손에 온 글자도 던짐 버튼으로 넣어야 해요.',1.2).act(2,'던짐을 눌러 글자를 판에 넣어요.',()=>g.act(),'던짐').hold(2,'맞는 글자가 차례로 채워져요.',1.5);
 t.hold(2,'아이템 사용 횟수도 줄어드는 것을 확인해요.',1.4);return t;
}
function newspaper(){
 const g=new NewspaperGame({tutorial:true}),t=new PlayTutorial(g,['취재 메모 읽기','사진과 제목 운반','기사 인쇄','취재 가방']);
 t.walk(0,'취재 메모에 맞는 사진을 찾아 컨베이어로 가요.',195,373);
 const pickup=(kind,s,article=0)=>{t.until(s,'알맞은 '+(kind==='photo'?'사진':'제목')+' 앞으로 이동해요.',()=>g.materialNear()?.kind===kind&&g.materialNear()?.article===article,()=>{
  const m=g.materials.find(m=>m.kind===kind&&m.article===article),p=g.player;
  const x=Math.max(30,Math.min(360,(m?.x??40)+12));
  const dx=x-p.x,dy=373-p.y,n=Math.hypot(dx,dy)||1;
  return {x:dx/n,y:dy/n};
 },10).act(s,'작업으로 재료를 손에 들어요.',()=>g.act(),'작업').hold(s,'사진과 제목은 메모 내용에 맞아야 해요.',s===3?.3:.5);};
 pickup('photo',1);t.walk(1,'왼쪽 기사판 가까이 가져가요.',102,310).act(1,'작업 버튼으로 사진을 붙여요.',()=>g.act(),'작업').hold(1,'이제 같은 기사의 제목도 필요해요.',.6);pickup('title',1);
 t.walk(2,'제목을 왼쪽 기사판에 가져가요.',102,310).act(2,'작업으로 제목을 붙여요.',()=>g.act(),'작업').hold(2,'두 칸을 채우면 버튼이 인쇄로 바뀌어요.',.7).act(2,'빈손으로 인쇄를 누르세요.',()=>g.act(),'인쇄').hold(2,'완성한 기사는 뒤 게시판에 붙고 단서를 받아요.',2);
 // Start this isolated page beside its materials instead of waiting a belt lap.
 t.cut(3,'취재 가방으로 두 재료를 함께 운반해 봐요.',()=>{
  at(g,195,373);
  const pair=['photo','title'].map(kind=>g.materials.find(m=>m.article===1&&m.kind===kind));
  const rest=g.materials.filter(m=>!pair.includes(m));
  g.materials=[...rest.slice(0,2),...pair,...rest.slice(2)];
  g.materials.forEach((m,i)=>{m.x=39+i*78;});
 });
 t.act(3,'취재 가방을 쓰면 사진과 제목을 함께 운반해요.',()=>g.flash(),'취재 가방').hold(3,'가방을 쓰고 바로 두 재료를 집어요.',.3);
 pickup('photo',3,1);pickup('title',3,1);
 t.walk(3,'두 재료를 오른쪽 기사판으로 가져가요.',288,310).act(3,'작업 한 번으로 두 칸을 함께 채워요.',()=>g.act(),'작업').hold(3,'두 재료를 붙이면 인쇄할 수 있어요.',.4).act(3,'빈손으로 인쇄해서 기사를 완성해요.',()=>g.act(),'인쇄').hold(3,'완성된 기사와 단서를 확인해요.',1.4);return t;
}
function dream(){
 const g=new DreamGame(),t=new PlayTutorial(g,['바닥과 천장 반전','점프로 단서 모으기','꿈 지우개','달빛사탕']);
 t.hold(0,'발이 바닥이나 천장에 닿았을 때 반전할 수 있어요.',2).walk(0,'막힌 길 앞에서 천장 쪽으로 방향을 바꿔요.',250).act(0,'반전을 누르면 중력이 뒤집혀요.',()=>g.act(),'반전').until(0,'천장에 닿으면 그 위를 걸을 수 있어요.',()=>g.canShift).walk(0,'천장 길을 따라 막힌 구간을 지나가요.',550).act(0,'다시 반전해 바닥으로 내려가요.',()=>g.act(),'반전').until(0,'발이 닿으면 다시 점프할 수 있어요.',()=>g.canShift);
 t.walk(1,'높은 단서는 점프해서 닿아요.',610).act(1,'점프 버튼으로 책 위를 뛰어올라요.',()=>g.jump(),'점프').walk(1,'단서 쪽으로 움직이며 점프해요.',720).until(1,'발판에 안전하게 내려와요.',()=>g.canJump).hold(1,'움직이는 발판도 착지해서 탈 수 있어요.',1);
 t.walk(2,'장애물이 있는 앞쪽으로 다가가요.',1000).until(2,'가까운 장애물 앞에서 지우개를 사용해요.',()=>g.canErase).act(2,'앞쪽 장애물 하나가 4초 동안 사라져요.',()=>g.flash(),'꿈 지우개').input(2,'사라진 동안 지나가세요.',1.1,{x:1},'→');
 t.cut(3,'중간 구간의 달빛사탕을 찾아요.',()=>{at(g,4520,403);Object.assign(g.player,{vx:0,vy:0,gravity:1,onGround:true,support:'floor'});g.health=2;}).walk(3,'달빛사탕을 먹으면 체력 한 칸이 회복돼요.',4580).hold(3,'안전한 바닥에서 회복된 체력을 확인해요.',2);return t;
}
function literature(){
 const g=new LiteratureGame({random:()=>.45}),t=new PlayTutorial(g,['작품 속으로 이동','가까이에서 행동','타이밍 맞추기','책갈피로 다시 일어나기']);
 const walk=(s,txt,x,y)=>t.walk(s,txt,x,roomBase(g.room)+y);
 t.hold(0,'작품 속에서 빛나는 물건 가까이 이동해요.',2);walk(0,'어린 왕자의 유리 덮개를 찾아요.',78,363);t.act(1,'집기를 누르면 덮개를 들고 갈 수 있어요.',()=>g.act(),'집기');walk(1,'장미 쪽으로 덮개를 가져가요.',195,340);walk(1,'장미 가까이에 가요.',285,193);t.act(1,'덮기를 누르면 장미를 보호해요.',()=>g.act(),'덮기').hold(1,'과제를 마치면 나온 단서를 직접 주워요.',1);t.walk(1,'빛나는 단서를 향해 이동해요.',285,roomBase(0)+200).hold(1,'노란 점선 원은 다음 작품으로 가는 길이에요.',1.4);
 t.cut(2,'노인과 바다에서는 물고기가 물기를 기다려요.',()=>{Object.assign(g.player,{x:195,y:roomBase(2)+282});g.camera.y=roomBase(2);}).until(2,'찌가 움직이면 당겨 버튼을 연타해요.',()=>g.scene.hooked,{},7);
 let nextTap=0;const tap=()=>{if(t.age>=nextTap&&g.actionWait<=0){g.act();nextTap=t.age+.15;}return {};};
 t.input(2,'당겨 버튼을 여러 번 눌러 게이지를 올려요.',.65,tap,'당겨 연타').hold(2,'잠깐 멈추면 게이지가 줄어들어요.',1);
 t.until(2,'다시 빠르게 눌러 게이지를 끝까지 채워요.',()=>g.scene.solved,tap,7,'당겨 연타').hold(2,'게이지가 차면 낚시에 성공해요.',2.2);
 t.cut(3,'재봉은 방향키로 봉제선을 따라가요.',()=>{Object.assign(g.player,{x:SEWING.point.x,y:roomBase(3)+SEWING.point.y});g.camera.y=roomBase(3);}).hold(3,'재봉틀 앞에서 재봉을 눌러요.',.5)
 .act(3,'좌우 방향키로 바늘을 움직일 수 있어요.',()=>g.act(),'재봉')
 .until(3,'금빛 봉제선과 바늘이 겹치도록 좌우로 따라가요.',()=>g.scene.solved,()=>({x:Math.max(-1,Math.min(1,(seamX(g.scene.sewTime)-g.scene.needle)/2))}),14,'좌우');
 t.cut(4,'자물쇠는 금빛 홈에서 열기를 눌러요.',()=>{Object.assign(g.player,{x:232,y:roomBase(7)+209});g.camera.y=roomBase(7);g.scene.nextHazard=999;g.scene.hazards=[];});
 for(let k=0;k<3;k++)t.until(4,'바늘이 금빛 홈에 들어오길 기다려요.',()=>!g.scene.lockWork&&g.actionWait<=0&&lockAt(g.scene.time,g.scene.progress).good,{},6)
 .act(4,'열기를 눌러 자물쇠를 한 단계 풀어요.',()=>g.act(),'열기')
 .until(4,'맞는 순간에 누르면 진행 표시가 채워져요.',()=>g.scene.progress>k,{},2);
 t.hold(4,'세 번 맞추면 보물상자가 열려요.',.5);
 t.cut(5,'통이 굴러오는 길을 확인해요.',()=>{
  Object.assign(g.player,{x:110,y:roomBase(7)+340});g.camera.y=roomBase(7);
  g.scenes[7]=new LiteratureGame().scenes[7];g.scene.nextHazard=999;
  g.spawnHazard(g.scene,'barrel',{x:110,y:160,warn:.7,life:4,r:16});
 })
 .until(5,'통에 닿으면 체력이 한 칸 줄어요.',()=>g.health===2,{},5)
 .input(5,'맞은 직후에도 움직일 수 있어요.',.45,{x:1},'→')
 .act(5,'고쳐 쓰기 책갈피로 다음 공격을 막아요.',()=>g.flash(),'책갈피')
 .hold(5,'책갈피는 4초 동안 보호해요.',1.6);return t;
}
function zoo(character){
 const g=new ZooGame({character}),t=new PlayTutorial(g,['이동 · 각도 조절','먹이 버튼 누르기 · 놓기','호루라기 아이템']);
 t.walk(0,'좌우 방향키로 던질 위치를 옮겨요.',122).walk(0,'좌우로 위치를 조절할 수 있어요.',62).input(0,'위쪽을 누르면 조준선이 높아져요.',.375,{y:-1},'↑').hold(0,'점선으로 날아갈 방향을 살펴요.',.9).input(0,'아래쪽을 누르면 조준선이 낮아져요.',.375,{y:1},'↓').hold(0,'동물의 높이에 맞춰 각도를 조절해요.',.8).walk(0,'다음 동물 앞에서도 같은 방향키를 사용해요.',482).input(0,'높은 곳은 위쪽으로 각도를 올려요.',20/48,{y:-1},'↑').hold(0,'각도를 맞췄으면 먹이를 던질 준비가 됐어요.',1.2);
 for(let k=0;k<2;k++)t.act(1,'먹이 버튼을 누르고 있으면 힘 게이지가 차요.',()=>g.beginThrow(),'먹이 누르기').hold(1,'눌렀다 놓을 때의 힘으로 먹이가 날아가요.',.95,'먹이 누르기').act(1,'손을 떼어 먹이를 던져요.',()=>g.releaseThrow(),'먹이 놓기').hold(1,'동물이 먹으면 머리 위 표시가 채워져요.',2.6);
 t.walk(2,'동물 앞에서 호루라기 아이템을 쓸 수 있어요.',902).input(2,'먹이가 날아갈 각도를 먼저 맞춰요.',14/48,{y:1},'↓').act(2,'호루라기를 누르면 잠깐 받기 쉬워져요.',()=>g.flash(),'호루라기').hold(2,'동물이 입을 열고 기다리는 동안 던져요.',.7).act(2,'먹이 버튼으로 힘을 모아요.',()=>g.beginThrow(),'먹이 누르기').hold(2,'게이지가 찼을 때 놓아요.',.9,'먹이 누르기').act(2,'효과가 유지되는 동안 먹이를 던져요.',()=>g.releaseThrow(),'먹이 놓기').hold(2,'호루라기는 각도와 힘까지 대신 맞추지는 않아요.',2.4);return t;
}
function dessert(){
 const g=new DessertGame(),t=new PlayTutorial(g,['꺼내고 쿠키 도장 찍기','머핀 크림 짜기','타르트 과일 · 오븐 관리']);
 at(g,110,280);Object.assign(g.ovens[0],{age:5.5});
 t.walk(0,'초록불이 켜진 오븐으로 가요.',74,229).until(0,'초록불이 켜지면 꺼내요.',()=>g.ovens[0].status==='ready',{},1).act(0,'꺼내면 종류에 맞는 작업대가 열려요.',()=>g.act(),'꺼내기');
 for(let k=0;k<3;k++)t.until(0,'도장이 초록 원에 겹칠 때 버튼을 눌러요.',()=>Math.abs(g.finishing.cursor-stampTarget(g.finishing))<.05,{},4).act(0,'쿠키에 무늬를 하나씩 찍어요.',()=>g.decorate('stamp'),'도장 찍기').hold(0,'세 쿠키를 찍으면 포장돼요.',.45);
 t.hold(0,'장식을 끝내야 단서 한 장을 받아요.',.65);
 t.cut(1,'머핀은 버튼을 누르고 있다가 놓아요.',()=>{g.finishing=null;g.motion=null;g.actionWait=0;at(g,195,229);Object.assign(g.ovens[1],{status:'ready',age:0});});
 t.act(1,'완성된 머핀을 꺼내요.',()=>g.act(),'꺼내기');
 for(let k=0;k<3;k++)t.act(1,'누르고 있으면 크림이 올라와요.',()=>g.decorate('press'),'크림 누르기').hold(1,'초록 높이까지 크림을 짜요.',1.85,'크림 누르기').act(1,'초록 높이에서 손을 떼요.',()=>g.decorate('release'),'크림 놓기').hold(1,'다음 머핀도 같은 방법으로 꾸며요.',.45);
 t.hold(1,'세 머핀의 크림을 맞추면 완료!',.6);
 t.cut(2,'타르트는 위쪽 견본을 보고 꾸며요.',()=>{g.finishing=null;g.motion=null;g.actionWait=0;at(g,316,229);Object.assign(g.ovens[2],{status:'ready',age:0});});
 t.act(2,'바쁠 때는 오븐을 4초 멈출 수 있어요.',()=>g.flash(),'오븐 리모컨').act(2,'타르트를 꺼내 작업대를 열어요.',()=>g.act(),'꺼내기');
 for(let k=0;k<3;k++)t.hold(2,'왼쪽부터 견본과 같은 과일을 골라요.',.7).act(2,'과일 버튼을 눌러 타르트에 올려요.',()=>g.decorate('fruit',g.finishing.pattern[g.finishing.step]),'과일 선택');
 t.hold(2,'오븐 보기로 나갔다가 장식을 이어 할 수도 있어요.',1.1);return t;
}

function detective(){
 const g=new DetectiveGame(),t=new PlayTutorial(g,['발견 · 추격 · 숨기','조사하다 멈추고 숨기','태엽쥐로 조사할 틈 만들기']);
 t.cut(0,'시야에 걸리면 경비원이 추격해요.',()=>{g.enterRoom(0);at(g,105,315);g.immunity=0;const h=g.room.guards[0];Object.assign(h,{x:220,y:315,angle:Math.PI,waitLeft:1,path:[],route:[{x:220,y:315},{x:220,y:420}],next:1});});
 t.hold(0,'느낌표가 뜨면 가구를 돌아 시선을 끊으세요.',.6).walk(0,'책상 왼쪽으로 돌아가요.',44,315).walk(0,'가구가 경비원의 시야를 가리는 곳으로 이동해요.',44,268).act(0,'시선이 끊긴 뒤 숨기를 눌러요.',()=>g.hide(),'숨기').until(0,'숨어 있으면 경비원이 마지막 위치를 수색해요.',()=>!g.pursued,{},7,'숨기').hold(0,'보고 있을 때는 숨을 수 없어요. 먼저 가구를 돌아요.',.7);
 t.cut(1,'종이 표식 앞에서 조사 버튼을 누르고 있어요.',()=>{g.enterRoom(0);at(g,105,315);});
 t.act(1,'게이지가 차면 증거를 확보해요.',()=>g.beginAction(),'조사').until(1,'조사 버튼을 계속 누르세요.',()=>g.room.evidence[0].collected,{},2.6,'조사').hold(1,'이제 소리가 나는 서랍을 살펴볼게요.',.5);
 t.cut(1,'서랍 소리를 듣고 경비원이 확인하러 와요.',()=>{at(g,279,354);Object.assign(g.room.guards[0],{x:195,y:200,angle:Math.PI/2,mode:'patrol',path:[],waitLeft:1});});
 t.act(1,'조사를 시작하면 소리가 나요.',()=>g.beginAction(),'조사').hold(1,'경비원이 오기 전에 조사를 멈추세요.',1.45,'조사').act(1,'숨기를 누르면 조사를 멈추고 숨어요.',()=>g.hide(),'숨기').until(1,'진행 게이지는 남아요. 경비원이 지나가길 기다려요.',()=>g.room.guards.every(h=>h.mode==='patrol'&&Math.hypot(h.x-g.player.x,h.y-g.player.y)>100&&!canSee(h,g.player,g.room.covers)),{},10,'숨기').act(1,'나온 뒤 조사를 이어 갈 수 있어요.',()=>g.hide(),'나오기').act(1,'남은 만큼만 조사해요.',()=>g.beginAction(),'조사').until(1,'조사를 마쳐 두 번째 증거를 확보해요.',()=>g.room.evidence[1].collected,{},3.8,'조사').walk(1,'조사를 끝냈으면 바로 물러나요.',342,354).walk(1,'가구 옆으로 돌아 시선을 끊어요.',342,310).act(1,'확보한 증거를 지키며 다시 숨어요.',()=>g.hide(),'숨기').hold(1,'멈췄던 조사도 이어서 끝낼 수 있어요.',.5);
 t.cut(2,'조사 전에 태엽쥐로 경비원을 다른 곳에 유인해요.',()=>{g.enterRoom(1);at(g,282,263);g.player.dir='up';g.flashes=3;});
 t.act(2,'먼저 가구 가까이에서 숨어요.',()=>g.hide(),'숨기').act(2,'위쪽을 바라보고 태엽쥐를 던져요.',()=>g.flash(),'태엽쥐').hold(2,'물음표를 따라 경비원이 위쪽으로 이동해요.',2.5).act(2,'경비원이 지나갔으면 나와요.',()=>g.hide(),'나오기').act(2,'소리에 유인된 동안 서랍을 조사해요.',()=>g.beginAction(),'조사').until(2,'태엽쥐 덕분에 조사할 틈이 생겼어요.',()=>g.room.evidence[1].collected,{},4,'조사').hold(2,'추격 중에는 시선을 끊어야 태엽쥐에 속아요.',.8);
 t.cut(3,'이 방의 증거 세 개를 모아야 다음 방으로 가요.',()=>{g.enterRoom(0);at(g,72,168);})
 .act(3,'남은 벽의 흔적도 조사해요.',()=>g.beginAction(),'조사').until(3,'세 번째 증거까지 확보해요.',()=>g.roomCollected===3,{},3,'조사')
 .cut(3,'증거가 세 개 모였으면 문 앞으로 이동해요.',()=>at(g,310,145)).until(3,'오른쪽 위 문에 닿으면 다음 방으로 이동해요.',()=>g.roomIndex===1,{x:1},3,'→').hold(3,'다음 방 버튼은 누르지 않아도 돼요.',.5);return t;
}

function monastery(){
 const g=new MonasteryGame(),t=new PlayTutorial(g,['연등 운반 · 균형','바람 · 장애물 피하기']);
 at(g,140,440);g.windAges[0]=3.5;
 t.until(0,'받침대에 가까이 가면 연등을 자동으로 들어요.',()=>!!g.held,{x:1},1,'→')
 .until(0,'잔잔할 때는 방향키로 앞으로 걸어요.',()=>g.player.x>596,{x:1},5,'→')
 .act(0,'걸이 앞에서는 균형을 누르고 멈춰요.',()=>g.beginBalance(),'균형')
 .until(0,'걸이 가까이까지 천천히 다가가요.',()=>g.player.x>631,{x:1},1.5,'→')
 .until(0,'방향키를 놓고 기다리면 연등이 걸려요.',()=>g.banked.size===1,{},2,'균형')
 .act(0,'한 개를 걸어 단서 한 장을 받았어요.',()=>g.releaseBalance(),'균형').hold(0,'다음 받침대에서도 같은 순서로 불을 밝혀요.',.7);
 t.cut(1,'연못의 흔들리는 목교를 지나가 볼게요.',()=>{for(let id=1;id<=4;id++)awardClue(g,id);g.held=LANTERN_ROUTE[4];at(g,3010,440);g.windAges[4]=.9;g.angle=.35;g.angularVelocity=.2;g.messageLeft=0;})
 .hold(1,'천이 펄럭이면 곧 바람이 불어요.',.4)
 .act(1,'바람이 불면 균형 버튼을 계속 누르세요.',()=>g.beginBalance(),'균형')
 .input(1,'안정되지만 걸음이 느려져요.',1,{x:1},'→')
 .act(1,'바람막이를 쓰면 연등이 바로 안정돼요.',()=>{g.releaseBalance();g.flash();},'바람막이')
 .input(1,'5초 동안 바람을 막아 빠르게 건널 수 있어요.',1.25,{x:1},'→')
 .hold(1,'바람막이 · 2회 사용 가능',.5);
 t.cut(1,'물보라가 예고되면 위아래로 길을 바꿔요.',()=>{g.held=LANTERN_ROUTE[4];at(g,3040,430);g.lane=g.laneTarget=0;g.angle=g.angularVelocity=0;g.windAges[4]=4;g.splashAges[1]=.3;g.releaseBalance();})
 .input(1,'아래쪽을 눌러 바깥 길로 피해요.',.55,{y:1},'↓')
 .input(1,'물이 튀는 안쪽 길을 비켜 걸어요.',1.1,{x:1},'→');
 t.cut(2,'풍경은 초록 화살표가 켜지면 통과해요.',()=>{for(let id=1;id<=6;id++)awardClue(g,id);g.held=LANTERN_ROUTE[6];at(g,TEMPLE_BELLS[0].x-140,452);g.lane=g.laneTarget=1;g.angle=g.angularVelocity=0;g.releaseBalance();let time=0;while(time<8&&!bellPassage(TEMPLE_BELLS[0],time,g.player).safe)time+=.04;g.elapsed=time;g.messageLeft=0;})
 .hold(2,'풍경이 올라가고 초록 신호가 켜졌어요.',.55)
 .input(2,'균형을 놓고 오른쪽으로 통과해요.',1.9,{x:1},'→');
 return t;
}
function photoFollow(g){const s=g.target,q=g.pose(s),base=q.x+s.view,ray=s.room===2?photoGlareAt(s,g.cameraTime,g.player.y):0,offset=s.room===2&&Math.abs(ray-base)<22?(ray>=base?-12:12):0,dx=base+offset-g.player.x,dy=q.y+s.distance-g.player.y,len=Math.max(1,Math.hypot(dx,dy));return Math.abs(dx)>4||Math.abs(dy)>4?{x:dx/len,y:dy/len}:{};}
function photo(){
 const g=new PhotoGame(),t=new PlayTutorial(g,['선택 · 이동 · 촬영','동물을 따라 촬영하기','반사빛 · 자동 촬영']);
 t.act(0,'촬영할 피사체를 누르면 견본이 바뀌어요.',()=>g.selectSubject(1),'피사체 선택')
 .walk(0,'방향키로 대상 앞에 다가가요.',100,430).walk(0,'조준 표시를 기차에 맞춰요.',118,317)
 .act(0,'촬영을 누르고 움직이며 초점을 맞춰요.',()=>g.beginAction(),'촬영')
 .until(0,'대상을 조준 표시 안에 두고 따라가요.',()=>g.quality().good,()=>photoFollow(g),13,'촬영')
 .act(0,'초록색이 되면 손을 떼어 찍어요.',()=>g.releaseAction(),'촬영').hold(0,'기차 사진을 완성하고 단서를 받았어요.',.5);
 t.walk(1,'양옆 출입구로 다른 촬영실에 갈 수 있어요.',70,430).walk(1,'오른쪽 출입구로 걸어가요.',340,458)
 .until(1,'문에 닿으면 동물 촬영실로 이동해요.',()=>g.room===1,{x:1},1,'→').act(1,'달리는 강아지를 선택해요.',()=>g.selectSubject(5),'피사체 선택')
 .walk(1,'강아지 앞 촬영 위치에 다가가요.',285,338).act(1,'동물도 촬영을 누른 채 따라가요.',()=>g.beginAction(),'촬영')
 .until(1,'초점을 유지하며 강아지를 따라 움직여요.',()=>g.quality().good,()=>photoFollow(g),13,'촬영')
 .act(1,'초록 표시에서 손을 떼면 촬영돼요.',()=>g.releaseAction(),'촬영').hold(1,'고양이는 걷고 토끼는 뛰어요. 이동을 따라가세요.',.5);
 t.cut(2,'햇빛 촬영실에서는 반사빛을 살펴요.',()=>{g.goRoom(2);g.selectSubject(7);at(g,100,317);})
 .act(2,'노란 반사빛이 들어오면 초점이 흐려져요.',()=>g.beginAction(),'촬영')
 .until(2,'반사빛이 들어오는 순간을 확인해요.',()=>g.quality().glare,()=>{const target=g.target,q=g.pose(target),dx=photoGlareAt(target,g.cameraTime,q.y+target.distance)-g.player.x,dy=q.y+target.distance-g.player.y,n=Math.max(1,Math.hypot(dx,dy));return {x:dx/n,y:dy/n};},10,'방향키')
 .hold(2,'빛이 꺼지거나 빛이 비치는 위치를 피해 찍어요.',.5)
 .act(2,'어려울 때 자동 촬영 아이템을 써요.',()=>g.flash(),'자동 촬영')
 .until(2,'피사체를 따라가 초점을 맞추고 한 장을 찍어요.',()=>g.clueSources.has(7)&&!g.autoShot,{},15)
 .hold(2,'자동 촬영 · 1회 사용 가능',.6);return t;
}
function garden(characterId='haru'){
 const g=new GardenGame({characterId}),t=new PlayTutorial(g,['히터로 온도 맞추기','꽃가루 세 번 옮기기','벌레 쪽으로 분무하기','정원사 호출벨']);
 t.walk(0,'가운데 화분에 다가가 심기를 눌러요.',195,310).act(0,'목표보다 온도가 낮아 히터가 필요해요.',()=>g.act(),'심기')
 .walk(0,'히터 앞으로 이동해요.',80,365).act(0,'켜기를 눌러 온도를 올려요.',()=>g.act(),'켜기')
 .until(0,'가운데 화분의 초록 온도에 가까워질 때까지 데워요.',()=>g.climate.temperature>=25.2,{},8)
 .act(0,'잔열로 더 오르므로 히터를 먼저 꺼요.',()=>g.act(),'끄기')
 .walk(0,'히터를 끄고 가운데 화분으로 돌아가요.',195,310)
 .until(0,'목표 온도에 들어온 것을 확인해요.',()=>g.inBand(g.beds[1]),{},4)
 .act(0,'덮기를 눌러 맞춘 온도를 지켜요.',()=>g.act(),'덮기')
 .until(0,'온도가 안정되면 꽃이 자라고 단서를 받아요.',()=>g.beds[1].bloom,{},8).walk(0,'온도가 높을 때는 환기 레버로 식혀요.',310,365).act(0,'열기를 누르면 양쪽 창이 열려요.',()=>g.act(),'열기').hold(0,'창을 열면 온실이 빠르게 식어요.',.9).act(0,'다시 눌러 창을 닫을 수 있어요.',()=>g.act(),'닫기').hold(0,'화분마다 목표 온도를 확인하세요.',.35);
 t.act(1,'공간 버튼으로 나무 정원에 가요.',()=>g.goRoom(1),'공간 2');
 for(let i=1;i<=3;i++)t.walk(1,'윗줄에서 금빛 꽃가루를 받아요.',DONORS[0].x,DONORS[0].y).act(1,'받기를 눌러 붓에 꽃가루를 묻혀요.',()=>g.act(),'받기')
 .walk(1,'같은 금빛 표시의 꽃 앞으로 가져가요.',195,382).act(1,'옮기기를 누르면 바로 전달돼요 · '+i+' / 3',()=>g.act(),'옮기기').hold(1,i===3?'새 꽃가루를 세 번 받아 옮기면 완료예요.':'꽃가루를 다시 받으러 가요.',.2);
 t.act(2,'공간 버튼으로 열대식물실에 가요.',()=>g.goRoom(2),'공간 3');
 for(const [index,x]of [[4,293],[5,323]])t.walk(2,'분무기 노즐을 벌레 쪽으로 맞춰요.',x,382).input(2,'위쪽을 눌러 벌레를 바라봐요.',.04,{y:-1},'↑')
 .until(2,'잎에 앉은 벌레마다 분무를 두 번 눌러요.',()=>g.bugs[index].hp===0,()=>{if(g.canAct&&gardenBugPose(g,g.bugs[index]).land)g.beginAction();return {};},12,'분무');
 t.hold(2,'두 벌레를 쫓으면 이 식물의 단서를 받아요.',.5);
 t.act(3,'정원사에게 맡길 식물이 있는 공간을 골라요.',()=>g.goRoom(1),'공간 2').walk(3,'아직 작업하지 않은 왼쪽 식물 앞으로 가요.',72,382)
 .act(3,'호출벨을 누르면 가까운 식물 한 곳을 맡아요.',()=>g.flash(),'정원사 호출벨')
 .until(3,'정원사가 남은 작업을 마치면 단서 한 장을 받아요.',()=>g.clueSources.has(4),{},4)
 .hold(3,'정원사 호출벨 · 1회 사용 가능',.7);return t;
}

function datacenter(){
 const g=new DataCenterGame({random:()=>.1,tutorial:true}),t=new PlayTutorial(g,['레버로 연결 · 전송','두 목적지와 재전송','바이러스 제거']);g.levers[0].state=1;
 t.act(0,'전송을 누르면 청록 데이터가 출발해요.',()=>g.send(),'전송')
 .walk(0,'방향키로 데이터보다 먼저 가운데 레버에 가요.',195,352)
 .act(0,'레버를 눌러 밝은 화살표를 왼쪽으로 바꿔요.',()=>g.beginAction(),'레버').hold(0,'청록 서버까지 이어진 길을 따라 흘러가요.',.5)
 .until(0,'같은 색 서버에 도착해야 성공이에요.',()=>g.clueSources.has(0),{},9)
 .hold(0,'다음 자료가 자동으로 준비돼요.',.8);
 t.cut(1,'두 목적지가 있는 자료는 시간차로 두 개가 출발해요.',()=>{g.selected=3;g.elapsed=34;g.levers.forEach(l=>l.state=0);g.messageLeft=0;at(g,195,445);})
 .act(1,'첫째 청록, 둘째 보라 순서로 출발해요.',()=>g.send(),'전송')
 .walk(1,'첫 데이터가 왼쪽 길로 들어간 뒤 분기를 바꿔요.',195,352)
 .until(1,'첫 데이터가 분기점을 지날 때까지 기다려요.',()=>g.packets.some(p=>p.file===3&&p.piece===0&&p.from!=='source'),{},3)
 .act(1,'뒤따르는 보라 데이터를 오른쪽 길로 보내요.',()=>g.beginAction(),'레버').hold(1,'이미 지나간 데이터의 길은 바뀌지 않아요.',.5)
 .walk(1,'오른쪽 레버를 보라 서버 쪽으로 바꿔요.',305,288).act(1,'두 번째 데이터가 닿기 전에 레버를 눌러요.',()=>g.beginAction(),'레버').hold(1,'목적지와 같은 색 서버로 보내요.',.5)
 .until(1,'두 서버에 모두 도착하면 다음 자료가 준비돼요.',()=>g.clueSources.has(3),{},9).hold(1,'실패하면 아래 단말기에서 빠진 것만 다시 보내요.',.6);
 t.cut(2,'주황 점선은 바이러스가 들어올 회로예요.',()=>{g.selected=2;g.levers[0].state=1;g.levers[2].state=1;g.elapsed=8.8;g.messageLeft=0;at(g,195,445);})
 .act(2,'바이러스 제거를 누르면 현재 길의 바이러스가 사라져요.',()=>g.flash(),'바이러스 제거').act(2,'바이러스를 없앤 길로 데이터를 보내요.',()=>g.send(),'전송')
 .hold(2,'바이러스 제거 · 2회 사용 가능',4).hold(2,'체크 표시가 있는 길에는 바이러스가 다시 나오지 않아요.',1.3);return t;
}

function conservation(){
 const g=new ConservationGame({tutorial:true}),t=new PlayTutorial(g,['붓질 · 책벌레','종이 회전 · 고정 · 붙이기','양쪽 압착판','보호 받침']);
 t.walk(0,'방향키로 붓끝을 먼지에 가져가요.',96,227).act(0,'작업을 누르고 방향키로 쓸어요.',()=>g.beginAction(),'붓질')
 .walk(0,'움직이는 붓끝이 닿은 먼지만 지워져요.',294,227).act(0,'책벌레가 보이면 손을 떼어 붓을 들어요.',()=>g.releaseAction(),'붓질').hold(0,'붓을 든 채 지나가기를 기다려요.',1.6).hold(0,'다시 누르고 남은 먼지를 쓸면 돼요.',.5);
 t.cut(1,'먼지 책 세 권 다음에는 찢어진 종이를 붙여요.',()=>{g.selected=3;g.resetTool();g.elapsed=30;})
 .act(1,'회전 버튼으로 보존지 방향을 맞춰요.',()=>{while(g.book.rotation)g.rotate();},'회전')
 .walk(1,'방향키로 종이를 찢어진 테두리에 맞춰요.',246,270).act(1,'초록 테두리에서 작업을 눌러 고정해요.',()=>g.beginAction(),'고정')
 .until(1,'한쪽이 고정되면 주걱으로 가장자리를 붙여요.',()=>g.book.pinned,{},2);
 for(const point of patchSeams(g.books[3]))t.walk(1,'반짝이는 가장자리를 따라 주걱을 움직여요.',point.x,point.y).hold(1,'주걱이 닿은 곳부터 붙어요.',.14);
 t.until(1,'가장자리를 모두 붙이면 복원돼요.',()=>g.books[3].done,{},2).hold(1,'완료하면 다음 책이 바로 펼쳐져요.',.5);
 t.cut(2,'들뜬 책장은 양쪽의 압착판을 사용해요.',()=>{g.selected=6;g.resetTool();g.elapsed=55;})
 .walk(2,'왼쪽 압착판으로 이동해요.',96,282).act(2,'작업을 누르면 왼쪽 힘이 올라가요.',()=>g.beginAction(),'압착').until(2,'금빛 표시를 초록 구간까지 올려요.',()=>g.book.pressure[0]>=.64,{},3)
 .act(2,'손을 떼면 천천히 힘이 줄어들어요.',()=>g.releaseAction(),'압착').walk(2,'오른쪽 압착판도 눌러 균형을 맞춰요.',294,282)
 .act(2,'양쪽 표시가 초록에 함께 머물러야 해요.',()=>g.beginAction(),'압착').until(2,'오른쪽 표시도 초록 안에 맞춰요.',()=>g.book.pressure[1]>=.56,{},3).act(2,'초록 구간에서는 손을 떼어 유지해요.',()=>g.releaseAction(),'압착')
 .until(2,'양쪽 힘이 안정되면 책장이 펴져요.',()=>g.books[6].done,{},4).hold(2,'너무 세게 누르지 않도록 표시를 봐요.',.5);
 t.cut(3,'작업 중인 책에 보호 받침을 써요.',()=>{g.selected=1;g.resetTool();g.elapsed=3;})
 .act(3,'보호 받침은 이 책의 실수 한 번을 막아요.',()=>g.flash(),'보호 받침').hold(3,'보호 받침은 첫 실수를 막으면 사라져요. 2회 사용 가능.',2);return t;
}
function cityhall(){
 const g=new CityHallGame({plan:CITY_DEMO_PLAN}),t=new PlayTutorial(g,['비서의 보고와 정책 선택','전문가 조언과 결재']);
 t.hold(0,'시장 자리에 앉으면 비서가 첫 보고를 들고 찾아와요.',g.arrivalSeconds+.5)
 .hold(0,'시장님, 당선을 축하드립니다.',1)
 .act(0,'다음을 눌러 설명을 읽어요.',()=>g.act(),'다음').hold(0,'52%에 첫 단서, 64%부터는 4%p마다 한 장을 더 받아요.',2)
 .act(0,'보고를 눌러 첫 안건을 받아요.',()=>g.act(),'보고').hold(0,'큰비까지 일주일, 배수로 정비는 사흘 걸려요.',1)
 .act(0,'방향키로 배수로 정비를 골라요.',()=>g.selectByOffset(1),'방향키').hold(0,'선택한 정책의 테두리가 바뀌어요.',.7);
 t.act(1,'정책 전문가 조언 · 1회 사용 가능',()=>g.flash(),'전문가 조언')
 .hold(1,'언제 비가 오고 시설이 완성되는지 비교해요.',2)
 .act(1,'결재로 지지율 변화를 확인해요.',()=>g.act(),'결재').hold(1,'배수로를 미리 정비해 지지율이 8%p 올랐어요.',1.65)
 .act(1,'다음 안건으로 이동해요.',()=>g.act(),'다음').hold(1,'여섯 번째 결재 뒤 단서를 받습니다.',.7);
 return t;
}
function gym(){
 const g=new GymGame({tutorial:true,random:()=>.8}),t=new PlayTutorial(g,['방향키 · 공 피하기','타임아웃 휘슬']);
 g.cards.forEach(c=>c.at=999);Object.assign(g.cards[0],{x:195,y:305,at:0});
 t.walk(0,'방향키로 열쇠 카드에 닿아 단서를 모아요.',195,305).hold(0,'단서 한 장을 모았어요.',.55)
 .act(0,'팔을 뒤로 젖히면 점선 방향을 살펴요.',()=>g.beginThrow(2,{x:195,y:305}),'')
 .hold(0,'공이 나가기 전에 아래쪽으로 피해요.',.72)
 .walk(0,'공이 날아오는 길에서 벗어나요.',195,382)
 .hold(0,'맞으면 체력이 한 칸 줄어요.',1.2);
 t.cut(1,'위험할 때 휘슬을 눌러요.',()=>{g.balls=[];g.throwers.forEach(n=>Object.assign(n,{phase:'ready',age:0}));at(g,195,360);g.beginThrow(0,{x:195,y:360});Object.assign(g.cards[1],{x:277,y:328,at:0});})
 .hold(1,'공이 날아오는 것을 확인해요.',1.5)
 .act(1,'휘슬은 공과 상대만 3초 멈춰요.',()=>g.flash(),'휘슬')
 .walk(1,'제한시간은 계속 흘러요. 움직여 단서를 주워요.',277,328)
 .hold(1,'타임아웃 휘슬 · 2회 사용 가능',1.4);
 return t;
}

function cinema(){
 const g=new CinemaGame({plan:['matrix','titanic','jurassic','backfuture','indiana','jaws','leon','forrest','gravity'],random:()=>.4}),t=new PlayTutorial(g,['영화 보기 · 제목 선택','영화 정보 · 2회 사용 가능']);
 t.until(0,'영화가 시작되면 장면을 살펴요.',()=>g.choicesVisible,{},30)
 .act(0,'방향키로 제목을 골라요.',()=>{g.selectByOffset(1);for(let tries=0;tries<4&&g.options[g.selected]!==g.film.id;tries++)g.selectByOffset(1);},'방향키')
 .hold(0,'선택한 제목을 결정해요.',.7).act(0,'맞히면 단서 한 장을 얻어요.',()=>g.act(),'결정').hold(0,'정답이면 다음 영화가 시작돼요.',1);
 t.until(1,'다음 영화도 3초 뒤에 보기가 나와요.',()=>g.choicesVisible,{},30).act(1,'영화 정보 · 2회 사용 가능',()=>g.flash(),'영화 정보').hold(1,'이야기 힌트로 제목을 찾아요.',2)
 .act(1,'힌트와 맞는 영화를 골라요.',()=>{g.selectByOffset(1);for(let tries=0;tries<4&&g.options[g.selected]!==g.film.id;tries++)g.selectByOffset(1);},'방향키')
 .act(1,'결정하면 다음 영화로 넘어가요.',()=>g.act(),'결정').hold(1,'남은 힌트는 다른 영화에 쓸 수 있어요.',1)
 .until(1,'다른 영화에서도 정보를 확인해요.',()=>g.choicesVisible,{},30).act(1,'두 번째 힌트를 사용해요.',()=>g.flash(),'영화 정보').hold(1,'아홉 영화에서 단서를 모아요.',1.3);return t;
}
function memory(){
 const g=new MemoryGame({runPlan:MEMORY_DEMO_PLAN,random:()=>.4});
 const t=new PlayTutorial(g,['그림 기억하기','그림 누르기 · 방향키와 찾기','오답과 정답 공개','도움 아이템 두 가지']);
 const resetSample=(search=false)=>{
  for(const rewards of [g.banked,g.found,g.clueSources])rewards.clear();
  g.flashes=MEMORY.flashes;g.revisits=MEMORY.revisits;
  g.startRound(0);
  if(search)g.update(MEMORY.observeSeconds+MEMORY.changeDelay);
 };
 const flipToSearch=page=>t.act(page,'3초를 센 뒤 바뀐 그림이 나와요.',()=>{g.phaseLeft=.3;},'')
  .until(page,'3초를 센 뒤 바뀐 그림이 나와요.',()=>g.phase==='search',{},4);
 const showTap=(page,caption,position)=>{
  t.act(page,caption,()=>{g.demoTap=position();},'그림 누르기').hold(page,caption,.62)
   .act(page,caption,()=>{
    const [x,y]=g.demoTap;
    g.pressPicture(MEMORY_BOARD.x+x*MEMORY_BOARD.w/MEMORY_SIZE.width,MEMORY_BOARD.y+y*MEMORY_BOARD.h/MEMORY_SIZE.height);
    g.demoTap=null;
   },'그림 누르기');
 };
 const toSecond=()=>{
  const [x,y]=g.targets[1].mark,dx=x-g.cursor.x,dy=y-g.cursor.y;
  return {dx,dy,distance:Math.hypot(dx,dy)};
 };
 t.still(0,'먼저 원본 그림을 20초 동안 기억해요.',1.55);
 flipToSearch(0).hold(0,'바뀐 그림에서 20초 동안 달라진 세 곳을 찾아요.',1.6);

 t.cut(1,'그림 하나에 찾기 기회가 네 번 있어요.',()=>resetSample(true))
 .still(1,'그림 하나에 찾기 기회가 네 번 있어요.',1.25);
 showTap(1,'달라진 곳을 화면에서 직접 눌러요.',()=>g.targets[0].mark);
 t.hold(1,'정답에는 동그라미가 남고 단서 한 장을 받아요.',1.25)
 .until(1,'방향키를 쓰면 그림 위 조준 표시를 움직일 수 있어요.',()=>toSecond().distance<3,()=>{
  const {dx,dy,distance}=toSecond(),scale=Math.max(distance,14);
  return {x:dx/scale,y:dy/scale};
 },2.8,'방향키')
 .act(1,'달라진 곳에 표시를 놓고 찾기를 눌러요.',()=>g.act(),'찾기')
 .hold(1,'달라진 곳에 표시를 놓고 찾기를 눌러요.',1.05);
 showTap(1,'세 곳을 모두 맞히면 남은 기회가 있어도 다음 그림으로 넘어가요.',()=>g.targets[2].mark);
 t.hold(1,'세 곳을 모두 맞히면 남은 기회가 있어도 다음 그림으로 넘어가요.',1.6);

 t.cut(2,'맞힌 자리와 틀린 자리에 각각 표시가 남아요.',()=>resetSample(true));
 showTap(2,'변하지 않은 곳을 누르면 X가 남고 기회가 한 번 줄어요.',()=>[40,36]);
 t.hold(2,'X는 이 그림이 끝날 때까지 남아요.',1.15);
 showTap(2,'달라진 곳을 누르면 동그라미가 남아요.',()=>g.targets[0].mark);
 t.hold(2,'시간이나 기회를 다 쓰면 정답을 공개해요.',1.1)
 .act(2,'시간이나 기회를 다 쓰면 정답을 공개해요.',()=>{g.phaseLeft=.4;},'')
 .until(2,'놓친 곳의 동그라미가 세 번 깜빡여요.',()=>g.revealing&&g.phaseLeft<=MEMORY.revealCycle-MEMORY.revealOn,{},3.1);

 t.cut(3,'원본 더보기와 범위 힌트 · 각 1회 사용 가능',()=>resetSample())
 .still(3,'원본 더보기와 범위 힌트 · 각 1회 사용 가능',1.4)
 .act(3,'원본을 외우는 중에 원본 10초 더보기를 눌러요.',()=>g.revisitOriginal(),'원본 10초')
 .still(3,'같은 원본을 보면서 남은 관찰 시간이 10초 늘어나요.',1.7);
 flipToSearch(3)
 .hold(3,'찾는 화면에서는 원본 연장 버튼이 잠겨요.',.85)
 .act(3,'찾는 동안 범위 힌트를 눌러요.',()=>g.flash(),'범위 힌트')
 .hold(3,'점선 상자가 한 곳의 주변을 보여 줘요. 찾기 기회는 그대로예요.',1.55);
 showTap(3,'점선 안에서 달라진 물건을 직접 찾아요.',()=>g.targets.find(spot=>spot.id===g.hint?.spot)?.mark??g.targets[1].mark);
 t.hold(3,'점선에서 바뀐 곳을 찾아 누르면 단서를 얻어요.',1.2);
 return t;
}
function pursuit(){
 const runPlan=['paris','seoul','london','rome','tokyo','sydney','newyork','bangkok','berlin'];
 const g=new PursuitGame({runPlan,random:()=>.41}),t=new PlayTutorial(g,['단서와 후보 도시','틀린 도시에서 다시 추적','추가 단서']);
 function selectCity(id){
  if(!g.select(g.choices.findIndex(city=>city.id===id)))throw Error('시범에 필요한 도시를 찾을 수 없어요.');
 }
 t.still(0,'그림 세 장을 보고 범인이 간 도시를 짐작해요.',1.35)
  .act(0,'그림을 누르면 크게 보여요.',()=>g.toggleClue(1),'')
  .still(0,'그림을 누르면 크게 보여요.',1.5)
  .act(0,'다시 누르면 지도로 돌아와요.',()=>g.closeClue(),'')
  .act(0,'방향키를 눌러 지도에서 핀을 고르세요.',()=>g.moveSelection(-1,0),'←')
  .still(0,'지도에서 도시를 골라요.',1.25);
 t.still(1,'지도에서 도시를 골라요.',.85)
  .act(1,'먼저 다른 후보 핀을 골라요.',()=>selectCity(g.choices.find(city=>city.id!=='paris').id),'')
  .still(1,'비행을 누르세요.',.9)
  .act(1,'비행을 누르면 비행기가 떠나요.',()=>g.act(),g.actionLabel)
  .until(1,'선택한 도시로 비행기가 떠나요.',()=>g.phase==='arrival',{},5)
  .until(1,'틀린 도시만 빠지고 같은 그림이 남아요.',()=>g.phase==='choosing'&&g.choices.length===6,{},5)
  .still(1,'한 번 틀렸어요. 남은 비행 횟수를 보며 같은 그림으로 다시 추적해요.',1.4)
  .act(1,'그림에 맞는 도시의 핀을 다시 골라요.',()=>selectCity('paris'),'')
  .still(1,'비행을 누르세요.',.9)
  .act(1,'그림에 맞는 도시를 골라 다시 비행을 눌러요.',()=>g.act(),g.actionLabel)
  .until(1,'비행기가 다시 떠나요.',()=>g.phase==='arrival',{},5)
  .still(1,'도시는 맞았어요. 범인은 이미 다른 도시로 달아났어요.',1.15)
  .until(1,'다음 도시의 그림 단서가 나와요.',()=>g.phase==='choosing',{},5);
 t.still(2,'어려운 도시에서는 추가 단서를 써요.',1.0)
  .act(2,'어려운 도시에서는 추가 단서를 써요.',()=>g.flash(),'추가 단서')
  .still(2,'원래 세 장에 네 번째 그림이 더해져요.',2);
 return t;
}
function postal(characterId){
 const runPlan=[
  {villageId:'willow',destinations:[12,26,36,47]},
  {villageId:'stonewall',destinations:[8,11,21,35,44]},
 ];
 const g=new PostalGame({runPlan,characterId});
 const t=new PlayTutorial(g,['마을지도','골목길 이동','우편함에 배달','두 번째 마을']);
 g.tutorialDemo=true;
 const house=g.village.houses.find(home=>home.id===26);
 const main=g.village.roads[0];
 const alley=g.village.roads.filter(road=>road.x1===road.x2&&road.y1===main.y1&&road.y2===house.stop.y)
  .sort((a,b)=>Math.abs(a.x1-house.stop.x)-Math.abs(b.x1-house.stop.x))[0];
 const departureTime=g.motion.duration+postalDepartureMountTime(g.bike.dir,characterId);
 t.until(0,'자전거에 타면 마을지도를 확인할 수 있어요.',()=>g.canMove,{},Math.max(2,departureTime+.2))
  .act(0,'마을지도를 펴요.',()=>g.showMap(),'마을지도')
  .hold(0,'빨간 핀을 보고 골목과 집의 순서를 기억해요.',2.5)
  .act(0,'마을지도를 닫아요.',()=>g.closeMap(),'마을지도');
 t.walk(1,'방향키를 눌러 골목 입구까지 달려요.',alley.x1,main.y1)
  .walk(1,'골목으로 내려가요.',alley.x1,house.stop.y)
  .walk(1,'집 앞 우편함에 가까이 가요.',house.stop.x,house.stop.y);
 t.act(2,'집 앞에서 배달을 눌러요.',()=>g.act(),'배달')
  .until(2,'우편함에 넣고 자전거에 다시 타요.',()=>g.canMove,{},4)
  .hold(2,'배달을 마치면 다음 집으로 이동해요.',1.1);
 t.cut(3,'첫 마을의 시간이 거의 다 됐어요.',()=>{
   g.elapsed+=g.remaining-1.2;
   g.villageTime=g.round.seconds-1.2;
  })
  .until(3,'첫 배달 시간이 끝나요.',()=>g.phase==='report',{},1.5)
  .act(3,'다음 마을에서 출발을 준비해요.',()=>{g.nextVillage();g.tutorialCountdownUntil=t.age+3;},'')
  .still(3,'3초를 세고 출발해요.',3)
  .until(3,'두 번째 마을에서 다섯 통을 배달해요.',()=>g.canMove,{},Math.max(2,departureTime+.2))
  .hold(3,'두 번째 마을에서도 배달지를 찾아가요.',.7);
 return t;
}
const factories={postal,pursuit,memory,cinema,gym,cityhall,datacenter,conservation,photo,garden,monastery,detective,aquarium,museum,history,exchange,temple,robot,space,writer,language,newspaper,dream,literature,zoo,dessert};
export function createTutorial(place,character='haru'){if(place==='ai')return observeTutorial(groupTutorial(new AITutorial(),place),place);const f=factories[place];if(!f)throw Error('No tutorial for '+place);return observeTutorial(groupTutorial(extendExamples(f(character),place),place),place);}
