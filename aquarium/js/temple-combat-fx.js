// Discrete, cached painted effect frames: no collision geometry is changed here.
const TAU=Math.PI*2,N=8;
const noise=(n)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
let cached;
function strip(w,h,paint){const sheet=document.createElement('canvas');sheet.width=w*N;sheet.height=h;const c=sheet.getContext('2d');for(let f=0;f<N;f++){c.save();c.translate(w*f,0);c.beginPath();c.rect(0,0,w,h);c.clip();paint(c,f);c.restore();}return {sheet,w,h};}
function line(c,points,color,width){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
export function makeCombatEffects(){
 if(cached)return cached;
 const bolt=strip(160,240,(c,f)=>{
  const core=[[80,3],[70+noise(f+4)*21,38],[91,61],[72+noise(f+9)*12,99],[89,122],[69,167],[82,181],[80,210]];
  c.lineJoin='round';c.lineCap='round';c.shadowColor='#ffd264';c.shadowBlur=15;line(c,core,'#f5b73c66',13);line(c,core,'#ffe98b',6);c.shadowBlur=0;line(c,core,'#fffef1',2.8);
  for(let i=1;i<5;i++){const [x,y]=core[i],d=i%2?1:-1,branch=[[x,y],[x+d*(18+noise(f+i)*13),y+14],[x+d*14,y+29],[x+d*33,y+43]];line(c,branch,'#ffdb70aa',3);line(c,branch,'#fff7c6',1.1);}
 });
 const orb=strip(64,64,(c,f)=>{
  c.translate(32,32);c.rotate(f/N*TAU);const gr=c.createRadialGradient(-3,-4,0,0,0,32);gr.addColorStop(0,'#fff6ff');gr.addColorStop(.3,'#e5b2ff');gr.addColorStop(.6,'#ac67dc');gr.addColorStop(.82,'#af73da64');gr.addColorStop(1,'#9652d300');c.fillStyle=gr;c.fillRect(-32,-32,64,64);c.strokeStyle='#f6d9ff';c.lineWidth=1.2;for(let i=0;i<3;i++){c.rotate(TAU/3);c.beginPath();c.ellipse(0,0,20,7,.6,0,TAU);c.stroke();}for(let i=0;i<5;i++){const a=i*TAU/5;c.fillStyle='#efd5ff';c.fillRect(Math.cos(a)*28-1,Math.sin(a)*28-1,2,2);}
 });
 cached={draw(c,kind,frame,x,y,w,h,alpha=1){const s={bolt,orb}[kind];c.save();c.globalAlpha*=alpha;c.drawImage(s.sheet,((frame%N)+N)%N*s.w,0,s.w,s.h,x,y,w,h);c.restore();}};return cached;
}
export function drawBoltGround(c,h,r){
 const active=h.age>=h.warn,charge=active?1:Math.max(0,h.age/h.warn),frame=Math.floor(h.age*17);
 const glow=c.createRadialGradient(0,0,0,0,0,r);
 glow.addColorStop(0,active?'#fff9d1eb':'#ffdf889d');
 glow.addColorStop(.42,active?'#ffd372a7':'#eea54273');
 glow.addColorStop(.78,active?'#ffd2664d':'#eea54237');
 glow.addColorStop(1,'#ffc55d00');
 c.save();c.globalAlpha=active?Math.max(.4,Math.min(1,(h.life-h.age)*10)):.32+.68*charge;
 c.fillStyle=glow;c.fillRect(-r,-r,2*r,2*r);
 c.lineCap='round';
 for(let i=0;i<(active?9:5);i++){
  const angle=i*2.4+noise(i+frame)*.7,rad=r*(.72+noise(i*7+frame)*.23),a=angle+.28;
  const branch=[[Math.cos(a)*rad*.12,Math.sin(a)*rad*.12],[Math.cos(angle)*rad*.4,Math.sin(angle)*rad*.4],
   [Math.cos(a)*rad*.68,Math.sin(a)*rad*.68],[Math.cos(angle)*rad,Math.sin(angle)*rad]];
  line(c,branch,active?'#ffe5a175':'#be782c80',3.4);
  line(c,branch,active?'#fff7d6':'#fff0b8ba',active?1.35:.95);
 }
 c.restore();
}
