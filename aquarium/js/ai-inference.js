// A compact conditional decoder fit to original game art. The hidden activations
// and the learned output projection predict the draft pixels, not a thumbnail ID.
export const DECODER_BODY=['penguin','cat','whale','rabbit','fox','turtle'];
export const DECODER_POWER=['rocket','octopus','wing','wheel','balloon','umbrella'];
export const DECODER_ENV=[null,'snow','music','bubble','star'];
export function features(w){
 const b=DECODER_BODY.indexOf(w.body),p=DECODER_POWER.indexOf(w.part),e=DECODER_ENV.indexOf(w.ink||null);
 if(b<0||p<0||e<0)throw Error('Unknown studio condition');
 const x=new Float32Array(30),l=w.powerLevel??1,k=w.inkLevel??1;
 x[b]=x[6+p]=x[12+e]=1;x[17]=l-1;x[18]=e?k-1:0;x[19+p]=x[17];x[25+e]=x[18];return x;
}
export class ImageDecoder{
 constructor(buf){const d=new DataView(buf);if(d.getUint32(0)!==0x50544231)throw Error('Invalid studio decoder');this.n=d.getUint16(4,true);this.h=d.getUint16(6,true);this.size=d.getUint16(8,true);this.f=d.getUint16(10,true);const width=this.size*this.size*3;let at=12;
  const take=m=>{const v=new Float32Array(buf,at,m);at+=m*4;return v;};
  this.w=take(this.n*this.h);this.bias=take(this.h);this.scale=take(width);this.q=new Int8Array(buf,at,this.f*width);this.cache=new Map();
 }
 predict(work){const id=[work.body,work.part,work.ink,work.powerLevel??1,work.inkLevel??1].join('|');if(this.cache.has(id))return this.cache.get(id);
  const x=features(work),hidden=new Float32Array(this.bias);for(let i=0;i<x.length;i++)if(x[i])for(let j=0;j<this.h;j++)hidden[j]+=x[i]*this.w[i*this.h+j];
  const a=new Float32Array(this.f);a[0]=1;a.set(x,1);for(let j=0;j<this.h;j++)a[this.n+1+j]=Math.tanh(hidden[j]);
  const n=this.scale.length,out=new Float32Array(n);for(let i=0;i<a.length;i++)if(a[i]){const off=i*n;for(let j=0;j<n;j++)out[j]+=a[i]*this.q[off+j];}
  const rgb=new Uint8ClampedArray(n);for(let j=0;j<n;j++)rgb[j]=255*out[j]*this.scale[j];
  if(this.cache.size>=32)this.cache.delete(this.cache.keys().next().value);this.cache.set(id,rgb);return rgb;
 }
}
export const POWER_WORDS={rocket:['작은 불꽃','보통 불꽃','강한 불꽃'],octopus:['짧은 다리','보통 다리','긴 다리'],wing:['짧은 날개','보통 날개','긴 날개'],wheel:['작은 바퀴','보통 바퀴','큰 바퀴'],balloon:['작은 풍선','보통 풍선','큰 풍선'],umbrella:['좁은 우산','보통 우산','넓은 우산']};
export const ENV_WORDS=['은은하게','보통','풍성하게'];
export const levelName=(w,slot)=>slot==='part'?POWER_WORDS[w.part][w.powerLevel??1]:ENV_WORDS[w.inkLevel??1];
