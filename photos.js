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

const septExtra=[85,86,87,88,91,92,93,94,95,96,97,98]
  .map(n=>`IMG-20260903-WA${String(n).padStart(4,'0')}.jpg`);

const later=[
'IMG-20260904-WA0000.jpg',
'IMG-20260905-WA0000.jpg',
'IMG-20260905-WA0001.jpg',
'IMG-20260905-WA0002.jpg',
'IMG-20260905-WA0003.jpg'
];

window.BEAUX_PHOTOS=[...base,...septMain,...septExtra,...later].map(name=>RAW+name);

// Slightly larger memories for easier viewing on phones.
const sizeStyle=document.createElement('style');
sizeStyle.textContent=`
.photo-chip{width:clamp(130px,34vw,195px)!important;}
.b-photo{width:clamp(40px,8vw,64px)!important;height:clamp(32px,6.2vw,51px)!important;}
@media(max-width:430px){.photo-chip{width:clamp(128px,38vw,165px)!important;}}
`;
document.head.appendChild(sizeStyle);
