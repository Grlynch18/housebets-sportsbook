'use client'
import {useState} from 'react';import {COMPS,fixtures} from '@/lib/data';import {FootballHero} from '@/components/FootballHero';import {CompGroup} from '@/components/CompGroup'
export default function P(){const [c,setC]=useState('All');return <div><FootballHero/><h1 className="mt-4 text-lg font-semibold">Football</h1><div className="noscroll my-3 flex gap-2 overflow-x-auto">{['All',...COMPS].map(x=><button key={x} onClick={()=>setC(x)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs ${c==x?'bg-aqua/15 text-aqua':'bg-white/[.05] text-mute hover:text-white'}`}>{x}</button>)}</div>
{COMPS.filter(x=>c=='All'||c==x).map(x=><CompGroup key={x} c={x} list={fixtures.filter(f=>f.comp==x)}/>)}</div>}
