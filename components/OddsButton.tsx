'use client'
import {Lock} from 'lucide-react';import {motion} from 'framer-motion';import {useBook} from '@/lib/store'
export function OddsButton({id,label,bare}:{id:string;label:string;bare?:boolean}){const b=useBook(),on=b.slip.some(s=>s.id==id),sus=b.sus(id),p=b.price(id),base=b.base(id),mv=p>base?1:p<base?-1:0
return <button disabled={sus} aria-pressed={on} aria-label={`${label} ${p.toFixed(2)}${sus?' suspended':''}`} onClick={()=>b.toggle(id)}
className={`flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded px-2.5 text-xs transition-colors active:scale-[.98] ${bare?'md:justify-center':''} ${on?'bg-aqua text-abyss':'bg-[#122A32] hover:bg-[#183640]'} ${sus?'cursor-not-allowed opacity-40':''}`}>
<span className={`truncate ${on?'':'text-mute'} ${bare?'md:hidden':''}`}>{label}</span>{sus?<Lock size={12}/>:<motion.b key={p} initial={{y:mv>0?5:-5,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.2}} className={`num text-[13px] ${on?'':mv>0?'text-ok':mv<0?'text-live':'text-white'}`}>{p.toFixed(2)}{mv?<i className="ml-0.5 text-[8px] not-italic">{mv>0?'▲':'▼'}</i>:null}</motion.b>}</button>}
