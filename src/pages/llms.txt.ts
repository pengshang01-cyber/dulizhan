import type { APIRoute } from "astro";
import { navigation, site } from "../config/site";
import { localized, t } from "../i18n/utils";
import { getVisibleCategories } from "../lib/products";
import { confirmedText, configuredOrigin } from "../lib/seo";

function inline(text: string) {
  return text.replace(/\s+/g, " ").replace(/[\\[\]`*_<>]/g, "\\$&");
}

export const GET: APIRoute = async () => {
  const origin = configuredOrigin(site.domain);
  const link = (label: string, path: string) =>
    `- [${inline(label)}](${origin ? new URL(path, origin).href : path})`;
  const name =
    confirmedText(localized(site.companyName, "en")) ??
    confirmedText(localized(site.shortName, "en")) ??
    t("llms.title", "en");
  const contacts = [
    ["site.email", site.email],
    ["site.phone", site.phone],
    ["site.whatsapp", site.whatsappNumber],
    ["contact.wechat", site.wechatId],
    ["contact.address", localized(site.factoryAddress, "en")],
  ].flatMap(([key, value]) => {
    const contact = confirmedText(value);
    return contact ? [`- ${t(key, "en")}: ${inline(contact)}`] : [];
  });
  const categories = await getVisibleCategories();
  const lines = [
    `# ${inline(name)}`,
    "",
    `> ${t("llms.summary", "en")}`,
    "",
    `## ${t("llms.pages", "en")}`,
    "",
    ...navigation.map(({ key, href }) => link(t(key, "en"), href)),
    ...(categories.length
      ? [
          "",
          `## ${t("nav.categories", "en")}`,
          "",
          ...categories.map(({ id, label }) =>
            link(
              confirmedText(localized(label, "en")) ?? id,
              `/products/${id}/`,
            ),
          ),
        ]
      : []),
    ...(contacts.length
      ? ["", `## ${t("nav.contact", "en")}`, "", ...contacts]
      : []),
  ];
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
