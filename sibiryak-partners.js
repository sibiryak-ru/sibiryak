/* ============================================================
   СИБИРЯК · ПАРТНЁРЫ v1.0 (слой sibiryak-partners.js)
   Регистрация сервисных компаний: медицина, образование, право,
   красота, ремонт, финансы, ЖКХ, транспорт и любые услуги.
   Платформа возможностей работает для всех.
   ============================================================ */

/* ---------- ПАЛИТРА И СТИЛИ ---------- */
function ptStyle(){
  if(document.getElementById('pt-style'))return;
  const s=document.createElement('style');
  s.id='pt-style';
  s.textContent=`
  #module-body::-webkit-scrollbar,.drawer::-webkit-scrollbar{width:9px;height:9px}
  #module-body::-webkit-scrollbar-track,.drawer::-webkit-scrollbar-track{background:var(--bg1,#0b1220)}
  #module-body::-webkit-scrollbar-thumb,.drawer::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#14b8a6,#0e7490);border-radius:9px;border:2px solid var(--bg1,#0b1220)}
  #module-body::-webkit-scrollbar-thumb:hover,.drawer::-webkit-scrollbar-thumb:hover{background:#2dd4bf}
  .pt-brand{--pt1:#14b8a6;--pt2:#0e7490;--pt3:#2dd4bf;--ptpro:#f59e0b;--ptbad:#f43f5e;--ptok:#22c55e;--ptinfo:#38bdf8}
  .pt-hero{border:1px solid rgba(45,212,191,.35);border-radius:18px;padding:16px;margin-bottom:12px;
    background:radial-gradient(120% 140% at 0% 0%,rgba(20,184,166,.22),transparent 55%),
               radial-gradient(120% 140% at 100% 100%,rgba(14,116,144,.25),transparent 55%),
               linear-gradient(160deg,var(--bg2,#101a2c),var(--bg1,#0b1220))}
  .pt-hero h3{margin:0 0 6px;font-size:17px;color:#5eead4;letter-spacing:.2px}
  .pt-hero p{margin:0;font-size:12.5px;line-height:1.65;color:var(--dim,#cfe9ff)}
  .pt-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
  .pt-chip{font-size:10.5px;padding:3px 9px;border-radius:999px;border:1px solid rgba(45,212,191,.4);color:#99f6e4;background:rgba(20,184,166,.08)}
  .pt-strip{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px;border-radius:16px;margin-bottom:12px;
    border:1px solid rgba(45,212,191,.3);background:linear-gradient(150deg,rgba(20,184,166,.12),var(--bg2,#101a2c))}
  .pt-card{border:1px solid var(--line2,#22304a);border-radius:14px;padding:12px;margin-bottom:10px;background:rgba(255,255,255,.02)}
  .pt-card:hover{border-color:rgba(45,212,191,.45)}
  .pt-t{font-size:14px;font-weight:800;color:var(--dim,#e6f2ff)}
  .pt-s{font-size:11.5px;color:var(--faint,#7d8ca3);margin-top:3px;line-height:1.55}
  .pt-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}
  .pt-badge{font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;letter-spacing:.3px}
  .pt-ok{background:rgba(34,197,94,.14);color:#4ade80;border:1px solid rgba(34,197,94,.4)}
  .pt-wait{background:rgba(56,189,248,.12);color:#7dd3fc;border:1px solid rgba(56,189,248,.4)}
  .pt-bad{background:rgba(244,63,94,.12);color:#fb7185;border:1px solid rgba(244,63,94,.4)}
  .pt-pro{background:rgba(245,158,11,.14);color:#fbbf24;border:1px solid rgba(245,158,11,.45)}
  .pt-draft{background:rgba(148,163,184,.12);color:#94a3b8;border:1px solid rgba(148,163,184,.35)}
  .pt-price{font-size:15px;font-weight:800;color:#2dd4bf}
  .pt-check{display:flex;gap:8px;align-items:flex-start;font-size:12px;padding:6px 0;border-bottom:1px dashed var(--line2,#22304a);color:var(--dim,#cfe9ff)}
  .pt-check:last-child{border-bottom:none}
  .pt-check i{font-style:normal;flex:none}
  .pt-prog{height:9px;border-radius:999px;background:var(--bg1,#0b1220);border:1px solid var(--line2,#22304a);overflow:hidden;margin:8px 0}
  .pt-prog i{display:block;height:100%;background:linear-gradient(90deg,#0e7490,#2dd4bf)}
  .pt-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 10px;margin-bottom:8px;border-radius:12px;
    background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.35);font-size:12px;color:#fbbf24}
  .pt-svc{display:flex;gap:10px;align-items:center;padding:10px;border-bottom:1px solid var(--line2,#22304a);cursor:grab}
  .pt-svc:last-child{border-bottom:none}
  .pt-svc.dragging{opacity:.35}
  .pt-svc .cb{accent-color:#2dd4bf}
  .pt-msg{max-width:84%;border-radius:14px;padding:8px 12px;font-size:13px;line-height:1.5;margin-bottom:8px}
  .pt-msg.me{margin-left:auto;background:#2dd4bf;color:#04211c}
  .pt-msg.them{background:var(--bg2,#101a2c);border:1px solid var(--line2,#22304a);color:var(--dim,#cfe9ff)}
  .pt-msg small{display:block;font-size:9.5px;opacity:.65;margin-top:3px}
  .pt-chat{max-height:40vh;overflow-y:auto;padding:4px 2px;margin:10px 0}
  .pt-cta{border:1px solid rgba(45,212,191,.4);border-radius:18px;padding:16px;margin:14px auto;max-width:520px;
    background:radial-gradient(100% 120% at 100% 0%,rgba(20,184,166,.2),transparent 60%),var(--bg2,#101a2c)}
  .pt-cta h3{margin:0 0 6px;color:#5eead4;font-size:16px}
  .pt-cta p{margin:0 0 12px;font-size:12.5px;color:var(--dim,#cfe9ff);line-height:1.6}
  #pt-snack{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:9999;display:flex;gap:12px;align-items:center;
    background:var(--bg2,#101a2c);border:1px solid rgba(45,212,191,.4);border-radius:14px;padding:10px 14px;
    box-shadow:0 12px 40px rgba(0,0,0,.55);color:var(--dim,#cfe9ff);font-size:13px;max-width:92vw}
  #pt-snack button{background:#2dd4bf;color:#04211c;border:none;border-radius:9px;padding:6px 12px;font-weight:800;font-size:12px;cursor:pointer}
  .pt-err{border-color:#f43f5e!important}
  .pt-plan{border:1px solid var(--line2,#22304a);border-radius:14px;padding:12px;flex:1;min-width:150px}
  .pt-plan.on{border-color:rgba(245,158,11,.5);background:rgba(245,158,11,.06)}
  .pt-plan b{display:block;font-size:14px;color:var(--dim,#e6f2ff)}
  .pt-plan span{font-size:11px;color:var(--faint,#7d8ca3);line-height:1.6;display:block;margin-top:4px}
  `;
  document.head.appendChild(s);
}

/* ---------- КАТЕГОРИИ И ТРЕБОВАНИЯ ---------- */
const PT_CATS=[
  {id:'med',icon:'🏥',name:'Медицина и здоровье',lic:'Лицензия на медицинскую деятельность'},
  {id:'edu',icon:'🎓',name:'Образование и курсы',lic:'Лицензия на образовательную деятельность'},
  {id:'law',icon:'⚖️',name:'Юридические услуги',lic:'Реестровый номер адвоката / ОГРН юрбюро'},
  {id:'fin',icon:'🏦',name:'Финансы и страхование',lic:'Лицензия ЦБ / реестр страховщиков'},
  {id:'beauty',icon:'💇',name:'Красота и уход',lic:null},
  {id:'repair',icon:'🔧',name:'Ремонт и сервис техники',lic:null},
  {id:'home',icon:'🏠',name:'ЖКХ, жильё и быт',lic:null},
  {id:'transport',icon:'🚚',name:'Транспорт и логистика',lic:null},
  {id:'sport',icon:'🏋️',name:'Спорт и досуг',lic:null},
  {id:'other',icon:'🧩',name:'Другие услуги',lic:null}
];
const PT_ORG=['ООО','ИП','Самозанятый','НКО','АО'];
const PT_ST={draft:['Черновик','pt-draft'],checking:['На проверке','pt-wait'],verified:['Проверен','pt-ok'],rejected:['Отклонён','pt-bad']};
function ptCat(id){return PT_CATS.find(c=>c.id===id)||PT_CATS[PT_CATS.length-1]}
function ptMe(){return db.partners.find(p=>p.id===db.partnerMe)||null}
function ptFind(id){return db.partners.find(p=>p.id===id)}
function ptRating(p){return p.reviews&&p.reviews.length?(p.reviews.reduce((a,r)=>a+r.stars,0)/p.reviews.length):0}
function ptNotify(text){
  if(typeof ecoNotify==='function')ecoNotify(ecoRole()==='company'?'company':'seeker',text);
  else toast(text);
}

/* ---------- ИНН: НАСТОЯЩАЯ КОНТРОЛЬНАЯ СУММА ---------- */
function ptInnValid(inn){
  const s=String(inn||'').replace(/\D/g,'');
  const d=s.split('').map(Number);
  const ctrl=(w)=>w.reduce((a,k,i)=>a+k*d[i],0)%11%10;
  if(s.length===10)return ctrl([2,4,10,3,5,9,4,6,8])===d[9];
  if(s.length===12)return ctrl([7,2,4,10,3,5,9,4,6,8])===d[10]&&ctrl([3,7,2,4,10,3,5,9,4,6,8])===d[11];
  return false;
}
function ptGenInn(region){
  const base=String(region||'22')+String(Math.floor(Math.random()*1e7)).padStart(7,'0');
  const d=base.split('').map(Number);
  const c=[2,4,10,3,5,9,4,6,8].reduce((a,k,i)=>a+k*d[i],0)%11%10;
  return base+String(c);
}
function ptChecks(p){
  const cat=ptCat(p.category);
  const out=[];
  out.push({ok:ptInnValid(p.inn),t:'ИНН проходит контрольную сумму ФНС',v:p.inn||'не указан'});
  out.push({ok:/^\d{13}$|^\d{15}$/.test(String(p.ogrn||'')),t:'ОГРН/ОГРНИП корректной длины',v:p.ogrn||'не указан'});
  out.push({ok:!cat.lic||!!(p.license&&p.license.trim()),t:cat.lic?('Указан номер: '+cat.lic):'Лицензия не требуется для категории',v:p.license||'—'});
  out.push({ok:(p.docs||[]).length>=1,t:'Загружен подтверждающий документ',v:(p.docs||[]).length+' файл(ов)'});
  out.push({ok:!!p.consent,t:'Согласие на обработку данных (152-ФЗ)',v:p.consent?'получено':'нет'});
  out.push({ok:/^\+?\d[\d\s\-()]{9,}$/.test(String(p.phone||'')),t:'Контактный телефон корректен',v:p.phone||'не указан'});
  out.push({ok:(p.services||[]).length>=1&&(p.services||[]).every(s=>s.title&&+s.price>0),t:'Прайс: минимум одна услуга с ценой',v:(p.services||[]).length+' поз.'});
  return out;
}
function ptScore(p){const c=ptChecks(p);return Math.round(c.filter(x=>x.ok).length/c.length*100)}

/* ---------- СИД ---------- */
function ptMigrate(){
  if(!db.partners){
    const mk=(id,category,name,city,extra)=>Object.assign({
      id,owner:false,category,name,city,org:'ООО',inn:ptGenInn('22'),ogrn:'1'+String(Math.floor(Math.random()*1e12)).padStart(12,'0'),
      license:'',phone:'+7 3852 00-00-00',site:'',about:'',radius:60,plan:'free',status:'verified',consent:true,
      docs:[{name:'license.pdf',url:null,local:true}],services:[],reviews:[],rejectReasons:[],createdAt:dAgo(40)
    },extra||{});
    db.partners=[
      mk('p1','med','Клиника «Здоровье Алтая»','Барнаул',{license:'ЛО-22-01-002145',phone:'+7 3852 55-10-10',site:'zdorov-altay.ru',about:'Терапия, диагностика, медосмотры для водителей и вахты. Выездная бригада на объекты.',plan:'pro',
        services:[{id:'s1',title:'Медосмотр для водителей (справка)',price:1500,unit:'чел.'},{id:'s2',title:'Приём терапевта',price:1200,unit:'приём'},{id:'s3',title:'УЗИ-диагностика',price:1800,unit:'иссл.'}],
        reviews:[{author:'Николай Смирнов',stars:5,text:'Справку для работы сделал за 20 минут, без очередей.',date:dAgo(6)},{author:'Склад «Южный»',stars:5,text:'Выездная бригада закрыла медосмотр всей смены.',date:dAgo(12)}]}),
      mk('p2','edu','Учебный центр «Профи»','Барнаул',{license:'ЛО-22-02-001380',phone:'+7 3852 55-20-20',site:'uc-profi.ru',about:'Профобучение под спрос работодателей: погрузчик, сварщик, оператор ЧПУ. Гарантия смен после выпуска.',plan:'pro',
        services:[{id:'s1',title:'Водитель погрузчика (160 ч)',price:9000,unit:'курс'},{id:'s2',title:'Сварщик НАКС (240 ч)',price:18000,unit:'курс'},{id:'s3',title:'Охрана труда (40 ч)',price:2500,unit:'курс'}],
        reviews:[{author:'Игорь Мельник',stars:5,text:'Отучился на погрузчика — сразу дали смены на складе.',date:dAgo(9)}]}),
      mk('p3','law','Юрбюро «Право и Дело»','Барнаул',{license:'Реестр № 22/1147',phone:'+7 3852 55-30-30',site:'pravo-delo.ru',about:'Трудовые споры, задержка зарплаты, алименты, защита соискателей и работников. Первая консультация бесплатно.',
        services:[{id:'s1',title:'Консультация по трудовому спору',price:0,unit:'встреча'},{id:'s2',title:'Претензия работодателю',price:2500,unit:'док.'},{id:'s3',title:'Иск в суд под ключ',price:12000,unit:'дело'}],
        reviews:[{author:'Марина Соколова',stars:5,text:'Вернули задержанную зарплату за три недели.',date:dAgo(15)}]}),
      mk('p4','fin','Страховой брокер «Гарант»','Барнаул',{license:'Реестр ЦБ № 7712',phone:'+7 3852 55-40-40',about:'ОСАГО, НС для работников на смену, ипотечное страхование. Оформление за 10 минут.',
        services:[{id:'s1',title:'Полис НС на смену',price:350,unit:'смена'},{id:'s2',title:'ОСАГО',price:5200,unit:'год'}],
        reviews:[{author:'Павел Штерн',stars:4,text:'Полис на смену оформили прямо в приложении.',date:dAgo(4)}]}),
      mk('p5','repair','СТО «Мотор»','Барнаул',{phone:'+7 3852 55-50-50',about:'Ремонт коммерческого транспорта и личных авто, диагностика, выездной механик.',
        services:[{id:'s1',title:'Диагностика подвески',price:1500,unit:'авто'},{id:'s2',title:'Ремонт ДВС',price:25000,unit:'агрегат'}],
        reviews:[{author:'Николай Смирнов',stars:5,text:'Prado 120 подняли за выходные, цена как договаривались.',date:dAgo(20)}]}),
      mk('p6','home','УК «Дом Сервис»','Новоалтайск',{phone:'+7 3853 22-11-00',about:'Сантехника, электрика, уборка подъездов и квартир, аварийная бригада 24/7.',
        services:[{id:'s1',title:'Аварийный выезд сантехника',price:1200,unit:'выезд'},{id:'s2',title:'Генеральная уборка квартиры',price:3500,unit:'квартира'}],
        reviews:[{author:'Ольга Крамер',stars:4,text:'Приехали через час после заявки ночью.',date:dAgo(3)}]}),
      mk('p7','beauty','Студия «Образ»','Барнаул',{phone:'+7 900 111-22-33',about:'Стрижки и уход рядом с домом, запись без звонка.',
        services:[{id:'s1',title:'Мужская стрижка',price:600,unit:'визит'}],reviews:[]}),
      mk('p8','med','Лаборатория «Тест-Алтай»','Бийск',{license:'ЛО-22-01-003311',status:'checking',docs:[],consent:true,
        services:[{id:'s1',title:'Анализы крови (комплекс)',price:2100,unit:'комплекс'}],reviews:[]}),
      mk('p9','edu','Онлайн-школа «Код Сибири»','Новосибирск',{license:'',status:'rejected',docs:[],consent:false,
        rejectReasons:['Не указана лицензия на образовательную деятельность','Нет согласия на обработку данных'],
        services:[{id:'s1',title:'Курс веб-разработки',price:24000,unit:'курс'}],reviews:[]}),
      {id:'p_me',owner:true,category:'edu',name:'Учебный центр «Сибиряк Навык»',city:db.profile.city||'Барнаул',org:'ИП',
        inn:ptGenInn('22'),ogrn:'3'+String(Math.floor(Math.random()*1e14)).padStart(14,'0'),license:'',phone:db.profile.phone||'+7 900 000-00-01',
        site:'',about:'Обучаем профессиям под реальные заявки работодателей платформы.',radius:80,plan:'free',status:'draft',consent:false,
        docs:[],services:[{id:'s1',title:'Курьер на авто (быстрый старт)',price:1500,unit:'курс'},{id:'s2',title:'Комплектовщик склада (80 ч)',price:4500,unit:'курс'}],
        reviews:[],rejectReasons:[],createdAt:dAgo(2)}
    ];
  }
  if(!db.partnerMe)db.partnerMe='p_me';
  if(!db.partnerLeads){
    db.partnerLeads=[
      {id:'l1',partnerId:'p_me',service:'Комплектовщик склада (80 ч)',client:'Анна Вебер',phone:'+7 900 222-33-44',budget:4500,comment:'Хочу выйти на смены склада после курса.',status:'new',createdAt:dAgo(0),msgs:[]},
      {id:'l2',partnerId:'p_me',service:'Курьер на авто (быстрый старт)',client:'Сергей Батурин',phone:'+7 900 333-44-55',budget:1500,comment:'Есть авто, нужна подработка evenings.',status:'accepted',createdAt:dAgo(1),msgs:[{from:'partner',text:'Здравствуйте! Группа стартует в понедельник, место держим.',time:'10:12'}]},
      {id:'l3',partnerId:'p1',service:'Медосмотр для водителей (справка)',client:'Николай Смирнов',phone:'+7 900 000-00-01',budget:1500,comment:'Справка для допуска к рейсам.',status:'done',createdAt:dAgo(6),closedAt:dAgo(5),msgs:[]},
      {id:'l4',partnerId:'p3',service:'Претензия работодателю',client:'Дмитрий Лапин',phone:'+7 900 444-55-66',budget:2500,comment:'Задержка зарплаты 2 месяца.',status:'new',createdAt:dAgo(0),msgs:[]}
    ];
  }
  if(!db.partnerViews)db.partnerViews=[];
  if(db.ptMod===undefined)db.ptMod=false;
  if(!db.ptModLog)db.ptModLog=[];
  db.partners.forEach(p=>{p.services=p.services||[];p.reviews=p.reviews||[];p.docs=p.docs||[];p.rejectReasons=p.rejectReasons||[]});
  save();
}

/* ---------- UNDO / SNACK ---------- */
let ptTrash=null;
function ptSnack(msg,label,fn){
  const old=document.getElementById('pt-snack');if(old)old.remove();
  const d=document.createElement('div');d.id='pt-snack';
  d.innerHTML=`<span>${esc(msg)}</span>${label?`<button id="pt-snack-btn">${esc(label)}</button>`:''}`;
  document.body.appendChild(d);
  if(label)document.getElementById('pt-snack-btn').onclick=()=>{d.remove();fn&&fn()};
  setTimeout(()=>{if(d.parentNode)d.remove()},6500);
}
function ptRemove(listKey,id){
  const arr=db[listKey];const i=arr.findIndex(x=>x.id===id);if(i<0)return null;
  const rec=arr[i];arr.splice(i,1);save();return {listKey,rec,index:i};
}
function ptUndo(){
  if(!ptTrash)return;
  ptTrash.items.forEach(({listKey,rec,index})=>db[listKey].splice(Math.min(index,db[listKey].length),0,rec));
  ptTrash=null;save();renderModule();toast('Восстановлено');
}

/* ---------- СОХРАНЁННЫЕ ВИДЫ ---------- */
function ptViews(ctx){return db.partnerViews.filter(v=>v.ctx===ctx)}
function ptViewSave(ctx){
  const name=prompt('Название вида:','Мой фильтр');if(!name)return;
  db.partnerViews.push({id:uid(),ctx,name,state:JSON.parse(JSON.stringify(modState[ctx]||{}))});
  save();renderModule();toast('Вид сохранён: '+name);
}
function ptViewLoad(ctx,id){
  const v=db.partnerViews.find(x=>x.id===id);if(!v)return;
  modState[ctx]=JSON.parse(JSON.stringify(v.state));renderModule();toast('Вид применён: '+v.name);
}
function ptViewDel(ctx){
  const name=prompt('Название вида для удаления:',(ptViews(ctx)[0]||{}).name||'');
  const i=db.partnerViews.findIndex(x=>x.ctx===ctx&&x.name===name);
  if(i<0){toast('Вид не найден');return}
  db.partnerViews.splice(i,1);save();renderModule();toast('Вид удалён');
}
function ptViewsBar(ctx){
  const vs=ptViews(ctx);
  return `<div class="pt-row" style="margin:8px 0 0">
  <select class="input" style="flex:1" onchange="if(this.value)ptViewLoad('${ctx}',this.value)">
    <option value="">💾 Сохранённые виды…</option>${vs.map(v=>`<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select>
  <button class="btn btn-sm btn-ghost" onclick="ptViewSave('${ctx}')">Сохранить</button>
  ${vs.length?`<button class="btn btn-sm btn-ghost" onclick="ptViewDel('${ctx}')">Удалить</button>`:''}</div>`;
}

/* ---------- РЕГИСТРАЦИЯ ПАРТНЁРА ---------- */
let ptWiz=null;
function ptRegOpen(editId){
  ptStyle();
  const p=editId?ptFind(editId):null;
  ptWiz={step:1,editId:editId||null,data:p?JSON.parse(JSON.stringify(p)):{
    category:'med',org:'ООО',name:'',inn:'',ogrn:'',license:'',city:db.profile.city||'Барнаул',radius:60,
    phone:db.profile.phone||'',site:'',about:'',consent:false,docs:[],services:[{id:uid(),title:'',price:'',unit:'услуга'}]
  }};
  ptWizRender();
}
function ptWizRender(){
  const d=ptWiz.data,step=ptWiz.step;
  const dl=`<datalist id="pt-city-dl">${CITY_LIST.map(c=>`<option value="${esc(c)}">`).join('')}</datalist>`;
  let body='';
  if(step===1){
    body=`<div class="pt-hero"><h3>🤝 Партнёр платформы возможностей</h3>
    <p>«Сибиряк» работает для всех: клиники, школы и курсы, юрбюро, страховые, мастера, УК, спорт и любые сервисные компании. Регистрация даёт проверенный бейдж, заявки клиентов и место в каталоге.</p>
    <div class="pt-chips">${PT_CATS.map(c=>`<span class="pt-chip">${c.icon} ${esc(c.name)}</span>`).join('')}</div></div>
    <label class="lbl">Категория услуг</label>
    <select class="input" id="pt-w-cat">${PT_CATS.map(c=>`<option value="${c.id}" ${d.category===c.id?'selected':''}>${c.icon} ${esc(c.name)}</option>`).join('')}</select>
    <label class="lbl">Организационная форма</label>
    <select class="input" id="pt-w-org">${PT_ORG.map(o=>`<option ${d.org===o?'selected':''}>${esc(o)}</option>`).join('')}</select>
    <label class="lbl">Название организации / практики</label>
    <input class="input" id="pt-w-name" value="${esc(d.name)}" placeholder="Клиника «Здоровье Алтая»">
    <label class="lbl">Город</label><input class="input" id="pt-w-city" list="pt-city-dl" value="${esc(d.city)}">
    <label class="lbl">Радиус обслуживания: <b>${d.radius} км</b></label>
    <input type="range" min="10" max="300" step="10" value="${d.radius}" style="width:100%;accent-color:#2dd4bf" oninput="ptWiz.data.radius=+this.value;this.previousElementSibling.querySelector('b').textContent=this.value+' км'">`;
  }
  if(step===2){
    const cat=ptCat(d.category);
    body=`<label class="lbl">ИНН (проверяем контрольную сумму ФНС)</label>
    <input class="input" id="pt-w-inn" value="${esc(d.inn)}" placeholder="10 или 12 цифр" oninput="ptWizInnHint(this.value)">
    <div class="pt-s" id="pt-inn-hint"></div>
    <label class="lbl">ОГРН / ОГРНИП</label><input class="input" id="pt-w-ogrn" value="${esc(d.ogrn)}" placeholder="13 или 15 цифр">
    ${cat.lic?`<label class="lbl">${esc(cat.lic)}</label><input class="input" id="pt-w-license" value="${esc(d.license)}" placeholder="номер лицензии / реестра">`:''}
    <label class="lbl">Телефон для клиентов</label><input class="input" id="pt-w-phone" value="${esc(d.phone)}" placeholder="+7 …">
    <label class="lbl">Сайт (необязательно)</label><input class="input" id="pt-w-site" value="${esc(d.site)}" placeholder="example.ru">
    <label class="lbl">О компании и польза для людей</label><textarea class="input" id="pt-w-about" rows="3">${esc(d.about)}</textarea>
    <label class="lbl">Подтверждающие документы (лицензия, сертификат)</label>
    <input type="file" class="input" id="pt-w-doc" accept=".pdf,.jpg,.jpeg,.png" onchange="ptWizDoc(this)">
    <div class="pt-chips">${d.docs.map((x,i)=>`<span class="pt-chip">📎 ${esc(x.name)} ${x.local?'(локально)':''} <b style="cursor:pointer" onclick="ptWizDocDel(${i})">✕</b></span>`).join('')||'<span class="pt-s">Файлы не загружены</span>'}</div>`;
  }
  if(step===3){
    body=`<label class="lbl">Прайс услуг (перетаскивайте для порядка)</label>
    <div id="pt-w-svcs">${d.services.map((s,i)=>`<div class="pt-svc" draggable="true" ondragstart="ptWizDrag(event,${i})" ondragover="event.preventDefault()" ondrop="ptWizDrop(event,${i})">
      <input class="input" style="flex:2" value="${esc(s.title)}" placeholder="Услуга" oninput="ptWiz.data.services[${i}].title=this.value">
      <input class="input" style="flex:1" type="number" value="${esc(s.price)}" placeholder="₽" oninput="ptWiz.data.services[${i}].price=this.value">
      <input class="input" style="flex:1" value="${esc(s.unit)}" placeholder="ед." oninput="ptWiz.data.services[${i}].unit=this.value">
      <button class="btn btn-sm btn-ghost" onclick="ptWizSvcDel(${i})">✕</button></div>`).join('')}</div>
    <div class="pt-row"><button class="btn btn-sm btn-ghost" onclick="ptWizSvcAdd()">＋ Услуга</button></div>
    <label class="lbl" style="margin-top:12px"><input type="checkbox" id="pt-w-consent" ${d.consent?'checked':''} style="accent-color:#2dd4bf"> Даю согласие на обработку персональных данных по 152-ФЗ и подтверждаю достоверность реквизитов</label>
    <div class="pt-hero" style="margin-top:12px"><h3>Что дальше</h3><p>Платформа проверит ИНН, ОГРН, лицензию и документы, затем модератор подтвердит бейдж «Проверен». Заявки клиентов начнут приходить в кабинет партнёра сразу после проверки.</p></div>`;
  }
  openDrawer(`<div class="card-title">${ptWiz.editId?'Редактирование партнёра':'Регистрация партнёра'} · шаг ${step}/3</div>${dl}${body}
  <div class="pt-row">
    ${step>1?`<button class="btn btn-ghost" onclick="ptWizBack()">← Назад</button>`:''}
    ${step<3?`<button class="btn btn-primary" onclick="ptWizNext()">Далее →</button>`:`<button class="btn btn-primary" onclick="ptWizSubmit()">📤 Отправить на проверку</button>`}
  </div>`);
  if(step===2)ptWizInnHint(d.inn);
}
function ptWizInnHint(v){
  const el=document.getElementById('pt-inn-hint');if(!el)return;
  const s=String(v||'').replace(/\D/g,'');
  if(!s){el.innerHTML='';return}
  el.innerHTML=ptInnValid(s)?'<span style="color:#4ade80">✓ контрольная сумма верна</span>':'<span style="color:#fb7185">✗ контрольная сумма не сходится — проверьте цифры</span>';
}
function ptWizCollect(){
  const g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
  const d=ptWiz.data;
  if(ptWiz.step===1){d.category=g('pt-w-cat')||d.category;d.org=g('pt-w-org')||d.org;d.name=g('pt-w-name');d.city=g('pt-w-city')||d.city}
  if(ptWiz.step===2){d.inn=g('pt-w-inn');d.ogrn=g('pt-w-ogrn');d.license=g('pt-w-license');d.phone=g('pt-w-phone');d.site=g('pt-w-site');d.about=g('pt-w-about')}
  if(ptWiz.step===3){const c=document.getElementById('pt-w-consent');d.consent=c?c.checked:false}
}
function ptWizNext(){
  ptWizCollect();
  const d=ptWiz.data;
  if(ptWiz.step===1&&(!d.name||!d.city)){toast('Укажите название и город');return}
  if(ptWiz.step===2&&!ptInnValid(d.inn)){toast('ИНН не проходит проверку ФНС');const e=document.getElementById('pt-w-inn');if(e)e.classList.add('pt-err');return}
  ptWiz.step++;ptWizRender();
}
function ptWizBack(){ptWizCollect();ptWiz.step--;ptWizRender()}
function ptWizSvcAdd(){ptWizCollect();ptWiz.data.services.push({id:uid(),title:'',price:'',unit:'услуга'});ptWizRender()}
function ptWizSvcDel(i){ptWizCollect();ptWiz.data.services.splice(i,1);ptWizRender()}
let ptWizDragI=null;
function ptWizDrag(e,i){ptWizDragI=i;e.dataTransfer.effectAllowed='move'}
function ptWizDrop(e,i){e.preventDefault();if(ptWizDragI===null||ptWizDragI===i)return;const a=ptWiz.data.services;const [r]=a.splice(ptWizDragI,1);a.splice(i,0,r);ptWizDragI=null;ptWizRender()}
function ptWizDocDel(i){ptWiz.data.docs.splice(i,1);ptWizRender()}
async function ptWizDoc(input){
  const f=input.files&&input.files[0];if(!f)return;
  const doc={name:f.name,url:null,local:true};
  if(typeof SB!=='undefined'&&SB.on()){
    try{
      const path='partners/'+(ptWiz.editId||'new')+'/'+Date.now()+'_'+f.name;
      const r=await SB.storage.from('avatars').upload(path,f,{upsert:true});
      if(!r.error)doc.url=SB.storage.from('avatars').getPublicUrl(path).data.publicUrl,doc.local=false;
    }catch(e){}
  }
  ptWiz.data.docs.push(doc);ptWizRender();toast(doc.local?'Документ прикреплён локально':'Документ загружен в хранилище');
}
function ptWizSubmit(){
  ptWizCollect();
  const d=ptWiz.data;
  d.services=d.services.filter(s=>s.title&&+s.price>=0).map(s=>({...s,price:+s.price||0}));
  if(!d.consent){toast('Нужно согласие на обработку данных');return}
  if(!d.services.length){toast('Добавьте хотя бы одну услугу с ценой');return}
  let p=ptWiz.editId?ptFind(ptWiz.editId):null;
  if(p){Object.assign(p,d);p.status='checking';p.rejectReasons=[]}
  else{p=Object.assign({id:'p_'+uid(),owner:true,status:'checking',plan:'free',reviews:[],rejectReasons:[],createdAt:dAgo(0)},d);db.partners.unshift(p);db.partnerMe=p.id}
  Object.assign(p,coords(p.city));
  save();closeLayers();rerender();
  toast('Заявка партнёра отправлена на проверку');
  ptRunVerification(p.id);
  openModule('pt-cabinet');
}
function ptRunVerification(id){
  setTimeout(()=>{
    const p=ptFind(id);if(!p||p.status!=='checking')return;
    const checks=ptChecks(p);
    const bad=checks.filter(c=>!c.ok);
    if(bad.length===0){p.status='verified';ptNotify('Партнёр «'+p.name+'» проверен и опубликован в каталоге')}
    else{p.status='rejected';p.rejectReasons=bad.map(b=>b.t);ptNotify('Партнёр «'+p.name+'» отклонён: '+bad[0].t)}
    save();
    if(curMod==='pt-cabinet'||curMod==='pt-mod')renderModule();
    if(curMod==='pt-directory')ptDirRefresh();
  },2600);
}

/* ---------- КАТАЛОГ ПАРТНЁРОВ ---------- */
function ptDirState(){
  if(!modState['pt-directory'])modState['pt-directory']={q:'',cat:'all',city:'',verified:true,sort:'rating',radius:150};
  return modState['pt-directory'];
}
function ptDirRows(){
  const st=ptDirState();
  let rows=db.partners.filter(p=>p.status==='verified');
  if(st.verified)rows=rows.filter(p=>p.status==='verified');
  if(st.cat!=='all')rows=rows.filter(p=>p.category===st.cat);
  if(st.city)rows=rows.filter(p=>cityKey(p.city).includes(cityKey(st.city)));
  if(st.q){const q=st.q.toLowerCase();rows=rows.filter(p=>(p.name+' '+p.about+' '+p.services.map(s=>s.title).join(' ')).toLowerCase().includes(q))}
  rows=rows.filter(p=>{const d=hav(coords(db.profile.city||'Барнаул'),coords(p.city));return d==null||d<=st.radius||cityKey(p.city)===cityKey(db.profile.city)});
  const minPrice=p=>Math.min(...p.services.map(s=>+s.price||0),999999);
  if(st.sort==='rating')rows=[...rows].sort((a,b)=>ptRating(b)-ptRating(a));
  if(st.sort==='price')rows=[...rows].sort((a,b)=>minPrice(a)-minPrice(b));
  if(st.sort==='reviews')rows=[...rows].sort((a,b)=>b.reviews.length-a.reviews.length);
  if(st.sort==='dist')rows=[...rows].sort((a,b)=>(hav(coords(db.profile.city),coords(a.city))||9999)-(hav(coords(db.profile.city),coords(b.city))||9999));
  if(st.sort==='pro')rows=[...rows].sort((a,b)=>(b.plan==='pro')-(a.plan==='pro'));
  if(!rows.length)return '<div class="empty">Партнёров по фильтру нет. Расширьте радиус или категорию.</div>';
  return rows.map(p=>{
    const c=ptCat(p.category),d=hav(coords(db.profile.city),coords(p.city));
    return `<div class="pt-card" style="cursor:pointer" onclick="ptPartnerDrawer('${p.id}')">
    <div class="pt-t">${c.icon} ${esc(p.name)} ${p.plan==='pro'?'<span class="pt-badge pt-pro">PRO</span>':''} <span class="pt-badge pt-ok">проверен</span></div>
    <div class="pt-s">${esc(c.name)} · ${esc(p.city)}${d!=null?' · '+Math.round(d)+' км':''} · ★ ${ptRating(p).toFixed(1)} (${p.reviews.length})</div>
    <div class="pt-s">${esc(p.about).slice(0,90)}</div>
    <div class="pt-row"><span class="pt-price">от ${money(Math.min(...p.services.map(s=>+s.price||0)))}</span>
    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();ptLeadOpen('${p.id}')">Оставить заявку</button></div></div>`;
  }).join('');
}
function ptDirRefresh(){const el=document.getElementById('pt-dir-rows');if(el)el.innerHTML=ptDirRows()}
function ptDirectoryMod(){
  ptStyle();const st=ptDirState();
  return `<div class="pt-hero"><h3>🤝 Каталог проверенных партнёров</h3>
  <p>Медицина, образование, право, финансы, ремонт, ЖКХ и любые услуги — для всех людей и организаций, не только для водителей и пассажиров. Каждый партнёр прошёл проверку реквизитов и лицензий.</p></div>
  <div class="card">
  <input class="input" placeholder="🔍 Поиск по названию и услугам" value="${esc(st.q)}" oninput="ptDirState().q=this.value;ptDirRefresh()">
  <div class="pt-row"><input class="input" style="flex:1" placeholder="Город" value="${esc(st.city)}" oninput="ptDirState().city=this.value;ptDirRefresh()">
  <select class="input" style="flex:1" onchange="ptDirState().sort=this.value;renderModule()">
    <option value="rating" ${st.sort==='rating'?'selected':''}>По рейтингу</option>
    <option value="price" ${st.sort==='price'?'selected':''}>По цене</option>
    <option value="reviews" ${st.sort==='reviews'?'selected':''}>По отзывам</option>
    <option value="dist" ${st.sort==='dist'?'selected':''}>По расстоянию</option>
    <option value="pro" ${st.sort==='pro'?'selected':''}>Сначала PRO</option></select></div>
  <label class="lbl">Радиус: <b>${st.radius} км</b></label>
  <input type="range" min="10" max="500" step="10" value="${st.radius}" style="width:100%;accent-color:#2dd4bf" oninput="ptDirState().radius=+this.value;this.previousElementSibling.querySelector('b').textContent=this.value+' км';ptDirRefresh()">
  <div class="pt-chips"><button class="chip ${st.cat==='all'?'on':''}" onclick="ptDirState().cat='all';renderModule()">Все</button>
  ${PT_CATS.map(c=>`<button class="chip ${st.cat===c.id?'on':''}" onclick="ptDirState().cat='${c.id}';renderModule()">${c.icon} ${esc(c.name)}</button>`).join('')}</div>
  ${ptViewsBar('pt-directory')}</div>
  <div class="card" id="pt-dir-rows">${ptDirRows()}</div>`;
}
function ptPartnerDrawer(id){
  const p=ptFind(id);if(!p)return;ptStyle();
  const c=ptCat(p.category);
  openDrawer(`<div class="card-title">${c.icon} ${esc(p.name)}</div>
  <div class="pt-row" style="margin-top:0"><span class="pt-badge pt-ok">проверен</span>${p.plan==='pro'?'<span class="pt-badge pt-pro">PRO</span>':''}<span class="pt-badge pt-draft">${esc(p.org)}</span></div>
  <div class="pt-s">${esc(c.name)} · ${esc(p.city)} · радиус ${p.radius} км · ★ ${ptRating(p).toFixed(1)} (${p.reviews.length} отзывов)</div>
  <p style="font-size:13px;color:var(--dim);line-height:1.65;margin:10px 0">${esc(p.about)}</p>
  <div class="pt-check"><i>🏛</i>ИНН ${esc(p.inn)} · ОГРН ${esc(p.ogrn)}</div>
  ${p.license?`<div class="pt-check"><i>📜</i>${esc(c.lic||'Лицензия')}: ${esc(p.license)}</div>`:''}
  <div class="card-title" style="margin-top:12px">Услуги и цены</div>
  ${p.services.map(s=>`<div class="pt-svc" style="cursor:default"><div style="flex:2"><div class="pt-t" style="font-size:12.5px">${esc(s.title)}</div><div class="pt-s">за ${esc(s.unit)}</div></div>
  <span class="pt-price">${+s.price?money(+s.price):'бесплатно'}</span>
  <button class="btn btn-sm btn-primary" onclick="ptLeadOpen('${p.id}','${esc(s.title)}')">Заказать</button></div>`).join('')}
  <div class="pt-row"><button class="btn btn-sm btn-ghost" onclick="location.href='tel:${esc(p.phone.replace(/[^\d+]/g,''))}'">📞 ${esc(p.phone)}</button>
  ${p.site?`<button class="btn btn-sm btn-ghost" onclick="window.open('https://${esc(p.site)}','_blank')">🌐 Сайт</button>`:''}</div>
  <div class="card-title" style="margin-top:12px">Отзывы</div>
  ${p.reviews.map(r=>`<div class="pt-card"><div class="pt-t" style="font-size:12px">${esc(r.author)} · ${'★'.repeat(r.stars)}</div><div class="pt-s">${esc(r.text)} · ${fdate(r.date)}</div></div>`).join('')||'<div class="pt-s">Отзывов пока нет.</div>'}
  <div class="pt-row"><button class="btn btn-sm btn-ghost" onclick="ptReviewOpen('${p.id}')">⭐ Оставить отзыв</button></div>`);
}
function ptReviewOpen(id){
  const p=ptFind(id);if(!p)return;
  openDrawer(`<div class="card-title">⭐ Отзыв о «${esc(p.name)}»</div>
  <div class="pt-row">${[1,2,3,4,5].map(n=>`<button class="btn btn-sm btn-ghost" onclick="ptReviewSend('${id}',${n})">${'★'.repeat(n)}</button>`).join('')}</div>
  <label class="lbl">Комментарий</label><textarea class="input" id="pt-rev-text" rows="3"></textarea>`);
}
function ptReviewSend(id,stars){
  const p=ptFind(id);if(!p)return;
  const t=document.getElementById('pt-rev-text');
  p.reviews.unshift({author:ecoMeName?ecoMeName():db.profile.name,stars,text:(t?t.value.trim():'')||'Оценка '+stars+' из 5',date:dAgo(0)});
  save();closeLayers();ptPartnerDrawer(id);toast('Отзыв опубликован');
}

/* ---------- ЗАЯВКИ КЛИЕНТОВ ---------- */
function ptLeadOpen(pid,service){
  const p=ptFind(pid);if(!p)return;ptStyle();
  openDrawer(`<div class="card-title">Заявка партнёру · ${esc(p.name)}</div>
  <label class="lbl">Услуга</label><select class="input" id="pt-l-svc">${p.services.map(s=>`<option ${service===s.title?'selected':''}>${esc(s.title)}</option>`).join('')}</select>
  <label class="lbl">Ваше имя</label><input class="input" id="pt-l-name" value="${esc(db.profile.name)}">
  <label class="lbl">Телефон</label><input class="input" id="pt-l-phone" value="${esc(db.profile.phone||'')}" placeholder="+7 …">
  <label class="lbl">Бюджет, ₽</label><input class="input" id="pt-l-budget" type="number" value="${(p.services.find(s=>s.title===service)||p.services[0]||{}).price||0}">
  <label class="lbl">Комментарий</label><textarea class="input" id="pt-l-comment" rows="3" placeholder="Что нужно, сроки, детали"></textarea>
  <div class="pt-row"><button class="btn btn-primary" onclick="ptLeadSend('${pid}')">📨 Отправить заявку</button></div>`);
}
function ptLeadSend(pid){
  const p=ptFind(pid);if(!p)return;
  const g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
  if(!g('pt-l-name')||!g('pt-l-phone')){toast('Укажите имя и телефон');return}
  db.partnerLeads.unshift({id:'l_'+uid(),partnerId:pid,service:g('pt-l-svc'),client:g('pt-l-name'),phone:g('pt-l-phone'),budget:+g('pt-l-budget')||0,comment:g('pt-l-comment'),status:'new',createdAt:dAgo(0),msgs:[]});
  ptNotify('Новая заявка партнёру «'+p.name+'»: '+g('pt-l-svc'));
  save();closeLayers();rerender();toast('Заявка отправлена. Партнёр ответит в чате');
}
function ptLeadState(){
  if(!modState['pt-leads'])modState['pt-leads']={q:'',f:'all',sort:'new',sel:[]};
  return modState['pt-leads'];
}
function ptMyLeads(){const me=ptMe();return me?db.partnerLeads.filter(l=>l.partnerId===me.id):[]}
function ptLeadRows(){
  const st=ptLeadState();let rows=ptMyLeads();
  if(st.f!=='all')rows=rows.filter(l=>l.status===st.f);
  if(st.q){const q=st.q.toLowerCase();rows=rows.filter(l=>(l.client+' '+l.service+' '+l.comment).toLowerCase().includes(q))}
  if(st.sort==='new')rows=[...rows].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  if(st.sort==='budget')rows=[...rows].sort((a,b)=>b.budget-a.budget);
  if(st.sort==='client')rows=[...rows].sort((a,b)=>a.client.localeCompare(b.client,'ru'));
  const bar=st.sel.length?`<div class="pt-bar"><span>Выбрано: ${st.sel.length}</span>
  <button class="btn btn-sm btn-ghost" onclick="ptLeadBulk('accepted')">Принять</button>
  <button class="btn btn-sm btn-ghost" onclick="ptLeadBulk('declined')">Отклонить</button>
  <button class="btn btn-sm btn-ghost" onclick="ptLeadBulkDelete()">🗑 Удалить</button>
  <button class="btn btn-sm btn-ghost" onclick="ptLeadState().sel=[];ptLeadRefresh()">Снять</button></div>`:'';
  if(!rows.length)return bar+'<div class="empty">Заявок нет. Клиенты оставляют их из каталога партнёров.</div>';
  const LS={new:['Новая','pt-wait'],accepted:['Принята','pt-ok'],done:['Выполнена','pt-ok'],declined:['Отклонена','pt-bad'],cancelled:['Отменена','pt-draft']};
  return bar+rows.map(l=>`<div class="pt-card" style="cursor:pointer" onclick="ptLeadDrawer('${l.id}')">
  <div class="pt-row" style="margin:0"><input class="cb" type="checkbox" ${st.sel.includes(l.id)?'checked':''} onclick="event.stopPropagation();ptLeadSel('${l.id}',this.checked)">
  <div style="flex:1"><div class="pt-t">${esc(l.service)}</div><div class="pt-s">${esc(l.client)} · ${esc(l.phone)} · ${money(l.budget)} · ${fdate(l.createdAt)}</div></div>
  <span class="pt-badge ${(LS[l.status]||LS.new)[1]}">${(LS[l.status]||LS.new)[0]}</span></div>
  <div class="pt-s">${esc(l.comment)}</div></div>`).join('');
}
function ptLeadRefresh(){const el=document.getElementById('pt-lead-rows');if(el)el.innerHTML=ptLeadRows()}
function ptLeadSel(id,on){const st=ptLeadState();st.sel=on?[...new Set([...st.sel,id])]:st.sel.filter(x=>x!==id);ptLeadRefresh()}
function ptLeadsMod(){
  ptStyle();const st=ptLeadState();const me=ptMe();
  if(!me)return '<div class="empty">Сначала зарегистрируйтесь как партнёр.</div>';
  const rev=ptMyLeads().filter(l=>l.status==='done').reduce((a,l)=>a+l.budget,0);
  return `<div class="card"><div class="kpis"><div class="kpi"><b>${ptMyLeads().filter(l=>l.status==='new').length}</b><span>НОВЫХ</span></div>
  <div class="kpi"><b>${ptMyLeads().filter(l=>l.status==='accepted').length}</b><span>В РАБОТЕ</span></div>
  <div class="kpi"><b>${money(rev)}</b><span>ВЫРУЧКА</span></div></div>
  <input class="input" placeholder="🔍 Поиск по клиенту и услуге" value="${esc(st.q)}" oninput="ptLeadState().q=this.value;ptLeadRefresh()">
  <div class="pt-row"><select class="input" style="flex:1" onchange="ptLeadState().f=this.value;renderModule()">
  <option value="all">Все статусы</option><option value="new" ${st.f==='new'?'selected':''}>Новые</option><option value="accepted" ${st.f==='accepted'?'selected':''}>Принятые</option><option value="done" ${st.f==='done'?'selected':''}>Выполненные</option><option value="declined" ${st.f==='declined'?'selected':''}>Отклонённые</option></select>
  <select class="input" style="flex:1" onchange="ptLeadState().sort=this.value;renderModule()">
  <option value="new" ${st.sort==='new'?'selected':''}>Сначала новые</option><option value="budget" ${st.sort==='budget'?'selected':''}>По бюджету</option><option value="client" ${st.sort==='client'?'selected':''}>По клиенту</option></select></div>
  ${ptViewsBar('pt-leads')}</div><div class="card" id="pt-lead-rows">${ptLeadRows()}</div>`;
}
function ptLeadDrawer(id){
  const l=db.partnerLeads.find(x=>x.id===id);if(!l)return;ptStyle();
  const acts=[];
  if(l.status==='new')acts.push(`<button class="btn btn-sm btn-primary" onclick="ptLeadStatus('${id}','accepted')">✅ Принять</button>`,`<button class="btn btn-sm btn-ghost" onclick="ptLeadStatus('${id}','declined')">Отклонить</button>`);
  if(l.status==='accepted')acts.push(`<button class="btn btn-sm btn-primary" onclick="ptLeadStatus('${id}','done')">🏁 Выполнено</button>`,`<button class="btn btn-sm btn-ghost" onclick="ptLeadStatus('${id}','cancelled')">Отменить</button>`);
  acts.push(`<button class="btn btn-sm btn-ghost" onclick="location.href='tel:${esc(l.phone.replace(/[^\d+]/g,''))}'">📞 Позвонить</button>`);
  acts.push(`<button class="btn btn-sm btn-ghost" style="color:#fb7185" onclick="ptLeadDelete('${id}')">🗑</button>`);
  openDrawer(`<div class="card-title">Заявка · ${esc(l.service)}</div>
  <div class="pt-s">${esc(l.client)} · ${esc(l.phone)} · бюджет ${money(l.budget)} · ${fdate(l.createdAt)}</div>
  <p style="font-size:13px;color:var(--dim);line-height:1.6">${esc(l.comment)}</p>
  <div class="pt-row">${acts.join('')}</div>
  <div class="card-title" style="margin-top:12px">Чат с клиентом</div>
  <div class="pt-chat" id="pt-chat-box">${l.msgs.map(m=>`<div class="pt-msg ${m.from==='partner'?'me':'them'}">${esc(m.text)}<small>${esc(m.time||'')}</small></div>`).join('')||'<div class="pt-s">Сообщений пока нет.</div>'}</div>
  <div class="pt-row"><input class="input" id="pt-chat-input" style="flex:1" placeholder="Сообщение клиенту…">
  <button class="btn btn-sm btn-primary" onclick="ptLeadMsg('${id}')">➤</button></div>`);
  const b=document.getElementById('pt-chat-box');if(b)b.scrollTop=b.scrollHeight;
}
function ptLeadMsg(id){
  const l=db.partnerLeads.find(x=>x.id===id);if(!l)return;
  const i=document.getElementById('pt-chat-input');const t=i?i.value.trim():'';if(!t)return;
  l.msgs.push({from:'partner',text:t,time:new Date().toTimeString().slice(0,5)});
  save();ptLeadDrawer(id);
}
function ptLeadStatus(id,st){
  const l=db.partnerLeads.find(x=>x.id===id);if(!l)return;
  l.status=st;if(st==='done')l.closedAt=dAgo(0);
  ptNotify('Заявка «'+l.service+'»: '+{accepted:'принята партнёром',done:'выполнена',declined:'отклонена',cancelled:'отменена'}[st]);
  save();closeLayers();renderModule();toast('Статус заявки обновлён');
}
function ptLeadBulk(st){
  const s=ptLeadState();s.sel.forEach(id=>{const l=db.partnerLeads.find(x=>x.id===id);if(l&&l.status==='new')l.status=st});
  s.sel=[];save();renderModule();toast('Массовое действие выполнено');
}
function ptLeadBulkDelete(){
  const s=ptLeadState();
  ptTrash={items:s.sel.map(id=>ptRemove('partnerLeads',id)).filter(Boolean)};
  s.sel=[];save();renderModule();ptSnack('Заявки удалены','Вернуть',ptUndo);
}
function ptLeadDelete(id){
  ptTrash={items:[ptRemove('partnerLeads',id)].filter(Boolean)};
  save();closeLayers();renderModule();ptSnack('Заявка удалена','Вернуть',ptUndo);
}

/* ---------- КАБИНЕТ ПАРТНЁРА ---------- */
function ptSvcState(){
  if(!modState['pt-cabinet'])modState['pt-cabinet']={q:'',sort:'order',sel:[]};
  return modState['pt-cabinet'];
}
function ptSvcRows(){
  const me=ptMe();if(!me)return '';
  const st=ptSvcState();let rows=me.services.map((s,i)=>({...s,i}));
  if(st.q)rows=rows.filter(s=>s.title.toLowerCase().includes(st.q.toLowerCase()));
  if(st.sort==='price')rows=[...rows].sort((a,b)=>(+a.price||0)-(+b.price||0));
  if(st.sort==='title')rows=[...rows].sort((a,b)=>a.title.localeCompare(b.title,'ru'));
  const bar=st.sel.length?`<div class="pt-bar"><span>Выбрано: ${st.sel.length}</span>
  <button class="btn btn-sm btn-ghost" onclick="ptSvcBulkDelete()">🗑 Удалить</button>
  <button class="btn btn-sm btn-ghost" onclick="ptSvcState().sel=[];ptSvcRefresh()">Снять</button></div>`:'';
  return bar+rows.map(s=>`<div class="pt-svc" draggable="true" ondragstart="ptSvcDrag(event,${s.i})" ondragover="event.preventDefault()" ondrop="ptSvcDrop(event,${s.i})">
  <input class="cb" type="checkbox" ${st.sel.includes(s.id)?'checked':''} onclick="event.stopPropagation();ptSvcSel('${s.id}',this.checked)">
  <div style="flex:2"><div class="pt-t" style="font-size:12.5px">${esc(s.title)}</div><div class="pt-s">за ${esc(s.unit)}</div></div>
  <span class="pt-price">${money(+s.price||0)}</span>
  <button class="btn btn-sm btn-ghost" onclick="ptSvcEdit(${s.i})">✏️</button>
  <button class="btn btn-sm btn-ghost" style="color:#fb7185" onclick="ptSvcDelete(${s.i})">🗑</button></div>`).join('')||'<div class="pt-s">Услуг нет — добавьте первую.</div>';
}
function ptSvcRefresh(){const el=document.getElementById('pt-svc-rows');if(el)el.innerHTML=ptSvcRows()}
function ptSvcSel(id,on){const st=ptSvcState();st.sel=on?[...new Set([...st.sel,id])]:st.sel.filter(x=>x!==id);ptSvcRefresh()}
let ptSvcDragI=null;
function ptSvcDrag(e,i){ptSvcDragI=i;e.dataTransfer.effectAllowed='move';e.currentTarget.classList.add('dragging')}
function ptSvcDrop(e,i){
  e.preventDefault();const me=ptMe();if(!me||ptSvcDragI===null||ptSvcDragI===i)return;
  const [r]=me.services.splice(ptSvcDragI,1);me.services.splice(i,0,r);ptSvcDragI=null;
  save();ptSvcRefresh();toast('Порядок услуг обновлён');
}
function ptSvcAdd(){
  const me=ptMe();if(!me)return;
  openDrawer(`<div class="card-title">Новая услуга</div>
  <label class="lbl">Название</label><input class="input" id="pt-s-title">
  <div class="pt-row"><input class="input" style="flex:1" id="pt-s-price" type="number" placeholder="Цена, ₽"><input class="input" style="flex:1" id="pt-s-unit" value="услуга" placeholder="Единица"></div>
  <div class="pt-row"><button class="btn btn-primary" onclick="ptSvcSave(-1)">💾 Сохранить</button></div>`);
}
function ptSvcEdit(i){
  const me=ptMe();const s=me.services[i];if(!s)return;
  openDrawer(`<div class="card-title">Редактирование услуги</div>
  <label class="lbl">Название</label><input class="input" id="pt-s-title" value="${esc(s.title)}">
  <div class="pt-row"><input class="input" style="flex:1" id="pt-s-price" type="number" value="${+s.price||0}"><input class="input" style="flex:1" id="pt-s-unit" value="${esc(s.unit)}"></div>
  <div class="pt-row"><button class="btn btn-primary" onclick="ptSvcSave(${i})">💾 Сохранить</button></div>`);
}
function ptSvcSave(i){
  const me=ptMe();if(!me)return;
  const g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
  if(!g('pt-s-title')){toast('Укажите название услуги');return}
  const rec={id:i>=0?me.services[i].id:uid(),title:g('pt-s-title'),price:+g('pt-s-price')||0,unit:g('pt-s-unit')||'услуга'};
  if(i>=0)me.services[i]=rec;else me.services.push(rec);
  save();closeLayers();renderModule();toast('Услуга сохранена');
}
function ptSvcDelete(i){
  const me=ptMe();if(!me)return;
  const rec=me.services[i];me.services.splice(i,1);save();renderModule();
  ptTrash={items:[{listKey:'_svc',rec,index:i}]};
  ptSnack('Услуга удалена','Вернуть',()=>{const m=ptMe();m.services.splice(Math.min(i,m.services.length),0,rec);ptTrash=null;save();renderModule();toast('Услуга восстановлена')});
}
function ptSvcBulkDelete(){
  const me=ptMe();const st=ptSvcState();
  const items=st.sel.map(id=>{const i=me.services.findIndex(s=>s.id===id);if(i<0)return null;const rec=me.services[i];me.services.splice(i,1);return {listKey:'_svc',rec,index:i}}).filter(Boolean).sort((a,b)=>a.index-b.index);
  ptTrash={items};st.sel=[];save();renderModule();
  ptSnack('Услуги удалены','Вернуть',()=>{const m=ptMe();items.forEach(({rec,index})=>m.services.splice(Math.min(index,m.services.length),0,rec));ptTrash=null;save();renderModule();toast('Восстановлено')});
}
function ptPlanToggle(plan){
  const me=ptMe();if(!me)return;
  me.plan=plan;save();renderModule();toast(plan==='pro'?'Тариф PRO активирован: приоритет в каталоге и бейдж':'Тариф Free активен');
}
function ptCabinetMod(){
  ptStyle();const me=ptMe();
  if(!me)return `<div class="pt-hero"><h3>🤝 Станьте партнёром платформы</h3><p>Клиники, школы, юрбюро, страховые, мастера и любые сервисные компании получают проверенный бейдж, заявки клиентов и место в каталоге. Платформа работает для всех.</p>
  <div class="pt-row"><button class="btn btn-primary" onclick="ptRegOpen()">Зарегистрироваться как партнёр</button></div></div>`;
  const checks=ptChecks(me),score=ptScore(me),st=PT_ST[me.status]||PT_ST.draft;
  const leads=ptMyLeads();
  const rev=leads.filter(l=>l.status==='done').reduce((a,l)=>a+l.budget,0);
  const svcSt=ptSvcState();
  return `<div class="pt-hero"><h3>${ptCat(me.category).icon} ${esc(me.name)}</h3>
  <p>${esc(ptCat(me.category).name)} · ${esc(me.city)} · ${esc(me.org)} · ИНН ${esc(me.inn)}</p>
  <div class="pt-row" style="margin-top:8px"><span class="pt-badge ${st[1]}">${st[0]}</span>${me.plan==='pro'?'<span class="pt-badge pt-pro">PRO</span>':'<span class="pt-badge pt-draft">FREE</span>'}
  <span class="pt-badge pt-ok">★ ${ptRating(me).toFixed(1)}</span></div>
  <div class="pt-prog"><i style="width:${score}%"></i></div>
  <div class="pt-s">Готовность к проверке: <b style="color:#2dd4bf">${score}%</b></div>
  ${me.status==='rejected'?`<div class="pt-card" style="border-color:rgba(244,63,94,.4)"><div class="pt-t" style="color:#fb7185;font-size:12.5px">Причины отклонения</div>${me.rejectReasons.map(r=>`<div class="pt-s">• ${esc(r)}</div>`).join('')}
  <div class="pt-row"><button class="btn btn-sm btn-primary" onclick="ptRegOpen('${me.id}')">Исправить и отправить снова</button></div></div>`:''}
  ${me.status==='draft'?`<div class="pt-row"><button class="btn btn-primary btn-sm" onclick="ptRegOpen('${me.id}')">Завершить регистрацию →</button></div>`:''}
  ${me.status==='checking'?`<div class="pt-s" style="color:#7dd3fc">Идёт автоматическая проверка реквизитов и модерация…</div>`:''}</div>
  <div class="card"><div class="card-title">Проверка платформы</div>
  ${checks.map(c=>`<div class="pt-check"><i style="color:${c.ok?'#4ade80':'#fb7185'}">${c.ok?'✓':'✗'}</i><div>${esc(c.t)}<div class="pt-s">${esc(c.v)}</div></div></div>`).join('')}</div>
  <div class="card"><div class="card-title">Показатели</div>
  <div class="kpis"><div class="kpi"><b>${leads.filter(l=>l.status==='new').length}</b><span>НОВЫХ ЗАЯВОК</span></div>
  <div class="kpi"><b>${leads.filter(l=>l.status==='accepted').length}</b><span>В РАБОТЕ</span></div>
  <div class="kpi"><b>${money(rev)}</b><span>ВЫРУЧКА</span></div>
  <div class="kpi"><b>${me.reviews.length}</b><span>ОТЗЫВОВ</span></div></div>
  <div class="pt-row"><button class="btn btn-sm btn-ghost" onclick="openModule('pt-leads')">Заявки клиентов →</button>
  <button class="btn btn-sm btn-ghost" onclick="ptPartnerDrawer('${me.id}')">Публичная страница →</button>
  <button class="btn btn-sm btn-ghost" onclick="ptRegOpen('${me.id}')">✏️ Профиль</button></div></div>
  <div class="card"><div class="card-title">Тариф</div>
  <div class="pt-row" style="align-items:stretch">
  <div class="pt-plan ${me.plan==='free'?'on':''}"><b>Free · 0 ₽</b><span>Каталог, заявки, чат, проверка реквизитов.</span>
  <button class="btn btn-sm btn-ghost" onclick="ptPlanToggle('free')">Выбрать</button></div>
  <div class="pt-plan ${me.plan==='pro'?'on':''}"><b>PRO · 4 900 ₽/мес</b><span>Приоритет в каталоге, бейдж PRO, расширенная статистика, поднятие в поиске.</span>
  <button class="btn btn-sm btn-primary" onclick="ptPlanToggle('pro')">Выбрать</button></div></div></div>
  <div class="card"><div class="card-title">Услуги и прайс</div>
  <div class="pt-row" style="margin-top:0"><input class="input" style="flex:2" placeholder="🔍 Поиск услуги" value="${esc(svcSt.q)}" oninput="ptSvcState().q=this.value;ptSvcRefresh()">
  <select class="input" style="flex:1" onchange="ptSvcState().sort=this.value;ptSvcRefresh()">
  <option value="order" ${svcSt.sort==='order'?'selected':''}>Мой порядок</option>
  <option value="price" ${svcSt.sort==='price'?'selected':''}>По цене</option>
  <option value="title" ${svcSt.sort==='title'?'selected':''}>По названию</option></select>
  <button class="btn btn-sm btn-primary" onclick="ptSvcAdd()">＋</button></div>
  ${ptViewsBar('pt-cabinet')}
  <div id="pt-svc-rows">${ptSvcRows()}</div>
  <div class="pt-s">Перетаскивайте строки, чтобы менять порядок в публичном прайсе.</div></div>
  <div class="card"><div class="card-title">Документы</div>
  ${me.docs.map(d=>`<div class="pt-check"><i>📎</i>${esc(d.name)} ${d.url?`<a href="${esc(d.url)}" target="_blank" rel="noopener" style="color:#2dd4bf">открыть</a>`:'<span class="pt-s">(локально)</span>'}</div>`).join('')||'<div class="pt-s">Документы не загружены.</div>'}
  <div class="pt-row"><button class="btn btn-sm btn-ghost" onclick="ptRegOpen('${me.id}')">Загрузить документы</button></div></div>
  <div class="card"><div class="card-title">Облако партнёров</div>
  <div class="pt-row"><button class="btn btn-sm btn-primary" onclick="ptPush()">⬆️ Выгрузить</button>
  <button class="btn btn-sm btn-ghost" onclick="ptPull()">⬇️ Забрать</button>
  <button class="btn btn-sm btn-ghost" onclick="ptCopySql()">📋 SQL</button></div></div>`;
}

/* ---------- МОДЕРАЦИЯ ---------- */
function ptModToggle(){db.ptMod=!db.ptMod;save();renderModule();toast(db.ptMod?'Режим модератора включён (демо)':'Режим модератора выключен')}
function ptModMod(){
  ptStyle();
  const queue=db.partners.filter(p=>p.status==='checking'||p.status==='rejected');
  return `<div class="card"><div class="pt-row" style="margin-top:0">
  <button class="btn btn-sm ${db.ptMod?'btn-primary':'btn-ghost'}" onclick="ptModToggle()">${db.ptMod?'🛡 Модератор: ВКЛ':'🛡 Включить режим модератора'}</button></div>
  <div class="pt-s">Демо-режим: очередь проверки партнёров. В продакшене доступ только у команды платформы.</div></div>
  ${!db.ptMod?'<div class="empty">Включите режим модератора, чтобы видеть очередь.</div>':queue.map(p=>{
    const checks=ptChecks(p);
    return `<div class="pt-card"><div class="pt-t">${ptCat(p.category).icon} ${esc(p.name)} <span class="pt-badge ${(PT_ST[p.status]||PT_ST.draft)[1]}">${(PT_ST[p.status]||PT_ST.draft)[0]}</span></div>
    <div class="pt-s">${esc(p.org)} · ${esc(p.city)} · ИНН ${esc(p.inn)} · готовность ${ptScore(p)}%</div>
    ${checks.map(c=>`<div class="pt-check"><i style="color:${c.ok?'#4ade80':'#fb7185'}">${c.ok?'✓':'✗'}</i>${esc(c.t)}</div>`).join('')}
    <div class="pt-row"><button class="btn btn-sm btn-primary" onclick="ptModApprove('${p.id}')">✅ Одобрить</button>
    <button class="btn btn-sm btn-ghost" style="color:#fb7185" onclick="ptModReject('${p.id}')">Отклонить</button>
    <button class="btn btn-sm btn-ghost" onclick="ptPartnerDrawer('${p.id}')">Карточка</button></div></div>`}).join('')||'<div class="empty">Очередь пуста.</div>'}
  <div class="card"><div class="card-title">Журнал решений</div>
  ${db.ptModLog.slice(0,12).map(l=>`<div class="pt-check"><i>🛡</i>${esc(l.at)} · ${esc(l.text)}</div>`).join('')||'<div class="pt-s">Решений пока нет.</div>'}</div>`;
}
function ptModApprove(id){
  const p=ptFind(id);if(!p)return;
  const prev=p.status;p.status='verified';p.rejectReasons=[];
  db.ptModLog.unshift({at:ecoNow?ecoNow():dAgo(0),text:'Одобрен «'+p.name+'»'});
  ptNotify('Партнёр «'+p.name+'» одобрен модератором');
  save();renderModule();ptSnack('Партнёр одобрен','Отменить',()=>{const x=ptFind(id);if(x){x.status=prev;save();renderModule()}});
}
function ptModReject(id){
  const p=ptFind(id);if(!p)return;
  const reason=prompt('Причина отклонения:','Не подтверждена лицензия');
  if(reason===null)return;
  const prev=p.status;p.status='rejected';p.rejectReasons=[reason];
  db.ptModLog.unshift({at:ecoNow?ecoNow():dAgo(0),text:'Отклонён «'+p.name+'»: '+reason});
  ptNotify('Партнёр «'+p.name+'» отклонён: '+reason);
  save();renderModule();ptSnack('Партнёр отклонён','Отменить',()=>{const x=ptFind(id);if(x){x.status=prev;save();renderModule()}});
}

/* ---------- ОБЛАКО ---------- */
const PT_SQL=`-- СИБИРЯК · партнёры (Supabase → SQL Editor → Run)
create table if not exists pt_partners(id text primary key, payload jsonb, updated_at timestamptz default now());
create table if not exists pt_leads(id text primary key, payload jsonb, updated_at timestamptz default now());
alter table pt_partners enable row level security;
alter table pt_leads enable row level security;
drop policy if exists demo_all on pt_partners;
drop policy if exists demo_all on pt_leads;
create policy demo_all on pt_partners for all to anon using (true) with check (true);
create policy demo_all on pt_leads for all to anon using (true) with check (true);`;
function ptCopySql(){
  if(navigator.clipboard)navigator.clipboard.writeText(PT_SQL).then(()=>toast('SQL скопирован')).catch(()=>openDrawer(`<textarea class="input" style="min-height:260px;font-family:monospace;font-size:11px">${esc(PT_SQL)}</textarea>`));
  else openDrawer(`<textarea class="input" style="min-height:260px;font-family:monospace;font-size:11px">${esc(PT_SQL)}</textarea>`);
}
async function ptPush(){
  if(typeof SB==='undefined'||!SB.on()){toast('Сначала подключите базу в разделе «База данных»');return}
  try{
    await SB.upsert('pt_partners',db.partners.map(p=>({id:p.id,payload:p})));
    await SB.upsert('pt_leads',db.partnerLeads.map(l=>({id:l.id,payload:l})));
    toast('Партнёры и заявки выгружены в облако');
  }catch(e){toast('Ошибка: '+e.message+' · выполните SQL партнёров')}
}
async function ptPull(){
  if(typeof SB==='undefined'||!SB.on()){toast('Сначала подключите базу');return}
  try{
    const ps=await SB.select('pt_partners','select=payload&limit=500');
    const ls=await SB.select('pt_leads','select=payload&limit=500');
    if(ps&&ps.length)db.partners=ps.map(r=>r.payload);
    if(ls&&ls.length)db.partnerLeads=ls.map(r=>r.payload);
    save();rerender();toast('Партнёры загружены из облака');
  }catch(e){toast('Ошибка: '+e.message)}
}

/* ---------- ВСТРАИВАНИЕ ---------- */
function ptCta(){
  return `<div class="pt-cta pt-brand"><h3>🤝 Платформа возможностей — для всех</h3>
  <p>Работа, смены, услуги, обучение, здоровье и право в одном месте. Не только для водителей и пассажиров: любой человек и любая организация находят здесь своё.</p>
  <p style="margin-bottom:10px">Компании, оказывающие медицинские, образовательные, юридические и другие услуги, могут зарегистрироваться как партнёр и получать заявки клиентов.</p>
  <div class="pt-row" style="margin-top:0"><button class="btn btn-primary" onclick="ptRegOpen()">Зарегистрироваться как партнёр</button>
  <button class="btn btn-ghost" onclick="openModule('pt-directory')">Каталог партнёров</button></div></div>`;
}
MOD.seeker.push({g:'Партнёры',items:[
  {key:'pt-directory',icon:'🤝',title:'Каталог партнёров',sub:'Медицина · образование · право · услуги',badge:()=>db.partners.filter(p=>p.status==='verified').length||null},
  {key:'pt-register',icon:'📝',title:'Стать партнёром',sub:'Регистрация сервисной компании',badge:()=>null},
  {key:'pt-cabinet',icon:'🏢',title:'Кабинет партнёра',sub:'Проверка · прайс · тариф',badge:()=>{const m=ptMe();return m&&m.status==='rejected'?'!':null}},
  {key:'pt-leads',icon:'📨',title:'Заявки клиентов',sub:'Принять · чат · выполнить',badge:()=>ptMyLeads().filter(l=>l.status==='new').length||null},
  {key:'pt-mod',icon:'🛡',title:'Модерация партнёров',sub:'Очередь проверки · журнал',badge:()=>null}]});
MOD.company.push({g:'Партнёры',items:[
  {key:'pt-directory',icon:'🤝',title:'Каталог партнёров',sub:'Медицина · образование · право · услуги',badge:()=>db.partners.filter(p=>p.status==='verified').length||null},
  {key:'pt-register',icon:'📝',title:'Стать партнёром',sub:'Регистрация сервисной компании',badge:()=>null},
  {key:'pt-cabinet',icon:'🏢',title:'Кабинет партнёра',sub:'Проверка · прайс · тариф',badge:()=>{const m=ptMe();return m&&m.status==='rejected'?'!':null}},
  {key:'pt-leads',icon:'📨',title:'Заявки клиентов',sub:'Принять · чат · выполнить',badge:()=>ptMyLeads().filter(l=>l.status==='new').length||null},
  {key:'pt-mod',icon:'🛡',title:'Модерация партнёров',sub:'Очередь проверки · журнал',badge:()=>null}]});
const _ptModTitle=modTitle;
modTitle=function(k){
  const m={'pt-directory':'Каталог партнёров','pt-register':'Регистрация партнёра','pt-cabinet':'Кабинет партнёра','pt-leads':'Заявки клиентов','pt-mod':'Модерация партнёров'};
  return m[k]||_ptModTitle(k);
};
const _ptRenderModule=renderModule;
renderModule=function(){
  const extra={'pt-directory':ptDirectoryMod,'pt-register':()=>{ptRegOpen();return '<div class="empty">Форма регистрации открыта.</div>'},'pt-cabinet':ptCabinetMod,'pt-leads':ptLeadsMod,'pt-mod':ptModMod};
  if(extra[curMod]){
    ptStyle();
    document.getElementById('module-body').innerHTML=extra[curMod](modState[curMod]);
    document.getElementById('ab-title').textContent=modTitle(curMod);
  }else _ptRenderModule();
};
const _ptRenderHome=renderHome;
renderHome=function(role){
  _ptRenderHome(role);
  const el=document.getElementById(role==='seeker'?'seeker-home':'company-home');
  if(el)el.insertAdjacentHTML('afterbegin',`<div class="pt-strip pt-brand">
  <button class="btn btn-sm btn-primary" onclick="openModule('pt-directory')">🤝 Партнёры</button>
  <button class="btn btn-sm btn-ghost" onclick="${ptMe()?`openModule('pt-cabinet')`:`ptRegOpen()`}">${ptMe()?'🏢 Кабинет партнёра':'📝 Стать партнёром'}</button>
  <span class="pt-s" style="margin:0">Для всех: медицина, образование, право и любые услуги</span></div>`);
};
const _ptGo=go;
go=function(id){
  _ptGo(id);
  if(id==='s-main'||id==='s-role'){
    const el=document.getElementById(id);
    if(el&&!el.querySelector('.pt-cta'))el.insertAdjacentHTML('beforeend',ptCta());
  }
};

/* ---------- СТАРТ ---------- */
ptMigrate();
save();