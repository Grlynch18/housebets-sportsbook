'use client'
import Image from 'next/image';import {useState} from 'react';import {Trophy} from 'lucide-react';import {CODE} from '@/lib/data'
export function CompEmblem({c,size=20}:{c:string;size?:number}){const [bad,setBad]=useState(false);return bad?<Trophy size={size} className="text-mute"/>:<Image src={`https://crests.football-data.org/${CODE[c]}.png`} alt={c} width={size} height={size} style={{width:size,height:size}} className="object-contain" onError={()=>setBad(true)}/>}
