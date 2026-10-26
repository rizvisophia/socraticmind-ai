import {buildInstructions,parseTutorResponse} from './engine.js';
export async function generateTutor({session,lesson,answer,action='answer',apiKey,model,fetchImpl=fetch}){
 if(!apiKey||!model)throw new Error('Live AI is not configured');
 const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),25000);
 const input=[...session.history.slice(-16),{role:'user',content:action==='answer'?answer:`Student requested: ${action}. Student's latest answer (if any): ${session.history.filter(x=>x.role==='user').at(-1)?.content||'not yet provided'}.`}];
 try{
  const response=await fetchImpl('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,instructions:buildInstructions(lesson,session,action),input,max_output_tokens:260,store:false}),signal:ctrl.signal});
  if(!response.ok)throw new Error(`OpenAI request failed (HTTP ${response.status})`);
  const json=await response.json();
  const raw=(json.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('')||json.output_text||'';
  return parseTutorResponse(raw);
 }finally{clearTimeout(timeout);}
}
