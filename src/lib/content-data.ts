import { z } from "astro/zod";
import { localizedText, requiredText } from "../lib/content-fields";
import customization from "../data/customization.json";
import cases from "../data/cases.json";
import team from "../data/team.json";

export const customizationSteps = z
  .array(
    z.object({
      title: localizedText,
      description: localizedText,
    }),
  )
  .parse(customization);

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
