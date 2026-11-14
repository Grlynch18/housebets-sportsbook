import {fixtures} from '@/lib/data';import {MatchView} from '@/components/MatchView'
export const generateStaticParams=()=>fixtures.map(f=>({id:f.id}))
export default function P({params}:{params:{id:string}}){return <MatchView id={params.id}/>}
