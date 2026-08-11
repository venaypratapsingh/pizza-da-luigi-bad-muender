const FLOCAFE_API_URL = process.env.FLOCAFE_API_URL;
const FLOCAFE_STAFF_EMAIL = process.env.FLOCAFE_STAFF_EMAIL;
const FLOCAFE_STAFF_PASSWORD = process.env.FLOCAFE_STAFF_PASSWORD;
const DELIVERY_FEE = Number(process.env.FLOCAFE_DELIVERY_FEE || 0);

// "Zutat ..." / "Preis pro ..." / "Price Pro ..." entries are per-ingredient
// add-on pricing references, not standalone dishes - they always sort to the
// bottom of their category instead of taking part in the normal price order.
const ADDON_NAME_PATTERN = /^(zutat|preis\s*pro|price\s*pro)/i;

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
      .map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description || '',
        slug: category.slug || '',
        items: (products || [])
          .filter((product) => product.category_id === category.id && product.is_active !== 0)
          .map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
          }))
          .sort((a, b) => {
            const aIsAddon = ADDON_NAME_PATTERN.test(a.name);
            const bIsAddon = ADDON_NAME_PATTERN.test(b.name);
            if (aIsAddon !== bIsAddon) return aIsAddon ? 1 : -1;
            return a.price - b.price;
          }),
      }))
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
