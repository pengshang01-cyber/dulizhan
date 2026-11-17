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
