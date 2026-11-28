import site from "../data/site.json";
import { productHref } from "../i18n/routing";
import { configuredOrigin } from "../lib/indexing";
import type { InquiryPayload } from "../lib/inquiry-payload";
import { confirmedText } from "../lib/placeholders";
import type { Design } from "../lib/blank-design";
import { designRows } from "./design-attachments";

const labels = {
  en: {
    heading: "New inquiry",
    name: "Name",
    email: "Email",
    company: "Company",
    country: "Country",
    phone: "WhatsApp / Phone",
    wechatId: "WeChat ID",
    productInterest: "Product category (ID)",
    selectedProduct: "Selected product",
    quantity: "Quantity range (pcs)",
    message: "Message",
    samples: "Samples requested",
    sourceUrl: "Source page",
    locale: "Language",
    submitted: "Submitted at (UTC)",
    items: "Inquiry list",
    sku: "SKU",
    title: "Product",
    itemQuantity: "Quantity (pcs)",
    discuss: "To be discussed",
    yes: "Yes",
    no: "No",
    none: "Not provided",
    empty: "No products in the inquiry list",
    subject: "[EN] New Inquiry: ",
  },
  zh: {
    heading: "新询盘",
    name: "姓名",
    email: "邮箱",
    company: "公司",
    country: "国家或地区",
    phone: "WhatsApp / 电话",
    wechatId: "微信号",
    productInterest: "产品分类（ID）",
    selectedProduct: "所选产品",
    quantity: "采购数量区间（个）",
    message: "采购需求",
    samples: "是否需要样品",
    sourceUrl: "来源页面",
    locale: "语言",
    submitted: "提交时间（UTC）",
    items: "询价清单",
    sku: "型号",
    title: "产品名称",
    itemQuantity: "数量（个）",
    discuss: "待沟通",
    yes: "是",
    no: "否",
    none: "未填写",
    empty: "询价清单中暂无产品",
    subject: "[中文] 新询盘：",
  },
} as const;

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}

export function buildInquiryEmail(
  data: InquiryPayload,
  submittedAt: Date,
  design?: Design,
) {
  const copy = labels[data.locale];
  const origin = configuredOrigin(site.domain);
  const productUrl = (slug: string, category: string) =>
    origin && category
      ? new URL(productHref({ slug, category }, data.locale), origin).href
      : undefined;
  const items = data.items.map(({ title, slug, category, sku, quantity }) => ({
    title: confirmedText(title) ?? slug,
    url: productUrl(slug, category),
    sku: confirmedText(sku),
    quantity: String(quantity ?? copy.discuss),
  }));
  const hasSku = items.some(({ sku }) => sku);
  const itemHeaders = [
    ...(hasSku ? [copy.sku] : []),
    copy.title,
    copy.itemQuantity,
  ];
  const selected = data.items.find(({ slug }) => slug === data.productSlug);
  const selectedTitle =
    confirmedText(data.productTitle) ??
    confirmedText(selected?.title) ??
    data.productSlug;
  const selectedUrl = data.productSlug
    ? productUrl(data.productSlug, selected?.category ?? data.productInterest)
    : undefined;
  const textProduct = (title: string, url: string | undefined) =>
    url ? `${title} (${url})` : title;
  const htmlProduct = (title: string, url: string | undefined) =>
    url
      ? `<a href="${escapeHtml(url)}">${escapeHtml(title)}</a>`
      : escapeHtml(title);
  const country =
    new Intl.DisplayNames([data.locale], { type: "region" }).of(data.country) ??
    data.country;
  const quantityRanges: Record<string, string> = {
    "under-10000": "< 10,000",
    "10000-49999": "10,000–49,999",
    "50000-99999": "50,000–99,999",
    "100000-plus": "100,000+",
  };
  const fields: [string, string, string?][] = [
    [copy.name, data.name],
    [copy.email, data.email],
    [copy.company, data.company],
    [copy.country, `${country} (${data.country})`],
    [copy.phone, data.phone],
    [copy.wechatId, data.wechatId],
    [copy.productInterest, data.productInterest],
    [copy.selectedProduct, selectedTitle, selectedUrl],
    [copy.quantity, quantityRanges[data.quantity] ?? copy.discuss],
    [copy.message, data.message],
    [copy.samples, data.samples ? copy.yes : copy.no],
    [copy.sourceUrl, data.sourceUrl],
    [copy.locale, data.locale],
    ...Object.entries(data.utm).map(([key, value]): [string, string] => [
      key,
      value ?? "",
    ]),
    [copy.submitted, submittedAt.toISOString()],
  ];
  const count = new Set([
    ...data.items.map((item) => item.slug),
    ...(data.productSlug ? [data.productSlug] : []),
  ]).size;
  // 即使以后放宽字段校验，也不允许用户换行进入邮件主题。
  const subject =
    `${copy.subject}${data.company || data.name} - ${country} - ${count}`.replace(
      /[\r\n]/g,
      " ",
    );
  const text = [
    copy.heading,
    "",
    ...fields.map(
      ([key, value, url]) => `${key}: ${textProduct(value || copy.none, url)}`,
    ),
    "",
    copy.items,
    itemHeaders.join(" | "),
    ...(items.length
      ? items.map(({ title, url, sku, quantity }) =>
          [
            ...(hasSku ? [sku ?? ""] : []),
            textProduct(title, url),
            quantity,
          ].join(" | "),
        )
      : [copy.empty]),
  ].join("\n");
  const cell = (content: string, tag = "td") =>
    `<${tag} style="border:1px solid #e8e1d7;padding:10px;text-align:left;white-space:pre-wrap">${content}</${tag}>`;
  const detailRows = fields
    .map(
      ([key, value, url]) =>
        `<tr>${cell(escapeHtml(key))}${cell(htmlProduct(value || copy.none, url))}</tr>`,
    )
    .join("");
  const itemRows = items
    .map(
      ({ title, url, sku, quantity }) =>
        `<tr>${hasSku ? cell(escapeHtml(sku ?? "")) : ""}${cell(htmlProduct(title, url))}${cell(escapeHtml(quantity))}</tr>`,
    )
    .join("");
  const html = `<!doctype html><html lang="${data.locale === "zh" ? "zh-CN" : "en"}"><body style="font-family:Arial,sans-serif;color:#30271f"><h1>${copy.heading}</h1><table style="border-collapse:collapse;width:100%">${detailRows}</table><h2>${copy.items}</h2><table style="border-collapse:collapse;width:100%"><thead><tr>${itemHeaders.map((header) => cell(escapeHtml(header), "th")).join("")}</tr></thead><tbody>${itemRows}</tbody></table>${items.length ? "" : `<p>${copy.empty}</p>`}</body></html>`;
  if (!design) return { subject, html, text };
  const rows = designRows(design);
  const table =
    '<h2 lang="zh-CN">5039 定制参数</h2><table style="border-collapse:collapse">' +
    rows
      .map(
        ([k, v]) =>
          "<tr>" + cell(escapeHtml(k), "th") + cell(escapeHtml(v)) + "</tr>",
      )
      .join("") +
    "</table>";
  return {
    subject,
    html: html.replace("</body>", table + "</body>"),
    text:
      text +
      "\n\n5039 定制参数\n" +
      rows.map(([k, v]) => k + "：" + v).join("\n"),
  };
}
