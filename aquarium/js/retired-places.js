const retiredPlaces=new Set(['science','conservation']);
export const isRetiredPlace=id=>retiredPlaces.has(id);
const withdrawnResearchPlaces=new Set(['excavation','cartography']);
export const isWithdrawnResearchPlace=id=>withdrawnResearchPlaces.has(id);

// Resume at the last available place when a save points to a retired one.
export function withoutRetiredPlaces(data){
 if(!data||typeof data!=='object'||Array.isArray(data))return data;
 // The next step after 데이터센터 is 시청 now. Keep later unlocks and
 // records when an older save has already advanced beyond the removed game.
 if(data.stage==='conservation'||data.unlockedThrough==='conservation'||Object.hasOwn(data,'conservation')){
  const next={...data};
  delete next.conservation;
  if(next.stage==='conservation'){
   next.stage='cityhall';
   next.phase='briefing';
  }
  if(next.unlockedThrough==='conservation')next.unlockedThrough='cityhall';
  data=next;
 }
 const withdrawnStage=isWithdrawnResearchPlace(data.stage);
 if(withdrawnStage||isWithdrawnResearchPlace(data.unlockedThrough)){
  data={...data,stage:withdrawnStage?'memory':data.stage,unlockedThrough:'memory'};
 }
 const legacyGym=Object.hasOwn(data,'gym')&&data.gym?.edition!=='dodgeball';
 const legacyCinema=Object.hasOwn(data,'cinema')&&data.cinema?.edition!=='moviequiz';
 const retiredStage=isRetiredPlace(data.stage)||(data.stage==='gym'&&legacyGym)||(data.stage==='cinema'&&data.cinema?.edition!=='moviequiz');
 const hasRetiredRecord=[...retiredPlaces].some(id=>Object.hasOwn(data,id));
 const retiredUnlock=isRetiredPlace(data.unlockedThrough)||(data.unlockedThrough==='gym'&&legacyGym)||(data.unlockedThrough==='cinema'&&data.cinema?.edition!=='moviequiz');
 if(!retiredStage&&!hasRetiredRecord&&!retiredUnlock&&!legacyGym&&!legacyCinema)return data;
 const next={...data,unlockedThrough:'cityhall'};
 for(const id of retiredPlaces)delete next[id];
 if(legacyGym)delete next.gym;
 if(legacyCinema)delete next.cinema;
 if(data.gym?.edition==='dodgeball'&&!retiredStage)next.unlockedThrough='gym';
 if(data.cinema?.edition==='moviequiz'&&!retiredStage)next.unlockedThrough='cinema';
 if(retiredStage){
  next.stage='cityhall';next.phase='briefing';
  if(!next.cityhall)next.cityhall={phase:'title',clues:[]};
 }
 return next;
}
