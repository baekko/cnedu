// Each arrival pairs the game's own setting with an object from that place.
// The small WebP uses the same artwork and keeps the illustrated map light.
const scenes={
 aquarium:['aquarium-v89/water.webp','aquarium-v8/submarine.webp','50% 40%','#086274','#d7f1f3','#7dc9d6'],
 art:['museum-v19/wall-v20.webp','museum/paintings.webp','50% 38%','#795363','#f5e6e9','#dca9b7'],
 history:['history-v183/museum.webp','history-v26/machine-idle.webp','50% 16%','#555886','#ebe9f8','#b6b3e4'],
 exchange:['exchange/room-v22.webp','exchange/desk-v20.webp','50% 16%','#346755','#e2f0e7','#a9ceb5'],
 temple:['temple/sea.webp','temple/entrance.webp','50% 53%','#315d76','#e5f3fb','#99c9da'],
 robot:['robot/room-modern-v43.webp','robot/station.webp','50% 12%','#276b68','#e0f3ed','#a0d8ca'],
 space:['space/cosmos.webp','space/station.webp','50% 63%','#455588','#e8edfb','#aabce8'],
 writer:['writer/oz-level-v127.webp','writer/entrance-v37.webp','30% 78%','#685239','#fbf1db','#e3cb91'],
 language:['language-v47/room-0.webp',null,'38% 20%','#416e54','#e8f4e9','#b3d4ad'],
 newspaper:['newspaper-v183/room.webp','newspaper/photos.webp','50% 13%','#75503e','#faecdd','#eac1a3'],
 dream:['dream-v51/sky-street.webp','dream-v51/alarm-clock.webp','55% 40%','#6b5785','#f2e9fa','#ceb6e6'],
 zoo:['zoo-feed/world-panorama-v64.webp','zoo/entrance.webp','28% 49%','#38693f','#e7f4df','#b1d8a0'],
 literature:['literature/scene-0.webp','literature/entry.webp','50% 12%','#72543e','#f7eedc','#ddc4a0'],
 ai:['ai/atelier-room.webp','ai/atelier-press.webp','50% 12%','#34646e','#e2f2ed','#a5d2c9'],
 dessert:['dessert/room-v181.webp','dessert/ovens.webp','50% 18%','#8d514b','#fce9df','#edb5a4'],
 detective:['detective/study.webp','detective/entrance.webp','50% 12%','#71573d','#f5ebd7','#d8bf9e'],
 monastery:['monastery-v111/scene-entrance.webp','entrance-v129/monastery.webp','42% 38%','#77576a','#f5e8f0','#d8b0ce'],
 photo:['photo-v182/room0.webp','entrance-v129/photo.webp','50% 21%','#795943','#f7eddd','#d8bd9a'],
 garden:['garden-v123/room0.webp','garden-v123/flower-open.webp','50% 12%','#487246','#e9f6e4','#a9d6a2'],
 datacenter:['datacenter-v128/room.webp','entrance-v129/datacenter.webp','50% 15%','#2f6671','#e1f3f4','#a5cfd6'],
 conservation:['conservation-v128/room.webp','entrance-v129/conservation.webp','50% 14%','#785637','#f8edd7','#e4c391'],
 cityhall:['cityhall/room-v141.webp','cityhall/entrance-v138.webp','50% 15%','#40684f','#e2f0e8','#afcfb9'],
 gym:['gym-v184/room.webp','gym-v161/entrance.webp','50% 13%','#934b41','#faece0','#e9b29d'],
 cinema:['cinema-v167/auditorium.webp','cinema/projector.webp','50% 40%','#655175','#f0e8f3','#cfb4db'],
 memory:[null,'memory-lab/album.webp','50% 50%','#766046','#fbf0db','#e3cca5'],
 pursuit:[null,'pursuit/entrance.webp','50% 50%','#2c6170','#e2f2f4','#a6cdd6'],
};
const assets='./assets/';
const entries=Object.freeze(Object.fromEntries(Object.entries(scenes).map(([id,[image,object,position,ink,paper,tone]])=>[
 id,Object.freeze({image:image?assets+image:null,object:object?assets+object:null,position,ink,paper,tone,
  thumbnail:assets+'place-passports-v246/'+id+'.webp',thumbnailPosition:'50% 50%'}),
])));
const fallback=Object.freeze({image:null,object:null,position:'50% 50%',ink:'#27615f',paper:'#e7f4f0',tone:'#a9d1c8',thumbnail:null,thumbnailPosition:'50% 50%'});

export function placeEntryArt(place){
 const id=typeof place==='string'?place:place?.id;
 return Object.hasOwn(entries,id)?entries[id]:fallback;
}
