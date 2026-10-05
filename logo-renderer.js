// One renderer for the editor, exports and the website logo.
((root,factory)=>{
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./particle-math.js'));
  else root.EvaOrRenderer=factory(root.EvaOrParticles);
})(typeof globalThis!=='undefined'?globalThis:this,(EvaOrParticles)=>{
  const TAU=Math.PI*2;
  function makeParticles(count){
    let s=71023;const random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
    return Array.from({length:count},(_,i)=>({angle:i*2.399963229728653,offset:random(),band:random(),jitter:random(),size:.45+random()*.9,sign:i%2?1:-1}));
  }
  function renderScene(target,w,h,state,particles,time,boost,view='animation',weight=400,layout={oScale:100,spacing:0},options={}){
    target.clearRect(0,0,w,h);
    if(view==='logo'){renderLogo(target,w,h,state,particles,time,boost,weight,layout,options);return;}
    renderArtwork(target,w,h,state,particles,time,boost);
  }
  function renderLogo(target,w,h,state,particles,time,boost,weight,layout,options={}){
    target.save();
    // Measure a capital E so the luminous O shares the cap height and baseline.
    let fontSize=options.header?h*.98:Math.min(w*.23,h*.42);
    const font=size=>`${weight} ${size}px "EvaOr Montserrat", sans-serif`;
    target.font=font(fontSize);
    const cap=target.measureText('E').actualBoundingBoxAscent||fontSize*.72;
    const tracking=fontSize*layout.spacing/100;
    // Preserve Montserrat's kerning, then add tracking to each of the four gaps.
    const vX=target.measureText('Ev').width-target.measureText('v').width+tracking;
    const aX=target.measureText('Eva').width-target.measureText('a').width+tracking*2;
    const left=target.measureText('Eva').width+tracking*2,right=target.measureText('r').width;
    const solid=['plasma','arcs','waves'].includes(state.model);
    const band=['band','outer','point'].includes(state.source)&&!solid?state.thickness*.5:0;
    const contour=state.model==='waves'?47:state.model==='arcs'?EvaOrParticles.createArcScene(state,0,0,100).radius:Math.max(5,state.radius+band);
    const outward=!solid&&state.direction!=='in'?state.travel:0;
    // Keep EvaOr a single word; outer particles may spill softly over adjacent letters.
    const spread=Math.min(2.2,1+outward/contour),slot=cap*layout.oScale/100;
    const gap=fontSize*.025+tracking,total=left+gap*2+slot+right;
    const fit=Math.min(1,w*(options.header?.94:.82)/total,h*(options.header?.84:.65)/Math.max(cap,slot*spread));
    target.translate((w-total*fit)/2,(h-cap*fit)/2);
    target.scale(fit,fit);target.font=font(fontSize);target.textBaseline='alphabetic';
    const bg=state.background.slice(1).match(/../g).map(v=>parseInt(v,16));
    target.fillStyle=options.textColor || (bg[0]*.2126+bg[1]*.7152+bg[2]*.0722>160?'#101014':'#fcfcfc');
    target.fillText('E',0,cap);target.fillText('v',vX,cap);target.fillText('a',aX,cap);target.fillText('r',left+gap*2+slot,cap);
    const box=650,artScale=slot/(box*.88*contour/100*2);
    target.translate(left+gap+slot/2,cap/2);target.scale(artScale,artScale);target.translate(-box/2,-box/2);
    renderArtwork(target,box,box,state,particles,time,boost);
    target.restore();
  }
  function renderArtwork(target,w,h,state,particles,time,boost){
    if(state.model==='waves'){renderWaves(target,w,h,state,time,boost);return;}
    if(state.model==='arcs'){renderArcs(target,w,h,state,time,boost);return;}
    if(state.model==='plasma'){renderPlasma(target,w,h,state,time,boost);return;}
    const extent=Math.min(w,h)*.88;
    const scale=extent/650;
    const model=EvaOrParticles.createModel(state,boost,time);
    target.save();target.translate(w/2,h/2);
    target.lineCap='round';
    for(const p of particles){
      const age=(p.offset+time/state.life)%1;
      const at=model.position(p,age,extent);
      const {radius,alpha:fade,rgb}=model.appearance(p,age,scale);
      if(state.model!=='vortex' && state.trails && state.trail>0){
        const length=state.trail/100*.55;
        const pathTurns=state.trajectory==='growing'?state.growthTurns*1.3:state.trajectory==='spiral'&&state.spiralWidth>0?state.spiralTurns:0;
        const steps=Math.max(6,Math.ceil(length*pathTurns*20));
        for(let j=steps;j>0;j--){
          const a=age-length*j/steps,bb=age-length*(j-1)/steps;
          if(bb<=0)continue;
          const start=model.position(p,Math.max(0,a),extent),end=model.position(p,bb,extent);
          const past=model.appearance(p,Math.max(0,(a+bb)/2),scale);
          target.strokeStyle=`rgba(${past.rgb},${past.alpha*fade*(1-j/(steps+1))*.4})`;target.lineWidth=Math.max(.3*scale,past.radius*.7);
          target.beginPath();target.moveTo(start.x,start.y);target.lineTo(end.x,end.y);target.stroke();
        }
      }
      if(state.glow>0){
        target.fillStyle=`rgba(${rgb},${fade*state.glow/100*.07})`;target.beginPath();target.arc(at.x,at.y,radius*(3+state.glow/25),0,TAU);target.fill();
        target.fillStyle=`rgba(${rgb},${fade*state.glow/100*.15})`;target.beginPath();target.arc(at.x,at.y,radius*2.2,0,TAU);target.fill();
      }
      target.fillStyle=`rgba(${rgb},${fade})`;target.beginPath();target.arc(at.x,at.y,radius,0,TAU);target.fill();
    }
    target.restore();
  }
  function renderWaves(target,w,h,state,time,boost){
    const scene=EvaOrParticles.createWaveScene(state,time,boost,Math.min(w,h)*.88);
    const start=state.color.slice(1).match(/../g).map(v=>parseInt(v,16)),end=state.colorEnd.slice(1).match(/../g).map(v=>parseInt(v,16));
    target.save();target.translate(w/2,h/2);
    for(const wave of scene.waves){
      if(wave.alpha<=0)continue;
      target.fillStyle=`rgba(${start.map((v,i)=>Math.round(v+(end[i]-v)*wave.age)).join(',')},${wave.alpha})`;
      target.beginPath();
      for(let i=0;i<=240;i++){const p=scene.point(wave,i/240*TAU);if(i===0)target.moveTo(p.x,p.y);else target.lineTo(p.x,p.y);}
      for(let i=240;i>=0;i--){const p=scene.point(wave,i/240*TAU,true);target.lineTo(p.x,p.y);}
      target.closePath();target.fill();
    }
    const c=scene.core;
    target.fillStyle=`rgba(${start.join(',')},${c.alpha})`;target.beginPath();target.arc(c.x,c.y,c.radius,0,TAU);target.arc(c.x,c.y,c.radius-c.width,0,TAU,true);target.fill('evenodd');
    target.restore();
  }
  function renderArcs(target,w,h,state,time,boost){
    const extent=Math.min(w,h)*.88,scene=EvaOrParticles.createArcScene(state,time,boost,extent);
    const start=state.color.slice(1).match(/../g).map(v=>parseInt(v,16));
    const end=state.colorEnd.slice(1).match(/../g).map(v=>parseInt(v,16));
    const tint=u=>end.map((v,i)=>Math.round(v+(start[i]-v)*u)).join(',');
    const glow=state.glow/100;
    target.save();target.translate(w/2,h/2);target.globalCompositeOperation='lighter';target.lineCap='round';
    for(const ring of scene.rings){
      const steps=Math.max(32,Math.ceil(state.arcLength/360*220));
      const points=Array.from({length:steps+1},(_,i)=>scene.point(ring,i/steps));
      for(let i=0;i<steps;i++){
        const u=(i+.5)/steps,a=scene.strength(ring,u);
        if(a<.002)continue;
        const bright=state.arcLength===360?.5-.5*Math.cos(TAU*u):u;
        const color=tint(bright),line=ring.width*(.55+.45*bright);
        target.beginPath();target.moveTo(points[i].x,points[i].y);target.lineTo(points[i+1].x,points[i+1].y);
        // Layered translucent strokes preserve a crisp core, including in transparent PNGs.
        if(glow>0){
          for(const [width,alpha] of [[28,.025],[12,.07],[5,.18]]){
            target.lineWidth=line*width;target.strokeStyle=`rgba(${color},${a*glow*alpha})`;target.stroke();
          }
        }
        target.lineWidth=line;target.strokeStyle=`rgba(${color},${a})`;target.stroke();
        target.lineWidth=line*.3;target.strokeStyle=`rgba(255,255,255,${a*bright*.55})`;target.stroke();
      }
    }
    for(let i=0;i<state.arcParticles;i++){
      const p=scene.spark(i);if(p.alpha<.005)continue;
      const color=tint(p.u);
      if(glow>0){target.fillStyle=`rgba(${color},${p.alpha*glow*.08})`;target.beginPath();target.arc(p.x,p.y,p.size*3,0,TAU);target.fill();}
      target.fillStyle=`rgba(${color},${p.alpha})`;target.beginPath();target.arc(p.x,p.y,p.size,0,TAU);target.fill();
    }
    target.restore();
  }
  function renderPlasma(target,w,h,state,time,boost){
    const extent=Math.min(w,h)*.88,scale=extent/650;
    const scene=EvaOrParticles.createPlasmaScene(state,time,boost,extent);
    const R=scene.radius,glow=state.glow/100;
    const rgba=(hex,alpha)=>`rgba(${hex.slice(1).match(/../g).map(v=>parseInt(v,16)).join(',')},${Math.max(0,Math.min(1,alpha))})`;
    function light(x,y,r,color,alpha){
      if(r<=0||alpha<=0)return;
      const gradient=target.createRadialGradient(x,y,0,x,y,r);
      gradient.addColorStop(0,rgba(color,alpha));gradient.addColorStop(.18,rgba(color,alpha*.55));gradient.addColorStop(.5,rgba(color,alpha*.16));gradient.addColorStop(1,rgba(color,0));
      target.fillStyle=gradient;target.beginPath();target.arc(x,y,r,0,TAU);target.fill();
    }
    target.save();target.translate(w/2,h/2);target.globalCompositeOperation='lighter';target.lineCap='round';target.lineJoin='round';
    const rim=state.plasmaRim/100*scene.pulse;
    if(rim>0){
      const halo=target.createRadialGradient(0,0,R*.86,0,0,R*1.13);
      for(const [stop,alpha] of [[0,0],[.25,.06*glow],[.44,.3*glow],[.51,.85],[.55,.5],[.68,.13*glow],[1,0]])halo.addColorStop(stop,rgba(state.plasmaRimColor,alpha*rim));
      target.fillStyle=halo;target.beginPath();target.arc(0,0,R*1.13,0,TAU);target.fill();
      // Separate luminous patches travel around a stable circular silhouette.
      for(let i=0;i<80;i++){
        const a=i/80*TAU;
        const strength=.3+.7*Math.pow((1+Math.sin(a*5-scene.spin*1.6+Math.sin(a*3+scene.spin*.4)))/2,2);
        target.strokeStyle=rgba(state.plasmaRimColor,rim*strength*.65);target.lineWidth=(1.3+glow)*scale;
        target.beginPath();target.arc(0,0,R,a,a+TAU/80+.002);target.stroke();
      }
    }
    for(const ray of scene.rays){
      const length=Math.hypot(ray.x,ray.y);
      if(length<.01)continue;
      const gradient=target.createLinearGradient(0,0,ray.x,ray.y);
      gradient.addColorStop(0,rgba(state.color,0));
      gradient.addColorStop(.09,rgba(state.color,.4));
      gradient.addColorStop(.6,rgba(state.color,.65));
      gradient.addColorStop(1,rgba(state.colorEnd,1));
      const line=state.plasmaWidth*scale*(.55+ray.depth*.8);
      target.strokeStyle=gradient;
      const path=()=>{target.beginPath();ray.points.forEach((p,i)=>i?target.lineTo(p.x,p.y):target.moveTo(p.x,p.y));target.stroke();};
      const steady=ray.impulse?state.plasmaBaseLight/100:1;
      // Wide, faint passes surround a crisp filament, with no persistent frame blur.
      if(glow>0){target.globalAlpha=ray.alpha*steady*glow*.09;target.lineWidth=line*11;path();target.globalAlpha=ray.alpha*steady*glow*.22;target.lineWidth=line*4.5;path();}
      target.globalAlpha=ray.alpha*steady*.85;target.lineWidth=line;path();target.globalAlpha=1;
      let tip=steady;
      if(ray.impulse){
        const packet=ray.impulse;
        const at=u=>{const t=Math.max(0,Math.min(1,u))*(ray.points.length-1),j=Math.min(ray.points.length-2,Math.floor(t)),f=t-j;return {x:ray.points[j].x+(ray.points[j+1].x-ray.points[j].x)*f,y:ray.points[j].y+(ray.points[j+1].y-ray.points[j].y)*f};};
        // The bright head advances along the curved filament; its tail stays behind it.
        for(let k=11;k>=0;k--){
          const u0=packet.head-packet.sign*packet.length*(k+1)/12,u1=packet.head-packet.sign*packet.length*k/12;
          if(Math.max(u0,u1)<0||Math.min(u0,u1)>1)continue;
          const a=at(u0),b=at(u1),strength=ray.alpha*packet.fade*Math.pow(1-k/12,1.5);
          target.beginPath();target.moveTo(a.x,a.y);target.lineTo(b.x,b.y);
          if(glow>0){target.globalAlpha=strength*glow*.22;target.lineWidth=line*7;target.stroke();}
          target.globalAlpha=strength;target.lineWidth=line*1.8;target.stroke();
        }
        target.globalAlpha=1;
        const head=at(packet.head),headColor=packet.head>.6?state.colorEnd:state.color;
        light(head.x,head.y,(4+glow*10)*scale,headColor,ray.alpha*packet.fade);
        target.fillStyle=rgba('#ffffff',ray.alpha*packet.fade*.8);target.beginPath();target.arc(head.x,head.y,line*.8,0,TAU);target.fill();
        tip=Math.max(steady,packet.fade*Math.max(0,1-Math.abs(1-packet.head)/.12));
      }
      light(ray.x,ray.y,(4+glow*13)*scale*(.65+ray.depth),state.colorEnd,ray.alpha*tip*(.2+glow*.6));
      target.fillStyle=rgba(state.colorEnd,ray.alpha*tip*.8);target.beginPath();target.arc(ray.x,ray.y,line*.85,0,TAU);target.fill();
      if(length>R*.92)light(ray.x,ray.y,extent*.035,state.plasmaRimColor,ray.alpha*tip*rim*glow*.45);
    }
    const core=state.plasmaCore/100*scene.pulse;
    light(0,0,extent*state.plasmaCoreSize/100,state.plasmaCoreColor,core*(.35+glow*.65));
    light(0,0,(2.5+state.plasmaCoreSize)*scale,state.plasmaCoreColor,core*.8);
    light(0,0,2.5*scale,'#ffffff',core*.65);
    target.restore();
  }
  return {renderScene,makeParticles};
});
