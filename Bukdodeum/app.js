import {RABBIT_OPENING, LETTER_OPENING, LETTER_ENDING, RABBIT_HUB_INTRO, RABBIT_HUB_ENDING, RABBIT_ENDING, paginateStory} from './storyboard.js';
import { mountCinema, CINEMA_DURATIONS } from './cinema.js';
import { storyArtSource } from './story-scenes.js';
import { revealScene, retainScenes, preloadScene } from './scene-display.js';
import {retainMirror,revealMirror} from './mirror-dialogue.js';
import {revealPortal} from './portal-scene.js';
import { normalizeAnswer, hintLimit, revealedCount, revealStage, completeQuestion, completedCount, totalScore } from './state.js';

const BASE = new URL('./', import.meta.url);
const asset = path => new URL(path, BASE).href;
const APP = document.getElementById('app');
const DIALOG = document.getElementById('dialog');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = value => String(value ?? '').replace(/<br\s*\/?\s*>/gi, '\n');
const paragraph = text => `<p class="verbatim">${esc(plain(text))}</p>`;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const data = await fetch(new URL('content.json', BASE)).then(r => { if (!r.ok) throw new Error('content'); return r.json(); }).catch(() => null);
if (!data) {
  APP.innerHTML = '<main class="page error-page"><h1>책장을 불러오지 못했어요.</h1><p>연결을 확인한 뒤 다시 열어 주세요.</p><button onclick="location.reload()">다시 열기</button></main>';
  throw new Error('Book content unavailable');
}

const paths = {
  book:'M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1Z M12 6v14',
  spark:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',
  mail:'M3 5h18v14H3Z M3 6l9 7 9-7',
  arrow:'M5 12h14 M13 6l6 6-6 6',
  back:'M19 12H5 M11 6l-6 6 6 6',
  home:'m3 11 9-8 9 8 M5 10v11h14V10 M9 21v-7h6v7',
  help:'M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  key:'M16 2a6 6 0 0 0-5.44 8.53L3 18v3h3l2-2h2v-2l4.47-3.56A6 6 0 1 0 16 2Z M17.5 7.5h.01',
  carrot:'M7 8c-5 5-5 13-5 13s8 0 13-5c3-3-5-11-8-8Z M13 8l4-6 M16 10l6-3 M7 11l3 3 M5 16l2 2',
  check:'m5 12 4 4L19 6',
  close:'m6 6 12 12 M6 18 18 6',
  lock:'M5 10h14v11H5Z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
  reset:'M4 8a9 9 0 1 1-1 8 M4 3v5h5',
  rabbit:'M7 11C-1-1 8-3 9 10 M15 10c1-13 10-11 2 1 M20 16a8 6 0 1 1-16 0 8 6 0 0 1 16 0 M8 15h.01 M16 15h.01 M11 18h2',
  star:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
  sliders:'M4 6h6m4 0h6 M4 12h11m4 0h1 M4 18h2m4 0h10 M10 4v4m5 2v4m-9 2v4',
  file:'M6 3h8l4 4v14H6Z M14 3v5h4 M9 12h6 M9 16h6',
  kit:'M3 7h18v4H3Z M5 11v9h14v-9 M10 15h4',
  chevron:'m6 9 6 6 6-6',
  pencil:'m4 16 12-12 4 4L8 20l-5 1Z M14 6l4 4',
  volume:'M3 9h4l5-5v16l-5-5H3Z M16 8q5 4 0 8',
};
function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.star}"/></svg>`; }
const artNames = {
  rabbit: ['rabbit-bakery-v2','rabbit-laundry-v2','rabbit-capsules-v2','rabbit-moon-v2','rabbit-whispers-v2'],
  letter: ['scene:letter-memory-1','scene:letter-memory-2','scene:letter-memory-3','scene:letter-memory-4','scene:letter-memory-5'],
};
const artAliases = {'letter-librarian':'letter-teacher-v2','letter-window-reading':'letter-reading','rabbit-hub':'rabbit-hub-v2','classroom-mirror':'classroom-wide-v2','rabbit-mirror':'rabbit-mirror-v2'};
const art = name => name.startsWith('scene:')?name:asset(`assets/art/${artAliases[name] || name}.webp`);
const qArt = (mode, question) => art(artNames[mode.track][question.number - 1]);
const clueRedraws = {'assets/original/rabbit/bduq111.png':'assets/clues/rabbit-bread-flags.png','assets/original/rabbit/bduq333.png':'assets/clues/rabbit-gifts.png','assets/original/letter/ptbq111.png':'assets/clues/letter-houses.svg','assets/original/letter/ptbq444.png':'assets/clues/letter-symbols.svg','assets/original/letter/ptbq555.png':'assets/clues/letter-dots.svg'};
let creditsCleanup = null, storyBack = null;
if(!history.state?.bddScene)history.replaceState({bddScene:true,depth:0,previous:null},'',location.href);
let activeCinema = null, currentRoute = null, currentMode = null, returnFocus = null, modalCleanup = null;
let soundOn = false, audioContext, localStorageWarning = false;
const transientReveal = new Map();
const HINT_TEXT_KEY = 'bdd_custom_hints_v1';
const ADMIN_MODE_LABELS = {
  rabbit: '초등학생 게임용 래빗홀',
  letter: '중·고등학생 게임용 편지왔어요',
  eclass: '초등학생 수업용',
  mclass: '중·고등학생 수업용',
};
const ADMIN_PDFS = {
  rabbit: {guide:'초등 게임용 문제별 가이드', clues:'초등학생 게임용(래빗홀)', activity:'초등 게임용 활동키트'},
  letter: {guide:'중·고등 게임용 문제별 가이드', clues:'중·고등학생 게임용(편지왔어요)', activity:'중·고등 게임용 활동키트'},
  eclass: {guide:'초등 수업용 문제별 가이드', clues:'초등학생 수업용', activity:'초등 수업용 활동키트'},
  mclass: {guide:'중·고등 수업용 문제별 가이드', clues:'중·고등학생 수업용', activity:'중·고등 수업용 활동키트'},
};
// One entry per PDF page. Several kit pieces can share a sheet.
const KIT_PAGE_TAGS = {
  rabbit: ['A1','C1','C2','D1','E1'],
  letter: ['A2','B1','B2','E1','FINAL'],
  eclass: ['A2','B2','B3~B6','B7~B10','B11~B14','C3','C4','D2','D3','D4','E2'],
  mclass: [
    'A3','A4','A5','A6','A7','A8','B3','B4','B5','B6','B7','B8','B9',
    'C1','C2','C3','C4','C5','D2','D3','D4','D5','D6','D7','E8','E2~E5','E2·E6·E7',
  ],
};
const hintKey = (mode, q, hint) => `${mode.id}:${q.number}:${hint.level}`;
const hintText = (mode, q, hint, overrides) => hint.kind === 'hint'
  ? overrides[hintKey(mode, q, hint)] ?? hint.text
  : hint.text;
function read(key, fallback, storage = localStorage) {
  try { const value = JSON.parse(storage.getItem(key)); return value !== null ? value : fallback; } catch { return fallback; }
}
function write(key, value, storage = localStorage) {
  try { storage.setItem(key, JSON.stringify(value)); return true; } catch { if (!localStorageWarning) { localStorageWarning = true; toast('이 브라우저에서는 진행 기록을 저장할 수 없어요.'); } return false; }
}
const progressKey = mode => mode.progressKey || `bdd_class_stamps_${mode.id}`;
const progress = mode => read(progressKey(mode), {});
const metaKey = mode => `bdd_story_${mode.id}`;
const meta = mode => read(metaKey(mode), {});
const setMeta = (mode, patch) => write(metaKey(mode), {...meta(mode), ...patch});
const allowed = mode => { try { return sessionStorage.getItem(`bdd_access_${mode.id}`) === 'yes'; } catch { return true; } };
function allow(mode) { try { sessionStorage.setItem(`bdd_access_${mode.id}`, 'yes'); } catch {} }
function restriction(mode) { return read(data.admin.storageKey, data.admin.defaults)[mode.id] || 0; }
function announce(message) { $('#announcer').textContent = message; }
function toast(message) {
  $('.toast')?.remove(); const el = document.createElement('div'); el.className = 'toast'; el.textContent = message; el.setAttribute('role', 'status'); document.body.append(el); setTimeout(() => el.remove(), 3800);
}
function chime(kind = 'tap') {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); audioContext.resume();
    const notes = kind === 'success' ? [523,659,784,1047] : kind === 'wrong' ? [260,220] : [660];
    notes.forEach((hz, n) => { const o = audioContext.createOscillator(), g = audioContext.createGain(), t = audioContext.currentTime + n*.09; o.type = 'sine'; o.frequency.value = hz; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.055,t+.015); g.gain.exponentialRampToValueAtTime(.001,t+.22); o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t+.24); });
  } catch {}
}
function celebrateAnswer() {
  document.querySelector('.correct-feedback')?.remove();
  const card=document.createElement('div');card.className='correct-feedback';card.setAttribute('role','status');
  card.innerHTML=`<span class="correct-envelope" aria-hidden="true">${icon(currentMode?.track==='rabbit'?'rabbit':'mail')}<i>${icon('check')}</i></span><strong>정답이에요!</strong>`;
  document.body.append(card);setTimeout(()=>card.remove(),1450);
}
function getRoute() {
  let path = decodeURI(location.pathname);
  if (path.startsWith(BASE.pathname)) path = path.slice(BASE.pathname.length);
  path = path.replace(/^\/+/, '') || 'index.html';
  return { path, ...(data.routes[path] || {type:'landing'}) };
}
function navigate(path, query = {}, replace = false) {
  closeDialog(); const url = new URL(path, BASE); Object.entries(query).forEach(([k,v])=>url.searchParams.set(k,v));
  if(url.href===location.href){render();return;}
  const previous=history.state?.bddScene?history.state:{depth:0,previous:null};
  history[replace ? 'replaceState' : 'pushState']({bddScene:true,depth:previous.depth+(replace?0:1),previous:replace?previous.previous:location.href}, '', url);
  render(); window.scrollTo({top:0,behavior:'instant'});
}
function setView(query, replace = false) { navigate(currentRoute.path, query, replace); }
function historyBack(fallback='ptb.html') {
  if(history.state?.bddScene&&history.state.depth>0){history.back();return;}
  navigate(fallback,{},true);
}
function goBack(fallback='ptb.html') { if(storyBack)storyBack();else historyBack(fallback); }
window.addEventListener('popstate', () => { closeDialog(); render();window.scrollTo({top:0,behavior:'instant'}); });
window.addEventListener('storage', e => { if ([data.admin.storageKey, HINT_TEXT_KEY].includes(e.key) && DIALOG.open && DIALOG.dataset.kind === 'hint') closeDialog(); });

function adminTrigger() { return `<button class="icon-button admin-trigger" data-action="admin" aria-label="관리자 설정">${icon('key')}</button>`; }
function header(mode, {back = 'ptb.html'} = {}) {
  return `<header class="topbar"><button class="icon-button" data-back="${back}" aria-label="이전 장면으로">${icon('back')}</button><img class="topbar-logo" src="${asset('assets/brand/bukdodeum-transparent.png')}" alt="북돋움" width="1370" height="702">${adminTrigger()}</header>`;
}
function footer() { return `<footer class="site-footer"><span>${icon('book')} 북돋움</span><button class="text-button" data-action="sound" aria-pressed="${soundOn}">${icon('volume')} 소리 ${soundOn?'켜짐':'꺼짐'}</button></footer>`; }
function frame(content, cls = '') {
  storyBack=null;
  activeCinema?.destroy(); activeCinema = null;
  creditsCleanup?.(); creditsCleanup = null;
  const next = document.createElement('template');
  next.innerHTML = `<div class="page ${cls} ${currentMode?.id==='letter'?'letter-theme':''}">${content}${footer()}</div>`;
  retainScenes(APP, next.content);
  retainMirror(APP,next.content);
  APP.replaceChildren(next.content);
  $$('[data-scene-key]',APP).forEach(revealScene);
  $$('[data-mirror-pose]',APP).forEach(revealMirror);
  $$('[data-portal-start]',APP).forEach(revealPortal);
  $$('[data-back]',APP).forEach(el=>el.addEventListener('click',()=>{chime();goBack(el.dataset.back)}));
  $$('[data-nav]',APP).forEach(el => el.addEventListener('click',()=>{ chime(); navigate(el.dataset.nav); }));
  $$('[data-action="admin"]',APP).forEach(el=>el.addEventListener('click',adminLogin));
  $$('[data-action="record"]',APP).forEach(el=>el.addEventListener('click',()=>showRecord(currentMode)));
  $$('[data-action="sound"]',APP).forEach(el=>el.addEventListener('click',()=>{ soundOn=!soundOn; el.setAttribute('aria-pressed',soundOn); el.innerHTML=`${icon('volume')} 소리 ${soundOn?'켜짐':'꺼짐'}`; chime(); }));
  const title = $('h1',APP); if(title){title.tabIndex=-1; title.focus({preventScroll:true});}
}
function artFigure(src, alt, cls = '') {
  const source=src.startsWith('scene:')?storyArtSource(src.slice(6)):src;
  return `<figure class="scene ${cls}" data-scene-key="${esc(source)}" data-scene-state="loading" aria-busy="true"><img src="${esc(source)}" alt="${esc(alt)}" decoding="async"><span class="scene-status" role="status">장면을 준비하고 있어요…</span><span class="scene-corner" aria-hidden="true">${icon('spark')}</span></figure>`;
}
function bookTitle(title){return title==='세계를 건너 너에게 갈게'?'<span class="single-line-title">세계를 건너 너에게 갈게</span>':esc(title);}
function letterTitleCard(){const src=storyArtSource('letter-title');return `<figure class="scene letter-title-card" data-scene-key="${esc(src)}" data-scene-state="loading" aria-busy="true"><img src="${esc(src)}" alt="가슴에 편지를 안은 소녀" decoding="async"><figcaption aria-label="편지왔어요"><span aria-hidden="true" style="--letter:0">편</span><span aria-hidden="true" style="--letter:1">지</span><span aria-hidden="true" style="--letter:2">왔</span><span aria-hidden="true" style="--letter:3">어</span><span aria-hidden="true" style="--letter:4">요</span></figcaption><span class="scene-status" role="status">장면을 준비하고 있어요…</span></figure>`;}
function button(text, id, secondary = false) { return `<button id="${id}" class="button ${secondary?'secondary':''}">${text}${icon('arrow')}</button>`; }
function subtitle(text) { return `<span class="eyebrow">${esc(text)}</span>`; }
function render() {
  currentRoute = getRoute(); currentMode = data.modes[currentRoute.mode] || null;
  document.title = currentMode?`${currentMode.title} · 북돋움`:'북돋움';
  if(currentMode && !allowed(currentMode)) { renderGate(currentMode); return; }
  if(currentMode) write('bdd_last_visit',{mode:currentMode.id,path:currentRoute.path,search:location.search});
  const type = currentRoute.type;
  if(type==='entry') { navigate(currentMode.opening || currentMode.hub,{},true); return; }
  if(type==='landing') return renderLanding();
  if(type==='selection') return renderSelection();
  if(type==='opening') return renderOpening(currentMode);
  if(type==='hub') return renderHub(currentMode);
  if(type==='question') return renderQuestion(currentMode,currentMode.questions[currentRoute.number-1]);
  if(type==='ending') return renderEnding(currentMode);
  if(type==='outro') return renderOutro(currentMode);
}
function renderLanding() {
  const last=read('bdd_last_visit',null);
  frame(`<header class="landing-bar"><span class="landing-wordmark">PLAY THE BOOK</span>${adminTrigger()}</header><main id="main" class="landing"><div class="landing-heading">${subtitle('학생 맞춤형 독서교육 프로그램')}<h1 class="original-brand"><img src="${asset('assets/brand/bukdodeum-transparent.png')}" alt="북돋움" width="1370" height="702"></h1><p>작은 책 한 권에 숨어 있는<br>커다란 이야기를 만나러 갈까요?</p></div>${artFigure(art('hero-v14'),'책과 거울 앞에서 만난 보라토끼와 편지왔어요의 소녀','landing-art')}<div class="landing-actions"><span class="paper-label">오늘의 모험, 준비됐나요?</span>${button('책장 열기','start')}${last?button('이어서 만나기','resume',true):''}<div class="landing-facts"><span>${icon('rabbit')} 두 가지 이야기</span><span>${icon('book')} 함께 읽는 수업</span></div></div></main>`,'landing-page');
  $('#start').onclick=()=>navigate('ptb.html');
  if(last) $('#resume').onclick=()=>{const mode=data.modes[last.mode]; if(!mode)return navigate('ptb.html'); accessModal(mode,()=>navigate(last.path,Object.fromEntries(new URLSearchParams(last.search||''))));};
}
function renderSelection() {
  frame(`${header(null,{back:'index.html'})}<main id="main" class="selection-main"><div class="section-heading"><h1>활동에 맞는 책장을 골라주세요</h1></div><div class="section-label"><span>이야기를 따라가는 게임</span><i></i></div><div class="mode-list">${['rabbit','letter'].map(id=>{const m=data.modes[id];return `<button class="mode-card ${id}" data-mode="${id}"><div class="mode-art"><img src="${id==='rabbit'?art('rabbit-hub'):storyArtSource('library-emotion')}" alt="" loading="lazy"></div><div class="mode-copy"><small>${esc(m.audience)} · 게임</small><h2>${m.title}</h2><p>${id==='rabbit'?'보라토끼를 따라 거울 너머로':'책 속에 남겨진 기억과 편지'}</p><span class="mode-link">이야기 펼치기 ${icon('arrow')}</span></div></button>`}).join('')}</div><div class="section-label"><span>책과 함께하는 수업</span><i></i></div><div class="class-modes">${['eclass','mclass'].map(id=>`<button class="class-mode ${id}" data-mode="${id}"><span class="sticker-icon">${icon('book')}</span><small>독서 수업</small><h2>${id==='eclass'?'초등학생':'중·고등학생'}</h2><span>문제 책장 열기 ${icon('arrow')}</span></button>`).join('')}</div><p class="small-note">${icon('lock')} 선생님께 받은 접속 코드로 입장해요.</p></main>`,'selection-page');
  $$('[data-mode]').forEach(el=>el.onclick=()=>accessModal(data.modes[el.dataset.mode]));
}
function renderGate(mode) {
  frame(`${header(mode,{showScore:false})}<main id="main" class="gate"><span class="large-seal">${icon(mode.track==='rabbit'?'rabbit':'mail')}</span>${subtitle(mode.audience)}<h1>${mode.title}</h1><p>선생님께 받은 접속 코드를 입력하고<br>책 속으로 들어오세요.</p><form id="gate-form"><label for="gate-code">접속 코드</label><input id="gate-code" type="password" inputmode="numeric" autocomplete="off" required maxlength="30"><p class="form-status" id="gate-status" role="status"></p><button class="button">책장 열기 ${icon('arrow')}</button></form></main>`);
  $('#gate-form').onsubmit=e=>{e.preventDefault();if($('#gate-code').value.trim()===String(mode.entryCode)){allow(mode);render();}else{$('#gate-status').textContent='접속 코드를 다시 확인해 주세요.';chime('wrong');}};
}
function showDialog(title, html, {kind='', onClose} = {}) {
  closeDialog();returnFocus=document.activeElement;DIALOG.dataset.kind=kind;DIALOG.dataset.theme=kind!=='admin'&&currentMode?.id==='letter'?'letter':'';
  DIALOG.innerHTML=`<div class="dialog-top"><h2 id="dialog-title">${title}</h2><button class="icon-button" id="dialog-close" aria-label="창 닫기">${icon('close')}</button></div><div class="dialog-body">${html}</div>`;
  DIALOG.setAttribute('aria-labelledby','dialog-title');DIALOG.showModal();$('#dialog-close').onclick=closeDialog;modalCleanup=onClose;
  DIALOG.onclick=e=>{if(e.target===DIALOG){const r=DIALOG.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}};
}
function closeDialog(){if(!DIALOG.open)return;const hint=DIALOG.dataset.kind==='hint';DIALOG.close();modalCleanup?.();modalCleanup=null;const focus=returnFocus?.isConnected?returnFocus:hint?$('#hint-button'):null;focus?.focus({preventScroll:true});}
DIALOG.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
function accessModal(mode, after) {
  const finish=()=>{if(after)return after();navigate(mode.opening||mode.hub);};
  if(allowed(mode))return finish();
  showDialog('책장에 들어가기',`<div class="modal-seal">${icon(mode.track==='rabbit'?'rabbit':'mail')}</div><p class="dialog-lead">${esc(mode.title)}</p><form id="access-form"><label for="access-code">접속 코드</label><input id="access-code" type="password" inputmode="numeric" autocomplete="off" required maxlength="30" placeholder="선생님께 받은 코드"><p id="access-status" class="form-status" role="status"></p><button class="button">입장하기 ${icon('arrow')}</button></form>`);
  DIALOG.dataset.theme=mode.id==='letter'?'letter':'';$('#access-code').focus();$('#access-form').onsubmit=e=>{e.preventDefault();if($('#access-code').value.trim()===String(mode.entryCode)){allow(mode);closeDialog();finish();}else{$('#access-status').textContent='접속 코드를 다시 확인해 주세요.';chime('wrong');}};
}

function slideArt(slide, ending=false, index=0) { return art((ending ? LETTER_ENDING : LETTER_OPENING)[index]); }
function storyFlow(mode, {title, steps, onFinish, back=mode.hub, nextLabel='다음 이야기', prefix='이야기', param='s', autoFinishCinema=false}) {
  steps = paginateStory(steps).map(s=>({...s,letter:s.letter||mode.id==='letter'}));
  const idx=Math.max(0,Math.min(steps.length-1,Number(new URLSearchParams(location.search).get(param))||0)), s=steps[idx];
  frame(`${header(mode,{back})}<main id="main" class="story-main"><div class="chapter-line"><span>${prefix}</span><span>${idx+1} <i>/ ${steps.length}</i></span></div><h1 class="story-title">${bookTitle(title)}</h1>${s.titleCard?letterTitleCard():s.portalStart?`<figure class="scene portal-scene" data-portal-start aria-busy="true"><canvas width="768" height="512" role="img" aria-label="돌다리에 들어선 주인공의 뒷모습과 앞서 있는 보라토끼" hidden></canvas><span class="scene-status" role="status">장면을 준비하고 있어요…</span></figure>`:s.mirrorPose!==undefined?`<figure class="scene mirror-dialogue" data-mirror-pose="${s.mirrorPose}" aria-busy="true"><canvas width="768" height="512" role="img" aria-label="고정된 거울 속에서 말하는 보라토끼" hidden></canvas><span class="scene-status" role="status">장면을 준비하고 있어요…</span></figure>`:s.cinema?'<div id="cinema" class="cinema-stage"></div>':(s.original?`<figure class="original-letter"><img src="${s.image}" alt="내일의 나에게 보내는 원본 편지"></figure><details class="letter-transcript"><summary>큰 글씨로 읽기</summary>${paragraph(s.text)}</details>`:artFigure(s.image||art(mode.track==='rabbit'?'rabbit-hub':'letter-desk'),s.alt||title))}${s.text&&!s.original?`<div class="story-paper ${s.letter?'letter-paper':''} ${s.compact?'compact-story':''}"><span class="speaker">${icon(s.letter?'mail':mode.track==='rabbit'?'rabbit':'book')}${esc(s.speaker||(s.letter?'책 속의 편지':mode.track==='rabbit'?'래빗홀의 이야기':'편지왔어요'))}</span>${paragraph(s.text)}</div>`:''}<div class="story-navigation"><button id="story-prev" class="icon-button" aria-label="이전 이야기" ${idx===0?'disabled':''}>${icon('back')}</button><div class="story-progress" aria-label="${steps.length}장 중 ${idx+1}장"><i style="width:${(idx+1)/steps.length*100}%"></i></div><button id="story-next" class="button">${esc(idx===steps.length-1?nextLabel:'다음')}${icon('arrow')}</button></div>${s.cinema&&!autoFinishCinema?'<p class="small-note">재생이 끝나면 다음 이야기로 넘어가 주세요.</p>':''}</main>`,'story-page');
  const move=(n,replace=false)=>{const query=Object.fromEntries(new URLSearchParams(location.search));query[param]=n;setView(query,replace);};
  storyBack=()=>{
    if(idx===0){historyBack(back);return;}
    const previous=history.state?.previous?new URL(history.state.previous):null;
    const here=new URL(location.href);
    const sameStory=previous?.pathname===here.pathname&&previous.searchParams.get('v')===here.searchParams.get('v');
    if(history.state?.depth>0&&sameStory&&Number(previous.searchParams.get(param)||0)===idx-1)history.back();
    else move(idx-1,true);
  };
  $('#story-prev').disabled=idx===0&&!(history.state?.depth>0);
  $('#story-prev').onclick=storyBack;
  $('#story-next').onclick=()=>{chime();if(idx<steps.length-1)move(idx+1);else onFinish();};
  if(s.cinema)activeCinema=mountCinema($('#cinema'),{kind:s.cinema,score:s.score??2,location:s.location??0,onComplete:()=>{if(autoFinishCinema&&idx===steps.length-1){onFinish();return;}$('#story-next')?.classList.add('ready');}});
  for(const next of steps.slice(idx+1,idx+3))if(next.image){const source=next.image.startsWith('scene:')?storyArtSource(next.image.slice(6)):next.image;preloadScene(source).catch(()=>{});}
}
function renderOpening(mode) {
  const steps=[mode.id==='letter'?{titleCard:true,image:art('scene:letter-title')}:{cinema:`${mode.track}-opening`}];
  if(mode.id==='rabbit') data.story.rabbit.opening.scenes.flat().forEach((text,i)=>{if(i===5){const cut=text.indexOf('\n')+1;steps.push({text:text.slice(0,cut),image:art('scene:classroom-search')},{text:text.slice(cut),image:art('scene:classroom-bag')});}else steps.push({text,image:art(RABBIT_OPENING[i]),continuationImages:i===11?[art('scene:classroom-explain')]:undefined});});
  else data.story.letter.opening.slides.forEach((s,i)=>steps.push({text:plain(s.text),image:slideArt(s,false,i),speaker:s.img==='ptbin222.png'?'사서 선생님':'편지왔어요'}));
  if(mode.id==='rabbit'){
    const pages=paginateStory(steps);
    for(let i=11;i<=18;i++){
      pages[i].mirrorPose=i-11;
      pages[i].keepTogether=true;
      delete pages[i].image;
    }
    const [light,continuation]=pages.splice(19,2);
    pages.splice(19,0,{...light,image:art('scene:classroom-light'),text:light.text.trimEnd()+'\n'+continuation.text.trimStart(),keepTogether:true});
    steps.splice(0,steps.length,...pages,{cinema:'rabbit-portal'});
  }
  storyFlow(mode,{title:mode.title,steps,prefix:'프롤로그',back:'ptb.html',nextLabel:'모험 시작하기',onFinish:()=>{setMeta(mode,{openingDone:true});navigate(mode.hub,mode.id==='rabbit'?{v:'intro'}:{});}});
}
function renderHub(mode) {
  setMeta(mode,{lastHub:true});const p=progress(mode), count=completedCount(p), isClass=mode.kind==='classroom', params=new URLSearchParams(location.search), v=params.get('v');
  if(v==='intro'&&!isClass){const texts=mode.id==='rabbit'?data.story.rabbit.hub.intro:[data.story.letter.hub.intro];return storyFlow(mode,{prefix:mode.id==='rabbit'?'프롤로그':'이야기',title:mode.id==='rabbit'?'래빗홀에 온 걸 환영해!':'다섯 권에 남겨진 기억',steps:texts.map((text,i)=>({text:mode.id==='rabbit'&&i===3?text.replace(/\n{2,}/g,'\n'):text,image:art(mode.id==='rabbit'?RABBIT_HUB_INTRO[i]:'scene:library-emotion'),letter:mode.id==='letter',keepTogether:mode.id==='rabbit'&&i===3,compact:mode.id==='rabbit'&&i===3})),nextLabel:'책 고르기',back:'ptb.html',onFinish:()=>{setMeta(mode,{hubIntroDone:true});navigate(mode.hub);}});}
  if(v==='finish'&&count===5&&!isClass){const texts=mode.id==='rabbit'?data.story.rabbit.hub.ending:[data.story.letter.hub.ending];return storyFlow(mode,{prefix:'에필로그',title:mode.id==='rabbit'?'모험의 마지막 책장':'마지막 편지',steps:texts.map((text,i)=>({text:text.replaceAll('{{carrotCount}}',totalScore(p)),image:art(mode.id==='rabbit'?RABBIT_HUB_ENDING[i]:'scene:library-emotion'),letter:mode.id==='letter'})),nextLabel:mode.id==='rabbit'?'친구 만나러 가기':'편지 코드 입력',onFinish:()=>mode.id==='rabbit'?navigate(mode.finalRoutes[0]):setView({v:'final'})});}
  if(v==='final'&&mode.id==='letter'&&count===5)return renderFinalMission(mode);
  if(!isClass&&!meta(mode).hubIntroDone){navigate(mode.hub,{v:'intro'},true);return;}
  const heading=isClass?'오늘의 독서 책장':mode.id==='rabbit'?'다섯 장소의 모험':'기억이 머무는 책장';
  frame(`${header(mode)}<main id="main" class="hub-main"><div class="hub-heading">${subtitle(isClass?'책을 읽고, 생각을 모아요':mode.id==='rabbit'?'보라토끼와 함께':'한 장씩 되찾는 이야기')}<h1>${heading}</h1><p>${isClass?'읽고 싶은 책을 골라 문제를 풀어 보세요.':mode.id==='rabbit'?'책 열매를 골라 새로운 장소로 떠나세요.':'책 속에서 잊고 있던 기억을 찾아 주세요.'}</p></div>${artFigure(art(mode.track==='rabbit'?'scene:tree-welcome':'scene:library-emotion'),mode.track==='rabbit'?'보라토끼와 책 열매가 열리는 나무':'도서관에서 편지를 든 소녀','hub-scene')}<section class="progress-card" aria-label="진행 기록"><div><strong>${isClass?'차곡차곡 독서 도장':'지금까지의 모험'}</strong><span>${count} / 5 완료</span></div><div class="stamp-row">${mode.questions.map(q=>`<span class="stamp ${p[q.number]?.completed?'done':''}" aria-label="${q.number}번 ${p[q.number]?.completed?'완료':'아직'}">${p[q.number]?.completed?icon(isClass?'check':mode.id==='rabbit'?'carrot':'mail'):`<b>${q.number}</b>`}</span>`).join('')}</div></section><div class="section-label"><span>${isClass?'오늘 펼칠 다섯 권':'이야기의 책을 골라 주세요'}</span><i></i></div><div class="books-grid">${mode.questions.map(q=>`<button class="book-card ${p[q.number]?.completed?'completed':''}" data-question="${q.number}">${isClass?`<span class="book-number">${String(q.number).padStart(2,'0')}</span>`:''}<div class="cover-wrap"><img src="${asset(q.cover)}" alt="${esc(q.title)} 원본 책 표지" loading="lazy">${p[q.number]?.completed?`<span class="completion-stamp">${icon('check')} 완료</span>`:''}</div><strong>${esc(q.title)}</strong><span class="book-action">${p[q.number]?.completed?'다시 살펴보기':'책 펼치기'} ${icon('arrow')}</span></button>`).join('')}${count===5?`<button class="book-card finale" id="finish"><span class="book-number">FIN</span><div class="cover-wrap"><span class="finale-seal">${icon(isClass?'check':'mail')}</span></div><strong>${isClass?'나의 독서 도장':'마지막 이야기'}</strong><span class="book-action">${isClass?'도장 확인하기':'마지막 책장 열기'} ${icon('arrow')}</span></button>`:''}</div><div class="hub-links">${!isClass?'<button class="text-button" id="intro-again">이야기 안내 다시 보기</button>':''}<button class="text-button" data-nav="ptb.html">다른 책장 고르기</button></div></main>`,'hub-page');
  $$('[data-question]').forEach(el=>el.onclick=()=>navigate(mode.questions[Number(el.dataset.question)-1].route));
  if($('#finish'))$('#finish').onclick=()=>isClass?showRecord(mode):setView({v:'finish'});
  if($('#intro-again'))$('#intro-again').onclick=()=>setView({v:'intro'});
}
function renderQuestion(mode,q) {
  const view=new URLSearchParams(location.search).get('v')||'intro', p=progress(mode), isClass=mode.kind==='classroom';
  if(!isClass&&view==='intro'){
    const texts=mode.id==='rabbit'?q.introTexts:[q.introLetter];
    return storyFlow(mode,{title:q.title,steps:texts.filter(Boolean).map(text=>({text,image:qArt(mode,q),letter:mode.id==='letter',speaker:mode.id==='rabbit'?'보라토끼의 말':undefined})),nextLabel:'문제 만나기',prefix:'',onFinish:()=>setView({v:'mission'})});
  }
  if(view==='success'&&p[q.number]?.completed){
    if(isClass)return renderClassSuccess(mode,q);
    const texts=mode.id==='rabbit'?q.successTexts:[q.correctLetter];
    const steps=texts.filter(Boolean).map(text=>({text,image:qArt(mode,q),letter:mode.id==='letter'}));
    steps.push({cinema:`${mode.track}-success`,score:p[q.number].score,location:q.number-1,text:mode.id==='rabbit'?`이번 모험에서 받은 당근은 ${p[q.number].score}개예요.`:`이번에 되찾은 기억은 ${p[q.number].score}점이에요.`});
    return storyFlow(mode,{title:'이야기의 비밀을 풀었어요!',steps,nextLabel:mode.id==='rabbit'?'책 열매 나무로':'기억의 책장으로',prefix:'문제 해결',autoFinishCinema:true,onFinish:()=>navigate(mode.hub)});
  }
  const clue=q.clueHTML.replace(/src="(assets\/[^\"]+)"/g,(_,p)=>`src="${asset(clueRedraws[p]||p)}"`);
  frame(`${header(mode,{back:mode.hub})}<main id="main" class="question-main"><div class="question-heading"><span class="question-tab">${icon(isClass?'book':mode.track==='rabbit'?'rabbit':'mail')} ${isClass?'독서 수업':mode.id==='letter'?'책 속의 편지':'새로운 장소'} ${String(q.number).padStart(2,'0')}</span><h1>${bookTitle(q.title)}</h1></div>${artFigure(qArt(mode,q),`${q.title}의 이야기 장면`,'question-scene')}<section class="puzzle-paper"><div class="puzzle-top"><span class="kit-tag">${esc(q.kit)}</span></div>${!isClass?`<h2 class="mission-title">${esc(q.missionTitle)}</h2>`:''}<div class="original-clue">${clue}</div><p class="answer-guide">${esc(q.guide)}</p><form id="answer-form" novalidate><label class="sr-only" for="answer">정답 입력</label><div class="answer-entry"><input id="answer" name="answer" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="정답을 적어 주세요" ${/숫자/.test(q.guide)?'inputmode="numeric"':''}><button type="submit" aria-label="정답 확인">${icon('check')}</button></div><p id="answer-status" class="form-status" role="status"></p><button class="button answer-submit" type="submit">정답 확인하기 ${icon('spark')}</button></form><div class="puzzle-bottom"><button class="hint-button" id="hint-button">${icon('help')} 힌트 펼쳐 보기</button>${!isClass?`<button class="text-button" id="reread">${icon('mail')} 이야기 다시 읽기</button>`:''}</div>${p[q.number]?.completed?'<p class="completed-note">이미 해결한 문제예요. 처음 기록은 그대로 남아 있어요.</p>':''}</section><button class="text-button back-to-hub" data-nav="${mode.hub}">${icon('back')} 책장으로 돌아가기</button></main>`,'question-page '+(isClass?'classroom-page':''));
  $('#hint-button').onclick=()=>hintDialog(mode,q);
  if($('#reread'))$('#reread').onclick=()=>setView({v:'intro'});
  $$('img', $('.original-clue')).forEach(img=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',`${img.alt} 크게 보기`); const open=()=>showDialog('문제 그림 크게 보기',`<div class="zoom-image"><img src="${img.src}" alt="${esc(img.alt)}"></div><p class="small-note">작은 화면에서는 그림을 가로로 밀어 살펴볼 수 있어요.</p>`);img.onclick=open;img.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};});
  let locked=false;
  $('#answer-form').onsubmit=e=>{
    e.preventDefault();if(locked)return;const input=$('#answer'),value=normalizeAnswer(input.value);
    if(!value){$('#answer-status').textContent='생각한 정답을 먼저 적어 주세요.';input.focus();return;}
    if(!q.acceptedAnswers.some(a=>normalizeAnswer(a)===value)){$('#answer-status').textContent='아직 비밀이 풀리지 않았어요. 한 번 더 살펴볼까요?';input.setAttribute('aria-invalid','true');$('.answer-entry').classList.remove('shake');void input.offsetWidth;$('.answer-entry').classList.add('shake');chime('wrong');return;}
    locked=true;const result=completeQuestion(progress(mode),q.number,mode);write(progressKey(mode),result.progress);chime('success');
    if(!result.first){toast('이미 해결한 문제예요. 처음 기록을 유지했어요.');navigate(mode.hub);return;}
    setView({v:'success'});celebrateAnswer();
  };
}
function hintDialog(mode,q) {
  const limit=hintLimit(mode,restriction(mode)), key=`${mode.id}-${q.number}`;
  const overrides=read(HINT_TEXT_KEY,{});
  const stored=revealedCount(progress(mode)[q.number],q), shown=Math.min(limit,Math.max(stored,transientReveal.get(key)||0));
  const html=`<div class="hint-intro"><span class="modal-seal">${icon('help')}</span><p>생각이 막힐 땐, 한 장씩 펼쳐 봐요.</p>${mode.kind==='game'?`<small>${mode.id==='rabbit'?'힌트를 보면 당근 1개, 정답까지 보면 당근 0개를 받아요.':'힌트를 보면 기억 10점, 정답까지 보면 기억 0점을 받아요.'}</small>`:''}</div><ol class="hint-stack">${q.hints.map((h,i)=>`<li class="hint-step ${i<shown?'revealed':''} ${i>=limit?'restricted':''}"><div class="hint-step-label"><span>${String(i+1).padStart(2,'0')}</span><strong>${h.kind==='answer'?'마지막 장 · 정답':`힌트 ${h.level}`}</strong>${i<shown?icon('check'):icon('lock')}</div>${i<shown?paragraph(hintText(mode,q,h,overrides)):`<p class="hint-locked-copy">${i>=limit?'선생님이 공개하지 않은 단계예요.':i===shown?(h.kind==='answer'?'마지막으로 정답을 확인할 수 있어요.':'이 힌트를 펼쳐 볼까요?'):'앞의 힌트를 먼저 살펴보세요.'}</p>`}${i===shown&&i<limit?`<button class="button ${h.kind==='answer'?'secondary':''}" id="reveal-hint">${h.kind==='answer'?'마지막 정답 펼치기':`힌트 ${h.level} 펼치기`}${icon(h.kind==='answer'?'lock':'spark')}</button>`:''}</li>`).join('')}</ol><button class="button secondary" id="back-to-question">문제로 돌아가기 ${icon('back')}</button>`;
  const wasOpen=DIALOG.open&&DIALOG.dataset.kind==='hint';
  const oldScroll=wasOpen?$('.dialog-body',DIALOG).scrollTop:0;
  showDialog(mode.id==='letter'?'도착한 도움 편지':'작은 도움 책갈피',html,{kind:'hint'});$('.dialog-body',DIALOG).scrollTop=oldScroll;
  $('#back-to-question').onclick=closeDialog;
  if($('#reveal-hint'))$('#reveal-hint').onclick=()=>{const next=shown+1;write(progressKey(mode),revealStage(progress(mode),q.number,q,next));transientReveal.set(key,next);chime();hintDialog(mode,q);const li=$$('.hint-step',DIALOG)[next-1];li?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});announce(`${q.hints[next-1].kind==='answer'?'정답을':'힌트를'} 펼쳤어요.`);};
}
function renderClassSuccess(mode,q) {
  frame(`${header(mode,{back:mode.hub})}<main id="main" class="class-success"><div class="success-seal">${icon('check')}</div>${subtitle('오늘의 독서 도장')}<h1>차곡, 한 권 완성!</h1><p>꼼꼼히 읽고 생각한 만큼<br>책 속 이야기가 더 가까워졌어요.</p><div class="success-book"><img src="${asset(q.cover)}" alt="${esc(q.title)} 원본 표지"><span class="completion-stamp">${icon('check')} 해결 완료</span></div><h2>${esc(q.title)}</h2><p class="small-note">${completedCount(progress(mode))} / 5 권의 문제를 해결했어요.</p>${button('다음 책 만나러 가기','next-book')}</main>`,'class-success-page');$('#next-book').onclick=()=>navigate(mode.hub);
}
function renderFinalMission(mode) {
  const f=data.story.letter.finalMission;
  frame(`${header(mode,{back:mode.hub})}<main id="main" class="final-mission"><span class="large-seal">${icon('mail')}</span>${subtitle('에필로그')}<h1>기억의 시작이 된 편지</h1><img class="final-cover" src="${asset(f.cover)}" alt="마지막 편지 원본 표지"><div class="puzzle-paper"><span class="kit-tag">${esc(f.kit)}</span><h2>${esc(f.question)}</h2><form id="final-form"><label class="sr-only" for="final-code">${esc(f.question)}</label><input id="final-code" autocomplete="off" autocapitalize="none" placeholder="편지 코드를 적어 주세요"><p id="final-status" class="form-status" role="status"></p><button class="button">편지 열기 ${icon('mail')}</button></form></div></main>`);
  $('#final-form').onsubmit=e=>{e.preventDefault();if(normalizeAnswer($('#final-code').value)===normalizeAnswer(f.answer)){write(f.doneKey,true);setMeta(mode,{finalDone:true});chime('success');navigate(mode.finalRoutes[0]);}else{$('#final-status').textContent='편지 코드를 다시 살펴봐 주세요.';chime('wrong');}};
}
function renderEnding(mode) {
  if(completedCount(progress(mode))<5){navigate(mode.hub,{},true);return;}
  if(mode.id==='letter'&&!meta(mode).finalDone&&!read(data.story.letter.finalMission.doneKey,false)){navigate(mode.hub,{v:'final'},true);return;}
  let steps;
  if(mode.id==='rabbit')steps=[...data.story.rabbit.ending.talks.map((text,i)=>({text,image:art(RABBIT_ENDING[i])})),{cinema:'rabbit-ending'}];
  else steps=[{text:data.story.letter.finalLetter.text,letter:true,image:asset(data.story.letter.finalLetter.originalImage),original:true,speaker:'내일의 나에게'},...data.story.letter.ending.slides.map((s,i)=>({text:plain(s.text),image:slideArt(s,true,i),speaker:s.img==='ptbin222.png'?'사서 선생님':'편지왔어요'}))];
  storyFlow(mode,{title:mode.id==='rabbit'?'우리의 같은 꿈':'내일의 나에게',steps,nextLabel:'마지막 책장 넘기기',prefix:'에필로그',onFinish:()=>{setMeta(mode,{endingDone:true});navigate(mode.finalRoutes[1]);}});
}
function renderOutro(mode) {
  if(completedCount(progress(mode))<5){navigate(mode.hub,{},true);return;}
  if(!meta(mode).endingDone){navigate(mode.finalRoutes[0],{},true);return;}
  const score=totalScore(progress(mode)), isCredits=new URLSearchParams(location.search).get('v')==='credits';
  if(isCredits)return renderCredits(mode);
  frame(`${header(mode,{back:mode.hub})}<main id="main" class="outro-main"><span class="success-seal">${icon('star')}</span>${subtitle('에필로그')}<h1>${mode.id==='rabbit'?'거울 너머에서,<br>우리 다시 만나':'여러분에게 보내는 편지'}</h1>${artFigure(art(mode.id==='rabbit'?'scene:tree-welcome':'scene:library-farewell'),'모험을 마친 이야기의 주인공')}<div class="story-paper">${paragraph(data.story[mode.id].outro.message)}</div><div class="final-score"><span>${mode.id==='rabbit'?'모험에서 모은 당근':'되찾은 마음의 기억'}</span><strong>${icon(mode.id==='rabbit'?'carrot':'mail')}${score}<small>${mode.id==='rabbit'?'개':'점'}</small></strong></div>${button('엔딩 크레딧 보기','show-credits')}<button class="button secondary" data-nav="ptb.html">다른 책장 만나기 ${icon('book')}</button><div class="outro-links"><button class="text-button" id="replay-ending">마지막 이야기 다시 보기</button></div></main>`,'outro-page');
  $('#show-credits').onclick=()=>setView({v:'credits'});$('#replay-ending').onclick=()=>navigate(mode.finalRoutes[0]);
}
function renderCredits(mode) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  frame(`${header(mode,{back:mode.finalRoutes[1]})}<main id="main" class="credits-main">${subtitle('함께 넘긴 마지막 책장')}<h1>오늘의 모험에<br>함께해 주셔서 고마워요.</h1><div id="cinema" class="cinema-stage credits-cinema"></div><div class="credits-paper"><div class="credits-window ${reduced?'still':''}"><div class="credits-roll" id="credits-roll"><span class="eyebrow">우리가 함께 만난 이야기</span><h2>${mode.title}</h2><div class="credit-books">${mode.questions.map(q=>`<div><img src="${asset(q.cover)}" alt="${esc(q.title)} 표지"><p>${esc(q.title)}</p></div>`).join('')}</div><div class="credit-thanks"><p>책을 펼친 여러분<br>함께 읽고 기다려 준 선생님<br>그리고 이야기를 건네는 도서관</p><strong>다음 책장에서 또 만나요.</strong></div></div></div></div>${button('나의 모험 기록으로','credits-return')}</main>`,'credits-page');
  const creditRoll=$('#credits-roll');creditRoll.style.animation='none';
  activeCinema=mountCinema($('#cinema'),{kind:`credits-${mode.track}`,onProgress:p=>{if(!reduced){const end=creditRoll.parentElement.clientHeight-creditRoll.scrollHeight-12;creditRoll.style.transform=`translateY(${120*(1-p)+end*p}px)`;}}});
  $('#credits-return').onclick=()=>navigate(mode.finalRoutes[1]);
}
function showRecord(mode) {
  if(!mode)return;const p=progress(mode);
  showDialog(mode.kind==='classroom'?'나의 독서 도장':'나의 모험 기록',`<p class="record-total">${completedCount(p)}권 완료${mode.kind==='game'?` · ${totalScore(p)}${mode.id==='rabbit'?'개 당근':'점 기억'}`:''}</p><div class="record-list">${mode.questions.map(q=>`<div><img src="${asset(q.cover)}" alt=""><span><strong>${esc(q.title)}</strong><small>${p[q.number]?.completed?mode.kind==='classroom'?'독서 도장 완료':`${p[q.number].score}${mode.id==='rabbit'?'개 당근':'점 기억'}`:'아직 펼치지 않은 이야기'}</small></span><i class="record-check ${p[q.number]?.completed?'done':''}">${icon(p[q.number]?.completed?'check':'book')}</i></div>`).join('')}</div>${mode.kind==='game'?'<p class="small-note">처음 문제를 해결했을 때의 기록이 남아요.</p>':''}`);
}
function adminView(title, html, {back = true, onClose} = {}) {
  const menuBack = back ? `<button type="button" class="admin-back">${icon('back')} 관리자 메뉴</button>` : '';
  showDialog(title, `${menuBack}${html}`, {kind:'admin', onClose});
  if (back) $('.admin-back', DIALOG).onclick = adminPanel;
  const heading = $('#dialog-title');
  heading.tabIndex = -1;
  heading.focus({preventScroll:true});
}
function adminLogin() {
  adminView('선생님 책상', `
    <p class="admin-intro">관리자 암호를 입력하면 수업 자료와 게임 설정을 열 수 있어요.</p>
    <form id="admin-access-form" class="admin-form" autocomplete="off">
      <label for="teacher-access-code">관리자 암호</label>
      <input id="teacher-access-code" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" required>
      <p id="admin-status" class="form-status" role="status"></p>
      <button class="button">관리자 메뉴 열기 ${icon('lock')}</button>
    </form>`, {back:false});
  const code = $('#teacher-access-code');
  if (!CSS.supports('-webkit-text-security', 'disc')) code.type = 'password';
  code.focus();
  $('#admin-access-form').onsubmit = event => {
    event.preventDefault();
    if (code.value === String(data.admin.password)) adminPanel();
    else $('#admin-status').textContent = '암호를 다시 확인해 주세요.';
  };
}
function adminPanel() {
  const sections = [
    ['sliders', '힌트 공개 범위', '활동별로 어디까지 공개할지 설정', adminRange],
    ['reset', '게임 초기화', '게임 기록·수업용 독서 도장 지우기', adminReset],
    ['file', '문제별 관리자 가이드', '문제별 PDF 보기와 다운로드', () => adminMaterials('guide')],
    ['kit', '단서책자·활동키트', '수업 자료 PDF 보기와 다운로드', () => adminMaterials('kits')],
    ['pencil', '힌트 문구 설정', '문제별 힌트 수정과 원래 문구 복원', adminHints],
  ];
  adminView('선생님 책상', `<div class="admin-menu">${sections.map(([symbol, label, note], index) => `
    <button type="button" class="admin-card" data-admin-section="${index}">
      <span class="admin-card-icon">${icon(symbol)}</span>
      <span class="admin-card-text"><strong>${label}</strong><small>${note}</small></span>
      ${icon('arrow', 'admin-card-arrow')}
    </button>`).join('')}</div>`, {back:false});
  $$('[data-admin-section]', DIALOG).forEach(control => {
    control.onclick = () => sections[Number(control.dataset.adminSection)][3]();
  });
}
function adminRange(message = '') {
  const settings = {...data.admin.defaults, ...read(data.admin.storageKey,{})};
  adminView('힌트 공개 범위', `
    <p class="admin-intro">이 기기에서 진행하는 활동에 적용돼요.</p>
    <form id="admin-settings" class="admin-form">
      ${data.admin.definitions.map(def => `<fieldset class="admin-group">
        <legend>${esc(def.title)}</legend>
        ${def.options.map(([value, label, desc]) => `<label class="setting-option">
          <input type="radio" name="${def.key}" value="${value}" ${Number(settings[def.key]) === value ? 'checked' : ''}>
          <span><strong>${esc(label)}</strong><small>${esc(desc)}</small></span>
        </label>`).join('')}
      </fieldset>`).join('')}
      <div class="admin-actions">
        <button class="button">설정 저장 ${icon('check')}</button>
        <button type="button" class="button secondary" id="settings-default">기본값으로 복원 ${icon('reset')}</button>
      </div>
      <p id="settings-status" class="form-status" role="status">${esc(message)}</p>
    </form>`);
  $('#admin-settings').onsubmit = event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const settings = Object.fromEntries(data.admin.definitions.map(def => [def.key, Number(form.get(def.key))]));
    $('#settings-status').textContent = write(data.admin.storageKey, settings)
      ? '공개 범위를 저장했어요.'
      : '공개 범위를 저장하지 못했어요.';
  };
  $('#settings-default').onclick = () => {
    if (write(data.admin.storageKey, data.admin.defaults)) adminRange('공개 범위를 기본값으로 복원했어요.');
    else $('#settings-status').textContent = '공개 범위를 복원하지 못했어요.';
  };
}
function adminPicker(id, label, choices, selected) {
  const current = choices.find(([value]) => value === selected)[1];
  return `<div class="admin-picker-field">
    <span class="admin-picker-label" id="${id}-label">${esc(label)}</span>
    <details class="admin-picker" id="${id}">
      <summary aria-labelledby="${id}-label ${id}-value">
        <span id="${id}-value">${esc(current)}</span>${icon('chevron')}
      </summary>
      <ul>${choices.map(([value, name]) => `<li><button type="button" data-choice="${esc(value)}" aria-pressed="${value === selected}">
        <span>${esc(name)}</span>${icon('check')}
      </button></li>`).join('')}</ul>
    </details>
  </div>`;
}
function bindAdminPicker(id, onSelect) {
  const picker = $(`#${id}`);
  $$('[data-choice]', picker).forEach(choice => {
    choice.onclick = () => {
      const value = choice.dataset.choice;
      if (choice.getAttribute('aria-pressed') !== 'true') {
        $('[aria-pressed="true"]', picker).setAttribute('aria-pressed', 'false');
        choice.setAttribute('aria-pressed', 'true');
        $(`#${id}-value`, picker).textContent = $('span', choice).textContent;
        onSelect(value);
      }
      picker.open = false;
      $(`#${id} summary`).focus({preventScroll:true});
    };
  });
}
function adminModePicker(selected, label = '활동 선택') {
  return adminPicker('admin-mode', label, Object.entries(ADMIN_MODE_LABELS), selected);
}
function adminReset() {
  let selected = currentMode?.id || 'rabbit';
  adminView('게임 초기화', `
    <p class="admin-intro">선택한 활동의 진행 기록을 지우고 북돋움 첫 화면으로 돌아가요.</p>
    <form id="admin-reset" class="admin-form">
      ${adminModePicker(selected)}
      <div class="admin-actions"><button class="button">진행 기록 초기화 ${icon('reset')}</button></div>
      <p id="reset-status" class="form-status" role="status"></p>
    </form>`);
  bindAdminPicker('admin-mode', value => { selected = value; });
  $('#admin-reset').onsubmit = event => {
    event.preventDefault();
    const id = selected;
    const mode = data.modes[id];
    const keys = data.admin.resetKeys[id];
    const wasLast = read('bdd_last_visit', null)?.mode === id;
    try {
      keys?.local.forEach(key => localStorage.removeItem(key));
      keys?.session.forEach(key => sessionStorage.removeItem(key));
      localStorage.removeItem(progressKey(mode));
      localStorage.removeItem(metaKey(mode));
      if (wasLast) localStorage.removeItem('bdd_last_visit');
    } catch {
      $('#reset-status').textContent = '진행 기록을 초기화하지 못했어요.';
      return;
    }
    for (const key of transientReveal.keys()) {
      if (key.startsWith(id + '-')) transientReveal.delete(key);
    }
    const message = `${ADMIN_MODE_LABELS[id]}의 진행 기록을 초기화했어요.`;
    navigate('index.html', {}, true);
    toast(message);
  };
}
function adminHints(id = currentMode?.id || 'rabbit', number = 1) {
  const mode = data.modes[id];
  const question = mode.questions.find(q => q.number === number);
  const hints = question.hints.filter(hint => hint.kind === 'hint');
  const overrides = read(HINT_TEXT_KEY, {});
  adminView('힌트 문구 설정', `
    <p class="admin-intro">저장하면 이 기기의 문제 화면에 바로 적용돼요.</p>
    <form id="admin-hints" class="admin-form">
      ${adminModePicker(id)}
      ${adminPicker('admin-question', '문제 선택', mode.questions.map(q => [q.number, `${q.number}. ${q.title}`]), number)}
      ${hints.map(hint => `<label for="admin-hint-${hint.level}">힌트 ${hint.level}</label>
        <textarea id="admin-hint-${hint.level}" rows="4" required>${'\n'}${esc(plain(hintText(mode, question, hint, overrides)))}</textarea>`).join('')}
      <div class="admin-actions">
        <button class="button">힌트 저장 ${icon('check')}</button>
        <button type="button" class="button secondary" id="admin-hint-default">이 문제의 원래 힌트로 복원 ${icon('reset')}</button>
      </div>
      <p id="admin-hints-status" class="form-status" role="status"></p>
    </form>`);
  const status = $('#admin-hints-status');
  bindAdminPicker('admin-mode', value => adminHints(value));
  bindAdminPicker('admin-question', value => adminHints(id, Number(value)));
  $('#admin-hints').onsubmit = event => {
    event.preventDefault();
    const inputs = hints.map(hint => $(`#admin-hint-${hint.level}`));
    const empty = inputs.find(input => !input.value.trim());
    if (empty) {
      status.textContent = '힌트 문구를 입력해 주세요.';
      empty.focus();
      return;
    }
    const updated = {...read(HINT_TEXT_KEY, {})};
    hints.forEach((hint, index) => { updated[hintKey(mode, question, hint)] = inputs[index].value; });
    status.textContent = write(HINT_TEXT_KEY, updated) ? '힌트 문구를 저장했어요.' : '힌트 문구를 저장하지 못했어요.';
  };
  $('#admin-hint-default').onclick = () => {
    const updated = {...read(HINT_TEXT_KEY, {})};
    for (const hint of hints) delete updated[hintKey(mode, question, hint)];
    if (!write(HINT_TEXT_KEY, updated)) {
      status.textContent = '힌트 문구를 복원하지 못했어요.';
      return;
    }
    for (const hint of hints) $(`#admin-hint-${hint.level}`).value = plain(hint.text);
    status.textContent = '이 문제의 힌트를 원래 문구로 복원했어요.';
  };
}
function adminPdfStem(id, file) {
  return id === 'rabbit' && file === 'guide' ? 'rabbit-guide-v2' : `${id}-${file}`;
}
function adminPdfUrl(id, file) {
  return asset(`assets/admin-pdfs/${adminPdfStem(id, file)}.pdf`);
}
function adminPdfList(kind, id) {
  const guide = kind === 'guide';
  const rows = guide
    ? data.modes[id].questions.map(q => ['guide', `${q.number}. ${q.title}`, q.number])
    : [['clues','단서책자'], ['activity','활동키트']];
  if (guide && id === 'letter') rows.push(['guide','편지 코드',6]);
  return rows.map(([file, label, page]) => {
    const url = adminPdfUrl(id, file);
    const filename = ADMIN_PDFS[id][file] + '.pdf';
    return `<li><div class="admin-file-label">${icon('file')}<span><strong>${esc(label)}</strong>
      ${guide ? '' : '<small>PDF</small>'}</span></div>
      <div class="admin-file-actions">
        <button type="button" data-view-pdf="${file}" data-pdf-start="${page || 1}" aria-label="${esc(label)} PDF 보기">보기</button>
        ${page ? '' : `<a href="${esc(url)}" download="${esc(filename)}" aria-label="${esc(label)} PDF 다운로드">다운로드</a>`}
      </div></li>`;
  }).join('');
}
function adminMaterials(kind, id = currentMode?.id || 'rabbit') {
  adminView(kind === 'guide' ? '문제별 관리자 가이드' : '단서책자·활동키트', `
    ${adminModePicker(id, '이야기·수업 선택')}
    <ul class="admin-files" id="admin-material-list">${adminPdfList(kind, id)}</ul>`);
  const list = $('#admin-material-list');
  bindAdminPicker('admin-mode', value => {
    id = value;
    list.innerHTML = adminPdfList(kind, id);
  });
  list.onclick = event => {
    const trigger = event.target.closest('[data-view-pdf]');
    if (!trigger) return;
    const {viewPdf, pdfStart} = trigger.dataset;
    const scroll = $('.dialog-body', DIALOG).scrollTop;
    openAdminPdf(id, viewPdf, Number(pdfStart), () => {
      adminMaterials(kind, id);
      $('.dialog-body', DIALOG).scrollTop = scroll;
      const button = $$('[data-view-pdf]', DIALOG).find(el =>
        el.dataset.viewPdf === viewPdf && el.dataset.pdfStart === pdfStart);
      button?.focus({preventScroll:true});
    });
  };
}
function openAdminPdf(id, file, firstPage, backToList) {
  const url = adminPdfUrl(id, file);
  const filename = ADMIN_PDFS[id][file] + '.pdf';
  const guide = file === 'guide';
  const fitContent = file === 'clues';
  const titles = data.modes[id].questions.map(q => q.title);
  const pageLabels = file === 'activity'
    ? KIT_PAGE_TAGS[id].map(tag => {
        const index = 'ABCDE'.indexOf(tag[0]);
        return {tag, title:index === -1 ? '편지 코드' : titles[index]};
      })
    : guide ? [...titles, '편지 코드'].map(title => ({title})) : [];
  let dispose;
  adminView(esc((guide && pageLabels[firstPage - 1]?.title) || 'PDF 보기'), `
    <div class="pdf-toolbar">
      <div class="pdf-toolbar-controls">
        <button type="button" class="admin-back" id="pdf-back">${icon('back')} 자료 목록으로</button>
        <div class="pdf-zoom" role="group" aria-label="페이지 크기">
          <button type="button" data-pdf-reduce disabled>축소</button>
          <button type="button" data-pdf-enlarge disabled>확대</button>
        </div>
        <a class="pdf-full-download" href="${esc(url)}" download="${esc(filename)}" aria-label="전체 PDF 다운로드">전체 받기</a>
        <div class="pdf-paging" role="group" aria-label="쪽 이동">
          <button type="button" data-pdf-prev disabled>이전 쪽</button>
          <button type="button" data-pdf-page-picker aria-expanded="false" aria-controls="pdf-page-list" disabled>
            <span class="pdf-page-count" aria-live="polite">쪽 선택</span>${icon('chevron')}
          </button>
          <button type="button" data-pdf-next disabled>다음 쪽</button>
        </div>
        <a class="pdf-current-download" data-pdf-download-page aria-disabled="true">현재 쪽 받기</a>
      </div>
      <ol class="pdf-page-list" id="pdf-page-list" aria-label="PDF 쪽 목록" hidden></ol>
    </div>
    <div class="pdf-page" tabindex="0" aria-label="PDF 페이지">
      <p class="pdf-status" role="status">PDF를 불러오는 중이에요.</p>
    </div>`, {back:false, onClose:() => {
      DIALOG.classList.remove('admin-pdf-mode', 'pdf-no-heading', 'pdf-clue-mode');
      dispose?.();
    }});
  DIALOG.classList.add('admin-pdf-mode');
  if (fitContent) DIALOG.classList.add('pdf-clue-mode');
  const back = $('#pdf-back', DIALOG);
  back.onclick = backToList;
  const heading = $('#dialog-title', DIALOG);
  if (!guide) {
    DIALOG.classList.add('pdf-no-heading');
    const close = $('#dialog-close', DIALOG);
    close.classList.add('pdf-close');
    $('.pdf-toolbar-controls', DIALOG).append(close);
    $('.dialog-top', DIALOG).hidden = true;
    back.focus({preventScroll:true});
  }
  const reader = $('.dialog-body', DIALOG);
  import('./pdf-preview.js').then(({mountPdfPreview}) => {
    if (!reader.isConnected || !DIALOG.open) return;
    const pageDownload = number => asset(`assets/admin-pdf-pages/${adminPdfStem(id, file)}/${number}.pdf`);
    const onPageChange = guide
      ? number => { heading.textContent = pageLabels[number - 1]?.title || 'PDF 보기'; }
      : undefined;
    dispose = mountPdfPreview(reader, {url, filename, firstPage, pageLabels, pageDownload, onPageChange, fitContent});
  }).catch(() => {
    if (reader.isConnected) $('.pdf-status', reader).textContent = 'PDF를 불러오지 못했어요. 다운로드해서 열 수 있어요.';
  });
}
render();
