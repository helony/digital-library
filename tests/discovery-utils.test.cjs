const {test}=require('node:test');
const assert=require('node:assert/strict');
const D=require('../assets/discovery-utils.js');
test('Latin accents and equivalent Arabic keyboard letters find the same title',()=>{
 assert.ok(D.matches('Dengbêj Şakiro','sakiro'));
 assert.equal(D.normalize('دیوانی نالی'),D.normalize('ديواني نالي'));
 assert.ok(D.matches('کتێبی کوردی','كتێبي كوردي'));
 assert.ok(!D.matches('هەورامی','سۆرانی'));
});
test('all query words are required without depending on their order',()=>{
 assert.ok(D.matches('Zembîlfiroş Karapetê Xaço','xaco zembilfiros'));
 assert.ok(!D.matches('Zembîlfiroş Karapetê Xaço','sakiro zembilfiros'));
});
test('a verified hosted reader file takes priority for every PDF action',()=>{
 assert.equal(D.preferredFile({slug:'volume-1',readerPath:'books/volume-1/book.pdf',url:'https://external.example/file.pdf'}),'books/volume-1/book.pdf');
 assert.equal(D.preferredFile({slug:'ballade-kurde-1859',archiveEligible:true,format:'pdf',url:'remote'}),'books/ballade-kurde-1859/book.pdf');
 assert.equal(D.preferredFile({slug:'not-archived-yet',archiveEligible:true,format:'pdf',url:'remote'}),'remote');
 assert.equal(D.preferredFile({slug:'linked',format:'pdf',url:'remote'}),'remote');
});
test('unavailable browser storage does not break discovery',()=>assert.deepEqual(D.readObject('missing',{}),{}));

test('local PDF resolution stays aligned with the verified archive manifest',()=>{
 const fs=require('node:fs'), path=require('node:path');
 const manifest=require('../books/archive-index.json');
 const expected=Object.fromEntries(manifest.items.filter(item=>item.ok&&item.path.endsWith('.pdf')).map(item=>[item.slug,item.path]));
 assert.deepEqual(D.verifiedPdfPaths,expected);
 for(const target of Object.values(D.verifiedPdfPaths)){const file=fs.openSync(path.join(__dirname,'..',target),'r');const signature=Buffer.alloc(5);fs.readSync(file,signature,0,5,0);fs.closeSync(file);assert.equal(signature.toString(),'%PDF-');}
});
