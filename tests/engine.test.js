import test from 'node:test';import assert from 'node:assert/strict';
import {makeSession,clampTarget,practiceReply,parseTutorResponse,applyLiveReply,buildInstructions} from '../src/engine.js';
import {getLesson} from '../src/lessons.js';
test('lessons initialize with curated first question',()=>{for(const id of ['anatomy','richmond','algebra','physics']){const s=makeSession(id);assert.equal(s.turn,0);assert.equal(s.last.reply,getLesson(id).initial);}});
test('3–6 target bounds',()=>{assert.equal(clampTarget(1),3);assert.equal(clampTarget(20),6);assert.equal(clampTarget(5),5);});
test('practice counts answers but not hints or breakdowns',()=>{const s=makeSession('physics');practiceReply(s,'','hint');practiceReply(s,'','breakdown');assert.equal(s.turn,0);for(let i=0;i<4;i++)practiceReply(s,'my answer');assert.equal(s.turn,4);assert.equal(s.done,true);});
test('parser rejects malformed output',()=>{assert.deepEqual(parseTutorResponse('{"reply":"What next?","done":false}'),{reply:'What next?',done:false});assert.throws(()=>parseTutorResponse('not JSON'));assert.throws(()=>parseTutorResponse('{"reply":4,"done":false}'));});
test('live progression counts answers and concludes at target',()=>{const s=makeSession('anatomy','live');applyLiveReply(s,'', {reply:'A clue?',done:false},'hint');assert.equal(s.turn,0);for(let i=0;i<5;i++)applyLiveReply(s,'attempt', {reply:'Review the concepts.',done:false},'answer');assert.equal(s.done,true);assert.equal(s.history.length,10);});
test('prompts include lesson context and turn counter',()=>{const s=makeSession('richmond','live');const p=buildInstructions(getLesson('richmond'),s,'answer');assert.match(p,/Richmond/);assert.match(p,/3–6/);});
