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

1. **不编造事实。** 工厂名、年限、产能、出口国家数、证书、客户案例、联系方式一律从 `src/config/site.ts` 读取；没有的值用明显的占位符 `TODO_xxx`，页面上显示为 `[TODO: xxx]`。绝不自己写 “FDA certified”“20 years experience” 之类的具体声明。
2. **所有可配置信息集中在 `src/config/site.ts`**：公司名、邮箱、电话、WhatsApp 号码、地址、社媒链接、核心数字、证书列表。
3. **密钥不进仓库。** 只用环境变量，并在 `.env.example` 里列出变量名。
4. **一次只做一个里程碑。** 只做 `docs/PLAN.md` 里当前里程碑的范围，不提前做后面的内容。上一个里程碑的 PR 没合并之前，不开始下一个。
5. **分支与 PR：** 每个里程碑一个分支 `m<编号>-<短名>`（如 `m2-homepage`），完成后向 `main` 开 PR，标题 `M<编号>: <名称>`。
6. **提交审核前必须通过：** `npm run build`、`npm run check`（astro check）、`npm run lint`。任何一个失败都不能提交审核。
7. **每个里程碑结束时写审核报告** `docs/reviews/M<编号>.md`，格式按 `docs/reviews/TEMPLATE.md`。PR 描述里贴报告的摘要。
8. **按审核意见修改时：** 在同一分支上提交，提交信息以 `review-fix:` 开头，并在报告末尾的“修改记录”追加本轮改了什么。
9. 网站文案用美式英语；代码注释和审核报告用中文。
10. 移动端优先：每个页面必须在 375px 宽度下不溢出、不横向滚动。

## 4. 目录约定

```
src/
  config/site.ts          # 全站可配置信息（唯一来源）
  components/             # 可复用组件（Header, Footer, QuoteButton, WhatsAppFloat, ProductCard...）
  layouts/BaseLayout.astro
  pages/                  # 路由
  content/
    config.ts             # collection schema
    products/*.md
    blog/*.md
  assets/images/          # 需要优化的图片
public/                   # favicon、robots.txt 等原样输出的文件
functions/api/inquiry.ts  # 表单后端
docs/
  PLAN.md
  reviews/TEMPLATE.md
  reviews/M<编号>.md
  reviews/M<编号>/        # 本里程碑的截图
```

## 5. 截图规则（审核用）

能运行 Playwright 时，每个里程碑对本次新增 / 改动的页面截图，存到 `docs/reviews/M<编号>/`：

- `<页面>-desktop.png`：1440 × 900，整页截图
- `<页面>-mobile.png`：375 × 812，整页截图

用 `npm run screenshots -- M<编号>` 生成（M0 里实现这个脚本）。如果环境装不了 Playwright，在报告里注明“未截图”和原因，不要因此卡住。

## 6. 设计基调

干净、明亮、有烘焙感；让产品花色当主角。白色 / 浅米色背景，1 个主色 + 1–2 个辅助色（定义在 Tailwind 主题里），英文字体最多 2 种。询盘按钮用最显眼的颜色，全站统一。
