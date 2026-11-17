# 当前状态

更新：2026-11-17

- PR #12（M7.5）已合并；当前维护分支 fix-turnstile-ready，基线 main cd7169a。
- 已修复 M5 的 Turnstile 异步脚本调用 ready() 报错，采用官方 onload 回调，保留超时与重试；严格替身覆盖官方错误条件。
- build / check / lint / test 全通过：35 页、141 个检查文件、284 项测试；中英文联系页和产品详情 4 页本地浏览器回归通过。
- PR #13：https://github.com/pengshang01-cyber/dulizhan/pull/13 。代码提交 db90a55 的 GitHub CI 与 Workers Builds 均通过。
- 用户已授权预览域名，110200 已消除。普通 Chrome 156.0.8078.74 在四个真实预览页面生成 token，页面显示验证成功；无页面 / Turnstile 错误，无询盘提交。记录与截图见 docs/reviews/fix-turnstile.md。
- 预览：https://fix-turnstile-ready-dulizhan.pengshang01.workers.dev/contact/#quote 。待审核 PR，不自行合并。
