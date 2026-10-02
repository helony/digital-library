const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM, VirtualConsole} = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SITE = 'https://helony.github.io/digital-library/';

// Run the real page, data, event handlers and renderer. Only external reader
// requests and the PDF canvas renderer are substituted; no browser is needed.
function createApp({query = '?lang=en', shelf, listening, locale = 'en', nativePdf = false} = {}) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(HTML, {
    url: SITE + query,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole: console,
  });
  const {window} = dom;
  const document = window.document;
  const pdfCalls = [];
  const downloads = [];
  window.addEventListener('error', event => errors.push(event.error || event.message));
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLAnchorElement.prototype.click = function () { downloads.push(this.href); };
  window.CSS = {escape: value => String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&')};
  if (locale) window.localStorage.setItem('kdl_locale', locale);
  if (shelf) window.localStorage.setItem('kdl_personal_shelf', JSON.stringify(shelf));
  if (listening) window.localStorage.setItem('kdl_listening_progress', JSON.stringify(listening));

  const readerContent = document.querySelector('#readerContent');
  Object.defineProperty(readerContent, 'scrollHeight', {get: () => 2000});
  Object.defineProperty(readerContent, 'clientHeight', {get: () => 500});
  window.fetch = async (url, options = {}) => {
    if (options.signal?.aborted) throw new window.DOMException('Aborted', 'AbortError');
    const address = String(url);
    let body;
    if (options.method === 'HEAD') body = '';
    else if (address.endsWith('/metadata.json')) body = JSON.stringify({sections: []});
    else if (address.includes('action=parse')) {
      body = JSON.stringify({parse: {text: {'*': '<p>Mocked source text.</p>'}, sections: []}});
    } else if (address.startsWith('books/') && address.endsWith('/content.html')) {
      body = '<p>Mocked preserved text.</p><p>A second paragraph.</p>';
    } else if (address.startsWith('stories/')) {
      body = '<main class="story-reader"><h1>Story</h1><p>Mocked story text.</p></main>';
    } else {
      throw new Error('Unexpected network request in integration test: ' + address);
    }
    return {ok: true, status: 200, text: async () => body};
  };
  window.KDLPdfReader = {
    async open(options) {
      pdfCalls.push(options);
      if (nativePdf === 'reject') throw new Error('Source does not allow canvas PDF loading');
      if (nativePdf) { options.onFallback();return {destroy() {}}; }
      options.container.innerHTML = '<p data-mock-pdf>PDF canvas substitute</p>';
      options.onProgress({page: options.initialPage, totalPages: 1000});
      return {destroy() {}};
    },
  };
  const context = dom.getInternalVMContext();
  for (const script of document.querySelectorAll('script[src]')) {
    const source = script.getAttribute('src').split('?')[0];
    if (source === 'assets/pdf-reader.js') continue;
    assert.ok(source.startsWith('assets/'), 'Test must load only local page scripts');
    vm.runInContext(fs.readFileSync(path.join(ROOT, source), 'utf8'), context, {filename: source});
  }
  const app = {
    dom, window, document, errors, pdfCalls, downloads,
    query: selector => document.querySelector(selector),
    all: selector => [...document.querySelectorAll(selector)],
    click(selector) {
      const node = typeof selector === 'string' ? document.querySelector(selector) : selector;
      assert.ok(node, 'Missing clickable element: ' + selector);
      node.dispatchEvent(new window.MouseEvent('click', {bubbles: true, cancelable: true}));
    },
    input(selector, value) {
      const node = document.querySelector(selector);
      assert.ok(node, 'Missing input: ' + selector);
      node.value = value;
      node.dispatchEvent(new window.Event('input', {bubbles: true}));
    },
    history(query) {
      window.history.replaceState({}, '', SITE + query);
      window.dispatchEvent(new window.PopStateEvent('popstate'));
    },
    shelf() { return JSON.parse(window.localStorage.getItem('kdl_personal_shelf') || '{}'); },
    close() { dom.window.close(); },
  };
  return app;
}

async function settled() {
  await new Promise(resolve => setTimeout(resolve, 35));
}

test('audio language filters and recording links lead to the correct playable or source-only story', () => {
  const app=createApp({query:'?mode=voices&lang=en'});
  try {
    assert.equal(app.all('#audioStoriesGrid [data-recording]').length,6);
    assert.equal(app.all('#audioStoriesGrid audio').length,3);
    assert.equal(app.all('#dengbejGrid [data-recording]').length,3);
    app.click('[data-audio-language="kmr"]');
    assert.equal(app.all('#audioStoriesGrid [data-recording]').length,2);
    assert.equal(app.all('#audioStoriesGrid audio').length,0);
    assert.ok(app.all('#audioStoriesGrid .story-source-play').every(a=>a.hostname==='kurdic.ames.cam.ac.uk'));
    app.history('?mode=voices&recording=hewrami-child-goat&lang=ckb');
    assert.equal(app.query('[data-audio-language="hac"]').getAttribute('aria-pressed'),'true');
    assert.ok(app.query('#audioStoriesGrid [data-recording="hewrami-child-goat"] audio'));
    assert.equal(app.document.documentElement.dir,'rtl');
    noErrors(app);
  } finally {app.close()}
});

test('listening resumes after navigation, unplayed cards preserve progress, and finishing clears it', () => {
  const id='hewrami-child-goat';
  const app=createApp({query:'?mode=voices&lang=en',listening:{[id]:{seconds:73,updated:1}}});
  try {
    // Switching language filters must not save an unloaded player's 0 over the bookmark.
    app.click('[data-audio-language="ckb"]');app.click('[data-audio-language="hac"]');
    let audio=app.query('[data-story-audio="'+id+'"]');
    Object.defineProperty(audio,'duration',{value:244});
    Object.defineProperty(audio,'readyState',{value:1});
    audio.dispatchEvent(new app.window.Event('loadedmetadata'));
    assert.equal(audio.currentTime,73);
    audio.currentTime=120;audio.dispatchEvent(new app.window.Event('pause'));
    app.click('[data-library-mode="all"]');
    app.click('[data-library-mode="voices"]');
    audio=app.query('[data-story-audio="'+id+'"]');
    Object.defineProperty(audio,'duration',{value:244});
    Object.defineProperty(audio,'readyState',{value:1});
    audio.dispatchEvent(new app.window.Event('loadedmetadata'));
    assert.equal(audio.currentTime,120);
    Object.defineProperty(audio,'ended',{value:true});
    audio.currentTime=244;audio.dispatchEvent(new app.window.Event('ended'));
    app.click('[data-library-mode="all"]');
    assert.equal(JSON.parse(app.window.localStorage.getItem('kdl_listening_progress'))[id],undefined);
    noErrors(app);
  } finally {app.close()}
});

test('only one story plays at a time and playback errors leave a usable source link', async () => {
  const app=createApp({query:'?mode=voices&lang=en'});
  try {
    let paused=0;
    const players=app.all('#audioStoriesGrid audio');
    players[0].pause=()=>{paused++};
    players[1].dispatchEvent(new app.window.Event('play'));
    assert.equal(paused,1);
    const card=players[0].closest('[data-recording]');
    players[0].play=()=>Promise.reject(new Error('Unavailable'));
    app.click(card.querySelector('[data-audio-toggle]'));
    await settled();
    assert.match(card.querySelector('[data-audio-status]').textContent,/Could not play/);
    assert.ok(card.querySelector('.audio-credits a[href="https://zenodo.org/records/15419952"]'));
    noErrors(app);
  } finally {app.close()}
});

function noErrors(app) {
  assert.deepEqual(app.errors.map(error => error.message || String(error)), []);
}

test('homepage searches books, recordings and performers without expanding the default Dengbêj preview', () => {
  const app = createApp();
  try {
    assert.equal(app.all('#bookGrid .book-card').length, 24);
    app.click('[data-library-mode="voices"]');
    assert.equal(app.all('#dengbejGrid [data-recording]').length, 3);
    app.input('#searchInput', 'Şakiro');
    assert.equal(app.query('#voicesBrowsePanel').hidden, true);
    assert.equal(app.query('#mediaSearchResults').hidden, false);
    assert.ok(app.query('#mediaSearchGrid [data-recording="neminim"]'));
    assert.ok(app.query('#performerSearchGrid [data-performer="sakiro"]'));
    assert.equal(app.query('#emptyState').hidden, true);
    noErrors(app);
  } finally { app.close(); }
});

test('featured reading follows the first row across sizes and retains its links after filtering', async () => {
  const app = createApp();
  try {
    const featured = app.query('#readingStart');
    for (const [width, columns] of [[1280, 4], [900, 3], [390, 2], [1280, 4]]) {
      app.window.innerWidth = width;
      app.window.dispatchEvent(new app.window.Event('resize'));
      assert.equal(featured.parentElement, app.query('#bookGrid'));
      assert.equal(featured.previousElementSibling, app.all('#bookGrid .book-card')[columns - 1]);
      assert.equal(featured.hidden, false);
    }
    app.input('#searchInput', 'no-such-book-928173');
    assert.equal(featured.hidden, true);
    app.input('#searchInput', '');
    assert.equal(app.query('#readingStart'), featured, 'Keep the original node and its event handlers');
    assert.equal(featured.hidden, false);
    app.click('#readingStart [data-featured-read="story-mame-alan"]');
    await settled();
    assert.equal(app.query('#reader').hidden, false);
    assert.ok(app.query('#readerContent .reader-article'));
    noErrors(app);
  } finally { app.close(); }
});

test('catalogue browse options toggle off and the remaining All books control resets them', () => {
  const app = createApp();
  try {
    assert.equal(app.all('[data-browse="all"]').length, 0);
    assert.equal(app.query('.shelf-heading').nextElementSibling, app.query('#browseChoices'));
    for (const key of ['short', 'novels', 'children', 'recent', 'saved']) {
      const selector = '[data-browse="' + key + '"]';
      app.click(selector);
      assert.equal(app.query(selector).getAttribute('aria-pressed'), 'true');
      assert.equal(app.query('#readingStart').hidden, true);
      app.click(selector);
      assert.equal(app.query(selector).getAttribute('aria-pressed'), 'false');
      assert.equal(app.all('#bookGrid .book-card').length, 24);
      assert.equal(app.query('#readingStart').hidden, false);
    }
    app.click('[data-browse="short"]');
    app.click('[data-library-mode="all"]');
    assert.equal(app.all('#browseChoices [aria-pressed="true"]').length, 0);
    assert.equal(app.all('#bookGrid .book-card').length, 24);
    noErrors(app);
  } finally { app.close(); }
});

test('Arabic keyboard variants return the same Nalî book on the real homepage', () => {
  const app = createApp();
  try {
    const results = text => {
      app.input('#searchInput', text);
      return app.all('#bookGrid .book-card').map(node => node.dataset.slug);
    };
    const kurdish = results('دیوانی نالی');
    assert.ok(kurdish.length, 'Nalî must be found');
    assert.deepEqual(results('ديواني نالي'), kurdish);
    noErrors(app);
  } finally { app.close(); }
});

test('switching to Soranî translates descriptions without filtering out other book languages', () => {
  const app = createApp();
  try {
    const before = app.all('#bookGrid .book-card').map(card => card.dataset.slug);
    const searchPlaceholder = app.query('#searchInput').placeholder;
    app.click('#languageButton');
    app.click('#languageGrid [data-locale="ckb"]');
    assert.equal(app.document.documentElement.lang, 'ckb');
    assert.equal(app.document.documentElement.dir, 'rtl');
    assert.equal(app.query('[data-book-language][aria-pressed="true"]').dataset.bookLanguage, 'all');
    assert.deepEqual(app.all('#bookGrid .book-card').map(card => card.dataset.slug), before);
    assert.notEqual(app.query('#searchInput').placeholder, searchPlaceholder);
    const book = [...app.window.KDL_BOOKS, ...app.window.KDL_STORIES].find(record => record.slug === before[0]);
    assert.equal(app.query('#bookGrid .book-summary').getAttribute('lang'), 'ckb');
    assert.equal(app.query('#bookGrid .book-summary').textContent, book.summary.ckb);
    assert.equal(app.window.localStorage.getItem('kdl_locale'), 'ckb');
    assert.equal(app.query('#languageDialog').hidden, true);
    noErrors(app);
  } finally { app.close(); }
});

test('saved books survive a reload and can be removed from the personal shelf', () => {
  let app = createApp();
  try {
    const first = app.query('#bookGrid [data-save]');
    const slug = first.dataset.save;
    app.click(first);
    assert.equal(first.getAttribute('aria-pressed'), 'true');
    app.click('[data-browse="saved"]');
    assert.equal(app.all('#bookGrid .book-card').length, 1);
    const shelf = app.shelf();
    app.close();
    app = createApp({query: '?lang=en&browse=saved', shelf});
    assert.equal(app.all('#bookGrid .book-card').length, 1);
    assert.equal(app.query('#bookGrid [data-save]').dataset.save, slug);
    assert.equal(app.query('#bookGrid [data-save]').getAttribute('aria-pressed'), 'true');
    app.click('#bookGrid [data-save]');
    assert.equal(app.all('#bookGrid .book-card').length, 0);
    assert.equal(app.query('#emptyState').hidden, false);
    noErrors(app);
  } finally { app.close(); }
});

test('a spoken speaker profile includes that speaker’s recording', () => {
  const app = createApp();
  try {
    app.input('#searchInput', 'Mohamad');
    app.click('#performerSearchGrid [data-performer="mohamad-saeed"]');
    assert.equal(app.query('#performerProfile').hidden, false);
    assert.ok(app.query('#voicesBrowsePanel [data-recording="mohamad-saeed-spoken-kurdish"]'));
    noErrors(app);
  } finally { app.close(); }
});

test('history navigation restores a recording deep link and performer selection', () => {
  const app = createApp();
  try {
    app.history('?lang=en&mode=voices&recording=zembilfiros-karapete-xaco');
    assert.equal(app.query('#voicesBrowsePanel').hidden, false);
    assert.ok(app.query('#dengbejGrid [data-recording="zembilfiros-karapete-xaco"]'));
    app.history('?lang=en&mode=voices&performer=karapete-xaco');
    assert.equal(app.query('#performerProfile').hidden, false);
    const cards = app.all('#dengbejGrid [data-recording]');
    assert.ok(cards.length > 1);
    assert.ok(cards.every(card => card.querySelector('[data-performer="karapete-xaco"]')));
    noErrors(app);
  } finally { app.close(); }
});

test('single-page preserved poetry resumes its saved position after reopening', async () => {
  const shelf = {saved: {}, progress: {zembilfiros: {format: 'text', ratio: 0.6, chapter: '', updated: 1}}};
  const app = createApp({query: '?lang=en&read=zembilfiros', shelf});
  try {
    await settled();
    assert.ok(app.query('#readerContent .reader-article'));
    assert.equal(app.query('#readerContent').scrollTop, 900);
    app.query('#readerContent').scrollTop = 600;
    app.click('#readerClose');
    assert.equal(app.shelf().progress.zembilfiros.ratio, 0.4);
    app.click('#continueGrid [data-related-read="zembilfiros"]');
    await settled();
    assert.equal(app.query('#readerContent').scrollTop, 600);
    noErrors(app);
  } finally { app.close(); }
});

test('finished and removed books stay off Continue reading after reload, with progress and saved books intact', async () => {
  for (const [action, status] of [['data-finish-book', 'finished'], ['data-remove-continue', 'dismissed']]) {
    const progress = {format: 'text', ratio: 1, chapter: '', updated: 1};
    const app = createApp({shelf: {saved: {zembilfiros: 1}, progress: {zembilfiros: progress}}});
    let reloaded;
    try {
      assert.ok(app.query('#continueGrid [data-related-read="zembilfiros"]'), '100% of a section must not finish a book automatically');
      assert.equal(app.query('#continueNotice').hidden, true);
      app.click('[' + action + '="zembilfiros"]');
      assert.equal(app.query('#reader').hidden, true, 'Action must not open the reader');
      assert.equal(app.all('#continueGrid .continue-card').length, 0);
      assert.equal(app.query('#continueNotice').hidden, false);
      assert.equal(app.document.activeElement, app.query('#continueUndo'));
      assert.equal(app.shelf().progress.zembilfiros.status, status);
      assert.equal(app.shelf().progress.zembilfiros.ratio, 1);
      assert.equal(app.shelf().saved.zembilfiros, 1);
      reloaded = createApp({shelf: app.shelf()});
      assert.equal(reloaded.query('#continueReading').hidden, true);
      assert.equal(reloaded.query('#readingStart').hidden, false);
      reloaded.click('#bookGrid .read-book[data-slug="zembilfiros"]');
      await settled();
      assert.equal(reloaded.query('#readerContent').scrollTop, 1500);
      reloaded.click('#readerClose');
      assert.ok(reloaded.query('#continueGrid [data-related-read="zembilfiros"]'));
      assert.equal(reloaded.shelf().progress.zembilfiros.status, 'reading');
      app.click('#continueUndo');
      assert.deepEqual(app.shelf().progress.zembilfiros, progress);
      assert.equal(app.query('#continueNotice').hidden, true);
      assert.equal(app.document.activeElement, app.query('[' + action + '="zembilfiros"]'));
      noErrors(app);noErrors(reloaded);
    } finally { app.close();reloaded?.close(); }
  }
});

test('hidden history does not fill the three-card limit, and reading again clears stale Undo', async () => {
  const progress = {
    'mem-u-zin': {format: 'text', ratio: 0.8, status: 'finished', updated: 5},
    'story-mame-alan': {format: 'text', ratio: 0.3, status: 'dismissed', updated: 4},
    zembilfiros: {format: 'text', ratio: 0.5, updated: 3},
    'diwana-melaye-ciziri': {format: 'text', ratio: 0.4, updated: 2},
    'story-siyabend-u-xece': {format: 'text', ratio: 0.2, updated: 1},
  };
  const app = createApp({shelf: {saved: {}, progress}});
  try {
    assert.equal(app.all('#continueGrid .continue-card').length, 3);
    app.click('[data-remove-continue="zembilfiros"]');
    app.click('#bookGrid .read-book[data-slug="zembilfiros"]');
    await settled();
    app.query('#readerContent').scrollTop = 1200;
    app.click('#readerClose');
    assert.equal(app.query('#continueNotice').hidden, true);
    assert.equal(app.shelf().progress.zembilfiros.ratio, 0.8);
    app.click('#continueUndo');
    assert.equal(app.shelf().progress.zembilfiros.ratio, 0.8);
    noErrors(app);
  } finally { app.close(); }
});

test('PDF completion and Undo keep its page, and continue actions translate in RTL', async () => {
  const app = createApp();
  try {
    const book = app.window.KDL_BOOKS.find(record => record.readerPath && record.format === 'pdf');
    app.input('#searchInput', book.slug);
    app.click('#bookGrid .read-book');
    await settled();
    app.pdfCalls.at(-1).onProgress({page: 17, totalPages: 1000});
    app.click('#readerClose');
    app.input('#searchInput', '');
    app.click('#languageButton');
    app.click('#languageGrid [data-locale="ckb"]');
    const finish = app.query('#continueGrid [data-finish-book]');
    assert.notEqual(finish.textContent, 'Mark as finished');
    app.click(finish);
    assert.equal(app.shelf().progress[book.slug].status, 'finished');
    assert.ok(app.query('#continueNoticeText').textContent.includes(book.title));
    assert.notEqual(app.query('#continueUndo').textContent, 'Undo');
    app.click('#continueUndo');
    app.click('#continueGrid [data-related-read]');
    await settled();
    assert.equal(app.pdfCalls.at(-1).initialPage, 17);
    noErrors(app);
  } finally { app.close(); }
});

test('reopening a removed PDF also restores Continue reading when using the native fallback', async () => {
  const app = createApp({nativePdf: true, shelf: {saved: {}, progress: {
    'makas-kurdische-studien-1900': {format: 'pdf', page: 17, totalPages: 100, status: 'dismissed', updated: 1},
  }}});
  try {
    assert.equal(app.query('#continueReading').hidden, true);
    app.click('#bookGrid .read-book[data-slug="makas-kurdische-studien-1900"]');
    await settled();
    assert.ok(app.query('#readerContent .pdf-frame').src.includes('#page=17'));
    app.click('#readerClose');
    assert.ok(app.query('#continueGrid [data-related-read="makas-kurdische-studien-1900"]'));
    assert.equal(app.shelf().progress['makas-kurdische-studien-1900'].status, 'reading');
    noErrors(app);
  } finally { app.close(); }
});

test('a first-time native PDF enters Continue reading and its manual bookmark survives a reload', async () => {
  const slug = 'mann-mukri-texts-1906';
  const app = createApp({nativePdf: 'reject'});
  vm.runInContext("bookBySlug('mann-mukri-texts-1906').startPage = 9", app.dom.getInternalVMContext());
  let reloaded;
  try {
    app.input('#searchInput', slug);
    app.click('#bookGrid .read-book');
    await settled();
    assert.equal(app.shelf().progress[slug].page, 9, 'An anthology opens at its catalogue start page');
    assert.equal(app.query('#nativePdfPage').max, '', 'Printed page counts must not limit PDF page bookmarks');
    assert.equal(app.query('#nativePdfPage').value, '9');
    const form = app.query('.native-pdf-bookmark');
    app.input('#nativePdfPage', '17');
    assert.equal(app.shelf().progress[slug].page, 9, 'Typing must not silently change the bookmark');
    form.dispatchEvent(new app.window.Event('submit', {bubbles: true, cancelable: true}));
    assert.equal(app.shelf().progress[slug].page, 17);
    assert.match(app.query('.native-pdf-saved').textContent, /17/);
    assert.match(app.query('[data-native-fullscreen]').href, /#page=17&view=FitH$/);
    assert.equal(app.query('.pdf-frame'), null, 'External fallback must not create another unreliable embed');
    assert.ok(app.query('.external-pdf-card'));
    assert.equal(app.query('[data-native-fullscreen]').target, '_blank');
    app.click('#readerClose');
    app.input('#searchInput', '');
    assert.equal(app.query('#continueReading').hidden, false);
    assert.equal(app.query('#continueGrid .continue-progress-label').textContent, 'Page 17');
    assert.equal(app.query('#continueGrid progress'), null, 'Unknown PDF totals must not produce an invented percentage');
    // Detached form handlers and late canvas callbacks cannot overwrite a saved bookmark.
    form.querySelector('input').value = '88';
    form.dispatchEvent(new app.window.Event('submit', {bubbles: true, cancelable: true}));
    app.pdfCalls.at(-1).onProgress({page: 99, totalPages: 100});
    assert.equal(app.shelf().progress[slug].page, 17);
    reloaded = createApp({nativePdf: true, shelf: app.shelf()});
    reloaded.click('#continueGrid [data-related-read="' + slug + '"]');
    await settled();
    assert.equal(reloaded.pdfCalls.at(-1).initialPage, 17);
    assert.equal(reloaded.query('#nativePdfPage').value, '17');
    assert.match(reloaded.query('[data-native-fullscreen]').href, /#page=17&view=FitH$/);
    assert.equal(reloaded.query('.pdf-frame'), null);
    noErrors(app);noErrors(reloaded);
  } finally { app.close();reloaded?.close(); }
});

test('native PDF page bookmarks clamp to known PDF bounds and ignore invalid values', async () => {
  const slug = 'makas-kurdische-studien-1900';
  const app = createApp({nativePdf: true, shelf: {saved: {}, progress: {
    [slug]: {format: 'pdf', page: 17, totalPages: 100, status: 'reading', updated: 1},
  }}});
  try {
    app.click('#continueGrid [data-related-read]');
    await settled();
    assert.equal(app.query('#nativePdfPage').max, '100');
    const save = value => {
      app.input('#nativePdfPage', value);
      app.query('.native-pdf-bookmark').dispatchEvent(new app.window.Event('submit', {bubbles: true, cancelable: true}));
    };
    save('999');assert.equal(app.shelf().progress[slug].page, 100);
    save('-2');assert.equal(app.shelf().progress[slug].page, 1);
    save('');assert.equal(app.shelf().progress[slug].page, 1);
    save('12.5');assert.equal(app.shelf().progress[slug].page, 1);
    save('23');assert.equal(app.shelf().progress[slug].page, 23);
    assert.equal(app.shelf().progress[slug].totalPages, 100);
    app.click('#readerClose');
    assert.equal(app.query('#continueGrid .continue-progress-label').textContent, 'Page 23 of 100');
    noErrors(app);
  } finally { app.close(); }
});

test('switching to the native PDF viewer keeps the last rendered page and measured total', async () => {
  const app = createApp();
  try {
    const book = app.window.KDL_BOOKS.find(record => record.readerPath && record.format === 'pdf');
    app.input('#searchInput', book.slug);
    app.click('#bookGrid .read-book');
    await settled();
    const session = app.pdfCalls.at(-1);
    session.onProgress({page: 17, totalPages: 1000});
    session.onFallback({page: 17});
    assert.equal(app.query('#nativePdfPage').value, '17');
    assert.equal(app.query('#nativePdfPage').max, '1000');
    assert.equal(app.shelf().progress[book.slug].page, 17);
    app.click('#readerClose');
    session.onFallback({page: 28});
    assert.equal(app.query('.native-pdf-bookmark'), null);
    assert.equal(app.shelf().progress[book.slug].page, 17);
    noErrors(app);
  } finally { app.close(); }
});

test('native PDF bookmark controls and confirmation are translated in every interface locale', async () => {
  for (const locale of ['en', 'kmr', 'ckb', 'diq', 'hac', 'sdh']) {
    const app = createApp({nativePdf: true, locale, query: '?lang=' + locale + '&read=mann-mukri-texts-1906'});
    try {
      await settled();
      const labels = app.window.KDL_COMPLETE[locale];
      assert.equal(app.query('.native-pdf-note').textContent, labels.nativePdfNote);
      assert.equal(app.query('.external-pdf-card p').textContent, labels.externalPdfNote);
      assert.equal(app.query('[data-native-fullscreen]').textContent, labels.openPdfTab + ' ↗');
      assert.equal(app.query('.native-pdf-bookmark button').textContent, labels.pdfSavePage);
      assert.equal(app.query('.native-pdf-bookmark label').textContent, labels.pdfBookmarkLabel);
      app.input('#nativePdfPage', '23');
      app.query('.native-pdf-bookmark').dispatchEvent(new app.window.Event('submit', {bubbles: true, cancelable: true}));
      assert.equal(app.query('.native-pdf-saved').textContent, labels.pdfPageSaved.replace('{page}', '23'));
      noErrors(app);
    } finally { app.close(); }
  }
});

test('reader, shelf download and resumed PDF all use the same preferred file', async () => {
  const app = createApp();
  try {
    const book = app.window.KDL_BOOKS.find(record => record.readerPath && record.format === 'pdf');
    assert.ok(book, 'A repaired PDF with a hosted readerPath must exist');
    app.input('#searchInput', book.slug);
    const download = app.query('#bookGrid [data-download]');
    assert.equal(download.getAttribute('href'), book.readerPath);
    app.click(download);
    await settled();
    assert.equal(app.downloads.at(-1), new URL(book.readerPath, SITE).href);
    app.click('#bookGrid .read-book');
    await settled();
    const session = app.pdfCalls.at(-1);
    assert.equal(session.url, book.readerPath);
    assert.equal(app.query('#readerDownload').getAttribute('href'), book.readerPath);
    session.onProgress({page: 17, totalPages: 1000});
    app.click('#readerClose');
    app.click('#continueGrid [data-related-read="' + book.slug + '"]');
    await settled();
    assert.equal(app.pdfCalls.at(-1).initialPage, 17);
    noErrors(app);
  } finally { app.close(); }
});

test('compact suggestion control keeps a translated name and opens the form in both directions', () => {
  const app = createApp();
  try {
    const opener = app.query('#suggestButton');
    assert.equal(opener.getAttribute('aria-label'), 'Suggest a book');
    for (const locale of ['en', 'ckb']) {
      if (locale !== 'en') {
        app.click('#languageButton');
        app.click('#languageGrid [data-locale="' + locale + '"]');
      }
      assert.equal(opener.getAttribute('aria-label'), opener.textContent);
      assert.equal(opener.title, opener.textContent);
      if (locale === 'ckb') assert.notEqual(opener.title, 'Suggest a book');
      opener.focus();
      app.click(opener);
      assert.equal(app.query('#suggestDialog').hidden, false);
      assert.ok(app.query('#suggestDialog').contains(app.document.activeElement));
      assert.ok(app.query('#suggestForm [name="title"]'));
      app.click('#suggestDialog [data-close-dialog]');
      assert.equal(app.query('#suggestDialog').hidden, true);
      assert.equal(app.document.activeElement, opener);
    }
    noErrors(app);
  } finally { app.close(); }
});


test('paused PDF deep links show information without reading, downloads or restored progress', async () => {
  const slug = 'seven-spi-dostoyevski';
  const app = createApp({query: '?lang=en&read=' + slug, shelf: {saved: [], progress: {[slug]: {page: 18, totalPages: 80, format: 'pdf', updated: Date.now()}}}});
  try {
    await settled();
    const book = app.window.KDL_BOOKS.find(b => b.slug === slug);
    assert.equal(book.accessPaused, true);
    assert.equal(app.pdfCalls.length, 0);
    assert.equal(app.query('#reader').hidden, true);
    assert.equal(app.query('#detailsPage').hidden, false);
    assert.equal(app.query('#detailsRead').hidden, true);
    assert.equal(app.query('#detailsDownload'), null);
    assert.ok(app.query('#detailsContent').textContent.includes(app.window.KDL_COMPLETE.en.rights_reading_paused));
    assert.equal(app.query('#continueGrid [data-related-read="' + slug + '"]'), null);
    await app.window.downloadBook(book);
    assert.equal(app.downloads.length, 0);
    app.window.closeDetails();
    app.input('#searchInput', slug);
    assert.equal(app.query('#bookGrid [data-download]'), null);
    assert.ok(app.query('#bookGrid .shelf-read').href.includes('?book='));
    assert.equal(fs.existsSync(path.join(ROOT, 'books', slug, 'book.pdf')), false);
    noErrors(app);
  } finally { app.close(); }
});
