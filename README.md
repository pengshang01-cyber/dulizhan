# Cupcake Liners and Baking Cups

## 重新生成试点产品的 3D 模型

模型使用 Blender 后台建模和 Cycles CPU 法线烘焙。本次建模与复核使用 Blender 5.3.0。Windows 默认在 `Program Files\Blender Foundation` 中查找安装版本，其他安装位置可用 `BLENDER_PATH` 指定。macOS 和 Linux 也可使用 PATH 中的 `blender`。

```powershell
$env:BLENDER_PATH = 'C:\Program Files\Blender Foundation\Blender 5.3\blender.exe'
npm run models:build
npm test
```

输入是 `data/product-specs/` 中含 `modelAppearance` 的规格。脚本在 `.astro` 临时目录中烘焙、导出、压缩和检查全部模型，然后更新 `public/models/`。普通网站构建直接使用已提交的 GLB。更新列表封面和四视角核对图可运行 `node --experimental-strip-types scripts/models/render.ts`，需要本项目的 Playwright Chromium。[产品标准资料](docs/PRODUCT-DATA.md) · [M19 实拍与模型对照](docs/reviews/M19.md#第二轮修改)

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
npm test
npm run seo:check
npm run links:check
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

The production site is [junbeili.com](https://junbeili.com), hosted on [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/). [The workers.dev address](https://dulizhan.pengshang01.workers.dev) remains available for testing. Cloudflare redirects www.junbeili.com to the root domain with HTTP 301, preserving the path and query string.

PR previews depend on the `previews` configuration in `wrangler.jsonc`.

1. In the Worker settings, connect this GitHub repository through **Workers Builds**. Use `main` as the production branch and the repository root as the build root.
2. Set the build command to `npm run build`, the production deploy command to `npx wrangler deploy`, and the Preview command to `npx wrangler preview`. The Node.js version is set in `.node-version`.
3. Keep `assets.directory` in `wrangler.jsonc` set to `./dist`, which is Astro's static build output. The two `custom_domain` routes declare the root and www domains. `workers_dev: true` and `preview_urls: true` keep test and preview URLs enabled. Builds from `main` update production. Verify each PR preview URL once its separate build succeeds.
4. `assets.not_found_handling: "404-page"` serves the nearest `404.html` with status 404. The build includes English `/404.html` and Chinese `/zh/404.html`; unknown paths under `/zh/` use the Chinese page. `scripts/static-404.ts` converts Astro's Chinese directory page to the file Workers expects.

PR 预览的命令在 Cloudflare → Worker → Settings → Build 中单独配置。若失败日志显示 `Executing user deploy command: npx wrangler versions upload`，说明该次构建仍使用旧命令；核对当前预览的有效配置，将 Preview command 设置为 `npx wrangler preview`，保存后 Retry build。生产 Deploy command 继续使用 `npx wrangler deploy`。以新日志实际执行的命令为准，不为此修改 `wrangler.jsonc` 的 `name` 或移除身份校验变量。若公共配置已正确，还需核对已有分支预览的独立设置。[构建设置与重试](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#build-settings)、[预览配置说明](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/#view-and-update-build-settings)

`assets.run_worker_first: true` lets `src/worker/index.ts` redirect www requests even when they match existing assets. The Worker handles POST `/api/inquiry` and passes other non-API requests to `ASSETS`. This counts those requests toward the Workers request limit. Worker-generated API and redirect responses apply the indexing setting directly. [Static assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/#billing)

## Site configuration

Supply verified factory details in `src/data/site.json` through Pages CMS. The `domain` value is `https://junbeili.com` and controls canonical, social sharing and structured-data URLs. The factory can enable `allowIndexing` in the CMS after completing the launch checklist. A bilingual sitemap is generated when indexing is enabled. [CMS guide](docs/CMS.md) · [上线操作清单](docs/LAUNCH.md)

`.env.example` lists variable names only. Local `.env` contains public build variables; local `.dev.vars` contains Worker runtime configuration. Both remain outside Git. See the configuration steps below. Static pages still build without service credentials; the form reports unavailable until configured.

## 询盘表单配置

表单位于中英文联系页和产品详情页底部，提交到同一 Worker API。生产使用 Resend 已验证的发件域名 `junbeili.com`。发件和收件地址均为 `sales@junbeili.com`，Cloudflare Email Routing 将收到的邮件转发到工厂邮箱。网站公开展示的联系方式和预计回复时间在 Pages CMS 的“网站设置”维护。

### 1. Cloudflare Turnstile

1. 登录 Cloudflare，打开 **Turnstile → Add widget**，填写便于识别的名称，模式选择 **Managed**。
2. 正式域名 `junbeili.com` 已授权。在 Hostname Management 中核对该域名。若需在测试地址或 PR 预览提交，请分别授权对应主机名。
3. 这里只填主机名，不填 `https://`、端口、路径或 `*`。保存后取得 **Site key** 和 **Secret key**，分别放入下表对应位置。

操作依据：[创建 Turnstile widget](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/)和[主机名规则](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)。

### 2. Resend 发信与 Email Routing 收信

1. 在 Resend 的 **Domains** 核对 `junbeili.com` 为 **Verified**。如需调整 SPF / DKIM，按 Resend 的 **Records** 页核对 Cloudflare DNS 中的记录名称、类型和值。 [Resend 域名验证](https://resend.com/docs/dashboard/domains/manage-domains)
2. 在 Resend **API Keys** 使用有 **Sending access** 的网站专用 key，可将授权限制到已验证的发件域名。将 key 保存到 Worker 运行时变量 `RESEND_API_KEY`。 [Resend API key 说明](https://resend.com/docs/dashboard/api-keys/introduction)
3. 在 Cloudflare **junbeili.com → Email → Email Routing** 核对 `sales@junbeili.com` 指向已验证的工厂邮箱，并且规则处于启用状态。Cloudflare 负责收信转发，Resend 负责发信。 [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/get-started/enable-email-routing/)

客户填写的邮箱用作邮件 Reply-To；业务员在收到的询盘邮件里点击“回复”，收件人应为客户邮箱。

### 3. 在 Cloudflare 填写变量

Cloudflare 控制台的 **Workers & Pages** 是菜单名称；本项目选择 Worker `dulizhan`，不创建 Pages 项目。

| 变量                        | 用途                               | 填写位置                                                 |
| --------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `PUBLIC_TURNSTILE_SITE_KEY` | 浏览器中的 Turnstile Site key      | Worker → Settings → Build → Build variables and secrets  |
| `TURNSTILE_SECRET_KEY`      | 服务端 Turnstile Secret key        | Worker → Settings → Variables and Secrets → Add → Secret |
| `RESEND_API_KEY`            | Resend 发信 API key                | 同上                                                     |
| `INQUIRY_TO_EMAIL`          | 接收询盘的邮箱 sales@junbeili.com  | 同上，作为 Secret 保存                                   |
| `INQUIRY_FROM_EMAIL`        | Resend 发件地址 sales@junbeili.com | 同上，作为 Secret 保存                                   |

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

### 6. 安全验证失败的诊断

验证码显示“成功”只代表浏览器取得 token，还需要 Worker 调用 Siteverify 校验后才能发信。若更新 Secret key、刷新验证后仍提示失败，先读取诊断，不要反复轮换密钥。

1. 打开联系页，按 F12 打开开发者工具，选择 Network（网络），再选择 Fetch/XHR。
2. 使用自己的测试信息提交一次，点击列表中的 inquiry 请求，打开 Response（响应），找到 verification 对象。只分享这个诊断对象；Payload（请求正文）含客户资料和 token，不要分享。
3. 后端也会输出 inquiry.turnstile_verification_failed 日志，内容与 verification 相同。可在 Cloudflare → Worker → Observability 的实时日志中查看；本次不新增日志持久化配置。

| 诊断                                                        | 含义与处理                                                                                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| errorCodes 包含 invalid-input-secret / missing-input-secret | 检查生产 Worker 的 TURNSTILE_SECRET_KEY，确认来自前端 Site key 所属的同一个组件。                                             |
| errorCodes 包含 timeout-or-duplicate                        | token 已过期或用过；重新完成验证后提交，不重复使用旧请求。                                                                    |
| errorCodes 包含 invalid-input-response                      | token 被拒绝；检查 Site key / Secret key 是否配对、实际验证所在域名，以及浏览器验证状态；仅此错误码不足以判断某一个具体原因。 |
| reason 为 timeout / network_error                           | Worker 调用验证服务超时或网络异常；核查 Cloudflare 服务和出站请求情况。                                                       |
| reason 为 http_error / invalid_response，或 internal-error  | 核查上游 HTTP 状态及服务响应；不要绕过验证继续发信。                                                                          |

诊断只含固定 reason、可用时的 HTTP 状态与官方错误码白名单；不包含密钥、token、IP、表单资料、上游原文或异常文本。接口仍返回 403 / verification_failed，访客提示和重试逻辑保持一致。Worker 会去除 TURNSTILE_SECRET_KEY 的首尾空白，不改变密钥中间内容。

错误码依据：[Cloudflare Siteverify 文档](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#error-codes-reference)。

## 内容维护与双语页面

工厂人员请阅读 [Pages CMS 操作指南](docs/CMS.md)。产品与分类维护于 `src/content/products/*.json`、`src/content/categories/*.json`，界面字段由根目录 `.pages.yml` 定义。分类文件名即 id，产品文件名须与 slug 一致；上传图片通过 Astro 优化。没有产品的分类自动隐藏。

访客内容统一使用 `{ en, zh }`；英文必填，中文留空回退英文；博客正文单独使用 bodyEn / bodyZh，缺中文正文不生成中文文章。网站设置、FAQ、定制流程、案例、团队以 `src/data/*.json` 为唯一来源，固定界面文字在 `src/i18n/en.json` / `zh.json`。英文保留根路径，中文在 `/zh/`；两种语言共用页面组件、分类 id 和产品 slug，页头语言切换前往对应页面。

两种语言共用浏览器询价清单 `inquiry:v1`，数量可留空（null / 待沟通）；支持正整数与规范千分位，存储不可用时仅当前页面内存有效。联系页与产品详情页表单读取清单，显示对应语言的只读摘要并随询盘发送；提交成功后清空清单。

中文站优先显示微信悬浮入口；微信未配置时回退 WhatsApp。正式微信号和二维码请在 CMS 的网站设置填写；缺少资料时保持 TODO / 空，不使用截图测试号。

运行 `npm test` 检查询价、Worker API、双语回退、CMS 空值、分类可见性和收录开关。`npm run screenshots -- M5` 生成中英文表单、感谢页及审核指定状态截图，不修改正式联系方式。CMS 保存到 main 触发 GitHub CI 和已连接的 Workers Builds；以部署结果为准。

## 搜索引擎收录开关

`src/data/site.json` 的 `allowIndexing` 随 M8 保持 `false`。静态资源响应带 `X-Robots-Tag: noindex, nofollow`，`robots.txt` 为 `Disallow: /`，页面也输出禁止收录的 meta。

工厂核对资料后，在 CMS“网站设置”开启“允许搜索引擎收录”，保存并等待部署成功。`scripts/indexing.ts` 随构建生成允许抓取的 `robots.txt`，指向 [正式 sitemap](https://junbeili.com/sitemap-index.xml)，同时移除全站 noindex 响应头。Inquiry、Thank You、Styleguide 与两种语言的 404 自身继续 noindex，均排除于 sitemap。英文 `/llms.txt` 从网站设置和有产品的分类生成，遵循同一响应头规则。操作见 [上线清单](docs/LAUNCH.md)。

## SEO、统计与 Cookie 配置

在 Pages CMS 的“网站设置 → 访问统计 → GA4 衡量 ID”填写以 `G-` 开头的 Google Analytics 衡量 ID，保存并等待构建部署。唯一来源是 `src/data/site.json → analytics.gaMeasurementId`；不再使用旧的 PUBLIC_GA_ID 构建变量，已有后台变量可移除。衡量 ID 是公开标识，不是 API 密钥；不要在此处填写服务密钥。为 TODO 或空时，网站完全不加载 GA，也不显示 Cookie 横幅、页脚及隐私页的 Cookie 设置入口；填写有效 ID 后恢复以下同意流程。

已配置有效 ID 时，首次访问提供“接受 / 拒绝”两个同等样式的按钮。未同意时不加载 Google 脚本、不发送统计请求；接受后才加载。选择保存在本地 `analytics-consent:v1`，两种语言共用；存储读写失败时保持拒绝。可从页脚或隐私政策里的“Cookie 设置”重新选择；撤回后停用事件发送、删除本站可访问的 GA Cookie，之后访问不再加载 GA。询价单和发送询盘不依赖是否接受统计。[Google 基础同意模式说明](https://developers.google.com/tag-platform/security/concepts/consent-mode#basic_consent_mode)

统计事件为 whatsapp_click、wechat_open、wechat_copy、email_click、phone_click、quote_button_click、add_to_inquiry、generate_lead，每项带 language=en / zh。复制微信号成功、实际加入产品、询盘成功提交才记录对应完成事件；移出产品、字段校验失败、API 失败不计为转化。事件不携带姓名、邮箱、电话、微信号或留言；页面浏览地址去除 query/hash，推广参数仍按 M5 逻辑随询盘邮件发送。

**GA4 在中国大陆基本无法稳定使用，国内访客数据会缺失。** 不应把 GA4 报表视为国内流量总量；以后可另行接入百度统计，已记录为 PLAN 后续可选，本阶段不实现。

配置后可在浏览器开发者工具的 Network 检查：清除 Cookie 选择后，接受前及拒绝后都不应有 googletagmanager / google-analytics 请求；接受后才出现。打开 Cookie 设置改为拒绝，再访问其他页面验证停止加载。实际衡量 ID 配置后，再由工厂在自己的 GA4 实时报告确认事件。本仓库自动化使用独立内存配置及 Google 脚本替身，不向真实统计属性发送测试数据。

每次构建后运行 `npm run seo:check`；CI 同样执行。它检查全部 HTML 的 title / description / H1 / canonical、同语言重复、长度、hreflang 目标、JSON-LD 解析及 TODO、noindex 页面是否误入 sitemap。中文按全部 Unicode 字符数检查 30 / 80 上限，比仅计算汉字更严格。待工厂开启收录后，sitemap 会生成英文与中文对应关系并排除永久 noindex 页面。 [Astro sitemap i18n](https://docs.astro.build/en/guides/integrations-guide/sitemap/#i18n)

产品 SEO 字段未填写或为 TODO 时按语言生成；产品中文未填仍回退英文。JSON-LD 只使用已确认资料：公司名、真实联系方式、标志未提供时省略对应字段；FAQ 含待补政策的整条问答暂不进入 JSON-LD。不会为满足搜索结果展示要求补造价格、评分或评论。可选“网站标志”应上传真实标志，未提供时留空；默认分享图是明确标注 Placeholder 的 1200 × 630 本地图片。

隐私政策位于 /privacy-policy/ 与 /zh/privacy-policy/，顶部明确标注模板；M8 前核对实际运营主体、邮箱、服务使用情况和资料保存安排。表单提交处及页脚均链接当前语言政策。

M6 的双语 Cookie、隐私政策、404 与联系页声明历史截图保留于 docs/reviews/M6/。当前运行 `npm run screenshots -- M7`，验证无 GA 配置时隐藏入口，并使用隔离配置回归有效 ID 的统计同意流程。Workers 本地路由用 `npx wrangler dev` 验证；部署后分别访问一个不存在的英文路径和 /zh/ 路径，确认 HTTP 404 与页面语言。回退依据 [Workers 就近 404 规则](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/#custom-404-pages)。

## 工作记录

项目工作记录统一保存在 `docs/notes/status.md`、`docs/notes/history.md`、`docs/notes/decisions.md`。日常进度不再写到根目录；历史审核证据保留在 `docs/reviews/`。

## 博客、性能与上线资料

资讯文章在 Pages CMS 的“资讯文章”维护，唯一来源是 `src/content/blog/*.json`；两份 Markdown 正文由构建时的 `@astrojs/markdown-satteri` 渲染，浏览器不加载 Markdown 编辑或渲染库。参见 [发布文章指南](docs/CMS.md#10-如何发布文章)。封面与正文图片上传至 `src/assets/images/blog/`，路径为 `../../assets/images/blog/文件名`，由 Astro 优化为 WebP 并保留宽高。正文只保留文章排版元素，不执行 HTML 脚本或 iframe。

非草稿文章按日期倒序，每页九篇；中文站只展示有中文正文的文章。只有确实存在的语言版本才生成 hreflang 和语言切换。示例两篇保持 `draft: true`，不出现在公开列表、文章页面或 sitemap 中；[TODO] 提纲不属于可发布的正式内容。

每次构建后运行 `npm run links:check`，检查 dist 内中英文内部链接、下载文件和锚点，错误时返回非零状态；CI 已接入。`npm run screenshots -- M7` 包含默认博客空状态、无 GA 界面及独立临时发布的列表 / 文章截图，还验证 9+1 分页、缺中文正文、sitemap 和相关产品询价。测试临时文件逐个清理，原草稿与收录设置恢复；测试产物只在 .astro 中，不进入 dist。

运行 `npm run todo:report` 重新扫描网站设置、全部 data JSON、分类、产品及文章，更新资料清单中的自动区域。清单说明 CMS 填写位置、示例格式和实拍图建议。补齐后按上线清单开放收录并核验实际收件。 [待补资料](docs/LAUNCH-CHECKLIST.md) · [上线清单](docs/LAUNCH.md)

移动端 Lighthouse 本轮结果和运行方式见 [M7 审核报告](docs/reviews/M7.md)。中文字体仍使用系统字体；英文 DM Sans / Newsreader 仅加载实际使用字重的 Latin 子集。当前没有真实产品照片，性能结果不能替代补齐真实素材后的再次测试。

## 页面图片维护

在 Pages CMS 的“网站设置”上传网站 Logo、默认分享图、首页主图、车间照片与可选视频封面；图片说明支持中英文，图库可增删排序。留空时保持默认图标或占位图，无需改代码。步骤与尺寸建议见 [CMS 指南第 11 节](docs/CMS.md#11-如何更换首页主图车间照片logo)。

运行 npm run screenshots -- M7b 会截取默认设置及独立 CMS 测试设置；测试图片明确标注为占位图，完成后删除，正式 site.json 不被覆盖。Lighthouse 原始 HTML / JSON 放在已忽略的 docs/reviews/<里程碑>/lighthouse/，只提交审核报告中的分数摘要。
