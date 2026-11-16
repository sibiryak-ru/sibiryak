/* ============================================================
   СИБИРЯК · СЛОЙ ДАННЫХ, АВТОПОДБОР И ПУБЛИКАЦИЯ v1.2
   Supabase (PostgREST, без SDK) + гео-матчинг + статусы
   + мультипостинг: резюме / вакансии / заявки на услугу
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
const SB_SQL = `-- СИБИРЯК · схема MVP + публикации (Supabase → SQL Editor → Run)

create table if not exists seekers(
  id text primary key, name text not null, city text,
  lat double precision, lng double precision, radius_km int default 30,
  skills text, exp_years int default 0, salary_min int default 0,
  availability text default 'free', rating numeric default 0, about text,
  avatar_url text, updated_at timestamptz default now()
);
create table if not exists vacancies(
  id text primary key, company text, title text not null, city text,
  lat double precision, lng double precision, radius_km int default 50,
  skills text, salary int default 0, exp_min int default 0,
  status text default 'open', descr text, updated_at timestamptz default now()
);
create table if not exists applications(
  id text primary key, vacancy_id text, seeker_id text, seeker_name text,
  vacancy_title text, company text, score int default 0,
  status text default 'Отклик', created_at timestamptz default now()
);
create table if not exists resumes(
  id text primary key, owner_id text, title text not null, city text,
  exp_years int default 0, skills text, about text, updated_at timestamptz default now()
);
create table if not exists services(
  id text primary key, owner_id text, category text, title text not null,
  city text, budget int default 0, deadline date, descr text,
  status text default 'active', created_at timestamptz default now()
);

create index if not exists seekers_city_idx on seekers(city);
create index if not exists seekers_avail_idx on seekers(availability);
create index if not exists vacancies_city_idx on vacancies(city);
create index if not exists vacancies_status_idx on vacancies(status);
create index if not exists services_city_idx on services(city);

alter table seekers enable row level security;
alter table vacancies enable row level security;
alter table applications enable row level security;
alter table resumes enable row level security;
alter table services enable row level security;

-- ВНИМАНИЕ: ДЕМО-ПОЛИТИКИ. Перед реальным запуском — политики по auth.uid().
drop policy if exists demo_all on seekers;
drop policy if exists demo_all on vacancies;
drop policy if exists demo_all on applications;
drop policy if exists demo_all on resumes;
drop policy if exists demo_all on services;
create policy demo_all on seekers for all to anon using (true) with check (true);
create policy demo_all on vacancies for all to anon using (true) with check (true);
create policy demo_all on applications for all to anon using (true) with check (true);
create policy demo_all on resumes for all to anon using (true) with check (true);
create policy demo_all on services for all to anon using (true) with check (true);
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
  p.avatar_url=p.avatar_url||null;
  Object.assign(p,coords(p.city));
  db.company.city=db.company.city||'Барнаул';
  db.company.radius_km=db.company.radius_km||60;
  db.company.avatar_url=db.company.avatar_url||null;
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
    c.avatar_url=c.avatar_url||null;
    Object.assign(c,coords(c.city));
  });
  db.cloudSeekers=db.cloudSeekers||[];
  db.cloudVacancies=db.cloudVacancies||[];
  pubMigrate();
  save();
}

/* ---------- НОРМАЛИЗАЦИЯ ---------- */
const skillArr=s=>String(s||'').toLowerCase().split(/[,;]/).map(x=>x.trim()).filter(Boolean);
function normSeeker(r){
  return {id:r.id,name:r.name||'Без имени',role:r.role||r.about||'',city:r.city||'',lat:r.lat,lng:r.lng,
    radius_km:r.radius_km||30,skills:Array.isArray(r.skills)?r.skills.join(', '):(r.skills||''),
    exp:r.exp!=null?r.exp:(r.exp_years||0),salary_min:r.salary_min||0,
    availability:r.availability||'free',rating:r.rating||0,src:r.src||'local',
    avatar_url:r.avatar_url||null};
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

/* ---------- АВАТАРЫ ---------- */
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
      save();rerender();toast('Аватар обновлён');
    }
  };
  input.click();
}
function avatarHtml(url,name,size=62){
  if(url)return `<img src="${esc(url)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:1.5px solid var(--line2)">`;
  const initials=String(name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,var(--bg2),var(--bg1));border:1.5px solid var(--line2);display:flex;align-items:center;justify-content:center;font-size:${size/2.2}px;color:var(--ice)">${esc(initials)}</div>`;
}

/* ============================================================
   ПУБЛИКАЦИЯ: РЕЗЮМЕ / ВАКАНСИИ / ЗАЯВКИ НА УСЛУГУ
   ============================================================ */
const PUB_PARTNERS={
  job:[
    {id:'sib',name:'Сибиряк',host:'sibiryak.ru',lock:true},
    {id:'rabota',name:'Работа.ру',host:'rabota.ru'},
    {id:'hh',name:'hh.ru',host:'hh.ru'},
    {id:'zarplata',name:'Зарплата.ру',host:'zarplata.ru'},
    {id:'avito',name:'Авито Работа',host:'avito.ru'},
    {id:'trud',name:'Работа России',host:'trudvsem.ru'}
  ],
  service:[
    {id:'sib',name:'Сибиряк',host:'sibiryak.ru',lock:true},
    {id:'avito',name:'Авито Услуги',host:'avito.ru'},
    {id:'profi',name:'Профи.ру',host:'profi.ru'},
    {id:'youdo',name:'YouDo',host:'youdo.com'},
    {id:'yuslugi',name:'Яндекс Услуги',host:'uslugi.yandex.ru'}
  ]
};
const PUB_KIND={
  resume:{icon:'📄',label:'Резюме',set:'job',form:'pub-resume'},
  vacancy:{icon:'🎯',label:'Вакансия',set:'job',form:'pub-vacancy'},
  service:{icon:'🛠',label:'Заявка на услугу',set:'service',form:'pub-service'}
};
const PUB_STATUS={
  sending:{t:'Отправка',c:'var(--amber,#ffc24b)'},
  ok:{t:'Опубликовано',c:'var(--pine,#3ddc97)'},
  error:{t:'Ошибка',c:'var(--rose,#ff5d73)'}
};
const SERVICE_CATS=['Грузоперевозки','Ремонт авто','Строительство и ремонт','Клининг','Курьерская доставка','Репетиторы','IT и техника','Другое'];
const SCHEDULES=['Полная занятость','Сменный график','Подработка','Вахта','Удалённо'];

function pubMigrate(){
  if(!db.publications){
    db.publications=[
      {id:'pub_r1',kind:'resume',ownerRole:'seeker',title:'Водитель-экспедитор',city:'Барнаул',salary:75000,exp:6,
        skills:'Вождение, логистика, категория C',schedule:'Сменный график',
        descr:'6 лет без аварий, знаю город и край. Готов к рейсам по Алтаю.',
        createdAt:dAgo(3),status:'active',views:148,responses:6,
        partners:[
          {id:'sib',name:'Сибиряк',status:'ok',url:'#pub-pub_r1',at:dAgo(3)},
          {id:'rabota',name:'Работа.ру',status:'ok',url:'https://rabota.ru/resume/pub_r1',at:dAgo(3)},
          {id:'hh',name:'hh.ru',status:'ok',url:'https://hh.ru/resume/pub_r1',at:dAgo(3)}
        ]},
      {id:'pub_s1',kind:'service',ownerRole:'seeker',category:'Грузоперевозки',title:'Перевезти стройматериалы, 2 рейса',
        city:'Барнаул',budget:6000,deadline:dAgo(-2),descr:'Газель или камаз, погрузка у заказчика, разгрузка на объекте.',
        createdAt:dAgo(1),status:'active',views:54,responses:3,
        partners:[
          {id:'sib',name:'Сибиряк',status:'ok',url:'#pub-pub_s1',at:dAgo(1)},
          {id:'avito',name:'Авито Услуги',status:'ok',url:'https://avito.ru/uslugi/pub_s1',at:dAgo(1)},
          {id:'profi',name:'Профи.ру',status:'error',err:'Шлюз партнёра не ответил',url:null,at:null}
        ]},
      {id:'pub_v1',kind:'vacancy',ownerRole:'company',title:'Водитель-экспедитор',city:'Барнаул',salary:75000,exp_min:2,count:2,
        skills:'Вождение, категория C, логистика',schedule:'Сменный график',
        descr:'Доставка грузов по Барнаулу и краю, оформление по ТК.',
        createdAt:dAgo(5),status:'active',views:210,responses:11,
        partners:[
          {id:'sib',name:'Сибиряк',status:'ok',url:'#pub-pub_v1',at:dAgo(5)},
          {id:'rabota',name:'Работа.ру',status:'ok',url:'https://rabota.ru/vacancy/pub_v1',at:dAgo(5)},
          {id:'hh',name:'hh.ru',status:'ok',url:'https://hh.ru/vacancy/pub_v1',at:dAgo(5)},
          {id:'zarplata',name:'Зарплата.ру',status:'error',err:'Требуется подтверждение компании',url:null,at:null}
        ]}
    ];
  }
  db.publications.forEach(p=>{
    p.partners=p.partners||[];p.views=p.views||0;p.responses=p.responses||0;
    p.status=p.status||'active';p.ownerRole=p.ownerRole||(p.kind==='vacancy'?'company':'seeker');
  });
  db.savedViews=db.savedViews||[];
}
function pubRoleKinds(){return db.profile.role==='company'?['vacancy','service']:['resume','service']}
function pubMine(){return db.publications.filter(p=>pubRoleKinds().includes(p.kind))}
function pubBadge(){const n=pubMine().filter(p=>p.status==='active').length;return n||null}
function pubFind(id){return db.publications.find(p=>p.id===id)}
function pubDefaultPartners(kind){
  const set=PUB_KIND[kind].set;
  return set==='job'?['sib','rabota','hh']:['sib','avito','profi'];
}
function pubFormState(key){
  if(!modState[key])modState[key]={partners:pubDefaultPartners(key==='pub-vacancy'?'vacancy':key==='pub-service'?'service':'resume'),editId:null};
  return modState[key];
}
function pubOpen(key){
  const kind=key==='pub-vacancy'?'vacancy':key==='pub-service'?'service':'resume';
  modState[key]={partners:pubDefaultPartners(kind),editId:null};
  openModule(key);
}
function pubEdit(id){
  const rec=pubFind(id);if(!rec)return;
  const key=PUB_KIND[rec.kind].form;
  modState[key]={partners:rec.partners.map(p=>p.id),editId:id};
  closeLayers();openModule(key);
}
function pubTogglePartner(key,id){
  const st=pubFormState(key);
  const def=PUB_PARTNERS[PUB_KIND[key==='pub-vacancy'?'vacancy':key==='pub-service'?'service':'resume'].set];
  const p=def.find(x=>x.id===id);
  if(p&&p.lock)return;
  st.partners=st.partners.includes(id)?st.partners.filter(x=>x!==id):[...st.partners,id];
  renderModule();
}

/* ---------- СТИЛИ ПУБЛИКАЦИИ ---------- */
function pubStyle(){
  if(document.getElementById('pub-style'))return;
  const s=document.createElement('style');
  s.id='pub-style';
  s.textContent=`
  #module-body::-webkit-scrollbar,.drawer::-webkit-scrollbar{width:8px;height:8px}
  #module-body::-webkit-scrollbar-track,.drawer::-webkit-scrollbar-track{background:var(--bg1,#0b1220)}
  #module-body::-webkit-scrollbar-thumb,.drawer::-webkit-scrollbar-thumb{background:var(--line2,#2a3a55);border-radius:8px}
  #module-body::-webkit-scrollbar-thumb:hover,.drawer::-webkit-scrollbar-thumb:hover{background:var(--ice,#7fd0ff)}
  .pub-panel{border:1px solid var(--line2,#2a3a55);background:linear-gradient(150deg,var(--bg2,#101a2c),var(--bg1,#0b1220))}
  .pub-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
  .pub-title{font-size:15px;font-weight:800;color:var(--ice,#7fd0ff)}
  .pub-sub{font-size:11.5px;color:var(--faint,#7d8ca3);margin-top:2px}
  .pub-btns{display:grid;gap:10px}
  .pub-partners{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
  .pub-pchip{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;color:var(--dim,#cfe9ff);
    border:1px solid var(--line2,#2a3a55);border-radius:999px;padding:3px 9px;background:rgba(255,255,255,.03)}
  .pub-dot{width:7px;height:7px;border-radius:50%;flex:none}
  .pub-dot.sending{animation:pubPulse 1s infinite}
  @keyframes pubPulse{0%,100%{opacity:1}50%{opacity:.25}}
  .pub-row{display:flex;gap:10px;align-items:flex-start;padding:12px 10px;border-bottom:1px solid var(--line2,#22304a);cursor:pointer}
  .pub-row:last-child{border-bottom:none}
  .pub-row.dragging{opacity:.35}
  .pub-row .cb{margin-top:4px;accent-color:var(--ice,#7fd0ff)}
  .pub-rt{font-size:13.5px;font-weight:700;color:var(--dim,#e6f2ff)}
  .pub-rs{font-size:11.5px;color:var(--faint,#7d8ca3);margin-top:2px}
  .pub-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px}
  .pub-tools .input{margin:0}
  .pub-bar{display:flex;gap:8px;align-items:center;padding:8px 10px;margin-bottom:8px;border-radius:12px;
    background:rgba(255,194,75,.08);border:1px solid rgba(255,194,75,.35);font-size:12px;color:var(--amber,#ffc24b)}
  .pub-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
  .pub-meta div{border:1px solid var(--line2,#22304a);border-radius:10px;padding:8px 10px;font-size:12px;color:var(--dim,#cfe9ff)}
  .pub-meta b{display:block;font-size:10px;color:var(--faint,#7d8ca3);font-weight:600;margin-bottom:2px}
  .pub-prow{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed var(--line2,#22304a);font-size:12.5px}
  .pub-prow:last-child{border-bottom:none}
  .pub-prow a{color:var(--ice,#7fd0ff);text-decoration:none;font-size:11px}
  #pub-snack{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:9999;
    background:var(--bg2,#101a2c);border:1px solid var(--line2,#2a3a55);border-radius:14px;padding:10px 14px;
    display:flex;gap:12px;align-items:center;box-shadow:0 12px 40px rgba(0,0,0,.55);
    color:var(--dim,#cfe9ff);font-size:13px;max-width:92vw}
  #pub-snack button{background:var(--amber,#ffc24b);color:#1a1408;border:none;border-radius:9px;
    padding:6px 12px;font-weight:700;font-size:12px;cursor:pointer}
  .pub-err{border-color:var(--rose,#ff5d73)!important}
  `;
  document.head.appendChild(s);
}
function pubSnack(msg,label,fn){
  const old=document.getElementById('pub-snack');if(old)old.remove();
  const d=document.createElement('div');
  d.id='pub-snack';
  d.innerHTML=`<span>${esc(msg)}</span>${label?`<button id="pub-snack-btn">${esc(label)}</button>`:''}`;
  document.body.appendChild(d);
  if(label)document.getElementById('pub-snack-btn').onclick=()=>{d.remove();fn&&fn()};
  setTimeout(()=>{if(d.parentNode)d.remove()},6500);
}

/* ---------- ФОРМЫ ПУБЛИКАЦИИ ---------- */
function pubCityDl(){return `<datalist id="pub-city-dl">${CITY_LIST.map(c=>`<option value="${esc(c)}">`).join('')}</datalist>`}
function pubPartnerPicker(key){
  const kind=key==='pub-vacancy'?'vacancy':key==='pub-service'?'service':'resume';
  const st=pubFormState(key);
  const list=PUB_PARTNERS[PUB_KIND[kind].set];
  return `<div class="card-title" style="margin-top:14px">Куда разместить</div>
    <div class="chips">${list.map(p=>{
      const on=st.partners.includes(p.id);
      return `<button class="chip ${on?'on':''}" onclick="pubTogglePartner('${key}','${p.id}')">${p.lock?'🔒 ':''}${esc(p.name)}</button>`;
    }).join('')}</div>
    <div style="font-size:11px;color:var(--faint);line-height:1.6;margin-top:8px">Сибиряк публикуется в вашу базу Supabase. Отправки партнёрам в демо-режиме имитируются шлюзом; реальные API-ключи подключаются позже в разделе «База данных».</div>`;
}
function pubVal(id){const el=document.getElementById(id);return el?el.value.trim():''}
function pubMark(id,bad){const el=document.getElementById(id);if(el)el.classList.toggle('pub-err',!!bad)}

function mPubResume(){
  pubStyle();
  const st=pubFormState('pub-resume');
  const rec=st.editId?pubFind(st.editId):null;
  const r=rec||{title:'',city:db.profile.city,salary:db.profile.salary_min||60000,exp:db.profile.exp_years||0,skills:db.profile.skills||'',schedule:SCHEDULES[0],descr:(db.resumes[0]&&db.resumes[0].about)||''};
  return `${pubCityDl()}<div class="card">
    <div class="card-title">${rec?'Редактирование резюме':'Разместить резюме'}</div>
    <div class="demo-note">Резюме уходит на платформу Сибиряк и выбранные партнёрские площадки одновременно. Статусы отправки видны в «Мои публикации».</div>
    <label class="lbl">Должность</label><input class="input" id="pr-title" value="${esc(r.title)}" placeholder="Водитель-экспедитор">
    <div class="btn-row"><input class="input" id="pr-city" list="pub-city-dl" value="${esc(r.city)}" placeholder="Город" style="flex:1">
    <input class="input" id="pr-salary" type="number" value="${r.salary||0}" placeholder="Зарплата от, ₽" style="flex:1"></div>
    <div class="btn-row"><input class="input" id="pr-exp" type="number" value="${r.exp||0}" placeholder="Опыт, лет" style="flex:1">
    <select class="input" id="pr-schedule" style="flex:1">${SCHEDULES.map(s=>`<option ${s===r.schedule?'selected':''}>${esc(s)}</option>`).join('')}</select></div>
    <label class="lbl">Навыки (через запятую)</label><input class="input" id="pr-skills" value="${esc(r.skills)}" placeholder="Вождение, логистика, категория C">
    <label class="lbl">О себе</label><textarea class="input" id="pr-descr" rows="3">${esc(r.descr||'')}</textarea>
    ${pubPartnerPicker('pub-resume')}
    <button class="btn btn-primary" style="margin-top:14px" onclick="pubSubmit('resume')">📤 ${rec?'Обновить и разослать':'Разместить резюме'}</button>
  </div>`;
}
function mPubVacancy(){
  pubStyle();
  const st=pubFormState('pub-vacancy');
  const rec=st.editId?pubFind(st.editId):null;
  const v=rec||{title:'',city:db.company.city,salary:60000,exp_min:0,count:1,skills:'',schedule:SCHEDULES[0],descr:''};
  return `${pubCityDl()}<div class="card">
    <div class="card-title">${rec?'Редактирование вакансии':'Разместить вакансию'}</div>
    <div class="demo-note">Вакансия публикуется на Сибиряке и партнёрских job-площадках. Отклики собираются в одном кабинете.</div>
    <label class="lbl">Должность</label><input class="input" id="pv-title" value="${esc(v.title)}" placeholder="Автомеханик">
    <div class="btn-row"><input class="input" id="pv-city" list="pub-city-dl" value="${esc(v.city)}" placeholder="Город" style="flex:1">
    <input class="input" id="pv-salary" type="number" value="${v.salary||0}" placeholder="Зарплата, ₽" style="flex:1"></div>
    <div class="btn-row"><input class="input" id="pv-exp" type="number" value="${v.exp_min||0}" placeholder="Опыт от, лет" style="flex:1">
    <input class="input" id="pv-count" type="number" value="${v.count||1}" placeholder="Человек" style="flex:1"></div>
    <label class="lbl">График</label><select class="input" id="pv-schedule">${SCHEDULES.map(s=>`<option ${s===v.schedule?'selected':''}>${esc(s)}</option>`).join('')}</select>
    <label class="lbl">Требования (через запятую)</label><input class="input" id="pv-skills" value="${esc(v.skills)}" placeholder="Диагностика, ремонт ДВС">
    <label class="lbl">Описание и условия</label><textarea class="input" id="pv-descr" rows="4">${esc(v.descr||'')}</textarea>
    ${pubPartnerPicker('pub-vacancy')}
    <button class="btn btn-primary" style="margin-top:14px" onclick="pubSubmit('vacancy')">📤 ${rec?'Обновить и разослать':'Разместить вакансию'}</button>
  </div>`;
}
function mPubService(){
  pubStyle();
  const st=pubFormState('pub-service');
  const rec=st.editId?pubFind(st.editId):null;
  const s=rec||{category:SERVICE_CATS[0],title:'',city:db.profile.city,budget:5000,deadline:'',descr:''};
  return `${pubCityDl()}<div class="card">
    <div class="card-title">${rec?'Редактирование заявки':'Заявка на услугу'}</div>
    <div class="demo-note">Опишите, что нужно сделать. Заявка уйдёт исполнителям Сибиряка и партнёрских сервисов услуг.</div>
    <label class="lbl">Категория</label><select class="input" id="ps-cat">${SERVICE_CATS.map(c=>`<option ${c===s.category?'selected':''}>${esc(c)}</option>`).join('')}</select>
    <label class="lbl">Что нужно сделать</label><input class="input" id="ps-title" value="${esc(s.title)}" placeholder="Перевезти стройматериалы, 2 рейса">
    <div class="btn-row"><input class="input" id="ps-city" list="pub-city-dl" value="${esc(s.city)}" placeholder="Город" style="flex:1">
    <input class="input" id="ps-budget" type="number" value="${s.budget||0}" placeholder="Бюджет, ₽" style="flex:1"></div>
    <label class="lbl">Срок выполнения</label><input class="input" id="ps-deadline" type="date" value="${esc(s.deadline||'')}">
    <label class="lbl">Детали</label><textarea class="input" id="ps-descr" rows="3">${esc(s.descr||'')}</textarea>
    ${pubPartnerPicker('pub-service')}
    <button class="btn btn-primary" style="margin-top:14px" onclick="pubSubmit('service')">📤 ${rec?'Обновить и разослать':'Отправить заявку'}</button>
  </div>`;
}

function pubSubmit(kind){
  const key=PUB_KIND[kind].form;
  const st=pubFormState(key);
  let rec,fields;
  if(kind==='resume'){
    fields={title:pubVal('pr-title'),city:pubVal('pr-city'),salary:+pubVal('pr-salary')||0,exp:+pubVal('pr-exp')||0,
      skills:pubVal('pr-skills'),schedule:pubVal('pr-schedule'),descr:pubVal('pr-descr')};
    pubMark('pr-title',!fields.title);pubMark('pr-city',!fields.city);
  }else if(kind==='vacancy'){
    fields={title:pubVal('pv-title'),city:pubVal('pv-city'),salary:+pubVal('pv-salary')||0,exp_min:+pubVal('pv-exp')||0,
      count:+pubVal('pv-count')||1,skills:pubVal('pv-skills'),schedule:pubVal('pv-schedule'),descr:pubVal('pv-descr')};
    pubMark('pv-title',!fields.title);pubMark('pv-city',!fields.city);
  }else{
    fields={category:pubVal('ps-cat'),title:pubVal('ps-title'),city:pubVal('ps-city'),budget:+pubVal('ps-budget')||0,
      deadline:pubVal('ps-deadline'),descr:pubVal('ps-descr')};
    pubMark('ps-title',!fields.title);pubMark('ps-city',!fields.city);
  }
  if(!fields.title||!fields.city){toast('Заполните название и город');return}
  if(!st.partners.includes('sib'))st.partners.unshift('sib');
  const def=PUB_PARTNERS[PUB_KIND[kind].set];
  const chosen=def.filter(p=>st.partners.includes(p.id));
  if(st.editId){
    rec=pubFind(st.editId);
    if(!rec){st.editId=null;toast('Публикация не найдена');return}
    Object.assign(rec,fields);
    chosen.forEach(p=>{
      if(!rec.partners.some(x=>x.id===p.id))rec.partners.push({id:p.id,name:p.name,status:'sending',url:null,at:null});
    });
    rec.partners=rec.partners.filter(p=>st.partners.includes(p.id)||p.id==='sib');
    rec.partners.forEach(p=>{if(p.status==='error')p.status='sending'});
    save();st.editId=null;
    pubDeliver(rec,true);
    openModule('pub-list');
    pubSnack('Публикация обновлена и разослана','Открыть',()=>openModule('pub-list'));
    return;
  }
  rec={id:'pub_'+uid(),kind,ownerRole:kind==='vacancy'?'company':'seeker',...fields,
    createdAt:new Date().toISOString().slice(0,10),status:'active',views:0,responses:0,
    partners:chosen.map(p=>({id:p.id,name:p.name,status:'sending',url:null,at:null}))};
  db.publications.unshift(rec);
  if(kind==='resume'){
    db.resumes.unshift({id:rec.id,title:rec.title,exp:rec.exp,skills:rec.skills,about:rec.descr,city:rec.city});
    db.profile.skills=rec.skills;db.profile.exp_years=rec.exp;db.profile.salary_min=rec.salary;
    db.profile.city=rec.city;Object.assign(db.profile,coords(rec.city));
  }
  if(kind==='vacancy'){
    db.vacancies.unshift({id:rec.id,title:rec.title,count:rec.count,salary:rec.salary,skills:rec.skills,desc:rec.descr,status:'Открыта',city:rec.city,exp_min:rec.exp_min,...coords(rec.city)});
  }
  save();
  pubDeliver(rec,false);
  openModule('pub-list');
  pubSnack('Размещено: Сибиряк + '+Math.max(0,chosen.length-1)+' партнёра','Статусы',()=>openModule('pub-list'));
}

async function pubCloudPush(rec){
  if(rec.kind==='resume'){
    await SB.upsert('resumes',[{id:rec.id,owner_id:db.profile.sid,title:rec.title,city:rec.city,
      exp_years:rec.exp||0,skills:rec.skills||'',about:rec.descr||'',updated_at:new Date().toISOString()}]);
    try{await sbPush()}catch(e){}
  }else if(rec.kind==='vacancy'){
    await SB.upsert('vacancies',[{id:rec.id,company:db.company.name,title:rec.title,city:rec.city,
      lat:coords(rec.city).lat,lng:coords(rec.city).lng,radius_km:db.company.radius_km,
      skills:rec.skills||'',salary:rec.salary||0,exp_min:rec.exp_min||0,status:'open',descr:rec.descr||''}]);
  }else{
    await SB.upsert('services',[{id:rec.id,owner_id:db.profile.sid,category:rec.category||'',title:rec.title,
      city:rec.city,budget:rec.budget||0,deadline:rec.deadline||null,descr:rec.descr||'',
      status:rec.status,created_at:new Date().toISOString()}]);
  }
}
function pubPartnerUrl(p,rec){
  const path=rec.kind==='vacancy'?'vacancy':rec.kind==='resume'?'resume':'uslugi';
  return 'https://'+p.host+'/'+path+'/'+rec.id;
}
function pubDeliver(rec,onlyNew){
  rec.partners.forEach((p,i)=>{
    if(onlyNew&&p.status==='ok')return;
    setTimeout(async()=>{
      const live=pubFind(rec.id);if(!live)return;
      const lp=live.partners.find(x=>x.id===p.id);if(!lp)return;
      if(lp.id==='sib'){
        if(SB.on()){
          try{await pubCloudPush(live);lp.status='ok';lp.url=location.href.split('#')[0]+'#pub-'+live.id;lp.at=new Date().toISOString().slice(0,10)}
          catch(e){lp.status='error';lp.err=e.message+' · выполните SQL схемы в разделе «База данных»'}
        }else{
          lp.status='ok';lp.url=location.href.split('#')[0]+'#pub-'+live.id;lp.at=new Date().toISOString().slice(0,10);lp.local=true;
        }
      }else{
        await new Promise(r=>setTimeout(r,500+Math.random()*900));
        if(Math.random()<0.88){lp.status='ok';lp.url=pubPartnerUrl(lp,live);lp.at=new Date().toISOString().slice(0,10)}
        else{lp.status='error';lp.err='Шлюз партнёра не ответил'}
      }
      save();
      if(curMod==='pub-list')pubRefreshRows();
      if(document.getElementById('pub-drawer-'+live.id))pubOpenDrawer(live.id);
    },350+i*520);
  });
}
function pubRetry(id,pid){
  const rec=pubFind(id);if(!rec)return;
  const p=rec.partners.find(x=>x.id===pid);if(!p)return;
  p.status='sending';p.err=null;save();
  if(curMod==='pub-list')pubRefreshRows();
  if(document.getElementById('pub-drawer-'+id))pubOpenDrawer(id);
  setTimeout(async()=>{
    const live=pubFind(id);if(!live)return;
    const lp=live.partners.find(x=>x.id===pid);if(!lp)return;
    if(lp.id==='sib'&&SB.on()){
      try{await pubCloudPush(live);lp.status='ok';lp.url=location.href.split('#')[0]+'#pub-'+live.id}
      catch(e){lp.status='error';lp.err=e.message}
    }else{
      lp.status='ok';lp.url=lp.id==='sib'?location.href.split('#')[0]+'#pub-'+live.id:pubPartnerUrl(lp,live);
    }
    lp.at=new Date().toISOString().slice(0,10);
    save();
    if(curMod==='pub-list')pubRefreshRows();
    if(document.getElementById('pub-drawer-'+id))pubOpenDrawer(id);
    toast('Партнёр '+lp.name+': '+PUB_STATUS[lp.status].t);
  },900);
}

/* ---------- СПИСОК ПУБЛИКАЦИЙ ---------- */
function pubListState(){
  if(!modState['pub-list'])modState['pub-list']={q:'',kind:'all',status:'all',sort:'new',sel:[]};
  return modState['pub-list'];
}
function pubFiltered(){
  const st=pubListState();
  let rows=pubMine();
  if(st.kind!=='all')rows=rows.filter(r=>r.kind===st.kind);
  if(st.status!=='all')rows=rows.filter(r=>st.status==='active'?r.status==='active':r.status==='paused');
  if(st.q){
    const q=st.q.toLowerCase();
    rows=rows.filter(r=>(r.title+' '+r.city+' '+(r.skills||'')+' '+(r.category||'')).toLowerCase().includes(q));
  }
  if(st.sort==='new')rows=[...rows].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  if(st.sort==='views')rows=[...rows].sort((a,b)=>b.views-a.views);
  if(st.sort==='resp')rows=[...rows].sort((a,b)=>b.responses-a.responses);
  if(st.sort==='title')rows=[...rows].sort((a,b)=>a.title.localeCompare(b.title,'ru'));
  return rows;
}
function pubRowsHtml(){
  const st=pubListState();
  const rows=pubFiltered();
  const bar=st.sel.length?`<div class="pub-bar"><span>Выбрано: ${st.sel.length}</span>
    <button class="btn btn-sm btn-ghost" onclick="pubDeleteSel()">🗑 Удалить выбранные</button>
    <button class="btn btn-sm btn-ghost" onclick="pubListState().sel=[];pubRefreshRows()">Снять</button></div>`:'';
  if(!rows.length)return bar+`<div class="empty">Публикаций нет. Нажмите «Разместить резюме», «Разместить вакансию» или «Заявка на услугу» на главном экране.</div>`;
  return bar+rows.map(r=>{
    const k=PUB_KIND[r.kind];
    const ok=r.partners.filter(p=>p.status==='ok').length;
    const bad=r.partners.filter(p=>p.status==='error').length;
    const send=r.partners.filter(p=>p.status==='sending').length;
    const moneyLine=r.kind==='service'?('бюджет '+money(r.budget||0)):money(r.salary||0);
    return `<div class="pub-row" draggable="true" ondragstart="pubDrag(event,'${r.id}')" ondragover="event.preventDefault()" ondrop="pubDrop(event,'${r.id}')" onclick="pubOpenDrawer('${r.id}')">
      <input class="cb" type="checkbox" ${st.sel.includes(r.id)?'checked':''} onclick="event.stopPropagation();pubSel('${r.id}',this.checked)">
      <div style="font-size:20px">${k.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="pub-rt">${esc(r.title)} ${r.status==='paused'?'<span class="pill p-dim">пауза</span>':''}</div>
        <div class="pub-rs">${k.label} · ${esc(r.city)} · ${moneyLine} · 👁 ${r.views} · ✉️ ${r.responses}</div>
        <div class="pub-partners" style="margin-top:6px">
          ${r.partners.map(p=>`<span class="pub-pchip"><span class="pub-dot ${p.status}" style="background:${PUB_STATUS[p.status].c}"></span>${esc(p.name)}</span>`).join('')}
        </div>
        ${send?`<div style="font-size:10.5px;color:var(--amber);margin-top:4px">идёт отправка…</div>`:''}
        ${bad?`<div style="font-size:10.5px;color:var(--rose);margin-top:4px">${bad} партнёр(а) с ошибкой — откройте карточку</div>`:''}
      </div>
      <div style="text-align:right;font-size:11px;color:var(--faint)">${ok}/${r.partners.length}<br>площадок</div>
    </div>`;
  }).join('');
}
function pubRefreshRows(){
  const el=document.getElementById('pub-rows');
  if(el)el.innerHTML=pubRowsHtml();
  const c=document.getElementById('pub-count');
  if(c)c.textContent=pubFiltered().length;
}
function mPubList(){
  pubStyle();
  const st=pubListState();
  const kinds=pubRoleKinds();
  const views=db.savedViews||[];
  const totalViews=pubMine().reduce((a,b)=>a+b.views,0);
  const totalResp=pubMine().reduce((a,b)=>a+b.responses,0);
  return `<div class="card">
    <div class="kpis"><div class="kpi"><b id="pub-count">${pubFiltered().length}</b><span>ПУБЛИКАЦИЙ</span></div>
    <div class="kpi"><b>${totalViews}</b><span>ПРОСМОТРОВ</span></div>
    <div class="kpi"><b>${totalResp}</b><span>ОТКЛИКОВ</span></div></div>
  </div>
  <div class="card">
    <div class="pub-tools">
      <input class="input" style="flex:2;min-width:140px" placeholder="🔍 Поиск по названию, городу, навыкам" value="${esc(st.q)}" oninput="pubListState().q=this.value;pubRefreshRows()">
      <select class="input" style="flex:1" onchange="pubListState().sort=this.value;renderModule()">
        <option value="new" ${st.sort==='new'?'selected':''}>Сначала новые</option>
        <option value="views" ${st.sort==='views'?'selected':''}>По просмотрам</option>
        <option value="resp" ${st.sort==='resp'?'selected':''}>По откликам</option>
        <option value="title" ${st.sort==='title'?'selected':''}>По названию</option>
      </select>
      <select class="input" style="flex:1" onchange="pubListState().status=this.value;renderModule()">
        <option value="all" ${st.status==='all'?'selected':''}>Все статусы</option>
        <option value="active" ${st.status==='active'?'selected':''}>Активные</option>
        <option value="paused" ${st.status==='paused'?'selected':''}>На паузе</option>
      </select>
    </div>
    <div class="chips">
      <button class="chip ${st.kind==='all'?'on':''}" onclick="pubListState().kind='all';renderModule()">Все</button>
      ${kinds.map(k=>`<button class="chip ${st.kind===k?'on':''}" onclick="pubListState().kind='${k}';renderModule()">${PUB_KIND[k].icon} ${PUB_KIND[k].label}</button>`).join('')}
    </div>
    <div class="pub-tools" style="margin-top:10px">
      <select class="input" style="flex:1" onchange="if(this.value)pubLoadView(this.value)">
        <option value="">💾 Сохранённые виды…</option>
        ${views.map(v=>`<option value="${v.id}">${esc(v.name)}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-ghost" onclick="pubSaveView()">Сохранить вид</button>
      ${views.length?`<button class="btn btn-sm btn-ghost" onclick="pubDelView()">Удалить вид</button>`:''}
    </div>
    <div style="font-size:11px;color:var(--faint)">Перетаскивайте строки, чтобы менять порядок. Клик по строке — карточка публикации.</div>
  </div>
  <div class="card" id="pub-rows">${pubRowsHtml()}</div>`;
}
function pubSel(id,on){
  const st=pubListState();
  st.sel=on?[...new Set([...st.sel,id])]:st.sel.filter(x=>x!==id);
  pubRefreshRows();
}
let pubDragId=null;
function pubDrag(e,id){pubDragId=id;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',id)}catch(err){} e.currentTarget.classList.add('dragging')}
function pubDrop(e,id){
  e.preventDefault();
  const from=pubDragId||(()=>{try{return e.dataTransfer.getData('text/plain')}catch(err){return null}})();
  pubDragId=null;
  if(!from||from===id)return;
  const a=db.publications.findIndex(p=>p.id===from);
  const b=db.publications.findIndex(p=>p.id===id);
  if(a<0||b<0)return;
  const [rec]=db.publications.splice(a,1);
  db.publications.splice(b,0,rec);
  save();pubRefreshRows();toast('Порядок публикаций обновлён');
}
let pubTrash=null;
function pubDelete(id){
  const i=db.publications.findIndex(p=>p.id===id);if(i<0)return;
  pubTrash={items:[{rec:db.publications[i],index:i}]};
  db.publications.splice(i,1);
  pubListState().sel=pubListState().sel.filter(x=>x!==id);
  save();closeLayers();renderModule();
  pubSnack('Публикация удалена','Вернуть',pubUndo);
}
function pubDeleteSel(){
  const st=pubListState();
  const items=st.sel.map(id=>({rec:pubFind(id),index:db.publications.findIndex(p=>p.id===id)})).filter(x=>x.rec).sort((a,b)=>a.index-b.index);
  if(!items.length)return;
  pubTrash={items};
  [...items].sort((a,b)=>b.index-a.index).forEach(x=>db.publications.splice(x.index,1));
  st.sel=[];save();renderModule();
  pubSnack('Удалено публикаций: '+items.length,'Вернуть',pubUndo);
}
function pubUndo(){
  if(!pubTrash)return;
  pubTrash.items.forEach(({rec,index})=>db.publications.splice(Math.min(index,db.publications.length),0,rec));
  pubTrash=null;save();renderModule();toast('Публикации восстановлены');
}
function pubSaveView(){
  const st=pubListState();
  const name=prompt('Название сохранённого вида:','Мой фильтр');
  if(!name)return;
  db.savedViews.push({id:uid(),name,q:st.q,kind:st.kind,status:st.status,sort:st.sort});
  save();renderModule();toast('Вид сохранён: '+name);
}
function pubLoadView(id){
  const v=(db.savedViews||[]).find(x=>x.id===id);if(!v)return;
  Object.assign(pubListState(),{q:v.q,kind:v.kind,status:v.status,sort:v.sort,sel:[]});
  renderModule();toast('Вид применён: '+v.name);
}
function pubDelView(){
  const st=pubListState();
  const name=prompt('Название вида для удаления:',(db.savedViews[0]||{}).name||'');
  const i=(db.savedViews||[]).findIndex(x=>x.name===name);
  if(i<0){toast('Вид не найден');return}
  db.savedViews.splice(i,1);save();renderModule();toast('Вид удалён');
}
function pubMove(id,dir){
  const i=db.publications.findIndex(p=>p.id===id);
  const j=i+dir;
  if(i<0||j<0||j>=db.publications.length)return;
  const [r]=db.publications.splice(i,1);db.publications.splice(j,0,r);
  save();pubRefreshRows();
  if(document.getElementById('pub-drawer-'+id))pubOpenDrawer(id);
}
function pubPause(id){
  const r=pubFind(id);if(!r)return;
  r.status=r.status==='active'?'paused':'active';
  save();pubRefreshRows();
  if(document.getElementById('pub-drawer-'+id))pubOpenDrawer(id);
  toast(r.status==='active'?'Публикация снова активна':'Публикация поставлена на паузу');
}
function pubStats(id){
  const r=pubFind(id);if(!r)return;
  r.views+=3+Math.floor(Math.random()*22);
  if(Math.random()<0.45)r.responses+=1;
  save();pubRefreshRows();pubOpenDrawer(id);
  toast('Статистика обновлена (демо-поток площадки)');
}
function pubCopyLink(id){
  const r=pubFind(id);if(!r)return;
  const sib=r.partners.find(p=>p.id==='sib');
  const url=(sib&&sib.url)||location.href.split('#')[0]+'#pub-'+id;
  const full=url.startsWith('#')?location.href.split('#')[0]+url:url;
  if(navigator.clipboard)navigator.clipboard.writeText(full).then(()=>toast('Ссылка скопирована')).catch(()=>prompt('Ссылка:',full));
  else prompt('Ссылка:',full);
}

/* ---------- КАРТОЧКА ПУБЛИКАЦИИ ---------- */
function pubOpenDrawer(id){
  const r=pubFind(id);if(!r)return;
  const k=PUB_KIND[r.kind];
  const moneyLine=r.kind==='service'?('Бюджет: '+money(r.budget||0)):('Зарплата: '+money(r.salary||0));
  openDrawer(`<div id="pub-drawer-${r.id}">
    <div class="card-title">${k.icon} ${k.label} · ${r.status==='active'?'<span class="pill p-ok">активна</span>':'<span class="pill p-dim">пауза</span>'}</div>
    <h3 style="margin:6px 0">${esc(r.title)}</h3>
    <div class="pub-meta">
      <div><b>ГОРОД</b>${esc(r.city)}</div>
      <div><b>ДЕНЬГИ</b>${moneyLine}</div>
      <div><b>ПРОСМОТРЫ</b>${r.views}</div>
      <div><b>ОТКЛИКИ</b>${r.responses}</div>
      ${r.kind==='service'?`<div><b>КАТЕГОРИЯ</b>${esc(r.category||'')}</div><div><b>СРОК</b>${r.deadline?fdate(r.deadline):'не задан'}</div>`:''}
      ${r.kind!=='service'?`<div><b>ОПЫТ</b>${r.kind==='resume'?(r.exp||0)+' лет':'от '+(r.exp_min||0)+' лет'}</div><div><b>ГРАФИК</b>${esc(r.schedule||'')}</div>`:''}
    </div>
    ${r.skills?`<div class="chips">${skillArr(r.skills).map(s=>`<span class="chip on">${esc(s)}</span>`).join('')}</div>`:''}
    ${r.descr?`<p style="font-size:13px;color:var(--dim);line-height:1.6;margin-top:10px">${esc(r.descr)}</p>`:''}
    <div class="card-title" style="margin-top:14px">Площадки размещения</div>
    ${r.partners.map(p=>`<div class="pub-prow">
      <span class="pub-dot ${p.status}" style="background:${PUB_STATUS[p.status].c}"></span>
      <span style="flex:1">${esc(p.name)}<br><span style="font-size:10.5px;color:var(--faint)">${PUB_STATUS[p.status].t}${p.at?' · '+fdate(p.at):''}${p.err?' · '+esc(p.err):''}</span></span>
      ${p.status==='ok'&&p.url?`<a href="${esc(p.url)}" target="_blank" rel="noopener">открыть ↗</a>`:''}
      ${p.status==='error'?`<button class="btn btn-sm btn-ghost" onclick="pubRetry('${r.id}','${p.id}')">Повторить</button>`:''}
      ${p.status==='sending'?`<span style="font-size:10.5px;color:var(--amber)">отправка…</span>`:''}
    </div>`).join('')}
    <div class="btn-row" style="margin-top:16px">
      <button class="btn btn-sm btn-primary" onclick="pubEdit('${r.id}')">✏️ Редактировать</button>
      <button class="btn btn-sm btn-ghost" onclick="pubPause('${r.id}')">${r.status==='active'?'⏸ Пауза':'▶️ Возобновить'}</button>
      <button class="btn btn-sm btn-ghost" onclick="pubStats('${r.id}')">📊 Статистика</button>
    </div>
    <div class="btn-row" style="margin-top:8px">
      <button class="btn btn-sm btn-ghost" onclick="pubCopyLink('${r.id}')">🔗 Ссылка</button>
      <button class="btn btn-sm btn-ghost" onclick="pubMove('${r.id}',-1)">↑ Выше</button>
      <button class="btn btn-sm btn-ghost" onclick="pubMove('${r.id}',1)">↓ Ниже</button>
      <button class="btn btn-sm btn-ghost" style="color:var(--rose)" onclick="pubDelete('${r.id}')">🗑 Удалить</button>
    </div>
  </div>`);
}

/* ---------- МОДУЛЬ: БАЗА ДАННЫХ ---------- */
function mDatabase(){
  const c=SB.cfg,ok=SB.on();
  const cs=(db.cloudSeekers||[]).length,cv=(db.cloudVacancies||[]).length;
  return `<div class="card">
    <div class="card-title">Подключение Supabase</div>
    <div class="demo-note">Демо-политики RLS открыты для anon-ключа. Перед реальным запуском — авторизация и строгие политики по auth.uid().</div>
    <label class="lbl">Project URL</label>
    <input class="input" id="sb-url" value="${esc(c.url)}" placeholder="https://xxxx.supabase.co">
    <label class="lbl">anon public key</label>
    <textarea class="input" id="sb-key" placeholder="eyJhbGciOi... или sb_publishable_...">${esc(c.key)}</textarea>
    <div class="btn-row"><button class="btn btn-sm btn-primary" onclick="sbSave()">💾 Сохранить</button>
    <button class="btn btn-sm btn-ghost" onclick="sbTest()">🔌 Проверить связь</button></div>
    <div style="margin-top:12px;font-size:13px">${ok?'<span class="pill p-ok">Ключ сохранён</span>':'<span class="pill p-dim">Не подключено</span>'}
    ${db.sbSync?`<span style="color:var(--faint);font-size:11.5px;margin-left:8px">синхр. ${fdate(db.sbSync)}</span>`:''}</div>
  </div>
  <div class="card"><div class="card-title">Схема базы</div>
    <button class="btn btn-primary" onclick="sbCopySql()">📋 Скопировать SQL для Supabase</button>
    <button class="btn btn-ghost" onclick="sbShowSql()">👁 Показать SQL</button>
    <div style="font-size:12px;color:var(--faint);line-height:1.6">Supabase → SQL Editor → New query → вставить → Run. Создаст seekers, vacancies, applications, resumes, services (для заявок на услугу) и политики.</div>
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
      avatar_url:p.avatar_url||null};
    const cands=db.candidates.map(c=>({id:'c_'+c.id,name:c.name,city:c.city,lat:c.lat,lng:c.lng,radius_km:c.radius_km,
      skills:c.skills.join(', '),exp_years:c.exp,salary_min:c.salary_min,availability:c.availability,rating:c.rating,about:c.role,
      avatar_url:c.avatar_url||null}));
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
  const avatarTargetId=isCo?'company':db.profile.sid;
  const avatarTargetType=isCo?'company':'seeker';
  const currentAvatarUrl=isCo?db.company.avatar_url:db.profile.avatar_url;
  const avatarDisplay=isCo?db.company.name:db.profile.name;
  const avatarSection=`<div style="text-align:center;margin-bottom:16px">
    <div style="cursor:pointer;display:inline-block" onclick="triggerAvatarUpload('${avatarTargetId}','${avatarTargetType}')">
      ${avatarHtml(currentAvatarUrl,avatarDisplay,80)}
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
    if(!vacs.length)return head+'<div class="empty">Нет вакансий. Разместите первую в разделе «Публикация».</div>';
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

/* ---------- ПАНЕЛЬ ПУБЛИКАЦИИ НА ГЛАВНОМ ЭКРАНЕ ---------- */
function pubHomePanel(role){
  const mine=pubMine();
  const active=mine.filter(p=>p.status==='active').length;
  const views=mine.reduce((a,b)=>a+b.views,0);
  const isCo=role==='company';
  const partners=isCo?PUB_PARTNERS.job:PUB_PARTNERS.job;
  const mainBtn=isCo
    ?`<button class="btn btn-primary" onclick="pubOpen('pub-vacancy')">🎯 Разместить вакансию<span class="sub">Сибиряк · Работа.ру · hh.ru · Зарплата.ру</span></button>`
    :`<button class="btn btn-primary" onclick="pubOpen('pub-resume')">📄 Разместить резюме<span class="sub">Сибиряк · Работа.ру · hh.ru · Зарплата.ру</span></button>`;
  return `<div class="card pub-panel" style="grid-column:1/-1;padding:16px">
    <div class="pub-head"><div><div class="pub-title">📤 Публикация</div>
    <div class="pub-sub">Одно размещение — все площадки сразу</div></div>
    <span class="pill p-ok">${active} активных</span></div>
    <div class="pub-btns">${mainBtn}
    <button class="btn" onclick="pubOpen('pub-service')">🛠 Заявка на услугу<span class="sub">Авито Услуги · Профи.ру · YouDo · Яндекс Услуги</span></button></div>
    <div class="pub-partners">${partners.map(p=>`<span class="pub-pchip"><span class="pub-dot ok" style="background:var(--pine,#3ddc97)"></span>${esc(p.name)}</span>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
      <span style="font-size:11.5px;color:var(--faint)">👁 ${views} просмотров · ✉️ ${mine.reduce((a,b)=>a+b.responses,0)} откликов</span>
      <button class="btn btn-sm btn-ghost" onclick="openModule('pub-list')">Мои публикации →</button>
    </div>
  </div>`;
}
function pubInjectHome(role,el){
  if(!el)return;
  const clickables=[...el.querySelectorAll('[onclick]')];
  let anchor=null;
  if(role==='seeker'){
    anchor=clickables.find(c=>/Мои заявки/.test(c.textContent));
    const compose=clickables.find(c=>/Составить резюме/.test(c.textContent));
    if(compose){
      [...compose.querySelectorAll('*')].forEach(n=>{
        if(n.children.length===0&&/Составить резюме/.test(n.textContent))n.textContent='Мои резюме';
        if(n.children.length===0&&/Конструктор/.test(n.textContent))n.textContent='Публикации · партнёры · отклики';
      });
      compose.setAttribute('onclick',"openModule('pub-list')");
    }
  }else{
    anchor=clickables.find(c=>/ваканс|потребност/i.test(c.textContent))||clickables.find(c=>/кандидат/i.test(c.textContent));
  }
  const panel=pubHomePanel(role);
  if(anchor&&anchor.parentElement){anchor.insertAdjacentHTML('afterend',panel)}
  else{el.insertAdjacentHTML('beforeend',panel)}
}

/* ---------- ВСТРАИВАНИЕ В ПРИЛОЖЕНИЕ ---------- */
MOD.seeker.splice(1,0,{g:'Автоподбор',items:[
  {key:'automatch',icon:'🎯',title:'Автоподбор вакансий',sub:'Гео · статус · навыки · деньги',badge:amBadge},
  {key:'geostatus',icon:'📍',title:'География и статус',sub:'Свободен / занят, радиус',badge:()=>null}]});
MOD.seeker.splice(2,0,{g:'Публикация',items:[
  {key:'pub-resume',icon:'📤',title:'Разместить резюме',sub:'Сибиряк + партнёрские площадки',badge:()=>null},
  {key:'pub-service',icon:'🛠',title:'Заявка на услугу',sub:'Авито · Профи.ру · YouDo',badge:()=>null},
  {key:'pub-list',icon:'🗂',title:'Мои публикации',sub:'Статусы · партнёры · отклики',badge:pubBadge}]});
MOD.seeker.push({g:'Данные',items:[{key:'database',icon:'🗄️',title:'База данных',sub:'Supabase · синхронизация',badge:()=>SB.on()?'ON':null}]});
MOD.company.splice(1,0,{g:'Автоподбор',items:[
  {key:'automatch',icon:'🎯',title:'Автоподбор соискателей',sub:'Гео · статус · навыки · деньги',badge:amBadge},
  {key:'geostatus',icon:'📍',title:'География компании',sub:'Город и радиус поиска',badge:()=>null}]});
MOD.company.splice(2,0,{g:'Публикация',items:[
  {key:'pub-vacancy',icon:'📤',title:'Разместить вакансию',sub:'Сибиряк + партнёрские площадки',badge:()=>null},
  {key:'pub-service',icon:'🛠',title:'Заявка на услугу',sub:'Авито · Профи.ру · YouDo',badge:()=>null},
  {key:'pub-list',icon:'🗂',title:'Мои публикации',sub:'Статусы · партнёры · отклики',badge:pubBadge}]});
MOD.company.push({g:'Данные',items:[{key:'database',icon:'🗄️',title:'База данных',sub:'Supabase · синхронизация',badge:()=>SB.on()?'ON':null}]});

const _modTitle=modTitle;
modTitle=function(k){
  if(k==='automatch')return db.profile.role==='company'?'Автоподбор соискателей':'Автоподбор вакансий';
  if(k==='geostatus')return db.profile.role==='company'?'География компании':'География и статус';
  if(k==='database')return 'База данных';
  if(k==='pub-resume')return 'Разместить резюме';
  if(k==='pub-vacancy')return 'Разместить вакансию';
  if(k==='pub-service')return 'Заявка на услугу';
  if(k==='pub-list')return 'Мои публикации';
  return _modTitle(k);
};
const _renderModule=renderModule;
renderModule=function(){
  const extra={database:mDatabase,geostatus:mGeoStatus,automatch:mAutoMatch,
    'pub-resume':mPubResume,'pub-vacancy':mPubVacancy,'pub-service':mPubService,'pub-list':mPubList};
  if(extra[curMod]){
    pubStyle();
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
  pubInjectHome(role,el);
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