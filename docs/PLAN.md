# 执行计划 PLAN.md

原计划为 M0–M8，后续增加内容后台、中文站、图片维护和资料导入。当前执行 M15 审核修正。每个里程碑 = 一个分支 + 一个 PR + 一份审核报告。规则见 `AGENTS.md`。

| 里程碑 | 名称 | 分支 | 主要产出 |
| --- | --- | --- | --- |
| M0 | 仓库初始化 | `m0-setup` | Astro + Tailwind 项目、脚本、CI、站点配置文件 |
| M1 | 全站框架与设计系统 | `m1-layout` | 布局、页头页脚、按钮、WhatsApp 悬浮窗、样式规范页 |
| M2 | 首页 | `m2-homepage` | 完整首页 |
| M3 | 产品体系与询价清单 | `m3-products` | 产品数据结构、产品中心、分类页、详情页、前端询价清单 |
| M4 | 定制 / 关于 / FAQ / 联系 | `m4-pages` | 4 个内容页 |
| M4.5 | 内容后台、分类数据化与双语数据 | `m4b-cms` | Pages CMS、JSON 内容、双语字段与界面字典 |
| M4.6 | 中文站与微信联系 | `m4c-zh` | 共用页面双语路由、中文内容、微信浮层、Workers 部署与收录开关 |
| M5 | 询盘表单与后端 | `m5-inquiry` | 表单组件、Worker API、防垃圾、感谢页 |
| M6 | SEO 与统计 | `m6-seo` | meta、sitemap、结构化数据、GA4 事件、隐私政策、404 |
| M7 | 博客与性能 | `m7-blog-perf` | 博客系统、示例文章、性能优化、上线检查 |
| M7.5 | 图片全部后台化 | `m7b-images` | 网站设置图片上传、默认回退、资料清单与报告清理 |
| M8 | 正式域名与上线准备 | `m8-launch` | 域名配置、收录验证、LLMs 文本、工厂上线清单 |
| M9 | 产品与公司资料批量导入 | `m9-product-import` | 工厂工作簿、双语产品、逐行合并方案、待补图片清单 |
| M9.1 | 公开页面隐藏未补资料 | `m9-1-hide-todo` | 隐藏占位、保留产品链接、构建检查 |
| M10 | 产品图片挑选、处理与上线 | `m10-product-images` | 产品图库、分类封面、车间实拍、来源清单与预览 |
| M11 | 资料完善与页面调整 | `m11-content-layout` | Logo、微信、OEM 与 ODM、结构化规格与色样、工厂信任资料 |
| M14 | 成品展示图重做试点 | `m14-scene-retry` | 撤下旧展示图、重排锚定、装食物的审核候选 |
| M15 | 成品展示图第一批及去绿修正 | `m15-scenes-cups` | 产品图库、实拍去绿、尺寸复测与逐图审核 |

---

## M0 仓库初始化

**目标：** 一个能构建、能检查、能截图的空项目。

**任务**

1. 用最新稳定版 Astro 初始化项目（TypeScript strict），接入 Tailwind CSS、`@astrojs/sitemap`。
2. `package.json` 脚本：`dev`、`build`、`preview`、`check`（astro check）、`lint`（ESLint + Prettier 检查）、`format`、`screenshots`。
3. 写 `scripts/screenshots.ts`：启动 `preview`，读取 `scripts/pages.json` 里的路径列表，对每个路径截 desktop（1440×900）和 mobile（375×812）整页图，输出到 `docs/reviews/<参数>/`。
4. 建 `src/config/site.ts`，包含以下字段，值全部用 `TODO_` 占位：公司英文名、简称、域名、邮箱、电话、WhatsApp 号码（国际格式）、WhatsApp 预填消息、工厂地址、成立年份、日产能、出口国家数、花色数量、证书列表（名称 + 图片路径）、社媒链接（YouTube、TikTok、Instagram、Facebook、Pinterest、LinkedIn）。
5. 建 `.env.example`：`PUBLIC_GA_ID`、`PUBLIC_TURNSTILE_SITE_KEY`、`TURNSTILE_SECRET_KEY`、`RESEND_API_KEY`、`INQUIRY_TO_EMAIL`、`INQUIRY_FROM_EMAIL`。
6. GitHub Actions：PR 时运行 `npm ci`、`build`、`check`、`lint`。
7. 复制 `docs/reviews/TEMPLATE.md` 和 `.github/pull_request_template.md`（已在仓库中则保留）。
8. `README.md`：本地运行、部署到 Cloudflare Workers 的步骤（Workers Builds 从 GitHub main 自动构建；构建命令 `npm run build`，部署命令 `npx wrangler deploy`，静态资源目录 `./dist`）、环境变量说明。

**验收标准**

- [ ] `npm run build`、`npm run check`、`npm run lint` 全部通过
- [ ] `npm run screenshots -- M0` 能对首页占位页生成两张截图（或报告中写明环境不支持）
- [ ] `site.ts` 里没有任何编造的真实信息
- [ ] CI 在 PR 上运行并通过

---

## M1 全站框架与设计系统

**目标：** 所有页面共用的外壳和组件定型，后面只往里填内容。

**任务**

1. Tailwind 主题：主色、辅助色、中性色、圆角、阴影、字体（最多 2 种，用 `@fontsource` 本地加载，不引用 Google Fonts CDN）。
2. `BaseLayout.astro`：`<head>` 里预留 title / description / canonical / OG 标签的 props；页头、页脚、WhatsApp 悬浮按钮。
3. Header：logo 位（占位）、导航（Home、Products、Custom/OEM、About、Blog、FAQ、Contact）、右侧 “Get a Quote” 按钮；移动端汉堡菜单（无 JS 框架，原生 JS 或 `<details>`）。
4. Footer：公司信息、快捷链接、产品分类链接、联系方式、社媒图标、版权、Privacy Policy 链接。所有信息来自 `site.ts`。
5. 组件：`Button`（primary / secondary / ghost）、`QuoteButton`（链接到 `/contact/#quote`）、`WhatsAppFloat`（右下角，`https://wa.me/<号码>?text=<预填>`，带 `data-track="whatsapp_click"`）、`SectionHeading`、`Container`。
6. 建 `/styleguide` 页面（`noindex`）：展示颜色、字号、按钮、卡片等所有组件，方便审核视觉。
7. 7 个导航页面建空壳路由，各自一个 H1 占位。

**验收标准**

- [ ] 375px 宽度下所有页面无横向滚动，汉堡菜单可开合
- [ ] 导航所有链接可访问（无 404）
- [ ] WhatsApp 链接格式正确，号码来自 `site.ts`
- [ ] `/styleguide` 带 `<meta name="robots" content="noindex">`
- [ ] 截图：`styleguide`、`home`（desktop + mobile）

---

## M2 首页

**目标：** 访客 5 秒内明白“这是蛋糕纸杯源头工厂，可批发可定制”，并找到询盘入口。

**页面区块（按顺序）**

1. Hero：一句话定位（如 “Cupcake Liners & Baking Cups Manufacturer — Factory-Direct, Custom Printed”）、副标题、主按钮 Get a Quote、次按钮 View Products、背景用占位图。
2. 数字条：成立年份、日产能、出口国家数、花色数量（全部来自 `site.ts`）。
3. 产品分类卡片：读取产品分类（M3 前先用 `src/config/categories.ts` 占位数据，M3 再接真实数据）。
4. 四大卖点：花色多 / 食品级安全 / 工厂价大批量 / 支持定制，每个配图标和一句说明。
5. 定制服务简介 + 4 步流程图（Send Design → Mockup → Sample → Mass Production）+ 按钮到 `/custom/`。
6. 工厂视频区：嵌入 YouTube（用轻量嵌入：先显示缩略图，点击后再加载 iframe）。视频 ID 来自 `site.ts`，空则隐藏此区块。
7. 证书墙：读 `site.ts` 证书列表，空则隐藏。
8. FAQ 精选 3–5 条（数据与 M4 的 FAQ 页共用同一数据文件 `src/data/faq.ts`）。
9. 底部询盘 CTA 区块：标题 + Get a Quote 按钮（M5 按补充要求继续跳转联系页）。

**验收标准**

- [ ] 首屏（1440×900 和 375×812）内能看到定位语和 Get a Quote 按钮
- [ ] 没有编造的数字或证书，空值区块自动隐藏或显示 `[TODO]`
- [ ] YouTube 未点击前不加载 iframe
- [ ] 截图：`home`

---

## M3 产品体系

**目标：** 产品可用 Markdown 文件维护，新增产品不需要改代码。

**任务**

1. `src/content/config.ts` 定义 `products` schema（zod），通过当前 Astro 要求的 `src/content.config.ts` 入口导出：
   - `sku`（必填型号）、`badge`（可选，默认不填）、`title`、`slug`、`category`（枚举，见下）、`summary`（一句话）、`images`（数组，第一张为主图）、`material`、`gsm`、`sizes`（数组：`{ name, baseDiameterMm, heightMm, topDiameterMm? }`）、`colors` / `patterns`（数组）、`customizable`（布尔）、`moq`、`packaging`、`cartonSpec`、`leadTime`、`faqs`（数组：`{ q, a }`）、`seoTitle?`、`seoDescription?`、`featured`（布尔）、`order`（数字）
   - 分类枚举先用：`standard-liners`、`greaseproof-liners`、`foil-cups`、`tulip-cups`、`muffin-cups`、`hard-baking-cups`（工厂确认后再改，集中定义在 `src/config/categories.ts`，含每类的英文名、简介、封面图）
2. 写 3 个分属不同分类的示例产品 `.md`，参数全部用 `TODO_` 占位，型号使用 `TODO-001` 等明显占位；不填未经确认的 badge。正文包含定制选项、包装与应用场景，具体资料使用占位。
3. `/products/`：分类入口 + 全部产品网格，支持按分类筛选（纯静态：每个分类一个页面 `/products/<category>/`）。
4. `/products/<category>/<slug>/` 详情页：图片画廊（缩略图切换，原生 JS）、一句话卖点、参数表（尺寸表渲染成表格）、可选颜色/花色、定制选项、应用场景、该产品 FAQ、Get a Quote 按钮（链接带 `?product=<slug>`，M5 表单自动预填）、相关产品（同分类 4 个）。
5. 面包屑导航；首页、页脚和 Products 分类入口统一链接到分类页。
6. 共用 `ProductCard` 用于列表、分类和相关产品，含可选 badge、型号 / 分类名、衬线标题、首个尺寸摘要（待补时显示 `[TODO: size]`）、Ask for pricing 和独立询价按钮。详情标题下显示型号，Get a Quote 旁增加询价按钮。

### 三、询价清单（前端部分）

1. `src/lib/inquiry.ts` 使用 localStorage 键 `inquiry:v1` 保存 `{ slug, sku, title, category, quantity }`；所有存储读写包在 try/catch，存储不可用时退化为仅当前页面内存有效，每次变化派发 `inquiry:change`。
2. `AddToInquiryButton` 切换加入 / 移出状态，显示 `+ Add to inquiry` / `✓ Added`，同步 `aria-pressed`，页面加载恢复状态。
3. Header 在 Get a Quote 左侧增加 `/inquiry/` 链接，非空时显示产品条目数；手机可显示图标和数量，375px 无溢出。
4. `/inquiry/` 为 noindex，标题 Your Inquiry List；包含产品名、型号、详情链接、可选 pcs 数量（新项为空，表示 To be discussed；填写时只允许正整数）、删除、清空。继续按钮链接 `/contact/?from=inquiry#quote`，空状态显示 Browse Products。
5. 用 Vitest 测试增删、修改数量、存储异常退化，增加 `npm test`。M3 仅实现前端清单，表单提交与邮件接入在 M5 完成。

**验收标准**

- [ ] 新增一个 `.md` 文件后，`npm run build` 自动生成对应详情页和分类列表项
- [ ] schema 校验：缺必填字段时 build 报错
- [ ] 详情页参数表在 375px 下可横向滚动而不撑破页面
- [ ] `npm test` 通过，清单跨页面恢复、按钮和角标同步、存储异常时当前页仍可用
- [ ] 截图：`products`、一个分类页、一个详情页、`inquiry` 空状态及两个产品的状态

---

## M4 定制 / 关于 / FAQ / 联系

**任务**

1. `/custom/`：可定制项（logo、尺寸、颜色、图案、包装）、定制流程（与首页 4 步一致，可展开说明）、打样周期和 MOQ 说明（读 `site.ts`，空则 `[TODO]`）、定制案例区（数据 `src/data/cases.ts`，空则隐藏）、CTA。
2. `/about/`：工厂介绍（正文占位）、车间与设备图片区（占位图网格）、生产流程（印刷 → 成型 → 质检 → 包装 → 发货）、质检说明、证书墙、团队区（空则隐藏）。
3. `/faq/`：读取 `src/data/faq.ts`，按主题分组（Ordering、Samples、Shipping & Payment、Customization、Quality & Safety），用 `<details>` 折叠。先写约 12 条通用问题，答案里涉及具体数字的一律 `[TODO]`。
4. `/contact/`：联系方式卡片（邮箱、电话、WhatsApp、地址）、表单占位区块（`id="quote"`，M5 实现）、地图（用 Google Maps 嵌入链接，地址为空或 TODO 则隐藏）；`?from=inquiry` 时在表单占位上方显示只读产品摘要。
5. 完成 M3 审核修改：询价数量可选（空值为 `null`，保留旧合法数量），统一首页 / 产品详情 / FAQ 页的 `FaqAccordion`（+/− 样式，无默认三角）。
6. `site.ts` 增加 `stockMoq`、`customMoq`、`sampleLeadTime`、`productionLeadTime`、`sampleCost`、`paymentTerms`、`shippingMethods`，均用 TODO 占位；Custom / FAQ 从配置读取。Ordering 增加多产品询价说明，数量可留空。
7. About 生产流程采用五个编号步骤，桌面横向、手机纵向；车间图片保持明显 Placeholder。

**验收标准**

- [ ] 四个页面内容完整、无编造事实
- [ ] FAQ 数据与首页精选共用一个来源
- [ ] 截图：`custom`、`about`、`faq`、`contact`

---

## M4.5 内容后台、分类数据化与双语数据结构

**目标：** 工厂人员通过 Pages CMS 管理内容；英文为默认，本轮仅建立双语结构，中文页面在 M4.6 实现。此前 M3 / M4 中的 Markdown 产品、TS 静态数据约定由本节替代。

1. 分类与产品采用 JSON collections；分类文件名即 id，产品文件名与 slug 一致。预置指定的 12 类、迁移 3 个占位产品，产品正文改为可选的 customOptions / packagingDetails / applications 双语多行文本。
2. 所有访客内容使用 `{ en, zh }`，英文必填、中文缺失回退；公共数字 / 尺寸 / 图片 / sku / slug 不重复。localized 统一取值，固定文案从 en.json / zh.json 经 t 读取。
3. 所有分类入口只显示有产品的分类，无产品不生成分类页；首页 showOnHome 且有产品最多 6 类，更多时显示入口；手机筛选横向滚动。
4. site.json、faq.json、customization.json、cases.json、team.json 为唯一编辑源，读取时校验；微信号与二维码为空或 TODO 时隐藏，有效资料在 Contact 展示，悬浮入口仍为 WhatsApp。
5. 根目录 .pages.yml 使用官方 object / reference / image / list 等类型，七个内容入口和字段为中文说明；三组媒体路径对应产品、分类、网站资料。动态引用保存分类文件名，schema 归一为 id。
6. Astro i18n 仅启用 en，prefixDefaultLocale=false；CI 增加 main push；更新 AGENTS、README 与工厂向 docs/CMS.md。
7. 实际创建并清理一个双语产品和分类，报告附格式样例；验证图片路径、无效分类、必填英文和空正文。微信截图用明确的临时测试资料，恢复生产 TODO 后不保留假联系方式。

**验收：** build / check / lint / test 全通过；补 localized 与分类隐藏测试；screenshots -- M4b 覆盖指定页面和手机视口；报告 M4b.md 与 PR “M4.5: Content admin, data-driven categories and bilingual data”。

---

## M4.6 中文站上线

**目标：** 英文原网址保持不变，中文站在 `/zh/` 上线；复用同一套页面组件和业务数据。部署采用 Cloudflare Workers 静态资源，M8 前禁止搜索引擎收录。

**任务**

1. Astro i18n 启用 en / zh，英文根路径，中文生成首页、产品中心、分类 / 详情、定制、关于、博客占位、FAQ、联系及询价单；Styleguide 仅英文。分类 id / 产品 slug 共用，页面组件接收 locale，不复制两套页面实现。
2. Header 和手机菜单支持 EN / 中文同页切换；站内链接随当前语言生成。中文 html lang 为 zh-CN，页面输出 en、zh-CN、x-default 的 hreflang（x-default 指向英文）；无中文版本的 Styleguide 不生成不存在的 alternate。
3. 补齐 zh.json 界面文字、13 条 FAQ、定制流程及其他非产品中文内容，使用面向国内批发采购的商务中文；产品 zh 留给工厂在 CMS 填写，为空时回退英文，保留 TODO 和事实约束。
4. 中文标题 / 正文使用系统字体栈，不下载中文字体；英文与数字继续 Newsreader / DM Sans。中文标题取消负字距，行高 1.25–1.35，copper 强调使用正体。
5. 中文站优先微信悬浮入口：桌面浮层、手机底部面板，微信号 / 二维码、复制反馈、键盘与 Esc 关闭；微信未设时回退 WhatsApp。中文 Contact 顺序为微信、电话、WhatsApp、邮箱、地址；页脚按语言显示相应联系方式。
6. 询价存储共用 inquiry:v1，文字和详情链接随语言显示；中文继续按钮到 `/zh/contact/?from=inquiry#quote`，表单仍在 M5 接入。
7. 保留 main 的 wrangler.jsonc 含义，仅按 lint 格式化；验证 assets.directory 为 ./dist、404-page 的近邻 404.html 机制，正式 404 页面留至 M6。同步 Workers 部署及 M5 Worker API 计划，不实现 API。
8. site.json 增 allowIndexing=false；public/_headers 默认全路径 noindex,nofollow，robots.txt 默认 Disallow: /。构建按同一个开关生成最终文件，M8 开启后允许抓取、指向 sitemap 并去掉全站 noindex 响应头，页面 meta 同步。
9. 工作记录移至 docs/notes/history.md、status.md、decisions.md，后续工作记录不放根目录；更新 AGENTS、README、CMS 指南和相关说明。

**验收标准**

- [ ] build / check / lint / test 全部通过；验证对应语言链接、共享询价清单、回退及收录开关两种状态
- [ ] 375px 无页面横向溢出；微信浮层 / 面板可键盘操作并 Esc 关闭
- [ ] screenshots -- M4c 包含指定中文页面、微信桌面 / 手机状态及英文首页；未配置微信时使用独立明确的测试配置，不写入假联系方式
- [ ] 按模板写 M4c.md，附英文 → 中文界面文字对照表，并向 main 开 PR “M4.6: Chinese site and WeChat contact”

---

## M5 询盘表单与后端

**目标：** 在现有双语静态站接入可配置的 Worker 询盘 API，联系页及产品详情共用表单；首页保留联系页 CTA，不提前接入 M6 统计或正式 404。

**任务**

1. 修复中文 H1 / DisplayHeading：字号比英文缩小约 18%，使用平衡换行和独立短语块；在 1440、1024、375 三种宽度检查首页、定制、关于、联系页。
2. 新建 Worker 入口；wrangler.jsonc 增加 main、assets.binding=ASSETS、assets.run_worker_first=["/api/*"]，保留 previews 及静态 404 配置。非 API 请求交给 ASSETS.fetch，API 自行按 allowIndexing 设置收录响应头。
3. /api/inquiry 只接受 POST JSON；校验必填、邮箱、字段长度和请求大小，清单最多 50 项，条目数量为正整数或空；其他方法返回 405。
4. Turnstile 前端使用 PUBLIC_TURNSTILE_SITE_KEY，仅本地缺 key 时使用官方测试 site key；服务端始终使用环境变量 TURNSTILE_SECRET_KEY 验证，失败 403。蜜罐有值返回成功但不发信。
5. Resend API 使用 RESEND_API_KEY、INQUIRY_TO_EMAIL、INQUIRY_FROM_EMAIL，Reply-To 为客户邮箱。邮件主题为 [EN] New Inquiry: 公司或姓名 - 国家 - 产品数，中文为 [中文] 新询盘：对应内容；HTML 与纯文本包含全部表单字段、清单表格、样品选择、来源 URL、语言、UTM、提交时间，空数量显示 To be discussed / 待沟通。
6. 必需配置缺失返回 503；发送失败返回可读错误。前端保留输入和清单，提示通过已配置的邮箱 / WhatsApp / 微信联系；不泄露密钥或上游原始报错。
7. 双语 InquiryForm 字段：Name*、Email*、Company、Country*、WhatsApp/Phone、WeChat ID、Product Interest、Quantity 区间、Message*、样品勾选。微信中文前置；类别只含有产品的分类，支持 ?product=slug 和产品详情默认预填；前端校验、提交中和错误状态均经 t()。
8. 表单读取共用 inquiry:v1 清单，显示只读摘要并随请求提交；从 URL 读取 UTM；成功清空清单、触发 generate_lead 事件及 data-track 标记，并跳当前语言感谢页。
9. /thank-you/ 与 /zh/thank-you/ 为 noindex，共用组件，包含感谢语、来自 site.json 的 replyTime 双语 TODO、WhatsApp / 微信入口及推荐产品；CMS 提供回复时间编辑入口。
10. 联系页 #quote 替换开发占位，产品详情底部加入表单；清除 FAQ / 联系页过期说明。所有真实资料继续来自配置，密钥只通过 Worker Variables and secrets 或本地 .dev.vars 提供；.env.example 仅列变量名并区分构建变量与运行时配置。
11. README 中文说明 Turnstile 域名设置、Resend 账号 / API Key、无自有域名仅可用测试发件地址发到注册邮箱、正式域名 SPF / DKIM、Workers 构建变量和运行时密钥位置及验证方法。

**验收标准**

- [ ] build、check、lint、test 全部通过
- [ ] Vitest mock 网络覆盖方法限制、校验、蜜罐、Turnstile 拒绝、缺配置 503、Resend 成败、双语邮件和空数量、ASSETS 转发
- [ ] npx wrangler dev 完整提交验证：官方 Turnstile 测试配置 + 独立本地 mock 发信，不增加生产验证旁路；报告写明方式
- [ ] screenshots -- M5 覆盖中英文联系表单、带清单、校验错误、不可用、感谢页、详情底部表单，以及四个中文页面三种宽度的标题
- [ ] M5 审核报告按模板记录实际结果；m5-inquiry 向 main 开 PR “M5: Inquiry form and Worker backend”

---

## M6 SEO 与统计

**目标：** 为双语 Workers 站补齐 SEO、经同意后加载的统计、隐私政策与分语言 404；M8 前保持禁止收录。

**任务**

1. 每页唯一 title / description：英文不超过 60 / 155 字符，中文不超过 30 / 80 字；产品优先读取 seoTitle / seoDescription，未填或 TODO 时按语言生成。分类、FAQ 等按当前语言输出。
2. 当前语言自身 canonical、en / zh-CN / x-default hreflang、OG / Twitter（en_US / zh_CN）；public/og-default.jpg 使用本地新风格 Placeholder。
3. JSON-LD：Organization、Product（不含价格/评分/评论）、FAQPage、所有面包屑的 BreadcrumbList。资料只取配置与数据中的非 TODO 值，不将占位、隐藏答案或虚构事实写入结构化数据。
4. 有效域名且允许收录时由 @astrojs/sitemap 生成双语对应条目，排除 inquiry、thank-you、styleguide、404 等 noindex 页面。domain 为 TODO / 空时不生成；allowIndexing=false 时全站 noindex，不输出可收录条目。以临时构建验证开启收录场景，最终恢复 false。
5. site.json 的 analytics.gaMeasurementId 为唯一 GA 配置，默认 TODO；CMS 附中文说明。ID 为空 / TODO 时完全不加载 GA。Cookie 横幅双语，接受 / 拒绝同等显眼，页脚可重选；localStorage 包 try/catch，存储异常默认拒绝。只有有效 ID 且已同意才加载脚本及发送事件。
6. data-track 事件：whatsapp_click、wechat_open、wechat_copy、email_click、phone_click、quote_button_click、add_to_inquiry、generate_lead；每个事件含 language，generate_lead 复用 M5 成功事件，不按提交按钮点击发送。不采集询盘中的个人资料。
7. 双语 /privacy-policy/：顶部标明模板待上线核对，涵盖询盘字段与用途、Cloudflare / Resend / GA / Turnstile、本地清单和 Cookie 选择、配置中的公司及联系方式。修复页脚/联系页链接，表单提交旁放隐私声明。
8. 共用双语 404 组件输出 /404.html、/zh/404.html，提供首页/产品/报价入口，noindex。保留 Workers 404-page；本地和预览分别验证未知英文、中文路径返回对应语言且 HTTP 404。
9. 新增 seo:check 并加入 CI：扫描全部 dist HTML 的 title、description、H1、canonical 唯一性，同语言 meta 重复、长度警告、hreflang 目标、noindex 与 sitemap、JSON-LD 解析和 TODO 泄露。
10. 补 Cookie、事件映射、无 GA 配置等 Vitest 测试与浏览器网络验证；README 说明 GA 在中国大陆的覆盖限制、配置与验收方法。

**验收标准**

- [ ] build、check、lint、test、seo:check 全部通过，报告附 SEO 输出
- [ ] 无同意或无有效 GA ID 时没有 Google 统计请求；拒绝、撤回、存储异常和八类事件经测试
- [ ] screenshots -- M6 覆盖双语 Cookie、隐私政策、404、联系页提交附近隐私声明
- [ ] 预览未知英文/中文路径各实测一次，记录 URL、状态码、页面语言
- [ ] 报告 docs/reviews/M6.md；m6-seo 向 main 开 PR “M6: SEO, analytics and privacy”

---

## M7 博客与性能

**目标：** 用 Pages CMS 发布双语资讯，完善性能与自动检查，为工厂提供可重复生成的上线资料清单。以用户本轮要求替代此前单语博客描述，不执行 M8 上线操作。

**任务**

1. M6 审核修正：analytics.gaMeasurementId 为 TODO / 空时不显示 Cookie 横幅、页脚和隐私页设置入口；有效 ID 恢复现有同意逻辑，隐私正文保留；补测试。
2. blog 使用 JSON collection，文件名为 slug；字段 title / description 为 {en,zh}，date、updated?、cover、tags、relatedProducts（slug 列表）、draft、bodyEn（必填 Markdown）、bodyZh（选填 Markdown）。CMS 使用富文本编辑器、动态产品多选引用与博客图片媒体库。
3. 共用组件输出 /blog/、/zh/blog/ 和文章页。每页 9 篇，分页 /blog/page/<n>/ 及中文对应；英文排除草稿，中文还要求 bodyZh 非空。只为真实存在的语言版本输出 hreflang；没有文章时显示正式空状态。
4. 文章包含标题、日期、封面、H2/H3 自动目录、正文、相关 ProductCard（含询价）、文末报价 CTA、Article JSON-LD、上一篇 / 下一篇。中文正文不回退英文；所有固定文字走 t()。
5. 两篇指定标题的双语示例文章，完整写作提纲和占位段落，具体尺寸、数量、价格、交期为 [TODO]，最终 draft=true。草稿不进入列表、sitemap 或构建输出。临时发布验证后恢复草稿。
6. 性能：图片经 astro:assets、带宽高，首屏主图 eager + high，其余 lazy；检查重复 / 未使用 JS，英文字体只保留实际字重与 Latin 子集，中文使用系统字体。
7. 新增 links:check，检查 dist 内中英文内部链接与锚点，接入 CI；seo:check 覆盖博客，补草稿、语言、分页与结构化数据测试。
8. 对英文首页、中文首页、一个产品详情、联系页进行移动端 Lighthouse；四类目标均 ≥90，SEO 因 noindex 降分时如实说明，不能运行则说明原因与已完成优化。
9. 新建 docs/LAUNCH-CHECKLIST.md；todo:report 自动生成第 (1) 部分，扫描 site、data、分类、产品 TODO 与占位图片，按 CMS 菜单列填写位置 / 内容 / 格式示例，单列实拍图与建议尺寸；人工维护第 (2) 部分，涵盖密钥、真实发信、微信、隐私、示例产品、正式域名和 allowIndexing。
10. 更新 CMS 指南、README、PRD 与记录；报告按模板附 Lighthouse、TODO 摘要、截图和自检：表单、WhatsApp、HTTPS、无 Lorem ipsum、拼写、meta、sitemap、隐私及联系方式一致。未配置项列为待补，不伪称真实验收成功。

**验收标准**

- [ ] build、check、lint、test、seo:check、links:check 全通过
- [ ] Cookie 无配置不显示；草稿完全排除；中文无正文不生成；临时发布、分页、相关产品与目录链接验证通过
- [ ] screenshots -- M7 覆盖中英文空状态、临时发布列表 / 文章，以及无 Cookie 横幅首页；最终恢复草稿
- [ ] 四页移动端 Lighthouse 结果与 todo:report 摘要写入报告，待补资料清单可重复生成
- [ ] docs/reviews/M7.md，m7-blog-perf 向 main 开 PR “M7: Blog, performance and launch checklist”

---

## M7.5 图片全部后台化

**目标：** 工厂通过 Pages CMS 更换网站全部内容图片，无需改代码；保持当前双语设计、事实约束与默认显示。

**任务**

1. “网站设置”复用 logo，新增 ogImage、homeHeroImage / homeHeroAlt（双语）、aboutGallery（图片与双语说明的有序列表）、factoryVideoPoster；空值使用既有图标、分享图、首页 / 四张车间占位图和视频自带封面。既有产品、分类、博客、微信、证书、案例、团队图片继续由对应 CMS 条目维护。
2. 网站图片上传 src/assets/images/site；相对路径由统一解析器转为 Astro 图片，输出 WebP、宽高；主图 eager / high，其余正文图 lazy；Logo 用于页头与 Organization.logo，自定义默认分享图用于 OG / Twitter，文章专属分享封面保持优先。
3. CMS 中文标签与说明提供建议尺寸和回退规则；更新 CMS 指南、todo:report 和上线清单，所有内容图片均有后台填写位置。
4. 删除 M7/lighthouse 原始 JSON / HTML，M7 报告保留分数摘要；忽略今后的原始报告目录，AGENTS 规定仅提交摘要。

**验收标准**

- [x] build、check、lint、test、seo:check、links:check 全部通过
- [x] 以 CMS 格式临时填写 Logo、首页主图及两张车间图，验证中英说明、顺序、图片优化、分享图与组织标志；测试后恢复空值
- [x] screenshots -- M7b 覆盖中英首页 / 关于页，默认与上传两种状态、1440 / 375 视口
- [x] 按模板写 M7b 报告；m7b-images 向 main 开 PR “M7.5: Editable images in CMS”

---

## M8 正式域名与上线准备

正式域名为 `junbeili.com`。M8 保持 `allowIndexing: false`，工厂补齐资料后按上线清单在 CMS 开启收录。

**任务**

1. 将 `src/data/site.json` 的 `domain` 更新为 `https://junbeili.com`，核对构建产物的 canonical、OG、hreflang 和 JSON-LD 站内网址。
2. 在 Wrangler 声明根域和 www 为自定义域名，启用测试地址和预览。Worker 为 www 提供保留路径与查询参数的 301 兜底并补测试。其他静态请求仍由 ASSETS 处理。
3. 核对开关关闭时的 robots.txt、noindex 响应头与无 sitemap 状态。隔离构建验证开启后可抓取、中英 sitemap/hreflang、移除全站响应头，同时排除永久 noindex 页面。robots.txt 对所有爬虫应用同一抓取规则。
4. 根据网站设置和有产品的分类生成英文 `/llms.txt`。附主要页面和分类链接，只显示已确认的公开联系方式。Organization JSON-LD 包含有效社媒链接和已上传 Logo。
5. README 同步正式域名、Turnstile、Resend 发件与 Cloudflare Email Routing 收件。发布操作写入 `docs/LAUNCH.md`，包括待补资料与三个示例产品、CMS 的收录开关、Google 与 Bing 的 sitemap、GA4 和 Cloudflare AI Crawl Control，以及工厂上线后的双语询盘与网址核验。
6. 运行 `npm run todo:report` 更新资料清单，在 M8 报告记录剩余项和两种收录状态的验证结果。

**验收标准**

- [ ] build、check、lint、test、seo:check、links:check 全通过。
- [ ] 两种收录状态均通过 seo:check，提交中的收录开关保持关闭。
- [ ] www 兜底测试通过；PR 预览正常，M8 报告附验证和待补资料摘要。
- [ ] `m8-launch` 向 main 开 PR “M8: Production domain and launch preparation”。真实资料补齐、开启收录和生产发信由工厂按上线清单验收。

## M9 产品与公司资料批量导入

**目标：** 用工厂工作簿和本轮确认的公司资料，替换预置分类与示例产品。

**任务**

1. 归档 `data-import/junbeili-products.xlsx`，录入本轮确认的双语公司信息、联系方式、政策与数字。保持 `allowIndexing: false`，证书、社媒、视频、GA4、Logo 与微信二维码继续待补。
2. 按已确认映射生成 13 个双语分类，首页展示前六个。按店铺类目、材质、形状与颜色工艺合并规格，排除指定展示和素材类目。先输出 `docs/import/product-grouping.csv`，再写产品。
3. 用独立尺寸或对应规格的包装详情承载报价条件。支持范围／多值克重、非圆形规格说明和站点 MOQ／交期回退。源表备注只提取尺寸，内部资料留在工作簿和评审材料。
4. 复用带 Placeholder 标识的分类图，生成 `docs/import/images-needed.md`。移除三个示例、旧分类及无引用的分类图，更新草稿和测试引用。
5. 新增可重复运行的 `npm run import:products`，从工作簿和已核对的映射生成 JSON。更新 Pages CMS 字段与中文维护说明。
6. 运行 build、check、lint、test、seo:check、links:check 和 todo:report。在 Workers PR 预览核对中英文并截图，按模板报告分类统计、排除项、待核对规格、缺型号和 schema 变化。

**验收标准**

- [ ] 同一工作簿重复导入得到相同结果；全部产品通过内容校验，构建产物无内部备注。
- [ ] 六项检查通过，更新上线资料清单。
- [ ] 预览截图含产品中心、三个分类和两个多尺寸详情（其中一个为方形），桌面与 375px，中英文均已核对。
- [ ] `docs/reviews/M9.md` 完成；`m9-product-import` 向 main 开 PR “M9: Product catalog and company info import”。

## M9.1 公开页面隐藏未补资料

**任务**

1. 在双语公开页面和 HTML 内嵌数据中省略待补字段。产品型号、参数及全空尺寸列隐藏；未填起订量和交期优先用已确认的网站设置。内部样式指南可显示占位。
2. 询价清单继续按 slug 识别产品，兼容已有存储。省略待补型号；邮件包含产品名称、数量和当前语言的产品链接。
3. 扩展 CI 已有的 `seo:check`，公开 HTML 中出现 `[TODO` 或 `TODO_` 即报错。`todo:report` 仍扫描源数据，`allowIndexing` 继续关闭。
4. 补产品参数、询价单、提交校验和邮件测试；运行六项检查，在 Workers PR 预览截取无型号产品和询价单的桌面及 375px 截图，写 `docs/reviews/M9.1.md`。

**验收标准**

- [ ] build、check、lint、test、seo:check、links:check 全通过，公开 HTML 零占位。
- [ ] 询价单和邮件保留名称与链接，待补型号省略，待补资料仍在上线清单中。
- [ ] 四张预览截图和审核报告提交，`m9-1-hide-todo` 向 main 开 PR “M9.1: Hide unfilled placeholders on public pages”。

## M10 产品图片挑选、处理与上线

1. 以产品合并方案和待补图清单匹配店铺类目与尺寸。两处原图目录只读，按杯型、形状、颜色和工艺目视核对。每款选择 2–5 张；实拍优先作主图，清晰产品图可以补充，匹配的 AI 场景最多两张且仅作辅图。资料不足的产品继续使用占位图。
2. 仅裁除外围标注、摆正、等比缩放和补边等允许处理。产品图 1200×1200、分类封面 1200×900、工厂图片长边 1600，均输出 WebP 并移除元数据。13 个分类各配代表图，首页和关于页从车间实拍选图。
3. 沿用 CMS 媒体目录，图库条目维护图片和双语 alt。逐图记录来源与处理方法，并制作 13 份分类缩略图总览，列出缺图产品、未采用的疑似配图和弃用数量。图片总新增体积小于 150 MB。
4. 六项检查与 `todo:report` 通过。在 Workers PR 预览截图核对首页、产品中心、三个分类、三个产品详情和手机布局。写 `docs/reviews/M10.md`，保持 `allowIndexing: false`，向 main 开 PR “M10: Product images and factory photos”。

## M11 资料完善与页面调整

1. 接入工厂 Logo 与微信二维码。Logo 用在页眉、页脚、默认分享图和 Organization JSON-LD。放大页眉标志、导航、品牌副标题和公告，在 375px 下保留询盘导航。
2. 顶部公告、定制页、首页、FAQ 和关于页统一展示 OEM 与 ODM。OEM 按客户设计、Logo 和尺寸生产，ODM 由工厂提供杯型、花色与包装方案，客户选款后贴牌。
3. 从 2026 年工作簿匹配规格，按形状录入底部、顶部、高度、纸片和纸卷原单位，单列盖子及对应包装、重量、装箱和箱规。按 M9 规则归并新款，通过同一导入命令重复生成。报告记录字段冲突、来源未明确的行及新增产品。
4. 按本地中英文图册和规格表核实色样。印花杯及机制杯保留现有说明并提示可咨询花色。两本大图册只留在 Git 忽略的 `data-import/local/`。
5. 页脚和联系页仅显示已填写的官方社媒链接。首页和关于页展示已确认的数字、食品级材质、OEM 与 ODM 和生产流程。有图片和名称后展示证书，工厂信任资料可在 CMS 选填。
6. 跑六项检查和 `todo:report`，提交 M11 报告及七个页面的 1440px、375px Workers PR 预览截图。保持 `allowIndexing: false`。

## M12 图片精修、场景图、定制示例与工厂展示

1. 先读产品图片工作室技能，按 A 节核对原图、精修、逐图验收，按分类记录原图与交付图。镜头角度、颜色、形状和工艺保持原样。
2. 按 B 节为已有产品图的产品配应用特写与商业陈列辅图，审核现有场景图。检索店铺资料和两本本地图册，缺图产品找不到可确认的图片时保留占位。
3. 按 C 节在定制页展示六组双语设计示例与六步图标流程。首页仅用有出处的厂房外景替换首图；关于页按可确认的工厂实拍安排图库。
4. 按 D 节记录图片来源、提示词、验收和重试，提供每类对比和场景总览、缺产品和工厂照片清单。运行六项检查，报告图片体积和 Workers PR 预览双视口截图。保持 `allowIndexing: false`。

## M13 尺寸锚定、成品展示试点、页眉及箱规

1. 同步新版产品图片技能。全站撤下旧 AI 场景，保留带撤下状态和原出处的清单记录，移除过期提示词。
2. 限定五款试点。按规格表和产品数据对原照做尺寸锚定，记录投影轴、参照物和误差。在通过的锚定图基础上逐图量展示成图，保真和尺寸均达标才上架。缺对应实拍的规格在报告说明。
3. 桌面 Logo 高 72px，导航 17px，在 1024px 下验证单行布局。手机 Logo 高 48px。箱规统一 cm，重量保留确认的 kg 或 g。本次六组定制示例继续使用现有图片，保持 `allowIndexing: false`。
4. 运行六项检查。汇总试点图与尺寸测量，在 Workers PR 预览截取首页、五款试点详情和箱规详情的桌面和手机截图。

## M14 成品展示图重做试点

1. 撤下 M13 的六张成品展示图并登记“已撤下（效果不佳）”，删除已无引用的图像文件。现有尺寸对比图继续展示。
2. 更新产品图片技能 B 节。茶匙、浓缩咖啡杯、餐叉或马克杯自然入镜。装着食物的成品默认参考对应锚定图和实拍整图生成，按产品保真、尺寸与摄影质感验收。
3. 为 3830 PET 淋膜圆形卷口杯、PET 淋膜正方形卷口杯和 1 粒装开窗盒按新参照物重排锚定图，偏差不超过 3%。每款重做装食物的近景和陈列，成图绝对偏差不超过 15%，每张最多重试三次。
4. 更新量测 CSV、图片清单和人工审核总览，在 M14 报告逐图记录审美自评与重试次数。新试点只进入审核材料，收录开关保持关闭。
5. 记录圆杯已确认的波点图案并保留波点产品图。工厂确认缺少独立照片的五个规格以尺寸表为准，在 M13 报告关闭补拍待确认项。
6. 通过六项检查，归档三款详情的桌面和手机 Workers 预览。由 `m14-scene-retry` 向 main 提交 PR。

## M15 成品展示图第一批（杯类与纸托）

1. 复用已审核的 M14 六张成品展示，保留原尺寸对比，按语言标注为效果示意图。
2. 核对六类产品的实拍出处、适用规格和图片可量轴。复用已核实的尺寸对比，缺少时按 B.0 制作鸡蛋版，绝对误差不超过 3%。无可核实规格的实拍留待补充。
3. 以真实照片和茶匙或浓缩咖啡杯锚定图生成近景与陈列，逐图核对承装效果、形状、外观、光影和最大绝对偏差。偏差不超过 15% 且视觉通过才入库。每张最多重试三次。
4. 图库按实拍、尺寸对比、成品展示排列。展示图只作标注过的辅图，分类封面和 Product JSON-LD 沿用产品图片规则。保持 `allowIndexing: false`。
5. 更新图片清单和量测表，生成六张分类总览。完成六项检查后，从 Workers PR 预览归档六类和代表详情的 1440px 与 375px 截图。在 M15 报告统计入库体积、未完成项和原因。
6. M15 审核修正覆盖全站图库及分类封面。实拍按 A.5 用传统去溢色，依据工厂色样和图册区分反光与原色。受影响的锚定图从去绿原照重排，展示图重新生成并复测。船型杯只用对应规格、完整开口朝上的实拍做锚定，旧锚定与旧图退出图库。更新六类总览、逐图去绿对照与报告，提交到原 PR。

## 后续可选

- 如需统计中国大陆访客，可另行评估百度统计；M6 不接入。
