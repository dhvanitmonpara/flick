import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BsDot } from "react-icons/bs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import EngagementComponent from "./EngagementComponent";
import PostDropdown from "../actions/PostDropdown";
import { PostTopic } from "@/types/postTopics";
import useProfileStore from "@/store/profileStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import parseTopic from "@/utils/parse-topic";

interface PostProps {
  avatar: string,
  avatarFallback: string
  createdAt: string
  college: string
  id: string
  title: string
  content: string
  upvoteCount: number
  downvoteCount: number
  commentsCount: number
  userVote: "upvote" | "downvote" | null
  viewsCount: number
  username: string
  branch: string
  bookmarked: boolean
  removedPostOnAction?: (id: string) => void
  topic: PostTopic
  isPrivate?: boolean
}

function Post({ avatar, userVote, avatarFallback, id, createdAt, college, title, content, upvoteCount, downvoteCount, commentsCount, viewsCount, username, branch, topic, bookmarked, removedPostOnAction, isPrivate }: PostProps) {
  const profile = useProfileStore(state => state.profile)
  const navigate = useRouter().push

  const handleLinkClick = (e: React.MouseEvent, link?: string) => {
    e.stopPropagation();
    if (link) navigate(link)
  }

  return (
    <Card onClick={(e) => handleLinkClick(e, `/p/${id}`)} className="dark:bg-transparent bg-transparent border-none shadow-none rounded-none">
      <CardHeader className="flex flex-row justify-between space-x-2 px-4 pt-4">
        <div className="flex space-x-4">
          <VisuallyHidden>
            <CardTitle onClick={(e) => handleLinkClick(e, `/p/${id}`)}>{title}</CardTitle>
            <CardDescription onClick={(e) => handleLinkClick(e, `/p/${id}`)}>{content}</CardDescription>
          </VisuallyHidden>
          <Avatar>
            <AvatarImage src={avatar} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="flex items-center space-x-0.5 font-semibold text-zinc-900 dark:text-zinc-100">
              <Link onClick={(e) => handleLinkClick(e, `/?branch=${branch}`)} className="hover:underline" href={`/?branch=${branch}`}>{branch}</Link>
              <BsDot size={14} />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">{createdAt}</span>
            </h2>
            <p className="flex space-x-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              <Link onClick={(e) => handleLinkClick(e, `/college/${college}`)} className="hover:underline" href={`/college/${college}`}>{college}</Link>
              <BsDot size={16} />
              <Link onClick={(e) => handleLinkClick(e, `/user/${username}`)} className="hover:underline" href={`/user/${username}`}>{username}</Link>
              <BsDot size={16} />
              <Link onClick={(e) => handleLinkClick(e, `/?topic=${parseTopic(topic)}`)} className="hover:underline" href={`/?topic=${parseTopic(topic)}`}>{topic}</Link>
              {isPrivate && (
                <>
                  <BsDot size={16} />
                  <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                    College Only
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <PostDropdown
          removePostOnAction={removedPostOnAction}
          bookmarked={bookmarked}
          id={id}
          type="post"
          key={id}
          editableData={profile.username === username ? { title, content, topic, isPrivate } : null}
        />
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 pt-1">{content}</p>
      </CardContent>
      <CardFooter>
        <EngagementComponent userVote={userVote} id={id} targetType="post" initialCounts={{ upvotes: upvoteCount, downvotes: downvoteCount, comments: commentsCount, views: viewsCount }} key={title} show={['upvotes', "downvotes", 'comments', 'views', "share"]} />
      </CardFooter>
    </Card>
  )
}

export default Post
