import type { APIRoute, GetStaticPaths } from "astro";
import { getProducts } from "../../../lib/products";
import {
  publicTechnicalSpec,
  technicalSpec,
} from "../../../lib/product-technical";

export const getStaticPaths: GetStaticPaths = async () =>
  (await getProducts()).flatMap(({ data }) => {
    const spec = technicalSpec(data.slug);
    return spec
      ? [
          {
            params: { slug: data.slug },
            props: { spec: publicTechnicalSpec(spec) },
          },
        ]
      : [];
  });

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(props.spec, null, 2) + "\n", {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
