import {drawGardener} from './garden-helper-renderer.js?v245';
import {drawClueCard} from './clue-card-art.js?v245';
import {box,oval,text,TAU} from './field-renderer.js?v245';
import {DONORS,POLLEN_COLORS,POLLEN_NAMES,gardenBugPose} from './garden-care.js';
const BLOOMS=['bloom-gold','bloom-pink','bloom-blue'];
export function drawGardenCare(r,c,g,character){
 if(g.room===1){
  for(const d of DONORS){r.object(c,BLOOMS[d.color],d.x,247,46);box(c,d.x-31,258,62,18,'#fff3d9ed',4);oval(c,d.x-20,267,3.5,3.5,POLLEN_COLORS[d.color]);text(c,POLLEN_NAMES[d.color]+' 꽃가루',d.x+5,267,8,'#6b795c');}
  for(const s of g.plants){const key=BLOOMS[s.pollenNeed],h=55;
   box(c,s.x-43,277,86,22,'#fff3dfe8',4);text(c,s.name+(s.bloom?' ✓':''),s.x-8,288,10,'#596e57');if(!s.bloom)drawClueCard(c,s.x+18,288,8,11);oval(c,s.x+30,288,4,4,POLLEN_COLORS[s.pollenNeed]);
   oval(c,s.x,356,23,5,'#55654d25');r.object(c,key,s.x,355,h);
   if(!s.bloom){box(c,s.x-30,363,60,24,'#fff5d9ed',4);for(let n=0;n<3;n++)oval(c,s.x-10+n*10,370,3,3,n<s.pollinate?POLLEN_COLORS[s.pollenNeed]:'#c6c8ae');text(c,s.pollinate+' / 3',s.x,380,8,'#43846a');}
  }
 }else{
  for(const s of g.plants){box(c,s.x-40,266,80,24,'#fff5deeb',5);text(c,s.name+(s.bloom?' ✓':''),s.x-5,276,10,'#5b7057');if(!s.bloom)drawClueCard(c,s.x+29,276,8,11);const bugs=g.bugs.filter(b=>b.source===s.id&&b.hp>0);text(c,s.bloom?'보호 완료':'벌레 '+bugs.length,s.x,286,7.5,'#8b795c');r.sprite(c,'plants',r.images.atlas.plants[s.id-1],s.x,356,58);}
  for(const b of g.bugs){if(b.hp<=0)continue;const q=gardenBugPose(g,b),key=b.kind==='beetle'?'beetle':q.land?'moth-folded':q.frame?'moth-open':'moth-folded',h=b.kind==='beetle'?11:13;
   c.save();if(b.hitAge<.13)c.filter='brightness(1.7)';r.object(c,key,q.x,q.y+5,h);c.restore();if(q.land){c.strokeStyle='#7ea484';c.lineWidth=.6;c.beginPath();c.arc(q.x,q.y,9,0,TAU);c.stroke();}for(let n=0;n<b.hp;n++)oval(c,q.x-2.3+n*4.6,q.y+11,1.3,1.3,'#c2a361');
  }
 }
 if(g.gardener?.y<=g.player.y)drawGardener(r,c,g);r.hero(c,g,character);if(g.gardener?.y>g.player.y)drawGardener(r,c,g);const p=g.player;
 if(g.room===1&&g.pollen!==null){c.save();const brushing=g.working?Math.sin(g.elapsed*15)*.12:0;c.translate(p.x+11,p.y-27);c.rotate(brushing);r.object(c,'brush',0,7,21);oval(c,5,-10,2.4,2.1,POLLEN_COLORS[g.pollen]);c.restore();}
 for(const e of g.effects)if(e.type==='pollen'&&e.age<.4){for(let i=0;i<8;i++){const u=Math.min(1,e.age*3+i*.03);oval(c,e.x+(e.toX-e.x)*u+Math.sin(i*3)*3,e.y+(e.toY-e.y)*u,1.2,1.2,POLLEN_COLORS[e.color]);}}
 for(const e of g.effects)if(e.type==='spray'&&e.age<.45){c.save();for(let i=0;i<19;i++){const a=((i*7)%19-9)/9*.46,dist=Math.min(70,e.age*220+i*1.5),px=e.x+(e.dx*Math.cos(a)-e.dy*Math.sin(a))*dist,py=e.y+(e.dy*Math.cos(a)+e.dx*Math.sin(a))*dist;c.globalAlpha=(1-e.age/.45)*(1-dist/95);oval(c,px,py,1.2,1.4,'#9dcbd0');}c.restore();}
}
