import { z } from "astro/zod";
import {
  localizedText,
  optionalLocalizedText,
  optionalMeasurement,
  paperWeight,
} from "./content-fields";

const unit = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.enum(["mm", "cm", "m"]).optional(),
);
const sharedText = z.preprocess(
  (value) => value ?? undefined,
  z.string().trim().optional(),
);
const dimensions = z.object({
  shape: z.enum(["round", "rectangular", "sheet", "roll", "shaped"]).optional(),
  diameterMm: optionalMeasurement,
  baseDiameterMm: optionalMeasurement,
  topDiameterMm: optionalMeasurement,
  baseLengthMm: optionalMeasurement,
  baseWidthMm: optionalMeasurement,
  topLengthMm: optionalMeasurement,
  topWidthMm: optionalMeasurement,
  length: optionalMeasurement,
  width: optionalMeasurement,
  lengthUnit: unit,
  widthUnit: unit,
  heightMm: optionalMeasurement,
  lowHeightMm: optionalMeasurement,
  highHeightMm: optionalMeasurement,
  topWideMm: optionalMeasurement,
  topNarrowMm: optionalMeasurement,
  specification: optionalLocalizedText,
});

const packageFields = z.object({
  packaging: optionalLocalizedText,
  cartonLoading: optionalLocalizedText,
  packWeight: sharedText,
  packSize: sharedText,
  cartonWeight: sharedText,
  cartonSpec: sharedText,
});

const itemFields = dimensions.extend({
  material: optionalLocalizedText,
  paperWeight: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    paperWeight.optional(),
  ),
  unitWeight: sharedText,
  packages: z.array(packageFields).optional(),
});

export const productSizeFields = itemFields.extend({
  name: localizedText,
  hasLid: z.boolean().optional(),
  lid: z.preprocess(
    (value) =>
      value == null ||
      (typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0)
        ? undefined
        : value,
    itemFields.optional(),
  ),
});

export const colorFields = localizedText.extend({
  swatch: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z
      .string()
      .regex(/^#[a-f0-9]{6}$/i)
      .optional(),
  ),
});
