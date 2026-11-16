# M4b 审核报告：内容后台、分类数据化与双语数据结构（M4.5）

- 分支：`m4b-cms`
- PR：待创建后回填
- 预览地址：未部署。GitHub Deployments 查询结果为 0，尚无可核实的 Cloudflare Pages 预览。
- 提交时间：2026-11-16
- 基线：PR #6 已合并的 `main`（`85af7b2`），从最新 main 创建本分支。

## 1. 完成情况

对应本轮用户要求及 `docs/PLAN.md` 的 M4.5：

| # | 任务 | 状态 | 说明 / 相关文件 |
| --- | --- | --- | --- |
| 1 | 双语约定及回退工具 | 完成 | 访客内容使用 `{ en, zh }`；英文必填、中文可空；`src/i18n/utils.ts` 的 localized 统一回退，数字和图片共用。 |
| 2 | 分类改为 collection | 完成 | `src/content/categories/*.json`，文件名为 id，含 label、summary、image、order、showOnHome；删除旧 categories.ts。 |
| 3 | 预置 12 分类并迁移产品 | 完成 | 顺序、英文及中文名称按指令；3 个示例归入 standard-cupcake-liners、tulip-baking-cups、muffin-cups。 |
| 4 | 空分类与首页展示规则 | 完成 | 无产品的 9 分类不出现在首页、筛选、页脚，也不生成分类页；首页最多 6 个符合条件的分类，超额显示 View all categories。手机筛选横向滚动。 |
| 5 | 产品结构化双语 JSON | 完成 | 标题、简介、材质、MOQ、包装、交期、颜色、图案、尺寸名、FAQ、SEO 均迁移；删除 Markdown 正文，三个正文区块从多行字段读取，空时隐藏。 |
| 6 | 网站设置 JSON 与校验 | 完成 | 所有设置值移至 `src/data/site.json`；`site.ts` 保留 schema、类型和工具。证书名、公告、统计标签、政策等双语。 |
| 7 | 微信资料 | 完成 | 新增 wechatId / wechatQr；TODO 或空微信号隐藏卡片，真实资料可显示号与二维码；WhatsApp 浮钮行为保留。 |
| 8 | FAQ、定制、案例、团队数据化 | 完成 | 13 条原英文 FAQ 迁至 JSON，中文留空；政策答案通过模板变量读取网站设置；其余三类数据也迁至双语 JSON。 |
| 9 | Pages CMS 配置 | 完成 | 根目录 `.pages.yml` 提供产品、分类及 5 个 file 编辑入口；中文标签和说明、双语子字段、动态分类 reference、可增删列表和多图上传。 |
| 10 | 图片路径 | 完成 | 三组媒体目录，产品 / 分类相对 JSON 的图片路径由 Astro image() 解析；网站图片经构建期映射并用 astro:assets 输出。 |
| 11 | 实际 CMS 文件格式验证 | 完成 | 手工临时创建一个中英分类及产品，构建和页面校验通过后删除；完整格式样例见第 4 节。另覆盖 CMS 省略空字段的保存行为。 |
| 12 | UI 文案集中 | 完成 | 全站固定界面文案集中至 en.json，经 t() 读取；zh.json 同键空翻译。当前均使用英文 locale。 |
| 13 | Astro i18n | 完成 | defaultLocale 为 en，locales 只有 en，prefixDefaultLocale 为 false；本阶段不生成中文路由。 |
| 14 | CI 和文档 | 完成 | main push 及 PR 都跑四项检查；新增中文 `docs/CMS.md`，更新 AGENTS 第 3、4 节、PLAN、README 和项目交接记录。 |
| 15 | 验证、截图和提交 | 完成 | 四项检查通过；生成 30 张截图，含微信独立测试预览。PR / CI 信息在提交后回填。 |

## 2. 验收标准自检

- [x] `npm run build`：15 个英文静态页面构建成功。
- [x] `npm run check`：57 个文件，0 errors / 0 warnings / 0 hints。
- [x] `npm run lint`：ESLint 和 Prettier 通过。
- [x] `npm test`：localized 回退、t 插值、分类排序与隐藏、首页六项上限、CMS 字段、询价兼容及存储异常测试通过；最终数量在下方记录。
- [x] `npm run screenshots -- M4b`：15 个场景 × 桌面 / 手机，共 30 张。
- [x] 15 条路由在 1440px / 375px 下均返回 200，H1 唯一、图片可解码、无页面横向溢出；内部链接检查通过。
- [x] 询价清单支持当前分类、旧合法存储、可选数量、千分位输入、非法输入拦截和存储受限退化；联系页只读摘要正常。
- [x] 新建分类自动进入产品 reference 来源；测试产品自动生成列表、分类、详情和首页入口；未知分类引用、缺英文必填值会使构建明确失败。
- [x] CMS 数字字符串及数值 MOQ 均可构建；`.5` / `0.5` 正小数一致；可选顶径可留空。CMS 保存时省略的可选数组和网站空联系方式由 schema 恢复为空值。
- [x] 微信正式数据仍为 TODO / 空，默认 Contact 无微信卡片；测试号只注入独立截图构建内存，不写入生产 JSON / 默认 dist。
- [x] 临时测试分类及产品已删除，未提交测试规格；本次没有新增依赖或密钥。

**与 M4 的英文一致性：** 使用 main 基线单独构建后，通过浏览器对比 DOM 文本。首页（除分类区）、Custom、About、FAQ、Contact、Blog、Inquiry、Styleguide，以及 Header / Footer 的非分类文字一致；三个详情页归一分类名称后正文一致。原有 cream / coffee / copper、Newsreader / DM Sans、方角卡片和移动端布局保留。以下是本轮要求带来的明确差异：

- 分类名称、简介及网址替换为新分类；由原 6 个分类入口改为当前有产品的 3 个，空分类不再出现在导航，静态页由 18 个减至 15 个。
- 产品中心手机分类条保持单行并横向滚动。
- 只有填入有效资料时才新增 WeChat 卡片；截图测试态不是正式联系方式。
- 图片改为 CMS 管理目录中的同风格 Placeholder，未使用网络产品图或 AI 实拍替代物。

关键命令输出（最终复核）：

```text
build: 15 page(s) built in 1.20s
check: Result (57 files), 0 errors, 0 warnings, 0 hints
lint: All matched files use Prettier code style!
test: Test Files 5 passed (5), Tests 85 passed (85)
screenshots: 30 PNG files (15 scenes, desktop + mobile)
CMS fixtures: format, images, routes, numeric/text MOQ and compact saved fields PASS
CMS negative cases: unknown category / missing English correctly fail build
```

## 3. 截图

存放于 `docs/reviews/M4b/`，桌面视口 1440 × 900、手机视口 375 × 812，均为整页截图：

| 页面 / 状态 | Desktop | Mobile |
| --- | --- | --- |
| 首页 | [home](M4b/home-desktop.png) | [home](M4b/home-mobile.png) |
| 产品中心 | [products](M4b/products-desktop.png) | [products](M4b/products-mobile.png) |
| 郁金香分类 | [category](M4b/product-category-desktop.png) | [category](M4b/product-category-mobile.png) |
| 示例产品详情 | [detail](M4b/product-detail-desktop.png) | [detail](M4b/product-detail-mobile.png) |
| 联系页默认态 | [contact](M4b/contact-desktop.png) | [contact](M4b/contact-mobile.png) |
| 联系页微信测试态 | [WeChat preview](M4b/contact-wechat-preview-desktop.png) | [WeChat preview](M4b/contact-wechat-preview-mobile.png) |
| 联系页含两个询价产品 | [summary](M4b/contact-inquiry-desktop.png) | [summary](M4b/contact-inquiry-mobile.png) |
| 询价空状态 | [empty](M4b/inquiry-empty-desktop.png) | [empty](M4b/inquiry-empty-mobile.png) |
| 询价两个产品 | [filled](M4b/inquiry-filled-desktop.png) | [filled](M4b/inquiry-filled-mobile.png) |
| 询价填写 / 留空数量 | [quantities](M4b/inquiry-quantities-desktop.png) | [quantities](M4b/inquiry-quantities-mobile.png) |
| 定制 | [custom](M4b/custom-desktop.png) | [custom](M4b/custom-mobile.png) |
| 关于 | [about](M4b/about-desktop.png) | [about](M4b/about-mobile.png) |
| FAQ | [faq](M4b/faq-desktop.png) | [faq](M4b/faq-mobile.png) |
| Blog 占位 | [blog](M4b/blog-desktop.png) | [blog](M4b/blog-mobile.png) |
| 设计规范 | [styleguide](M4b/styleguide-desktop.png) | [styleguide](M4b/styleguide-mobile.png) |

微信预览由 `scripts/wechat-preview.ts` 使用独立输出目录和内存数据生成，微信号为 `PREVIEW_ONLY_NOT_A_WECHAT_ID`；图片写有 Placeholder / Preview only，不是可扫描二维码。脚本在截图前验证卡片、图片和移动端宽度；正式 JSON 始终保持 `TODO_WECHAT_ID` / 空图片。

## 4. 偏离与新增依赖

- 没有提前实现 M4.6 中文页面或 M5 表单；英文地址不添加语言前缀。
- 分类和产品选用 **JSON**，便于 Pages CMS 逐字段编辑，避免隐藏 Markdown 正文；三个可选详情区使用普通多行 text，保留换行，不引入富文本编辑 / 渲染依赖。
- 新增 npm 依赖：**无**；package.json 和 lockfile 未变，使用现有 Astro、Zod、Vitest、Playwright。
- 按官方 [Content](https://pagescms.org/docs/configuration/content/)、[Object](https://pagescms.org/docs/configuration/fields/object/)、[List](https://pagescms.org/docs/configuration/content/list/) 配置双语及可增删列表；中文空白可被 CMS 省略，localized 仍回退英文。
- 分类使用官方 [Reference](https://pagescms.org/docs/configuration/fields/reference/)，保存 `{name}`，即 `<id>.json`；schema 去扩展名后对同一 collection 校验，没有固定 12 项枚举。产品 [filename](https://pagescms.org/docs/configuration/content/filename/) 使用 `{fields.slug}.json`。
- 数字 / TODO 共存的尺寸、克重用 string 编辑并限制格式；schema 把正数字符串转换为 number。MOQ 英文支持文字或 number；CMS 使用文字输入，中文可空。可选整块全空时隐藏，有中文时仍须英文。
- 已针对官方 [保存清理逻辑](https://github.com/hunvreus/pagescms/blob/main/lib/schema.ts) 适配空数组 / 空字符串键被省略的情况；必填字段缺失仍报错。
- 按官方 [Media input/output](https://pagescms.org/docs/configuration/media/) 与 [Image 字段](https://pagescms.org/docs/configuration/fields/image/) 配置如下，相对路径已经实际构建验证：

| 用途 | media.input（仓库上传目录） | media.output（JSON 保存前缀） |
| --- | --- | --- |
| 产品 | `src/assets/images/products` | `../../assets/images/products` |
| 分类 | `src/assets/images/categories` | `../../assets/images/categories` |
| 证书、微信、案例、团队 | `src/assets/images/site` | `../assets/images/site` |

前两项相对各自 collection JSON，满足 [Astro image() 的相对路径约定](https://docs.astro.build/en/guides/images/#images-in-content-collections)。网站设置 JSON 不属于 collection，通过 `src/lib/site-images.ts` 的本地构建映射解析同一相对路径，使用 astro:assets 生成 WebP；未填图片用空值，不用假图片路径。

### CMS 格式样例与实际测试

以下是临时创建并验证的完整测试文件。数字仅用于格式测试，**不是工厂参数**；测试后已从 src/content 删除，报告保留样例。另验证 CMS 清理空字段后的精简输出也能构建、缺必填英文及未知分类会失败。

`src/content/categories/cms-format-test.json`：

```json
{
  "label": {
    "en": "CMS Format Test Category",
    "zh": "CMS格式测试分类"
  },
  "summary": {
    "en": "Temporary category used only to verify the CMS format.",
    "zh": "仅用于验证CMS格式的临时分类。"
  },
  "image": "../../assets/images/categories/lotus-baking-cups-placeholder.png",
  "order": 99,
  "showOnHome": true
}
```

`src/content/products/cms-format-test-product.json`：

```json
{
  "title": {
    "en": "CMS Format Test Product",
    "zh": "CMS格式测试产品"
  },
  "slug": "cms-format-test-product",
  "sku": "TODO-CMS-TEST-001",
  "category": "cms-format-test.json",
  "summary": {
    "en": "Temporary product for CMS validation; not a factory specification.",
    "zh": "用于CMS验证的临时产品，并非工厂规格。"
  },
  "images": [
    "../../assets/images/products/sample-standard-liner-placeholder.png",
    "../../assets/images/products/sample-standard-liner-detail-placeholder.png"
  ],
  "material": {
    "en": "TODO_TEST_MATERIAL",
    "zh": "测试材质待补"
  },
  "gsm": "45.5",
  "sizes": [
    {
      "name": {
        "en": "Test size A",
        "zh": "测试尺寸甲"
      },
      "baseDiameterMm": "35",
      "heightMm": "60",
      "topDiameterMm": "78"
    },
    {
      "name": {
        "en": "Test size B",
        "zh": "测试尺寸乙"
      },
      "baseDiameterMm": "40",
      "heightMm": "65.5",
      "topDiameterMm": ""
    }
  ],
  "colors": [
    {
      "en": "Test color",
      "zh": "测试颜色"
    }
  ],
  "patterns": [],
  "customizable": "true",
  "moq": {
    "en": "10000",
    "zh": ""
  },
  "packaging": {
    "en": "TODO_TEST_PACKAGING",
    "zh": ""
  },
  "cartonSpec": {
    "en": "TODO_TEST_CARTON_SPEC",
    "zh": ""
  },
  "leadTime": {
    "en": "TODO_TEST_LEAD_TIME",
    "zh": ""
  },
  "faqs": [
    {
      "q": {
        "en": "Is this a real factory product?",
        "zh": "这是真实工厂产品吗？"
      },
      "a": {
        "en": "No. This temporary entry verifies CMS editing and is removed after the test.",
        "zh": "不是。该临时条目用于验证CMS编辑，测试后删除。"
      }
    }
  ],
  "seoTitle": {
    "en": "CMS Format Test Product",
    "zh": ""
  },
  "seoDescription": {
    "en": "Temporary bilingual CMS format validation.",
    "zh": ""
  },
  "customOptions": {},
  "packagingDetails": {
    "en": "",
    "zh": ""
  },
  "applications": null,
  "featured": false,
  "order": 99
}
```

测试确认：两个相对产品图片和分类封面解析成功并输出 WebP；新增分类 / 产品页可访问；英文页面没有混入中文；空 customOptions、packagingDetails、applications 都不渲染；MOQ 从字符串改为数值再次构建通过。

## 5. 待确认问题

1. 请由仓库账号持有人在 Pages CMS 登录并授权此仓库；本次未代替用户安装 GitHub App，也未声称完成真实后台登录 / 提交测试。操作见 [CMS 指南](../CMS.md)。
2. 需要工厂提供真实联系方式、微信号及可扫描二维码、产品参数和实拍；现有 TODO 保留。
3. Cloudflare Pages 尚无可核实部署。CMS 保存后会提交到 main 并触发 CI；公开上线仍需管理员连接托管，不能把保存成功等同于已发布。

## 6. 本次新增的 TODO 占位

| 位置 | 需要的资料 |
| --- | --- |
| `src/data/site.json → wechatId` | `TODO_WECHAT_ID`，待提供真实微信号。 |
| `src/data/site.json → wechatQr` | 空图片，待上传真实二维码；测试 Placeholder 不作为正式二维码。 |
| 各双语 JSON 的 zh | 分类已提供对应中文；其余中文暂空，按要求回退英文，M4.6 再启用中文页面。 |

原有公司、联系、政策、数字条、证书、视频和产品参数的 TODO 仅迁移来源与结构，没有填入未经确认的事实。

## 7. 修改记录

### 第 1 轮实现与自检（2026-11-16）

- 完成 M4.5 迁移、Pages CMS 配置、双语结构、默认英文调用与操作指南。
- 自检修复 CMS 正小数输入、可选顶径留空及保存时省略空字段与 schema 的一致性，补充回归验证。
- 对比 M4 英文、检查所有静态页及 375px 布局，生成全部截图；临时内容测试后清理。
- PR / 最终 CI：待创建后回填。
