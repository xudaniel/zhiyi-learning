import {pbkdf2Sync,timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {parsePayload} from '../scripts/seal.mjs';
import {validateInput,generateFeedback} from './tutor-core.mjs';
export function createTutorHandler({env=process.env,fetchImpl=fetch,clock=Date.now,payload=parsePayload(readFileSync(new URL('../docs/index.html',import.meta.url),'utf8'))}={}){
 let cachedPassword='',expectedKey;let minute=-1,requests=0,active=0;
 const response=(status,data,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
 return async request=>{
  const origin=request.headers.get('origin'),allowed=(env.ZHIYI_ALLOWED_ORIGINS||'https://xudaniel.github.io').split(',').map(s=>s.trim()).filter(Boolean);
  if(!origin||!allowed.includes(origin)||origin==='null')return response(403,{error:'origin'});
  const headers={'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, X-Course-Salt','Access-Control-Max-Age':'600'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return response(405,{error:'method'},{...headers,Allow:'POST, OPTIONS'});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return response(415,{error:'content_type'},headers);
  const token=env.AI_GATEWAY_API_KEY||env.VERCEL_OIDC_TOKEN,model=env.ZHIYI_TUTOR_MODEL,password=env.ZHIYI_COURSE_PASSWORD;
  if(!token||!model||!password)return response(503,{error:'not_configured'},headers);
  if(password!==cachedPassword){expectedKey=pbkdf2Sync(password,Buffer.from(payload.salt,'base64'),payload.iterations,32,'sha256');cachedPassword=password;}
  const auth=request.headers.get('authorization')||'',provided=Buffer.from(auth.startsWith('Bearer ')?auth.slice(7):'','base64');
  if(request.headers.get('x-course-salt')!==payload.salt||provided.length!==32||!timingSafeEqual(provided,expectedKey))return response(401,{error:'course_access'},headers);
  const current=Math.floor(clock()/60000);if(minute!==current){minute=current;requests=0;}if(requests>=8||active>=2)return response(429,{error:'rate_limit'},{...headers,'Retry-After':'60'});requests++;
  if(Number(request.headers.get('content-length')||0)>8192)return response(413,{error:'too_large'},headers);
  let raw='',bytes=0;try{const reader=request.body?.getReader();if(!reader)return response(400,{error:'input'},headers);const decoder=new TextDecoder();while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>8192){await reader.cancel();return response(413,{error:'too_large'},headers);}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}catch{return response(400,{error:'input'},headers)}
  let input;try{input=validateInput(JSON.parse(raw))}catch{}if(!input)return response(400,{error:'input'},headers);
  if(active>=2)return response(429,{error:'rate_limit'},{...headers,'Retry-After':'60'});active++;try{const signal=AbortSignal.any([request.signal,AbortSignal.timeout(25000)]);const result=await generateFeedback(input,{token,model,fetchImpl,signal});return response(200,{...result,developer:'Daniel Xu'},headers)}
  catch(error){return response(error.status===429?429:error.status===402?503:error.name==='TimeoutError'||error.name==='AbortError'?504:502,{error:error.status===429?'rate_limit':error.status===402?'budget':error.name==='TimeoutError'||error.name==='AbortError'?'timeout':'service'},headers)}finally{active--;}
 };
}
