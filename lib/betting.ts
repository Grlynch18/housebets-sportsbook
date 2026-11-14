/* Betting calculations kept out of the UI.
   LEDGER: every wallet movement is a Tx with a unique key (`<bet ref>:<stake|win|refund|cashout>`). addTx refuses a key it has seen,
   so a bet can never be paid twice (also across refreshes, because the ledger is persisted). Balance = last ledger balance.
   CASHOUT MODEL: potential = stake x original odds. p_now is implied by the live price, which already encodes the score, the red cards,
   the minute and the time remaining (engine.probs). offer = potential x (1 / current odds) x 0.93 (7% house margin), capped at 97% of potential.
   If odds shorten (selection is winning) the offer rises toward potential; if they drift the offer falls below the stake.
   Unavailable when: not live yet, market suspended, market closed or match over, bet not open, or offer < 0.01. */
export type Status='open'|'won'|'lost'|'cashed'|'cancelled'|'refunded'
export type Bet={ref:string;fid:string;sel?:string;market:string;label:string;odds:number;stake:number;st:Status;ts:number;ret?:number}
export type TxType='deposit'|'stake'|'win'|'refund'|'cashout'
export type Tx={id:string;ts:number;type:TxType;ref?:string;amount:number;bal:number}
export const r2=(n:number)=>Math.round(n*100)/100
export const CASHOUT_MARGIN=.93
export function addTx(led:Tx[],key:string,type:TxType,ref:string|undefined,amount:number,ts:number):Tx[]|null{if(led.some(t=>t.id==key))return null
const bal=r2((led.length?led[led.length-1].bal:0)+amount);return[...led,{id:key,ts,type,ref,amount:r2(amount),bal}]}
export type CashCtx={live:boolean;finished:boolean;suspended:boolean;oddsNow:number}
export function cashOffer(b:Bet,c:CashCtx):{ok:boolean;value:number;reason?:string}{if(b.st!='open')return{ok:false,value:0,reason:'Bet is not open'}
if(c.finished)return{ok:false,value:0,reason:'Match has finished'};if(!c.live)return{ok:false,value:0,reason:'Opens at kick-off'};if(c.suspended)return{ok:false,value:0,reason:'Market suspended'}
const pot=b.stake*b.odds,v=r2(Math.min(pot*.97,pot*(1/c.oddsNow)*CASHOUT_MARGIN));return v<.01?{ok:false,value:0,reason:'Offer too low'}:{ok:true,value:v}}
