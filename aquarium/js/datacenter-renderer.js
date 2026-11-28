import {dataBriefing} from './briefing-scenes.js?v=155';
import {FieldRenderer,box,oval,text,TAU} from './field-renderer.js?v245';
import {workshopAssets,artMetadata,loadWorkshopEntrance} from './workshop-art.js?v=155';
import {drawPlayerAction,loadPlayerActions,leverStandpoint} from './player-actions.js?v=155';
import {DATA_FILES,DATA_NODES,DATA_RECEIVERS,DATA_VIRUSES,dataVirusPose} from './datacenter-core.js?v268';
import {paintDamageGuide} from './damage-guide.js?v306';
export const dataVirusDangerArea=p=>({x:p.x,y:p.y,r:16});
export async function loadDataCenterAssets(character){
 const images=await workshopAssets('datacenter-v306',character,['room','props','records']);
 images.room0=images.room;
 images.propsAtlas=await artMetadata('datacenter-v128','props');
 await Promise.all([loadPlayerActions(images,character),loadWorkshopEntrance(images,'datacenter')]);
 return images;
}
export class DataCenterRenderer extends FieldRenderer{
 briefing(c,character,t){dataBriefing(this,c,character,t);}
 record(c,symbol,x,y,size){const column={map:0,star:1,sound:2}[symbol];c.drawImage(this.images.records,column*256,0,256,256,x,y,size,size);}
 prop(c,key,x,y,height){const b=this.images.propsAtlas.frames[key],k=height/(b.opaqueBounds[3]-b.opaqueBounds[1]);c.drawImage(this.images.props,b.sx,b.sy,b.sw,b.sh,x-b.anchor[0]*k,y-b.anchor[1]*k,b.sw*k,b.sh*k);}
 cable(c,from,to,active,color){
  const a=DATA_NODES[from],b=DATA_NODES[to];c.lineCap='round';
  c.strokeStyle=active?'#4a4d42':'#777a6b';c.lineWidth=active?6:3.2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  c.strokeStyle=active?color:'#c2c7bd';c.lineWidth=active?3.6:1.5;c.stroke();
  if(active){
   const angle=Math.atan2(b.y-a.y,b.x-a.x);
   for(const u of [.38,.68]){c.save();c.translate(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u);c.rotate(angle);c.fillStyle=color;c.strokeStyle='#4a4d42';c.lineWidth=1;c.beginPath();c.moveTo(5,0);c.lineTo(-4,-4);c.lineTo(-4,4);c.closePath();c.fill();c.stroke();c.restore();}
  }
 }

 draw(g,character){if(!g)return;const c=this.begin(g);
  const symbols=['●','◆','▲'],colors=DATA_RECEIVERS.map(r=>r.color);
  this.cable(c,'source','fork',true,colors[g.connectedServer]);
  for(const l of g.levers)for(const[i,to]of(l.node==='fork'?['left','right']:l.node==='left'?['out0','out1']:['out1','out2']).entries()){
   const target=to==='left'?(g.levers[1].state?1:0):to==='right'?(g.levers[2].state?2:1):Number(to.slice(3));
   this.cable(c,l.node,to,l.state===i,colors[target]);
  }
  for(const [i,r]of DATA_RECEIVERS.entries()){
   const wanted=g.file.targets.some((t,piece)=>t===i&&!g.file.received.includes(piece));
   box(c,r.x-32,137,64,17,wanted?'#fff4dcee':'#edf0e8dd',3);text(c,symbols[i],r.x-23,145,9,r.color);text(c,r.name,r.x+5,145,8,'#4e645e');
   if(wanted){c.strokeStyle=r.color;c.lineWidth=2;c.beginPath();c.roundRect(r.x-32,137,64,17,3);c.stroke();}
  }
  for(const v of DATA_VIRUSES){if(g.isVirusCleared(v))continue;const p=dataVirusPose(v,g.elapsed);if(!p.warning&&!p.active)continue;const a=DATA_NODES[v.edge[0]],b=DATA_NODES[v.edge[1]];if(p.warning){c.save();c.strokeStyle='#c28955';c.lineWidth=2;c.setLineDash([4,5]);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.restore();box(c,b.x-8,b.y+22,16,16,'#f9e8bf',4);text(c,'!',b.x,b.y+30,11,'#a77145');}else{paintDamageGuide(c,dataVirusDangerArea(p),true,{fill:'#edab7f30',edge:'#b6605eab'});this.prop(c,'virus',p.x,p.y,18);}}
  for(const p of g.packets){if(p.wait>0)continue;const col=DATA_RECEIVERS[p.target].color;oval(c,p.x,p.y+2,11,3,'#43554a35');this.record(c,g.files[p.file].symbol,p.x-12,p.y-21,24);box(c,p.x+4,p.y-7,11,11,col,3);text(c,symbols[p.target],p.x+9.5,p.y-1.5,7,'#fffdf1');}
  const layers=g.levers.map(l=>({y:l.y,draw:()=>{this.prop(c,l.state?'leverRight':'leverLeft',l.x,l.y,30);if(g.nearbyLever===l){c.strokeStyle='#527b71';c.lineWidth=1.4;c.beginPath();c.ellipse(l.x,l.y+2,19,6,0,0,TAU);c.stroke();}}}));
  layers.push({y:445,draw:()=>{this.prop(c,'source',195,445,38);box(c,166,448,58,14,'#fff2d9ee',3);text(c,'전송 단말기',195,455,8,'#61786b');const waiting=g.packets.find(p=>p.wait>0);if(waiting){box(c,208,409,80,17,'#fff3dced',4);text(c,'다음 '+DATA_RECEIVERS[waiting.target].name.slice(0,2)+' · '+waiting.wait.toFixed(1)+'초',248,418,8,'#627269');}}});
  layers.push({y:g.player.y,draw:()=>{if(g.work){oval(c,g.player.x,g.player.y+1,11,3.5,'#33473a2c');drawPlayerAction(c,this.images,character,g.player,'leverUp',Math.min(3,Math.floor(g.workAge/.115)));}else this.hero(c,g,character);}});layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
  for(const v of DATA_VIRUSES)if(g.isVirusCleared(v)){const a=DATA_NODES[v.edge[0]],b=DATA_NODES[v.edge[1]],x=(a.x+b.x)/2,y=(a.y+b.y)/2;oval(c,x,y,7,7,'#ecf9eae6');text(c,'✓',x,y,9,'#488975');}
  for(const e of g.effects)if(e.type==='dataCleanse'&&e.age<.9){c.save();c.strokeStyle='#c7fff0';c.globalAlpha=1-e.age/.9;c.lineWidth=8*(1-e.age/.9)+2;for(const edge of e.route){const a=DATA_NODES[edge[0]],b=DATA_NODES[edge[1]];c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}c.restore();}
  box(c,12,10,366,43,'#fff2dcef',7);
  const f=g.file;this.record(c,f.symbol,20,15,34);text(c,(f.id+1)+'/9 · '+f.name,62,23,11,'#49675f','left');
  const path=DATA_RECEIVERS[g.connectedServer];box(c,246,16,121,17,'#e5eee4',4);text(c,'현재 길 → '+path.name,306,25,8,'#536e65');
  text(c,'목적지',62,41,9,'#64776e','left');
  for(const[i,target]of f.targets.entries()){
   const x=107+i*127,r=DATA_RECEIVERS[target],done=f.received.includes(i);
   text(c,(f.targets.length===2?(i?'둘째 ':'첫째 '):'')+symbols[target]+' '+r.name+(done?' ✓':''),x,41,9,done?'#718676':r.color,'left');
  }

  this.end(c,g,false);
 }
 bindContacts(g,character){g.leverContact=l=>leverStandpoint(this.images,character,l,this.images.propsAtlas.frames[l.state?'leverLeft':'leverRight']);}
}
