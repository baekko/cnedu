import {POSTAL} from './postal-core.js?v268';
import {drawPostalMap} from './postal-route-map.js?v268';

function changeText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

export function syncPostalStats(game, byId) {
  const seconds = Math.ceil(game.remaining);
  const minute = String(Math.floor(seconds / 60)).padStart(2, '0');
  const second = String(seconds % 60).padStart(2, '0');
  const clock = `${minute}:${second}`;
  changeText(byId('time-value'), clock);
  const mapClock = byId('postal-map-time');
  if (mapClock) changeText(mapClock, clock);
  byId('time-value').closest('.timer').classList.toggle('urgent', seconds <= 8);
  byId('time-fill').style.transform = `scaleX(${game.remaining / game.round.seconds})`;
  changeText(byId('clue-value'), String(game.banked.size));
  const progress = byId('history-era');
  const {letters} = game.round;
  changeText(progress.closest('.hud-stat').querySelector('.hud-label'), `${game.room + 1}차 배달`);
  changeText(progress, `${letters - game.lettersLeft} / ${letters}`);
}

export class PostalUI {
  constructor(byId) {
    this.get = byId;
    this.map = byId('postal-map-overlay');
    this.report = byId('postal-report-overlay');
    this.canvas = byId('postal-map-canvas');
    this.viewport = byId('postal-map-viewport');
    this.zoom = byId('postal-map-zoom');
    this.zoom.addEventListener('click', () => this.setZoom(!this.expanded));
  }

  setZoom(expanded) {
    this.expanded = expanded;
    this.viewport.classList.toggle('expanded', expanded);
    this.zoom.setAttribute('aria-pressed', String(expanded));
    this.zoom.textContent = expanded ? '전체 보기' : '지도 확대';
    this.viewport.scrollLeft = expanded ? this.viewport.scrollWidth : 0;
    this.viewport.scrollTop = expanded ? Math.max(0, this.canvas.clientHeight * this.officeY - this.viewport.clientHeight / 2) : 0;
  }

  refreshMap(game) {
    const canvas = this.canvas;
    canvas.height = Math.round(canvas.width * game.village.height / game.village.width);
    drawPostalMap(canvas.getContext('2d'), game, 0, 0, canvas.width, canvas.height);
    const title = `${game.room + 1}차 배달 지도`;
    changeText(this.get('postal-map-title'), title);
    canvas.setAttribute('aria-label', `${title}. 오른쪽 우체국과 배달할 집 ${game.destinations.size}곳이 표시되어 있어요.`);
    this.officeY = game.village.office.y / game.village.height;
    this.setZoom(false);
  }

  refreshReport(game, coinMode) {
    let correct = 0;
    let wrong = 0;
    let unmailed = 0;
    for (const report of game.reports) {
      correct += report.correct;
      wrong += report.wrong;
      unmailed += report.unmailed;
    }
    changeText(this.get('postal-report-good'), wrong || unmailed
      ? `${correct}통을 정확히 배달했어요.` : `${correct}통을 모두 정확히 배달했어요.`);
    const wrongLine = this.get('postal-report-wrong');
    wrongLine.hidden = !wrong;
    changeText(wrongLine, `${wrong}통이 잘못 배달됐어요.`);
    const lateLine = this.get('postal-report-late');
    lateLine.hidden = !unmailed;
    changeText(lateLine, `시간이 끝나 ${unmailed}통을 배달하지 못했어요.`);
    changeText(this.get('postal-report-reward'), coinMode ? `받은 금화 ${correct}개` : `받은 단서 ${correct}장`);
    changeText(this.get('postal-report-next'), coinMode ? '게임 결과 보기' : '모은 단서 보기');
  }

  render(game, playing, coinMode = false) {
    const mapOpen = playing && game.mapOpen;
    const reportOpen = playing && game.phase === 'report' && game.room + 1 === POSTAL.villageCount;
    const openingMap = mapOpen && this.map.hidden;
    const openingReport = reportOpen && this.report.hidden;
    const closingMap = !mapOpen && !this.map.hidden;
    this.map.hidden = !mapOpen;
    this.report.hidden = !reportOpen;
    this.get('game-ui').inert = !!(mapOpen || reportOpen);
    if (openingMap) {
      this.refreshMap(game);
      this.get('postal-map-close').focus({preventScroll: true});
    } else if (openingReport) {
      this.refreshReport(game, coinMode);
      this.get('postal-report-next').focus({preventScroll: true});
    } else if (closingMap && playing) {
      this.get('postal-map-button').focus({preventScroll: true});
    }
  }
}
