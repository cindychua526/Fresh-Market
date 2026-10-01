/* ---------- canvas sprites ---------- */
const spritePool=new Map();
function canvasSprite(w,h,sx,sy,pooled){const pk=w+'x'+h;
  if(pooled){const p=spritePool.get(pk);if(p&&p.length){const o=p.pop();o.s.scale.set(sx,sy,1);o.s.position.set(0,0,0);o.s.visible=true;o.ctx.clearRect(0,0,w,h);o.tex.needsUpdate=true;return o;}}
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;
  const mat=new THREE.SpriteMaterial({map:tex,depthTest:false,depthWrite:false,transparent:true});const s=new THREE.Sprite(mat);s.scale.set(sx,sy,1);s.renderOrder=20;return {s,ctx,tex,mat,pk};}
function releaseSprite(o){if(!o)return;if(o.s.parent)o.s.parent.remove(o.s);let p=spritePool.get(o.pk);if(!p)spritePool.set(o.pk,p=[]);if(p.length<48)p.push(o);else disposeSprite(o);}
function disposeSprite(o){if(!o)return;if(o.s.parent)o.s.parent.remove(o.s);o.tex.dispose();o.mat.dispose();}
function outlined(x,t,px,py){x.lineJoin='round';x.lineWidth=7;x.strokeStyle='#173a2b';x.strokeText(t,px,py);x.fillStyle='#fff';x.fillText(t,px,py);}
function drawBubble(b,emoji,text,warn,ring,left){
  const x=b.ctx;x.clearRect(0,0,128,144);
  x.fillStyle='rgba(0,0,0,.16)';x.beginPath();x.arc(66,62,52,0,7);x.fill();
  const rc=ring||(warn?'#ff5a4d':null);
  if(ring&&left!=null){x.fillStyle='#fff';x.beginPath();x.arc(64,58,52,0,7);x.fill();x.lineWidth=9;x.strokeStyle='rgba(23,58,43,.14)';x.beginPath();x.arc(64,58,47,0,7);x.stroke();
    x.strokeStyle=rc;x.lineCap='round';x.beginPath();x.arc(64,58,47,-Math.PI/2,-Math.PI/2+Math.PI*2*left);x.stroke();x.lineCap='butt';x.fillStyle=rc;}
  else{x.fillStyle=rc||'#fff';x.beginPath();x.arc(64,58,52,0,7);x.fill();if(rc){x.fillStyle='#fff';x.beginPath();x.arc(64,58,44,0,7);x.fill();x.fillStyle=rc;}}
  x.beginPath();x.moveTo(50,100);x.lineTo(78,100);x.lineTo(64,126);x.closePath();x.fill();
  x.textAlign='center';x.textBaseline='middle';
  if(text){x.font='46px '+EMOJI;x.fillText(emoji,64,40);x.font='900 32px system-ui,sans-serif';outlined(x,text,64,82);}
  else{x.font='62px '+EMOJI;x.fillText(emoji,64,60);}
  b.tex.needsUpdate=true;
}
function rrect(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
function recipeSign(inE,outE){const s=canvasSprite(256,120,1.9,0.9);const x=s.ctx;rrect(x,6,6,244,108,40);x.fillStyle='rgba(255,255,255,.95)';x.fill();
  x.textAlign='center';x.textBaseline='middle';x.font='58px '+EMOJI;x.fillText(inE,62,62);x.fillText(outE,194,62);x.font='900 44px system-ui,sans-serif';x.fillStyle='#3a8f4a';x.fillText('➜',128,60);s.tex.needsUpdate=true;return s;}

