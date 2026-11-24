import {CINEMA_MOVIES179} from './cinema-movies179.js?v204-final40';
import {CINEMA_HD_MAP,CINEMA_ASSETS178} from './cinema-assets178.js?v178';
import {CINEMA_STORY_ASSETS} from './cinema-assets177.js?v178';
// Fixed paintings with film-specific finite action sheets at native detail.
const rows=[
 [
  "inception",
  "인셉션",
  "scifi",
  "dream",
  "다른 사람의 꿈속으로 들어가는 팀이 생각 하나를 심으려 해요.",
  "중력이 사라진 호텔 복도에서 두 사람이 공중에 떠서 몸싸움을 했어요.",
  7
 ],
 [
  "titanic",
  "타이타닉",
  "classic",
  "deck",
  "잭과 로즈는 첫 항해에 나선 거대한 여객선에서 만나요.",
  "여객선의 맨 앞 뱃머리에서 두 사람이 바다를 향해 팔을 펼쳤어요.",
  6
 ],
 [
  "jurassic",
  "쥬라기 공원",
  "adventure",
  "chase",
  "과학자들이 되살린 공룡들을 섬의 공원에서 공개해요.",
  "두 아이가 차 뒤로 달아나자 쫓아오던 티라노사우루스가 급히 멈춰 포효했어요.",
  8
 ],
 [
  "matrix",
  "매트릭스",
  "scifi",
  "dodge",
  "눈앞의 세상이 컴퓨터가 만든 가상현실이라는 비밀을 알게 돼요.",
  "검은 코트와 선글라스를 착용한 도윤이 허리를 뒤로 굽혀 탄환을 피했어요.",
  6
 ],
 [
  "backfuture",
  "백 투 더 퓨처",
  "scifi",
  "timecar",
  "소년과 과학자가 자동차 타임머신으로 과거와 미래를 오가요.",
  "시계탑 앞에서 자동차 타임머신이 불꽃 자국을 남기며 달렸어요.",
  6
 ],
 [
  "ghostbusters",
  "고스트버스터즈",
  "adventure",
  "capture",
  "도시의 유령 소동을 해결하는 유령 퇴치 팀의 이야기예요.",
  "유령 퇴치 장비에서 나온 빛줄기로 유령을 붙잡았어요.",
  6
 ],
 [
  "indiana",
  "인디아나 존스",
  "adventure",
  "relic",
  "고고학 교수가 위험한 유적에서 보물을 찾아 모험해요.",
  "모자를 쓴 탐험가가 유적의 황금 우상을 모래주머니로 바꿨어요.",
  6
 ],
 [
  "jaws",
  "죠스",
  "adventure",
  "shark",
  "해수욕장에 나타난 거대한 백상아리를 막으러 바다로 나가요.",
  "어선 옆에서 거대한 백상아리가 나타나자 낚싯대를 붙잡고 버텼어요.",
  5
 ],
 [
  "mission",
  "미션 임파서블",
  "adventure",
  "wire",
  "이단 헌트가 이끄는 첩보 팀이 불가능해 보이는 임무에 도전해요.",
  "검은 옷의 요원이 줄에 매달려 보안실 바닥 가까이 내려왔어요.",
  6
 ],
 [
  "rocky",
  "록키",
  "sport",
  "boxing",
  "무명 복서가 세계 챔피언과의 경기를 앞두고 훈련해요.",
  "회색 운동복을 입은 복서가 샌드백을 치며 훈련했어요.",
  6
 ],
 [
  "forrest",
  "포레스트 검프",
  "classic",
  "run",
  "달리기를 잘하는 남자가 버스 정류장에서 자신의 삶을 이야기해요.",
  "버스정류장 벤치에 앉은 주인공이 초콜릿 상자를 열어 보여줬어요.",
  7
 ],
 [
  "castaway",
  "캐스트 어웨이",
  "adventure",
  "island",
  "비행기 사고로 무인도에 남은 남자가 배구공을 친구 삼아 버텨요.",
  "배구공과 뗏목이 놓인 무인도에서 나무를 비벼 불을 피웠어요.",
  6
 ],
 [
  "interstellar",
  "인터스텔라",
  "scifi",
  "space",
  "살 곳을 잃어 가는 인류를 위해 우주로 떠나 시간의 차이를 겪어요.",
  "거대한 파도가 솟는 행성에서 우주비행사가 물속의 장비를 집었어요.",
  7
 ],
 [
  "martian",
  "마션",
  "scifi",
  "farm",
  "화성에 혼자 남은 우주인이 식량을 직접 길러 살아남으려 해요.",
  "붉은 행성의 기지 안에서 감자밭에 물을 주었어요.",
  6
 ],
 [
  "armageddon",
  "아마겟돈",
  "scifi",
  "drill",
  "지구로 다가오는 소행성을 막으려고 시추 전문가들이 우주로 가요.",
  "소행성에 가져간 이동식 시추 차량으로 암석을 뚫었어요.",
  6
 ],
 [
  "cinderella",
  "신데렐라",
  "fairytale",
  "midnight",
  "무도회에 간 소녀가 자정이 되자 급히 떠나 유리 구두를 남겨요.",
  "자정의 궁전 계단을 뛰어가다가 유리 구두 한 짝을 남겼어요.",
  6
 ],
 [
  "wizardoz",
  "오즈의 마법사",
  "fairytale",
  "yellowroad",
  "회오리바람에 날아간 도로시가 집으로 돌아가려고 에메랄드 도시를 찾아요.",
  "도로시와 허수아비, 양철 나무꾼, 사자가 함께 노란 벽돌길을 걸었어요.",
  8
 ],
 [
  "nightmuseum",
  "박물관이 살아있다",
  "adventure",
  "museum",
  "새로 온 야간 경비원이 밤마다 살아나는 전시물들을 만나요.",
  "밤의 박물관에서 경비원이 손전등을 비추자 공룡 뼈가 움직였어요.",
  6
 ],
 [
  "jumanji",
  "쥬만지",
  "adventure",
  "board",
  "신비한 게임을 시작하자 게임 속 정글의 위험이 현실에 나타나요.",
  "두 친구가 게임판을 사이에 두고 마주 앉아 주사위를 던졌어요.",
  6
 ],
 [
  "pi",
  "라이프 오브 파이",
  "adventure",
  "lifeboat",
  "배가 가라앉은 뒤 소년이 호랑이와 구명보트에 남아요.",
  "바다 한가운데서 호랑이와 같은 구명보트를 타고 노를 저었어요.",
  7
 ],
 [
  "cinemaparadiso",
  "시네마 천국",
  "classic",
  "projector",
  "마을 영화관의 영사기사와 영화를 사랑하는 소년이 친구가 돼요.",
  "오래된 영사실에서 필름을 걸고 영사기를 작동했어요.",
  6
 ],
 [
  "showman",
  "위대한 쇼맨",
  "musical",
  "stage",
  "바넘이 각자의 개성을 가진 사람들과 새로운 쇼를 시작해요.",
  "붉은 코트와 모자를 쓴 단장이 서커스 무대에서 공연을 열었어요.",
  6
 ],
 [
  "peterpan",
  "피터 팬",
  "fairytale",
  "fly",
  "어른이 되지 않는 소년이 아이들을 네버랜드로 데려가요.",
  "소년과 친구가 런던의 시계탑과 지붕 위로 날았어요.",
  8
 ],
 [
  "harrypotter",
  "해리 포터와 마법사의 돌",
  "fantasy",
  "featherSpell",
  "마법 학교에 입학한 소년이 친구들과 마법을 배우며 숨겨진 돌을 지켜요.",
  "마법 학교 교실에서 지팡이를 휘둘러 깃털을 띄웠어요.",
  6
 ],
 [
  "lotr",
  "반지의 제왕",
  "fantasy",
  "ring",
  "작은 여행자가 세상을 지배할 힘을 가진 반지를 없애려고 먼 길을 떠나요.",
  "용암이 흐르는 산에서 작은 금반지를 손에 들고 고민했어요.",
  7
 ],
 [
  "lalaland",
  "라라랜드",
  "musical",
  "twilightDance",
  "배우 지망생과 재즈 피아니스트가 꿈과 사랑을 좇는 이야기예요.",
  "노란 드레스를 입고 황혼의 언덕에서 가로등 옆 춤을 췄어요.",
  6
 ],
 [
  "kingsman",
  "킹스맨: 시크릿 에이전트",
  "adventure",
  "umbrellaShield",
  "평범한 청년이 비밀 조직의 신사가 되어 첩보 임무에 도전해요.",
  "정장을 입은 요원이 우산을 펼쳐 날아오는 탄환을 막았어요.",
  6
 ],
 [
  "mamma",
  "맘마미아!",
  "musical",
  "dance",
  "그리스 섬의 결혼식을 앞둔 소피가 아빠일지 모르는 세 남자를 초대해요.",
  "푸른 바다의 그리스 섬 결혼식장에서 손을 잡고 춤췄어요.",
  6
 ],
 [
  "singinrain",
  "사랑은 비를 타고",
  "musical",
  "rain",
  "무성 영화가 유성 영화로 바뀌는 시기의 배우들이 노래하고 춤춰요.",
  "비 오는 거리에서 우산을 들고 가로등을 붙잡아 돌며 춤췄어요.",
  6
 ],
 [
  "homealone",
  "나 홀로 집에",
  "classic",
  "trap",
  "가족 여행에서 혼자 남겨진 아이가 도둑을 막을 준비를 해요.",
  "계단 위의 아이가 줄에 매단 페인트통을 흔들어 아래의 도둑들을 막았어요.",
  6
 ],
 [
  "chocolate",
  "찰리와 초콜릿 공장",
  "fairytale",
  "factory",
  "황금 티켓을 얻은 아이들이 비밀스러운 초콜릿 공장을 방문해요.",
  "황금 초대장과 초콜릿 강이 있는 공장에서 기계 손잡이를 돌렸어요.",
  7
 ],
 [
  "soundmusic",
  "사운드 오브 뮤직",
  "musical",
  "sing",
  "마리아가 오스트리아의 일곱 아이에게 노래를 가르쳐요.",
  "알프스의 초원에서 마리아와 일곱 아이가 둥글게 앉아 기타에 맞춰 박수를 치며 노래했어요.",
  6
 ],
 [
  "whiplash",
  "위플래쉬",
  "musical",
  "drums",
  "젊은 드러머가 엄격한 지휘자의 밴드에서 실력을 키우려 해요.",
  "재즈 연습실에서 양손의 스틱으로 드럼을 번갈아 연주했어요.",
  6
 ],
 [
  "shawshank",
  "쇼생크 탈출",
  "classic",
  "freedom",
  "억울하게 감옥에 갇힌 앤디가 오랫동안 탈출을 준비해요.",
  "감옥에서 빠져나온 주인공이 쏟아지는 비를 맞으며 두 팔을 펼쳤어요.",
  7
 ],
 [
  "loveactually",
  "러브 액츄얼리",
  "classic",
  "cards",
  "크리스마스를 앞둔 런던에서 여러 사람의 사랑 이야기가 이어져요.",
  "집 앞에 찾아온 사람이 커다란 카드를 한 장씩 넘겨 마음을 전했어요.",
  7
 ],
 [
  "bohemian",
  "보헤미안 랩소디",
  "musical",
  "microphone",
  "밴드 퀸과 보컬 프레디 머큐리가 음악과 공연으로 관객을 만나요.",
  "커다란 공연장에서 짧은 마이크대를 쥔 가수가 팔을 들어 관객과 호흡했어요.",
  6
 ],
 [
  "topgun",
  "탑건: 매버릭",
  "adventure",
  "fighter",
  "베테랑 조종사 매버릭이 젊은 조종사들과 어려운 비행 임무에 도전해요.",
  "전투기 조종사가 협곡 사이를 낮게 날며 기체를 기울였어요.",
  7
 ],
 [
  "lesmis",
  "레미제라블",
  "musical",
  "barricade",
  "장 발장의 삶과 프랑스 민중의 이야기가 노래로 펼쳐져요.",
  "거리의 바리케이드 위에서 붉은 깃발을 힘껏 흔들었어요.",
  6
 ],
 [
  "leon",
  "레옹",
  "classic",
  "plant",
  "혼자 살던 청부살인자가 이웃 소녀 마틸다를 보호하게 돼요.",
  "작은 화분을 든 남자가 소녀와 나란히 걸었어요.",
  8
 ],
 [
  "gravity",
  "그래비티",
  "scifi",
  "tether",
  "우주 잔해에 휩쓸린 우주비행사가 지구로 돌아갈 방법을 찾아요.",
  "지구가 내려다보이는 우주에서 안전줄에 매달린 비행사가 난간을 붙잡았어요.",
  7
 ],
 [
  "pianist",
  "피아니스트",
  "classic",
  "piano",
  "전쟁 중 바르샤바에 남은 피아니스트가 숨어 지내며 살아남아요.",
  "전쟁으로 부서진 건물 안에서 피아노 건반을 조심스럽게 연주했어요.",
  7
 ],
 [
  "panslabyrinth",
  "판의 미로",
  "fairytale",
  "palmeyes",
  "오필리아가 현실과 신비한 미로 사이에서 세 가지 과제를 마주해요.",
  "소녀가 포도를 먹자 괴물이 눈 달린 두 손바닥을 얼굴에 대고 일어나 소녀를 쫓았어요.",
  7
 ]
];

const revisedScenes=new Set(['inception','titanic','jurassic','forrest','wizardoz','jumanji','homealone','showman','whiplash']);
const newScenes=new Set(['cinderella','peterpan','shawshank','loveactually','bohemian','topgun','lesmis','leon','gravity','pianist','panslabyrinth']);
const repairedScenes=new Set(['inception','titanic','jurassic','forrest','homealone','panslabyrinth','nightmuseum','armageddon','whiplash','singinrain','soundmusic','loveactually','shawshank','pianist','cinemaparadiso','martian','jaws','ghostbusters']);
const coherentScenes=new Set(['jaws','whiplash','singinrain','pianist','jurassic']);
const latestScenes=new Set(['martian','pianist','jurassic']);
const currentScenes=new Set(['shawshank','panslabyrinth']);
const retiredFilms=new Set(['harrypotter','peterpan']);
const cinemaRows=rows.filter(row=>!retiredFilms.has(row[0])).map(([id,title,group,motion,hint,reason,seconds])=>Object.freeze({id,title,group,motion,hint,reason,seconds:8,extras:{...(id==='cinderella'?{run:'cinema-v176/layers/cinderella-run.webp'}:id==='wizardoz'?{panorama:'cinema-v176/panoramas/'+id+'.webp'}:id==='interstellar'?{case:'cinema-v176/props/interstellar-case.webp'}:{}),...CINEMA_STORY_ASSETS[id]},asset:(['rocky','soundmusic','wizardoz','gravity','interstellar'].includes(id)?"cinema-v176/layers/":id==='panslabyrinth'?"cinema-v175/layers/":currentScenes.has(id)?"cinema-v174/layers/":latestScenes.has(id)?"cinema-v173/layers/":coherentScenes.has(id)?"cinema-v172/layers/":repairedScenes.has(id)?"cinema-v171/layers/":newScenes.has(id)?"cinema-v170/layers/":revisedScenes.has(id)?"cinema-v169/layers/":"cinema-v168/layers/")+id+".webp"}));
const sceneReasons178={indiana:'달리는 기차 지붕에서 객차 사이를 뛰어넘고 몸을 낮춰 가로대를 피했어요.',jurassic:'공룡에게 쫓기던 아이가 넘어진 친구를 일으켜 함께 달아났어요.',interstellar:'거대한 파도가 다가오는 물 행성에서 우주비행사와 TARS가 장비를 챙겨 우주선으로 향했어요.',martian:'바닥 가득 감자를 키우는 기지에서 중앙의 수분 발생 장치를 작동하고 새 감자를 심었어요.',jumanji:'주사위를 던지자 거대한 코끼리가 집 안으로 들어왔어요.',pi:'호랑이와 남은 구명보트 곁, 빛나는 밤바다 위로 거대한 고래가 뛰어올랐어요.',lotr:'간달프가 지팡이를 내려치자 좁은 다리가 무너지고 발록이 심연으로 떨어졌어요.',chocolate:'초콜릿 강을 마시던 아이가 물에 빠져 투명한 관 속으로 빨려 올라갔어요.',cinderella:'유리 구두를 남긴 자정의 궁전에서 치맛자락을 잡고 달아났어요.'};
const usedExtras={indiana:['runner','plate'],mission:['spy'],jurassic:['help','trexStop','plate'],interstellar:['rescue','wave','plate'],nightmuseum:['guard','skeleton'],martian:['farmer','plate'],pi:['whale','reaction','boat','plate'],jumanji:['friends','actor','dice','elephant','plate'],lalaland:['danceA','danceB'],soundmusic:['singing'],titanic:['openArms']};
export const CINEMA_FILMS=Object.freeze(cinemaRows.map(f=>{const merged={...f.extras,...CINEMA_ASSETS178[f.id]},keys=usedExtras[f.id];if(merged.friends)delete merged.actor;if(merged.performance)delete merged.actor;if(merged.carHD)delete merged.car;if(merged.run16)delete merged.run;return Object.freeze({...f,reason:CINEMA_MOVIES179[f.id].reason,asset:CINEMA_HD_MAP[f.asset]||f.asset,extras:Object.fromEntries(Object.entries(merged).filter(([k])=>!keys||keys.includes(k)||k==='plate').map(([k,p])=>[k,CINEMA_HD_MAP[p]||p]))});}));
export const FILM_BY_ID=Object.freeze(Object.fromEntries(CINEMA_FILMS.map(f=>[f.id,f])));
const replacements=Object.freeze({"et": "inception", "kingkong": "pirates", "up": "terminal", "apollo": "armageddon", "ratatouille": "cinderella", "walle": "aladdin", "hugo": "cinemaparadiso", "edward": "harrypotter", "godzilla": "starwars", "totoro": "lalaland", "spirited": "superman", "howl": "kingsman", "kiki": "mamma", "ponyo": "singinrain", "avatar": "whiplash", "trainbusan": "harrypotter", "snowpiercer": "starwars", "nationalteam": "lotr", "myeongryang": "lalaland", "haeundae": "superman", "extremejob": "kingsman"});
export function shuffled(list,random=Math.random){const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function makeCinemaPlan(random=Math.random){return shuffled(CINEMA_FILMS.map(f=>f.id),random).slice(0,9);}
const retiredAlternatives=Object.freeze({
 harrypotter:['panslabyrinth','wizardoz','inception'],peterpan:['wizardoz','cinderella','soundmusic'],
 karatekid:['rocky','forrest','showman'],marypoppins:['peterpan','cinderella','loveactually'],terminal:['forrest','castaway','martian'],
 aladdin:['gravity','loveactually','panslabyrinth'],pirates:['leon','shawshank','topgun'],
 starwars:['topgun','gravity','inception'],superman:['shawshank','lesmis','bohemian']
});
export function normalizeCinemaPlan(plan){
 const ids=Array.isArray(plan)?plan.map(id=>replacements[id]||id):[];
 if(ids.length!==9||new Set(ids).size!==9||ids.some(id=>!FILM_BY_ID[id]&&!retiredAlternatives[id]))return null;
 const used=new Set(ids.filter(id=>FILM_BY_ID[id]));
 return ids.map(id=>{
  if(FILM_BY_ID[id])return id;
  const replacement=[...retiredAlternatives[id],...CINEMA_FILMS.map(f=>f.id)].find(next=>FILM_BY_ID[next]&&!used.has(next));
  used.add(replacement);return replacement;
 });
}
export function filmChoices(id,random=Math.random){
 const film=FILM_BY_ID[id];if(!film)throw Error('Unknown movie');
 const peers=shuffled(CINEMA_FILMS.filter(f=>f.id!==id&&f.group===film.group),random).slice(0,2);
 const rest=shuffled(CINEMA_FILMS.filter(f=>f.id!==id&&!peers.includes(f)),random).slice(0,3-peers.length);
 return shuffled([film,...peers,...rest].map(f=>f.id),random);
}
