const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('every interface locale supplies all reader-facing English keys', () => {
  const context = {window: {}};
  vm.runInNewContext(fs.readFileSync('assets/locale-complete.js', 'utf8'), context);
  const labels = context.window.KDL_COMPLETE;
  for (const locale of ['en', 'kmr', 'ckb', 'diq', 'hac', 'sdh']) {
    for (const key of Object.keys(labels.en)) {
      assert.equal(typeof labels[locale]?.[key], 'string', `${locale}.${key} is missing`);
      assert.ok(labels[locale][key].trim(), `${locale}.${key} is empty`);
    }
  }
});

test('interface translation keys used by the catalogue have matching labels', () => {
  const context = {window: {}};
  vm.runInNewContext(fs.readFileSync('assets/locale-complete.js', 'utf8'), context);
  const labels = context.window.KDL_COMPLETE;
  for (const file of ['index.html', 'assets/app.js', 'assets/discovery-ui.js']) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/data-i18n(?:-placeholder)?="([^"]+)"|\bt\('([^']+)'\)/g)) {
      const key = match[1] || match[2];
      if (key.includes('$')) continue;
      for (const locale of Object.keys(labels)) {
        assert.ok(labels[locale][key], `${file} uses missing ${locale}.${key}`);
      }
    }
  }
});
