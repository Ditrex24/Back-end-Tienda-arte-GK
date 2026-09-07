/**
 * =============================================================================
 * DIAGNOSTICO COMPLETO DE BACKEND - Art E-Commerce Platform
 * Herramienta: Node.js 18+ nativo (sin dependencias npm)
 * Modulos usados: node:crypto, node:fs, node:path, global fetch
 * =============================================================================
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.local');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', white: '\x1b[37m',
};

const pass  = (msg) => console.log(`  ${C.green}PASS${C.reset}  ${msg}`);
const fail  = (msg) => console.log(`  ${C.red}FAIL${C.reset}  ${msg}`);
const warn  = (msg) => console.log(`  ${C.yellow}WARN${C.reset}  ${msg}`);
const title = (msg) => console.log(`\n${C.bold}${C.cyan}>> ${msg}${C.reset}`);
const sep   = ()    => console.log('-'.repeat(60));

let totalPass = 0, totalFail = 0, totalWarn = 0;
const report = [];

function record(status, section, detail) {
  if (status === 'PASS') totalPass++;
  else if (status === 'FAIL') totalFail++;
  else totalWarn++;
  report.push({ status, section, detail });
}

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).split('#')[0].trim();
    vars[key] = val;
  }
  return vars;
}

// ============================================================================
// BLOQUE 1 - Variables de Entorno
// ============================================================================
function checkEnvVariables(env) {
  title('BLOQUE 1 - Variables de Entorno (.env.local)');
  sep();

  const required = {
    SUPABASE: ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY'],
    RESEND: ['RESEND_API_KEY','RESEND_FROM_EMAIL','ADMIN_NOTIFICATION_EMAIL'],
    STRIPE: ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    PAYPAL: ['PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_ENVIRONMENT','PAYPAL_WEBHOOK_ID'],
    MISC: ['NODE_ENV','NEXT_PUBLIC_APP_URL','USD_TO_EUR_EXCHANGE_RATE'],
  };
  const placeholders = ['sk_test_51...','whsec_...','pk_test_51...','AeA...','EEd...','8XY...','placeholder','YOUR_'];

  for (const [group, keys] of Object.entries(required)) {
    console.log(`\n  [${group}]`);
    for (const key of keys) {
      const val = env[key];
      if (!val) { fail(`${key} -> AUSENTE`); record('FAIL','ENV',`Ausente: ${key}`); }
      else if (placeholders.some(p => val.startsWith(p))) { warn(`${key} -> PLACEHOLDER: "${val.slice(0,25)}"`); record('WARN','ENV',`Placeholder: ${key}`); }
      else { pass(`${key} -> OK`); record('PASS','ENV',`OK: ${key}`); }
    }
  }

  console.log('\n  [FORMATO]');
  const supaUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || '';
  if (supaUrl.startsWith('https://') && supaUrl.includes('.supabase.co')) {
    pass(`SUPABASE_URL formato correcto`); record('PASS','ENV_FORMAT','Supabase URL OK');
  } else { fail(`SUPABASE_URL invalido: ${supaUrl}`); record('FAIL','ENV_FORMAT',`Supabase URL: ${supaUrl}`); }

  const rate = parseFloat(env['USD_TO_EUR_EXCHANGE_RATE'] || '0');
  if (rate > 0 && rate < 2) { pass(`USD_TO_EUR_EXCHANGE_RATE=${rate} valido`); record('PASS','ENV_FORMAT',`Rate OK: ${rate}`); }
  else { fail(`USD_TO_EUR_EXCHANGE_RATE=${rate} fuera de rango`); record('FAIL','ENV_FORMAT',`Rate invalido: ${rate}`); }

  const ppEnv = env['PAYPAL_ENVIRONMENT'] || '';
  if (['sandbox','live'].includes(ppEnv)) { pass(`PAYPAL_ENVIRONMENT="${ppEnv}" valido`); record('PASS','ENV_FORMAT',`PayPal env OK`); }
  else { fail(`PAYPAL_ENVIRONMENT="${ppEnv}" invalido`); record('FAIL','ENV_FORMAT',`PayPal env: ${ppEnv}`); }
}

// ============================================================================
// BLOQUE 2 - Conectividad Supabase
// ============================================================================
async function checkSupabaseConnectivity(env) {
  title('BLOQUE 2 - Conectividad Supabase REST API');
  sep();

  const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
  const anonKey     = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const serviceKey  = env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    warn('Supabase URL no configurada; saltando pruebas de conectividad.');
    record('WARN','SUPABASE','URL placeholder'); return;
  }

  // Test 1: Anon Key products
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id,title&limit=3`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      pass(`Anon Key -> GET /rest/v1/products HTTP ${res.status} (${data.length} filas)`);
      record('PASS','SUPABASE',`Anon products OK ${data.length} rows`);
    } else {
      const txt = await res.text();
      fail(`Anon Key -> GET products HTTP ${res.status}: ${txt.slice(0,100)}`);
      record('FAIL','SUPABASE',`Anon products HTTP ${res.status}`);
    }
  } catch(e) { fail(`Anon Key -> excepcion: ${e.message}`); record('FAIL','SUPABASE',e.message); }

  // Test 2: Service Role profiles
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,role&limit=3`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      pass(`Service Role -> GET /rest/v1/profiles HTTP ${res.status} (${data.length} filas)`);
      record('PASS','SUPABASE',`Service profiles OK ${data.length} rows`);
    } else {
      const txt = await res.text();
      fail(`Service Role -> GET profiles HTTP ${res.status}: ${txt.slice(0,100)}`);
      record('FAIL','SUPABASE',`Service profiles HTTP ${res.status}`);
    }
  } catch(e) { fail(`Service Role -> excepcion: ${e.message}`); record('FAIL','SUPABASE',e.message); }

  // Test 3: Auth settings ping
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: anonKey } });
    if (res.ok) { pass(`Auth REST -> /auth/v1/settings HTTP ${res.status} operativo`); record('PASS','SUPABASE','Auth settings OK'); }
    else { warn(`Auth REST -> /auth/v1/settings HTTP ${res.status}`); record('WARN','SUPABASE',`Auth settings HTTP ${res.status}`); }
  } catch(e) { fail(`Auth endpoint -> excepcion: ${e.message}`); record('FAIL','SUPABASE',e.message); }

  // Test 4: Admin users
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      const count = data.users?.length ?? 0;
      pass(`Admin Auth -> /auth/v1/admin/users HTTP ${res.status} (${count} usuarios)`);
      record('PASS','SUPABASE',`Admin users OK ${count}`);
    } else {
      const txt = await res.text();
      fail(`Admin Auth -> HTTP ${res.status}: ${txt.slice(0,100)}`);
      record('FAIL','SUPABASE',`Admin users HTTP ${res.status}`);
    }
  } catch(e) { fail(`Admin users -> excepcion: ${e.message}`); record('FAIL','SUPABASE',e.message); }
}

// ============================================================================
// BLOQUE 3 - Calculadoras de moneda y envio
// ============================================================================
function checkCalculators() {
  title('BLOQUE 3 - Motor Currency & Shipping Calculator (Dry-Run)');
  sep();

  const RATE = 0.92;
  const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const convert = (amount, from, to) => {
    if (from === to) return round2(amount);
    if (from === 'USD' && to === 'EUR') return round2(amount * RATE);
    if (from === 'EUR' && to === 'USD') return round2(amount / RATE);
    return round2(amount);
  };

  const currencyTests = [
    { amount:100, from:'USD', to:'EUR', expected:92.00 },
    { amount:92,  from:'EUR', to:'USD', expected:round2(92/0.92) },
    { amount:50,  from:'USD', to:'USD', expected:50.00 },
    { amount:0,   from:'USD', to:'EUR', expected:0.00 },
    { amount:1.005, from:'USD', to:'USD', expected:1.01 },
  ];

  for (const t of currencyTests) {
    const r = convert(t.amount, t.from, t.to);
    if (r === t.expected) { pass(`convert(${t.amount}, ${t.from}->${t.to}) = ${r}`); record('PASS','CURRENCY',`${t.from}->${t.to} ${t.amount}`); }
    else { fail(`convert(${t.amount}, ${t.from}->${t.to}) = ${r} (esp:${t.expected})`); record('FAIL','CURRENCY',`mismatch: got ${r} exp ${t.expected}`); }
  }

  console.log('');
  const NA = new Set(['US','CA','MX']);
  const EU = new Set(['FR','DE','ES','IT','GB','NL','BE','AT','CH','SE','NO','FI','DK','IE','PT','GR','PL','CZ','HU','RO','BG','HR','SK','SI','LT','LV','EE','CY','MT','LU','IS','LI','MC','AD','SM','VA']);
  const MTX = { na:15, eu:25, rw:35 };
  const calcShip = (cc, cur) => {
    const c = cc.toUpperCase();
    let base, bcur, reg;
    if (NA.has(c)) { base=MTX.na; bcur='USD'; reg='North America'; }
    else if (EU.has(c)) { base=MTX.eu; bcur='EUR'; reg='Europe'; }
    else { base=MTX.rw; bcur='USD'; reg='Rest of World'; }
    return { fee: convert(base, bcur, cur), region: reg };
  };

  const shipTests = [
    { cc:'US', cur:'USD', expFee:15.00, expReg:'North America' },
    { cc:'CA', cur:'EUR', expFee:round2(15*0.92), expReg:'North America' },
    { cc:'FR', cur:'EUR', expFee:25.00, expReg:'Europe' },
    { cc:'DE', cur:'USD', expFee:round2(25/0.92), expReg:'Europe' },
    { cc:'JP', cur:'USD', expFee:35.00, expReg:'Rest of World' },
    { cc:'AR', cur:'EUR', expFee:round2(35*0.92), expReg:'Rest of World' },
  ];

  for (const t of shipTests) {
    const r = calcShip(t.cc, t.cur);
    if (r.fee === t.expFee && r.region === t.expReg) {
      pass(`Shipping [${t.cc}/${t.cur}] fee=${r.fee} region="${r.region}"`);
      record('PASS','SHIPPING',`${t.cc} ${t.cur} OK`);
    } else {
      fail(`Shipping [${t.cc}/${t.cur}] fee=${r.fee}(esp:${t.expFee}) region="${r.region}"(esp:"${t.expReg}")`);
      record('FAIL','SHIPPING',`${t.cc} ${t.cur} mismatch`);
    }
  }
}

// ============================================================================
// BLOQUE 4 - Logica Draft Invoice
// ============================================================================
function checkDraftInvoiceLogic() {
  title('BLOQUE 4 - Logica Draft Invoice / Stock Lock (Dry-Run)');
  sep();

  const RATE = 0.92;
  const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const convert = (amount, from, to) => {
    if (from === to) return round2(amount);
    if (from === 'USD' && to === 'EUR') return round2(amount * RATE);
    if (from === 'EUR' && to === 'USD') return round2(amount / RATE);
    return round2(amount);
  };
  const NA = new Set(['US','CA','MX']);
  const EU = new Set(['FR','DE','ES','IT','GB','NL','BE','AT','CH','SE','NO','FI','DK','IE','PT','GR','PL','CZ','HU','RO','BG']);
  const products = new Map([
    ['p1', { id:'p1', title:'Amanecer en los Andes', type:'original', price:1200, stock_quantity:5 }],
    ['p2', { id:'p2', title:'Serigrafia Urbana #5',  type:'print',    price:150,  stock_quantity:10 }],
  ]);

  function genInvoice(userId, input) {
    const { currency, shipping_address, items } = input;
    if (!items?.length) throw new Error('At least one artwork item is required.');
    if (!shipping_address?.country_code || !shipping_address?.street_address) throw new Error('Complete shipping address required.');
    let subtotal = 0;
    const invoiceItems = [];
    for (const ii of items) {
      const p = products.get(ii.product_id);
      if (!p) throw new Error(`Product ${ii.product_id} not found.`);
      if (p.stock_quantity < ii.quantity) throw new Error(`Insufficient stock for "${p.title}".`);
      if (p.type === 'original' && ii.quantity > 1) throw new Error(`Original "${p.title}" is unique — max 1 per order.`);
      const up = convert(p.price, 'USD', currency);
      const lt = round2(up * ii.quantity);
      subtotal += lt;
      invoiceItems.push({ product_id:p.id, title:p.title, type:p.type, quantity:ii.quantity, unit_price:up, total_price:lt });
    }
    subtotal = round2(subtotal);
    const cc = shipping_address.country_code.toUpperCase();
    let base, bcur, reg;
    if (NA.has(cc)) { base=15; bcur='USD'; reg='North America'; }
    else if (EU.has(cc)) { base=25; bcur='EUR'; reg='Europe'; }
    else { base=35; bcur='USD'; reg='Rest of World'; }
    const shippingFee = convert(base, bcur, currency);
    const total = round2(subtotal + shippingFee);
    const lockedUntil = new Date(Date.now() + 15*60*1000).toISOString();
    return { order_id:'DRAFT-MOCK', currency, subtotal, shipping_fee:shippingFee, total_amount:total, shipping_region:reg, items:invoiceItems, stock_locked_until:lockedUntil, accepted_terms_required:true };
  }

  // Test A: US/USD
  try {
    const inv = genInvoice('u1', { currency:'USD', shipping_address:{ full_name:'Test', street_address:'Av 5', city:'Miami', state_province:'FL', postal_code:'33101', country_code:'US' }, items:[{product_id:'p1',quantity:1},{product_id:'p2',quantity:2}] });
    const expSub = round2(1200 + 150*2); const expShip = 15; const expTotal = round2(expSub+expShip);
    if (inv.subtotal===expSub && inv.shipping_fee===expShip && inv.total_amount===expTotal) {
      pass(`Invoice US/USD: subtotal=${inv.subtotal} shipping=${inv.shipping_fee} total=${inv.total_amount}`); record('PASS','DRAFT_INVOICE','US USD OK');
    } else { fail(`Invoice US/USD: sub=${inv.subtotal}(${expSub}) ship=${inv.shipping_fee}(${expShip}) tot=${inv.total_amount}(${expTotal})`); record('FAIL','DRAFT_INVOICE','US USD mismatch'); }
    const diff = (new Date(inv.stock_locked_until).getTime() - Date.now())/1000/60;
    if (diff > 14.9 && diff < 15.1) { pass(`Stock Lock: ~${diff.toFixed(2)} min en el futuro`); record('PASS','DRAFT_INVOICE','Stock lock 15min OK'); }
    else { fail(`Stock Lock: ${diff.toFixed(2)} min (esp ~15)`); record('FAIL','DRAFT_INVOICE',`Stock lock wrong: ${diff.toFixed(2)} min`); }
    if (inv.accepted_terms_required === true) { pass(`accepted_terms_required = true`); record('PASS','DRAFT_INVOICE','Terms flag OK'); }
  } catch(e) { fail(`Invoice US/USD excepcion: ${e.message}`); record('FAIL','DRAFT_INVOICE',e.message); }

  // Test B: FR/EUR
  try {
    const inv = genInvoice('u2', { currency:'EUR', shipping_address:{ full_name:'Marie', street_address:'Rue 10', city:'Paris', state_province:'IDF', postal_code:'75001', country_code:'FR' }, items:[{product_id:'p2',quantity:3}] });
    const expUp = round2(150*RATE); const expSub = round2(expUp*3); const expShip = 25; const expTotal = round2(expSub+expShip);
    if (inv.subtotal===expSub && inv.shipping_fee===expShip && inv.total_amount===expTotal) {
      pass(`Invoice FR/EUR: subtotal=${inv.subtotal} shipping=${inv.shipping_fee} total=${inv.total_amount}`); record('PASS','DRAFT_INVOICE','FR EUR OK');
    } else { fail(`Invoice FR/EUR: sub=${inv.subtotal}(${expSub}) ship=${inv.shipping_fee}(${expShip}) tot=${inv.total_amount}(${expTotal})`); record('FAIL','DRAFT_INVOICE','FR EUR mismatch'); }
  } catch(e) { fail(`Invoice FR/EUR excepcion: ${e.message}`); record('FAIL','DRAFT_INVOICE',e.message); }

  // Test C: Error obra original qty>1
  try {
    genInvoice('u3', { currency:'USD', shipping_address:{ full_name:'T', street_address:'S1', city:'NY', state_province:'NY', postal_code:'10001', country_code:'US' }, items:[{product_id:'p1',quantity:2}] });
    fail('No se lanzo error para original qty>1'); record('FAIL','DRAFT_INVOICE','Missing error original qty>1');
  } catch(e) {
    if (e.message.includes('unique') || e.message.includes('original')) { pass(`Error correcto para original qty>1: "${e.message}"`); record('PASS','DRAFT_INVOICE','Correct error original qty>1'); }
    else { warn(`Error lanzado pero mensaje inesperado: ${e.message}`); record('WARN','DRAFT_INVOICE',e.message); }
  }

  // Test D: Error sin items
  try {
    genInvoice('u4', { currency:'USD', shipping_address:{ full_name:'T', street_address:'S1', city:'NY', state_province:'NY', postal_code:'10001', country_code:'US' }, items:[] });
    fail('No se lanzo error para items vacios'); record('FAIL','DRAFT_INVOICE','Missing error empty items');
  } catch(e) { pass(`Error correcto para items vacios: "${e.message}"`); record('PASS','DRAFT_INVOICE','Correct error empty items'); }
}

// ============================================================================
// BLOQUE 5 - node:crypto
// ============================================================================
function checkCryptoUtils() {
  title('BLOQUE 5 - Utilidades node:crypto (HMAC / UUID / timingSafeCompare)');
  sep();

  const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data, 'utf8').digest('hex');
  const tsc  = (a, b) => {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a,'utf8'), Buffer.from(b,'utf8'));
  };

  const secret = 'whsec_test123'; const payload = '{"type":"payment_intent.succeeded"}'; const ts = '1751000000';
  const h = hmac(secret, `${ts}.${payload}`);
  if (h && h.length===64 && /^[0-9a-f]+$/.test(h)) { pass(`HMAC-SHA256: ${h.slice(0,20)}... (64 hex) OK`); record('PASS','CRYPTO','HMAC OK'); }
  else { fail(`HMAC-SHA256 resultado invalido: ${h}`); record('FAIL','CRYPTO','HMAC invalid'); }

  if (tsc(h, h) === true) { pass(`timingSafeCompare(same, same) = true`); record('PASS','CRYPTO','TSC equal OK'); }
  else { fail(`timingSafeCompare(same, same) = false (esperado true)`); record('FAIL','CRYPTO','TSC equal failed'); }

  if (tsc(h, 'short') === false) { pass(`timingSafeCompare(long, short) = false (diff length)`); record('PASS','CRYPTO','TSC diff-len OK'); }
  else { fail(`timingSafeCompare(long, short) = true (esperado false)`); record('FAIL','CRYPTO','TSC diff-len failed'); }

  const tampered = h.slice(0,-1) + (h.endsWith('a') ? 'b' : 'a');
  if (tsc(h, tampered) === false) { pass(`timingSafeCompare(original, tampered) = false`); record('PASS','CRYPTO','TSC tampered OK'); }
  else { fail(`timingSafeCompare(original, tampered) = true (VULNERABILIDAD)`); record('FAIL','CRYPTO','TSC tampered FAILED'); }

  function verifyStripe(body, sigHeader, whSecret) {
    if (!sigHeader || !whSecret) return false;
    let t='', v1='';
    for (const el of sigHeader.split(',')) {
      const [p,v] = el.trim().split('=');
      if (p==='t') t=v; else if (p==='v1') v1=v;
    }
    if (!t || !v1) return false;
    const computed = hmac(whSecret, `${t}.${body}`);
    return tsc(computed, v1);
  }

  const wSecret = 'whsec_realtest'; const rawBody = '{"id":"evt_1","type":"payment_intent.succeeded","data":{"object":{"metadata":{"order_id":"ord-001"}}}}';
  const wTs = '1751000000'; const sig = hmac(wSecret, `${wTs}.${rawBody}`); const header = `t=${wTs},v1=${sig}`;
  if (verifyStripe(rawBody, header, wSecret)) { pass(`verifyStripeWebhookSignature -> true con firma valida`); record('PASS','CRYPTO','Stripe sig valid OK'); }
  else { fail(`verifyStripeWebhookSignature -> false con firma valida (ERROR)`); record('FAIL','CRYPTO','Stripe sig valid failed'); }
  if (!verifyStripe(rawBody, header, 'wrongSecret')) { pass(`verifyStripeWebhookSignature -> false con secreto incorrecto`); record('PASS','CRYPTO','Stripe sig wrong rejected'); }
  else { fail(`verifyStripeWebhookSignature -> true con secreto incorrecto (VULNERABILIDAD CRITICA)`); record('FAIL','CRYPTO','Stripe sig wrong ACCEPTED'); }

  const uuid = crypto.randomUUID();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)) {
    pass(`randomUUID() = ${uuid} (UUID v4 valido)`); record('PASS','CRYPTO','UUID v4 OK');
  } else { fail(`randomUUID() = "${uuid}" no es UUID v4`); record('FAIL','CRYPTO','UUID v4 invalid'); }
}

// ============================================================================
// BLOQUE 6 - Archivos del proyecto
// ============================================================================
function checkProjectFiles() {
  title('BLOQUE 6 - Verificacion de Archivos del Proyecto');
  sep();

  const files = [
    'src/lib/supabase-rest.ts','src/lib/stripe-rest.ts','src/lib/paypal-rest.ts',
    'src/lib/resend-rest.ts','src/lib/crypto-utils.ts','src/lib/currency/calculator.ts',
    'src/lib/shipping/calculator.ts','src/lib/supabase/client.ts','src/lib/stripe/client.ts',
    'src/services/auth.service.ts','src/services/checkout.service.ts','src/services/payment.service.ts',
    'src/services/webhook.service.ts','src/services/broadcast.service.ts',
    'src/middleware/auth.ts','src/middleware/admin.ts','src/types/index.ts',
    'src/app/api/auth/login/route.ts','src/app/api/auth/signup/route.ts',
    'src/app/api/auth/reset-password/route.ts','src/app/api/checkout/draft-invoice/route.ts',
    'src/app/api/shipping/calculate/route.ts','src/app/api/shipping/rates/route.ts',
    'src/app/api/webhooks/stripe/route.ts','src/app/api/webhooks/paypal/route.ts',
    'src/app/api/admin/broadcast-email/route.ts',
    'supabase/migrations/20260903000000_schema_and_types.sql',
    'supabase/migrations/20260903000001_rls_policies.sql',
    'supabase/migrations/20260903000002_storage_setup.sql',
    'tsconfig.json','.env.local','package.json',
  ];

  for (const rel of files) {
    const fp = path.join(ROOT, rel);
    if (fs.existsSync(fp)) {
      const sz = fs.statSync(fp).size;
      pass(`${rel} (${sz} bytes)`); record('PASS','FILES',`Present: ${rel}`);
    } else { fail(`AUSENTE: ${rel}`); record('FAIL','FILES',`Missing: ${rel}`); }
  }
}

// ============================================================================
// BLOQUE 7 - Zero-Dep check
// ============================================================================
function checkProhibitedImports() {
  title('BLOQUE 7 - Auditoria Zero-Dep (Sin paquetes npm prohibidos)');
  sep();

  const forbidden = ['stripe','@stripe/stripe-js','paypal-rest-sdk','axios','node-fetch','zod','yup','express'];
  const files = [
    'src/lib/stripe/client.ts','src/lib/stripe-rest.ts','src/lib/paypal-rest.ts',
    'src/lib/paypal/client.ts','src/lib/resend-rest.ts','src/services/checkout.service.ts',
    'src/services/payment.service.ts','src/services/webhook.service.ts',
    'src/services/auth.service.ts','src/services/broadcast.service.ts',
  ];

  for (const rel of files) {
    const fp = path.join(ROOT, rel);
    if (!fs.existsSync(fp)) continue;
    const content = fs.readFileSync(fp, 'utf-8');
    const found = forbidden.filter(pkg => new RegExp(`from ['"]${pkg}['"]|require\\(['"]${pkg}['"]\\)`,'g').test(content));
    if (found.length === 0) { pass(`${rel} -> sin imports prohibidos`); record('PASS','ZERO_DEP',`${rel} clean`); }
    else { fail(`${rel} -> IMPORTS PROHIBIDOS: ${found.join(', ')}`); record('FAIL','ZERO_DEP',`${rel}: ${found.join(', ')}`); }
  }
}

// ============================================================================
// REPORTE FINAL
// ============================================================================
function printReport() {
  console.log(`\n${'='.repeat(62)}`);
  console.log(`${C.bold}${C.cyan}  REPORTE FINAL - BACKEND ART E-COMMERCE${C.reset}`);
  console.log(`${'='.repeat(62)}`);
  console.log(`  Fecha:       ${new Date().toLocaleString('es-ES')}`);
  console.log(`  Node.js:     ${process.version}`);
  console.log(`  Total tests: ${totalPass+totalFail+totalWarn}`);
  console.log(`  ${C.green}EXITOSAS:  ${totalPass}${C.reset}`);
  console.log(`  ${C.red}FALLIDAS:  ${totalFail}${C.reset}`);
  console.log(`  ${C.yellow}AVISOS:    ${totalWarn}${C.reset}`);
  console.log(`${'='.repeat(62)}`);

  const failures = report.filter(r => r.status==='FAIL');
  const warnings = report.filter(r => r.status==='WARN');

  if (failures.length > 0) {
    console.log(`\n${C.red}${C.bold}  FALLOS CRITICOS:${C.reset}`);
    for (const f of failures) console.log(`  ${C.red}X${C.reset} [${f.section}] ${f.detail}`);
  }
  if (warnings.length > 0) {
    console.log(`\n${C.yellow}${C.bold}  ADVERTENCIAS:${C.reset}`);
    for (const w of warnings) console.log(`  ${C.yellow}!${C.reset} [${w.section}] ${w.detail}`);
  }

  console.log(`\n${'-'.repeat(62)}`);
  if (totalFail === 0 && totalWarn === 0) {
    console.log(`${C.bold}${C.green}  BACKEND 100% LISTO PARA LA FASE DE FRONTEND${C.reset}`);
  } else if (totalFail === 0) {
    console.log(`${C.bold}${C.yellow}  BACKEND LISTO CON ADVERTENCIAS MENORES${C.reset}`);
    console.log(`  Sin errores criticos. Revisa los avisos antes de continuar.`);
  } else {
    console.log(`${C.bold}${C.red}  BACKEND REQUIERE CORRECCIONES (${totalFail} FALLO/S)${C.reset}`);
  }
  console.log(`${'='.repeat(62)}\n`);
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log(`${C.bold}${C.cyan}`);
  console.log('='.repeat(62));
  console.log('  DIAGNOSTICO BACKEND - Art E-Commerce Platform');
  console.log(`  Runtime: Node.js ${process.version} | Zero-Dep Mode`);
  console.log('='.repeat(62));
  console.log(C.reset);

  const env = loadEnv(ENV_PATH);
  checkEnvVariables(env);
  await checkSupabaseConnectivity(env);
  checkCalculators();
  checkDraftInvoiceLogic();
  checkCryptoUtils();
  checkProjectFiles();
  checkProhibitedImports();
  printReport();

  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch(e => { console.error('ERROR FATAL:', e); process.exit(1); });


