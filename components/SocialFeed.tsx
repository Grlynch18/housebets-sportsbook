'use client'
import {useState} from 'react';import {PenSquare} from 'lucide-react';import {useBook} from '@/lib/store';import {fixtures} from '@/lib/data';import {ThesisCard} from './ThesisCard'
const eng=(p:{likes:number;rp:number;cm:string[]})=>p.likes+p.rp*2+p.cm.length*3
export function SocialFeed({fid,limit}:{fid?:string;limit?:number}){const b=useBook(),[t,setT]=useState('For You'),[sort,setSort]=useState('Latest'),[ft,setFt]=useState('All'),[comp,setComp]=useState('All');let ps=b.posts.filter(p=>!fid||p.fid==fid)
const f=(p:typeof ps[0])=>fixtures.find(x=>x.id==p.fid)!
if(t=='Following')ps=ps.filter(p=>b.fing[p.user]||p.user=='You');if(t=='Live')ps=ps.filter(p=>b.info(f(p)).live)
if(ft=='Theses')ps=ps.filter(p=>p.kind=='thesis');if(ft=='Open bets')ps=ps.filter(p=>(p.kind=='bet')&&p.st=='open');if(ft=='Settled')ps=ps.filter(p=>p.kind=='settled'||p.kind=='highlight')
if(comp!='All')ps=ps.filter(p=>f(p).comp==comp)
if(t=='Trending'||sort=='Trending')ps=[...ps].sort((a,c)=>eng(c)-eng(a));if(sort=='Most discussed')ps=[...ps].sort((a,c)=>c.cm.length-a.cm.length||eng(c)-eng(a))
if(limit)ps=ps.slice(0,limit)
return <div><div className="mb-3 flex items-center gap-3 border-b border-white/[.08]"><div className="noscroll flex min-w-0 flex-1 gap-5 overflow-x-auto">{['For You','Following','Trending','Live'].map(x=><button key={x} onClick={()=>setT(x)} className={`-mb-px border-b-2 py-2.5 text-[13px] ${t==x?'border-aqua text-white':'border-transparent text-mute hover:text-white'}`}>{x}</button>)}</div>
<button onClick={()=>b.openComposer(fid?{fid}:undefined)} className="ml-auto mb-1 flex h-8 shrink-0 items-center gap-1.5 rounded bg-aqua px-3 text-xs font-semibold text-abyss"><PenSquare size={13}/><span className="hidden sm:inline">Create thesis</span><span className="sm:hidden">Create</span></button></div>
{!limit&&<div className="noscroll mb-3 flex gap-2 overflow-x-auto">{['All','Theses','Open bets','Settled'].map(x=><button key={x} onClick={()=>setFt(x)} className={`shrink-0 rounded px-2.5 py-1 text-xs ${ft==x?'bg-white/[.1] text-white':'text-mute hover:text-white'}`}>{x}</button>)}
<select aria-label="Sort" value={sort} onChange={e=>setSort(e.target.value)} className="h-7 shrink-0 rounded-md border border-white/10 bg-dark px-2 text-xs">{['Latest','Trending','Most discussed'].map(x=><option key={x}>{x}</option>)}</select>
<select aria-label="Competition" value={comp} onChange={e=>setComp(e.target.value)} className="h-7 shrink-0 rounded-md border border-white/10 bg-dark px-2 text-xs">{['All','Premier League','Champions League','LaLiga','Serie A','Bundesliga'].map(x=><option key={x}>{x}</option>)}</select></div>}
<div>{ps.length?ps.map(p=><ThesisCard key={p.id} p={p}/>):<div className="py-12 text-center text-sm text-mute">{t=='Following'?'Follow bettors to fill this feed.':t=='Live'?'No live predictions right now.':'Nothing matches these filters.'}</div>}</div></div>}
