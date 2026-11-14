'use client'
import {useBook} from '@/lib/store';import {fixtures,teams} from '@/lib/data'
export function CommunityPulse({fid}:{fid:string}){const {posts}=useBook(),f=fixtures.find(x=>x.id==fid)!,c=[0,0,0]
posts.forEach(p=>{if(p.sel?.startsWith(fid+'|mr.'))c[+p.sel.split('.')[1]]++});const n=c[0]+c[1]+c[2],L=[teams[f.h].short,'Draw',teams[f.a].short],pc=c.map(v=>n?Math.round(v/n*100):0)
return <div><div className="mb-2 flex items-baseline justify-between"><span className="label">Community pulse</span><span className="text-[11px] text-mute">{n} demo picks</span></div>
{n?<><div className="flex h-1.5 gap-0.5">{pc.map((v,i)=><div key={i} style={{width:v+'%'}} className={`rounded-sm ${['bg-aqua','bg-white/40','bg-white/15'][i]}`}/>)}</div><div className="num mt-2 flex justify-between text-xs">{L.map((l,i)=><span key={l}><b>{pc[i]}%</b> <span className="text-mute">{l}</span></span>)}</div></>:<p className="text-xs text-mute">No picks yet. Publish a thesis to start the pulse.</p>}</div>}
