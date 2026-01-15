

import { Sidebar } from "@/components/layout/sidebar"
import { PostEditor } from "@/components/layout/post-editor"
import { PreviewPane } from "@/components/layout/preview-pane"
import { Timeline } from "@/components/layout/timeline"
import { PostProvider } from "@/components/providers/post-provider"

export default function Home() {
  return (
    <PostProvider>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex min-w-0 shadow-2xl z-10">
          <PostEditor />
          <PreviewPane />
        </main>
        <Timeline />
      </div>
    </PostProvider>
  )
}

