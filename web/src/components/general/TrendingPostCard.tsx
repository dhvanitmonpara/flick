import { BsEye } from "react-icons/bs";
import { Card } from "../ui/card";
import { TrendingPost } from "@/types/TrendingPost";

interface TrendingPostCardProps extends TrendingPost {
  rank: number;
}

function TrendingPostCard({
  title,
  category,
  time,
  views,
  rank,
}: TrendingPostCardProps) {
  return (
    <Card className="group rounded-none border-0 bg-transparent p-3 transition-colors hover:bg-zinc-100/80 dark:hover:bg-zinc-900/70">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {rank}
            </span>
            <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
              {category}
              <span className="ml-1 text-zinc-500 dark:text-zinc-500">
                {time}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-zinc-200/80 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <BsEye className="text-[11px]" />
            <span>{views}</span>
          </div>
        </div>
        <h5 className="line-clamp-2 text-sm font-medium text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
          {title}
        </h5>
      </div>
    </Card>
  );
}

export default TrendingPostCard;
