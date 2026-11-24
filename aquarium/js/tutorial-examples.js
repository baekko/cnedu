// Longer, complete examples use the same production inputs as the real game.
// Staging affects only the isolated tutorial instance.
import {ALICE_GATE,WRITER_PLATFORMS} from './writer-core.js?v=155';

export function extendExamples(t,place){
 const g=t.game;
 const after=(step,build)=>{const from=t.seq.length;build();const ops=t.seq.splice(from),at=t.seq.findLastIndex(o=>o.s===step)+1;t.seq.splice(at,0,...ops);};
 if(place==='aquarium')after(1,()=>{
  t.act(1,'다른 높이에 있는 단서도 방향키로 찾아가요.',()=>{g.enemies=[];g.pickups.push({type:'card',id:2,x:370,y:570,phase:0});g.spawnEnemy('basic');Object.assign(g.enemies.at(-1),{x:340,y:330,baseY:330});});
  t.walk(1,'상어 아래로 지나가며 두 번째 단서를 모아요.',215,570).hold(1,'단서를 얻으면 위쪽 수집 숫자가 늘어요.',3);
 });
 if(place==='museum'){
  after(1,()=>{t.cut(1,'방향을 맞춰 다른 몬스터도 맞혀 봐요.',()=>{Object.assign(g.player,{x:65,y:532,floor:1,face:1,climbing:false,vy:0});Object.assign(g.monsters[1],{x:260,y:532,floor:1,dir:1,decision:99});});t.input(1,'새총을 누른 상태로 계속 발사해요.',1.6,()=>{g.shoot();return {};},'새총').hold(1,'몬스터가 사라지고 명화에 색이 돌아오는 것을 확인해요.',1.8);});
 }
 if(place==='museum')after(2,()=>{t.act(2,'다시 점프해서 발사 높이를 맞춰 봐요.',()=>{g.monsters.push({...g.monsters[2],id:8,alive:true,x:260,y:458,floor:1,flight:{x:50,y:458}});g.jump();},'점프').hold(2,'공중에서 새총을 눌러요.',.25).act(2,'새총알이 날아가는 높이를 확인해요.',()=>g.shoot(),'새총').input(2,'착지한 뒤에도 방향키로 움직일 수 있어요.',.5,{x:1},'→').hold(2,'점프와 새총 버튼을 이어서 누르는 조작이에요.',2.4);});
 if(place==='history')after(3,()=>t.until(3,'문이 닫히면 다음 시대로 시간 여행해요.',()=>g.phase==='docked',{},9).act(3,'다음 시대에서도 하차 버튼으로 내려요.',()=>g.interact(),'하차').until(3,'완전히 내리면 새 20초가 시작돼요.',()=>g.phase==='explore',{},3).hold(3,'시대마다 바닥 단서 두 장과 숨은 단서 한 장을 찾아요.',1.5));
 if(place==='exchange')for(const op of t.seq){if(op.s===0&&op.sec===.8)op.sec=2.2;if(op.s===3&&op.sec===4)op.sec=6.5;}
 if(place==='exchange')after(0,()=>t.act(0,'이전 버튼으로 앞의 안내를 다시 볼 수 있어요.',()=>g.previous(),'이전').hold(0,'이전 안내가 다시 나타나요.',1.2).act(0,'다음 버튼으로 이어서 읽어요.',()=>g.next(),'다음').hold(0,'준비되면 투자 시작하기를 눌러요.',1.2));
 if(place==='temple'){
  after(2,()=>t.input(2,'체력이 남으면 배로 돌아와 계속 조종할 수 있어요.',2,{y:-1},'↑').input(2,'방향키로 머리가 덮칠 자리를 피해요.',.6,{x:1},'→'));
 }
 if(place==='robot')after(3,()=>{
  t.walk(3,'작업대 옆 통로를 따라 앞으로 이동해요.',140,267).walk(3,'작업대를 돌아서 다른 로봇에게 가요.',140,376).walk(3,'다른 작업대에 있는 로봇도 살펴봐요.',195,376).act(3,'필요한 부품은 로봇마다 달라요.',()=>g.flash(),'자석').hold(3,'이번에는 배터리가 필요해요.',.9).act(3,'가까이에서 작업을 눌러 배터리를 장착해요.',()=>g.work(),'작업').hold(3,'로봇을 완성할 때마다 단서를 받아요.',2.4);
 });
 if(place==='space'){
  after(1,()=>t.input(1,'방향키를 누르면 추진하며 움직여요.',1,{x:1},'→').hold(1,'손을 떼어도 잠깐 미끄러져요.',.65).act(1,'제동을 눌러 원하는 자리에서 멈춰요.',()=>g.brake(),'제동').hold(1,'멈춘 뒤 미니맵에서 다음 단서를 찾아요.',1.8));
  after(3,()=>t.input(3,'방향키로 다음 단서를 찾아 출발해요.',1,{x:1},'→'));
 }
 if(place==='writer'){
  after(1,()=>t.walk(1,'작은 문을 완전히 지나가요.',ALICE_GATE.x+ALICE_GATE.w+32,null,'→').act(1,'문 밖에서 다시 변신하면 커질 수 있어요.',()=>g.act(),'변신').hold(1,'동화마다 행동 버튼의 기능이 달라져요.',1.8));
  after(2,()=>t.input(2,'높이를 맞춘 뒤 앞으로 날아 단서를 주워요.',2.2,{x:1},'→'));
  const island=WRITER_PLATFORMS.find(p=>p.id==='island');
  after(3,()=>t.walk(3,'코 다리가 펼쳐졌을 때 가운데 발판으로 건너요.',island.x+15,null,'→').hold(3,'다리가 줄기 전 안전한 발판에 도착해요.',.6));
 }
 if(place==='newspaper')for(const op of t.seq)if(op.s===2&&op.sec===2)op.sec=3.3;
 if(place==='literature')after(1,()=>t.hold(1,'단서 수집 숫자가 늘었는지 확인해요.',2).hold(1,'가까이에서 행동하고 나온 단서를 줍는 순서를 기억해요.',1.2));
 return t;
}
