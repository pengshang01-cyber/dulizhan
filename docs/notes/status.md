# 当前状态

更新：2026-11-17

- 当前里程碑：M5；main基线c38401a，分支m5-inquiry；用户已确认七步实施计划。
- 已完成：中文标题约18%缩小和平衡换行、双语共用询盘表单及感谢页、Worker API、Turnstile和Resend、配置指南；首页CTA仍跳联系页。
- 本地验证：build31页；check103文件零错误/警告/提示；lint通过；11文件183项测试通过（Worker68项）；42张截图及12组三视口标题无孤字/无溢出。
- wrangler dev完整流程：英文/中文真实按钮提交各200，实际Siteverify通过2次，独立测试入口捕获2封mock邮件；清单清空、UTM、Reply-To、空数量、成功事件、感谢页、静态noindex及404均验证。浏览器widget为fixture；未真实发信，生产入口无mock开关。
- 密钥仅环境变量；新增replyTime为TODO，真实Turnstile/Resend与联系资料待工厂配置。
- 提交f10b446；PR #9：https://github.com/pengshang01-cyber/dulizhan/pull/9。GitHub CI已通过；Workers Builds失败；用户完整日志确认Astro构建成功、实际运行wrangler versions upload 4.163.0后在身份标识检查失败。
- 待办：在Cloudflare的有效Preview构建配置中使用npx wrangler preview并重试；生产命令保持deploy；PR待审核，最新状态见PR Checks。完整证据见docs/reviews/M5.md。
- 保留边界：M6再接GA4与正式404，M8前allowIndexing=false。
