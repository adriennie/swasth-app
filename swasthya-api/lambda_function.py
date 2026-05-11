import json, os, joblib, numpy as np, pandas as pd

BASE = os.path.dirname(__file__)

# Load models
lgb_model = joblib.load(os.path.join(BASE, "models", "demand_forecaster.pkl"))
f1_meta   = json.load(open(os.path.join(BASE, "models", "model_metadata.json")))
FEATURES  = f1_meta["feature_cols"]

iso_model  = joblib.load(os.path.join(BASE, "models", "anomaly_detector.pkl"))
iso_scaler = joblib.load(os.path.join(BASE, "models", "anomaly_scaler.pkl"))

entity_stats = pd.read_csv(os.path.join(BASE, "models", "entity_stats.csv"))
entity_stats['pharmacy_id'] = entity_stats['pharmacy_id'].astype(str).str.strip()
entity_stats['sku_id']      = entity_stats['sku_id'].astype(str).str.strip()


# ================= MAIN =================
def lambda_handler(event, context):
    try:
        path = event.get("rawPath", event.get("path", "/"))

        # 🔥 FIX: remove /default
        if path.startswith("/default"):
            path = path[len("/default"):]

        method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
        body = json.loads(event["body"]) if event.get("body") else {}

        if path == "/forecast" and method == "POST":
            result = handle_forecast(body)

        elif path == "/detect-anomaly" and method == "POST":
            result = handle_anomaly(body)

        elif path == "/aggregate" and method == "POST":
            result = handle_aggregate(body)

        elif path == "/health":
            result = {
                "status": "ok",
                "mape": f1_meta["metrics"]["MAPE"],
                "entity_stats_rows": len(entity_stats),
                "sample_pharmacy_ids": sorted(entity_stats['pharmacy_id'].unique().tolist())[:5],
                "sample_sku_ids": sorted(entity_stats['sku_id'].unique().tolist())[:5],
            }

        else:
            result = {"error": f"Unknown path: {path}"}

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(result)
        }

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


# ================= FORECAST =================
def handle_forecast(body):
    features = np.array([[
        body["lag_1"], body["lag_7"], body["lag_14"],
        body["lag_28"], body["lag_91"],
        body["roll_7_mean"], body["roll_7_std"], body["roll_14_mean"],
        body["roll_30_mean"], body["roll_60_mean"], body["roll_90_mean"],
        body["trend_7_vs_30"], body["trend_14_vs_60"], body["trend_30_vs_90"],
        body["sin_dow"], body["cos_dow"],
        body["sin_doy"], body["cos_doy"],
        body["sin_month"], body["cos_month"],
        body["month"], body["quarter"], body["city_tier"],
        body["is_weekend"], body["is_mhd_window"],
        body["is_ngo_season"], body["is_monsoon"],
        body["sku_code"], body["ph_code"],
        body["city_code"], body["cat_code"]
    ]])

    daily_pred = float(np.maximum(lgb_model.predict(features)[0], 0))
    forecast_7d = round(daily_pred * 7)

    current_stock = body.get("current_stock", 0)
    unit_price = body.get("unit_price", 0)

    needed_qty = int(np.ceil(forecast_7d * 1.2))
    reorder_qty = max(0, needed_qty - current_stock)
    should_order = reorder_qty > 0

    days_left = round(current_stock / max(daily_pred, 0.01), 1)

    if days_left == 0:
        urgency = "CRITICAL"
    elif days_left <= 2:
        urgency = "URGENT"
    elif days_left <= 5:
        urgency = "HIGH"
    elif should_order:
        urgency = "MEDIUM"
    else:
        urgency = "OK"

    return {
        "daily_pred": round(daily_pred, 2),
        "forecast_7d": forecast_7d,
        "current_stock": current_stock,
        "reorder_qty": reorder_qty,
        "should_order": should_order,
        "days_until_stockout": days_left,
        "urgency": urgency,
        "order_value": reorder_qty * unit_price
    }


# ================= ANOMALY =================
def handle_anomaly(body):
    pharmacy_id = str(body["pharmacy_id"]).strip()
    sku_id      = str(body["sku_id"]).strip()
    order_qty   = body["order_qty"]
    order_value = body["order_value"]

    profile = entity_stats[
        (entity_stats["pharmacy_id"] == pharmacy_id) &
        (entity_stats["sku_id"]      == sku_id)
    ]

    if len(profile) == 0:
        return {
            "is_anomaly": True,
            "severity":   "MEDIUM",
            "alert":      f"No order history for {pharmacy_id}+{sku_id} — manual review recommended.",
            "iso_score":  None,
            "normal_avg": None,
            "qty_vs_mean": None,
        }

    p = profile.iloc[0]

    qty_vs_mean   = order_qty / (p["mean_qty"]   + 1e-6)
    qty_vs_median = order_qty / (p["median_qty"] + 1e-6)
    qty_vs_p95    = order_qty / (p["p95_qty"]    + 1e-6)
    qty_vs_max    = order_qty / (p["max_qty"]    + 1e-6)
    qty_zscore    = (order_qty - p["mean_qty"]) / (p["std_qty"] + 1e-6)

    # ✅ CORRECT 18-feature vector matching AnomalyDetection.ipynb exactly
    features = np.array([[
        qty_vs_mean,
        qty_vs_median,
        qty_vs_p95,
        qty_vs_max,
        qty_zscore,
        np.log1p(order_value),
        np.log1p(order_qty),
        np.log1p(p["mean_qty"]),
        p["cv"],
        np.log1p(p["p95_qty"]),
        p["total_orders"],
        p["mean_qty"],
        p["std_qty"],
        p["p95_qty"],
        body.get("order_month", 1),
        body.get("order_dow", 0),
        body.get("is_month_start", 0),
        body.get("is_quarter_end", 0),
    ]])

    scaled     = iso_scaler.transform(features)
    iso_score  = float(iso_model.decision_function(scaled)[0])
    is_anomaly = bool(iso_model.predict(scaled)[0] == -1)

    if iso_score < -0.20 or qty_vs_mean > 8:   severity = "CRITICAL"
    elif iso_score < -0.10 or qty_vs_mean > 5:  severity = "HIGH"
    else:                                        severity = "MEDIUM"

    alert = None
    if is_anomaly:
        alert = (
            f"Order of {order_qty} units is {qty_vs_mean:.1f}x the normal average "
            f"({p['mean_qty']:.0f} units). Recommend manual review."
        )

    return {
        "pharmacy_id":  pharmacy_id,
        "sku_id":       sku_id,
        "order_qty":    order_qty,
        "normal_avg":   round(float(p["mean_qty"]), 1),   # ✅ was missing before
        "qty_vs_mean":  round(qty_vs_mean, 2),
        "qty_zscore":   round(qty_zscore, 2),
        "is_anomaly":   is_anomaly,
        "iso_score":    round(iso_score, 4),
        "severity":     severity if is_anomaly else "NONE",
        "alert":        alert,
    }


# ================= AGGREGATE =================
def handle_aggregate(body):
    forecasts = body.get("forecasts", [])
    total = sum(forecasts)

    return {
        "total_distributor_demand": total,
        "num_pharmacies": len(forecasts),
        "average_demand": round(total / len(forecasts), 2) if forecasts else 0
    }