import {create} from 'zustand'
import {persist,PersistStorage} from 'zustand/middleware'
import {fixtures,markets,teams,Fixture,Group,Sel} from './data'
import {MS,Info,newMS,advanceTo,finish,forceGoal,infoOf,priceOf,baseOdds,closed,suspendedNow,resolve,MIN_MS} from './engine'
import {Bet,Tx,Status,addTx,cashOffer,r2} from './betting'
export type {Bet,Tx,Status}
export type Item={id:string;fid:string;gid:string;market:string;label:string;odds:number;stake:string}
export type Kind='thesis'|'bet'|'discussion'|'highlight'|'settled'
export type Battle={id:number;fid:string;a:{u:string;sel:string;why:string};b:{u:string;sel:string;why:string};votes:[number,number];voted?:0|1;result?:{w:0|1;text:string}}
export type Post={id:number;kind:Kind;user:string;fid:string;sel?:string;oddsAt?:number;body:string;likes:number;liked:boolean;rp:number;reposted:boolean;cm:string[];t:string;stake?:number;st?:string;ret?:number}
export const USERS:Record<string,{v:boolean;x:boolean}>={TideWatch:{v:true,x:true},NorthBank:{v:false,x:true},KelpKid:{v:false,x:false},DeepCurrent:{v:true,x:true},You:{v:false,x:false}}
const cache=new Map<string,Record<string,Group[]>>()
export const mk=(f:Fixture)=>{let m=cache.get(f.id);if(!m){m=markets(f);cache.set(f.id,m)}return m}
export const lookup=(id:string):{f:Fixture;g:Group;s:Sel}|undefined=>{const [fid,sid]=id.split('|'),f=fixtures.find(x=>x.id==fid);if(!f)return;for(const gs of Object.values(mk(f)))for(const g of gs)for(const s of g.sels)if(s.id==sid)return{f,g,s}}
const cover=[[0,1],[0,2],[1,2]]
const conflict=(a:string,b:string)=>{const[fa,sa]=a.split('|'),[fb,sb]=b.split('|');if(fa!=fb)return false;const[ga,ia]=sa.split('.'),[gb,ib]=sb.split('.');if(ga==gb)return true
if(ga=='mr'&&gb=='dc')return!cover[+ib].includes(+ia);if(ga=='dc'&&gb=='mr')return!cover[+ia].includes(+ib);return false}
export const ret=(stake:string|number,o:number)=>Math.round(Math.round(+stake*100)*o)/100
export const okStake=(v:string)=>/^\d+(\.\d{1,2})?$/.test(v)&&+v>0&&+v<=500
/* ---- simulation schedule: some live at different minutes, some upcoming (staggered), one finished ---- */
export type Sim={ms:Record<string,MS>;gen:number}
const hash=(s:string)=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7)
const OFF:Record<string,number>={arsbha:-30*MIN_MS,avlful:-55*MIN_MS,neweve:-12*MIN_MS,atmsev:-70*MIN_MS,juvrom:-20*MIN_MS,levbvb:-5*MIN_MS,munliv:25e3,mcitot:55e3,arsint:85e3,rmabay:115e3,barpsg:145e3,napmil:-130*MIN_MS}
export function makeSim(now:number,seed:number):Sim{const ms:Record<string,MS>={};for(const f of fixtures){const m=newMS(f,now+(OFF[f.id]??30e3),hash(f.id)+seed*7919);advanceTo(f,m,now);ms[f.id]=m}return{ms,gen:seed}}
const fx=(id:string)=>fixtures.find(x=>x.id==id)!
const N0=Date.now()
const seedLedger=():Tx[]=>{let l:Tx[]=[];l=addTx(l,'seed:deposit','deposit',undefined,1000,N0)!;l=addTx(l,'HB-4F7K2:stake','stake','HB-4F7K2',-20,N0)!;return addTx(l,'HB-9QX3D:stake','stake','HB-9QX3D',-10,N0)!}
const D=864e5,H=36e5
const seedBets=():Bet[]=>[{ref:'HB-4F7K2',fid:'arsbha',sel:'arsbha|mr.0',market:'Match result',label:'Arsenal',odds:1.8,stake:20,st:'open',ts:N0-4*H},{ref:'HB-9QX3D',fid:'munliv',sel:'munliv|tg.4',market:'Total goals',label:'Over 2.5',odds:1.95,stake:10,st:'open',ts:N0-30*H},{ref:'HB-2M9QA',fid:'mcitot',market:'Match result',label:'Man City',odds:1.5,stake:25,st:'won',ts:N0-3*D,ret:37.5},{ref:'HB-8TT1C',fid:'rmabay',market:'Match result',label:'Draw',odds:3.7,stake:15,st:'lost',ts:N0-12*D},{ref:'HB-5VV0B',fid:'napmil',market:'Both teams to score',label:'Yes',odds:1.85,stake:10,st:'refunded',ts:N0-20*D,ret:10},{ref:'HB-1CC7E',fid:'barpsg',market:'Match result',label:'Draw',odds:3.8,stake:12,st:'cancelled',ts:N0-6*D,ret:12}]
const P=(id:number,kind:Kind,user:string,fid:string,sel:string|undefined,oddsAt:number|undefined,body:string,likes:number,t:string,x:Partial<Post>={}):Post=>({id,kind,user,fid,sel,oddsAt,body,likes,liked:false,rp:Math.floor(likes/8),reposted:false,cm:[],t,...x})
const seedPosts=():Post[]=>[P(1,'thesis','TideWatch','arsbha','arsbha|mr.0',1.3,'Arsenal keep forcing turnovers high up and Brighton struggle against a press. Short price, but the game state backs it. A thesis, not a guarantee.',48,'14 min'),
P(2,'bet','NorthBank','arsbha','arsbha|mr.0',1.28,'Backed early. Demo stake.',22,'20 min',{stake:25,st:'open'}),P(3,'thesis','KelpKid','arsbha','arsbha|tg.4',2.73,'Plenty of chances created, one more goal looks likely from here.',31,'32 min'),
P(4,'thesis','DeepCurrent','arsbha','arsbha|mr.0',1.33,'Pressing numbers favour the home side, and Brighton concede more after the hour.',64,'45 min'),P(5,'thesis','NorthBank','arsbha','arsbha|mr.1',4.8,'One slip and it is level. The draw is the value for me.',9,'1 h'),
P(6,'discussion','KelpKid','arsbha',undefined,undefined,'Is Brighton leaving too much space behind the high line, or is Arsenal just forcing it?',17,'1 h'),P(7,'highlight','DeepCurrent','mcitot','mcitot|mr.0',1.5,'Landed. City controlled it from the first whistle.',72,'3 h',{stake:25,st:'won',ret:37.5}),
P(8,'thesis','TideWatch','arsbha','arsbha|mr.0',1.31,'Set pieces are the tiebreaker here.',26,'2 h'),P(9,'thesis','KelpKid','arsbha','arsbha|mr.2',11,'Contrarian. If Brighton score first the price is huge.',5,'2 h'),
P(10,'thesis','DeepCurrent','munliv','munliv|mr.1',4,'Two sides that rarely lose the first leg of a rivalry. Draw.',19,'4 h'),P(12,'settled','NorthBank','mcitot','mcitot|mr.0',1.5,'Settled. The price was right, the result was not.',6,'1 d',{stake:15,st:'lost',ret:0}),P(11,'thesis','NorthBank','arsint','arsint|mr.0',1.95,'Arsenal at home in Europe is a good place to start.',38,'5 h')]
const seedBattles=():Battle[]=>[{id:1,fid:'arsbha',a:{u:'TideWatch',sel:'arsbha|mr.0',why:'Pressing and set pieces should decide it.'},b:{u:'NorthBank',sel:'arsbha|mr.1',why:'Brighton keep it tight. Draw is the value.'},votes:[41,12]},{id:2,fid:'munliv',a:{u:'RippleFC',sel:'munliv|mr.0',why:'Home form and a rested squad.'},b:{u:'DeepCurrent',sel:'munliv|mr.2',why:'United break well against high lines.'},votes:[18,22]},{id:3,fid:'rmabay',a:{u:'KelpKid',sel:'rmabay|tg.4',why:'Both sides press high and concede chances.'},b:{u:'CourtVision',sel:'rmabay|tg.5',why:'Cagey first leg, goals later.'},votes:[30,9],result:{w:0,text:'Finished 3-1. Over 2.5 landed.'}}]
type Mode='live'|'sus'
type S={slip:Item[];open:boolean;notice:string|null;px:Record<string,number>;susSel:Record<string,boolean>;mode:Mode;failNext:boolean;phase:'idle'|'validating'|'failed';err:string|null;conf:Bet[]|null;bal:number;ledger:Tx[];bets:Bet[];fol:Record<string,boolean>;fing:Record<string,boolean>;posts:Post[];battles:Battle[];notif:Record<string,boolean>;toast:string|null;composer:{open:boolean;fid?:string;sel?:string}
xOn:boolean;toggleX:()=>void;dlg:{type:'x'|'ticket';ref?:string}|null;openDlg:(d:{type:'x'|'ticket';ref?:string})=>void;closeDlg:()=>void;stab:'slip'|'hist';setTab:(t:'slip'|'hist')=>void;goalFeed:{id:string;fid:string;text:string;ts:number}[];sim:Sim;now:number;ready:boolean;cashing:Record<string,boolean>;cashNote:{ok:boolean;text:string}|null
price:(id:string)=>number;mat:(x:Item)=>boolean;eff:(x:Item)=>number;base:(id:string)=>number;sus:(id:string)=>boolean;score:(f:Fixture)=>[number,number];info:(f:Fixture)=>Info;issue:()=>string;say:(m:string)=>void;cashOffer:(b:Bet)=>{ok:boolean;value:number;reason?:string}
toggle:(id:string)=>void;setStake:(id:string,v:string)=>void;accept:(id:string)=>void;remove:(id:string)=>void;clear:()=>void;setOpen:(o:boolean)=>void;place:()=>void;done:()=>void
cashout:(ref:string,expected?:number)=>boolean;follow:(k:string)=>void;followUser:(u:string)=>void;setMode:(m:Mode)=>void;move:()=>void;susOne:()=>void;toggleFail:()=>void;reset:()=>void
boot:()=>void;tick:()=>void;ffAll:()=>void;restartSim:()=>void;voidLive:()=>void;goal:(fid:string,side:0|1)=>boolean
vote:(id:number,s:0|1)=>void;createBattle:(fid:string,sel:string,opp:string)=>void;toggleNotif:(u:string)=>void;settleDemo:()=>void;like:(id:number)=>void;repost:(id:number)=>void;comment:(id:number,t:string)=>void;openComposer:(p?:{fid?:string;sel?:string})=>void;closeComposer:()=>void;publish:(p:{kind:'thesis'|'discussion';fid:string;sel?:string;body:string})=>void}
const priceIn=(s:{px:Record<string,number>;sim:Sim},id:string)=>{const[fid,sid]=id.split('|');return s.px[id]??priceOf(fx(fid),s.sim.ms[fid],sid)}
/** Settle every open bet whose match has finished regulation. Idempotent: status + unique ledger keys stop double payment. */
function settleAll(s:{bets:Bet[];ledger:Tx[];sim:Sim}):{bets:Bet[];ledger:Tx[];bal:number}|null{let led=s.ledger,changed=false
const bets=s.bets.map(b=>{if(b.st!='open'||!b.sel)return b;const m=s.sim.ms[b.fid];if(!m?.reg)return b;const r=resolve(fx(b.fid),m,b.sel.split('|')[1]);changed=true
if(r=='won'){const amt=r2(b.stake*b.odds),l=addTx(led,b.ref+':win','win',b.ref,amt,Date.now());if(l)led=l;return{...b,st:'won' as const,ret:amt}}return{...b,st:'lost' as const,ret:0}})
return changed?{bets,ledger:led,bal:led[led.length-1].bal}:null}
const saneState=(p:any)=>p&&Array.isArray(p.bets)&&Array.isArray(p.ledger)&&p.ledger.length>0&&typeof p.bal=='number'&&Array.isArray(p.slip)&&p.sim&&typeof p.sim.ms=='object'&&fixtures.every(f=>p.sim.ms[f.id]&&typeof p.sim.ms[f.id].tick=='number')&&Array.isArray(p.posts)
const storage:PersistStorage<any>={getItem:n=>{try{const s=localStorage.getItem(n);if(!s)return null;const v=JSON.parse(s);if(!v||typeof v!='object')throw 0;return v}catch{try{localStorage.removeItem(n)}catch{}return null}},setItem:(n,v)=>{try{localStorage.setItem(n,JSON.stringify(v))}catch{}},removeItem:n=>{try{localStorage.removeItem(n)}catch{}}}
export const STORE_KEY='housebets-demo',STORE_VERSION=2
export const useBook=create<S>()(persist((set,get)=>({slip:[],open:false,notice:null,px:{},susSel:{},mode:'live',failNext:false,phase:'idle',err:null,conf:null,bal:970,ledger:seedLedger(),bets:seedBets(),fol:{'Premier League':true,Arsenal:true},fing:{NorthBank:true,TideWatch:true},posts:seedPosts(),battles:seedBattles(),notif:{},toast:null,composer:{open:false},xOn:false,dlg:null,toggleX:()=>set(st=>({xOn:!st.xOn})),openDlg:d=>set({dlg:d}),closeDlg:()=>set({dlg:null}),stab:'slip',goalFeed:[],setTab:t=>set({stab:t,open:true}),sim:makeSim(Date.now(),7),now:Date.now(),ready:false,cashing:{},cashNote:null,
price:id=>priceIn(get(),id),mat:x=>{const s=get(),c=priceIn(s,x.id);return s.px[x.id]!=null?c!=x.odds:c<x.odds*.96},eff:x=>get().mat(x)?x.odds:priceIn(get(),x.id),base:id=>{const[fid,sid]=id.split('|');return baseOdds(fx(fid),sid)},score:f=>get().sim.ms[f.id].sc,info:f=>infoOf(get().sim.ms[f.id],get().now),
sus:id=>{const s=get(),[fid,sid]=id.split('|'),m=s.sim.ms[fid];if(!m)return true;const live=m.ph!='pre'&&m.ph!='ft';return !!s.susSel[id]||closed(fx(fid),m,sid)||suspendedNow(m)||(s.mode=='sus'&&live)},
cashOffer:b=>{const s=get(),m=s.sim.ms[b.fid];if(!m||!b.sel)return{ok:false,value:0,reason:'Not eligible'};const i=infoOf(m,s.now);return cashOffer(b,{live:i.live&&!m.reg,finished:i.status=='ft'||m.reg,suspended:get().sus(b.sel),oddsNow:priceIn(s,b.sel)})},
issue:()=>{const s=get(),t=s.slip.reduce((a,x)=>a+(okStake(x.stake)?+x.stake:0),0);return !s.slip.length?'Add a selection':s.slip.some(x=>s.sus(x.id))?'Remove suspended selections to continue':s.slip.some(x=>s.mat(x))?'Accept the updated odds to continue':s.slip.some(x=>x.stake==='')?'Enter a stake on every selection':s.slip.some(x=>!okStake(x.stake))?'Fix the invalid stakes':t>s.bal?'Total stake exceeds your demo balance':''},
say:m=>{set({toast:m});setTimeout(()=>set(st=>st.toast==m?{toast:null}:{}),2200)},
toggle:id=>set(st=>{if(st.slip.some(x=>x.id==id))return{slip:st.slip.filter(x=>x.id!=id),notice:null};const l=lookup(id)!,out=st.slip.filter(x=>conflict(x.id,id))
return{slip:[...st.slip.filter(x=>!conflict(x.id,id)),{id,fid:l.f.id,gid:l.g.id,market:l.g.title,label:l.s.label,odds:priceIn(st,id),stake:''}],open:typeof window!='undefined'&&window.innerWidth<768?st.open:true,stab:'slip' as const,conf:null,err:null,phase:'idle',notice:out.length?`Replaced ${out.map(o=>o.label).join(', ')} with ${l.s.label}. Contradictory outcomes in the same match cannot be combined.`:null}}),
setStake:(id,v)=>set(st=>({slip:st.slip.map(x=>x.id==id?{...x,stake:v}:x),err:null,phase:'idle'})),accept:id=>set(st=>({slip:st.slip.map(x=>x.id==id?{...x,odds:get().price(id)}:x)})),
remove:id=>set(st=>({slip:st.slip.filter(x=>x.id!=id),notice:null})),clear:()=>set({slip:[],notice:null,err:null,phase:'idle'}),setOpen:o=>set({open:o}),done:()=>set({conf:null}),
place:()=>{if(get().phase=='validating')return;const i=get().issue();if(i){set({phase:'failed',err:i});return}set({phase:'validating',err:null})
setTimeout(()=>{const s=get();if(s.phase!='validating')return;const i2=s.issue();if(i2){set({phase:'failed',err:'Placement rejected: '+i2});return}if(s.failNext){set({phase:'failed',failNext:false,err:'The bets could not be placed. Nothing was charged, so you can retry.'});return}
let led=s.ledger;const t:Bet[]=[];for(const x of s.slip){let ref='';do{ref='HB-'+Math.random().toString(36).slice(2,7).toUpperCase()}while(s.bets.some(b=>b.ref==ref)||t.some(b=>b.ref==ref));const bet:Bet={ref,fid:x.fid,sel:x.id,market:x.market,label:x.label,odds:s.eff(x),stake:+x.stake,st:'open',ts:Date.now()};const l=addTx(led,ref+':stake','stake',ref,-bet.stake,Date.now());if(!l)continue;led=l;t.push(bet)}
set({bets:[...t,...s.bets],ledger:led,bal:led[led.length-1].bal,conf:t,slip:[],phase:'idle',notice:null})},1600)},
cashout:(ref,expected)=>{const s=get(),b=s.bets.find(x=>x.ref==ref);if(!b||b.st!='open'||s.cashing[ref])return false;set(st=>({cashing:{...st.cashing,[ref]:true}}))
const rel=()=>set(st=>{const c={...st.cashing};delete c[ref];return{cashing:c}}),o=get().cashOffer(b)
if(!o.ok){rel();set({cashNote:{ok:false,text:'Cash out unavailable: '+(o.reason??'')}});return false}
if(expected!=null&&o.value<expected*.97){rel();set({cashNote:{ok:false,text:`The cash out value changed to ${o.value.toFixed(2)} USDT. Review and confirm again.`}});return false}
const led=addTx(get().ledger,ref+':cashout','cashout',ref,o.value,Date.now());if(!led){rel();return false}
set(st=>{const c={...st.cashing};delete c[ref];return{ledger:led,bal:led[led.length-1].bal,bets:st.bets.map(x=>x.ref==ref?{...x,st:'cashed' as const,ret:o.value}:x),cashing:c,cashNote:{ok:true,text:`Cashed out ${b.label} for ${o.value.toFixed(2)} USDT. Credited to your wallet.`}}});return true},
follow:k=>set(st=>({fol:{...st.fol,[k]:!st.fol[k]}})),followUser:u=>set(st=>({fing:{...st.fing,[u]:!st.fing[u]}})),setMode:m=>set({mode:m}),
move:()=>set(st=>{const id=st.slip[0]?.id??'arsbha|mr.0',p=priceIn(st,id);return{px:{...st.px,[id]:+(p+(p>2?-.2:.2)).toFixed(2)}}}),susOne:()=>set(st=>{const id=st.slip[0]?.id??'arsbha|mr.0';return{susSel:{...st.susSel,[id]:!st.susSel[id]}}}),
toggleFail:()=>set(st=>({failNext:!st.failNext})),reset:()=>set({px:{},susSel:{},mode:'live',failNext:false,err:null,phase:'idle'}),
/* boot: after rehydrate, repair balance from the ledger, catch the simulation up to real time, settle anything that finished while away */
boot:()=>{const s=get(),now=Date.now(),ms:Record<string,MS>={};for(const f of fixtures){const m=structuredClone(s.sim.ms[f.id]);advanceTo(f,m,now);ms[f.id]=m}
const sim={...s.sim,ms},st=settleAll({bets:s.bets,ledger:s.ledger,sim}),led=st?.ledger??s.ledger;set({sim,now,...(st??{}),bal:led[led.length-1].bal,ready:true})},
tick:()=>{const s=get(),now=Date.now();let ms=s.sim.ms,ch=false;for(const f of fixtures){const m=s.sim.ms[f.id],tgt=now>=m.ko?Math.floor((now-m.ko)/MIN_MS)+1:0;if(tgt>m.tick&&m.ph!='ft'){if(!ch){ms={...ms};ch=true}const n=structuredClone(m);advanceTo(f,n,now);ms[f.id]=n}}
if(!ch){const st0=settleAll({bets:s.bets,ledger:s.ledger,sim:s.sim});set({now,...(st0??{})});return}const sim={...s.sim,ms},st=settleAll({bets:s.bets,ledger:s.ledger,sim});const gf=[...s.goalFeed.filter(g=>now-g.ts<6000)];for(const f of fixtures){const o=s.sim.ms[f.id],n=ms[f.id];if(n!==o&&n.sc[0]+n.sc[1]>o.sc[0]+o.sc[1]&&(s.fol[teams[f.h].name]||s.fol[teams[f.a].name]||s.fol[f.comp]||s.fol['m:'+f.id]||s.bets.some(b=>b.st=='open'&&b.fid==f.id))){const g=[...n.ev].reverse().find(e=>e.t=='goal');gf.push({id:f.id+':'+n.sc.join('-'),fid:f.id,ts:now,text:`${teams[f.h].short} ${n.sc[0]}-${n.sc[1]} ${teams[f.a].short} · ${g?g.m+' '+g.text.slice(g.text.indexOf(': ')+2,g.text.lastIndexOf('. ')):''}`})}}
set({sim,now,goalFeed:gf.slice(-3),...(st??{})})},
ffAll:()=>{const s=get(),ms:Record<string,MS>={};for(const f of fixtures){const m=structuredClone(s.sim.ms[f.id]);finish(f,m);ms[f.id]=m}const sim={...s.sim,ms},st=settleAll({bets:s.bets,ledger:s.ledger,sim});set({sim,now:Date.now(),...(st??{})});get().say('All matches played to full time')},
restartSim:()=>{set({sim:makeSim(Date.now(),Math.floor(Math.random()*1e6)),now:Date.now()});get().say('New matchday started')},
voidLive:()=>{const s=get();let led=s.ledger;const bets=s.bets.map(b=>{if(b.st!='open')return b;const m=s.sim.ms[b.fid];if(!m||m.ph=='pre'||m.ph=='ft'||m.reg)return b;const l=addTx(led,b.ref+':refund','refund',b.ref,b.stake,Date.now());if(!l)return b;led=l;return{...b,st:'refunded' as const,ret:b.stake}});set({bets,ledger:led,bal:led[led.length-1].bal});get().say('Open bets on live matches voided and refunded')},
goal:(fid,side)=>{const s=get(),m=structuredClone(s.sim.ms[fid]);const ok=forceGoal(fx(fid),m,side);if(ok)set({sim:{...s.sim,ms:{...s.sim.ms,[fid]:m}}});return ok},
vote:(id,sd)=>set(st=>({battles:st.battles.map(b=>b.id==id&&b.voted==null?{...b,voted:sd,votes:(sd?[b.votes[0],b.votes[1]+1]:[b.votes[0]+1,b.votes[1]]) as [number,number]}:b)})),
createBattle:(fid,sel,opp)=>set(st=>{const[,sid]=sel.split('|'),[g,i]=sid.split('.'),o=`${fid}|${g}.${(+i+1)%(g=='mr'||g=='dc'?3:2)}`;return{battles:[{id:Date.now(),fid,a:{u:'You',sel,why:'Challenge sent. The opponent accepted automatically in this demo.'},b:{u:opp,sel:o,why:'Challenge accepted (demo).'},votes:[0,0] as [number,number]},...st.battles]}}),
toggleNotif:u=>set(st=>({notif:{...st.notif,[u]:!st.notif[u]}})),
settleDemo:()=>get().say('Bets now settle automatically when their match ends. Use "Fast-forward all matches".'),
like:id=>set(st=>({posts:st.posts.map(p=>p.id==id?{...p,liked:!p.liked,likes:p.likes+(p.liked?-1:1)}:p)})),repost:id=>set(st=>({posts:st.posts.map(p=>p.id==id?{...p,reposted:!p.reposted,rp:p.rp+(p.reposted?-1:1)}:p)})),
comment:(id,t)=>set(st=>({posts:st.posts.map(p=>p.id==id?{...p,cm:[...p.cm,t]}:p)})),openComposer:p=>set({composer:{open:true,...p}}),closeComposer:()=>set({composer:{open:false}}),
publish:p=>set(st=>({posts:[P(Date.now(),p.kind,'You',p.fid,p.sel,p.sel?get().price(p.sel):undefined,p.body,0,'just now'),...st.posts]}))}),
{name:STORE_KEY,version:STORE_VERSION,skipHydration:true,storage,partialize:s=>({xOn:s.xOn,bal:s.bal,ledger:s.ledger,bets:s.bets,slip:s.slip,sim:s.sim,fol:s.fol,fing:s.fing,notif:s.notif,battles:s.battles,posts:s.posts}) as any,
migrate:(p:any,v)=>v<STORE_VERSION?({} as any):p,merge:(p:any,cur)=>saneState(p)?{...cur,...p}:cur}))
if(typeof window!=='undefined')(window as unknown as {__hb:typeof useBook}).__hb=useBook
