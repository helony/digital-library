const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');

const records = JSON.parse(fs.readFileSync('data/catalogue-full.json', 'utf8')).records;
const dictionary = fs.readFileSync('assets/locale-complete.js', 'utf8');
const helper = fs.readFileSync('assets/page-locale.js', 'utf8');
const nonEnglish = ['kmr', 'ckb', 'diq', 'hac', 'sdh'];

function loadPage(slug, locale, prepare) {
  const dom = new JSDOM(fs.readFileSync(`book/${slug}/index.html`, 'utf8'), {
    url: `https://helony.github.io/digital-library/book/${slug}/index.html?lang=${locale}`,
    runScripts: 'outside-only',
  });
  const {window} = dom;
  window.KDL_BOOKS = records;
  Object.defineProperty(window.document, 'currentScript', {
    value: {src: 'https://helony.github.io/digital-library/assets/page-locale.js'},
  });
  prepare?.(window.document);
  window.eval(dictionary);
  window.eval(helper);
  return dom;
}

test('permanent PDF pages translate reading and download actions while preserving arrows', () => {
  for (const locale of nonEnglish) {
    const dom = loadPage('ballade-kurde-1859', locale);
    try {
      const {window} = dom;
      const labels = window.KDL_COMPLETE[locale];
      const actions = window.document.querySelectorAll('.details-actions a');
      assert.equal(actions[0].textContent, `${labels.openPdf} →`, `${locale}: read label`);
      assert.equal(actions[1].textContent, `↓ ${labels.downloadPdf}`, `${locale}: download label`);
      assert.equal(actions[0].lang, locale);
      assert.equal(actions[1].lang, locale);
      assert.equal(window.document.querySelector('.back-link').textContent, `← ${labels.backToBooks}`);
      assert.equal(window.document.querySelector('main h1').textContent, 'Ballade kurde');
    } finally { dom.window.close(); }
  }
});

test('all three generated preservation policies translate and survive switching back to English', () => {
  const examples = [
    ['ballade-kurde-1859', 'archivePolicyAutomatic'],
    ['bexceye-visne', 'archivePolicyManual'],
    ['neo-aramaic-kurdish-folklore-2022-v1', 'archivePolicyLicensed'],
  ];
  for (const [slug, key] of examples) {
    const dom = loadPage(slug, 'en');
    try {
      const {window} = dom;
      const {document} = window;
      const policy = document.querySelectorAll('.source-details > p')[3];
      const source = document.querySelector('.source-details > p a');
      const sourceText = source.textContent;
      const sourceUrl = source.href;
      const title = document.querySelector('main h1').textContent;
      const language = document.querySelector('.page-locale-select');
      for (const locale of [...nonEnglish, 'en']) {
        language.value = locale;
        language.dispatchEvent(new window.Event('change'));
        assert.equal(policy.textContent, window.KDL_COMPLETE[locale][key], `${slug}: ${locale}`);
        assert.equal(policy.lang, locale);
        assert.equal(policy.dir, window.KDL_COMPLETE[locale].dir);
        assert.equal(source.textContent, sourceText);
        assert.equal(source.href, sourceUrl);
        assert.equal(document.querySelector('main h1').textContent, title);
      }
      const actions = document.querySelectorAll('.details-actions a');
      assert.equal(actions[0].textContent, 'Read PDF →');
      assert.equal(actions[1].textContent, '↓ Download PDF');
    } finally { dom.window.close(); }
  }
});

test('unknown archival prose remains untouched rather than receiving an unrelated policy translation', () => {
  const original = 'A source-specific archival note that has not been translated.';
  const dom = loadPage('ballade-kurde-1859', 'ckb', document => {
    document.querySelectorAll('.source-details > p')[3].textContent = original;
  });
  try {
    const policy = dom.window.document.querySelectorAll('.source-details > p')[3];
    assert.equal(policy.textContent, original);
    assert.equal(policy.lang, 'en');
    assert.equal(policy.dir, 'ltr');
  } finally { dom.window.close(); }
});
