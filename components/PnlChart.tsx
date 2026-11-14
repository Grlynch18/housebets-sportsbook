'use client'
import {useState} from 'react'
export function PnlChart({pts}:{pts:{l:string;v:number}[]}){const [h,setH]=useState<number|null>(null),W=640,H=180,P=10
if(pts.length<2)return <div className="grid h-44 place-items-center text-xs text-mute">Not enough settled bets to chart</div>
const vs=pts.map(p=>p.v),mn=Math.min(0,...vs),mx=Math.max(0,...vs),sx=(i:number)=>P+i*(W-2*P)/(pts.length-1),sy=(v:number)=>H-P-(v-mn)/(mx-mn||1)*(H-2*P),d=pts.map((p,i)=>`${i?'L':'M'}${sx(i).toFixed(1)} ${sy(p.v).toFixed(1)}`).join(' '),up=vs[vs.length-1]>=0,c=up?'#82E0E0':'#E5566D'
return <div className="relative"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative profit and loss" preserveAspectRatio="none" className="h-44 w-full touch-pan-y" onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();setH(Math.max(0,Math.min(pts.length-1,Math.round((e.clientX-r.left)/r.width*(pts.length-1)))))}} onPointerLeave={()=>setH(null)}>
<defs><linearGradient id="pg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".25"/><stop offset="1" stopColor={c} stopOpacity="0"/></linearGradient></defs>
<line x1={P} x2={W-P} y1={sy(0)} y2={sy(0)} stroke="rgba(255,255,255,.14)" strokeDasharray="3 4"/><path d={`${d} L${sx(pts.length-1)} ${H-P} L${P} ${H-P}Z`} fill="url(#pg)"/><path d={d} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
{h!=null&&<line x1={sx(h)} x2={sx(h)} y1={P} y2={H-P} stroke="rgba(255,255,255,.2)" vectorEffect="non-scaling-stroke"/>}</svg>{h!=null&&<i style={{left:sx(h)/W*100+"%",top:sy(pts[h].v)/H*100+"%",background:c}} className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"/>}
{h!=null&&<div className="bg-[#0B1920] num pointer-events-none absolute right-2 top-2 rounded px-2 py-1 text-xs">{pts[h].l} · <b className={pts[h].v>=0?'text-ok':'text-live'}>{pts[h].v>0?'+':''}{pts[h].v.toFixed(2)}</b></div>}</div>}
