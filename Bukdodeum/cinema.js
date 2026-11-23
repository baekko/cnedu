import { mountLetterFilm } from './letter-credits-film.js';
import { CINEMA_DURATIONS, LABELS, loadCinemaAssets, drawCinemaFrame } from "./cinema-scenes.js?bridge=2s-v2";
export { CINEMA_DURATIONS, loadCinemaAssets, drawCinemaFrame };
const W=768,H=512;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function ensureStyle(){if(document.getElementById('cinema-v2-style'))return;const style=document.createElement('style');style.id='cinema-v2-style';style.textContent=`
.pixel-cinema{width:100%;position:relative;isolation:isolate;background:#fff9ed;overflow:hidden}.pixel-cinema__canvas{display:block;width:100%;height:auto;aspect-ratio:3/2;image-rendering:pixelated}.pixel-cinema__film{display:block;width:100%;height:auto;aspect-ratio:5/3;object-fit:contain}.pixel-cinema__toolbar{display:flex;justify-content:center;gap:9px;align-items:center;padding:9px 12px;background:#fff9ed;border-top:1px solid #e5d8cc;color:#705a70}.pixel-cinema__button{border:1px solid #d7c7d8;background:#fffdf8;color:#705a70;border-radius:12px;min-height:36px;min-width:78px;padding:7px 13px;font-family:inherit;font-size:12px;font-weight:650;line-height:1.3;cursor:pointer}.pixel-cinema__button:hover{background:#f1e8f3}.pixel-cinema__button:focus-visible{outline:2px solid #9e78ad;outline-offset:2px}.pixel-cinema [hidden]{display:none!important}.pixel-cinema__status{position:absolute;inset:0 0 55px;display:grid;place-content:center;padding:28px;text-align:center;color:#725b79;background:#fbf5e9e8;font-size:13px;z-index:4}.pixel-cinema__status button{background:#81649c;color:white;border-radius:10px;padding:10px;margin-top:12px}`;document.head.append(style)}
export function mountCinema(container,{kind='rabbit-opening',score=2,location=0,onComplete,onProgress,onPlaybackChange,autoplay=true}={}){
 if(!(container instanceof Element))throw new TypeError('A cinema container is required');ensureStyle();
 const label = LABELS[kind] || LABELS['credits-letter'];
 const surface = kind === 'credits-letter'
   ? `<video class="pixel-cinema__film" width="1440" height="864" playsinline muted aria-label="${label}"></video>`
   : `<canvas class="pixel-cinema__canvas" width="${W}" height="${H}" role="img" aria-label="${label}"></canvas>`;
 const root=document.createElement('div');root.className='pixel-cinema';root.innerHTML=`${surface}<div class="pixel-cinema__toolbar" role="group" aria-label="이야기 연출 재생"><button class="pixel-cinema__button" data-control="replay">다시보기</button><button class="pixel-cinema__button" data-control="toggle">재생</button></div><div class="pixel-cinema__status" role="status">작은 장면을 준비하고 있어요…</div>`;container.append(root);
 if (kind === 'credits-letter') return mountLetterFilm(root, { autoplay, onComplete, onProgress, onPlaybackChange });
 const ctx=root.querySelector('canvas').getContext('2d',{alpha:false}),toggle=root.querySelector('[data-control=toggle]'),restart=root.querySelector('[data-control=replay]'),status=root.querySelector('.pixel-cinema__status');
 const duration=CINEMA_DURATIONS[kind]||14,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let current=0,running=false,destroyed=false,completed=false,loaded=false,last=0,raf=0,autoPaused=false;
 const bridge=kind==='rabbit-portal';
 let inView=!bridge, firstVisibleFrame=true;
 const observer=bridge ? new IntersectionObserver(([entry])=>{
  inView=entry.isIntersecting && entry.intersectionRatio>=.5;
  firstVisibleFrame=true;
 },{threshold:[0,.5]}) : null;
 observer?.observe(root.querySelector('canvas'));
 function controls(){toggle.textContent=running?'멈추기':'재생';toggle.setAttribute('aria-label',running?'멈추기':'재생');toggle.hidden=completed;restart.setAttribute('aria-label','다시보기');root.dataset.playing=String(running);onPlaybackChange?.({running,completed,current,duration})}
 function draw(){if(!destroyed&&loaded){drawCinemaFrame(ctx,kind,current,score,{location});onProgress?.(current/duration);controls()}}
 function finish(){if(destroyed||completed)return;current=duration;running=false;completed=true;cancelAnimationFrame(raf);draw();onComplete?.()}
 // Animation time follows elapsed playback time even when a browser drops frames.
 // Visibility changes and explicit pauses reset the origin, so hidden time is excluded.
 function tick(ts){if(destroyed||!running)return;if(bridge && (!inView || firstVisibleFrame)){
   last=ts;
   firstVisibleFrame=!inView;
  }
  current+=Math.max(0,(ts-last)/1000);last=ts;if(current>=duration){finish();return}draw();raf=requestAnimationFrame(tick)}
 function play(){if(destroyed||!loaded||running)return;if(completed){current=0;completed=false}running=true;firstVisibleFrame=true;last=performance.now();autoPaused=false;controls();raf=requestAnimationFrame(tick)}
 function pause(){running=false;last=0;cancelAnimationFrame(raf);controls()}
 function replay(){if(destroyed)return;pause();current=0;completed=false;draw();play()}
 function visibility(){if(document.hidden&&running){pause();autoPaused=true}else if(!document.hidden&&autoPaused){autoPaused=false;play()}}
 async function prepare(){try{await loadCinemaAssets({kind,location});if(destroyed)return;loaded=true;status.hidden=true;if(completed){draw();return}if(reduced&&autoplay&&bridge){draw()}else if(reduced&&autoplay){current=duration;draw();finish()}else{draw();if(autoplay)play()}}catch{if(destroyed)return;status.innerHTML='장면 그림을 불러오지 못했어요.<button type="button">다시 불러오기</button>';status.querySelector('button').onclick=prepare}}
 toggle.onclick=()=>running?pause():play();restart.onclick=replay;document.addEventListener('visibilitychange',visibility);prepare();
 return{play,pause,replay,destroy(){if(destroyed)return;destroyed=true;observer?.disconnect();running=false;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);root.remove()}};
}
