import type { Sheet } from "./blank-design.ts";
import {
  verifiedValue,
  type ProductTechnicalSpec,
} from "./product-technical-schema.ts";
export function sheetProfile(spec: ProductTechnicalSpec): Sheet {
  const b = spec.blank!;
  const body = spec.variants.find((v) => v.id === b.variant)!.body;
  return {
    radius: b.zonesMm.rimEnd,
    base: b.zonesMm.bottomEnd,
    wall: b.zonesMm.wallEnd,
    mouth: verifiedValue(body.geometry.topDiameterMm)! / 2,
    sectors: b.sectorStartsTurns,
    bleed: b.margins.bleedMm,
    safe: b.margins.safetyMm,
    side: b.printSide.value,
    sidePending: b.printSide.status === "pending",
    marginsPending: b.margins.status === "pending",
  };
}
