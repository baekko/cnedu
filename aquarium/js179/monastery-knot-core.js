import {awardClue,CLUE_ORDER} from './clue-order.js';

export const MONASTERY=Object.freeze({duration:90,width:390,height:500,flashes:2,answer:'목탁',hints:['사찰에서 두드려 소리를 내는 나무 악기예요.','둥근 몸통과 손잡이가 있고, 나무 채로 두드려요.']});
export const KNOT_FIELD=Object.freeze({left:39,right:351,top:94,bottom:350,pickRadius:29,separation:46});
const freeze=p=>Object.freeze({...p,edges:Object.freeze(p.edges.map(Object.freeze)),solution:Object.freeze(p.solution.map(Object.freeze)),start:Object.freeze(p.start.map(Object.freeze))});
export const COURTYARDS=Object.freeze([
 freeze({name:'산문의 뜰',edges:[[0,1],[1,2],[2,3],[3,0]],solution:[[100,126],[290,126],[290,326],[100,326]],start:[[100,126],[290,326],[290,126],[100,326]]}),
 freeze({name:'연못의 뜰',edges:[[0,1],[1,2],[2,3],[3,0],[4,0],[4,1],[4,2],[4,3]],solution:[[195,104],[321,223],[195,344],[69,223],[195,223]],start:[[86,173],[105,318],[205,104],[267,327],[309,189]]}),
 freeze({name:'법당의 뜰',edges:[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]],solution:[[195,98],[335,344],[55,344],[195,186],[251,287],[139,287]],start:[[75,272],[207,111],[296,286],[192,339],[88,158],[300,169]]})
]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const snapshot=nodes=>nodes.map(({x,y})=>({x,y}));
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function pointOnSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l,0,1):0;return {t,x:a.x+t*dx,y:a.y+t*dy,d:Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)};}
export function crossingPoint(a,b,c,d){
 const u={x:b.x-a.x,y:b.y-a.y},v={x:d.x-c.x,y:d.y-c.y},den=u.x*v.y-u.y*v.x;
 if(Math.abs(den)<1e-7){
  if(Math.abs(cross(a,b,c))>1e-5)return null;
  for(const p of[a,b,c,d]){const q=pointOnSegment(p,p===a||p===b?c:a,p===a||p===b?d:b);if(q.d<.1&&q.t>.001&&q.t<.999)return {x:p.x,y:p.y};}
  return Math.hypot(a.x-c.x,a.y-c.y)<.1&&Math.hypot(b.x-d.x,b.y-d.y)<.1?{x:(a.x+b.x)/2,y:(a.y+b.y)/2}:null;
 }
 const dx=c.x-a.x,dy=c.y-a.y,t=(dx*v.y-dy*v.x)/den,s=(dx*u.y-dy*u.x)/den;
 return t>=0&&t<=1&&s>=0&&s<=1?{x:a.x+t*u.x,y:a.y+t*u.y}:null;
}
export function knotState(nodes,edges){
 const crossings=[],crowded=[],through=[],badEdges=new Set(),badNodes=new Set();
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
  const [a,b]=edges[i],[c,d]=edges[j];if(a===c||a===d||b===c||b===d)continue;
  const p=crossingPoint(nodes[a],nodes[b],nodes[c],nodes[d]);if(p){crossings.push({...p,edges:[i,j]});badEdges.add(i);badEdges.add(j);for(const n of[a,b,c,d])badNodes.add(n);}
 }
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y)<KNOT_FIELD.separation){crowded.push({x:(nodes[i].x+nodes[j].x)/2,y:(nodes[i].y+nodes[j].y)/2,nodes:[i,j]});badNodes.add(i);badNodes.add(j);}
 for(const [ei,[a,b]]of edges.entries())for(let n=0;n<nodes.length;n++)if(n!==a&&n!==b){const q=pointOnSegment(nodes[n],nodes[a],nodes[b]);if(q.t>.04&&q.t<.96&&q.d<16){through.push({x:q.x,y:q.y,node:n,edge:ei});badEdges.add(ei);badNodes.add(n);}}
 const count=crossings.length+crowded.length+through.length;return {crossings,crowded,through,badEdges,badNodes,count,clear:count===0};
}

export class MonasteryGame{
 constructor({onEvent=()=>{}}={}){
  this.onEvent=onEvent;this.elapsed=0;this.ended=false;this.phase='explore';this.zoneIndex=0;this.health=3;this.flashes=MONASTERY.flashes;this.hits=this.mistakes=0;
  this.banked=new Set();this.found=new Set();this.clueSources=new Set();this.player={x:48,y:450,dir:'right',moving:false,walk:0,hammerAge:99};this.camera={x:0,y:0};
  this.boards=COURTYARDS.map((p,round)=>({round,nodes:p.start.map(([x,y],id)=>({id,x,y,color:(id+round)%3})),solved:false}));
  this.drag=null;this.selectedId=0;this.history=[];this.hint=null;this.lightAge=0;this.moves=0;this.message='';this.messageLeft=0;
 }
 get zone(){return COURTYARDS[this.zoneIndex];}
 get board(){return this.boards[this.zoneIndex];}
 get nodes(){return this.board.nodes;}
 get knots(){return knotState(this.nodes,this.zone.edges);}
 get remaining(){return Math.max(0,MONASTERY.duration-this.elapsed);}
 get canMove(){return !this.ended&&this.phase==='explore';}
 get canUndo(){return this.canMove&&!this.drag&&this.history.length>0;}
 get canShield(){return this.canMove&&this.flashes>0&&!this.hint;}
 get prompt(){if(this.messageLeft>0)return this.message;if(this.phase==='lighting')return '줄이 풀렸어요 · 뜰에 불빛이 켜져요';if(this.ended)return this.banked.size===9?'세 뜰의 연등을 모두 밝혔어요':'밝힌 뜰의 단서를 모았어요';if(this.hint)return '빛나는 연등을 점선 끝의 자리로 옮겨 봐요';return this.knots.crowded.length?'연등 사이에 조금 더 간격을 두세요':'연등을 끌어 줄이 겹친 곳을 풀어 주세요';}
 say(text){this.message=text;this.messageLeft=1.5;}
 beginDrag(x,y){
  if(!this.canMove||this.drag)return false;const n=this.nodes.map(n=>({n,d:Math.hypot(n.x-x,n.y-y)})).filter(q=>q.d<=KNOT_FIELD.pickRadius).sort((a,b)=>a.d-b.d)[0]?.n;
  if(!n)return false;this.selectedId=n.id;this.drag={id:n.id,before:snapshot(this.nodes),offset:{x:n.x-x,y:n.y-y}};return true;
 }
 dragTo(x,y){if(!this.canMove||!this.drag)return false;const n=this.nodes[this.drag.id];n.x=clamp(x+this.drag.offset.x,KNOT_FIELD.left,KNOT_FIELD.right);n.y=clamp(y+this.drag.offset.y,KNOT_FIELD.top,KNOT_FIELD.bottom);return true;}
 endDrag(){
  if(!this.drag)return false;const old=this.drag.before;this.drag=null;
  if(this.nodes.every((n,i)=>Math.hypot(n.x-old[i].x,n.y-old[i].y)<2))return false;
  this.history.push(old);if(this.history.length>40)this.history.shift();this.moves++;this.hint=null;this.onEvent({type:'monasteryNodeMoved',id:this.selectedId});this.checkClear();return true;
 }
 cancelDrag(){if(!this.drag)return;const old=this.drag.before;this.drag=null;this.nodes.forEach((n,i)=>Object.assign(n,old[i]));}
 releaseAction(){this.cancelDrag();}
 undo(){if(!this.canUndo)return false;const old=this.history.pop();this.nodes.forEach((n,i)=>Object.assign(n,old[i]));this.hint=null;this.onEvent({type:'monasteryUndo'});return true;}
 selectNext(){if(!this.canMove)return;this.endDrag();this.selectedId=(this.selectedId+1)%this.nodes.length;}
 // Production keyboard input moves the selected lantern; the character stays fixed.
 queueMove(input){this.nudge(input,.08);this.endDrag();}
 nudge(input,dt){if(!this.canMove)return;const dx=Number(input.x)||0,dy=Number(input.y)||0;if(!dx&&!dy){if(this.drag?.keyboard)this.endDrag();return;}if(!this.drag){const n=this.nodes[this.selectedId];this.beginDrag(n.x,n.y);this.drag.keyboard=true;}if(this.drag.keyboard){const n=this.nodes[this.drag.id],len=Math.max(1,Math.hypot(dx,dy));this.dragTo(n.x+dx/len*120*dt,n.y+dy/len*120*dt);}}
 checkClear(){
  if(!this.canMove||!this.knots.clear)return false;this.board.solved=true;this.phase='lighting';this.lightAge=0;this.hint=null;this.history=[];
  for(let i=0;i<3;i++){const id=awardClue(this,this.zoneIndex*3+i+1);if(id)this.onEvent({type:'card',id,x:145+i*50,y:440});}
  this.onEvent({type:'monasteryHang',round:this.zoneIndex});return true;
 }
 flash(){
  if(!this.canShield)return false;const current=this.knots.count;let best=null;
  const targets=[...this.zone.solution.map(([x,y])=>({x,y})),...Array.from({length:30},(_,i)=>({x:55+(i%6)*56,y:105+Math.floor(i/6)*57}))];
  for(const n of this.nodes)for(const to of targets){if(Math.hypot(n.x-to.x,n.y-to.y)<12)continue;const trial=this.nodes.map(p=>p.id===n.id?{...p,...to}:p),count=knotState(trial,this.zone.edges).count;if(count>=current)continue;const score=count*10000+Math.hypot(n.x-to.x,n.y-to.y);if(!best||score<best.score)best={id:n.id,...to,score};}
  if(!best){this.say('가운데 연등을 바깥쪽으로 옮겨 보세요');return false;}
  this.flashes--;this.hint={...best,left:MONASTERY.duration};this.selectedId=best.id;this.onEvent({type:'monasteryHint'});return true;
 }
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,this.remaining);this.elapsed+=dt;this.messageLeft=Math.max(0,this.messageLeft-dt);if(this.hint){this.hint.left-=dt;if(this.hint.left<=0)this.hint=null;}
  if(this.phase==='lighting'){this.lightAge+=dt;if(this.lightAge>=1.2){if(this.zoneIndex===2){this.finish(true);return;}this.zoneIndex++;this.phase='explore';this.selectedId=0;this.lightAge=0;}}
  else this.nudge(input,dt);
  if(this.remaining<1e-8){this.elapsed=MONASTERY.duration;this.cancelDrag();this.finish(true);}
 }
 restoreResult(rec){
  this.elapsed=clamp(rec.elapsed||0,0,MONASTERY.duration);this.flashes=rec.flashes??MONASTERY.flashes;
  this.clueSources=new Set((rec.lit?.length?rec.lit:Array.from({length:rec.clues?.length||0},(_,i)=>i+1)).filter(id=>id>=1&&id<=9));
  this.banked=new Set((rec.clues?.length?rec.clues:CLUE_ORDER.slice(0,this.clueSources.size)).filter(id=>id>=1&&id<=9));this.found=new Set(this.banked);
  this.zoneIndex=Math.min(2,Math.floor(this.banked.size/3));for(const b of this.boards)if([0,1,2].every(i=>this.clueSources.has(b.round*3+i+1))){b.solved=true;b.nodes.forEach((n,i)=>{[n.x,n.y]=COURTYARDS[b.round].solution[i];});}this.phase='complete';this.ended=true;
 }
 finish(survived=true){if(this.ended)return;this.cancelDrag();this.ended=true;this.phase=survived?'complete':'stopped';this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
