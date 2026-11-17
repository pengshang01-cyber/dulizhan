# 当前状态

更新：2026-11-17

- PR #12（M7.5）已合并；从最新 main cd7169a 创建 fix-turnstile-ready。
- 修复 M5 遗留 Turnstile 异步脚本调用 ready() 报错，改为官方 onload 回调，保留超时和重试。
- build / check / lint / test 全通过：35 页，141 个类型检查文件，284 项测试；中英文联系和产品详情 4 页严格替身浏览器验证通过，无询盘提交。
- 待推送创建 PR、部署预览并使用真实 Cloudflare 验证 token；不修改密钥或生产环境配置。
