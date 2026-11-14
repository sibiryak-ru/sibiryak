/* ============================================================
   СИБИРЯК · СЛОЙ ДАННЫХ И АВТОПОДБОР v1.1 + АВАТАРЫ
   Supabase (PostgREST, без SDK) + гео-матчинг + статусы
   ============================================================ */

/* ---------- КОНФИГ И КЛИЕНТ ---------- */
const SB = {
  cfg: (()=>{try{return JSON.parse(localStorage.getItem('sibiryak_sb'))||{url:'',key:''}}catch(e){return{url:'',key:''}}})(),
  on(){ return !!(this.cfg.url && this.cfg.key) },
  set(url,key){
    this.cfg={url:String(url||'').trim().replace(/\/+$/,''),key:String(key||'').trim()};
    localStorage.setItem('sibiryak_sb',JSON.stringify(this.cfg));
  },
  async req(path,opt={}){
    if(!this.on()) throw new Error('База не подключена');
    const r=await fetch(this.cfg.url+'/rest/v1/'+path,{
      ...opt,
      headers:{
        apikey:this.cfg.key,
        Authorization:'Bearer '+this.cfg.key,
        'Content-Type':'application/json',
        ...(opt.headers||{})
      }
    });
    if(!r.ok){ throw new Error('HTTP '+r.status+' · '+(await r.text()).slice(0,160)) }
    const t=await r.text();
    return t?JSON.parse(t):null;
  },
  select(t,q=''){ return this.req(t+'?'+q) },
  upsert(t,rows){ return this.req(t+'?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(rows)}) },
  insert(t,rows){ return this.req(t,{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(rows)}) },
  storage:{
    from(bucket){
      return {
        async upload(path,file,opts={}){
          const fd=new FormData();
          fd.append('cacheControl',opts.cacheControl||'3600');
          if(opts.upsert) fd.append('upsert','true');
          fd.append('file',file);
          const r=await fetch(SB.cfg.url+'/storage/v1/object/'+bucket+'/'+path,{
            method:'POST',
            headers:{Authorization:'Bearer '+SB.cfg.key,apikey:SB.cfg.key},
            body:fd
          });
          if(!r.ok){const e=await r.json();return{data:null,error:e}}
          const d=await r.json();
          return{data:d,error:null};
        },
        getPublicUrl(path){
          return{data:{publicUrl:SB.cfg.url+'/storage/v1/object/public/'+bucket+'/'+path}};
        }
      };
    }
  }
};

/* ---------- SQL СХЕМА (копируется из приложения) ---------- */
const SB_SQL = `-- СИБИРЯК · схема MVP (Supabase → SQL Editor → Run)

create table if not exists seekers(
  id text primary key,
  name text not null,
  city text,
  lat double precision,
  lng double precision,
  radius_km int default 30,
  skills text,
  exp_years int default 0,
  salary_min int default 0,
  availability text default 'free',
  rating numeric default 0,
  about text,
  avatar_url text,
  updated_at timestamptz default now()
);

create table if not exists vacancies(
  id text primary key,
  company text,
  title text not null,
  city text,
  lat double precision,
  lng double precision,
  radius_km int default 50,
  skills text,
  salary int default 0,
  exp_min int default 0,
  status text default 'open',
  descr text,
  updated_at timestamptz default now()
);

create table if not exists applications(
  id text primary key,
  vacancy_id text,
  seeker_id text,
  seeker_name text,
  vacancy_title text,
  company text,
  score int default 0,
  status text default 'Отклик',
  created_at timestamptz default now()
);

create index if not exists seekers_city_idx on seekers(city);
create index if not exists seekers_avail_idx on seekers(availability);
create index if not exists vacancies_city_idx on vacancies(city);
create index if not exists vacancies_status_idx on vacancies(status);

alter table seekers enable row level security;
alter table vacancies enable row level security;
alter table applications enable row level security;

drop policy if exists demo_all on seekers;
drop policy if exists demo_all on vacancies;
drop policy if exists demo_all on applications;
create policy demo_all on seekers for all to anon using (true) with check (true);
create policy demo_all on vacancies for all to anon using (true) with check (true);
create policy demo_all on applications for all to anon using (true) with check (true);
`;

/* ---------- ГЕОГРАФИЯ ---------- */
const CITY_GEO={
  'барнаул':[53.3548,83.7698],'новоалтайск':[53.3906,83.9364],'бийск':[52.5392,85.2138],
  'рубцовск':[51.5012,81.2077],'заринск':[53.7062,84.9315],'камень-на-оби':[53.7919,81.3486],
  'славгород':[52.9993,78.6459],'алейск':[52.4923,82.7794],'белокуриха':[51.9958,84.9847],
  'горно-алтайск':[51.9581,85.9603],'новосибирск':[55.0084,82.9357],'томск':[56.4846,84.9476],
  'кемерово':[55.3547,86.0873],'красноярск':[56.0153,92.8932],'омск':[54.9885,73.3242],
  'екатеринбург':[56.8389,60.6057],'челябинск':[55.1644,61.4368],'тюмень':[57.1522,65.5272],
  'иркутск':[52.2869,104.3050],'абакан':[53.7156,91.4292],'кызыл':[51.7191,94.4378],
  'москва':[55.7558,37.6173],'санкт-петербург':[59.9343,30.3351],'казань':[55.7963,49.1088],
  'нижний новгород':[56.2965,43.9361],'самара':[53.1959,50.1002],'ростов-на-дону':[47.2357,39.7015],
  'краснодар':[45.0355,38.9753],'сочи':[43.5855,39.7231],'уфа':[54.7388,55.9721],
  'пермь':[58.0105,56.2502],'воронеж':[51.6720,39.1843],'волгоград':[48.7080,44.5133],
  'саратов':[51.5336,46.0343],'тольятти':[53.5303,49.3461],'ижевск':[56.8526,53.2045],
  'оренбург':[51.7727,55.0988],'тула':[54.1961,37.6182],'калуга':[54.5293,36.2754],
  'рязань':[54.6269,39.6916],'тверь':[56.8587,35.9176],'ярославль':[57.6261,39.8845],
  'владимир':[56.1366,40.3966],'смоленск':[54.7818,32.0401],'брянск':[53.2521,34.3717],
  'курск':[51.7373,36.1874],'белгород':[50.5952,36.5872],'липецк':[52.6031,39.5708],
  'пенза':[53.2007,45.0046],'киров':[58.6035,49.6680],'чебоксары':[56.1439,47.2489],
  'архангельск':[64.5401,40.5433],'мурманск':[68.9585,33.0827],'петрозаводск':[61.7849,34.3469],
  'вологда':[59.2239,39.8840],'калининград':[54.7104,20.4522],'астрахань':[46.3497,48.0408],
  'ставрополь':[45.0428,41.9734],'владивосток':[43.1155,131.8855],'хабаровск':[48.4802,135.0719]
};
const cityKey=s=>String(s||'').toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
function coords(city){const c=CITY_GEO[cityKey(city)];return c?{lat:c[0],lng:c[1]}:{lat:null,lng:null}}
function hav(a,b){
  if(!a.lat||!a.lng||!b.lat||!b.lng)return null;
  const R=6371,rad=x=>x*Math.PI/180;
  const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
  const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}
const CITY_LIST=Object.keys(CITY_GEO).map(c=>c.charAt(0).toUpperCase()+c.slice(1));

/* ---------- СТАТУСЫ ---------- */
const AVAIL={free:{t:'Свободен',c:'var(--pine)',i:'🟢'},part:{t:'Ищу подработку',c:'var(--amber)',i:'🟡'},busy:{t:'Занят',c:'var(--rose)',i:'🔴'}};
const availOf=s=>AVAIL[s]||AVAIL.free;

/* ---------- МИГРАЦИЯ ЛОКАЛЬНЫХ ДАННЫХ ---------- */
function sbMigrate(){
  const p=db.profile;
  p.sid=p.sid||uid();
  p.city=p.city||'Барнаул';
  p.radius_km=p.radius_km||50;
  p.availability=p.availability||'free';
  p.salary_min=p.salary_min||60000;
  p.exp_years=p.exp_years||((db.resumes[0]&&db.resumes[0].exp)||3);
  p.skills=p.skills||((db.resumes[0]&&db.resumes[0].skills)||'Вождение, логистика');
  p.avatar_url=p.avatar_url||null; // <-- ДОБАВЛЕНО
  Object.assign(p,coords(p.city));
  db.company.city=db.company.city||'Барнаул';
  db.company.radius_km=db.company.radius_km||60;
  db.company.avatar_url=db.company.avatar_url||null; // <-- ДОБАВЛЕНО
  db.vacancies.forEach(v=>{
    v.city=v.city||db.company.city;
    v.radius_km=v.radius_km||db.company.radius_km;
    v.exp_min=v.exp_min||0;
    Object.assign(v,coords(v.city));
  });
  db.candidates.forEach(c=>{
    c.availability=c.availability||(c.status==='Нанят'?'busy':'free');
    c.salary_min=c.salary_min||55000;
    c.radius_km=c.radius_km||40;
    c.avatar_url=c.avatar_url||null; // <-- ДОБАВЛЕНО
    Object.assign(c,coords(c.city));
  });
  db.cloudSeekers=db.cloudSeekers||[];
  db.cloudVacancies=db.cloudVacancies||[];
  save();
}

/* ---------- НОРМАЛИЗАЦИЯ ---------- */
const skillArr=s=>String(s||'').toLowerCase().split(/[,;]/).map(x=>x.trim()).filter(Boolean);
function normSeeker(r){
  return {id:r.id,name:r.name||'Без имени',role:r.role||r.about||'',city:r.city||'',lat:r.lat,lng:r.lng,
    radius_km:r.radius_km||30,skills:Array.isArray(r.skills)?r.skills.join(', '):(r.skills||''),
    exp:r.exp!=null?r.exp:(r.exp_years||0),salary_min:r.salary_min||0,
    availability:r.availability||'free',rating:r.rating||0,src:r.src||'local',
    avatar_url:r.avatar_url||null}; // <-- ДОБАВЛЕНО
}
function normVacancy(r){
  return {id:r.id,title:r.title||'Вакансия',company:r.company||'',city:r.city||'',lat:r.lat,lng:r.lng,
    radius_km:r.radius_km||50,skills:Array.isArray(r.skills)?r.skills.join(', '):(r.skills||''),
    salary:r.salary||0,exp_min:r.exp_min||0,
    status:r.status==='Открыта'?'open':(r.status==='Закрыта'?'closed':(r.status||'open')),
    descr:r.descr||r.desc||'',src:r.src||'local'};
}
function seekerPool(){
  const cloud=(db.cloudSeekers||[]).map(r=>normSeeker({...r,src:'cloud'}));
  const local=db.candidates.map(c=>normSeeker({...c,skills:c.skills.join(', '),src:'local'}));
  const me=normSeeker({...db.profile,id:db.profile.sid,exp:db.profile.exp_years,src:'me'});
  const seen=new Set(),out=[];
  [...cloud,...local,me].forEach(s=>{const k=(s.name+'|'+s.city).toLowerCase();if(!seen.has(k)){seen.add(k);out.push(s)}});
  return out;
}
function vacancyPool(){
  const cloud=(db.cloudVacancies||[]).map(r=>normVacancy({...r,src:'cloud'}));
  const local=db.vacancies.map(v=>normVacancy({...v,company:db.company.name,src:'local'}));
  const seen=new Set(),out=[];
  [...cloud,...local].forEach(v=>{const k=(v.title+'|'+v.company).toLowerCase();if(!seen.has(k)){seen.add(k);out.push(v)}});
  return out;
}

/* ---------- ДВИЖОК АВТОПОДБОРА ---------- */
function matchPair(s,v){
  const reasons=[];let score=0;
  let dist=null;
  if(cityKey(s.city)&&cityKey(s.city)===cityKey(v.city)){score+=40;reasons.push('📍 один город')}
  else{
    dist=hav(s,v);
    const r=Math.max(s.radius_km||30,v.radius_km||50);
    if(dist!=null&&dist<=r){const p=Math.round(40*(1-0.6*dist/r));score+=p;reasons.push('📍 '+Math.round(dist)+' км')}
    else if(dist!=null){reasons.push('📍 '+Math.round(dist)+' км — вне радиуса')}
    else reasons.push('📍 город не совпадает');
  }
  const vs=skillArr(v.skills),ss=skillArr(s.skills);
  const hit=vs.filter(x=>ss.some(y=>y.includes(x)||x.includes(y)));
  if(vs.length){const p=Math.round(30*hit.length/vs.length);score+=p;reasons.push('🛠 навыки '+hit.length+'/'+vs.length)}
  else{score+=15;reasons.push('🛠 требования не заданы')}
  if(s.availability==='free'){score+=15;reasons.push('🟢 свободен')}
  else if(s.availability==='part'){score+=8;reasons.push('🟡 подработка')}
  else reasons.push('🔴 занят');
  if(!s.salary_min||v.salary>=s.salary_min){score+=10;reasons.push('💰 по деньгам')}
  else reasons.push('💰 ниже ожиданий');
  if(s.exp>=(v.exp_min||0)){score+=5;reasons.push('📈 опыт ок')}
  else reasons.push('📈 мало опыта');
  return {score:Math.max(0,Math.min(100,score)),reasons,dist};
}
const scoreColor=n=>n>=70?'var(--pine)':n>=45?'var(--amber)':'var(--rose)';

/* ========== ЗАГРУЗКА АВАТАРА ========== */
async function uploadAvatar(file,targetId,targetType){
  if(!SB.on()){toast('Сначала подключите базу');return null}
  const ext=file.name.split('.').pop().toLowerCase();
  const fileName=`${targetType}/${targetId}.${ext}`;
  try{
    const{data,error}=await SB.storage.from('avatars').upload(fileName,file,{cacheControl:'3600',upsert:true});
    if(error)throw error;
    const{data:{publicUrl}}=SB.storage.from('avatars').getPublicUrl(fileName);
    return publicUrl;
  }catch(e){toast('Ошибка загрузки: '+e.message);return null}
}

function triggerAvatarUpload(targetId,targetType){
  const input=document.createElement('input');
  input.type='file';
  input.accept='image/*';
  input.capture='user';
  input.onchange=async(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    toast('Загрузка...');
    const url=await uploadAvatar(file,targetId,targetType);
    if(url){
      if(targetType==='seeker'){
        const s=db.candidates.find(x=>x.id===targetId);
        if(s)s.avatar_url=url;
        if(targetId===db.profile.sid)db.profile.avatar_url=url;
      }else if(targetType==='company'){
        db.company.avatar_url=url;
      }
      save();
      rerender();
      toast('Аватар обновлён');
    }
  };
  input.click();
}

function avatarHtml(url,name,size=62){
  if(url)return `<img src="${esc(url)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:1.5px solid var(--line2)">`;
  const initials=name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,var(--bg2),var(--bg1));border:1.5px solid var(--line2);display:flex;align-items:center;justify-content:center;font-size:${size/2.2}px;color:var(--ice)">${initials}</div>`;
}

/* ---------- МОДУЛЬ: БАЗА ДАННЫХ ---------- */
function mDatabase(){
  const c=SB.cfg,ok=SB.on();
  const cs=(db.cloudSeekers||[]).length,cv=(db.cloudVacancies||[]).length;
  return `<div class="card">
    <div class="card-title">Подключение Supabase</div>
    <div class="demo-note">Демо-политики RLS открыты для anon-ключа: любой, у кого есть ссылка и ключ, может читать и писать. Перед реальным запуском — авторизация и строгие политики.</div>
    <label class="lbl">Project URL</label>
    <input class="input" id="sb-url" value="${esc(c.url)}" placeholder="https://xxxx.supabase.co">
    <label class="lbl">anon public key</label>
    <textarea class="input" id="sb-key" placeholder="eyJhbGciOi...">${esc(c.key)}</textarea>
    <div class="btn-row"><button class="btn btn-sm btn-primary" onclick="sbSave()">💾 Сохранить</button>
    <button class="btn btn-sm btn-ghost" onclick="sbTest()">🔌 Проверить связь</button></div>
    <div style="margin-top:12px;font-size:13px">${ok?'<span class="pill p-ok">Ключ сохранён</span>':'<span class="pill p-dim">Не подключено</span>'}
    ${db.sbSync?`<span style="color:var(--faint);font-size:11.5px;margin-left:8px">синхр. ${fdate(db.sbSync)}</span>`:''}</div>
  </div>
  <div class="card"><div class="card-title">Схема базы</div>
    <button class="btn btn-primary" onclick="sbCopySql()">📋 Скопировать SQL для Supabase</button>
    <button class="btn btn-ghost" onclick="sbShowSql()">👁 Показать SQL</button>
    <div style="font-size:12px;color:var(--faint);line-height:1.6">Supabase → SQL Editor → New query → вставить → Run. Создаст таблицы seekers, vacancies, applications и индексы.</div>
  </div>
  <div class="card"><div class="card-title">Обмен данными</div>
    <button class="btn" onclick="sbPush()">⬆️ Выгрузить мои данные в облако<span class="sub">Профиль, вакансии, кандидаты</span></button>
    <button class="btn" onclick="sbPull()">⬇️ Забрать из облака<span class="sub">Соискатели и вакансии для автоподбора</span></button>
    <div class="kpis" style="margin-top:12px"><div class="kpi"><b>${cs}</b><span>СОИСКАТЕЛЕЙ В КЭШЕ</span></div><div class="kpi"><b>${cv}</b><span>ВАКАНСИЙ В КЭШЕ</span></div><div class="kpi"><b>${db.applications.length}</b><span>ОТКЛИКОВ</span></div></div>
  </div>`;
}
function sbSave(){SB.set(val('sb-url'),document.getElementById('sb-key').value);rerender();toast(SB.on()?'Реквизиты сохранены':'Заполните URL и ключ')}
async function sbTest(){
  try{await SB.select('seekers','select=id&limit=1');toast('Связь есть, таблица seekers доступна')}
  catch(e){toast('Ошибка: '+e.message)}
}
function sbCopySql(){(navigator.clipboard?navigator.clipboard.writeText(SB_SQL):Promise.reject()).then(()=>toast('SQL скопирован — вставьте в SQL Editor')).catch(()=>sbShowSql())}
function sbShowSql(){openDrawer(`<div class="card-title">SQL схема</div><textarea class="input" style="min-height:320px;font-size:11.5px;font-family:monospace">${esc(SB_SQL)}</textarea><button class="btn btn-primary" onclick="sbCopySql()">📋 Копировать</button>`)}
async function sbPush(){
  if(!SB.on()){toast('Сначала подключите базу');return}
  try{
    const p=db.profile;
    const me={id:p.sid,name:p.name,city:p.city,lat:p.lat,lng:p.lng,radius_km:p.radius_km,skills:p.skills,
      exp_years:p.exp_years,salary_min:p.salary_min,availability:p.availability,
      rating:+(ratingData().score/20).toFixed(2),about:(db.resumes[0]&&db.resumes[0].about)||'',
      avatar_url:p.avatar_url||null}; // <-- ДОБАВЛЕНО
    const cands=db.candidates.map(c=>({id:'c_'+c.id,name:c.name,city:c.city,lat:c.lat,lng:c.lng,radius_km:c.radius_km,
      skills:c.skills.join(', '),exp_years:c.exp,salary_min:c.salary_min,availability:c.availability,rating:c.rating,about:c.role,
      avatar_url:c.avatar_url||null})); // <-- ДОБАВЛЕНО
    const vacs=db.vacancies.map(v=>({id:v.id,company:db.company.name,title:v.title,city:v.city,lat:v.lat,lng:v.lng,
      radius_km:v.radius_km,skills:v.skills,salary:v.salary,exp_min:v.exp_min||0,
      status:v.status==='Открыта'?'open':'closed',descr:v.desc||''}));
    await SB.upsert('seekers',[me,...cands]);
    await SB.upsert('vacancies',vacs);
    db.sbSync=new Date().toISOString().slice(0,10);save();rerender();
    toast('Выгружено: '+(cands.length+1)+' соискателей, '+vacs.length+' вакансий');
  }catch(e){toast('Ошибка выгрузки: '+e.message)}
}
async function sbPull(){
  if(!SB.on()){toast('Сначала подключите базу');return}
  try{
    db.cloudSeekers=await SB.select('seekers','select=*&limit=500')||[];
    db.cloudVacancies=await SB.select('vacancies','select=*&limit=500')||[];
    db.sbSync=new Date().toISOString().slice(0,10);save();rerender();
    toast('Получено: '+db.cloudSeekers.length+' соискателей, '+db.cloudVacancies.length+' вакансий');
  }catch(e){toast('Ошибка загрузки: '+e.message)}
}

/* ---------- МОДУЛЬ: ГЕОГРАФИЯ И СТАТУС ---------- */
function mGeoStatus(st){
  const isCo=db.profile.role==='company';
  const o=isCo?db.company:db.profile;
  const dl=`<datalist id="city-dl">${CITY_LIST.map(c=>`<option value="${esc(c)}">`).join('')}</datalist>`;
  
  // Аватар для компании или соискателя
  const avatarTargetId = isCo ? 'company' : db.profile.sid;
  const avatarTargetType = isCo ? 'company' : 'seeker';
  const currentAvatarUrl = isCo ? db.company.avatar_url : db.profile.avatar_url;
  const avatarDisplay = isCo ? db.company.name : db.profile.name;
  
  const avatarSection = `<div style="text-align:center;margin-bottom:16px">
    <div style="cursor:pointer;display:inline-block" onclick="triggerAvatarUpload('${avatarTargetId}','${avatarTargetType}')">
      ${avatarHtml(currentAvatarUrl, avatarDisplay, 80)}
      <div style="font-size:11px;color:var(--faint);margin-top:6px">Нажмите, чтобы изменить фото</div>
    </div>
  </div>`;
  
  if(isCo){
    return `${dl}${avatarSection}<div class="card"><div class="card-title">География компании</div>
      <label class="lbl">Город</label><input class="input" id="g-city" list="city-dl" value="${esc(o.city)}">
      <label class="lbl">Радиус поиска по умолчанию: <b id="rad-lbl">${o.radius_km} км</b></label>
      <input type="range" min="10" max="300" step="10" value="${o.radius_km}" style="width:100%;accent-color:var(--ice);margin-bottom:14px" oninput="document.getElementById('rad-lbl').textContent=this.value+' км'" id="g-rad">
      <button class="btn btn-primary" onclick="geoSaveCompany()">💾 Сохранить и применить к вакансиям</button>
      <div style="font-size:12px;color:var(--faint)">Координаты определяются по городу автоматически. Радиус задаёт зону, внутри которой соискатели считаются «рядом».</div></div>`;
  }
  return `${dl}${avatarSection}<div class="card"><div class="card-title">Мой статус</div>
    <div class="chips">${Object.entries(AVAIL).map(([k,a])=>`<button class="chip ${db.profile.availability===k?'on':''}" onclick="setAvail('${k}')">${a.i} ${a.t}</button>`).join('')}</div>
    <div style="font-size:12px;color:var(--faint)">«Занят» исключает вас из подборки работодателей, «Свободен» даёт максимальный приоритет.</div></div>
  <div class="card"><div class="card-title">География и ожидания</div>
    <label class="lbl">Город</label><input class="input" id="g-city" list="city-dl" value="${esc(db.profile.city)}">
    <label class="lbl">Радиус поиска: <b id="rad-lbl">${db.profile.radius_km} км</b></label>
    <input type="range" id="g-rad" min="10" max="300" step="10" value="${db.profile.radius_km}" style="width:100%;accent-color:var(--ice);margin-bottom:14px" oninput="document.getElementById('rad-lbl').textContent=this.value+' км'">
    <label class="lbl">Навыки (через запятую)</label><input class="input" id="g-skills" value="${esc(db.profile.skills)}">
    <div class="btn-row"><input class="input" id="g-exp" type="number" placeholder="Опыт, лет" value="${db.profile.exp_years}" style="flex:1">
    <input class="input" id="g-sal" type="number" placeholder="Зарплата от, ₽" value="${db.profile.salary_min}" style="flex:1"></div>
    <button class="btn btn-primary" onclick="geoSaveSeeker()">💾 Сохранить${SB.on()?' и отправить в облако':''}</button></div>`;
}
function setAvail(k){db.profile.availability=k;save();rerender();toast('Статус: '+availOf(k).t)}
function geoSaveCompany(){
  db.company.city=val('g-city')||db.company.city;
  db.company.radius_km=+document.getElementById('g-rad').value;
  db.vacancies.forEach(v=>{v.city=db.company.city;v.radius_km=db.company.radius_km;Object.assign(v,coords(v.city))});
  save();rerender();toast('География применена к '+db.vacancies.length+' вакансиям');
}
async function geoSaveSeeker(){
  const p=db.profile;
  p.city=val('g-city')||p.city;p.radius_km=+document.getElementById('g-rad').value;
  p.skills=val('g-skills');p.exp_years=+val('g-exp')||0;p.salary_min=+val('g-sal')||0;
  Object.assign(p,coords(p.city));save();rerender();toast('Профиль сохранён');
  if(SB.on()){try{await sbPush()}catch(e){}}
}

/* ---------- МОДУЛЬ: АВТОПОДБОР ---------- */
function mAutoMatch(st){
  if(st.radius===undefined)st.radius=100;
  if(st.onlyFree===undefined)st.onlyFree=false;
  if(st.min===undefined)st.min=0;
  const isCo=db.profile.role==='company';
  const head=`<div class="card" style="padding:16px">
    <label class="lbl">Радиус: <b id="rad-lbl">${st.radius} км</b></label>
    <input type="range" min="10" max="500" step="10" value="${st.radius}" style="width:100%;accent-color:var(--ice)" oninput="modState.automatch.radius=+this.value;document.getElementById('rad-lbl').textContent=this.value+' км'" onchange="renderModule()">
    <div class="chips" style="margin:12px 0 0">
      <button class="chip ${st.onlyFree?'on':''}" onclick="modState.automatch.onlyFree=!modState.automatch.onlyFree;renderModule()">🟢 только свободные</button>
      ${[0,45,70].map(m=>`<button class="chip ${st.min===m?'on':''}" onclick="modState.automatch.min=${m};renderModule()">${m?'от '+m+'%':'все'}</button>`).join('')}
    </div></div>`;

  if(isCo){
    const vacs=vacancyPool();
    if(!vacs.length)return head+'<div class="empty">Нет вакансий. Создайте в разделе «Потребность».</div>';
    if(!st.vac||!vacs.some(v=>v.id===st.vac))st.vac=vacs[0].id;
    const v=vacs.find(x=>x.id===st.vac);
    let rows=seekerPool().map(s=>({s,m:matchPair(s,v)}))
      .filter(x=>x.m.dist==null||x.m.dist<=st.radius||cityKey(x.s.city)===cityKey(v.city))
      .filter(x=>!st.onlyFree||x.s.availability==='free')
      .filter(x=>x.m.score>=st.min)
      .sort((a,b)=>b.m.score-a.m.score).slice(0,25);
    const sel=`<label class="lbl">Вакансия</label><select class="input" onchange="modState.automatch.vac=this.value;renderModule()">${vacs.map(x=>`<option value="${x.id}" ${x.id===st.vac?'selected':''}>${esc(x.title)} · ${esc(x.city)}</option>`).join('')}</select>`;
    const avg=rows.length?Math.round(rows.reduce((a,b)=>a+b.m.score,0)/rows.length):0;
    return head+`<div class="card">${sel}
      <div class="kpis" style="margin:8px 0 0"><div class="kpi"><b>${rows.length}</b><span>ПОДОБРАНО</span></div><div class="kpi"><b>${avg}%</b><span>СРЕДНЕЕ СОВПАДЕНИЕ</span></div><div class="kpi"><b>${rows.filter(r=>r.m.score>=70).length}</b><span>СИЛЬНЫХ</span></div></div></div>
      <div class="card">${rows.map(x=>`<div class="row" onclick="amSeekerView('${x.s.id}','${v.id}')"><div class="ri">${avatarHtml(x.s.avatar_url,x.s.name,36)}</div><div class="rb"><div class="rt">${esc(x.s.name)}</div><div class="rs">${esc(x.s.role||x.s.skills).slice(0,44)} · ${esc(x.s.city)}${x.m.dist!=null?' · '+Math.round(x.m.dist)+' км':''}</div><div class="chips" style="margin:6px 0 0">${x.m.reasons.slice(0,3).map(r=>`<span class="chip" style="padding:2px 7px;font-size:10px">${r}</span>`).join('')}</div></div><div class="rr" style="color:${scoreColor(x.m.score)};font-size:16px">${x.m.score}%</div></div>`).join('')||'<div class="empty">Никто не подошёл — расширьте радиус или снизьте порог</div>'}</div>`;
  }

  const me=normSeeker({...db.profile,id:db.profile.sid,exp:db.profile.exp_years});
  let rows=vacancyPool().filter(v=>v.status==='open').map(v=>({v,m:matchPair(me,v)}))
    .filter(x=>x.m.dist==null||x.m.dist<=st.radius||cityKey(x.v.city)===cityKey(me.city))
    .filter(x=>x.m.score>=st.min)
    .sort((a,b)=>b.m.score-a.m.score).slice(0,25);
  const avg=rows.length?Math.round(rows.reduce((a,b)=>a+b.m.score,0)/rows.length):0;
  const a=availOf(me.availability);
  return head+`<div class="card" style="padding:16px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:10px">${avatarHtml(me.avatar_url,me.name,40)}<div><div style="font-size:13.5px;font-weight:700">${a.i} ${a.t}</div><div style="font-size:11.5px;color:var(--faint)">${esc(me.city)} · радиус ${me.radius_km} км · от ${money(me.salary_min)}</div></div></div><button class="btn btn-sm btn-ghost" onclick="openModule('geostatus')">Изменить</button></div>
    <div class="kpis" style="margin:12px 0 0"><div class="kpi"><b>${rows.length}</b><span>НАЙДЕНО</span></div><div class="kpi"><b>${avg}%</b><span>СРЕДНЕЕ</span></div><div class="kpi"><b>${rows.filter(r=>r.m.score>=70).length}</b><span>СИЛЬНЫХ</span></div></div></div>
    <div class="card">${rows.map(x=>`<div class="row" onclick="amVacView('${x.v.id}')"><div class="ri">🎯</div><div class="rb"><div class="rt">${esc(x.v.title)}</div><div class="rs">${esc(x.v.company)} · ${esc(x.v.city)}${x.m.dist!=null?' · '+Math.round(x.m.dist)+' км':''} · ${money(x.v.salary)}</div><div class="chips" style="margin:6px 0 0">${x.m.reasons.slice(0,3).map(r=>`<span class="chip" style="padding:2px 7px;font-size:10px">${r}</span>`).join('')}</div></div><div class="rr" style="color:${scoreColor(x.m.score)};font-size:16px">${x.m.score}%</div></div>`).join('')||'<div class="empty">Вакансий не найдено — расширьте радиус или заберите данные из облака</div>'}</div>`;
}
function amFindSeeker(id){return seekerPool().find(s=>s.id===id)}
function amFindVac(id){return vacancyPool().find(v=>v.id===id)}
function amSeekerView(sid,vid){
  const s=amFindSeeker(sid),v=amFindVac(vid);if(!s||!v)return;
  const m=matchPair(s,v),a=availOf(s.availability);
  openDrawer(`<div class="card-title">Совпадение ${m.score}%</div><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">${avatarHtml(s.avatar_url,s.name,60)}<h3>${esc(s.name)}</h3></div>
    <p style="color:var(--dim);font-size:13px;margin:6px 0 10px">${esc(s.role)} · ${esc(s.city)} · опыт ${s.exp} лет · от ${money(s.salary_min)}</p>
    <span class="pill" style="background:rgba(255,255,255,.1);color:${a.c}">${a.i} ${a.t}</span>
    <div class="card-title" style="margin-top:14px">Почему подходит</div>
    ${m.reasons.map(r=>`<div style="font-size:13px;color:var(--dim);padding:5px 0">${r}</div>`).join('')}
    <div class="card-title" style="margin-top:12px">Навыки</div><div class="chips">${skillArr(s.skills).map(x=>`<span class="chip on">${esc(x)}</span>`).join('')}</div>
    <div class="btn-row" style="margin-top:16px">
      <button class="btn btn-sm btn-primary" onclick="amInvite('${esc(s.name)}','${esc(v.title)}')">📅 Пригласить</button>
      <button class="btn btn-sm btn-ghost" onclick="noteFor('${esc(s.name)}')">📝 Заметка</button></div>`);
}
function amVacView(vid){
  const v=amFindVac(vid);if(!v)return;
  const me=normSeeker({...db.profile,id:db.profile.sid,exp:db.profile.exp_years});
  const m=matchPair(me,v);
  openDrawer(`<div class="card-title">Совпадение ${m.score}%</div><h3>${esc(v.title)}</h3>
    <p style="color:var(--dim);font-size:13px;margin:6px 0 10px">${esc(v.company)} · ${esc(v.city)} · ${money(v.salary)}</p>
    <div class="card-title">Почему подходит</div>${m.reasons.map(r=>`<div style="font-size:13px;color:var(--dim);padding:5px 0">${r}</div>`).join('')}
    <div class="card-title" style="margin-top:12px">Описание</div><p style="font-size:13px;color:var(--dim);line-height:1.6">${esc(v.descr||'Описание не заполнено')}</p>
    <div class="btn-row" style="margin-top:16px"><button class="btn btn-sm btn-primary" onclick="amApply('${v.id}',${m.score})">📨 Откликнуться</button></div>`);
}
async function amApply(vid,score){
  const v=amFindVac(vid);if(!v)return;
  const app={id:uid(),vacancy:v.title,company:v.company,salary:v.salary,status:'Отклик',date:new Date().toISOString().slice(0,10)};
  db.applications.unshift(app);save();closeLayers();rerender();toast('Отклик отправлен: '+v.title);
  if(SB.on()){try{await SB.insert('applications',[{id:app.id,vacancy_id:v.id,seeker_id:db.profile.sid,seeker_name:db.profile.name,vacancy_title:v.title,company:v.company,score:score,status:'Отклик'}])}catch(e){toast('В облако не ушло: '+e.message)}}
}
function amInvite(name,vac){
  db.interviews.unshift({id:uid(),candidate:name,vacancy:vac,dt:dAgo(-1)+'T10:00',status:'Запланировано'});
  save();closeLayers();rerender();toast('Собеседование назначено: '+name);
}
function amBadge(){
  try{
    if(db.profile.role==='company'){
      const v=vacancyPool()[0];if(!v)return null;
      return seekerPool().filter(s=>matchPair(s,v).score>=70).length||null;
    }
    const me=normSeeker({...db.profile,id:db.profile.sid,exp:db.profile.exp_years});
    return vacancyPool().filter(v=>v.status==='open'&&matchPair(me,v).score>=70).length||null;
  }catch(e){return null}
}

/* ---------- ВСТРАИВАНИЕ В ПРИЛОЖЕНИЕ ---------- */
MOD.seeker.splice(1,0,{g:'Автоподбор',items:[
  {key:'automatch',icon:'🎯',title:'Автоподбор вакансий',sub:'Гео · статус · навыки · деньги',badge:amBadge},
  {key:'geostatus',icon:'📍',title:'География и статус',sub:'Свободен / занят, радиус',badge:()=>null}]});
MOD.seeker.push({g:'Данные',items:[{key:'database',icon:'🗄️',title:'База данных',sub:'Supabase · синхронизация',badge:()=>SB.on()?'ON':null}]});
MOD.company.splice(1,0,{g:'Автоподбор',items:[
  {key:'automatch',icon:'🎯',title:'Автоподбор соискателей',sub:'Гео · статус · навыки · деньги',badge:amBadge},
  {key:'geostatus',icon:'📍',title:'География компании',sub:'Город и радиус поиска',badge:()=>null}]});
MOD.company.push({g:'Данные',items:[{key:'database',icon:'🗄️',title:'База данных',sub:'Supabase · синхронизация',badge:()=>SB.on()?'ON':null}]});

const _modTitle=modTitle;
modTitle=function(k){
  if(k==='automatch')return db.profile.role==='company'?'Автоподбор соискателей':'Автоподбор вакансий';
  if(k==='geostatus')return db.profile.role==='company'?'География компании':'География и статус';
  if(k==='database')return 'База данных';
  return _modTitle(k);
};
const _renderModule=renderModule;
renderModule=function(){
  const extra={database:mDatabase,geostatus:mGeoStatus,automatch:mAutoMatch};
  if(extra[curMod]){
    document.getElementById('module-body').innerHTML=extra[curMod](modState[curMod]);
    document.getElementById('ab-title').textContent=modTitle(curMod);
  } else _renderModule();
};
const _renderHome=renderHome;
renderHome=function(role){
  _renderHome(role);
  const el=document.getElementById(role==='seeker'?'seeker-home':'company-home');
  const cloud=SB.on()?`<span class="pill p-ok">🗄️ облако</span>`:`<span class="pill p-dim">🗄️ локально</span>`;
  let strip;
  if(role==='seeker'){
    const a=availOf(db.profile.availability);
    strip=`<div class="card" style="padding:14px;display:flex;align-items:center;gap:12px">
      <div style="display:flex;align-items:center;gap:10px">${avatarHtml(db.profile.avatar_url,db.profile.name,40)}
      <div style="flex:1"><div style="font-size:13.5px;font-weight:700;color:${a.c}">${a.i} ${a.t}</div>
      <div style="font-size:11.5px;color:var(--faint);margin-top:2px">${esc(db.profile.city)} · радиус ${db.profile.radius_km} км ${cloud}</div></div></div>
      <button class="btn btn-sm btn-ghost" onclick="amCycle()">Сменить</button></div>`;
  }else{
    strip=`<div class="card" style="padding:14px;display:flex;align-items:center;gap:12px">
      <div style="display:flex;align-items:center;gap:10px">${avatarHtml(db.company.avatar_url,db.company.name,40)}
      <div style="flex:1"><div style="font-size:13.5px;font-weight:700">📍 ${esc(db.company.city)} · радиус ${db.company.radius_km} км</div>
      <div style="font-size:11.5px;color:var(--faint);margin-top:2px">${cloud} · в облаке ${(db.cloudSeekers||[]).length} соискателей</div></div></div>
      <button class="btn btn-sm btn-ghost" onclick="openModule('database')">База</button></div>`;
  }
  el.insertAdjacentHTML('afterbegin',strip);
};
function amCycle(){
  const order=['free','part','busy'];
  db.profile.availability=order[(order.indexOf(db.profile.availability)+1)%3];
  save();rerender();toast('Статус: '+availOf(db.profile.availability).t);
}

/* ---------- СТАРТ ---------- */
sbMigrate();
db.session = null;
save();
curMod = null;
go('s-main');