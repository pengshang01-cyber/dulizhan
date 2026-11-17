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

代码提交 9ecd14f 的 CI 与 Workers Builds 已通过。Chrome 使用真实脚本和预览原有 site key 后，原 ready() 报错不再出现，但 Cloudflare 返回 110200（Domain not authorized），因此尚未生成真实 token。普通可见 Chrome 也复现相同错误码；本机 Wrangler 未登录，已请用户将 fix-turnstile-ready-dulizhan.pengshang01.workers.dev 加入该 Turnstile 组件的 Hostname Management。保存后继续验证；不修改 site key、不绕过验证、不提交真实询盘。

错误码依据：[Cloudflare 官方说明](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/)。正式报告将在域名授权后的实测完成时更新。只记录 [错误码与状态](fix-turnstile/hostname-blocked.json) 和 [当时页面](fix-turnstile/live-failure.png)，未保存 token 内容。

## 修改记录

初次修复，无新增依赖；仅变更加载器、相关测试及验证记录。
