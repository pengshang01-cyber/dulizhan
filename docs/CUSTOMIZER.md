# 5039 圆纸片 Logo 定制器

在中英文 5039 产品详情页点击“定制你的产品”。左侧可转动成型杯、查看杯底，旁边的纸片图按真实毫米显示。手机在上方看两张预览，向下滑动调整设计。随时可下载对应语言的 SVG 或 A4 PDF。按实际大小或 100% 打印，先量模板上的 50 mm 校验尺。[纸片分区推导](PRODUCT-DATA.md#5039-原料纸片与成型)

## 打样步骤

1. 选 PNG、JPG 或静态 SVG 作为预览 Logo。可试用虚构标志 PIVOQUE。若制作源文件是 PDF 或 Adobe Illustrator，可作为单独附件交给工厂。只选源文件时，效果图保留当前底色，邮件附上原文件。
2. 杯壁正面、杯底中央可各放一个 Logo。横排沿杯壁一周等距排布，竖排按高度布置，斜向满版错行重复，自由摆放可在平面拖动。环绕自动数量为中部原片周长除以宽度加间距并向下取整。斜排角度默认 30°，可调 15°–60°。
3. 决定底色、尺寸、偏移、去白底和原色或单色。补偿按局部原片半径除以成型半径沿切向加宽。杯底比例为 1，口缘附近的杯壁补偿约 1.89 倍。折入褶中的纸面依然会被遮挡。
4. 留意卷边、被遮墨迹超过约 20%、安全线、标志宽度低于 10 mm 和位图有效分辨率低于 300 dpi 的提醒。估算按有墨面积取样；透明像素不计入遮挡比例。矢量稿可放大，屏幕颜色供选样，最终颜色及位置以设计确认稿为准。
5. 点击“加入询价”固定本次设计。询价单和联系表单会标出有定制附件。继续修改草稿后可再次加入，替换该规格随单提交的版本。在同一浏览器内切换中文或英文会带上已加入的设计。

## 参数文件 v1

| 字段 | 单位、范围或含义 |
| --- | --- |
| `version`、`product`、`variant` | 1、`pet-coated-round-rolled-rim-baking-cups`、`5039` |
| `printSide` | `outside` / `inside`，由工厂在 CMS 设置默认面 |
| `layout` | `wall`、`base`、`wrap`、`vertical`、`diagonal`、`free` |
| `widthMm`、`rotationDeg` | 原片上的标志宽度 2–143 mm，旋转 −180° 至 180° |
| `spacingMm`、`offsetXmm`、`offsetYmm` | 间距 0–100 mm，两轴偏移 −143 至 143 mm，原点为圆心，X 向右、Y 向下 |
| `count`、`diagonalDeg` | 空值表示自动计数，手工 1–240，斜排 15°–60° |
| `background`、`colorMode`、`ink` | 产品已配置的屏幕底色、`original` 或 `mono`、单色墨色 HEX |
| `compensate`、`removeWhite` | 环向预拉宽和去除白色背景两个开关 |
| `logo`、`production` | 空值或含原文件名 `name` 与小写十六进制 `sha256` 的对象 |

浏览器通过 IndexedDB 保存草稿、原文件和随询价单固定的一份设计。导出的 JSON 只含参数和文件校验值。在另一台设备上导入后，按提示重新选择同名且 SHA-256 一致的原文件。清理浏览器站点数据会移除本机草稿。

## 邮件与文件

普通询盘沿用 JSON。带设计的询盘以 multipart 向同一 `POST /api/inquiry` 提交。Worker 经过原有必填字段校验、蜜罐和 Turnstile 校验，检查文件角色、扩展名、MIME、文件标记、原稿校验值及总体积，再发送给 Resend。PNG/JPG/静态 SVG 原稿和可选 PDF/AI 各限 10 MB；所有附件合计按 Base64 编码后的 **15 MB** 计。Worker 在请求内处理文件。

| multipart 字段 | 邮件内容 |
| --- | --- |
| `payload` | 既有询盘资料与产品清单 |
| `logo`、`production` | 选定的原始文件，至少一项 |
| `front`、`angle`、`top` | 同一设计的正面、45°、俯视 JPEG |
| `blank` | 带分区说明的平纸片 PNG |
| `parameters` | UTF-8 的 5039-design.json |

HTML 与纯文本邮件均附中文参数表。附件过大时可压缩原图或精简 PDF，并保留原始印刷尺寸。提交成功会释放随单固定的附件，本地可编辑草稿仍可再次打开。

## 维护

在已安装 Blender、Playwright Chromium 及仓库依赖的环境运行下列命令。模板的折带边界由产品 JSON 和定制器共同使用的计算函数生成。

```sh
npm run models:build -- --only=pet-coated-round-rolled-rim-baking-cups
npm run models:templates
npm test
npm run screenshots -- M20
```

线上审核可用环境变量 `M20_PREVIEW_URL` 指定 Workers PR 预览的 HTTPS 地址。[Resend 附件格式](https://resend.com/docs/dashboard/emails/attachments)
