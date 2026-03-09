"use client";

import type { AxiosError } from "axios";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import CreatePost from "@/components/general/CreatePost";
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
import unparseTopic from "@/utils/unparse-topic";

function Feed() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PostEntity[] | null>(null);

  const { handleError } = useErrorHandler();
  const posts = usePostStore((state) => state.posts);
  const setPosts = usePostStore((state) => state.setPosts);
  const isLoggedIn = Boolean(useProfileStore((state) => state.profile.id));

  const searchParams = useSearchParams();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const branch = searchParams.get("branch");
      const topicParam = searchParams.get("topic");

      // Convert parsed topic back to original format
      const topic = topicParam ? unparseTopic(topicParam) : null;

      const res = await postApi.getPosts({
        ...(branch ? { branch } : {}),
        ...(topic ? { topic } : {}),
      });

      if (!res.success) {
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
  }, [handleError, searchParams, setPosts]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      try {
        const res = await postApi.search(searchQuery.trim());
        if (res.success) {
          setSearchResults(res.data.posts);
        }
      } catch (error) {
        await handleError(
          error as AxiosError | Error,
          "Error searching posts",
          undefined,
          () => handleSearch(e as any),
          "Failed to search posts",
        );
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, handleError],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults(null);
  }, []);

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
    <section className="w-full max-h-dvh overflow-y-auto no-scrollbar py-2 md:py-6">
      {/* Search Bar Container */}
      <div className="sticky top-0 z-20 px-3 md:px-4 pt-2 md:pt-0">
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-[42px] pr-12 py-2.5 bg-zinc-200/50 hover:bg-zinc-200/50 focus:bg-zinc-200/40 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/50 dark:focus:bg-zinc-800/40 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-full text-[15px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSearching && (
                <div className="w-[18px] h-[18px] mr-2 border-[2.5px] border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="divide-y divide-zinc-300/60 dark:divide-zinc-700/50">
        {/* Search Results or Posts */}
        {searchResults !== null ? (
          searchResults && searchResults.length > 0 ? (
            searchResults.map((post) => {
              const postedBy = post.postedBy;

              if (!isUser(postedBy)) {
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
                <Search className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                No results found
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                No posts match &quot;{searchQuery}&quot;. Try different keywords.
              </p>
            </div>
          )
        ) : posts && posts.length > 0 ? (
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
        ) : posts && posts.length > 0 ? (
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
          <div className="flex flex-col items-center justify-center h-full py-20 px-4 animate-in fade-in duration-500">
            {/* Minimal & crisp icon container */}
            <div className="relative mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800">
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

            {/* Refined typography with tighter leading and smaller headings */}
            <div className="text-center space-y-1.5 mb-8">
              <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                No posts yet
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[280px]">
                We couldn&apos;t find any posts matching your filters. Adjust your
                search or clear filters to see more.
              </p>
            </div>

            {/* Modern, compact buttons (h-9 is standard for sleek UI) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.search = "";
                  window.history.replaceState({}, "", url.toString());
                  fetchPosts();
                }}
                className="inline-flex cursor-pointer items-center justify-center h-9 px-4 text-sm font-medium text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
              >
                Clear filters
              </button>
              {isLoggedIn && (
                <CreatePost>
                  <button className="inline-flex cursor-pointer items-center justify-center h-9 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950">
                    Craft a new one
                  </button>
                </CreatePost>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FeedPage() {
  return (
    <Suspense
      fallback={
        <section className="w-full max-h-screen overflow-y-auto no-scrollbar py-6 divide-y divide-zinc-300/60 dark:divide-zinc-700/50">
          {[...Array(10)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      }
    >
      <Feed />
    </Suspense>
  );
}

export default FeedPage;
