import { z } from "astro/zod";
import {
  localizedText,
  optionalLocalizedText,
  requiredText,
} from "../lib/content-fields";
import customization from "../data/customization.json";
import examples from "../data/design-examples.json";
import cases from "../data/cases.json";
import team from "../data/team.json";

export const customizationIcons = {
  inquiry: "M5 5h14v11H9l-4 4V5Zm3 4h8m-8 3h6",
  mockup: "M13 4H5v16h14v-7m-2-8 3 3m-9 6 1-4 6-6 3 3-6 6-4 1Z",
  sample: "M4 7h16l-3 13H7L4 7Zm-1-3h18M9 10l1 7m5-7-1 7",
  approval: "M8 4h8l1 3h3v13H4V7h3l1-3Zm0 10 3 3 5-5",
  production: "M4 20V10l5 3V8l5 4V4h4l2 16H4Zm4-3h1m4 0h1m3 0h1",
  delivery:
    "M3 5h13v12H3V5Zm13 5h3l2 3v4h-5m-9 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
};

export const customizationSteps = z
  .array(
    z.object({
      title: localizedText,
      description: localizedText,
      icon: z.preprocess(
        (value) => (value === "" || value === null ? undefined : value),
        z
          .enum([
            "inquiry",
            "mockup",
            "sample",
            "approval",
            "production",
            "delivery",
          ])
          .optional(),
      ),
    }),
  )
  .parse(customization);

export const designExamples = z
  .array(
    z.object({
      title: localizedText,
      description: localizedText,
      image: z.string().nullish(),
      alt: optionalLocalizedText,
    }),
  )
  .parse(examples);

export const customizationCases = z
  .array(
    z.object({
      title: localizedText,
      summary: localizedText,
      image: requiredText,
      imageAlt: localizedText,
    }),
  )
  .parse(cases);

export const teamMembers = z
  .array(
    z.object({
      name: localizedText,
      role: localizedText,
      image: requiredText,
    }),
  )
  .parse(team);
