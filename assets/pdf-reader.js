/* A one-page PDF reader. Literary text and PDF files are never rewritten. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KDLPdfReader = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';
  const PDFJS_VERSION = '6.3.289';
  const source = typeof document !== 'undefined' && document.currentScript?.src;
  const vendorRoot = source ? new URL('vendor/pdfjs/', source).href : 'assets/vendor/pdfjs/';
  const resources = vendorRoot;
  let libraryPromise;
  const defaults = {
    previousPage: 'Previous page', nextPage: 'Next page', pdfPage: 'Page',
    pdfOf: 'of', pdfZoom: 'Zoom', pdfFitWidth: 'Fit width', downloadPdf: 'Download PDF',
    loading: 'Loading…', pdfPageText: 'Page text', pdfNoText: 'This scanned page has no selectable text.',
    pdfPageFailed: 'This page could not be displayed.', pdfNative: 'Open browser reader',
    retryRead: 'Try again', pdfControls: 'PDF reading controls'
  };
  function clampPage(value, total) {
    const count = Math.max(1, Math.floor(Number(total) || 1));
    const page = Math.floor(Number(value));
    return Number.isFinite(page) ? Math.max(1, Math.min(count, page)) : 1;
  }
  function renderDimensions(pageWidth, pageHeight, availableWidth, zoom, pixelRatio) {
    if (!(pageWidth > 0 && pageHeight > 0)) throw new Error('Invalid PDF page size');
    const fit = Math.max(120, Number(availableWidth) || 120) / pageWidth;
    const scale = zoom === 'fit' ? fit : Math.max(0.25, Math.min(3, Number(zoom) || fit));
    const width = Math.max(1, Math.floor(pageWidth * scale));
    const height = Math.max(1, Math.floor(pageHeight * scale));
    // Bound canvas memory on high-density phones and very large archival pages.
    const ratio = Math.min(Math.max(0.1, Number(pixelRatio) || 1), 2, Math.sqrt(12000000 / (width * height)));
    return {scale, width, height, ratio, pixelWidth: Math.max(1, Math.floor(width * ratio)), pixelHeight: Math.max(1, Math.floor(height * ratio))};
  }
  function abortError() { return new DOMException('Reading cancelled', 'AbortError'); }
  function cancellable(promise, signal, timeout = 30000) {
    return new Promise((resolve, reject) => {
      let timer;
      const finish = (callback, value) => { clearTimeout(timer); signal?.removeEventListener('abort', abort); callback(value); };
      const abort = () => finish(reject, abortError());
      if (signal?.aborted) { reject(abortError()); return; }
      signal?.addEventListener('abort', abort, {once: true});
      timer = setTimeout(() => finish(reject, new Error('PDF loading timed out')), timeout);
      Promise.resolve(promise).then(value => finish(resolve, value), error => finish(reject, error));
    });
  }
  function loadLibrary() {
    if (!libraryPromise) libraryPromise = import(vendorRoot + 'pdf.min.mjs').then(pdfjs => {
      pdfjs.GlobalWorkerOptions.workerSrc = vendorRoot + 'pdf.worker.min.mjs';
      return pdfjs;
    }).catch(error => { libraryPromise = null; throw error; });
    return libraryPromise;
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function textLines(content) {
    return content.items.filter(item => typeof item.str === 'string').map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('').trim();
  }

  /**
   * open({container,url,slug,title,signal,labels,initialPage,onProgress,onFallback})
   * -> Promise<{destroy(),setPage(number),resize(),pageNumber,totalPages}>.
   * labels accepts the keys in defaults above; all have English fallbacks.
   * onProgress({slug,page,totalPages,progress}) runs after a page renders.
   * Initial failures reject so the caller can show its native iframe fallback.
   * Later page failures offer retry and onFallback({url,page,error}).
   */
  async function open(options) {
    const {container, url, slug = '', title = 'PDF', signal, initialPage = 1, onProgress, onFallback} = options;
    if (!container?.replaceChildren) throw new Error('A reader container is required');
    if (signal?.aborted) throw abortError();
    const pdfUrl = new URL(url, document.baseURI);
    if (!['https:', 'http:'].includes(pdfUrl.protocol)) throw new Error('Unsupported PDF URL');
    const labels = {...defaults, ...(options.labels || {})};
    const label = key => String(labels[key] || defaults[key]);
    const shell = element('section', 'kdl-pdf-reader');
    shell.setAttribute('aria-label', title);
    const toolbar = element('div', 'kdl-pdf-controls');
    toolbar.setAttribute('role', 'group'); toolbar.setAttribute('aria-label', label('pdfControls'));
    const button = (text, name) => { const node = element('button', 'kdl-pdf-button', text); node.type = 'button'; node.title = name; node.setAttribute('aria-label', name); return node; };
    const prev = button('‹', label('previousPage'));
    const next = button('›', label('nextPage'));
    prev.disabled = next.disabled = true;
    const paging = element('div', 'kdl-pdf-paging'); paging.dir = 'ltr';
    const pageLabel = element('label', 'kdl-pdf-page-label', label('pdfPage'));
    const pageInput = element('input', 'kdl-pdf-page');
    pageInput.type = 'number'; pageInput.min = '1'; pageInput.step = '1'; pageInput.inputMode = 'numeric'; pageInput.disabled = true;
    pageInput.setAttribute('aria-label', label('pdfPage'));
    const total = element('span', 'kdl-pdf-total');
    pageLabel.append(pageInput); paging.append(prev, pageLabel, total, next);
    const zoomLabel = element('label', 'kdl-pdf-zoom-label', label('pdfZoom'));
    const zoomInput = element('select', 'kdl-pdf-zoom');
    zoomInput.disabled = true;
    zoomInput.setAttribute('aria-label', label('pdfZoom'));
    [['fit', label('pdfFitWidth')], ['0.75', '75%'], ['1', '100%'], ['1.25', '125%'], ['1.5', '150%'], ['2', '200%'], ['3', '300%']].forEach(([value, text]) => {
      const option = element('option', '', text); option.value = value; zoomInput.append(option);
    });
    zoomLabel.append(zoomInput);
    const download = element('a', 'kdl-pdf-download', '↓ ' + label('downloadPdf'));
    download.href = pdfUrl.href; download.target = '_blank'; download.rel = 'noopener';
    if (pdfUrl.origin === new URL(document.baseURI).origin) download.download = '';
    toolbar.append(paging, zoomLabel, download);
    const status = element('p', 'kdl-pdf-status', label('loading')); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const viewport = element('div', 'kdl-pdf-viewport'); viewport.tabIndex = 0; viewport.setAttribute('aria-label', title);
    const paper = element('div', 'kdl-pdf-paper');
    const canvas = element('canvas', 'kdl-pdf-canvas'); canvas.setAttribute('role', 'img');
    const pageText = element('details', 'kdl-pdf-text');
    const textSummary = element('summary', '', label('pdfPageText'));
    const text = element('div', 'kdl-pdf-transcript'); text.dir = 'auto';
    pageText.append(textSummary, text); paper.append(canvas, pageText); viewport.append(paper);
    shell.append(toolbar, status, viewport); container.replaceChildren(shell);
    let destroyed = false, ready = false, pdf, loadingTask, renderTask, resizeTimer, observer, pageNumber = 1, sequence = 0;
    let queue = Promise.resolve(), requestedPage = initialPage, zoom = 'fit', lastWidth = 0;
    const abort = () => destroy();
    const active = () => !destroyed && !signal?.aborted;
    const controls = () => {
      pageInput.value = String(pageNumber); pageInput.max = String(pdf.numPages);
      total.textContent = `${label('pdfOf')} ${pdf.numPages}`;
      prev.disabled = !ready || pageNumber <= 1; next.disabled = !ready || pageNumber >= pdf.numPages;
      pageInput.disabled = zoomInput.disabled = !ready;
    };
    function destroy() {
      if (destroyed) return;
      destroyed = true; sequence++; clearTimeout(resizeTimer); observer?.disconnect();
      signal?.removeEventListener('abort', abort); root.removeEventListener?.('resize', resize);
      renderTask?.cancel();
      // PDFDocumentLoadingTask.destroy also releases its worker and network stream.
      if (loadingTask) Promise.resolve(loadingTask.destroy()).catch(() => {});
      canvas.width = canvas.height = 0;
    }
    signal?.addEventListener('abort', abort, {once: true});
    function failedPage(error) {
      if (!active()) return;
      shell.setAttribute('aria-busy', 'false');
      status.replaceChildren(element('span', '', label('pdfPageFailed')));
      const retry = button(label('retryRead'), label('retryRead'));
      retry.addEventListener('click', () => requestPage(requestedPage));
      const fallback = element(onFallback ? 'button' : 'a', 'kdl-pdf-button', label('pdfNative'));
      if (onFallback) { fallback.type = 'button'; fallback.addEventListener('click', () => { const page = pageNumber; destroy(); onFallback({url: pdfUrl.href, page, error}); }); }
      else { const nativeUrl = new URL(pdfUrl.href); nativeUrl.hash = 'page=' + pageNumber; fallback.href = nativeUrl.href; fallback.target = '_blank'; fallback.rel = 'noopener'; }
      status.append(retry, fallback);
    }
    async function draw(number, ticket) {
      if (!active() || ticket !== sequence) return;
      const page = await cancellable(pdf.getPage(number), signal);
      if (!active() || ticket !== sequence) return;
      const viewportBase = page.getViewport({scale: 1});
      const size = renderDimensions(viewportBase.width, viewportBase.height, viewport.clientWidth - 32, zoom, root.devicePixelRatio);
      const pageViewport = page.getViewport({scale: size.scale});
      canvas.width = size.pixelWidth; canvas.height = size.pixelHeight;
      canvas.style.width = size.width + 'px'; canvas.style.height = size.height + 'px';
      paper.style.width = size.width + 'px';
      text.replaceChildren(); pageText.open = false;
      canvas.setAttribute('aria-label', `${title} — ${label('pdfPage')} ${number}`);
      status.textContent = label('loading'); shell.setAttribute('aria-busy', 'true');
      renderTask = page.render({canvas, canvasContext: canvas.getContext('2d', {alpha: false}), viewport: pageViewport, transform: [size.ratio, 0, 0, size.ratio, 0, 0]});
      await renderTask.promise; renderTask = null;
      if (!active() || ticket !== sequence) return;
      pageNumber = number; ready = true; controls(); shell.setAttribute('aria-busy', 'false');
      status.textContent = `${label('pdfPage')} ${number} ${label('pdfOf')} ${pdf.numPages}`;
      // A storage quota/error in the host must not turn a readable page into an error.
      if (typeof onProgress === 'function') { try { onProgress({slug, page: number, totalPages: pdf.numPages, progress: number / pdf.numPages}); } catch {} }
      // Keep accessible page text available without blocking the next page render.
      page.getTextContent().then(content => {
        if (active() && ticket === sequence) text.textContent = textLines(content) || label('pdfNoText');
      }).catch(() => { if (active() && ticket === sequence) text.textContent = label('pdfNoText'); });
    }
    function requestPage(value, initial = false) {
      if (!active() || !pdf) return Promise.resolve();
      requestedPage = clampPage(value, pdf.numPages); const ticket = ++sequence;
      renderTask?.cancel();
      queue = queue.catch(() => {}).then(() => draw(requestedPage, ticket));
      if (initial) return queue;
      return queue.catch(error => { if (active() && ticket === sequence && error.name !== 'RenderingCancelledException') failedPage(error); });
    }
    function resize() {
      if (!active() || !pdf || zoom !== 'fit') return;
      const width = viewport.clientWidth;
      if (Math.abs(width - lastWidth) < 3) return;
      clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { lastWidth = viewport.clientWidth; requestPage(pageNumber); }, 120);
    }
    prev.addEventListener('click', () => { viewport.scrollTop = 0; requestPage(Number(requestedPage) - 1); });
    next.addEventListener('click', () => { viewport.scrollTop = 0; requestPage(Number(requestedPage) + 1); });
    pageInput.addEventListener('change', () => { viewport.scrollTop = 0; requestPage(pageInput.value); });
    zoomInput.addEventListener('change', () => { zoom = zoomInput.value; requestPage(pageNumber); });
    viewport.addEventListener('keydown', event => {
      if (!ready || event.target !== viewport || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); requestPage(Number(requestedPage) + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); requestPage(Number(requestedPage) - 1); }
    });
    try {
      const pdfjs = await cancellable(loadLibrary(), signal, 15000);
      if (!active()) throw abortError();
      loadingTask = pdfjs.getDocument({url: pdfUrl.href, cMapUrl: resources + 'cmaps/', cMapPacked: true, standardFontDataUrl: resources + 'standard_fonts/', wasmUrl: resources + 'wasm/', isEvalSupported: false, enableScripting: false, enableXfa: false, disableAutoFetch: true, disableStream: true});
      pdf = await cancellable(loadingTask.promise, signal);
      if (!active()) throw abortError();
      pageNumber = requestedPage = clampPage(initialPage, pdf.numPages); controls();
      await requestPage(pageNumber, true);
      if (!active()) throw abortError();
      lastWidth = viewport.clientWidth;
      if (root.ResizeObserver) { observer = new root.ResizeObserver(resize); observer.observe(viewport); }
      else root.addEventListener?.('resize', resize);
      return {destroy, resize, setPage: value => requestPage(value), get pageNumber() { return pageNumber; }, get totalPages() { return pdf.numPages; }};
    } catch (error) { destroy(); throw error; }
  }
  return {open, clampPage, renderDimensions, textLines, cancellable, PDFJS_VERSION};
});
