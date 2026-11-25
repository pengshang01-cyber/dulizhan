# 上线资料与检查清单

这份清单给工厂内容负责人使用。先在 [CMS 指南](CMS.md) 中找到对应菜单；不要把密钥粘贴到 CMS、产品资料或 GitHub 文件。代码和自动检查通过不等于真实联系方式、发信和工厂资料已验收。

## (1) 待补资料（自动生成）

<!-- TODO-REPORT:START -->

本部分由 npm run todo:report 自动生成，重新运行会更新此区域，保留下方人工上线检查项。示例格式仅供填写参考，**不是已经确认的工厂资料**。

扫描 148 个 JSON 文件；308 个待补文字 / 参数字段；27 处占位图片引用；2 个空图片位；0 个示例产品。

中文栏通常选填，留空回退英文；博客中文正文例外，留空不生成中文文章。无产品分类当前隐藏，其封面可在启用该类前补齐。

### 案例（src/data/cases.json）

未发现 TODO 文字。此项为可选内容，没有真实资料时继续留空并隐藏。

### 定制服务内容（src/data/customization.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### design-examples.json（src/data/design-examples.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 常见问题（src/data/faq.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 网站设置（src/data/site.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| YouTube 视频 ID | TODO_YOUTUBE_VIDEO_ID | 视频网址中 v= 后的 ID，不粘贴整条网址 |
| 证书 → 第 1 项 → 名称 → 英文 | TODO_CERTIFICATE_NAME | [证书真实名称]，核实有效期和适用范围，并上传对应扫描件 |
| 社交媒体 → youtube | TODO_YOUTUBE_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → tiktok | TODO_TIKTOK_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → instagram | TODO_INSTAGRAM_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → facebook | TODO_FACEBOOK_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → pinterest | TODO_PINTEREST_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 社交媒体 → linkedin | TODO_LINKEDIN_URL | https://对应平台/工厂官方账号（不填个人或示例账号） |
| 统计 → Google Analytics 衡量 ID | TODO_GA_MEASUREMENT_ID | G-XXXXXXXXXX（以真实衡量 ID 替换） |

### 团队（src/data/team.json）

未发现 TODO 文字。此项为可选内容，没有真实资料时继续留空并隐藏。

### 分类 → 空气炸锅纸（src/content/categories/air-fryer-liners.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 烘焙用纸（src/content/categories/baking-wrapping-paper.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 巴斯克蛋糕纸（src/content/categories/basque-cheesecake-liners.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 蛋糕底板（src/content/categories/cake-boards.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 蛋糕盒与包装盒（src/content/categories/cake-boxes.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 蛋糕纸托（src/content/categories/cupcake-liners.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 机制杯与马芬杯（src/content/categories/muffin-molded-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 纸质烤模（src/content/categories/paper-baking-molds.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 纸碗与餐盒（src/content/categories/paper-bowls-trays.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 淋膜纸杯（src/content/categories/pet-coated-baking-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → PET 塑料托（src/content/categories/pet-dessert-inserts.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 卷口杯（src/content/categories/rolled-rim-baking-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 分类 → 造型纸杯（src/content/categories/tulip-shaped-baking-cups.json）

未发现 TODO 文字；请在正式上线前核对现有内容。

### 产品 → 硅油纸卷（src/content/products/baking-parchment-rolls.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_BAKING_PARCHMENT_ROLLS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 小船型纸托（src/content/products/boat-shaped-paper-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_BOAT_SHAPED_PAPER_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 船形纸盒（src/content/products/boat-shaped-paper-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_BOAT_SHAPED_PAPER_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 纸质戚风蛋糕模（src/content/products/chiffon-cake-paper-molds.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_CHIFFON_CAKE_PAPER_MOLDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 巴斯克淋膜纸杯（src/content/products/coated-basque-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_COATED_BASQUE_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 船型淋膜纸杯（src/content/products/coated-boat-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_COATED_BOAT_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 圆形淋膜纸杯（src/content/products/coated-round-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_COATED_ROUND_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 彩色防油蛋糕纸托（src/content/products/colored-greaseproof-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_COLORED_GREASEPROOF_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 彩色花边蛋糕纸托（src/content/products/colored-scalloped-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_COLORED_SCALLOPED_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 彩色桶装蛋糕纸托（src/content/products/colored-tub-packed-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_COLORED_TUB_PACKED_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 瓦楞蛋糕板（src/content/products/corrugated-cake-boards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_CORRUGATED_CAKE_BOARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |

### 产品 → 长方形瓦楞纸盒（src/content/products/corrugated-cake-boxes.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_CORRUGATED_CAKE_BOXES | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 双面淋膜火焰纸杯（src/content/products/double-coated-flame-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_DOUBLE_COATED_FLAME_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 双面淋膜圆形卷口杯（src/content/products/double-coated-round-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_DOUBLE_COATED_ROUND_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 双面金火焰杯（src/content/products/double-sided-gold-flame-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_DOUBLE_SIDED_GOLD_FLAME_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 双面金长方形卷口杯（src/content/products/double-sided-gold-rectangular-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_DOUBLE_SIDED_GOLD_RECTANGULAR_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 双面金圆形卷口杯（src/content/products/double-sided-gold-round-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_DOUBLE_SIDED_GOLD_ROUND_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 双面金正方形卷口杯（src/content/products/double-sided-gold-square-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_DOUBLE_SIDED_GOLD_SQUARE_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 染色蛋糕纸托（src/content/products/dyed-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_DYED_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 火焰纸杯（src/content/products/flame-paper-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_FLAME_PAPER_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 花朵杯（src/content/products/flower-shaped-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_FLOWER_SHAPED_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 尺寸规格 → 第 1 项 → 名称 → 英文 | TODO_SIZE_NAME | 规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 铝箔复合纸托（src/content/products/foil-laminated-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_FOIL_LAMINATED_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 烫金机制杯（src/content/products/foil-stamped-molded-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_FOIL_STAMPED_MOLDED_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 四色蛋糕纸托（src/content/products/four-color-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_FOUR_COLOR_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 细长条金卡垫（src/content/products/gold-cake-card-strips.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GOLD_CAKE_CARD_STRIPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 金色印花长方形卷口杯（src/content/products/gold-print-rectangular-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GOLD_PRINT_RECTANGULAR_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 金色印花正方形卷口杯（src/content/products/gold-print-square-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GOLD_PRINT_SQUARE_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 方形金托（src/content/products/gold-square-dessert-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GOLD_SQUARE_DESSERT_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 金色桶装蛋糕纸托（src/content/products/gold-tub-packed-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GOLD_TUB_PACKED_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油蛋糕纸托（src/content/products/greaseproof-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸玛芬翻边杯（src/content/products/greaseproof-muffin-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_MUFFIN_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸长方形卷口杯（src/content/products/greaseproof-rectangular-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_RECTANGULAR_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸大圆盘（src/content/products/greaseproof-round-baking-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_ROUND_BAKING_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸圆形卷口杯（src/content/products/greaseproof-round-rolled-rim-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_ROUND_ROLLED_RIM_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸圆盘卷口杯（src/content/products/greaseproof-round-rolled-rim-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_ROUND_ROLLED_RIM_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸花边杯（src/content/products/greaseproof-scalloped-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_SCALLOPED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸正方形卷口杯（src/content/products/greaseproof-square-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_SQUARE_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸郁金香杯（src/content/products/greaseproof-tulip-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_GREASEPROOF_TULIP_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 六角杯（src/content/products/hexagonal-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_HEXAGONAL_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 牛皮色机制杯（src/content/products/kraft-look-molded-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_KRAFT_LOOK_MOLDED_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 大号防油纸圆盘（src/content/products/large-greaseproof-round-baking-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_LARGE_GREASEPROOF_ROUND_BAKING_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 大长方卷口杯（src/content/products/large-rectangular-rolled-rim-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_LARGE_RECTANGULAR_ROLLED_RIM_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 大圆盘卷口杯（src/content/products/large-round-rolled-rim-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_LARGE_ROUND_ROLLED_RIM_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 树叶形金卡垫（src/content/products/leaf-shaped-gold-cake-cards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_LEAF_SHAPED_GOLD_CAKE_CARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 莲花杯（src/content/products/lotus-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_LOTUS_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 金银色机制杯（src/content/products/metallic-molded-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_METALLIC_MOLDED_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 迷你长方纸盒（src/content/products/mini-rectangular-paper-boxes.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_MINI_RECTANGULAR_PAPER_BOXES | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 方形慕斯托（src/content/products/mousse-square-dessert-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_MOUSSE_SQUARE_DESSERT_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 玛芬卷口杯（src/content/products/muffin-rolled-rim-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_MUFFIN_ROLLED_RIM_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 尺寸规格 → 第 1 项 → 名称 → 英文 | TODO_SIZE_NAME | 规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → PET 淋膜蘑菇杯（src/content/products/mushroom-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_MUSHROOM_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 蘑菇杯配套盖（src/content/products/mushroom-cup-lids.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_MUSHROOM_CUP_LIDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 本色蛋糕纸托（src/content/products/natural-color-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_NATURAL_COLOR_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 磨堡纸托（src/content/products/oblong-cake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_OBLONG_CAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 八角纸碗（src/content/products/octagonal-paper-bowls.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_OCTAGONAL_PAPER_BOWLS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 烧烤纸盘（src/content/products/paper-barbecue-trays.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PAPER_BARBECUE_TRAYS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 甜品纸杯配套盖（src/content/products/paper-dessert-cup-lids.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PAPER_DESSERT_CUP_LIDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 纸质甜品杯（src/content/products/paper-dessert-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PAPER_DESSERT_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 纸质披萨盘（src/content/products/paper-pizza-pans.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PAPER_PIZZA_PANS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 硅油纸巴斯克纸托（src/content/products/parchment-basque-cheesecake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PARCHMENT_BASQUE_CHEESECAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → PET 淋膜船型纸杯（src/content/products/pet-coated-boat-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_BOAT_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → PET 淋膜树叶形纸杯（src/content/products/pet-coated-leaf-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_LEAF_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → PET 淋膜长方形纸杯（src/content/products/pet-coated-rectangular-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_RECTANGULAR_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → PET 淋膜长方形卷口杯（src/content/products/pet-coated-rectangular-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_RECTANGULAR_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → PET 淋膜圆形纸杯（src/content/products/pet-coated-round-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_ROUND_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → PET 淋膜圆形卷口杯（src/content/products/pet-coated-round-rolled-rim-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_ROUND_ROLLED_RIM_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → PET 淋膜花边杯（src/content/products/pet-coated-scalloped-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_SCALLOPED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → PET 淋膜正方形纸杯（src/content/products/pet-coated-square-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_SQUARE_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → PET 淋膜正方形卷口杯（src/content/products/pet-coated-square-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_SQUARE_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → PET 淋膜三角形纸杯（src/content/products/pet-coated-triangular-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PET_COATED_TRIANGULAR_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → 普通蛋糕纸托（src/content/products/plain-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PLAIN_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 普通机制杯（src/content/products/plain-molded-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PLAIN_MOLDED_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 印花蛋糕纸托（src/content/products/printed-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PRINTED_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 印花蛋糕纸托补充规格（src/content/products/printed-liner-extra-sizes.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_PRINTED_LINER_EXTRA_SIZES | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 立体机制杯（src/content/products/raised-molded-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RAISED_MOLDED_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 长方形硅油纸片（src/content/products/rectangular-baking-parchment-sheets.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_BAKING_PARCHMENT_SHEETS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → 长方形淋膜纸盒（src/content/products/rectangular-coated-paper-boxes.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_COATED_PAPER_BOXES | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 长方形金卡垫（src/content/products/rectangular-gold-cake-cards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_GOLD_CAKE_CARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 长方形防油纸片（src/content/products/rectangular-greaseproof-paper-sheets.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_GREASEPROOF_PAPER_SHEETS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → 长方机制杯（src/content/products/rectangular-molded-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_MOLDED_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 长方形纸盒盖（src/content/products/rectangular-paper-box-lids.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_PAPER_BOX_LIDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 长方形纸塑盒（src/content/products/rectangular-paper-trays-with-lids.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_PAPER_TRAYS_WITH_LIDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 长方形硅油空气炸锅纸（src/content/products/rectangular-parchment-air-fryer-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_PARCHMENT_AIR_FRYER_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 长方形三明治包装纸（src/content/products/rectangular-sandwich-wrapping-paper.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_RECTANGULAR_SANDWICH_WRAPPING_PAPER | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 翻边巴斯克纸托（src/content/products/rolled-edge-basque-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROLLED_EDGE_BASQUE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 防油纸翻边巴斯克纸托（src/content/products/rolled-edge-greaseproof-basque-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROLLED_EDGE_GREASEPROOF_BASQUE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 硅油纸翻边巴斯克纸托（src/content/products/rolled-edge-parchment-basque-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROLLED_EDGE_PARCHMENT_BASQUE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 单面玫瑰金圆形卷口杯（src/content/products/rose-gold-round-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROSE_GOLD_ROUND_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 尺寸规格 → 第 1 项 → 名称 → 英文 | TODO_SIZE_NAME | 规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 圆形铝箔空气炸锅纸（src/content/products/round-foil-air-fryer-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROUND_FOIL_AIR_FRYER_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 圆形金卡垫（src/content/products/round-gold-cake-cards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROUND_GOLD_CAKE_CARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 尺寸规格 → 第 1 项 → 名称 → 英文 | TODO_SIZE_NAME | 规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏 |
| 尺寸规格 → 第 2 项 → 名称 → 英文 | TODO_SIZE_NAME | 规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 圆形纸碗（src/content/products/round-paper-bowls.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROUND_PAPER_BOWLS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 圆形硅油空气炸锅纸（src/content/products/round-parchment-air-fryer-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROUND_PARCHMENT_AIR_FRYER_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 圆形 PET 塑料托（src/content/products/round-pet-dessert-inserts.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROUND_PET_DESSERT_INSERTS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 圆角郁金香纸杯（src/content/products/rounded-tulip-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_ROUNDED_TULIP_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 光面花边蛋糕板（src/content/products/scalloped-cake-boards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SCALLOPED_CAKE_BOARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |

### 产品 → 单色蛋糕纸托（src/content/products/single-color-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SINGLE_COLOR_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 单面金火焰杯（src/content/products/single-sided-gold-flame-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SINGLE_SIDED_GOLD_FLAME_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 单面金长方形卷口杯（src/content/products/single-sided-gold-rectangular-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SINGLE_SIDED_GOLD_RECTANGULAR_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 单面金圆形卷口杯（src/content/products/single-sided-gold-round-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SINGLE_SIDED_GOLD_ROUND_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 单面金花边杯（src/content/products/single-sided-gold-scalloped-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 单面金正方形卷口杯（src/content/products/single-sided-gold-square-rolled-rim-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SINGLE_SIDED_GOLD_SQUARE_ROLLED_RIM_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 纯色蛋糕纸托（src/content/products/solid-color-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SOLID_COLOR_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 正方形硅油纸片（src/content/products/square-baking-parchment-sheets.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_BAKING_PARCHMENT_SHEETS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → 正方形淋膜纸盒（src/content/products/square-coated-paper-boxes.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_COATED_PAPER_BOXES | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 方形铝箔空气炸锅纸（src/content/products/square-foil-air-fryer-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_FOIL_AIR_FRYER_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 正方形金卡垫（src/content/products/square-gold-cake-cards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_GOLD_CAKE_CARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 正方形防油纸片（src/content/products/square-greaseproof-paper-sheets.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_GREASEPROOF_PAPER_SHEETS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → 正方机制杯（src/content/products/square-molded-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_MOLDED_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 正方形纸盒盖（src/content/products/square-paper-box-lids.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_PAPER_BOX_LIDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 正方形纸托（src/content/products/square-paper-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_PAPER_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 方形纸塑盒（src/content/products/square-paper-trays-with-lids.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_PAPER_TRAYS_WITH_LIDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 方形硅油空气炸锅纸（src/content/products/square-parchment-air-fryer-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_PARCHMENT_AIR_FRYER_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 方形 PET 塑料托（src/content/products/square-pet-dessert-inserts.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_PET_DESSERT_INSERTS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 正方形三明治包装纸（src/content/products/square-sandwich-wrapping-paper.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_SANDWICH_WRAPPING_PAPER | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 正方形白卡垫（src/content/products/square-white-cake-cards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_SQUARE_WHITE_CAKE_CARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 星纹布丁杯（src/content/products/star-fluted-pudding-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_STAR_FLUTED_PUDDING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 草帽纸杯（src/content/products/straw-hat-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_STRAW_HAT_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 半透明雪芳杯（src/content/products/translucent-chiffon-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_TRANSLUCENT_CHIFFON_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → 半透明纸托（src/content/products/translucent-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_TRANSLUCENT_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |

### 产品 → 半透明磨堡杯（src/content/products/translucent-oblong-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_TRANSLUCENT_OBLONG_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → 半透明正方杯（src/content/products/translucent-square-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_TRANSLUCENT_SQUARE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |

### 产品 → 三角形金卡垫（src/content/products/triangular-gold-cake-cards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_TRIANGULAR_GOLD_CAKE_CARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 三角形白卡垫（src/content/products/triangular-white-cake-cards.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_TRIANGULAR_WHITE_CAKE_CARDS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 郁金香纸杯（src/content/products/tulip-baking-cups.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_TULIP_BAKING_CUPS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 白色蛋糕纸托（src/content/products/white-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_WHITE_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 材质 → 英文 | TODO_MATERIAL | [Paper type], [coating / treatment]；写清纸张与处理方式 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 白色防油蛋糕纸托（src/content/products/white-greaseproof-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_WHITE_GREASEPROOF_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 白色花边蛋糕纸托（src/content/products/white-scalloped-cupcake-liners.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_WHITE_SCALLOPED_CUPCAKE_LINERS | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 纸张克重 | TODO_GSM | 填已确认的克重（例如 110）、范围（260–300）或选项（24 / 31 / 40），无需写单位 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

### 产品 → 开窗蛋糕盒（src/content/products/window-cake-boxes.json）

| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |
| --- | --- | --- |
| 产品型号 | TODO_SKU_WINDOW_CAKE_BOXES | 工厂真实型号；示例 TODO-001 不能直接上线 |
| 是否支持定制 | TODO_CUSTOMIZABLE | 按实际产品选择支持 / 不支持 |

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
| 网站设置 → 证书 → 第 1 项 → 图片（目前为空） | 从“网站资料图片”上传 | 有效证书的完整扫描，长边至少 1600，名称与图像对应 |
| 网站设置 → 工厂视频封面（目前为空） | 从“网站资料图片”上传 | 工厂视频封面，可选；建议 1280 × 720；留空沿用已配置视频的 YouTube 缩略图 |
| 产品 → 彩色防油蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 彩色花边蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 彩色桶装蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 瓦楞蛋糕板 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/specialty-packaging-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 双面淋膜火焰纸杯 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/tulip-baking-cups-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 双面淋膜圆形卷口杯 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/rolled-rim-baking-cups-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 染色蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 四色蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 金色印花长方形卷口杯 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/rolled-rim-baking-cups-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 金色印花正方形卷口杯 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/rolled-rim-baking-cups-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 金色桶装蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 防油纸花边杯 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/tulip-baking-cups-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 玛芬卷口杯 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/muffin-cups-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 立体机制杯 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/muffin-cups-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 长方形防油纸片 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/greaseproof-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 长方形三明治包装纸 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/greaseproof-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 翻边巴斯克纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/basque-cheesecake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 防油纸翻边巴斯克纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/basque-cheesecake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 单色蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 纯色蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 正方形防油纸片 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/greaseproof-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 正方形三明治包装纸 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/greaseproof-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 半透明磨堡杯 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 白色防油蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 产品 → 白色花边蛋糕纸托 → 产品图片 → 第 1 项 → 图片 | ../../assets/images/categories/standard-cupcake-liners-placeholder.png | 暂时隐藏。补真实产品图并移除占位图，建议 1200 × 1200，再关闭隐藏开关 |
| 资讯文章 → 蛋糕纸托尺寸对照表：如何选择合适的烘焙纸杯 → 文章封面 | ../../assets/images/blog/blog-cover-placeholder.png | 与文章对应的真实照片或已核对示意图；建议 1600 × 900，草稿发布前替换 |
| 资讯文章 → 如何向工厂定制印刷蛋糕纸托 → 文章封面 | ../../assets/images/blog/blog-cover-placeholder.png | 与文章对应的真实照片或已核对示意图；建议 1600 × 900，草稿发布前替换 |

备注：页面图片统一在上述 CMS 菜单上传。首页主图、工厂图库及默认分享图为空时省略，Logo 为空时保留图标与文字。视频封面可选，留空用 YouTube 缩略图。微信二维码与证书缺失时按现有规则隐藏。文章两篇示例保持草稿，正文中的 [TODO] 在正式发布前逐项核实。

<!-- TODO-REPORT:END -->

## (2) 上线前检查（人工维护）

### 内容与图片

- [ ] 在 CMS“网站设置”填写真实公司名称、联系方式、地址、政策与预计回复时间；英文和中文表达一致，具体数字经工厂确认。
- [ ] 已核对 M9 导入的产品型号、尺寸、克重、颜色及对应规格的包装、起订量和交期；已按 [产品图片清单](import/images-needed.md) 上传实拍。
- [x] 首页、工厂图库、分享图和公开目录已接入正式图片。缺图产品暂时隐藏，补图后可在 CMS 逐款开启。
- [ ] 真实微信号与二维码已上传，用电脑和手机核验打开、扫码 / 长按及复制；WhatsApp 国际号码和跳转已实测。
- [x] 已填写工厂外景和双语说明、网站 Logo 与默认分享图。视频封面、证书等资料按需上传。
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
