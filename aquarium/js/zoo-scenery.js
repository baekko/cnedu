// A single continuous painting: never blend a second copy over a habitat.
// While the hippo is visible, its painted shore uses the same world coordinates.
export const ZOO_VIEW_WIDTH=390;
export const HIPPO_WATERLINE=335;
export const HIPPO_LAKE_REFERENCE_CAMERA=6*420;
export function lakeWorldOffset(cameraX=HIPPO_LAKE_REFERENCE_CAMERA){
 return 0;
}
const TAU=Math.PI*2;
export function panoramaPlacement(cameraX,imageWidth,imageHeight,worldWidth=3780){
 const width=2100;
 const height=width*imageHeight/imageWidth;
 const camera=Math.max(0,Math.min(worldWidth-ZOO_VIEW_WIDTH,cameraX));
 const lakeX=2776-width*.72,lockStart=2230,lockEnd=2940,ramp=40;
 let x=lakeX;
 if(camera<lockStart){
  const speed=lakeX/(lockStart-ramp/2),u=camera-(lockStart-ramp);
  x=u<=0?camera*speed:speed*(lockStart-ramp+u-u*u/(2*ramp));
 }else if(camera>lockEnd){
  const u=camera-lockEnd,speed=(worldWidth-width-lakeX)/(worldWidth-ZOO_VIEW_WIDTH-lockEnd-ramp/2);
  x+=speed*(u<ramp?u*u/(2*ramp):u-ramp/2);
 }
 return{x,y:419-height*.85,width,height};
}
// The mask follows the painted shore. Banks, rocks, trees and the path stay still.
function lakePath(c,r){
 const pts=[[.682,.504],[.732,.486],[.806,.48],[.888,.465],[1,.465],[1,.613],[.945,.64],[.916,.628],[.868,.65],[.839,.694],[.811,.75],[.77,.78],[.74,.832],[.69,.864],[.629,.853],[.584,.838],[.535,.815],[.548,.783],[.585,.794],[.637,.782],[.656,.735],[.637,.684],[.588,.673],[.583,.65],[.638,.602],[.661,.565]];
 c.beginPath();for(let i=0;i<pts.length;i++){const[x,y]=pts[i];i?c.lineTo(r.x+x*r.width,r.y+y*r.height):c.moveTo(r.x+x*r.width,r.y+y*r.height);}c.closePath();
}
function paintPanorama(c,image,r,t){
 c.drawImage(image,r.x,r.y,r.width,r.height);
 const sx=r.width/image.width,sy=r.height/image.height;
 c.save();lakePath(c,r);c.clip();
 // Small travelling refraction moves the original painted water itself.
 c.globalAlpha=.72;
 for(let y=Math.floor(image.height*.46);y<image.height*.87;y+=4){
  const depth=(y/image.height-.46)/.41,dx=(Math.sin(y*.105+t*1.7)*1.7+Math.sin(y*.046-t*.9))*depth;
  c.drawImage(image,Math.floor(image.width*.52),y,Math.ceil(image.width*.48),5,r.x+image.width*.52*sx+dx,r.y+y*sy,image.width*.48*sx,5*sy);
 }
 c.globalAlpha=1;
 // Reflections travel across the same water; they are not glued to the animal.
 for(let i=0;i<65;i++){
  const u=.55+((i*47)%97)/97*.45,v=.49+((i*29)%83)/83*.35,depth=(v-.48)/.37;
  const x=r.x+u*r.width+Math.sin(t*.5+i)*2,y=r.y+v*r.height+Math.sin(t*.7+i*.81)*1.2;
  const width=(5+(i%5)*3)*(.35+depth),a=.06+Math.max(0,Math.sin(t*1.05+i*1.9))*.18;
  c.strokeStyle=`rgba(210,240,220,${a})`;c.lineWidth=.6+depth*.55;c.beginPath();c.moveTo(x-width/2,y);c.quadraticCurveTo(x,y-1-depth,x+width/2,y);c.stroke();
 }
 c.restore();
}
export function hippoLakePlacement(imageWidth,imageHeight){return panoramaPlacement(HIPPO_LAKE_REFERENCE_CAMERA,imageWidth,imageHeight);}
export function drawZooScenery(c,image,cameraX,t=0){
 paintPanorama(c,image,panoramaPlacement(cameraX,image.width,image.height),t);
}
export function waterHeight(x,t){return HIPPO_WATERLINE+Math.sin(x*.055+t*1.8)*.8+Math.sin(x*.13-t*1.2)*.35;}
export function waterClip(c,from,to,t,below=false,depth=90){
 c.beginPath();c.moveTo(from,below?HIPPO_WATERLINE+depth:0);
 for(let x=from;x<=to;x+=3)c.lineTo(x,waterHeight(x,t));
 c.lineTo(to,below?HIPPO_WATERLINE+depth:0);c.closePath();c.clip();
}
export function drawHippoWake(c,p,t,pulses=[]){
 const cx=p.surface?.x??p.x-20,cy=p.surface?.y??HIPPO_WATERLINE;
 c.save();
 // Expanding wave fronts are emitted by a head movement or a gulp.
 for(const pulse of pulses)for(let crest=0;crest<3;crest++){
  const age=pulse.age-crest*.19;if(age<0||age>2.6)continue;
  const fade=(1-age/2.6)**1.5*pulse.strength,rx=27+age*29,ry=4+age*8;
  for(const [from,to,front]of [[.12,Math.PI-.12,true],[Math.PI+.19,TAU-.19,false]]){
   c.beginPath();for(let n=0;n<=28;n++){
    const a=from+(to-from)*n/28,r=1+Math.sin(a*4+age*3)*.035,xx=cx+Math.cos(a)*rx*r,yy=cy+Math.sin(a)*ry*r;
    n?c.lineTo(xx,yy):c.moveTo(xx,yy);
   }
   c.strokeStyle=`rgba(38,112,111,${fade*(front?.25:.12)})`;c.lineWidth=2.2;c.stroke();
   c.strokeStyle=`rgba(213,239,216,${fade*(front?.65:.3)})`;c.lineWidth=.8;c.stroke();
  }
 }
 // A soft meniscus curls around the neck instead of a horizontal body cut.
 for(let side=0;side<2;side++){
  c.strokeStyle='#d3e8d591';c.lineWidth=1.25;c.beginPath();
  const x=cx+(side?1:-1)*23;c.moveTo(x-13,cy+1);c.quadraticCurveTo(x,cy+4+Math.sin(t*2)*.6,x+13,cy);c.stroke();
 }
 const motion=p.headMotion||0;
 if(motion>.05)for(let i=0;i<7;i++){
  const q=(t*1.5+i*.31)%1;c.globalAlpha=(1-q)*motion*.7;c.fillStyle='#d2ecdc';
  const x=cx-28+i*8+Math.sin(i*2)*2,y=cy-7-q*13+q*q*20;
  c.beginPath();c.ellipse(x,y,.65,1.2,0,0,TAU);c.fill();
 }
 c.restore();
}
