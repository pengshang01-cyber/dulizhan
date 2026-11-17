# Turnstile 服务端验证诊断

- 分支：fix-turnstile-server-validation
- 基线：main 8b6feac（PR #13 合并后）
- 日期：2026-11-17
- PR：待创建

## 1. 问题与完成情况

用户在生产站更新 TURNSTILE_SECRET_KEY 并重新部署后，提交仍显示“安全验证未通过”。PR #13 已部署，修复的是前端加载与 token 生成；当前错误发生在 Worker 的 Siteverify 阶段，尚未定位到具体根因。原实现将拒绝、超时、网络和响应格式异常统一返回 verification_failed，且没有记录官方错误码。

- src/worker/index.ts 增加安全诊断：固定 reason、可用时的上游 HTTP 状态，以及官方错误码白名单。日志标记为 inquiry.turnstile_verification_failed；API 403 响应增加 verification 对象，前端继续使用原有友好提示和重试。
- 不透传上游原文、未知错误码或异常文本；不记录密钥、token、客户资料、IP、hostname 等其他字段。
- TURNSTILE_SECRET_KEY 在发送给 Siteverify 前去除首尾空白；配置占位判断也在 trim 后进行。
- 保持所有验证失败均拒绝发信；没有跳过验证、测试成功或诊断专用后门。
- README 增加读取响应 / 实时日志的方法与错误码处理表。

## 2. 验证

- npm run build：35 页成功。
- npm run check：141 个文件，0 errors / warnings / hints。
- npm test：18 个文件，300 项通过（本轮新增 16 项）；Worker 相关测试 84 项通过。
- npm run seo:check：35 HTML、57 JSON-LD、104 hreflang，0 errors / warnings。
- npm run links:check：1352 个内部链接、108 个锚点，0 errors。
- npm run lint：ESLint 与 Prettier 全通过。
- Wrangler 4.163.0 deploy --dry-run：Worker 编译成功，20.05 KiB / gzip 6.87 KiB，ASSETS 指向 dist；未上传部署。Windows 沙箱阻止 esbuild 读取父目录后，改用获准的沙箱外 dry-run，日志与输出保存在工作区。

新增测试覆盖：复制密钥带空白、空白 / TODO 配置、密钥错误、无效 token、过期 / 重复 token、服务内部错误、非法 JSON / 响应结构、HTTP 错误，以及响应与日志不泄露隐私。已有超时测试增加 reason=timeout 断言。全部外部调用使用 mock，没有向生产 API 提交询盘或发信。

## 3. 诊断格式与上线核验

以下仅为 mock 测试样例，**不是本次线上错误的已知原因**：

~~~json
{
  "ok": false,
  "code": "verification_failed",
  "verification": {
    "reason": "rejected",
    "upstreamStatus": 200,
    "errorCodes": ["invalid-input-secret"]
  }
}
~~~

本轮没有修改页面视觉，不新增截图。后端诊断需要 PR 合并并由 Workers Builds 部署后生效；届时由用户提交测试，在浏览器 Network → inquiry → Response 中查看 verification，或查看 Worker 实时日志。只需提供该诊断对象，不提供请求 Payload 或密钥。获取实际错误码前，不声称已解决生产提交失败。

## 4. 范围与依赖

无新增依赖；不修改生产密钥、Cloudflare 组件、Wrangler 配置或 Resend 逻辑。错误码依据 [Cloudflare Siteverify 文档](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#error-codes-reference)。

## 5. 修改记录

2026-11-17：为持续复现的线上提交失败补充脱敏诊断和配置空白处理；真实根因及发信验收仍待部署后的错误码确认。
