(() => {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('start');
  const replayBtn = document.getElementById('replay');
  const finalEl = document.getElementById('final');
  const hint = document.getElementById('hint');
  const viewer = document.getElementById('viewer');
  const photoEl = document.getElementById('photo');
  const photos = (window.BEAUX_PHOTOS || []).slice(0, 100);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = 100;
  const drones = [];
  const pointer = { x: 0, y: 0, down: false, sx: 0, sy: 0 };
  const textCache = new Map();
  const previewImages = new Map();
  let W = 0, H = 0, DPR = 1, running = false, startTime = 0, autoPhotoShown = false;
  let audioCtx = null;

  const timeline = [
    ['rise', 5], ['ignition', 2], ['explosion', 7], ['flower', 7],
    ['dogs', 7], ['heart', 7], ['B', 6], ['HAPPY', 5],
    ['BIRTHDAY', 5], ['BEAUX', 5], ['constellation', 8], ['tornado', 11],
    ['100', 5], ['WE LOVE YOU', 6], ['BEAUX', 5], ['finalflower', 8], ['stars', 8]
  ];
  const totalDuration = timeline.reduce((s, x) => s + x[1], 0);

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    textCache.clear();
  }
  addEventListener('resize', resize, { passive: true });
  resize();

  for (let i = 0; i < N; i++) {
    drones.push({
      i, x: W / 2, y: H * .9, px: W / 2, py: H * .9,
      z: .6 + Math.random() * 1.2, seed: Math.random() * 100,
      angle: Math.random() * Math.PI * 2,
      speed: .7 + Math.random() * 1.1
    });
  }

  function stageAt(elapsed) {
    let cursor = 0;
    for (let i = 0; i < timeline.length; i++) {
      const [name, dur] = timeline[i];
      if (elapsed < cursor + dur) return { name, local: (elapsed - cursor) / dur, index: i };
      cursor += dur;
    }
    return { name: 'stars', local: 1, index: timeline.length - 1 };
  }

  function ease(t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; }

  function garden(t) {
    const sky = ctx.createRadialGradient(W*.5, H*.34, 10, W*.5, H*.35, Math.max(W,H)*.8);
    sky.addColorStop(0, '#0b1731'); sky.addColorStop(.45, '#050d20'); sky.addColorStop(1, '#01040b');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(210,225,255,.018)';
    for (let i=0;i<5;i++) {
      const yy=H*(.58+i*.045)+Math.sin(t*.18+i)*9;
      ctx.beginPath(); ctx.ellipse(W*.5,yy,W*(.65-i*.06),22+i*5,0,0,Math.PI*2); ctx.fill();
    }

    for (let i = 0; i < 65; i++) {
      const bx = (i * 83.13) % (W + 40) - 20;
      const by = H + 5;
      const h = 54 + (i % 7) * 9;
      const sway = Math.sin(t * (.35 + (i%5)*.04) + i*1.7) * (5 + i%6);
      ctx.strokeStyle = `rgba(75,105,68,${.18 + (i%4)*.035})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx+sway*.35, by-h*.55, bx+sway, by-h); ctx.stroke();
      ctx.fillStyle = i%3===0 ? 'rgba(173,93,139,.28)' : i%3===1 ? 'rgba(210,175,103,.24)' : 'rgba(121,100,177,.22)';
      ctx.beginPath(); ctx.arc(bx+sway, by-h, 2.8+(i%3), 0, Math.PI*2); ctx.fill();
    }

    for (let i = 0; i < 32; i++) {
      const fx = ((i*137.7 + t*(5+i%4)) % (W+30))-15;
      const fy = H*.54 + ((i*47.9) % (H*.35)) + Math.sin(t*.9+i)*7;
      const a = .16 + .26*(.5+.5*Math.sin(t*2.1+i));
      ctx.fillStyle = `rgba(255,222,145,${a})`;
      ctx.beginPath(); ctx.arc(fx,fy,1.2+(i%2)*.5,0,Math.PI*2); ctx.fill();
    }
  }

  function sampleText(text) {
    const key = `${text}:${W}:${H}`;
    if (textCache.has(key)) return textCache.get(key);
    const o = document.createElement('canvas');
    o.width = Math.max(900, Math.floor(W*1.6)); o.height = 360;
    const q = o.getContext('2d');
    q.clearRect(0,0,o.width,o.height); q.fillStyle='#fff'; q.textAlign='center'; q.textBaseline='middle';
    const fs = text.length > 9 ? 84 : text.length > 5 ? 112 : 164;
    q.font = `700 ${fs}px Arial`;
    q.fillText(text, o.width/2, 180);
    const data=q.getImageData(0,0,o.width,o.height).data, pts=[];
    const step=5;
    for(let y=6;y<o.height-6;y+=step) for(let x=6;x<o.width-6;x+=step) {
      if(data[(y*o.width+x)*4+3]>120) pts.push([x/o.width, y/o.height]);
    }
    const out=Array.from({length:N},(_,i)=>{
      const p=pts[Math.min(pts.length-1,Math.floor(i*pts.length/N))]||[.5,.5];
      return [W*(.08+p[0]*.84), H*(.18+p[1]*.38), .75 + (i%7)*.08];
    });
    textCache.set(key,out); return out;
  }

  function targetFor(d, stage, t) {
    const i=d.i, u=i/N, a=u*Math.PI*2, s=Math.min(W,H), cx=W*.5, cy=H*.36;
    if(stage.name==='rise') {
      const spread=.12+.88*ease(stage.local);
      const tx=W*(.08+((i*47)%100)/118), ty=H*(.12+((i*31)%100)/145);
      return [cx+(tx-cx)*spread, H*.88+(ty-H*.88)*spread, .35+(i%9)*.13];
    }
    if(stage.name==='ignition') {
      const r=(1-ease(stage.local))*s*.18;
      return [cx+Math.cos(a*3+t)*r, cy+Math.sin(a*3+t)*r*.65, .45+(i%8)*.14];
    }
    if(stage.name==='explosion') {
      const p=ease(stage.local), layer=i%3;
      const maxR=s*(layer===0?.52:layer===1?.38:.26);
      const curve=d.angle + p*(.55+((i%11)-5)*.018) + Math.sin(i*.7)*.18;
      const r=maxR*(.04+.96*p);
      const pull=pointer.down ? Math.max(0,1-Math.hypot(pointer.x-cx,pointer.y-cy)/(s*.75)) : 0;
      return [cx+Math.cos(curve)*r+(pointer.x-cx)*pull*.08, cy+Math.sin(curve)*r*.78+(pointer.y-cy)*pull*.05, layer===0?1.65:layer===1?1.0:.52];
    }
    if(stage.name==='flower'||stage.name==='finalflower') {
      const q=u*Math.PI*12, r=s*(.045+.235*u)*(stage.name==='finalflower'?1.12:1);
      const breathe=1+.055*Math.sin(t*1.4+i*.45);
      return [cx+Math.cos(q+t*.12)*r*breathe, cy+Math.sin(q+t*.12)*r*.68*breathe, .55+(i%10)*.11];
    }
    if(stage.name==='heart') {
      const scale=s*.018*(1+.055*Math.sin(t*2.4));
      return [cx+scale*16*Math.pow(Math.sin(a),3), cy-scale*(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a)), .58+(i%9)*.1];
    }
    if(stage.name==='dogs') {
      const side=i<50?-1:1, j=i%50, b=j/50*Math.PI*2, r=s*.105;
      const head=j<16 ? .78 : 1;
      const wag=(j>36&&j<44)?Math.sin(t*4)*18:0;
      return [cx+side*s*.13+Math.cos(b)*r*head+side*wag, cy+Math.sin(b)*r*.68-(j<12?18:0), .62+(j%8)*.1];
    }
    if(stage.name==='constellation'||stage.name==='stars') {
      let tx=W*(.06+((i*37)%100)/112), ty=H*(.08+((i*61)%100)/138);
      if(pointer.down){const dist=Math.hypot(pointer.x-tx,pointer.y-ty);if(dist<190){const f=(190-dist)/190;tx+=(pointer.x-tx)*f*.28;ty+=(pointer.y-ty)*f*.28;}}
      return [tx,ty,.42+(i%11)*.11];
    }
    if(stage.name==='tornado') {
      const y=H*.1+u*H*.68, q=t*(1.8+d.speed*.5)+i*.67, radius=s*(.08+.075*(.5+.5*Math.sin(i*.31+t*.7)));
      const bend=pointer.down?(pointer.x-cx)*.16:0;
      return [cx+Math.cos(q)*radius+bend*Math.sin(u*Math.PI), y+Math.sin(q)*18, .55+1.05*(.5+.5*Math.cos(q))];
    }
    return sampleText(stage.name)[i];
  }

  function drawConstellation() {
    ctx.strokeStyle='rgba(229,211,160,.13)'; ctx.lineWidth=.7;
    for(let i=0;i<N;i+=6){const a=drones[i],b=drones[(i+17)%N];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  }

  function drawDrone(d,t) {
    const radius = 1.25 + d.z*2.15;
    const alpha = Math.min(1,.42+d.z*.35);
    const speed = Math.hypot(d.x-d.px,d.y-d.py);
    if(speed>.7){ctx.strokeStyle=`rgba(255,222,155,${Math.min(.24,speed*.012)})`;ctx.lineWidth=Math.max(.6,radius*.45);ctx.beginPath();ctx.moveTo(d.px,d.py);ctx.lineTo(d.x,d.y);ctx.stroke();}
    ctx.shadowBlur=8+d.z*8; ctx.shadowColor='#ffd98a';
    ctx.fillStyle=`rgba(255,246,218,${alpha})`;
    ctx.beginPath();ctx.arc(d.x,d.y,radius*(1+.08*Math.sin(t*3+d.seed)),0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(245,193,103,${alpha*.38})`;ctx.beginPath();ctx.arc(d.x,d.y,radius*2.25,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
  }

  function maybeDrawMemoryFlashes(stage,t) {
    if(stage.name!=='explosion'&&stage.name!=='heart'&&stage.name!=='tornado') return;
    const count=stage.name==='heart'?4:stage.name==='tornado'?5:6;
    for(let k=0;k<count;k++){
      const idx=(Math.floor(t*1.35)*13+k*17)%Math.min(N,photos.length||N);
      const d=drones[idx];
      const beat=(t*1.35+k*.19)%1;
      if(beat>.48) continue;
      if(!previewImages.has(idx)&&photos[idx]){const im=new Image();im.decoding='async';im.src=photos[idx];previewImages.set(idx,im);}
      const im=previewImages.get(idx); if(!im||!im.complete||!im.naturalWidth) continue;
      const ww=44+d.z*28, hh=ww*.72;
      ctx.save();ctx.globalAlpha=Math.sin(beat/.48*Math.PI)*.78;ctx.shadowBlur=18;ctx.shadowColor='#f3cd83';ctx.drawImage(im,d.x-ww/2,d.y-hh/2,ww,hh);ctx.restore();
    }
  }

  function showPhoto(index, auto=false) {
    if(!photos[index]) return;
    photoEl.src=photos[index]; viewer.classList.add('show');
    if(auto) setTimeout(()=>{viewer.classList.remove('show');photoEl.removeAttribute('src');}, reduced?1700:2600);
  }

  function startAudio() {
    if(audioCtx) return;
    try {
      audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      const master=audioCtx.createGain(); master.gain.value=.028; master.connect(audioCtx.destination);
      [196,246.94,293.66,392].forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.23/(i+1);o.connect(g);g.connect(master);o.start();});
    } catch(e) {}
  }

  function frame(ms) {
    const t=ms/1000; garden(t);
    if(running) {
      const elapsed=(ms-startTime)/1000;
      const scaled=reduced?elapsed*1.45:elapsed;
      const stage=stageAt(scaled);
      if(!autoPhotoShown&&elapsed>1.6){autoPhotoShown=true;showPhoto(0,true);}

      drones.forEach(d=>{
        d.px=d.x; d.py=d.y;
        const [tx,ty,tz]=targetFor(d,stage,t);
        const stiffness=reduced?.035:(stage.name==='explosion'?.085:.055);
        d.x+=(tx-d.x)*stiffness; d.y+=(ty-d.y)*stiffness; d.z+=(tz-d.z)*.045;
      });
      if(stage.name==='constellation') drawConstellation();
      drones.slice().sort((a,b)=>a.z-b.z).forEach(d=>drawDrone(d,t));
      maybeDrawMemoryFlashes(stage,t);

      if(scaled>totalDuration+1){running=false;hint.classList.remove('on');finalEl.style.display='grid';replayBtn.style.display='block';}
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function begin() {
    autoPhotoShown=false; viewer.classList.remove('show'); photoEl.removeAttribute('src');
    finalEl.style.display='none'; replayBtn.style.display='none'; startBtn.style.display='none'; hint.classList.add('on');
    drones.forEach((d,i)=>{d.x=W*.5+(Math.random()-.5)*24;d.y=H*.91+Math.random()*48;d.px=d.x;d.py=d.y;d.z=.45+(i%8)*.11;});
    startTime=performance.now(); running=true; startAudio();
  }

  startBtn.addEventListener('click',begin); replayBtn.addEventListener('click',begin);
  canvas.addEventListener('pointerdown',e=>{pointer.down=true;pointer.sx=pointer.x=e.clientX;pointer.sy=pointer.y=e.clientY;canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;});
  canvas.addEventListener('pointerup',e=>{
    const moved=Math.hypot(e.clientX-pointer.sx,e.clientY-pointer.sy); pointer.down=false;
    if(moved>18) return;
    let best=null,dist=innerWidth<700?52:38;
    drones.forEach(d=>{const q=Math.hypot(e.clientX-d.x,e.clientY-d.y);if(q<dist){dist=q;best=d;}});
    if(best) showPhoto(best.i,false);
  });
  canvas.addEventListener('pointercancel',()=>pointer.down=false);
  viewer.addEventListener('click',()=>{viewer.classList.remove('show');photoEl.removeAttribute('src');});
})();
