import {Volleyball,Swords} from 'lucide-react'
export type SportId='football'|'basketball'|'tennis'|'volleyball'|'mma'
export const SPORT_NAV:{id:SportId;name:string;live:boolean}[]=[{id:'football',name:'Football',live:true},{id:'basketball',name:'Basketball',live:false},{id:'tennis',name:'Tennis',live:false},{id:'volleyball',name:'Volleyball',live:false},{id:'mma',name:'MMA',live:false}]
const P={strokeWidth:1.6,fill:'none',stroke:'currentColor',strokeLinecap:'round' as const,strokeLinejoin:'round' as const,viewBox:'0 0 24 24'}
export function SportIcon({s,size=18,className=''}:{s:SportId;size?:number;className?:string}){const c={width:size,height:size,className,...P}
if(s=='football')return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="M12 8.2l3.4 2.5-1.3 4H9.9l-1.3-4z"/><path d="M12 8.2V3.3M15.4 10.7l4.6-1.5M14.1 14.7l2.9 3.9M9.9 14.7L7 18.6M8.6 10.7L4 9.2"/></svg>
if(s=='basketball')return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3 2.5 3 10.3 0 12.8M18.4 5.6c-3 2.5-3 10.3 0 12.8"/></svg>
if(s=='tennis')return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="M5.2 5.2c3.5 3.5 3.5 10.1 0 13.6M18.8 5.2c-3.5 3.5-3.5 10.1 0 13.6"/></svg>
if(s=='volleyball')return <Volleyball size={size} strokeWidth={1.6} className={className}/>
return <Swords size={size} strokeWidth={1.6} className={className}/>}
