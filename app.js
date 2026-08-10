
const DB=window.EXERCISES;
const norm=s=>String(s??'').toLowerCase().trim().replace(/[.!?]/g,'').replace(/[’]/g,"'").replace(/\s+/g,' ');
function go(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById(id)?.classList.add('active');window.scrollTo(0,0);refresh();}
function stars(n){return '★'.repeat(n)}
function allExercises(){return Object.entries(DB).flatMap(([cat,arr])=>arr.map(e=>({...e,cat})))}
function showCategory(cat){go('topics');document.getElementById('topicList').innerHTML=`<section class="topic-section"><h2>${cat}</h2><div class="exercise-grid">${DB[cat].map(e=>card(e,cat)).join('')}</div></section>`}
function showUnit1(){document.getElementById('unitDetail').innerHTML=Object.keys(DB).map(cat=>`<section class="topic-section"><h2>${cat}</h2><div class="exercise-grid">${DB[cat].map(e=>card(e,cat)).join('')}</div></section>`).join('');}
function card(e,cat){return `<div class="exercise-card" onclick="openExercise('${cat.replaceAll("'","\\'")}','${e.id}')"><div class="stars">${stars(e.stars)}</div><h3>${e.title}</h3><p>${e.points} House Points</p><small>${completed(e.id)?'✓ Completed':'Start exercise →'}</small></div>`}
function completed(id){return !!JSON.parse(localStorage.getItem('pp_results')||'{}')[id]}
function openExercise(cat,id){
 const e=DB[cat].find(x=>x.id===id); window.current={...e,cat};
 go('exercise'); renderExercise(e,cat);
}
function renderExercise(e,cat){
 let h=`<div class="exercise-shell"><button class="backbtn" onclick="showCategory('${cat}')">← Back</button><div class="exercise-head"><div><small>${cat}</small><h1>${e.title}</h1></div><div class="difficulty">${stars(e.stars)}<span>${e.points} House Points</span></div></div>`;
 if(e.text)h+=`<div class="reading-text">${e.text.split('\n').map(p=>`<p>${p}</p>`).join('')}</div>`;
 if(e.type==='cloze'){h+=renderCloze(e)}
 else if(e.type==='match'){h+=renderMatch(e)}
 else if(e.type==='multi'){h+=renderMulti(e)}
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
   qs.forEach((q,i)=>{let val;if(e.type==='mcq'||e.type==='reading'){val=q.querySelector('input:checked')?.value||''}else{val=q.querySelector('.answer')?.value||''}
     let ans=(e.type==='match')?e.items[i][1]:(e.type==='mcq'||e.type==='reading'?e.items[i][2]:e.items[i].slice(1));
     let ok=accepts(val,ans);q.classList.toggle('qright',ok);q.classList.toggle('qwrong',!ok);if(ok)correct++;
   })
 }
 let pct=Math.round(correct/total*100);
 document.getElementById('feedback').innerHTML=`<div class="scorebox"><h2>${correct}/${total} · ${pct}%</h2><p>${pct>=85?'Excellent!':pct>=60?'Well done!':'Good try! Check your answers and try again.'}</p></div>`;
 saveResult(e.id,{title:e.title,score:correct,total,pct,points:e.points,cat:e.cat,date:new Date().toLocaleDateString()});
 if(!completedBefore(e.id)) award(e.points);
 else refresh();
}
function completedBefore(id){let r=JSON.parse(localStorage.getItem('pp_awarded')||'{}');if(r[id])return true;r[id]=true;localStorage.setItem('pp_awarded',JSON.stringify(r));return false}
function saveResult(id,obj){let r=JSON.parse(localStorage.getItem('pp_results')||'{}');r[id]=obj;localStorage.setItem('pp_results',JSON.stringify(r))}
function award(points){
 let hp=+(localStorage.getItem('pp_housepoints')||0);hp+=points;localStorage.setItem('pp_housepoints',hp);
 const house=document.getElementById('houseSelect')?.value||localStorage.getItem('pp_house')||'Gryffindor';localStorage.setItem('pp_house',house);
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
document.addEventListener('change',e=>{if(e.target.id==='houseSelect')localStorage.setItem('pp_house',e.target.value)});
document.addEventListener('DOMContentLoaded',()=>{let h=localStorage.getItem('pp_house');if(h&&document.getElementById('houseSelect'))document.getElementById('houseSelect').value=h;refresh()});
