/** A story picture is revealed as one decoded frame, never layer by layer. */
const decoded = new Map();
export function preloadScene(source) {
  if (!source) return Promise.resolve();
  if (decoded.has(source)) return decoded.get(source);
  const ready = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = async () => {
      try { await image.decode(); resolve(image); } catch (error) { reject(error); }
    };
    image.onerror = () => reject(new Error('Scene image unavailable'));
    image.src = source;
  }).catch(error => { decoded.delete(source); throw error; });
  decoded.set(source, ready);
  return ready;
}

export async function revealScene(figure) {
  if (figure.dataset.sceneState === 'ready' || figure.dataset.sceneState === 'pending') return;
  figure.dataset.sceneState = 'pending';
  figure.setAttribute('aria-busy', 'true');
  const status = figure.querySelector('.scene-status');
  try {
    // decode() on the actual displayed images also covers an uncached first visit.
    await Promise.all([...figure.querySelectorAll('img')].map(image => image.decode()));
    if (!figure.isConnected) return;
    figure.dataset.sceneState = 'ready';
    figure.setAttribute('aria-busy', 'false');
    if (status) status.hidden = true;
  } catch {
    if (!figure.isConnected) return;
    figure.dataset.sceneState = 'error';
    figure.setAttribute('aria-busy', 'false');
    if (status) {
      status.hidden = false;
      status.replaceChildren(document.createTextNode('그림을 불러오지 못했어요. '));
      const retry = document.createElement('button');
      retry.type = 'button'; retry.textContent = '다시 불러오기';
      retry.onclick = () => {
        figure.dataset.sceneState = 'loading';
        for (const image of figure.querySelectorAll('img')) { const source = image.src; image.removeAttribute('src'); image.src = source; }
        status.textContent = '장면을 준비하고 있어요…';
        revealScene(figure);
      };
      status.append(retry);
    }
  }
}

/** Keep the actual image node when consecutive lines belong to the same shot. */
export function retainScenes(previousRoot, nextRoot) {
  const old = new Map([...previousRoot.querySelectorAll('[data-scene-key]')].map(figure => [figure.dataset.sceneKey, figure]));
  for (const next of nextRoot.querySelectorAll('[data-scene-key]')) {
    const previous = old.get(next.dataset.sceneKey);
    if (previous?.dataset.sceneState !== 'ready') continue;
    previous.className = next.className;
    next.replaceWith(previous);
    old.delete(next.dataset.sceneKey);
  }
}
