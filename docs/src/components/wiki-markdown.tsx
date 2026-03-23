import type { ElementType, ReactNode } from "react";
import { slugify } from "@/lib/wiki";

type Block =
  | { type: "heading"; level: number; content: string }
  | { type: "paragraph"; content: string }
  | { type: "list"; ordered: boolean; items: ListItem[] }
  | { type: "code"; language: string; content: string }
  | { type: "blockquote"; content: string[] }
  | { type: "hr" };

type ListItem = {
  content: string;
  children?: {
    ordered: boolean;
    items: ListItem[];
  };
};

type CodeToken = {
  type:
    | "plain"
    | "comment"
    | "string"
    | "number"
    | "keyword"
    | "function"
    | "operator"
    | "punctuation";
  value: string;
};

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  js: [
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "import",
    "from",
    "export",
    "default",
    "async",
    "await",
    "new",
    "class",
    "try",
    "catch",
    "throw",
    "true",
    "false",
    "null",
    "undefined",
  ],
  jsx: [
    "const",
    "let",
    "function",
    "return",
    "import",
    "from",
    "export",
    "default",
    "async",
    "await",
    "true",
    "false",
    "null",
  ],
  ts: [
    "const",
    "let",
    "function",
    "return",
    "if",
    "else",
    "import",
    "from",
    "export",
    "default",
    "async",
    "await",
    "type",
    "interface",
    "extends",
    "implements",
    "public",
    "private",
    "protected",
    "readonly",
    "true",
    "false",
    "null",
    "undefined",
  ],
  tsx: [
    "const",
    "let",
    "function",
    "return",
    "import",
    "from",
    "export",
    "default",
    "async",
    "await",
    "type",
    "interface",
    "true",
    "false",
    "null",
  ],
  json: ["true", "false", "null"],
  bash: [
    "if",
    "then",
    "else",
    "fi",
    "for",
    "do",
    "done",
    "case",
    "esac",
    "in",
    "export",
  ],
  sh: [
    "if",
    "then",
    "else",
    "fi",
    "for",
    "do",
    "done",
    "case",
    "esac",
    "in",
    "export",
  ],
};

const PUNCTUATION = new Set(["{", "}", "[", "]", "(", ")", ",", ".", ";", ":"]);
const OPERATORS = new Set([
  "=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "!",
  "?",
  "<",
  ">",
  "|",
  "&",
]);

const getLanguageFamily = (language: string) => {
  const normalized = language.toLowerCase();
  if (normalized === "javascript") return "js";
  if (normalized === "typescript") return "ts";
  if (normalized === "shell" || normalized === "zsh") return "bash";
  return normalized;
};

const highlightCode = (content: string, language: string): CodeToken[] => {
  const family = getLanguageFamily(language);
  const keywords = new Set(LANGUAGE_KEYWORDS[family] ?? []);
  if (!keywords.size && family !== "json") {
    return [{ type: "plain", value: content }];
  }

  const tokens: CodeToken[] = [];
  let index = 0;

  const push = (type: CodeToken["type"], value: string) => {
    if (!value) return;
    tokens.push({ type, value });
  };

  while (index < content.length) {
    const char = content[index];
    const next = content[index + 1];

    if (char === "/" && next === "/") {
      let end = index + 2;
      while (end < content.length && content[end] !== "\n") end += 1;
      push("comment", content.slice(index, end));
      index = end;
      continue;
    }

    if (char === "#") {
      let end = index + 1;
      while (end < content.length && content[end] !== "\n") end += 1;
      push("comment", content.slice(index, end));
      index = end;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      const quote = char;
      let end = index + 1;
      while (end < content.length) {
        if (content[end] === "\\" && end + 1 < content.length) {
          end += 2;
          continue;
        }
        if (content[end] === quote) {
          end += 1;
          break;
        }
        end += 1;
      }
      push("string", content.slice(index, end));
      index = end;
      continue;
    }

    if (/\d/.test(char)) {
      let end = index + 1;
      while (end < content.length && /[\d._]/.test(content[end])) end += 1;
      push("number", content.slice(index, end));
      index = end;
      continue;
    }

    if (/[A-Za-z_$]/.test(char)) {
      let end = index + 1;
      while (end < content.length && /[A-Za-z0-9_$-]/.test(content[end]))
        end += 1;
      const word = content.slice(index, end);
      const nextTrimmed = content.slice(end).trimStart();

      if (keywords.has(word)) {
        push("keyword", word);
      } else if (nextTrimmed.startsWith("(")) {
        push("function", word);
      } else {
        push("plain", word);
      }
      index = end;
      continue;
    }

    if (PUNCTUATION.has(char)) {
      push("punctuation", char);
      index += 1;
      continue;
    }

    if (OPERATORS.has(char)) {
      let end = index + 1;
      while (end < content.length && OPERATORS.has(content[end])) end += 1;
      push("operator", content.slice(index, end));
      index = end;
      continue;
    }

    let end = index + 1;
    while (
      end < content.length &&
      !/[A-Za-z0-9_$'"`/#]/.test(content[end]) &&
      !PUNCTUATION.has(content[end]) &&
      !OPERATORS.has(content[end])
    ) {
      end += 1;
    }
    push("plain", content.slice(index, end));
    index = end;
  }

  return tokens;
};

const codeTokenClassName = (type: CodeToken["type"]) => {
  switch (type) {
    case "comment":
      return "text-[#6fa6ad]";
    case "string":
      return "text-[#f7c66d]";
    case "number":
      return "text-[#ff9f7f]";
    case "keyword":
      return "text-[#7dd3fc]";
    case "function":
      return "text-[#c4b5fd]";
    case "operator":
      return "text-[#fda4af]";
    case "punctuation":
      return "text-[#9bd3db]";
    default:
      return "text-code-fg";
  }
};

const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const getIndent = (line: string) => line.match(/^\s*/)?.[0].length ?? 0;

const matchListMarker = (line: string) => {
  const unordered = line.match(/^(\s*)[-*]\s+(.*)$/);
  if (unordered) {
    return {
      indent: unordered[1].length,
      ordered: false,
      content: unordered[2],
    };
  }

  const ordered = line.match(/^(\s*)\d+\.\s+(.*)$/);
  if (ordered) {
    return {
      indent: ordered[1].length,
      ordered: true,
      content: ordered[2],
    };
  }

  return null;
};

const parseList = (
  lines: string[],
  startIndex: number,
  baseIndent?: number,
): {
  block: Extract<Block, { type: "list" }>;
  nextIndex: number;
} => {
  const firstMatch = matchListMarker(lines[startIndex] ?? "");
  if (!firstMatch) {
    return {
      block: { type: "list", ordered: false, items: [] },
      nextIndex: startIndex,
    };
  }

  const targetIndent = baseIndent ?? firstMatch.indent;
  const items: ListItem[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const match = matchListMarker(line);

    if (!match) {
      const trimmed = line.trim();
      if (!trimmed) {
        index += 1;
        break;
      }

      if (items.length > 0 && getIndent(line) > targetIndent) {
        const currentItem = items[items.length - 1];
        currentItem.content = `${currentItem.content} ${trimmed}`.trim();
        index += 1;
        continue;
      }

      break;
    }

    if (match.indent < targetIndent || match.ordered !== firstMatch.ordered) {
      break;
    }

    if (match.indent > targetIndent) {
      const currentItem = items[items.length - 1];
      if (!currentItem) {
        break;
      }

      const nested = parseList(lines, index, match.indent);
      currentItem.children = nested.block;
      index = nested.nextIndex;
      continue;
    }

    const item: ListItem = { content: match.content.trim() };
    items.push(item);
    index += 1;

    while (index < lines.length) {
      const nextLine = lines[index] ?? "";
      const nextTrimmed = nextLine.trim();

      if (!nextTrimmed) {
        index += 1;
        break;
      }

      const nextMatch = matchListMarker(nextLine);
      if (nextMatch) {
        if (nextMatch.indent > targetIndent) {
          const nested = parseList(lines, index, nextMatch.indent);
          item.children = nested.block;
          index = nested.nextIndex;
          continue;
        }

        break;
      }

      if (getIndent(nextLine) > targetIndent) {
        item.content = `${item.content} ${nextTrimmed}`.trim();
        index += 1;
        continue;
      }

      break;
    }
  }

  return {
    block: {
      type: "list",
      ordered: firstMatch.ordered,
      items,
    },
    nextIndex: index,
  };
};

const parseBlocks = (markdown: string): Block[] => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^<\/?[a-z][^>]*>$/i.test(trimmed)) {
      index += 1;
      continue;
    }

    const codeMatch = trimmed.match(/^```([\w-]*)\s*$/);
    if (codeMatch) {
      const language = codeMatch[1] ?? "";
      const buffer: string[] = [];
      index += 1;

      while (
        index < lines.length &&
        !(lines[index] ?? "").trim().startsWith("```")
      ) {
        buffer.push(lines[index] ?? "");
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({ type: "code", language, content: buffer.join("\n") });
      continue;
    }

    if (/^---+$/.test(trimmed) || /^___+$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const buffer: string[] = [];

      while (
        index < lines.length &&
        (lines[index] ?? "").trim().startsWith(">")
      ) {
        buffer.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({ type: "blockquote", content: buffer });
      continue;
    }

    const listMatch = matchListMarker(line);
    if (listMatch) {
      const parsedList = parseList(lines, index);
      blocks.push(parsedList.block);
      index = parsedList.nextIndex;
      continue;
    }

    const buffer: string[] = [];
    while (index < lines.length) {
      const currentLine = lines[index] ?? "";
      const currentTrimmed = currentLine.trim();
      if (
        !currentTrimmed ||
        currentTrimmed.startsWith("#") ||
        currentTrimmed.startsWith(">") ||
        currentTrimmed.startsWith("```") ||
        /^[-*]\s+/.test(currentLine) ||
        /^\d+\.\s+/.test(currentLine) ||
        /^---+$/.test(currentTrimmed) ||
        /^___+$/.test(currentTrimmed)
      ) {
        break;
      }
      buffer.push(currentTrimmed);
      index += 1;
    }

    blocks.push({ type: "paragraph", content: buffer.join(" ") });
  }

  return blocks;
};

const resolveHref = (href: string, _slugParts: string[]) => {
  if (href.startsWith("#")) {
    return href;
  }

  if (href.startsWith("file://")) {
    return undefined;
  }

  if (!href.includes(".md")) {
    return href;
  }

  const [rawPath, rawHash] = href.split("#");
  const normalizedPath = rawPath.replace(/^\.\//, "").replace(/\.md$/, "");
  const targetParts = normalizedPath
    .split("/")
    .map((part) => decodeURIComponent(part))
    .filter(Boolean);

  if (targetParts.length === 0) {
    return rawHash ? `#${rawHash}` : undefined;
  }

  const finalPath = `/wiki/${targetParts
    .map((part) => encodeURIComponent(slugify(part)))
    .join("/")}`;
  return rawHash ? `${finalPath}#${rawHash}` : finalPath;
};

const renderInline = (content: string, slugParts: string[]): ReactNode[] => {
  const tokens = content
    .split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean);
  const tokenKeyCounts = new Map<string, number>();

  return tokens.map((token) => {
    const seen = tokenKeyCounts.get(token) ?? 0;
    tokenKeyCounts.set(token, seen + 1);
    const tokenKey = `${token}:${seen}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={tokenKey}
          className="rounded bg-code-chip-bg px-1.5 py-0.5 font-mono text-[0.95em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={tokenKey} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const resolvedHref = resolveHref(linkMatch[2], slugParts);

      if (!resolvedHref) {
        return (
          <code
            key={tokenKey}
            className="rounded bg-code-chip-bg px-1.5 py-0.5 font-mono text-[0.95em] text-muted-strong"
          >
            {linkMatch[1]}
          </code>
        );
      }

      return (
        <a
          key={tokenKey}
          href={resolvedHref}
          className="text-primary underline decoration-primary/30 underline-offset-4 transition hover:text-primary/80"
          target={resolvedHref.startsWith("http") ? "_blank" : undefined}
          rel={resolvedHref.startsWith("http") ? "noreferrer" : undefined}
        >
          {linkMatch[1]}
        </a>
      );
    }

    return token;
  });
};

export function WikiMarkdown({
  content,
  slugParts,
}: {
  content: string;
  slugParts: string[];
}) {
  const blocks = parseBlocks(content);
  const blockKeyCounts = new Map<string, number>();

  return (
    <div className="space-y-6 text-[15px] leading-7 text-muted-strong">
      {blocks.map((block) => {
        const blockSignature =
          block.type === "heading" || block.type === "paragraph"
            ? `${block.type}:${block.content}`
            : block.type === "list"
              ? `${block.type}:${block.ordered}:${JSON.stringify(block.items)}`
              : block.type === "blockquote"
                ? `${block.type}:${block.content.join("|")}`
                : block.type === "code"
                  ? `${block.type}:${block.language}:${block.content}`
                  : block.type;
        const blockSeen = blockKeyCounts.get(blockSignature) ?? 0;
        blockKeyCounts.set(blockSignature, blockSeen + 1);
        const blockKey = `${blockSignature}:${blockSeen}`;

        if (block.type === "heading") {
          const Tag = `h${Math.min(block.level + 1, 6)}` as ElementType;
          const headingId = slugifyHeading(block.content);
          const sizeClass =
            block.level === 1
              ? "text-4xl font-semibold tracking-tight text-foreground"
              : block.level === 2
                ? "text-2xl font-semibold tracking-tight text-foreground"
                : "text-lg font-semibold tracking-tight text-foreground";
          const marginClass =
            block.level === 1
              ? "mb-6"
              : block.level === 2
                ? "mt-12 mb-4"
                : "mt-8 mb-3";
          return (
            <Tag
              id={headingId}
              key={blockKey}
              className={`${sizeClass} ${marginClass} scroll-mt-24`}
            >
              {renderInline(block.content, slugParts)}
            </Tag>
          );
        }

        if (block.type === "paragraph") {
          return <p key={blockKey}>{renderInline(block.content, slugParts)}</p>;
        }

        if (block.type === "list") {
          const renderList = (
            listBlock: Extract<Block, { type: "list" }>,
            keyPrefix: string,
          ) => {
            const ListTag = listBlock.ordered ? "ol" : "ul";
            const itemKeyCounts = new Map<string, number>();

            return (
              <ListTag
                key={keyPrefix}
                className={`space-y-2 pl-6 ${
                  listBlock.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {listBlock.items.map((item) => {
                  const itemKey = JSON.stringify(item);
                  const seen = itemKeyCounts.get(itemKey) ?? 0;
                  itemKeyCounts.set(itemKey, seen + 1);

                  return (
                    <li key={`${itemKey}:${seen}`} className="pl-1">
                      <div>{renderInline(item.content, slugParts)}</div>
                      {item.children
                        ? renderList(
                            {
                              type: "list",
                              ordered: item.children.ordered,
                              items: item.children.items,
                            },
                            `${itemKey}:${seen}:children`,
                          )
                        : null}
                    </li>
                  );
                })}
              </ListTag>
            );
          };

          return renderList(block, blockKey);
        }

        if (block.type === "blockquote") {
          const lineKeyCounts = new Map<string, number>();

          return (
            <blockquote
              key={blockKey}
              className="rounded-2xl border-l-4 border-primary bg-quote-bg px-5 py-4 text-muted-strong italic shadow-sm"
            >
              {block.content.map((line) => {
                const seen = lineKeyCounts.get(line) ?? 0;
                lineKeyCounts.set(line, seen + 1);

                return (
                  <p key={`${line}:${seen}`}>{renderInline(line, slugParts)}</p>
                );
              })}
            </blockquote>
          );
        }

        if (block.type === "code") {
          const highlightedTokens = highlightCode(
            block.content,
            block.language,
          );

          return (
            <div
              key={blockKey}
              className="overflow-hidden rounded-2xl border border-border-strong bg-code-bg shadow-sm"
            >
              {block.language ? (
                <div className="border-b border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-muted">
                  {block.language}
                </div>
              ) : null}
              <pre className="overflow-x-auto p-4 text-sm leading-6 text-code-fg">
                <code>
                  {highlightedTokens.map((token, tokenIndex) => (
                    <span
                      key={`${token.type}:${tokenIndex}:${token.value}`}
                      className={codeTokenClassName(token.type)}
                    >
                      {token.value}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          );
        }

        return <hr key={blockKey} className="my-8 border-border" />;
      })}
    </div>
  );
}
