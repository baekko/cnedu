const retiredPlaces=new Set(['science']);
export const isRetiredPlace=id=>retiredPlaces.has(id);
const withdrawnResearchPlaces=new Set(['excavation','cartography']);
export const isWithdrawnResearchPlace=id=>withdrawnResearchPlaces.has(id);

// Resume at the last available place when a save points to a retired one.
export function withoutRetiredPlaces(data){
 if(!data||typeof data!=='object'||Array.isArray(data))return data;
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
