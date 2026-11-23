export const LETTER_FILM_DURATION = 2416 / 60;
export const LETTER_FILM_URL = new URL('./assets/cinema/letter-six-scenes/ending-66c5f0682003.mp4', import.meta.url).href;
const poster = new URL('./assets/cinema/letter-six-scenes/first-frame.webp', import.meta.url).href;

export function mountLetterFilm(root, { autoplay, onComplete, onProgress, onPlaybackChange }) {
  const film = root.querySelector('video');
  const replayButton = root.querySelector('[data-control=replay]');
  const toggle = root.querySelector('[data-control=toggle]');
  const status = root.querySelector('[role=status]');
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let shouldStart = autoplay;
  let resumeWhenVisible = false;
  let finished = false;
  let animation = 0;

  function elapsed() {
    return finished ? LETTER_FILM_DURATION : film.currentTime;
  }
  function progress() {
    onProgress?.(finished ? 1 : Math.min(1, elapsed() / LETTER_FILM_DURATION));
  }
  function controls() {
    const running = !film.paused && !finished;
    root.dataset.playing = String(running);
    toggle.textContent = running ? '멈추기' : '재생';
    toggle.hidden = finished;
    onPlaybackChange?.({ running, completed: finished, current: elapsed(), duration: LETTER_FILM_DURATION });
  }
  function tick() {
    progress();
    if (!film.paused && !finished) animation = requestAnimationFrame(tick);
  }
  function play() {
    if (listeners.signal.aborted) return;
    shouldStart = false;
    resumeWhenVisible = false;
    if (finished || film.ended) {
      finished = false;
      film.currentTime = 0;
    }
    film.play().catch(() => {
      if (!listeners.signal.aborted) controls();
    });
  }
  function pause() {
    shouldStart = false;
    resumeWhenVisible = false;
    film.pause();
    controls();
  }
  function replay() {
    if (listeners.signal.aborted) return;
    finished = false;
    film.currentTime = 0;
    progress();
    play();
  }
  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(animation);
    controls();
    progress();
    onComplete?.();
  }
  function ready() {
    status.hidden = true;
    if (!shouldStart) return;
    shouldStart = false;
    if (reduced) {
      film.currentTime = Math.max(0, film.duration - 1 / 60);
      finish();
    } else if (document.hidden) {
      resumeWhenVisible = true;
    } else {
      play();
    }
  }
  function retry() {
    finished = false;
    shouldStart = true;
    status.textContent = '영상을 불러오는 중이에요…';
    film.load();
    controls();
  }
  film.addEventListener('loadedmetadata', ready, options);
  film.addEventListener('playing', () => {
    cancelAnimationFrame(animation);
    controls();
    tick();
  }, options);
  film.addEventListener('pause', () => {
    cancelAnimationFrame(animation);
    controls();
    progress();
  }, options);
  film.addEventListener('ended', finish, options);
  film.addEventListener('seeked', progress, options);
  film.addEventListener('timeupdate', progress, options);
  film.addEventListener('error', () => {
    cancelAnimationFrame(animation);
    status.hidden = false;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '다시 불러오기';
    button.onclick = retry;
    status.replaceChildren('영상을 불러오지 못했어요.', button);
    controls();
  }, options);
  toggle.addEventListener('click', () => film.paused ? play() : pause(), options);
  replayButton.addEventListener('click', replay, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !film.paused && !finished) {
      resumeWhenVisible = true;
      film.pause();
    } else if (!document.hidden && resumeWhenVisible) {
      play();
    }
  }, options);

  film.muted = true;
  film.playsInline = true;
  film.preload = 'auto';
  film.poster = poster;
  film.src = LETTER_FILM_URL;
  controls();
  return {
    play, pause, replay,
    destroy() {
      listeners.abort();
      cancelAnimationFrame(animation);
      film.pause();
      film.removeAttribute('src');
      film.load();
      root.remove();
    }
  };
}

// The existing frame-inspection and export tools can also request an exact frame from this film.
// A single decoder serializes seeks so concurrent thumbnail requests cannot render each other's frames.
let stillPlayer;
let seekQueue = Promise.resolve();
function waitForMedia(media, name) {
  return new Promise((resolve, reject) => {
    const clear = () => {
      media.removeEventListener(name, ready);
      media.removeEventListener('error', error);
    };
    const ready = () => { clear(); resolve(); };
    const error = () => { clear(); reject(new Error('크레딧 프레임을 읽을 수 없어요.')); };
    media.addEventListener(name, ready);
    media.addEventListener('error', error);
  });
}
function loadStillPlayer() {
  if (!stillPlayer) {
    const media = document.createElement('video');
    media.preload = 'auto';
    media.muted = true;
    media.playsInline = true;
    stillPlayer = waitForMedia(media, 'loadeddata').then(() => media).catch(error => {
      stillPlayer = undefined;
      throw error;
    });
    media.src = LETTER_FILM_URL;
  }
  return stillPlayer;
}
export function drawLetterFilmFrame(ctx, time) {
  const draw = async () => {
    const media = await loadStillPlayer();
    const target = Math.max(0, Math.min(media.duration - 1 / 60, time));
    if (Math.abs(media.currentTime - target) > 0.0001) {
      const ready = waitForMedia(media, 'seeked');
      media.currentTime = target;
      await ready;
    }
    const { width, height } = ctx.canvas;
    const scale = Math.min(width / media.videoWidth, height / media.videoHeight);
    const w = media.videoWidth * scale;
    const h = media.videoHeight * scale;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff9ed';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(media, (width - w) / 2, (height - h) / 2, w, h);
    ctx.restore();
  };
  const result = seekQueue.then(draw);
  seekQueue = result.catch(() => {});
  return result;
}
