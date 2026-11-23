/** Story shots are complete illustrations. No independently loading actor layers. */
const ROOT=new URL('./',import.meta.url);
const letter=name=>`assets/story/v4/letter/${name}.webp`;
const letterV14=name=>`assets/story/v14/letter/${name}.webp`;
const letterV16=name=>`assets/story/v16/letter/${name}.webp`;
const letterV15=name=>`assets/story/v15/letter/${name}.webp`;
const rabbit=name=>`assets/story/v4/rabbit/${name}.webp`;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const STORY_SHOTS={
 'letter-title':letterV14('title'),
 'classroom-light':'assets/story/v6/rabbit/p20-light.webp',
 'classroom-wide':'assets/story/v6/rabbit/classroom-wide.webp',
 'classroom-friend':rabbit('friend-mirror'),
 'classroom-silence':rabbit('friend-mirror'),
 'classroom-whisper':'assets/story/v5/rabbit/friend-whisper.webp',
 'classroom-missing':'assets/story/v6/rabbit/classroom-search.webp',
 'classroom-search':rabbit('corridor-search'),
 'classroom-bag':'assets/story/v6/rabbit/classroom-bag.webp',
 'classroom-worry':rabbit('narrator-reflection'),
 'classroom-ripple':rabbit('narrator-reflection'),
 'classroom-approach':rabbit('narrator-reflection'),
 'classroom-rabbit':rabbit('mirror-rabbit-listen'),
 'classroom-explain':rabbit('mirror-rabbit-listen'),
 'classroom-rules':rabbit('mirror-rabbit-gesture'),
 'classroom-angry':rabbit('mirror-rabbit-listen'),
 'classroom-beckon':rabbit('mirror-rabbit-gesture'),
 'classroom-promise':rabbit('mirror-rabbit-listen'),
 'classroom-reach':rabbit('mirror-rabbit-gesture'),
 'classroom-wake':'assets/story/v7/rabbit/classroom-wake.webp',
 'classroom-dream':'assets/story/v7/rabbit/classroom-wake.webp',
 'classroom-reunion':'assets/story/v7/rabbit/classroom-reunion.webp',
 'classroom-together':'assets/story/v7/rabbit/classroom-together.webp',
 'library-hallway':letterV14('corridor'),
 'library-door':letterV16('overview'),
 'library-arrival':letterV16('speaker-girl'),
 'library-teacher':letterV14('speaker-librarian'),
 'library-surprise':letterV16('surprised'),
 'library-handoff':letterV16('handoff'),
 'library-envelope':letterV16('envelope'),
 'library-handwriting':letterV16('letter-open'),
 'library-emotion':letterV16('letter-read'),
 'library-determined':letterV16('determined'),
 'library-shelves':letterV16('shelf-reach'),
 'library-pages':letterV16('book-pages'),
 'library-reading':letterV16('window-read'),
 'library-sunset':letterV16('window-sunset'),
 'library-write':letterV16('window-write'),
 'library-request':letterV16('evening-request'),
 'library-listen':letterV14('evening-listen'),
 'library-return':letterV16('evening-return'),
 'library-farewell':letterV16('evening-farewell'),
 'tree-welcome':rabbit('tree-speaker'),
 'tree-books':rabbit('tree-books'),
 'tree-choose':rabbit('tree-books'),
 'tree-reward':rabbit('tree-reward'),
 'tree-listen':rabbit('tree-speaker'),
 'tree-praise':rabbit('tree-speaker'),
 'tree-listener':rabbit('tree-listener'),
 'tree-wait':rabbit('tree-depart'),
 'tree-rest':rabbit('tree-rest'),
 'tree-sleep':rabbit('tree-rest'),
 'letter-memory-1':'assets/story/v17/letter/memory-villa.webp',
 'letter-memory-2':letterV15('memory-summer'),
 'letter-memory-3':letterV15('memory-3'),
 'letter-memory-4':letterV15('memory-4'),
 'letter-memory-5':letterV15('memory-5'),
};
export const SCENE_IDS=Object.keys(STORY_SHOTS);
export const SCENE_ASSETS=[...new Set(Object.values(STORY_SHOTS))];
export function storyArtSource(name){
 if(!STORY_SHOTS[name])throw Error(`Unknown story shot: ${name}`);
 return new URL(STORY_SHOTS[name],ROOT).href;
}
export function renderStoryArt(name,alt=''){
 return `<img src="${storyArtSource(name)}" alt="${escape(alt)}" role="img" data-scene="${escape(name)}" decoding="async">`;
}
