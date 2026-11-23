import {getDocument, GlobalWorkerOptions} from './vendor/pdfjs/pdf.min.mjs';

const pdfAssets = new URL('./vendor/pdfjs/', import.meta.url);
GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', pdfAssets).href;

export function mountPdfPreview(root, {url, filename, firstPage, pageLabels, pageDownload, onPageChange, fitContent = false}) {
  const sheet = root.querySelector('.pdf-page');
  const viewer = root.closest('dialog');
  const toolbar = root.querySelector('.pdf-toolbar');
  const status = sheet.querySelector('[role="status"]');
  const counter = root.querySelector('.pdf-page-count');
  const picker = root.querySelector('[data-pdf-page-picker]');
  const pageList = root.querySelector('.pdf-page-list');
  const previous = root.querySelector('[data-pdf-prev]');
  const next = root.querySelector('[data-pdf-next]');
  const enlarge = root.querySelector('[data-pdf-enlarge]');
  const reduce = root.querySelector('[data-pdf-reduce]');
  const download = root.querySelector('[data-pdf-download-page]');
  const zoomLevels = [1, 1.35, 1.75, 2.25];
  let pdf, pageNumber = firstPage, zoom = 0, task, revision = 0, closed = false;
  let sheetWidth = sheet.clientWidth, sheetHeight = sheet.clientHeight;
  const pageButtons = [];

  const loading = getDocument({
    url,
    cMapUrl: new URL('cmaps/', pdfAssets).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('standard_fonts/', pdfAssets).href,
    iccUrl: new URL('iccs/', pdfAssets).href,
    wasmUrl: new URL('wasm/', pdfAssets).href,
    isEvalSupported: false,
  });

  function labelFor(number) {
    const label = pageLabels[number - 1];
    return label ? [label.tag, label.title].filter(Boolean).join(' · ') : '';
  }

  function updateControls() {
    counter.textContent = `${pageNumber} / ${pdf.numPages}쪽`;
    previous.disabled = pageNumber <= 1;
    next.disabled = pageNumber >= pdf.numPages;
    reduce.disabled = zoom === 0;
    enlarge.disabled = zoom === zoomLevels.length - 1;
    picker.disabled = false;
    const tag = pageLabels[pageNumber - 1]?.tag;
    const title = filename.replace(/\.pdf$/i, '');
    download.href = pageDownload(pageNumber);
    download.download = `${title} - ${tag ? tag + ' - ' : ''}${pageNumber}쪽.pdf`;
    download.removeAttribute('aria-disabled');
    pageButtons.forEach((button, index) => {
      if (index + 1 === pageNumber) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  async function renderPage(changedPage = false) {
    const current = ++revision;
    task?.cancel();
    updateControls();
    if (changedPage) {
      onPageChange?.(pageNumber);
      sheet.querySelector('canvas')?.remove();
      sheet.scrollTo(0, 0);
    }
    status.textContent = '페이지를 불러오는 중이에요.';
    try {
      const page = await pdf.getPage(pageNumber);
      if (closed || current !== revision) return;
      const natural = page.getViewport({scale:1});
      const availableWidth = Math.min(740, Math.max(180, sheet.clientWidth - 20));
      const visibleHeight = fitContent
        ? (parseFloat(getComputedStyle(viewer).maxHeight) || window.innerHeight) - toolbar.offsetHeight - 2
        : sheet.clientHeight - 16;
      const fitHeight = visibleHeight * natural.width / natural.height;
      const fitWidth = sheet.clientWidth >= 600 ? Math.min(availableWidth, Math.max(460, fitHeight)) : availableWidth;
      const width = fitWidth * zoomLevels[zoom];
      const scale = width / natural.width;
      const density = Math.min(window.devicePixelRatio || 1, 2, 2600 / (Math.max(natural.width, natural.height) * scale));
      const viewport = page.getViewport({scale:scale * density});
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      canvas.style.width = `${width}px`;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `PDF ${pageNumber}쪽`);
      task = page.render({canvas, viewport});
      await task.promise;
      if (closed || current !== revision) return;
      sheet.querySelector('canvas')?.remove();
      sheet.append(canvas);
      status.textContent = '';
    } catch {
      if (!closed && current === revision) {
        status.textContent = '이 페이지를 열지 못했어요. PDF를 다운로드해 볼 수 있어요.';
      }
    }
  }

  function togglePageList(open) {
    picker.setAttribute('aria-expanded', String(open));
    pageList.hidden = !open;
    if (open) {
      const selected = pageButtons[pageNumber - 1];
      selected.focus({preventScroll:true});
      pageList.scrollTop = selected.offsetTop;
    }
  }

  previous.onclick = () => { pageNumber--; togglePageList(false); void renderPage(true); };
  next.onclick = () => { pageNumber++; togglePageList(false); void renderPage(true); };
  enlarge.onclick = () => { zoom++; void renderPage(); };
  reduce.onclick = () => { zoom--; void renderPage(); };
  picker.onclick = () => togglePageList(pageList.hidden);

  const resize = new ResizeObserver(() => {
    if (sheet.clientWidth === sheetWidth && sheet.clientHeight === sheetHeight) return;
    const needsFit = sheetWidth !== sheet.clientWidth || (!fitContent && sheet.clientWidth >= 600);
    sheetWidth = sheet.clientWidth;
    sheetHeight = sheet.clientHeight;
    if (pdf && sheetWidth > 0 && needsFit) void renderPage();
  });
  resize.observe(sheet);
  const fitOnResize = () => { if (pdf) void renderPage(); };
  if (fitContent) window.addEventListener('resize', fitOnResize);

  loading.promise.then(loadedPdf => {
    if (closed) return;
    pdf = loadedPdf;
    pageNumber = Math.min(Math.max(1, firstPage), pdf.numPages);
    for (let number = 1; number <= pdf.numPages; number++) {
      const item = sheet.ownerDocument.createElement('li');
      const button = sheet.ownerDocument.createElement('button');
      const label = labelFor(number);
      button.type = 'button';
      button.textContent = label ? `${number}쪽 · ${label}` : `${number}쪽`;
      button.onclick = () => {
        pageNumber = number;
        togglePageList(false);
        picker.focus({preventScroll:true});
        void renderPage(true);
      };
      pageButtons.push(button);
      item.append(button);
      pageList.append(item);
    }
    void renderPage(true);
  }).catch(() => {
    if (!closed) status.textContent = 'PDF를 불러오지 못했어요. 다운로드해서 열 수 있어요.';
  });

  return () => {
    closed = true;
    resize.disconnect();
    if (fitContent) window.removeEventListener('resize', fitOnResize);
    task?.cancel();
    void loading.destroy().catch(() => {});
  };
}
