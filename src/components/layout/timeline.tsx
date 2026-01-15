"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns"

interface Post {
  id: string
  text: string
  scheduled_at: string
  status: 'published' | 'scheduled' | 'draft'
  media_urls: string[]
  accounts: string[]
}

export function Timeline() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/publer/posts')
        if (res.ok) {
          const data = await res.json()
          setPosts(data)
        }
      } catch (e) {
        console.error("Failed to fetch posts", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  )

  const publishedPosts = sortedPosts.filter(p => p.status === 'published')
  const scheduledPosts = sortedPosts.filter(p => p.status === 'scheduled')

  return (
    <div className="w-[320px] border-l h-full flex flex-col bg-muted/5">
      <div className="h-16 border-b flex items-center px-6 bg-background">
        <h2 className="font-semibold text-lg">Timeline</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Scheduled Posts */}
            {scheduledPosts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Clock size={14} />
                  Upcoming ({scheduledPosts.length})
                </h3>
                {scheduledPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Published Posts */}
            {publishedPosts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Published ({publishedPosts.length})
                </h3>
                {publishedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {posts.length === 0 && (
              <div className="text-center p-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                No posts yet. Create your first post!
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  const scheduledDate = new Date(post.scheduled_at)
  const isScheduled = isFuture(scheduledDate)
  const wasPublished = isPast(scheduledDate)

  return (
    <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant={isScheduled ? "default" : "secondary"} className="text-[10px]">
          {isScheduled ? "Scheduled" : "Published"}
        </Badge>
        <div className="text-xs text-muted-foreground text-right">
          <div className="font-medium">{format(scheduledDate, "MMM d, yyyy")}</div>
          <div>{format(scheduledDate, "h:mm a")}</div>
        </div>
      </div>

      <p className="text-sm line-clamp-2 mb-2">{post.text}</p>

      {post.media_urls.length > 0 && (
        <div className="mb-2 rounded overflow-hidden">
          <img 
            src={post.media_urls[0]} 
            alt="Post media" 
            className="w-full h-20 object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar size={12} />
        <span>{formatDistanceToNow(scheduledDate, { addSuffix: true })}</span>
      </div>
    </div>
  )
}
