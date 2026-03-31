
/* ── CURSOR ── */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let cursorX = mouseX;
let cursorY = mouseY;

let ringX = mouseX;
let ringY = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.35;
  cursorY += (mouseY - cursorY) * 0.35;

  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;

  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';

  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';

  requestAnimationFrame(animateCursor);
}

animateCursor();
document.querySelectorAll('button,a,input').forEach(el => {
  el.addEventListener('mouseenter',()=>{ cursor.style.transform='translate(-50%,-50%) scale(2)'; ring.style.width='60px'; ring.style.height='60px'; });
  el.addEventListener('mouseleave',()=>{ cursor.style.transform='translate(-50%,-50%) scale(1)'; ring.style.width='36px'; ring.style.height='36px'; });
});

/* ── CLICK RIPPLE ── */
const rl = document.getElementById('ripple-layer');
document.addEventListener('click', e => {
  const sz = 50 + Math.random()*40;
  [['ripple',sz],['ripple2',sz*1.5]].forEach(([cls,s])=>{
    const d = document.createElement('div');
    d.className = cls;
    d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px`;
    rl.appendChild(d);
    setTimeout(()=>d.remove(), 1600);
  });
});

/* ══════════════════════════════════════
   CANVAS — POPPING BUBBLES
══════════════════════════════════════ */
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');
let W, H;
function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

let popDots = [];
let frame   = 0;

class Bubble {
  constructor(fromBottom){
    this.init(fromBottom);
  }
  init(fromBottom){
    this.x   = Math.random()*W;
    this.y   = fromBottom ? H + Math.random()*80 : Math.random()*H;
    this.r   = Math.random()*13 + 3;
    this.vy  = -(Math.random()*0.55+0.15);
    this.vx  = (Math.random()-0.5)*0.22;
    this.op  = Math.random()*0.3+0.07;
    this.age = 0;
    this.maxAge = Math.random()*500+150;
    this.popping = false;
    this.pf  = 0;
    this.col = Math.random()<0.12 ? '#39ff91' : Math.random()<0.2 ? '#c084fc' : '#00e5ff';
  }
  pop(){
    this.popping = true; this.pf = 0;
    for(let i=0;i<8;i++){
      const a = (Math.PI*2/8)*i + Math.random()*0.4;
      const sp = Math.random()*2.5+0.8;
      popDots.push({ x:this.x, y:this.y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:1, r:Math.random()*2+0.8, col:this.col });
    }
  }
  update(){
    if(this.popping){ this.pf++; return this.pf>20; }
    this.x += this.vx + Math.sin(this.age*0.03)*0.3;
    this.y += this.vy;
    this.age++;
    if(this.age>=this.maxAge || this.y < -this.r*4){ this.pop(); }
    return false;
  }
  draw(){
    if(this.popping){
      const t=this.pf/20, sr=this.r*(1+t*2.2);
      ctx.save(); ctx.globalAlpha=(1-t)*this.op*1.6;
      ctx.beginPath(); ctx.arc(this.x,this.y,sr,0,Math.PI*2);
      ctx.strokeStyle=this.col; ctx.lineWidth=1.4+t*2; ctx.stroke();
      ctx.restore(); return;
    }
    /* glow halo */
    ctx.save(); ctx.globalAlpha=this.op*0.35;
    const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*3);
    g.addColorStop(0,this.col); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(this.x,this.y,this.r*3,0,Math.PI*2); ctx.fill();
    ctx.restore();
    /* bubble ring */
    ctx.save(); ctx.globalAlpha=this.op;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.strokeStyle=this.col; ctx.lineWidth=0.9; ctx.stroke();
    /* sheen dot */
    ctx.globalAlpha=this.op*0.55;
    ctx.beginPath(); ctx.arc(this.x-this.r*0.3,this.y-this.r*0.3,this.r*0.25,0,Math.PI*2);
    ctx.fillStyle='white'; ctx.fill();
    ctx.restore();
  }
}

/* stars */
const stars = Array.from({length:70},()=>({
  x:Math.random()*4000, y:Math.random()*3000,
  r:Math.random()*0.8+0.15, o:Math.random()*0.4+0.05,
  tw:Math.random()*Math.PI*2
}));

let bubbles = Array.from({length:30},()=>new Bubble(false));
/* 🐟 FISH */
let fishes = Array.from({length:8},()=>({
  x:Math.random()*W,
  y:Math.random()*H*0.9,
  speed:Math.random()*1+0.5,
  size:Math.random()*14+6,
  dir:Math.random()>0.5?1:-1
}));

/* 🪼 JELLYFISH */
let jellies = Array.from({length:10},()=>({
  x:Math.random()*W,
y:H*0.3 + Math.random()*H*0.6,
  size:Math.random()*20+15,
  float:Math.random()*2,
}));

function tick(){
  ctx.clearRect(0,0,W,H);
  frame++;

  /* twinkling stars */
  stars.forEach(s=>{
    s.tw+=0.016;
    ctx.save(); ctx.globalAlpha=s.o*(0.6+0.4*Math.sin(s.tw));
    ctx.fillStyle='#c8dff0'; ctx.shadowColor='#00e5ff'; ctx.shadowBlur=3;
    ctx.beginPath(); ctx.arc(s.x%W, s.y%H, s.r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  });

  /* wave shimmer */
  ctx.save(); ctx.globalAlpha=0.045;
  for(let i=0;i<3;i++){
    ctx.beginPath();
    const base = H - 55 + i*28;
    ctx.moveTo(0,base);
    for(let x=0;x<=W;x+=6){
      ctx.lineTo(x, base + Math.sin((x+frame*(0.9+i*0.35))*0.022)*14);
    }
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
    ctx.fillStyle='#00e5ff'; ctx.fill();
  }
  ctx.restore();

  /* bubbles */
  bubbles = bubbles.filter(b=>{ const done=b.update(); if(!done) b.draw(); return !done; });
  if(frame%16===0 && bubbles.length<65) bubbles.push(new Bubble(true));

  /* pop dots */
  popDots = popDots.filter(d=>{
    d.x+=d.vx; d.y+=d.vy; d.vy+=0.05; d.life-=0.055;
    if(d.life<=0) return false;
    ctx.save(); ctx.globalAlpha=d.life*0.85; ctx.fillStyle=d.col;
    ctx.shadowColor=d.col; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.arc(d.x,d.y,d.r*d.life,0,Math.PI*2); ctx.fill();
    ctx.restore(); return true;
  });

  requestAnimationFrame(tick);
  /* 🐟 DRAW FISH */
fishes.forEach(f=>{
  f.x += f.speed * f.dir;

  if(f.x > W+50) f.x = -50;
  if(f.x < -50) f.x = W+50;

  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.dir,1);

  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(-f.size, f.size/2);
  ctx.lineTo(-f.size, -f.size/2);
  ctx.closePath();
  ctx.fillStyle = "rgba(0,229,255,0.5)";
  ctx.fill();

  ctx.restore();
});


/* 🪼 DRAW JELLYFISH */
jellies.forEach(j=>{
  j.y += Math.sin(frame*0.02)*0.3;

  ctx.save();
  ctx.translate(j.x, j.y);

  /* head */
  ctx.beginPath();
  ctx.arc(0,0,j.size,Math.PI,0);
  ctx.fillStyle="rgba(0,229,255,0.2)";
  ctx.fill();

  /* tentacles */
  for(let i=0;i<5;i++){
    ctx.beginPath();
    ctx.moveTo(-j.size/2 + i*5,0);
    ctx.lineTo(-j.size/2 + i*5, j.size+Math.sin(frame*0.1+i)*10);
    ctx.strokeStyle="rgba(0,229,255,0.3)";
    ctx.stroke();
  }

  ctx.restore();
});
}
tick();

/* click: burst bubbles at cursor */
document.addEventListener('click', e=>{
  for(let i=0;i<6;i++){
    const b=new Bubble(false);
    b.x = e.clientX+(Math.random()-0.5)*50;
    b.y = e.clientY+(Math.random()-0.5)*50;
    b.r = Math.random()*11+5;
    b.vy = -(Math.random()*1.4+0.5);
    b.maxAge = 50+Math.random()*70;
    b.age = 0;
    bubbles.push(b);
  }
});

/* ── SCROLL REVEAL ── */
document.querySelectorAll('.reveal').forEach((el,i)=>{
  new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) setTimeout(()=>e.target.classList.add('shown'),i*70); });
  },{threshold:0.1}).observe(el);
});

/* ── NAV SCROLL ── */
function navScroll(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ── API + AUTO-SCROLL TO RESULT ── */
async function getData() {
  const river = document.getElementById('riverInput').value.trim();
  if (!river) {
    shakeInput();
    return;
  }

  const loader = document.getElementById('loader');
  const result = document.getElementById('result');

  loader.classList.add('active');
  result.classList.remove('visible');

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/river/${encodeURIComponent(river)}`);
    const data = await res.json();

    document.getElementById('pollution').textContent = data.current_pollution_index;
    document.getElementById('pollutant').textContent = data.dominant_pollutant;
document.getElementById('diseases').innerHTML = data.disease_risks
  .map(risk => `• ${risk}`)
  .join('<br>');    document.getElementById('advice').textContent = data.advice || 'Avoid direct contact and boil before use.';

    const graph = document.getElementById('graphImage');
    const graphBox = document.querySelector('.graph-box');
graphBox.style.display = 'block';
    graph.src = `http://127.0.0.1:8000/api/river/${encodeURIComponent(river)}/graph?time=${Date.now()}`;
    graph.style.display = 'block';

    result.classList.add('visible');

  } catch (err) {
    document.getElementById('pollution').textContent = 'Server unreachable';
    document.getElementById('pollutant').textContent = 'Start backend at localhost:8000';
    document.getElementById('diseases').textContent = '';
    document.getElementById('advice').textContent = '';

    const graph = document.getElementById('graphImage');
    graph.style.display = 'none';

    result.classList.add('visible');
  } finally {
    loader.classList.remove('active');

    setTimeout(() => {
      document.getElementById('result').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 250);
  }
}

function buildLevel(level){
  const map = { critical:{color:'#ff6b6b',label:'CRITICAL'}, high:{color:'#ffb347',label:'HIGH'}, moderate:{color:'#ffd166',label:'MODERATE'}, low:{color:'#39ff91',label:'LOW'}, safe:{color:'#00e5ff',label:'SAFE'} };
  const m = map[(level||'').toLowerCase()] || {color:'#00e5ff',label:(level||'—').toUpperCase()};
  return `<span class="level-indicator"><span class="level-dot" style="background:${m.color};box-shadow:0 0 10px ${m.color}"></span>${m.label}</span>`;
}

function shakeInput(){
  const row = document.querySelector('.input-row');
  row.style.border = '1px solid #ff6b6b';
  row.style.boxShadow = '0 0 20px rgba(255,107,107,0.25)';
  setTimeout(()=>{ row.style.border='1px solid rgba(0,229,255,0.2)'; row.style.boxShadow=''; },700);
}
window.addEventListener("scroll", ()=>{
  canvas.style.transform = `translateY(${window.scrollY * 0.2}px)`;
});

document.getElementById('riverInput').addEventListener('keydown', e=>{ if(e.key==='Enter') getData(); });

const vFill = document.getElementById('v-depth-fill');
const vCounter = document.getElementById('v-depth-counter');
const vVal = document.getElementById('v-depth-val');

const MAX_DEPTH_M = 11000;

function updateDepth() {
  const scrollMax = document.body.scrollHeight - window.innerHeight;

  const frac = scrollMax > 0
    ? Math.min(1, window.scrollY / scrollMax)
    : 0;

  const depth = Math.round(frac * MAX_DEPTH_M);

  vVal.textContent =
    depth >= 1000
      ? (depth / 1000).toFixed(1) + 'k'
      : depth;

  const percent = frac * 100;

  vFill.style.height = percent + '%';
  vCounter.style.top = percent + '%';
}

window.addEventListener('scroll', updateDepth, { passive: true });

updateDepth();