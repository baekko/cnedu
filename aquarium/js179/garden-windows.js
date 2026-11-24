export function windowQuad(window,amount){
 const u=Math.max(0,Math.min(1,amount)),t=u*u*(3-2*u);
 return window.closed.map((p,i)=>p.map((v,j)=>v+(window.open[i][j]-v)*t));
}
function projection(q,u,v){
 const [a,b,c,d]=q,dx1=b[0]-c[0],dx2=d[0]-c[0],dx3=a[0]-b[0]+c[0]-d[0],dy1=b[1]-c[1],dy2=d[1]-c[1],dy3=a[1]-b[1]+c[1]-d[1],den=dx1*dy2-dx2*dy1;
 if(Math.abs(den)<.001)return null;
 const g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den,z=g*u+h*v+1;
 return [((b[0]-a[0]+g*b[0])*u+(d[0]-a[0]+h*d[0])*v+a[0])/z,((b[1]-a[1]+g*b[1])*u+(d[1]-a[1]+h*d[1])*v+a[1])/z];
}
function triangle(c,image,s,d){
 const [a,b,e]=s,[p,q,r]=d,den=a[0]*(b[1]-e[1])+b[0]*(e[1]-a[1])+e[0]*(a[1]-b[1]);if(Math.abs(den)<.001)return;
 const coefficient=(values)=>[(values[0]*(b[1]-e[1])+values[1]*(e[1]-a[1])+values[2]*(a[1]-b[1]))/den,(values[0]*(e[0]-b[0])+values[1]*(a[0]-e[0])+values[2]*(b[0]-a[0]))/den,(values[0]*(b[0]*e[1]-e[0]*b[1])+values[1]*(e[0]*a[1]-a[0]*e[1])+values[2]*(a[0]*b[1]-b[0]*a[1]))/den];
 const x=coefficient([p[0],q[0],r[0]]),y=coefficient([p[1],q[1],r[1]]);
 c.save();c.beginPath();c.moveTo(...p);c.lineTo(...q);c.lineTo(...r);c.closePath();c.clip();c.transform(x[0],y[0],x[1],y[1],x[2],y[2]);c.drawImage(image,0,0);c.restore();
}
export function paintWindowLeaf(c,image,quad){
 if(Math.abs(quad[0][0]-quad[1][0])<.7)return;
 c.save();c.beginPath();quad.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.clip();
 const cols=3,rows=8;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const uv=[[col/cols,row/rows],[(col+1)/cols,row/rows],[(col+1)/cols,(row+1)/rows],[col/cols,(row+1)/rows]],d=uv.map(([u,v])=>projection(quad,u,v));if(d.some(p=>!p))continue;
  const s=uv.map(([u,v])=>[u*image.width,v*image.height]);triangle(c,image,[s[0],s[1],s[2]],[d[0],d[1],d[2]]);triangle(c,image,[s[0],s[2],s[3]],[d[0],d[2],d[3]]);
 }
 c.restore();
}
export function gardenWindowBackground(renderer,amount){
 if(amount<=0)return renderer.images.room0;
 const key=Math.round(amount*30);if(key===0)return renderer.images.room0;if(renderer.windowFrame?.key===key)return renderer.windowFrame.canvas;
 const meta=renderer.images.windows,canvas=document.createElement('canvas');canvas.width=meta.size[0];canvas.height=meta.size[1];const c=canvas.getContext('2d');
 c.drawImage(renderer.images.windowBackplate,0,0);
 for(const w of meta.windows)paintWindowLeaf(c,renderer.images['window-'+w.key],windowQuad(w,key/30));
 renderer.windowFrame={key,canvas};return canvas;
}
