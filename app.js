
const D=window.SITE_DATA;
function markNav(id){
 document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
 const map={home:0,topics:1,units:2,badges:3,houses:4,progress:5};
 if(map[id]!==undefined) document.querySelectorAll('.nav-item')[map[id]]?.classList.add('active');
}
function go(id){
 document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
 const target=document.getElementById(id); if(!target)return;
 target.classList.add('active'); markNav(id); window.scrollTo({top:0,behavior:'smooth'});
 history.replaceState({page:id},'', '#'+id);
}
function openPlaceholder(name,meta){
 document.getElementById('placeholderTitle').textContent=name;
 document.getElementById('placeholderMeta').textContent=meta||'';
 go('placeholder');
}
function showCategory(cat){
 go('topics');
 const box=document.getElementById('topicList');
 box.innerHTML=`<section class="topic-section"><h2>${cat}</h2><div class="topic-grid">${
 D.topics[cat].map(([n,u])=>`<div class="topic" onclick="openPlaceholder(${JSON.stringify(n)},${JSON.stringify(cat+' · '+u)})"><b>${n}</b><small>${u}</small></div>`).join('')
 }</div></section>`;
 setTimeout(()=>box.scrollIntoView({behavior:'smooth',block:'start'}),50);
}
const ug=document.getElementById('unitGrid');
Object.keys(D.units).forEach(u=>{
 const x=document.createElement('div');x.className='unit';
 x.innerHTML=`<b>${u}</b><span>Vocabulary · Grammar · Reading · Revision</span>`;
 x.onclick=()=>showUnit(u);ug.appendChild(x);
});
function showUnit(u){
 let grouped={Vocabulary:[],Grammar:[],'Reading Comprehension':[]};
 D.units[u].forEach(([c,n])=>grouped[c].push(n));
 document.getElementById('unitDetail').innerHTML=`<section class="topic-section"><h2>${u}</h2>${
 Object.entries(grouped).map(([c,a])=>`<h3>${c}</h3><div class="topic-grid">${
 a.map(n=>`<div class="topic" onclick="openPlaceholder(${JSON.stringify(n)},${JSON.stringify(u+' · '+c)})"><b>${n}</b><small>Exercise bank coming later</small></div>`).join('')
 }</div>`).join('')
 }<h3>Revision</h3><div class="topic-grid"><div class="topic" onclick="openPlaceholder(${JSON.stringify(u+' Mixed Revision')},${JSON.stringify(u+' · Revision')})"><b>Mixed Revision</b><small>Exercise bank coming later</small></div></div></section>`;
 setTimeout(()=>document.getElementById('unitDetail').scrollIntoView({behavior:'smooth'}),50);
}
const badges=[
 ['★','First Steps','Complete your first exercise',false],
 ['✦','Grammar Star','Score 90% or more in Grammar',true],
 ['Aa','Word Wizard','Complete 25 Vocabulary exercises',true],
 ['▤','Bookworm','Complete 10 Reading exercises',true],
 ['♛','Team Player','Earn 100 House Points',true],
 ['🏆','Unit Master','Complete all practice in one unit',true]
];
document.getElementById('badgeGrid').innerHTML=badges.map(b=>`<div class="badge ${b[3]?'locked':''}"><div class="medal">${b[0]}</div><h3>${b[1]}</h3><p>${b[2]}</p></div>`).join('');
const monthData={September:[320,285,350,300],October:[410,455,390,425],November:[275,310,290,335],'School Year':[1005,1050,1030,1060]};
function month(m){
 document.getElementById('monthTitle').textContent=m+' House Points';
 document.getElementById('monthData').innerHTML=monthData[m].map((p,i)=>`<tr><td>House ${String.fromCharCode(65+i)}</td><td><b>${p}</b></td></tr>`).join('');
}
month('September');
const initial=location.hash.slice(1); if(initial&&document.getElementById(initial))go(initial);
