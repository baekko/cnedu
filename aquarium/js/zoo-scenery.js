// The approved route artwork is assembled in world coordinates. The walkways,
// shore and background move with one camera so the scene retains its composition.
export const ZOO_VIEW_WIDTH=390;
export const HIPPO_WATERLINE=335;
const WORLD_WIDTH=3780;
const WORLD_HEIGHT=500;
const TAU=Math.PI*2;

export function lakeWorldOffset(){
 return 0;
}

// Keep the animated strips inside open water. The distance to the shoreline
// leaves room for both the shifting image and the painted leaves and rocks.
const OPEN_WATER=[
 [2630,239],[2670,230],[2770,193],[3010,182],[3090,181],[3330,172],
 [3570,171],[3750,175],[3750,205],[3730,205],[3650,225],[3630,237],
 [3610,260],[3470,266],[3430,271],[3350,243],[3310,241],[3290,247],
 [3270,272],[3230,268],[3170,272],[3030,273],[3010,276],[2990,297],
 [2970,332],[2930,331],[2890,336],[2810,377],[2790,406],[2750,406],
 [2730,373],[2710,358],[2690,350],[2650,349],[2634,306]
];

export function drawZooScenery(c,image,cameraX,t=0){
 const camera=Math.max(0,Math.min(WORLD_WIDTH-ZOO_VIEW_WIDTH,cameraX));
 const scale=image.width/WORLD_WIDTH,span=ZOO_VIEW_WIDTH*scale;
 c.drawImage(image,camera*scale,0,span,image.height,camera,0,ZOO_VIEW_WIDTH,WORLD_HEIGHT);
 if(camera+ZOO_VIEW_WIDTH<OPEN_WATER[0][0])return;
 c.save();
 c.beginPath();
 OPEN_WATER.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 c.closePath();c.clip();
 const sy=image.height/WORLD_HEIGHT;
 c.globalAlpha=.55;
 for(let y=148;y<415;y+=4){
  const depth=(y-148)/267;
  const shift=(Math.sin(y*.2+t*1.7)*1.35+Math.sin(y*.09-t*.9)*.8)*depth;
  c.drawImage(image,camera*scale,y*sy,span,4*sy,camera+shift,y,ZOO_VIEW_WIDTH,4);
 }
 c.restore();
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
 if(p.rig.lift>.35){
  c.globalAlpha=Math.min(1,(p.rig.lift-.35)*3);
  for(let side=0;side<2;side++){
   c.strokeStyle='#d3e8d591';c.lineWidth=1.25;c.beginPath();
   const x=cx+(side?1:-1)*23;c.moveTo(x-13,cy+1);c.quadraticCurveTo(x,cy+4+Math.sin(t*2)*.6,x+13,cy);c.stroke();
  }
 }
 const motion=p.headMotion||0;
 if(motion>.05)for(let i=0;i<7;i++){
  const q=(t*1.5+i*.31)%1;c.globalAlpha=(1-q)*motion*.7;c.fillStyle='#d2ecdc';
  const x=cx-28+i*8+Math.sin(i*2)*2,y=cy-7-q*13+q*q*20;
  c.beginPath();c.ellipse(x,y,.65,1.2,0,0,TAU);c.fill();
 }
 c.restore();
}
