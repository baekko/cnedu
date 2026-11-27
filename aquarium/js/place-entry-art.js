// Each place has one entrance object and a color palette.
const places={
 aquarium:['aquarium-v8/title-submarine.webp','#086274','#d7f1f3','#7dc9d6'],
 art:['entrance-symbols/art.webp','#795363','#f5e6e9','#dca9b7'],
 history:['history-v26/machine-idle.webp','#555886','#ebe9f8','#b6b3e4'],
 exchange:['exchange/desk-v20.webp','#346755','#e2f0e7','#a9ceb5'],
 temple:['temple/entrance.webp','#315d76','#e5f3fb','#99c9da'],
 robot:['robot/station.webp','#276b68','#e0f3ed','#a0d8ca'],
 space:['space/station.webp','#455588','#e8edfb','#aabce8'],
 writer:['writer/entrance-v37.webp','#685239','#fbf1db','#e3cb91'],
 language:['entrance-symbols/language.webp','#416e54','#e8f4e9','#b3d4ad'],
 newspaper:['entrance-symbols/newspaper.webp','#75503e','#faecdd','#eac1a3'],
 dream:['dream-v51/alarm-clock.webp','#6b5785','#f2e9fa','#ceb6e6'],
 zoo:['zoo/entrance.webp','#38693f','#e7f4df','#b1d8a0'],
 literature:['literature/entry.webp','#72543e','#f7eedc','#ddc4a0'],
 ai:['ai/atelier-press.webp','#34646e','#e2f2ed','#a5d2c9'],
 dessert:['entrance-symbols/dessert.webp','#8d514b','#fce9df','#edb5a4'],
 detective:['detective/entrance.webp','#71573d','#f5ebd7','#d8bf9e'],
 monastery:['entrance-v129/monastery.webp','#77576a','#f5e8f0','#d8b0ce'],
 photo:['entrance-v129/photo.webp','#795943','#f7eddd','#d8bd9a'],
 garden:['entrance-v129/garden.webp','#487246','#e9f6e4','#a9d6a2'],
 datacenter:['entrance-v129/datacenter.webp','#2f6671','#e1f3f4','#a5cfd6'],
 conservation:['entrance-v129/conservation.webp','#785637','#f8edd7','#e4c391'],
 cityhall:['cityhall/entrance-v138.webp','#40684f','#e2f0e8','#afcfb9'],
 gym:['gym-v161/entrance.webp','#934b41','#faece0','#e9b29d'],
 cinema:['cinema/projector.webp','#655175','#f0e8f3','#cfb4db'],
 memory:['memory-lab/album.webp','#766046','#fbf0db','#e3cca5'],
 pursuit:['pursuit/handcuffs.webp','#2c6170','#e2f2f4','#a6cdd6'],
 postal:['postal/office.webp','#8b493f','#fbefe1','#d9a492'],
};

export function placeEntryArt(place){
 const id=typeof place==='string'?place:place?.id;
 const [object,ink,paper,tone]=Object.hasOwn(places,id)?places[id]:[null,'#27615f','#e7f4f0','#a9d1c8'];
 return {object:object?'./assets/'+object:null,ink,paper,tone};
}
