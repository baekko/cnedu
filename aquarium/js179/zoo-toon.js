// Illustration treatment for existing zoo sprite pixels. Geometry is immutable:
// source dimensions, frame placement, every alpha byte and all receiving anchors
// stay unchanged. Process animal atlases only; backgrounds/props remain separate.
export const ZOO_TOON_STYLE=Object.freeze({blurAt384:3,outlineAt384:4.5,luminanceSteps:5,saturation:1.1,shadowLift:.045});
const cache=new WeakMap(),clamp=(n,a=0,b=255)=>Math.max(a,Math.min(b,n));
const smooth=n=>n*n*(3-2*n);
function canvas(width,height){const c=document.createElement('canvas');c.width=width;c.height=height;return c;}
export function stylizeZooImage(image,{frameSize=384}={}){
 if(cache.get(image)?.has(frameSize))return cache.get(image).get(frameSize);
 const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
 if(!(width>0&&height>0))throw Error('동물 그림이 아직 준비되지 않았어요');
 const result=canvas(width,height),ctx=result.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const original=ctx.getImageData(0,0,width,height),src=original.data;
 const soft=canvas(width,height),sc=soft.getContext('2d',{willReadFrequently:true}),factor=frameSize/384;
 sc.filter=`blur(${Math.max(.8,ZOO_TOON_STYLE.blurAt384*factor)}px)`;sc.drawImage(image,0,0);sc.filter='none';
 const painted=sc.getImageData(0,0,width,height),dst=painted.data,edge=Math.max(1,Math.round(ZOO_TOON_STYLE.outlineAt384*factor));
 // Reuse the native blur only for low-frequency colour. Restoring the original
 // alpha avoids texture filtering shifting a mouth, hand, foot or waterline.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,a=src[i+3];dst[i+3]=a;if(!a){dst[i]=dst[i+1]=dst[i+2]=0;continue;}
  let r=dst[i],g=dst[i+1],b=dst[i+2];
  // Recover decisive eyes, lips and stripe boundaries while averaging away
  // fine fur/skin grain; broad anatomy is never inferred or redrawn.
  const difference=Math.max(Math.abs(src[i]-r),Math.abs(src[i+1]-g),Math.abs(src[i+2]-b)),detail=clamp((difference-24)/34,0,1)*.48;
  r=r*(1-detail)+src[i]*detail;g=g*(1-detail)+src[i+1]*detail;b=b*(1-detail)+src[i+2]*detail;
  let lum=.2126*r+.7152*g+.0722*b;
  const unit=255/ZOO_TOON_STYLE.luminanceSteps,band=lum/unit,lo=Math.floor(band),f=band-lo;
  // The rounded tonal transition is deliberate: flat painted planes without
  // the brittle colour banding of a hard posterize filter.
  const q=(lo+smooth(clamp((f-.2)/.6,0,1)))*unit;
  const lifted=clamp(q+255*ZOO_TOON_STYLE.shadowLift*(1-lum/255)),ratio=lifted/Math.max(12,lum);
  r=clamp(r*ratio);g=clamp(g*ratio);b=clamp(b*ratio);
  const middle=.2126*r+.7152*g+.0722*b,s=ZOO_TOON_STYLE.saturation;
  r=middle+(r-middle)*s;g=middle+(g-middle)*s;b=middle+(b-middle)*s;
  // A gentle cream light / indigo-brown shadow palette joins the illustrated
  // room and the shared dark-outlined player without changing an animal's hue.
  const warm=.018*lifted/255;r=r*(1-warm)+245*warm;g=g*(1-warm)+224*warm;b=b*(1-warm)+185*warm;
  const originalLum=.2126*src[i]+.7152*src[i+1]+.0722*src[i+2];
  if(originalLum<30&&lum>45){r=r*.48+src[i]*.52;g=g*.48+src[i+1]*.52;b=b*.48+src[i+2]*.52;}
  let outline=0;
  if(a>135){
   const xm=Math.max(0,x-edge),xp=Math.min(width-1,x+edge),ym=Math.max(0,y-edge),yp=Math.min(height-1,y+edge);
   const minA=Math.min(src[(y*width+xm)*4+3],src[(y*width+xp)*4+3],src[(ym*width+x)*4+3],src[(yp*width+x)*4+3]);
   outline=clamp((a-minA-35)/150,0,1)*.68;
  }
  const inkLum=Math.max(27,lum*.31),inkR=inkLum*1.05,inkG=inkLum*.91,inkB=inkLum*.94;
  dst[i]=clamp(r*(1-outline)+inkR*outline);dst[i+1]=clamp(g*(1-outline)+inkG*outline);dst[i+2]=clamp(b*(1-outline)+inkB*outline);
 }
 // Full byte-by-byte assertion is cheap relative to atlas preparation and is a
 // useful invariant for future tuning. This helper never changes catch geometry.
 for(let i=3;i<src.length;i+=4)if(dst[i]!==src[i])throw Error('동물 그림의 투명도 범위가 달라졌어요');
 ctx.putImageData(painted,0,0);soft.width=soft.height=1;
 Object.defineProperty(result,'zooStyle',{value:Object.freeze({width,height,alphaIdentical:true,alphaPixelsChecked:width*height,frameSize,style:ZOO_TOON_STYLE}),enumerable:false});
 if(!cache.has(image))cache.set(image,new Map());cache.get(image).set(frameSize,result);return result;
}
