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

## Deploy to Cloudflare Pages

1. Open **Workers & Pages** in Cloudflare, create a Pages project with Git integration, and select this repository.
2. Set the production branch to `main` and use the repository root as the build root.
3. Set the build command to `npm run build` and the output directory to `dist`. The Node.js version is set in `.node-version`.
4. Save the project and deploy. Cloudflare Pages creates preview deployments for branches when branch previews are enabled.

## Site configuration

Supply verified factory details in `src/config/site.ts`. Set `domain` to the full HTTPS site origin when it is known so Astro can generate the sitemap.

Copy `.env.example` to `.env` for local service configuration. Set deployment values in the Cloudflare Pages dashboard. The M0 build runs with the variables empty.

| Variable                    | Purpose                                |
| --------------------------- | -------------------------------------- |
| `PUBLIC_GA_ID`              | Public GA4 measurement ID              |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile widget site key       |
| `TURNSTILE_SECRET_KEY`      | Server-side Turnstile verification key |
| `RESEND_API_KEY`            | Server-side Resend API key             |
| `INQUIRY_TO_EMAIL`          | Address that receives inquiries        |
| `INQUIRY_FROM_EMAIL`        | Verified inquiry sender address        |

## 产品维护与询价清单（M3）

产品位于 `src/content/products/*.md`。复制示例后填写 frontmatter，保持 `slug` 和 `sku` 唯一，`category` 必须属于 `src/config/categories.ts` 的六个分类。产品图片使用本地资源的相对路径，第一张为主图。真实参数未提供时保留 `TODO_`；不要填写未经确认的 badge。

构建时根据 Markdown 自动生成列表、分类页及详情页。Schema 定义保留在 `src/content/config.ts`，由当前 Astro 使用的 `src/content.config.ts` 导出。缺少必填字段会使构建失败。

浏览器询价清单使用 `inquiry:v1` 保存产品和正整数数量；存储不可用时只在当前页面内存中保留。Header 显示产品条目数。清单页面为 `/inquiry/`，后续表单接入按 M5 执行。

运行 `npm test` 检查清单状态逻辑。`npm run screenshots -- M3` 包含空清单及实际加入两个示例产品后的截图，每个截图场景使用独立浏览器上下文。
