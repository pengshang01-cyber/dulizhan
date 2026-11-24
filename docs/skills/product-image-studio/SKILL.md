---
name: product-image-studio
description: 俊焙利（Junbeili）独立站的产品图片规范。精修实拍产品图、生成使用场景图、生成定制示意图时必须先读本文件，并按其中的提示词模板和验收清单执行。
---

# Junbeili 产品图片工作室

本技能用于三类图片：

| 类型 | 用途 | 能否作主图 |
| --- | --- | --- |
| A. 实拍精修 | 把工厂实拍照片修成统一、专业的电商产品图 | ✅ 产品主图首选 |
| B. 使用场景图 | 展示产品在烘焙店、咖啡店、家庭烘焙中的用法 | ❌ 只能作辅图 |
| C. 定制示意图 | 展示可定制的印刷、颜色、尺寸、包装 | ❌ 只用于定制页面，必须标注“设计示例” |

## 0. 铁律（任何情况下都不能违反）

1. **产品保真**：精修和生成后，产品的形状、杯口（卷口/花边/火焰/郁金香）、褶数、比例、颜色、印花图案、金银工艺、材质质感必须与原图实物一致。看不准就不改。
2. **不改变产品**：禁止增加、删除、重绘产品细节；禁止换色（除非是生成该产品**确实在售**的颜色款，且有同款实拍作参照）；禁止把多个不同产品拼成一款。
3. **图上不出现文字**：不出现中文、英文、价格、促销字样、水印、二维码、尺寸标注。定制示意图上的品牌名只能用虚构品牌（见 C 节）。
4. **不出现真实的第三方品牌**：不出现星巴克、麦当劳等任何真实品牌的 Logo、包装、门店特征。
5. **不伪造事实**：AI 图不得描绘成“我们的工厂”“我们的客户”“真实案例”；alt 文字、标题和说明不得写 real、actual、customer case、factory photo、实拍、真实案例。
6. **人物**：可以出现手部或背影、远处模糊人物；不出现可识别的正脸。
7. **原图只读**：只处理副本；原图和未压缩的中间文件不提交到仓库。
8. **过不了验收就放弃**：每张图最多重试 2 次，仍不合格就用传统方法处理（见 A.4），或者保留原处理结果。

## A. 实拍精修

### A.1 目标效果
- 背景：纯白 `#FFFFFF`，或很浅的暖灰色 `#F5F2EE`。同一分类内背景统一。
- 光线：柔和的影棚光，正面略高的主光，产品下方保留自然、柔和的接触阴影。不要死白，不要硬阴影。
- 构图：正方形 1:1，产品居中，占画面 75–85%，四周留白均匀；45° 俯视角为主图首选。
- 画质：去除灰尘、污点、折痕之外的瑕疵、背景杂物、桌面纹理；校正白平衡、透视和歪斜；颜色以实物为准，不过饱和。
- 一致性：同一分类所有主图的光线、角度、背景、产品占比要统一，放在列表页里看起来像同一组拍摄。

### A.2 提示词模板（图像编辑模型，原图作为输入）
```
Edit this product photo into a professional e-commerce catalog image.
Product: {产品英文名}, {材质英文}, {颜色/工艺}, {形状描述，例如 round rolled-rim paper baking cup with pleated sides}.
Keep the product EXACTLY as it is: same shape, same rim, same number of pleats, same proportions, same color {颜色}, same print pattern, same metallic finish. Do not redraw, add or remove any product detail.
Replace the background with seamless pure white (#FFFFFF). Soft diffused studio lighting from the front-top, gentle natural contact shadow under the product.
Remove dust, specks, background clutter and table texture. Correct white balance and perspective. Center the product, filling about 80% of a square 1:1 frame.
No text, no logo, no watermark, no props.
```
多个同款叠放、成组展示时，在提示词中写明数量和摆放方式，并要求保持数量不变。

### A.3 验收清单（逐张做，结果写入 manifest）
把原图和精修结果并排放在一张对比图上检查：
- [ ] 形状、杯口、褶数、比例与原图一致
- [ ] 颜色与原图一致（对比时不要只看缩略图，要放大看）
- [ ] 印花图案、金银光泽没有变化、没有变形或糊掉
- [ ] 没有多出或缺少产品，数量一致
- [ ] 背景干净、阴影自然、没有残留文字或杂物
- [ ] 边缘干净，没有抠图白边、锯齿、断裂
任一项不通过 → 重试（最多 2 次）→ 仍不通过则按 A.4 处理。

### A.4 退回方案（不使用生成模型）
用 sharp / Pillow 做：裁切居中、补白边成正方形、色阶与白平衡校正、轻微锐化、背景提亮。产品像素保持原样。

## B. 使用场景图

### B.1 原则
- 每个有产品图的产品配 **2 张**：一张“使用中特写”（产品装着食物，近景），一张“商业陈列”（烘焙店柜台、咖啡店、甜品台、外带包装场景）。
- 必须以该产品**精修后的主图**作参考图输入，场景中的产品要符合 0.1 的保真要求。
- 场景要符合产品实际用途和尺寸：小卷口杯配纸杯蛋糕、慕斯；巴斯克纸配巴斯克芝士蛋糕；空气炸锅纸放在空气炸锅里；蛋糕底板托着整只蛋糕；纸碗盛沙拉或甜品；PET 塑料托装冷甜点。不要把产品放大或缩小到不合理的比例。
- 面向海外 B2B 采购商：西式烘焙风格为主，明亮、干净、自然光，画面高级但真实可信，避免过度梦幻和塑料感。
- 同一产品的两张场景图，构图、食物、背景都不要重复；同一分类内的场景也要有变化。

### B.2 提示词模板
```
Photorealistic commercial photo. Use the reference image as the exact product: {产品英文名}, keep its shape, rim, pleats, color {颜色} and finish exactly the same.
Scene: {场景，例如 a bakery display counter with a row of these cups filled with vanilla cupcakes topped with buttercream and fresh berries}.
Natural soft daylight, shallow depth of field, clean modern {bakery / café / home kitchen} setting, realistic food styling, true-to-life scale.
No text, no logos, no brand names, no price tags, no recognizable faces.
Aspect ratio {1:1 或 4:3}.
```

### B.3 验收
- [ ] 场景中的产品与参考图一致（形状、颜色、工艺）
- [ ] 尺寸比例合理（对照产品尺寸数据）
- [ ] 食物与用途匹配，看起来可信
- [ ] 无文字、无品牌、无可识别人脸、无畸形手指/餐具
- [ ] 与该产品另一张场景图、同分类其他场景图不重复

## C. 定制示意图（只用于定制服务 / OEM & ODM 页面）

### C.1 原则
- 用来说明“能做什么”，不是“做过什么”。每张图在页面上配说明 **Design example / 设计示例**。
- 品牌名只用虚构名，例如：Maple & Co. Bakery、Little Oven、Sunny Crumbs、Bloom Patisserie。不得使用真实存在的品牌。
- 示例主题建议：
  1. Logo 印刷纸杯（单色 Logo、满版印花两种）
  2. 专色/潘通定制颜色（同一杯型的一组颜色）
  3. 尺寸定制（同一杯型大中小并排）
  4. 包装定制（印 Logo 的彩盒、OPP 袋 + 贴纸、展示盒）
  5. 节日/季节主题印花（圣诞、情人节、复活节）
  6. ODM 新造型开发（打样样品与设计稿并排，不画出真实工厂流程中的假数据）
- 杯型必须使用我们在售产品的杯型（参考对应产品精修图）。

### C.2 提示词模板
```
Photorealistic product mockup for a design example. Use the reference image for the exact cup shape: {产品英文名}.
Show the cups custom printed with the fictional brand logo "{虚构品牌名}" {印刷方式，例如 in one color on the side wall / as an all-over pattern}.
{补充：颜色组合 / 包装形式 / 节日主题}.
Clean studio background, soft light, premium packaging photography style.
No other text besides the fictional brand name, no real brands, no price.
Aspect ratio 4:3.
```

### C.3 验收
- [ ] 杯型与在售产品一致
- [ ] 只出现虚构品牌名，拼写正确、文字清晰不乱码
- [ ] 页面上配有 “Design example / 设计示例” 说明

## D. 输出与记录
- 产品图：1200×1200 WebP，质量约 80，≤ 250KB；场景图 1200×1200 或 1200×900；定制示意图 1200×900。
- 去除全部 EXIF / 元数据。
- 命名：`<产品网址片段>-01.webp`（精修主图）…；场景图 `<产品网址片段>-scene-01.webp`；定制示意图 `custom-<主题>-01.webp`。
- `data-import/image-manifest.csv` 每张图一行：目标文件、对应产品、来源路径、类型（实拍精修 / 实拍精修-传统处理 / AI场景 / 定制示意）、使用的提示词、验收结果、重试次数。
- 每个分类生成一张“原图 vs 精修”对比总览和一张场景图总览，放到 `docs/reviews/<里程碑>/`，供人工审核。
- 如果当前环境没有可用的图像编辑/生成工具：不要自行降低标准，把每张图的提示词写入 `data-import/image-prompts/<产品网址片段>.md`，并在报告中说明，由工厂在图像工具中执行后放回。
