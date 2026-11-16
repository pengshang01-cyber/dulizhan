# M1b 审核报告：M1.5 风格调整与首页文案优化

- 分支：`m1b-restyle`
- PR：创建后补充
- 预览地址：未部署（PR 创建后核验 Cloudflare Pages 状态）
- 提交时间：2026-11-16

## 1. 完成情况

本次对应用户追加的 M1.5 清单（17 项）。从 PR #3 的合并提交 `87578e7` 快进同步 `main` 后创建分支；保留原有路由和 M2 首页结构，未开展 M3–M8 功能。

| # | 任务 | 状态 | 说明 / 相关文件 |
| --- | --- | --- | --- |
| 1 | 新颜色和阴影 | 完成 | `src/styles/global.css` 定义指定的 12 色及阴影，替换砖红、鼠尾草绿主题 |
| 2 | 本地字体和标题排版 | 完成 | DM Sans 正文；Newsreader 400 常规体及斜体；H1 / H2 字距与行高按要求设置 |
| 3 | 小圆角 | 完成 | 控件 2px、面板 3px，输入框、分类卡、FAQ、步骤卡统一细边框 |
| 4 | 按钮 | 完成 | coffee 主按钮、800 字重、11–12px、0.06em 字距、右箭头；透明次按钮；悬停仅变色 |
| 5 | Eyebrow | 完成 | `src/components/Eyebrow.astro`，大写、0.2em 字距、24px copper 细线 |
| 6 | DisplayHeading | 完成 | `src/components/DisplayHeading.astro`，两段标题、第二段 copper 斜体 |
| 7 | TopBar | 完成 | `site.topBarItems` 三项，过滤 TODO；桌面默认两项、375px 默认仅第一条有效项 |
| 8 | StatsBar | 完成 | `SiteStat` 明确类型及 `site.stats` 数组；四项 TODO 保持可见；白底、竖线、手机两列 |
| 9 | CheckList | 完成 | `src/components/CheckList.astro`，copper 方框勾号；用于 Hero 和 styleguide |
| 10 | Header | 完成 | cream 半透明吸顶；`site.tagline` 使用统一 `display`；当前导航 copper 字及下划线，手机导航保留 `Mobile` |
| 11 | Footer | 完成 | coffee 背景、cream / sand 文字、copper 悬停；联系方式仍来自 `site.ts` |
| 12 | 首页区块和占位图 | 完成 | 首页标题加 Eyebrow；定制及询盘区为深色；七张本地 PNG 占位图重绘后由 Astro 转 WebP |
| 13 | Styleguide | 完成 | 展示全部 12 色、两种字体及斜体、按钮、输入框、新组件、卡片、FAQ、步骤和深色样式；保留 noindex |
| 14 | 四项已确认卖点 | 完成 | 标题改为 “Why Buyers Choose Us”，四项标题及说明采用用户原文 |
| 15 | Mockup | 完成 | 第 2 步改为 “Mockup” 和指定说明，移除免费暗示 |
| 16 | 第一人称 FAQ | 完成 | `src/data/faq.ts` 四条回答统一 we / we'll，保持共用数据来源 |
| 17 | AGENTS.md | 完成 | 第 3 节第 1 条补充已确认的定性卖点规则，第 6 节替换为新设计规范 |

## 2. 验收标准自检

- [x] `npm run build` 通过，静态构建 8 页。
- [x] `npm run check` 通过，32 个文件，0 errors / warnings / hints。
- [x] `npm run lint` 通过，ESLint 和 Prettier 均通过。
- [x] `npm run screenshots -- M1b` 通过，8 页各两张，共 16 张；已查看 home、styleguide、contact 桌面及手机布局。
- [x] Playwright 验证全部 8 页在 1440×900 和 375×812 下无横向溢出；另检查 1024px 首页的导航断点。
- [x] 两种视口首屏均能完整看到首页定位语、Get a Quote 和 View Products。
- [x] 吸顶 Header、手机菜单开合、六个分类锚点、站内链接及询盘跳转正常，每页保留一个 H1。
- [x] 默认公告条过滤第三项 TODO，桌面显示两项，手机显示一项；tagline 显示 `[TODO: tagline]`。
- [x] StatsBar 默认四项显示 `[TODO: Founded]`、`[TODO: Daily Capacity]`、`[TODO: Export Countries]`、`[TODO: Colors & Patterns]`。
- [x] 临时配置验证新增第五个带单位的指标、修改标签、TODO 位于公告数组首项及正常 tagline 的行为，均无需修改组件。
- [x] 工厂视频、证书和 WhatsApp 在默认 TODO 配置下无对应实际区块 / 悬浮按钮；完整证书与有效视频的临时配置通过，YouTube iframe 只在激活播放后加载。
- [x] 首页图片和字体请求均来自本地构建资源；未引用参考站图片、网络产品图或 AI 产品图。
- [x] `npm audit --audit-level=low` 返回 0 vulnerabilities；Newsreader 包的官方 registry URL 与 SHA512 已核对，安装禁用生命周期脚本。

配置场景通过仓库外的临时构建测试，测试资料未写入 `site.ts` 或提交；YouTube 测试请求在浏览器内拦截，不访问真实播放器。

关键命令输出摘录：

```text
> npm run build
[build] 8 page(s) built
[build] Complete!
> npm run check
Result (32 files):
- 0 errors
- 0 warnings
- 0 hints
> npm run lint
All matched files use Prettier code style!
> npm run screenshots -- M1b
docs/reviews/M1b/home-desktop.png
docs/reviews/M1b/home-mobile.png
docs/reviews/M1b/contact-desktop.png
docs/reviews/M1b/contact-mobile.png
docs/reviews/M1b/styleguide-desktop.png
docs/reviews/M1b/styleguide-mobile.png
8 routes without overflow; 6 category anchors; Main/Mobile menus; sticky header; first-fold CTAs
Fixture: array supports an extra formatted metric and renamed label; TODO announcements filtered; real tagline shown
Fixture: only complete certificate renders; YouTube iframe loads only after activation
```

## 3. 截图

存放于 `docs/reviews/M1b/`；桌面视口 1440×900，手机视口 375×812，均为整页截图。

| 页面 | Desktop | Mobile |
| --- | --- | --- |
| home | [home-desktop.png](M1b/home-desktop.png) | [home-mobile.png](M1b/home-mobile.png) |
| styleguide | [styleguide-desktop.png](M1b/styleguide-desktop.png) | [styleguide-mobile.png](M1b/styleguide-mobile.png) |
| contact | [contact-desktop.png](M1b/contact-desktop.png) | [contact-mobile.png](M1b/contact-mobile.png) |
| products | [products-desktop.png](M1b/products-desktop.png) | [products-mobile.png](M1b/products-mobile.png) |
| custom | [custom-desktop.png](M1b/custom-desktop.png) | [custom-mobile.png](M1b/custom-mobile.png) |
| about | [about-desktop.png](M1b/about-desktop.png) | [about-mobile.png](M1b/about-mobile.png) |
| blog | [blog-desktop.png](M1b/blog-desktop.png) | [blog-mobile.png](M1b/blog-mobile.png) |
| faq | [faq-desktop.png](M1b/faq-desktop.png) | [faq-mobile.png](M1b/faq-mobile.png) |

## 4. 偏离与新增依赖

- 本次 M1.5 是用户明确追加的设计与文案调整；未改写原有 `docs/PLAN.md`、审核模板、PR 模板和历史报告。Products / Contact 等原占位页仅适配新主题，后续内容和表单仍按原计划实现。
- [参考网站](https://junbeli-bakery-paper-cups-2026.pengshang01.chatgpt.site) 在本环境返回 Cloudflare 403，无法查看页面。实际实施依据用户提供的详细视觉规范，未读取或复制其文字、数字、品牌名和图片。
- 新增 `@fontsource/newsreader@5.3.0`，移除 `@fontsource/dm-serif-text`。选择 Newsreader 是因为其 400 常规体与斜体适合大标题和强调段，并与 DM Sans 正文形成清晰层级。仅加载 Latin 字体，`font-display: swap`，共两种字体。来源为 [Fontsource](https://fontsource.org/fonts/newsreader/use)，许可 OFL-1.1；DM Sans 补充已安装包中的 800 字重，无新增字体依赖。
- `scripts/screenshots.ts` 支持 `M1b` 等单个小写字母后缀，仍拒绝路径分隔符；截图前等待字体加载。`scripts/pages.json` 已包含所需页面，无需修改。
- 配置验证发现旧视频容器在有效 ID 下因最小高度与宽高比产生约 1px 手机溢出，已补上 `w-full` 并验证。
- 深色区块的 Eyebrow 文字用 cream、细线保持 copper；按钮加浅色边框，保持深色背景上的可读性。
- 默认统计占位文字使用较小的 Newsreader 字号以容纳标签，真实指标值使用更大的衬线字号；数值未被隐藏。

### 文案改动（单列）

| 位置 | 改动 |
| --- | --- |
| Hero | 两段标题为 “Cupcake Liners & Baking Cups” / “Made Factory Direct.”；保留批发、定制及采购人群说明 |
| 卖点区标题 | “Work Directly With the Factory” → “Why Buyers Choose Us” |
| 花色卖点 | “Wide Range of Prints & Colors” — “Choose from a broad library of patterns, solid colors and seasonal designs, or bring your own artwork.” |
| 材质卖点 | “Food-Grade Paper” — “Made from food-grade, grease-resistant paper. Material documents are available on request.” |
| 价格卖点 | “Factory-Direct Pricing” — “Buy straight from the production line with pricing built for wholesale volumes.” |
| 定制卖点 | “Custom Logo, Size & Color” — “Print your logo, match your brand colors and choose the size and packaging you need.” |
| 定制第 2 步 | “Free Mockup” → “Mockup”；说明为 “We prepare a digital mockup of your design for your approval.” |
| FAQ 询价 | 改为 “We need…” 清楚列出报价所需信息 |
| FAQ 自带设计 | “Yes. Send us your artwork, cup style and size, and we'll check the fit and send a mockup.” |
| FAQ 样品 | 肯定可提出样品需求，使用 “We'll confirm sample availability and delivery details.”，不承诺免费或具体周期 |
| FAQ 材质 | 使用 “We use food-grade, grease-resistant paper…” 并说明提供对应材质文件，不新增证书名称 |
| 公告条 / 辅助标签 | 公告条采用指定的 “Factory Direct” 和 “Custom Printing & OEM”；Eyebrow、CheckList 使用品类与已确认定性描述 |

## 5. 待确认问题

1. 工厂 logo 下的英文 tagline 仍待提供，当前显示 TODO。
2. 公告条第三项仍待提供，当前隐藏。
3. 工厂真实数字、证书、视频、联系方式和实拍图沿用既有 TODO，待工厂提供后替换；本轮无需补齐这些资料即可审核样式。

## 6. 本次新增的 TODO 占位

| 位置 | 需要的资料 |
| --- | --- |
| `src/config/site.ts` → `tagline` | logo 下的英文副标题，当前 `TODO_COMPANY_TAGLINE` |
| `src/config/site.ts` → `topBarItems[2]` | 第三条公告内容，当前 `TODO_TOP_BAR_ITEM` |

原四个数字 TODO 仅迁移到 `stats[0..3].value`，标签及显示均由数组维护，不新增或编造数字。

## 7. 修改记录

尚未收到本轮 PR 的审核修改意见。
