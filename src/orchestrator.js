import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { q } from './db.js';
import { normalizePermissions } from './policy.js';
import { CodexAdapter } from './providers/codex.js';

export class Orchestrator extends EventEmitter {
  constructor({provider=new CodexAdapter()}={}) { super(); this.provider=provider; this.runs=new Map(); this.agents=new Map(); this.messages=[]; this.approvals=new Map(); }
  state(){ return {runs:[...this.runs.values()], agents:[...this.agents.values()], messages:this.messages.slice(-100), approvals:[...this.approvals.values()]}; }
  start(input){
    if(!input.goal || typeof input.goal!=='string') throw Error('goal is required');
    const run={id:input.id,status:'running',goal:input.goal,model:input.model||process.env.DEFAULT_MODEL||'gpt-5-codex',tokenLimit:Math.min(Number(input.tokenLimit)||20000,1000000),minutes:Math.min(Number(input.minutes)||60,1440),reportEvery:Math.max(Number(input.reportEvery)||10,1),permissions:normalizePermissions(input.permissions),startedAt:new Date().toISOString(),iterations:0};
    this.runs.set(run.id,run); q.saveRun.run(run.id,input.userId||null,run.goal,run.status,JSON.stringify({model:run.model,tokenLimit:run.tokenLimit,minutes:run.minutes,reportEvery:run.reportEvery,permissions:run.permissions}),run.startedAt); this.spawn(run,'planner'); this.loop(run); return run;
  }
  spawn(run,role,parent){ if(!run.permissions.subagents&&role!=='planner')throw Error('subagent permission is disabled'); const id=`${run.id}:${role}:${this.agents.size+1}`; const a={id,runId:run.id,role,parent:parent||null,status:'working',tokens:0}; this.agents.set(id,a); this.say(run.id,id,`Agent ${role} started`); return a; }
  say(runId,agentId,text){const at=new Date().toISOString();this.messages.push({id:Date.now()+Math.random(),runId,agentId,text,at});q.saveEvent.run(runId,agentId,text,at);this.emit('change');}
  async loop(run){ const end=Date.now()+run.minutes*60000; while(this.runs.get(run.id)?.status==='running'&&Date.now()<end&&run.iterations<100){ run.iterations++; const planner=[...this.agents.values()].find(a=>a.runId===run.id&&a.role==='planner'); try { const out=await this.provider.run({goal:run.goal,model:run.model,budget:run.tokenLimit-runnerTokens(this,run.id),runId:run.id}); planner.tokens+=out.tokens||0; this.say(run.id,planner.id,out.text||'No result returned'); if(out.delegate){ const child=this.spawn(run,out.delegate,planner.id); this.say(run.id,child.id,`Delegated work to ${out.delegate}.`); } if(out.approval){ const id=randomUUID(); this.approvals.set(id,{id,runId:run.id,action:out.approval,status:'pending'}); this.say(run.id,planner.id,`Approval required: ${out.approval}`); } } catch(e){this.say(run.id,planner.id,`Error: ${e.message}`);} await new Promise(r=>{run.timer=setTimeout(r,run.reportEvery*60000); run.timer.unref?.()}); } if(this.runs.get(run.id)?.status==='running') run.status='completed'; this.emit('change'); }
  stop(id){const r=this.runs.get(id); if(!r) throw Error('run not found'); r.status='stopped'; clearTimeout(r.timer); q.saveRun.run(r.id,null,r.goal,r.status,JSON.stringify({model:r.model,tokenLimit:r.tokenLimit,minutes:r.minutes,reportEvery:r.reportEvery}),r.startedAt); return r;}
  decide(id,decision){const a=this.approvals.get(id); if(!a) throw Error('approval not found'); if(!['approved','rejected'].includes(decision)) throw Error('invalid decision'); a.status=decision; return a;}
}
function runnerTokens(o,id){return [...o.agents.values()].filter(a=>a.runId===id).reduce((n,a)=>n+a.tokens,0);}
