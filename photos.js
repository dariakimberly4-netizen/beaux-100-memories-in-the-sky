const RAW='https://raw.githubusercontent.com/dariakimberly4-netizen/beaux-birthday-scrapbook/main/assets/photos/';

const base=[
'IMG-20260705-WA0002.jpg',
'IMG-20260710-WA0001.jpg',
'IMG-20260710-WA0003.jpg',
'IMG-20260728-WA0000.jpg',
'IMG-20260728-WA0001.jpg',
'IMG-20260728-WA0002.jpg',
'IMG-20260728-WA0003.jpg'
];
const missing=new Set([8,18,27,30,54,58,68,76]);
const septMain=Array.from({length:84},(_,i)=>i+1)
  .filter(n=>!missing.has(n))
  .map(n=>`IMG-20260903-WA${String(n).padStart(4,'0')}.jpg`);
const githubPhotos=[...base,...septMain].map(name=>RAW+name);

const driveIds=[
'161zln6dYkrk5dJRkI1TnGOsO0TMOE8YC',
'1D114VqDItbkf4YVfl8XVLUd-FumLnbCF',
'1FQrogNrEZ2ni1LFhrYa72pmIO3iJ2iMf',
'1TvoH1YPp49JCldXLtxcf-ZR0nRnxegdC',
'1R0dkJ0G8Nxo7VsPzlcMGOVDJaRJU1AkE',
'1YyCgGaViXyoenuliOf9bIC28ryJqZscL',
'1YuPUYR09uk_M1VTWzHvXJTTFoUsJl_Bj',
'19EWg9GUZTpz5ZnrkQpURfUWYxhesDc7-',
'1qElNG1PjUdHg5DIS533lsTd7cExzROf2',
'1qNRLfVatqTZXURoG6cBXVYESiQaIc-p1',
'1i_xIxHDXyB-8u_CmqiuurxaDgzJz_9ia',
'198f3i9MCQhh3Pqt_qbpXOQ8prCyPU6H4',
'1_RGI7qEd-6hAL60EghKdR97J67RK87TS',
'1v4sH-bbRofRMLsWKsIe3GrRkiA0b68oE',
'1xfCQyACJs5W_1Jpr6e4bk2CarA6739bl',
'1YYue4sgu3RA9N9CR6GgnbivANttdIHcY',
'1COxnI3JAJ77mmeDA9v38ztukjqSW7qOl'
];
const drivePhotos=driveIds.map(id=>`https://drive.google.com/thumbnail?id=${id}&sz=w1600`);
window.BEAUX_PHOTOS=[...githubPhotos,...drivePhotos];

const sizeStyle=document.createElement('style');
sizeStyle.textContent=`
.photo-chip{width:clamp(180px,50vw,285px)!important;max-height:38vh!important;}
.b-photo{width:clamp(48px,9vw,76px)!important;height:clamp(38px,7vw,60px)!important;}
#viewer img{max-width:98vw!important;max-height:86vh!important;}
.candle{width:48px!important;height:88px!important;z-index:3!important;}
.candle .stick,.candle .flame{pointer-events:none!important;}
.candle.lit{pointer-events:none!important;z-index:1!important;}
#handMagicBtn{min-height:48px;border-radius:16px;padding:0 15px;border:1px solid rgba(244,199,107,.48);background:rgba(255,255,255,.06);color:#fff7e8;font-weight:800;white-space:nowrap;}
#handMagicBtn.active{background:linear-gradient(180deg,#f8d88a,#c99a45);color:#20150a;}
#handHud{position:fixed;right:10px;bottom:78px;z-index:85;width:116px;border-radius:16px;overflow:hidden;background:rgba(5,6,18,.9);border:1px solid rgba(244,199,107,.4);box-shadow:0 14px 40px rgba(0,0,0,.42);display:none;}
#handHud.active{display:block;}
#handVideo{display:block;width:116px;height:86px;object-fit:cover;transform:scaleX(-1);background:#050611;}
#handStatus{padding:6px 7px;font-size:10px;line-height:1.25;text-align:center;color:#fff0b7;}
@media(max-width:430px){.photo-chip{width:min(52vw,220px)!important;}.candle{width:50px!important;height:92px!important;}#viewer{padding-left:6px!important;padding-right:6px!important;}#viewer img{max-width:98vw!important;max-height:88vh!important;}#handHud{width:104px;right:7px;bottom:74px}#handVideo{width:104px;height:78px}#handMagicBtn{padding:0 11px;font-size:12px}}
`;
document.head.appendChild(sizeStyle);

(function handMagic(){
  function load(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[src="${src}"]`))return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  function waitForUi(){
    const bar=document.querySelector('.bottom');
    if(!bar)return setTimeout(waitForUi,250);
    if(document.getElementById('handMagicBtn'))return;

    const btn=document.createElement('button');
    btn.id='handMagicBtn';btn.type='button';btn.textContent='HAND MAGIC';btn.setAttribute('aria-pressed','false');
    bar.insertBefore(btn,bar.firstChild);

    const hud=document.createElement('div');hud.id='handHud';hud.innerHTML='<video id="handVideo" autoplay playsinline muted></video><div id="handStatus">Camera off</div>';document.body.appendChild(hud);
    const video=hud.querySelector('#handVideo'),status=hud.querySelector('#handStatus');
    let enabled=false,stream=null,hands=null,raf=0,busy=false,lastAction=0,lastX=null,lastT=0,pinchLatched=false,palmSince=0;
    const cooldown=ms=>Date.now()-lastAction>ms;
    const mark=()=>{lastAction=Date.now();};
    const setStatus=t=>status.textContent=t;

    function nextCandle(){
      const c=[...document.querySelectorAll('.candle:not(.lit)')].find(el=>getComputedStyle(el).pointerEvents!=='none');
      if(c){c.click();setStatus('✨ Candle lit');mark();}
      else setStatus('All candles are lit ✨');
    }
    function openNewestMemory(){
      const chips=[...document.querySelectorAll('.photo-chip:not(.fade)')];
      if(chips.length){chips[chips.length-1].click();setStatus('🤏 Memory opened');mark();return true;}
      return false;
    }
    function nav(dir){
      const viewer=document.getElementById('viewer');
      if(viewer && !viewer.classList.contains('hidden')){
        const b=document.getElementById(dir>0?'vNext':'vPrev');if(b)b.click();setStatus(dir>0?'👉 Next memory':'👈 Previous memory');mark();return;
      }
      if(dir>0)nextCandle();
    }
    function fingerUp(lm,tip,pip){return lm[tip].y<lm[pip].y-0.035;}
    function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

    function onResults(res){
      if(!enabled)return;
      const lm=res.multiHandLandmarks&&res.multiHandLandmarks[0];
      if(!lm){setStatus('Show one hand');lastX=null;palmSince=0;return;}
      const now=Date.now();
      const x=1-lm[9].x;
      const pinch=dist(lm[4],lm[8])<0.055;
      const open=fingerUp(lm,8,6)&&fingerUp(lm,12,10)&&fingerUp(lm,16,14)&&fingerUp(lm,20,18);

      if(pinch && !pinchLatched && cooldown(700)){
        pinchLatched=true;
        if(!openNewestMemory())setStatus('🤏 Pinch detected');
      }
      if(!pinch)pinchLatched=false;

      if(lastX!==null && lastT && cooldown(650)){
        const dx=x-lastX,dt=now-lastT;
        if(dt<450 && Math.abs(dx)>.16){nav(dx>0?1:-1);lastX=x;lastT=now;return;}
      }
      lastX=x;lastT=now;

      if(open){
        if(!palmSince)palmSince=now;
        if(now-palmSince>700 && cooldown(1100)){nextCandle();palmSince=now;}
        else if(now-palmSince<700)setStatus('✋ Hold palm to light');
      } else palmSince=0;
    }

    async function frame(){
      if(!enabled||!hands)return;
      if(video.readyState>=2&&!busy){busy=true;try{await hands.send({image:video});}catch(e){}busy=false;}
      raf=requestAnimationFrame(frame);
    }

    async function start(){
      try{
        btn.disabled=true;setStatus('Starting camera…');hud.classList.add('active');
        await load('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        if(!window.Hands)throw new Error('Hand tracker failed to load');
        hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
        hands.setOptions({maxNumHands:1,modelComplexity:0,minDetectionConfidence:.6,minTrackingConfidence:.55});
        hands.onResults(onResults);
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
        video.srcObject=stream;await video.play();enabled=true;btn.classList.add('active');btn.textContent='HAND MAGIC ON';btn.setAttribute('aria-pressed','true');setStatus('✋ Hold palm = candle\n🤏 Pinch = open\n↔ Swipe = navigate');frame();
      }catch(e){setStatus('Camera unavailable — tap still works');hud.classList.add('active');console.warn(e);}finally{btn.disabled=false;}
    }
    function stop(){enabled=false;cancelAnimationFrame(raf);if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;if(video)video.srcObject=null;btn.classList.remove('active');btn.textContent='HAND MAGIC';btn.setAttribute('aria-pressed','false');hud.classList.remove('active');setStatus('Camera off');}
    btn.addEventListener('click',()=>enabled?stop():start());
    window.addEventListener('pagehide',stop);
  }
  waitForUi();
})();
