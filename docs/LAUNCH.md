# 正式开放操作清单

正式站已绑定 `https://junbeili.com`。工厂先核对资料和实际收件，再开启 CMS 的收录开关。开启后请用正式域名做下面的检查。

## 1. 核对资料和询盘链路

1. 打开[上线资料清单](LAUNCH-CHECKLIST.md)，照表在 Pages CMS 填写公司名称、公开联系方式、起订量、交期等已确认资料，并更换首页、产品、车间和分享占位图。每次补完一批，可请维护同事在项目目录运行 `npm run todo:report`，查看刷新后还缺什么。
2. 在 CMS 的“产品”中核对 M9 导入的真实产品，按 [产品图片清单](import/images-needed.md) 上传实拍，并补齐缺少的规格和型号。核对隐私政策里的主体名称、联系方式和数据用途，再请维护同事移除模板提醒。
3. 在 Cloudflare Turnstile 核对询盘组件已授权主机名 `junbeili.com`，其 Site key 对应 Workers Builds 的 `PUBLIC_TURNSTILE_SITE_KEY`，同一组件的 Secret key 对应生产 Worker 的 `TURNSTILE_SECRET_KEY`。
4. 在 Resend 核对发件域名 `junbeili.com` 显示 **Verified**。生产 Worker 的 `INQUIRY_FROM_EMAIL` 和 `INQUIRY_TO_EMAIL` 均为 `sales@junbeili.com`。在 Cloudflare 的 **Email → Email Routing** 核对这个地址转发到已验证的工厂邮箱。详情见 [README 的询盘表单配置](../README.md#询盘表单配置)。

## 2. 在 CMS 开启收录

1. 登录 Pages CMS，打开本仓库的“网站设置”。确认“网站域名”为 `https://junbeili.com`。
2. 找到“访问统计”下方的“允许搜索引擎收录”开关（`allowIndexing`），打开并点 **保存 / Save**。
3. 保存后通常约 **1–2 分钟**生效，以 **Cloudflare → Workers & Pages → dulizhan → Builds** 中对应的生产构建和部署成功为准。刷新正式站的 [robots.txt](https://junbeili.com/robots.txt)，应显示 `Allow: /` 和正式 [sitemap 地址](https://junbeili.com/sitemap-index.xml)。

## 3. 提交 Google 和 Bing sitemap

1. 登录 [Google Search Console](https://search.google.com/search-console)，点击“添加资源”，选“网域”，填写 `junbeili.com`（不加 `https://` 或 `www`）。
2. 复制 Google 提供的验证值。在 **Cloudflare → junbeili.com → DNS → Records → Add record** 中选 **TXT**，名称填 `@`，内容粘贴完整验证值，保存。回到 Search Console 点“验证”。如果提示 DNS 尚未生效，稍后重试。验证成功后保留 TXT 记录。 [Google 所有权验证说明](https://support.google.com/webmasters/answer/9008080)
3. 在 Search Console 打开该网域资源的“站点地图”，输入 `https://junbeili.com/sitemap-index.xml` 并提交。回来查看读取状态是否成功。 [Google 站点地图说明](https://support.google.com/webmasters/answer/7451001)
4. 登录 [Bing Webmaster Tools](https://www.bing.com/webmasters/)，点击添加网站，选择从 Google Search Console 导入，授权后勾选已验证的 `junbeili.com`。打开 **Sitemaps** 查看是否已导入上述地址，缺少时点击 **Submit sitemap** 提交同一个地址。 [Bing 导入说明](https://www2.bing.com/webmasters/help/add-and-verify-site-12184f8b)

## 4. 配置流量统计和 AI 搜索抓取

- 如需启用统计且还未填写，进入 Google Analytics 的 **管理 → 数据流 → Web**，打开正式站的数据流，复制以 `G-` 开头的衡量 ID。在 Pages CMS **网站设置 → 访问统计 → GA4 衡量 ID** 粘贴并保存。部署后用浏览器接受统计 Cookie，在 GA4 实时报告核对是否有访问。 [Google 衡量 ID 说明](https://support.google.com/analytics/answer/12270356)
- 在 **Cloudflare → junbeili.com → AI Crawl Control → Security → Crawlers** 检查希望被其搜索收录的 AI 爬虫，将 **Action** 设为 **Allow**。核对没有全站拦截这些爬虫的安全规则，也没有 Cloudflare 托管 robots.txt 为这些搜索爬虫额外添加禁止规则。站点发布的 robots.txt 按 CMS 的收录开关控制抓取。 [Cloudflare 爬虫设置说明](https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/)

## 5. 开放后自检

- [ ] 从[英文联系页](https://junbeili.com/contact/#quote)和[中文联系页](https://junbeili.com/zh/contact/#quote)各提交一条标注“网站上线测试”的询盘。确认验证码通过、跳转对应语言感谢页、工厂邮箱都收到转发邮件，并核对 Reply-To 指向表单填写的测试邮箱。
- [ ] 打开 [robots.txt](https://junbeili.com/robots.txt) 与 [sitemap-index.xml](https://junbeili.com/sitemap-index.xml)，确认能访问。打开 sitemap 索引中的子文件，核对英文首页和中文首页网址。访问 [llms.txt](https://junbeili.com/llms.txt)，核对主要页面、分类和公开联系方式。
- [ ] 打开 [www 跳转测试](https://www.junbeili.com/zh/contact/?source=launch-check)，确认落到 `https://junbeili.com/zh/contact/?source=launch-check`。如需检查状态码，在 Chrome 或 Edge 的 **Network / 网络** 面板里查看首个请求是否返回 301。
- [ ] 用手机核对中英文首页、产品和联系页，试用已填写的 WhatsApp、微信及邮箱入口。保留测试时间和收件结果，方便日后排查。
