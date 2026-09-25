/* Small, shared helpers for bounded and cancellable reader requests. */
window.KDLReader = {
 async fetchText(url,{signal,timeout=12000,method='GET',cache='default'}={}){
  const controller=new AbortController();
  const abort=()=>controller.abort();
  if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,timeout);
  try{
   const response=await fetch(url,{signal:controller.signal,method,cache,credentials:'omit'});
   if(!response.ok)throw new Error(`HTTP ${response.status}`);
   return method==='HEAD'?'':await response.text();
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort)}
 },
 parseWikiResponse(text){
  try{return JSON.parse(text)}catch(error){
   // Some Wikisource responses append a stray zero after the JSON object.
   if(!/\}\s*0\s*$/.test(text))throw error;
   return JSON.parse(text.replace(/(\})\s*0\s*$/,'$1'));
  }
 },
 normalizeWikiPage(page){return String(page||'').replace(/_/g,' ').trim()},
 wikiLink(href,root){
  try{
   const url=new URL(href,'https://wikisource.org');
   if(url.protocol!=='https:'||url.hostname!=='wikisource.org'||!url.pathname.startsWith('/wiki/'))return null;
   const page=this.normalizeWikiPage(decodeURIComponent(url.pathname.slice(6)));
   root=this.normalizeWikiPage(root);
   return root&&(page===root||page.startsWith(root+'/'))?{page,hash:url.hash}:null;
  }catch{return null}
 }
};
