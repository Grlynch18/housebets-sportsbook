'use client'
import {useRef} from 'react';import {ChevronLeft,ChevronRight} from 'lucide-react'
export function Carousel({children}:{children:React.ReactNode}){const r=useRef<HTMLDivElement>(null),d=useRef({down:false,x:0,l:0,moved:false})
const go=(n:number)=>r.current?.scrollBy({left:n,behavior:'smooth'})
return <div className="group relative"><div ref={r} className="noscroll flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth active:cursor-grabbing"
onPointerDown={e=>{if(e.pointerType!='mouse')return;d.current={down:true,x:e.clientX,l:r.current!.scrollLeft,moved:false};r.current!.style.scrollSnapType='none';r.current!.style.scrollBehavior='auto'}}
onPointerMove={e=>{if(!d.current.down)return;const dx=e.clientX-d.current.x;if(Math.abs(dx)>5)d.current.moved=true;r.current!.scrollLeft=d.current.l-dx}}
onPointerUp={()=>{d.current.down=false;if(r.current){r.current.style.scrollSnapType='';r.current.style.scrollBehavior=''}}} onPointerLeave={()=>{d.current.down=false}} onClickCapture={e=>{if(d.current.moved){e.preventDefault();e.stopPropagation();d.current.moved=false}}}>{children}</div>
{(['l','r'] as const).map(s=><button key={s} aria-label={s=='l'?'Previous':'Next'} onClick={()=>go(s=='l'?-300:300)} className={`bg-[#0B1920] absolute top-1/2 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 md:grid ${s=='l'?'-left-3':'-right-3'}`}>{s=='l'?<ChevronLeft size={16}/>:<ChevronRight size={16}/>}</button>)}</div>}
