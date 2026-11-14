'use client'
import {Fixture} from '@/lib/data';import {CommunityPulse} from './CommunityPulse';import {SocialFeed} from './SocialFeed'
export function MatchSocial({f}:{f:Fixture}){return <section className="mt-6"><h2 className="mb-2 text-[15px] font-semibold">Community on this match</h2><CommunityPulse fid={f.id}/><div className="mt-3"><SocialFeed fid={f.id}/></div></section>}
