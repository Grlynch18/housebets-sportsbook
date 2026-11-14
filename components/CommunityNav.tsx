'use client'
import Link from 'next/link';import {usePathname} from 'next/navigation'
const T=[['/community','Feed'],['/creators','Creators'],['/leaderboard','Leaderboard'],['/challenges','Challenges']]
export function CommunityNav(){const p=usePathname();return <div className="noscroll mb-4 flex gap-1 overflow-x-auto border-b border-white/[.06]">{T.map(([h,l])=><Link key={h} href={h} className={`shrink-0 border-b-2 px-3 py-2.5 text-sm ${p.startsWith(h)?'border-aqua text-white':'border-transparent text-mute hover:text-white'}`}>{l}</Link>)}</div>}
