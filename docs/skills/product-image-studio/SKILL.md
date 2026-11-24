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

## B. 成品展示图（尺寸受控）

> 背景：第一版 AI 场景图把小杯画成了碗、盒子和蛋糕比例失真，已全部撤下。新方法的核心是**尺寸先算好、再生成、生成后量一遍**。任何一张图量出来的尺寸偏差超过 ±15%，一律不用。

### B.0 第一步：先做“尺寸锚定图”（每个产品必做，用代码合成，不用 AI 画产品）
尺寸锚定图 = 产品实拍抠图 + 参照物 + 刻度尺，按真实比例摆在同一张图上。它是后面所有成品展示图的“尺子”。

制作方法：
1. **尺寸来源**：以 `data-import/product-specs-2026.xlsx` 和网站产品数据为准，图册（`data-import/local/` 中的 PDF）用于核对形状和视角。多个尺寸的产品，每个尺寸各做一张（至少做最小和最大两个尺寸）。
2. **产品**：用该产品精修后的实拍图，原样抠出（不重绘、不变形，只等比缩放）。按“像素/毫米”统一比例缩放：先定比例（例如 10 px = 1 mm），产品宽度像素 = 实际宽度 mm × 比例。侧视图对应口径和高度，俯视图对应底径或长宽。
3. **参照物**：按 B.3 选一件与产品尺寸接近的参照物（小杯用鸡蛋或浓缩咖啡杯，盒子和纸片用餐叉或马克杯，大托盘用半尺寸烤盘）。参照物图片可以用生成模型生成一张干净的白底单品图（参照物本身尺寸不重要），再用代码按同一“像素/毫米”比例缩放到真实大小。
4. **刻度尺**：用代码画一条厘米刻度尺放在底部，长度按同一比例精确绘制。
5. **排版**：纯白或浅暖灰背景，产品与参照物并排站在同一基线上，左右留白；右下角标注产品名、规格（如 “3830 · Ø38 base · H30 mm”）。输出 1600×1200 PNG 作为工作文件，另存一份 1200×900 WebP。
6. **验收**：用代码量一次产品和参照物的像素尺寸，换算误差必须 ≤ 3%（这一步是代码排版，必须非常准）。
7. 锚定图存到 `data-import/scale-anchors/<产品网址片段>-<尺寸>.png`（工作文件），审核通过的 WebP 可以作为产品图库的“尺寸对比图 / Size comparison”辅图上线，说明写 “Size comparison with an egg (5.7 cm)” 这类真实描述。

### B.1 两种做法（优先用第 1 种）

**做法 1：实拍抠图合成（产品 100% 真实）**
1. 用该产品精修后的实拍图，把产品干净地抠出来（保留原有像素，不重绘）。
2. 用生成模型只生成**背景和道具**：烘焙店台面、烤盘、甜品台、木托盘、咖啡店吧台等。背景里必须放 B.0 锚定图中**同一件参照物**（见 B.3），并且背景中不出现我们的产品。
3. 按 B.3 的方法、以锚定图中“产品 : 参照物”的比例算出产品在画面里应占的像素大小，把抠出的产品按这个比例缩放后放进背景；补上与背景光线方向一致的接触阴影和反光。
4. 可以多件摆放（成排、叠放、成组），每件都用同一比例。
5. 食物：在杯/盒旁边摆放尺寸匹配的成品（见 B.2），或用生成模型在已合成好的杯子里**只局部补画食物**（局部重绘范围只限杯口以上的食物区域，杯身像素不得改变）。

**做法 2：以尺寸锚定图为参考整图生成（做法 1 做不好时才用）**
- 把 B.0 的尺寸锚定图作为参考图输入，同时输入产品精修实拍图。
- 提示词写明：场景中必须出现锚定图里同一件参照物，产品与参照物的相对大小必须与锚定图完全一致；再写出产品真实尺寸（厘米）、尺寸等级对应的食物（B.2），并说明 "true-to-life scale"。
- 提示词示例：
```
Photorealistic bakery photo. Reference image 1 shows the exact product and its true size next to an egg (egg length 5.7 cm, cup base 3.8 cm, height 3.0 cm). Reference image 2 shows the exact product appearance.
Keep the product shape, rim, pleats and color exactly as in reference 2, and keep the size ratio between the product and the egg exactly as in reference 1.
Scene: {场景}, with one egg placed naturally next to the cups. The cups hold {按 B.2 选的食物}.
Soft daylight, clean modern setting, realistic food styling. No text, no logos, no recognizable faces.
```
- 生成后必须按 B.4 量尺寸，过不了就作废。

### B.2 按尺寸选食物（最容易出错的地方）
先查产品尺寸数据（底径或底部长宽、高度），按下表选食物和描述词：

| 尺寸等级 | 判断标准（底径 / 底边） | 搭配食物 | 提示词描述 |
| --- | --- | --- | --- |
| 迷你 | ≤ 40 mm | 一口大小的迷你纸杯蛋糕、马卡龙、巧克力、小慕斯 | bite-size, mini, about the size of a walnut / golf ball |
| 小号 | 41–55 mm | 标准纸杯蛋糕、布丁、慕斯杯 | standard cupcake size, fits in the palm |
| 中号 | 56–75 mm | 大号纸杯蛋糕、玛芬 | large cupcake / muffin size |
| 大号 | > 75 mm | 巨型玛芬、小蛋糕、甜品碗 | jumbo muffin size |
| 托盘 / 盒子 / 纸片 | 按长宽实际尺寸 | 能实际装下的蛋糕卷、磅蛋糕、三明治、整只蛋糕（按英寸） | 写明 “x cm long, y cm wide” |

禁止“小杯配大食物”：食物的宽度不能明显超过杯口直径，高出杯口的部分不能超过杯高的 1.5 倍（奶油裱花除外）。

### B.3 参照物（每张图至少一件，必须清晰完整）
| 参照物 | 真实尺寸 |
| --- | --- |
| 鸡蛋 | 长约 5.7 cm |
| 浓缩咖啡杯 | 高约 6 cm，口径约 6 cm |
| 茶匙 | 长约 14 cm |
| 餐叉 | 长约 19 cm |
| 半尺寸烤盘（half sheet pan） | 33 × 46 cm |
| 标准马克杯 | 高约 9.5 cm |
| 成人手掌（只露手部） | 掌宽约 8.5 cm |

像素换算：产品应占像素 = 参照物像素 × （产品真实尺寸 ÷ 参照物真实尺寸）。同一深度平面上比较；参照物和产品不在同一平面时，换一个参照物或调整构图。

### B.4 尺寸验收（每张必做，结果写入 manifest）
1. 在成图上量出参照物和产品的像素宽度（或高度）。
2. 换算出画面中产品的“表观尺寸”，与产品数据对比。
3. 偏差 ≤ 15% 才算通过；超过就作废重做（最多 2 次），仍不过则该产品暂不放展示图。
4. 在 `data-import/scene-scale-check.csv` 记录：图片文件、产品、参照物、参照物像素、产品像素、换算尺寸、规格尺寸、偏差%、结果。
5. 同时检查：产品形状、颜色、工艺与实拍一致；食物与尺寸等级匹配；无文字、无品牌、无可识别人脸、无畸形手指或餐具。

### B.5 页面展示
- 成品展示图只能作辅图（不作主图、分类封面、Product JSON-LD 图片）。
- 图库中这类图片的说明文字统一加上 “Illustrative image / 效果示意图”，alt 文字描述画面，不写 real、actual、customer、factory。
- 每个产品最多 2 张：1 张近景（产品 + 食物 + 参照物），1 张陈列（多件成排或成组）。

### B.6 先试点，再铺开
先做试点产品的尺寸锚定图，再做成品展示图。先选 5 款不同尺寸等级、不同形状的产品试做（建议：3830 PET 淋膜卷口杯、6040 防油纸卷口杯、正方形 PET 淋膜卷口杯、开窗蛋糕盒、圆形空气炸锅纸），生成试点总览图交人工审核，确认通过后再做其余产品。

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
