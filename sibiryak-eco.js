/* ============================================================
   СИБИРЯК · ЭКОСИСТЕМА v1.0 (слой sibiryak-eco.js)
   Единая заявка · смены и вахта · сделки «Взять в работу» ·
   лента потребностей · чаты/звонки/видео · собеседования ·
   семейный бюджет · защита · рабочий паспорт · облако
   ============================================================ */

/* ---------- СТИЛИ ---------- */
function ecoStyle(){
  if(document.getElementById('eco-style'))return;
  const s=document.createElement('style');
  s.id='eco-style';
  s.textContent=`
  #module-body::-webkit-scrollbar,.drawer::-webkit-scrollbar{width:8px;height:8px}
  #module-body::-webkit-scrollbar-track,.drawer::-webkit-scrollbar-track{background:var(--bg1,#0b1220)}
  #module-body::-webkit-scrollbar-thumb,.drawer::-webkit-scrollbar-thumb{background:var(--line2,#2a3a55);border-radius:8px}
  #module-body::-webkit-scrollbar-thumb:hover,.drawer::-webkit-scrollbar-thumb:hover{background:var(--ice,#7fd0ff)}
  .eco-strip{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:12px;border:1px solid var(--line2,#2a3a55);
    background:linear-gradient(150deg,var(--bg2,#101a2c),var(--bg1,#0b1220));border-radius:16px;margin-bottom:12px}
  .eco-strip .btn{margin:0}
  .eco-bell{position:relative}
  .eco-bell b{position:absolute;top:-6px;right:-6px;background:var(--rose,#ff5d73);color:#fff;border-radius:999px;
    font-size:10px;padding:1px 6px;font-weight:800}
  .eco-wiz{display:grid;gap:10px}
  .eco-wiz button{padding:16px;border-radius:14px;border:1px solid var(--line2,#2a3a55);background:var(--bg2,#101a2c);
    color:var(--dim,#e6f2ff);font-size:15px;font-weight:700;text-align:left;cursor:pointer}
  .eco-wiz button span{display:block;font-size:11.5px;color:var(--faint,#7d8ca3);font-weight:500;margin-top:3px}
  .eco-wiz button:active{border-color:var(--ice,#7fd0ff)}
  .eco-card{border:1px solid var(--line2,#22304a);border-radius:14px;padding:12px;margin-bottom:10px;background:rgba(255,255,255,.02)}
  .eco-t{font-size:14px;font-weight:800;color:var(--dim,#e6f2ff)}
  .eco-s{font-size:11.5px;color:var(--faint,#7d8ca3);margin-top:3px;line-height:1.5}
  .eco-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}
  .eco-rate{font-size:16px;font-weight:800;color:var(--pine,#3ddc97)}
  .eco-urgent{background:rgba(255,93,115,.12);color:var(--rose,#ff5d73);border:1px solid rgba(255,93,115,.4);
    border-radius:999px;font-size:10px;padding:2px 8px;font-weight:700}
  .eco-prog{height:10px;border-radius:999px;background:var(--bg1,#0b1220);border:1px solid var(--line2,#22304a);overflow:hidden;margin:8px 0}
  .eco-prog i{display:block;height:100%;background:linear-gradient(90deg,var(--pine,#3ddc97),var(--ice,#7fd0ff))}
  .eco-chat{max-height:46vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 2px;margin:10px 0}
  .eco-msg{max-width:82%;border-radius:14px;padding:8px 12px;font-size:13px;line-height:1.5}
  .eco-msg.me{align-self:flex-end;background:var(--ice,#7fd0ff);color:#08131f}
  .eco-msg.them{align-self:flex-start;background:var(--bg2,#101a2c);border:1px solid var(--line2,#22304a);color:var(--dim,#cfe9ff)}
  .eco-msg small{display:block;font-size:9.5px;opacity:.65;margin-top:3px}
  .eco-ev{font-size:11.5px;color:var(--faint,#7d8ca3);padding:4px 0;border-bottom:1px dashed var(--line2,#22304a)}
  .eco-ev:last-child{border-bottom:none}
  .eco-stars button{font-size:22px;background:none;border:none;cursor:pointer;padding:2px 4px}
  .eco-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
  `;
  document.head.appendChild(s);
}

/* ---------- СИД И МИГРАЦИЯ ---------- */
const ECO_CATS=['Логистика','Склад','Вахта','Грузоперевозки','Ремонт авто','Строительство и ремонт','Клининг','Курьерская доставка','Спецодежда','Репетиторы','IT и техника','Другое'];
const ECO_DST={new:'Новая',taken:'Взята в работу',in_work:'В работе',done:'Выполнено',confirmed:'Подтверждено',closed:'Закрыта',cancelled:'Отменена',dispute:'Спор'};
const ECO_DC={taken:'var(--ice,#7fd0ff)',in_work:'var(--amber,#ffc24b)',done:'var(--amber,#ffc24b)',closed:'var(--pine,#3ddc97)',cancelled:'var(--faint,#7d8ca3)',dispute:'var(--rose,#ff5d73)',new:'var(--ice,#7fd0ff)'};
function ecoRole(){return db.profile.role==='company'?'company':'seeker'}
function ecoMeId(){return ecoRole()==='company'?'co_'+(db.company.inn||'demo'):db.profile.sid}
function ecoMeName(){return ecoRole()==='company'?db.company.name:db.profile.name}
function ecoNow(){return new Date().toISOString().slice(0,16)}
function ecoTime(){return new Date().toTimeString().slice(0,5)}
function ecoMigrate(){
  const sid=db.profile.sid, coId='co_'+(db.company.inn||'demo');
  if(!db.ecoShifts){
    db.ecoShifts=[
      {id:'sh1',title:'Водитель-экспедитор на день',category:'Логистика',city:'Барнаул',date:dAgo(-1),start:'09:00',end:'18:00',rate:3500,count:2,taken:1,req:['Категория C','Медкнижка'],status:'open',employer:db.company.name,employerId:coId,descr:'Доставка по городу, авто предоставляем.',urgent:true},
      {id:'sh2',title:'Комплектовщик на склад',category:'Склад',city:'Барнаул',date:dAgo(-2),start:'08:00',end:'20:00',rate:2800,count:5,taken:2,req:[],status:'open',employer:'Склад «Южный»',employerId:'co_south',descr:'Сборка заказов, обучение на месте.'},
      {id:'sh3',title:'Вахта: водитель погрузчика 15/15',category:'Вахта',city:'Новоалтайск',date:dAgo(-5),start:'08:00',end:'20:00',rate:45000,count:3,taken:3,req:['Погрузчик','Медкнижка'],status:'full',employer:'Завод «Алтай»',employerId:'co_altay',descr:'Жильё и билет за счёт завода.',cycle:'15/15'},
      {id:'sh4',title:'Грузчик на разгрузку фуры',category:'Логистика',city:'Барнаул',date:dAgo(1),start:'10:00',end:'14:00',rate:1600,count:4,taken:4,req:[],status:'closed',employer:'ТК «Энергия»',employerId:'co_energy',descr:'Разгрузка стройматериалов.'}
    ];
  }
  if(!db.ecoRequests){
    db.ecoRequests=[
      {id:'rq1',kind:'service',category:'Грузоперевозки',title:'Перевезти стройматериалы, 2 рейса',city:'Барнаул',budget:6000,deadline:dAgo(-2),descr:'Газель или камаз, погрузка у заказчика.',author:'Частный заказчик',authorId:'cust1',authorRole:'seeker',status:'open',bids:[{id:'b1',price:5500,comment:'Своя газель, готов завтра.',author:'Павел Штерн',authorId:'c_pavel'}]},
      {id:'rq2',kind:'goods',category:'Спецодежда',title:'Куплю 20 комплектов зимней спецодежды',city:'Барнаул',budget:40000,deadline:dAgo(-7),descr:'Размеры 48-54, утеплённые.',author:db.company.name,authorId:coId,authorRole:'company',status:'open',bids:[]},
      {id:'rq3',kind:'service',category:'Ремонт авто',title:'Диагностика и ремонт Prado 120',city:'Барнаул',budget:15000,deadline:dAgo(-4),descr:'Подвеска и электрика.',author:db.profile.name,authorId:sid,authorRole:'seeker',status:'open',bids:[]}
    ];
  }
  db.ecoRequests.forEach(r=>{if(r.author===db.profile.name)r.authorId=sid;if(r.author===db.company.name)r.authorId=coId});
  if(!db.ecoOffers){
    db.ecoOffers=[{id:'of1',name:'Павел Штерн',offerId:'c_pavel',category:'Курьерская доставка',city:'Барнаул',radius:40,rate:1500,from:dAgo(0),skills:'Вождение, навигация, пунктуальность',status:'active'}];
  }
  if(!db.ecoDeals){
    db.ecoDeals=[
      {id:'dl1',kind:'shift',shiftId:'sh1',title:'Водитель-экспедитор на день',city:'Барнаул',rate:3500,employer:db.company.name,employerId:coId,worker:db.profile.name,workerId:sid,status:'in_work',createdAt:dAgo(0),takenAt:dAgo(0),checkinAt:dAgo(0)+'T09:02',deadline:dAgo(-1),phoneWorker:'+7 900 000-00-01',phoneEmployer:'+7 900 000-00-02',reviewedBy:[],events:[{at:dAgo(0)+'T08:40',text:'Смена взята в работу'},{at:dAgo(0)+'T09:02',text:'Чек-ин на объекте'}]},
      {id:'dl2',kind:'service',requestId:'rq_old',title:'Разгрузка фуры, 4 часа',city:'Барнаул',rate:1600,employer:'ТК «Энергия»',employerId:'co_energy',worker:db.profile.name,workerId:sid,status:'closed',createdAt:dAgo(2),closedAt:dAgo(1),phoneWorker:'+7 900 000-00-01',phoneEmployer:'+7 900 000-00-03',reviewedBy:['worker','employer'],events:[{at:dAgo(2),text:'Заявка взята в работу'},{at:dAgo(1),text:'Подтверждено и оплачено'}]}
    ];
  }
  if(!db.ecoNotifs){
    db.ecoNotifs=[
      {id:'n1',role:'seeker',text:'Заказчик ждёт вас завтра к 9:00 по смене «Водитель-экспедитор на день».',at:ecoNow(),read:false},
      {id:'n2',role:'company',text:db.profile.name+' взял смену «Водитель-экспедитор на день».',at:ecoNow(),read:false}
    ];
  }
  if(!db.ecoFamily)db.ecoFamily={members:['Ева'],goal:{title:'Собрать детей в школу',target:30000,saved:8400},percent:10};
  if(!db.ecoLearning)db.ecoLearning=[];
  if(!db.ecoScore)db.ecoScore={noshow:0,done:2};
  db.ecoDeals.forEach(d=>{
    d.events=d.events||[];d.reviewedBy=d.reviewedBy||[];
    if(!db.threads.some(t=>t.dealId===d.id)){
      db.threads.push({id:'th_'+d.id,dealId:d.id,workerName:d.worker,employerName:d.employer,
        name:d.employer,role:'Сделка · '+d.title,unreadFor:{seeker:1,company:0},
        msgs:[{from:'employer',text:'Здравствуйте! Подтверждаю условия, жду на объекте.',time:'18:20'}]});
    }
  });
  db.threads.forEach(t=>{if(!t.unreadFor)t.unreadFor={seeker:0,company:0}});
  save();
}
function ecoNotify(role,text){
  db.ecoNotifs.unshift({id:uid(),role,text,at:ecoNow(),read:false});
  save();
}
function ecoUnread(role){
  const th=db.threads.reduce((a,t)=>a+((t.unreadFor&&t.unreadFor[role])||0),0);
  const nf=db.ecoNotifs.filter(n=>n.role===role&&!n.read).length;
  return th+nf;
}
function ecoShift(id){return db.ecoShifts.find(s=>s.id===id)}
function ecoDeal(id){return db.ecoDeals.find(d=>d.id===id)}
function ecoReq(id){return db.ecoRequests.find(r=>r.id===id)}
function ecoThread(dealId){return db.threads.find(t=>t.dealId===dealId)}
function ecoEv(d,text){d.events.push({at:ecoNow(),text});}
function ecoMyDeals(){
  const me=ecoMeId();
  return db.ecoDeals.filter(d=>ecoRole()==='company'?d.employerId===me:d.workerId===me);
}
function ecoOpposite(d){return ecoRole()==='company'?{name:d.worker,phone:d.phoneWorker}:{name:d.employer,phone:d.phoneEmployer}}
function ecoDist(city){
  const a=coords(ecoRole()==='company'?db.company.city:db.profile.city),b=coords(city);
  return hav(a,b);
}

/* ---------- ЕДИНАЯ ЗАЯВКА-ХАМЕЛЕОН ---------- */
let ecoWiz=null;
function ecoWizOpen(){
  ecoStyle();ecoWiz={intent:null};
  openDrawer(`<div class="card-title">＋ Одна заявка</div>
    <p style="font-size:12.5px;color:var(--faint);line-height:1.6">Скажите, что нужно — платформа сама создаст смену, заявку, резюме или учебный трек.</p>
    <div class="eco-wiz">
      <button onclick="ecoWizIntent('money')">💰 Нужны деньги<span>Готов взять смены и заказы рядом → анкета исполнителя</span></button>
      <button onclick="ecoWizIntent('person')">👥 Нужен человек<span>Смена, пакет смен или вахта → публикация для исполнителей</span></button>
      <button onclick="ecoWizIntent('service')">🛠 Нужна услуга<span>Заявка на потребность → отклики и смета исполнителей</span></button>
      <button onclick="ecoWizIntent('learn')">🎓 Хочу научиться<span>Профессия под спрос → курс и гарантированные смены</span></button>
    </div>`);
}
function ecoWizIntent(k){
  ecoWiz.intent=k;
  const dl=`<datalist id="eco-city-dl">${CITY_LIST.map(c=>`<option value="${esc(c)}">`).join('')}</datalist>`;
  const cats=`<select class="input" id="w-cat">${ECO_CATS.map(c=>`<option>${esc(c)}</option>`).join('')}</select>`;
  let body='';
  if(k==='money')body=`<label class="lbl">Категория работы</label>${cats}
    <label class="lbl">Город</label><input class="input" id="w-city" list="eco-city-dl" value="${esc(db.profile.city)}">
    <div class="btn-row"><input class="input" id="w-rate" type="number" value="2500" placeholder="Ставка от, ₽" style="flex:1">
    <input class="input" id="w-from" type="date" value="${dAgo(0)}" style="flex:1"></div>
    <label class="lbl">Навыки</label><input class="input" id="w-skills" value="${esc(db.profile.skills||'')}" placeholder="Вождение, категория C">`;
  if(k==='person')body=`<label class="lbl">Кого ищем</label><input class="input" id="w-title" placeholder="Водитель-экспедитор на день">
    <label class="lbl">Категория</label>${cats}
    <label class="lbl">Город</label><input class="input" id="w-city" list="eco-city-dl" value="${esc(db.company.city)}">
    <div class="btn-row"><input class="input" id="w-date" type="date" value="${dAgo(-1)}" style="flex:1">
    <input class="input" id="w-count" type="number" value="1" placeholder="Человек" style="flex:1"></div>
    <div class="btn-row"><input class="input" id="w-start" value="09:00" placeholder="Начало" style="flex:1">
    <input class="input" id="w-end" value="18:00" placeholder="Конец" style="flex:1"></div>
    <label class="lbl">Ставка за смену, ₽ (для вахты — за цикл)</label><input class="input" id="w-rate" type="number" value="3000">
    <label class="lbl">Требования через запятую</label><input class="input" id="w-req" placeholder="Медкнижка, категория C">
    <label class="lbl">Цикл вахты (если вахта)</label><input class="input" id="w-cycle" placeholder="15/15">`;
  if(k==='service')body=`<label class="lbl">Категория</label>${cats}
    <label class="lbl">Что нужно сделать</label><input class="input" id="w-title" placeholder="Перевезти стройматериалы, 2 рейса">
    <label class="lbl">Город</label><input class="input" id="w-city" list="eco-city-dl" value="${esc(db.profile.city)}">
    <div class="btn-row"><input class="input" id="w-budget" type="number" value="5000" placeholder="Бюджет, ₽" style="flex:1">
    <input class="input" id="w-deadline" type="date" value="${dAgo(-3)}" style="flex:1"></div>
    <label class="lbl">Детали</label><textarea class="input" id="w-descr" rows="3"></textarea>`;
  if(k==='learn')body=`<label class="lbl">Какая профессия нужна</label>${cats}
    <label class="lbl">Цель</label><input class="input" id="w-title" placeholder="Водитель погрузчика под смены склада">
    <p style="font-size:12px;color:var(--faint);line-height:1.6">Платформа подберёт курс и свяжет обучение с гарантированными сменами работодателей, которым нужна эта профессия.</p>`;
  openDrawer(`<div class="card-title">${{money:'💰 Нужны деньги',person:'👥 Нужен человек',service:'🛠 Нужна услуга',learn:'🎓 Хочу научиться'}[k]}</div>${dl}${body}
    <div class="eco-row"><button class="btn btn-primary" onclick="ecoWizCreate()">📤 Создать</button>
    <button class="btn btn-ghost" onclick="ecoWizOpen()">← Назад</button></div>`);
}
function ecoWizCreate(){
  const k=ecoWiz.intent,g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
  const city=g('w-city')||db.profile.city;
  if(k==='money'){
    db.ecoOffers.unshift({id:uid(),name:db.profile.name,offerId:db.profile.sid,category:g('w-cat'),city,radius:db.profile.radius_km||40,rate:+g('w-rate')||0,from:g('w-from')||dAgo(0),skills:g('w-skills'),status:'active'});
    db.profile.availability='free';
    save();closeLayers();rerender();toast('Анкета исполнителя опубликована — работодатели видят вас рядом');
    ecoNotify('company','Новый исполнитель рядом: '+db.profile.name+' · '+city);
    return;
  }
  if(k==='person'){
    if(!g('w-title')){toast('Укажите, кого ищем');return}
    const sh={id:uid(),title:g('w-title'),category:g('w-cat'),city,date:g('w-date')||dAgo(-1),start:g('w-start')||'09:00',end:g('w-end')||'18:00',rate:+g('w-rate')||0,count:+g('w-count')||1,taken:0,req:g('w-req').split(',').map(x=>x.trim()).filter(Boolean),status:'open',employer:db.company.name,employerId:ecoMeId(),descr:g('w-descr')||'',cycle:g('w-cycle')||null,urgent:false};
    Object.assign(sh,coords(city));
    db.ecoShifts.unshift(sh);
    save();closeLayers();rerender();toast('Смена опубликована: '+sh.title);
    ecoNotify('seeker','Новая смена рядом: '+sh.title+' · '+money(sh.rate));
    return;
  }
  if(k==='service'){
    if(!g('w-title')){toast('Опишите, что нужно сделать');return}
    db.ecoRequests.unshift({id:uid(),kind:'service',category:g('w-cat'),title:g('w-title'),city,budget:+g('w-budget')||0,deadline:g('w-deadline')||null,descr:g('w-descr'),author:ecoMeName(),authorId:ecoMeId(),authorRole:ecoRole(),status:'open',bids:[]});
    save();closeLayers();rerender();toast('Заявка опубликована — исполнители откликнутся со сметой');
    ecoNotify(ecoRole()==='company'?'seeker':'company','Новая заявка: '+g('w-title')+' · '+city);
    return;
  }
  if(k==='learn'){
    db.ecoLearning.unshift({id:uid(),category:g('w-cat'),goal:g('w-title')||g('w-cat'),createdAt:dAgo(0),status:'подбор курса'});
    save();closeLayers();openModule('courses');toast('Учебный трек создан — выбирайте курс под спрос');
  }
}

/* ---------- СМЕНЫ ---------- */
function ecoShiftsMod(st){
  ecoStyle();
  st=st||{};modState['eco-shifts']=st;
  if(st.cat===undefined)st.cat='all';
  if(st.radius===undefined)st.radius=100;
  if(st.sort===undefined)st.sort='date';
  const isCo=ecoRole()==='company';
  if(isCo){
    const mine=db.ecoShifts.filter(s=>s.employerId===ecoMeId());
    return `<div class="card"><div class="eco-row" style="margin:0 0 10px">
      <button class="btn btn-primary btn-sm" onclick="ecoWizIntent('person')">＋ Новая смена / вахта</button>
      <button class="btn btn-ghost btn-sm" onclick="openModule('eco-deals')">Сделки по сменам</button></div>
      ${mine.map(s=>`<div class="eco-card"><div class="eco-t">${esc(s.title)} ${s.status==='closed'?'<span class="pill p-dim">закрыта</span>':s.status==='full'?'<span class="pill p-ok">укомплектована</span>':'<span class="pill p-ok">открыта</span>'}</div>
      <div class="eco-s">${esc(s.city)} · ${fdate(s.date)} · ${s.start}–${s.end} · ${money(s.rate)}${s.cycle?' · вахта '+esc(s.cycle):''}</div>
      <div class="eco-s">Взято: <b style="color:var(--ice)">${s.taken}/${s.count}</b> · требований: ${s.req.length?s.req.map(esc).join(', '):'нет'}</div>
      <div class="eco-row"><button class="btn btn-sm btn-ghost" onclick="ecoShiftToggle('${s.id}')">${s.status==='closed'?'Открыть снова':'Закрыть набор'}</button>
      <button class="btn btn-sm btn-ghost" onclick="openModule('eco-deals')">Кто взял →</button></div></div>`).join('')||'<div class="empty">Смен пока нет. Создайте первую — исполнители рядом возьмут её в работу.</div>'}</div>`;
  }
  let rows=db.ecoShifts.filter(s=>s.status==='open');
  if(st.cat!=='all')rows=rows.filter(s=>s.category===st.cat);
  rows=rows.filter(s=>{const d=ecoDist(s.city);return d==null||d<=st.radius||cityKey(s.city)===cityKey(db.profile.city)});
  if(st.sort==='rate')rows=[...rows].sort((a,b)=>b.rate-a.rate);
  else if(st.sort==='dist')rows=[...rows].sort((a,b)=>(ecoDist(a.city)||9999)-(ecoDist(b.city)||9999));
  else rows=[...rows].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  return `<div class="card">
    <div class="eco-row" style="margin:0 0 8px">
      <select class="input" style="flex:1" onchange="modState['eco-shifts'].cat=this.value;renderModule()">
        <option value="all">Все категории</option>${ECO_CATS.map(c=>`<option ${st.cat===c?'selected':''}>${esc(c)}</option>`).join('')}</select>
      <select class="input" style="flex:1" onchange="modState['eco-shifts'].sort=this.value;renderModule()">
        <option value="date" ${st.sort==='date'?'selected':''}>По дате</option>
        <option value="rate" ${st.sort==='rate'?'selected':''}>По ставке</option>
        <option value="dist" ${st.sort==='dist'?'selected':''}>По расстоянию</option></select></div>
    <label class="lbl">Радиус: <b>${st.radius} км</b></label>
    <input type="range" min="10" max="500" step="10" value="${st.radius}" style="width:100%;accent-color:var(--ice)" oninput="modState['eco-shifts'].radius=+this.value" onchange="renderModule()">
    <div class="eco-s">Свободных смен рядом: <b style="color:var(--pine)">${rows.length}</b></div></div>
    ${rows.map(s=>{const d=ecoDist(s.city);const mine=db.ecoDeals.some(x=>x.shiftId===s.id&&x.workerId===db.profile.sid&&['taken','in_work','done'].includes(x.status));
    return `<div class="eco-card"><div class="eco-t">${esc(s.title)} ${s.urgent?'<span class="eco-urgent">срочно</span>':''}</div>
    <div class="eco-s">${esc(s.employer)} · ${esc(s.city)}${d!=null?' · '+Math.round(d)+' км':''} · ${fdate(s.date)} · ${s.start}–${s.end}${s.cycle?' · вахта '+esc(s.cycle):''}</div>
    <div class="eco-s">Свободно мест: ${s.count-s.taken} из ${s.count}${s.req.length?' · нужно: '+s.req.map(esc).join(', '):''}</div>
    <div class="eco-row"><span class="eco-rate">${money(s.rate)}</span>
    ${mine?'<span class="pill p-ok">вы взяли</span>':`<button class="btn btn-sm btn-primary" onclick="ecoTakeShift('${s.id}')">Взять в работу</button>`}
    <button class="btn btn-sm btn-ghost" onclick="ecoShiftView('${s.id}')">Подробнее</button></div></div>`}).join('')||'<div class="empty">Смен рядом нет — расширьте радиус или оставьте анкету «Нужны деньги».</div>'}`;
}
function ecoShiftView(id){
  const s=ecoShift(id);if(!s)return;
  openDrawer(`<div class="card-title">${esc(s.title)}</div>
    <div class="eco-s">${esc(s.employer)} · ${esc(s.city)} · ${fdate(s.date)} · ${s.start}–${s.end}</div>
    <div class="eco-row"><span class="eco-rate">${money(s.rate)}</span><span class="pill p-ok">${s.count-s.taken} мест</span></div>
    <p style="font-size:13px;color:var(--dim);line-height:1.6;margin-top:10px">${esc(s.descr||'Описание не заполнено')}</p>
    ${s.req.length?`<div class="chips">${s.req.map(r=>`<span class="chip on">${esc(r)}</span>`).join('')}</div>`:''}
    <div class="eco-row"><button class="btn btn-primary" onclick="ecoTakeShift('${s.id}');closeLayers()">Взять в работу</button></div>`);
}
function ecoShiftToggle(id){
  const s=ecoShift(id);if(!s||s.employerId!==ecoMeId())return;
  s.status=s.status==='closed'?'open':'closed';
  save();renderModule();toast(s.status==='closed'?'Набор закрыт':'Смена снова открыта');
}
function ecoTakeShift(id){
  const s=ecoShift(id);if(!s)return;
  if(s.status!=='open'||s.taken>=s.count){toast('Мест уже нет');return}
  if(db.ecoDeals.some(d=>d.shiftId===id&&d.workerId===db.profile.sid&&['taken','in_work','done'].includes(d.status))){toast('Вы уже взяли эту смену');return}
  const d={id:uid(),kind:'shift',shiftId:id,title:s.title,city:s.city,rate:s.rate,employer:s.employer,employerId:s.employerId,
    worker:db.profile.name,workerId:db.profile.sid,status:'taken',createdAt:ecoNow(),takenAt:ecoNow(),deadline:s.date,
    phoneWorker:db.profile.phone||'+7 900 000-00-01',phoneEmployer:'+7 900 000-00-02',reviewedBy:[],events:[]};
  ecoEv(d,'Смена взята в работу');
  db.ecoDeals.unshift(d);
  s.taken++;if(s.taken>=s.count)s.status='full';
  db.threads.push({id:'th_'+d.id,dealId:d.id,workerName:d.worker,employerName:d.employer,name:d.employer,role:'Смена · '+s.title,unreadFor:{seeker:0,company:1},msgs:[{from:'worker',text:'Здравствуйте! Взял смену, буду в срок.',time:ecoTime()}]});
  ecoNotify('company',db.profile.name+' взял смену «'+s.title+'»');
  save();rerender();toast('Смена ваша. Чек-ин на объекте откроется в сделке');
  ecoDealDrawer(d.id);
}

/* ---------- ЛЕНТА ПОТРЕБНОСТЕЙ И МОИ ЗАЯВКИ ---------- */
function ecoFeedMod(st){
  ecoStyle();st=st||{};modState['eco-feed']=st;
  if(st.tab===undefined)st.tab='req';
  if(st.cat===undefined)st.cat='all';
  if(st.q===undefined)st.q='';
  const isCo=ecoRole()==='company';
  const tabs=`<div class="eco-tabs"><button class="chip ${st.tab==='req'?'on':''}" onclick="modState['eco-feed'].tab='req';renderModule()">📋 Заявки заказчиков</button>
    ${isCo?`<button class="chip ${st.tab==='offers'?'on':''}" onclick="modState['eco-feed'].tab='offers';renderModule()">🙋 Исполнители рядом</button>`:''}</div>`;
  if(st.tab==='offers'){
    const offs=db.ecoOffers.filter(o=>o.status==='active'&&(st.cat==='all'||o.category===st.cat));
    return `<div class="card">${tabs}<select class="input" onchange="modState['eco-feed'].cat=this.value;renderModule()"><option value="all">Все категории</option>${ECO_CATS.map(c=>`<option ${st.cat===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
    ${offs.map(o=>`<div class="eco-card"><div class="eco-t">${esc(o.name)}</div>
    <div class="eco-s">${esc(o.category)} · ${esc(o.city)} · радиус ${o.radius} км · от ${money(o.rate)} · свободен с ${fdate(o.from)}</div>
    <div class="eco-s">${esc(o.skills)}</div>
    <div class="eco-row"><button class="btn btn-sm btn-primary" onclick="ecoInviteOffer('${o.id}')">📅 Пригласить на собеседование</button></div></div>`).join('')||'<div class="empty">Анкет исполнителей пока нет.</div>'}`;
  }
  let rows=db.ecoRequests.filter(r=>r.status==='open'&&r.authorId!==ecoMeId());
  if(st.cat!=='all')rows=rows.filter(r=>r.category===st.cat);
  if(st.q)rows=rows.filter(r=>(r.title+' '+r.city+' '+r.category).toLowerCase().includes(st.q.toLowerCase()));
  return `<div class="card">${tabs}
    <input class="input" placeholder="🔍 Поиск заявок" value="${esc(st.q)}" oninput="modState['eco-feed'].q=this.value;renderModule()">
    <select class="input" onchange="modState['eco-feed'].cat=this.value;renderModule()"><option value="all">Все категории</option>${ECO_CATS.map(c=>`<option ${st.cat===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
    ${rows.map(r=>`<div class="eco-card"><div class="eco-t">${r.kind==='goods'?'📦':'🛠'} ${esc(r.title)}</div>
    <div class="eco-s">${esc(r.author)} · ${esc(r.city)} · ${esc(r.category)}${r.deadline?' · до '+fdate(r.deadline):''} · откликов: ${r.bids.length}</div>
    <div class="eco-s">${esc(r.descr||'')}</div>
    <div class="eco-row"><span class="eco-rate">${money(r.budget)}</span>
    ${r.kind==='service'?`<button class="btn btn-sm btn-primary" onclick="ecoTakeRequest('${r.id}')">Взять в работу</button>`:''}
    <button class="btn btn-sm btn-ghost" onclick="ecoBidOpen('${r.id}')">Предложить цену</button></div></div>`).join('')||'<div class="empty">Открытых заявок нет. Заказчики оставляют их через «＋ Одна заявка».</div>'}`;
}
function ecoInviteOffer(id){
  const o=db.ecoOffers.find(x=>x.id===id);if(!o)return;
  db.interviews.unshift({id:uid(),candidate:o.name,vacancy:o.category,dt:dAgo(-1)+'T10:00',status:'Запланировано'});
  ecoNotify('seeker',db.company.name+' приглашает вас на собеседование: '+o.category);
  save();rerender();toast('Собеседование назначено: '+o.name);
}
function ecoBidOpen(id){
  const r=ecoReq(id);if(!r)return;
  openDrawer(`<div class="card-title">Предложить цену</div><div class="eco-s">${esc(r.title)} · бюджет ${money(r.budget)}</div>
    <label class="lbl">Моя цена, ₽</label><input class="input" id="eco-bid-price" type="number" value="${r.budget}">
    <label class="lbl">Комментарий</label><textarea class="input" id="eco-bid-comment" rows="3" placeholder="Сроки, условия, чем подтверждаете качество"></textarea>
    <div class="eco-row"><button class="btn btn-primary" onclick="ecoBidSend('${id}')">📨 Отправить отклик</button></div>`);
}
function ecoBidSend(id){
  const r=ecoReq(id);if(!r)return;
  const p=document.getElementById('eco-bid-price'),c=document.getElementById('eco-bid-comment');
  const price=+ (p?p.value:0)||0;
  if(!price){toast('Укажите цену');return}
  r.bids.push({id:uid(),price,comment:c?c.value.trim():'',author:ecoMeName(),authorId:ecoMeId()});
  ecoNotify(r.authorRole==='company'?'company':'seeker','Новый отклик на «'+r.title+'»: '+money(price)+' от '+ecoMeName());
  save();closeLayers();rerender();toast('Отклик отправлен заказчику');
}
function ecoMyReqMod(){
  ecoStyle();
  const mine=db.ecoRequests.filter(r=>r.authorId===ecoMeId());
  const learn=db.ecoLearning||[];
  return `<div class="card"><div class="eco-row" style="margin:0 0 10px"><button class="btn btn-primary btn-sm" onclick="ecoWizIntent('service')">＋ Новая заявка</button></div>
  ${mine.map(r=>`<div class="eco-card"><div class="eco-t">${esc(r.title)} ${r.status==='open'?'<span class="pill p-ok">открыта</span>':r.status==='taken'?'<span class="pill p-ok">в работе</span>':'<span class="pill p-dim">закрыта</span>'}</div>
  <div class="eco-s">${esc(r.category)} · ${esc(r.city)} · бюджет ${money(r.budget)}${r.deadline?' · до '+fdate(r.deadline):''}</div>
  ${r.bids.map(b=>`<div class="eco-card" style="margin:8px 0 0"><div class="eco-t" style="font-size:12.5px">${esc(b.author)} · ${money(b.price)}</div>
  <div class="eco-s">${esc(b.comment||'')}</div>
  ${r.status==='open'?`<div class="eco-row"><button class="btn btn-sm btn-primary" onclick="ecoAcceptBid('${r.id}','${b.id}')">Принять отклик</button></div>`:''}</div>`).join('')||'<div class="eco-s">Откликов пока нет.</div>'}
  <div class="eco-row">${r.status==='open'?`<button class="btn btn-sm btn-ghost" onclick="ecoReqClose('${r.id}')">Закрыть заявку</button>`:''}</div></div>`).join('')||'<div class="empty">Ваших заявок пока нет.</div>'}
  ${learn.length?`<div class="card-title" style="margin-top:14px">Учебные треки</div>${learn.map(l=>`<div class="eco-card"><div class="eco-t">🎓 ${esc(l.goal)}</div><div class="eco-s">${esc(l.category)} · ${esc(l.status)}</div><div class="eco-row"><button class="btn btn-sm btn-ghost" onclick="openModule('courses')">Выбрать курс</button></div></div>`).join('')}`:''}</div>`;
}
function ecoReqClose(id){
  const r=ecoReq(id);if(!r||r.authorId!==ecoMeId())return;
  r.status='closed';save();renderModule();toast('Заявка закрыта');
}
function ecoAcceptBid(rid,bid){
  const r=ecoReq(rid);if(!r)return;
  const b=r.bids.find(x=>x.id===bid);if(!b)return;
  const d={id:uid(),kind:r.kind==='goods'?'goods':'service',requestId:r.id,title:r.title,city:r.city,rate:b.price,
    employer:r.author,employerId:r.authorId,worker:b.author,workerId:b.authorId,status:'taken',createdAt:ecoNow(),takenAt:ecoNow(),
    deadline:r.deadline,phoneWorker:'+7 900 000-00-01',phoneEmployer:'+7 900 000-00-02',reviewedBy:[],events:[]};
  ecoEv(d,'Отклик принят, сделка создана');
  db.ecoDeals.unshift(d);r.status='taken';
  db.threads.push({id:'th_'+d.id,dealId:d.id,workerName:d.worker,employerName:d.employer,name:d.employer,role:'Сделка · '+r.title,unreadFor:{seeker:1,company:1},msgs:[{from:'employer',text:'Принял ваш отклик. Обсудим детали здесь.',time:ecoTime()}]});
  ecoNotify(b.authorId===db.profile.sid?'seeker':'company',db.company.name+' принял ваш отклик на «'+r.title+'»');
  save();closeLayers();rerender();toast('Сделка создана: '+b.author);
  ecoDealDrawer(d.id);
}
function ecoTakeRequest(id){
  const r=ecoReq(id);if(!r||r.status!=='open')return;
  const d={id:uid(),kind:'service',requestId:r.id,title:r.title,city:r.city,rate:r.budget,employer:r.author,employerId:r.authorId,
    worker:ecoMeName(),workerId:ecoMeId(),status:'taken',createdAt:ecoNow(),takenAt:ecoNow(),deadline:r.deadline,
    phoneWorker:'+7 900 000-00-01',phoneEmployer:'+7 900 000-00-02',reviewedBy:[],events:[]};
  ecoEv(d,'Заявка взята в работу');
  db.ecoDeals.unshift(d);r.status='taken';
  db.threads.push({id:'th_'+d.id,dealId:d.id,workerName:d.worker,employerName:d.employer,name:d.employer,role:'Сделка · '+r.title,unreadFor:{seeker:0,company:1},msgs:[{from:'worker',text:'Здравствуйте! Беру заявку в работу.',time:ecoTime()}]});
  ecoNotify(r.authorRole==='company'?'company':'seeker',ecoMeName+' взял вашу заявку «'+r.title+'»');
  save();rerender();toast('Заявка ваша. Детали — в чате сделки');
  ecoDealDrawer(d.id);
}

/* ---------- СДЕЛКИ: СТАТУСЫ, ГАРАНТИИ, ОПЛАТА ---------- */
function ecoDealsMod(st){
  ecoStyle();st=st||{};modState['eco-deals']=st;
  if(st.f===undefined)st.f='all';
  let rows=ecoMyDeals();
  if(st.f==='active')rows=rows.filter(d=>['taken','in_work','done'].includes(d.status));
  if(st.f==='done')rows=rows.filter(d=>['closed','cancelled'].includes(d.status));
  if(st.f==='dispute')rows=rows.filter(d=>d.status==='dispute');
  const earned=rows.filter(d=>d.status==='closed').reduce((a,d)=>a+d.rate,0);
  return `<div class="card"><div class="kpis"><div class="kpi"><b>${rows.length}</b><span>СДЕЛОК</span></div>
  <div class="kpi"><b>${money(earned)}</b><span>ЗАРАБОТАНО / ВЫПЛАЧЕНО</span></div>
  <div class="kpi"><b>${db.ecoScore.noshow}</b><span>НЕЯВОК</span></div></div>
  <div class="eco-tabs">${[['all','Все'],['active','В работе'],['done','Завершённые'],['dispute','Споры']].map(([k,t])=>`<button class="chip ${st.f===k?'on':''}" onclick="modState['eco-deals'].f='${k}';renderModule()">${t}</button>`).join('')}</div></div>
  ${rows.map(d=>`<div class="eco-card" onclick="ecoDealDrawer('${d.id}')" style="cursor:pointer">
  <div class="eco-t">${d.kind==='shift'?'🕒':d.kind==='goods'?'📦':''} ${esc(d.title)}</div>
  <div class="eco-s">${esc(ecoOpposite(d).name)} · ${esc(d.city)} · ${money(d.rate)}</div>
  <div class="eco-row"><span class="pill" style="background:rgba(255,255,255,.08);color:${ECO_DC[d.status]||'var(--dim)'}">${ECO_DST[d.status]||d.status}</span>
  <span class="eco-s">${d.checkinAt?'чек-ин '+String(d.checkinAt).slice(11,16):''}</span></div></div>`).join('')||'<div class="empty">Сделок пока нет. Возьмите смену или заявку в работу.</div>'}`;
}
function ecoDealDrawer(id){
  const d=ecoDeal(id);if(!d)return;
  ecoStyle();
  const role=ecoRole(),op=ecoOpposite(d);
  const acts=[];
  acts.push(`<button class="btn btn-sm btn-ghost" onclick="ecoChatOpen('th_${d.id}')">💬 Чат</button>`);
  acts.push(`<button class="btn btn-sm btn-ghost" onclick="ecoCall('${d.id}')">📞 Позвонить</button>`);
  acts.push(`<button class="btn btn-sm btn-ghost" onclick="ecoVideo('${d.id}')">🎥 Видео</button>`);
  if(role==='seeker'){
    if(d.status==='taken')acts.push(`<button class="btn btn-sm btn-primary" onclick="ecoCheckin('${d.id}')">📍 Чек-ин на объекте</button>`,`<button class="btn btn-sm btn-ghost" onclick="ecoCancel('${d.id}')">Отказаться</button>`);
    if(d.status==='in_work')acts.push(`<button class="btn btn-sm btn-primary" onclick="ecoDone('${d.id}')">✅ Выполнено</button>`,`<button class="btn btn-sm btn-ghost" onclick="ecoDispute('${d.id}')">Спор</button>`);
    if(d.status==='done')acts.push(`<button class="btn btn-sm btn-ghost" onclick="ecoRemind('${d.id}')">Напомнить о подтверждении</button>`);
    if(d.status==='closed'&&!d.reviewedBy.includes('worker'))acts.push(`<button class="btn btn-sm btn-primary" onclick="ecoReviewOpen('${d.id}')">⭐ Оценить заказчика</button>`);
  }else{
    if(d.status==='taken')acts.push(`<button class="btn btn-sm btn-ghost" onclick="ecoCancel('${d.id}')">Отменить</button>`);
    if(d.status==='in_work')acts.push(`<button class="btn btn-sm btn-primary" onclick="ecoConfirm('${d.id}')">✅ Принять и оплатить</button>`,`<button class="btn btn-sm btn-ghost" onclick="ecoDispute('${d.id}')">Спор</button>`);
    if(d.status==='done')acts.push(`<button class="btn btn-sm btn-primary" onclick="ecoConfirm('${d.id}')">✅ Подтвердить и оплатить</button>`,`<button class="btn btn-sm btn-ghost" onclick="ecoDispute('${d.id}')">Спор</button>`);
    if(d.status==='closed'&&!d.reviewedBy.includes('employer'))acts.push(`<button class="btn btn-sm btn-primary" onclick="ecoReviewOpen('${d.id}')">⭐ Оценить исполнителя</button>`);
  }
  if(d.status==='dispute')acts.push(`<button class="btn btn-sm btn-ghost" onclick="ecoComplaint('${d.id}')">📄 Жалоба / претензия</button>`,`<button class="btn btn-sm btn-ghost" onclick="ecoResolve('${d.id}')">Закрыть соглашением</button>`);
  openDrawer(`<div class="card-title">${d.kind==='shift'?'🕒 Смена':d.kind==='goods'?'📦 Товар':'🛠 Услуга'} · <span style="color:${ECO_DC[d.status]}">${ECO_DST[d.status]}</span></div>
  <h3 style="margin:6px 0">${esc(d.title)}</h3>
  <div class="eco-s">${esc(op.name)} · ${esc(d.city)} · <b style="color:var(--pine)">${money(d.rate)}</b>${d.deadline?' · срок '+fdate(d.deadline):''}</div>
  <div class="eco-row">${acts.join('')}</div>
  <div class="card-title" style="margin-top:14px">История сделки</div>
  ${d.events.map(e=>`<div class="eco-ev">${esc(String(e.at).replace('T',' '))} · ${esc(e.text)}</div>`).join('')}
  ${d.meetingUrl?`<div class="eco-s" style="margin-top:8px">Комната: <a href="${esc(d.meetingUrl)}" target="_blank" rel="noopener" style="color:var(--ice)">${esc(d.meetingUrl)}</a></div>`:''}`);
}
function ecoCheckin(id){
  const d=ecoDeal(id);if(!d)return;
  d.status='in_work';d.checkinAt=ecoNow();ecoEv(d,'Чек-ин на объекте');
  ecoNotify('company',d.worker+' вышел на объект по «'+d.title+'»');
  save();rerender();ecoDealDrawer(id);toast('Чек-ин зафиксирован. Время пошло');
}
function ecoDone(id){
  const d=ecoDeal(id);if(!d)return;
  d.status='done';d.checkoutAt=ecoNow();ecoEv(d,'Исполнитель отметил выполнение');
  ecoNotify('company',d.worker+' выполнил «'+d.title+'». Подтвердите и оплатите');
  save();rerender();ecoDealDrawer(id);toast('Отправлено заказчику на подтверждение');
}
function ecoRemind(id){
  const d=ecoDeal(id);if(!d)return;
  ecoNotify('company','Напоминание: подтвердите выполнение «'+d.title+'»');
  save();toast('Напоминание отправлено заказчику');
}
function ecoConfirm(id){
  const d=ecoDeal(id);if(!d)return;
  d.status='closed';d.closedAt=ecoNow();ecoEv(d,'Подтверждено заказчиком, выплата сразу');
  if(d.workerId===db.profile.sid){
    db.incomes.unshift({id:uid(),date:dAgo(0),cat:d.kind==='shift'?'Смена':'Подработка',amount:d.rate,note:'Сибиряк · выплата сразу · '+d.title});
    const f=db.ecoFamily,add=Math.round(d.rate*(f.percent||0)/100);
    f.goal.saved+=add;
    db.ecoScore.done++;
  }
  if(d.employerId===ecoMeId()&&ecoRole()==='company'){
    db.documents.unshift({id:uid(),kind:'Акт',type:d.kind==='shift'?'Смена':'Услуга',person:d.worker,no:'А-'+String(Date.now()).slice(-6),date:dAgo(0),status:'Подписан'});
  }
  ecoNotify(d.workerId===db.profile.sid?'company':'seeker','Сделка «'+d.title+'» закрыта. Оплата '+money(d.rate)+' подтверждена');
  save();rerender();ecoDealDrawer(id);
  toast('Подтверждено. Выплата '+money(d.rate)+' — сразу');
  ecoReviewOpen(id);
}
function ecoCancel(id){
  const d=ecoDeal(id);if(!d)return;
  const reason=prompt('Причина отмены:','Не могу выйти');
  if(reason===null)return;
  d.status='cancelled';ecoEv(d,'Отмена: '+reason);
  if(d.shiftId){const s=ecoShift(d.shiftId);if(s){s.taken=Math.max(0,s.taken-1);if(s.status==='full')s.status='open';s.urgent=true;}}
  if(d.workerId===db.profile.sid)db.ecoScore.noshow++;
  ecoNotify(d.workerId===db.profile.sid?'company':'seeker','Отмена по «'+d.title+'»: '+reason+'. Открыт пул замены');
  save();closeLayers();rerender();toast('Сделка отменена. Замена поднята автоматически');
}
function ecoDispute(id){
  const d=ecoDeal(id);if(!d)return;
  d.status='dispute';ecoEv(d,'Открыт спор');
  ecoNotify(d.workerId===db.profile.sid?'company':'seeker','Спор по «'+d.title+'». Платформа собирает доказательства');
  save();rerender();ecoComplaint(id);
}
function ecoResolve(id){
  const d=ecoDeal(id);if(!d)return;
  d.status='closed';ecoEv(d,'Спор закрыт соглашением сторон');
  save();rerender();ecoDealDrawer(id);toast('Спор закрыт соглашением');
}
function ecoComplaint(id){
  const d=ecoDeal(id);if(!d)return;
  const txt=`ПРЕТЕНЗИЯ / ЖАЛОБА\nпо сделке «${d.title}»\n\nЗаказчик: ${d.employer}\nИсполнитель: ${d.worker}\nСумма: ${d.rate} руб.\nГород: ${d.city}\nСоздана: ${d.createdAt}\nСтатус: ${ECO_DST[d.status]}\n\nХронология:\n${d.events.map(e=>'- '+String(e.at).replace('T',' ')+': '+e.text).join('\n')}\n\nТребование: обязать сторону исполнить обязательства по сделке либо выплатить сумму ${d.rate} руб. и компенсацию простоя.\nПриложения: история сделки, переписка, чек-ин/чек-аут, акт.\n\nКуда: претензия стороне; при отказе — ГИТ (для трудовых отношений), суд по месту исполнения, прокуратура.\nСформировано платформой «Сибиряк» ${new Date().toLocaleString('ru-RU')}`;
  openDrawer(`<div class="card-title">📄 Защита: документ из данных сделки</div>
  <textarea class="input" id="eco-complaint" style="min-height:300px;font-size:11.5px;font-family:monospace">${esc(txt)}</textarea>
  <div class="eco-row"><button class="btn btn-primary btn-sm" onclick="ecoCopyText('eco-complaint')">📋 Копировать</button>
  <button class="btn btn-ghost btn-sm" onclick="ecoDownload('eco-complaint','pretenzia-${d.id}.txt')">⬇️ Скачать</button></div>`);
}
function ecoReviewOpen(id){
  const d=ecoDeal(id);if(!d)return;
  const role=ecoRole();
  if(d.reviewedBy.includes(role)){toast('Вы уже оценили эту сделку');return}
  openDrawer(`<div class="card-title">⭐ Оценка по сделке</div><div class="eco-s">${esc(d.title)} · ${esc(ecoOpposite(d).name)}</div>
  <div class="eco-stars" id="eco-stars">${[1,2,3,4,5].map(n=>`<button onclick="ecoReviewSend('${id}',${n})">${'★'.repeat(n)}</button>`).join('')}</div>
  <label class="lbl">Комментарий</label><textarea class="input" id="eco-review-text" rows="3" placeholder="Что прошло хорошо, что улучшить"></textarea>
  <div class="eco-s">Оценка попадёт в рейтинг стороны и её рабочий паспорт.</div>`);
}
function ecoReviewSend(id,stars){
  const d=ecoDeal(id);if(!d)return;
  const t=document.getElementById('eco-review-text');
  db.reviews.unshift({id:uid(),author:ecoMeName(),stars,text:(t?t.value.trim():'')||'Оценка '+stars+' из 5',date:dAgo(0),dealId:id});
  d.reviewedBy.push(ecoRole());
  ecoEv(d,'Оценка '+stars+'★ от '+ecoMeName());
  ecoNotify(ecoRole()==='company'?'seeker':'company','Новая оценка по «'+d.title+'»: '+stars+'★');
  save();closeLayers();rerender();toast('Спасибо! Оценка учтена в рейтинге');
}

/* ---------- СВЯЗЬ: ЧАТ, ЗВОНОК, ВИДЕО ---------- */
function ecoCall(id){
  const d=ecoDeal(id);if(!d)return;
  const ph=ecoOpposite(d).phone;
  if(!ph){toast('Номер скрыт до подтверждения сделки');return}
  ecoEv(d,'Звонок '+ecoMeName());save();
  location.href='tel:'+ph.replace(/[^\d+]/g,'');
}
function ecoVideo(id){
  const d=ecoDeal(id);if(!d)return;
  d.meetingUrl='https://meet.jit.si/sibiryak-'+d.id;
  ecoEv(d,'Открыта видео-комната');save();
  window.open(d.meetingUrl,'_blank');
  toast('Комната открыта. Ссылка сохранена в сделке');
}
function ecoInboxMod(){
  ecoStyle();
  const role=ecoRole();
  const ths=db.threads.filter(t=>t.dealId?(role==='company'?t.employerName===db.company.name:t.workerName===db.profile.name):(role==='company'));
  return `<div class="card">${ths.map(t=>{
    const other=role==='company'?(t.workerName||t.name):(t.employerName||t.name);
    const last=t.msgs[t.msgs.length-1];
    const un=(t.unreadFor&&t.unreadFor[role])||0;
    return `<div class="eco-card" style="cursor:pointer" onclick="ecoChatOpen('${t.id}')">
    <div class="eco-t">${esc(other)} ${un?`<span class="eco-urgent">${un}</span>`:''}</div>
    <div class="eco-s">${esc(t.role||'Диалог')}</div>
    <div class="eco-s">${last?esc(last.text).slice(0,70):''}</div></div>`}).join('')||'<div class="empty">Диалогов пока нет. Они создаются автоматически при сделке.</div>'}</div>`;
}
function ecoChatOpen(tid){
  const t=db.threads.find(x=>x.id===tid);if(!t)return;
  ecoStyle();
  const role=ecoRole();
  if(t.unreadFor)t.unreadFor[role]=0;
  save();
  const other=role==='company'?(t.workerName||t.name):(t.employerName||t.name);
  const d=t.dealId?ecoDeal(t.dealId):null;
  openDrawer(`<div class="card-title">💬 ${esc(other)}</div><div class="eco-s">${esc(t.role||'')}</div>
  ${d?`<div class="eco-row"><button class="btn btn-sm btn-ghost" onclick="ecoCall('${d.id}')">📞</button>
  <button class="btn btn-sm btn-ghost" onclick="ecoVideo('${d.id}')">🎥</button>
  <button class="btn btn-sm btn-ghost" onclick="ecoDealDrawer('${d.id}')">Сделка →</button></div>`:''}
  <div class="eco-chat" id="eco-chat-box">${t.msgs.map(m=>{
    const mine=(m.from==='me')||(m.from===role)||(role==='company'&&m.from==='employer')||(role==='seeker'&&m.from==='worker');
    return `<div class="eco-msg ${mine?'me':'them'}">${esc(m.text)}<small>${esc(m.time||'')}</small></div>`}).join('')}</div>
  <div class="eco-row"><input class="input" id="eco-chat-input" placeholder="Сообщение…" style="flex:1">
  <button class="btn btn-primary btn-sm" onclick="ecoSend('${t.id}')">➤</button></div>`);
  const box=document.getElementById('eco-chat-box');if(box)box.scrollTop=box.scrollHeight;
}
function ecoSend(tid){
  const t=db.threads.find(x=>x.id===tid);if(!t)return;
  const i=document.getElementById('eco-chat-input');
  const text=i?i.value.trim():'';
  if(!text)return;
  const role=ecoRole();
  t.msgs.push({from:role==='company'?'employer':'worker',text,time:ecoTime()});
  if(t.unreadFor)t.unreadFor[role==='company'?'seeker':'company']=(t.unreadFor[role==='company'?'seeker':'company']||0)+1;
  save();ecoChatOpen(tid);
}

/* ---------- СОБЕСЕДОВАНИЯ У СОИСКАТЕЛЯ ---------- */
function ecoInterviewsMod(){
  ecoStyle();
  const mine=db.interviews.filter(i=>i.candidate===db.profile.name);
  return `<div class="card">${mine.map(i=>`<div class="eco-card">
  <div class="eco-t">📅 ${esc(i.vacancy)}</div>
  <div class="eco-s">${esc(String(i.dt).replace('T',' '))} · ${esc(i.status)}</div>
  <div class="eco-row">
  <button class="btn btn-sm btn-primary" onclick="ecoJoinInterview('${i.id}')">🎥 Войти в комнату</button>
  ${i.status==='Запланировано'?`<button class="btn btn-sm btn-ghost" onclick="ecoInterviewStatus('${i.id}','Подтверждено')">Подтвердить участие</button>`:''}
  ${i.status!=='Проведено'?`<button class="btn btn-sm btn-ghost" onclick="ecoInterviewStatus('${i.id}','Проведено')">Завершить</button>`:''}
  </div></div>`).join('')||'<div class="empty">Приглашений пока нет. Работодатели назначают их из подбора и анкет исполнителей.</div>'}</div>`;
}
function ecoJoinInterview(id){
  const i=db.interviews.find(x=>x.id===id);if(!i)return;
  i.meetingUrl='https://meet.jit.si/sibiryak-int-'+i.id;
  save();window.open(i.meetingUrl,'_blank');toast('Комната собеседования открыта');
}
function ecoInterviewStatus(id,st){
  const i=db.interviews.find(x=>x.id===id);if(!i)return;
  i.status=st;
  ecoNotify('company',db.profile.name+': собеседование «'+i.vacancy+'» — '+st);
  save();renderModule();toast('Статус: '+st);
}

/* ---------- СЕМЕЙНЫЙ БЮДЖЕТ ---------- */
function ecoFamilyMod(){
  ecoStyle();
  const f=db.ecoFamily;
  const pct=Math.min(100,Math.round(f.goal.saved/(f.goal.target||1)*100));
  return `<div class="card"><div class="card-title">👨‍👩‍ Семейный бюджет</div>
  <div class="eco-t" style="font-size:13px">${esc(f.goal.title)}</div>
  <div class="eco-prog"><i style="width:${pct}%"></i></div>
  <div class="eco-s"><b style="color:var(--pine)">${money(f.goal.saved)}</b> из ${money(f.goal.target)} · ${pct}%</div>
  <label class="lbl">Откладывать с каждой закрытой сделки: <b>${f.percent}%</b></label>
  <input type="range" min="0" max="50" step="5" value="${f.percent}" style="width:100%;accent-color:var(--pine)" oninput="db.ecoFamily.percent=+this.value;save()" onchange="renderModule()">
  <div class="btn-row"><input class="input" id="eco-f-title" value="${esc(f.goal.title)}" placeholder="Цель" style="flex:2">
  <input class="input" id="eco-f-target" type="number" value="${f.goal.target}" placeholder="Сумма" style="flex:1"></div>
  <div class="btn-row"><input class="input" id="eco-f-add" type="number" placeholder="Добавить вручную, ₽" style="flex:1">
  <button class="btn btn-sm btn-ghost" onclick="ecoFamilyAdd()">＋</button></div>
  <button class="btn btn-primary btn-sm" onclick="ecoFamilySave()">💾 Сохранить цель</button>
  <div class="card-title" style="margin-top:14px">Семья</div>
  <div class="chips">${f.members.map(m=>`<span class="chip on">${esc(m)}</span>`).join('')}</div>
  <div class="btn-row"><input class="input" id="eco-f-member" placeholder="Имя члена семьи" style="flex:1">
  <button class="btn btn-sm btn-ghost" onclick="ecoFamilyMember()">＋</button></div>
  <div class="eco-s">Каждая подтверждённая сделка автоматически пополняет цель. Прогноз: при текущем темпе цель закроется за ${Math.max(1,Math.ceil((f.goal.target-f.goal.saved)/Math.max(1,db.ecoScore.done*3000)))} мес.</div></div>`;
}
function ecoFamilySave(){
  const t=document.getElementById('eco-f-title'),g=document.getElementById('eco-f-target');
  if(t&&t.value.trim())db.ecoFamily.goal.title=t.value.trim();
  if(g&&+g.value>0)db.ecoFamily.goal.target=+g.value;
  save();renderModule();toast('Цель сохранена');
}
function ecoFamilyAdd(){
  const i=document.getElementById('eco-f-add');const v=+(i?i.value:0)||0;
  if(!v){toast('Укажите сумму');return}
  db.ecoFamily.goal.saved+=v;save();renderModule();toast('Добавлено '+money(v));
}
function ecoFamilyMember(){
  const i=document.getElementById('eco-f-member');const v=i?i.value.trim():'';
  if(!v)return;
  db.ecoFamily.members.push(v);save();renderModule();toast('Член семьи добавлен');
}

/* ---------- РАБОЧИЙ ПАСПОРТ ---------- */
function ecoPassport(){
  ecoStyle();
  const closed=db.ecoDeals.filter(d=>d.workerId===db.profile.sid&&d.status==='closed');
  const earned=closed.reduce((a,d)=>a+d.rate,0);
  const stars=db.reviews.length?(db.reviews.reduce((a,r)=>a+r.stars,0)/db.reviews.length).toFixed(1):'—';
  const txt=`РАБОЧИЙ ПАСПОРТ · СИБИРЯК\n${db.profile.name} · ${db.profile.city}\n\nЗакрытых сделок: ${closed.length}\nЗаработано через платформу: ${earned} руб.\nСредняя оценка: ${stars}★\nНеявок: ${db.ecoScore.noshow}\nВерификация: ${db.profile.verified?'подтверждён':'не подтверждён'}\nНавыки: ${db.profile.skills||''}\nОпыт: ${db.profile.exp_years||0} лет\n\nИстория сделок:\n${closed.map(d=>'- '+d.title+' · '+money(d.rate)+' · '+String(d.closedAt||d.createdAt).slice(0,10)).join('\n')||'- пока нет'}\n\nОтзывы:\n${db.reviews.map(r=>'- '+r.author+': '+r.stars+'★ '+r.text).join('\n')||'- пока нет'}\n\nПаспорт переносим между городами и работодателями.\nСформировано ${new Date().toLocaleString('ru-RU')}`;
  openDrawer(`<div class="card-title">🪪 Рабочий паспорт</div>
  <textarea class="input" id="eco-passport" style="min-height:300px;font-size:11.5px;font-family:monospace">${esc(txt)}</textarea>
  <div class="eco-row"><button class="btn btn-primary btn-sm" onclick="ecoCopyText('eco-passport')">📋 Копировать</button>
  <button class="btn btn-ghost btn-sm" onclick="ecoDownload('eco-passport','passport.txt')">⬇️ Скачать</button></div>`);
}
function ecoCopyText(id){
  const e=document.getElementById(id);if(!e)return;
  if(navigator.clipboard)navigator.clipboard.writeText(e.value).then(()=>toast('Скопировано')).catch(()=>{e.select();document.execCommand('copy');toast('Скопировано')});
  else{e.select();document.execCommand('copy');toast('Скопировано')}
}
function ecoDownload(id,name){
  const e=document.getElementById(id);if(!e)return;
  const blob=new Blob([e.value],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast('Файл скачан');
}

/* ---------- УВЕДОМЛЕНИЯ ---------- */
function ecoNotifsOpen(){
  ecoStyle();
  const role=ecoRole();
  const list=db.ecoNotifs.filter(n=>n.role===role);
  list.forEach(n=>n.read=true);save();
  openDrawer(`<div class="card-title">🔔 Уведомления</div>
  ${list.map(n=>`<div class="eco-card"><div class="eco-s" style="color:var(--dim)">${esc(n.text)}</div><div class="eco-s">${esc(String(n.at).replace('T',' '))}</div></div>`).join('')||'<div class="empty">Уведомлений нет.</div>'}`);
  rerender();
}

/* ---------- ОБЛАКО ЭКОСИСТЕМЫ ---------- */
const ECO_SQL=`-- СИБИРЯК · таблицы экосистемы (Supabase → SQL Editor → Run)
create table if not exists eco_shifts(id text primary key, payload jsonb, updated_at timestamptz default now());
create table if not exists eco_deals(id text primary key, payload jsonb, updated_at timestamptz default now());
create table if not exists eco_requests(id text primary key, payload jsonb, updated_at timestamptz default now());
create table if not exists eco_offers(id text primary key, payload jsonb, updated_at timestamptz default now());
alter table eco_shifts enable row level security;
alter table eco_deals enable row level security;
alter table eco_requests enable row level security;
alter table eco_offers enable row level security;
drop policy if exists demo_all on eco_shifts;
drop policy if exists demo_all on eco_deals;
drop policy if exists demo_all on eco_requests;
drop policy if exists demo_all on eco_offers;
create policy demo_all on eco_shifts for all to anon using (true) with check (true);
create policy demo_all on eco_deals for all to anon using (true) with check (true);
create policy demo_all on eco_requests for all to anon using (true) with check (true);
create policy demo_all on eco_offers for all to anon using (true) with check (true);`;
function ecoCloudMod(){
  ecoStyle();
  return `<div class="card"><div class="card-title">🗄️ База экосистемы</div>
  <div class="demo-note">Смены, сделки, заявки и анкеты синхронизируются с вашим Supabase. Демо-политики открыты; перед реальным запуском — строгие политики по auth.uid().</div>
  <div class="kpis"><div class="kpi"><b>${db.ecoShifts.length}</b><span>СМЕН</span></div><div class="kpi"><b>${db.ecoDeals.length}</b><span>СДЕЛОК</span></div><div class="kpi"><b>${db.ecoRequests.length}</b><span>ЗАЯВОК</span></div><div class="kpi"><b>${db.ecoOffers.length}</b><span>АНКЕТ</span></div></div>
  <div class="eco-row"><button class="btn btn-primary btn-sm" onclick="ecoPush()">⬆️ Выгрузить в облако</button>
  <button class="btn btn-ghost btn-sm" onclick="ecoPull()">⬇️ Забрать из облака</button></div>
  <div class="eco-row"><button class="btn btn-ghost btn-sm" onclick="ecoCopySql()">📋 SQL для Supabase</button>
  <button class="btn btn-ghost btn-sm" onclick="ecoPassport()">🪪 Рабочий паспорт</button></div></div>`;
}
function ecoCopySql(){
  if(navigator.clipboard)navigator.clipboard.writeText(ECO_SQL).then(()=>toast('SQL скопирован — вставьте в SQL Editor')).catch(()=>openDrawer(`<textarea class="input" style="min-height:300px;font-family:monospace;font-size:11px">${esc(ECO_SQL)}</textarea>`));
  else openDrawer(`<textarea class="input" style="min-height:300px;font-family:monospace;font-size:11px">${esc(ECO_SQL)}</textarea>`);
}
async function ecoPush(){
  if(!SB.on()){toast('Сначала подключите базу в разделе «База данных»');return}
  try{
    await SB.upsert('eco_shifts',db.ecoShifts.map(x=>({id:x.id,payload:x})));
    await SB.upsert('eco_deals',db.ecoDeals.map(x=>({id:x.id,payload:x})));
    await SB.upsert('eco_requests',db.ecoRequests.map(x=>({id:x.id,payload:x})));
    await SB.upsert('eco_offers',db.ecoOffers.map(x=>({id:x.id,payload:x})));
    toast('Экосистема выгружена в облако');
  }catch(e){toast('Ошибка: '+e.message+' · выполните SQL экосистемы')}
}
async function ecoPull(){
  if(!SB.on()){toast('Сначала подключите базу');return}
  try{
    const sh=await SB.select('eco_shifts','select=payload&limit=500');
    const dl=await SB.select('eco_deals','select=payload&limit=500');
    const rq=await SB.select('eco_requests','select=payload&limit=500');
    const of=await SB.select('eco_offers','select=payload&limit=500');
    if(sh&&sh.length)db.ecoShifts=sh.map(r=>r.payload);
    if(dl&&dl.length)db.ecoDeals=dl.map(r=>r.payload);
    if(rq&&rq.length)db.ecoRequests=rq.map(r=>r.payload);
    if(of&&of.length)db.ecoOffers=of.map(r=>r.payload);
    save();rerender();toast('Экосистема загружена из облака');
  }catch(e){toast('Ошибка: '+e.message)}
}

/* ---------- ГЛАВНЫЙ ЭКРАН И РЕГИСТРАЦИЯ ---------- */
function ecoHomeStrip(role){
  const un=ecoUnread(role);
  const openShifts=db.ecoShifts.filter(s=>s.status==='open').length;
  return `<div class="eco-strip">
  <button class="btn btn-primary btn-sm" onclick="ecoWizOpen()">＋ Одна заявка</button>
  <button class="btn btn-ghost btn-sm eco-bell" onclick="ecoNotifsOpen()">🔔${un?`<b>${un}</b>`:''}</button>
  <button class="btn btn-ghost btn-sm eco-bell" onclick="openModule('eco-inbox')">✉️${un?`<b>${un}</b>`:''}</button>
  <button class="btn btn-ghost btn-sm" onclick="openModule('eco-shifts')">${role==='company'?'🕒 Мои смены':'🕒 Смены рядом ('+openShifts+')'}</button>
  <button class="btn btn-ghost btn-sm" onclick="ecoPassport()">🪪</button>
  </div>`;
}
MOD.seeker.push({g:'Экосистема',items:[
  {key:'eco-shifts',icon:'🕒',title:'Смены рядом',sub:'Взять в работу · вахта · чек-ин',badge:()=>db.ecoShifts.filter(s=>s.status==='open').length||null},
  {key:'eco-deals',icon:'🤝',title:'Мои сделки',sub:'Статусы · оплата · гарантии',badge:()=>ecoMyDeals().filter(d=>['taken','in_work','done'].includes(d.status)).length||null},
  {key:'eco-feed',icon:'📋',title:'Лента заявок',sub:'Потребности заказчиков · отклики',badge:()=>null},
  {key:'eco-myreq',icon:'📤',title:'Мои заявки',sub:'Заявки · отклики · обучение',badge:()=>null},
  {key:'eco-inbox',icon:'✉️',title:'Сообщения',sub:'Чаты сделок · звонки · видео',badge:()=>ecoUnread('seeker')||null},
  {key:'eco-interviews',icon:'📅',title:'Мои собеседования',sub:'Видео-комната · статусы',badge:()=>db.interviews.filter(i=>i.candidate===db.profile.name&&i.status==='Запланировано').length||null},
  {key:'eco-family',icon:'👨‍👩‍',title:'Семейный бюджет',sub:'Цель · авто-накопления',badge:()=>null},
  {key:'eco-cloud',icon:'🗄️',title:'База экосистемы',sub:'Supabase · паспорт',badge:()=>null}]});
MOD.company.push({g:'Экосистема',items:[
  {key:'eco-shifts',icon:'🕒',title:'Мои смены',sub:'Публикация · вахта · укомплектованность',badge:()=>null},
  {key:'eco-deals',icon:'🤝',title:'Мои сделки',sub:'Приёмка · оплата · споры',badge:()=>ecoMyDeals().filter(d=>['taken','in_work','done'].includes(d.status)).length||null},
  {key:'eco-feed',icon:'📋',title:'Лента заявок',sub:'Потребности · исполнители рядом',badge:()=>null},
  {key:'eco-myreq',icon:'📤',title:'Мои заявки',sub:'Заявки · отклики · сметы',badge:()=>null},
  {key:'eco-inbox',icon:'✉️',title:'Сообщения',sub:'Чаты сделок · звонки · видео',badge:()=>ecoUnread('company')||null},
  {key:'eco-family',icon:'👨‍👩‍',title:'Семейный бюджет',sub:'Цель · авто-накопления',badge:()=>null},
  {key:'eco-cloud',icon:'🗄️',title:'База экосистемы',sub:'Supabase · паспорт',badge:()=>null}]});
const _ecoModTitle=modTitle;
modTitle=function(k){
  const m={'eco-shifts':ecoRole()==='company'?'Мои смены':'Смены рядом','eco-deals':'Мои сделки','eco-feed':'Лента заявок','eco-myreq':'Мои заявки','eco-inbox':'Сообщения','eco-interviews':'Мои собеседования','eco-family':'Семейный бюджет','eco-cloud':'База экосистемы'};
  return m[k]||_ecoModTitle(k);
};
const _ecoRenderModule=renderModule;
renderModule=function(){
  const extra={'eco-shifts':ecoShiftsMod,'eco-deals':ecoDealsMod,'eco-feed':ecoFeedMod,'eco-myreq':ecoMyReqMod,'eco-inbox':ecoInboxMod,'eco-interviews':ecoInterviewsMod,'eco-family':ecoFamilyMod,'eco-cloud':ecoCloudMod};
  if(extra[curMod]){
    ecoStyle();
    document.getElementById('module-body').innerHTML=extra[curMod](modState[curMod]);
    document.getElementById('ab-title').textContent=modTitle(curMod);
  }else _ecoRenderModule();
};
const _ecoRenderHome=renderHome;
renderHome=function(role){
  _ecoRenderHome(role);
  const el=document.getElementById(role==='seeker'?'seeker-home':'company-home');
  if(el)el.insertAdjacentHTML('afterbegin',ecoHomeStrip(role));
};

/* ---------- СТАРТ ---------- */
ecoMigrate();
save();