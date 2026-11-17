# Turnstile 异步加载修复

- 分支：fix-turnstile-ready
- 基线：main cd7169a（PR #12 合并后）
- PR：[PR #13](https://github.com/pengshang01-cyber/dulizhan/pull/13)
- 预览：[Turnstile 修复预览](https://fix-turnstile-ready-dulizhan.pengshang01.workers.dev/contact/#quote)
- 日期：2026-11-17

## 原因与修复

M5 加载器异步插入 api.js 后在 load 事件中调用 ready()，触发官方 TurnstileError，控件未能渲染。原替身的 ready() 无条件执行回调，因此未捕获此问题。

src/lib/inquiry-form.ts 改为在插入脚本前注册全局 onInquiryTurnstileLoad，并通过官方查询参数 onload 指定回调。回调收到 API 后 resolve，不再调用 ready()；保留 15 秒超时、脚本 error、错误提示与“重试验证”。完成或失败均清理定时器和全局回调；同页并发请求共用 Promise，忽略已结束尝试的迟到回调。服务端验证、密钥和发信逻辑均未改动。

参考 [Cloudflare 官方 onload 示例](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#using-onload-callback)。

## 本地验证

- npm run build：35 页构建成功。
- npm run check：141 个文件，0 错误 / 警告 / 提示。
- npm run lint：ESLint、Prettier 全通过。
- npm test：18 个文件、284 项测试通过。保留 UTM 和国家翻译测试；新增 onload 路径、共享请求、异步 / defer 调用 ready() 抛出官方错误、15 秒超时、加载失败 / 缺 API 后重试、迟到回调、复用已加载 API。
- scripts/inquiry-browser-fixture.ts 捕获脚本的 async / defer 属性，错误调用 ready() 时抛出与官方一致的 TurnstileError；保留按 URL onload 回调和模拟 token。
- node --experimental-strip-types scripts/turnstile-browser-qa.ts：4 页通过（中英联系页、中英郁金香杯详情），每页生成替身 token，无页面 / Turnstile 报错。英文联系页首次加载故意失败，重试恢复。显式调用替身 ready() 的断言确认它确实抛错。
- [本地浏览器记录](fix-turnstile/fixture.json)。验证过程中询盘 API 请求数为 0，未发信。

## 真实预览浏览器验证

2026-11-17 16:46–16:48（UTC+8），在已部署的代码提交 db90a55 上完成真实验证。该提交的 GitHub CI 与 Workers Builds 均通过。

用户已在 Turnstile 的 Hostname Management 保存预览域名，原 110200（Domain not authorized）已消失。使用本机普通 Google Chrome 156.0.8078.74、独立临时配置，通过 CDP 观察页面；加载真实 Cloudflare SDK，保留预览原有 site key。首次按正常流程点击可见的验证复选框，随后双语联系页及双语产品详情页均显示“Success! / 成功!”与页面的验证完成提示，并生成真实 token。

| 页面 | token 已生成 | 页面 / Turnstile 异常 | 询盘请求 | 截图 |
| --- | --- | --- | --- | --- |
| 英文联系页 | 是 | 0 | 0 | [验证成功](fix-turnstile/live-contact.png) |
| 中文联系页 | 是 | 0 | 0 | [验证成功](fix-turnstile/live-zh-contact.png) |
| 英文产品详情 | 是 | 0 | 0 | [验证成功](fix-turnstile/live-products-tulip-baking-cups-sample-tulip-cup.png) |
| 中文产品详情 | 是 | 0 | 0 | [验证成功](fix-turnstile/live-zh-products-tulip-baking-cups-sample-tulip-cup.png) |

[真实浏览器记录](fix-turnstile/live.json) 仅保存 token 是否生成与长度，不保存 token 内容。全程拦截 /api/inquiry 作为防误提交措施，实际请求数为 0，没有发信。未替换 SDK、未注入测试 token、未修改后端验证。

诊断说明：Playwright 直接启动的自动化 Chrome 曾被真实挑战拒绝（600010），因此最终验收使用上述普通 Chrome 会话。先前的 [110200 记录](fix-turnstile/hostname-blocked.json) 与 [域名未授权截图](fix-turnstile/live-failure.png) 保留用于追溯，现已解决。错误码参考 [Cloudflare 官方说明](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/)。

## 修改记录

初次修复，无新增依赖；仅变更加载器、相关测试及验证记录。

2026-11-17：用户保存预览域名授权后，补充四个真实页面的 token、控制台与零询盘请求验收，以及成功截图；解除线上验收阻塞，无新增代码或依赖。
