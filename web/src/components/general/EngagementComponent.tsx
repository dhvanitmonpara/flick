import { PiArrowFatUpFill, PiArrowFatDownFill } from "react-icons/pi";
import { AxiosError } from "axios";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useEffect, useState } from "react";
import { FaEye } from 'react-icons/fa';
import { FaComment } from 'react-icons/fa6';
import ShareButton from "../actions/ShareButton";
import CommentButton from "../actions/CommentButton";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { voteApi } from "@/services/api/vote";

type EngagementType = 'upvotes' | 'downvotes' | 'comments' | 'views' | "share";

type Count = {
  upvotes?: number;
  downvotes?: number;
  comments?: number;
  views?: number;
}

type EngagementComponentProps = {
  initialCounts: Count;
  id: string
  targetType: 'post' | 'comment'
  initialUpvoted?: boolean;
  initialDownvoted?: boolean;
  userVote: "upvote" | "downvote" | null
  show?: EngagementType[];
};

const EngagementComponent = ({
  initialCounts = { upvotes: 0, downvotes: 0, comments: 0, views: 0 },
  id,
  userVote,
  targetType = 'post',
  show = ['upvotes', 'downvotes', 'comments', 'views'],
}: EngagementComponentProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [optimisticCounts, setOptimisticCounts] = useState(initialCounts);

  const [upvoted, setUpvoted] = useState(userVote === 'upvote');
  const [downvoted, setDownvoted] = useState(userVote === 'downvote');

  const { handleError } = useErrorHandler()

  useEffect(() => {
    setUpvoted(userVote === 'upvote');
    setDownvoted(userVote === 'downvote');
  }, [userVote]);

  useEffect(() => {
    setOptimisticCounts(prev => ({
      ...prev,
      upvotes: initialCounts.upvotes ?? prev.upvotes,
      downvotes: initialCounts.downvotes ?? prev.downvotes,
      comments: initialCounts.comments ?? prev.comments,
      views: initialCounts.views ?? prev.views,
    }));
  }, [initialCounts.upvotes, initialCounts.downvotes, initialCounts.comments, initialCounts.views]);

  const getUpdatedCounts = (prevCounts: Count, upvoted: boolean, downvoted: boolean, type: 'upvote' | 'downvote') => {
    const newCounts = { ...prevCounts };
    if (type === 'upvote') {
      if (downvoted) newCounts.downvotes = (newCounts.downvotes ?? 0) - 1;
      newCounts.upvotes = (newCounts.upvotes ?? 0) + (upvoted ? -1 : 1);
    } else {
      if (upvoted) newCounts.upvotes = (newCounts.upvotes ?? 0) - 1;
      newCounts.downvotes = (newCounts.downvotes ?? 0) + (downvoted ? -1 : 1);
    }
    return newCounts;
  };

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (isVoting) return;

    const previousCounts = optimisticCounts;
    const prevUpvoted = upvoted;
    const prevDownvoted = downvoted;

    let action: 'post' | 'delete' | 'patch' = 'post';

    if (type === 'upvote') {
      if (upvoted) action = 'delete'
      else if (downvoted) action = 'patch';
      else action = 'post';
    } else {
      if (downvoted) action = 'delete';
      else if (upvoted) action = 'patch';
      else action = 'post';
    }

    setOptimisticCounts(prev => getUpdatedCounts(prev, upvoted, downvoted, type));

    if (type === 'upvote') {
      if (downvoted) setDownvoted(false);
      setUpvoted(!upvoted);
    } else {
      if (upvoted) setUpvoted(false);
      setDownvoted(!downvoted);
    }

    setIsVoting(true);
    try {
      if (action === 'post') {
        await voteApi.create({
          voteType: type,
          targetId: id,
          targetType,
        });
      } else if (action === 'delete') {
        await voteApi.remove({
          targetId: id,
          targetType,
        });
      } else if (action === 'patch') {
        await voteApi.update({
          voteType: type,
          targetId: id,
          targetType,
        });
      }
    } catch (error) {
      await handleError(
        error as AxiosError | Error,
        "Failed to update vote",
        undefined,
        () => handleVote(type),
        `Failed to ${type}`,
        () => {
          setOptimisticCounts(previousCounts);
          setUpvoted(prevUpvoted);
          setDownvoted(prevDownvoted);
        }
      );
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-full p-0.5 shadow-sm">
        {show.includes('upvotes') && (
          <button
            disabled={isVoting}
            onClick={(e) => { e.stopPropagation(); handleVote("upvote") }}
            aria-label={upvoted ? 'Remove upvote' : 'Upvote'}
            aria-pressed={upvoted}
            className="group flex cursor-pointer items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hover:bg-zinc-300 dark:hover:bg-zinc-700/80 rounded-full px-2 py-1 transition-colors"
          >
            <PiArrowFatUpFill className={`pointer-events-none text-lg transition-transform ${upvoted ? "text-blue-500" : "text-zinc-500 dark:text-zinc-400"} group-hover:scale-110 group-hover:text-blue-500`} />
            <span className={`pointer-events-none text-sm font-medium pr-1 select-none transition-colors ${upvoted ? "text-blue-500" : "text-zinc-600 dark:text-zinc-400 group-hover:text-blue-500"}`}>{optimisticCounts.upvotes}</span>
          </button>
        )}
        {(show.includes('upvotes') && show.includes('downvotes')) && (
          <Separator orientation="vertical" className="h-4! my-auto w-[1.5px] bg-zinc-300 dark:bg-zinc-700 mx-1" />
        )}
        {show.includes('downvotes') && (
          <button
            disabled={isVoting}
            onClick={(e) => { e.stopPropagation(); handleVote("downvote") }}
            aria-label={downvoted ? 'Remove downvote' : 'Downvote'}
            aria-pressed={downvoted}
            className="group flex cursor-pointer items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 hover:bg-zinc-300 dark:hover:bg-zinc-700/80 rounded-full px-2 py-1 transition-colors"
          >
            <PiArrowFatDownFill className={`pointer-events-none text-lg transition-transform ${downvoted ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"} group-hover:scale-110 group-hover:text-red-500`} />
            <span className={`pointer-events-none text-sm font-medium pr-1 select-none transition-colors ${downvoted ? "text-red-500" : "text-zinc-600 dark:text-zinc-400 group-hover:text-red-500"}`}>{optimisticCounts.downvotes}</span>
          </button>
        )}
      </div>

      {show.includes('comments') && (
        <CommentButton parentCommentId={targetType === "comment" ? id : null}>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="group flex items-center gap-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 p-1.5 px-2.5 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors shadow-sm"
            aria-label="Comments"
          >
            <FaComment className="pointer-events-none text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 group-hover:scale-110 duration-300 transition-all text-base" />
            <span className="pointer-events-none text-sm font-medium text-zinc-600 dark:text-zinc-400 pr-0.5 select-none">{optimisticCounts.comments}</span>
          </button>
        </CommentButton>
      )}

      {show.includes('views') && (
        <button
          onClick={(e) => { e.stopPropagation(); toast.info("Analytics feature is under development") }}
          className="group flex cursor-pointer items-center gap-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 p-1.5 px-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors shadow-sm"
          aria-label={`${optimisticCounts.views} views`}
        >
          <FaEye className="pointer-events-none text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 group-hover:scale-110 duration-300 transition-all text-base" />
          <span className="pointer-events-none text-sm font-medium text-zinc-600 dark:text-zinc-400 pr-0.5 select-none">{optimisticCounts.views}</span>
        </button>
      )}

      {show.includes('share') && (
        <ShareButton id={id} />
      )}
    </div>
  );
};

export default EngagementComponent;
