import { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { toast } from "sonner";
import { env } from "@/config/env";
import { PiShareFatFill } from "react-icons/pi";

function ShareButton({ id }: { id: string }) {
  const [shared, setShared] = useState(false);

  const handleShare = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setShared(true);
    navigator.clipboard.writeText(`${env.NEXT_PUBLIC_BASE_URL}/p/${id}`);
    toast.success("Link copied to clipboard");
    setTimeout(() => {
      setShared(false);
    }, 5000);
  };
  return (
    <button
      className="group flex cursor-pointer items-center gap-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 py-2 px-3 rounded-full justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors shadow-sm"
      disabled={shared}
      onClick={handleShare}
      aria-label="Share"
    >
      {shared ? (
        <FaCheck className="text-green-500 text-base" />
      ) : (
        <PiShareFatFill className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 group-hover:scale-110 transition-all duration-300 text-base" />
      )}
    </button>
  );
}

export default ShareButton;
