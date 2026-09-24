const passageSets = {
  beginner: [
    'The quick brown fox jumps over the lazy dog and keeps moving.',
    'Typing every day helps you build speed accuracy and confidence.'
  ],
  intermediate: [
    'Typing is a practical skill for computer users, students, creators, and professionals.',
    'Strong accuracy comes first; speed improves naturally when your hands learn the right patterns.'
  ],
  advanced: [
    'Modern digital work rewards people who can communicate clearly, research quickly, and type with confidence.',
    'Complex typing practice should include punctuation, numbers, capitalization, and words that challenge familiar patterns.'
  ],
  expert: [
    'const growth = { seo: true, analytics: true, ai: true }; console.log("Build useful systems, then measure them.");',
    'Performance matters: 80 WPM with clean accuracy is more useful than 100 WPM filled with corrections and careless errors.'
  ]
};

const keyboardLayout = [
  [{k:'`',code:'Backquote'},{k:'1',code:'Digit1'},{k:'2',code:'Digit2'},{k:'3',code:'Digit3'},{k:'4',code:'Digit4'},{k:'5',code:'Digit5'},{k:'6',code:'Digit6'},{k:'7',code:'Digit7'},{k:'8',code:'Digit8'},{k:'9',code:'Digit9'},{k:'0',code:'Digit0'},{k:'-',code:'Minus'},{k:'=',code:'Equal'},{k:'BACKSPACE',code:'Backspace'}],
  [{k:'TAB',code:'Tab'},{k:'Q',code:'KeyQ'},{k:'W',code:'KeyW'},{k:'E',code:'KeyE'},{k:'R',code:'KeyR'},{k:'T',code:'KeyT'},{k:'Y',code:'KeyY'},{k:'U',code:'KeyU'},{k:'I',code:'KeyI'},{k:'O',code:'KeyO'},{k:'P',code:'KeyP'},{k:'[',code:'BracketLeft'},{k:']',code:'BracketRight'},{k:'\\',code:'Backslash'}],
  [{k:'CAPS',code:'CapsLock'},{k:'A',code:'KeyA'},{k:'S',code:'KeyS'},{k:'D',code:'KeyD'},{k:'F',code:'KeyF'},{k:'G',code:'KeyG'},{k:'H',code:'KeyH'},{k:'J',code:'KeyJ'},{k:'K',code:'KeyK'},{k:'L',code:'KeyL'},{k:';',code:'Semicolon'},{k:"'",code:'Quote'},{k:'ENTER',code:'Enter'}],
  [{k:'SHIFT',code:'ShiftLeft'},{k:'Z',code:'KeyZ'},{k:'X',code:'KeyX'},{k:'C',code:'KeyC'},{k:'V',code:'KeyV'},{k:'B',code:'KeyB'},{k:'N',code:'KeyN'},{k:'M',code:'KeyM'},{k:',',code:'Comma'},{k:'.',code:'Period'},{k:'/',code:'Slash'},{k:'SHIFT',code:'ShiftRight'}],
  [{k:'CTRL',code:'ControlLeft'},{k:'ALT',code:'AltLeft'},{k:'SPACE',code:'Space'},{k:'ALT',code:'AltRight'},{k:'CTRL',code:'ControlRight'}]
];

const els = {
  landing: document.getElementById('landingPage'), app: document.getElementById('app'), text: document.getElementById('text'), input: document.getElementById('input'), start: document.getElementById('start'), submit: document.getElementById('submit'), restart: document.getElementById('restart'), level: document.getElementById('level'), duration: document.getElementById('duration'), wpm: document.getElementById('wpm'), accuracy: document.getElementById('accuracy'), errors: document.getElementById('errors'), timer: document.getElementById('timer'), status: document.getElementById('status'), keyboard: document.getElementById('keyboard'), records: document.getElementById('records'), bestWpm: document.getElementById('bestWpm'), bestAccuracy: document.getElementById('bestAccuracy'), testsDone: document.getElementById('testsDone'), practiceTime: document.getElementById('practiceTime'), soundToggle: document.getElementById('soundToggle'), themeToggle: document.getElementById('themeToggle'), clearHistory: document.getElementById('clearHistory')
};

let state = {text:'', started:false, finished:false, startAt:0, elapsed:0, interval:null, typed:'', errors:0, correct:0, sound:true, keyFeedback:null};
const storageKey = 'sagarTypingRecordsV2';

function escapeHTML(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function getRecords(){try{return JSON.parse(localStorage.getItem(storageKey))||[]}catch{return[]}}
function saveRecords(rows){localStorage.setItem(storageKey,JSON.stringify(rows))}
function choosePassage(){const list=passageSets[els.level.value]||passageSets.beginner; return list[Math.floor(Math.random()*list.length)]}
function formatTime(seconds){const s=Math.max(0,Math.floor(seconds)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function renderPassage(){els.text.innerHTML=[...state.text].map((ch,i)=>`<span class="typing-char ${i===0?'current':''}" data-index="${i}">${escapeHTML(ch)}</span>`).join('')}
function currentExpected(){return state.text[state.typed.length]||''}
function renderKeyboard(){
  els.keyboard.innerHTML = keyboardLayout.map(row=>`<div class="key-row">${row.map(k=>`<div class="key ${k.k==='SPACE'?'space':''} ${k.k==='SHIFT'?'shift':''} ${k.k==='ENTER'?'enter':''}" data-code="${k.code}">${escapeHTML(k.k)}</div>`).join('')}</div>`).join('');
}
function clearKeyClasses(){els.keyboard.querySelectorAll('.key').forEach(k=>k.classList.remove('correct','wrong','next'))}
function highlightExpected(){
  clearKeyClasses();
  const ch=currentExpected(); if(!ch)return;
  const codeFor = {' ':'Space','`':'Backquote','1':'Digit1','2':'Digit2','3':'Digit3','4':'Digit4','5':'Digit5','6':'Digit6','7':'Digit7','8':'Digit8','9':'Digit9','0':'Digit0','-':'Minus','=':'Equal','[':'BracketLeft',']':'BracketRight','\\':'Backslash',';':'Semicolon',"'":'Quote',',':'Comma','.':'Period','/':'Slash'};
  const upper=ch.toUpperCase(); const code=codeFor[ch] || (upper>='A'&&upper<='Z'?`Key${upper}`:null);
  if(code){const key=els.keyboard.querySelector(`[data-code="${code}"]`); if(key)key.classList.add('next')}
  if(ch.match(/[A-Z]/)){['ShiftLeft','ShiftRight'].forEach(c=>els.keyboard.querySelector(`[data-code="${c}"]`)?.classList.add('next'))}
}
function updatePassageState(){
  els.text.querySelectorAll('.typing-char').forEach((span,i)=>{span.classList.remove('correct','wrong','current'); if(i<state.typed.length){span.classList.add(state.typed[i]===state.text[i]?'correct':'wrong')} else if(i===state.typed.length){span.classList.add('current')}})
  highlightExpected();
}
function calcMetrics(){
  const mins=Math.max(state.elapsed/60000,1/60000); const chars=Math.max(state.typed.length,0); const raw=(chars/5)/mins; const correctChars=[...state.typed].reduce((n,c,i)=>n+(c===state.text[i]?1:0),0); const acc=chars?Math.max(0,correctChars/chars*100):100; const net=Math.max(0,raw-(state.errors/5/mins));
  return {raw,acc,net,correctChars}
}
function updateMetrics(){const m=calcMetrics(); els.wpm.textContent=Math.round(m.net); els.accuracy.textContent=`${m.acc.toFixed(1)}%`; els.errors.textContent=state.errors; els.timer.textContent=formatTime(state.elapsed)}
function startTimer(){clearInterval(state.interval); state.interval=setInterval(()=>{state.elapsed=(performance.now()-state.startAt)/1000; updateMetrics(); if(+els.duration.value>0 && state.elapsed>=+els.duration.value)finishTest('Time limit reached');},100)}
function startTest(){
  state.text=choosePassage(); state.started=true; state.finished=false; state.startAt=performance.now(); state.elapsed=0; state.typed=''; state.errors=0; state.correct=0; renderPassage(); updatePassageState(); updateMetrics();
  els.input.disabled=false; els.input.value=''; els.start.disabled=true; els.submit.disabled=false; els.level.disabled=true; els.duration.disabled=true; els.status.textContent='Typing in progress'; els.input.focus(); startTimer();
}
function resetTest(){clearInterval(state.interval); state={...state,text:choosePassage(),sound:state.sound}; renderPassage(); updatePassageState(); updateMetrics(); els.input.disabled=true; els.input.value=''; els.start.disabled=false; els.submit.disabled=true; els.level.disabled=false; els.duration.disabled=false; els.status.textContent='Ready to start'; state.started=false; state.finished=false}
function finishTest(reason='Finished'){
  if(!state.started || state.finished)return; state.finished=true; clearInterval(state.interval); state.elapsed=Math.min(state.elapsed,+els.duration.value||state.elapsed); updateMetrics();
  const m=calcMetrics(); const row={level:els.level.value,wpm:Math.round(m.net),accuracy:Number(m.acc.toFixed(1)),time:Number(state.elapsed.toFixed(1)),date:new Date().toISOString()}; const rows=[row,...getRecords()].slice(0,50); saveRecords(rows); els.status.textContent=reason; els.input.disabled=true; els.submit.disabled=true; els.start.disabled=false; els.level.disabled=false; els.duration.disabled=false; renderRecords(); renderProfile();
  if(state.sound)tone('finish');
}
function handleInput(){
  if(!state.started || state.finished)return;
  const previous=state.typed; state.typed=els.input.value.slice(0,state.text.length); if(state.typed.length<previous.length){updatePassageState();return}
  const added=state.typed[state.typed.length-1]; if(added!==undefined){const idx=state.typed.length-1; if(added===state.text[idx]){state.correct++; state.keyFeedback='correct'}else{state.errors++; state.keyFeedback='wrong'}}
  els.input.value=state.typed; updatePassageState(); updateMetrics(); if(state.sound)tone(state.keyFeedback==='correct'?'type':'error');
  if(state.typed.length>=state.text.length){finishTest('Passage complete')}
}
function tone(kind){try{const ctx=tone.ctx||(tone.ctx=new AudioContext()); const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=kind==='finish'?740:kind==='error'?180:420; g.gain.value=.025; o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+(kind==='finish'?.18:.045))}catch{}}
function renderRecords(){els.records.innerHTML=getRecords().slice(0,10).map(r=>`<tr><td>${escapeHTML(r.level)}</td><td>${r.wpm}</td><td>${r.accuracy}%</td><td>${r.time}s</td></tr>`).join('')||'<tr><td colspan="4">No tests yet</td></tr>'}
function renderProfile(){const r=getRecords(); const best=Math.max(0,...r.map(x=>x.wpm)); const ba=Math.max(0,...r.map(x=>x.accuracy)); const total=r.reduce((s,x)=>s+x.time,0); els.bestWpm.textContent=best; els.bestAccuracy.textContent=`${ba.toFixed(1)}%`; els.testsDone.textContent=r.length; els.practiceTime.textContent=`${Math.round(total/60)}m`}
function buildSocialYear(){document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear())}
function openApp(){els.landing.classList.add('hidden'); els.app.classList.remove('hidden'); if(location.hash!=='#app')history.replaceState(null,'','#app'); els.input.disabled=true; renderRecords();renderProfile();renderPassage()}
function route(){if(location.hash.startsWith('#app')||location.hash.startsWith('#stats'))openApp(); else {els.landing.classList.remove('hidden');els.app.classList.add('hidden')}}

document.querySelectorAll('[data-open-app]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openApp();els.app.scrollIntoView({behavior:'smooth'});history.replaceState(null,'','#app')}));
window.addEventListener('hashchange',route);
els.start.addEventListener('click',startTest); els.restart.addEventListener('click',resetTest); els.submit.addEventListener('click',()=>finishTest('Finished manually')); els.input.addEventListener('input',handleInput);
els.soundToggle.addEventListener('click',()=>{state.sound=!state.sound;els.soundToggle.textContent=state.sound?'🔊 Sound On':'🔇 Sound Off'});
els.themeToggle.addEventListener('click',()=>document.body.classList.toggle('light'));
els.clearHistory.addEventListener('click',()=>{localStorage.removeItem(storageKey);renderRecords();renderProfile()});
window.addEventListener('keydown',e=>{
  if(els.app.classList.contains('hidden'))return;
  if(e.key==='Escape'&&state.started){resetTest();return}
  if(!state.started || state.finished)return;
  if(document.activeElement!==els.input){e.preventDefault();els.input.focus()}
  const keyEl=els.keyboard.querySelector(`[data-code="${e.code}"]`);
  if(keyEl){keyEl.classList.add('key-pressed');setTimeout(()=>keyEl.classList.remove('key-pressed'),90)}
});

buildSocialYear(); renderKeyboard(); resetTest(); route();
