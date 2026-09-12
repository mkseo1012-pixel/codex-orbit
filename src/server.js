import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Orchestrator } from './orchestrator.js';
import { register, login, userFrom } from './auth.js';
import { Scheduler } from './scheduler.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const orchestrator = new Orchestrator();
const scheduler = new Scheduler(orchestrator);
const json = (res, status, body) => { res.writeHead(status, {'content-type':'application/json; charset=utf-8'}); res.end(JSON.stringify(body)); };
const body = async req => { let s=''; for await (const c of req) s+=c; return s ? JSON.parse(s) : {}; };

const server = http.createServer(async (req,res) => {
  try {
    if (req.method==='POST'&&req.url==='/api/auth/register'){const x=await body(req);return json(res,201,register(x.email,x.password));}
    if (req.method==='POST'&&req.url==='/api/auth/login'){const x=await body(req);return json(res,200,login(x.email,x.password));}
    if (req.url === '/api/state') return json(res,200,orchestrator.state());
    if (req.method==='GET'&&req.url==='/api/schedules') return json(res,200,scheduler.list());
    if (req.method==='POST'&&req.url==='/api/schedules'){const x=await body(req);return json(res,201,scheduler.add(x));}
    const schedule=req.url.match(/^\/api\/schedules\/([^/]+)$/);if(req.method==='DELETE'&&schedule)return json(res,200,scheduler.remove(schedule[1]));
    if (req.method === 'POST' && req.url === '/api/runs') { const x=await body(req); return json(res,201,orchestrator.start({id:randomUUID(),...x})); }
    const stop=req.url.match(/^\/api\/runs\/([^/]+)\/stop$/);
    if (req.method==='POST'&&stop) return json(res,200,orchestrator.stop(stop[1]));
    const approval=req.url.match(/^\/api\/approvals\/([^/]+)$/);
    if (req.method==='POST'&&approval) { const x=await body(req); return json(res,200,orchestrator.decide(approval[1],x.decision)); }
    if (req.url === '/' || req.url === '/index.html') { res.writeHead(200,{'content-type':'text/html'}); return res.end(await readFile(path.join(root,'../public/index.html'))); }
    res.writeHead(404); res.end('Not found');
  } catch(e) { json(res,400,{error:e.message}); }
});
server.listen(process.env.PORT||8787,()=>console.log(`Codex Orbit listening on http://localhost:${process.env.PORT||8787}`));
