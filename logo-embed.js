// Export template, bundled with the selected configuration and shared renderer.
(() => {
  const font = new FontFace('EvaOr Montserrat', `url(data:font/ttf;base64,${EVAOR_FONT})`, {weight:'100 900'});
  const fontReady = font.load().then(loaded => {document.fonts.add(loaded);});
  class EvaOrLogo extends HTMLElement {
    static get observedAttributes(){return ['href','text-color','paused','interactive'];}
    constructor(){
      super();
      const shadow=this.attachShadow({mode:'open'});
      shadow.innerHTML=`<style>
        :host{display:inline-block;width:240px;max-width:100%;aspect-ratio:3.6;vertical-align:middle;flex-shrink:0}
        a{display:block;position:relative;width:100%;height:100%;color:inherit;border-radius:4px}
        a:focus-visible{outline:2px solid currentColor;outline-offset:4px}
        canvas{display:block;position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
        span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:600 36px sans-serif}
        canvas[hidden],span[hidden]{display:none}
      </style><a aria-label="EvaOr — главная"><span>EvaOr</span><canvas hidden aria-hidden="true"></canvas></a>`;
      this.link=shadow.querySelector('a');this.canvas=shadow.querySelector('canvas');this.fallback=shadow.querySelector('span');
      this.ctx=this.canvas.getContext('2d');this.time=EVAOR_CONFIG.playback.time;this.boost=0;this.intensity=0;
      this.particles=EvaOrRenderer.makeParticles(EVAOR_CONFIG.settings.count);this.last=0;this.ready=false;this.visible=true;
      this.motion=matchMedia('(prefers-reduced-motion: reduce)');
      this.motionChanged=()=>{this.last=0;this.paint();};
      this.link.addEventListener('pointerenter',()=>{if(this.getAttribute('interactive')!=='false')this.setIntensity(1);});
      this.link.addEventListener('pointerleave',()=>this.setIntensity(0));
      this.link.addEventListener('focus',()=>{if(this.getAttribute('interactive')!=='false')this.setIntensity(1);});
      this.link.addEventListener('blur',()=>this.setIntensity(0));
      this.tick=now=>{
        if(!this.isConnected)return;
        const dt=this.last?Math.min((now-this.last)/1000,.05):0;this.last=now;
        if(this.ready&&this.visible&&!document.hidden&&!this.motion.matches&&!this.hasAttribute('paused')){
          this.boost+=(this.intensity-this.boost)*(1-Math.exp(-dt*5));
          this.time+=dt*EVAOR_CONFIG.settings.speed*(1+this.boost*1.8);this.paint();
        }
        this.frame=requestAnimationFrame(this.tick);
      };
    }
    connectedCallback(){
      this.attributeChangedCallback();this.last=0;
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this);
      if(typeof IntersectionObserver!=='undefined'){
        this.intersection=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.last=0;});this.intersection.observe(this);
      }
      this.motion.addEventListener('change',this.motionChanged);
      fontReady.then(()=>{
        this.ready=true;this.fallback.hidden=true;this.canvas.hidden=false;
        if(this.isConnected)this.resize();
      }).catch(error=>{this.dispatchEvent(new CustomEvent('evaor-error',{detail:error}));});
      this.resize();this.frame=requestAnimationFrame(this.tick);
    }
    disconnectedCallback(){cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();this.intersection?.disconnect();this.motion.removeEventListener('change',this.motionChanged);this.last=0;}
    attributeChangedCallback(){
      if(!this.link)return;
      const href=this.getAttribute('href')||'/';
      try{const url=new URL(href,document.baseURI);this.link.href=['http:','https:','file:'].includes(url.protocol)?href:'/';}catch{this.link.href='/';}
      this.link.setAttribute('aria-label',this.getAttribute('aria-label')||'EvaOr — главная');
      if(this.getAttribute('interactive')==='false')this.intensity=0;
      this.last=0;this.paint();
    }
    resize(){
      const box=this.getBoundingClientRect();if(box.width<=0||box.height<=0)return;
      this.w=box.width;this.h=box.height;this.dpr=Math.min(devicePixelRatio||1,3);
      this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.paint();
    }
    paint(){
      if(!this.ready||!this.w)return;
      const c=EVAOR_CONFIG.composition;
      this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
      EvaOrRenderer.renderScene(this.ctx,this.w,this.h,EVAOR_CONFIG.settings,this.particles,this.time,this.boost,'logo',c.weight,c.layout,
        {header:true,textColor:this.getAttribute('text-color')||EVAOR_CONFIG.textColor});
    }
    setIntensity(value){this.intensity=Math.max(0,Math.min(1.7,Number(value)||0));}
    pause(){this.setAttribute('paused','');}
    play(){this.removeAttribute('paused');}
  }
  if(!customElements.get('evaor-logo'))customElements.define('evaor-logo',EvaOrLogo);
})();
