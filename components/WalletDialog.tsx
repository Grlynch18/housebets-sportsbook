'use client'
import * as Dialog from '@radix-ui/react-dialog';import {X} from 'lucide-react';import {WalletPanel} from './WalletPanel'
export function WalletDialog({open,onClose}:{open:boolean;onClose:()=>void}){return <Dialog.Root open={open} onOpenChange={o=>!o&&onClose()}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-abyss/60 backdrop-blur-sm"/>
<Dialog.Content className="glass-strong fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[min(620px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg p-5 outline-none noscroll"><div className="flex items-center justify-between"><Dialog.Title className="text-base font-semibold">Wallet</Dialog.Title><Dialog.Close aria-label="Close" className="text-mute hover:text-white"><X size={18}/></Dialog.Close></div>
<Dialog.Description className="mt-1 text-xs text-mute">Demo funds in USDT. No real money is held, deposited or withdrawn.</Dialog.Description><WalletPanel/></Dialog.Content></Dialog.Portal></Dialog.Root>}
