'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const TAU = Math.PI * 2;
  const defaults = { trajectory:'base', growthTurns:.5, growthSpread:35, growthRotation:'cw', spiralWidth:3, spiralTurns:3, spiralPhase:25, model:'halo', rotation:'cw', tailLength:260, dispersion:35, tailFade:.65, vortexOpacity:90, count:1800, radius:27, thickness:4, size:1.2, asymmetry:8, direction:'out', source:'band', speed:0.65, life:4, travel:11, swirl:10, trails:true, trail:16, glow:25, color:'#e0ede6', colorEnd:'#e0ede6', background:'#000000', transparent:true, pointX:0, pointY:0, raysEnabled:false, rayCount:140, raySpread:35, rayVariation:60, contourDensity:0, sizeEnd:100, opacityStart:100, opacityEnd:100, colorCurve:1, fadeCurve:1 };
  const specs = {
    waveGeometry:[['waveCount','Количество волн',1,8,1,''],['waveRadius','Размер центрального кольца',5,42,.5,'%'],['waveCoreWidth','Толщина центрального кольца',.4,20,.1,'%'],['waveWidth','Толщина волн',.4,5,.1,'%'],['waveX','Положение центра · X',-25,25,1,'%'],['waveY','Положение центра · Y',-25,25,1,'%']],
    waveMotion:[['waveTravel','Дальность расширения',5,35,.5,'%'],['waveDirection','Направление · 0° вправо, 90° вниз',0,360,1,'°'],['waveBias','Смещение волн в выбранную сторону',0,100,1,'%'],['wavePeriod','Цикл при скорости 1×',2,12,.5,'с']],
    waveLight:[['waveCoreOpacity','Непрозрачность центрального кольца',0,100,1,'%'],['waveOpacity','Непрозрачность волн',0,100,1,'%']],
    arcGeometry:[['arcCount','Количество контуров',1,12,1,''],['arcSpread','Расстояние между крайними кольцами',0,18,.5,'%'],['arcOffset','Смещение центров',0,5,.1,'%'],['arcWarp','Волнистость контура',0,4,.1,'%'],['arcWidth','Толщина линий',.5,5,.1,'px']],
    arcMotion:[['arcLength','Длина дуги · 360° — кольцо',30,360,1,'°'],['arcPhase','Разброс положения дуг',0,100,1,'%'],['arcIndependent','Разница скоростей колец',0,100,1,'%'],['arcPulse','Пульсация яркости',0,100,1,'%']],
    arcLight:[['arcOpacity','Непрозрачность дуг',0,100,1,'%'],['arcFade','Затухание светового хвоста',.25,3,.05,'×']],
    arcParticles:[['arcParticles','Количество искр',0,1500,10,''],['arcParticleSize','Размер искр',.3,3,.1,'px'],['arcScatter','Рассеивание от контура',0,6,.1,'%']],
    plasmaGeometry:[['plasmaCount','Количество лучей',12,160,1,''],['plasmaWidth','Толщина лучей',.4,3,.1,'px']],
    plasmaMotion:[['plasmaSpin','Скорость вращения',0,3,.05,'×'],['plasmaTilt','Наклон оси',0,90,1,'°'],['plasmaPulse','Сила мерцания',0,100,1,'%'],['plasmaFlickerRate','Частота мерцания',0,15,.5,'Гц'],['plasmaTurbulence','Изгибы разрядов',0,100,1,'%']],
    plasmaFlow:[['plasmaFlowSpeed','Скорость импульсов',0,3,.05,'×'],['plasmaPacketLength','Длина импульса',5,60,1,'%'],['plasmaBaseLight','Постоянное свечение лучей',0,100,1,'%']],
    plasmaLight:[['plasmaRim','Яркость ободка',0,100,1,'%'],['plasmaCore','Яркость центра',0,100,1,'%'],['plasmaCoreSize','Размер свечения центра',1,15,.5,'%']],
    geometry:[['count','Количество частиц',100,50000,100,''],['radius','Радиус внутреннего пространства',5,36,1,'%'],['thickness','Толщина кольца',1,18,.5,'%'],['size','Начальный размер частицы',.4,4,.1,'px'],['asymmetry','Асимметрия',0,100,1,'%']],
    growth:[['growthTurns','Число оборотов',.1,4,.1,''],['growthSpread','Разброс траекторий',0,100,1,'%']],
    spiral:[['spiralWidth','Ширина спирали',0,12,.25,'%'],['spiralTurns','Количество витков',1,8,.25,''],['spiralPhase','Разброс фаз',0,100,1,'%']],
    motion:[['speed','Скорость',0,3,.05,'×'],['life','Время жизни',1,10,.5,'с'],['travel','Дальность полёта',0,25,.5,'%'],['swirl','Закручивание',-100,100,1,'%']],
    light:[['trail','Длина следа',0,70,1,'%'],['glow','Свечение',0,100,1,'%']],
    vortex:[['tailLength','Длина хвостов',90,320,1,'°'],['dispersion','Рассеивание хвостов',0,100,1,'%'],['tailFade','Мягкость затухания',.25,3,.05,'×'],['vortexOpacity','Непрозрачность потоков',0,100,1,'%']],
    point:[['pointX','Точка появления · X',-40,40,1,'%'],['pointY','Точка появления · Y',-40,40,1,'%']],
    density:[['contourDensity','Плотность у источника',0,100,1,'%']],
    ray:[['rayCount','Количество лучей',12,360,1,''],['raySpread','Разброс внутри луча',0,100,1,'%'],['rayVariation','Неравномерность длины',0,100,1,'%']],
    lifecycle:[['sizeEnd','Размер в конце',0,150,1,'%'],['opacityStart','Непрозрачность при рождении',0,100,1,'%'],['opacityEnd','Непрозрачность при затухании',0,100,1,'%'],['colorCurve','Кривая перехода цвета',.25,3,.05,'×'],['fadeCurve','Кривая непрозрачности',.25,3,.05,'×']]
  };
  const ranges = Object.values(specs).flat();
  Object.assign(defaults,EvaOrParticles.arcDefaults);
  Object.assign(defaults,EvaOrParticles.waveDefaults);
  Object.assign(defaults,{plasmaCount:64,plasmaWidth:1.8,plasmaSpin:.75,plasmaTilt:28,plasmaPulse:65,plasmaTurbulence:25,plasmaRim:90,plasmaCore:85,plasmaCoreSize:7,plasmaRotation:'cw',plasmaRimColor:'#ff43d3',plasmaCoreColor:'#ff8ae8'});
  Object.assign(defaults,{plasmaFlow:'out',plasmaFlowSpeed:.8,plasmaPacketLength:25,plasmaBaseLight:12,plasmaFlickerRate:7});
  const presets = {
    waves:{...defaults,model:'waves',speed:.65,color:'#ffffff',colorEnd:'#ffffff',glow:0,trails:false},
    arcs:{...defaults,model:'arcs',radius:30,speed:.65,glow:95,color:'#63deff',colorEnd:'#243cff',trails:false},
    plasma:{...defaults,model:'plasma',radius:35,speed:.7,glow:90,color:'#6557ff',colorEnd:'#83c4ff',trails:false},
    halo:{...defaults},
    dust:{...defaults,model:'dust',count:3500,size:.8,thickness:7,asymmetry:20,travel:17,trails:false,glow:10,speed:.35,direction:'both',swirl:4},
    rays:{...defaults,model:'rays',count:1400,size:.8,thickness:1.5,trail:58,glow:40,travel:20,speed:.8,swirl:0,asymmetry:4,color:'#ffc578',colorEnd:'#ffc578',source:'inner'},
    vortex:{...defaults,model:'vortex',count:32000,radius:20,thickness:14,size:1.5,asymmetry:8,speed:.55,trails:false,glow:0,color:'#7055eb',colorEnd:'#e84a55'},
    corona:{...defaults,model:'corona',count:6000,radius:24,thickness:1,size:1.9,asymmetry:0,source:'contour',speed:.45,life:5,travel:25,swirl:0,trails:false,glow:60,color:'#fff477',colorEnd:'#ff3800',raysEnabled:true,rayCount:160,raySpread:35,rayVariation:65,contourDensity:35,sizeEnd:15,opacityStart:100,opacityEnd:5,colorCurve:.4,fadeCurve:1.8}
  };
  function validate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid settings');
    const next = {...defaults};
    if(Object.hasOwn(presets,raw.model)) next.model=raw.model;
    if(['cw','ccw'].includes(raw.rotation)) next.rotation=raw.rotation;
    if(['cw','ccw'].includes(raw.plasmaRotation)) next.plasmaRotation=raw.plasmaRotation;
    if(['cw','ccw','both'].includes(raw.arcRotation))next.arcRotation=raw.arcRotation;
    if(['ring','crescent'].includes(raw.waveShape))next.waveShape=raw.waveShape;
    if(['center','br','bl','tr','tl','top','bottom','left','right','custom'].includes(raw.wavePosition))next.wavePosition=raw.wavePosition;
    if(['out','in','both','off'].includes(raw.plasmaFlow))next.plasmaFlow=raw.plasmaFlow;
    if(['base','spiral','growing'].includes(raw.trajectory)) next.trajectory=raw.trajectory;
    if(['cw','ccw'].includes(raw.growthRotation))next.growthRotation=raw.growthRotation;
    for (const [key,,min,max] of ranges) if (typeof raw[key] === 'number' && Number.isFinite(raw[key])) next[key] = Math.max(min,Math.min(max,raw[key]));
    next.count = Math.min(next.model==='vortex'?50000:6000,Math.round(next.count));
    next.rayCount = Math.round(next.rayCount);
    next.plasmaCount = Math.round(next.plasmaCount);
    next.arcCount=Math.round(next.arcCount);next.arcParticles=Math.round(next.arcParticles);
    next.waveCount=Math.round(next.waveCount);if(EvaOrParticles.wavePositions[next.wavePosition])[next.waveX,next.waveY]=EvaOrParticles.wavePositions[next.wavePosition];
    for (const key of ['trails','transparent','raysEnabled']) if (typeof raw[key] === 'boolean') next[key] = raw[key];
    for (const key of ['color','colorEnd','background','plasmaRimColor','plasmaCoreColor']) if (typeof raw[key] === 'string' && /^#[\da-f]{6}$/i.test(raw[key])) next[key] = raw[key];
    if (!Object.hasOwn(raw,'colorEnd')) next.colorEnd=next.color; // Version 1 single-colour presets.
    if (['in','out','both'].includes(raw.direction)) next.direction = raw.direction;
    if (['band','inner','outer','point','contour'].includes(raw.source)) next.source = raw.source;
    return next;
  }
  let state = {...defaults};
  let viewMode='animation';
  try{if(localStorage.getItem('evaor-preview-v1')==='logo')viewMode='logo';}catch{}
  let logoWeight=400;
  try{const saved=Number(localStorage.getItem('evaor-logo-weight-v1'));if([300,400,500,600,700].includes(saved))logoWeight=saved;}catch{}
  let logoLayout={oScale:100,spacing:0};
  try{
    const saved=JSON.parse(localStorage.getItem('evaor-logo-layout-v1')||'{}');
    if(Number.isFinite(saved.oScale))logoLayout.oScale=Math.max(25,Math.min(200,saved.oScale));
    if(Number.isFinite(saved.spacing))logoLayout.spacing=Math.max(-10,Math.min(30,saved.spacing));
  }catch{}
  try {
    const saved=localStorage.getItem('evaor-studio-v1');
    if(saved){
      const previous=JSON.parse(saved);
      if(previous.model==='vortex'){
        const storedDrafts=JSON.parse(localStorage.getItem('evaor-model-drafts-v1')||'{}');
        state=validate({...storedDrafts.halo,model:'halo'});
      }else state=validate(previous);
    }
    // Replace the former default once; keep custom backgrounds and imported presets intact.
    if(!localStorage.getItem('evaor-black-background-v1')){
      if(state.background.toLowerCase()==='#080d0c'){
        state.background='#000000';
        localStorage.setItem('evaor-studio-v1',JSON.stringify(state));
      }
      localStorage.setItem('evaor-black-background-v1','1');
    }
  } catch {}
  const modelNames={halo:'Световое кольцо',dust:'Звёздная пыль',rays:'Лучи',vortex:'Цветовой вихрь',corona:'Солнечная корона',plasma:'Плазменная сфера',arcs:'Световые дуги',waves:'Графические волны'};
  let drafts={};
  try {const saved=JSON.parse(localStorage.getItem('evaor-model-drafts-v1')||'{}');for(const key of Object.keys(presets))if(saved[key])drafts[key]=validate({...saved[key],model:key});} catch {}
  let particles=[], time=0, paused=matchMedia('(prefers-reduced-motion: reduce)').matches, last=0, boost=0, hovered=false, pressed=false, focused=false, toastTimer;
  const canvas=$('canvas'), ctx=canvas.getContext('2d', {alpha:true});
  let width=1,height=1,dpr=1;
  let logoFontReady=false,siteExportBusy=false;
  for (const [group,items] of Object.entries(specs)) {
    for (const [key,label,min,max,step,unit] of items) {
      const el=document.createElement('div');el.className='control';
      el.innerHTML=`<div class="control-label"><label for="${key}">${label}</label><output id="${key}-value" for="${key}"></output></div><input id="${key}" type="range" min="${min}" max="${max}" step="${step}">`;
      $(group+'-controls').append(el);
      $(key).addEventListener('input',()=>{state[key]=Number($(key).value);if(key==='waveX'||key==='waveY')state.wavePosition='custom'; if(key==='count') seed(); changed();});
    }
  }
  function notice(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000);}
  function persist(){drafts[state.model]={...state};try{localStorage.setItem('evaor-studio-v1',JSON.stringify(state));localStorage.setItem('evaor-model-drafts-v1',JSON.stringify(drafts));}catch{notice('Автосохранение недоступно. Сохрани вариант в JSON.');}}
  function showControl(key,visible){$(key).closest('.control').hidden=!visible;}
  function updateUI(){
    const vortex=state.model==='vortex';
    $('count').max=vortex?50000:6000;
    for(const [key,,min,,,unit] of ranges){$(key).value=state[key];$(key).style.setProperty('--progress',`${(state[key]-min)/(Number($(key).max)-min)*100}%`);$(key+'-value').value=Number(state[key].toFixed(2)).toLocaleString('ru-RU')+(unit?' '+unit:'');}
    $('model-title').textContent=modelNames[state.model];
    $('rotation').value=state.rotation;
    $('trajectory').value=state.trajectory;
    $('growthRotation').value=state.growthRotation;
    $('growth-options').hidden=vortex||state.trajectory!=='growing';
    $('trajectory-options').hidden=vortex;
    $('spiral-options').hidden=vortex||state.trajectory!=='spiral';
    $('radial-options').hidden=vortex;
    $('vortex-options').hidden=!vortex;
    for(const key of ['life','travel','swirl'])showControl(key,!vortex);
    showControl('swirl',!vortex&&state.trajectory!=='growing');
    showControl('travel',!vortex&&!(state.trajectory==='growing'&&state.source==='point'&&state.direction==='in'));
    $('density-controls').hidden=vortex;
    $('raysEnabled').closest('label').hidden=vortex;
    $('trails').closest('label').hidden=vortex;
    $('lifecycle-controls').hidden=vortex;
    $('lifecycle-hint').hidden=vortex;
    $('color-preview').hidden=vortex;
    $('gradient-labels').hidden=vortex;
    $('color-title').textContent=vortex?'Цвета потоков':'Рождение и затухание';
    document.querySelector('label[for="color"]').textContent=vortex?'Цвет первого потока':'Цвет при рождении';
    document.querySelector('label[for="colorEnd"]').textContent=vortex?'Цвет второго потока':'Цвет при затухании';
    document.querySelector('label[for="size"]').textContent=vortex?'Размер зерна':'Начальный размер частицы';
    for(const key of ['source','color','colorEnd','background']) $(key).value=state[key];
    for(const key of ['trails','transparent','raysEnabled']) $(key).checked=state[key];
    $('trail').disabled=!state.trails;
    showControl('trail',!vortex&&state.trails);
    $('point-controls').hidden=vortex||state.source!=='point';
    $('ray-controls').hidden=vortex||!state.raysEnabled;
    $('ray-hint').hidden=vortex||!state.raysEnabled;
    const thickness=vortex||['band','outer','point'].includes(state.source);
    $('thickness').disabled=!thickness;
    showControl('thickness',thickness);
    const stops=Array.from({length:11},(_,i)=>{const age=i/10;const u=Math.pow(age,state.colorCurve);const a=state.color.slice(1).match(/../g).map(x=>parseInt(x,16));const b=state.colorEnd.slice(1).match(/../g).map(x=>parseInt(x,16));const c=a.map((v,j)=>Math.round(v+(b[j]-v)*u));const opacity=(state.opacityStart+(state.opacityEnd-state.opacityStart)*Math.pow(age,state.fadeCurve))/100;return `rgba(${c.join(',')},${opacity}) ${i*10}%`;});
    $('color-gradient').style.background=`linear-gradient(to right,${stops.join(',')})`;
    document.querySelectorAll('[data-direction]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.direction===state.direction)));
    document.querySelectorAll('[data-preset]').forEach(el=>{const active=state.model===el.dataset.preset;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
    $('canvas-wrap').style.backgroundColor=state.background;
    $('stats').textContent=state.count.toLocaleString('ru-RU')+' частиц';
    const plasma=state.model==='plasma';
    for(const id of ['plasmaGeometry-controls','plasma-options','plasma-colors','plasmaLight-controls'])$(id).hidden=!plasma;
    for(const key of ['count','size','asymmetry'])showControl(key,!plasma);
    document.querySelector('label[for="radius"]').textContent=plasma?'Радиус сферы':'Радиус внутреннего пространства';
    $('motion-title').textContent=plasma?'Вращение и разряды':'Движение частиц';
    $('light-title').textContent=plasma?'Свечение сферы':'Свет и след';
    $('plasmaRotation').value=state.plasmaRotation;
    $('plasmaFlow').value=state.plasmaFlow;
    $('plasmaFlow-controls').hidden=!plasma||state.plasmaFlow==='off';
    for(const key of ['plasmaCoreColor','plasmaRimColor'])$(key).value=state[key];
    if(plasma){
      for(const id of ['radial-options','trajectory-options','spiral-options','growth-options','density-controls','point-controls','ray-controls','ray-hint','lifecycle-controls','lifecycle-hint','color-preview','gradient-labels'])$(id).hidden=true;
      for(const key of ['thickness','life','travel','swirl','trail'])showControl(key,false);
      for(const id of ['raysEnabled','trails'])$(id).closest('label').hidden=true;
      $('color-title').textContent='Цвета сферы';
      document.querySelector('label[for="color"]').textContent='Лучи у центра';
      document.querySelector('label[for="colorEnd"]').textContent='Лучи у поверхности';
      $('stats').textContent=state.plasmaCount+' лучей · объёмное вращение';
    }
    const arcs=state.model==='arcs';
    for(const id of ['arcGeometry-controls','arc-options','arcLight-controls','arc-particles'])$(id).hidden=!arcs;
    $('arcRotation').value=state.arcRotation;
    if(arcs){
      for(const id of ['radial-options','trajectory-options','spiral-options','growth-options','density-controls','point-controls','ray-controls','ray-hint','lifecycle-controls','lifecycle-hint','color-preview','gradient-labels'])$(id).hidden=true;
      for(const key of ['count','size','asymmetry','thickness','life','travel','swirl','trail'])showControl(key,false);
      for(const id of ['raysEnabled','trails'])$(id).closest('label').hidden=true;
      showControl('arcParticleSize',state.arcParticles>0);showControl('arcScatter',state.arcParticles>0);
      for(const key of ['arcSpread','arcOffset','arcPhase','arcIndependent'])showControl(key,state.arcCount>1);
      document.querySelector('label[for="radius"]').textContent='Радиус колец';
      document.querySelector('label[for="color"]').textContent='Цвет яркой части';
      document.querySelector('label[for="colorEnd"]').textContent='Цвет хвоста';
      $('motion-title').textContent='Дуги и вращение';$('color-title').textContent='Цвета световых дуг';$('light-title').textContent='Свечение и искры';
      $('stats').textContent=state.arcCount+' контуров · '+state.arcParticles+' искр';
    }
    const waves=state.model==='waves';
    for(const id of ['wave-geometry','wave-options','waveLight-controls'])$(id).hidden=!waves;
    for(const key of ['wavePosition','waveShape'])$(key).value=state[key];
    showControl('radius',!waves);showControl('glow',!waves);
    if(waves){
      for(const key of ['waveTravel','waveDirection','waveBias'])showControl(key,false);
      for(const id of ['radial-options','trajectory-options','spiral-options','growth-options','density-controls','point-controls','ray-controls','ray-hint','lifecycle-controls','lifecycle-hint','color-preview','gradient-labels'])$(id).hidden=true;
      for(const key of ['count','size','asymmetry','thickness','life','travel','swirl','trail'])showControl(key,false);
      for(const id of ['raysEnabled','trails'])$(id).closest('label').hidden=true;
      $('motion-title').textContent='Расходящиеся волны';$('color-title').textContent='Цвета колец';$('light-title').textContent='Прозрачность и фон';
      document.querySelector('label[for="color"]').textContent='Центральное кольцо и начало волны';
      document.querySelector('label[for="colorEnd"]').textContent='Цвет удаляющейся волны';
      $('stats').textContent=state.waveCount+' волн · '+(state.waveShape==='crescent'?'серпы':'кольца');
    }
    canvas.setAttribute('aria-label',waves?'Центральное кольцо с расходящимися графическими волнами':arcs?'Вращающиеся световые дуги с искрами':plasma?'Вращающаяся плазменная сфера со световыми лучами':'Анимированная буква O из частиц');
    updateViewUI();
    $('playback-icon').textContent=paused?'▶':'Ⅱ';$('playback-label').textContent=paused?'Воспроизвести':'Пауза';$('pause').setAttribute('aria-pressed',String(paused));$('live-label').textContent=paused?'ПАУЗА':'АНИМАЦИЯ';
  }
  function changed(){updateUI();persist();draw();}
  const makeParticles=EvaOrRenderer.makeParticles;
  function seed(){particles=makeParticles(state.count);}
  function updateViewUI(){
    document.querySelectorAll('[data-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.view===viewMode)));
    $('export').disabled=$('export-video').disabled=viewMode==='logo'&&!logoFontReady;
    $('save-variant').disabled=viewMode==='logo'&&!logoFontReady;
    if(!siteExportBusy)$('export-site').disabled=!logoFontReady;
    $('logo-type-options').hidden=viewMode!=='logo';
    $('logo-weight').value=String(logoWeight);
    for(const [id,key] of [['logo-o-scale','oScale'],['logo-spacing','spacing']]){
      const el=$(id);el.value=logoLayout[key];
      el.style.setProperty('--progress',`${(logoLayout[key]-Number(el.min))/(Number(el.max)-Number(el.min))*100}%`);
      $(id+'-value').value=logoLayout[key]+' %';
    }
    $('canvas-caption').textContent=viewMode==='logo'?'EVAOR / ПРИМЕРКА ЛОГОТИПА':'O / ИССЛЕДОВАНИЕ ФОРМЫ';
    if(viewMode==='logo')canvas.setAttribute('aria-label','Логотип EvaOr: буква O заменена текущей анимацией');
  }
  document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>{
    viewMode=el.dataset.view;
    try{localStorage.setItem('evaor-preview-v1',viewMode);}catch{}
    updateUI();draw();
  }));
  $('logo-weight').addEventListener('input',()=>{
    const selected=Number($('logo-weight').value);if(![300,400,500,600,700].includes(selected))return;
    logoWeight=selected;try{localStorage.setItem('evaor-logo-weight-v1',String(logoWeight));}catch{}
    draw();
  });
  for(const [id,key] of [['logo-o-scale','oScale'],['logo-spacing','spacing']])$(id).addEventListener('input',()=>{
    logoLayout[key]=Number($(id).value);
    try{localStorage.setItem('evaor-logo-layout-v1',JSON.stringify(logoLayout));}catch{}
    updateViewUI();draw();
  });
  function render(target,w,h){renderScene(target,w,h,state,particles,time,boost,viewMode);}
  function renderScene(target,w,h,state,particles,time,boost,view='animation',weight=logoWeight,layout=logoLayout){
    EvaOrRenderer.renderScene(target,w,h,state,particles,time,boost,view,weight,layout);
  }
  function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);render(ctx,width,height);}
  function resize(){const box=$('canvas-wrap').getBoundingClientRect();if(box.width<=2||box.height<=2)return;width=box.width-2;height=box.height-2;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw();}
  document.querySelectorAll('[data-direction]').forEach(el=>el.addEventListener('click',()=>{state.direction=el.dataset.direction;changed();}));
  document.querySelectorAll('[data-preset]').forEach(el=>el.addEventListener('click',()=>{persist();state={...(drafts[el.dataset.preset]||presets[el.dataset.preset])};time=0;boost=0;seed();changed();$('panel-scroll')?.scrollTo(0,0);}));
  for(const key of ['source','color','colorEnd','background','trails','transparent','raysEnabled','rotation','trajectory','growthRotation','plasmaRotation','plasmaFlow','plasmaCoreColor','plasmaRimColor','arcRotation','waveShape']) $(key).addEventListener('input',()=>{state[key]=$(key).type==='checkbox'?$(key).checked:$(key).value;changed();});
  $('wavePosition').addEventListener('input',()=>{
    state.wavePosition=$('wavePosition').value;
    const positions=EvaOrParticles.wavePositions;
    if(positions[state.wavePosition])[state.waveX,state.waveY]=positions[state.wavePosition];
    changed();
  });
  $('pause').addEventListener('click',()=>{paused=!paused;updateUI();});
  $('reset').addEventListener('click',()=>{state={...presets[state.model]};time=0;boost=0;seed();changed();notice('Настройки этой модели восстановлены');});
  const react=$('react');
  react.addEventListener('pointerenter',()=>hovered=true);react.addEventListener('pointerleave',()=>{hovered=false;pressed=false;});react.addEventListener('pointerdown',()=>pressed=true);window.addEventListener('pointerup',()=>pressed=false);react.addEventListener('pointercancel',()=>pressed=false);react.addEventListener('focus',()=>focused=true);react.addEventListener('blur',()=>{focused=false;pressed=false;});
  react.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')pressed=true;});react.addEventListener('keyup',()=>pressed=false);
  react.addEventListener('click',()=>{if(paused)notice('Включи воспроизведение, чтобы увидеть реакцию');});
  function download(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
  function captureVariant(){return {version:4,settings:{...state},composition:{view:viewMode,weight:logoWeight,layout:{...logoLayout}},playback:{time,paused}};}
  let siteSnapshot=null;
  $('export-site').addEventListener('click',()=>{
    siteSnapshot=captureVariant();
    $('site-snippet').value=EvaOrSiteExport.snippet;
    $('site-summary').textContent=`${modelNames[state.model]} · Montserrat ${logoWeight} · O ${logoLayout.oScale}% · интервалы ${logoLayout.spacing}%`;
    $('site-status').textContent='Загрузите JS на сайт и вставьте код в хедер. В архиве есть пример для просмотра.';
    $('site-preview-wrap').style.backgroundColor=state.background;
    const preview=$('site-preview');preview.width=1000;preview.height=280;
    EvaOrRenderer.renderScene(preview.getContext('2d'),1000,280,state,particles,time,0,'logo',logoWeight,logoLayout,{header:true});
    $('site-dialog').showModal();
  });
  $('site-close').addEventListener('click',()=>$('site-dialog').close());
  $('site-copy').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText($('site-snippet').value);$('site-status').textContent='Код скопирован. Сначала загрузите evaor-logo.js на сайт по указанному пути.';}
    catch{$('site-snippet').focus();$('site-snippet').select();$('site-status').textContent='Выделили код: скопируйте его сочетанием Ctrl+C.';}
  });
  $('site-download').addEventListener('click',async()=>{
    if(siteExportBusy||!siteSnapshot)return;
    const snapshot=siteSnapshot;siteExportBusy=true;$('export-site').disabled=true;$('site-download').disabled=true;
    $('site-status').textContent='Собираем логотип и шрифт…';
    try{const archive=await EvaOrSiteExport.create(snapshot);download(archive,'evaor-website-logo.zip');$('site-status').textContent='Готово. Распакуйте ZIP и откройте demo.html. Инструкция — в README.txt.';notice('Логотип для сайта сохранён в ZIP');}
    catch(error){$('site-status').textContent='Не удалось собрать архив. Проверьте соединение и попробуйте ещё раз.';}
    finally{siteExportBusy=false;$('site-download').disabled=false;updateViewUI();}
  });
  function normaliseVariant(raw){
    if(!raw||![1,2,3,4].includes(raw.version)||!raw.settings||!ranges.some(([key])=>Object.hasOwn(raw.settings,key)))throw new Error('Неверный формат варианта.');
    if(raw.settings.model==='vortex')throw new Error('Модель «Цветовой вихрь» временно убрана.');
    const composition=raw.composition||{},layout=composition.layout||{},playback=raw.playback||{};
    return {version:4,settings:validate(raw.settings),composition:{
      view:composition.view==='logo'?'logo':'animation',weight:[300,400,500,600,700].includes(composition.weight)?composition.weight:400,
      layout:{oScale:Number.isFinite(layout.oScale)?Math.max(25,Math.min(200,layout.oScale)):100,spacing:Number.isFinite(layout.spacing)?Math.max(-10,Math.min(30,layout.spacing)):0}
    },playback:{time:Number.isFinite(playback.time)?Math.max(0,Math.min(1e9,playback.time)):0,paused:typeof playback.paused==='boolean'?playback.paused:paused}};
  }
  function openVariant(raw){
    const next=normaliseVariant(raw);persist();state=next.settings;
    // Old JSON files only contained animation settings; retain the current typography.
    if(raw.version===4){viewMode=next.composition.view;logoWeight=next.composition.weight;logoLayout={...next.composition.layout};}
    time=next.playback.time;paused=next.playback.paused;boost=0;last=0;seed();changed();
    try{localStorage.setItem('evaor-preview-v1',viewMode);localStorage.setItem('evaor-logo-weight-v1',String(logoWeight));localStorage.setItem('evaor-logo-layout-v1',JSON.stringify(logoLayout));}catch{}
  }
  function exportVariant(snapshot){download(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}),'evaor-preset.json');}
  $('save').addEventListener('click',()=>{exportVariant(captureVariant());notice('Вариант с композицией сохранён в JSON');});
  $('load').addEventListener('click',()=>$('file-input').click());
  $('file-input').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{if(file.size>100000)throw new Error('Too large');openVariant(JSON.parse(await file.text()));notice('Вариант открыт');}catch{notice('Не удалось открыть. Выбери JSON действующей модели, сохранённый в студии.');}
    event.target.value='';
  });
  $('export').addEventListener('click',()=>{
    const output=document.createElement('canvas');output.width=output.height=2048;const out=output.getContext('2d');render(out,2048,2048);
    if(!state.transparent){out.globalCompositeOperation='destination-over';out.fillStyle=state.background;out.fillRect(0,0,2048,2048);}
    output.toBlob(blob=>{if(blob){download(blob,'evaor-'+new Date().toISOString().replace(/[:.]/g,'-')+'.png');notice('PNG 2048 × 2048 сохранён');}else notice('Не удалось создать PNG');},'image/png');
  });
  const libraryKey='evaor-library-v1';
  let libraryOpen=false,trashOpen=false,libraryLimit=12,libraryPaint=0,pendingVariant=null;
  function readLibrary(){
    const raw=JSON.parse(localStorage.getItem(libraryKey)||'{"items":[]}');
    if(!raw||!Array.isArray(raw.items))throw new Error('Не удалось прочитать коллекцию. Данные не изменены.');
    return raw.items;
  }
  function updateLibraryCount(){try{$('library-count').textContent=readLibrary().filter(x=>!x.deletedAt).length;}catch{$('library-count').textContent='!';}}
  function changeLibrary(change){
    const items=readLibrary();change(items);
    // Store compact settings only; thumbnails are rendered on demand, not kept in storage.
    localStorage.setItem(libraryKey,JSON.stringify({version:1,items}));
    updateLibraryCount();if(libraryOpen)renderLibrary();
  }
  function showLibrary(show){
    libraryOpen=show;last=0;libraryPaint++;
    $('editor-screen').hidden=show;$('library-screen').hidden=!show;
    $('editor-tab').setAttribute('aria-pressed',String(!show));$('library-tab').setAttribute('aria-pressed',String(show));
    for(const id of ['export','export-video','export-site','save-variant'])$(id).hidden=show;
    if(show){libraryLimit=12;renderLibrary();}else{requestAnimationFrame(resize);}
  }
  function variantNameDialog(record=null){
    pendingVariant=record?{id:record.id}:{snapshot:captureVariant()};
    $('variant-dialog-title').textContent=record?'Переименовать вариант':'Сохранить вариант';
    $('variant-submit').textContent=record?'Переименовать':'Сохранить';$('variant-error').textContent='';
    $('variant-name').value=record?record.name:`${viewMode==='logo'?'EvaOr · ':''}${modelNames[state.model]} · ${new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}`;
    $('variant-dialog').showModal();$('variant-name').focus();$('variant-name').select();
  }
  $('save-variant').addEventListener('click',()=>variantNameDialog());
  $('variant-close').addEventListener('click',()=>$('variant-dialog').close());
  $('variant-dialog').addEventListener('close',()=>pendingVariant=null);
  $('variant-form').addEventListener('submit',event=>{
    event.preventDefault();const name=$('variant-name').value.trim();
    if(!name){$('variant-error').textContent='Введите название варианта.';return;}
    if(!pendingVariant)return;
    try{
      const pending=pendingVariant;
      changeLibrary(items=>{
        if(pending.id){const record=items.find(x=>x.id===pending.id);if(!record)throw new Error('Вариант уже недоступен.');record.name=name;}
        else items.unshift({id:crypto.randomUUID(),name,createdAt:new Date().toISOString(),snapshot:pending.snapshot});
      });
      $('variant-dialog').close();notice(pending.id?'Название изменено':'Вариант добавлен в «Сохранённые»');
    }catch(error){$('variant-error').textContent=error.name==='QuotaExceededError'?'В браузере недостаточно места. Сохраните вариант в JSON.':`Не удалось сохранить: ${error.message}`;}
  });
  function renderLibrary(){
    const epoch=++libraryPaint,grid=$('library-grid');grid.replaceChildren();
    $('library-title').textContent=trashOpen?'Корзина':'Сохранённые варианты';
    $('library-trash').textContent=trashOpen?'← Все варианты':'Корзина';$('library-trash').setAttribute('aria-pressed',String(trashOpen));
    let entries;
    try{entries=readLibrary().filter(x=>Boolean(x.deletedAt)===trashOpen);}catch(error){$('library-empty').hidden=false;$('library-empty').textContent=error.message;$('library-more').hidden=true;return;}
    $('library-empty').hidden=entries.length>0;
    $('library-empty').textContent=trashOpen?'Корзина пуста. Удалённые варианты можно будет восстановить здесь.':'Пока нет сохранённых вариантов. Настройте анимацию и нажмите «Сохранить вариант».';
    $('library-more').hidden=entries.length<=libraryLimit;
    const paintings=[];
    for(const record of entries.slice(0,libraryLimit)){
      let snapshot;try{snapshot=normaliseVariant(record.snapshot);}catch{snapshot=null;}
      const card=document.createElement('article');card.className='variant-card';card.dataset.variantId=record.id;
      const preview=document.createElement('button');preview.className='variant-preview';preview.setAttribute('aria-label','Открыть '+record.name);preview.disabled=!snapshot||trashOpen;
      const thumbnail=document.createElement('canvas');thumbnail.width=480;thumbnail.height=300;thumbnail.setAttribute('aria-hidden','true');preview.append(thumbnail);
      const info=document.createElement('div');info.className='variant-info';
      const title=document.createElement('h2');title.textContent=record.name;
      const meta=document.createElement('p');meta.textContent=snapshot?`${modelNames[snapshot.settings.model]} · ${snapshot.composition.view==='logo'?'Логотип':'Анимация'} · ${new Date(record.createdAt).toLocaleString('ru-RU')}`:'Этот вариант не поддерживается текущей версией.';
      const actions=document.createElement('div');actions.className='variant-actions';
      const action=(label,callback)=>{const button=document.createElement('button');button.textContent=label;button.addEventListener('click',()=>{try{callback();}catch(error){notice('Не удалось выполнить действие: '+error.message);}});actions.append(button);};
      const open=()=>{const fresh=readLibrary().find(x=>x.id===record.id&&!x.deletedAt);if(!fresh)throw new Error('Вариант недоступен.');openVariant(fresh.snapshot);showLibrary(false);notice('Открыт вариант «'+fresh.name+'»');};
      preview.addEventListener('click',()=>{try{open();}catch(error){notice(error.message);}});
      if(trashOpen)action('Восстановить',()=>changeLibrary(items=>{const item=items.find(x=>x.id===record.id);if(item)delete item.deletedAt;}));
      else{
        if(snapshot)action('Открыть',open);
        action('Переименовать',()=>variantNameDialog(record));
        action('JSON',()=>exportVariant(record.snapshot));
        action('В корзину',()=>changeLibrary(items=>{const item=items.find(x=>x.id===record.id);if(item)item.deletedAt=new Date().toISOString();}));
      }
      info.append(title,meta,actions);card.append(preview,info);grid.append(card);
      if(snapshot)paintings.push(()=>{
        const s=snapshot.settings,composition=snapshot.composition,out=thumbnail.getContext('2d');
        renderScene(out,480,300,s,makeParticles(s.count),snapshot.playback.time,0,composition.view,composition.weight,composition.layout);
        out.globalCompositeOperation='destination-over';out.fillStyle=s.background;out.fillRect(0,0,480,300);out.globalCompositeOperation='source-over';
      });
    }
    const paintNext=()=>{if(epoch!==libraryPaint||!libraryOpen)return;const paint=paintings.shift();if(paint){paint();requestAnimationFrame(paintNext);}};
    requestAnimationFrame(paintNext);
  }
  $('editor-tab').addEventListener('click',()=>showLibrary(false));$('library-tab').addEventListener('click',()=>showLibrary(true));
  $('library-trash').addEventListener('click',()=>{trashOpen=!trashOpen;libraryLimit=12;renderLibrary();});
  $('library-more').addEventListener('click',()=>{libraryLimit+=12;renderLibrary();});
  window.addEventListener('storage',event=>{if(event.key===libraryKey||event.key===null){updateLibraryCount();if(libraryOpen)renderLibrary();}});
  let videoJob=null;
  const mp4Types=['video/mp4;codecs=avc1.420028','video/mp4;codecs=avc1','video/mp4'];
  const mp4Type=()=>typeof MediaRecorder==='function'&&typeof canvas.captureStream==='function'?mp4Types.find(type=>MediaRecorder.isTypeSupported(type)):null;
  $('export-video').addEventListener('click',()=>{
    $('video-description').textContent=(viewMode==='logo'?'Логотип EvaOr с анимированной O. ':'Отдельная анимация. ')+'Без интерфейса. Видео 1080 × 1080, без звука, с выбранным фоном.';
    $('video-dialog').showModal();$('video-progress').hidden=true;
    const supported=mp4Type();$('video-start').disabled=!supported;
    $('video-status').textContent=supported?'MP4 использует фон просмотра; прозрачность доступна только в PNG.':'Этот браузер не поддерживает запись MP4. Откройте этот редактор в актуальном Chrome или Edge.';
  });
  function cancelVideo(message='Запись отменена. Настройки сохранены.'){
    if(!videoJob)return;
    videoJob.cancelled=true;videoJob.message=message;clearTimeout(videoJob.timer);
    if(videoJob.recorder.state!=='inactive')videoJob.recorder.stop();
  }
  $('video-close').addEventListener('click',()=>{cancelVideo();$('video-dialog').close();});
  $('video-dialog').addEventListener('cancel',()=>cancelVideo());
  $('video-cancel').addEventListener('click',()=>cancelVideo());
  $('video-start').addEventListener('click',()=>{
    if(videoJob)return;
    const type=mp4Type();if(!type){$('video-status').textContent='Запись MP4 недоступна в этом браузере.';return;}
    const seconds=Number($('video-duration').value);
    const snapshot={...state},sampleParticles=particles.slice(),startTime=time,snapshotView=viewMode,snapshotWeight=logoWeight,snapshotLayout={...logoLayout};
    const output=document.createElement('canvas');output.width=output.height=1080;
    const out=output.getContext('2d',{alpha:true});
    let stream,recorder;
    function paint(elapsed){
      renderScene(out,1080,1080,snapshot,sampleParticles,startTime+elapsed*snapshot.speed,0,snapshotView,snapshotWeight,snapshotLayout);
      out.globalCompositeOperation='destination-over';out.fillStyle=snapshot.background;out.fillRect(0,0,1080,1080);out.globalCompositeOperation='source-over';
    }
    // Use an alpha canvas so the selected background can be composited behind the particles.
    // The captured stream is opaque after each completed frame.
    try{
      paint(0);stream=output.captureStream(30);
      recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:8000000});
    }catch(error){stream?.getTracks().forEach(track=>track.stop());$('video-status').textContent='Не удалось запустить MP4. Попробуйте открыть редактор в Chrome или Edge.';return;}
    const job={recorder,stream,timer:null,cancelled:false,message:'',chunks:[],started:0};videoJob=job;
    $('video-start').disabled=true;$('video-duration').disabled=true;$('video-cancel').hidden=false;
    $('video-progress').hidden=false;$('video-progress').value=0;$('video-status').textContent='Подготовка записи…';
    const cleanup=()=>{
      clearTimeout(job.timer);stream.getTracks().forEach(track=>track.stop());
      if(videoJob===job)videoJob=null;
      $('video-start').disabled=!mp4Type();$('video-duration').disabled=false;$('video-cancel').hidden=true;last=0;
    };
    recorder.ondataavailable=event=>{if(event.data.size)job.chunks.push(event.data);};
    recorder.onerror=()=>{job.cancelled=true;job.message='Ошибка записи MP4. Попробуйте ещё раз.';if(recorder.state!=='inactive')recorder.stop();else{cleanup();$('video-status').textContent=job.message;}};
    recorder.onstop=()=>{
      cleanup();
      if(job.cancelled){$('video-status').textContent=job.message;return;}
      const blob=new Blob(job.chunks,{type:recorder.mimeType});
      if(!blob.size){$('video-status').textContent='Видео получилось пустым. Попробуйте ещё раз.';return;}
      download(blob,`evaor-${seconds}s-${new Date().toISOString().replace(/[:.]/g,'-')}.mp4`);
      $('video-progress').value=100;$('video-status').textContent=`Готово: MP4, ${seconds} секунд. Файл сохранён в загрузки.`;
    };
    const startDrawing=()=>{
      const tick=()=>{
        if(videoJob!==job||job.cancelled)return;
        const elapsed=(performance.now()-job.started)/1000;
        if(elapsed>=seconds){$('video-status').textContent='Сохраняем MP4…';recorder.stop();return;}
        paint(elapsed);$('video-progress').value=Math.min(99,elapsed/seconds*100);
        $('video-status').textContent=`Запись MP4: ${Math.min(seconds,Math.floor(elapsed))} / ${seconds} с`;
        job.timer=setTimeout(tick,Math.max(0,1000/30-(performance.now()-job.started-elapsed*1000)));
      };
      tick();
    };
    try{job.started=performance.now();recorder.start(1000);startDrawing();}catch{cleanup();$('video-status').textContent='Не удалось начать запись MP4.';}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelVideo('Запись отменена: вкладка была скрыта. Повторите экспорт и оставьте её открытой.');});
  function frame(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused&&!document.hidden&&!videoJob&&!libraryOpen){const target=pressed?1.7:(hovered||focused?1:0);boost+=(target-boost)*(1-Math.exp(-dt*5));time+=dt*state.speed*(1+boost*1.8);draw();}requestAnimationFrame(frame);}
  document.addEventListener('visibilitychange',()=>{last=0;});
  seed();updateUI();updateLibraryCount();new ResizeObserver(resize).observe($('canvas-wrap'));requestAnimationFrame(frame);
  document.fonts.load('400 100px "EvaOr Montserrat"','Evar').then(fonts=>{
    if(!fonts.length)throw new Error('Font unavailable');
    logoFontReady=true;updateViewUI();draw();if(libraryOpen)renderLibrary();
  }).catch(()=>{notice('Не удалось загрузить Montserrat. Экспорт логотипа недоступен до загрузки шрифта.');});
})();
