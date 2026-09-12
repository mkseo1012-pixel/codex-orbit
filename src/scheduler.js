import { randomUUID } from 'node:crypto';
export class Scheduler {
  constructor(orchestrator){this.orchestrator=orchestrator;this.jobs=new Map()}
  list(){return [...this.jobs.values()]}
  add({goal,cron='*/10 * * * *',model,tokenLimit,minutes,permissions}){if(!goal)throw Error('goal is required');const job={id:randomUUID(),goal,cron,model,tokenLimit,minutes,permissions,enabled:true,createdAt:new Date().toISOString()};const every=cronToMs(cron);job.timer=setInterval(()=>this.orchestrator.start({id:randomUUID(),goal,model,tokenLimit,minutes,permissions}),every);job.timer.unref?.();this.jobs.set(job.id,job);return publicJob(job)}
  remove(id){const j=this.jobs.get(id);if(!j)throw Error('schedule not found');clearInterval(j.timer);this.jobs.delete(id);return {id,deleted:true}}
}
function publicJob({timer,...j}){return j}
function cronToMs(cron){const m=String(cron).trim().match(/^\*\/(\d+) \* \* \* \*$/);if(!m)throw Error('MVP scheduler accepts cron like */10 * * * *');const n=Number(m[1]);if(n<1||n>1440)throw Error('cron interval must be 1-1440 minutes');return n*60000}
