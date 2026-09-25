const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');

function renderer(locale) {
  const window = {};
  vm.runInNewContext(fs.readFileSync('assets/locale-complete.js', 'utf8'), {window});
  const media = JSON.parse(fs.readFileSync('data/recordings.json', 'utf8'));
  const context = {
    window: {KDL_MEDIA: media}, state: {locale}, LOCALES: window.KDL_COMPLETE,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),
    t: key => window.KDL_COMPLETE[locale][key],
    bookBySlug: slug => ({slug, title: 'Zembîlfiroş'}),
    readingUrl: book => '?read=' + book.slug,
  };
  vm.runInNewContext(fs.readFileSync('assets/discovery-ui.js', 'utf8'), context);
  return {context, media};
}

test('shared Sorani media prose is labelled in both fallback interfaces', () => {
  for (const locale of ['hac', 'sdh']) {
    const {context, media} = renderer(locale);
    for (const record of media.recordings.filter(record => ['spoken', 'archive'].includes(record.kind))) {
      const dom = new JSDOM(context.recordingCard(record));
      const note = dom.window.document.querySelector('.media-language-note');
      assert.ok(note, `${locale}/${record.id} needs a visible language label`);
      assert.equal(note.lang, 'ckb');
      assert.equal(note.parentElement.lang, 'ckb');
      assert.equal(note.parentElement.dir, 'rtl');
      if (record.titleTranslations) assert.equal(dom.window.document.querySelector('h4').lang, 'ckb');
      dom.window.close();
    }
    const portrait = new JSDOM(context.performerPortrait(media.performers[0]));
    assert.equal(portrait.window.document.querySelector('img').lang, 'ckb');
    assert.equal(portrait.window.document.querySelector('figcaption').lang, 'ckb');
    portrait.window.close();
    const connection = new JSDOM(context.relatedPerformanceHtml({slug: 'zembilfiros'}));
    assert.equal(connection.window.document.querySelector('p').lang, 'ckb');
    assert.ok(connection.window.document.querySelector('.media-language-note'));
    connection.window.close();
  }
});

test('a genuine requested-language translation takes precedence over shared fallback metadata', () => {
  const {context} = renderer('hac');
  const value = {en: 'English text', ckb: 'Shared Sorani text', hac: 'Distinct reviewed translation'};
  assert.equal(context.localized(value), value.hac);
  assert.equal(context.localizedContent(value).language, 'hac');
  assert.equal(context.mediaFallbackNote(value), '');
});

test('matching interface language does not show an unnecessary fallback notice', () => {
  for (const locale of ['en', 'kmr', 'ckb', 'diq']) {
    const {context, media} = renderer(locale);
    assert.equal(context.mediaFallbackNote(media.performers[0].intro), '');
    assert.equal(context.localizedContent(media.performers[0].intro).language, locale);
  }
});
