import type { ImageMetadata } from "astro";
import { confirmedLocalized, type Locale } from "../i18n/utils";
import {
  verifiedValue,
  type ProductTechnicalSpec,
} from "./product-technical-schema";

const covers = import.meta.glob<ImageMetadata>(
  "/src/assets/images/products/m19/*/poster.webp",
  { eager: true, import: "default" },
);
export function modelPoster(slug: string) {
  return covers["/src/assets/images/products/m19/" + slug + "/poster.webp"];
}
export function modelOptions(spec: ProductTechnicalSpec, locale: Locale) {
  const appearance = spec.modelAppearance!;
  const colors = spec.colors.flatMap((c) => {
    const name = verifiedValue(c.name),
      label = confirmedLocalized(name, locale),
      hex = verifiedValue(c.hex) ?? c.display?.hex;
    return label && hex
      ? [{ label, hex, selected: name?.en === appearance.sampleColor.en }]
      : [];
  });
  const chosen = verifiedValue(spec.photographedVariant);
  const variants = spec.variants.map((v) => ({
    label: confirmedLocalized(v.label, locale) ?? v.id,
    id: v.id,
    url: "/models/" + spec.slug + "/" + v.id + ".glb",
    selected: chosen === v.id,
  }));
  return { colors, variants };
}
