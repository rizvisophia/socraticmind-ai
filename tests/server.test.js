import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from '../src/server.js';
test('health, lessons, validation, and guided practice endpoints',async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const base=`http://127.0.0.1:${server.address().port}`;
  let r=await fetch(base+'/api/health');assert.equal(r.status,200);
  r=await fetch(base+'/api/lessons');assert.equal(Object.keys(await r.json()).length,4);
  r=await fetch(base+'/api/session',{method:'POST',headers:{'content-type':'application/json','origin':'http://localhost:3000'},body:JSON.stringify({lessonId:'algebra',mode:'practice'})});assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];assert.equal((await r.json()).turn,0);
  r=await fetch(base+'/api/message',{method:'POST',headers:{'content-type':'application/json','origin':'http://localhost:3000','cookie':cookie},body:JSON.stringify({answer:'subtract 3',action:'answer'})});assert.equal(r.status,200);assert.equal((await r.json()).turn,1);
  r=await fetch(base+'/api/message',{method:'POST',headers:{'content-type':'application/json','origin':'https://wrong.example','cookie':cookie},body:'{}'});assert.equal(r.status,403);
  r=await fetch(base+'/.env');assert.equal(r.status,404);
 }finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
