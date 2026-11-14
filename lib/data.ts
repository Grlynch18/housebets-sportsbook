export type Team={id:number;name:string;short:string;comp:string}
export const teams:Record<string,Team>={
ars:{id:57,name:'Arsenal',short:'Arsenal',comp:'Premier League'},bha:{id:397,name:'Brighton & Hove Albion',short:'Brighton',comp:'Premier League'},
liv:{id:64,name:'Liverpool',short:'Liverpool',comp:'Premier League'},mun:{id:66,name:'Manchester United',short:'Man Utd',comp:'Premier League'},
avl:{id:58,name:'Aston Villa',short:'Aston Villa',comp:'Premier League'},ful:{id:63,name:'Fulham',short:'Fulham',comp:'Premier League'},
new:{id:67,name:'Newcastle United',short:'Newcastle',comp:'Premier League'},eve:{id:62,name:'Everton',short:'Everton',comp:'Premier League'},
mci:{id:65,name:'Manchester City',short:'Man City',comp:'Premier League'},tot:{id:73,name:'Tottenham Hotspur',short:'Spurs',comp:'Premier League'},
bar:{id:81,name:'Barcelona',short:'Barcelona',comp:'Champions League'},psg:{id:524,name:'Paris Saint-Germain',short:'PSG',comp:'Champions League'},lev:{id:3,name:'Bayer Leverkusen',short:'Leverkusen',comp:'Bundesliga'},bvb:{id:4,name:'Borussia Dortmund',short:'Dortmund',comp:'Bundesliga'},rma:{id:86,name:'Real Madrid',short:'Real Madrid',comp:'Champions League'},bay:{id:5,name:'Bayern Munich',short:'Bayern',comp:'Champions League'},
int:{id:108,name:'Inter',short:'Inter',comp:'Champions League'},atm:{id:78,name:'Atletico Madrid',short:'Atletico',comp:'LaLiga'},
sev:{id:559,name:'Sevilla',short:'Sevilla',comp:'LaLiga'},juv:{id:109,name:'Juventus',short:'Juventus',comp:'Serie A'},rom:{id:100,name:'Roma',short:'Roma',comp:'Serie A'},
nap:{id:113,name:'Napoli',short:'Napoli',comp:'Serie A'},mil:{id:98,name:'AC Milan',short:'Milan',comp:'Serie A'}}
export type Fixture={id:string;comp:string;h:string;a:string;live?:number|'HT';sc?:[number,number];t?:string;o:[number,number,number];sus?:boolean;n:number}
export const fixtures:Fixture[]=[
{id:'arsbha',comp:'Premier League',h:'ars',a:'bha',t:'Today 15:00',live:52,sc:[1,0],o:[1.3,4.6,11],n:85},
{id:'avlful',t:'Today 15:00',comp:'Premier League',h:'avl',a:'ful',live:'HT',sc:[0,0],o:[2.25,2.9,3.6],n:7},
{id:'neweve',t:'Today 15:00',comp:'Premier League',h:'new',a:'eve',live:58,sc:[2,1],o:[1.45,4.5,6.5],sus:true,n:6},
{id:'atmsev',t:'Today 15:00',comp:'LaLiga',h:'atm',a:'sev',live:37,sc:[1,0],o:[1.8,3.4,4.5],sus:true,n:8},
{id:'juvrom',t:'Today 15:00',comp:'Serie A',h:'juv',a:'rom',live:49,sc:[1,1],o:[2.4,3.1,3.2],n:6},
{id:'munliv',comp:'Premier League',h:'liv',a:'mun',t:'Sun 16:30',o:[1.65,4,4.33],n:10},
{id:'mcitot',comp:'Premier League',h:'mci',a:'tot',t:'Sun 14:00',o:[1.5,4.5,5.25],n:9},
{id:'arsint',comp:'Champions League',h:'ars',a:'int',t:'Tue 20:00',o:[1.95,3.5,4],n:8},
{id:'rmabay',comp:'Champions League',h:'rma',a:'bay',t:'Tue 20:00',o:[2.2,3.7,2.9],n:9},
{id:'napmil',comp:'Serie A',h:'nap',a:'mil',t:'Sun 17:00',o:[2.6,3.2,2.7],n:7},
{id:'barpsg',comp:'Champions League',h:'bar',a:'psg',t:'Wed 20:00',o:[2.05,3.8,3.3],n:9},
{id:'levbvb',comp:'Bundesliga',h:'lev',a:'bvb',t:'Today 17:30',live:61,sc:[2,2],o:[2.9,3.6,2.4],n:7}]
export const COMPS=['Premier League','Champions League','LaLiga','Serie A','Bundesliga']
export const CODE:Record<string,string>={'Premier League':'PL','Champions League':'CL',LaLiga:'PD','Serie A':'SA',Bundesliga:'BL1'}
export type Sel={id:string;label:string;odds:number};export type Group={id:string;title:string;sels:Sel[]}
export const TABS=['Overview','Popular','Goals','Halves','Handicaps','Goalscorers','Corners & Cards']
export function markets(f:Fixture):Record<string,Group[]>{const H=teams[f.h].short,A=teams[f.a].short,[o1,ox,o2]=f.o,dc=(x:number,y:number)=>Math.max(1.01,+(.99/(1/x+1/y)).toFixed(2))
const g=(id:string,title:string,s:[string,number][]):Group=>({id,title,sels:s.map(([label,odds],i)=>({id:id+'.'+i,label,odds}))})
const mr=g('mr','Match result',[[H,o1],['Draw',ox],[A,o2]]),dcg=g('dc','Double chance',[[H+' or Draw',dc(o1,ox)],[H+' or '+A,dc(o1,o2)],['Draw or '+A,dc(ox,o2)]])
const tg=g('tg','Total goals',[['Over 0.5',1.06],['Under 0.5',8.5],['Over 1.5',1.35],['Under 1.5',3.1],['Over 2.5',2.73],['Under 2.5',1.44]]),bt=g('btts','Both teams to score',[['Yes',1.85],['No',1.95]])
return{Overview:[mr,tg],Popular:[mr,dcg,tg,bt],Goals:[tg,bt,g('h1g','First-half goals',[['Over 0.5',1.45],['Under 0.5',2.6]])],
Halves:[g('h1','First-half result',[[H,2.4],['Draw',2.1],[A,6.5]]),g('h2','Second-half result',[[H,2.0],['Draw',2.9],[A,5.2]]),g('h1g','First-half goals',[['Over 0.5',1.45],['Under 0.5',2.6]])],
Handicaps:[g('ah1','Handicap -1',[[H+' -1',2.3],['Draw -1',3.9],[A+' +1',2.9]]),g('ah2','Asian handicap -0.5',[[H+' -0.5',o1],[A+' +0.5',dc(ox,o2)]])],
Goalscorers:[g('ags','Anytime goalscorer',[['L. Brandt ('+H+')',2.1],['M. Varga ('+H+')',2.8],['K. Osei ('+A+')',3.2],['T. Lindqvist ('+A+')',4.4]]),g('fgs','First goalscorer',[['L. Brandt ('+H+')',5.5],['K. Osei ('+A+')',7],['No goalscorer',9]])],
'Corners & Cards':[g('co','Total corners 9.5',[['Over 9.5',1.9],['Under 9.5',1.9]]),g('cd','Total cards 3.5',[['Over 3.5',1.75],['Under 3.5',2.05]])]}}
