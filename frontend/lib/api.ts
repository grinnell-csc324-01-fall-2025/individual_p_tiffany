export async function apiFetch(path: string, init?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_API_BASE || '/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = { 'Content-Type': 'application/json', ...(init?.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // normalize path: avoid backend/proxy redirects caused by trailing slashes
  let p = path;
  if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
  const url = base + p;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err: any) {
    // Network error (DNS, refused connection, CORS preflight failure, mixed content, etc.)
    const msg = err?.message || String(err);
    throw new Error(`Network error fetching ${url}: ${msg}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status} ${res.statusText} when fetching ${url}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}
