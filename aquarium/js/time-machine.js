import {MACHINE_TIMING as T} from './history-core.js?v307';
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
export function machinePose(game){
 const t=game.phaseTime||0;
 if(game.phase==='boarding')return {
  stairs:1-ease((t-T.seat)/T.fold),door:ease((t-T.seat-T.fold)/T.close),
  power:ease((t-T.seat-T.fold-T.close)/T.power),seated:t+1e-9>=T.seat,
  boarding:clamp(t/T.seat),exiting:0
 };
 if(game.phase==='travel')return {stairs:0,door:1,power:1,seated:true};
 if(game.phase==='docked')return {stairs:0,door:1,power:0,seated:true};
 if(game.phase==='disembarking')return {stairs:ease((t-T.open)/T.unfold),door:1-ease(t/T.open),power:0,seated:t+1e-9<T.open+T.unfold,exiting:ease((t-T.open-T.unfold)/T.exit)};
 return {stairs:1,door:0,power:0,seated:false};
}
export function machineSize(game){return game.eraIndex<0?154:146;}
export function machineWalker(game){
 const pose=machinePose(game),size=machineSize(game),seat={x:game.machine.x-size*.006,y:game.machine.y-size*.27};
 if(game.phase==='boarding'&&!pose.seated){const start=game.departure||game.player,p=ease(pose.boarding);return {...game.player,x:start.x+(seat.x-start.x)*p,y:start.y+(seat.y-start.y)*p,dir:'up',moving:true,walk:game.phaseTime};}
 if(game.phase==='disembarking'&&!pose.seated){const p=pose.exiting,target=game.eraIndex<0?321:463;return {...game.player,x:seat.x+(game.machine.x-seat.x)*p,y:seat.y+(target-seat.y)*p,dir:'down',moving:p<1,walk:game.phaseTime};}
 return null;
}
function stairs(c,amount){
 if(amount<.015)return;
 c.save();c.transform(1,.18,-.39,amount,200,350);
 const g=c.createLinearGradient(0,0,75,0);g.addColorStop(0,'#806032');g.addColorStop(.25,'#e6c98b');g.addColorStop(.65,'#c8ae77');g.addColorStop(1,'#6a4b26');
 c.fillStyle=g;c.strokeStyle='#66472b';c.lineWidth=2;c.beginPath();c.roundRect(-4,0,87,112,5);c.fill();c.stroke();
 for(let i=0;i<7;i++){const y=i*15+5;c.fillStyle=i%2?'#d4c5a6':'#c2b393';c.fillRect(5,y,66,11);c.strokeStyle='#f0ddaf';c.lineWidth=1.5;c.beginPath();c.moveTo(5,y);c.lineTo(71,y);c.stroke();c.strokeStyle='#8c7654';c.beginPath();c.moveTo(5,y+12);c.lineTo(71,y+12);c.stroke();}
 for(const x of [0,76]){c.fillStyle='#b58c47';c.fillRect(x,2,4,105);for(const y of [14,50,91]){c.fillStyle='#51908c';c.fillRect(x-2,y,8,12);c.strokeStyle='#d7b267';c.strokeRect(x-2,y,8,12);}}
 c.restore();
}
function aperture(c){c.beginPath();c.moveTo(177,337);c.bezierCurveTo(142,309,151,224,188,185);c.bezierCurveTo(220,151,278,152,307,188);c.bezierCurveTo(341,225,329,298,290,334);c.quadraticCurveTo(240,366,177,337);c.closePath();}
function door(c,amount){
 if(amount<.001)return;
 c.save();aperture(c);c.clip();
 for(const side of [-1,1]){
  c.save();c.translate(side*(1-amount)*110,0);
  const x=side<0?130:242,g=c.createLinearGradient(x,155,x+115,350);g.addColorStop(0,'#b5e3dc96');g.addColorStop(.48,'#346e7399');g.addColorStop(.7,'#9edbd59c');g.addColorStop(1,'#183b51ba');
  c.fillStyle=g;c.fillRect(x,150,112,215);c.strokeStyle='#c0984d';c.lineWidth=5;c.strokeRect(x+2,153,108,207);
  c.strokeStyle='#ffe3a3';c.lineWidth=1.4;c.strokeRect(x+5,155,102,202);
  c.strokeStyle='#dcfff961';c.lineWidth=7;c.beginPath();c.moveTo(x+14,190);c.lineTo(x+84,300);c.stroke();
  c.fillStyle='#e0b764';c.beginPath();c.roundRect(side<0?232:246,265,4,20,2);c.fill();c.restore();
 }
 c.restore();
}
// One assembled machine for the room, travel, entrance and briefing.
// The body artwork stays unchanged while separate mechanical pieces animate.
export function drawTimeMachine(c,images,character,{x=0,y=0,size=146,pose={stairs:1,door:0,power:0,seated:false},time=0}={}){
 c.save();c.translate(x,y);c.scale(size/512,size/512);c.translate(-256,-466);
 stairs(c,pose.stairs);
 c.drawImage(images['machine-idle.webp'],0,0,512,512);
 // Illuminate the original painted glass and engine housings, without adding coils.
 if(pose.power>0&&images['machine-powered.webp']){c.save();c.globalAlpha=clamp(pose.power);c.drawImage(images['machine-powered.webp'],0,0,512,512);c.restore();}
 if(pose.seated&&character){
  // Front-facing hips align with the cushion; both shoes remain above the sill.
  // The cabin mask also keeps hair/feet behind the machine's opening frame.
  const id=['haru','doyun','narin','soi'].indexOf(character.id),i=Math.max(0,id);
  c.save();aperture(c);c.clip();c.drawImage(images['seated-heroes.webp'],(i%2)*256,Math.floor(i/2)*256,256,256,163,158,180,180);c.restore();
 }
 door(c,pose.door);c.restore();
}
