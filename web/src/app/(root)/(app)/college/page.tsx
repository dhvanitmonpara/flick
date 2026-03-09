"use client";

import type { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import Post from "@/components/general/Post";
import SkeletonCard from "@/components/skeletons/PostSkeleton";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { postApi } from "@/services/api/post";
import usePostStore from "@/store/postStore";
import useProfileStore from "@/store/profileStore";
import type { Post as PostEntity } from "@/types/Post";
import {
  formatDate,
  getAvatarUrl,
  getCollegeName,
  isUser,
} from "@/utils/helpers";

function CollegePage() {
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();
  const profile = useProfileStore((state) => state.profile);
  const posts = usePostStore((state) => state.posts);
  const setPosts = usePostStore((state) => state.setPosts);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      if (!profile.college) return;
      const collegeId =
        typeof profile.college === "string"
          ? profile.college
          : profile.college.id;

      const res = await postApi.getByCollege(collegeId);

      if (res.status !== 200) {
        throw new Error("Failed to fetch posts");
      }
      setPosts(res.data.posts);
    } catch (error) {
      await handleError(
        error as AxiosError | Error,
        "Error fetching posts",
        undefined,
        () => fetchPosts(),
        "Failed to fetch posts",
      );
    } finally {
      setLoading(false);
    }
  }, [handleError, profile.college, setPosts]);

  useEffect(() => {
    document.title = "Feed | Flick";
    fetchPosts();
  }, [fetchPosts]);

  const removedPostOnAction = (id: string) => {
    const updatedPost = posts?.filter((post) => post.id !== id) as PostEntity[];
    setPosts(updatedPost);
  };

  if (loading) {
    return (
      <section className="w-full max-h-screen overflow-y-auto no-scrollbar py-6 divide-y divide-zinc-300/60 dark:divide-zinc-700/50">
        {[...Array(10)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </section>
    );
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
            );
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
              authorId={postedBy.id}
            />
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            No posts yet
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
            Be the first to start a discussion in this college!
          </p>
        </div>
      )}
    </section>
  );
}

export default CollegePage;
