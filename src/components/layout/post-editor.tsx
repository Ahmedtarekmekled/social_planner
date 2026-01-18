"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Twitter, Send, ImagePlus, Hash, Smile, CalendarClock, X as XIcon, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { usePost } from "@/components/providers/post-provider"
import { toast } from "sonner"
import type { Platform } from "@/types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function PostEditor() {
  const {
    caption, setCaption,
    activePlatform, setActivePlatform,
    platformOverrides, setPlatformOverride,
    media, addMedia, updateMedia, removeMedia,
    selectedAccountIds,
    ghlContext
  } = usePost()

  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("12:00")
  const [isPosting, setIsPosting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (activePlatform === 'all') {
      setCaption(val)
    } else {
      setPlatformOverride(activePlatform, val)
    }
  }

  const currentCaption = activePlatform === 'all'
    ? caption
    : platformOverrides[activePlatform] ?? caption

  // Upload files to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const files = Array.from(e.target.files)

      const toastId = toast.loading("Uploading media...")

      for (const file of files) {
        try {
          // 1. Upload to Supabase Storage
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `uploads/${fileName}`

          const { error } = await supabase.storage
            .from('media')
            .upload(filePath, file)

          if (error) throw error

          // 2. Get Public URL
          const { data: publicUrlData } = supabase.storage
            .from('media')
            .getPublicUrl(filePath)

          const publicUrl = publicUrlData.publicUrl

          // 3. Add to state
          addMedia({
            url: publicUrl,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            name: file.name
          })

        } catch (error: any) {
          console.error("Upload error:", error)
          toast.error(`Failed to upload ${file.name}: ${error.message}`)
        }
      }
      toast.dismiss(toastId)
      setIsUploading(false)

      // Reset input
      e.target.value = ''
    }
  }

  const handlePost = async (schedule: boolean) => {
    if (selectedAccountIds.length === 0) {
      toast.error("Please select at least one account in the sidebar.")
      return
    }

    const text = activePlatform === 'all' ? caption : (platformOverrides[activePlatform] || caption)
    if (!text && media.length === 0) {
      toast.error("Post must have text or media.")
      return
    }

    if (schedule && !date) {
      toast.error("Please select a date and time to schedule.")
      return
    }

    setIsPosting(true)
    try {
      // Combine date and time
      let scheduledDateTime: Date | undefined
      if (schedule && date) {
        const [hours, minutes] = time.split(':').map(Number)
        scheduledDateTime = new Date(date)
        scheduledDateTime.setHours(hours, minutes, 0, 0)
      }

      const res = await fetch('/api/publer/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: selectedAccountIds,
          text: text,
          media: media.map(m => m.url),
          scheduled_at: scheduledDateTime ? scheduledDateTime.toISOString() : undefined
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to post")

      toast.success(data.message || (schedule ? "Post Scheduled!" : "Posted Successfully!"))

      // Optional: Clear form
      if (!schedule) {
        // Maybe clear? User preference.
      }

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPosting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!caption && media.length === 0) {
      toast.error("Draft must have text or media.")
      return
    }

    setIsPosting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: caption,
          media: media.map(m => m.url),
          accounts: selectedAccountIds,
          location_id: ghlContext?.locationId,
          status: 'draft'
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save draft")

      toast.success("Draft saved successfully!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-[500px] border-r bg-background/50 relative">
      <div className="h-16 border-b flex items-center px-6 justify-between bg-background">
        <h2 className="font-semibold text-lg">Compose</h2>
        <div className="text-sm text-muted-foreground">
          Last saved 2m ago
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <Tabs
          value={activePlatform}
          onValueChange={(val) => setActivePlatform(val as Platform | 'all')}
          className="w-full space-y-6"
        >
          <TabsList className="w-full justify-start h-12 p-1 bg-muted/30">
            <TabsTrigger value="all" className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="instagram" className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"><Instagram size={16} /> IG</TabsTrigger>
            <TabsTrigger value="facebook" className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"><Facebook size={16} /> FB</TabsTrigger>
            <TabsTrigger value="x" className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"><Twitter size={16} /> X</TabsTrigger>
            <TabsTrigger value="telegram" className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"><Send size={16} /> TG</TabsTrigger>
          </TabsList>

          <TabsContent value={activePlatform} className="space-y-4 focus-visible:outline-none perspective-1000 mt-0">
            <div className="group relative rounded-xl border-2 border-muted hover:border-muted-foreground/30 focus-within:border-primary transition-all duration-300 bg-card shadow-sm">
              <Textarea
                value={currentCaption}
                onChange={handleCaptionChange}
                placeholder={activePlatform === 'all' ? "Write your master caption here..." : `Customize for ${activePlatform}...`}
                className="min-h-[250px] border-0 focus-visible:ring-0 resize-none text-base p-4 bg-transparent"
              />

              <div className="flex items-center justify-between p-3 border-t bg-muted/10 rounded-b-lg">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Smile size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Hash size={18} />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {currentCaption.length} / 2200
                </div>
              </div>
            </div>


            {/* Media Area */}
            <div className="grid grid-cols-3 gap-4">
              {media.map((item, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  {item.type === 'image' ? (
                    <img src={item.url} alt="media" className="w-full h-full object-cover" />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover" controls />
                  )}
                  <button onClick={() => removeMedia(idx)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors">
                    <XIcon size={12} />
                  </button>
                </div>
              ))}

              <div
                onClick={() => document.getElementById('file-upload')?.click()}
                className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 flex flex-col items-center justify-center gap-4 hover:bg-muted/10 transition-colors cursor-pointer group col-span-3"
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium text-sm">Drag & drop media</p>
                  <p className="text-xs text-muted-foreground">or click to upload</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t bg-background/80 backdrop-blur pb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMM d, yyyy") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleSaveDraft} disabled={isPosting || isUploading}>Save Draft</Button>
            <Button variant="outline" onClick={() => handlePost(false)} disabled={isPosting || isUploading}>
              {isPosting ? <Loader2 className="animate-spin h-4 w-4" /> : "Post Now"}
            </Button>
            <Button className="w-32" onClick={() => handlePost(true)} disabled={isPosting || isUploading}>
              {isPosting ? <Loader2 className="animate-spin h-4 w-4" /> : "Schedule"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
