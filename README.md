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
2. Set the build command to `npm run build`, the production deploy command to `npx wrangler deploy`, and the Preview command to `npx wrangler preview`. The Node.js version is set in `.node-version`.
3. Keep `assets.directory` in `wrangler.jsonc` set to `./dist`, which is Astro's static build output. Builds from `main` update the deployed Worker; PR preview URLs depend on the configured Workers Builds branch settings and must be verified before sharing.
4. `assets.not_found_handling: "404-page"` serves the nearest `404.html` with status 404. Until M6 adds the custom page, missing routes return the platform's empty 404 response. It does not return the homepage for missing URLs.

PR 预览的命令在 Cloudflare → Worker → Settings → Build 中单独配置。若失败日志显示 `Executing user deploy command: npx wrangler versions upload`，说明该次构建仍使用旧命令；核对当前预览的有效配置，将 Preview command 设置为 `npx wrangler preview`，保存后 Retry build。生产 Deploy command 继续使用 `npx wrangler deploy`。以新日志实际执行的命令为准，不为此修改 `wrangler.jsonc` 的 `name` 或移除身份校验变量。若公共配置已正确，还需核对已有分支预览的独立设置。[构建设置与重试](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#build-settings)、[预览配置说明](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/#view-and-update-build-settings)

`src/worker/index.ts` handles POST `/api/inquiry`. The `main` entry, `ASSETS` binding and `assets.run_worker_first: ["/api/*"]` keep API requests on the Worker while other requests use static assets. Worker-generated responses set their own indexing headers; static `_headers` rules do not apply to them.

## Site configuration

Supply verified factory details in `src/data/site.json` through Pages CMS. See [the Chinese CMS guide](docs/CMS.md). Set `domain` to the full HTTPS site origin when it is known so Astro can generate the sitemap.

`.env.example` lists variable names only. Local `.env` contains public build variables; local `.dev.vars` contains Worker runtime configuration. Both remain outside Git. See the configuration steps below. Static pages still build without service credentials; the form reports unavailable until configured.

## 询盘表单配置

表单位于中英文联系页和产品详情页底部，提交到同一 Worker API。先完成以下配置，再测试实际发信；工厂对外联系方式和预计回复时间仍在 Pages CMS 的网站设置中维护。

### 1. 申请 Cloudflare Turnstile

1. 登录 Cloudflare，打开 **Turnstile → Add widget**，填写便于识别的名称，模式选择 **Managed**。
2. 在 Hostname management 中添加 `dulizhan.pengshang01.workers.dev`；正式域名启用后再添加正式域名。若 PR 预览使用另一主机名，也添加实际预览主机名。
3. 这里只填主机名，不填 `https://`、端口、路径或 `*`。保存后取得 **Site key** 和 **Secret key**，分别放入下表对应位置。

操作依据：[创建 Turnstile widget](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/)和[主机名规则](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)。

### 2. 注册 Resend 并配置发信

1. 注册并登录 [Resend](https://resend.com)，完成账号邮箱验证。在 **API Keys → Create API Key** 创建网站专用 key，权限选择 **Sending access**；有已验证域名后可限制为该域名。创建后妥善保存 key，它只用于 Worker 运行时配置。[API key 说明](https://resend.com/docs/dashboard/api-keys/introduction)
2. **没有自己的域名时**，`INQUIRY_FROM_EMAIL` 使用 Resend 测试发件地址 `onboarding@resend.dev`，`INQUIRY_TO_EMAIL` 必须填写注册 Resend 的账号邮箱。此测试地址不能给任意业务员邮箱发信；网站的 `workers.dev` 地址也不属于工厂自有发件域名。[测试地址限制](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)
3. 正式上线绑定自有域名后，在 Resend **Domains → Add Domain** 添加发件域名，按其 **Records** 页逐条添加 SPF / DKIM 所需 DNS 记录，再点击 **Verify DNS Records**。记录名称、类型和值以该账号界面为准；可能是 TXT、MX 或 CNAME，不复制别人的记录。验证成功后，将 `INQUIRY_FROM_EMAIL` 改为该已验证域名下的发件地址，`INQUIRY_TO_EMAIL` 改为实际收件邮箱。[域名验证及 DNS 记录](https://resend.com/docs/dashboard/domains/manage-domains)

客户填写的邮箱用作邮件 Reply-To；业务员在收到的询盘邮件里点击“回复”，收件人应为客户邮箱。

### 3. 在 Cloudflare 填写变量

Cloudflare 控制台的 **Workers & Pages** 是菜单名称；本项目选择 Worker `dulizhan`，不创建 Pages 项目。

| 变量                        | 用途                               | 填写位置                                                 |
| --------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `PUBLIC_TURNSTILE_SITE_KEY` | 浏览器中的 Turnstile Site key      | Worker → Settings → Build → Build variables and secrets  |
| `PUBLIC_GA_ID`              | 公开的 GA4 ID，M6 再接入，目前可空 | 同上                                                     |
| `TURNSTILE_SECRET_KEY`      | 服务端 Turnstile Secret key        | Worker → Settings → Variables and Secrets → Add → Secret |
| `RESEND_API_KEY`            | Resend 发信 API key                | 同上                                                     |
| `INQUIRY_TO_EMAIL`          | 接收询盘的邮箱                     | 同上，作为 Secret 保存                                   |
| `INQUIRY_FROM_EMAIL`        | 测试或已验证域名的发件邮箱         | 同上，作为 Secret 保存                                   |

构建变量只用于生成静态页面，运行时不会自动取得它们。修改 `PUBLIC_TURNSTILE_SITE_KEY` 后，在 Builds 重新构建部署；运行时四项填写后，保存并部署对应 Worker 版本。若测试 PR 预览，确认对应预览的运行时配置也已设置。不要把 API key 或 Secret key 放进 `PUBLIC_` 变量、`site.json`、CMS、源码或 `wrangler.jsonc`。[Build variables 与运行时区别](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)、[添加运行时 Secret](https://developers.cloudflare.com/workers/configuration/secrets/)

### 4. 本地与部署后测试

本地将 `.env.example` 的 `PUBLIC_` 项填入未提交的 `.env`；将其余四项填入未提交的 `.dev.vars`，格式为 `变量名=值`。`.dev.vars` 与 `wrangler.jsonc` 放在同一目录，Wrangler 从这里读取运行时配置。不要将本地文件上传到 GitHub。[本地 secrets 说明](https://developers.cloudflare.com/workers/configuration/secrets/)

```sh
npm run build
npx wrangler dev
```

打开终端显示的本地网址，访问 `/contact/` 或 `/zh/contact/`。`npm run dev` / `npm run preview` 只运行 Astro 页面，不提供 Worker API。localhost 未设 Site key 时使用官方测试 widget；与其配对的测试 Secret key 请从 [Turnstile 官方测试页](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)取得，仅填入本地 `.dev.vars`。正式域名必须改用自己的 Site key 和 Secret key。

M5 本地验收采用独立测试入口 `scripts/inquiry-test-worker.ts`（正式 wrangler.jsonc 不引用它）：仍调用正式业务处理逻辑，使用 Turnstile 官方测试验证，仅替换 Resend 出站请求为 mock，并检查生成的邮件内容。生产 Worker 没有 mock 开关。该验证不代表邮件已真实送达；实际发信需按上面的 Resend 配置，用自己控制的邮箱测试。

配置完成后，中英文各提交一次：先加入两个产品，一项填数量、一项留空，再填写必填字段并提交。检查感谢页、询价清单清空，以及收件箱里的语言、产品表格、样品选项、来源页面与 UTM；点击回复，确认客户邮箱正确。预计回复时间来自 `site.json` 的 `replyTime`，未确认前保留 TODO。

遇到提示时，按下面排查；不要反复点击提交：

| 现象               | 检查方法                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 必填项或格式错误   | 按字段提示补齐；询价清单数量可以留空，填写时必须为正整数                                                          |
| 验证失败 / 403     | 检查 Turnstile 主机名、Site key 与 Secret key 是否配对；验证过期后刷新验证再提交                                  |
| 表单暂不可用 / 503 | 检查四项 Worker 运行时配置是否齐全，以及构建变量是否已重新构建生效                                                |
| 发信失败           | 到 Resend 查看发送日志，核对 API key 权限、发件域名和测试收件限制；保留填写内容，稍后重试或使用页面列出的联系方式 |

Cloudflare 的构建日志检查部署问题；Resend 的发送日志检查是否接受发信。不要把密钥、完整客户表单或邮件正文复制到公开 issue / PR 中。

## 内容维护与双语页面

工厂人员请阅读 [Pages CMS 操作指南](docs/CMS.md)。产品与分类维护于 `src/content/products/*.json`、`src/content/categories/*.json`，界面字段由根目录 `.pages.yml` 定义。分类文件名即 id，产品文件名须与 slug 一致；上传图片通过 Astro 优化。没有产品的分类自动隐藏。

访客内容统一使用 `{ en, zh }`；英文必填，中文留空回退英文。网站设置、FAQ、定制流程、案例、团队以 `src/data/*.json` 为唯一来源，固定界面文字在 `src/i18n/en.json` / `zh.json`。英文保留根路径，中文在 `/zh/`；两种语言共用页面组件、分类 id 和产品 slug，页头语言切换前往对应页面。

两种语言共用浏览器询价清单 `inquiry:v1`，数量可留空（null / 待沟通）；支持正整数与规范千分位，存储不可用时仅当前页面内存有效。联系页与产品详情页表单读取清单，显示对应语言的只读摘要并随询盘发送；提交成功后清空清单。

中文站优先显示微信悬浮入口；微信未配置时回退 WhatsApp。正式微信号和二维码请在 CMS 的网站设置填写；缺少资料时保持 TODO / 空，不使用截图测试号。

运行 `npm test` 检查询价、Worker API、双语回退、CMS 空值、分类可见性和收录开关。`npm run screenshots -- M5` 生成中英文表单、感谢页及审核指定状态截图，不修改正式联系方式。CMS 保存到 main 触发 GitHub CI 和已连接的 Workers Builds；以部署结果为准。

## 搜索引擎收录开关

`src/data/site.json` 的 `allowIndexing` 默认 `false`。M8 前保持关闭：所有静态资源响应带 `X-Robots-Tag: noindex, nofollow`，`robots.txt` 为 `Disallow: /`，页面也输出禁止收录的 meta。

M8 确认上线后，只需在 CMS 开启“允许搜索引擎收录”（或将 JSON 的 `allowIndexing` 改为 `true`）并重新构建部署。`scripts/indexing.ts` 在构建完成时生成 `dist/robots.txt` 与 `dist/_headers`：允许抓取、指向当前域名的 `/sitemap-index.xml`，移除全站 noindex 响应头。Inquiry、Thank You 与 Styleguide 自身仍为 noindex。`public/` 中的两个源文件保持默认禁止收录，不需要手动同步修改。

## 工作记录

项目工作记录统一保存在 `docs/notes/status.md`、`docs/notes/history.md`、`docs/notes/decisions.md`。日常进度不再写到根目录；历史审核证据保留在 `docs/reviews/`。
