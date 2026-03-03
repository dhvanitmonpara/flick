import TrendingPostCard from "./TrendingPostCard"
import { useCallback, useEffect, useState } from "react"
import { AxiosError } from "axios"
import { TrendingPost } from "@/types/TrendingPost"
import { toast } from "sonner"
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { postApi } from "@/services/api/post";
import { PiFireFill } from "react-icons/pi";

function TrendingPostSection() {

  const [posts, setPosts] = useState<TrendingPost[]>([])
  const [loading, setLoading] = useState(false)

  const { handleError } = useErrorHandler()

  const fetchPosts = useCallback(async () => {
    try {

      setLoading(true)

      const res = await postApi.getTrending()

      if (!res.success) {
        toast.error("Error fetching trending posts")
      }

      setPosts(res.data.posts)
    } catch (error) {
      handleError(error as AxiosError, "Error fetching trending posts", undefined, fetchPosts, "Failed to fetch trending posts")
    } finally {
      setLoading(false)
    }

  }, [handleError])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <aside className="hidden lg:block w-full max-w-84 px-3 py-6">
      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-800 dark:text-zinc-200">
            Most Read
          </h2>
          <div className="flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <PiFireFill className="text-orange-500" />
            <span>Trending</span>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800">
          {loading
            ? [...Array(4)].map((_, index) => (
              <CardSkeleton key={index} />
            ))
            : (posts.length > 0
              ? posts.map(({ time, views, category, title }, index) => (
                <TrendingPostCard
                  key={`${title}-${index}`}
                  rank={index + 1}
                  time={time}
                  views={views}
                  category={category}
                  title={title}
                />
              ))
              : <div className="flex min-h-52 flex-col items-center justify-center gap-1 px-4 text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No trending posts yet</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">New popular posts will appear here</p>
              </div>
            )
          }
        </div>
      </section>
    </aside>
  )
}

export function CardSkeleton() {
  return (
    <Card className="rounded-none border-0 bg-transparent p-3 space-y-2">
      <div className="flex items-center justify-between">
        {/* category + time */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <Skeleton className="h-3 w-28 rounded bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* views */}
        <div className="flex items-center space-x-1 rounded-full bg-zinc-200 px-2 py-0.5 dark:bg-zinc-800">
          <Skeleton className="h-3 w-3 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          <Skeleton className="h-3 w-6 rounded bg-zinc-300 dark:bg-zinc-700" />
        </div>
      </div>

      {/* title */}
      <Skeleton className="h-4 w-full rounded bg-zinc-300 dark:bg-zinc-700" />
      <Skeleton className="h-4 w-2/3 rounded bg-zinc-300 dark:bg-zinc-700" />
    </Card>
  );
}

export default TrendingPostSection
