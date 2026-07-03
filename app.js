'use strict';

/* ======================================================================
   CODE RUSH — main game script
   ====================================================================== */

/* ------------------------- QUESTION BANK --------------------------- */
const QUESTIONS = [
  // ---- Variables (world 1) ----
  {cat:'variables', q:'Which keyword declares a block-scoped variable that can be reassigned?', a:['var','let','const','function'], c:1},
  {cat:'variables', q:'Which keyword declares a variable that cannot be reassigned?', a:['let','var','const','static'], c:2},
  {cat:'variables', q:'What is the scope of a variable declared with <code>var</code>?', a:['Block scope','Function scope','Module scope','No scope'], c:1},
  {cat:'variables', q:'What value does an uninitialized <code>let</code> variable hold?', a:['null','0','undefined','NaN'], c:2},
  {cat:'variables', q:'What happens if you try to reassign a <code>const</code> variable?', a:['It updates silently','A TypeError is thrown','It becomes undefined','Nothing happens'], c:1},
  {cat:'variables', q:'Which statement about hoisting is TRUE for <code>let</code>?', a:['It is hoisted and initialized to undefined','It is hoisted but not initialized (temporal dead zone)','It is never hoisted at all','It is hoisted to the global object'], c:1},
  {cat:'variables', q:'What does <code>typeof undeclaredVar</code> return?', a:['"null"','"undefined"','Throws an error','"NaN"'], c:1},
  {cat:'variables', q:'Which of these is a valid variable name?', a:['2cool','_score','let','my-var'], c:1},
  {cat:'variables', q:'What is the result of <code>typeof 42</code>?', a:['"number"','"int"','"string"','"NaN"'], c:0},
  {cat:'variables', q:'Can you redeclare a <code>let</code> variable in the same scope?', a:['Yes, freely','No, it throws a SyntaxError','Yes, but only once','Only inside functions'], c:1},

  // ---- Arrays (world 2) ----
  {cat:'arrays', q:'Which method adds an element to the end of an array?', a:['push()','pop()','shift()','unshift()'], c:0},
  {cat:'arrays', q:'Which method removes the first element of an array?', a:['pop()','shift()','slice()','splice()'], c:1},
  {cat:'arrays', q:'What does <code>[1,2,3].length</code> return?', a:['2','3','4','undefined'], c:1},
  {cat:'arrays', q:'Which method creates a new array with results of calling a function on every element?', a:['forEach()','map()','filter()','reduce()'], c:1},
  {cat:'arrays', q:'Which method returns a new array with elements that pass a test?', a:['map()','find()','filter()','some()'], c:2},
  {cat:'arrays', q:'What does <code>[10,20,30].indexOf(20)</code> return?', a:['0','1','2','-1'], c:1},
  {cat:'arrays', q:'Which method combines all elements into a single value?', a:['reduce()','concat()','join()','every()'], c:0},
  {cat:'arrays', q:'What does <code>Array.isArray([1,2])</code> return?', a:['true','false','"array"','undefined'], c:0},
  {cat:'arrays', q:'Which method converts an array into a string?', a:['toString() only','join()','concat()','split()'], c:1},
  {cat:'arrays', q:'What does <code>[1,2,3].slice(1)</code> return?', a:['[1]','[2,3]','[1,2]','[1,2,3]'], c:1},
  {cat:'arrays', q:'Which method checks if AT LEAST ONE element passes a test?', a:['every()','some()','find()','includes()'], c:1},
  {cat:'arrays', q:'What does the spread operator do in <code>[...[1,2],3]</code>?', a:['Creates [1,2,3]','Creates [[1,2],3]','Throws an error','Creates 3'], c:0},

  // ---- Functions (world 3) ----
  {cat:'functions', q:'What is the correct syntax for an arrow function returning x*2?', a:['x => x*2','function x => x*2','=> x*2','x -> x*2'], c:0},
  {cat:'functions', q:'What keyword is used to define a traditional function?', a:['func','function','def','method'], c:1},
  {cat:'functions', q:'Do arrow functions have their own <code>this</code> binding?', a:['Yes, always','No, they inherit from enclosing scope','Only in strict mode','Only in classes'], c:1},
  {cat:'functions', q:'What does a function return if there is no explicit return statement?', a:['null','0','undefined','false'], c:2},
  {cat:'functions', q:'What are default parameters used for?', a:['Setting fallback values for missing arguments','Making a function private','Preventing errors only','Declaring variables'], c:0},
  {cat:'functions', q:'What does the rest parameter syntax <code>...args</code> collect?', a:['The first argument only','All remaining arguments into an array','Nothing, it is invalid','The function name'], c:1},
  {cat:'functions', q:'Which term describes a function passed as an argument to another function?', a:['Recursive function','Callback function','Static function','Anonymous class'], c:1},
  {cat:'functions', q:'What is a function that calls itself called?', a:['A loop','A closure','A recursive function','An IIFE'], c:2},
  {cat:'functions', q:'What is a closure?', a:['A function with no parameters','A function bundled with its lexical scope','An error type','A loop that never ends'], c:1},
  {cat:'functions', q:'What does IIFE stand for?', a:['Instantly Invoked Function Expression','Immediately Invoked Function Expression','Internal Iterator Function Element','Indexed Inline Function Export'], c:1},

  // ---- Objects & JSON (world 4) ----
  {cat:'objects', q:'How do you access the "name" property of object <code>obj</code>?', a:['obj->name','obj.name','obj::name','obj[name]() '], c:1},
  {cat:'objects', q:'What does <code>Object.keys(obj)</code> return?', a:['The values of obj','An array of the object\'s property names','A copy of obj','The object\'s prototype'], c:1},
  {cat:'objects', q:'Which method converts a JS object into a JSON string?', a:['JSON.parse()','JSON.stringify()','Object.toJSON()','JSON.encode()'], c:1},
  {cat:'objects', q:'Which method converts a JSON string into a JS object?', a:['JSON.stringify()','JSON.parse()','JSON.decode()','Object.parse()'], c:1},
  {cat:'objects', q:'What does the spread syntax do in <code>{...obj, extra:1}</code>?', a:['Copies obj properties and adds extra','Deletes obj properties','Throws an error','Creates a function'], c:0},
  {cat:'objects', q:'How do you check if a property exists in an object?', a:['obj.has(prop)','"prop" in obj','obj.contains(prop)','obj.exists(prop)'], c:1},
  {cat:'objects', q:'What is the result of <code>typeof {}</code>?', a:['"object"','"array"','"json"','"null"'], c:0},
  {cat:'objects', q:'Which syntax uses shorthand property names in ES6?', a:['{x: x}','{x}','{x = x}','{x -> x}'], c:1},
  {cat:'objects', q:'What does destructuring <code>const {a,b} = obj</code> do?', a:['Deletes a and b from obj','Extracts properties a and b into variables','Creates a new object','Throws an error'], c:1},
  {cat:'objects', q:'What does <code>Object.freeze(obj)</code> do?', a:['Deletes the object','Prevents modification of the object','Copies the object','Converts it to JSON'], c:1},

  // ---- Loops & Conditions (world 5) ----
  {cat:'loops', q:'Which loop runs its body at least once, even if the condition is false?', a:['for','while','do...while','forEach'], c:2},
  {cat:'loops', q:'What does the <code>break</code> statement do inside a loop?', a:['Skips one iteration','Exits the loop entirely','Restarts the loop','Pauses execution'], c:1},
  {cat:'loops', q:'What does the <code>continue</code> statement do inside a loop?', a:['Exits the loop','Skips to the next iteration','Restarts the program','Throws an error'], c:1},
  {cat:'loops', q:'Which loop is designed to iterate over array elements directly?', a:['for...in','for...of','while','do'], c:1},
  {cat:'loops', q:'What does <code>for...in</code> iterate over?', a:['Array values','Object property keys','Function arguments','Nothing'], c:1},
  {cat:'loops', q:'Which operator checks strict equality (value AND type)?', a:['==','=','===','!='], c:2},
  {cat:'loops', q:'What is the result of <code>"5" == 5</code>?', a:['true','false','undefined','Error'], c:0},
  {cat:'loops', q:'What is the result of <code>"5" === 5</code>?', a:['true','false','undefined','Error'], c:1},
  {cat:'loops', q:'Which keyword starts a multi-branch conditional?', a:['if','switch','case','when'], c:1},
  {cat:'loops', q:'What does the ternary operator <code>cond ? a : b</code> do?', a:['Loops through a and b','Returns a if cond is true, else b','Declares a variable','Combines a and b'], c:1},
  {cat:'loops', q:'Which value is falsy in JavaScript?', a:['"0" (string)','[] (empty array)','0 (number)','{} (empty object)'], c:2},

  // ---- DOM / Events / Classes / Modules (world 6) ----
  {cat:'dom', q:'Which method selects the first element matching a CSS selector?', a:['document.getAll()','document.querySelector()','document.find()','document.select()'], c:1},
  {cat:'dom', q:'Which method adds an event listener to an element?', a:['element.addEventListener()','element.onEvent()','element.listen()','element.bind()'], c:0},
  {cat:'dom', q:'Which property changes the text content of an HTML element in JS?', a:['innerText / textContent','element.value only','element.html','element.body'], c:0},
  {cat:'dom', q:'What keyword defines a class in JavaScript?', a:['class','struct','object','type'], c:0},
  {cat:'dom', q:'Which method creates a new instance of a class?', a:['class.build()','new ClassName()','ClassName.create()','make ClassName()'], c:1},
  {cat:'dom', q:'What keyword is used inside a class to inherit from another class?', a:['inherits','extends','implements','using'], c:1},
  {cat:'dom', q:'Which keyword exports a value from an ES6 module?', a:['export','module.send','share','public'], c:0},
  {cat:'dom', q:'Which keyword imports a value from another ES6 module?', a:['require','include','import','using'], c:2},
  {cat:'dom', q:'What does <code>event.preventDefault()</code> do?', a:['Stops the event from bubbling','Cancels the default browser action for that event','Removes the event listener','Pauses the script'], c:1},
  {cat:'dom', q:'Which method creates a new HTML element in the DOM via JS?', a:['document.createElement()','document.newElement()','document.makeElement()','document.addElement()'], c:0},
  {cat:'dom', q:'What does <code>element.classList.toggle("active")</code> do?', a:['Always adds the class','Always removes the class','Adds it if absent, removes it if present','Renames the class'], c:2},

  // ---- Mixed / general JS (bonus, spread across worlds) ----
  {cat:'variables', q:'Which of these correctly checks a variable is NaN?', a:['x == NaN','Number.isNaN(x)','x === NaN','typeof x === "NaN"'], c:1},
  {cat:'arrays', q:'What does <code>Array.from({length:3})</code> create?', a:['[undefined, undefined, undefined]','[]','[3]','Error'], c:0},
  {cat:'functions', q:'What does the <code>this</code> keyword refer to in a regular method call?', a:['The global window always','The object the method belongs to','The function itself','undefined always'], c:1},
  {cat:'objects', q:'What does <code>Object.values(obj)</code> return?', a:['Property names','Property values','A JSON string','The prototype chain'], c:1},
  {cat:'loops', q:'What does <code>Array.prototype.forEach()</code> return?', a:['A new array','undefined','The original array','The last element'], c:1},
  {cat:'dom', q:'Which template literal syntax embeds a variable in a string?', a:['"Hello " + name','`Hello ${name}`','\'Hello %name%\'','Hello #{name}'], c:1},
];

/* Category -> World mapping & metadata */
const WORLDS = [
  {id:'variables', name:'Variable Valley', icon:'🌱', desc:'Master let, const & var', color:'#00f5ff'},
  {id:'arrays', name:'Array Nebula', icon:'🌌', desc:'Navigate arrays & collections', color:'#9b5cff'},
  {id:'functions', name:'Function Forge', icon:'⚙️', desc:'Forge functions & closures', color:'#ff2ee6'},
  {id:'objects', name:'Object Galaxy', icon:'🪐', desc:'Explore objects & JSON', color:'#39ff88'},
  {id:'loops', name:'Loop Loop', icon:'🔁', desc:'Survive loops & conditions', color:'#ffe14d'},
  {id:'dom', name:'DOM Dimension', icon:'🖥️', desc:'Control the DOM & events', color:'#ff4d6d'},
];
const GATES_PER_WORLD = 5;

/* ------------------------- ACHIEVEMENTS ----------------------------- */
const ACHIEVEMENTS = [
  {id:'first_blood', name:'First Steps', desc:'Answer your first question correctly', icon:'🎯', check:s=>s.stats.correct>=1},
  {id:'combo5', name:'Combo Master', desc:'Reach a x5 combo', icon:'⚡', check:s=>s.stats.bestCombo>=5},
  {id:'combo10', name:'Chain Reaction', desc:'Reach a x10 combo', icon:'🔗', check:s=>s.stats.bestCombo>=10},
  {id:'coins100', name:'Coin Collector', desc:'Earn 100 coins total', icon:'🪙', check:s=>s.coins>=100},
  {id:'coins500', name:'Coin Tycoon', desc:'Earn 500 coins total', icon:'💰', check:s=>s.coins>=500},
  {id:'xp500', name:'XP Hunter', desc:'Reach 500 total XP', icon:'✨', check:s=>s.xp>=500},
  {id:'level5', name:'Rising Coder', desc:'Reach Level 5', icon:'📈', check:s=>s.level>=5},
  {id:'world_conqueror', name:'World Conqueror', desc:'Complete all worlds', icon:'🏆', check:s=>s.completedWorlds.length>=WORLDS.length},
  {id:'century', name:'Century Club', desc:'Answer 100 questions', icon:'💯', check:s=>s.stats.questionsAnswered>=100},
  {id:'perfectionist', name:'Perfectionist', desc:'Complete a world with zero wrong answers', icon:'🌟', check:s=>s.stats.perfectWorld===true},
  {id:'daily3', name:'Daily Devotee', desc:'Complete 3 Daily Challenges', icon:'🔥', check:s=>s.stats.dailyCompletions>=3},
  {id:'speedster', name:'Speed Demon', desc:'Answer a question in under 3 seconds', icon:'💨', check:s=>s.stats.fastAnswer===true},
];

/* ------------------------- STATE / SAVE ------------------------------ */
const DEFAULT_STATE = {
  highScore:0, coins:0, xp:0, level:1,
  achievements:[], completedWorlds:[], worldStars:{},
  settings:{sound:true, music:true},
  stats:{correct:0, wrong:0, questionsAnswered:0, bestCombo:0, playTimeSeconds:0,
         gamesPlayed:0, perfectWorld:false, fastAnswer:false, dailyCompletions:0,
         categoryCorrect:{}},
  daily:{lastDate:null, bestScore:0}
};

let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem('coderush_save');
    if(!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed, {
      settings:Object.assign({}, DEFAULT_STATE.settings, parsed.settings||{}),
      stats:Object.assign({}, DEFAULT_STATE.stats, parsed.stats||{}),
      daily:Object.assign({}, DEFAULT_STATE.daily, parsed.daily||{})
    });
  }catch(e){ return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
}
function saveState(){
  localStorage.setItem('coderush_save', JSON.stringify(state));
}

/* ------------------------- AUDIO ENGINE ------------------------------ */
const Audio_ = (function(){
  let ctx = null;
  function ensureCtx(){
    if(!ctx){ ctx = new (window.AudioContext||window.webkitAudioContext)(); }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, gainVal, delay){
    if(!state.settings.sound) return;
    const c = ensureCtx();
    const t0 = c.currentTime + (delay||0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type||'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(gainVal||0.15, t0+0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0+dur+0.05);
  }
  return {
    click(){ tone(440,0.08,'square',0.08); },
    correct(){ tone(523,0.12,'sine',0.15); tone(659,0.12,'sine',0.15,0.08); tone(784,0.18,'sine',0.15,0.16); },
    wrong(){ tone(200,0.25,'sawtooth',0.12); tone(140,0.3,'sawtooth',0.1,0.1); },
    coin(){ tone(988,0.09,'square',0.1); tone(1318,0.12,'square',0.1,0.06); },
    jump(){ tone(300,0.1,'triangle',0.08); },
    levelup(){ tone(392,0.15,'sine',0.15); tone(523,0.15,'sine',0.15,0.12); tone(659,0.15,'sine',0.15,0.24); tone(784,0.3,'sine',0.18,0.36); },
    gateOpen(){ tone(600,0.2,'sine',0.12); tone(900,0.25,'sine',0.12,0.1); },
    _ensure(){ ensureCtx(); }
  };
})();

const Music = (function(){
  let ctx=null, playing=false, timer=null, step=0;
  const pattern = [220,0,277,0,330,0,277,0, 220,0,261,0,330,0,392,0];
  function ensureCtx(){
    if(!ctx){ ctx = new (window.AudioContext||window.webkitAudioContext)(); }
    if(ctx.state==='suspended') ctx.resume();
    return ctx;
  }
  function playStep(){
    if(!playing || !state.settings.music) return;
    const c = ensureCtx();
    const freq = pattern[step % pattern.length];
    if(freq>0){
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type='sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, c.currentTime);
      gain.gain.linearRampToValueAtTime(0.035, c.currentTime+0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime+0.35);
      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime+0.4);
    }
    step++;
    timer = setTimeout(playStep, 260);
  }
  return {
    start(){ if(playing) return; playing=true; ensureCtx(); playStep(); },
    stop(){ playing=false; if(timer) clearTimeout(timer); },
    toggle(on){ if(on) this.start(); else this.stop(); }
  };
})();

/* ------------------------- UI HELPERS --------------------------------- */
function $(sel){ return document.querySelector(sel); }
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $('#'+id).classList.add('active');
}
function openModal(id){ $('#'+id).classList.add('active'); }
function closeModal(id){ $('#'+id).classList.remove('active'); }
function toast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show'), 2200);
}

function xpForLevel(level){ return 100 + (level-1)*40; }
function addXP(amount){
  state.xp += amount;
  let needed = xpForLevel(state.level);
  let leveled = false;
  while(state.xp >= needed){
    state.xp -= needed;
    state.level++;
    needed = xpForLevel(state.level);
    leveled = true;
  }
  if(leveled){ Audio_.levelup(); toast('Level Up! You reached Level '+state.level); }
  return leveled;
}
function addCoins(n){ state.coins += n; }

function checkAchievements(){
  const newly = [];
  ACHIEVEMENTS.forEach(a=>{
    if(!state.achievements.includes(a.id) && a.check(state)){
      state.achievements.push(a.id);
      newly.push(a);
    }
  });
  return newly;
}

/* ------------------------- MENU RENDER --------------------------------- */
function refreshMenuUI(){
  $('#menu-level').textContent = state.level;
  $('#menu-xp').textContent = state.xp;
  $('#menu-coins').textContent = state.coins;
  $('#menu-combo').textContent = state.stats.bestCombo;
  $('#menu-highscore').textContent = state.highScore;
}

function renderWorldMap(){
  const grid = $('#worldmap-grid');
  grid.innerHTML = '';
  WORLDS.forEach((w,idx)=>{
    const unlocked = idx===0 || state.completedWorlds.includes(WORLDS[idx-1].id);
    const done = state.completedWorlds.includes(w.id);
    const stars = state.worldStars[w.id]||0;
    const card = document.createElement('div');
    card.className = 'world-card glass' + (unlocked ? '' : ' locked');
    card.style.borderColor = unlocked ? w.color+'55' : '';
    card.innerHTML = `
      <div class="world-icon">${w.icon}</div>
      <div class="world-name" style="color:${w.color}">${w.name}${done?' ✓':''}</div>
      <div class="world-desc">${unlocked ? w.desc : 'Complete previous world to unlock'}</div>
      <div class="world-progress-bar"><div class="world-progress-fill" style="width:${done?100:0}%;background:${w.color}"></div></div>
      <div class="world-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
    `;
    if(unlocked){
      card.addEventListener('click', ()=>{ Audio_.click(); startWorld(w.id); });
    }
    grid.appendChild(card);
  });
}

function renderAchievements(){
  const grid = $('#achievements-grid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a=>{
    const unlocked = state.achievements.includes(a.id);
    const card = document.createElement('div');
    card.className = 'ach-card ' + (unlocked?'unlocked':'locked');
    card.innerHTML = `<div class="ach-icon">${a.icon}</div>
      <div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>`;
    grid.appendChild(card);
  });
}

function renderStats(){
  const s = state.stats;
  const items = [
    ['Questions Answered', s.questionsAnswered],
    ['Correct Answers', s.correct],
    ['Wrong Answers', s.wrong],
    ['Accuracy', s.questionsAnswered ? Math.round(100*s.correct/s.questionsAnswered)+'%' : '0%'],
    ['Best Combo', 'x'+s.bestCombo],
    ['Total XP', state.xp + (state.level-1)*100],
    ['Total Coins', state.coins],
    ['Current Level', state.level],
    ['Worlds Completed', state.completedWorlds.length+' / '+WORLDS.length],
    ['Games Played', s.gamesPlayed],
    ['Achievements', state.achievements.length+' / '+ACHIEVEMENTS.length],
    ['Daily Best Score', state.daily.bestScore],
  ];
  const grid = $('#stats-grid');
  grid.innerHTML = items.map(([lab,val])=>`<div class="stat-card"><div class="val">${val}</div><div class="lab">${lab}</div></div>`).join('');
}

/* ------------------------- BACKGROUND PARTICLES ------------------------ */
(function bgParticles(){
  const canvas = $('#bg-particles');
  const ctx = canvas.getContext('2d');
  let W,H,parts=[];
  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  const colors = ['#00f5ff','#ff2ee6','#9b5cff','#39ff88','#ffe14d'];
  for(let i=0;i<60;i++){
    parts.push({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*2+0.6,
      vy:-(Math.random()*0.35+0.08),
      vx:(Math.random()-0.5)*0.15,
      color:colors[i%colors.length],
      a:Math.random()*0.5+0.2
    });
  }
  function frame(){
    ctx.clearRect(0,0,W,H);
    parts.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.y < -10) p.y = H+10;
      if(p.x < -10) p.x = W+10;
      if(p.x > W+10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.a;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ------------------------- GAME ENGINE --------------------------------- */
const Game = {
  canvas:null, ctx:null,
  W:0, H:0,
  keys:{},
  player:{x:80,y:0,vx:0,vy:0,w:34,h:44,onGround:true,facing:1},
  camX:0,
  gravity:1600,
  groundY:0,
  gates:[],
  worldId:null,
  worldDef:null,
  running:false,
  paused:false,
  lastTime:0,
  lives:3,
  combo:1,
  worldCorrect:0,
  worldWrong:0,
  worldXP:0,
  worldCoins:0,
  activeGate:null,
  isDaily:false,
  dailyScore:0,
  animT:0,
  startTime:0,

  init(){
    this.canvas = $('#game-canvas');
    this.ctx = this.canvas.getContext('2d');
    window.addEventListener('resize', ()=>this.resize());
    window.addEventListener('keydown', e=>this.onKey(e,true));
    window.addEventListener('keyup', e=>this.onKey(e,false));
    this.resize();
  },
  resize(){
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.W = rect.width; this.H = rect.height;
    this.groundY = this.H - 90;
  },
  onKey(e, down){
    const code = e.code;
    if(['ArrowLeft','ArrowRight','ArrowUp','Space','KeyA','KeyD','KeyW'].includes(code)) e.preventDefault();
    this.keys[code] = down;
    if(down && (code==='Space' || code==='ArrowUp' || code==='KeyW')){
      if(this.activeGate && !this.activeGate.solved){
        openQuestionForGate(this.activeGate);
      } else if(this.player.onGround){
        this.player.vy = -650; this.player.onGround=false; Audio_.jump();
      }
    }
    if(down && code==='Escape'){ togglePause(); }
  },

  buildWorld(worldId, isDaily){
    this.worldId = worldId;
    this.worldDef = WORLDS.find(w=>w.id===worldId) || {id:'daily',name:'Daily Challenge',icon:'🔥',color:'#ffe14d'};
    this.isDaily = !!isDaily;
    this.lives = 3;
    this.combo = 1;
    this.worldCorrect = 0;
    this.worldWrong = 0;
    this.worldXP = 0;
    this.worldCoins = 0;
    this.dailyScore = 0;
    this.player.x = 80; this.player.y=0; this.player.vx=0; this.player.vy=0; this.player.onGround=true;
    this.camX = 0;
    this.gates = [];
    const spacing = 420;
    const count = this.isDaily ? 8 : GATES_PER_WORLD;
    let pool;
    if(this.isDaily){
      pool = seededShuffle(QUESTIONS.slice(), dailySeed()).slice(0,count);
    } else {
      pool = shuffle(QUESTIONS.filter(q=>q.cat===worldId)).slice(0,count);
      // fill if not enough
      while(pool.length < count){
        pool.push(QUESTIONS[Math.floor(Math.random()*QUESTIONS.length)]);
      }
    }
    for(let i=0;i<count;i++){
      this.gates.push({
        x: 320 + i*spacing,
        solved:false,
        question: pool[i]
      });
    }
    this.worldWidth = 320 + count*spacing + 300;
    $('#hud-world-name').textContent = this.worldDef.icon+' '+this.worldDef.name;
    $('#hud-lives').textContent = this.lives;
    updateHUD();
  },

  start(worldId, isDaily){
    this.buildWorld(worldId, isDaily);
    showScreen('screen-game');
    this.running = true; this.paused = false;
    this.lastTime = performance.now();
    this.startTime = performance.now();
    requestAnimationFrame(t=>this.loop(t));
  },

  loop(t){
    if(!this.running) return;
    const dt = Math.min((t-this.lastTime)/1000, 0.033);
    this.lastTime = t;
    this.animT += dt;
    if(!this.paused && !isModalOpen()){
      this.update(dt);
    }
    this.render();
    requestAnimationFrame(tt=>this.loop(tt));
  },

  update(dt){
    const p = this.player;
    const speed = 260;
    let moveDir = 0;
    if(this.keys['ArrowLeft']||this.keys['KeyA']) moveDir = -1;
    if(this.keys['ArrowRight']||this.keys['KeyD']) moveDir = 1;
    p.vx = moveDir*speed;
    if(moveDir!==0) p.facing = moveDir;

    // blocked by unsolved gate ahead
    let blockX = this.worldWidth;
    for(const g of this.gates){
      if(!g.solved && g.x > p.x) { blockX = Math.min(blockX, g.x-40); }
    }

    let nextX = p.x + p.vx*dt;
    if(nextX > blockX) nextX = blockX;
    if(nextX < 20) nextX = 20;
    p.x = nextX;

    // gravity
    p.vy += this.gravity*dt;
    p.y += p.vy*dt;
    if(p.y >= 0){ p.y = 0; p.vy = 0; p.onGround = true; } else { p.onGround = false; }

    // camera follow
    const targetCam = Math.max(0, Math.min(p.x - this.W*0.35, this.worldWidth - this.W));
    this.camX += (targetCam - this.camX)*Math.min(1, dt*6);

    // find nearby gate
    let nearest = null, nearestD = 9999;
    this.gates.forEach(g=>{
      if(g.solved) return;
      const d = Math.abs(g.x - p.x);
      if(d < 70 && d < nearestD){ nearest = g; nearestD = d; }
    });
    this.activeGate = nearest;
    $('#gate-hint').classList.toggle('show', !!nearest);

    // world complete?
    if(this.gates.every(g=>g.solved) && !this._completing){
      this._completing = true;
      setTimeout(()=>completeWorld(), 400);
    }
  },

  render(){
    const ctx = this.ctx, W=this.W, H=this.H;
    ctx.clearRect(0,0,W,H);

    // sky gradient
    const grad = ctx.createLinearGradient(0,0,0,H);
    const c1 = this.worldDef && this.worldDef.color ? this.worldDef.color : '#00f5ff';
    grad.addColorStop(0, 'rgba(10,14,31,1)');
    grad.addColorStop(1, hexToRgba(c1,0.12));
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    // parallax grid lines
    ctx.save();
    ctx.strokeStyle = hexToRgba(c1,0.15);
    ctx.lineWidth = 1;
    const gridOffset = -(this.camX*0.5)%60;
    for(let x=gridOffset; x<W; x+=60){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-this.camX,0);

    // ground
    const groundY = this.groundY;
    ctx.fillStyle = 'rgba(15,20,40,0.9)';
    ctx.fillRect(0, groundY+40, this.worldWidth, H-groundY-40);
    ctx.strokeStyle = hexToRgba(c1,0.6);
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0,groundY+40); ctx.lineTo(this.worldWidth,groundY+40); ctx.stroke();
    ctx.shadowBlur = 15; ctx.shadowColor = c1;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // gates
    this.gates.forEach(g=>{
      const gx = g.x, gy = groundY+40;
      const pulse = 0.5+0.5*Math.sin(this.animT*3 + gx*0.01);
      if(!g.solved){
        ctx.save();
        ctx.strokeStyle = c1;
        ctx.fillStyle = hexToRgba(c1, 0.12+0.05*pulse);
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20+10*pulse; ctx.shadowColor = c1;
        roundRect(ctx, gx-18, gy-160, 36, 160, 10);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = c1;
        ctx.font = '20px sans-serif';
        ctx.textAlign='center';
        ctx.shadowBlur = 10;
        ctx.fillText('</>', gx, gy-70);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#39ff88';
        ctx.lineWidth=2;
        roundRect(ctx, gx-18, gy-160, 36, 160, 10);
        ctx.stroke();
        ctx.restore();
      }
    });

    // player
    const p = this.player;
    const px = p.x, py = groundY+40 + p.y - p.h;
    ctx.save();
    ctx.translate(px,py);
    ctx.shadowBlur = 18; ctx.shadowColor = '#00f5ff';
    ctx.fillStyle = '#0d1830';
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2.5;
    roundRect(ctx, 0,0,p.w,p.h,8);
    ctx.fill(); ctx.stroke();
    // visor
    ctx.fillStyle = '#ff2ee6';
    ctx.shadowColor = '#ff2ee6';
    const visorX = p.facing>0 ? p.w*0.45 : p.w*0.1;
    ctx.fillRect(visorX, 8, p.w*0.4, 8);
    // legs animation
    ctx.strokeStyle = '#9b5cff';
    ctx.lineWidth=3;
    const legOff = p.onGround ? Math.sin(this.animT*12)*6*(Math.abs(p.vx)>10?1:0) : 0;
    ctx.beginPath();
    ctx.moveTo(p.w*0.3, p.h); ctx.lineTo(p.w*0.3+legOff, p.h+10);
    ctx.moveTo(p.w*0.7, p.h); ctx.lineTo(p.w*0.7-legOff, p.h+10);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }
};

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function hexToRgba(hex, a){
  const v = hex.replace('#','');
  const r = parseInt(v.substring(0,2),16), g = parseInt(v.substring(2,4),16), b = parseInt(v.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
function mulberry32(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function dailySeed(){
  const d = new Date();
  return d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
}
function seededShuffle(arr, seed){
  const rnd = mulberry32(seed);
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(rnd()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

/* ------------------------- HUD / QUESTION FLOW -------------------------- */
function updateHUD(){
  $('#hud-coins').textContent = state.coins;
  $('#hud-combo').textContent = 'x'+Game.combo;
  $('#hud-lives').textContent = Game.lives;
  $('#hud-level').textContent = 'Lv.'+state.level;
  const pct = Math.min(100, 100*state.xp/xpForLevel(state.level));
  $('#hud-xp-fill').style.width = pct+'%';
  $('#hud-combo-pill').classList.toggle('hot', Game.combo>=3);
}

let questionTimer = null, questionStart = 0;
const QUESTION_TIME = 12000;

function openQuestionForGate(gate){
  if(isModalOpen()) return;
  Audio_._ensure();
  const q = gate.question;
  $('#q-category').textContent = q.cat.toUpperCase();
  $('#q-text').innerHTML = q.q;
  const rewardXP = 10 + Game.combo*2;
  const rewardCoins = 5 + Math.floor(Game.combo*1.5);
  $('#q-reward-xp').textContent = rewardXP;
  $('#q-reward-coins').textContent = rewardCoins;
  $('#q-combo-val').textContent = 'x'+Game.combo;

  const answersWrap = $('#q-answers');
  answersWrap.innerHTML = '';
  const order = shuffle(q.a.map((text,i)=>({text,correct:i===q.c})));
  order.forEach(opt=>{
    const btn = document.createElement('button');
    btn.className = 'q-answer-btn';
    btn.innerHTML = opt.text;
    btn.addEventListener('click', ()=>answerQuestion(gate, opt.correct, btn));
    answersWrap.appendChild(btn);
  });

  questionStart = performance.now();
  const fill = $('#q-timer-fill');
  fill.style.transition = 'none';
  fill.style.width='100%';
  requestAnimationFrame(()=>{
    fill.style.transition = `width ${QUESTION_TIME}ms linear`;
    fill.style.width = '0%';
  });
  clearTimeout(questionTimer);
  questionTimer = setTimeout(()=>{
    if(isModalOpen()) answerQuestion(gate, false, null);
  }, QUESTION_TIME);

  openModal('modal-question');
}

function isModalOpen(){
  return document.querySelector('.modal-overlay.active') !== null;
}

function answerQuestion(gate, isCorrect, btnEl){
  clearTimeout(questionTimer);
  const elapsed = performance.now()-questionStart;
  document.querySelectorAll('.q-answer-btn').forEach(b=>{
    b.classList.add('disabled');
    if(b===btnEl) b.classList.add(isCorrect?'correct':'wrong');
  });
  const correctBtn = [...document.querySelectorAll('.q-answer-btn')].find((b,i)=>{
    return b.textContent === gate.question.a[gate.question.c];
  });
  if(!isCorrect && correctBtn) correctBtn.classList.add('correct');

  state.stats.questionsAnswered++;
  state.stats.categoryCorrect[gate.question.cat] = state.stats.categoryCorrect[gate.question.cat]||0;

  if(isCorrect){
    Audio_.correct();
    gate.solved = true;
    Game.worldCorrect++;
    state.stats.correct++;
    state.stats.categoryCorrect[gate.question.cat]++;
    if(elapsed < 3000) state.stats.fastAnswer = true;
    const rewardXP = 10 + Game.combo*2;
    const rewardCoins = 5 + Math.floor(Game.combo*1.5);
    Game.worldXP += rewardXP; Game.worldCoins += rewardCoins;
    Game.dailyScore += rewardXP + rewardCoins*2;
    addXP(rewardXP); addCoins(rewardCoins);
    Audio_.coin();
    Game.combo++;
    state.stats.bestCombo = Math.max(state.stats.bestCombo, Game.combo);
    showFeedback('CORRECT! +'+rewardXP+' XP', true);
    Audio_.gateOpen();
  } else {
    Audio_.wrong();
    Game.worldWrong++;
    state.stats.wrong++;
    Game.combo = 1;
    Game.lives--;
    showFeedback('WRONG!', false);
  }
  updateHUD();
  saveState();

  setTimeout(()=>{
    closeModal('modal-question');
    if(!isCorrect && Game.lives<=0){
      setTimeout(()=>gameOver(), 300);
    } else if(!isCorrect){
      // allow retry with a fresh question from same category
      const pool = QUESTIONS.filter(q=>q.cat===(Game.worldId==='daily'?gate.question.cat:Game.worldId));
      gate.question = pool.length ? pool[Math.floor(Math.random()*pool.length)] : gate.question;
    }
  }, 1100);
}

function showFeedback(text, correct){
  const el = $('#feedback-popup');
  el.textContent = text;
  el.className = 'feedback-popup show ' + (correct?'correct':'wrong');
  setTimeout(()=>el.classList.remove('show'), 700);
}

/* ------------------------- WORLD FLOW ------------------------------ */
function startWorld(worldId){
  Game.start(worldId, false);
}
function startDaily(){
  const today = new Date().toDateString();
  Game.start('daily', true);
  toast("Today's Daily Challenge — good luck!");
}

function completeWorld(){
  Game.running = false;
  Game._completing = false;
  state.stats.gamesPlayed++;
  state.stats.perfectWorld = Game.worldWrong===0;

  if(Game.isDaily){
    state.daily.lastDate = new Date().toDateString();
    if(Game.dailyScore > state.daily.bestScore) state.daily.bestScore = Game.dailyScore;
    if(Game.dailyScore > 0) state.stats.dailyCompletions++;
    state.highScore = Math.max(state.highScore, Game.dailyScore);
  } else {
    if(!state.completedWorlds.includes(Game.worldId)){
      state.completedWorlds.push(Game.worldId);
    }
    const stars = Game.worldWrong===0 ? 3 : Game.worldWrong<=2 ? 2 : 1;
    state.worldStars[Game.worldId] = Math.max(state.worldStars[Game.worldId]||0, stars);
    const score = Game.worldXP + Game.worldCoins*2;
    state.highScore = Math.max(state.highScore, score);
  }

  const newAch = checkAchievements();
  saveState();

  $('#complete-title').textContent = Game.isDaily ? 'Daily Challenge Complete!' : (Game.worldDef.name+' Complete!');
  $('#complete-correct').textContent = Game.worldCorrect;
  $('#complete-bestcombo').textContent = 'x'+state.stats.bestCombo;
  $('#complete-xp').textContent = Game.worldXP;
  $('#complete-coins').textContent = Game.worldCoins;
  const achWrap = $('#complete-newachievements');
  achWrap.innerHTML = newAch.map(a=>`<div class="new-ach">🏆 Unlocked: ${a.name} — ${a.desc}</div>`).join('');

  const nextBtn = $('#btn-complete-next');
  const idx = WORLDS.findIndex(w=>w.id===Game.worldId);
  if(!Game.isDaily && idx>=0 && idx<WORLDS.length-1){
    nextBtn.style.display='inline-block';
    nextBtn.textContent = 'Next World →';
    nextBtn.onclick = ()=>{ closeModal('modal-complete'); startWorld(WORLDS[idx+1].id); };
  } else {
    nextBtn.style.display='none';
  }
  openModal('modal-complete');
}

function gameOver(){
  Game.running = false;
  state.stats.gamesPlayed++;
  saveState();
  $('#gameover-score').textContent = Game.worldXP + Game.worldCoins*2;
  openModal('modal-gameover');
}

function togglePause(){
  if(!Game.running) return;
  if(isModalOpen() && !$('#modal-pause').classList.contains('active')) return;
  Game.paused = !Game.paused;
  if(Game.paused) openModal('modal-pause'); else closeModal('modal-pause');
}

/* ------------------------- EVENT WIRING ------------------------------ */
function wireEvents(){
  $('#btn-play').addEventListener('click', ()=>{ Audio_.click(); renderWorldMap(); showScreen('screen-worldmap'); });
  $('#btn-daily').addEventListener('click', ()=>{ Audio_.click(); startDaily(); });
  $('#btn-achievements').addEventListener('click', ()=>{ Audio_.click(); renderAchievements(); openModal('modal-achievements'); });
  $('#btn-stats').addEventListener('click', ()=>{ Audio_.click(); renderStats(); openModal('modal-stats'); });
  $('#btn-settings').addEventListener('click', ()=>{ Audio_.click(); openModal('modal-settings'); });
  $('#btn-map-back').addEventListener('click', ()=>{ Audio_.click(); showScreen('screen-menu'); refreshMenuUI(); });

  $('#btn-pause').addEventListener('click', togglePause);
  $('#btn-resume').addEventListener('click', togglePause);
  $('#btn-restart-level').addEventListener('click', ()=>{
    closeModal('modal-pause'); Game.paused=false;
    Game.start(Game.worldId, Game.isDaily);
  });
  $('#btn-pause-settings').addEventListener('click', ()=>openModal('modal-settings'));
  $('#btn-quit-menu').addEventListener('click', ()=>{
    closeModal('modal-pause'); Game.running=false; Game.paused=false;
    showScreen('screen-menu'); refreshMenuUI();
  });

  $('#btn-complete-map').addEventListener('click', ()=>{
    closeModal('modal-complete'); renderWorldMap(); showScreen('screen-worldmap');
  });
  $('#btn-gameover-retry').addEventListener('click', ()=>{
    closeModal('modal-gameover'); Game.start(Game.worldId, Game.isDaily);
  });
  $('#btn-gameover-menu').addEventListener('click', ()=>{
    closeModal('modal-gameover'); showScreen('screen-menu'); refreshMenuUI();
  });

  document.querySelectorAll('.modal-close').forEach(btn=>{
    btn.addEventListener('click', ()=>closeModal(btn.dataset.close));
  });

  $('#toggle-sound').addEventListener('change', e=>{
    state.settings.sound = e.target.checked; saveState();
  });
  $('#toggle-music').addEventListener('change', e=>{
    state.settings.music = e.target.checked;
    Music.toggle(e.target.checked);
    saveState();
  });
  $('#btn-fullscreen').addEventListener('click', ()=>{
    if(!document.fullscreenElement){ document.documentElement.requestFullscreen().catch(()=>{}); }
    else { document.exitFullscreen().catch(()=>{}); }
  });
  $('#btn-reset-progress').addEventListener('click', ()=>{
    if(confirm('Reset ALL progress? This cannot be undone.')){
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
      refreshMenuUI();
      toast('Progress reset.');
      closeModal('modal-settings');
    }
  });

  // mobile controls
  const mcMap = {'mc-left':'ArrowLeft','mc-right':'ArrowRight','mc-jump':'Space'};
  Object.keys(mcMap).forEach(id=>{
    const el = document.getElementById(id);
    const key = mcMap[id];
    ['touchstart','mousedown'].forEach(ev=>el.addEventListener(ev, e=>{ e.preventDefault(); Game.onKey({code:key, preventDefault(){}}, true); }));
    ['touchend','mouseup','mouseleave'].forEach(ev=>el.addEventListener(ev, e=>{ e.preventDefault(); Game.onKey({code:key, preventDefault(){}}, false); }));
  });
}

/* ------------------------- BOOT SEQUENCE ------------------------------ */
function boot(){
  const fill = $('#boot-fill');
  const text = $('#boot-text');
  const msgs = ['Compiling world...','Linking modules...','Optimizing loops...','Booting engine...','Ready!'];
  let p = 0, mi = 0;
  const iv = setInterval(()=>{
    p += 8 + Math.random()*14;
    if(p>100) p=100;
    fill.style.width = p+'%';
    if(p > (mi+1)*20 && mi<msgs.length-1){ mi++; text.textContent = msgs[mi]; }
    if(p>=100){
      clearInterval(iv);
      setTimeout(()=>{
        showScreen('screen-menu');
        refreshMenuUI();
        // sync settings toggles
        $('#toggle-sound').checked = state.settings.sound;
        $('#toggle-music').checked = state.settings.music;
        if(state.settings.music) Music.start();
      }, 300);
    }
  }, 120);
}

/* ------------------------- INIT ------------------------------ */
document.addEventListener('DOMContentLoaded', ()=>{
  Game.init();
  wireEvents();
  boot();
});

// resume audio context on first user gesture (autoplay policies)
document.addEventListener('click', ()=>{ Audio_._ensure(); }, {once:true});