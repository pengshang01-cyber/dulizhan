# 当前状态

更新：2026-11-16

- 当前里程碑：M4.6，分支 m4c-zh；基线 main 为 5829476（PR #7 已合并，含手工 wrangler.jsonc）。
- 已完成：29 个共享中英页面路由、410 项中文界面及 FAQ / 定制内容、语言切换和 hreflang、微信浮层与手机面板、跨语言共用询价单、Workers 部署文档、单开关禁止收录、工作记录迁移。
- 本地验证：build 29 页；check 89 文件零错误 / 警告 / 提示；lint 通过；9 个测试文件共 111 项通过；32 张截图。全部路由通过双视口检查，15 个英文页面正文与 main 基线一致。
- 收录开关：true 的独立实际构建通过后已逐字节恢复 site.json，当前 allowIndexing=false，默认输出仍禁止收录。
- 部署：用户提供 https://dulizhan.pengshang01.workers.dev；Workers Builds 从 main 构建，npm run build / npx wrangler deploy。环境无法连接该域名实测，不代表线上失败；本轮未直接部署。
- 当前待办：提交推送并创建 PR，跟进最终 CI；之后等待审核合并。报告见 docs/reviews/M4c.md，完整文字对照见 M4c-translations.md。
- 保留边界：真实微信及产品中文待工厂填写；表单 / API 在 M5，正式 404 在 M6，M8 才打开收录。
- 工作记录统一位于 docs/notes/，根目录不再存放这三类记录。
