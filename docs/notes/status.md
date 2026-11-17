# 当前状态

更新：2026-11-17

- 当前里程碑 M6；用户已确认七步实施计划。PR #9 已合并，main 基线 2719c40，当前分支 m6-seo。
- 双语 SEO、Cookie 与 GA、隐私政策和 Workers 双语 404 已实现。35 页 SEO 检查为 0 错误 / 警告；14 个测试文件、242 项测试通过；20 张 M6 截图已生成。
- 本地 Workers 的英文、中文和深层中文未知路径均返回对应语言与 HTTP 404。收录开关已测试：开启时 28 个 sitemap 页面、7 个 noindex；恢复后全部 35 页 noindex，不生成 sitemap。
- 统计使用独立浏览器测试配置，拦截 Google 和询盘请求；八类事件与拒绝 / 撤回 / 存储异常已验证，不发送真实统计或邮件。最终 allowIndexing=false，GA ID 为 TODO。
- parse5 8.1.1 用于可靠解析构建 HTML；官方 npm 来源、完整性与无安装脚本已核验，audit 为 0，ignore-scripts 安装。
- 待办：最终检查与提交推送、创建 M6 PR、跟进 CI / Workers 预览，实测线上双语 404 后回填报告。
- M5 的真实 Turnstile / Resend 发信验收仍待工厂配置；本轮不重复发送真实询盘，不开始 M7。
