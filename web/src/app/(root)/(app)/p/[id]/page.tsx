"use client";

import Comment from "@/components/general/Comment";
import CreateComment from "@/components/general/CreateComment";
import Post from "@/components/general/Post";
import SkeletonCard from "@/components/skeletons/PostSkeleton";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import useCommentStore from "@/store/commentStore";
import usePostStore from "@/store/postStore";
import type { Comment as CommentEntity } from "@/types/Comment";
import type { Post as PostEntity } from "@/types/Post";
import type { User as UserEntity } from "@/types/User";
import { formatDate, isCollege, isUser } from "@/utils/helpers";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { postApi } from "@/services/api/post";
import { commentApi } from "@/services/api/comment";
import useProfileStore from "@/store/profileStore";

const getAvatarUrl = (user: UserEntity | string | null) =>
  isUser(user) && isCollege(user.college) ? user.college.profile : "";
const getCollegeName = (user: UserEntity | string | null) =>
  isUser(user) && isCollege(user.college)
    ? user.college.name
    : "Unknown College";
const getUsername = (user: UserEntity | string | null) =>
  isUser(user) ? user.username : "Anonymous";

function PostPage() {
  const [currentPost, setCurrentPost] = useState<PostEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const comments = useCommentStore((state) => state.comments);
  const setComments = useCommentStore((state) => state.setComments);
  const resetComments = useCommentStore((state) => state.resetComments);

  const { handleError } = useErrorHandler();

  const { id } = useParams();
  const posts = usePostStore((state) => state.posts);
  const isLoggedIn = Boolean(useProfileStore((state) => state.profile.id));
  const navigate = useRouter().push;

  const incrementView = useCallback(async () => {
    try {
      const res = await postApi.incrementView(id as string);
      if (res.status !== 200) {
        throw new Error("Failed to increment view");
      }
    } catch (error) {
      await handleError(
        error as AxiosError | Error,
        "Error incrementing view",
        undefined,
        incrementView,
        "Failed to increment view",
      );
    }
  }, [handleError, id]);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await commentApi.getByPostId(id as string);
      if (res.status !== 200) {
        throw new Error("Failed to fetch comments");
      }
      const commentTree = buildCommentTree(res.data.comments);
      setComments(commentTree);
    } catch (error) {
      await handleError(
        error as AxiosError | Error,
        "Error fetching comments",
        undefined,
        fetchComments,
        "Failed to fetch comments",
      );
    } finally {
      setLoading(false);
    }
  }, [handleError, id, setComments]);

  const fetchPostById = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const res = await postApi.getById(id as string);
      if (res.status !== 200) {
        throw new Error("Failed to fetch post");
      }
      setCurrentPost(res.data.post);
    } catch (error) {
      await handleError(
        error as AxiosError | Error,
        "Error fetching post",
        undefined,
        fetchPostById,
        "Failed to fetch post",
        () => navigate("/"),
      );
    } finally {
      setLoadingPosts(false);
    }
  }, [handleError, id, navigate]);

  useEffect(() => {
    resetComments();

    if (!id) {
      navigate("/");
      return;
    }

    const post = posts?.find((post) => post.id === id);

    if (post) {
      setCurrentPost(post);
    } else {
      fetchPostById();
    }

    incrementView();
    fetchComments();
  }, [
    fetchComments,
    fetchPostById,
    id,
    incrementView,
    navigate,
    posts,
    resetComments,
  ]);

  if (loadingPosts || !currentPost) {
    return (
      <div className="divide-y divide-zinc-300/60 dark:divide-zinc-700/50 w-full">
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="dark:divide-zinc-700/50 w-full">
      {currentPost?.id && (
        <Post
          key={currentPost.id}
          id={currentPost.id}
          avatar={getAvatarUrl(currentPost.postedBy)}
          bookmarked={currentPost.bookmarked ?? false}
          college={getCollegeName(currentPost.postedBy)}
          username={getUsername(currentPost.postedBy)}
          removedPostOnAction={() => navigate("/")}
          topic={currentPost.topic}
          isPrivate={currentPost.isPrivate}
          userVote={currentPost.userVote ?? null}
          title={currentPost.title}
          branch={
            isUser(currentPost.postedBy)
              ? currentPost.postedBy.branch
              : "Unknown Branch"
          }
          viewsCount={currentPost.views}
          content={currentPost.content}
          avatarFallback=""
          createdAt={formatDate(currentPost.createdAt)}
          upvoteCount={currentPost.upvoteCount}
          downvoteCount={currentPost.downvoteCount}
          commentsCount={currentPost.commentsCount ?? comments?.length ?? 0}
          authorId={
            isUser(currentPost.postedBy) ? currentPost.postedBy.id : undefined
          }
        />
      )}
      {isLoggedIn && (
        <div className="px-4">
          <CreateComment />
        </div>
      )}
      <div className="divide-y! divide-zinc-300/60 dark:divide-zinc-700/50">
        {loading ? (
          <>
            {[...Array(10)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              No comments yet
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
              Be the first to share your thoughts on this post!
            </p>
            {isLoggedIn && (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Start the conversation below
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function buildCommentTree(comments: CommentEntity[]): CommentEntity[] {
  const commentMap = new Map<string, CommentEntity>();
  const roots: CommentEntity[] = [];

  // Add all comments to map and init children
  comments.forEach((comment) => {
    comment.children = [];
    commentMap.set(comment.id, comment);
  });

  // Link children to their parent
  comments.forEach((comment) => {
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.children!.push(comment);
      }
    } else {
      roots.push(comment);
    }
  });

  return roots;
}

export default PostPage;
