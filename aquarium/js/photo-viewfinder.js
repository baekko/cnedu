import {box,oval,text} from './field-renderer.js?v245';
import {photoLens,photoFrame,photoPanel,photoLivePanel,photoLight,PHOTO_AIM,subjectPose,wantedAlternate} from './photo-core.js';

export class PhotoViewfinder{
 constructor(renderer){this.renderer=renderer;this.world=document.createElement('canvas');this.world.width=780;this.world.height=1000;this.photo=document.createElement('canvas');this.photo.width=400;this.photo.height=248;this.lastShot=null;}
 renderWorld(g,time=g.elapsed,cameraTime=g.cameraTime){
  const r=this.renderer,c=this.world.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,390,500);c.drawImage(r.images['room'+g.room],0,0,390,500);
  const view={...g,room:g.room,subjects:g.subjects,cameraTime,elapsed:time,pose:s=>subjectPose(s,cameraTime),clueSources:g.clueSources};
  r.reflectors(c,view);
  const layers=g.subjects.map(s=>({y:view.pose(s).y,paint:()=>r.subject(c,s,view,false)}));layers.sort((a,b)=>a.y-b.y).forEach(l=>l.paint());return this.world;
 }
 drawFrame(c,source,lens,x,y,w,h,focus,glare){
  c.save();c.beginPath();c.roundRect(x,y,w,h,6);c.clip();c.fillStyle='#d9cdb2';c.fillRect(x,y,w,h);if(focus<.95)c.filter=`blur(${Math.max(0,(.9-focus)*2.2)}px)`;
  const frame=photoFrame(lens);c.drawImage(source,frame.x*2,frame.y*2,frame.w*2,frame.h*2,x,y,w,h);c.filter='none';
  if(glare){const gr=c.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#fffbe800');gr.addColorStop(.45,'#fff8cce8');gr.addColorStop(.58,'#fffef0');gr.addColorStop(1,'#fffbe800');c.fillStyle=gr;c.fillRect(x,y,w,h);}
  c.restore();
 }
 desired(c,s,x,y){
  const r=this.renderer;
  box(c,x,y,62,62,'#fff6e8eb',6);
  if(s.animal)r.animal(c,{...s,height:26},{x:x+31,y:y+42,frame:0,facing:1});
  else{const alt=wantedAlternate(s),key=alt?'subjectsAlt':'subjects',b=(alt?r.images.atlas.alternate:r.images.atlas.subjects)[s.artIndex??s.id-1];r.sprite(c,key,b,x+31,y+43,36);}
  text(c,s.animal?'따라 찍기':'찍을 모습',x+31,y+54,8,'#68785d');
 }
 draw(c,g){
  const review=!g.focusing&&g.lastShot&&g.lastShot.age<1.2,s=review?g.subjects.find(s=>s.id===g.lastShot.id):g.target;
  if(!s)return;
  if(!review){
   this.desired(c,s,12,9);
   if(g.focusing){
    const {x,y,w,h}=photoLivePanel(),q=g.quality(s),lens=photoLens(s,g.player),source=this.renderWorld(g);
    box(c,x,y,w,h,'#405855f5',7);text(c,'카메라',x+10,y+11,9,'#f4eed9','left');text(c,g.autoShot?'자동 촬영':q.good?'놓아 찍기':Math.round(g.focus*100)+'%',x+w-10,y+11,10,q.good?'#a8e2b0':'#f6e4aa','right');
    this.drawFrame(c,source,lens,x+5,y+23,w-10,120,Math.max(.65,g.focus),q.glare);
    const frame=photoFrame(lens),sx=(w-10)/frame.w,sy=120/frame.h,cx=x+5+(frame.aimX-frame.x)*sx,cy=y+23+(frame.aimY-frame.y)*sy;c.save();c.beginPath();c.rect(x+5,y+23,w-10,120);c.clip();c.strokeStyle=q.good?'#6bdd91':q.glare?'#e3a244':'#fcf0c9';c.lineWidth=1.8;
    for(const [a,b]of [[-1,-1],[1,-1],[-1,1],[1,1]]){c.beginPath();c.moveTo(cx+a*PHOTO_AIM.halfWidth*sx,cy+b*(PHOTO_AIM.halfHeight*sy-7));c.lineTo(cx+a*PHOTO_AIM.halfWidth*sx,cy+b*PHOTO_AIM.halfHeight*sy);c.lineTo(cx+a*(PHOTO_AIM.halfWidth*sx-7),cy+b*PHOTO_AIM.halfHeight*sy);c.stroke();}
    c.restore();
    text(c,q.glare?'반사빛 들어옴':g.autoShot?'자동으로 따라가 촬영 중':q.good?'지금 손을 떼요':q.framed?'누른 채 초점 맞추기':'가운데 표시에 맞춰요',x+w/2,y+151,8,q.glare?'#ffdc88':'#f4eed9');
   }
   if(s.room===2){const light=photoLight(s,g.cameraTime),label=light.active?'반사빛 켜짐 · '+Math.ceil(light.left)+'초':light.warning?'곧 반사빛 · '+light.left.toFixed(1)+'초':'빛 꺼짐 · 촬영 가능';box(c,12,77,145,22,light.active?'#f4d68ff2':'#fff6e8eb',5);text(c,label,84.5,88,9,light.active?'#976821':'#547b62');}
   return;
  }
  const shot=g.lastShot,{x,y,w,h}=photoPanel(g.player);
  if(this.lastShot!==shot){this.lastShot=shot;const source=this.renderWorld(g,shot.elapsed,shot.cameraTime),fc=this.photo.getContext('2d');fc.setTransform(2,0,0,2,0,0);fc.clearRect(0,0,200,124);this.drawFrame(fc,source,shot.lens,0,0,200,124,shot.focus,shot.quality.glare);}
  box(c,x,y,w,h,shot.good?'#7bb48e':'#c6a287',5);c.drawImage(this.photo,x+3,y+3,w-6,58);text(c,shot.good?'✓ 사진 완성':'다시 찍어요',x+w/2,y+68,8,shot.good?'#f5ffe9':'#fff3d7');
 }
}
