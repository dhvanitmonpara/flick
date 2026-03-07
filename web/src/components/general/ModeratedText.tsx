"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getModerationRevision,
  loadModerationConfig,
  moderateText,
  splitTextByMatches,
  subscribeModerationUpdates,
} from "@/utils/moderation";

type ModeratedTextProps = {
  text: string;
  className?: string;
  highlightedClassName?: string;
};

export default function ModeratedText({
  text,
  className,
  highlightedClassName = "text-red-600 font-bold",
}: ModeratedTextProps) {
  const [revision, setRevision] = useState(() => getModerationRevision());

  useEffect(() => {
    void loadModerationConfig();
    return subscribeModerationUpdates(() => {
      setRevision(getModerationRevision());
    });
  }, []);

  const parts = useMemo(() => {
    const result = moderateText(text);
    return splitTextByMatches(text, result.matches);
  }, [text, revision]);

  return (
    <p className={className}>
      {parts.map((part) => (
        <span
          key={part.key}
          className={part.flagged ? highlightedClassName : undefined}
        >
          {part.flagged ? "*".repeat(part.value.length) : part.value}
        </span>
      ))}
    </p>
  );
}
