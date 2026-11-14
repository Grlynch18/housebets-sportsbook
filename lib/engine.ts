/* HOUSEBETS match + odds engine. Pure functions, no React. See docs at the bottom of lib/betting.ts for the cashout model.
   TIME: 1 football minute = 667 ms (90' ~ 60 s). A match is a deterministic stepper: state advances one football minute per tick,
   driven by real time since kickoff, so any page (or a refresh) catches up to the same state. Each match owns a seeded RNG. */
import {Fixture,teams} from './data'
export const MIN_MS=667,HT_TICKS=6
export type EvT='goal'|'yellow'|'red'|'sub'|'injury'|'pen'|'offside'|'ht'|'ft'|'et'|'shootout'
export type Ev={m:string;t:EvT;team?:0|1;text:string}
export type Ph='pre'|'h1'|'h1s'|'ht'|'h2'|'h2s'|'etb'|'et1'|'etb2'|'et2'|'pens'|'ft'
export type MS={id:string;ko:number;tick:number;rng:number;ph:Ph;min:number;add:number;hold:number;s1:number;s2:number;sc:[number,number];sc45?:[number,number];sc90?:[number,number];rc:[number,number];yc:[number,number];co:[number,number];subs:[number,number];off:[number,number];sh:Record<string,number>;first?:string;ev:Ev[];ps:[number,number];pr:number;susUntil:number;reg:boolean}
export type Info={status:'upcoming'|'live'|'ht'|'ft';live:boolean;label:string;sc:[number,number];m:MS}
export const isKO=(f:Fixture)=>f.comp=='Champions League'
const rnd=(m:MS)=>{m.rng=m.rng+0x6D2B79F5|0;let t=Math.imul(m.rng^m.rng>>>15,1|m.rng);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
export const PLAYERS=(t:0|1)=>t?['K. Osei','T. Lindqvist']:['L. Brandt','M. Varga']
const SHARE=[.55,.45]
export function newMS(f:Fixture,ko:number,seed:number):MS{const m:MS={id:f.id,ko,tick:0,rng:seed|0,ph:'pre',min:0,add:0,hold:0,s1:1,s2:2,sc:[0,0],rc:[0,0],yc:[0,0],co:[0,0],subs:[0,0],off:[0,0],sh:{},ev:[],ps:[0,0],pr:0,susUntil:0,reg:false};m.s1=1+Math.floor(rnd(m)*3);m.s2=2+Math.floor(rnd(m)*4);return m}
/* ---- maths ---- */
const pois=(l:number,n=12)=>{const p=[Math.exp(-l)];for(let k=1;k<=n;k++)p.push(p[k-1]*l/k);return p}
const tail=(l:number,n:number)=>{if(n<=0)return 1;let s=0,p=Math.exp(-l);for(let k=0;k<n;k++){s+=p;p=p*l/(k+1)}return Math.max(0,1-s)}
const dist=(l0:number,l1:number,d0:number)=>{const a=pois(l0),b=pois(l1),o:Record<number,number>={};for(let i=0;i<=12;i++)for(let j=0;j<=12;j++){const k=d0+i-j;o[k]=(o[k]??0)+a[i]*b[j]}return o}
const P=(o:Record<number,number>,f:(d:number)=>boolean)=>{let s=0,t=0;for(const k in o){t+=o[k];if(f(+k))s+=o[k]}return t?s/t:0}
const calC=new Map<string,[number,number]>()
/** Full-match goal rates per team, calibrated so the model's pre-match 1X2 matches the fixture's listed prices. */
export function cal(f:Fixture):[number,number]{let c=calC.get(f.id);if(c)return c;const inv=f.o.map(o=>1/o),S=inv[0]+inv[1]+inv[2],ph=inv[0]/S,pa=inv[2]/S;let l0=1.5,l1=1.2
for(let i=0;i<60;i++){const d=dist(l0,l1,0),h=P(d,x=>x>0),a=P(d,x=>x<0);l0=Math.min(4.5,Math.max(.2,l0*Math.pow(ph/h,.35)));l1=Math.min(4.5,Math.max(.2,l1*Math.pow(pa/a,.35)))}
c=[l0,l1];calC.set(f.id,c);return c}
export const elapsed=(m:MS)=>m.ph=='pre'?0:m.ph=='h1'||m.ph=='h2'?m.min:m.ph=='h1s'||m.ph=='ht'?45:90
/** Scoring-rate multiplier for a team: red cards, trailing sides push late, leaders sit back. Shared by the sim and the odds. */
export function rateMult(m:MS,t:0|1,e:number){let k=Math.pow(.7,m.rc[t])*Math.pow(1.25,m.rc[1-t]);const d=m.sc[t]-m.sc[1-t];if(e>=60&&d<0)k*=1.3;if(e>=70&&d>0)k*=.85;return k}
/* ---- odds ---- */
const pcache=new Map<string,{k:string;p:Record<string,number>}>()
export function probs(f:Fixture,m:MS):Record<string,number>{const key=`${m.ko}|${m.tick}|${m.ph}|${m.sc}|${m.rc}|${m.co}|${m.yc}`,c=pcache.get(f.id);if(c&&c.k==key)return c.p
const L=cal(f),e=elapsed(m),r=Math.max(0,(90-e)/90),k=[rateMult(m,0,e),rateMult(m,1,e)],l0=L[0]*r*k[0],l1=L[1]*r*k[1],cur=m.sc[0]+m.sc[1],full=dist(l0,l1,m.sc[0]-m.sc[1]),p:Record<string,number>={}
p['mr.0']=P(full,d=>d>0);p['mr.1']=P(full,d=>d==0);p['mr.2']=P(full,d=>d<0);p['dc.0']=p['mr.0']+p['mr.1'];p['dc.1']=p['mr.0']+p['mr.2'];p['dc.2']=p['mr.1']+p['mr.2']
;[.5,1.5,2.5].forEach((ln,i)=>{const o=tail(l0+l1,Math.floor(ln)+1-cur);p[`tg.${i*2}`]=o;p[`tg.${i*2+1}`]=1-o})
const b0=m.sc[0]>0?1:1-Math.exp(-l0),b1=m.sc[1]>0?1:1-Math.exp(-l1);p['btts.0']=b0*b1;p['btts.1']=1-b0*b1
p['ah1.0']=P(full,d=>d>=2);p['ah1.1']=P(full,d=>d==1);p['ah1.2']=P(full,d=>d<=0);p['ah2.0']=p['mr.0'];p['ah2.1']=1-p['mr.0']
const f1=e<45?(45-e)/45:0,a0=L[0]*.45*f1*k[0],a1=L[1]*.45*f1*k[1],h1=dist(a0,a1,m.sc[0]-m.sc[1]);p['h1.0']=P(h1,d=>d>0);p['h1.1']=P(h1,d=>d==0);p['h1.2']=P(h1,d=>d<0)
p['h1g.0']=cur>0&&e<45?1:1-Math.exp(-(a0+a1));p['h1g.1']=1-p['h1g.0']
const s45=m.sc45??[0,0],d2=e>=45?(m.sc[0]-s45[0])-(m.sc[1]-s45[1]):0,f2=e<45?1:(90-e)/45,h2=dist(L[0]*.55*f2*k[0],L[1]*.55*f2*k[1],d2);p['h2.0']=P(h2,d=>d>0);p['h2.1']=P(h2,d=>d==0);p['h2.2']=P(h2,d=>d<0)
const C=m.co[0]+m.co[1],cr=.11*(90-e);p['co.0']=tail(cr,10-C);p['co.1']=1-p['co.0'];const K=m.yc[0]+m.yc[1]+m.rc[0]+m.rc[1],kr=.031*(90-e);p['cd.0']=tail(kr,4-K);p['cd.1']=1-p['cd.0']
const ln=[l0,l0,l1,l1],names=[...PLAYERS(0),...PLAYERS(1)];names.forEach((n,i)=>{p[`ags.${i}`]=m.sh[n]>0?1:1-Math.exp(-SHARE[i%2]*ln[i])})
const X=l0+l1||1e-9,none=Math.exp(-X);p['fgs.0']=SHARE[0]*l0/X*(1-none);p['fgs.1']=SHARE[0]*l1/X*(1-none);p['fgs.2']=none
pcache.set(f.id,{k:key,p});return p}
export const priceOfP=(p:number)=>Math.min(60,Math.max(1.01,+(1/(p*1.06)).toFixed(2)))
export const priceOf=(f:Fixture,m:MS,sid:string)=>priceOfP(Math.max(1e-6,probs(f,m)[sid]??.5))
const baseC=new Map<string,MS>()
export const baseOdds=(f:Fixture,sid:string)=>{let m=baseC.get(f.id);if(!m){m=newMS(f,0,1);baseC.set(f.id,m)}return priceOf(f,m,sid)}
/** A market is closed when the match is over, the half it covers is over, it is already decided, or it is briefly suspended after a goal/red card. */
export function closed(f:Fixture,m:MS,sid:string){if(m.reg)return true;const g=sid.split('.')[0],e=elapsed(m);if((g=='h1'||g=='h1g')&&m.ph!='pre'&&e>=45)return true;if(g=='fgs'&&m.sc[0]+m.sc[1]>0)return true
const p=probs(f,m)[sid];return p>=.995||p<=.003}
export const suspendedNow=(m:MS)=>m.ph!='pre'&&!m.reg&&m.tick<m.susUntil
/* ---- settlement ---- */
export function resolve(f:Fixture,m:MS,sid:string):'won'|'lost'{const [h,a]=m.sc90??m.sc,[g,is]=sid.split('.'),i=+is,d=h-a,tot=h+a,n45=m.sc45??[0,0],d45=n45[0]-n45[1],d2=d-d45,names=[...PLAYERS(0),...PLAYERS(1)]
const b=(x:boolean)=>x?'won':'lost' as const
switch(g){case 'mr':return b(i==0?d>0:i==1?d==0:d<0);case 'dc':return b([d>=0,d!=0,d<=0][i]);case 'tg':{const ln=[.5,.5,1.5,1.5,2.5,2.5][i];return b(i%2==0?tot>ln:tot<ln)}
case 'btts':return b(i==0?h>0&&a>0:!(h>0&&a>0));case 'h1g':return b(i==0?n45[0]+n45[1]>0:n45[0]+n45[1]==0);case 'h1':return b(i==0?d45>0:i==1?d45==0:d45<0);case 'h2':return b(i==0?d2>0:i==1?d2==0:d2<0)
case 'ah1':return b(i==0?d>=2:i==1?d==1:d<=0);case 'ah2':return b(i==0?d>=1:d<=0);case 'ags':return b(m.sh[names[i]]>0);case 'fgs':return b(i<2?m.first==PLAYERS(i as 0|1)[0]:!m.first)
case 'co':return b(i==0?m.co[0]+m.co[1]>9.5:m.co[0]+m.co[1]<9.5);case 'cd':{const k=m.yc[0]+m.yc[1]+m.rc[0]+m.rc[1];return b(i==0?k>3.5:k<3.5)}}
return 'lost'}
/* ---- stepper ---- */
const lbl=(m:MS)=>m.ph=='h1s'?`45+${m.add}'`:m.ph=='h2s'?`90+${m.add}'`:`${m.min}'`
const push=(m:MS,t:EvT,text:string,team?:0|1)=>{m.ev.push({m:lbl(m),t,text,team});if(m.ev.length>70)m.ev.shift()}
function goal(f:Fixture,m:MS,t:0|1,pen:boolean){m.sc[t]++;const pl=PLAYERS(t),who=rnd(m)<SHARE[0]?pl[0]:pl[1];if(!m.reg){m.sh[who]=(m.sh[who]??0)+1;if(!m.first)m.first=who}
m.susUntil=m.tick+2;push(m,'goal',`Goal ${teams[t?f.a:f.h].short}${pen?' (pen)':''}: ${who}. ${m.sc[0]}-${m.sc[1]}`,t)}
function play(f:Fixture,m:MS){const L=cal(f),e=elapsed(m),et=m.ph=='et1'||m.ph=='et2',k:[number,number]=[rateMult(m,0,e),rateMult(m,1,e)],nm=(t:0|1)=>teams[t?f.a:f.h].short
for(const t of [0,1] as const){if(rnd(m)<L[t]/90*k[t]*(et?.8:1))goal(f,m,t,false)}
if(rnd(m)<.0035){const t=rnd(m)<.5?0:1;m.susUntil=m.tick+2;push(m,'pen',`Penalty awarded to ${nm(t)}`,t);if(rnd(m)<.78)goal(f,m,t,true);else push(m,'pen',`Penalty saved. ${nm(t)} fail to score`,t)}
if(!et){if(rnd(m)<.03){const t=rnd(m)<.5?0:1;m.yc[t]++;push(m,'yellow',`Yellow card, ${nm(t)}`,t)}
if(rnd(m)<.0016){const t=rnd(m)<.5?0:1;m.rc[t]++;m.susUntil=m.tick+2;push(m,'red',`RED CARD, ${nm(t)} down to ten`,t)}
if(rnd(m)<.11){const w=L[0]*k[0]/(L[0]*k[0]+L[1]*k[1]);m.co[rnd(m)<w?0:1]++}
if(rnd(m)<.05){const t=rnd(m)<.5?0:1;m.off[t]++;push(m,'offside',`Offside, ${nm(t)}`,t)}}
if(e>=55&&e<=88&&rnd(m)<.045){const t=rnd(m)<.5?0:1;if(m.subs[t]<3){m.subs[t]++;push(m,'sub',`Substitution, ${nm(t)}`,t)}}
if(rnd(m)<.004)push(m,'injury','Play stopped for an injury')}
function endReg(f:Fixture,m:MS){m.sc90=[m.sc[0],m.sc[1]];m.reg=true;push(m,'ft',`Full time. ${m.sc[0]}-${m.sc[1]}`)
if(isKO(f)&&m.sc[0]==m.sc[1]){m.ph='etb';m.hold=2;push(m,'et','Level after 90 minutes. Extra time')}else m.ph='ft'}
export function step(f:Fixture,m:MS){m.tick++
switch(m.ph){case 'pre':m.ph='h1';m.min=1;play(f,m);break
case 'h1':if(m.min<45)m.min++;else{m.ph='h1s';m.add=1}play(f,m);break
case 'h1s':if(m.add<m.s1){m.add++;play(f,m)}else{m.ph='ht';m.hold=HT_TICKS;m.sc45=[m.sc[0],m.sc[1]];push(m,'ht',`Half time. ${m.sc[0]}-${m.sc[1]}`)}break
case 'ht':m.hold--;if(m.hold<=0){m.ph='h2';m.min=46;play(f,m)}break
case 'h2':if(m.min<90)m.min++;else{m.ph='h2s';m.add=1}play(f,m);break
case 'h2s':if(m.add<m.s2){m.add++;play(f,m)}else endReg(f,m);break
case 'etb':m.hold--;if(m.hold<=0){m.ph='et1';m.min=91;play(f,m)}break
case 'et1':if(m.min<105){m.min++;play(f,m)}else{m.ph='etb2';m.hold=2}break
case 'etb2':m.hold--;if(m.hold<=0){m.ph='et2';m.min=106;play(f,m)}break
case 'et2':if(m.min<120){m.min++;play(f,m)}else if(m.sc[0]==m.sc[1]){m.ph='pens';push(m,'shootout','Penalty shootout')}else{m.ph='ft';push(m,'ft',`Full time after extra time. ${m.sc[0]}-${m.sc[1]}`)}break
case 'pens':{m.pr++;if(rnd(m)<.76)m.ps[0]++;if(rnd(m)<.76)m.ps[1]++;push(m,'shootout',`Shootout ${m.ps[0]}-${m.ps[1]}`);const rem=Math.max(0,5-m.pr);let done=false
if(m.pr<=5){if(m.ps[0]>m.ps[1]+rem||m.ps[1]>m.ps[0]+rem||(m.pr==5&&m.ps[0]!=m.ps[1]))done=true}else if(m.ps[0]!=m.ps[1])done=true
if(m.pr>=12&&!done){if(rnd(m)<.5)m.ps[0]++;else m.ps[1]++;done=true}if(done){m.ph='ft';push(m,'ft',`Full time. ${teams[m.ps[0]>m.ps[1]?f.h:f.a].short} win ${Math.max(...m.ps)}-${Math.min(...m.ps)} on penalties`)}break}}}
export function advanceTo(f:Fixture,m:MS,now:number){const tgt=now>=m.ko?Math.floor((now-m.ko)/MIN_MS)+1:0;let n=0;while(m.tick<tgt&&m.ph!='ft'&&n++<600)step(f,m)}
export function finish(f:Fixture,m:MS){let n=0;if(m.ph=='pre')m.ko=Math.min(m.ko,Date.now());while(m.ph!='ft'&&n++<700)step(f,m)}
export function forceGoal(f:Fixture,m:MS,t:0|1){if(m.ph=='pre'||m.ph=='ft'||m.reg)return false;goal(f,m,t,false);return true}
export function infoOf(m:MS,now:number):Info{const live=m.ph!='pre'&&m.ph!='ft';let label='',status:Info['status']='live'
if(m.ph=='pre'){status='upcoming';const s=Math.max(0,Math.ceil((m.ko-now)/1000));label=s>0?`KO ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`:'KO'}
else if(m.ph=='ft'){status='ft';label=m.pr?'FT (P)':m.sc90&&(m.sc90[0]!=m.sc[0]||m.sc90[1]!=m.sc[1])?'FT (ET)':'FT'}
else if(m.ph=='ht'){status='ht';label='HT'}else if(m.ph=='etb'||m.ph=='etb2')label='ET break'
else if(m.ph=='pens')label='Pens '+m.ps[0]+'-'+m.ps[1];else label=lbl(m)+(m.ph=='et1'||m.ph=='et2'?' ET':'')
return{status,live,label,sc:m.sc,m}}
