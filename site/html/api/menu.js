const FLOCAFE_API_URL = process.env.FLOCAFE_API_URL;
const FLOCAFE_STAFF_EMAIL = process.env.FLOCAFE_STAFF_EMAIL;
const FLOCAFE_STAFF_PASSWORD = process.env.FLOCAFE_STAFF_PASSWORD;
const DELIVERY_FEE = Number(process.env.FLOCAFE_DELIVERY_FEE || 0);

// "Zutat ..." / "Preis pro ..." / "Price Pro ..." entries are FloCafe catalog
// SKUs that represent "one extra ingredient at this category's price tier" -
// their name is a label followed by the full comma-separated list of every
// ingredient available at that price. They're never sold as-is; instead
// they're parsed into per-ingredient checkboxes on the order page (see
// order.js) and only ever added to a cart/order using their real product_id
// and price, so FloCafe's own tax/total calculation stays correct.
const ADDON_NAME_PATTERN = /^(zutat|preis\s*pro|price\s*pro)/i;

// Known label prefixes to strip before splitting the rest of the name on
// commas. Longest/most specific patterns first so e.g. the Calzone label
// (which itself contains no commas) doesn't get confused with the generic
// "Preis pro Belag" one.
const ADDON_LABEL_STRIP_PATTERNS = [
  /^zutat\s+salat\s+/i,
  /^preis\s*pro\s+belag\s+in\s+der\s+calzone\s*\([^)]*\)\s*/i,
  /^preis\s*pro\s+belag\s+/i,
  /^price\s*pro\s+extra\s+belag\s+/i,
  /^zutat\s+/i,
];

function parseAddonIngredients(name) {
  let rest = name;
  for (const pattern of ADDON_LABEL_STRIP_PATTERNS) {
    if (pattern.test(rest)) {
      rest = rest.replace(pattern, '');
      break;
    }
  }
  return rest
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) {
    return cachedToken;
  }
  const loginRes = await fetch(`${FLOCAFE_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: FLOCAFE_STAFF_EMAIL, password: FLOCAFE_STAFF_PASSWORD }),
  });
  if (!loginRes.ok) {
    throw new Error(`FloCafe login failed (${loginRes.status})`);
  }
  const data = await loginRes.json();
  cachedToken = data.access_token;
  const ttlMs = (data.expires_in ? data.expires_in * 1000 : 23 * 60 * 60 * 1000) - 60000;
  cachedTokenExpiry = Date.now() + ttlMs;
  return cachedToken;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!FLOCAFE_API_URL || !FLOCAFE_STAFF_EMAIL || !FLOCAFE_STAFF_PASSWORD) {
    res.status(503).json({ error: 'Online ordering is not configured yet' });
    return;
  }

  try {
    const token = await getToken();
    const authHeaders = { Authorization: `Bearer ${token}` };

    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${FLOCAFE_API_URL}/api/categories`, { headers: authHeaders }),
      fetch(`${FLOCAFE_API_URL}/api/products?active=1`, { headers: authHeaders }),
    ]);

    if (!categoriesRes.ok || !productsRes.ok) {
      throw new Error(`FloCafe menu fetch failed (${categoriesRes.status}/${productsRes.status})`);
    }

    const { categories } = await categoriesRes.json();
    const { products } = await productsRes.json();

    const grouped = (categories || [])
      .map((category) => {
        const categoryProducts = (products || []).filter(
          (product) => product.category_id === category.id && product.is_active !== 0
        );

        const addonGroups = categoryProducts
          .filter((product) => ADDON_NAME_PATTERN.test(product.name))
          .map((product) => ({
            id: product.id,
            price: product.price,
            ingredients: parseAddonIngredients(product.name),
          }))
          .filter((group) => group.ingredients.length > 0)
          .sort((a, b) => a.price - b.price);

        const items = categoryProducts
          .filter((product) => !ADDON_NAME_PATTERN.test(product.name))
          .map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
          }))
          .sort((a, b) => a.price - b.price);

        return {
          id: category.id,
          name: category.name,
          description: category.description || '',
          slug: category.slug || '',
          items,
          addonGroups,
        };
      })
      .filter((category) => category.items.length > 0);

    // Menu items rarely change second-to-second, so let Vercel's edge cache
    // serve repeat/concurrent requests instantly instead of round-tripping
    // through the tunnel to the restaurant PC every single page view.
    // stale-while-revalidate means even a stale hit is instant, refreshed
    // quietly in the background for the next visitor.
    res.setHeader('Cache-Control', 'public, max-age=20, stale-while-revalidate=180');
    res.status(200).json({ categories: grouped, delivery_fee: DELIVERY_FEE });
  } catch (err) {
    console.error('[api/menu] fetch error:', err.message);
    res.status(502).json({ error: 'Could not load the menu right now' });
  }
};
