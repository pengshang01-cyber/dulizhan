# 历史事件

## 2026-11-16：M4.5 实施

- 核实 PR #6 已合并，快进 main 后创建 m4b-cms。
- 按用户确认的计划完成 CMS、分类数据化与双语数据结构；保留 M4 视觉与原英文。
- 完成真实文件格式构建、空分类 / 必填校验、M4 浏览器文本对比及 30 张截图。微信预览采用独立内存配置，源资料仍为 TODO。
- 补齐项目记忆和 PRD 索引；更早事实保留在各历史审核报告，不追溯编写未经核实的操作记录。

- 完成本地四项检查（15 页、57 文件零错误、85 测试），提交 4df244e，推送 m4b-cms 并创建 PR #7。GitHub CI 43852733875 四项检查通过；报告已回填 PR 和检查链接。尚无可核实的 Cloudflare 预览，Pages CMS 登录授权留给账号持有人。

## 2026-11-16：M4.6 启动与部署迁移

- PR #7 已审核合并，用户在 main 手工添加 Workers 静态资源配置，站点地址为 https://dulizhan.pengshang01.workers.dev。
- 用户确认 M4.6 计划后，从 main 的 5829476 建立 m4c-zh，实施中文站与微信联系。
- 按用户要求将根目录三份工作记录移入 docs/notes/ 并使用 history.md、status.md、decisions.md；保留历史正文，后续只追加历史。
- 部署说明改为 Workers Builds，收录默认关闭；M5 Worker API 与 M6 正式 404 页面保持后续阶段范围。

- M4.6 本地实现完成：29 页、410 项界面中文、32 张截图；build / check / lint / 111 项测试通过。全站双视口和共享清单 / 微信交互通过，15 个英文正文与 main 基线一致；allowIndexing=true 实际构建通过后恢复 false。准备提交 PR 审核，未直接部署。

- 已提交 5f84b78 并推送 m4c-zh，创建 PR #8。GitHub Actions CI 43859840551 四项检查通过；Workers Builds 26b2623d-c578-4316-a1ec-cf24024a0f8e 返回 failure，GitHub 无错误详情，已请求用户提供控制台日志。尚未定位或宣称部署成功。

- 2026-11-16 审核修复：用户确认 Workers 预览命令缺少 previews 配置；顶层加入 previews: {}，其余配置未改，README / M4c 报告同步。lint 与 build 均通过，按指定 review-fix 提交信息推送同一分支。

- 2026-11-16：按用户确认计划，从已合并PR #8的main c38401a创建m5-inquiry；完成双语询盘表单/感谢页、Worker API及邮件、防垃圾、中文标题修复。四项检查通过，183 tests、42截图；本地Wrangler真实Siteverify两次+mock邮件两封，未实际发信。报告docs/reviews/M5.md。

- 2026-11-16：M5实现提交f10b446推送并创建PR #9；GitHub CI通过，Workers Builds失败且GitHub未提供错误日志，已请求用户提供控制台报错。未宣称云端部署成功。

- 2026-11-17：用户提供完整Cloudflare日志，确认31页构建成功、部署实际执行wrangler versions upload 4.163.0并在身份标识校验失败；补充README的生产/预览命令区分及M5报告。云端命令修正及重试待用户操作，未改Worker名称或绕过身份检查。

- 2026-11-17：用户确认已将m5-inquiry预览实例命令修改为npx wrangler preview；补充记录并推送以触发新的分支构建验证，业务代码未变。

### 2026-11-17：M5 分支预览部署通过

- 已有m5-inquiry预览实例改为npx wrangler preview后，提交10b427b的GitHub CI及Workers Builds均成功；Cloudflare构建ID为af873743-05d3-4295-95fd-b6c2490acead。Worker名称和业务代码保持不变。
- 预览地址：https://m5-inquiry-dulizhan.pengshang01.workers.dev；只读验证英文首页和中文联系页200、API GET 405及noindex响应头。回填审核报告和PR #9描述；未真实发信，正式服务配置与收件验收仍待工厂操作。

## 2026-11-17 — M6 实施与本地验收

- 用户确认 M6 七步计划；从 PR #9 合并基线 2719c40 创建 m6-seo。
- 完成双语 meta / JSON-LD / sitemap、Cookie 与 GA 事件、双语隐私和 404；新增 seo:check 与 CI，保留禁止收录及 TODO 工厂资料。
- 242 项测试与 20 张截图通过；本地双语 Workers 404、收录开关和浏览器无真实联网统计验证通过。报告 docs/reviews/M6.md 已写，待 PR 预览后补线上 404 证据。

### M6 PR 与预览验证通过

- 实现提交 9a9db67 已推送，PR #10 已创建；GitHub CI 与 Workers 预览构建 0f3196d7-f89d-4195-ad6e-f230bcfaa6c3 通过。
- 预览 m6-seo-dulizhan.pengshang01.workers.dev 的首页 / 中文隐私页 200；英文、中文、深层中文未知路径均为对应语言的 404，带 noindex。报告已补原始响应证据，等待用户审核。

## 2026-11-17 M7 博客、性能与上线清单

用户确认七步计划后，从已合并 PR #10 的 main 0b3d0af 创建 m7-blog-perf。完成 GA 未配置时隐藏 Cookie 界面、JSON 双语博客及 Pages CMS 富文本 / 产品多选、九篇分页、目录 / Article 元数据 / 相关询价、links:check 和 todo:report。两篇指定文章保持草稿。六项检查通过、20 张截图、隔离发布与统计回归完成；Lighthouse P=99–100 / A=100 / BP=100，SEO 因 noindex 为66–69。审核报告 docs/reviews/M7.md；后续提交 PR 并回填预览状态，未执行 M8。

### M7 PR 与预览（2026-11-17 14:34）

代码提交 613fc7f 已推送，PR #11 “M7: Blog, performance and launch checklist” 已创建。GitHub CI 44031642382 与 Workers Builds 成功。预览 m7-blog-perf-dulizhan.pengshang01.workers.dev 实测十个地址通过：中英首页 / 博客 / 隐私200，两篇草稿中英四个地址404，正确语言、Cookie界面隐藏及noindex均确认。已回填 M7 报告与部署证据；等待用户审核，不自动合并。

## 2026-11-17 · M7.5 图片后台化

- 用户确认执行；PR #11 合并后切 main 快进到 5043737，新建 m7b-images。
- 网站设置补齐首页、车间图库、Logo 展示、分享图与视频封面，空值保留默认；更新 CMS 指南和资料清单。
- 删除 M7 Lighthouse 原始报告 9 个文件，保留分数表并忽略以后原始报告；未重写历史提交。
- 六项检查通过，278 项测试；16 张双语截图完成，首页默认状态四张与 M7 逐像素一致，测试图片已清理。PR 与预览状态见 status.md 和 M7b 报告。

- M7.5 提交 af8148e，PR #12 已创建；CI 与 Workers Builds 成功，预览四页实测通过，报告回填实际网址。未合并 PR，交用户审核。

## 2026-11-17 · Turnstile 异步加载修复

- 用户指出线上 ready() 与 async 脚本不兼容；main cd7169a 后创建 fix-turnstile-ready。
- 加载器采用官方 onload 回调；替身加入相同错误约束，补齐超时 / 重试 / 并发测试。
- 本地四项检查及四页浏览器替身验证通过；真实预览结果见 docs/reviews/fix-turnstile.md。

- Turnstile 修复 PR #13 / 代码 9ecd14f 已部署。真实 Chrome（含普通窗口）发现另一项配置限制：Cloudflare 110200，预览域名未授权。已请用户添加预览 hostname；原 ready() 错误未再出现，token 验证仍待完成。

## 2026-11-17 Turnstile 真实预览验收完成

用户在 Cloudflare 保存预览 hostname 后，110200 域名错误消失。普通 Chrome 156.0.8078.74 通过真实 SDK 验证中英联系页和中英产品详情，四页均生成 token、无页面 / Turnstile 错误，询盘请求数为 0。只保存 token 是否生成与长度及成功截图；更新 fix-turnstile 审核报告与 PR #13，未修改密钥、后端或发送真实询盘。

## 2026-11-17 生产询盘服务端验证继续失败

PR #13 已合并，生产站采用 onload 加载器。用户按指引更新 TURNSTILE_SECRET_KEY 并部署后仍复现 verification_failed。为避免凭通用提示猜测，创建 fix-turnstile-server-validation，加入官方错误码白名单 / HTTP 状态 / 异常类型诊断及密钥首尾空白处理；保留验证失败禁止发信。新增 16 项测试，总计 300 项通过，尚待部署后的实际错误码确定根因。

- 诊断修复提交 9c31853，PR #14：https://github.com/pengshang01-cyber/dulizhan/pull/14 。生产排障需审核部署后取得真实 verification 错误码，尚未宣称根因已解决。

## 2026-11-22 M9 产品与公司资料批量导入

从 main fd6d242 创建 m9-product-import。工厂工作簿原样移入 data-import，使用确认的公司资料、13 个分类和 118 个产品。354 条原始记录中纳入 342 条，形成 339 个尺寸或选项。保留逐行合并方案和图片清单。六项检查、312 项测试、重复导入、GitHub CI 和 Workers PR 预览均通过。PR #16 实测双语页面、375px 和 noindex 响应并记录 12 张预览截图。继续等待工厂照片、型号和待核对规格。PR：https://github.com/pengshang01-cyber/dulizhan/pull/16 。

## 2026-11-22 M9.1 公开页面隐藏未补资料

从 main 79a85c3 创建 `m9-1-hide-todo`。公开 HTML 和询盘的产品数据省略待补字段，询价单保留 slug、名称和数量，邮件包含当前语言的产品链接。六项检查及 322 项测试通过，公开 HTML 含占位页面数从 284 降至 0，待补清单保留现有 314 项。Workers PR 预览验证双语 noindex，提交无型号详情和询价单的四张截图。[PR #17](https://github.com/pengshang01-cyber/dulizhan/pull/17)

## 2026-11-22 M10 产品图片挑选、处理与上线

从 main adee147 创建 `m10-product-images`，按产品映射筛选图片并保留原图。91 款产品写入 207 张图库图片，同时更新 13 张分类封面、8 张车间实拍及机器可读的来源与处理清单。27 款保留原占位。六项检查、322 项测试、GitHub CI 和 Workers 构建通过，登记 18 张 PR 预览截图并复核禁止收录响应。[PR #18](https://github.com/pengshang01-cyber/dulizhan/pull/18) · [M10 审核报告](../reviews/M10.md)

## 2026-11-23 M11 资料完善与页面调整

从 main 097c6ad 创建 `m11-content-layout`。接入真实 Logo、微信二维码、OEM 与 ODM、工厂资料和社媒入口。按形状结构化 2026 工作簿规格，匹配 184 个编号，新增 9 款，现共 127 款。按双语图册核对色样，保留歧义清单，图册目录仅本地读取。六项检查、327 项测试、GitHub CI 和 Workers 预览通过，归档 14 张截图并验证禁收录。[PR #19](https://github.com/pengshang01-cyber/dulizhan/pull/19) · [M11 审核报告](../reviews/M11.md)

## 2026-11-23 M12 图片精修与工厂展示

从已合并 M11 的 main `c103b7b` 创建 `m12-image-studio`。最终保留 13 张传统精修产品实拍，图册补图 8 款，为 20 款产品配齐特写与陈列场景，加入六组双语定制设计示例与六步图标流程。车间图库重排，首页沿用车间俯拍。报告记录 28 款未找到合格产品图、79 款待补两类场景，以及需补拍的工厂照片。六项本地检查通过，保留禁收录。[PR #20](https://github.com/pengshang01-cyber/dulizhan/pull/20) · [M12 审核报告](../reviews/M12.md)

Workers PR 预览的 18 张截图归档，九个页面的桌面和手机视口均通过访问、图像解码与布局检查。

## 2026-11-24 M13 尺寸锚定与成品试点

从已合并 M12 的 main `a05c4c0` 创建 `m13-scale-scenes`。工厂确认旧场景尺寸失真，40 张站内图撤下，42 条来源记录保留。同步图片技能，从规格表和匹配原照完成 5 个尺寸锚定及 3 款各两张成品展示。5 个规格缺少对应原照。双语页眉与箱规更新，六项检查及 337 项测试通过。收录保持关闭。[M13 审核报告](../reviews/M13.md)

Workers PR 预览归档 14 张截图，复核双语禁收录响应、图库切换和 1024px 页眉单行。[PR #21](https://github.com/pengshang01-cyber/dulizhan/pull/21)

## 2026-11-24 M14 成品展示图重做试点

从已合并 M13 的 main `4f71a65` 创建 `m14-scene-retry`。按工厂反馈撤下六张合成图并保留公开尺寸对比。用 14 cm 茶匙重排三张锚定图，生成三款各两张装食物的候选。开窗盒陈列初稿超差，重试一次。六张入选图最大偏差 11.09%，候选均留在审核材料。[M14 审核报告](../reviews/M14.md)

六项检查和 Workers PR 预览通过，三款产品保留原尺寸对比，审核图访问返回 404。归档六张预览截图。[PR #22](https://github.com/pengshang01-cyber/dulizhan/pull/22)

按工厂补充要求，核对并删除六张已撤下的无引用图像文件。为圆杯加入双语波点图案并前移原图库波点产品图，关闭 M13 的五个补拍待确认项。M14 报告增加撤下清单和六张审核候选的逐图自评。

## 2026-11-25 M15 成品展示图第一批

从 PR #22 合并后的 main `88371b1` 创建 `m15-scenes-cups`。核查六类 88 款，新增 28 张尺寸对比图与 38 张成品示意，复用 M14 的 6 张已审核图。杯类 15 款有近景和陈列，12 款有一张通过。逐件复核尺寸和实拍外观，收录开关保持关闭。24 张 Workers 双视口截图已归档。 [M15 审核报告](../reviews/M15.md) · [M15 PR](https://github.com/pengshang01-cyber/dulizhan/pull/23)
