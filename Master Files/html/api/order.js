const FLOCAFE_API_URL = process.env.FLOCAFE_API_URL;
const FLOCAFE_STAFF_EMAIL = process.env.FLOCAFE_STAFF_EMAIL;
const FLOCAFE_STAFF_PASSWORD = process.env.FLOCAFE_STAFF_PASSWORD;
const DELIVERY_FEE = Number(process.env.FLOCAFE_DELIVERY_FEE || 0);

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

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined && req.body !== null) {
      try {
        resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
      } catch (err) {
        reject(err);
      }
      return;
    }
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function findOrCreateCustomer(authHeaders, { name, phone, address }) {
  const createRes = await fetch(`${FLOCAFE_API_URL}/api/customers`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name, phone, address }),
  });

  if (createRes.ok) {
    const { customer } = await createRes.json();
    return customer.id;
  }

  if (createRes.status === 409) {
    // FloCafe matches ?search= against phone_digits (digits only, no "+" or
    // spaces) - searching with the raw "+49 176 ..." string never matched
    // anything, so the 409 fallback always fell through to the error below.
    const phoneDigits = phone.replace(/\D/g, '');
    const searchRes = await fetch(`${FLOCAFE_API_URL}/api/customers?search=${encodeURIComponent(phoneDigits)}`, {
      headers: authHeaders,
    });
    if (searchRes.ok) {
      const searchBody = await searchRes.json();
      const matches = searchBody.data || searchBody.customers;
      if (matches && matches.length > 0) {
        return matches[0].id;
      }
    }
  }

  const errBody = await createRes.text();
  throw new Error(`FloCafe customer lookup failed (${createRes.status}): ${errBody}`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!FLOCAFE_API_URL || !FLOCAFE_STAFF_EMAIL || !FLOCAFE_STAFF_PASSWORD) {
    res.status(503).json({ error: 'Online ordering is not configured yet' });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { name, phone, address, type, notes, items } = body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }
  if (type !== 'takeaway' && type !== 'delivery') {
    res.status(400).json({ error: 'Order type must be takeaway or delivery' });
    return;
  }
  if (type === 'delivery' && (!address || !String(address).trim())) {
    res.status(400).json({ error: 'Delivery address is required' });
    return;
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }
  for (const item of items) {
    if (!item || typeof item.product_id !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
      res.status(400).json({ error: 'Invalid item in cart' });
      return;
    }
  }

  try {
    const token = await getToken();
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const customerId = await findOrCreateCustomer(authHeaders, {
      name: name.trim(),
      phone: phone.trim(),
      address: type === 'delivery' ? String(address).trim() : undefined,
    });

    const orderPayload = {
      type,
      customer_id: customerId,
      special_instructions: notes ? String(notes).trim().slice(0, 500) : undefined,
      items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
    };
    if (type === 'delivery' && DELIVERY_FEE > 0) {
      orderPayload.delivery_charge = DELIVERY_FEE;
    }

    const orderRes = await fetch(`${FLOCAFE_API_URL}/api/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      throw new Error(`FloCafe order create failed (${orderRes.status}): ${errBody}`);
    }

    const { order } = await orderRes.json();

    res.status(201).json({ order_number: order ? order.order_number : null });
  } catch (err) {
    console.error('[api/order] submit error:', err.message);
    res.status(502).json({ error: 'Could not submit the order right now. Please call the restaurant.' });
  }
};
