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

const WIKI_ROOT_CANDIDATES = [
  path.resolve(process.cwd(), "content/repowiki"),
  path.resolve(process.cwd(), "../.qoder/repowiki/en/content"),
  path.resolve(process.cwd(), ".qoder/repowiki/en/content"),
];
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

let cachedWikiRoot: string | null = null;

const getWikiRoot = async () => {
  if (cachedWikiRoot) {
    return cachedWikiRoot;
  }

  for (const candidate of WIKI_ROOT_CANDIDATES) {
    if (await directoryExists(candidate)) {
      cachedWikiRoot = candidate;
      return candidate;
    }
  }

  throw new Error(
    `Wiki content directory not found. Checked: ${WIKI_ROOT_CANDIDATES.join(", ")}`,
  );
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
  let absoluteDir = await getWikiRoot();
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

  const fileItems: WikiNavItem[] = markdownFiles
    .map((entry): WikiNavItem | null => {
      const title = toTitle(entry.name);
      const slugParts = [...parentSlugParts, slugify(title)];
      const parentFolderSlug = parentSlugParts[parentSlugParts.length - 1];
      const hasSameNameAsParent = parentFolderSlug && slugify(title) === parentFolderSlug;

      if (hasSameNameAsParent) {
        return null;
      }

      return {
        title,
        slugParts,
        href: pageHref(slugParts),
      };
    })
    .filter((item): item is WikiNavItem => item !== null);

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

export const getWikiNav = async () => buildNavTree(await getWikiRoot());

export const getDefaultWikiHref = () => pageHref(DEFAULT_PAGE.map(slugify));

export const getAllWikiSlugPaths = async (): Promise<string[][]> => {
  const walk = async (
    absoluteDir: string,
    parentSlugParts: string[] = [],
  ): Promise<string[][]> => {
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
    const results: string[][] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const sectionSlugParts = [...parentSlugParts, slugify(entry.name)];
        const sectionIndexPath = path.join(
          absoluteDir,
          entry.name,
          `${entry.name}.md`,
        );

        if (await fileExists(sectionIndexPath)) {
          results.push(sectionSlugParts);
        }

        results.push(
          ...(await walk(path.join(absoluteDir, entry.name), sectionSlugParts)),
        );
        continue;
      }

      if (!entry.isFile() || !isMarkdownFile(entry.name)) {
        continue;
      }

      const title = toTitle(entry.name);
      const parentFolderName = parentSlugParts[parentSlugParts.length - 1];
      if (parentFolderName && slugify(title) === parentFolderName) {
        continue;
      }

      results.push([...parentSlugParts, slugify(title)]);
    }

    return results;
  };

  return walk(await getWikiRoot());
};

export const getWikiPage = async (
  slugParts: string[] = DEFAULT_PAGE.map(slugify),
): Promise<WikiPage> => {
  const wikiRoot = await getWikiRoot();
  const safeSlugParts = sanitizeSlugParts(slugParts);
  const titleParts = await resolveSlugPath(safeSlugParts);
  const directRelativePath = `${path.join(...titleParts)}.md`;
  const directAbsolutePath = path.join(wikiRoot, directRelativePath);
  let relativePath = directRelativePath;
  let absolutePath = directAbsolutePath;

  if (!(await fileExists(directAbsolutePath))) {
    const sectionDirectoryPath = path.join(wikiRoot, ...titleParts);
    const sectionIndexRelativePath = path.join(
      ...titleParts,
      `${titleParts[titleParts.length - 1]}.md`,
    );
    const sectionIndexAbsolutePath = path.join(
      wikiRoot,
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
  const wikiRoot = await getWikiRoot();
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

  return walk(wikiRoot);
};
