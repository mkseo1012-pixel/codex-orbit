import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { q } from './db.js';
const hash=(p,s=randomUUID())=>`${s}:${scryptSync(p,s,32).toString('hex')}`;
export function register(email,password){if(!/^\S+@\S+\.\S+$/.test(email)||password.length<10)throw Error('valid email and password of 10+ characters required');if(q.userByEmail.get(email))throw Error('email already registered');const id=randomUUID();q.insertUser.run(id,email,hash(password),new Date().toISOString());return login(email,password)}
export function login(email,password){const u=q.userByEmail.get(email);if(!u)throw Error('invalid credentials');const [salt,digest]=u.password_hash.split(':');if(!timingSafeEqual(Buffer.from(digest,'hex'),scryptSync(password,salt,32)))throw Error('invalid credentials');const token=randomUUID()+randomUUID();q.insertSession.run(token,u.id,Date.now()+7*86400000);return {token,user:{id:u.id,email:u.email}}}
export function userFrom(req){const token=(req.headers.authorization||'').replace(/^Bearer /,'');return token?q.session.get(token,Date.now()):null}
