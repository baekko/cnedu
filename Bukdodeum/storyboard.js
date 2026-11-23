/** Dialogue-to-shot edit. Repeated shots retain their decoded image in the DOM. */
export const RABBIT_OPENING = [
 'scene:classroom-wide','scene:classroom-friend','scene:classroom-silence','scene:classroom-whisper',
 'scene:classroom-missing','scene:classroom-search','scene:classroom-worry','scene:classroom-ripple',
 'scene:classroom-approach','scene:classroom-rabbit','scene:classroom-explain','scene:classroom-rules',
 'scene:classroom-angry','scene:classroom-beckon','scene:classroom-rules','scene:classroom-promise','scene:classroom-reach'
];
export const LETTER_OPENING = [
 'scene:library-hallway','scene:library-door','scene:library-arrival','scene:library-teacher','scene:library-surprise',
 'scene:library-handoff','scene:library-envelope','scene:library-envelope','scene:library-handwriting','scene:library-emotion','scene:library-determined'
];
export const LETTER_ENDING = [
 'scene:library-emotion','scene:library-determined','scene:library-shelves','scene:library-pages',
 'scene:library-reading','scene:library-sunset','scene:library-sunset','scene:library-write',
 'scene:library-request','scene:library-listen','scene:library-return','scene:library-farewell'
];
export const RABBIT_HUB_INTRO=['scene:tree-welcome','scene:tree-books','scene:tree-choose','scene:tree-reward','scene:tree-welcome'];
export const RABBIT_HUB_ENDING=['scene:tree-praise','scene:tree-listen','scene:tree-books','scene:tree-praise','scene:tree-reward','scene:tree-reward','scene:tree-listen','scene:tree-listener','scene:tree-wait','scene:tree-sleep'];
export const RABBIT_ENDING=['scene:classroom-wake','scene:classroom-dream','scene:classroom-reunion','scene:classroom-together'];
/** Never rewrite dialogue: concatenating the parts reproduces the source exactly. */
export function textPages(text, limit=112) {
 if(!text || text.length<=limit)return [text];
 const units=text.match(/[^\n]+\n*|\n+/g)||[text], pages=[];let current='';
 for(const unit of units){
   if(current && current.length+unit.length>limit){pages.push(current);current='';}
   if(unit.length>limit*1.4){
     const sentences=unit.match(/.*?[.!?。！？](?:[”’」」])?\s*|.+$/g)||[unit];
     for(const sentence of sentences){if(current&&current.length+sentence.length>limit){pages.push(current);current='';}current+=sentence;}
   }else current+=unit;
 }
 if(current)pages.push(current);
 return pages;
}
export function paginateStory(steps){return steps.flatMap(s=>s.cinema||s.original||s.keepTogether||!s.text?[s]:textPages(s.text).map((text,i)=>({...s,text,image:s.continuationImages?.[i-1]||s.image})));}
