/* Discovery, listening and a small personal shelf, shared with app.js. */
const MEDIA=window.KDL_MEDIA||{performers:[],recordings:[]};
function localized(value){return typeof value==='string'?value:(value?.[state.locale]||value?.en||'')}
function mediaLanguage(){return MEDIA.localeFallbacks?.[state.locale]||state.locale}
function performerById(id){return MEDIA.performers.find(p=>p.id===id)}
function recordingById(id){return MEDIA.recordings.find(r=>r.id===id)}
function performerLinks(r){return (r.performerIds||[]).map(id=>{const p=performerById(id);return p?`<a href="?mode=voices&performer=${encodeURIComponent(id)}&lang=${state.locale}" data-performer="${escapeHtml(id)}" dir="auto">${escapeHtml(p.name)}</a>`:''}).join(' · ')}
function recordingSearchText(r){return [r.title,r.credit,...Object.values(r.titleTranslations||{}),...(r.aliases||[]),...Object.values(r.description||{}),...(r.performerIds||[]).flatMap(id=>{const p=performerById(id);return p?[p.name,...(p.aliases||[])]:[]})].join(' ')}
function performerPortrait(p){
 const portrait=p.portrait;if(!portrait)return '';
 const credit=localized(portrait.creditI18n)||portrait.credit||'';
 return `<figure class="performer-portrait"><img src="${escapeHtml(portrait.src)}" alt="${escapeHtml(localized(portrait.alt))}" width="240" height="240" loading="lazy"><figcaption>${portrait.source?`<a href="${escapeHtml(portrait.source)}" target="_blank" rel="noopener">${escapeHtml(credit)}</a>`:escapeHtml(credit)}${portrait.license&&portrait.type==='video-still'?` · <a href="${escapeHtml(portrait.licenseUrl)}" target="_blank" rel="noopener">${escapeHtml(portrait.license)}</a>`:''}</figcaption></figure>`;
}
function searchRecordings(q){return MEDIA.recordings.filter(r=>matchesSearchText(normalizeText(recordingSearchText(r)),q))}
function recordingCard(r){
 const title=escapeHtml(localized(r.titleTranslations||r.title));
 const preview=r.thumbnailUrl||r.poster;
 const media=r.embedUrl?`<button class="recording-play" type="button" data-play="${r.id}" aria-label="${escapeHtml(t('listen')+': '+localized(r.titleTranslations||r.title))}">${preview?`<img src="${escapeHtml(preview)}" alt="" loading="lazy">`:''}<span aria-hidden="true">▶</span></button>`:r.videoUrl?`<video controls playsinline preload="none" poster="${escapeHtml(r.poster||'')}" aria-label="${title}"><source src="${escapeHtml(r.videoUrl)}" type="video/webm"></video>`:`<span class="archive-symbol" aria-hidden="true">◉</span>`;
 const related=(r.relatedBooks||[]).map(slug=>bookBySlug(slug)).filter(Boolean);
 return `<article class="dengbej-card dengbej-recording" data-recording="${r.id}"><div class="recording-media">${media}</div><div class="dengbej-recording-body"><h4 dir="auto">${title}</h4><p class="performer-links">${performerLinks(r)}</p>${r.kind==='archive'||r.kind==='spoken'?`<p>${escapeHtml(localized(r.description))}</p>`:''}${related.length?`<div class="related-reading"><span>${escapeHtml(t('relatedBooks'))}</span>${related.map(b=>`<a href="${escapeHtml(readingUrl(b))}" data-related-read="${b.slug}">${escapeHtml(b.title)} →</a>`).join('')}</div>`:''}<a class="text-button" href="${escapeHtml(r.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(t(r.embedUrl?'listenYoutube':r.kind==='archive'?'listenArchive':'sourceAndRights'))} ↗</a><span class="dengbej-credit">${r.creditUrl?`<a href="${escapeHtml(r.creditUrl)}" target="_blank" rel="noopener">${escapeHtml(r.credit||'')} ↗</a>`:escapeHtml(r.credit||'')}${r.license?' · '+escapeHtml(typeof r.license==='string'?r.license:r.license.label||''):''}</span><button class="text-button media-report" type="button" data-report-media="${r.id}">${escapeHtml(t('reportProblem'))}</button></div></article>`;
}
function renderDengbej(){
 const query=$('#dengbejSearch').value;
 const performer=performerById(state.performer);
 const matches=MEDIA.recordings.filter(r=>(performer||r.collection==='dengbej'||(!r.collection&&r.kind==='dengbej'))&&(!performer||(r.performerIds||[]).includes(performer.id))&&matchesSearchText(normalizeText(recordingSearchText(r)),query));
 const visible=query||performer||dengbejExpanded?matches:matches.slice(0,3);
 $('#dengbejGrid').innerHTML=state.mode==='voices'?visible.map(recordingCard).join(''):'';
 $('#dengbejClear').hidden=!query;
 $('#dengbejResults').textContent=query||performer?t('dengbejResults').replace('{count}',matches.length):'';
 $('#dengbejEmpty').hidden=matches.length>0;
 $('#dengbejBrowse').hidden=!!query||!!performer||matches.length<=3;
 $('#dengbejToggle').textContent=t(dengbejExpanded?'showLessDengbej':'seeAllDengbej');
 $('#dengbejToggle').setAttribute('aria-expanded',String(dengbejExpanded));
 $('#performerProfile').hidden=!performer;
 $('#performerProfile').innerHTML=performer?`<button type="button" class="text-button" data-performer-back>← ${escapeHtml(t('backToListening'))}</button><div class="performer-profile-content">${performerPortrait(performer)}<div><h2 tabindex="-1" dir="auto">${escapeHtml(performer.name)}</h2><p lang="${mediaLanguage()}">${escapeHtml(localized(performer.intro))}</p>${mediaLanguage()!==state.locale?'<small lang="ckb">ئەم ناساندنە بە سۆرانی نووسراوە.</small>':''}${performer.sources?.length?`<details class="performer-sources"><summary>${escapeHtml(t('sourceAndRights'))}</summary>${performer.sources.map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.title)} ↗</a>`).join('')}</details>`:''}</div></div>`:'';
 bindDiscoveryActions($('#voicesBrowsePanel'));
}
function renderSpoken(){
 const records=MEDIA.recordings.filter(r=>r.collection==='spoken'||r.kind==='spoken');
 $('#spokenGrid').innerHTML=state.mode==='voices'&&!state.performer?records.map(recordingCard).join(''):'';
 $('#spokenSection').hidden=!!state.performer;
 bindDiscoveryActions($('#spokenGrid'));
}
function renderDiscovery(items){
 $$('[data-browse]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.browse===state.browse)));
 $('#browseChoices').hidden=state.mode==='voices';
 $('#savedNote').hidden=state.browse!=='saved';
 const results=state.q?searchRecordings(state.q):[];
 $('#mediaSearchResults').hidden=!results.length;
 $('#mediaSearchGrid').innerHTML=results.map(recordingCard).join('');
 const people=state.q?MEDIA.performers.filter(p=>matchesSearchText(normalizeText([p.name,...(p.aliases||[])].join(' ')),state.q)):[];
 $('#performerSearchResults').hidden=!people.length;
 $('#performerSearchGrid').innerHTML=people.map(p=>`<a class="performer-result" data-performer="${p.id}" href="?mode=voices&performer=${p.id}&lang=${state.locale}"><span aria-hidden="true">◉</span><strong dir="auto">${escapeHtml(p.name)}</strong><span aria-hidden="true">→</span></a>`).join('');
 bindDiscoveryActions($('#mediaSearchResults'));bindDiscoveryActions($('#performerSearchResults'));
 renderContinueReading();
}
function showPerformer(id,push=true){
 if(!performerById(id))return;
 if(!$('#reader').hidden)closeReader();if(!$('#detailsPage').hidden)closeDetails();
 state.mode='voices';state.performer=id;state.q='';$('#searchInput').value='';$('#dengbejSearch').value='';
 renderCatalogue();if(push)updateUrl();$('#performerProfile').scrollIntoView({block:'start',behavior:'smooth'});$('#performerProfile h2')?.focus({preventScroll:true});
}
function openRecording(id,update=true){
 const r=recordingById(id);if(!r)return;
 if(!$('#reader').hidden)closeReader();if(!$('#detailsPage').hidden)closeDetails();
 state.mode='voices';state.performer='';state.q='';$('#searchInput').value='';$('#dengbejSearch').value=localized(r.titleTranslations||r.title);dengbejExpanded=true;
 renderCatalogue();if(update)updateUrl({recording:id});
 $('#voicesBrowsePanel [data-recording="'+CSS.escape(id)+'"]')?.scrollIntoView({block:'center',behavior:'smooth'});
}
function relatedPerformanceHtml(b){
 const records=MEDIA.recordings.filter(r=>(r.relatedBooks||[]).includes(b.slug));
 return records.length?`<section class="related-performances"><h2>${escapeHtml(t('relatedPerformances'))}</h2><p>${escapeHtml(localized(records[0].connection)||t('connectionNote'))}</p>${records.map(r=>`<a class="related-performance" data-open-recording="${r.id}" href="?mode=voices&recording=${r.id}&lang=${state.locale}">${r.thumbnailUrl?`<img src="${escapeHtml(r.thumbnailUrl)}" alt="" loading="lazy">`:''}<span><strong>${escapeHtml(localized(r.titleTranslations||r.title))}</strong><span>${escapeHtml((r.performerIds||[]).map(id=>performerById(id)?.name||'').join(' · '))}</span><small>${escapeHtml(r.credit||'')}</small></span><span aria-hidden="true">▶</span></a>`).join('')}</section>`:'';
}
function persistShelf(){safeStorage.setItem('kdl_personal_shelf',JSON.stringify(personalShelf))}
function saveButton(b){return `<button type="button" class="save-book${personalShelf.saved[b.slug]?' is-saved':''}" data-save="${b.slug}" aria-pressed="${!!personalShelf.saved[b.slug]}" aria-label="${escapeHtml(t(personalShelf.saved[b.slug]?'unsaveBook':'saveBook')+': '+b.title)}" title="${escapeHtml(t(personalShelf.saved[b.slug]?'unsaveBook':'saveBook'))}">${personalShelf.saved[b.slug]?'♥':'♡'}</button>`}
function updateSaveButton(button,b){const saved=!!personalShelf.saved[b.slug];button.classList.toggle('is-saved',saved);button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',t(saved?'unsaveBook':'saveBook')+': '+b.title);button.title=t(saved?'unsaveBook':'saveBook');button.textContent=saved?'♥':'♡'}
function toggleSave(slug){const b=bookBySlug(slug);if(!b)return;if(personalShelf.saved[slug])delete personalShelf.saved[slug];else personalShelf.saved[slug]=Date.now();persistShelf();$$('[data-save]').filter(button=>button.dataset.save===slug).forEach(button=>updateSaveButton(button,b));if(state.browse==='saved')renderCatalogue()}
function saveProgress(b,progress){
 if(!b?.slug)return;
 personalShelf.progress[b.slug]={...personalShelf.progress[b.slug],...progress,updated:Date.now()};persistShelf();
}
function captureTextProgress(){
 if(!readerBook||readerBook.format==='pdf'||restoringProgress||!$('#readerContent .reader-article'))return;
 const el=$('#readerContent');const ratio=Math.max(0,Math.min(1,el.scrollTop/Math.max(1,el.scrollHeight-el.clientHeight)));
 saveProgress(readerBook,{ratio,chapter:readerChapter,format:'text'});
}
function restoreTextProgress(b,chapter=''){
 const saved=personalShelf.progress[b.slug], normalized=window.KDLReader.normalizeWikiPage(chapter);
 const matches=saved&&window.KDLReader.normalizeWikiPage(saved.chapter||'')===normalized;
 const ratio=matches?Math.max(0,Math.min(1,Number(saved.ratio)||0)):0;
 const signal=readerController?.signal;readerChapter=normalized;restoringProgress=true;
 requestAnimationFrame(()=>{
  if(readerBook!==b||signal?.aborted)return;
  const el=$('#readerContent');el.scrollTop=ratio*Math.max(0,el.scrollHeight-el.clientHeight);
  restoringProgress=false;saveProgress(b,{format:'text',chapter:normalized,ratio});
 });
}
function renderContinueReading(){
 const recent=Object.entries(personalShelf.progress).sort((a,b)=>b[1].updated-a[1].updated).map(([slug,progress])=>({b:bookBySlug(slug),progress})).filter(x=>x.b).slice(0,3);
 $('#continueReading').hidden=!recent.length||!!state.q||state.mode==='voices'||state.browse!=='all';
 $('#continueGrid').innerHTML=recent.map(({b,progress})=>`<a class="continue-item" href="${escapeHtml(readingUrl(b))}" data-related-read="${b.slug}"><strong dir="auto">${escapeHtml(b.title)}</strong><span>${escapeHtml(progress.page?t('page')+' '+progress.page:t('resume'))} →</span></a>`).join('');bindDiscoveryActions($('#continueReading'));
}
async function renderPdf(b,url){
 pdfSession?.destroy?.();pdfSession=null;
 const download=$('#readerDownload');download.href=url;download.hidden=false;
 if(url.startsWith('books/')){download.removeAttribute('target');download.removeAttribute('rel')}else{download.target='_blank';download.rel='noopener'}
 const load=beginReaderLoad();
 try{
  const session=await window.KDLPdfReader.open({container:$('#readerContent'),url,slug:b.slug,title:b.title,signal:load.signal,labels:{...LOCALES.en,...LOCALES[state.locale]},onFallback:()=>{if(load.current())renderNativePdf(b,url)},initialPage:personalShelf.progress[b.slug]?.page||b.startPage||1,onProgress:progress=>{if(load.current())saveProgress(b,{page:progress.page,totalPages:progress.totalPages,format:'pdf'})}});
  if(!load.current()){session.destroy();return}pdfSession=session;
 }catch(error){if(load.current())renderNativePdf(b,url)}
}
function openProblemReport(item){
 $('#reportItem').value=item.title||'';$('#reportSource').value=item.source||item.sourceUrl||item.url||'';$('#reportPage').value=location.href;$('#reportStatus').textContent='';$('#reportMessage').value='';openDialog('reportDialog');
}
function bindDiscoveryActions(root){
 const bind=(selector,event,handler)=>$$(selector,root).forEach(el=>{if(el.dataset.bound)return;el.dataset.bound='1';el.addEventListener(event,handler)});
 bind('[data-save]','click',e=>toggleSave(e.currentTarget.dataset.save));
 bind('[data-download]','click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();downloadBook(bookBySlug(e.currentTarget.dataset.download))});
 bind('[data-performer]','click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();showPerformer(e.currentTarget.dataset.performer)});
 bind('[data-performer-back]','click',()=>{state.performer='';$('#dengbejSearch').value='';renderCatalogue();updateUrl()});
 bind('[data-related-read]','click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openReader(bookBySlug(e.currentTarget.dataset.relatedRead))});
 bind('[data-open-recording]','click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openRecording(e.currentTarget.dataset.openRecording)});
 bind('[data-report-book]','click',e=>openProblemReport(bookBySlug(e.currentTarget.dataset.reportBook)));
 bind('[data-report-media]','click',e=>openProblemReport(recordingById(e.currentTarget.dataset.reportMedia)));
 bind('[data-play]','click',e=>{const r=recordingById(e.currentTarget.dataset.play);const frame=document.createElement('iframe');frame.src=r.embedUrl;frame.title=localized(r.titleTranslations||r.title);frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';e.currentTarget.replaceWith(frame);frame.focus()});
}
function initDiscoveryEvents(){
 $$('[data-browse]').forEach(button=>button.addEventListener('click',()=>{const browse=button.dataset.browse;setMode('all');state.browse=browse;state.limit=24;renderCatalogue();updateUrl()}));
 $('#loadMoreBooks').addEventListener('click',()=>{const oldCount=$$('#bookGrid .book-card').length;state.limit+=24;renderCatalogue();$$('#bookGrid .cover')[oldCount]?.focus({preventScroll:true})});
 $('#readerSave').addEventListener('click',()=>readerBook&&toggleSave(readerBook.slug));
 $('#readerRelated').addEventListener('click',()=>{const b=readerBook;closeReader();showDetails(b.slug)});
 $('#readerReport').addEventListener('click',()=>readerBook&&openProblemReport(readerBook));
 $('#readerRestart').addEventListener('click',()=>{if(!readerBook)return;const b=readerBook;closeReader();delete personalShelf.progress[b.slug];persistShelf();const u=new URL(location.href);u.searchParams.delete('chapter');history.replaceState({},'',u);openReader(b)});
 $('#readerContent').addEventListener('scroll',()=>{clearTimeout(progressTimer);progressTimer=setTimeout(captureTextProgress,200)},{passive:true});
 window.addEventListener('pagehide',captureTextProgress);
 $('#reportForm').addEventListener('submit',async event=>{event.preventDefault();const button=$('#reportSubmit');button.disabled=true;$('#reportStatus').textContent='';try{const response=await fetch(event.currentTarget.action,{method:'POST',body:new FormData(event.currentTarget),headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Report failed');$('#reportStatus').textContent=t('reportSuccess');$('#reportMessage').value=''}catch{$('#reportStatus').textContent=t('reportError')}finally{button.disabled=false}});
}
