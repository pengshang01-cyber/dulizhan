# 当前状态

更新：2026-11-17

- PR #12（M7.5）已合并；从最新 main cd7169a 创建 fix-turnstile-ready。
- 修复 M5 遗留 Turnstile 异步脚本调用 ready() 报错，改为官方 onload 回调，保留超时和重试。
- build / check / lint / test 全通过：35 页，141 个类型检查文件，284 项测试；中英文联系和产品详情 4 页严格替身浏览器验证通过，无询盘提交。
- 代码提交 9ecd14f，PR #13：https://github.com/pengshang01-cyber/dulizhan/pull/13 。CI 与 Workers Builds 均成功；预览已加载真实 SDK，没有原 ready() 异常。
- 真实验证被 Cloudflare 110200（预览域名未授权）阻止，尚未生成 token。本机 Wrangler 未登录；已请用户在 Turnstile Hostname Management 添加 fix-turnstile-ready-dulizhan.pengshang01.workers.dev，保存后继续线上验收。没有提交任何询盘。
