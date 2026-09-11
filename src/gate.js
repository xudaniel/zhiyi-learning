(()=>{
 const payload=JSON.parse(document.getElementById('coursePayload').textContent);
 const sessionKey='zhiyi-course-unlock-v1';
 const form=document.getElementById('gateForm'),input=document.getElementById('coursePassword'),submit=document.getElementById('unlockCourse'),toggle=document.getElementById('togglePassword'),status=document.getElementById('gateStatus');
 const decode=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
 const encode=value=>btoa(String.fromCharCode(...new Uint8Array(value)));
 const message=(text,error=false)=>{status.textContent=text;status.dataset.error=String(error);input.setAttribute('aria-invalid',String(error))};
 const clearSession=()=>{try{sessionStorage.removeItem(sessionKey)}catch{}};
 function ready(text='同一标签页内刷新，无需重复输入。',error=false){form.dataset.ready='true';input.disabled=false;submit.disabled=false;toggle.disabled=false;form.setAttribute('aria-busy','false');message(text,error)}
 async function decrypt(raw){
  const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(payload.iv)},key,decode(payload.ciphertext)));
 }
 function enter(html){input.value='';document.open();document.write(html);document.close()}
 toggle.addEventListener('click',()=>{const show=input.type==='password';input.type=show?'text':'password';toggle.textContent=show?'隐藏':'显示';toggle.setAttribute('aria-label',show?'隐藏密码':'显示密码');toggle.setAttribute('aria-pressed',String(show));input.focus()});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(submit.disabled)return;
  const password=input.value;
  if(!password){message('请输入课程密码。',true);input.focus();return}
  form.dataset.ready='false';form.setAttribute('aria-busy','true');submit.disabled=true;input.disabled=true;toggle.disabled=true;message('正在打开课程…');
  let html;
  try{
   const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
   const raw=await crypto.subtle.deriveBits({name:'PBKDF2',salt:decode(payload.salt),iterations:payload.iterations,hash:'SHA-256'},material,256);
   html=await decrypt(raw);
   try{sessionStorage.setItem(sessionKey,JSON.stringify({salt:payload.salt,key:encode(raw)}))}catch{}
  }catch{clearSession();ready('密码不正确，请重新输入。',true);input.focus();input.select();return}
  enter(html);
 });
 async function start(){
  if(!globalThis.crypto?.subtle){message('请用最新版浏览器打开离线文件，或访问 HTTPS 在线课程。',true);return}
  try{
   const cached=JSON.parse(sessionStorage.getItem(sessionKey)||'null');
   if(cached?.salt===payload.salt){const html=await decrypt(decode(cached.key));enter(html);return}
  }catch{}
  clearSession();ready();
 }
 // Wait for parsing to finish before replacing the document on a cached unlock.
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
