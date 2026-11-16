# Cupcake Liners and Baking Cups

## Local development

Use the Node.js version in `.node-version`.

```sh
npm ci --ignore-scripts
npm run dev
```

```sh
npm run build
npm run check
npm run lint
```

Run `npm run format` to format the source files or `npm run preview` to serve the production build locally.

## Review screenshots

Build the site and install Playwright's Chromium before capturing the routes listed in `scripts/pages.json`.

```sh
npm run build
npx playwright install chromium
npm run screenshots -- M0
```

The script starts a local preview and saves full-page desktop and mobile PNGs in `docs/reviews/M0/`.

## Deploy to Cloudflare Workers

The site uses [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) at <https://dulizhan.pengshang01.workers.dev>.

PR previews depend on the `previews` configuration in `wrangler.jsonc`.

1. In the Worker settings, connect this GitHub repository through **Workers Builds**. Use `main` as the production branch and the repository root as the build root.
2. Set the build command to `npm run build` and the deploy command to `npx wrangler deploy`. The Node.js version is set in `.node-version`.
3. Keep `assets.directory` in `wrangler.jsonc` set to `./dist`, which is Astro's static build output. Builds from `main` update the deployed Worker; PR preview URLs depend on the configured Workers Builds branch settings and must be verified before sharing.
4. `assets.not_found_handling: "404-page"` serves the nearest `404.html` with status 404. Until M6 adds the custom page, missing routes return the platform's empty 404 response. It does not return the homepage for missing URLs.

M5 will add a Worker script for `/api/inquiry`, a `main` entry and an `ASSETS` binding, with `assets.run_worker_first: ["/api/*"]`. No API script is deployed in this milestone. Worker-generated responses will need their own response headers; static `_headers` rules do not apply to them.

## Site configuration

Supply verified factory details in `src/data/site.json` through Pages CMS. See [the Chinese CMS guide](docs/CMS.md). Set `domain` to the full HTTPS site origin when it is known so Astro can generate the sitemap.

Copy `.env.example` to `.env` for local service configuration. Configure future runtime secrets in the Cloudflare Worker settings; keep `.dev.vars` local and ignored. The current static build runs with the variables empty.

| Variable                    | Purpose                                |
| --------------------------- | -------------------------------------- |
| `PUBLIC_GA_ID`              | Public GA4 measurement ID              |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile widget site key       |
| `TURNSTILE_SECRET_KEY`      | Server-side Turnstile verification key |
| `RESEND_API_KEY`            | Server-side Resend API key             |
| `INQUIRY_TO_EMAIL`          | Address that receives inquiries        |
| `INQUIRY_FROM_EMAIL`        | Verified inquiry sender address        |

## 内容维护与双语页面

工厂人员请阅读 [Pages CMS 操作指南](docs/CMS.md)。产品与分类维护于 `src/content/products/*.json`、`src/content/categories/*.json`，界面字段由根目录 `.pages.yml` 定义。分类文件名即 id，产品文件名须与 slug 一致；上传图片通过 Astro 优化。没有产品的分类自动隐藏。

访客内容统一使用 `{ en, zh }`；英文必填，中文留空回退英文。网站设置、FAQ、定制流程、案例、团队以 `src/data/*.json` 为唯一来源，固定界面文字在 `src/i18n/en.json` / `zh.json`。英文保留根路径，中文在 `/zh/`；两种语言共用页面组件、分类 id 和产品 slug，页头语言切换前往对应页面。

两种语言共用浏览器询价清单 `inquiry:v1`，数量可留空（null / 待沟通）；支持正整数与规范千分位，存储不可用时仅当前页面内存有效。`/contact/?from=inquiry` 和 `/zh/contact/?from=inquiry` 显示对应语言的只读摘要，表单提交仍在 M5 接入。

中文站优先显示微信悬浮入口；微信未配置时回退 WhatsApp。正式微信号和二维码请在 CMS 的网站设置填写；缺少资料时保持 TODO / 空，不使用截图测试号。

运行 `npm test` 检查询价、双语回退、CMS 空值、分类可见性和收录开关。`npm run screenshots -- M4c` 生成中英文页面及独立微信测试状态截图，不修改正式联系方式。CMS 保存到 main 触发 GitHub CI 和已连接的 Workers Builds；以部署结果为准。

## 搜索引擎收录开关

`src/data/site.json` 的 `allowIndexing` 默认 `false`。M8 前保持关闭：所有静态资源响应带 `X-Robots-Tag: noindex, nofollow`，`robots.txt` 为 `Disallow: /`，页面也输出禁止收录的 meta。

M8 确认上线后，只需在 CMS 开启“允许搜索引擎收录”（或将 JSON 的 `allowIndexing` 改为 `true`）并重新构建部署。`scripts/indexing.ts` 在构建完成时生成 `dist/robots.txt` 与 `dist/_headers`：允许抓取、指向当前域名的 `/sitemap-index.xml`，移除全站 noindex 响应头。Inquiry 与 Styleguide 自身仍为 noindex。`public/` 中的两个源文件保持默认禁止收录，不需要手动同步修改。

## 工作记录

项目工作记录统一保存在 `docs/notes/status.md`、`docs/notes/history.md`、`docs/notes/decisions.md`。日常进度不再写到根目录；历史审核证据保留在 `docs/reviews/`。
