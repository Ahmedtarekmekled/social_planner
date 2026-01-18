"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Instagram, Facebook, Twitter, Send, Plus, Loader2, FileText, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { usePost } from "@/components/providers/post-provider"

export function Sidebar() {
  const { accounts, selectedAccountIds, toggleAccount, isLoadingAccounts, ghlContext } = usePost()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddAccount = () => {
     setIsDialogOpen(false)
     
     // IMPORTANT for GHL iFrame: Must open authentication in a NEW WINDOW
     // Otherwise X-Frame-Options of the provider (FB, Google, etc) will block it
     const width = 600
     const height = 700
     const left = window.screen.width / 2 - width / 2
     const top = window.screen.height / 2 - height / 2
     
     // In a real app, this should point to your backend OAuth initiation endpoint
     // window.open('/api/auth/publer', 'Connect Account', `width=${width},height=${height},top=${top},left=${left}`)
     
     // For now, we simulate the Publer connection flow
     window.open('https://publer.io', '_blank', `width=${width},height=${height},top=${top},left=${left}`)
  }

  const getPlatformIcon = (type: string) => {
      const t = type.toLowerCase()
      const iconSize = 20
      const iconClass = "absolute bottom-0 right-0 bg-background rounded-full p-0.5 border-2 border-background"
      
      if (t.includes('instagram') || t.includes('gram')) {
        return <Instagram size={iconSize} className={`${iconClass} text-pink-500`} />
      }
      if (t.includes('facebook') || t.includes('face')) {
        return <Facebook size={iconSize} className={`${iconClass} text-blue-600`} />
      }
      if (t.includes('twitter') || t.includes('x')) {
        return <Twitter size={iconSize} className={`${iconClass} text-sky-500`} />
      }
      if (t.includes('telegram') || t.includes('tele')) {
        return <Send size={iconSize} className={`${iconClass} text-blue-400`} />
      }
      return null
  }

  return (
    <aside className="w-[280px] border-r flex flex-col h-full bg-muted/10">
      <div className="p-6 border-b">
        <h2 className="font-semibold text-lg tracking-tight">Connected Accounts</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {isLoadingAccounts ? (
             <div className="flex items-center justify-center p-8 text-muted-foreground">
                 <Loader2 className="animate-spin mr-2" /> Loading...
             </div>
          ) : accounts.length === 0 ? (
             <div className="text-center p-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                 No accounts found. Add one below.
             </div>
          ) : (
            accounts.map(account => {
             const isActive = selectedAccountIds.includes(account.id)
             return (
               <div 
                  key={account.id} 
                  onClick={() => toggleAccount(account.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${isActive ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/50 border-transparent'}`}
               >
                  <div className="relative">
                    <Avatar className={`h-10 w-10 ${isActive ? 'border-2 border-primary/20' : ''}`}>
                      <AvatarImage src={account.picture} />
                      <AvatarFallback className={isActive ? "bg-primary/20 text-primary font-bold" : ""}>{account.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {getPlatformIcon(account.type)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`font-medium text-sm truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{account.name}</span>
                    <span className="text-[10px] capitalize text-muted-foreground">{account.type}</span>
                  </div>
               </div>
             )
            })
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/10 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/drafts">
            <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-foreground">
              <FileText size={16} /> Drafts
            </Button>
          </Link>
          <Link href="/timeline">
            <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-foreground">
              <Clock size={16} /> Timeline
            </Button>
          </Link>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-dashed border-muted-foreground/40 hover:border-muted-foreground text-muted-foreground">
                    <Plus size={16} /> Add Account
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connect Social Account</DialogTitle>
                    <DialogDescription>
                        Integrate Publer to connect your accounts.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 text-center space-y-4">
                     <p className="text-sm text-muted-foreground">
                         To add or remove accounts, please manage them in your Publer Dashboard.
                         <br/><br/>
                         Once added there, refresh this page to see them here.
                     </p>
                     <Button className="w-full" onClick={handleAddAccount}>
                        Open Publer Dashboard
                     </Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </aside>
  )
}
