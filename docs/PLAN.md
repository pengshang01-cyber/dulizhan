# 执行计划 PLAN.md

原计划共 9 个里程碑（M0–M8），补充 M4.5（本轮）与后续 M4.6（中文页面）。每个里程碑 = 一个分支 + 一个 PR + 一份审核报告。规则见 `AGENTS.md`。

| 里程碑 | 名称 | 分支 | 主要产出 |
| --- | --- | --- | --- |
| M0 | 仓库初始化 | `m0-setup` | Astro + Tailwind 项目、脚本、CI、站点配置文件 |
| M1 | 全站框架与设计系统 | `m1-layout` | 布局、页头页脚、按钮、WhatsApp 悬浮窗、样式规范页 |
| M2 | 首页 | `m2-homepage` | 完整首页 |
| M3 | 产品体系与询价清单 | `m3-products` | 产品数据结构、产品中心、分类页、详情页、前端询价清单 |
| M4 | 定制 / 关于 / FAQ / 联系 | `m4-pages` | 4 个内容页 |
| M4.5 | 内容后台、分类数据化与双语数据 | `m4b-cms` | Pages CMS、JSON 内容、双语字段与界面字典 |
| M5 | 询盘表单与后端 | `m5-inquiry` | 表单组件、Pages Function、防垃圾、感谢页 |
| M6 | SEO 与统计 | `m6-seo` | meta、sitemap、结构化数据、GA4 事件、隐私政策、404 |
| M7 | 博客与性能 | `m7-blog-perf` | 博客系统、示例文章、性能优化、上线检查 |
| M8 | 正式上线 | `m8-launch` | 绑定域名、生产环境变量、上线后检查 |

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
8. `README.md`：本地运行、部署到 Cloudflare Pages 的步骤（构建命令 `npm run build`，输出目录 `dist`）、环境变量说明。

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
9. 底部询盘 CTA 区块：标题 + Get a Quote 按钮（M5 再换成内嵌表单）。

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

## M5 询盘表单与后端

**任务**

1. `InquiryForm` 组件，字段：Name*、Email*、Company、Country*（下拉）、WhatsApp/Phone、Product Interest（下拉，选项来自产品分类，可被 `?product=` 预填）、Quantity（下拉区间）、Message*、勾选“I'd like to request samples”。前端校验 + 提交中状态 + 错误提示。
2. 接 Cloudflare Turnstile（site key 来自环境变量；本地无 key 时用 Turnstile 官方测试 key）。
3. `functions/api/inquiry.ts`：
   - 只接受 POST；校验字段；服务端验证 Turnstile token
   - 简单蜜罐字段（隐藏 input，有值则静默丢弃）
   - 用 Resend 发邮件到 `INQUIRY_TO_EMAIL`，主题 `New Inquiry: <Company/Name> - <Country> - <Product>`，正文含全部字段、来源页面 URL、UTM 参数（前端从 URL 读取并随表单提交）
   - 成功返回 JSON，前端跳转 `/thank-you/`
4. `/thank-you/`（`noindex`）：感谢语、预计回复时间、WhatsApp 按钮、推荐产品。
5. 表单放到：`/contact/#quote`、首页底部 CTA、产品详情页底部。
6. 提交成功时触发 `data-track="generate_lead"` 事件（M6 接 GA4）。
7. 在 README 写清：Cloudflare Pages 里要配置哪些环境变量、Resend 发件域名验证步骤。
8. 询盘表单读取询价清单，把每个产品的型号、名称、可选数量随表单提交，邮件正文以表格列出（空数量显示 To be discussed）；提交成功后清空清单。

**验收标准**

- [ ] 用 `wrangler pages dev` 本地跑通：缺字段返回 400，蜜罐有值不发信，Turnstile 失败返回 403
- [ ] 为 `functions/api/inquiry.ts` 写单元测试（Vitest，mock Resend 和 Turnstile），`npm test` 通过
- [ ] 没有任何密钥写进代码
- [ ] 截图：`contact`（含表单）、`thank-you`、表单报错状态

---

## M6 SEO 与统计

**任务**

1. 每页唯一的 title（≤60 字符）和 description（≤155 字符）；产品页用 `seoTitle` / `seoDescription`，没有则自动生成。
2. canonical、OG / Twitter 卡片（默认分享图 `public/og-default.jpg` 占位）。
3. `@astrojs/sitemap` 生成 sitemap，排除 `noindex` 页面；`public/robots.txt` 指向 sitemap。
4. JSON-LD：全站 `Organization`；产品页 `Product`（不含价格和评分，不编造评论）；FAQ 页 `FAQPage`；面包屑 `BreadcrumbList`。
5. GA4：`PUBLIC_GA_ID` 存在时才加载；把 `data-track` 元素点击转成 GA4 事件：`whatsapp_click`、`email_click`、`phone_click`、`quote_button_click`、`generate_lead`。
6. Cookie 同意横幅（简单版：同意前不加载 GA4，选择存 localStorage，读写包 try/catch）。
7. `/privacy-policy/`：通用模板，公司名和邮箱读 `site.ts`，顶部注明 “Template — review before launch”。
8. 自定义 404 页面。

**验收标准**

- [ ] 写脚本 `npm run seo:check`：遍历 `dist/` 的 HTML，检查每页都有唯一 title / description / 唯一 H1 / canonical，超长时报警告，缺失时报错
- [ ] JSON-LD 能被 JSON.parse 解析（脚本内校验）
- [ ] 未同意 cookie 时网络请求中没有 googletagmanager
- [ ] 报告中附 `seo:check` 的输出

---

## M7 博客与性能

**任务**

1. `blog` collection：`title`、`description`、`date`、`cover`、`tags`、`relatedProducts`（产品 slug 数组）、`draft`。
2. `/blog/` 列表（分页，每页 9 篇）、`/blog/<slug>/` 文章页（目录、相关产品卡片、文末 CTA）、`Article` JSON-LD。
3. 两篇示例文章（结构完整，正文为写作提纲 + 占位段落，标注 `draft: true` 不上线）：
   - “Cupcake Liner Sizes Chart: How to Choose the Right Baking Cup”
   - “How to Order Custom Printed Cupcake Liners from a Factory”
4. 性能：所有图片走 `astro:assets` 并设置宽高；首屏图 `loading="eager"` + `fetchpriority="high"`，其余懒加载；字体子集化 + `font-display: swap`；无未使用的大 JS。
5. 写 `npm run links:check`：检查 `dist/` 内部链接全部可达。
6. 上线前自检，逐条写入报告：表单、WhatsApp、https（部署后）、无 Lorem ipsum、拼写、meta、sitemap、隐私政策、联系方式全站一致。

**验收标准**

- [ ] 能跑 Lighthouse 时，首页和一个产品详情页移动端 Performance ≥ 90、SEO ≥ 95、Accessibility ≥ 90（不能跑则说明）
- [ ] `links:check` 无失效链接
- [ ] 全站搜索 `TODO` 的结果清单附在报告里（这是上线前要工厂补的资料清单）

---

## M8 正式上线

此阶段多数是需要人在后台操作的步骤，Codex 负责写清单和做最后的代码调整。

**任务**

1. 生成 `docs/LAUNCH.md`：Cloudflare Pages 绑定自定义域名、配置生产环境变量、Resend 域名验证（SPF / DKIM）、Turnstile 正式 key、GA4 属性和转化事件标记、Google Search Console 验证与提交 sitemap 的逐步操作。
2. 根据 M7 报告的 `TODO` 清单，确认 `site.ts` 和内容文件已被工厂真实资料替换（未替换的列出来）。
3. 把示例博客中工厂已确认的文章去掉 `draft`。
4. 上线后自检：生产域名下表单真实发信一次、WhatsApp 跳转、sitemap 可访问、`robots.txt` 正确。

**验收标准**

- [ ] 全站 `TODO` 数量为 0，或剩余项已列出并获确认可以带着上线
- [ ] 生产环境表单发信成功（报告附收件截图或说明）
