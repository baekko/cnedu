import {routeZ} from './temple-core.js?v268';
// All terrain is anchored to the same world coordinate. Borders are joined by
// illustrated terrain, not by a scene fade or a camera reset.
function feather(image,top=0,bottom=0){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const c=canvas.getContext('2d');c.drawImage(image,0,0);
 c.globalCompositeOperation='destination-in';const g=c.createLinearGradient(0,0,0,canvas.height);
 g.addColorStop(0,top?'#0000':'#000');if(top)g.addColorStop(top,'#000');
 if(bottom)g.addColorStop(1-bottom,'#000');g.addColorStop(1,bottom?'#0000':'#000');
 c.fillStyle=g;c.fillRect(0,0,canvas.width,canvas.height);return canvas;
}
export class TempleWorld{
 constructor(images){this.images=images;this.sea=feather(images['sea.webp'],0,.13);this.ithaca=feather(images['ithaca.webp'],0,.055);this.garden=feather(images['temple-garden.webp'],.12,.1);this.coast=feather(images['forest-coast.webp'],.1,.12);}
 draw(c,Y){
  c.fillStyle='#178d9a';c.fillRect(0,0,390,500);
  const cover=(im,from,to)=>{if(Y(from)<0||Y(to)>500)return;const h=to-from,w=h*im.width/im.height;c.drawImage(im,(390-w)/2,Y(to),w,h);};
  for(const [name,a,b] of [['temple',-120,850],['forest',850,1850]]){const from=routeZ(a),to=routeZ(b);
   c.save();c.beginPath();c.rect(0,Y(to),390,to-from);c.clip();cover(this.images[name+'.webp'],from,to);c.restore();
  }
  // Overlap repeated water tiles by their feathered edge to avoid a horizontal
  // cut every screenful. Rock, foam and caustics stay fixed in world space.
  c.save();c.beginPath();c.rect(0,Y(routeZ(5700)),390,routeZ(5700-1850));c.clip();
  const height=390*this.sea.height/this.sea.width;
  for(let z=routeZ(1850);z<routeZ(5700);z+=height-76){if(Y(z)<0||Y(z+height)>500)continue;c.drawImage(this.sea,0,Y(z+height),390,height);}
  c.restore();
  cover(this.ithaca,routeZ(4690),routeZ(5640));
  cover(this.garden,routeZ(540),routeZ(1200));
  cover(this.coast,routeZ(1505),routeZ(2090));
  // The pier extends from the path into the same shoreline water.
  const dock=Y(routeZ(1850));if(dock>-80&&dock<580){c.fillStyle='#9c693f';c.fillRect(140,dock-56,110,85);for(let i=0;i<9;i++){c.fillStyle=i%2?'#c8995c':'#bb874d';c.fillRect(143,dock-54+i*9,104,7);}c.fillStyle='#745030';c.fillRect(137,dock-60,6,92);c.fillRect(247,dock-60,6,92);}
 }
}
