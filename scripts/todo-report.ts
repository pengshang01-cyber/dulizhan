import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
export const START = "<!-- TODO-REPORT:START -->";
export const END = "<!-- TODO-REPORT:END -->";
const labels: Record<string, string> = {
  companyName: "公司全称",
  shortName: "公司简称",
  tagline: "品牌副标题",
  topBarItems: "顶部公告",
  domain: "网站域名",
  email: "邮箱",
  phone: "电话",
  whatsappNumber: "WhatsApp 号码",
  whatsappPrefillMessage: "WhatsApp 预填消息",
  factoryAddress: "工厂地址",
  stockMoq: "现货起订量",
  customMoq: "定制起订量",
  sampleLeadTime: "打样周期",
  productionLeadTime: "生产交期",
  sampleCost: "样品政策",
  paymentTerms: "付款方式",
  shippingMethods: "运输方式",
  stats: "关键数字",
  value: "数值",
  label: "标签",
  youtubeVideoId: "YouTube 视频 ID",
  certificates: "证书",
  name: "名称",
  imagePath: "图片",
  socialLinks: "社交媒体",
  wechatId: "微信号",
  wechatQr: "微信二维码",
  replyTime: "预计回复时间",
  analytics: "统计",
  gaMeasurementId: "Google Analytics 衡量 ID",
  logo: "网站 Logo",
  ogImage: "默认分享图",
  homeHeroImage: "首页主图",
  homeHeroAlt: "首页主图说明",
  aboutGallery: "关于我们车间与设备照片",
  caption: "图片说明",
  factoryVideoPoster: "工厂视频封面",
  title: "名称",
  summary: "简介",
  sku: "产品型号",
  material: "材质",
  gsm: "纸张克重",
  sizes: "尺寸规格",
  baseDiameterMm: "底部直径",
  heightMm: "高度",
  topDiameterMm: "顶部直径",
  colors: "颜色",
  patterns: "图案",
  customizable: "是否支持定制",
  moq: "最小起订量",
  packaging: "包装方式",
  cartonSpec: "外箱规格",
  leadTime: "生产交期",
  faqs: "产品问答",
  q: "问题",
  a: "回答",
  seoTitle: "SEO 标题",
  seoDescription: "SEO 简介",
  customOptions: "定制选项详情",
  packagingDetails: "包装详情",
  applications: "应用场景",
  en: "英文",
  zh: "中文",
  image: "图片",
  images: "产品图片",
  cover: "文章封面",
  bodyEn: "正文（英文）",
  bodyZh: "正文（中文）",
  description: "说明",
  role: "职务",
  imageAlt: "图片说明",
};
const examples: Record<string, string> = {
  companyName: "英文栏：[工厂正式英文全称]；中文栏：[营业主体中文全称]",
  shortName: "[对外使用的公司简称]，与页头品牌一致",
  tagline: "[一句简短定位]，如描述产品品类，不写未经核实的年限",
  topBarItems: "[一条简短采购提示]，不超过一行；没有确认内容可删掉该项",
  factoryAddress: "英文：[街道], [城市], [省], [国家]；中文填对应详细地址",
  certificates: "[证书真实名称]，核实有效期和适用范围，并上传对应扫描件",
  title: "[杯型 / 材质] + [用途或产品系列]，使用真实产品名",
  summary: "一句话：[产品类别] + [适用场景] + [已确认特点]",
  material: "[Paper type], [coating / treatment]；写清纸张与处理方式",
  sizes: "规格名称写 [工厂规格名]；尺寸数字分别填对应 mm 栏",
  colors: "每项一个真实颜色名称，例如 [英文颜色名] / [中文颜色名]",
  patterns: "每项一个已提供的图案系列，例如 [系列英文名] / [系列中文名]",
  faqs: "问题填写采购者会问的问题；回答以 We / 我们开头，具体参数须核实",
  seoTitle: "[产品名称] | [采购用途]，建议英文 ≤60、中文 ≤30 字符",
  seoDescription: "一句完整的采购简介，建议英文 ≤155、中文 ≤80 字符",
  customOptions: "逐行写已支持的印刷、尺寸、颜色及包装选项；没有资料可整组留空",
  packagingDetails:
    "写明 [内包装方式]、[装箱方式] 和 [运输注意事项]；没有资料可整组留空",
  applications: "逐行写实际适用的 [烘焙品类 / 陈列场景]；没有资料可整组留空",
  bodyEn:
    "按提纲补充经核实的英文正文，逐个替换 [TODO]；确认图片和链接后再关闭草稿",
  bodyZh: "补充与英文对应的完整中文正文，逐个替换 [TODO]；不准备发布中文时留空",
  email: "name@example.com（仅格式）",
  phone: "+国家区号 电话号码",
  whatsappNumber: "+国家区号手机号码（不带分隔符）",
  whatsappPrefillMessage: "填写希望客户打开 WhatsApp 后看到的询价开场白",
  domain: "https://您的正式域名",
  gaMeasurementId: "G-XXXXXXXXXX（以真实衡量 ID 替换）",
  youtubeVideoId: "视频网址中 v= 后的 ID，不粘贴整条网址",
  wechatId: "填写可添加的实际微信号",
  stockMoq: "[数量] pcs，或经确认的起订政策",
  customMoq: "[数量] pcs，或经确认的起订政策",
  sampleLeadTime: "[天数] working days（以工厂确认为准）",
  productionLeadTime: "[天数] working days（以工厂确认为准）",
  sampleCost: "一句话说明样品费用、运费及条件",
  paymentTerms: "经确认的付款方式与条件",
  shippingMethods: "经确认的运输方式及适用条件",
  replyTime: "[时间] business hours（以实际承诺为准）",
  sku: "工厂真实型号；示例 TODO-001 不能直接上线",
  gsm: "只填已确认的正数，单位 g/m²",
  baseDiameterMm: "只填已确认的正数，单位 mm",
  heightMm: "只填已确认的正数，单位 mm",
  topDiameterMm: "只填已确认的正数，单位 mm",
  moq: "[数量] pcs 或已确认的起订说明",
  customizable: "按实际产品选择支持 / 不支持",
  cartonSpec: "[长] × [宽] × [高] cm；补充真实装箱说明",
  packaging: "[每包数量] pcs/bag × [每箱包数] bags/carton",
  leadTime: "[天数] working days（以工厂确认为准）",
};
const siteImageAdvice: Record<string, string> = {
  logo: "真实公司标志，可选；建议透明 PNG，至少 512 × 512；留空保留图标与文字",
  ogImage: "正式分享图，建议 1200 × 630；留空使用默认 Placeholder 分享图",
  homeHeroImage:
    "真实主打产品或产品组合，建议 1600 × 1200（4:3）；同时填写首页主图说明，中文可留空",
  factoryVideoPoster:
    "工厂视频封面，可选；建议 1280 × 720；留空沿用已配置视频的 YouTube 缩略图",
  wechatQr: "实际微信二维码，建议至少 600 × 600，无裁剪，上传后用手机验证",
  imagePath: "有效证书的完整扫描，长边至少 1600，名称与图像对应",
};
type Path = (string | number)[];
type Leaf = { path: Path; value: string };
export function leaves(value: unknown, path: Path = []): Leaf[] {
  if (typeof value === "string") return [{ path, value }];
  if (Array.isArray(value))
    return value.flatMap((item, index) => leaves(item, [...path, index]));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([key, item]) =>
      leaves(item, [...path, key]),
    );
  return [];
}
export function isPending(value: string) {
  return /TODO(?:[_\-\s:]|\])/i.test(value);
}
const table = (value: string) =>
  value.replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
function field(path: Path) {
  return path
    .map((key) =>
      typeof key === "number"
        ? "第 " + (key + 1) + " 项"
        : (labels[key] ?? key),
    )
    .join(" → ");
}
function example(path: Path) {
  const keys = path.filter((key) => typeof key === "string") as string[];
  if (keys.includes("stats"))
    return "填写该指标已确认的数值，如 [年份] / [产能数] / [国家数] / [花色数]；两种语言共用，禁止估算";
  if (keys.includes("socialLinks"))
    return "https://对应平台/工厂官方账号（不填个人或示例账号）";
  return (
    keys
      .toReversed()
      .map((key) => examples[key])
      .find(Boolean) ??
    "填写工厂核实的内容；英文栏填英文，中文栏选填；不可直接使用示例或猜测"
  );
}
async function jsonFiles(dir: string) {
  try {
    return (await readdir(dir)).filter((name) => name.endsWith(".json")).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
const displayName = (data: Record<string, unknown>, fallback: string) => {
  const value = (data.title ?? data.label) as
    { en?: string; zh?: string } | undefined;
  return value?.zh?.trim() || value?.en?.trim() || fallback;
};
export function updateGeneratedSection(document: string, section: string) {
  const start = document.indexOf(START),
    end = document.indexOf(END);
  if (start < 0 || end < start)
    throw new Error("上线资料清单缺少自动区域标记，停止写入以保护人工内容");
  return (
    document.slice(0, start + START.length) +
    "\n\n" +
    section.trim() +
    "\n\n" +
    document.slice(end)
  );
}
export async function collectTodos(root: string) {
  const groups: { title: string; rows: string[] }[] = [];
  const pictures: string[] = [];
  let scannedFiles = 0,
    todoFields = 0,
    placeholderReferences = 0,
    emptyImages = 0,
    exampleProducts = 0;
  const sources = [
    ["src/data", "data"],
    ["src/content/categories", "分类"],
    ["src/content/products", "产品"],
    ["src/content/blog", "资讯文章"],
  ] as const;
  for (const [folder, menu] of sources) {
    for (const filename of await jsonFiles(resolve(root, folder))) {
      const path = folder + "/" + filename;
      const data = JSON.parse(await readFile(resolve(root, path), "utf8"));
      scannedFiles++;
      const dataMenus: Record<string, string> = {
        "site.json": "网站设置",
        "faq.json": "常见问题",
        "customization.json": "定制服务内容",
        "cases.json": "案例",
        "team.json": "团队",
      };
      const title =
        menu === "data"
          ? (dataMenus[filename] ?? filename)
          : menu + " → " + displayName(data, filename.slice(0, -5));
      const items = leaves(data);
      if (menu === "data" && filename === "site.json") {
        // CMS 清空图片后可能省略字段，仍应列出使用默认图的位置。
        for (const key of Object.keys(siteImageAdvice).filter(
          (key) => key !== "imagePath",
        )) {
          if (data[key] == null) items.push({ path: [key], value: "" });
        }
        if (!data.aboutGallery?.length) {
          emptyImages++;
          pictures.push(
            "| 网站设置 → 关于我们车间与设备照片（目前为空） | 从“网站资料图片”上传并逐项添加说明 | 真实印刷、成型、质检、包装场景；建议 1600 × 1067（3:2），可增删排序；空列表显示四张默认占位图 |",
          );
        }
      }
      const pending = items.filter(({ value }) => isPending(value));
      const rows = pending.map(({ path: keys, value }) => {
        todoFields++;
        return (
          "| " +
          table(field(keys)) +
          " | " +
          (value.length > 90
            ? "[TODO]（正文提纲，发布前核实）"
            : table(value)) +
          " | " +
          table(example(keys)) +
          " |"
        );
      });
      if (
        menu === "产品" &&
        (filename.startsWith("sample-") || String(data.sku).startsWith("TODO-"))
      ) {
        exampleProducts++;
        rows.unshift(
          "| **示例产品，上线前删除或替换** | " +
            table(String(data.sku)) +
            " | 核实全部参数、名称与产品实拍；替换后检查分类和文章引用 |",
        );
      }
      for (const { path: keys, value } of items) {
        if (
          /placeholder/i.test(value) &&
          /\.(?:png|jpe?g|webp|avif)$/i.test(value)
        ) {
          placeholderReferences++;
          pictures.push(
            "| " +
              table(title + " → " + field(keys)) +
              " | " +
              table(value) +
              " | " +
              (menu === "分类"
                ? "真实分类代表产品；建议 1200 × 900"
                : menu === "产品"
                  ? "真实产品主图 / 细节；建议 1600 × 1200，保持同组比例"
                  : menu === "资讯文章"
                    ? "与文章对应的真实照片或已核对示意图；建议 1600 × 900，草稿发布前替换"
                    : "按实际内容上传，保留足够清晰度") +
              " |",
          );
        }
        if (
          menu === "data" &&
          filename === "site.json" &&
          !value &&
          Object.hasOwn(siteImageAdvice, String(keys.at(-1)))
        ) {
          emptyImages++;
          pictures.push(
            "| " +
              table(title + " → " + field(keys)) +
              "（目前为空） | 从“网站资料图片”上传 | " +
              siteImageAdvice[String(keys.at(-1))] +
              " |",
          );
        }
      }
      groups.push({ title: title + "（" + path + "）", rows });
    }
  }
  const summary = {
    scannedFiles,
    todoFields,
    placeholderReferences,
    emptyImages,
    exampleProducts,
  };
  const lines = [
    "本部分由 npm run todo:report 自动生成，重新运行会更新此区域，保留下方人工上线检查项。示例格式仅供填写参考，**不是已经确认的工厂资料**。",
    "",
    "扫描 " +
      scannedFiles +
      " 个 JSON 文件；" +
      todoFields +
      " 个待补文字 / 参数字段；" +
      placeholderReferences +
      " 处占位图片引用；" +
      emptyImages +
      " 个空图片位；" +
      exampleProducts +
      " 个示例产品。",
    "",
    "中文栏通常选填，留空回退英文；博客中文正文例外，留空不生成中文文章。无产品分类当前隐藏，其封面可在启用该类前补齐。",
    "",
  ];
  for (const group of groups) {
    lines.push("### " + group.title, "");
    if (group.rows.length)
      lines.push(
        "| 在 CMS 中填写的位置 | 当前占位 | 填什么 / 示例格式 |",
        "| --- | --- | --- |",
        ...group.rows,
        "",
      );
    else
      lines.push(
        group.title.startsWith("团队") || group.title.startsWith("案例")
          ? "未发现 TODO 文字。此项为可选内容，没有真实资料时继续留空并隐藏。"
          : "未发现 TODO 文字；请在正式上线前核对现有内容。",
        "",
      );
  }
  lines.push(
    "### 待替换图片与实拍资料",
    "",
    "图片建议为清晰原图，文件名使用小写英文与连字符；CMS 上传后由 Astro 生成展示尺寸。建议尺寸是制作规格，不是产品参数。",
    "",
    "| 页面 / CMS 位置 | 当前文件或上传位置 | 需要的图片及建议尺寸 |",
    "| --- | --- | --- |",
    ...pictures,
    "",
    "备注：页面图片统一在上述 CMS 菜单上传。网站设置中的首页主图、车间图库及默认分享图为空时沿用占位图，Logo 为空时保留图标与文字；视频封面可选，留空用 YouTube 缩略图。微信二维码与证书缺失时按现有规则隐藏。文章两篇示例保持草稿，正文中的 [TODO] 在正式发布前逐项核实。",
  );
  return { summary, section: lines.join("\n") };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = resolve(".");
  const file = resolve(root, "docs/LAUNCH-CHECKLIST.md");
  const result = await collectTodos(root);
  let document: string;
  try {
    document = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    document =
      "# 上线资料与检查清单\n\n## (1) 待补资料（自动生成）\n\n" +
      START +
      "\n" +
      END +
      "\n\n## (2) 上线前检查（人工维护）\n";
  }
  await mkdir(dirname(file), { recursive: true });
  await writeFile(
    file,
    updateGeneratedSection(document, result.section),
    "utf8",
  );
  console.log("TODO report: " + JSON.stringify(result.summary));
  console.log("Updated docs/LAUNCH-CHECKLIST.md; manual checklist preserved.");
}
