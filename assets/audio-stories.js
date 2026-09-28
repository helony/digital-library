/* Human-narrated stories. Progress stays in this browser; audio loads on play. */
let audioStoryLanguage='all';
window.KDLListening=(()=>{
 const key='kdl_listening_progress';
 function read(){try{const value=JSON.parse(localStorage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return {}}}
 const progress=read();
 function get(id){const value=Number(progress[id]?.seconds);return Number.isFinite(value)&&value>0?value:0}
 function save(audio,finished=false){
  const id=audio.dataset.storyAudio;if(!id)return;
  const seconds=Number(audio.currentTime);
  if(finished||audio.ended)delete progress[id];
  else if(!audio.dataset.started&&!audio.readyState)return;
  else if(Number.isFinite(seconds)&&seconds>0)progress[id]={seconds,updated:Date.now()};
  else if(seconds===0)delete progress[id];
  try{localStorage.setItem(key,JSON.stringify(progress))}catch{}
 }
 function pause(root=document){root.querySelectorAll('audio[data-story-audio]').forEach(audio=>{save(audio);audio.pause()})}
 function bind(root){
  root.querySelectorAll('[data-story-player]').forEach(player=>{
   if(player.dataset.playerBound)return;player.dataset.playerBound='1';
   const audio=player.querySelector('audio'),button=player.querySelector('[data-audio-toggle]'),status=player.querySelector('[data-audio-status]');
   const record=recordingById(audio.dataset.storyAudio);
   let pending=get(record.id),lastSaved=0;
   const label=()=>{
    button.querySelector('[data-audio-icon]').textContent=audio.paused?'▶':'Ⅱ';
    button.querySelector('[data-audio-label]').textContent=t(audio.paused?'listen':'pauseAudio');
    button.setAttribute('aria-label',t(audio.paused?'listen':'pauseAudio')+': '+localized(record.titleTranslations||record.title));
   };
   const restore=()=>{
    if(pending<=0)return;
    const duration=Number.isFinite(audio.duration)?audio.duration:record.durationSeconds;
    try{audio.currentTime=Math.min(pending,Math.max(0,duration-1));pending=0}catch{}
   };
   if(pending)status.textContent=t('resumeAudio').replace('{time}',audioTime(pending));
   audio.addEventListener('loadedmetadata',restore);
   audio.addEventListener('play',()=>{
    audio.dataset.started='1';
    document.querySelectorAll('audio,video').forEach(other=>{if(other!==audio)other.pause()});
    document.querySelectorAll('.recording-media iframe').forEach(frame=>{
     const card=frame.closest('[data-recording]'),recording=recordingById(card?.dataset.recording);
     if(!recording)return;
     const replacement=document.createElement('div');replacement.innerHTML=recordingCard(recording);
     frame.parentElement.replaceChildren(...replacement.querySelector('.recording-media').childNodes);bindDiscoveryActions(card);
    });
    restore();status.textContent=t('audioSavedHere');label();
   });
   audio.addEventListener('pause',()=>{if(!audio.ended)save(audio);label()});
   audio.addEventListener('timeupdate',()=>{if(Date.now()-lastSaved>4000){save(audio);lastSaved=Date.now()}});
   audio.addEventListener('seeked',()=>save(audio));
   audio.addEventListener('ended',()=>{save(audio,true);status.textContent=t('audioFinished');label()});
   audio.addEventListener('error',()=>{status.textContent=t('audioError');label()});
   button.addEventListener('click',async()=>{
    if(!audio.paused){audio.pause();return}
    try{await audio.play()}catch{status.textContent=t('audioError');label()}
   });
   player.querySelector('[data-audio-restart]').addEventListener('click',()=>{
    pending=0;audio.currentTime=0;save(audio,true);status.textContent=t('audioSavedHere');
   });
   label();
  });
 }
 window.addEventListener('pagehide',()=>pause());
 document.addEventListener('play',event=>{if(event.target.tagName==='VIDEO')pause()},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('audio[data-story-audio]').forEach(audio=>save(audio))});
 return {get,save,pause,bind};
})();

function renderAudioStories(){
 const section=$('#audioStoriesSection'),grid=$('#audioStoriesGrid');
 window.KDLListening.pause(grid);
 section.hidden=!!state.performer;
 const records=MEDIA.recordings.filter(r=>r.collection==='stories'&&(audioStoryLanguage==='all'||r.language===audioStoryLanguage));
 grid.innerHTML=state.mode==='voices'&&!state.performer?records.map(recordingCard).join(''):'';
 $$('[data-audio-language]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.audioLanguage===audioStoryLanguage));
  if(button.dataset.bound)return;button.dataset.bound='1';
  button.addEventListener('click',()=>{audioStoryLanguage=button.dataset.audioLanguage;renderAudioStories()});
 });
 bindDiscoveryActions(grid);
}
