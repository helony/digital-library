const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function helpers(fetch){
 const context={window:{},fetch,AbortController,URL,setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync('assets/reader-utils.js','utf8'),context);
 return context.window.KDLReader;
}
test('reads valid wiki JSON and the known trailing-zero response; rejects malformed data',()=>{
 const h=helpers();
 assert.equal(h.parseWikiResponse('{"parse":{"text":"ok"}}').parse.text,'ok');
 assert.equal(h.parseWikiResponse('{"parse":{"text":"ok"}}\n0').parse.text,'ok');
 assert.throws(()=>h.parseWikiResponse('{"parse": broken}0'));
 assert.throws(()=>h.parseWikiResponse('{"parse":{}}other'));
});
test('only turns chapters belonging to the current book into internal links',()=>{
 const h=helpers();
 const chapter=h.wikiLink('https://wikisource.org/wiki/دیوانی_نالی/ا#poem','دیوانی نالی');
 assert.equal(chapter.page,'دیوانی نالی/ا');assert.equal(chapter.hash,'#poem');
 assert.equal(h.wikiLink('https://wikisource.org/wiki/دیوانی_نالیfake/ا','دیوانی نالی'),null);
 assert.equal(h.wikiLink('https://example.org/wiki/دیوانی_نالی/ا','دیوانی نالی'),null);
 assert.equal(h.wikiLink('javascript:alert(1)','دیوانی نالی'),null);
 assert.equal(h.wikiLink('https://wikisource.org/wiki/%ZZ','دیوانی نالی'),null);
});
test('a stalled response body times out, even after headers arrive',async()=>{
 const h=helpers(async(_,{signal})=>({ok:true,text:()=>new Promise((resolve,reject)=>{if(signal.aborted)reject(new Error('aborted'));else signal.addEventListener('abort',()=>reject(new Error('aborted')))})}));
 await assert.rejects(h.fetchText('/slow',{timeout:15}),/aborted/);
});
test('closing or changing books cancels an in-flight request',async()=>{
 const parent=new AbortController();let child;
 const h=helpers(async(_,{signal})=>{child=signal;return {ok:true,text:()=>new Promise((resolve,reject)=>{if(signal.aborted)reject(new Error('aborted'));else signal.addEventListener('abort',()=>reject(new Error('aborted')))})}});
 const reading=h.fetchText('/book',{signal:parent.signal});
 await Promise.resolve();parent.abort();
 await assert.rejects(reading,/aborted/);assert.equal(child.aborted,true);
});
test('HTTP failures are rejected so the reader can show recovery actions',async()=>{
 const h=helpers(async()=>({ok:false,status:404}));
 await assert.rejects(h.fetchText('/missing'),/HTTP 404/);
});
