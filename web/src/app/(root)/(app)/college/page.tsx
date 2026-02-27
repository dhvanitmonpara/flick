"use client"

import Post from "@/components/general/Post"
import SkeletonCard from "@/components/skeletons/PostSkeleton"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import usePostStore from "@/store/postStore"
import useProfileStore from "@/store/profileStore"
import type { Post as PostEntity } from "@/types/Post"
import { formatDate, getAvatarUrl, getCollegeName, isUser } from "@/utils/helpers"
import { AxiosError } from "axios"
import { useCallback, useEffect, useState } from "react"
import { postApi } from "@/services/api/post"

function CollegePage() {

  const [loading, setLoading] = useState(false)
  const { handleError } = useErrorHandler()
  const profile = useProfileStore(state => state.profile)
  const posts = usePostStore(state => state.posts)
  const setPosts = usePostStore(state => state.setPosts)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      if (!profile.college) return
      const collegeId = typeof profile.college === "string" ? profile.college : profile.college.id;

      const res = await postApi.getByCollege(collegeId)

      if (res.status !== 200) {
        throw new Error("Failed to fetch posts")
      }
      setPosts(res.data.posts)
    } catch (error) {
      await handleError(error as AxiosError | Error, "Error fetching posts", undefined, () => fetchPosts(), "Failed to fetch posts")
    } finally {
      setLoading(false)
    }
  }, [handleError, profile.college, setPosts])

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
        <div className="flex justify-center items-center h-full">
          <p>No posts found</p>
        </div>
      )}
    </section>
  )
}

export default CollegePage
