const speciesLabels = ['강아지', '고양이', '토끼'];
const arrowDirections = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

function countField(name, index, id) {
  return `
    <div class="vet-count-row" data-vet-species="${index}">
      <span id="${id}-species-${index}" class="vet-species-name">${name}</span>
      <div class="vet-stepper">
        <div class="vet-count-value" role="spinbutton" tabindex="0"
          aria-labelledby="${id}-species-${index}" aria-valuemin="0" aria-valuemax="9"
          aria-valuenow="0">0</div>
        <div class="vet-step-buttons">
          <button type="button" data-vet-delta="1" aria-label="${name} 수 올리기"><span aria-hidden="true">▴</span></button>
          <button type="button" data-vet-delta="-1" aria-label="${name} 수 내리기"><span aria-hidden="true">▾</span></button>
        </div>
      </div>
    </div>`;
}

function reportField(name) {
  return `
    <li class="vet-report-row">
      <span class="vet-species-name">${name}</span>
      <span class="vet-report-answer"></span>
      <span class="vet-report-mark"></span>
    </li>`;
}

export class HospitalUI {
  constructor(host, {onChange = () => {}, onFinish = () => {}, totalHost = host} = {}) {
    this.onChange = onChange;
    this.onFinish = onFinish;
    const id = host.id ? `${host.id}-counts` : 'vet-counts';
    const roundTotal = document.createElement('p');
    roundTotal.className = 'vet-round-total';
    roundTotal.setAttribute('role', 'status');
    roundTotal.setAttribute('aria-atomic', 'true');
    roundTotal.hidden = true;
    const element = document.createElement('div');
    element.className = 'vet-interface';
    element.hidden = true;
    element.innerHTML = `
      <section class="vet-panel" data-vet-panel="entry" role="dialog" aria-labelledby="${id}-title" hidden>
        <h2 id="${id}-title">동물 수 입력</h2>
        <div class="vet-count-fields">
          ${speciesLabels.map((label, index) => countField(label, index, id)).join('')}
        </div>
        <p class="vet-key-tip">← → 동물 선택 · ↑ ↓ 숫자 조절</p>
        <button type="button" class="vet-primary" data-vet-submit>제출하기</button>
      </section>
      <section class="vet-panel" data-vet-panel="report" role="dialog" aria-labelledby="${id}-report-title" hidden>
        <h2 id="${id}-report-title" data-vet-report-title tabindex="-1">결과</h2>
        <ul class="vet-report-list">${speciesLabels.map(reportField).join('')}</ul>
        <p class="vet-rewards" role="status" aria-atomic="true"></p>
        <button type="button" class="vet-primary" data-vet-next>다음 회차</button>
      </section>`;
    const portrait = document.createElement('div');
    portrait.className = 'vet-portrait';
    portrait.hidden = true;
    portrait.innerHTML = `
      <section class="vet-panel vet-portrait-card" role="dialog" aria-modal="true" aria-labelledby="${id}-portrait-title">
        <h2 id="${id}-portrait-title"></h2>
        <canvas width="384" height="288" aria-hidden="true"></canvas>
        <button type="button" class="vet-primary">닫기</button>
      </section>`;
    totalHost.append(roundTotal);
    host.append(element, portrait);
    this.roundTotal = roundTotal;
    this.element = element;
    this.portrait = portrait;
    this.portraitTitle = portrait.querySelector('h2');
    this.portraitCanvas = portrait.querySelector('canvas');
    this.portraitClose = portrait.querySelector('button');
    this.entry = element.querySelector('[data-vet-panel="entry"]');
    this.report = element.querySelector('[data-vet-panel="report"]');
    this.countFields = [...element.querySelectorAll('[data-vet-species]')].map(row => ({
      row,
      value: row.querySelector('[role="spinbutton"]'),
    }));
    this.reportTitle = element.querySelector('[data-vet-report-title]');
    this.reportRows = [...element.querySelectorAll('.vet-report-row')].map(row => ({
      row,
      answer: row.querySelector('.vet-report-answer'),
      mark: row.querySelector('.vet-report-mark'),
    }));
    this.rewards = element.querySelector('.vet-rewards');
    this.submit = element.querySelector('[data-vet-submit]');
    this.next = element.querySelector('[data-vet-next]');
    element.addEventListener('click', event => this.click(event));
    element.addEventListener('focusin', event => this.selectFocusedCount(event));
    portrait.addEventListener('click', event => {
      if (event.target === portrait || event.target === this.portraitClose) this.closePortrait();
    });
  }

  render(game, playing, arcade = false) {
    const phase = playing && (game?.phase === 'entry' || game?.phase === 'report') ? game.phase : null;
    const phaseChanged = phase !== this.phase || game !== this.game;
    this.observing = playing && game?.phase === 'explore';
    if (!this.observing || game !== this.game || game.room !== this.round) this.closePortrait(false);
    this.round = game?.room;
    this.phase = phase;
    this.game = game;
    this.arcade = arcade;
    this.roundTotal.hidden = !this.observing;
    const totalLabel = this.observing
      ? `전체 동물 ${game.counts.reduce((total, count) => total + count, 0)}마리` : '';
    if (this.roundTotal.textContent !== totalLabel) this.roundTotal.textContent = totalLabel;
    this.element.hidden = !phase;
    this.entry.hidden = phase !== 'entry';
    this.report.hidden = phase !== 'report';
    if (phase === 'entry') {
      this.renderCounts();
      if (phaseChanged) this.countFields[game.selectedSpecies].value.focus({preventScroll: true});
    } else if (phase === 'report') {
      this.renderReport();
      if (phaseChanged) this.reportTitle.focus({preventScroll: true});
    }
  }

  showPortrait(pet, draw) {
    if (!this.observing) return false;
    this.portraitTitle.textContent = speciesLabels[['dog','cat','rabbit'].indexOf(pet.species)];
    draw(pet, this.portraitCanvas);
    this.returnFocus = document.activeElement;
    this.portrait.hidden = false;
    this.portraitClose.focus({preventScroll: true});
    return true;
  }

  closePortrait(restoreFocus = true) {
    if (this.portrait.hidden) return;
    this.portrait.hidden = true;
    if (restoreFocus && this.returnFocus?.isConnected) this.returnFocus.focus({preventScroll: true});
    this.returnFocus = null;
  }

  renderCounts() {
    const {guesses, selectedSpecies} = this.game;
    this.countFields.forEach(({row, value}, index) => {
      const label = String(guesses[index]);
      row.classList.toggle('is-selected', index === selectedSpecies);
      if (label === value.textContent) return;
      value.textContent = label;
      value.setAttribute('aria-valuenow', label);
    });
  }

  renderReport() {
    const {reports} = this.game;
    const report = reports.at(-1);
    if (!report || (report === this.shownReport && this.shownArcade === this.arcade)) return;
    this.shownReport = report;
    this.shownArcade = this.arcade;
    this.reportTitle.textContent = `${report.round}회차 결과`;
    this.reportRows.forEach(({row, answer, mark}, index) => {
      const correct = report.correct[index];
      row.classList.toggle('is-correct', correct);
      answer.textContent = correct ? `${report.counts[index]}마리` :
        `입력 ${report.guesses[index]} · 실제 ${report.counts[index]}마리`;
      mark.textContent = correct ? '정답' : '오답';
    });
    this.rewards.textContent = this.arcade ? `획득한 금화 ${report.score}개` : `획득한 단서 ${report.score}장`;
    this.next.textContent = report.round === 3 ? '최종 결과 보기' : '다음 회차';
  }

  selectFocusedCount(event) {
    const field = event.target.closest('[data-vet-species]');
    if (this.phase !== 'entry' || !field) return;
    this.game.selectSpecies(Number(field.dataset.vetSpecies));
    this.renderCounts();
  }

  click(event) {
    const button = event.target.closest('button');
    if (this.phase === 'entry' && button === this.submit) {
      if (this.game.submitCounts()) this.changed();
      return;
    }
    if (this.phase === 'entry' && button?.dataset.vetDelta) {
      const index = Number(button.closest('[data-vet-species]').dataset.vetSpecies);
      this.game.selectSpecies(index);
      this.game.adjustCount(index, Number(button.dataset.vetDelta));
      this.changed();
      return;
    }
    if (this.phase === 'report' && button === this.next) {
      this.game.nextRound();
      this.changed();
      if (this.game?.ended) this.onFinish(this.game);
    }
  }

  changed() {
    this.render(this.game, true, this.arcade);
    this.onChange(this.game);
  }

  key(event) {
    if (!this.portrait.hidden) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        event.preventDefault();
        if (event.key === 'Escape') this.closePortrait();
        else this.portraitClose.focus();
      }
      return true;
    }
    if (!this.phase || event.altKey || event.ctrlKey || event.metaKey) return false;
    const direction = arrowDirections[event.code || event.key];
    if (direction && this.phase === 'entry') {
      event.preventDefault();
      this.game.moveSelection(...direction);
      this.renderCounts();
      if (direction[0]) this.countFields[this.game.selectedSpecies].value.focus({preventScroll: true});
      this.onChange(this.game);
      return true;
    }
    if (direction && this.phase === 'report') {
      event.preventDefault();
      return true;
    }
    if (event.code === 'Enter' && !event.target.closest?.('button')) {
      event.preventDefault();
      if (!event.repeat) {
        const button = this.phase === 'entry' ? this.submit : this.next;
        button.click();
      }
      return true;
    }
    return false;
  }
}
