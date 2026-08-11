
const LOGIN_KEY='pp_current_role';
const PROFILE_KEY='pp_student_profile';

function showLoginForm(role){
  const s=document.getElementById('studentLoginForm'),t=document.getElementById('teacherLoginForm');
  if(s)s.classList.toggle('hidden',role!=='student');
  if(t)t.classList.toggle('hidden',role!=='teacher');
}
function hideLoginForms(){
  document.getElementById('studentLoginForm').classList.add('hidden');
  document.getElementById('teacherLoginForm').classList.add('hidden');
}
function studentLogin(){
  const name=(document.getElementById('studentNameInput').value||'').trim();
  const klass=(document.getElementById('studentClassInput').value||'').trim();
  const house=document.getElementById('studentHouseInput').value;
  if(!name){alert('Please enter your name.');return;}
  const profile={name,klass:klass||'—',house};
  localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
  localStorage.setItem('pp_house',house);
  localStorage.setItem(LOGIN_KEY,'student');
  openStudentApp();
}
function teacherLogin(){
  const code=(document.getElementById('teacherCodeInput').value||'').trim().toUpperCase();
  if(code!=='PEGORIN'){
    document.getElementById('teacherLoginFeedback').textContent='Incorrect teacher code.';
    return;
  }
  localStorage.setItem(LOGIN_KEY,'teacher');
  openTeacherApp();
}
function logout(){
  localStorage.removeItem(LOGIN_KEY);
  document.getElementById('studentApp').classList.add('hidden');
  document.getElementById('teacherApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  hideLoginForms();
}
function openStudentApp(){
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('teacherApp').classList.add('hidden');
  document.getElementById('studentApp').classList.remove('hidden');
  const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');
  document.getElementById('studentProfileName').textContent=p.name||'Student';
  document.getElementById('studentProfileMeta').textContent=`${p.klass||'—'} · ${p.house||'Gryffindor'}`;
  document.getElementById('welcomeStudent').textContent=`Welcome back, ${p.name||'Student'}!`;
  document.getElementById('studentHouseDisplay').textContent=p.house||'Gryffindor';
  document.getElementById('housePageTitle').textContent=p.house||'My House';
  go('home'); refresh();
}
function openTeacherApp(){
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('studentApp').classList.add('hidden');
  document.getElementById('teacherApp').classList.remove('hidden');
  refreshTeacher();
  teacherMonth('September');
}
function teacherSection(id,btn){
  document.querySelectorAll('.teacher-section').forEach(x=>x.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.teacher-tab').forEach(x=>x.classList.remove('active'));
  if(btn)btn.classList.add('active');
}
const MONTH_DEMO={
  September:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  October:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  November:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  December:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  January:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  February:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  March:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  April:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  May:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0},
  June:{Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0}
};
function teacherMonth(m){
  let data;
  if(m==='School Year'){
    data={Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0};
    Object.values(MONTH_DEMO).forEach(x=>Object.keys(data).forEach(h=>data[h]+=x[h]||0));
    const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');
    if(p.house)data[p.house]+=+(localStorage.getItem('pp_housepoints')||0);
  }else{
    data={...MONTH_DEMO[m]};
    const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');
    const now=new Date();
    const monthName=now.toLocaleString('en',{month:'long'});
    if(p.house && m===monthName)data[p.house]+=+(localStorage.getItem('pp_housepoints')||0);
  }
  document.getElementById('teacherMonthTitle').textContent=`${m} House Points`;
  document.getElementById('teacherMonthData').innerHTML=Object.entries(data).map(([h,v])=>`<tr><td>${h}</td><td><b>${v}</b></td></tr>`).join('');
}
function refreshTeacher(){
  const profile=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');
  const results=JSON.parse(localStorage.getItem('pp_results')||'{}');
  const vals=Object.values(results);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+(b.pct||0),0)/vals.length):null;
  const hp=+(localStorage.getItem('pp_housepoints')||0);

  document.getElementById('teacherStudentsCount').textContent=profile.name?1:0;
  document.getElementById('teacherAttemptsCount').textContent=vals.length;
  document.getElementById('teacherAvgScore').textContent=avg===null?'—':avg+'%';
  document.getElementById('teacherLocalPoints').textContent=hp;

  document.getElementById('teacherRecentActivity').innerHTML=vals.length
    ? vals.slice(-5).reverse().map(r=>`<p><b>${profile.name||'Student'}</b> · ${r.title} · ${r.pct}% · +${r.points||0}</p>`).join('')
    : '<p>No activity saved on this browser yet.</p>';

  document.getElementById('teacherStudentsTable').innerHTML=profile.name
    ? `<tr><td>${profile.name}</td><td>${profile.klass||'—'}</td><td>${profile.house||'—'}</td><td>${vals.length}</td><td>${avg===null?'—':avg+'%'}</td></tr>`
    : '<tr><td colspan="5">No student profile saved on this browser yet.</td></tr>';

  document.getElementById('teacherResultsTable').innerHTML=vals.length
    ? vals.map(r=>`<tr><td>${profile.name||'Student'}</td><td>${r.title}</td><td>${r.score}/${r.total} (${r.pct}%)</td><td>${r.date||'—'}</td><td>+${r.points||0}</td></tr>`).join('')
    : '<tr><td colspan="5">No exercise results saved yet.</td></tr>';
}


const DB=window.EXERCISES;
const norm=s=>String(s??'').toLowerCase().trim().replace(/[.!?]/g,'').replace(/[’]/g,"'").replace(/\s+/g,' ');
function go(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById(id)?.classList.add('active');window.scrollTo(0,0);refresh();}
function stars(n){return '★'.repeat(n)}
function allExercises(){return Object.entries(DB).flatMap(([cat,arr])=>arr.map(e=>({...e,unit:e.unit||1,cat})))}
function showCategory(cat){
 go('topics');
 const list=(DB[cat]||[]).map(e=>card(e,cat)).join('');
 document.getElementById('topicList').innerHTML=`<section class="topic-section"><h2>${cat}</h2><div class="exercise-grid">${list}</div></section>`;
}
function renderUnit(n){
 const cats=Object.keys(DB);
 document.getElementById('unitDetail').innerHTML=cats.map(cat=>{
   const es=(DB[cat]||[]).filter(e=>(e.unit||1)===n);
   if(!es.length)return '';
   return `<section class="topic-section"><h2>${cat}</h2><div class="exercise-grid">${es.map(e=>card(e,cat)).join('')}</div></section>`;
 }).join('');
}
function showUnit1(){renderUnit(1)}
function showUnit2(){renderUnit(2)}
function card(e,cat){
 const unit=e.unit||1;
 const r=JSON.parse(localStorage.getItem('pp_results')||'{}')[e.id];
 const at=attempts?.()?.[e.id]||0;
 const status=r ? `✓ Completed · Best ${r.best??r.pct}%` : 'Start exercise →';
 return `<div class="exercise-card" onclick="openExercise('${cat.replaceAll("'","\'")}','${e.id}')">
   <div class="exercise-topline"><span class="unit-pill">Unit ${unit}</span><div class="stars">${stars(e.stars)}</div></div>
   <h3>${e.title}</h3><p>${e.points} House Points</p><small>${status}${at?` · ${at} attempt${at===1?'':'s'}`:''}</small>
 </div>`;
}
function completed(id){return !!JSON.parse(localStorage.getItem('pp_results')||'{}')[id]}
function openExercise(cat,id){
 const e=DB[cat].find(x=>x.id===id); window.current={...e,cat};
 go('exercise'); renderExercise(e,cat);
}
function renderExercise(e,cat){
 let h=`<div class="exercise-shell"><button class="backbtn" onclick="showCategory('${cat}')">← Back</button>
 <div class="exercise-head"><div><small>Unit ${e.unit||1} · ${cat}</small><h1>${e.title}</h1></div>
 <div class="difficulty">${stars(e.stars)}<span>${e.points} House Points</span></div></div>`;
 if(e.instructions)h+=`<p class="exercise-instructions">${e.instructions}</p>`;
 if(e.image)h+=`<div class="exercise-visual"><img src="${e.image}" alt=""></div>`;
 if(e.wordbank)h+=`<div class="word-bank">${e.wordbank.map(w=>`<span>${w}</span>`).join('')}</div>`;
 if(e.text)h+=`<div class="reading-text">${e.text.split('\\n').map(p=>`<p>${p}</p>`).join('')}</div>`;
 if(e.type==='cloze')h+=renderCloze(e);
 else if(e.type==='match')h+=renderMatch(e);
 else if(e.type==='multi')h+=renderMulti(e);
 else if(e.type==='demonstrative_mcq')h+=renderDemonstratives(e,true);
 else if(e.type==='demonstrative_text')h+=renderDemonstratives(e,false);
 else h+=renderStandard(e);
 h+=`<button class="checkbtn" onclick="checkExercise()">CHECK</button><div id="feedback"></div></div>`;
 document.getElementById('exerciseBox').innerHTML=h;
}
function renderStandard(e){return `<div class="questions">${e.items.map((it,i)=>{
 let q=it[0], opts=(e.type==='mcq'||e.type==='reading')?it[1]:null;
 if(opts)return `<div class="question" data-i="${i}"><b>${i+1}. ${q}</b><div class="options">${opts.map(o=>`<label><input type="radio" name="q${i}" value="${esc(o)}"> ${o}</label>`).join('')}</div></div>`;
 return `<div class="question" data-i="${i}"><b>${i+1}. ${q}</b><input class="answer" type="text" autocomplete="off"></div>`
 }).join('')}</div>`}
function renderMatch(e){return `<div class="questions">${e.items.map((it,i)=>`<div class="question"><b>${i+1}. ${it[0]}</b><select class="answer"><option value="">Choose...</option>${shuffle(e.items.map(x=>x[1])).map(o=>`<option>${o}</option>`).join('')}</select></div>`).join('')}</div>`}
function renderMulti(e){return `<div class="questions">${e.items.map((it,i)=>`<div class="question"><b>${i+1}. ${it[0]}</b><div class="multiinputs">${it[1].map(()=>`<input class="answer" type="text">`).join('')}</div></div>`).join('')}</div>`}
function renderCloze(e){let n=0;let t=e.text.replace(/___/g,()=>`<input class="clozeInput" data-i="${n++}" type="text">`);return `<div class="reading-text cloze">${t}</div>`}

function demoIcon(name,many){
 const icons={book:'📕',phone:'📱',bags:'🎒',shoes:'👟',dog:'🐕',girl:'👧',books:'📚',boys:'👦',photo:'🖼️',man:'👨',glasses:'👓',girls:'👧',brother:'👦',parents:'👩‍🦰👨',bag:'🎒',cousins:'🧑🧑',sister:'👧',friends:'🧑🧑',uncle:'👨'};
 return icons[name]||'●';
}
function renderDemonstratives(e,mcq){
 return `<div class="questions">${e.items.map((it,i)=>{
   const [obj,count,distance,prompt,answersOrOpts,correct]=it;
   const far=distance==='far';
   const visual=`<div class="distance-demo ${far?'far':'near'}"><span class="viewer">YOU</span><span class="object">${demoIcon(obj,count==='many')}</span></div>`;
   if(mcq){
      return `<div class="question" data-i="${i}">${visual}<b>${i+1}. ${prompt}</b><div class="options">${answersOrOpts.map(o=>`<label><input type="radio" name="q${i}" value="${esc(o)}"> ${o}</label>`).join('')}</div></div>`;
   }
   return `<div class="question" data-i="${i}">${visual}<b>${i+1}. ${prompt}</b><input class="answer" type="text" autocomplete="off"></div>`;
 }).join('')}</div>`;
}

function esc(s){return String(s).replace(/"/g,'&quot;')}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function accepts(val,ans){
 const arr=Array.isArray(ans)?ans:[ans];
 return arr.some(a=>String(a).split('|').some(v=>norm(v)===norm(val)));
}
function checkExercise(){
 const e=window.current; let correct=0,total=0;
 if(e.type==='cloze'){
   const ins=[...document.querySelectorAll('.clozeInput')];total=e.answers.length;
   ins.forEach((x,i)=>{let ok=accepts(x.value,e.answers[i]);x.classList.toggle('right',ok);x.classList.toggle('wrong',!ok);if(ok)correct++})
 }else if(e.type==='multi'){
   const qs=[...document.querySelectorAll('.question')];total=e.items.length;
   qs.forEach((q,i)=>{let ins=[...q.querySelectorAll('input')],ans=e.items[i][1];let ok=ins.length===ans.length&&ins.every((x,j)=>accepts(x.value,ans[j]));q.classList.toggle('qright',ok);q.classList.toggle('qwrong',!ok);if(ok)correct++})
 }else{
   const qs=[...document.querySelectorAll('.question')];total=e.items.length;
   qs.forEach((q,i)=>{let val;
     if(e.type==='mcq'||e.type==='reading'||e.type==='demonstrative_mcq'){val=q.querySelector('input:checked')?.value||''}
     else{val=q.querySelector('.answer')?.value||''}
     let ans;
     if(e.type==='match') ans=e.items[i][1];
     else if(e.type==='mcq'||e.type==='reading') ans=e.items[i][2];
     else if(e.type==='demonstrative_mcq') ans=e.items[i][5];
     else if(e.type==='demonstrative_text') ans=e.items[i][4];
     else ans=e.items[i].slice(1);
     let ok=accepts(val,ans);q.classList.toggle('qright',ok);q.classList.toggle('qwrong',!ok);if(ok)correct++;
   })
 }
 let pct=Math.round(correct/total*100);
 document.getElementById('feedback').innerHTML=`<div class="scorebox"><h2>${correct}/${total} · ${pct}%</h2><p>${pct>=85?'Excellent!':pct>=60?'Well done!':'Good try! Check your answers and try again.'}</p></div>`;
 let at=attempts(); at[e.id]=(at[e.id]||0)+1; localStorage.setItem(ATTEMPTS_KEY,JSON.stringify(at));
 let earned=at[e.id]===1?e.points:(at[e.id]<=3?1:0);
 saveResult(e.id,{title:e.title,score:correct,total,pct,points:earned,cat:e.cat,date:new Date().toLocaleDateString(),attempt:at[e.id]});
 if(earned>0) award(earned); else refresh();
}
function completedBefore(id){let r=JSON.parse(localStorage.getItem('pp_awarded')||'{}');if(r[id])return true;r[id]=true;localStorage.setItem('pp_awarded',JSON.stringify(r));return false}
function saveResult(id,obj){let r=JSON.parse(localStorage.getItem('pp_results')||'{}');const prev=r[id]||{};obj.best=Math.max(prev.best??prev.pct??0,obj.pct??0);obj.first=prev.first??obj.pct;obj.latest=obj.pct;r[id]={...prev,...obj};localStorage.setItem('pp_results',JSON.stringify(r))}
function award(points){
 let hp=+(localStorage.getItem('pp_housepoints')||0);hp+=points;localStorage.setItem('pp_housepoints',hp);
 const profile=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');const house=profile.house||localStorage.getItem('pp_house')||'Gryffindor';localStorage.setItem('pp_house',house);
 const colors={Gryffindor:'#a6202b',Slytherin:'#26734a',Ravenclaw:'#27659a',Hufflepuff:'#e2b72f'};
 document.documentElement.style.setProperty('--gem',colors[house]);
 document.getElementById('rewardTitle').textContent=`+${points} House Points!`;
 document.getElementById('rewardText').textContent=`${house} earns ${points} points.`;
 const gems=document.getElementById('gems');gems.innerHTML='';
 for(let i=0;i<points;i++){let g=document.createElement('i');g.style.animationDelay=(i*.28)+'s';gems.appendChild(g)}
 document.getElementById('rewardOverlay').classList.add('show');refresh();
}
function closeReward(){document.getElementById('rewardOverlay').classList.remove('show')}
function refresh(){
 const results=JSON.parse(localStorage.getItem('pp_results')||'{}');const hp=+(localStorage.getItem('pp_housepoints')||0);
 ['housePoints','housePoints2'].forEach(id=>{let x=document.getElementById(id);if(x)x.textContent=hp});let dc=document.getElementById('doneCount');if(dc)dc.textContent=Object.keys(results).length;
 let rb=document.getElementById('resultsBox');if(rb)rb.innerHTML=Object.values(results).length?Object.values(results).map(r=>`<p><b>${r.title}</b> — ${r.score}/${r.total} (${r.pct}%)</p>`).join(''):'<p>No exercises completed yet.</p>';
}


document.addEventListener('DOMContentLoaded',()=>{
  const role=localStorage.getItem(LOGIN_KEY);
  if(role==='student' && localStorage.getItem(PROFILE_KEY)) openStudentApp();
  else if(role==='teacher') openTeacherApp();
  else {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('studentApp').classList.add('hidden');
    document.getElementById('teacherApp').classList.add('hidden');
  }
});

/* ===== v0.6 engagement/admin/protection ===== */
const ATTEMPTS_KEY='pp_attempts', BANNED_KEY='pp_banned';
function attempts(){return JSON.parse(localStorage.getItem(ATTEMPTS_KEY)||'{}')}
function getProgress(){
 const results=JSON.parse(localStorage.getItem('pp_results')||'{}');
 return Object.entries(results).reduce((acc,[id,r])=>{
   const ex=allExercises().find(e=>e.id===id);
   acc[id]={id,best:r.best??r.pct??0,last:r.pct??0,stars:ex?.stars??0,unit:ex?.unit??1,cat:ex?.cat??r.cat??'',title:r.title||ex?.title||id,attempts:(attempts()[id]||r.attempt||1)};
   return acc;
 },{});
}
function badgeData(){
 const rs=Object.values(getProgress());
 const perfect=rs.filter(r=>r.best===100).length;
 const perfect3=rs.filter(r=>r.best===100 && r.stars===3).length;
 const perfectIds=new Set(rs.filter(r=>r.best===100).map(r=>r.id));
 const allPerfect=(unit,cat)=>{
   const ids=allExercises().filter(e=>e.unit===unit && e.cat===cat).map(e=>e.id);
   return ids.length>0 && ids.every(id=>perfectIds.has(id));
 };
 return [
  ['Perfect Start','Perfect score in 1 exercise',perfect>=1,'badge_perfect_start.png'],
  ['Perfect Five','Perfect score in 5 exercises',perfect>=5,'badge_perfect_five.png'],
  ['Perfect Ten','Perfect score in 10 exercises',perfect>=10,'badge_perfect_ten.png'],
  ['Challenge Master','Perfect score in 20 three-star exercises',perfect3>=20,'badge_challenge_master.png'],
  ['Unit 1 · Vocabulary Explorer','Perfect score in every Unit 1 Vocabulary exercise',allPerfect(1,'Vocabulary'),'badge_u1_vocabulary.png'],
  ['Unit 1 · Grammar Master','Perfect score in every Unit 1 Grammar exercise',allPerfect(1,'Grammar'),'badge_u1_grammar.png'],
  ['Unit 1 · Reading Explorer','Perfect score in the Unit 1 Reading exercise',allPerfect(1,'Reading Comprehension'),'badge_u1_reading.png'],
  ['Unit 1 · Revision Master','Perfect score in every Unit 1 Revision exercise',allPerfect(1,'Revision'),'badge_u1_revision.png'],
  ['Unit 2 · Vocabulary Explorer','Perfect score in every Unit 2 Vocabulary exercise',allPerfect(2,'Vocabulary'),'badge_u2_vocabulary.png'],
  ['Unit 2 · Grammar Master','Perfect score in every Unit 2 Grammar exercise',allPerfect(2,'Grammar'),'badge_u2_grammar.png'],
  ['Unit 2 · Reading Explorer','Perfect score in the Unit 2 Reading exercise',allPerfect(2,'Reading Comprehension'),'badge_u2_reading.png'],
  ['Unit 2 · Revision Master','Perfect score in every Unit 2 Revision exercise',allPerfect(2,'Revision'),'badge_u2_revision.png']
 ];
}
function renderBadges(){
 const x=document.getElementById('badgeGrid');if(!x)return;
 x.innerHTML=badgeData().map(b=>`
   <div class="badge ${b[2]?'unlocked':'locked'}">
     <img class="badge-medal-img" src="assets/${b[3]}" alt="${b[0]}">
     <h3>${b[0]}</h3>
     <p>${b[1]}</p>
     <b>${b[2]?'Unlocked':'Locked'}</b>
   </div>`).join('');
}
const oldRefresh=refresh;refresh=function(){oldRefresh();renderBadges();}
function adminChangeHouse(){const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');const h=prompt('New House: Gryffindor, Slytherin, Ravenclaw or Hufflepuff',p.house||'');if(!['Gryffindor','Slytherin','Ravenclaw','Hufflepuff'].includes(h))return;p.house=h;localStorage.setItem(PROFILE_KEY,JSON.stringify(p));localStorage.setItem('pp_house',h);refreshTeacher()}
function adminRemovePoints(){let hp=+(localStorage.getItem('pp_housepoints')||0);let n=+(prompt('How many House Points do you want to remove?','1')||0);if(n>0)localStorage.setItem('pp_housepoints',Math.max(0,hp-n));refreshTeacher()}
function adminToggleBan(){let b=localStorage.getItem(BANNED_KEY)==='1';localStorage.setItem(BANNED_KEY,b?'0':'1');refreshTeacher()}
const oldOpenStudent=openStudentApp;openStudentApp=function(){if(localStorage.getItem(BANNED_KEY)==='1'){alert('This student account has been disabled by the teacher.');logout();return;}oldOpenStudent();document.body.classList.add('student-mode');const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');let w=document.getElementById('studentWatermark');w.textContent=`${p.name||'Student'} · ${p.klass||''}`;w.classList.remove('hidden')}
const oldOpenTeacher=openTeacherApp;openTeacherApp=function(){document.body.classList.remove('student-mode');document.getElementById('studentWatermark')?.classList.add('hidden');oldOpenTeacher()}
const oldLogout=logout;logout=function(){document.body.classList.remove('student-mode');document.getElementById('studentWatermark')?.classList.add('hidden');oldLogout()}
document.addEventListener('contextmenu',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('copy',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('cut',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('paste',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('keydown',e=>{if(document.body.classList.contains('student-mode')&&((e.ctrlKey||e.metaKey)&&['c','v','x','s','p','u'].includes(e.key.toLowerCase())))e.preventDefault()});
const oldRefreshTeacher=refreshTeacher;refreshTeacher=function(){oldRefreshTeacher();const profile=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');const results=JSON.parse(localStorage.getItem('pp_results')||'{}'),vals=Object.values(results);const avg=vals.length?Math.round(vals.reduce((a,b)=>a+(b.pct||0),0)/vals.length):null;let t=document.getElementById('teacherStudentsTable');if(profile.name)t.innerHTML=`<tr><td>${profile.name}</td><td>${profile.klass||'—'}</td><td>${profile.house||'—'}</td><td>${vals.length}</td><td>${avg===null?'—':avg+'%'}</td><td><div class="admin-actions"><button onclick="adminRemovePoints()">− Points</button><button onclick="adminChangeHouse()">Change House</button><button onclick="adminToggleBan()">${localStorage.getItem(BANNED_KEY)==='1'?'Unban':'Ban'}</button></div>${localStorage.getItem(BANNED_KEY)==='1'?'<div class="banned-note">BANNED</div>':''}</td></tr>`;}
