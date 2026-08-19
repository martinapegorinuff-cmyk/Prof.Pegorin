
const LOGIN_KEY='pp_current_role';
const USERS_KEY='pp_users_v2';
const CURRENT_USER_KEY='pp_current_user';

// House-theme test accounts (not stored in the real student database)
const TEST_ACCOUNTS={
  gryffindor:{firstName:'Gryffindor',lastName:'Test',klass:'TEST',house:'Gryffindor',email:'',password:'G1',banned:false,isTest:true},
  slytherin:{firstName:'Slytherin',lastName:'Test',klass:'TEST',house:'Slytherin',email:'',password:'S1',banned:false,isTest:true},
  ravenclaw:{firstName:'Ravenclaw',lastName:'Test',klass:'TEST',house:'Ravenclaw',email:'',password:'R1',banned:false,isTest:true},
  hufflepuff:{firstName:'Hufflepuff',lastName:'Test',klass:'TEST',house:'Hufflepuff',email:'',password:'H1',banned:false,isTest:true}
};
let teacherPreviewMode=false;
let teacherPreviewHouse='Gryffindor';
const HOUSE_THEME_CLASSES=['house-gryffindor','house-slytherin','house-ravenclaw','house-hufflepuff'];
function applyHouseTheme(house){
  document.body.classList.remove(...HOUSE_THEME_CLASSES);
  const cls={Gryffindor:'house-gryffindor',Slytherin:'house-slytherin',Ravenclaw:'house-ravenclaw',Hufflepuff:'house-hufflepuff'}[house];
  if(cls)document.body.classList.add(cls);
}
function clearHouseTheme(){document.body.classList.remove(...HOUSE_THEME_CLASSES)}
function resolveUser(userId){
  const id=String(userId||'').trim();
  const preset=TEST_ACCOUNTS[id.toLowerCase()];
  // Reserved quick-test IDs always resolve to their built-in House account,
  // even if an older local registration exists with the same name.
  return preset||getUsers()[id]||null;
}
function isPresetTestAccount(userId){
  return !!TEST_ACCOUNTS[String(userId||'').trim().toLowerCase()];
}

const HOUSE_POINTS_START = new Date(2026,8,1,0,0,0); // 1 September 2026
const SCHOOL_MONTHS=['September','October','November','December','January','February','March','April','May','June'];

const VOCAB_SONGS=[
  {id:'song_u1_countries',title:'Where Are You From?',topic:'Countries & Nationalities',unit:1,src:'assets/songs/where_are_you_from.mp4'},
  {id:'song_u2_family',title:"Who's Who?",topic:'Family',unit:2,src:'assets/songs/whos_who.mp4'},
  {id:'song_u2_appearance',title:'Look Again',topic:'Physical Appearance',unit:2,src:'assets/songs/look_again.mp4'},
  {id:'song_u3_earbuds',title:'Where Are My Earbuds?',topic:'Rooms & Prepositions of Place',unit:3,src:'assets/songs/where_are_my_earbuds.mp4'},
  {id:'song_u4_give_try',title:'Give It a Try',topic:'Free Time & Sports',unit:4,src:'assets/songs/give_it_a_try.mp4'},
  {id:'song_u5_final_bell',title:'Final Bell',topic:'School',unit:5,src:'assets/songs/final_bell.mp4'},
  {id:'song_u6_five_more_minutes',title:'Five More Minutes',topic:'Daily Routine',unit:6,src:'assets/songs/five_more_minutes.mp4'},
  {id:'song_u7_whats_in_the_fridge',title:"What's in the Fridge?",topic:'Food & Drinks',unit:7,src:'assets/songs/whats_in_the_fridge.mp4'}
];

function isUnitUnlocked(unit){return true}
function updateUnitAccessUI(){}
function renderTeacherUnitAccess(){}
let currentSongSort='title';
function songCard(song){
  return `<article class="song-card" data-song-id="${song.id}"><div class="song-meta"><span class="unit-pill">Unit ${song.unit}</span><span>${song.topic}</span></div><h3>${song.title}</h3><video controls preload="metadata" playsinline src="${song.src}">Your browser does not support video playback.</video></article>`;
}

function getCompletedSongs(){
  return JSON.parse(localStorage.getItem(userKey('completed_songs'))||'{}');
}
function songIsCompleted(songId){
  return !!getCompletedSongs()[songId];
}
function markSongCompleted(songId){
  if(teacherPreviewMode)return;
  const done=getCompletedSongs();
  if(done[songId])return;
  done[songId]=true;
  localStorage.setItem(userKey('completed_songs'),JSON.stringify(done));
  renderBadges();
}
function attachSongTracking(){
  document.querySelectorAll('#songsList .song-card').forEach(card=>{
    const songId=card.dataset.songId;
    const video=card.querySelector('video');
    if(!songId||!video||video.dataset.trackingAttached==='1')return;
    video.dataset.trackingAttached='1';
    let listened=0;
    let lastTime=0;
    let seeking=false;

    video.addEventListener('play',()=>{lastTime=video.currentTime||0;});
    video.addEventListener('seeking',()=>{seeking=true;});
    video.addEventListener('seeked',()=>{seeking=false;lastTime=video.currentTime||0;});
    video.addEventListener('timeupdate',()=>{
      const now=video.currentTime||0;
      if(!video.paused && !seeking){
        const delta=now-lastTime;
        // Normal playback advances in small increments. Large jumps are seeks and do not count.
        if(delta>0 && delta<=2.5)listened+=delta;
      }
      lastTime=now;
      const duration=Number.isFinite(video.duration)?video.duration:0;
      if(duration>0 && listened>=duration*0.90)markSongCompleted(songId);
    });
    video.addEventListener('ended',()=>{
      const duration=Number.isFinite(video.duration)?video.duration:0;
      if(duration>0 && listened>=duration*0.90)markSongCompleted(songId);
    });
  });
}

function renderSongs(mode=currentSongSort){
  currentSongSort=mode;
  document.querySelectorAll('.song-sort').forEach(b=>b.classList.remove('active'));
  const active={title:'songSortTitle',topic:'songSortTopic',unit:'songSortUnit'}[mode];document.getElementById(active)?.classList.add('active');
  const box=document.getElementById('songsList');if(!box)return;
  const songs=[...VOCAB_SONGS];
  if(!songs.length){box.innerHTML='<div class="locked-content"><div class="lock-symbol">♫</div><h2>No songs available yet</h2><p>More vocabulary songs will be added here.</p></div>';return}
  if(mode==='unit'){
    const groups=[...new Set(songs.map(s=>s.unit))].sort((a,b)=>a-b);
    box.innerHTML=groups.map(u=>`<section class="song-group"><h2>Unit ${u}</h2><div class="song-grid">${songs.filter(s=>s.unit===u).sort((a,b)=>a.title.localeCompare(b.title,'en')).map(songCard).join('')}</div></section>`).join('');
  }else if(mode==='topic'){
    const ordered=[...songs].sort((a,b)=>a.topic.localeCompare(b.topic,'en')||a.title.localeCompare(b.title,'en'));
    box.innerHTML=`<div class="song-grid">${ordered.map(songCard).join('')}</div>`;
  }else{
    const ordered=[...songs].sort((a,b)=>a.title.localeCompare(b.title,'en'));
    box.innerHTML=`<div class="song-grid">${ordered.map(songCard).join('')}</div>`;
  }
  attachSongTracking();
}

function housePointsSeasonOpen(d=new Date()){return d>=HOUSE_POINTS_START}
function monthName(d=new Date()){return d.toLocaleString('en-US',{month:'long'})}
function getHousePointMonths(userId=activeUserId()){
  return JSON.parse(localStorage.getItem(userKey('housepoints_months',userId))||'{}');
}
function saveHousePointMonths(data,userId=activeUserId()){
  localStorage.setItem(userKey('housepoints_months',userId),JSON.stringify(data));
}
function housePointsForMonth(month,userId=activeUserId()){
  if(!housePointsSeasonOpen()) return 0;
  const data=getHousePointMonths(userId);
  return +(data[month]||0);
}
function schoolYearHousePoints(userId=activeUserId()){
  if(!housePointsSeasonOpen()) return 0;
  const data=getHousePointMonths(userId);
  return SCHOOL_MONTHS.reduce((sum,m)=>sum+(+(data[m]||0)),0);
}
function addHousePoints(points,userId=activeUserId(),d=new Date()){
  if(!housePointsSeasonOpen(d)) return false;
  const m=monthName(d);
  if(!SCHOOL_MONTHS.includes(m)) return false;
  const data=getHousePointMonths(userId);
  data[m]=+(data[m]||0)+points;
  saveHousePointMonths(data,userId);
  return true;
}


function getUsers(){return JSON.parse(localStorage.getItem(USERS_KEY)||'{}')}
function saveUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(users))}
function activeUserId(){
  if(teacherPreviewMode)return '__teacher_preview__';
  return localStorage.getItem(CURRENT_USER_KEY)||sessionStorage.getItem(CURRENT_USER_KEY)||'';
}
function userKey(name,userId=activeUserId()){return `pp_user_${encodeURIComponent(userId)}_${name}`}
function currentProfile(){
  if(teacherPreviewMode)return {name:'Teacher Preview',firstName:'Teacher',lastName:'Preview',klass:'Preview',house:teacherPreviewHouse,email:'',userId:'__teacher_preview__',banned:false};
  const id=activeUserId(),u=resolveUser(id);
  return u?{name:`${u.firstName} ${u.lastName}`,firstName:u.firstName,lastName:u.lastName,klass:u.klass,house:u.house,email:u.email,userId:id,banned:!!u.banned,isTest:!!u.isTest}:{};
}
function updateUser(userId,patch){
  const users=getUsers();if(!users[userId])return false;
  users[userId]={...users[userId],...patch};saveUsers(users);return true;
}
function normalizeName(s){return String(s||'').trim().replace(/\s+/g,' ')}
function titleName(s){return normalizeName(s).split(' ').map(x=>x?x[0].toUpperCase()+x.slice(1).toLowerCase():'').join(' ')}
function credentialPart(s){
  return normalizeName(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z]/g,'').slice(0,3).toLowerCase();
}
function makePassword(first,last){
  let n;do{n=Math.floor(Math.random()*90)+10}while(n===67||n===69);
  const a=credentialPart(first),b=credentialPart(last);
  return `${a.charAt(0).toUpperCase()+a.slice(1)}${b}.${String(n).padStart(2,'0')}`;
}
function showLoginForm(role){
  const s=document.getElementById('studentLoginForm'),t=document.getElementById('teacherLoginForm');
  if(s)s.classList.toggle('hidden',role!=='student');
  if(t)t.classList.toggle('hidden',role!=='teacher');
  if(role==='student')showStudentAuth('login');
}
function hideLoginForms(){
  document.getElementById('studentLoginForm').classList.add('hidden');
  document.getElementById('teacherLoginForm').classList.add('hidden');
}
function showStudentAuth(mode){
  document.getElementById('studentLoginPane')?.classList.toggle('hidden',mode!=='login');
  document.getElementById('studentRegisterPane')?.classList.toggle('hidden',mode!=='register');
  document.getElementById('registrationSuccess')?.classList.add('hidden');
  document.getElementById('studentLoginTab')?.classList.toggle('active',mode==='login');
  document.getElementById('studentRegisterTab')?.classList.toggle('active',mode==='register');
}
function registerStudent(){
  const firstName=titleName(document.getElementById('regFirstName').value);
  const lastName=titleName(document.getElementById('regLastName').value);
  const klass=normalizeName(document.getElementById('regClass').value).toUpperCase();
  const house=document.getElementById('regHouse').value;
  const email=normalizeName(document.getElementById('regEmail').value).toLowerCase();
  const fb=document.getElementById('registrationFeedback');fb.textContent='';
  if(!firstName||!lastName||!klass||!house||!email){fb.textContent='Compila tutti i campi.';return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){fb.textContent='Inserisci un indirizzo email scolastico valido.';return}
  const userId=`${firstName} ${lastName}`,users=getUsers();
  if(users[userId]){fb.textContent='Esiste già un account con questo nome. Chiedi aiuto alla tua insegnante.';return}
  const password=makePassword(firstName,lastName);
  users[userId]={firstName,lastName,klass,house,email,password,banned:false,createdAt:new Date().toISOString()};
  saveUsers(users);
  document.getElementById('generatedUserId').textContent=userId;
  document.getElementById('generatedPassword').textContent=password;
  document.getElementById('registrationEmailStatus').textContent=
    `Le credenziali sono state create per ${email}. In questa versione del sito non vengono inviate via email: salvale ora. Se le perdi, potrai chiederle alla tua insegnante.`;
  document.getElementById('studentRegisterPane').classList.add('hidden');
  document.getElementById('studentLoginTab').classList.remove('active');
  document.getElementById('studentRegisterTab').classList.remove('active');
  document.getElementById('registrationSuccess').classList.remove('hidden');
}
function useGeneratedLogin(){
  document.getElementById('studentUserIdInput').value=document.getElementById('generatedUserId').textContent;
  document.getElementById('studentPasswordInput').value=document.getElementById('generatedPassword').textContent;
  showStudentAuth('login');
}
function toggleStudentPassword(){
  const input=document.getElementById('studentPasswordInput');
  const btn=document.getElementById('studentPasswordToggle');
  if(!input||!btn)return;
  const show=input.type==='password';
  input.type=show?'text':'password';
  btn.textContent=show?'Hide':'Show';
  btn.setAttribute('aria-pressed',show?'true':'false');
  btn.setAttribute('aria-label',show?'Hide password':'Show password');
}
function studentLogin(){
  const typedUserId=normalizeName(document.getElementById('studentUserIdInput').value);
  const testId=typedUserId.toLowerCase();
  const isTest=!!TEST_ACCOUNTS[testId];
  const userId=isTest?testId:typedUserId;
  const password=document.getElementById('studentPasswordInput').value||'';
  const remember=!!document.getElementById('studentRememberInput').checked;
  const u=resolveUser(userId),fb=document.getElementById('studentLoginFeedback');fb.textContent='';
  if(!u||u.password!==password){fb.textContent='Incorrect User ID or password.';return}
  if(u.banned){fb.textContent='This account has been disabled by the teacher.';return}
  teacherPreviewMode=false;
  localStorage.removeItem(CURRENT_USER_KEY);sessionStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(LOGIN_KEY);sessionStorage.removeItem(LOGIN_KEY);
  const store=remember?localStorage:sessionStorage;
  store.setItem(CURRENT_USER_KEY,userId);store.setItem(LOGIN_KEY,'student');
  openStudentApp();
}
function teacherLogin(){
  const code=(document.getElementById('teacherCodeInput').value||'').trim().toUpperCase();
  if(code!=='PEGORIN'){
    document.getElementById('teacherLoginFeedback').textContent='Incorrect teacher code.';return;
  }
  localStorage.setItem(LOGIN_KEY,'teacher');openTeacherApp();
}
function logout(){
  PAGE_HISTORY.length=0;
  localStorage.removeItem(LOGIN_KEY);sessionStorage.removeItem(LOGIN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);sessionStorage.removeItem(CURRENT_USER_KEY);
  document.getElementById('studentApp').classList.add('hidden');
  document.getElementById('teacherApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  hideLoginForms();
}
function openStudentApp(){
  PAGE_HISTORY.length=0;
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('teacherApp').classList.add('hidden');
  document.getElementById('studentApp').classList.remove('hidden');
  const p=currentProfile();
  applyHouseTheme(p.house||'Gryffindor');
  document.getElementById('studentProfileName').textContent=p.name||'Student';
  document.getElementById('studentProfileMeta').textContent=`${p.klass||'—'} · ${p.house||'Gryffindor'}`;
  document.getElementById('welcomeStudent').textContent=`Welcome back, ${p.name||'Student'}!`;
  document.getElementById('studentHouseDisplay').textContent=p.house||'Gryffindor';
  document.getElementById('housePageTitle').textContent=p.house||'My House';
  go('home'); refresh();
}
function openTeacherPreview(house='Gryffindor'){
  teacherPreviewMode=true;
  teacherPreviewHouse=house;
  const sel=document.getElementById('teacherPreviewHouse');if(sel)sel.value=house;
  openStudentApp();
  document.body.classList.remove('student-mode');
  document.body.classList.add('teacher-preview-mode');
  document.getElementById('studentWatermark')?.classList.add('hidden');
  document.getElementById('teacherPreviewBar')?.classList.remove('hidden');
}
function setPreviewHouse(house){
  if(!['Gryffindor','Slytherin','Ravenclaw','Hufflepuff'].includes(house))return;
  teacherPreviewHouse=house;
  applyHouseTheme(house);
  const p=currentProfile();
  document.getElementById('studentProfileMeta').textContent=`Preview · ${p.house}`;
  document.getElementById('studentHouseDisplay').textContent=p.house;
  document.getElementById('housePageTitle').textContent=p.house;
  refresh();
}
function exitTeacherPreview(){
  teacherPreviewMode=false;
  document.body.classList.remove('teacher-preview-mode','student-mode');
  clearHouseTheme();
  document.getElementById('teacherPreviewBar')?.classList.add('hidden');
  document.getElementById('studentWatermark')?.classList.add('hidden');
  document.getElementById('studentApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('teacherApp').classList.remove('hidden');
  PAGE_HISTORY.length=0;
  refreshTeacher();
  teacherMonth('September');
}
function openTeacherApp(){
  teacherPreviewMode=false;
  document.body.classList.remove('teacher-preview-mode');
  clearHouseTheme();
  document.getElementById('teacherPreviewBar')?.classList.add('hidden');
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('studentApp').classList.add('hidden');
  document.getElementById('teacherApp').classList.remove('hidden');
  refreshTeacher();
  teacherMonth('September');
}
function teacherSection(id,btn){
  if(id==='unitAccessTeacher')renderTeacherUnitAccess();
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
  const data={Gryffindor:0,Slytherin:0,Ravenclaw:0,Hufflepuff:0};
  Object.entries(getUsers()).forEach(([id,u])=>{
    data[u.house]+=m==='School Year'?schoolYearHousePoints(id):housePointsForMonth(m,id);
  });
  document.getElementById('teacherMonthTitle').textContent=`${m} House Points`;
  document.getElementById('teacherMonthData').innerHTML=Object.entries(data).map(([h,v])=>`<tr><td>${h}</td><td><b>${v}</b></td></tr>`).join('');
}
function teacherUserStats(userId){
  const results=JSON.parse(localStorage.getItem(userKey('results',userId))||'{}');
  const vals=Object.values(results);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+(b.pct||0),0)/vals.length):null;
  const hp=schoolYearHousePoints(userId);
  return {vals,avg,hp};
}
function jsArg(s){return encodeURIComponent(String(s))}
function teacherHouseColor(house){
  return {
    Ravenclaw:'#0e1a40',
    Gryffindor:'#740001',
    Hufflepuff:'#ECB939',
    Slytherin:'#2a623d'
  }[house]||'#18344f';
}
function toggleTeacherPassword(btn){
  const span=btn.parentElement.querySelector('.teacher-password-value');
  const showing=span.dataset.showing==='1';
  span.textContent=showing?'••••••••':span.dataset.password;
  span.dataset.showing=showing?'0':'1';
  btn.textContent=showing?'Mostra':'Nascondi';
}
function teacherHouseColor(house){
  return {
    Ravenclaw:'#0e1a40',
    Gryffindor:'#740001',
    Hufflepuff:'#ECB939',
    Slytherin:'#2a623d'
  }[house]||'#18344f';
}
function toggleTeacherPassword(btn){
  const span=btn.parentElement.querySelector('.teacher-password-value');
  const showing=span.dataset.showing==='1';
  span.textContent=showing?'••••••••':span.dataset.password;
  span.dataset.showing=showing?'0':'1';
  btn.textContent=showing?'Mostra':'Nascondi';
}
function teacherUserStats(userId){
  const results=JSON.parse(localStorage.getItem(userKey('results',userId))||'{}');
  const vals=Object.values(results);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+(b.pct||0),0)/vals.length):null;
  const hp=schoolYearHousePoints(userId);
  return {vals,avg,hp};
}
function jsArg(s){return encodeURIComponent(String(s))}
function refreshTeacher(){
  const users=getUsers();
  const entries=Object.entries(users).sort((a,b)=>{
    const ua=a[1], ub=b[1];
    const byLast=(ua.lastName||'').localeCompare(ub.lastName||'','it',{sensitivity:'base'});
    return byLast || (ua.firstName||'').localeCompare(ub.firstName||'','it',{sensitivity:'base'});
  });

  const stats=entries.map(([id,u])=>({id,u,...teacherUserStats(id)}));
  const totalAttempts=stats.reduce((n,s)=>n+s.vals.length,0);
  const scores=stats.flatMap(s=>s.vals.map(v=>v.pct||0));
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
  const hp=stats.reduce((n,s)=>n+s.hp,0);

  document.getElementById('teacherStudentsCount').textContent=entries.length;
  document.getElementById('teacherAttemptsCount').textContent=totalAttempts;
  document.getElementById('teacherAvgScore').textContent=avg===null?'—':avg+'%';
  document.getElementById('teacherLocalPoints').textContent=hp;

  const recent=[];
  stats.forEach(s=>s.vals.forEach(r=>recent.push({s,r})));
  document.getElementById('teacherRecentActivity').innerHTML=recent.length
    ? recent.slice(-8).reverse().map(x=>`<p><b class="teacher-student-name" style="color:${teacherHouseColor(x.s.u.house)}">${x.s.u.lastName} ${x.s.u.firstName}</b> · ${x.r.title} · ${x.r.pct}% · +${x.r.points||0}</p>`).join('')
    : '<p>No activity saved on this browser yet.</p>';

  document.getElementById('teacherStudentsTable').innerHTML=entries.length
    ? stats.map(s=>`<tr>
      <td><span class="teacher-student-name" style="color:${teacherHouseColor(s.u.house)}">${s.u.lastName} ${s.u.firstName}</span>${s.u.banned?' <span class="banned-note">BANNED</span>':''}</td>
      <td>${s.id}</td>
      <td><div class="teacher-password"><span class="teacher-password-value" data-password="${s.u.password}" data-showing="0">••••••••</span><button class="show-password-btn" onclick="toggleTeacherPassword(this)">Mostra</button></div></td>
      <td>${s.u.klass}</td>
      <td>${s.u.house}</td>
      <td>${s.u.email}</td>
      <td>${s.vals.length}</td>
      <td>${s.avg===null?'—':s.avg+'%'}</td>
      <td><div class="admin-actions">
        <button onclick="adminRemovePoints(decodeURIComponent('${jsArg(s.id)}'))">− Points</button>
        <button onclick="adminChangeHouse(decodeURIComponent('${jsArg(s.id)}'))">Change House</button>
        <button onclick="adminToggleBan(decodeURIComponent('${jsArg(s.id)}'))">${s.u.banned?'Unban':'Ban'}</button>
        <button class="danger-btn" onclick="adminDeleteUser(decodeURIComponent('${jsArg(s.id)}'))">Delete</button>
      </div></td>
    </tr>`).join('')
    : '<tr><td colspan="9">Nessuno studente registrato su questo browser.</td></tr>';

  const rows=[];
  stats.forEach(s=>s.vals.forEach(r=>{
    rows.push(`<tr>
      <td><span class="teacher-student-name" style="color:${teacherHouseColor(s.u.house)}">${s.u.lastName} ${s.u.firstName}</span></td>
      <td>${r.title}</td>
      <td>${r.score}/${r.total} (${r.pct}%)</td>
      <td>${r.date||'—'}</td>
      <td>+${r.points||0}</td>
    </tr>`);
  }));
  document.getElementById('teacherResultsTable').innerHTML=rows.length?rows.join(''):'<tr><td colspan="5">No exercise results saved yet.</td></tr>';
  renderTeacherUnitAccess();
}


const DB=window.EXERCISES;
const norm=s=>String(s??'').toLowerCase().trim().replace(/[.!?]/g,'').replace(/[’]/g,"'").replace(/\s+/g,' ');
const PAGE_HISTORY=[];
function activePageId(){return document.querySelector('.page.active')?.id||null}
function go(id,record=true){
 const current=activePageId();
 if(record && current && current!==id) PAGE_HISTORY.push(current);
 document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
 document.getElementById(id)?.classList.add('active');
 window.scrollTo(0,0);
 refresh();
 if(id==='songs') renderSongs(currentSongSort);
 if(id==='badges') renderBadges();
}
function navBack(){
 const previous=PAGE_HISTORY.pop();
 if(previous){go(previous,false);return;}
 go('home',false);
}
function stars(n){return '★'.repeat(n)}
function allExercises(){return Object.entries(DB).flatMap(([cat,arr])=>arr.map(e=>({...e,unit:e.unit||1,cat})))}
function showCategory(cat){
 go('topics');
 const available=(DB[cat]||[]);
 const list=available.map(e=>card(e,cat)).join('');
 document.getElementById('topicList').innerHTML=available.length
   ? `<section class="topic-section"><h2>${cat}</h2><div class="exercise-grid">${list}</div></section>`
   : `<section class="topic-section"><h2>${cat}</h2><div class="locked-content"><div class="lock-symbol">🔒</div><h2>No unlocked exercises here yet</h2><p>Your teacher will make more content available as you move through the units.</p></div></section>`;
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
function showUnit3(){renderUnit(3)}
function showUnit4(){renderUnit(4)}
function showUnit5(){renderUnit(5)}
function showUnit6(){renderUnit(6)}
function showUnit7(){renderUnit(7)}
function card(e,cat){
 const unit=e.unit||1;
 const r=JSON.parse(localStorage.getItem(userKey('results'))||'{}')[e.id];
 const at=attempts?.()?.[e.id]||0;
 const status=r ? `✓ Completed · Best ${r.best??r.pct}%` : 'Start exercise →';
 return `<div class="exercise-card" onclick="openExercise('${cat.replaceAll("'","\'")}','${e.id}')">
   <div class="exercise-topline"><span class="unit-pill">Unit ${unit}</span><div class="stars">${stars(e.stars)}</div></div>
   <h3>${e.title}</h3><p>${e.points} House Points</p><small>${status}${at?` · ${at} attempt${at===1?'':'s'}`:''}</small>
 </div>`;
}
function completed(id){return !!JSON.parse(localStorage.getItem(userKey('results'))||'{}')[id]}
function openExercise(cat,id){
 const e=DB[cat].find(x=>x.id===id); if(!e)return; window.current={...e,cat};
 go('exercise'); renderExercise(e,cat);
}
function renderExercise(e,cat){
 let h=`<div class="exercise-shell"><button class="backbtn" onclick="navBack()">← Back</button>
 <div class="exercise-head"><div><small>Unit ${e.unit||1} · ${cat}</small><h1>${e.title}</h1></div>
 <div class="difficulty">${stars(e.stars)}<span>${e.points} House Points</span></div></div>`;
 if(e.instructions)h+=`<p class="exercise-instructions">${e.instructions}</p>`;
 if(e.image)h+=`<div class="exercise-visual"><img src="${e.image}" alt=""></div>`;
 if(e.wordbank)h+=`<div class="word-bank">${e.wordbank.map(w=>`<span>${w}</span>`).join('')}</div>`;
 if(e.text)h+=`<div class="reading-text">${e.text.split('\\n').map(p=>`<p>${p}</p>`).join('')}</div>`;
 if(e.type==='cloze')h+=renderCloze(e);
 else if(e.type==='cloze_mcq')h+=renderClozeMcq(e);
 else if(e.type==='reorder')h+=renderReorder(e);
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

function renderReorder(e){return `<div class="questions">${e.items.map((it,i)=>`<div class="question reorder-question" data-i="${i}"><b>${i+1}. ${it[0]}</b><div class="reorder-answer" data-answer=""></div><div class="reorder-bank">${shuffle(it[1]).map((w,j)=>`<button type="button" class="word-token" onclick="reorderAdd(this)">${w}</button>`).join('')}</div><button type="button" class="reorder-reset" onclick="reorderReset(this)">Reset</button></div>`).join('')}</div>`}
function reorderAdd(btn){const q=btn.closest('.reorder-question'),a=q.querySelector('.reorder-answer');const token=document.createElement('button');token.type='button';token.className='word-token chosen';token.textContent=btn.textContent;token.onclick=function(){const bank=q.querySelector('.reorder-bank');const back=document.createElement('button');back.type='button';back.className='word-token';back.textContent=this.textContent;back.onclick=function(){reorderAdd(this)};bank.appendChild(back);this.remove();updateReorder(q)};a.appendChild(token);btn.remove();updateReorder(q)}
function updateReorder(q){q.querySelector('.reorder-answer').dataset.answer=[...q.querySelectorAll('.reorder-answer .word-token')].map(x=>x.textContent).join(' ')}
function reorderReset(btn){const q=btn.closest('.reorder-question'),bank=q.querySelector('.reorder-bank'),ans=q.querySelector('.reorder-answer');[...ans.querySelectorAll('.word-token')].forEach(x=>{const b=document.createElement('button');b.type='button';b.className='word-token';b.textContent=x.textContent;b.onclick=function(){reorderAdd(this)};bank.appendChild(b)});ans.innerHTML='';updateReorder(q)}

function renderMatch(e){return `<div class="questions">${e.items.map((it,i)=>`<div class="question"><b>${i+1}. ${it[0]}</b><select class="answer"><option value="">Choose...</option>${shuffle(e.items.map(x=>x[1])).map(o=>`<option>${o}</option>`).join('')}</select></div>`).join('')}</div>`}
function renderMulti(e){return `<div class="questions">${e.items.map((it,i)=>`<div class="question"><b>${i+1}. ${it[0]}</b><div class="multiinputs">${it[1].map(()=>`<input class="answer" type="text">`).join('')}</div></div>`).join('')}</div>`}
function renderCloze(e){let n=0;let t=e.text.replace(/___/g,()=>`<input class="clozeInput" data-i="${n++}" type="text">`);return `<div class="reading-text cloze">${t}</div>`}

function renderClozeMcq(e){
 let t=esc(e.text).replace(/\n/g,'<br>');
 e.choices.forEach((entry,i)=>{
   const opts=entry[0];
   const sel=`<select class="clozeSelect" data-i="${i}"><option value="">Choose...</option>${opts.map(o=>`<option value="${esc(o)}">${o}</option>`).join('')}</select>`;
   t=t.replace(`(${i+1}) ___`,`(${i+1}) ${sel}`);
 });
 return `<div class="reading-text cloze">${t}</div>`;
}
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
 if(e.type==='cloze_mcq'){
   const ins=[...document.querySelectorAll('.clozeSelect')];total=e.choices.length;
   ins.forEach((x,i)=>{let ok=accepts(x.value,e.choices[i][1]);x.classList.toggle('right',ok);x.classList.toggle('wrong',!ok);if(ok)correct++})
 }else if(e.type==='cloze'){
   const ins=[...document.querySelectorAll('.clozeInput')];total=e.answers.length;
   ins.forEach((x,i)=>{let ok=accepts(x.value,e.answers[i]);x.classList.toggle('right',ok);x.classList.toggle('wrong',!ok);if(ok)correct++})
 }else if(e.type==='multi'){
   const qs=[...document.querySelectorAll('.question')];total=e.items.length;
   qs.forEach((q,i)=>{let ins=[...q.querySelectorAll('input')],ans=e.items[i][1];let ok=ins.length===ans.length&&ins.every((x,j)=>accepts(x.value,ans[j]));q.classList.toggle('qright',ok);q.classList.toggle('qwrong',!ok);if(ok)correct++})
 }else{
   const qs=[...document.querySelectorAll('.question')];total=e.items.length;
   qs.forEach((q,i)=>{let val;
     if(e.type==='mcq'||e.type==='reading'||e.type==='demonstrative_mcq'){val=q.querySelector('input:checked')?.value||''}
     else if(e.type==='reorder'){val=q.querySelector('.reorder-answer')?.dataset.answer||''}
     else{val=q.querySelector('.answer')?.value||''}
     let ans;
     if(e.type==='reorder') ans=e.items[i][2];
     else if(e.type==='match') ans=e.items[i][1];
     else if(e.type==='mcq'||e.type==='reading') ans=e.items[i][2];
     else if(e.type==='demonstrative_mcq') ans=e.items[i][5];
     else if(e.type==='demonstrative_text') ans=e.items[i][4];
     else ans=e.items[i].slice(1);
     let ok=accepts(val,ans);q.classList.toggle('qright',ok);q.classList.toggle('qwrong',!ok);if(ok)correct++;
   })
 }
 let pct=Math.round(correct/total*100);
 document.getElementById('feedback').innerHTML=`<div class="scorebox"><h2>${correct}/${total} · ${pct}%</h2><p>${pct>=85?'Excellent!':pct>=60?'Well done!':'Good try! Check your answers and try again.'}</p></div>`;
 if(teacherPreviewMode)return;
 let at=attempts(); at[e.id]=(at[e.id]||0)+1; localStorage.setItem(userKey('attempts'),JSON.stringify(at));
 let earned=0;
 if(housePointsSeasonOpen()){
   const hat=JSON.parse(localStorage.getItem(userKey('house_attempts'))||'{}');
   hat[e.id]=(hat[e.id]||0)+1;
   localStorage.setItem(userKey('house_attempts'),JSON.stringify(hat));
   earned=hat[e.id]===1?e.points:(hat[e.id]<=3?1:0);
 }
 saveResult(e.id,{title:e.title,score:correct,total,pct,points:earned,cat:e.cat,date:new Date().toLocaleDateString(),attempt:at[e.id]});
 updateAchievementTracking(e,pct);
 if(earned>0) award(earned); else refresh();
}
function completedBefore(id){let r=JSON.parse(localStorage.getItem(userKey('awarded'))||'{}');if(r[id])return true;r[id]=true;localStorage.setItem(userKey('awarded'),JSON.stringify(r));return false}
function saveResult(id,obj){let r=JSON.parse(localStorage.getItem(userKey('results'))||'{}');const prev=r[id]||{};obj.best=Math.max(prev.best??prev.pct??0,obj.pct??0);obj.first=prev.first??obj.pct;obj.latest=obj.pct;r[id]={...prev,...obj};localStorage.setItem(userKey('results'),JSON.stringify(r))}
function award(points){
 if(!addHousePoints(points)){refresh();return}
 const profile=currentProfile();const house=profile.house||'Gryffindor';
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
 const results=JSON.parse(localStorage.getItem(userKey('results'))||'{}');const hp=schoolYearHousePoints();
 ['housePoints','housePoints2'].forEach(id=>{let x=document.getElementById(id);if(x)x.textContent=hp});let dc=document.getElementById('doneCount');if(dc)dc.textContent=Object.keys(results).length;
 let rb=document.getElementById('resultsBox');if(rb)rb.innerHTML=Object.values(results).length?Object.values(results).map(r=>`<p><b>${r.title}</b> — ${r.score}/${r.total} (${r.pct}%)</p>`).join(''):'<p>No exercises completed yet.</p>';
 updateUnitAccessUI();
 if(document.getElementById('songs')?.classList.contains('active'))renderSongs(currentSongSort);
 renderBadges();
}


document.addEventListener('DOMContentLoaded',()=>{
  renderBadges();
  const role=localStorage.getItem(LOGIN_KEY)||sessionStorage.getItem(LOGIN_KEY);
  if(role==='student'&&activeUserId()&&resolveUser(activeUserId()))openStudentApp();
  else if(role==='teacher')openTeacherApp();
  else{
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('studentApp').classList.add('hidden');
    document.getElementById('teacherApp').classList.add('hidden');
  }
});

/* ===== v0.6 engagement/admin/protection ===== */

function attempts(){return JSON.parse(localStorage.getItem(userKey('attempts'))||'{}')}
function getProgress(){
 const results=JSON.parse(localStorage.getItem(userKey('results'))||'{}');
 return Object.entries(results).reduce((acc,[id,r])=>{
   const ex=allExercises().find(e=>e.id===id);
   acc[id]={id,best:r.best??r.pct??0,first:r.first??r.pct??0,last:r.latest??r.pct??0,stars:ex?.stars??0,unit:ex?.unit??1,cat:ex?.cat??r.cat??'',title:r.title||ex?.title||id,attempts:(attempts()[id]||r.attempt||1)};
   return acc;
 },{});
}
function getAchievementState(){
 return JSON.parse(localStorage.getItem(userKey('achievement_state'))||'{}');
}
function saveAchievementState(state){
 localStorage.setItem(userKey('achievement_state'),JSON.stringify(state));
}
function updateAchievementTracking(ex,pct){
 if(teacherPreviewMode)return;
 const state=getAchievementState();
 state.perfectStreakIds=Array.isArray(state.perfectStreakIds)?state.perfectStreakIds:[];
 state.perfectStreakMax=+(state.perfectStreakMax||0);
 if(pct===100){
   // Repeating the same exercise cannot artificially build the streak.
   if(!state.perfectStreakIds.includes(ex.id))state.perfectStreakIds.push(ex.id);
   state.perfectStreakMax=Math.max(state.perfectStreakMax,state.perfectStreakIds.length);
 }else{
   state.perfectStreakIds=[];
 }
 saveAchievementState(state);
}

function badgeData(){
 const rs=Object.values(getProgress());
 const perfect=rs.filter(r=>r.best===100).length;
 const perfect3=rs.filter(r=>r.best===100 && r.stars===3).length;
 const perfectIds=new Set(rs.filter(r=>r.best===100).map(r=>r.id));
 const completedIds=new Set(rs.map(r=>r.id));
 const availableUnits=[...new Set(allExercises().map(e=>e.unit))].sort((a,b)=>a-b);
 const cats=['Vocabulary','Grammar','Reading Comprehension','Revision'];
 const allPerfect=(unit,cat)=>{
   const ids=allExercises().filter(e=>e.unit===unit && e.cat===cat).map(e=>e.id);
   return ids.length>0 && ids.every(id=>perfectIds.has(id));
 };
 const categoryBadgeEarned=cat=>availableUnits.some(u=>allPerfect(u,cat));
 const allFourInUnit=unit=>cats.every(cat=>allPerfect(unit,cat));
 const grammarPerfect=rs.filter(r=>r.best===100&&r.cat==='Grammar').length;
 const vocabPerfect=rs.filter(r=>r.best===100&&r.cat==='Vocabulary').length;
 const readingPerfect=rs.filter(r=>r.best===100&&r.cat==='Reading Comprehension').length;
 const levelUp=rs.some(r=>(r.first??100)<100 && r.best===100);
 const recovered=rs.filter(r=>(r.first??100)<60 && r.best>=60).length;
 const achievementState=getAchievementState();
 const onFire=(achievementState.perfectStreakMax||0)>=5;
 const allRounder=cats.every(categoryBadgeEarned);
 const unitChampion=availableUnits.some(allFourInUnit);
 const explorer=availableUnits.length>0 && availableUnits.every(u=>allExercises().filter(e=>e.unit===u).some(e=>completedIds.has(e.id)));
 const masterOfEnglish=availableUnits.length>0 && availableUnits.every(allFourInUnit);
 const songDone=getCompletedSongs();
 const musicMaster=VOCAB_SONGS.length>0 && VOCAB_SONGS.every(s=>songDone[s.id]);

 const badges=[
  {group:'milestones',title:'Perfect Start',desc:'Perfect score in 1 exercise',unlocked:perfect>=1,img:'badge_perfect_start.png'},
  {group:'milestones',title:'Perfect Five',desc:'Perfect score in 5 exercises',unlocked:perfect>=5,img:'badge_perfect_five.png'},
  {group:'milestones',title:'Perfect Ten',desc:'Perfect score in 10 exercises',unlocked:perfect>=10,img:'badge_perfect_ten.png'},
  {group:'milestones',title:'Challenge Master',desc:'Perfect score in 20 three-star exercises',unlocked:perfect3>=20,img:'badge_challenge_master.png'},

  {group:'special',title:'On Fire',desc:'Get a perfect score in 5 different exercises in a row',unlocked:onFire,img:'badge_on_fire.png'},
  {group:'special',title:'Grammar Genius',desc:'Perfect score in 5 Grammar exercises',unlocked:grammarPerfect>=5,img:'badge_grammar_genius.png'},
  {group:'special',title:'Word Wizard',desc:'Perfect score in 5 Vocabulary exercises',unlocked:vocabPerfect>=5,img:'badge_word_wizard.png'},
  {group:'special',title:'Reading Detective',desc:'Perfect score in 3 Reading exercises',unlocked:readingPerfect>=3,img:'badge_reading_detective.png'},
  {group:'special',title:'All-Rounder',desc:'Earn at least one Vocabulary, Grammar, Reading and Revision unit badge',unlocked:allRounder,img:'badge_all_rounder.png'},
  {group:'special',title:'Level Up',desc:'Improve an exercise and later get a perfect score',unlocked:levelUp,img:'badge_level_up.png'},
  {group:'special',title:'Never Give Up',desc:'Pass 5 exercises that you did not pass on your first attempt',unlocked:recovered>=5,img:'badge_never_give_up.png'},
  {group:'special',title:'Unit Champion',desc:'Earn all 4 badges in the same unit',unlocked:unitChampion,img:'badge_unit_champion.png'},
  {group:'special',title:'Explorer',desc:'Complete at least one exercise in every available unit',unlocked:explorer,img:'badge_explorer.png'},
  {group:'special',title:'Master of English',desc:'Earn all 4 unit badges in every available unit',unlocked:masterOfEnglish,img:'badge_master_of_english.png'}
 ];

 const songImages={
   song_u1_countries:'badge_song_where_are_you_from.png',
   song_u2_family:'badge_song_whos_who.png',
   song_u2_appearance:'badge_song_look_again.png',
   song_u3_earbuds:'badge_song_where_are_my_earbuds.png',
   song_u4_give_try:'badge_song_give_it_a_try.png',
   song_u5_final_bell:'badge_song_final_bell.png',
   song_u6_five_more_minutes:'badge_song_five_more_minutes.png',
   song_u7_whats_in_the_fridge:'badge_song_whats_in_the_fridge.png'
 };
 VOCAB_SONGS.forEach(song=>{
   badges.push({
     group:'songs',
     title:song.title,
     desc:'Listen to the full Vocabulary Song',
     unlocked:!!songDone[song.id],
     img:songImages[song.id]
   });
 });
 badges.push({group:'songs',title:'Music Master',desc:'Listen to every Vocabulary Song',unlocked:musicMaster,img:'badge_music_master.png'});

 availableUnits.forEach(unit=>{
   [
    ['Vocabulary Explorer','Vocabulary','Vocabulary'],
    ['Grammar Master','Grammar','Grammar'],
    ['Reading Explorer','Reading','Reading Comprehension'],
    ['Revision Master','Revision','Revision']
   ].forEach(([label,filePart,cat])=>{
     badges.push({
       group:'units',
       title:`Unit ${unit} · ${label}`,
       desc:`Perfect score in every Unit ${unit} ${filePart} exercise${cat==='Reading Comprehension'?'':'s'}`,
       unlocked:allPerfect(unit,cat),
       img:`badge_u${unit}_${filePart.toLowerCase()}.png`
     });
   });
 });
 return badges;
}
function renderBadges(){
 const badges=badgeData();
 const targets={
   milestones:document.getElementById('badgeMilestonesGrid'),
   special:document.getElementById('badgeSpecialGrid'),
   songs:document.getElementById('badgeSongsGrid'),
   units:document.getElementById('badgeUnitsGrid')
 };
 const card=b=>`<div class="badge ${b.unlocked?'unlocked':'locked'}" data-badge-title="${b.title}">
   <img class="badge-medal-img" src="assets/${b.img}" alt="${b.title}">
   <h3>${b.title}</h3>
   <p>${b.desc}</p>
   <b>${b.unlocked?'Unlocked':'Locked'}</b>
 </div>`;
 Object.entries(targets).forEach(([group,target])=>{
   if(!target)return;
   target.innerHTML=badges.filter(b=>b.group===group).map(card).join('');
 });
}
function adminChangeHouse(userId){
 const u=getUsers()[userId];if(!u)return;
 const h=prompt('New House: Gryffindor, Slytherin, Ravenclaw or Hufflepuff',u.house||'');
 if(!['Gryffindor','Slytherin','Ravenclaw','Hufflepuff'].includes(h))return;
 updateUser(userId,{house:h});refreshTeacher();teacherMonth('School Year');
}
function adminRemovePoints(userId){
 if(!housePointsSeasonOpen()){alert('House Points start on 1 September.');return}
 const month=monthName();
 const data=getHousePointMonths(userId);
 const hp=+(data[month]||0);
 const n=+(prompt(`How many House Points do you want to remove from ${month}?`,'1')||0);
 if(n>0){data[month]=Math.max(0,hp-n);saveHousePointMonths(data,userId)}
 refreshTeacher();teacherMonth('School Year');
}
function adminToggleBan(userId){
 const u=getUsers()[userId];if(!u)return;
 updateUser(userId,{banned:!u.banned});refreshTeacher();
}
function adminDeleteUser(userId){
 const users=getUsers(),u=users[userId];if(!u)return;
 if(!confirm(`Delete ${u.lastName} ${u.firstName}? This removes the account and all data stored for this student on this browser.`))return;
 delete users[userId];saveUsers(users);
 const prefix=`pp_user_${encodeURIComponent(userId)}_`;
 Object.keys(localStorage).filter(k=>k.startsWith(prefix)).forEach(k=>localStorage.removeItem(k));
 refreshTeacher();teacherMonth('School Year');
}
const oldOpenStudent=openStudentApp;openStudentApp=function(){
 const p=currentProfile();
 if(p.banned){alert('This student account has been disabled by the teacher.');logout();return;}
 oldOpenStudent();document.body.classList.add('student-mode');
 const w=document.getElementById('studentWatermark');w.textContent=`${p.name||'Student'} · ${p.klass||''}`;w.classList.remove('hidden')
}
const oldOpenTeacher=openTeacherApp;openTeacherApp=function(){document.body.classList.remove('student-mode','teacher-preview-mode');document.getElementById('studentWatermark')?.classList.add('hidden');clearHouseTheme();oldOpenTeacher()}
const oldLogout=logout;logout=function(){teacherPreviewMode=false;document.body.classList.remove('student-mode','teacher-preview-mode');document.getElementById('studentWatermark')?.classList.add('hidden');document.getElementById('teacherPreviewBar')?.classList.add('hidden');clearHouseTheme();oldLogout()}
document.addEventListener('contextmenu',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('copy',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('cut',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('paste',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(document.body.classList.contains('student-mode'))e.preventDefault()});
document.addEventListener('keydown',e=>{if(document.body.classList.contains('student-mode')&&((e.ctrlKey||e.metaKey)&&['c','v','x','s','p','u'].includes(e.key.toLowerCase())))e.preventDefault()});


// Unit 5 patch: UI integration + keyboard login
(function installUnit5UI(){
  function apply(){
    const grid=document.querySelector('#units .unit-grid');
    if(grid && !grid.querySelector('[data-unit="5"]')){
      const d=document.createElement('div');d.className='unit';d.dataset.unit='5';
      d.innerHTML='<b>Unit 5</b><span>School · people & activities · Present Simple · prepositions of time</span>';
      d.onclick=()=>showUnit5();grid.appendChild(d);
    }
    if(grid && !grid.querySelector('[data-unit="6"]')){
      const d=document.createElement('div');d.className='unit';d.dataset.unit='6';
      d.innerHTML='<b>Unit 6</b><span>Daily routine · after-school activities · Present Simple questions & negatives · frequency</span>';
      d.onclick=()=>showUnit6();grid.appendChild(d);
    }
    if(grid && !grid.querySelector('[data-unit="7"]')){
      const d=document.createElement('div');d.className='unit';d.dataset.unit='7';
      d.innerHTML='<b>Unit 7</b><span>Food & drinks · containers · preferences + -ing · quantities · object pronouns</span>';
      d.onclick=()=>showUnit7();grid.appendChild(d);
    }
    document.querySelectorAll('#topics .visual-category-grid small').forEach(el=>{
      if(/^Units 1[–-][456]\b/.test(el.textContent)) el.textContent=el.textContent.replace(/^Units 1[–-][456]/,'Units 1–7');
    });
    const footer=document.querySelector('footer span');
    if(footer) footer.textContent=footer.textContent.replace(/Units 1[–-][456]/g,'Units 1–7').replace(/v1\.[0-9]+\.[0-9]+/,'v1.7.3');
  }
  function bindEnter(){
    ['studentUserIdInput','studentPasswordInput'].forEach(id=>document.getElementById(id)?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();studentLogin();}}));
    document.getElementById('teacherCodeInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();teacherLogin();}});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{apply();bindEnter();});
  else {apply();bindEnter();}
})();
