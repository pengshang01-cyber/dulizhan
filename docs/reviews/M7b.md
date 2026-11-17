# M7b 审核报告：M7.5 图片全部后台化

- 分支：m7b-images
- PR：[PR #12](https://github.com/pengshang01-cyber/dulizhan/pull/12)
- 预览地址：[M7.5 Workers 预览](https://m7b-images-dulizhan.pengshang01.workers.dev)（已实测）
- 提交时间：2026-11-17
- 基线：PR #11 已合并，main 5043737700b6b76efc88f920ddd0e30bd069e661；已切 main 快进拉取后创建本分支。

## 1. 完成情况

| # | 任务 | 状态 | 说明 / 相关文件 |
| --- | --- | --- | --- |
| 1 | 全站内容图片可由 CMS 管理 | 完成 | 统一在“网站设置”补齐页面图片；其余沿用各内容条目，无需重复维护 |
| 2 | Astro 图片、路径及回退 | 完成 | site.ts 校验，site-images.ts 统一解析，Image / getImage 输出 WebP、宽高；首页 eager / high、图库 lazy |
| 3 | CMS 指南和资料清单 | 完成 | .pages.yml、CMS.md 第 11 节、todo-report.ts 与 LAUNCH-CHECKLIST.md；不再存在“目前无 CMS 字段”条目 |
| 4 | 原始性能报告整理 | 完成 | 删除 M7/lighthouse 的 9 个 JSON / HTML，共 5,060,943 bytes（约 4.83 MiB）；M7 报告保留分数摘要，更新 .gitignore / AGENTS |

选择“网站设置”统一入口：工厂无需额外查找页面文件，图片与现有标志、微信、证书在同一菜单；配置唯一来源仍为 src/data/site.json。工厂信息、产品、文章状态、现有 domain 和 allowIndexing=false 均保留。

### 图片来源逐项核对

| 展示位置 | CMS 入口 / 字段 | 空值行为 |
| --- | --- | --- |
| 页头 Logo、Organization.logo | 网站设置 → 网站 Logo（logo） | 页头继续原图标 + 文字，JSON-LD 不输出 logo |
| OG / Twitter 默认分享图 | 网站设置 → 默认分享图（ogImage） | public/og-default.jpg；文章有非占位封面时优先封面 |
| 首页 Hero | 网站设置 → 首页主图 / 说明（homeHeroImage / homeHeroAlt） | 现有首页 Placeholder 与说明 |
| 关于页车间 / 设备 | 网站设置 → 关于我们车间与设备照片（aboutGallery） | 空列表恢复原有四图；非空按列表顺序，仅显示上传条目 |
| 首页视频封面 | 网站设置 → 工厂视频封面（factoryVideoPoster） | 沿用 YouTube 缩略图；视频 ID 为 TODO 时整个区块隐藏 |
| 首页 / 产品分类封面 | 分类 → 分类封面 | 沿用分类条目中的明确占位图 |
| 产品卡片、详情、相关产品 | 产品 → 产品图片 | 沿用产品图片列表 |
| 博客封面、正文图片 | 资讯文章 → 封面 / Markdown 图片上传 | 沿用对应数据，两篇示例仍是草稿 |
| 首页 / 关于证书 | 网站设置 → 证书 | 资料未确认时隐藏 |
| 联系页及微信浮层 / 感谢页 | 网站设置 → 微信二维码 | 保留既有隐藏 / 联系入口回退 |
| 定制页案例 | 案例 → 图片 | 空列表隐藏 |
| 关于页团队 | 团队 → 图片 | 空列表隐藏 |

定制页和联系页没有额外固定素材，继续使用上述案例、微信字段；界面 SVG 图标是设计组件。上传 Logo 后手机端显示 Logo，品牌文字保留读屏名称；桌面仍显示 Logo、品牌及副标题。空 Logo 时布局完全保持原状。

## 2. 验收标准自检

- [x] npm run build：35 页构建成功。
- [x] npm run check：140 个文件，0 errors / warnings / hints。
- [x] npm run lint：ESLint 与 Prettier 全通过。
- [x] npm test：18 个测试文件、278 项通过；新增清空 / 省略字段、CMS 路径、路径越界 / 远程拒绝、图库顺序及英文必填检查，补充清单重新扫描测试。
- [x] npm run seo:check 与 npm run links:check 全通过。
- [x] npm run screenshots -- M7b：16 张截图；1440 × 900、375 × 812，均无横向溢出。浏览器断言包含双语说明、中文为空回退英文、两图顺序、WebP、宽高、eager/high 与 lazy、OG/Twitter 一致、分享图实际 1200 × 630、JSON-LD Logo 资源 HTTP 200。
- [x] 默认中英文首页桌面 / 手机截图与 M7 对应截图逐像素相同，见 [对比结果](M7b/default-visual-comparison.json)。关于页空列表仍为原有四张图，上传列表只显示两张图且没有“占位图”图注。
- [x] 正式 site.json 新图片字段最终全部空值 / 空列表；测试图片已删除，独立构建不覆盖正式 dist，截图脚本逐字节核对正式设置未改动。
- [x] todo:report：所有新增字段纳入扫描，补齐后对应项消失，人工上线检查部分由生成器保留。

关键输出：

~~~text
[build] 35 page(s) built
Result (140 files): 0 errors, 0 warnings, 0 hints
All matched files use Prettier code style!
Test Files 18 passed (18); Tests 278 passed (278)
SEO: 35 HTML pages; 57 JSON-LD blocks; 104 hreflang links
Indexing: 35 noindex pages; 0 sitemap page URLs
Result: 0 errors, 0 warnings
Links: 35 HTML pages; 1352 internal links; 108 anchors
Result: 0 errors
TODO report: {"scannedFiles":22,"todoFields":95,"placeholderReferences":20,"emptyImages":7,"exampleProducts":3}
Updated docs/LAUNCH-CHECKLIST.md; manual checklist preserved.
~~~

### CMS 写入格式与临时上传验证

沿用官方 [media input/output](https://pagescms.org/docs/configuration/media/)、[image 字段](https://pagescms.org/docs/configuration/fields/image/) 和 [object 列表](https://pagescms.org/docs/configuration/fields/object/)：上传目录 src/assets/images/site，数据写入 ../assets/images/site/文件名.png，相对于 src/data/site.json。resolveSiteImage 将其转换为导入的 ImageMetadata，再交给 [Astro 图片处理](https://docs.astro.build/en/guides/images/)。不把相对路径直接发给浏览器。缺图会在构建时明确报错，防止发布坏图；清空字段会恢复默认。

以下是截图独立构建使用的实际字段片段（仅测试，不是工厂资料）。一张测试 Logo、一张首页图、两张车间图；首页测试图同时验证默认分享图和视频封面。所有图明确标注 CMS TEST / Placeholder，未使用网络图或 AI 产品图。第二张车间说明的中文有意留空，验证中文回退英文。

~~~json
{
  "logo": "../assets/images/site/m7b-test-logo.png",
  "ogImage": "../assets/images/site/m7b-test-hero.png",
  "homeHeroImage": "../assets/images/site/m7b-test-hero.png",
  "homeHeroAlt": {
    "en": "CMS test home hero",
    "zh": "CMS 测试首页主图"
  },
  "aboutGallery": [
    {
      "image": "../assets/images/site/m7b-test-workshop-one.png",
      "caption": {
        "en": "CMS test workshop one",
        "zh": "CMS 测试车间一"
      }
    },
    {
      "image": "../assets/images/site/m7b-test-workshop-two.png",
      "caption": {
        "en": "CMS test workshop two",
        "zh": ""
      }
    }
  ],
  "factoryVideoPoster": "../assets/images/site/m7b-test-hero.png",
  "youtubeVideoId": "TESTVIDEO01"
}
~~~

脚本 scripts/site-images-preview.ts 将此对象合并到独立构建的内存配置中，临时图片以独占写入创建，finally 中逐个删除；生产 JSON 逐字节不变，最终仅保留截图与 [浏览器验证摘要](M7b/images-browser.json)。本轮未登录 Pages CMS 网页执行保存，使用官方字段格式验证上传路径、真实构建与浏览器显示。

### 预览构建

代码提交 af8148e 的 [GitHub CI](https://github.com/pengshang01-cyber/dulizhan/actions/runs/44036230728) 和 Workers Builds 均为 SUCCESS。2026-11-17 07:08:59 UTC 实测预览的英文 / 中文首页和关于页：全部 HTTP 200，html lang 分别为 en / zh-CN，保留 noindex；首页与车间默认占位图、默认分享图存在，Logo 和测试素材未泄露。见 [部署实测](M7b/deployment.json)。

文档回填提交只更新报告、计划和状态记录，最终状态以 [PR #12 Checks](https://github.com/pengshang01-cyber/dulizhan/pull/12/checks) 为准。

## 3. 截图

存放于 docs/reviews/M7b/：

| 页面 / 状态 | Desktop | Mobile |
| --- | --- | --- |
| 空字段 / 英文首页 | [桌面](M7b/images-default-home-desktop.png) | [手机](M7b/images-default-home-mobile.png) |
| 空字段 / 中文首页 | [桌面](M7b/images-default-zh-home-desktop.png) | [手机](M7b/images-default-zh-home-mobile.png) |
| 空字段 / 英文关于 | [桌面](M7b/images-default-about-desktop.png) | [手机](M7b/images-default-about-mobile.png) |
| 空字段 / 中文关于 | [桌面](M7b/images-default-zh-about-desktop.png) | [手机](M7b/images-default-zh-about-mobile.png) |
| 上传测试 / 英文首页 | [桌面](M7b/images-uploaded-home-desktop.png) | [手机](M7b/images-uploaded-home-mobile.png) |
| 上传测试 / 中文首页 | [桌面](M7b/images-uploaded-zh-home-desktop.png) | [手机](M7b/images-uploaded-zh-home-mobile.png) |
| 上传测试 / 英文关于 | [桌面](M7b/images-uploaded-about-desktop.png) | [手机](M7b/images-uploaded-about-mobile.png) |
| 上传测试 / 中文关于 | [桌面](M7b/images-uploaded-zh-about-desktop.png) | [手机](M7b/images-uploaded-zh-about-mobile.png) |

## 4. 偏离与新增依赖

- 无范围偏离；复用已有 logo 字段，另增加可选视频封面以覆盖全站图片目标。未改变 Workers 配置、表单后端或收录开关，不执行 M8。
- 无新增 npm 依赖、无外部素材下载。复用已有 Sharp 绘制明确测试色块与文字，Playwright 使用已有 Chromium。
- 本地 Sharp 提示系统字体缓存目录不可写，测试图片仍正常生成并完成浏览器解码和视觉核对；截图命令退出码为 0。
- Lighthouse 不重复跑；按用户要求删除历史原始报告，只保留 M7 的既有分数摘要。

## 5. 待确认问题

本轮无阻塞问题。工厂需在 CMS 上传正式 Logo、主图、车间实拍和分享图，并核对中英文说明；上线资料仍见 [上线清单](../LAUNCH-CHECKLIST.md)。

## 6. 本次新增的 TODO 占位

没有新增虚构工厂资料或 TODO 文本。以下可选图片字段当前为空，待工厂上传；Logo 为已有空字段。

| 位置 | 需要的资料 |
| --- | --- |
| site.json → ogImage | 1200 × 630 正式分享图 |
| site.json → homeHeroImage / homeHeroAlt | 首页真实产品图及双语说明，建议 1600 × 1200 |
| site.json → aboutGallery | 真实印刷、成型、质检、包装等照片与说明；建议 1600 × 1067，可增删排序 |
| site.json → factoryVideoPoster | 可选视频封面，建议 1280 × 720 |

## 7. 修改记录

本轮初次提交，暂无审核后修改。
