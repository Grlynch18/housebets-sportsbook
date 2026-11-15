'use client'
import Image from 'next/image';import {useCallback,useState} from 'react';import {Shield} from 'lucide-react';import {teams} from '@/lib/data'
export function Crest({k,size=20}:{k:string;size?:number}){const [bad,setBad]=useState(false),t=teams[k]
const ref=useCallback((img:HTMLImageElement|null)=>{if(img&&img.complete&&img.naturalWidth===0)setBad(true)},[])
return bad?<Shield size={size} className="shrink-0 text-mute" aria-label={t.name}/>:<Image ref={ref} src={`https://crests.football-data.org/${t.id}.png`} alt={t.name} width={size} height={size} className="shrink-0 object-contain" style={{width:size,height:size}} onError={()=>setBad(true)}/>}
