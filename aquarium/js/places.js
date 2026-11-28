// One ordered catalogue drives entrances, progression, Back and replay choices.
// Add future playable stages here; reached stages stay in replay maps.
export const PLACES=Object.freeze([
 {id:'aquarium',name:'수족관',playable:true,icon:'submarine',description:'작은 잠수함으로 바닷속 단서를 찾아요.'},
 {id:'art',record:'museum',name:'미술관',playable:true,icon:'painting',description:'미술관에서 사라진 색을 되찾아 주세요.'},
 {id:'history',name:'박물관',playable:true,icon:'hourglass',description:'타임머신을 타고 세 시대의 단서를 찾아요.'},
 {id:'exchange',name:'증권거래소',playable:true,icon:'chart',description:'시대의 흐름을 읽고 투자의 단서를 찾아요.'},
 {id:'temple',name:'신전',playable:true,icon:'temple',description:'신들의 시련을 지나 이타카로 돌아가요.'},
 {id:'robot',name:'로봇연구소',playable:true,icon:'robot',description:'부품을 모아 로봇을 고치고 단서를 찾아요.'},
 {id:'space',name:'우주정거장',playable:true,icon:'space',description:'우주를 유영하며 흩어진 관측 기록을 찾아요.'},
 {id:'writer',name:'동화작가의 방',playable:true,icon:'writer',description:'여섯 문학작품 속에서 이야기의 단서를 찾아요.'},
 {id:'language',name:'언어연구소',playable:true,icon:'language',description:'낱말을 완성해 아홉 가지 실험을 깨워요.'},
 {id:'newspaper',name:'신문사',playable:true,icon:'newspaper',description:'사진과 제목을 골라 오늘의 신문을 완성해요.'},
 {id:'dream',name:'꿈연구소',playable:true,icon:'dream',description:'바닥과 천장을 뒤집어 세 가지 꿈을 달려요.'},
 {id:'zoo',name:'동물원',playable:true,icon:'paw',description:'먹이를 던져 아홉 동물의 단서를 모아요.'},
 {id:'literature',name:'문학관',playable:true,icon:'literature',description:'아홉 세계 명작이 살아 움직이는 전시실을 둘러봐요.'},
 {id:'ai',name:'AI상상출력실',playable:true,icon:'ai',description:'특징을 스캔해 AI와 함께 원본처럼 그림을 생성해요.'},
 {id:'dessert',name:'디저트 공방',playable:true,icon:'dessert',description:'세 오븐의 초록불을 보고 디저트 아홉 개를 꺼내요.'},
 {id:'detective',name:'탐정사무소',playable:true,icon:'detective',description:'경비원의 시야를 피해 사라진 원고의 증거를 찾아요.'},
 {id:'monastery',name:'사찰',playable:true,icon:'lantern',description:'바람과 장애물을 지나 아홉 연등을 산사에 걸어요.'},
 {id:'photo',name:'사진관',playable:true,icon:'camera',description:'구도와 초점을 맞춰 특별한 순간 아홉 장을 찍어요.'},
 {id:'garden',name:'식물원',playable:true,icon:'garden',description:'히터와 환기창을 조절해 세 온실의 꽃을 키워요.'},
 {id:'datacenter',name:'데이터센터',playable:true,icon:'server',description:'분기 레버를 바꿔 자료를 목적지 서버로 보내요.'},
 {id:'cityhall',name:'시청',playable:true,icon:'cityhall',description:'시장으로서 여섯 안건을 결재하고 지지율에 따라 단서를 모아요.'},
 {id:'gym',name:'체육관',playable:true,icon:'gym',description:'던지는 방향을 보고 공을 피하며 아홉 단서를 모아요.'},
 {id:'cinema',name:'영화관',playable:true,icon:'cinema',description:'픽셀 영화의 제목을 맞히며 아홉 단서를 모아요.'},
 {id:'memory',name:'기억연구소',playable:true,icon:'memory',description:'그림을 기억해 달라진 곳을 찾고 단서를 모아요.'},
 {id:'pursuit',name:'국제수사본부',playable:true,icon:'pursuit',description:'그림 단서를 보고 세계의 도시를 찾아 범인을 추적해요.'},
 {id:'postal',name:'우체국',playable:true,icon:'postal',description:'마을지도를 기억하고 자전거로 편지를 배달해요.'},
 {id:'hospital',name:'동물병원',playable:true,icon:'hospital',description:'동물병원을 둘러보며 강아지, 고양이, 토끼를 세어요.'},
].map(Object.freeze));
export const placeId=id=>id==='museum'?'art':id;
export const placeInfo=id=>PLACES.find(p=>p.id===placeId(id))||PLACES[0];
export const previousPlaces=id=>PLACES.slice(0,Math.max(0,PLACES.findIndex(p=>p.id===placeId(id)))).filter(p=>p.playable);
export const nextPlace=id=>PLACES[PLACES.findIndex(p=>p.id===placeId(id))+1]?.id||null;
// Replaying a lower stage never lowers this high-water mark. Existing saves
// predate unlockedThrough, so recover visits from their per-stage records too.
export function unlockedPlace(journey={}){
 const index=id=>PLACES.findIndex(p=>p.id===placeId(id));
 let last=Math.max(0,index(journey.stage),index(journey.unlockedThrough));
 PLACES.forEach((p,i)=>{const record=journey[p.record||p.id];if(record&&['title','briefing','result'].includes(record.phase))last=Math.max(last,i);});
 return PLACES.slice(0,last+1).filter(p=>p.playable).at(-1).id;
}
export const replayPlaces=journey=>PLACES.slice(0,PLACES.findIndex(p=>p.id===unlockedPlace(journey))+1).filter(p=>p.playable);
const shapes={
 hospital:'<path d="M8 17V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12M8 14H5v18h26V14h-3M15 32v-8h6v8M14 10h8m-4-4v8"/>',
 postal:'<rect x="4" y="9" width="32" height="22" rx="3"/><path d="m5 11 15 11 15-11M5 29l10-9m20 9-10-9"/>',
 pursuit:'<circle cx="18" cy="21" r="13"/><path d="M6 17h24M6 25h24M18 8c-8 5-8 21 0 26 8-5 8-21 0-26M29 11l6-7m0 0v7m0-7h-7"/>',
 memory:'<rect x="5" y="6" width="27" height="26" rx="3"/><path d="m10 25 6-7 5 5m-11-12h13"/><circle cx="27" cy="26" r="6"/><path d="m31 31 5 5"/>',
 cinema:'<rect x="5" y="14" width="24" height="18" rx="3"/><circle cx="11" cy="9" r="5"/><circle cx="24" cy="9" r="5"/><path d="m29 20 8-4v15l-8-4M14 32v5m-6 0h14"/>',
 gym:'<circle cx="20" cy="20" r="16"/><path d="M5 16c10-5 20-3 30 7M11 7c-1 12 7 22 20 24M28 6c-7 6-9 17-6 30"/>',
 cityhall:'<path d="M7 35h26M10 35V15h20v20M8 15h24L20 8 8 15ZM20 8V3h8M15 20h2m6 0h2m-10 5h2m6 0h2m-8 10v-5h6v5"/>',
 server:'<rect x="8" y="4" width="24" height="32" rx="3"/><path d="M8 14h24M8 25h24M13 9h9M13 20h9M13 31h9"/><circle cx="27" cy="9" r="1"/><circle cx="27" cy="20" r="1"/><circle cx="27" cy="31" r="1"/>',
 garden:'<path d="M7 35h26M20 35V17M20 23C9 24 5 17 6 10c9 0 14 5 14 13Zm0-4C20 9 28 5 35 6c0 9-6 14-15 13Z"/>',
 lantern:'<path d="M20 4v5M13 9h14M11 13c-8 7-5 17 9 21 14-4 17-14 9-21-3 1-6 3-9 9-3-6-6-8-9-9Z"/><path d="M20 34v3M10 19c1 7 4 11 10 15 6-4 9-8 10-15M20 22v12"/>',
 detective:'<circle cx="17" cy="17" r="10"/><path d="m25 25 11 11M12 16h10M12 20h6"/>',
 dessert:'<path d="M5 13h30v22H5ZM4 8h32v5H4ZM10 19h20v10H10ZM11 4v3M20 3v4M29 4v3"/><path d="M12 22h16M12 26h16"/>',
 ai:'<path d="m5 23 6-14 12-5 12 12-4 16-14 4-12-13 18-19m-12 5 20 23M5 23l30-7"/><circle cx="11" cy="9" r="3"/><circle cx="23" cy="4" r="3"/><circle cx="31" cy="32" r="3"/><circle cx="17" cy="22" r="4"/>',
 paw:'<path d="M12 26c2-3 4-8 8-8s6 5 8 8c2 4 0 8-4 7l-4-1-4 1c-4 1-6-3-4-7Z"/><ellipse cx="8" cy="17" rx="3" ry="4" transform="rotate(-25 8 17)"/><ellipse cx="15" cy="10" rx="3" ry="4" transform="rotate(-12 15 10)"/><ellipse cx="25" cy="10" rx="3" ry="4" transform="rotate(12 25 10)"/><ellipse cx="32" cy="17" rx="3" ry="4" transform="rotate(25 32 17)"/>',
 jeep:'<path d="m6 20 5-10h18l5 10v13H6ZM11 20h18M16 10v10M24 10v10M3 27h34"/><circle cx="12" cy="32" r="4"/><circle cx="28" cy="32" r="4"/>',
 camera:'<rect x="4" y="11" width="32" height="23" rx="4"/><circle cx="20" cy="22" r="7"/>',
 literature:'<path d="M20 11C13 7 7 8 4 10v23c5-2 10-2 16 2 6-4 11-4 16-2V10c-3-2-9-3-16 1Zm0 0v24M9 16h6M9 22h6M25 16h6M25 22h6"/>',
 dream:'<path d="M29 5A15 15 0 1 0 35 28 14 14 0 0 1 29 5Z"/><path d="m11 6 1 3 3 1-3 1-1 3-1-3-3-1 3-1ZM32 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
 newspaper:'<path d="M7 5h24v29H9a4 4 0 0 1-4-4V13h5v17M31 13h5v17a4 4 0 0 1-4 4M14 11h12M14 23h12M14 28h12"/><rect x="14" y="15" width="12" height="5"/>',
 language:'<rect x="4" y="8" width="22" height="25" rx="3"/><path d="M9 15h9v11M23 4h13v24h-7M13 15v6l-4 5M29 10v10M28 15h6"/>',
 writer:'<path d="M5 33h30M9 33V20h22v13M13 20v-5h12v5M26 5c7-3 9 3 5 7l-12 9 4-12Z"/>',
 submarine:'<circle cx="20" cy="20" r="12"/><circle cx="20" cy="20" r="7"/><path d="M8 17H3v7h5M17 8V4h7v4M30 16h6v9h-6"/>',
 painting:'<rect x="5" y="7" width="30" height="26" rx="2"/><path d="M9 27l8-10 7 7 5-6 3 9ZM9 11h22"/><circle cx="27" cy="14" r="2"/>',
 hourglass:'<path d="M8 5h24M8 35h24M12 5v7l16 16v7M28 5v7L12 28v7M12 12h16M12 30h16"/>',
 chart:'<path d="M5 31h30M7 27V17h6v10M17 27V12h6v15M27 27V6h6v21M5 12l10-6 8 1 10-4"/>',
 temple:'<path d="m4 12 16-8 16 8ZM5 35h30M8 30h24M11 15v15M20 15v15M29 15v15"/>',
 space:'<circle cx="20" cy="20" r="8"/><path d="M12 14 3 10v20l9-4M28 14l9-4v20l-9-4M20 12V5M20 28v7"/>',
 robot:'<rect x="6" y="12" width="28" height="22" rx="5"/><path d="M20 12V5M14 27h12"/><circle cx="14" cy="20" r="2"/><circle cx="26" cy="20" r="2"/>'
};
export const placeIcon=id=>`<svg viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes[placeInfo(id).icon]}</svg>`;
