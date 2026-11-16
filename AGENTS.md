# AGENTS.md — 蛋糕纸杯工厂外贸独立站

本文件是给 Codex（及任何编码代理）的长期规则。每次开始任务前先完整阅读本文件和 `docs/PLAN.md`。

## 1. 项目是什么

- 一个英文 B2B 外贸询盘站，卖家是一家蛋糕纸杯 / 纸托（cupcake liners / baking cups）源头工厂。
- 目标：让海外批发商、烘焙品牌、电商卖家找到工厂并发来询价（表单 / WhatsApp / 邮件）。
- 不做购物车、不做在线支付（第一期）。

## 2. 技术栈（不要擅自更换）

| 层 | 选型 |
| --- | --- |
| 框架 | Astro（最新稳定版），静态输出 `output: 'static'` |
| 样式 | Tailwind CSS |
| 内容 | Astro Content Collections：`src/content/products/`、`src/content/blog/` |
| 图片 | `astro:assets`（自动出 WebP、懒加载） |
| 表单后端 | Cloudflare Pages Functions（`functions/api/inquiry.ts`）+ Cloudflare Turnstile 防垃圾 + Resend 发邮件 |
| 部署 | Cloudflare Pages（每个 PR 自动生成预览地址） |
| 统计 | GA4（ID 从环境变量读取） |
| SEO | `@astrojs/sitemap`、每页 meta、JSON-LD 结构化数据 |
| 语言 | Node 20+，TypeScript strict |

如果确实需要新增依赖，在审核报告的“偏离与新增依赖”里写明理由。

## 3. 硬性规则

1. **不编造事实。** 工厂名、年限、产能、出口国家数、证书与联系方式一律从 `src/data/site.json` 读取，客户案例只从 `src/data/cases.json` 读取；没有的值用明显的占位符 `TODO_xxx`，页面上显示为 `[TODO: xxx]`。工厂已确认的定性卖点（花色多、食品级材质、工厂直供批发价、支持定制）可以直接作为肯定表述使用；具体数字与证书名称仍必须来自 `site.json` 或产品数据，客户名称必须来自经确认的案例数据。绝不自己写 “FDA certified”“20 years experience” 之类未经确认的具体声明。
2. **内容唯一来源。** 分类只在 `src/content/categories/*.json`（文件名即 id），产品只在 `src/content/products/*.json`（文件名与 slug 一致），网站设置只在 `src/data/site.json`，FAQ 只在 `src/data/faq.json`。定制流程、案例、团队分别在 `src/data/customization.json`、`cases.json`、`team.json`。`src/config/site.ts` 只保留类型、校验与工具，不再存配置值；禁止复制另一份分类枚举或政策文字。
3. **密钥不进仓库。** 只用环境变量，并在 `.env.example` 里列出变量名。
4. **一次只做一个里程碑。** 只做 `docs/PLAN.md` 里当前里程碑的范围，不提前做后面的内容。上一个里程碑的 PR 没合并之前，不开始下一个。
5. **分支与 PR：** 每个里程碑一个分支 `m<编号>-<短名>`（如 `m2-homepage`），完成后向 `main` 开 PR，标题 `M<编号>: <名称>`。
6. **提交审核前必须通过：** `npm run build`、`npm run check`（astro check）、`npm run lint`。任何一个失败都不能提交审核。
7. **每个里程碑结束时写审核报告** `docs/reviews/M<编号>.md`，格式按 `docs/reviews/TEMPLATE.md`。PR 描述里贴报告的摘要。
8. **按审核意见修改时：** 在同一分支上提交，提交信息以 `review-fix:` 开头，并在报告末尾的“修改记录”追加本轮改了什么。
9. **双语字段与界面文字。** 所有面向访客的内容字段使用 `{ en, zh }`，en 必填（可 TODO），zh 选填；通过 `localized(value, locale)` 读取，中文缺失 / 空白回退英文。数字、尺寸、克重、图片、型号、slug 共用一份。固定界面文案、按钮、标签、提示、aria / alt 都集中在 `src/i18n/en.json` / `zh.json` 并经 `t(key, locale)` 读取，组件中不硬编码英文。M4.5 只输出英文路由（美式英语），中文页面在 M4.6 实现；代码注释和审核报告用中文。
10. 移动端优先：每个页面必须在 375px 宽度下不溢出、不横向滚动。

## 4. 目录约定

```
src/
  config/site.ts          # 网站设置类型、校验、TODO / localized 工具
  data/site.json          # 网站设置唯一来源（双语内容）
  data/faq.json           # FAQ 唯一来源
  data/customization.json # 定制流程
  data/cases.json         # 真实案例；空数组时隐藏
  data/team.json          # 真实团队；空数组时隐藏
  i18n/en.json            # 英文界面字典
  i18n/zh.json            # 中文界面字典（M4.5 先留空翻译）
  i18n/utils.ts           # localized / t 与回退
  components/             # 可复用组件（Header, Footer, QuoteButton, WhatsAppFloat, ProductCard...）
  layouts/BaseLayout.astro
  pages/                  # 路由
  content/
    config.ts             # collection schema
    categories/*.json    # 分类 id 由文件名生成
    products/*.json      # 结构化双语产品，不再用 Markdown 正文
    blog/*.md
  assets/images/          # 需要优化的图片
public/                   # favicon、robots.txt 等原样输出的文件
functions/api/inquiry.ts  # 表单后端
.pages.yml               # Pages CMS 后台配置
docs/
  PLAN.md
  CMS.md                 # 工厂人员内容维护指南
  reviews/TEMPLATE.md
  reviews/M<编号>.md
  reviews/M<编号>/        # 本里程碑的截图
```

分类、产品通过 Astro Content Collections 读取并校验。CMS 引用字段保存 `<id>.json`，schema 统一转换为 id；没有产品的分类不展示、不生成页面。首页只展示 showOnHome 且有产品的分类，最多 6 个。上传图片路径相对 JSON 文件，按 `.pages.yml` 与 `docs/CMS.md` 维护，不用外部图片冒充实拍。

## 5. 截图规则（审核用）

能运行 Playwright 时，每个里程碑对本次新增 / 改动的页面截图，存到 `docs/reviews/M<编号>/`：

- `<页面>-desktop.png`：1440 × 900，整页截图
- `<页面>-mobile.png`：375 × 812，整页截图

用 `npm run screenshots -- M<编号>` 生成（M0 里实现这个脚本）。如果环境装不了 Playwright，在报告里注明“未截图”和原因，不要因此卡住。

## 6. 设计基调

采用温暖、克制的烘焙纸品风格，主题统一定义在 `src/styles/global.css` 的 `@theme` 中：

- 背景使用 cream `#faf7f1`、paper `#f4eee5` 和 sand `#e8ddce`，卡片为 white `#ffffff`；正文使用 ink `#30271f`、ink-soft `#50453b`，弱化信息使用 muted `#85786b`，细边框使用 line `#e8e1d7`。
- 主按钮、公告条、深色区块和页脚使用 coffee `#36291f`，悬停使用 coffee-2 `#4b3527`；强调色为 copper `#a55c39` 和 copper-dark `#8e492d`。深色背景配 cream / sand 文字，页脚链接悬停为 copper。
- 只用两种本地 Fontsource 字体：正文 DM Sans，标题 Newsreader 400（常规体及斜体）。H1 字距约 `-0.05em`、H2 约 `-0.045em`，行高约 `1.05`。DisplayHeading 第二段为 copper 斜体。
- 按钮、卡片和输入框圆角统一为 2–3px；卡片白底细边框。阴影使用 `0 18px 55px rgba(50,38,29,.11)`，不使用大圆角或悬停位移动画。
- primary 按钮 coffee 底白字，11–12px、字重 800、字距约 `0.06em`，右侧带箭头；secondary 透明底、ink 细边框。深色区块内增加浅色边框和文字对比，悬停只变色。
- Eyebrow 小号大写、字距约 `0.2em`、copper 色，左侧 24px 细线；深色区块内文字用 cream 保持可读性。CheckList 使用 copper 细边框方框和勾号。
- Header 为 cream 半透明吸顶样式，当前导航为 copper 文字及细下划线；手机导航保持独立的 `Mobile` 标签。TopBar 从 `site.topBarItems` 读取，隐藏 TODO 项，手机仅显示第一条有效项。
- StatsBar 从 `site.stats` 数组读取，白底、衬线数字、大写标签、竖线分隔，手机两列；TODO 数值保留为可见的 `[TODO: …]`。
- 产品实拍未提供时继续使用带 `Placeholder` 字样的新配色本地占位图，不复制参考站图片，不用 AI 产品图冒充实拍。所有页面保持 375px 下无横向溢出。
