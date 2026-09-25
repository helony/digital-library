const {test} = require('node:test');
const assert = require('node:assert/strict');
const {clampPage, renderDimensions, textLines, cancellable} = require('../assets/pdf-reader.js');

test('restored and typed page positions cannot leave the document', () => {
  assert.equal(clampPage(606, 606), 606);
  assert.equal(clampPage(999, 374), 374);
  assert.equal(clampPage(-4, 374), 1);
  assert.equal(clampPage('12', 374), 12);
  assert.equal(clampPage('not a page', 374), 1);
  assert.equal(clampPage(Infinity, 374), 1);
});

test('fit-width keeps a PDF within a narrow phone viewport', () => {
  const size = renderDimensions(612, 792, 328, 'fit', 3);
  assert.equal(size.width, 328);
  assert.ok(Math.abs(size.height / size.width - 792 / 612) < 0.01);
  assert.equal(size.ratio, 2);
  assert.equal(size.pixelWidth, 656);
});

test('large archival pages are bounded to a twelve-megapixel canvas', () => {
  const size = renderDimensions(2400, 3600, 1000, 3, 4);
  assert.ok(size.pixelWidth * size.pixelHeight <= 12000000);
  assert.equal(size.width, 7200);
  assert.equal(size.height, 10800);
  const huge = renderDimensions(10000, 20000, 1000, 3, 4);
  assert.ok(huge.pixelWidth * huge.pixelHeight <= 12000000);
  assert.throws(() => renderDimensions(0, 792, 328, 'fit', 2), /Invalid/);
});

test('accessible PDF text retains original strings and line breaks as text', () => {
  assert.equal(textLines({items: [{str:'دیوانی نالی', hasEOL:true}, {str:'<script>literal</script>'}, {type:'beginMarkedContent'}]}), 'دیوانی نالی\n<script>literal</script>');
});

test('closing a reader releases a wait even when the PDF library never settles', async () => {
  const controller = new AbortController();
  const waiting = cancellable(new Promise(() => {}), controller.signal);
  controller.abort();
  await assert.rejects(waiting, {name: 'AbortError'});
});

test('a stalled PDF load cannot leave loading controls indefinitely', async () => {
  await assert.rejects(cancellable(new Promise(() => {}), undefined, 15), /timed out/);
  assert.equal(await cancellable(Promise.resolve('ready'), undefined, 15), 'ready');
});
