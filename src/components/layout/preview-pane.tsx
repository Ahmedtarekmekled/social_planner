"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Send as SendIcon, Bookmark, MoreHorizontal } from "lucide-react"
import { usePost } from "@/components/providers/post-provider"
import type { Platform } from "@/types"

export function PreviewPane() {
  const { activePlatform, getEffectiveCaption, media } = usePost()
  const [internalPreviewPlatform, setInternalPreviewPlatform] = useState<Platform>('instagram')

  const previewPlatform = activePlatform === 'all' ? internalPreviewPlatform : activePlatform

  const caption = getEffectiveCaption(previewPlatform)

  return (
    <div className="w-[420px] border-l h-full flex flex-col bg-muted/5 hidden lg:flex">
      <div className="h-16 border-b flex items-center px-6 justify-between bg-background">
        <span className="font-semibold text-sm tracking-tight text-muted-foreground">Live Preview</span>
        <Select 
          value={previewPlatform} 
          onValueChange={(val) => setInternalPreviewPlatform(val as Platform)}
          disabled={activePlatform !== 'all'}
        >
          <SelectTrigger className="w-[140px] h-9 text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="x">X (Twitter)</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center bg-dots-pattern">
        
        {/* Instagram Preview */}
        {previewPlatform === 'instagram' && (
          <div className="w-full max-w-[375px] bg-card border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-3 flex items-center justify-between border-b border-border/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight">acme_corp</span>
                    <span className="text-[10px] text-muted-foreground">Sponsored</span>
                </div>
              </div>
              <MoreHorizontal size={16} className="text-muted-foreground" />
            </div>
            
            <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground/50 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
               {media.length > 0 && media[0].type === 'image' ? (
                   <img src={media[0].url} alt="preview" className="w-full h-full object-cover" />
               ) : (
                   <span className="text-xs font-medium uppercase tracking-wider">No Media</span>
               )}
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-foreground">
                <div className="flex gap-4">
                  <Heart size={22} className="hover:text-red-500 transition-colors cursor-pointer" />
                  <MessageCircle size={22} className="hover:text-blue-500 transition-colors cursor-pointer" />
                  <SendIcon size={22} className="hover:text-green-500 transition-colors cursor-pointer" />
                </div>
                <Bookmark size={22} className="hover:text-yellow-500 transition-colors cursor-pointer" />
              </div>
              
              <div className="text-sm font-semibold">84 likes</div>
              
              <div className="text-sm leading-relaxed">
                <span className="font-semibold mr-2">acme_corp</span>
                <span className="text-muted-foreground/90 whitespace-pre-wrap">
                  {caption || "Start writing to see the preview update instantly! 🚀"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Facebook Preview (simplified) */}
        {previewPlatform === 'facebook' && (
           <div className="w-full max-w-[375px] bg-card border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-4 space-y-2">
                     <div className="flex items-center gap-2">
                         <Avatar className="h-10 w-10">
                             <AvatarFallback>AC</AvatarFallback>
                         </Avatar>
                         <div>
                             <p className="font-semibold text-sm">Acme Corp</p>
                             <p className="text-xs text-muted-foreground">Just now · 🌍</p>
                         </div>
                     </div>
                     <div className="text-sm whitespace-pre-wrap">
                         {caption || "Write something..."}
                     </div>
                </div>
                {media.length > 0 && (
                   <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                       {media[0].type === 'image' ? (
                            <img src={media[0].url} alt="Facebook Preview" className="w-full h-full object-cover" />
                        ) : (
                            <video src={media[0].url} className="w-full h-full object-cover" controls />
                        )}
                   </div>
                )}
                <div className="p-2 border-t flex justify-around text-muted-foreground">
                    <span className="text-sm font-medium">Like</span>
                    <span className="text-sm font-medium">Comment</span>
                    <span className="text-sm font-medium">Share</span>
                </div>
           </div>
        )}

        {/* X (Twitter) Preview */}
        {previewPlatform === 'x' && (
           <div className="w-full max-w-[375px] bg-card border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300 p-4">
               <div className="flex gap-3">
                   <Avatar className="h-10 w-10">
                       <AvatarFallback>AC</AvatarFallback>
                   </Avatar>
                   <div className="flex-1 space-y-1">
                       <div className="flex items-center gap-1">
                           <span className="font-bold text-sm">Acme Corp</span>
                           <span className="text-muted-foreground text-sm">@acme_corp · 1m</span>
                       </div>
                       <div className="text-sm whitespace-pre-wrap leading-tight">
                           {caption || "What's happening?"}
                       </div>
                       
                       {media.length > 0 && (
                          <div className="mt-3 rounded-xl border overflow-hidden aspect-video bg-muted">
                              {media[0].type === 'image' ? (
                                  <img src={media[0].url} alt="X Preview" className="w-full h-full object-cover" />
                              ) : (
                                  <video src={media[0].url} className="w-full h-full object-cover" controls />
                              )}
                          </div>
                       )}

                       <div className="flex justify-between text-muted-foreground mt-2 max-w-[80%]">
                           <MessageCircle size={16} />
                           <MoreHorizontal size={16} />{/* Retweet icon mock */}
                           <Heart size={16} />
                           <SendIcon size={16} />
                       </div>
                   </div>
               </div>
           </div>
        )}

        {/* Telegram Preview */}
        {previewPlatform === 'telegram' && (
           <div className="w-full max-w-[375px] bg-[#99BA92] (bg-opacity-20) dark:bg-slate-900 border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300 p-4 bg-sky-100/30">
               <div className="bg-card rounded-lg p-2 rounded-tl-none shadow-sm max-w-[85%]">
                  {media.length > 0 && (
                      <div className="rounded mb-2 overflow-hidden aspect-video relative">
                          {media[0].type === 'image' ? (
                              <img src={media[0].url} alt="Telegram Preview" className="w-full h-full object-cover" />
                          ) : (
                              <video src={media[0].url} className="w-full h-full object-cover" controls />
                          )}
                      </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">
                      {caption || "Broadcast message..."}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 text-right mt-1">
                      2:30 PM
                  </div>
               </div>
           </div>
        )}

        {/* Other platforms can be added similarly */}
      </div>
    </div>
  )
}
