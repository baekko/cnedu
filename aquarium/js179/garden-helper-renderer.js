import {oval,text,box} from './field-renderer.js?v=155';
import {GARDENER_TIMING} from './garden-helper.js';
export function drawGardener(r,c,g){
 const h=g.gardener;if(!h||h.room!==g.room)return;
 const data=r.images.gardenerAtlas,s=g.beds[h.id-1],mode=h.phase==='arrive'?'walk':h.room===2?'spray':'tend',anim=data.animations[mode],elapsed=h.phase==='arrive'?h.age:Math.max(0,h.age-GARDENER_TIMING.arrive),distance=Math.hypot(h.x-h.fromX,h.y-h.fromY),index=h.phase==='arrive'?Math.floor(distance/24)%4:Math.floor(elapsed*anim.fps)%4,f=data.frames[anim.frames[index]],scale=64/data.referenceHeight;
 const wanted=h.phase==='arrive'?Math.sign(h.toX-h.fromX):Math.sign(s.x-h.x),flip=wanted===(anim.facing==='left'?-1:1)?1:-1;
 c.save();if(h.phase==='leave')c.globalAlpha=Math.max(0,1-(h.age-GARDENER_TIMING.arrive-GARDENER_TIMING.work)/GARDENER_TIMING.leave);
 oval(c,h.x,h.y+1,12,3.5,'#33473a2c');c.translate(h.x,h.y);c.scale(flip,1);c.drawImage(r.images.gardener,f.sx,f.sy,f.sw,f.sh,-f.footX*scale,-f.footY*scale,f.sw*scale,f.sh*scale);c.restore();
 if(h.phase==='work'&&h.room===2&&f.nozzle){const from={x:h.x+(f.nozzle.x-f.footX)*scale*flip,y:h.y+(f.nozzle.y-f.footY)*scale},to={x:s.x,y:322};for(let i=0;i<10;i++){const u=(elapsed*2+i*.1)%1;oval(c,from.x+(to.x-from.x)*u,from.y+(to.y-from.y)*u+Math.sin(i*5)*u*3,1,1.2,'#9fcbd3b3');}}
 if(h.phase==='work'&&h.room===1)for(let i=0;i<6;i++){const u=(elapsed*1.8+i*.17)%1;oval(c,h.x+(s.x-h.x)*u,h.y-36+(322-(h.y-36))*u+Math.sin(i*4)*3,1,1,'#e6c577b0');}
 const x=Math.max(43,Math.min(347,h.x));box(c,x-33,h.y-78,66,16,'#fff4dce8',4);text(c,h.complete?'작업 완료':'정원사',x,h.y-70,8,'#5a7961');
}
