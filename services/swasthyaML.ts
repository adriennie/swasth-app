// services/swasthyaML.ts
// FIXED: UUID → ML ID mapping so real pharmacy logins work with the model

import { supabase } from '@/lib/supabase';

const ML_API = 'https://074hc0y3ta.execute-api.ap-south-1.amazonaws.com/default';

// ─────────────────────────────────────────────────────────────────────────────
// UUID → ML ID MAPPING
// Problem: ML model trained on PH_01–PH_15 / SKU_001–SKU_020
// Problem: Supabase uses UUIDs like cd68f3f3-4786-41e5-81e7-45b3bd5981fc
// Fix:     Map UUIDs → ML format IDs before every API call
// ─────────────────────────────────────────────────────────────────────────────

// In-memory cache so we don't hit Supabase on every call
const mlPharmacyCache: Record<string, string> = {};
const mlSkuCache:      Record<string, string> = {};

/**
 * Gets ML-format pharmacy ID (e.g. "PH_01") for a Supabase user UUID.
 * First tries ml_id column in pharmacy_profiles (Option 1 from your friend).
 * Falls back to deterministic mapping if column doesn't exist yet (Option 2).
 */
export async function getMLPharmacyId(supabaseUserId: string): Promise<string> {
  if (!supabaseUserId) return 'PH_01';
  if (mlPharmacyCache[supabaseUserId]) return mlPharmacyCache[supabaseUserId];

  try {
    const { data } = await supabase
      .from('pharmacy_profiles')
      .select('id, ml_id')
      .eq('user_id', supabaseUserId)
      .single();

    // If ml_id column exists and has a value — use it directly
    if (data?.ml_id) {
      mlPharmacyCache[supabaseUserId] = data.ml_id;
      return data.ml_id;
    }

    // Otherwise — deterministic fallback using profile row hash → PH_01 to PH_15
    if (data?.id) {
      const num  = (parseInt(data.id.replace(/-/g, '').slice(-4), 16) % 15) + 1;
      const mlId = `PH_${String(num).padStart(2, '0')}`;
      mlPharmacyCache[supabaseUserId] = mlId;
      return mlId;
    }
  } catch (_) {}

  mlPharmacyCache[supabaseUserId] = 'PH_01';
  return 'PH_01';
}

/**
 * Gets ML-format SKU ID (e.g. "SKU_004") for a product UUID.
 * If the SKU is already in SKU_XXX format, use it directly.
 * Otherwise maps product position to SKU_001–SKU_020.
 */
export async function getMLSkuId(productId: string, sku?: string): Promise<string> {
  if (!productId) return 'SKU_001';
  if (mlSkuCache[productId]) return mlSkuCache[productId];

  // Already in correct format
  if (sku && /^SKU_\d+$/.test(sku)) {
    mlSkuCache[productId] = sku;
    return sku;
  }

  try {
    const { data } = await supabase
      .from('products')
      .select('id')
      .order('created_at', { ascending: true });

    if (data) {
      const idx   = data.findIndex(p => p.id === productId);
      const mlSku = `SKU_${String(((idx < 0 ? 0 : idx) % 20) + 1).padStart(3, '0')}`;
      mlSkuCache[productId] = mlSku;
      return mlSku;
    }
  } catch (_) {}

  mlSkuCache[productId] = 'SKU_001';
  return 'SKU_001';
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ForecastResult {
  pharmacy_id: string;
  sku_id: string;
  daily_pred: number;
  forecast_7d: number;
  current_stock: number;
  reorder_qty: number;
  should_order: boolean;
  days_until_stockout: number;
  urgency: 'CRITICAL — Out of Stock' | 'URGENT — < 2 days' | 'HIGH — < 5 days' | 'MEDIUM — Order Soon' | 'OK';
  order_value: number;
}

export interface AnomalyResult {
  pharmacy_id: string;
  sku_id: string;
  order_qty: number;
  normal_avg: number;
  qty_vs_mean: number;
  qty_zscore: number;
  is_anomaly: boolean;
  iso_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NONE';
  alert: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1 — Demand Forecast + Reorder Suggestion
// Usage: pharmacy/dashboard.tsx, pharmacy/inventory.tsx
// ─────────────────────────────────────────────────────────────────────────────

export async function getDemandForecast(params: {
  supabaseUserId: string;  // auth.id from AuthContext — UUID
  productId: string;       // product row UUID
  productSku?: string;     // e.g. "SP-RP-001" or "SKU_004"
  currentStock: number;
  unitPrice: number;
  salesLast1d:  number;
  salesLast7d:  number;
  salesLast14d: number;
  salesLast28d: number;
  salesLast91d: number;
  cityTier?: number;
}): Promise<ForecastResult | null> {
  try {
    // ✅ KEY FIX: convert UUIDs to ML training format BEFORE calling API
    const mlPharmacyId = await getMLPharmacyId(params.supabaseUserId);
    const mlSkuId      = await getMLSkuId(params.productId, params.productSku);

    const now        = new Date();
    const dow        = now.getDay();
    const doy        = getDayOfYear(now);
    const month      = now.getMonth() + 1;
    const quarter    = Math.ceil(month / 3);
    const roll7Mean  = params.salesLast7d  / 7  || 1;
    const roll14Mean = params.salesLast14d / 14 || 1;
    const roll30Mean = params.salesLast28d / 28 || 1;
    const roll90Mean = params.salesLast91d / 91 || 1;
    const roll60Mean = roll30Mean * 0.95;

    const res = await fetch(`${ML_API}/forecast`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pharmacy_id:   mlPharmacyId,  // "PH_01" ✅
        sku_id:        mlSkuId,       // "SKU_004" ✅
        current_stock: params.currentStock,
        unit_price:    params.unitPrice,

        lag_1:  params.salesLast1d,
        lag_7:  roll7Mean,
        lag_14: roll14Mean,
        lag_28: roll30Mean,
        lag_91: roll90Mean,

        roll_7_mean:  roll7Mean,
        roll_7_std:   roll7Mean * 0.2,
        roll_14_mean: roll14Mean,
        roll_30_mean: roll30Mean,
        roll_60_mean: roll60Mean,
        roll_90_mean: roll90Mean,

        trend_7_vs_30:  roll7Mean  / (roll30Mean + 1e-6),
        trend_14_vs_60: roll14Mean / (roll60Mean + 1e-6),
        trend_30_vs_90: roll30Mean / (roll90Mean + 1e-6),

        sin_dow:   Math.sin(2 * Math.PI * dow   / 7),
        cos_dow:   Math.cos(2 * Math.PI * dow   / 7),
        sin_doy:   Math.sin(2 * Math.PI * doy   / 365),
        cos_doy:   Math.cos(2 * Math.PI * doy   / 365),
        sin_month: Math.sin(2 * Math.PI * month / 12),
        cos_month: Math.cos(2 * Math.PI * month / 12),

        month,   quarter,
        city_tier:    params.cityTier ?? 1,
        is_weekend:   dow === 0 || dow === 6 ? 1 : 0,
        is_mhd_window: isInMHDWindow(now) ? 1 : 0,
        is_ngo_season: month === 1 || month === 8 ? 1 : 0,
        is_monsoon:    month >= 6 && month <= 9 ? 1 : 0,

        // Numeric codes derived from ML IDs
        ph_code:  parseInt(mlPharmacyId.replace('PH_', ''))  || 1,
        sku_code: parseInt(mlSkuId.replace('SKU_', ''))       || 1,
        city_code: 0,
        cat_code:  0,
      }),
    });

    const data = await res.json();
    if (data.error) { console.error('Forecast API:', data.error); return null; }
    return data as ForecastResult;

  } catch (e) {
    console.error('getDemandForecast:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2 — Anomaly Detection
// Usage: admin/orders.tsx — when admin reviews a pending order
// ─────────────────────────────────────────────────────────────────────────────

export async function detectOrderAnomaly(order: {
  supabasePharmacyId: string;  // pharmacy user_id UUID from orders table
  productId: string;           // product UUID from order_items
  productSku?: string;
  order_qty:   number;
  order_value: number;
}): Promise<AnomalyResult | null> {
  try {
    // ✅ KEY FIX: convert UUIDs to ML training format BEFORE calling API
    const mlPharmacyId = await getMLPharmacyId(order.supabasePharmacyId);
    const mlSkuId      = await getMLSkuId(order.productId, order.productSku);

    const now   = new Date();
    const month = now.getMonth() + 1;

    const res = await fetch(`${ML_API}/detect-anomaly`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pharmacy_id: mlPharmacyId,  // "PH_01" ✅
        sku_id:      mlSkuId,       // "SKU_004" ✅
        order_qty:      order.order_qty,
        order_value:    order.order_value,
        order_month:    month,
        order_dow:      now.getDay(),
        is_month_start: now.getDate() <= 7 ? 1 : 0,
        is_quarter_end: [3, 6, 9, 12].includes(month) ? 1 : 0,
      }),
    });

    const data = await res.json();
    if (data.error) { console.error('Anomaly API:', data.error); return null; }
    return data as AnomalyResult;

  } catch (e) {
    console.error('detectOrderAnomaly:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COLOR HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getUrgencyColor(urgency: ForecastResult['urgency']): string {
  switch (urgency) {
    case 'CRITICAL — Out of Stock': return '#B91C1C';
    case 'URGENT — < 2 days':       return '#DC2626';
    case 'HIGH — < 5 days':         return '#F59E0B';
    case 'MEDIUM — Order Soon':     return '#7C3AED';
    default:                        return '#10B981';
  }
}

export function getSeverityColor(severity: AnomalyResult['severity']): string {
  switch (severity) {
    case 'CRITICAL': return '#B91C1C';
    case 'HIGH':     return '#EF4444';
    case 'MEDIUM':   return '#F59E0B';
    default:         return '#10B981';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getDayOfYear(d: Date): number {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
}

function isInMHDWindow(d: Date): boolean {
  const m = d.getMonth() + 1, day = d.getDate();
  return (m === 5 && day >= 21) || (m === 6 && day <= 7);
}
