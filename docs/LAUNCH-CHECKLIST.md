# 上线资料与检查清单

这份清单给工厂内容负责人使用。先在 [CMS 指南](CMS.md) 中找到对应菜单；不要把密钥粘贴到 CMS、产品资料或 GitHub 文件。代码和自动检查通过不等于真实联系方式、发信和工厂资料已验收。

## (1) 待补资料（自动生成）

<!-- TODO-REPORT:START -->

本部分由 npm run todo:report 自动生成，重新运行会更新此区域，保留下方人工上线检查项。示例格式仅供填写参考，**不是已经确认的工厂资料**。

扫描 22 个 JSON 文件；95 个待补文字 / 参数字段；20 处占位图片引用；7 个空图片位；3 个示例产品。

中文栏通常选填，留空回退英文；博客中文正文例外，留空不生成中文文章。无产品分类当前隐藏，其封面可在启用该类前补齐。

### 案例（src/data/cases.json）

未发现 TODO 文字。此项为可选内容，没有真实资料时继续留空并隐藏。

### 定制服务内容（src/data/customization.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 常见问题（src/data/faq.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 网站设置（src/data/site.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 公司全称 → 英文 | TODO_COMPANY_NAME | 英文栏：[工厂正式英文全称]；中文栏：[营业主体中文全称] |
| 公司简称 → 英文 | TODO_COMPANY_SHORT_NAME | [对外使用的公司简称]，与页头品牌一致 |
| 品牌副标题 → 英文 | TODO_COMPANY_TAGLINE | [一句简短定位]，如描述产品品类，不写未经核实的年限 |
| 顶部公告 → 第 3 项 → 英文 | TODO_TOP_BAR_ITEM | [一条简短采购提示]，不超过一行；没有确认内容可删掉该项 |
| 邮箱 | TODO_EMAIL | name@example.com（仅格式） |
| 电话 | TODO_PHONE | +国家区号 电话号码 |
| WhatsApp 号码 | TODO_WHATSAPP_NUMBER | +国家区号手机号码（不带分隔符） |
| WhatsApp 预填消息 → 英文 | TODO_WHATSAPP_PREFILL_MESSAGE | 填写希望客户打开 WhatsApp 后看到的询价开场白 |
| 工厂地址 → 英文 | TODO_FACTORY_ADDRESS | 英文：[街道], [城市], [省], [国家]；中文填对应详细地址 |
| 现货起订量 → 英文 | TODO_STOCK_MOQ | [数量] pcs，或经确认的起订政策 |
| 定制起订量 → 英文 | TODO_CUSTOM_MOQ | [数量] pcs，或经确认的起订政策 |
| 打样周期 → 英文 | TODO_SAMPLE_LEAD_TIME | [天数] working days（以工厂确认为准） |
| 生产交期 → 英文 | TODO_PRODUCTION_LEAD_TIME | [天数] working days（以工厂确认为准） |
| 样品政策 → 英文 | TODO_SAMPLE_COST | 一句话说明样品费用、运费及条件 |
| 付款方式 → 英文 | TODO_PAYMENT_TERMS | 经确认的付款方式与条件 |
| 运输方式 → 英文 | TODO_SHIPPING_METHODS | 经确认的运输方式及适用条件 |
| 关键数字 → 第 1 项 → 数值 | TODO_FOUNDED_YEAR | 填写该指标已确认的数值，如 [年份] / [产能数] / [国家数] / [花色数]；两种语言共用，禁止估算 |
| 关键数字 → 第 2 项 → 数值 | TODO_DAILY_CAPACITY | 填写该指标已确认的数值，如 [年份] / [产能数] / [国家数] / [花色数]；两种语言共用，禁止估算 |
| 关键数字 → 第 3 项 → 数值 | TODO_EXPORT_COUNTRY_COUNT | 填写该指标已确认的数值，如 [年份] / [产能数] / [国家数] / [花色数]；两种语言共用，禁止估算 |
| 关键数字 → 第 4 项 → 数值 | TODO_PATTERN_COUNT | 填写该指标已确认的数值，如 [年份] / [产能数] / [国家数] / [花色数]；两种语言共用，禁止估算 |
| YouTube 视频 ID | TODO_YOUTUBE_VIDEO_ID | 视频网址中 v= 后的 ID，不粘贴整条网址 |
| 证书 → 第 1 项 → 名称 → 英文 | TODO_CERTIFICATE_NAME | [证书真实名称]，核实有效期和适用范围，并上传对应扫描件 |
| 社交媒体 → youtube | TODO_YOUTUBE_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → tiktok | TODO_TIKTOK_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → instagram | TODO_INSTAGRAM_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → facebook | TODO_FACEBOOK_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → pinterest | TODO_PINTEREST_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → linkedin | TODO_LINKEDIN_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 微信号 | TODO_WECHAT_ID | 填写可添加的实际微信号 |
| 预计回复时间 → 英文 | TODO_REPLY_TIME | [时间] business hours（以实际承诺为准） |
| 统计 → Google Analytics 衡量 ID | TODO_GA_MEASUREMENT_ID | G-XXXXXXXXXX（以真实衡量 ID 替换） |

### 团队（src/data/team.json）

未发现 TODO 文字。此项为可选内容，没有真实资料时继续留空并隐藏。

### 分类 → 巴斯克蛋糕纸（src/content/categories/basque-cheesecake-liners.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 甜品杯（src/content/categories/dessert-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 铝箔杯（src/content/categories/foil-baking-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 防油纸托（src/content/categories/greaseproof-cupcake-liners.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 牛皮纸托盘与盒（src/content/categories/kraft-trays-boxes.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 荷花杯（src/content/categories/lotus-baking-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 马芬杯（src/content/categories/muffin-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 纸质烤模（src/content/categories/paper-baking-molds.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 卷边硬质烤杯（src/content/categories/rolled-rim-baking-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 特殊包装（src/content/categories/specialty-packaging.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 普通蛋糕纸托（src/content/categories/standard-cupcake-liners.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 郁金香杯（src/content/categories/tulip-baking-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 产品 → Sample Muffin Cup（src/content/products/sample-muffin-cup.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| **示例产品，上线前删除或替换** | TODO-003 | 核实全部参数、名称与产品实拍；替换后检查分类和文章引用 |
| 产品型号 | TODO-003 | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 简介 → 英文 | TODO_PRODUCT_SUMMARY | 一句话：[产品类别] + [适用场景] + [已确认特点] |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 只填已确认的正数，单位 g/m² |
| 尺寸规格 → 第 1 项 → 名称 → 英文 | TODO_SIZE_NAME | 规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏 |
| 尺寸规格 → 第 1 项 → 底部直径 | TODO_BASE_DIAMETER_MM | 只填已确认的正数，单位 mm |
| 尺寸规格 → 第 1 项 → 高度 | TODO_HEIGHT_MM | 只填已确认的正数，单位 mm |
| 尺寸规格 → 第 1 项 → 顶部直径 | TODO_TOP_DIAMETER_MM | 只填已确认的正数，单位 mm |
| 颜色 → 第 1 项 → 英文 | TODO_COLORS | 每项一个真实颜色名称，例如 [英文颜色名] / [中文颜色名] |
| 图案 → 第 1 项 → 英文 | TODO_PATTERNS | 每项一个已提供的图案系列，例如 [系列英文名] / [系列中文名] |
| 是否支持定制 | TODO_CUSTOMIZATION_OPTIONS | 按实际产品选择支持 / 不支持 |
| 最小起订量 → 英文 | TODO_MOQ | [数量] pcs 或已确认的起订说明 |
| 包装方式 → 英文 | TODO_PACKAGING | [每包数量] pcs/bag × [每箱包数] bags/carton |
| 外箱规格 → 英文 | TODO_CARTON_SPEC | [长] × [宽] × [高] cm；补充真实装箱说明 |
| 生产交期 → 英文 | TODO_LEAD_TIME | [天数] working days（以工厂确认为准） |
| 产品问答 → 第 1 项 → 回答 → 英文 | TODO_PRODUCT_SPECIFICATIONS_ANSWER | 问题填写采购者会问的问题；回答以 We / 我们开头，具体参数须核实 |
| 产品问答 → 第 2 项 → 回答 → 英文 | TODO_ORDER_REQUIREMENTS_ANSWER | 问题填写采购者会问的问题；回答以 We / 我们开头，具体参数须核实 |
| 定制选项详情 → 英文 | TODO_PRODUCT_CUSTOM_OPTIONS | 逐行写已支持的印刷、尺寸、颜色及包装选项；没有资料可整组留空 |
| 包装详情 → 英文 | TODO_PRODUCT_PACKAGING_DETAILS | 写明 [内包装方式]、[装箱方式] 和 [运输注意事项]；没有资料可整组留空 |
| 应用场景 → 英文 | TODO_PRODUCT_APPLICATIONS | 逐行写实际适用的 [烘焙品类 / 陈列场景]；没有资料可整组留空 |

### 产品 → Sample Standard Liner（src/content/products/sample-standard-liner.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| **示例产品，上线前删除或替换** | TODO-001 | 核实全部参数、名称与产品实拍；替换后检查分类和文章引用 |
| 产品型号 | TODO-001 | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 简介 → 英文 | TODO_PRODUCT_SUMMARY | 一句话：[产品类别] + [适用场景] + [已确认特点] |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 只填已确认的正数，单位 g/m² |
| 尺寸规格 → 第 1 项 → 名称 → 英文 | TODO_SIZE_NAME | 规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏 |
| 尺寸规格 → 第 1 项 → 底部直径 | TODO_BASE_DIAMETER_MM | 只填已确认的正数，单位 mm |
| 尺寸规格 → 第 1 项 → 高度 | TODO_HEIGHT_MM | 只填已确认的正数，单位 mm |
| 尺寸规格 → 第 1 项 → 顶部直径 | TODO_TOP_DIAMETER_MM | 只填已确认的正数，单位 mm |
| 颜色 → 第 1 项 → 英文 | TODO_COLORS | 每项一个真实颜色名称，例如 [英文颜色名] / [中文颜色名] |
| 图案 → 第 1 项 → 英文 | TODO_PATTERNS | 每项一个已提供的图案系列，例如 [系列英文名] / [系列中文名] |
| 是否支持定制 | TODO_CUSTOMIZATION_OPTIONS | 按实际产品选择支持 / 不支持 |
| 最小起订量 → 英文 | TODO_MOQ | [数量] pcs 或已确认的起订说明 |
| 包装方式 → 英文 | TODO_PACKAGING | [每包数量] pcs/bag × [每箱包数] bags/carton |
| 外箱规格 → 英文 | TODO_CARTON_SPEC | [长] × [宽] × [高] cm；补充真实装箱说明 |
| 生产交期 → 英文 | TODO_LEAD_TIME | [天数] working days（以工厂确认为准） |
| 产品问答 → 第 1 项 → 回答 → 英文 | TODO_PRODUCT_SPECIFICATIONS_ANSWER | 问题填写采购者会问的问题；回答以 We / 我们开头，具体参数须核实 |
| 产品问答 → 第 2 项 → 回答 → 英文 | TODO_ORDER_REQUIREMENTS_ANSWER | 问题填写采购者会问的问题；回答以 We / 我们开头，具体参数须核实 |
| 定制选项详情 → 英文 | TODO_PRODUCT_CUSTOM_OPTIONS | 逐行写已支持的印刷、尺寸、颜色及包装选项；没有资料可整组留空 |
| 包装详情 → 英文 | TODO_PRODUCT_PACKAGING_DETAILS | 写明 [内包装方式]、[装箱方式] 和 [运输注意事项]；没有资料可整组留空 |
| 应用场景 → 英文 | TODO_PRODUCT_APPLICATIONS | 逐行写实际适用的 [烘焙品类 / 陈列场景]；没有资料可整组留空 |

### 产品 → Sample Tulip Cup（src/content/products/sample-tulip-cup.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| **示例产品，上线前删除或替换** | TODO-002 | 核实全部参数、名称与产品实拍；替换后检查分类和文章引用 |
| 产品型号 | TODO-002 | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 简介 → 英文 | TODO_PRODUCT_SUMMARY | 一句话：[产品类别] + [适用场景] + [已确认特点] |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 只填已确认的正数，单位 g/m² |
| 尺寸规格 → 第 1 项 → 名称 → 英文 | TODO_SIZE_NAME | 规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏 |
| 尺寸规格 → 第 1 项 → 底部直径 | TODO_BASE_DIAMETER_MM | 只填已确认的正数，单位 mm |
| 尺寸规格 → 第 1 项 → 高度 | TODO_HEIGHT_MM | 只填已确认的正数，单位 mm |
| 尺寸规格 → 第 1 项 → 顶部直径 | TODO_TOP_DIAMETER_MM | 只填已确认的正数，单位 mm |
| 颜色 → 第 1 项 → 英文 | TODO_COLORS | 每项一个真实颜色名称，例如 [英文颜色名] / [中文颜色名] |
| 图案 → 第 1 项 → 英文 | TODO_PATTERNS | 每项一个已提供的图案系列，例如 [系列英文名] / [系列中文名] |
| 是否支持定制 | TODO_CUSTOMIZATION_OPTIONS | 按实际产品选择支持 / 不支持 |
| 最小起订量 → 英文 | TODO_MOQ | [数量] pcs 或已确认的起订说明 |
| 包装方式 → 英文 | TODO_PACKAGING | [每包数量] pcs/bag × [每箱包数] bags/carton |
| 外箱规格 → 英文 | TODO_CARTON_SPEC | [长] × [宽] × [高] cm；补充真实装箱说明 |
| 生产交期 → 英文 | TODO_LEAD_TIME | [天数] working days（以工厂确认为准） |
| 产品问答 → 第 1 项 → 回答 → 英文 | TODO_PRODUCT_SPECIFICATIONS_ANSWER | 问题填写采购者会问的问题；回答以 We / 我们开头，具体参数须核实 |
| 产品问答 → 第 2 项 → 回答 → 英文 | TODO_ORDER_REQUIREMENTS_ANSWER | 问题填写采购者会问的问题；回答以 We / 我们开头，具体参数须核实 |
| 定制选项详情 → 英文 | TODO_PRODUCT_CUSTOM_OPTIONS | 逐行写已支持的印刷、尺寸、颜色及包装选项；没有资料可整组留空 |
| 包装详情 → 英文 | TODO_PRODUCT_PACKAGING_DETAILS | 写明 [内包装方式]、[装箱方式] 和 [运输注意事项]；没有资料可整组留空 |
| 应用场景 → 英文 | TODO_PRODUCT_APPLICATIONS | 逐行写实际适用的 [烘焙品类 / 陈列场景]；没有资料可整组留空 |

### 资讯文章 → 蛋糕纸托尺寸对照表：如何选择合适的烘焙纸杯（src/content/blog/cupcake-liner-sizes-chart.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 正文（英文） | [TODO]（正文提纲，发布前核实） | 按提纲补充经核实的英文正文，逐个替换 [TODO]；确认图片和链接后再关闭草稿 |
| 正文（中文） | [TODO]（正文提纲，发布前核实） | 补充与英文对应的完整中文正文，逐个替换 [TODO]；不准备发布中文时留空 |

### 资讯文章 → 如何向工厂定制印刷蛋糕纸托（src/content/blog/custom-printed-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 正文（英文） | [TODO]（正文提纲，发布前核实） | 按提纲补充经核实的英文正文，逐个替换 [TODO]；确认图片和链接后再关闭草稿 |
| 正文（中文） | [TODO]（正文提纲，发布前核实） | 补充与英文对应的完整中文正文，逐个替换 [TODO]；不准备发布中文时留空 |

### 待替换图片与实拍资料

图片建议为清晰原图，文件名使用小写英文与连字符；CMS 上传后由 Astro 生成展示尺寸。建议尺寸是制作规格，不是产品参数。

| 页面 / CMS 位置 | 当前文件或上传位置 | 需要的图片及建议尺寸 |
| --- | --- | --- |
| 网站设置 → 关于我们车间与设备照片（目前为空） | 从“网站资料图片”上传并逐项添加说明 | 真实印刷、成型、质检、包装场景；建议 1600 × 1067（3:2），可增删排序；空列表显示四张默认占位图 |
| 网站设置 → 证书 → 第 1 项 → 图片（目前为空） | 从“网站资料图片”上传 | 有效证书的完整扫描，长边至少 1600，名称与图像对应 |
| 网站设置 → 微信二维码（目前为空） | 从“网站资料图片”上传 | 实际微信二维码，建议至少 600 × 600，无裁剪，上传后用手机验证 |
| 网站设置 → 网站 Logo（目前为空） | 从“网站资料图片”上传 | 真实公司标志，可选；建议透明 PNG，至少 512 × 512；留空保留图标与文字 |
| 网站设置 → 默认分享图（目前为空） | 从“网站资料图片”上传 | 正式分享图，建议 1200 × 630；留空使用默认 Placeholder 分享图 |
| 网站设置 → 首页主图（目前为空） | 从“网站资料图片”上传 | 真实主打产品或产品组合，建议 1600 × 1200（4:3）；同时填写首页主图说明，中文可留空 |
| 网站设置 → 工厂视频封面（目前为空） | 从“网站资料图片”上传 | 工厂视频封面，可选；建议 1280 × 720；留空沿用已配置视频的 YouTube 缩略图 |
| 分类 → 巴斯克蛋糕纸 → 图片 | ../../assets/images/categories/basque-cheesecake-liners-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 甜品杯 → 图片 | ../../assets/images/categories/dessert-cups-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 铝箔杯 → 图片 | ../../assets/images/categories/foil-baking-cups-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 防油纸托 → 图片 | ../../assets/images/categories/greaseproof-cupcake-liners-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 牛皮纸托盘与盒 → 图片 | ../../assets/images/categories/kraft-trays-boxes-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 荷花杯 → 图片 | ../../assets/images/categories/lotus-baking-cups-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 马芬杯 → 图片 | ../../assets/images/categories/muffin-cups-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 纸质烤模 → 图片 | ../../assets/images/categories/paper-baking-molds-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 卷边硬质烤杯 → 图片 | ../../assets/images/categories/rolled-rim-baking-cups-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 特殊包装 → 图片 | ../../assets/images/categories/specialty-packaging-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 普通蛋糕纸托 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 分类 → 郁金香杯 → 图片 | ../../assets/images/categories/tulip-baking-cups-placeholder.png | 真实分类代表产品；建议 1200 × 900 |
| 产品 → Sample Muffin Cup → 产品图片 → 第 1 项 | ../../assets/images/products/sample-muffin-cup-placeholder.png | 真实产品主图 / 细节；建议 1600 × 1200，保持同组比例 |
| 产品 → Sample Muffin Cup → 产品图片 → 第 2 项 | ../../assets/images/products/sample-muffin-cup-detail-placeholder.png | 真实产品主图 / 细节；建议 1600 × 1200，保持同组比例 |
| 产品 → Sample Standard Liner → 产品图片 → 第 1 项 | ../../assets/images/products/sample-standard-liner-placeholder.png | 真实产品主图 / 细节；建议 1600 × 1200，保持同组比例 |
| 产品 → Sample Standard Liner → 产品图片 → 第 2 项 | ../../assets/images/products/sample-standard-liner-detail-placeholder.png | 真实产品主图 / 细节；建议 1600 × 1200，保持同组比例 |
| 产品 → Sample Tulip Cup → 产品图片 → 第 1 项 | ../../assets/images/products/sample-tulip-cup-placeholder.png | 真实产品主图 / 细节；建议 1600 × 1200，保持同组比例 |
| 产品 → Sample Tulip Cup → 产品图片 → 第 2 项 | ../../assets/images/products/sample-tulip-cup-detail-placeholder.png | 真实产品主图 / 细节；建议 1600 × 1200，保持同组比例 |
| 资讯文章 → 蛋糕纸托尺寸对照表：如何选择合适的烘焙纸杯 → 文章封面 | ../../assets/images/blog/blog-cover-placeholder.png | 与文章对应的真实照片或已核对示意图；建议 1600 × 900，草稿发布前替换 |
| 资讯文章 → 如何向工厂定制印刷蛋糕纸托 → 文章封面 | ../../assets/images/blog/blog-cover-placeholder.png | 与文章对应的真实照片或已核对示意图；建议 1600 × 900，草稿发布前替换 |

备注：页面图片统一在上述 CMS 菜单上传。网站设置中的首页主图、车间图库及默认分享图为空时沿用占位图，Logo 为空时保留图标与文字；视频封面可选，留空用 YouTube 缩略图。微信二维码与证书缺失时按现有规则隐藏。文章两篇示例保持草稿，正文中的 [TODO] 在正式发布前逐项核实。

<!-- TODO-REPORT:END -->

## (2) 上线前检查（人工维护）

### 内容与图片

- [ ] 在 CMS“网站设置”填写真实公司名称、联系方式、地址、政策与预计回复时间；英文和中文表达一致，具体数字经工厂确认。
- [ ] 删除或替换 3 个示例产品，所有型号、尺寸、克重、颜色、包装、起订量与交期已核对；删除时同步移除文章相关产品引用。
- [ ] 上传真实产品、分类、首页和车间照片；证书仅填写实际持有且可提供的资料，不使用 Placeholder 或 AI 产品图冒充实拍。
- [ ] 真实微信号与二维码已上传，用电脑和手机核验打开、扫码 / 长按及复制；WhatsApp 国际号码和跳转已实测。
- [ ] 在 CMS“网站设置”上传真实首页主图和车间照片、填写双语说明；上传网站 Logo 与默认分享图。按需设置视频封面，保存部署后核对中英文页面与分享预览。
- [ ] 隐私政策顶部模板提醒、主体名称、联系邮箱和服务说明经负责人核对；确认后由维护人员移除模板提醒。
- [ ] 两篇示例文章保持草稿，或补齐真实参数、照片与审核后的正文再发布；没有中文正文时中文站不显示该文章。
- [ ] 运行 npm run todo:report 查看剩余项；仍未补的可选项由负责人明确决定继续隐藏，未确认参数不得伪装成已完成。

### 表单、密钥与实际收件

- [ ] 核对 Turnstile 已授权 junbeili.com，PUBLIC_TURNSTILE_SITE_KEY 与运行时 Secret key 属于同一个组件。需在测试地址或 PR 预览提交时，再授权对应主机名。
- [ ] Worker Variables and secrets 中已配置 TURNSTILE_SECRET_KEY、RESEND_API_KEY、INQUIRY_TO_EMAIL、INQUIRY_FROM_EMAIL；本地仅写被忽略的 .dev.vars，不提交密钥。
- [ ] 核对 Resend 发件域名 junbeili.com 的验证状态及 sales@junbeili.com 的 Cloudflare Email Routing 转发状态。生产发件和收件变量均使用 sales@junbeili.com。
- [ ] 英文和中文各提交一次真实询盘，包含两个产品、填写数量和留空数量、样品选项；收件箱中检查 HTML / 纯文本、Reply-To、语言、来源和 UTM。
- [ ] 确认提交失败保留输入与清单，成功后跳转当前语言感谢页并清空清单；感谢页回复时间来自已确认资料。

### 域名、收录与统计

- [ ] 核对正式域名 https://junbeili.com 的 HTTPS 和 www 跳转，CMS“网站设置 → 网站域名”与正式地址一致。
- [ ] 内容、隐私、发信与联系方式全部准备好后，由工厂按 [正式开放清单](LAUNCH.md) 在 CMS 打开“允许搜索引擎收录”并等待部署。
- [ ] 部署后检查 robots.txt 允许抓取并指向正确 sitemap；可收录页没有 noindex 响应头 / meta，询价单、感谢页、404、styleguide 继续不收录。
- [ ] sitemap 中仅有真实已发布的中英文页面，未发布草稿及不存在的中文正文页面没有条目；canonical / hreflang 指向正式域名。
- [ ] 需要 GA 时在 CMS 填写真实 G- ID，接受前不加载、拒绝后不发送、页脚可撤回；通过可访问 Google 的网络检查事件。没有配置时不显示 Cookie 横幅和设置入口。
- [ ] GA 在中国大陆可能无法覆盖访客，不能以 GA 数字代表全部国内访问；百度统计属于后续可选，不在本阶段接入。
- [ ] 执行 build、check、lint、test、seo:check、links:check；手机检查导航、产品、询价、微信、隐私及中英文 404。
- [ ] 由工厂负责人记录实际收件和上线验证结果。
