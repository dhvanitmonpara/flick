"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { WikiNavItem } from "@/lib/wiki";

const isActiveTrail = (candidate: string[], current: string[]) =>
  candidate.every((part, index) => current[index] === part);

const filterTree = (items: WikiNavItem[], query: string): WikiNavItem[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return items;
  }

  return items.flatMap((item) => {
    const filteredChildren = item.children
      ? filterTree(item.children, normalizedQuery)
      : undefined;
    const matches = item.title.toLowerCase().includes(normalizedQuery);

    if (matches || (filteredChildren && filteredChildren.length > 0)) {
      return [{ ...item, children: filteredChildren }];
    }

    return [];
  });
};

const NavTree = ({
  items,
  currentSlug,
  depth = 0,
  forceExpanded = false,
}: {
  items: WikiNavItem[];
  currentSlug: string[];
  depth?: number;
  forceExpanded?: boolean;
}) => (
  <ul
    className={`space-y-1 ${depth > 0 ? "ml-4 border-l border-line pl-3" : ""}`}
  >
    {items.map((item) => {
      const active =
        Boolean(item.href) &&
        item.slugParts.join("/") === currentSlug.join("/");
      const expanded =
        forceExpanded || isActiveTrail(item.slugParts, currentSlug);
      const hasChildren = Boolean(item.children?.length);

      return (
        <li key={item.slugParts.join("/")}>
          {item.href ? (
            <Link
              href={item.href}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-muted-strong hover:bg-surface-strong hover:text-foreground"
              }`}
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center transition-transform duration-200 ${
                  expanded ? "rotate-90" : ""
                } ${active ? "text-primary" : "text-muted group-hover:text-muted-strong"}`}
              >
                {hasChildren ? (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-3 w-3 fill-current"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M3.5 2.25 8.25 6 3.5 9.75V2.25Z" />
                  </svg>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.title}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 px-3 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <svg
                  viewBox="0 0 12 12"
                  className="h-3 w-3 fill-current"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M3.5 2.25 8.25 6 3.5 9.75V2.25Z" />
                </svg>
              </span>
              <span>{item.title}</span>
            </div>
          )}
          {item.children && item.children.length > 0 && expanded ? (
            <NavTree
              items={item.children}
              currentSlug={currentSlug}
              depth={depth + 1}
              forceExpanded={forceExpanded}
            />
          ) : null}
        </li>
      );
    })}
  </ul>
);

export function WikiShell({
  pageCount: _pageCount,
  currentSlug,
  currentTitleParts,
  relativePath,
  nav,
  defaultHref,
  children,
}: {
  pageCount: number;
  currentSlug: string[];
  currentTitleParts: string[];
  relativePath: string;
  nav: WikiNavItem[];
  defaultHref: string;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const filteredNav = useMemo(() => filterTree(nav, query), [nav, query]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary)_14%,transparent),_transparent_30%),linear-gradient(180deg,_var(--background)_0%,_color-mix(in_srgb,var(--background)_82%,black_18%)_100%)] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 lg:px-8 lg:py-6">
        <div className="rounded-[32px] border border-border bg-surface shadow-[0_18px_60px_rgba(0,0,0,0.10)] backdrop-blur-xl">
          <div className="border-b border-border px-5 py-5 lg:px-8 lg:py-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Flick Knowledge Base
                  </p>
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                  Repository docs from <code>.qoder/repowiki</code>
                </h1>
                <p className="mt-2 text-base leading-relaxed text-muted-strong">
                  Search, browse, and read the generated project wiki without
                  leaving the repo.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-col justify-center rounded-2xl border border-border bg-surface-soft px-4 py-2.5 text-right text-sm shadow-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                    Reading
                  </div>
                  <div className="font-mono text-xs font-medium text-foreground">
                    {relativePath}
                  </div>
                </div>
                <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-surface-soft p-2.5 shadow-sm">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-[calc(100vh-160px)] grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="border-b border-border bg-surface-soft p-4 lg:border-r lg:border-b-0 lg:bg-transparent lg:p-6">
              <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-border lg:bg-surface-soft lg:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                <div className="border-b border-border/80 p-4 lg:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
                      Navigation
                    </h2>
                    <Link
                      href={defaultHref}
                      className="text-xs font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                    >
                      Reset
                    </Link>
                  </div>
                  <label className="relative block">
                    <span className="sr-only">Search docs navigation</span>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search pages..."
                      className="w-full rounded-xl border border-border bg-surface-strong py-2.5 pl-9 pr-3 text-sm font-medium text-foreground shadow-sm outline-none transition-all placeholder:text-muted hover:border-border-strong focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-3 pr-2 lg:max-h-[calc(100vh-210px)] lg:p-4">
                  {filteredNav.length > 0 ? (
                    <NavTree
                      items={filteredNav}
                      currentSlug={currentSlug}
                      forceExpanded={Boolean(query.trim())}
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-4 py-6 text-sm text-muted">
                      No pages matched{" "}
                      <span className="font-medium">{query}</span>.
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <section className="px-5 py-6 lg:px-10 lg:py-10">
              <div className="mb-8 flex items-center gap-2 border-b border-border pb-6">
                {currentTitleParts.map((segment, index) => {
                  const isLast = index === currentTitleParts.length - 1;
                  return (
                    <div
                      key={currentSlug.slice(0, index + 1).join("/")}
                      className="flex items-center gap-2"
                    >
                      <span
                        className={`text-sm font-medium ${
                          isLast ? "text-foreground" : "text-muted"
                        }`}
                      >
                        {segment}
                      </span>
                      {!isLast && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3 text-border-strong"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="max-w-4xl">{children}</div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
