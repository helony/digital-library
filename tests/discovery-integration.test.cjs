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
function createApp({query = '?lang=en', shelf, locale = 'en'} = {}) {
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
    assert.equal(app.query('#varietyFilter').value, 'all');
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
