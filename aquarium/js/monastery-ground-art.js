// The continuous landscape and the walking plane are separate rendering layers.
// Reuse the original painted stone material at native horizontal resolution;
// never bend scenery or place the feet on the vertical coping/foundation.
export function levelMonasteryPanorama(source){
 const w=source.naturalWidth||source.width,h=source.naturalHeight||source.height;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const c=canvas.getContext('2d',{alpha:false}),scale=h/724,back=620*scale,front=677*scale,bottom=693*scale;
 c.drawImage(source,0,0);
 // A common tread and coping course run through the whole world, independently
 // of lantern boundaries. Material period is deliberately unrelated to 2100px.
 const sx=180/6516*w,tile=1792/6516*w;
 for(let x=0;x<w;x+=tile){
  const sw=Math.min(tile,w-x);
  c.drawImage(source,sx,634*scale,sw,18*scale,x,back,sw,front-back);
  c.drawImage(source,sx,652*scale,sw,14*scale,x,front,sw,bottom-front);
 }
 return canvas;
}

export function drawMonasteryBridgeDeck(c,image,width,height){
 const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,back=382/724*ih,front=430/724*ih;
 const top=-421/724*height,bottom=top+height;
 c.drawImage(image,0,0,iw,back,-width/2,top,width,-24-top);
 c.drawImage(image,0,back,iw,front-back,-width/2,-24,width,50);
 c.drawImage(image,0,front,iw,ih-front,-width/2,26,width,bottom-26);
}
