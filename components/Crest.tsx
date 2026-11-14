'use client'
import Image from 'next/image';import {useState} from 'react';import {Shield} from 'lucide-react';import {teams} from '@/lib/data'
export function Crest({k,size=20}:{k:string;size?:number}){const [bad,setBad]=useState(false);const t=teams[k]
return bad?<Shield size={size} className="text-mute shrink-0" aria-label={t.name}/>:<Image src={`https://crests.football-data.org/${t.id}.png`} alt={t.name} width={size} height={size} className="shrink-0 object-contain" style={{width:size,height:size}} onError={()=>setBad(true)}/>}
