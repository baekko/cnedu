// Keep challenge rewards and the pictures used to solve an on-screen case
// distinct. The latter are still part of the investigation's gameplay.
const quantity='(?:\\d+|아홉|여덟|일곱|여섯|다섯|네|세|두|한)';
const coinCounter=new RegExp(`(금화\\s*${quantity}\\s*)장(으로|이나|이|은|을|과)?`,'g');
const coinsAfterNumber=new RegExp(`(${quantity}) 금화(?=[를가을은이]|[. ]|$)`,'g');
const countParticle={으로:'로',이나:'나',이:'가',은:'는',을:'를',과:'와'};

export function arcadeCopy(text,place){
 if(typeof text!=='string'||!text)return text;
 if(place==='pursuit')return text.replace(/추가 단서/g,'추가 정보')
  .replace(/그림 단서|단서/g,'수사 자료');
 if(place==='detective')return text.replace(/단서/g,'증거');
 if(place==='space')text=text.replace(/노란 카드/g,'금화');
 if(place==='gym')text=text.replace(/열쇠 카드|카드(?=\s*(?:줍기|를 주우세요))/g,'금화');
 if(place==='museum'||place==='art')text=text.replace(/색과 단서를 되찾아요/g,'색을 되찾고 금화를 얻어요');
 return text.replace(/단서\s*카드|단서/g,'금화')
  .replace(coinCounter,(_,prefix,particle)=>prefix+'개'+(countParticle[particle]||''))
  .replace(coinsAfterNumber,'금화 $1 개');
}
