// services/swasthyaML.ts
// Swasthya ML API — connects your Expo app to your AWS Lambda model
// API: https://074hc0y3ta.execute-api.ap-south-1.amazonaws.com/default

const ML_API = 'https://074hc0y3ta.execute-api.ap-south-1.amazonaws.com/default';

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
// HELPER — builds ML features from your Supabase inventory data
// Call this instead of computing features manually everywhere
// ─────────────────────────────────────────────────────────────────────────────

export function buildForecastFeatures(item: {
  pharmacy_id: string;
  sku_id: string;
  stock_quantity: number;
  unit_price: number;
  ph_code: number;      // pharmacy number e.g. PH_01 → 1
  sku_code: number;     // SKU number e.g. SKU_004 → 4
  city_tier: number;    // 1, 2, or 3
  city_code: number;    // city category code
  cat_code: number;     // category code
  // Sales history (fetch from your sales/orders table)
  sales_last_1d: number;
  sales_last_7d: number;
  sales_last_14d: number;
  sales_last_28d: number;
  sales_last_91d: number;
}) {
  const now = new Date();
  const dayOfWeek  = now.getDay();         // 0=Sun, 6=Sat
  const dayOfYear  = getDayOfYear(now);
  const month      = now.getMonth() + 1;
  const quarter    = Math.ceil(month / 3);
  const isWeekend  = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

  // Rolling averages from sales history
  const roll7Mean  = item.sales_last_7d  / 7;
  const roll14Mean = item.sales_last_14d / 14;
  const roll30Mean = (item.sales_last_28d / 28) || roll7Mean;
  const roll60Mean = roll30Mean * 0.95;
  const roll90Mean = roll30Mean * 0.90;
  const roll7Std   = roll7Mean * 0.2;  // estimate: 20% of mean

  return {
    pharmacy_id:   item.pharmacy_id,
    sku_id:        item.sku_id,
    current_stock: item.stock_quantity,
    unit_price:    item.unit_price,

    // Lag features
    lag_1:   item.sales_last_1d,
    lag_7:   item.sales_last_7d  / 7,
    lag_14:  item.sales_last_14d / 14,
    lag_28:  item.sales_last_28d / 28,
    lag_91:  item.sales_last_91d / 91,

    // Rolling stats
    roll_7_mean:  roll7Mean,
    roll_7_std:   roll7Std,
    roll_14_mean: roll14Mean,
    roll_30_mean: roll30Mean,
    roll_60_mean: roll60Mean,
    roll_90_mean: roll90Mean,

    // Trend ratios
    trend_7_vs_30:  roll7Mean  / (roll30Mean  + 1e-6),
    trend_14_vs_60: roll14Mean / (roll60Mean  + 1e-6),
    trend_30_vs_90: roll30Mean / (roll90Mean  + 1e-6),

    // Cyclical time encoding
    sin_dow:   Math.sin(2 * Math.PI * dayOfWeek / 7),
    cos_dow:   Math.cos(2 * Math.PI * dayOfWeek / 7),
    sin_doy:   Math.sin(2 * Math.PI * dayOfYear / 365),
    cos_doy:   Math.cos(2 * Math.PI * dayOfYear / 365),
    sin_month: Math.sin(2 * Math.PI * month / 12),
    cos_month: Math.cos(2 * Math.PI * month / 12),

    // Calendar
    month,
    quarter,
    city_tier:    item.city_tier,
    is_weekend:   isWeekend,
    is_mhd_window: isInMHDWindow(now) ? 1 : 0,  // May 21–June 7
    is_ngo_season: month === 1 || month === 8 ? 1 : 0,
    is_monsoon:    month >= 6 && month <= 9 ? 1 : 0,

    // Entity codes
    sku_code:  item.sku_code,
    ph_code:   item.ph_code,
    city_code: item.city_code,
    cat_code:  item.cat_code,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1 — Demand Forecast + Reorder Suggestion
// Use in: pharmacy/dashboard.tsx and pharmacy/inventory.tsx
// ─────────────────────────────────────────────────────────────────────────────

export async function getDemandForecast(features: ReturnType<typeof buildForecastFeatures>): Promise<ForecastResult | null> {
  try {
    const response = await fetch(`${ML_API}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    });
    const data = await response.json();
    if (data.error) {
      console.error('Forecast API error:', data.error);
      return null;
    }
    return data as ForecastResult;
  } catch (error) {
    console.error('getDemandForecast failed:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2 — Anomaly Detection
// Use in: admin/management/orders.tsx — when admin views a new order
// ─────────────────────────────────────────────────────────────────────────────

export async function detectOrderAnomaly(order: {
  pharmacy_id: string;
  sku_id: string;
  order_qty: number;
  order_value: number;
}): Promise<AnomalyResult | null> {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;

    const response = await fetch(`${ML_API}/detect-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        order_month:    month,
        order_dow:      now.getDay(),
        is_month_start: now.getDate() <= 7 ? 1 : 0,
        is_quarter_end: [3, 6, 9, 12].includes(month) ? 1 : 0,
      }),
    });
    const data = await response.json();
    if (data.error) {
      console.error('Anomaly API error:', data.error);
      return null;
    }
    return data as AnomalyResult;
  } catch (error) {
    console.error('detectOrderAnomaly failed:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff  = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isInMHDWindow(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day   = date.getDate();
  return (month === 5 && day >= 21) || (month === 6 && day <= 7);
}

// Urgency color helper — use in UI
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
