import { confirmedText } from "./placeholders";

export function configuredOrigin(domain: string): string | undefined {
  if (!confirmedText(domain)) return;
  try {
    const url = new URL(domain);
    if (/^https?:$/.test(url.protocol) && !url.username && !url.password)
      return url.origin;
  } catch {
    /* 未配置域名时保留由调用方决定的回退。 */
  }
}

export function indexingAssets(allowIndexing: boolean, domain: string) {
  if (!allowIndexing) {
    return {
      robots: "User-agent: *\nDisallow: /\n",
      headers: "/*\n  X-Robots-Tag: noindex, nofollow\n",
    };
  }

  const origin = new URL(domain);
  if (!/^https?:$/.test(origin.protocol)) {
    throw new Error("允许收录前必须配置有效的 HTTP(S) 网站域名");
  }
  const sitemap = new URL("/sitemap-index.xml", origin).href;
  return {
    robots: `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`,
    headers: "# Indexing is enabled in src/data/site.json.\n",
  };
}
