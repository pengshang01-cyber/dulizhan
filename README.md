# Cupcake Liners and Baking Cups

## Local development

Use the Node.js version in `.node-version`.

```sh
npm ci --ignore-scripts
npm run dev
```

```sh
npm run build
npm run check
npm run lint
```

Run `npm run format` to format the source files or `npm run preview` to serve the production build locally.

## Review screenshots

Build the site and install Playwright's Chromium before capturing the routes listed in `scripts/pages.json`.

```sh
npm run build
npx playwright install chromium
npm run screenshots -- M0
```

The script starts a local preview and saves full-page desktop and mobile PNGs in `docs/reviews/M0/`.

## Deploy to Cloudflare Pages

1. Open **Workers & Pages** in Cloudflare, create a Pages project with Git integration, and select this repository.
2. Set the production branch to `main` and use the repository root as the build root.
3. Set the build command to `npm run build` and the output directory to `dist`. The Node.js version is set in `.node-version`.
4. Save the project and deploy. Cloudflare Pages creates preview deployments for branches when branch previews are enabled.

## Site configuration

Supply verified factory details in `src/config/site.ts`. Set `domain` to the full HTTPS site origin when it is known so Astro can generate the sitemap.

Copy `.env.example` to `.env` for local service configuration. Set deployment values in the Cloudflare Pages dashboard. The M0 build runs with the variables empty.

| Variable                    | Purpose                                |
| --------------------------- | -------------------------------------- |
| `PUBLIC_GA_ID`              | Public GA4 measurement ID              |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile widget site key       |
| `TURNSTILE_SECRET_KEY`      | Server-side Turnstile verification key |
| `RESEND_API_KEY`            | Server-side Resend API key             |
| `INQUIRY_TO_EMAIL`          | Address that receives inquiries        |
| `INQUIRY_FROM_EMAIL`        | Verified inquiry sender address        |
