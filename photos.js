const RAW='https://raw.githubusercontent.com/dariakimberly4-netizen/beaux-birthday-scrapbook/main/assets/photos/';

// Photos already hosted reliably in the scrapbook repository.
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

// These 17 originals live in the shared Drive folder. Use Google's thumbnail
// endpoint because it is much more reliable in GitHub Pages than uc?export=view.
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

// Make memory reveals clearly larger on phones while keeping them easy to tap.
const sizeStyle=document.createElement('style');
sizeStyle.textContent=`
.photo-chip{width:clamp(160px,44vw,235px)!important;max-height:32vh!important;}
.b-photo{width:clamp(42px,8.5vw,68px)!important;height:clamp(34px,6.6vw,54px)!important;}
@media(max-width:430px){.photo-chip{width:min(46vw,190px)!important;}}
`;
document.head.appendChild(sizeStyle);
