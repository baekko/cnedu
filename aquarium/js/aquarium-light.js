// Warm searchlight from the existing brass lamp, scattered through blue water.
// Rendering only: the game's 195-unit repel radius and three charges are intact.
export const LIGHT_FX_SECONDS=.9;
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
const pulse=age=>Math.sin(Math.PI*clamp(age/LIGHT_FX_SECONDS))**.65;
function lampPose(player,time,scale){
 const angle=Math.sin(time*1.6)*.025,x=30.5*scale,y=3.85*scale;
 return {x:player.x+x*Math.cos(angle)-y*Math.sin(angle),y:player.y+x*Math.sin(angle)+y*Math.cos(angle),angle};
}
function oval(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);}

export function drawLightWater(c,fx,player,time,scale){
 const age=fx.age,p=clamp(age/LIGHT_FX_SECONDS),power=pulse(age);
 if(power<=0)return;
 c.save();c.globalCompositeOperation='screen';
 // Diffused light remains centred on the actual repel point, including behind
 // the submarine. The broad field is translucent, not a solid white flash.
 const radius=52+143*(1-Math.pow(1-p,3));
 const haze=c.createRadialGradient(fx.x,fx.y,10,fx.x,fx.y,radius);
 haze.addColorStop(0,`rgba(255,231,159,${.22*power})`);
 haze.addColorStop(.3,`rgba(253,231,167,${.13*power})`);
 haze.addColorStop(.7,`rgba(137,232,221,${.11*power})`);haze.addColorStop(1,'rgba(104,217,222,0)');
 c.fillStyle=haze;oval(c,fx.x,fx.y,radius,radius);c.fill();
 const lamp=lampPose(player,time,scale);
 c.translate(lamp.x,lamp.y);c.rotate(lamp.angle);
 const reach=152,spread=65+9*Math.sin(p*Math.PI);
 const beam=c.createLinearGradient(0,0,reach,0);
 beam.addColorStop(0,`rgba(255,246,198,${.55*power})`);
 beam.addColorStop(.22,`rgba(255,236,172,${.32*power})`);
 beam.addColorStop(.64,`rgba(196,238,206,${.15*power})`);beam.addColorStop(1,'rgba(153,230,220,0)');
 c.fillStyle=beam;c.beginPath();c.moveTo(-2,-8);
 c.bezierCurveTo(34,-17,96,-spread*.8,reach,-spread);
 c.quadraticCurveTo(reach+15,0,reach,spread);
 c.bezierCurveTo(92,spread*.8,32,18,-2,8);c.closePath();c.fill();
 // Uneven shafts and drifting dust break up the cone like underwater light.
 for(let i=0;i<5;i++){
  const slope=(i-2)*.22+Math.sin(age*5+i)*.018,length=118+(i%3)*13;
  const g=c.createLinearGradient(0,0,length,0);g.addColorStop(0,`rgba(255,251,219,${(.17-i%2*.04)*power})`);g.addColorStop(.5,`rgba(245,244,194,${.07*power})`);g.addColorStop(1,'rgba(212,240,218,0)');
  c.fillStyle=g;c.beginPath();c.moveTo(0,(i-2)*1.6);c.lineTo(length,slope*length-3-i%2*3);c.lineTo(length,slope*length+4);c.closePath();c.fill();
 }
 for(let i=0;i<14;i++){
  const x=18+(i*37+age*31)%132,y=Math.sin(i*7.3)*x*.38;
  c.globalAlpha=power*(.3+.35*Math.sin((p+i*.09)*Math.PI)**2);
  c.fillStyle=i%3?'#f8eec3':'#d6fff5';oval(c,x,y,.65+i%3*.25,.65+i%3*.25);c.fill();
 }
 c.restore();
}

export function drawLightSurface(c,fx,player,time,scale){
 const p=clamp(fx.age/LIGHT_FX_SECONDS),power=pulse(fx.age);if(power<=0)return;
 c.save();c.globalCompositeOperation='screen';
 // A soft travelling band, with broken curved highlights instead of spokes.
 const radius=42+153*(1-Math.pow(1-p,2)),fade=power*(1-p);
 const ripple=c.createRadialGradient(fx.x,fx.y,Math.max(0,radius-16),fx.x,fx.y,radius+7);
 ripple.addColorStop(0,'rgba(197,250,222,0)');ripple.addColorStop(.55,`rgba(219,247,200,${.14*fade})`);ripple.addColorStop(.78,`rgba(245,246,191,${.23*fade})`);ripple.addColorStop(1,'rgba(166,241,231,0)');
 c.fillStyle=ripple;oval(c,fx.x,fx.y,radius+7,radius+7);c.fill();
 c.lineCap='round';
 for(let i=0;i<7;i++){
  const angle=i*.9+.22,r=radius-(i%3)*3;c.strokeStyle=`rgba(223,255,236,${fade*(i%2?.2:.38)})`;c.lineWidth=i%2?.65:1.05;
  c.beginPath();c.arc(fx.x,fx.y,r,angle,angle+.12+i%3*.06);c.stroke();
 }
 const lamp=lampPose(player,time,scale);
 // Reflect the warm lamp on the window rim without bleaching the pilot.
 c.strokeStyle=`rgba(255,229,155,${.5*power})`;c.lineWidth=1.4;
 c.beginPath();c.arc(player.x+5*scale,player.y-scale,29*scale,-1.1,1.2);c.stroke();
 c.translate(lamp.x,lamp.y);c.rotate(lamp.angle);
 const glow=c.createRadialGradient(0,0,2,0,0,28);
 glow.addColorStop(0,`rgba(255,249,209,${.85*power})`);glow.addColorStop(.25,`rgba(255,226,138,${.55*power})`);glow.addColorStop(1,'rgba(255,213,126,0)');
 c.fillStyle=glow;oval(c,0,0,28,28);c.fill();
 c.fillStyle=`rgba(255,255,234,${.93*power})`;oval(c,1,0,3.2*scale,7.8*scale);c.fill();
 c.strokeStyle=`rgba(255,250,222,${.58*power})`;c.lineWidth=.85;
 c.beginPath();c.moveTo(-5,0);c.lineTo(20+8*power,0);c.moveTo(2,-13);c.lineTo(2,13);c.stroke();
 c.restore();
}
