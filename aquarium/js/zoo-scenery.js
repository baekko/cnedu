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

// World-space shoreline from the lake painting. Limit refraction to water,
// excluding the planted banks and foreground stones.
const LAKE=[
 [2540,273],[2603,238],[2650,204],[2680,176],[2759,165],
 [2870,160],[3006,145],[3260,148],[3440,145],[3735,149],
 [3778,161],[3778,192],[3730,190],[3680,209],[3660,244],
 [3610,255],[3510,253],[3436,242],[3368,271],[3311,254],
 [3260,251],[3210,231],[3182,214],[3152,210],[3128,229],
 [3112,252],[3070,254],[3040,254],[2999,274],[2974,291],
 [2960,317],[2940,334],[2924,354],[2876,355],[2840,377],
 [2819,399],[2774,410],[2735,395],[2695,411],[2648,402],
 [2628,385],[2624,363],[2668,358],[2642,320],[2614,292]
];

export function drawZooScenery(c,image,cameraX,t=0){
 const camera=Math.max(0,Math.min(WORLD_WIDTH-ZOO_VIEW_WIDTH,cameraX));
 const scale=image.width/WORLD_WIDTH,span=ZOO_VIEW_WIDTH*scale;
 c.drawImage(image,camera*scale,0,span,image.height,camera,0,ZOO_VIEW_WIDTH,WORLD_HEIGHT);
 if(camera+ZOO_VIEW_WIDTH<LAKE[0][0])return;
 c.save();
 c.beginPath();
 LAKE.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 c.closePath();c.clip();
 const sy=image.height/WORLD_HEIGHT;
 c.globalAlpha=.7;
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
