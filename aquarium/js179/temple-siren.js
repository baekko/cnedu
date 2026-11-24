// The same expanding semicircles are used for the painting and sound contact.
export const SIREN=Object.freeze({slowSeconds:1.5,speedRatio:.3,range:180,waveSpeed:95});
export function sirenWaveRadii(s){
 if(!s.active)return [];
 return [0,50,100].map(offset=>((s.age-.85)*SIREN.waveSpeed+offset)%SIREN.range).filter(r=>r>=8);
}
export function sirenWaveContact(s,p,radius=15){
 if(!s.active||(p.x-s.x)*s.side>0)return false;
 const d=Math.hypot(p.x-s.x,p.z-s.z);
 return sirenWaveRadii(s).some(r=>Math.abs(d-r)<=radius+2.5);
}
// Only the close encounter with the singing figure can cost health.
// The shoreline and the larger sound/pull area are not damage hitboxes.
export function sirenCaptureContact(s,p){
 return s.active&&((p.x-s.x)/38)**2+((p.z-s.z)/34)**2<=1;
}
