// The title can receive a selection while the game modules are still loading.
const title = document.getElementById('title-screen');
const loading = document.getElementById('loading');
const note = document.getElementById('loading-note');
const modes = ['escape', 'arcade'];
const publicPaths = ['/aquarium', '/aquarium/', '/aquarium/index.html'];
const publicGame = publicPaths.includes(location.pathname);
let pendingMode;
let playMode;

function readSave(key) {
 try { return JSON.parse(localStorage.getItem(key)); }
 catch { return null; }
}

function showLoading() {
 title.hidden = true;
 loading.hidden = false;
 document.getElementById('app').dataset.screen = 'loading';
}

function chooseTitleMode(event) {
 const mode = event.currentTarget.id.slice('title-'.length);
 if (playMode) { playMode(mode); return; }
 if (pendingMode) return;
 pendingMode = mode;
 showLoading();
}

const arcade = readSave('ptb_aquarium_arcade_v1');
const legacyPlayers = {
 escape: readSave('ptb_journey_v1'),
 arcade: arcade?.version === 1 ? arcade.run?.player || arcade.records?.[0]?.player : null,
};
for (const mode of modes) {
 const button = document.getElementById('title-' + mode);
 const player = readSave('ptb_aquarium_character_' + mode + '_v1') || legacyPlayers[mode];
 if (player?.character) button.textContent = button.textContent.replace('시작하기', '이어하기');
 button.addEventListener('click', chooseTitleMode);
}
if (publicGame) document.getElementById('test-edition-label').hidden = false;
else if (new URLSearchParams(location.search).has('start') || location.hash) showLoading();

export function connectTitleModes(handler) {
 playMode = handler;
 if (!pendingMode) return;
 const mode = pendingMode;
 pendingMode = undefined;
 playMode(mode);
}

export function showStartupError() {
 showLoading();
 note.textContent = '게임을 불러오지 못했어요. 새로고침해 다시 시도해 주세요.';
}
