import {getLesson} from './lessons.js';
export function clampTarget(value){return Number.isInteger(value)?Math.max(3,Math.min(6,value)):4;}
export function makeSession(lessonId, mode='practice'){
 const lesson=getLesson(lessonId);if(!lesson)throw new Error('Unknown lesson');
 const target={algebra:3,physics:4,richmond:4,anatomy:5}[lessonId]||4;
 return {lessonId,mode,history:[],turn:0,target,done:false,last:{reply:lesson.initial,done:false,turn:0,target}};
}
export function practiceReply(session,answer,action='answer'){
 const lesson=getLesson(session.lessonId);
 if(action==='hint')return {reply:`Hint: ${lesson.steps[Math.min(session.turn,lesson.steps.length-1)][1].replace(/\.$/,'').toLowerCase()}. Now explain it in your own words.`,done:false,turn:session.turn,target:session.target};
 if(action==='breakdown')return {reply:`Focus on one part: ${lesson.steps[Math.min(session.turn,lesson.steps.length-1)][0]}`,done:false,turn:session.turn,target:session.target};
 session.turn++;
 let reply,done=session.turn>=session.target;
 if(done){reply=`Let's bring it together. ${lesson.reference} What matters is that you can explain each step in your own words.`;}
 else {const [question,feedback]=lesson.steps[Math.min(session.turn-1,lesson.steps.length-1)];reply=`Consider this: ${feedback} ${question}`;}
 session.done=done;session.history.push({role:'user',content:answer},{role:'assistant',content:reply});
 session.last={reply,done,turn:session.turn,target:session.target};return session.last;
}
export function buildInstructions(lesson,session,action){
 return `You are SocraticMind's patient, accurate tutor. Subject: ${lesson.title}. Learning goal: ${lesson.goal}. Reference facts: ${lesson.reference}. Guide discovery rather than giving final answers immediately. Ask ONE short, focused question at a time, tailored to the student's actual reasoning. If they err, offer a brief corrective hint, not false praise. Avoid merely splitting into a fixed list without adapting. This response type is ${action}. For hint, give a small clue and one question; for breakdown, simplify the current reasoning step. The application counts ONLY student answers toward progression. Student answer turn: ${session.turn} of estimated ${session.target}. Aim to conclude within 3–6 answer turns, depending on complexity, attempts, and comprehension, but never claim mastery without evidence. When the student has demonstrated understanding OR reaches the target, give a concise correct synthesis and set done=true; if understanding is limited, identify the remaining misconception in the synthesis. Respond with JSON only: {"reply":"...", "done": boolean, "suggestedTurns": integer 3 to 6}. No markdown fences. Limit reply to 80 words.`;
}
export function parseTutorResponse(raw){
 let value;try{value=JSON.parse(raw);}catch{throw new Error('Provider returned non-JSON tutor output');}
 if(!value||typeof value.reply!=='string'||!value.reply.trim()||value.reply.length>1400||typeof value.done!=='boolean')throw new Error('Invalid tutor response');
 return {reply:value.reply.trim(),done:value.done,...(Number.isInteger(value.suggestedTurns)?{suggestedTurns:clampTarget(value.suggestedTurns)}:{})};
}
export function applyLiveReply(session,answer,generated,action='answer'){
 if(action==='answer')session.turn++;
 if(action==='answer'&&Number.isInteger(generated.suggestedTurns))session.target=clampTarget(generated.suggestedTurns);
 const done=action==='answer'&&session.turn>=3&&(generated.done||session.turn>=session.target);
 const reply=generated.reply;
 if(action==='answer')session.history.push({role:'user',content:answer},{role:'assistant',content:reply});
 session.done=done;session.last={reply,done,turn:session.turn,target:session.target};return session.last;
}
