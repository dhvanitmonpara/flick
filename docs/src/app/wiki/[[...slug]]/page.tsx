import { notFound } from "next/navigation";
import { WikiMarkdown } from "@/components/wiki-markdown";
import { WikiShell } from "@/components/wiki-shell";
import {
  countWikiPages,
  getAllWikiSlugPaths,
  getDefaultWikiHref,
  getWikiNav,
  getWikiPage,
} from "@/lib/wiki";

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugPaths = await getAllWikiSlugPaths();

  return slugPaths.map((slug) => ({
    slug,
  }));
}

export default async function WikiPage({ params }: PageProps) {
  const { slug } = await params;
  const currentSlug = slug?.length ? slug : ["getting-started"];

  try {
    const [page, nav, pageCount] = await Promise.all([
      getWikiPage(currentSlug),
      getWikiNav(),
      countWikiPages(),
    ]);

    return (
      <WikiShell
        pageCount={pageCount}
        currentSlug={page.slugParts}
        currentTitleParts={page.titleParts}
        relativePath={page.relativePath}
        nav={nav}
        defaultHref={getDefaultWikiHref()}
      >
        <WikiMarkdown content={page.content} slugParts={page.slugParts} />
      </WikiShell>
    );
  } catch {
    notFound();
  }
}
