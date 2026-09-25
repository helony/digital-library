const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('assets/discovery-ui.js','utf8');
const progressCode=source.slice(source.indexOf('function saveProgress('),source.indexOf('function renderContinueReading('));
const pdfCode=source.slice(source.indexOf('async function renderPdf('),source.indexOf('function openProblemReport('));
function fixture(){
 const element={scrollTop:0,scrollHeight:1200,clientHeight:200}, frames=[];
 const book={slug:'book',format:'wiki'};
 const context={readerBook:book,readerChapter:'',personalShelf:{progress:{}},restoringProgress:false,readerController:new AbortController(),persistShelf(){},requestAnimationFrame:fn=>frames.push(fn),$:()=>element,window:{KDLReader:{normalizeWikiPage:value=>String(value||'').replace(/_/g,' ').trim()}}};
 vm.createContext(context);vm.runInContext(progressCode,context);
 return {context,element,book,frames};
}
test('a saved chapter restores across equivalent underscore/space URLs',()=>{
 const {context,element,book,frames}=fixture();context.personalShelf.progress.book={chapter:'دیوانی_نالی/ا',ratio:0.4};
 context.restoreTextProgress(book,'دیوانی نالی/ا');frames.shift()();
 assert.equal(element.scrollTop,400);assert.equal(context.readerChapter,'دیوانی نالی/ا');
});
test('returning to contents does not reuse a different chapter scroll position',()=>{
 const {context,element,book,frames}=fixture();context.personalShelf.progress.book={chapter:'Book/Chapter',ratio:0.8};
 context.restoreTextProgress(book,'');frames.shift()();assert.equal(element.scrollTop,0);assert.equal(context.personalShelf.progress.book.chapter,'');
});
test('a stale restoration cannot overwrite a newly opened chapter',()=>{
 const {context,element,book,frames}=fixture();context.personalShelf.progress.book={chapter:'A',ratio:0.8};
 context.restoreTextProgress(book,'A');context.readerController.abort();context.readerController=new AbortController();
 context.restoreTextProgress(book,'B');frames.forEach(fn=>fn());assert.equal(element.scrollTop,0);assert.equal(context.personalShelf.progress.book.chapter,'B');
});
test('capture follows the rendered chapter even after browser navigation changes the URL',()=>{
 const {context,element}=fixture();context.readerChapter='Book/Rendered';context.location={href:'https://example.org/?chapter=Book/New'};element.scrollTop=650;
 context.captureTextProgress();assert.equal(context.personalShelf.progress.book.chapter,'Book/Rendered');assert.equal(context.personalShelf.progress.book.ratio,0.65);
});
test('a slow old PDF session is destroyed without replacing the newer PDF',async()=>{
 const pending=[],download={removeAttribute(){}};let active=0;
 const context={pdfSession:null,LOCALES:{en:{}},state:{locale:'en'},personalShelf:{progress:{}},$:()=>download,beginReaderLoad(){const id=++active;return {current:()=>id===active,signal:new AbortController().signal}},saveProgress(){},renderNativePdf(){throw new Error('Unexpected fallback')},window:{KDLPdfReader:{open:()=>new Promise(resolve=>pending.push(resolve))}}};
 vm.createContext(context);vm.runInContext(pdfCode,context);
 const a=context.renderPdf({slug:'A'},'books/A/book.pdf'),b=context.renderPdf({slug:'B'},'books/B/book.pdf');
 let oldDestroyed=false,newDestroyed=false;const oldSession={destroy(){oldDestroyed=true}},newSession={destroy(){newDestroyed=true}};
 pending[1](newSession);await b;pending[0](oldSession);await a;
 assert.equal(context.pdfSession,newSession);assert.equal(oldDestroyed,true);assert.equal(newDestroyed,false);
});
