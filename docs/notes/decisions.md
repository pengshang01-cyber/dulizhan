# 项目规则与关键决策

- 用户已于本轮确认 M4.6 七步执行计划，包括修改、测试、提交、推送与创建 PR；无需对已授权步骤重复索取许可。
- 实施规范见 AGENTS.md；任务范围与路线图见 docs/PLAN.md；历史审核报告不覆盖。
- 分类和产品采用 JSON collection；文件名为分类 id，产品文件名等于 slug。产品 category 保存 CMS reference 返回的 <id>.json，构建统一转换并校验。
- 网站设置、FAQ、定制步骤、案例、团队分别只有一个 JSON 来源。访客内容为 { en, zh }；英文必填，中文缺失回退英文；固定文案走 t()。
- 无产品分类不生成页面或入口；首页按 order 最多六个 showOnHome 且有产品的分类。
- CMS 产品 / 分类 / 网站图片分别使用与 JSON 对应的相对路径，详见 docs/CMS.md。空字段被 CMS 省略时，schema 为允许为空的字段恢复空值，必填内容仍严格校验。
- 英文网址位于根路径，中文位于 /zh/；同一页面组件接收 locale，两种语言共用分类 id、产品 slug 和 inquiry:v1 存储。询价数量可留空；表单和清单邮件提交在 M5。
- 未确认资料保持 TODO。微信截图采用内存测试资料与非扫描占位图，不写入生产配置。
- 每个里程碑通过检查、提交报告和截图后开 PR，等待用户审核合并，不自行合并。
- 部署平台为 Cloudflare Workers 静态资源；Workers Builds 从 main 构建，npm run build / npx wrangler deploy。M5 再添加 Worker main 与 ASSETS 绑定，只让 /api/* 先走 Worker。
- allowIndexing 默认 false，构建统一控制 robots.txt、静态响应头与页面 meta；M8 确认后开启，不单独手改某一个输出。404-page 配置保留，M6 再增加正式 404.html。
- 项目日常记录统一使用 docs/notes/history.md、status.md、decisions.md，根目录不放工作记录；按本次用户明确要求覆盖此前根目录记忆文件位置约定。
