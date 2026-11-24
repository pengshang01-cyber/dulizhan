---
name: product-image-studio
description: 俊焙利（Junbeili）独立站的产品图片规范。精修实拍产品图、生成使用场景图、生成定制示意图时必须先读本文件，并按其中的提示词模板和验收清单执行。
---

# Junbeili 产品图片工作室

本技能用于三类图片：

| 类型 | 用途 | 能否作主图 |
| --- | --- | --- |
| A. 实拍精修 | 把工厂实拍照片修成统一、专业的电商产品图 | ✅ 产品主图首选 |
| B. 成品展示图 | 展示产品装着食物、成组陈列的效果，尺寸受控 | ❌ 只能作辅图 |
| C. 定制示意图 | 展示可定制的印刷、颜色、尺寸、包装 | ❌ 只用于定制页面，必须标注“设计示例” |

## 0. 铁律（任何情况下都不能违反）

1. **产品保真**：精修和生成后，产品的形状、杯口（卷口/花边/火焰/郁金香）、褶数、比例、颜色、印花图案、金银工艺、材质质感必须与原图实物一致。看不准就不改。
2. **不改变产品**：禁止增加、删除、重绘产品细节；禁止换色（除非是生成该产品**确实在售**的颜色款，且有同款实拍作参照）；禁止把多个不同产品拼成一款。
3. **图上不出现文字**：不出现中文、英文、价格、促销字样、水印、二维码、尺寸标注。定制示意图上的品牌名只能用虚构品牌（见 C 节）。
4. **不出现真实的第三方品牌**：不出现星巴克、麦当劳等任何真实品牌的 Logo、包装、门店特征。
5. **不伪造事实**：AI 图不得描绘成“我们的工厂”“我们的客户”“真实案例”；alt 文字、标题和说明不得写 real、actual、customer case、factory photo、实拍、真实案例。
6. **人物**：可以出现手部或背影、远处模糊人物；不出现可识别的正脸。
7. **原图只读**：只处理副本；原图和未压缩的中间文件不提交到仓库。
8. **过不了验收就放弃**：A、C 类单张最多重试 2 次，实拍精修可按 A.4 回退。成品展示按 B.4 最多重试 3 次，逾限仍不合格就撤出候选。

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

## B. 成品展示图（尺寸受控）

先锁定实物尺寸和外观，再生成装着食物的自然画面。逐图检查尺寸、产品保真与摄影质感，合格后交工厂审核。

### B.0 第一步：用代码制作尺寸锚定图

1. 尺寸以 `data-import/product-specs-2026.xlsx` 和网站产品数据为准，图册用来核对形状与视角。多规格产品至少覆盖最小和最大两档。试点选定一个明确规格时，为该规格重排锚定图。
2. 使用相应规格的精修实拍，沿产品轮廓抠取并等比缩放。按同一像素/毫米比例放置产品与参照物。选择照片中可量的直径、边长、对角线或高度，避免从透视照片反推隐藏尺寸。
3. 选择 B.3 中会在成图自然出现的参照物。道具可由模型生成单品图，再用代码按标称毫米数排版。鸡蛋只用于锚定或尺寸对比。
4. 在白色或浅暖灰底上把产品与道具并排，标明产品规格、量测轴及厘米刻度。输出 1600×1200 PNG 工作图与 1200×900 WebP。
5. 在工作图和输出图的对应像素轴复核产品、参照物及其比例。最大绝对误差须 ≤3%。
6. 锚定图工作文件存入 `data-import/scale-anchors/`，命名包含产品网址片段、规格和参照物。原版本可保留。通过审核的对比图可以“尺寸对比图 / Size comparison”辅图上线，说明可写 “Size comparison with a teaspoon (14 cm)”。

### B.1 默认用做法 2 生成装食物的成品画面

**做法 2：以尺寸锚定图和精修实拍图为参考整图生成**

1. 同时输入 B.0 的对应规格锚定图和精修实拍。用锚定图控制参照物比例，用实拍约束轮廓、杯口、褶纹、颜色、印花和材质。
2. 近景展示一件装着食物的产品。陈列在烘焙柜台或托盘上布置多件同款，每件都装着食物。按 B.2 选择食物，杯或盒要实际承装食物。
3. 将同款参照物自然纳入构图。注明产品的真实尺寸、参照物标称尺寸、可比较的深度和测量轴，并写明 “true-to-life scale”。
4. 生成后按 B.4 验收尺寸、产品身份和画面。

```
Make a polished bakery editorial photograph of the exact filled product.
Image 1 is the scale reference with a 14 cm teaspoon. Image 2 is the product appearance reference.
Preserve shape, rim, pleats, color, print and finish. Product dimensions: {cm}. Match the reference ratio at comparable depth for true-to-life scale.
Show {one item in close-up or a group on a tray}, each holding {size-appropriate food}. Place the fully visible teaspoon naturally on the surface.
Give the product visual priority with refined food styling, soft daylight, consistent contact shadows and a gently softened background. No scales, text, logos or recognizable faces.
```

**做法 1：仅用于空杯叠放或成组陈列的实拍抠图合成**

使用精修实拍的原样抠图，按锚定图比例与同款参照物等比合成。根据台面透视和各件深度排布，统一光线方向、接触阴影与反光。装着食物的近景和陈列使用做法 2。

### B.2 按尺寸选食物

| 尺寸等级 | 判断标准（底径 / 底边） | 搭配食物 | 提示词描述 |
| --- | --- | --- | --- |
| 迷你 | ≤40 mm | 一口大小的纸杯蛋糕、马卡龙、巧克力、小慕斯 | bite-size, mini |
| 小号 | 41–55 mm | 标准纸杯蛋糕、布丁、慕斯杯 | standard cupcake size |
| 中号 | 56–75 mm | 大号纸杯蛋糕、玛芬 | large cupcake / muffin size |
| 大号 | >75 mm | 巨型玛芬、小蛋糕、甜品碗 | jumbo muffin size |
| 托盘 / 盒子 / 纸片 | 对照长、宽与可确认的高度 | 实际能装下的蛋糕卷、磅蛋糕、三明治或整只蛋糕 | 写出食物的实际长宽 |

食物宽度须适合杯口或盒内空间。除裱花外，杯口以上的食物高度不超过杯高的 1.5 倍。每件成品均有装在容器内的食物。

### B.3 在场景中自然使用参照物

| 成品展示图参照物 | 标称尺寸 |
| --- | --- |
| 茶匙 | 长 14 cm |
| 浓缩咖啡杯 | 高 6 cm |
| 餐叉 | 长 19 cm |
| 标准马克杯 | 高 9.5 cm |

每幅展示至少有一件上述参照物，完整清晰，位置符合用途。鸡蛋（长约 5.7 cm）只在锚定图中使用。产品表观尺寸 = 产品量测像素 ÷ 参照物量测像素 × 参照物标称尺寸。选择相同或可直接比较的轴，避免将深度差或透视缩短计成尺寸偏差。

### B.4 尺寸、产品保真与审美验收

1. 用最终成图核对参照物与产品的像素轴。陈列中逐件核对可比较深度的产品，记录可量的多个轴或多件结果。参照物裁切或尺度无法可靠对应时，记录原因并重试。
2. 最大绝对偏差 ≤15%，且以下画面检查全部通过，才可交审核。任一项失败则作废，单张最多重试 3 次。
3. `data-import/scene-scale-check.csv` 逐图记录产品和参照物的量测轴、参照物标称值、各自像素长度、换算尺寸、规格值、偏差及结果。manifest 同步记录来源、提示词、轮次和验收。

- **产品保真**：杯型、杯口、褶纹、颜色、印花、材质和包装开窗与实拍一致。
- **承装效果**：食物大小符合规格，位于杯或盒内。陈列的各件均装着食物。
- **摄影质感**：产品为视觉中心，构图有主次，食物造型精致。窗光、阴影、反光、透视、景深和承托面统一。参照物融入烘焙店或品牌商品摄影画面。
- **画面检查**：放大看轮廓与接触阴影，排除测量板、贴图感、异常餐具、文字、品牌与可识别人脸。

### B.5 页面展示

- 成品展示仅用作辅图，排除在主图、分类封面及 Product JSON-LD 图片之外。
- 图库说明加 “Illustrative image / 效果示意图”。alt 只描述画面，不写 real、actual、customer、factory。
- 每款最多两张，一张装食物的近景，一张多件装食物的陈列。另行选择空杯叠放用途时，按 B.1 做法 1 及相同张数上限验收。
- 试点生成图留在审核材料中，审核通过后再进产品图库。

### B.6 先试点，再铺开

M14 试点为 3830 PET 淋膜圆形卷口杯、PET 淋膜正方形卷口杯及 1 粒装开窗蛋糕盒。先重排锚定图，再生成近景和陈列。总览并排放相应规格的原照、锚定图、两幅候选及量测结论。经过工厂审核再扩展。

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
- 命名：`<产品网址片段>-01.webp`（精修主图）…；成品展示图 `<产品网址片段>-scene-01.webp`；定制示意图 `custom-<主题>-01.webp`。
- `data-import/image-manifest.csv` 每张图一行：目标文件、对应产品、来源路径、类型（实拍精修 / 实拍精修-传统处理 / 成品展示-合成 / 成品展示-生成 / 定制示意）、使用的提示词、验收结果、重试次数。
- 每个分类生成一张“原图 vs 精修”对比总览和一张场景图总览，放到 `docs/reviews/<里程碑>/`，供人工审核。
- 如果当前环境没有可用的图像编辑/生成工具：不要自行降低标准，把每张图的提示词写入 `data-import/image-prompts/<产品网址片段>.md`，并在报告中说明，由工厂在图像工具中执行后放回。
