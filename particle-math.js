// Shared by the live canvas, PNG export and trajectory checks. No browser dependencies.
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EvaOrParticles = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const TAU = Math.PI * 2;
  const mix = (a,b,t) => a+(b-a)*t;
  const clamp = x => Math.max(0,Math.min(1,x));
  const smooth = x => { x=clamp(x); return x*x*(3-2*x); };
  const noise = n => { const v=Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
  const rgb = hex => hex.slice(1).match(/../g).map(n=>parseInt(n,16));

  function createModel(state, boost=0, time=0) {
    if(state.model==='vortex') return createVortex(state,boost,time);
    const startColor=rgb(state.color),endColor=rgb(state.colorEnd);
    const rayCount=Math.round(state.rayCount);
    const spacing=TAU/rayCount;
    const densityExponent=1+state.contourDensity/100*3;

    function progress(age) { return Math.pow(clamp(age),densityExponent); }

    function basePosition(p,age,extent) {
      const u=progress(age);
      const ray=Math.floor(((p.angle%TAU)+TAU)%TAU/spacing);
      const baseAngle=state.raysEnabled
        ? (ray+.5)*spacing+(p.jitter-.5)*spacing*state.raySpread/100
        : p.angle;
      const length=state.raysEnabled ? 1-state.rayVariation/100*(1-noise(ray+1))*.85 : 1;
      const inner=state.radius/100,thick=state.thickness/100;
      let r=inner+thick*p.band;
      if(state.source==='inner'||state.source==='contour')r=inner;
      if(state.source==='outer')r=inner+thick;
      const sign=state.direction==='in'?-1:state.direction==='both'?p.sign:1;
      r=Math.max(0,r+sign*state.travel/100*(1+boost*.35)*u*length);
      const angle=baseAngle+state.swirl/100*u*2.5;
      // An exact contour has no per-particle radial jitter at birth.
      const jitter=state.source==='contour'?u:1;
      const distortion=1+state.asymmetry/100*(.17*Math.sin(3*angle+.7)+.11*Math.cos(5*angle-1)+.12*(p.jitter-.5)*jitter);
      r*=distortion*(1+boost*.07);
      let x=Math.cos(angle)*r,y=Math.sin(angle)*r;
      if(state.source==='point'){
        const t=sign<0?1-u:u;
        x=mix(state.pointX/100,x,t);y=mix(state.pointY/100,y,t);
      }
      return {x:x*extent,y:y*extent};
    }

    const axes=new WeakMap();
    const growthPaths=new WeakMap();
    function growingSpiral(p,age,extent){
      let path=growthPaths.get(p);
      if(!path){
        const ray=Math.floor(((p.angle%TAU)+TAU)%TAU/spacing);
        const angle=state.raysEnabled?(ray+.5)*spacing+(p.jitter-.5)*spacing*state.raySpread/100:p.angle;
        const rayLength=state.raysEnabled?1-state.rayVariation/100*(1-noise(ray+1))*.85:1;
        const sign=state.direction==='in'?-1:state.direction==='both'?p.sign:1;
        const spread=state.growthSpread/100;
        const turns=state.growthTurns*(1+(p.jitter-.5)*spread*.6);
        const rotation=(state.growthRotation==='ccw'?-1:1)*TAU*turns;
        let r=state.radius/100;
        if(state.source==='outer')r+=state.thickness/100;
        else if(['band','point'].includes(state.source))r+=state.thickness/100*p.band;
        // Freeze the contour distortion at birth so it cannot cause radial backtracking.
        r*=1+state.asymmetry/100*(.17*Math.sin(3*angle+.7)+.11*Math.cos(5*angle-1)+.12*(p.jitter-.5)*(state.source==='contour'?0:1));
        r*=1+boost*.07;
        const travel=state.travel/100*(1+boost*.35)*rayLength*(1+(p.band-.5)*spread*.5);
        path={x:0,y:0,start:r,end:Math.max(0,r+sign*travel),angle,rotation};
        if(state.source==='point'){
          const x=state.pointX/100,y=state.pointY/100;
          const ringRadius=sign>0?path.end:path.start;
          const dx=Math.cos(angle)*ringRadius-x,dy=Math.sin(angle)*ringRadius-y;
          const distance=Math.hypot(dx,dy),targetAngle=Math.atan2(dy,dx);
          // Spiral around the selected point, preserving its ring destination/source.
          path={x,y,start:sign>0?0:distance,end:sign>0?distance:0,angle:targetAngle-(sign>0?rotation:0),rotation};
        }
        growthPaths.set(p,path);
      }
      const u=progress(age),radius=mix(path.start,path.end,u),angle=path.angle+path.rotation*u;
      return {x:(path.x+Math.cos(angle)*radius)*extent,y:(path.y+Math.sin(angle)*radius)*extent};
    }
    function position(p,age,extent){
      if(state.trajectory==='growing')return growingSpiral(p,age,extent);
      const at=basePosition(p,age,extent);
      if(state.trajectory!=='spiral'||!state.spiralWidth||age<=0||age>=1)return at;
      let axis=axes.get(p);
      if(!axis){
        const a=basePosition(p,0,1),b=basePosition(p,1,1);
        const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
        axis=length>1e-8?{x:dx/length,y:dy/length}:null;
        if(axis)axes.set(p,axis);
      }
      if(!axis)return at;
      const u=progress(age);
      const amplitude=state.spiralWidth/100*extent*Math.sin(Math.PI*u);
      const phase=TAU*(state.spiralTurns*u+p.jitter*state.spiralPhase/100);
      // A projected helix: elliptical turns around the travel axis, tapering to zero at endpoints.
      const forward=Math.cos(phase)*amplitude*.45,side=Math.sin(phase)*amplitude;
      return {x:at.x+axis.x*forward-axis.y*side,y:at.y+axis.y*forward+axis.x*side};
    }

    function appearance(p,age,scale=1) {
      const u=progress(age);
      const colorT=Math.pow(u,state.colorCurve);
      const color=startColor.map((v,i)=>Math.round(mix(v,endColor[i],colorT)));
      const opacity=mix(state.opacityStart,state.opacityEnd,Math.pow(u,state.fadeCurve))/100;
      // Short birth/death envelopes prevent visible popping when a particle is recycled.
      const envelope=smooth(age/.018)*smooth((1-age)/.08);
      return {
        radius:state.size*p.size*scale*mix(1,state.sizeEnd/100,u),
        alpha:clamp(opacity*envelope*(.5+p.size*.35)),
        rgb:color.join(','),color
      };
    }
    return {position,appearance,progress};
  }
  function createVortex(state,boost,time){
    const colors=[rgb(state.color),rgb(state.colorEnd)];
    const turn=state.rotation==='ccw'?-1:1;
    const rotation=time*.42*turn;
    function position(p,age,extent){
      const t=p.offset;
      const angle=rotation+(p.sign>0?0:Math.PI)-turn*t*state.tailLength*Math.PI/180;
      const spread=state.dispersion/100;
      const inner=state.radius/100,thick=state.thickness/100;
      const band=p.band;
      const turbulence=Math.sin(p.angle*2.71)*Math.sin(p.angle*.43);
      const r=inner+thick*(band+spread*t*t*(.3+turbulence*.7));
      const distortion=1+state.asymmetry/100*.12*Math.sin(3*angle+time*.12);
      const a=angle+turn*spread*t*t*(p.jitter-.5)*.45;
      return {x:Math.cos(a)*r*distortion*(1+boost*.07)*extent,y:Math.sin(a)*r*distortion*(1+boost*.07)*extent};
    }
    function appearance(p,age,scale=1){
      const t=p.offset;
      const head=smooth(t/.13);
      const tail=Math.pow(1-smooth(t),state.tailFade);
      const edge=smooth(p.band/.05)*smooth((1-p.band)/.12);
      // Each stream keeps its colour; transparency blends their overlapping tails.
      const color=colors[p.sign>0?0:1];
      return {radius:state.size*p.size*scale*(1-t*.55),alpha:clamp(head*tail*edge*state.vortexOpacity/100),rgb:color.join(','),color};
    }
    return {position,appearance,progress:age=>age};
  }
  // Orthographic projection of a rotating sphere. The silhouette remains circular,
  // while surface points travel in depth and their spokes shorten and lengthen.
  function createPlasmaScene(state,time=0,boost=0,extent=1){
    const radius=extent*state.radius/100*(1+boost*.035);
    const tilt=state.plasmaTilt*Math.PI/180;
    const spin=time*state.plasmaSpin*(state.plasmaRotation==='ccw'?-1:1)*.55;
    const ct=Math.cos(tilt),st=Math.sin(tilt),cs=Math.cos(spin),ss=Math.sin(spin);
    const pulse=state.plasmaPulse/100;
    const rays=[];
    for(let i=0;i<state.plasmaCount;i++){
      const y=1-2*(i+.5)/state.plasmaCount;
      const ring=Math.sqrt(1-y*y),a=i*2.399963229728653;
      const x=Math.cos(a)*ring,z=Math.sin(a)*ring;
      const rx=x*cs+z*ss,rz=z*cs-x*ss;
      const py=y*ct-rz*st,pz=y*st+rz*ct;
      const depth=(pz+1)/2;
      const tick=time*(state.plasmaFlickerRate??7)+noise(i+38)*13;
      const frame=Math.floor(tick),blend=smooth((tick-frame)/.35);
      const flicker=Math.pow(mix(noise(i*71+frame),noise(i*71+frame+1),blend),2);
      const alpha=(.22+.78*depth)*(1-pulse*.92+pulse*.92*flicker);
      const points=[];
      for(let j=0;j<=18;j++){
        const u=j/18;
        const bend=state.plasmaTurbulence/100*.065*Math.sin(Math.PI*u);
        const wave=Math.sin(u*11+time*1.6+i*2.1)+.4*Math.sin(u*23-time*2.3+i);
        points.push({x:(rx*u-py*bend*wave)*radius,y:(py*u+rx*bend*wave)*radius});
      }
      rays.push({points,x:rx*radius,y:py*radius,depth,alpha,index:i,impulse:plasmaImpulse(state,i,time)});
    }
    rays.sort((a,b)=>a.depth-b.depth);
    return {radius,rays,pulse:1-pulse*.15+pulse*.15*Math.sin(time*2.3),spin};
  }
  function plasmaImpulse(state,index,time){
    if(!state.plasmaFlow||state.plasmaFlow==='off')return null;
    const sign=state.plasmaFlow==='in'||state.plasmaFlow==='both'&&index%2?-1:1;
    const phase=noise(index+101)+time*state.plasmaFlowSpeed;
    const progress=phase-Math.floor(phase),head=sign>0?progress:1-progress;
    return {head,sign,length:state.plasmaPacketLength/100,fade:smooth(progress/.045)*smooth((1-progress)/.045)};
  }
  return {createModel,createPlasmaScene,plasmaImpulse};
});
