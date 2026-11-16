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
