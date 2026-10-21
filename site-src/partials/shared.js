/* ═══ AHRDVS SHARED — runs on every page. Vanilla JS, no libraries ═══ */
(function(){
'use strict';

/* ═══════════════════════════════════════════════════════════════════
   ▼▼▼  SHOWREEL VIDEO URL — used by the landing page and Portfolio  ▼▼▼
   A DIRECT link to the self-hosted .mp4. Leave '' for the placeholder.
   The reel frames play it from any host. For it to ALSO stream inside
   the landing-page helix, the host must send CORS headers
   (Access-Control-Allow-Origin: *).                                    */
var REEL_URL='https://pub-327e6b6b6741493480dac5f14bfe9379.r2.dev/Ahrendezvous%20Highlight%20Reel%201%20(low%20qual).mp4';
/* ═══════════════════════════════════════════════════════════════════ */

var root=document.documentElement;
var RED=matchMedia('(prefers-reduced-motion:reduce)').matches;
var TOUCH=matchMedia('(pointer:coarse)').matches;
var PAGE=document.body.getAttribute('data-page')||'index';
var BUILT=/*@data:pages*/[];    /* pages that exist — links to others show "in production" */
var SCENES=/*@data:scenes*/{};  /* cut-transition title per page */
var NAMES={index:'Home',commercial:'Commercial',cultural:'Cultural',portfolio:'Portfolio',about:'About',contact:'Contact'};
var A=window.AHRDVS={RED:RED,TOUCH:TOUCH,PAGE:PAGE,REEL_URL:REEL_URL};

/* ── helpers ───────────────────────────────────── */
function p2(n){return (n<10?'0':'')+n;}
A.p2=p2;
/* SMPTE-style timecode at 24fps from seconds */
A.tc=function(sec){
  var f=Math.floor(sec*24);
  return p2(Math.floor(f/86400)%24)+':'+p2(Math.floor(f/1440)%60)+':'+p2(Math.floor(f/24)%60)+':'+p2(f%24);
};
/* sessionStorage that never throws (it can be blocked inside third-party iframes) */
A.store={
  get:function(k){try{return sessionStorage.getItem(k);}catch(e){return null;}},
  set:function(k,v){try{sessionStorage.setItem(k,v);}catch(e){}}
};
/* clipboard with a fallback for iframes that lack clipboard permission */
A.copy=function(text){
  return new Promise(function(res,rej){
    function legacy(){
      var ta=document.createElement('textarea');
      ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);ta.select();
      var ok=false;try{ok=document.execCommand('copy');}catch(e){}
      document.body.removeChild(ta);
      if(ok)res();else rej();
    }
    if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(res,legacy);
    else legacy();
  });
};

/* ── text scramble ─────────────────────────────── */
var CHSET='ABCDEFGHJKLMNPQRSTUVWXYZ#%&?@!';
A.scramble=function(el){
  if(!el||RED)return;
  var orig=el.getAttribute('data-orig');
  if(orig===null){orig=el.textContent;el.setAttribute('data-orig',orig);}
  clearInterval(el._scr);
  var total=14,f=0;
  el._scr=setInterval(function(){
    var o='';
    for(var i=0;i<orig.length;i++){
      if(orig[i]===' '){o+=' ';continue;}
      o+=f/total>i/orig.length?orig[i]:CHSET[Math.floor(Math.random()*CHSET.length)];
    }
    el.textContent=o;
    if(++f>total){clearInterval(el._scr);el.textContent=orig;}
  },38);
};
A.unscramble=function(el){
  clearInterval(el._scr);
  var o=el.getAttribute('data-orig');if(o!==null)el.textContent=o;
};
document.querySelectorAll('.nav-links a,[data-st]').forEach(function(el){
  var host=el.hasAttribute('data-st')?(el.closest('a,button,[data-st-host]')||el):el;
  host.addEventListener('pointerenter',function(){A.scramble(el);});
  host.addEventListener('pointerleave',function(){A.unscramble(el);});
});

/* ── toast ─────────────────────────────────────── */
var toastEl=document.getElementById('toast'),toastT;
A.toast=function(msg){
  if(!toastEl)return;
  toastEl.lastChild.textContent=msg;
  toastEl.classList.add('on');
  clearTimeout(toastT);
  toastT=setTimeout(function(){toastEl.classList.remove('on');},3400);
};

/* ── CURSOR — dot + lagging ring + ember/gold trail ── */
var dot=document.getElementById('c-dot'),ring=document.getElementById('c-ring');
A.cursor=function(){};
if(!TOUCH&&dot&&ring){
  root.classList.add('has-cursor');
  var mx=-100,my=-100,dx=mx,dy=my,rx=mx,ry=my,live=false;
  var TN=RED?0:12,trail=[],tx=[],ty=[];
  for(var ti=0;ti<TN;ti++){
    var td=document.createElement('div'),ts=(1-ti/TN)*4;
    td.className='c-trail';
    td.style.cssText='width:'+ts+'px;height:'+ts+'px;background:'+(ti%2?'#FF4517':'#C5A880')+';opacity:'+((1-ti/TN)*.5);
    document.body.appendChild(td);trail.push(td);tx.push(mx);ty.push(my);
  }
  addEventListener('pointermove',function(e){
    if(e.pointerType==='touch')return;
    mx=e.clientX;my=e.clientY;
    if(!live){
      live=true;dx=rx=mx;dy=ry=my;
      for(var i=0;i<TN;i++){tx[i]=mx;ty[i]=my;}
      root.classList.add('cursor-on');
    }
  },{passive:true});
  root.addEventListener('mouseleave',function(){live=false;root.classList.remove('cursor-on');});
  (function loop(){
    requestAnimationFrame(loop);
    if(!live)return;
    dx+=(mx-dx)*.6;dy+=(my-dy)*.6;
    rx+=(mx-rx)*.17;ry+=(my-ry)*.17;
    dot.style.transform='translate3d('+dx+'px,'+dy+'px,0) translate(-50%,-50%)';
    ring.style.transform='translate3d('+rx+'px,'+ry+'px,0) translate(-50%,-50%)';
    for(var i=0;i<TN;i++){
      var px=i?tx[i-1]:mx,py=i?ty[i-1]:my;
      tx[i]+=(px-tx[i])*.3;ty[i]+=(py-ty[i])*.3;
      trail[i].style.transform='translate3d('+tx[i]+'px,'+ty[i]+'px,0) translate(-50%,-50%)';
    }
  })();
  var STATES=['expand','locked','label','text'];
  A.cursor=function(state,label){
    for(var i=0;i<STATES.length;i++)ring.classList.toggle(STATES[i],STATES[i]===state);
    dot.classList.toggle('text',state==='text');
    if(label)ring.setAttribute('data-label',label);
  };
  /* delegated, so content built later by page scripts gets hover states too */
  document.addEventListener('pointerover',function(e){
    var t=e.target;if(!t||!t.closest)return;
    if(t.closest('input:not([type=radio]):not([type=checkbox]),textarea,select'))return A.cursor('text');
    var c=t.closest('[data-cursor]');
    if(c)return A.cursor('label',c.getAttribute('data-cursor'));
    if(t.closest('[data-lock]'))return A.cursor('locked');
    if(t.closest('a,button,label,[data-hover]'))return A.cursor('expand');
    A.cursor(null);
  });
}

/* ── MAGNETIC ──────────────────────────────────── */
if(!TOUCH&&!RED){
  document.querySelectorAll('[data-magnetic]').forEach(function(el){
    var r=null;
    el.addEventListener('pointerenter',function(){r=el.getBoundingClientRect();});
    el.addEventListener('pointermove',function(e){
      if(!r)r=el.getBoundingClientRect();
      el.style.transition='transform .35s cubic-bezier(.16,1,.3,1)';
      el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.3).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px)';
    });
    el.addEventListener('pointerleave',function(){
      el.style.transition='transform .9s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform='';r=null;
    });
  });
}

/* ── CLAPPERBOARD: the flap claps on hover (and on demand) ── */
A.clap=function(host){
  var top=host&&host.querySelector('.nc-top');
  if(!top||RED||!top.animate||host._clap)return;
  host._clap=true;
  top.animate([
    {transform:'rotate(0deg)'},
    {transform:'rotate(-22deg)',offset:.28,easing:'cubic-bezier(.2,.8,.2,1)'},
    {transform:'rotate(3deg)',offset:.6},
    {transform:'rotate(-1.5deg)',offset:.8},
    {transform:'rotate(0deg)'}
  ],{duration:460,easing:'ease-out'}).onfinish=function(){host._clap=false;};
};
document.querySelectorAll('[data-clap]').forEach(function(c){
  c.addEventListener('pointerenter',function(){A.clap(c);});
});

/* ── NAV: active page, scrolled state, progress bar ── */
var nav=document.getElementById('nav'),prog=document.getElementById('progress');
document.querySelectorAll('[data-nav="'+PAGE+'"]').forEach(function(a){
  if(a.classList.contains('nav-logo'))return;
  a.classList.add('is-active');a.setAttribute('aria-current','page');
});
function onScroll(){
  if(nav)nav.classList.toggle('scrolled',scrollY>60);
  if(prog){
    var h=root.scrollHeight-innerHeight;
    prog.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';
  }
}
addEventListener('scroll',onScroll,{passive:true});
onScroll();

/* ── MOBILE MENU ───────────────────────────────── */
var menu=document.getElementById('menu'),menuBtn=document.getElementById('menu-btn');
var mainEl=document.getElementById('main'),footEl=document.querySelector('footer');
function setMenu(open){
  if(!menu||!menuBtn||root.classList.contains('menu-open')===open)return;
  root.classList.toggle('menu-open',open);
  menuBtn.setAttribute('aria-expanded',String(open));
  menuBtn.querySelector('.mb-label').textContent=open?'Close':'Menu';
  menu.inert=!open;
  if(mainEl)mainEl.inert=open;
  if(footEl)footEl.inert=open;
  if(open){
    var first=menu.querySelector('a');
    if(first)setTimeout(function(){first.focus({preventScroll:true});},80);
  }
}
A.menu=setMenu;
if(menuBtn)menuBtn.addEventListener('click',function(){setMenu(!root.classList.contains('menu-open'));});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&root.classList.contains('menu-open')){setMenu(false);menuBtn.focus();}
});
var wide=matchMedia('(min-width:1261px)');
function onWide(e){if(e.matches)setMenu(false);}
if(wide.addEventListener)wide.addEventListener('change',onWide);else wide.addListener(onWide);

/* ── CUT: letterbox transitions + in-site link routing ── */
var leaving=false,cutTitle=document.getElementById('cut-title');
function keyOf(url){
  var f=decodeURIComponent(url.pathname.split('/').pop()||'').replace(/\.html?$/i,'');
  return f||'index';
}
A.go=function(href,key){
  if(leaving)return;
  leaving=true;
  if(cutTitle)cutTitle.textContent=SCENES[key]||'';
  if(RED||!root.classList.contains('cut-in')){location.href=href;return;}
  root.classList.add('cut-out');
  setTimeout(function(){location.href=href;},580);
};
document.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a||(a.target&&a.target!=='_self')||a.hasAttribute('download'))return;
  var raw=a.getAttribute('href');
  /* leave alone: in-page hashes, mailto:/tel:/https: and protocol-relative links */
  if(!raw||raw.charAt(0)==='#'||/^[a-z][\w+.-]*:/i.test(raw)||raw.indexOf('//')===0)return;
  var url=new URL(a.href),key=keyOf(url);
  e.preventDefault();
  if(BUILT.indexOf(key)<0){A.toast((NAMES[key]||'That page')+' — in production. Opening soon.');return;}
  if(key===PAGE){
    var t=url.hash.length>1&&document.getElementById(url.hash.slice(1));
    if(t)t.scrollIntoView({behavior:RED?'auto':'smooth'});else scrollTo({top:0,behavior:RED?'auto':'smooth'});
    setMenu(false);
    return;
  }
  A.go(url.href,key);
});
/* back/forward cache restores the page mid-transition — reopen it */
addEventListener('pageshow',function(e){
  if(!e.persisted)return;
  leaving=false;
  setMenu(false);
  root.classList.remove('cut-out');
});

/* ── REVEALS: fade-ups and word-by-word headline masks ── */
var io=('IntersectionObserver' in window)&&!RED?new IntersectionObserver(function(es){
  es.forEach(function(en){
    if(!en.isIntersecting)return;
    en.target.classList.add('in');io.unobserve(en.target);
  });
},{rootMargin:'0px 0px -10% 0px'}):null;
/* wrap each word in a mask; elements like <em> are kept and split inside */
A.split=function(el){
  var i=0;
  (function walk(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){
        var frag=document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function(part){
          if(!part)return;
          if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return;}
          var w=document.createElement('span'),s=document.createElement('span');
          w.className='w';s.textContent=part;s.style.setProperty('--i',i++);
          w.appendChild(s);frag.appendChild(w);
        });
        node.replaceChild(frag,n);
      }else if(n.nodeType===1&&n.tagName!=='BR'&&!n.classList.contains('w'))walk(n);
    });
  })(el);
};
A.reveal=function(scope){
  scope=scope||document;
  scope.querySelectorAll('[data-split]:not([data-split-done])').forEach(function(el){
    A.split(el);el.setAttribute('data-split-done','');
  });
  scope.querySelectorAll('[data-reveal]:not(.in),[data-split]:not(.in)').forEach(function(el){
    if(io)io.observe(el);else el.classList.add('in');
  });
};

/* ── READY: page scripts call this when built; opens the cut ── */
var isReady=false;
A.ready=function(){
  if(isReady)return;
  isReady=true;
  root.classList.add('rv');
  A.reveal();
  var cut=document.getElementById('cut');
  if(cut)void cut.offsetWidth;  /* commit the covered state so the open animates */
  requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('cut-in');});});
};
document.addEventListener('DOMContentLoaded',A.ready);

/* ── DUST — drifting gold particles (pages with <canvas id="dust">) ── */
var dc=document.getElementById('dust');
if(dc&&dc.getContext&&!RED){
  var cx=dc.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),W=0,H=0;
  var N=innerWidth<700?45:90,P=[];
  var size=function(){W=dc.width=Math.round(innerWidth*dpr);H=dc.height=Math.round(innerHeight*dpr);};
  size();addEventListener('resize',size);
  for(var di=0;di<N;di++)P.push({x:Math.random(),y:Math.random(),z:.25+Math.random()*.75,r:.5+Math.random()*.9,o:Math.random()*6.28,e:Math.random()<.1});
  var ptx=0,pty=0,pcx=0,pcy=0;
  addEventListener('pointermove',function(e){ptx=e.clientX/innerWidth-.5;pty=e.clientY/innerHeight-.5;},{passive:true});
  (function draw(t){
    requestAnimationFrame(draw);
    pcx+=(ptx-pcx)*.04;pcy+=(pty-pcy)*.04;
    cx.clearRect(0,0,W,H);
    var sy=scrollY*.00012;
    for(var i=0;i<N;i++){
      var p=P[i];
      p.y-=.00009*p.z;
      var x=((p.x+Math.sin(t*.00018+p.o)*.012-pcx*.025*p.z)%1+1)%1*W;
      var y=((p.y-sy*p.z-pcy*.025*p.z)%1+1)%1*H;
      cx.globalAlpha=(.18+.42*p.z)*(.55+.45*Math.sin(t*.0011+p.o));
      cx.fillStyle=p.e?'#FF4517':'#C5A880';
      cx.beginPath();cx.arc(x,y,p.r*p.z*1.5*dpr,0,6.2832);cx.fill();
    }
  })(0);
}

/* ── SHOWREEL frame: autoplay muted, tap/Enter toggles sound ── */
A.mountReel=function(frame){
  var v=frame&&frame.querySelector('.reel-video');
  if(!REEL_URL||!v)return null;
  var status=frame.querySelector('[data-reel-status]');
  var atm=frame.querySelector('.reel-atm'),bg=frame.querySelector('.reel-bg');
  v.src=REEL_URL;v.classList.add('on');v.style.cursor='pointer';
  v.tabIndex=0;v.setAttribute('role','button');v.setAttribute('aria-label','Showreel — toggle sound');
  var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});
  if(atm)atm.style.display='none';
  if(bg)bg.style.display='none';
  function label(){if(status)status.textContent=v.muted?"Reel '26 · tap for sound":"Reel '26 · sound on";}
  function toggle(){
    v.muted=!v.muted;
    if(v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){});}
    label();
  }
  label();
  v.addEventListener('click',toggle);
  v.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  return v;
};
})();
