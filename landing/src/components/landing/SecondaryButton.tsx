"use client";

import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedShinyText } from "../magicui/animated-shiny-text";

function SecondaryButton() {
  return (
    <div
      className={cn(
        "group rounded-full border border-[#e2d1c3] bg-[#fdfcfb] text-base text-zinc-950 transition-all ease-in hover:cursor-pointer hover:bg-[#f1e7db]",
      )}
    >
      <AnimatedShinyText
        onClick={() => window.open("https://x.com/useFlick", "_blank")}
        className="inline-flex text-xs md:text-sm cursor-pointer items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300"
      >
        <span>✨ Follow Flick on X</span>
        <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
      </AnimatedShinyText>
    </div>
  );
}

export default SecondaryButton;
