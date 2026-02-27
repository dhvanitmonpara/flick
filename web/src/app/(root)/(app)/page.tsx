"use client"

import Post from "@/components/general/Post"
import SkeletonCard from "@/components/skeletons/PostSkeleton"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import usePostStore from "@/store/postStore"
import type { Post as PostEntity } from "@/types/Post"
import { formatDate, getAvatarUrl, getCollegeName, isUser } from "@/utils/helpers"
import { AxiosError } from "axios"
import { useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"
import { postApi } from "@/services/api/post"
import { FileText, Search, AlertCircle } from "lucide-react"
import unparseTopic from "@/utils/unparse-topic"
import CreatePost from "@/components/general/CreatePost"

function Feed() {

  const [loading, setLoading] = useState(true)

  const { handleError } = useErrorHandler()
  const posts = usePostStore(state => state.posts)
  const setPosts = usePostStore(state => state.setPosts)

  const searchParams = useSearchParams()

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const branch = searchParams.get("branch")
      const topicParam = searchParams.get("topic")

      // Convert parsed topic back to original format
      const topic = topicParam ? unparseTopic(topicParam) : null

      const res = await postApi.getPosts({
        ...(branch ? { branch } : {}),
        ...(topic ? { topic } : {}),
      })

      if (!res.success) {
        throw new Error("Failed to fetch posts")
      }

      setPosts(res.data.posts)
    } catch (error) {
      await handleError(error as AxiosError | Error, "Error fetching posts", undefined, () => fetchPosts(), "Failed to fetch posts")
    } finally {
      setLoading(false)
    }
  }, [handleError, searchParams, setPosts])

  useEffect(() => {
    document.title = "Feed | Flick"
    fetchPosts()
  }, [fetchPosts])

  const removedPostOnAction = (id: string) => {
    const updatedPost = posts?.filter(post => post.id !== id) as PostEntity[]
    setPosts(updatedPost)
  }

  if (loading) {
    return (
      <section className="w-full max-h-screen overflow-y-auto no-scrollbar py-6 divide-y divide-zinc-300/60 dark:divide-zinc-700/50">
        {[...Array(10)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </section>
    )
  }

  return (
    <section className="w-full max-h-screen overflow-y-auto no-scrollbar py-6 divide-y divide-zinc-300/60 dark:divide-zinc-700/50">
      {posts && posts.length > 0 ? (
        posts.map((post) => {
          const postedBy = post.postedBy;

          if (!isUser(postedBy)) {
            // postedBy is just a string, fallback
            return (
              <Post
                key={post.id}
                id={post.id}
                avatar=""
                userVote={post.userVote ?? null}
                username="Unknown"
                title={post.title}
                topic={post.topic}
                isPrivate={post.isPrivate}
                bookmarked={post.bookmarked ?? false}
                branch="Unknown"
                viewsCount={post.views}
                content={post.content}
                avatarFallback=""
                college="Unknown"
                createdAt={formatDate(post.createdAt)}
                upvoteCount={post.upvoteCount}
                downvoteCount={post.downvoteCount}
                commentsCount={post.commentsCount ?? 0}
              />
            )
          }

          // postedBy is a full User object here
          return (
            <Post
              key={post.id}
              id={post.id}
              avatar={getAvatarUrl(postedBy)}
              college={getCollegeName(postedBy)}
              topic={post.topic}
              isPrivate={post.isPrivate}
              username={postedBy.username}
              userVote={post.userVote ?? null}
              title={post.title}
              bookmarked={post.bookmarked ?? false}
              branch={postedBy.branch}
              viewsCount={post.views}
              content={post.content}
              avatarFallback=""
              removedPostOnAction={removedPostOnAction}
              createdAt={formatDate(post.createdAt)}
              upvoteCount={post.upvoteCount}
              downvoteCount={post.downvoteCount}
              commentsCount={post.commentsCount ?? 0}
            />
          )
        })
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-20 px-4 animate-in fade-in duration-500">
          {/* Minimal & crisp icon container */}
          <div className="relative mb-5 flex items-center justify-center w-14 h-14 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/5">
            {/* Optional: subtle background glow inside the icon box for "richness" */}
            <div className="absolute inset-0 rounded-xl bg-linear-to-b from-transparent to-zinc-50/50 dark:to-zinc-800/20" />
            <Search className="relative w-6 h-6 text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
          </div>

          {/* Refined typography with tighter leading and smaller headings */}
          <div className="text-center space-y-1.5 mb-8">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No posts found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[280px]">
              We couldn't find any posts matching your filters. Adjust your search or clear filters to see more.
            </p>
          </div>

          {/* Modern, compact buttons (h-9 is standard for sleek UI) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.search = '';
                window.history.replaceState({}, '', url.toString());
                fetchPosts();
              }}
              className="inline-flex cursor-pointer items-center justify-center h-9 px-4 text-sm font-medium text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
            >
              Clear filters
            </button>
            <CreatePost>
              <button
                className="inline-flex cursor-pointer items-center justify-center h-9 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
              >
                Craft a new one
              </button>
            </CreatePost>
          </div>
        </div>
      )}
    </section>
  )
}

function FeedPage() {
  return (
    <Suspense fallback={
      <section className="w-full max-h-screen overflow-y-auto no-scrollbar py-6 divide-y divide-zinc-300/60 dark:divide-zinc-700/50">
        <div className="p-4 text-center text-lg font-medium">
          Initializing feed...
        </div>
        {[...Array(10)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </section>
    }>
      <Feed />
    </Suspense>
  )
}

export default FeedPage
