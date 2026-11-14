import {useMemo} from 'react'
import {useBook,Bet} from './store'
import {fixtures,teams} from './data'
export type Sport='Football'|'Basketball'|'Tennis'|'American Football'
export const SPORTS:Sport[]=['Football','Basketball','Tennis','American Football']
export type Src='verified'|'published'|'external'
export type PStatus='open'|'won'|'lost'|'void'|'cancelled'
export type Pred={id:string;uid:string;sport:Sport;event:string;fid?:string;selId?:string;market:string;sel:string;odds:number;ts:number;stake:number;disclosed:boolean;status:PStatus;src:Src;pnl?:number}
export type Creator={id:string;name:string;bio:string;joined:string;sports:Sport[];verified:boolean;followers:number;following:number;x:boolean;seed:number;n:number;skill:number;odds:number;stake:number;span:number;live?:boolean}
export const NOW=Date.now(),DAY=864e5
const C=(id:string,name:string,bio:string,joined:string,sports:Sport[],verified:boolean,followers:number,seed:number,n:number,skill:number,odds:number,stake:number,span=120,live=true):Creator=>({id,name,bio,joined,sports,verified,followers,following:40+seed%90,x:seed%2==0,seed,n,skill,odds,stake,span,live})
export const CREATORS:Creator[]=[
C('tidewatch','TideWatch','Late-goal hunter. Reads set pieces before the odds do.','Jan 2026',['Football'],true,12400,11,150,.95,1.9,20),
C('northbank','NorthBank','Season ticket holder, small stakes, long memory.','Feb 2026',['Football','Tennis'],false,860,23,120,1.04,1.9,10),
C('kelpkid','KelpKid','Goals and underdogs. High variance, no apologies.','Feb 2026',['Football'],false,402,35,140,1.02,3.2,8),
C('deepcurrent','DeepCurrent','Pressing stats, xG notes, no hot takes.','Dec 2025',['Football','Basketball'],true,2100,47,190,1.08,2.1,15),
C('ripplefc','RippleFC','European nights, one market at a time.','Mar 2026',['Football'],true,3100,59,140,1.05,2.0,12),
C('courtvision','CourtVision','Totals and spreads. Basketball first.','Jan 2026',['Basketball'],true,1500,61,130,1.06,1.95,12),
C('baselinebet','BaselineBet','Tennis nerd. Surface and fatigue.','Apr 2026',['Tennis'],false,540,73,110,1.02,2.0,8),
C('gridirongus','GridironGus','Sundays only.','Mar 2026',['American Football'],false,980,85,90,1.05,1.95,14),
C('newwave','NewWave','New here, sharp early.','Oct 2026',['Football'],false,95,97,28,1.2,2.2,10,30),
C('lucky1','Lucky1','Six bets, six hits. Too early to say anything.','Nov 2026',['Football'],false,2800,109,6,1.6,2.0,10,4),
C('shortpriceshaun','ShortPriceShaun','Banker bets only.','Jan 2026',['Football','Tennis'],false,1700,121,150,1.0,1.5,30),
C('volumevera','VolumeVera','Many bets, small edges.','Feb 2026',['Football','Basketball','Tennis'],false,430,133,300,.99,2.0,5),
C('you','You','Your HOUSEBETS profile, built from your own demo bets.','Nov 2026',['Football'],false,0,0,0,1,2,10)]
const MK:Record<Sport,string[]>={Football:['Match result','Total goals','Both teams to score','Double chance'],Basketball:['Moneyline','Total points','Spread'],Tennis:['Match winner','Total games'],'American Football':['Moneyline','Spread','Total points']}
const PAIRS:Record<Sport,[string,string][]>={Football:fixtures.map(f=>[teams[f.h].short,teams[f.a].short] as [string,string]),Basketball:[['Lakers','Celtics'],['Nuggets','Bucks'],['Warriors','Suns'],['Knicks','Heat']],Tennis:[['R. Almeida','K. Novak'],['T. Lund','M. Costa'],['S. Idris','J. Weber']],'American Football':[['Chiefs','Bills'],['Eagles','Cowboys'],['49ers','Lions']]}
export const pnl=(p:Pred)=>p.pnl??(p.status=='won'?p.stake*(p.odds-1):p.status=='lost'?-p.stake:0)
function gen(c:Creator):Pred[]{let s=c.seed;const r=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},out:Pred[]=[]
for(let i=0;i<c.n;i++){const sp=c.sports[Math.floor(r()*c.sports.length)],mkt=MK[sp][Math.floor(r()*MK[sp].length)],pr=PAIRS[sp][Math.floor(r()*PAIRS[sp].length)],odds=Math.min(7,Math.max(1.2,+(c.odds*(.65+.8*r())).toFixed(2))),ts=NOW-(c.n-i)/c.n*c.span*DAY,tot=mkt.includes('Total'),pick=r()<.5?0:1
const sel=tot?(pick?'Under':'Over')+' '+(sp=='Football'?'2.5':'48.5'):mkt=='Both teams to score'?(pick?'No':'Yes'):mkt=='Double chance'?pr[0]+' or Draw':mkt=='Spread'?pr[pick]+(pick?' +3.5':' -3.5'):pr[pick]
const v=r(),w=r()<Math.min(.92,1/odds*c.skill),st:PStatus=v<.03?'void':v<.04?'cancelled':w?'won':'lost',u=r(),src:Src=u<.72?'verified':u<.92?'published':'external'
out.push({id:`${c.id}-${i}`,uid:c.id,sport:sp,event:pr[0]+' v '+pr[1],market:mkt,sel,odds,ts,stake:Math.max(1,Math.round(c.stake*(.6+.8*r()))),disclosed:r()<.7,status:st,src})}
if(c.live&&c.n>20)for(let k=0;k<3;k++){const f=fixtures[(c.seed+k*3)%fixtures.length],i=(c.seed+k)%3,p=out[out.length-1-k];Object.assign(p,{sport:'Football',status:'open',fid:f.id,selId:`${f.id}|mr.${i}`,event:teams[f.h].short+' v '+teams[f.a].short,market:'Match result',sel:[teams[f.h].short,'Draw',teams[f.a].short][i],odds:f.o[i],ts:NOW-(k+.2)*3.6e6*5,src:'verified'})}
return out}
let seeded:Record<string,Pred[]>|null=null
export const youPreds=(bets:Bet[]):Pred[]=>bets.map(b=>{const f=fixtures.find(x=>x.id==b.fid)!,pn=b.ret!=null&&(b.st=='cashed')?b.ret-b.stake:undefined;return{id:b.ref,uid:'you',sport:'Football' as Sport,event:teams[f.h].short+' v '+teams[f.a].short,fid:b.fid,market:b.market,sel:b.label,odds:b.odds,ts:b.ts,stake:b.stake,disclosed:true,src:'verified' as Src,pnl:pn,status:(b.st=='open'?'open':b.st=='won'?'won':b.st=='lost'?'lost':b.st=='cashed'?((pn??0)>0?'won':'lost'):b.st=='refunded'?'void':'cancelled') as PStatus}})
export function usePreds(){const bets=useBook(s=>s.bets);return useMemo((): Record<string,Pred[]>=>{if(!seeded){seeded={};CREATORS.forEach(c=>{if(c.id!='you')seeded![c.id]=gen(c)})}return{...seeded,you:youPreds(bets)}},[bets])}
const W=(w:number,n:number)=>{if(!n)return 0;const p=w/n,z=1.96;return(p+z*z/(2*n)-z*Math.sqrt((p*(1-p)+z*z/(4*n))/n))/(1+z*z/n)}
export function stats(ps:Pred[]){const st=ps.filter(p=>p.status=='won'||p.status=='lost').sort((a,b)=>a.ts-b.ts),bySport:Record<string,{n:number;pnl:number;staked:number}>={},byMarket:Record<string,{n:number;pnl:number;staked:number}>={},byMonth:Record<string,{n:number;pnl:number}>={},wk:Record<number,{n:number;pnl:number}>={}
let staked=0,pn=0,so=0,won=0,run=0,best=0,long=0
const add=(m:Record<string,{n:number;pnl:number;staked:number}>,k:string,v:number,s:number)=>{const e=m[k]??={n:0,pnl:0,staked:0};e.n++;e.pnl+=v;e.staked+=s}
for(const p of st){const v=pnl(p);staked+=p.stake;pn+=v;so+=p.odds;if(p.odds>=2.5)long++;if(p.status=='won'){won++;run++;best=Math.max(best,run)}else run=0
add(bySport,p.sport,v,p.stake);add(byMarket,p.market,v,p.stake);const d=new Date(p.ts),mk=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),e=byMonth[mk]??={n:0,pnl:0};e.n++;e.pnl+=v;const w=Math.floor((p.ts-NOW)/(7*DAY)),x=wk[w]??={n:0,pnl:0};x.n++;x.pnl+=v}
const n=st.length,avgStake=n?staked/n:0,wks=Object.values(wk).filter(x=>x.n>=3),l10=st.slice(-10),f10=l10.reduce((a,p)=>a+p.stake,0)
let cur=0;for(let i=st.length-1;i>=0;i--){const w=st[i].status=='won';if(!cur)cur=w?1:-1;else if((cur>0)==w)cur+=w?1:-1;else break}
const bs=Object.entries(bySport).sort((a,b)=>b[1].pnl-a[1].pnl)[0]
return{n:ps.length,settled:n,won,lost:n-won,open:ps.filter(p=>p.status=='open').length,void:ps.filter(p=>p.status=='void').length,cancelled:ps.filter(p=>p.status=='cancelled').length,staked,pnl:pn,roi:staked?pn/staked:0,adjRoi:pn/(staked+30*avgStake||1),winRate:n?won/n:0,wilson:W(won,n),avgOdds:n?so/n:0,avgStake,streak:cur,bestStreak:best,bestSport:bs?.[0],bySport,byMarket,byMonth,cons:wks.length?wks.filter(x=>x.pnl>0).length/wks.length:0,consN:wks.length,longShare:n?long/n:0,form:l10.map(p=>p.status=='won'?'W':'L'),formRoi:f10?l10.reduce((a,p)=>a+pnl(p),0)/f10:0,first:st[0]?.ts??NOW,last:st[n-1]?.ts??0}}
export type St=ReturnType<typeof stats>
export type Cat='profit'|'roi'|'win'|'consistent'|'volume'|'streak'
export const LEN={all:1e4,month:30,week:7,day:1},MIN={all:20,month:8,week:3,day:1}
const score=(s:St,c:Cat)=>c=='profit'?s.pnl:c=='roi'?s.adjRoi:c=='win'?s.wilson:c=='consistent'?s.cons*100+s.adjRoi*100:c=='volume'?s.settled:s.bestStreak
export type Row={c:Creator;s:St;score:number;rank?:number;mv?:number|null}
function rk(preds:Record<string,Pred[]>,o:{period:keyof typeof LEN;cat:Cat;sport?:Sport},shift:number):Row[]{const end=shift?NOW-shift*DAY:Infinity,start=NOW-shift*DAY-LEN[o.period]*DAY
const rows=CREATORS.map(c=>{const s=stats((preds[c.id]??[]).filter(p=>p.src=='verified'&&p.ts<=end&&p.ts>start&&(!o.sport||p.sport==o.sport)));return{c,s,score:score(s,o.cat)}}).filter(r=>r.s.settled>0)
const q=rows.filter(r=>r.s.settled>=MIN[o.period]).sort((a,b)=>b.score-a.score||b.s.settled-a.s.settled).map((r,i)=>({...r,rank:i+1})),pv=rows.filter(r=>r.s.settled<MIN[o.period]).sort((a,b)=>b.s.settled-a.s.settled);return[...q,...pv]}
export function rank(preds:Record<string,Pred[]>,o:{period:keyof typeof LEN;cat:Cat;sport?:Sport}):Row[]{const now=rk(preds,o,0),prev=new Map(rk(preds,o,7).map(r=>[r.c.id,r.rank]));return now.map(r=>({...r,mv:r.rank&&prev.get(r.c.id)?prev.get(r.c.id)!-r.rank:null}))}
export function dna(s:St){const t:{k:string;why:string}[]=[];if(s.settled<20)return[{k:'Developing profile',why:`Only ${s.settled} settled bets. We classify after 20.`}]
const ts=Object.entries(s.bySport).sort((a,b)=>b[1].n-a[1].n)[0],sh=ts[1].n/s.settled,wk=Math.max(1,(s.last-s.first)/(7*DAY))
if(sh>=.6)t.push({k:ts[0]+' specialist',why:`${Math.round(sh*100)}% of settled bets are ${ts[0]}`});if(s.longShare>=.4)t.push({k:'Underdog specialist',why:`${Math.round(s.longShare*100)}% of bets at odds of 2.50 or more`})
if(s.avgOdds<1.8)t.push({k:'Short-price banker',why:`Average odds ${s.avgOdds.toFixed(2)}`});if(s.settled/wk>=6)t.push({k:'High-volume bettor',why:`${(s.settled/wk).toFixed(1)} settled bets per week`})
if(s.adjRoi>.02&&s.winRate<.5)t.push({k:'Value-focused',why:`Profitable with a ${Math.round(s.winRate*100)}% win rate`});if(s.consN>=4&&s.cons>=.6)t.push({k:'Consistent performer',why:`${Math.round(s.cons*100)}% of active weeks were profitable`})
return t.length?t.slice(0,4):[{k:'Balanced all-rounder',why:'No single trait dominates this record'}]}
export function milestones(s:St,weekRank?:number){return[{k:'100 settled predictions',ok:s.settled>=100,d:`${s.settled}/100`},{k:'First positive month',ok:Object.values(s.byMonth).some(m=>m.n>=3&&m.pnl>0),d:'A month with 3+ bets in profit'},{k:'10 wins in a row',ok:s.bestStreak>=10,d:`Best run ${s.bestStreak}`},{k:'Top 3 this week',ok:!!weekRank&&weekRank<=3,d:weekRank?`Weekly rank ${weekRank}`:'Not ranked this week'},{k:'Football specialist',ok:(s.bySport.Football?.n??0)>=50&&(s.bySport.Football?.pnl??0)>0,d:'50+ football bets in profit'}]}
export function series(ps:Pred[],g:string){const st=ps.filter(p=>p.status=='won'||p.status=='lost').sort((a,b)=>a.ts-b.ts),lab=(t:number)=>new Date(t).toLocaleDateString('en',{month:'short',day:'numeric'});let c=0
if(g=='All-time')return st.map(p=>({l:lab(p.ts),v:(c+=pnl(p))}));const sz=g=='Daily'?DAY:g=='Weekly'?7*DAY:30*DAY,m=new Map<number,number>();st.forEach(p=>{const k=Math.floor((p.ts-NOW)/sz);m.set(k,(m.get(k)??0)+pnl(p))})
const ks=[...m.keys()].sort((a,b)=>a-b).slice(g=='Daily'?-30:g=='Weekly'?-16:-12);return ks.map(k=>({l:lab(NOW+k*sz),v:(c+=m.get(k)!)}))}
export const sgn=(n:number,d=2)=>(n>0?'+':'')+n.toFixed(d),pct=(n:number)=>sgn(n*100,1)+'%',tn=(n:number)=>n>0?'text-ok':n<0?'text-live':'text-mute'
