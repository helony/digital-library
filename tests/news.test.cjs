const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM, VirtualConsole} = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'news/index.html'), 'utf8');
const SITE = 'https://helony.github.io/digital-library/news/';
const fresh = () => new Date().toISOString();
const daysAgo = n => new Date(Date.now() - n * 86400000).toISOString();
const story = (title, slug, topics, publishedAt = daysAgo(400)) => ({
  id: slug, title, url: `https://globalvoices.org/2025/08/27/${slug}/`, publishedAt,
  author: 'Named writer', sourceId: 'global-voices', language: 'en', topics,
});
const collection = (changes = {}) => ({
  schemaVersion: 1, checkedAt: fresh(), lastSuccessfulCheck: fresh(),
  sources: [{id: 'global-voices', status: 'ok'}],
  items: [story('Kurdish language online', 'language', ['culture', 'people']), story('Kurdish political history', 'history', ['politics'], daysAgo(500))],
  ...changes,
});

const kurdishCollection = () => ({
  schemaVersion: 1, checkedAt: fresh(), lastSuccessfulCheck: fresh(),
  sources: [{id: 'voa-kmr', status: 'ok'}, {id: 'voa-ckb', status: 'ok'}],
  items: [
    {id: 'voa-kmr-8200001', title: 'Nûçeyên çanda kurdî', author: 'Dengê Amerîka', url: 'https://www.dengeamerika.com/a/cand/8200001.html', publishedAt: daysAgo(1), sourceId: 'voa-kmr', language: 'kmr', topics: ['culture']},
    {id: 'voa-ckb-8200002', title: 'هەواڵی کوردستان', author: 'دەنگی ئەمەریکا', url: 'https://www.dengiamerika.com/a/8200002.html', publishedAt: daysAgo(2), sourceId: 'voa-ckb', language: 'ckb', topics: ['politics']},
  ],
});

async function createApp({data = collection(), kurdish = kurdishCollection(), query = '?lang=en&articles=en', storedLocale, reject = false, rejectKurdish = false} = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(HTML, {url: SITE + query, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole});
  const {window} = dom;
  window.addEventListener('error', event => errors.push(event.error || event.message));
  if (storedLocale) window.localStorage.setItem('kdl_locale', storedLocale);
  const requests = [];
  window.fetch = async (url, options) => {
    requests.push({url, options});
    if (reject) throw new Error('Offline');
    if (rejectKurdish && url.includes('kurdish-news')) throw new Error('Kurdish feed unavailable');
    return {ok: true, json: async () => url.includes('kurdish-news') ? kurdish : data};
  };
  for (const script of window.document.querySelectorAll('script[src]')) {
    const file = path.resolve(ROOT, 'news', script.getAttribute('src').split('?')[0]);
    assert.ok(file.startsWith(ROOT + path.sep));
    vm.runInContext(fs.readFileSync(file, 'utf8'), dom.getInternalVMContext(), {filename: file});
  }
  await new Promise(resolve => setTimeout(resolve, 15));
  return {dom, window, document: window.document, errors, requests, close() { window.close(); }};
}

test('news uses only populated topic filters, keeps keyboard focus and original dates', async () => {
  const app = await createApp();
  try {
    const {document} = app;
    assert.equal(document.querySelectorAll('.news-card').length, 2);
    assert.deepEqual([...document.querySelectorAll('[data-topic]')].map(node => node.dataset.topic), ['all', 'politics', 'culture', 'people']);
    const politics = document.querySelector('[data-topic="politics"]');
    politics.focus();
    politics.click();
    assert.equal(document.activeElement, politics, 'Filtering must not recreate the focused control');
    assert.equal(politics.getAttribute('aria-pressed'), 'true');
    assert.equal(document.querySelectorAll('.news-card').length, 1);
    assert.equal(document.querySelector('.news-card h3').textContent, 'Kurdish political history');
    assert.equal(document.querySelector('#newsCount').textContent, 'Stories: 1');
    assert.match(document.querySelector('.news-published').textContent, /^Originally published:/);
    assert.ok(document.querySelector('.news-published time').dateTime);
    assert.equal(document.querySelector('#newsArchive').hidden, false);
    assert.equal(document.querySelector('#newsNotice').hidden, true, 'Old reporting is distinct from a failed daily refresh');
    document.querySelector('[data-topic="all"]').click();
    assert.equal(document.querySelectorAll('.news-card').length, 2);
    assert.equal(app.requests.length, 2);
    assert.equal(app.requests[0].url, '../data/news.json');
    assert.deepEqual(app.errors, []);
  } finally { app.close(); }
});

test('news respects locale priority and RTL while preserving English article titles', async () => {
  const app = await createApp({query: '?lang=ckb&articles=en', storedLocale: 'kmr'});
  try {
    const {document, window} = app;
    assert.equal(document.documentElement.lang, 'ckb');
    assert.equal(document.documentElement.dir, 'rtl');
    assert.equal(document.querySelector('#newsTitle').textContent, 'هەواڵ و کولتوور');
    assert.equal(document.querySelector('.news-card h3').lang, 'en');
    assert.equal(document.querySelector('.news-card h3').dir, 'ltr');
    assert.equal(document.querySelector('.news-card h3').textContent, 'Kurdish language online');
    assert.match(document.querySelector('[data-common-i18n="navAbout"]').href, /\?lang=ckb$/);
    const select = document.querySelector('#newsLanguage');
    for (const [locale, direction] of [['diq', 'ltr'], ['hac', 'rtl'], ['sdh', 'rtl'], ['kmr', 'ltr'], ['en', 'ltr']]) {
      select.value = locale;
      select.dispatchEvent(new window.Event('change', {bubbles: true}));
      assert.equal(document.documentElement.lang, locale);
      assert.equal(document.documentElement.dir, direction);
      assert.equal(window.localStorage.getItem('kdl_locale'), locale);
      assert.equal(document.querySelector('.news-card h3').textContent, 'Kurdish language online');
      assert.ok(document.querySelector('#newsTitle').textContent);
    }
    assert.equal(window.location.search, '?articles=en');
    assert.equal(new URL(document.querySelector('[data-common-i18n="navAbout"]').href).search, '');
    assert.deepEqual(app.errors, []);
  } finally { app.close(); }
  const stored = await createApp({query: '', storedLocale: 'diq'});
  try { assert.equal(stored.document.documentElement.lang, 'diq'); } finally { stored.close(); }
});

test('news separates successful refresh dates from publication dates and reports source failures', async () => {
  for (const status of ['ok', 'partial', 'error']) {
    const data = collection({lastSuccessfulCheck: daysAgo(5), sources: [{id: 'global-voices', status}]});
    const app = await createApp({data});
    try {
      const {document} = app;
      assert.equal(document.querySelector('#newsUpdated time').dateTime, data.checkedAt);
      assert.equal(document.querySelector('#newsNotice').hidden, false);
      assert.equal(document.querySelector('#newsNotice time').dateTime, data.lastSuccessfulCheck);
      assert.equal(document.querySelectorAll('.news-card').length, 2, 'Refresh failure must preserve collected stories');
      const expected = {ok: /over three days/, partial: /Some source checks/, error: /source could not be checked/};
      assert.match(document.querySelector('#newsNotice').textContent, expected[status]);
      assert.deepEqual(app.errors, []);
    } finally { app.close(); }
  }
});

test('news treats titles as text and refuses unsafe or unapproved article links', async () => {
  const harmlessText = '<img src=x onerror="window.injected=true"> Kurdish title';
  const data = collection({items: [
    story(harmlessText, 'safe-title', ['culture', '<script>']),
    {...story('Injected URL', 'bad', ['people']), url: 'javascript:alert(1)'},
    {...story('Spoofed source', 'spoof', ['politics']), url: 'https://globalvoices.org.evil.example/2025/08/27/spoof/'},
    {...story('Unapproved source', 'foreign', ['politics']), sourceId: 'unknown'},
    {...story('Invalid date', 'date', ['culture']), publishedAt: 'not a date'},
    {...story('Credentials', 'credentials', ['culture']), url: 'https://user:pass@globalvoices.org/2025/08/27/credentials/'},
    {...story('Unsafe scheme', 'http', ['culture']), url: 'http://globalvoices.org/2025/08/27/http/'},
    story('Duplicate', 'safe-title', ['culture']),
  ]});
  const app = await createApp({data});
  try {
    const {document, window} = app;
    assert.equal(document.querySelectorAll('.news-card').length, 1);
    assert.equal(document.querySelector('.news-card h3').textContent, harmlessText);
    assert.equal(document.querySelectorAll('.news-card img,.news-card script').length, 0);
    assert.equal(window.injected, undefined);
    assert.equal(document.querySelector('.news-card-topic').textContent, 'Culture');
    assert.equal(document.querySelector('.news-card-license').href, 'https://creativecommons.org/licenses/by/3.0/');
    assert.deepEqual(app.errors, []);
  } finally { app.close(); }
});

test('news has explicit network and malformed-data states without claiming a successful check', async () => {
  for (const options of [{reject: true}, {data: {schemaVersion: 9}}, {data: collection({checkedAt: null})}]) {
    const app = await createApp(options);
    try {
      const {document} = app;
      assert.match(document.querySelector('#newsUpdated').textContent, /could not be loaded/);
      assert.equal(document.querySelector('#newsUpdated time'), null);
      assert.equal(document.querySelector('#newsList').getAttribute('aria-busy'), 'false');
      assert.equal(document.querySelectorAll('.news-card').length, 0);
      assert.ok(document.querySelector('#newsSources a[href="https://globalvoices.org/about/global-voices-attribution-policy/"]'));
      assert.ok(document.querySelector('#newsSources a[href="https://globalvoices.org/"]'));
      assert.deepEqual(app.errors, []);
    } finally { app.close(); }
  }
});

test('news empty feed remains an honest empty state', async () => {
  const app = await createApp({data: collection({items: []})});
  try {
    const {document} = app;
    assert.equal(document.querySelector('#newsEmpty').hidden, false);
    assert.match(document.querySelector('#newsEmpty').textContent, /no stories/);
    assert.equal(document.querySelector('#newsTopics').children.length, 0);
    assert.equal(document.querySelector('#newsArchive').hidden, true);
    assert.equal(document.querySelector('#newsCount').textContent, 'Stories: 0');
    assert.deepEqual(app.errors, []);
  } finally { app.close(); }
});


test('Kurdish is the default; prominent controls separate native articles from English', async () => {
  const app = await createApp({query: '?lang=en'});
  try {
    const {document, window} = app;
    assert.deepEqual([...document.querySelectorAll('.news-card h3')].map(node => node.lang), ['kmr', 'ckb']);
    assert.equal(document.querySelector('#newsArchive').hidden, true);
    assert.equal(document.querySelector('.news-card h3').textContent, 'Nûçeyên çanda kurdî');
    const sorani = document.querySelector('[data-article-language="ckb"]');
    sorani.focus(); sorani.click();
    assert.equal(document.activeElement, sorani);
    assert.equal(document.querySelectorAll('.news-card').length, 1);
    assert.equal(document.querySelector('.news-card h3').dir, 'rtl');
    assert.equal(document.querySelector('.news-card h3').textContent, 'هەواڵی کوردستان');
    assert.match(document.querySelector('.news-original').href, /^https:\/\/www.dengiamerika.com\//);
    assert.match(document.querySelector('.news-original').textContent, /دەنگی ئەمەریکا/);
    assert.equal(document.querySelector('.news-card-license').href, 'https://www.voanews.com/p/5338.html');
    const select = document.querySelector('#newsLanguage');
    select.value = 'kmr'; select.dispatchEvent(new window.Event('change'));
    assert.equal(document.querySelector('.news-card h3').lang, 'ckb', 'Explicit reading language survives interface changes');
    document.querySelector('[data-article-language="en"]').click();
    assert.equal(document.querySelectorAll('.news-card').length, 2);
    assert.equal(document.querySelector('#newsArchive').hidden, false);
    assert.equal(new URL(window.location.href).searchParams.get('articles'), 'en');
    assert.deepEqual(app.errors, []);
  } finally { app.close(); }
});

test('Kurdish interface defaults to its own article language and survives reload via URL', async () => {
  for (const language of ['kmr', 'ckb']) {
    const app = await createApp({query: '?lang=' + language});
    try {
      assert.equal(app.document.querySelectorAll('.news-card').length, 1);
      assert.equal(app.document.querySelector('.news-card h3').lang, language);
      assert.deepEqual(app.errors, []);
    } finally { app.close(); }
  }
  const app = await createApp({query: '?lang=en&articles=ckb'});
  try { assert.equal(app.document.querySelector('.news-card h3').lang, 'ckb'); } finally { app.close(); }
});

test('one failed collection does not hide the other or substitute English for Kurdish', async () => {
  const app = await createApp({query: '?lang=en', rejectKurdish: true});
  try {
    assert.equal(app.document.querySelectorAll('.news-card').length, 0);
    assert.match(app.document.querySelector('#newsUpdated').textContent, /could not be loaded/);
    app.document.querySelector('[data-article-language="en"]').click();
    assert.equal(app.document.querySelectorAll('.news-card').length, 2);
    assert.ok(app.document.querySelector('#newsUpdated time'));
    assert.deepEqual(app.errors, []);
  } finally { app.close(); }
});

test('native news rejects spoofed publishers, mixed language metadata and duplicate article IDs', async () => {
  const data = kurdishCollection();
  const valid = data.items[0];
  data.items.push({...valid, url: 'https://www.dengeamerika.com/a/other-slug/8200001.html'});
  data.items.push({...valid, url: 'https://www.dengeamerika.com.evil.test/a/8200003.html'});
  data.items.push({...valid, url: 'https://www.dengiamerika.com/a/8200004.html'});
  data.items.push({...valid, url: 'https://www.dengeamerika.com/a/8200005.html', language: 'ckb'});
  const app = await createApp({query: '?lang=en', kurdish: data});
  try {
    assert.equal(app.document.querySelectorAll('.news-card').length, 2);
    assert.deepEqual(app.errors, []);
  } finally { app.close(); }
});
