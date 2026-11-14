import './globals.css';import {GeistSans} from 'geist/font/sans';import {Shell} from '@/components/Shell'
export const metadata={title:'Housebets'}
export default function L({children}:{children:React.ReactNode}){return <html lang="en" className={GeistSans.variable}><body className="font-sans"><Shell>{children}</Shell></body></html>}
