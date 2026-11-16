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

Supply verified factory details in `src/data/site.json` through Pages CMS. See [the Chinese CMS guide](docs/CMS.md). Set `domain` to the full HTTPS site origin when it is known so Astro can generate the sitemap.

Copy `.env.example` to `.env` for local service configuration. Set deployment values in the Cloudflare Pages dashboard. The M0 build runs with the variables empty.

| Variable                    | Purpose                                |
| --------------------------- | -------------------------------------- |
| `PUBLIC_GA_ID`              | Public GA4 measurement ID              |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile widget site key       |
| `TURNSTILE_SECRET_KEY`      | Server-side Turnstile verification key |
| `RESEND_API_KEY`            | Server-side Resend API key             |
| `INQUIRY_TO_EMAIL`          | Address that receives inquiries        |
| `INQUIRY_FROM_EMAIL`        | Verified inquiry sender address        |

## 内容维护（M4.5）

工厂人员请阅读 [Pages CMS 操作指南](docs/CMS.md)。产品与分类维护于 `src/content/products/*.json`、`src/content/categories/*.json`，界面字段由根目录 `.pages.yml` 定义。分类文件名即 id，产品文件名须与 slug 一致；上传图片通过 Astro 优化。没有产品的分类自动隐藏。

访客内容统一使用 `{ en, zh }`；英文必填，中文留空回退英文。网站设置、FAQ、定制流程、案例、团队以 `src/data/*.json` 为唯一来源，固定界面文字在 `src/i18n/en.json` / `zh.json`。当前只生成英文路由。

浏览器询价清单使用 `inquiry:v1`，数量可留空（null / To be discussed）；支持正整数与规范千分位，存储不可用时仅当前页面内存有效。`/contact/?from=inquiry` 显示只读摘要，表单提交仍在 M5 接入。

运行 `npm test` 检查询价、双语回退、CMS空值及分类可见性。`npm run screenshots -- M4b` 截取默认英文页面和临时微信占位卡片；该测试不会修改生产联系方式。CMS 保存到 main 触发 CI；网站真正上线还需连接 Cloudflare Pages。
