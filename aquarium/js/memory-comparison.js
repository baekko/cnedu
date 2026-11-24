import { MEMORY_SCENES } from './memory-scenes.js?v224';
import { drawMemoryPicture, loadMemoryAssets } from './memory-renderer.js?v224';

const savedPageKey = 'memory-comparison-page';
const page = document.querySelector('#page');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const status = document.querySelector('#status');
const retry = document.querySelector('#retry');
const pictures = document.querySelector('#pictures');
const zoom = document.querySelector('#zoom');
const zoomLabel = document.querySelector('#zoom-label');
const zoomPicture = document.querySelector('#zoom-picture');
const panels = {
 original: document.querySelector('#original'),
 changed: document.querySelector('#changed'),
};

function loadSavedPage() {
 try { return localStorage.getItem(savedPageKey); } catch { return null; }
}

function pageNumber(value) {
 const n = Number(value);
 return Number.isInteger(n) && n >= 1 && n <= MEMORY_SCENES.length ? n : null;
}

const numberedPages = new Map(MEMORY_SCENES.map((scene, index) => [scene.comparisonNumber, index + 1]));
const positionFromNumber = number => numberedPages.get(Number(number));
const fromLink = location.hash.match(/^#p(\d+)$/);
let currentPage = positionFromNumber(fromLink?.[1]) ?? positionFromNumber(loadSavedPage()) ?? 1;
let request = 0;
let assetRequest;

function assets() {
 if (!assetRequest) {
  assetRequest = loadMemoryAssets().catch(error => {
   assetRequest = undefined;
   throw error;
  });
 }
 return assetRequest;
}

for (const [index, scene] of MEMORY_SCENES.entries()) {
 page.add(new Option(String(scene.comparisonNumber).padStart(2, '0') + ' · ' + scene.title, index + 1));
}

async function showPage(number) {
 const nextPage = pageNumber(number);
 if (!nextPage) return;
 currentPage = nextPage;
 const id = ++request;
 const scene = MEMORY_SCENES[currentPage - 1];
 page.value = String(currentPage);
 previous.disabled = currentPage === 1;
 next.disabled = currentPage === MEMORY_SCENES.length;
 history.replaceState(null, '', '#p' + scene.comparisonNumber);
 try { localStorage.setItem(savedPageKey, String(scene.comparisonNumber)); } catch {}
 status.hidden = false;
 status.textContent = '그림을 불러오고 있어요.';
 pictures.hidden = true;
 retry.hidden = true;
 try {
  const loaded = await assets();
  const art = await loaded.loadRound(scene, scene.spots.map(spot => spot.id));
  if (id !== request) return;
  drawMemoryPicture(panels.original.getContext('2d'), art);
  drawMemoryPicture(panels.changed.getContext('2d'), art, scene.spots);
  pictures.hidden = false;
  status.hidden = true;
 } catch {
  if (id !== request) return;
  status.textContent = '그림을 불러오지 못했어요.';
  retry.hidden = false;
 }
}

page.addEventListener('change', () => showPage(page.value));
previous.addEventListener('click', () => showPage(currentPage - 1));
next.addEventListener('click', () => showPage(currentPage + 1));
retry.addEventListener('click', () => showPage(currentPage));
window.addEventListener('hashchange', () => {
 const match = location.hash.match(/^#p(\d+)$/);
 if (match) showPage(positionFromNumber(match[1]));
});

for (const button of document.querySelectorAll('.enlarge')) {
 button.addEventListener('click', () => {
  const original = button.dataset.view === 'original';
  zoomLabel.textContent = MEMORY_SCENES[currentPage - 1].title + (original ? ' · 원본' : ' · 달라진 그림');
  zoomPicture.getContext('2d').drawImage(panels[button.dataset.view], 0, 0);
  zoom.showModal();
 });
}
showPage(currentPage);
