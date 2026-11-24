import {SIDE_HERO_SIZE} from './hero-scale.js';
// Wind-up, release, follow-through. Keep the existing .43s delivery schedule;
// the letter travels only after the authored open-palm drawing appears.
export const LANGUAGE_THROW=Object.freeze({release:.18,flight:.25,duration:.5});
export const THROW_PALMS=Object.freeze({haru:[[139,165],[147,158],[185,145]],doyun:[[153,162],[151,158],[184,140]],narin:[[157,155],[163,149],[198,128]],soi:[[157,151],[165,144],[194,129]]});
export function languageThrowFrame(age){return age<.09?0:age<LANGUAGE_THROW.release-1e-9?1:age<.33?2:3;}
export function languageThrowPoint(id,p,frame=2,face=p.throwFace??(p.dir==='left'?-1:1)){
 const hand=(THROW_PALMS[id]||THROW_PALMS.haru)[Math.min(2,frame)],size=SIDE_HERO_SIZE*(p.small?.5:1);
 return{x:p.x+(hand[0]-128)*size/256*face,y:p.y+(hand[1]-244)*size/256};
}
