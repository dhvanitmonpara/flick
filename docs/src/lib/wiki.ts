import { promises as fs } from "node:fs";
import path from "node:path";

export type WikiNavItem = {
  title: string;
  slugParts: string[];
  href?: string;
  children?: WikiNavItem[];
};

export type WikiPage = {
  title: string;
  titleParts: string[];
  slugParts: string[];
  href: string;
  content: string;
  relativePath: string;
};

const WIKI_ROOT = path.resolve(process.cwd(), "../.qoder/repowiki/en/content");
const DEFAULT_PAGE = ["Getting Started"];

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const pageHref = (slugParts: string[]) =>
  `/wiki/${slugParts.map((part) => encodeURIComponent(part)).join("/")}`;

const toTitle = (name: string) => name.replace(/\.md$/i, "");

const isMarkdownFile = (name: string) => name.toLowerCase().endsWith(".md");

const fileExists = async (absolutePath: string) => {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
};

const directoryExists = async (absolutePath: string) => {
  try {
    const stats = await fs.stat(absolutePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
};

const sanitizeSlugParts = (slugParts: string[]) => {
  const normalizedParts = slugParts.map((part) => decodeURIComponent(part));

  for (const part of normalizedParts) {
    if (!part || part === "." || part === ".." || part.includes("/")) {
      throw new Error("Invalid wiki slug");
    }
  }

  return normalizedParts;
};

const resolveSlugPath = async (slugParts: string[]) => {
  let absoluteDir = WIKI_ROOT;
  const titleParts: string[] = [];

  for (const slugPart of slugParts) {
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
    const match = entries.find((entry) => {
      const title = entry.isDirectory() ? entry.name : toTitle(entry.name);
      return slugify(title) === slugPart;
    });

    if (!match) {
      throw new Error("Wiki page not found");
    }

    const title = match.isDirectory() ? match.name : toTitle(match.name);
    titleParts.push(title);

    if (match.isDirectory()) {
      absoluteDir = path.join(absoluteDir, match.name);
    }
  }

  return titleParts;
};

const buildNavTree = async (
  absoluteDir: string,
  parentSlugParts: string[] = [],
): Promise<WikiNavItem[]> => {
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const fileItems: WikiNavItem[] = markdownFiles.map((entry) => {
    const title = toTitle(entry.name);
    const slugParts = [...parentSlugParts, slugify(title)];

    return {
      title,
      slugParts,
      href: pageHref(slugParts),
    };
  });

  const directoryItems = await Promise.all(
    directories.map(async (entry) => {
      const slugParts = [...parentSlugParts, slugify(entry.name)];
      const sectionIndexPath = path.join(
        absoluteDir,
        entry.name,
        `${entry.name}.md`,
      );

      return {
        title: entry.name,
        slugParts,
        href: (await fileExists(sectionIndexPath))
          ? pageHref(slugParts)
          : undefined,
        children: await buildNavTree(
          path.join(absoluteDir, entry.name),
          slugParts,
        ),
      } satisfies WikiNavItem;
    }),
  );

  return [...fileItems, ...directoryItems];
};

export const getWikiNav = async () => buildNavTree(WIKI_ROOT);

export const getDefaultWikiHref = () => pageHref(DEFAULT_PAGE.map(slugify));

export const getWikiPage = async (
  slugParts: string[] = DEFAULT_PAGE.map(slugify),
): Promise<WikiPage> => {
  const safeSlugParts = sanitizeSlugParts(slugParts);
  const titleParts = await resolveSlugPath(safeSlugParts);
  const directRelativePath = `${path.join(...titleParts)}.md`;
  const directAbsolutePath = path.join(WIKI_ROOT, directRelativePath);
  let relativePath = directRelativePath;
  let absolutePath = directAbsolutePath;

  if (!(await fileExists(directAbsolutePath))) {
    const sectionDirectoryPath = path.join(WIKI_ROOT, ...titleParts);
    const sectionIndexRelativePath = path.join(
      ...titleParts,
      `${titleParts[titleParts.length - 1]}.md`,
    );
    const sectionIndexAbsolutePath = path.join(
      WIKI_ROOT,
      sectionIndexRelativePath,
    );

    if (
      (await directoryExists(sectionDirectoryPath)) &&
      (await fileExists(sectionIndexAbsolutePath))
    ) {
      relativePath = sectionIndexRelativePath;
      absolutePath = sectionIndexAbsolutePath;
    }
  }

  const content = await fs.readFile(absolutePath, "utf8");
  const title = titleParts[titleParts.length - 1] ?? "Wiki";

  return {
    title,
    titleParts,
    slugParts: safeSlugParts,
    href: pageHref(safeSlugParts),
    content,
    relativePath,
  };
};

export const countWikiPages = async () => {
  const walk = async (absoluteDir: string): Promise<number> => {
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
    const totals = await Promise.all(
      entries.map(async (entry) => {
        if (entry.isDirectory()) {
          return walk(path.join(absoluteDir, entry.name));
        }

        return entry.isFile() && isMarkdownFile(entry.name) ? 1 : 0;
      }),
    );

    return totals.reduce((sum, count) => sum + count, 0);
  };

  return walk(WIKI_ROOT);
};
