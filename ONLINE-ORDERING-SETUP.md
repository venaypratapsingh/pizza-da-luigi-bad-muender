# Online ordering setup (FloCafe + Cloudflare Tunnel)

This is the setup the website side (`order.html`, `api/menu.js`, `api/order.js`) is built against.
Everything below happens on the **restaurant PC** — the computer that will run FloCafe and stay
on during opening hours — and in your Vercel project settings. None of it needs touching this
repo again once it's done.

## 1. Install FloCafe

Download the installer for the restaurant PC's OS from
https://github.com/FreeOpenSourcePOS/FloCafe/releases and install it.

On first launch:
- Create the **owner account**.
- Settings → Business: set the business name to "Pizza Da Luigi". Germany isn't in FloCafe's
  country **dropdown** yet (as of 2.9.7 it only lists ~30 countries, none in the Eurozone, and
  the Currency/Timezone fields next to it are locked read-only in the UI once a country is
  picked) — but the underlying API accepts any valid country/currency/timezone, it's only the
  dropdown that's artificially restrictive. Fix it directly via the API instead, once FloCafe is
  running:

  ```powershell
  $login = Invoke-RestMethod -Uri http://localhost:3001/api/auth/login -Method Post -ContentType "application/json" `
    -Body (@{ email = "YOUR_OWNER_EMAIL"; password = "YOUR_OWNER_PASSWORD" } | ConvertTo-Json)
  $token = $login.access_token

  Invoke-RestMethod -Uri http://localhost:3001/api/settings/business -Method Put `
    -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" `
    -Body (@{ business_name = "Pizza Da Luigi"; country = "DE"; currency = "EUR"; timezone = "Europe/Berlin" } | ConvertTo-Json)
  ```

  Run that in PowerShell with your real owner credentials. Afterwards, Settings will show
  `EUR` / `Europe/Berlin` correctly (the country dropdown itself may look blank/unselected since
  "DE" isn't one of its hardcoded options — cosmetic only, the stored value is correct). This also
  makes phone numbers typed without a `+49` prefix parse as German by default, both in FloCafe and
  on the website's checkout form.
  - FloCafe's tax module has no official German VAT pack yet either — leave taxes off unless/
    until that exists, or handle VAT outside FloCafe for now.
- Settings → add your categories and products (menu items), either by hand or via
  Settings → Menu → CSV import if you have a spreadsheet ready. *(Send me the real item list with
  prices any time and I'll generate a ready-to-import CSV.)*

## 2. Create a dedicated staff login for the website

Settings → Users → add a new user with the **cashier** role — something like:

- Name: `Online Orders`
- Email: `online-orders@flo.local`
- Password: a long random one, generated just for this (a password manager is fine)

Don't reuse the owner login here. This account only ever needs to create orders and customers, so
if the website is ever compromised, the damage is capped at "someone could place a fake order" —
not "someone has your owner account."

## 3. Install Cloudflare Tunnel on the same PC

This lets the website reach FloCafe's local API without opening any port on the restaurant's
router.

```powershell
# Windows (PowerShell, run as the same user FloCafe runs as)
winget install --id Cloudflare.cloudflared
cloudflared tunnel login
cloudflared tunnel create pizzadaluigi-orders
```

The `login` step opens a browser to your Cloudflare account (free tier is enough). If you don't
have a Cloudflare account yet, sign up first at https://dash.cloudflare.com/sign-up.

### Add the domain to Cloudflare (partial/CNAME setup — doesn't touch the live site)

Your main domain's DNS stays exactly where it is (Vercel keeps serving the live site). You only
need Cloudflare to know about **one new subdomain**:

1. In the Cloudflare dashboard: **Add a site** → enter `pizzadaluigi-badmünder.de` → choose the
   **free plan**.
2. When it asks about nameservers, you do **not** need to switch them. Look for the option to add
   it as a **partial/CNAME setup** instead (Cloudflare calls this out during onboarding for sites
   that don't want a full nameserver migration).
3. Once the domain is recognized by Cloudflare, route the tunnel to a subdomain:

```powershell
cloudflared tunnel route dns pizzadaluigi-orders order-api.pizzadaluigi-badmünder.de
```

### Point the tunnel at FloCafe's local API and install it as a service

Create `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: pizzadaluigi-orders
credentials-file: C:\Users\<your-username>\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: order-api.pizzadaluigi-badmünder.de
    service: http://localhost:3001
  - service: http_status:404
```

Then install it so it survives restarts:

```powershell
cloudflared service install
```

Verify it's reachable (should return a JSON error about missing credentials, not a connection
failure — that confirms the tunnel and FloCafe are both up):

```powershell
curl.exe https://order-api.pizzadaluigi-badmünder.de/api/kds-info
```

## 4. Set the secrets in Vercel

In the [Vercel dashboard](https://vercel.com/night-ninjas-projects/html/settings/environment-variables),
add these (Production environment):

| Name | Value |
| --- | --- |
| `FLOCAFE_API_URL` | `https://order-api.pizzadaluigi-badmünder.de` |
| `FLOCAFE_STAFF_EMAIL` | the email from step 2 |
| `FLOCAFE_STAFF_PASSWORD` | the password from step 2 |
| `FLOCAFE_DELIVERY_FEE` | e.g. `2.50` (optional — omit or set `0` for no delivery fee) |

Set these directly in the dashboard rather than sending me the password — I never need to see it.
After saving, redeploy (Vercel → Deployments → ⋯ → Redeploy) so the functions pick up the new
values.

## 5. Test end to end

1. Open `https://www.pizzadaluigi-badmünder.de/order.html` — the menu should load (not the
   "call us" fallback message).
2. Add an item, fill in the checkout form, place a test order.
3. Check the FloCafe Kitchen Display / Orders screen on the restaurant PC — the order should
   appear there within a couple of seconds.

If the menu doesn't load: check `curl.exe https://order-api.pizzadaluigi-badmünder.de/api/kds-info`
from *outside* the restaurant's network (e.g. from your phone on mobile data) — if that fails, the
tunnel isn't up; if it works but the site still shows the fallback, double-check the three env
vars in Vercel.
