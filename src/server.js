import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {lessons,getLesson} from './lessons.js';
import {makeSession,practiceReply,applyLiveReply} from './engine.js';
import {generateTutor} from './provider.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function loadEnv(){try{const body=await readFile(path.join(ROOT,'.env'),'utf8');for(const line of body.split(/\r?\n/)){const m=line.match(/^\s*([A-Z][A-Z_0-9]*)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');}}catch(e){if(e.code!=='ENOENT')throw e;}}
await loadEnv();
const PORT=Number(process.env.PORT||3000),HOST=process.env.HOST||'127.0.0.1',production=process.env.NODE_ENV==='production';
const origin=process.env.APP_ORIGIN||`http://localhost:${PORT}`;
if(production&&(!origin.startsWith('https://')||!process.env.APP_ACCESS_TOKEN))throw new Error('Production requires HTTPS APP_ORIGIN and APP_ACCESS_TOKEN');
const sessions=new Map(),visitors=new Map(),TTL=2*60*60*1000;
function json(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(data));}
function error(res,status,msg){json(res,status,{error:msg});}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(c=>c.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2));}
function getVisitor(req,res){let sid=cookies(req).sid;if(!sid||!visitors.has(sid)){sid=randomBytes(24).toString('hex');visitors.set(sid,{created:Date.now(),requests:[]});res.setHeader('Set-Cookie',`sid=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200${production?'; Secure':''}`);}return sid;}
function rateLimit(sid){const v=visitors.get(sid),now=Date.now();v.requests=v.requests.filter(x=>now-x<60000);v.requests.push(now);return v.requests.length>40;}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
async function readJson(req){let size=0,chunks=[];for await(const ch of req){size+=ch.length;if(size>16000)throw new Error('Request too large');chunks.push(ch);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new Error('Invalid JSON');}}
const assets={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/styles.css':'styles.css'};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
function sessionData(session){return {lessonId:session.lessonId,mode:session.mode,turn:session.turn,target:session.target,done:session.done,last:session.last};}
export function createServer({provider=generateTutor}={}){return http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');const pathname=url.pathname;
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  if(req.method==='GET'&&assets[pathname]){const asset=path.join(ROOT,'public',assets[pathname]);res.writeHead(200,{'Content-Type':types[path.extname(asset)],'Cache-Control':'no-store'});res.end(await readFile(asset));return;}
  if(pathname==='/api/health'&&req.method==='GET'){json(res,200,{ok:true,liveConfigured:Boolean(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL)});return;}
  if(pathname==='/api/lessons'&&req.method==='GET'){json(res,200,Object.fromEntries(Object.entries(lessons).map(([k,v])=>[k,{title:v.title,initial:v.initial}])));return;}
  if(!pathname.startsWith('/api/')){error(res,404,'Not found');return;}
  if(req.method!=='POST'){error(res,405,'Method not allowed');return;}
  if(req.headers.origin!==origin){error(res,403,'Origin mismatch');return;}
  const sid=getVisitor(req,res);if(rateLimit(sid)){error(res,429,'Too many requests');return;}
  if(process.env.APP_ACCESS_TOKEN&&!equal(req.headers['x-reviewer-token'],process.env.APP_ACCESS_TOKEN)){error(res,401,'Access code required');return;}
  const body=await readJson(req);
  if(pathname==='/api/session'){
   if(!getLesson(body.lessonId)){error(res,400,'Unknown lesson');return;}
   const mode=body.mode==='live'?'live':'practice';if(mode==='live'&&!(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL)){error(res,503,'Live tutoring is not configured');return;}
   const session=makeSession(body.lessonId,mode);sessions.set(sid,{session,expires:Date.now()+TTL});json(res,200,sessionData(session));return;
  }
  if(pathname==='/api/message'){
   const entry=sessions.get(sid);if(!entry||entry.expires<Date.now()){sessions.delete(sid);error(res,409,'Start a new lesson');return;}
   const session=entry.session;if(session.done){error(res,409,'Lesson complete; start a new lesson');return;}
   const action=['answer','hint','breakdown'].includes(body.action)?body.action:'answer';
   const answer=typeof body.answer==='string'?body.answer.trim():'';
   if(action==='answer'&&(!answer||answer.length>1200)){error(res,400,'Answer must be 1–1200 characters');return;}
   if(session.busy){error(res,409,'A response is already in progress');return;}
   session.busy=true;
   try{
    let output;if(session.mode==='practice')output=practiceReply(session,answer,action);
    else{const generated=await provider({session,lesson:getLesson(session.lessonId),answer,action,apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL});output=applyLiveReply(session,answer,generated,action);}
    entry.expires=Date.now()+TTL;json(res,200,output);
   }catch(e){console.error('Tutor failure:',e.message);error(res,502,'Tutor is temporarily unavailable. Please retry.');}finally{session.busy=false;}
   return;
  }
  error(res,404,'Unknown API endpoint');
 }catch(e){error(res,e.message==='Request too large'?413:400,e.message==='Request too large'?e.message:'Invalid request');}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createServer().listen(PORT,HOST,()=>console.log(`SocraticMind AI listening on http://${HOST}:${PORT}`));
