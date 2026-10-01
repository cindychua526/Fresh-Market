/* ---------- day & night ---------- */
const DAY_LEN=240;let dayT=0.04,dayN=1,wasNight=false,DAYK=-1;
const dayBg=new THREE.Color(0x8fd96b),nightBg=new THREE.Color(0x1b2a44),tmpC=new THREE.Color();
function hourOf(t){return (6+t*24)%24;}
function lightK(h){if(h>=7&&h<18)return 1;if(h>=18&&h<20)return 1-(h-18)/2;if(h>=20||h<4.5)return 0;return Math.min(1,(h-4.5)/2.5);}
function isNight(){return lightK(hourOf(dayT))<0.35;}
const RUSH={t:0,last:null};
function updDay(dt){
  if(NET.mode!=='guest'){dayT+=dt/DAY_LEN;if(dayT>=1){dayT-=1;dayN++;newDay();}
    const hh=hourOf(dayT);if(RUSH.last===null)RUSH.last=hh;   // first frame after loading: no false rush
    if(lines().length>=2&&((RUSH.last<12&&hh>=12&&hh<14)||(RUSH.last<18&&hh>=18&&hh<20))){RUSH.t=20;toast('🔥 '+(hh<15?TT('午间高峰！','Lunch rush!','Waktu puncak tengah hari!'):TT('晚高峰！','Dinner rush!','Waktu puncak malam!'))+' '+TT('客人一下子涌进来，小费 ×1.5','Shoppers pour in, tips ×1.5','Pelanggan berpusu-pusu masuk, tip ×1.5'),2600);blip(990,0.12,'sine',0.06);}
    RUSH.last=hh;if(RUSH.t>0)RUSH.t-=dt;}
  const k=Math.round(lightK(hourOf(dayT))*(isRaining()?0.72:1)*400)/400;
  if(k!==DAYK){DAYK=k;
  hemi.intensity=0.3+0.55*k;hemi.color.setRGB(0.72+0.28*k,0.78+0.22*k,1);sun.intensity=0.06+0.49*k;sun.color.setRGB(1,0.82+0.18*k,0.65+0.35*k);
  tmpC.copy(nightBg).lerp(dayBg,k);scene.background.copy(tmpC);scene.fog.color.copy(tmpC);
  lampMat.emissiveIntensity=(1-k)*1.3;winMat.emissiveIntensity=(1-k)*0.9;
  for(const m of litFloors()){m.emissive.setHex(0xffeccc);m.emissiveIntensity=(1-k)*0.42;}}
  const n=k<0.35;if(n!==wasNight){wasNight=n;if(T>2)toast(n?'🌙 天黑了：客人少一些，但每人买得更多':'☀️ 天亮了',2200);}
}
let LITF=null;const litFloors=()=>LITF||(LITF=[westFloorMat,eastFloorMat,wingFloorMat,fhFloorM,M(0xebe6f3),M(0xfbdab7),M(0xdbe9f7),M(0xf6f2fb),...shelfMats,SHELF_VC]);
function clockText(){const h=hourOf(dayT),hh=Math.floor(h),mm=Math.floor((h-hh)*6)*10;return (RUSH.t>0?'🔥':isNight()?'🌙':'☀️')+' '+TT('第'+dayN+'天 ','Day '+dayN+' ','Hari '+dayN+' ')+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');}

