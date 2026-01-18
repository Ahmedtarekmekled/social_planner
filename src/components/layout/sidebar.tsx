"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Instagram, Facebook, Twitter, Send, Plus, Loader2 } from "lucide-react"
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
      if (t.includes('gram')) return <Instagram size={14} className="text-pink-500" />
      if (t.includes('face')) return <Facebook size={14} className="text-blue-600" />
      if (t.includes('twitter') || t.includes('x')) return <Twitter size={14} className="text-sky-500" />
      if (t.includes('tele')) return <Send size={14} className="text-blue-400" />
      return <div className="w-3.5 h-3.5 bg-gray-400 rounded-full" />
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
                  <Avatar className={`h-10 w-10 ${isActive ? 'border-2 border-primary/20' : ''}`}>
                    <AvatarImage src={account.picture} />
                    <AvatarFallback className={isActive ? "bg-primary/20 text-primary font-bold" : ""}>{account.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`font-medium text-sm truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{account.name}</span>
                    <div className="flex gap-1.5 text-muted-foreground mt-1 h-4 items-center">
                       {getPlatformIcon(account.type)}
                       <span className="text-[10px] capitalize">{account.type}</span>
                    </div>
                  </div>
               </div>
             )
            })
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/10">
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
        
        {/* Debug Tool for User */}
        <Dialog>
             <DialogTrigger asChild>
                 <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-muted-foreground">
                     debug connection
                 </Button>
             </DialogTrigger>
             <DialogContent className="max-w-2xl">
                 <DialogHeader>
                     <DialogTitle>Connection Debugger</DialogTitle>
                     <DialogDescription>Use this to troubleshoot Publer and GHL connections.</DialogDescription>
                 </DialogHeader>
                 <div className="p-4 bg-muted rounded-md space-y-4 text-sm font-mono overflow-auto max-h-[400px]">
                     <div>
                         <strong>GHL Location ID:</strong> {ghlContext?.locationId || "Not detected (Check URL params)"}
                     </div>
                     <div>
                         <strong>Publer API Status:</strong>
                         <div className="p-2 border mt-1 bg-background">
                            {isLoadingAccounts ? "Loading..." : accounts.length + " accounts loaded"}
                            {accounts.length === 0 && !isLoadingAccounts && (
                                <p className="text-red-500">No accounts found. This usually means the API Key is invalid or has no accounts connected.</p>
                            )}
                         </div>
                     </div>
                 </div>
             </DialogContent>
        </Dialog>
      </div>
    </aside>
  )
}
