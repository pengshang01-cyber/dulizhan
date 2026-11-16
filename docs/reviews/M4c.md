# M4c 审核报告：中文站上线与微信联系（M4.6）

- 分支：`m4c-zh`
- PR：[#8](https://github.com/pengshang01-cyber/dulizhan/pull/8)
- PR 预览地址：无已核实的 PR 预览；自动触发的 Workers Builds 检查失败，尚无部署成功证据。
- 生产站：[dulizhan.pengshang01.workers.dev](https://dulizhan.pengshang01.workers.dev)，由用户提供；本分支尚未合并，该地址不代表本次 PR 预览。
- 提交时间：2026-11-16
- 基线：确认 PR #7 已合并，切回 main 快进到 `5829476`（含用户手工提交的 wrangler.jsonc），再创建本分支。

## 1. 完成情况

| # | 任务 | 状态 | 说明 / 相关文件 |
| --- | --- | --- | --- |
| 1 | 中英文路由 | 完成 | Astro locales 为 en / zh，英文保持根路径、中文在 /zh/；共 29 页，分类 id / 产品 slug 共用，styleguide 只保留英文。 |
| 2 | 共用页面实现 | 完成 | 10 个 `src/components/pages/*Page.astro` 接收 locale，路由文件仅为薄封装；产品静态路径集中在 `src/lib/product-paths.ts`，没有复制两套页面正文。 |
| 3 | EN / 中文切换 | 完成 | Header 桌面入口与手机菜单均有切换；保留对应页面、查询参数与锚点，支持页面内锚点变化及 history 更新后的切换。 |
| 4 | lang、hreflang 与站内链接 | 完成 | 中文 html 为 zh-CN，正常页面输出 en / zh-CN / x-default（英文）三项；`localePath` 统一链接。styleguide 无中文对应页，仅输出 en / x-default。 |
| 5 | 全部中文界面 | 完成 | 410 个字典键补齐中文，13 条 FAQ、4 步定制流程、已确认公告和统计标签补齐 zh；详情产品资料中文仍由工厂填写，空时回退英文。 |
| 6 | 中文字体与排版 | 完成 | 中文调用系统衬线 / 无衬线字体，拉丁字符和数字继续优先 Newsreader / DM Sans；标题字距 0、行高 1.3，copper 强调为正体。无中文字体下载。 |
| 7 | 中文微信入口 | 完成 | ContactFloat 中文优先微信；桌面右侧浮层、手机底部面板，显示二维码 / 微信号、复制成功或失败反馈，支持键盘、焦点循环和 Esc。无有效微信时回退 WhatsApp。 |
| 8 | 联系页与页脚 | 完成 | 中文联系卡：微信 → 电话 → WhatsApp → 邮箱 → 地址；英文原顺序保留。中文页脚显示有效微信号，英文显示 WhatsApp 与有效 WeChat。 |
| 9 | 共用询价单 | 完成 | 保留 `inquiry:v1`；显示时从当前语言的产品目录取名与地址，不改存储中的数量。中文继续按钮为 `/zh/contact/?from=inquiry#quote`。 |
| 10 | Workers 配置 | 完成 | wrangler.jsonc 仅 Prettier 格式化，`./dist` 与 `404-page` 含义不变；未提前添加 Worker API 或正式 404 页。 |
| 11 | 部署文档及后续计划 | 完成 | README、AGENTS、PLAN、CMS 指南与审核模板改为 Workers；M5 规划 Worker main / ASSETS 绑定，仅 /api/* 先走 Worker；M8 增加打开收录开关。Pages CMS 名称保留。 |
| 12 | 上线前禁止收录 | 完成 | allowIndexing 默认 false，CMS 可编辑；public 源文件默认禁止，build hook 按同一开关生成 robots / _headers，BaseLayout 同步 meta。 |
| 13 | 工作记录整理 | 完成 | 三份根目录工作记录移至 `docs/notes/history.md`、`status.md`、`decisions.md`；内容保留并更新，AGENTS 说明后续记录位置。 |
| 14 | 检查与截图 | 完成 | build / check / lint / test 全通过；32 张截图及全站浏览器 QA。 |
| 15 | 报告及 PR | 完成 | 本报告附截图与英中对照表，PR #8 已创建，GitHub CI 通过；Workers Builds 失败详情见第 2 节。 |

## 2. 验收标准自检

- [x] `npm run build`：29 个静态页面（15 英文、14 中文）。
- [x] `npm run check`：89 个文件，0 errors / warnings / hints。
- [x] `npm run lint`：ESLint + Prettier 通过，包含 wrangler.jsonc。
- [x] `npm test`：9 个测试文件、111 项通过。新增路由往返 / 参数保留、中文字典完整性与插值、共享询价显示、收录开关与默认值测试。
- [x] `npm run screenshots -- M4c`：32 张，包含用户要求的全部页面及微信桌面 / 手机弹层。
- [x] 29 条路由在 1440 × 900 和 375 × 812 下均 HTTP 200、唯一 H1、图片可解码、无页面横向溢出；尺寸表和手机分类筛选可在自身容器内横滚。
- [x] 中文站所有内部链接保持 /zh/，语言切换链接除外；每个 hreflang 指向对应可生成页面，英文 x-default 正确，styleguide 不创建虚假中文链接。
- [x] 英文加入两个产品后切中文，分别保留空数量与 10,000；中文联系页摘要正确，切回英文仍为同一清单及数量。产品标题从当前语言目录读取，中文未填时回退英文。
- [x] 微信桌面和手机浮层、Enter / Tab / Shift+Tab / Esc、焦点归还、复制成功和失败提示均通过；无微信时正确回退 WhatsApp。
- [x] 默认产物包含 `Disallow: /`、全路径 `X-Robots-Tag: noindex, nofollow`；页面也有 noindex / nofollow。
- [x] 收录开关纯函数及默认值测试通过；开启后的真实独立构建验证通过，结果见下方。
- [x] 与 main `5829476` 的独立构建逐一比较：15 个英文页面的 main 正文在归一空白后完全一致；首页英文内容未变。页头新增语言切换、条件微信入口和禁止收录标记为本轮要求内变化。
- [x] 产品 JSON、分类 ID / slug、询价存储键和既有事实占位不变；无新依赖、无密钥、无伪造联系方式。

关键命令输出：

```text
build: 29 page(s) built in 1.27s
check: Result (89 files), 0 errors, 0 warnings, 0 hints
lint: All matched files use Prettier code style!
test: Test Files 9 passed (9), Tests 111 passed (111)
screenshots: 32 PNG files
browser: 29 routes x 2 viewports PASS
English baseline: 15 page main texts unchanged
```

收录开关实际构建：临时仅将 allowIndexing 改为 true，构建到独立目录；robots 允许抓取并指向真实 Sitemap，_headers 不含 noindex，中英文普通页移除全站 robots meta；两种 Inquiry 与英文 Styleguide 保留 noindex 且不进入 sitemap。随后按原始字节恢复 site.json，确认 allowIndexing=false，默认 dist 的禁止收录产物逐字节未变。

### 自动检查结果

- GitHub Actions 的 [CI 43859840551](https://github.com/pengshang01-cyber/dulizhan/actions/runs/43859840551) 四项检查通过（实现提交 5f84b78）。
- [Workers Builds 检查](https://github.com/pengshang01-cyber/dulizhan/pull/8/checks) 返回 failure。GitHub check summary 只有构建 ID `26b2623d-c578-4316-a1ec-cf24024a0f8e` 和控制台链接，无错误说明或 annotations；当前工具无法读取该登录控制台。已请求用户提供首条错误及附近日志，原因尚未确定。
- main 基线的 Workers Builds 曾成功；本次不能据此推断 PR 部署成功。最终提交的两类检查状态以 PR Checks 为准。

### Workers 与 404 核验边界

`assets.directory: "./dist"` 与默认 Astro 输出目录一致，`not_found_handling: "404-page"` 保持原值。按 [Workers 官方静态站路由说明](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)，缺失资源会查找最近的 404.html 并以 HTTP 404 返回；没有该文件时返回空正文 404，不回退首页。正式 404 页面按要求留到 M6。

本机对生产域名的只读请求未取得响应：PowerShell 出现 TLS 认证错误，Node fetch 连接超时，网页读取也不可达。因此已确认配置及官方机制，**未声称生产 HTTP 404 或本次响应头已实测通过**。本次没有执行部署命令；合并后由已连接的 Workers Builds 构建和部署。

## 3. 截图

存放于 `docs/reviews/M4c/`。普通页面为整页截图；微信弹层为视口截图，便于查看桌面位置与手机底部面板。

| 页面 / 状态 | Desktop | Mobile |
| --- | --- | --- |
| 英文首页回归 | [home](M4c/home-desktop.png) | [home](M4c/home-mobile.png) |
| 中文首页 | [home](M4c/zh-home-desktop.png) | [home](M4c/zh-home-mobile.png) |
| 中文产品中心 | [products](M4c/zh-products-desktop.png) | [products](M4c/zh-products-mobile.png) |
| 中文分类页 | [category](M4c/zh-product-category-desktop.png) | [category](M4c/zh-product-category-mobile.png) |
| 中文详情页 | [detail](M4c/zh-product-detail-desktop.png) | [detail](M4c/zh-product-detail-mobile.png) |
| 中文定制页 | [custom](M4c/zh-custom-desktop.png) | [custom](M4c/zh-custom-mobile.png) |
| 中文关于页 | [about](M4c/zh-about-desktop.png) | [about](M4c/zh-about-mobile.png) |
| 中文资讯占位页 | [blog](M4c/zh-blog-desktop.png) | [blog](M4c/zh-blog-mobile.png) |
| 中文 FAQ | [faq](M4c/zh-faq-desktop.png) | [faq](M4c/zh-faq-mobile.png) |
| 中文联系页默认态 | [contact](M4c/zh-contact-desktop.png) | [contact](M4c/zh-contact-mobile.png) |
| 中文联系页含询价摘要 | [summary](M4c/zh-contact-inquiry-desktop.png) | [summary](M4c/zh-contact-inquiry-mobile.png) |
| 中文询价空状态 | [empty](M4c/zh-inquiry-empty-desktop.png) | [empty](M4c/zh-inquiry-empty-mobile.png) |
| 中文询价两个产品 | [filled](M4c/zh-inquiry-filled-desktop.png) | [filled](M4c/zh-inquiry-filled-mobile.png) |
| 中文询价填写 / 留空数量 | [quantities](M4c/zh-inquiry-quantities-desktop.png) | [quantities](M4c/zh-inquiry-quantities-mobile.png) |
| 中文联系页微信预览 | [WeChat card](M4c/zh-contact-wechat-preview-desktop.png) | [WeChat card](M4c/zh-contact-wechat-preview-mobile.png) |
| 微信浮层 / 底部面板 | [dialog](M4c/zh-wechat-dialog-desktop.png) | [sheet](M4c/zh-wechat-dialog-mobile.png) |

微信截图继续使用独立构建的内存测试配置，微信号为 `PREVIEW_ONLY_NOT_A_WECHAT_ID`，图片明确标为 Placeholder / Preview only，不是可扫描二维码。正式 site.json 中微信仍为 TODO / 空，没有写入测试号。正式 WhatsApp 也为 TODO 时，两种入口均隐藏。

## 4. 偏离与新增依赖

- 无新增 npm 依赖；未下载或自托管中文字体，package.json / lockfile 未变。
- 路由复用同一套带 locale 的组件，中文只新增薄路由文件；使用 [Astro 内置 i18n 配置](https://docs.astro.build/en/guides/internationalization/) 保持英文无前缀。
- styleguide 按要求只保留英文，因此该页不显示语言切换，也不输出不存在的 zh-CN alternate。
- 当前为 Workers 静态资源部署；M5 Worker API、M6 正式 404、M8 正式开放收录均未提前实现。site.domain 使用本轮用户明确提供的真实地址，其他工厂资料继续 TODO。
- [Workers _headers](https://developers.cloudflare.com/workers/static-assets/headers/) 适用于静态资源响应；未来 Worker API 的返回头要在 M5 单独处理，已写入文档。M8 改 allowIndexing 并重新部署即可同步 robots、静态响应头和页面 meta。
- 当前配置 404 机制正确，但环境无法连接生产域名进行实测，详见第 2 节；没有把生产地址当作本次 PR 的已部署预览。
- 历史审核报告保持历史事实，不批量改写过去的 Cloudflare Pages 记录；当前指南、计划、规则和模板已更新 Workers。Pages CMS 是独立内容后台品牌，名称保持不变。
- 三份工作记录按本轮明确要求迁到 docs/notes，后续按 AGENTS 的新位置维护。

### 中文界面文字对照

完整 **410 项**英文 → 中文对照见 [M4c-translations.md](M4c-translations.md)，包含导航、按钮、区块标题、提示及 aria / alt。常用示例如下：

| 英文 | 中文 |
| --- | --- |
| Get a Quote | 获取报价 |
| + Add to inquiry | + 加入询价单 |
| ✓ Added | ✓ 已加入 |
| Ask for pricing | 询价 |
| Factory Direct | 源头工厂 |
| To be discussed | 待沟通 |
| Your Inquiry List | 您的询价单 |
| Continue to Quote Form | 继续填写询价表单 |
| Copy WeChat ID | 复制微信号 |
| Copied | 已复制 |
| Press and hold to recognize the QR code. | 长按识别二维码 |

文案使用已确认的定性卖点，不新增 MOQ、交期、付款、产能或证书声明。产品标题和产品 FAQ 属于工厂维护的数据，中文为空时保留英文显示，这属于已约定的回退行为。

## 5. 待确认问题

1. 工厂提供真实微信号及二维码后，可在 Pages CMS 填写；当前浮层截图仅用于审核交互。
2. 请提供 PR #8 的 Workers Builds 首条错误及附近日志，以便定位失败原因；当前无可核实的独立 PR 预览。
3. 产品中文仍由工厂按需补充；M8 前保持 allowIndexing=false。

## 6. 本次新增的 TODO 占位

本轮未增加新的工厂事实占位。原有公司资料、联系方式、证书、视频、政策和产品参数继续保留 TODO；已将待补资料的界面标签翻译为中文。

| 位置 | 后续所需资料 |
| --- | --- |
| `src/data/site.json → wechatId / wechatQr` | 真实微信号及二维码；现有 TODO / 空值保留。 |
| `src/content/products/*.json → zh` | 工厂提供的产品中文名称、描述和规格说明；未填时回退英文。 |

## 7. 修改记录

### 第 1 轮实现与自检（2026-11-16）

- 完成共享双语页面、410 项界面翻译、中文内容与系统字体、微信交互、共享询价显示。
- 同步 Workers 部署约定，加入默认禁止收录及单开关输出，迁移工作记录。
- 浏览器自检修复微信浮层的首尾 Tab 焦点循环，以及语言切换对动态 query / hash 的同步。
- 四项检查、全站双视口检查、英文基线对比和 32 张截图完成。
- PR：[#8](https://github.com/pengshang01-cyber/dulizhan/pull/8)；GitHub CI 通过，Workers Builds 失败且日志待提供。
