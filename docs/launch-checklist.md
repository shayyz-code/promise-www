# Launch checklist

The site goes live in two stages: first on the real domain while hidden from search engines, then open to them once it
is finished. Work through this in order. Steps marked **Code** are pull requests. The rest are for the owner, in the
service named.

`bun run check:seo-build` enforces the second stage. CI runs it before every deploy, and with `SITE_INDEXABLE=true` it
stops the deploy unless `SITE_URL` is the real domain, no page is marked noindex, `robots.txt` and the sitemap are
correct, and no photo placeholder remains.

## 1. Put the site on the domain

1. Register `promisemm.com`, ideally with Cloudflare Registrar on the account that owns the Worker. A Worker custom
   domain needs a zone you own on that account.
2. Turn on Cloudflare Email Routing for `hi@promisemm.com`, which the site publishes.
3. On the GitHub `production` environment, not the repository, set:
   - the variables `SITE_URL=https://promisemm.com` and `SITE_INDEXABLE=false`;
   - the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The token must be able to manage the zone's
     Workers routes.
4. **Code:** in `apps/web/wrangler.jsonc`, add `"routes": [{ "pattern": "promisemm.com", "custom_domain": true }]` and
   set `"workers_dev": false`. Merging this before the zone exists breaks deploys. Then update the `workers.dev` example
   in the README.
5. Approve the deployment. The smoke tests run against `SITE_URL`.
6. Redirect `www`. In Cloudflare DNS, add a proxied `A` record for `www` pointing to `192.0.2.0`. Then add a Redirect
   Rule that sends `www.promisemm.com` to `https://promisemm.com` with a 301, keeping the path and query.

The site is now live but still noindex.

## 2. Finish the site

1. **Code:** replace every photo placeholder with a real photo.
2. **Code:** add the shop's coordinates and Facebook page to `packages/content`, and to the structured data. The owner
   merges this one.

## 3. Open the site to search engines

1. Set `SITE_INDEXABLE=true` on the `production` environment and re-run the deploy. The audit must pass before anything
   ships.
2. Confirm the live site:
   - `https://www.promisemm.com/` returns a 301 to `https://promisemm.com/`;
   - the `workers.dev` address no longer serves the site;
   - `robots.txt` allows crawling, and `sitemap.xml` lists the four pages on the domain.
3. In Google Search Console, add a Domain property using a DNS TXT record, then submit `sitemap.xml`. Inspect `/`, `/en/`,
   `/desk/` and `/my/desk/`, and request indexing.
4. In Bing Webmaster Tools, import the site from Search Console.
5. In Google Business Profile, set the website to `https://promisemm.com/`. Make the name, address, phones and hours match
   `packages/content/src/data/business.ts` exactly. Set the same website on the Facebook page.
6. Run the four URLs through Google's Rich Results Test and Facebook's Sharing Debugger. If a Telegram preview looks
   stale, send the link to `@WebpageBot`.

Google never guarantees a site name, favicon or rich result, even with correct markup.
