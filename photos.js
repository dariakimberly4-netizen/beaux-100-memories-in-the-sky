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
.photo-chip{
  width:clamp(180px,50vw,285px)!important;
  max-height:38vh!important;
}
.b-photo{
  width:clamp(48px,9vw,76px)!important;
  height:clamp(38px,7vw,60px)!important;
}
#viewer img{
  max-width:98vw!important;
  max-height:86vh!important;
}

/* Make every candle easier to tap and prevent lit candles from blocking others. */
.candle{
  width:48px!important;
  height:88px!important;
  z-index:3!important;
}
.candle .stick,
.candle .flame{
  pointer-events:none!important;
}
.candle.lit{
  pointer-events:none!important;
  z-index:1!important;
}

@media(max-width:430px){
  .photo-chip{
    width:min(52vw,220px)!important;
  }
  .candle{
    width:50px!important;
    height:92px!important;
  }
  #viewer{
    padding-left:6px!important;
    padding-right:6px!important;
  }
  #viewer img{
    max-width:98vw!important;
    max-height:88vh!important;
  }
}
`;
document.head.appendChild(sizeStyle);
