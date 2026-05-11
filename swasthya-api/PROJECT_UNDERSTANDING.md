# Swasthya API - Project Understanding

## 📋 Project Overview

**Project Name:** Swasthya — Intelligent Pharmacy Network  
**Type:** AWS Lambda-based REST API for Healthcare/Pharmacy Supply Chain Optimization  
**Purpose:** Provide demand forecasting, anomaly detection, and demand aggregation for pharmacy inventory management

---

## 🏗️ Architecture

### Tech Stack

- **Runtime:** AWS Lambda (Python 3.11)
- **Deployment:** Docker container on AWS Lambda
- **ML Framework:** LightGBM, Scikit-Learn, Isolation Forest
- **Dependencies:**
  - numpy 1.26.4
  - pandas 2.2.2
  - scikit-learn 1.4.2
  - lightgbm 3.3.5
  - joblib 1.3.2

### Deployment Model

- Containerized using Docker
- Runs on AWS ECR Lambda runtime
- System dependency: libgomp (required for LightGBM parallelization)
- Models bundled as pickle files within container

---

## 🔧 Core Components

### 1. **Models Loaded at Startup**

| Model | Purpose | File | Size |

|-------|---------|------|------|
| LightGBM Regressor | Demand forecasting | `demand_forecaster.pkl` | 1.1M |
| Isolation Forest | Anomaly detection | `anomaly_detector.pkl` | 3.6M |
| StandardScaler | Feature scaling for anomaly detection | `anomaly_scaler.pkl` | 1.0K |

### 2. **Configuration Files**

- **`model_metadata.json`** - Forecast model metadata
  - 31 features for demand prediction
  - 1000 trees trained on 49,665 samples (2024-01-15 to 2025-05-01)
  - Tested on 6,300 samples (2025-05-02 to 2025-06-30)
  - 7 SKUs of reusable period products (₹430-₹1100)
  - 15 pharmacies in network
  - Performance: MAE=1.14, RMSE=1.49, R²=0.35
  
- **`anomaly_metadata.json`** - Anomaly detection configuration

- **`dist_metadata.json`** - Distributor insights metadata

### 3. **Supporting Data**

- **`entity_stats.csv`** - Historical order statistics per pharmacy+SKU
  - Columns: pharmacy_id, sku_id, mean_qty, median_qty, p95_qty, max_qty, std_qty, cv (coefficient of variation), total_orders
  
- **Output/Results CSVs:**
  - `pharmacy_forecasts.csv` - Demand forecasts per pharmacy
  - `reorder_suggestions.csv` - Recommended reorder quantities
  - `flagged_orders.csv` - Anomalous orders flagged
  - `distributor_insights.csv` - Distributor-level analytics
  - `distributor_risk.csv` - Risk assessments
  - `aggregated_demand.csv` - Aggregated demand by geography

---

## 📡 API Endpoints

### Main Handler: `lambda_handler(event, context)`

Processes AWS Lambda events and routes to appropriate handlers based on path and HTTP method.

**Path Processing:** Strips `/default` prefix if present (path normalization for multi-stage deployment).

---

### 1. **POST /forecast** - Demand Forecasting

**Handler:** `handle_forecast(body)`

**Input Parameters:**

```bash
{
  // Lag features (historical demand)
  "lag_1": float,        // 1-day lag
  "lag_7": float,        // 7-day lag
  "lag_14": float,       // 14-day lag
  "lag_28": float,       // 28-day lag
  "lag_91": float,       // 91-day lag
  
  // Rolling statistics
  "roll_7_mean": float,   // 7-day rolling mean
  "roll_7_std": float,    // 7-day rolling std dev
  "roll_14_mean": float,  // 14-day rolling mean
  "roll_30_mean": float,  // 30-day rolling mean
  "roll_60_mean": float,  // 60-day rolling mean
  "roll_90_mean": float,  // 90-day rolling mean
  
  // Trend features (ratio-based)
  "trend_7_vs_30": float,   // 7-day vs 30-day trend
  "trend_14_vs_60": float,  // 14-day vs 60-day trend
  "trend_30_vs_90": float,  // 30-day vs 90-day trend
  
  // Cyclical encoding (sin/cos for periodicity)
  "sin_dow": float,      // Day of week (sine)
  "cos_dow": float,      // Day of week (cosine)
  "sin_doy": float,      // Day of year (sine)
  "cos_doy": float,      // Day of year (cosine)
  "sin_month": float,    // Month (sine)
  "cos_month": float,    // Month (cosine)
  
  // Categorical/contextual
  "month": int,          // Month (1-12)
  "quarter": int,        // Quarter (1-4)
  "city_tier": int,      // Urban/rural classification
  "is_weekend": int,     // Binary: weekend indicator
  "is_mhd_window": int,  // Binary: major health day window
  "is_ngo_season": int,  // Binary: NGO activity season
  "is_monsoon": int,     // Binary: monsoon season indicator
  
  // Entity codes
  "sku_code": int,       // Product SKU identifier
  "ph_code": int,        // Pharmacy identifier
  "city_code": int,      // City code
  "cat_code": int,       // Category code
  
  // Optional inventory context
  "current_stock": float,  // Current inventory (default: 0)
  "unit_price": float      // Product price per unit (default: 0)
}
```

**Output:**

```json
{
  "daily_pred": float,                // Predicted daily demand
  "forecast_7d": int,                 // 7-day forecast (daily × 7)
  "current_stock": float,             // Input current stock
  "reorder_qty": int,                 // Recommended order quantity
  "should_order": boolean,            // Whether to place order
  "days_until_stockout": float,       // Stock coverage in days
  "urgency": string,                  // One of: CRITICAL, URGENT, HIGH, MEDIUM, OK
  "order_value": float                // Reorder quantity × unit price
}
```

**Logic:**

1. Predicts daily demand using LightGBM model
2. Calculates 7-day forecast: daily_pred × 7
3. Computes needed quantity with 1.2× safety factor
4. Determines reorder quantity: needed - current_stock
5. Classifies urgency based on days-until-stockout:
   - **CRITICAL**: 0 days (stockout imminent)
   - **URGENT**: ≤2 days
   - **HIGH**: ≤5 days
   - **MEDIUM**: reorder needed but not urgent
   - **OK**: no reorder needed

---

### 2. **POST /detect-anomaly** - Anomaly Detection

**Handler:** `handle_anomaly(body)`

**Input Parameters:**

```json
{
  "pharmacy_id": string,      // Pharmacy identifier
  "sku_id": string,           // Product SKU identifier
  "order_qty": float,         // Order quantity
  "order_value": float,       // Order value in rupees
  "order_month": int,         // Month of order (1-12, optional)
  "order_dow": int,           // Day of week (0-6, optional)
  "is_month_start": int,      // Binary: start of month (optional)
  "is_quarter_end": int       // Binary: end of quarter (optional)
}
```

**Output:**

```json
{
  "pharmacy_id": string,          // Echo input
  "sku_id": string,               // Echo input
  "order_qty": float,             // Echo input
  "normal_avg": float,            // Historical mean order qty
  "qty_vs_mean": float,           // Ratio: order_qty / normal_avg
  "qty_zscore": float,            // Z-score of order quantity
  "is_anomaly": boolean,          // Isolation Forest prediction
  "iso_score": float,             // Isolation Forest anomaly score
  "severity": string,             // One of: NONE, MEDIUM, HIGH, CRITICAL
  "alert": string | null          // Human-readable alert if anomaly
}
```

**Logic:**

1. **Profile Lookup:** Retrieves historical statistics for pharmacy+SKU from `entity_stats.csv`
2. **Unknown Entity Handling:** If no history found, flags as MEDIUM severity anomaly
3. **Feature Engineering:** Computes 18-feature vector from order data and historical profile:
   - Ratios: order vs mean/median/p95/max
   - Z-score: statistical deviation
   - Log-transformed: order_value, order_qty, historical mean
   - Coefficient of variation: demand volatility
   - Temporal: month, day-of-week, calendar events
4. **Anomaly Scoring:**
   - Scales features using StandardScaler
   - Runs Isolation Forest decision_function
   - Predicts anomaly (-1 = anomaly, 1 = normal)
5. **Severity Classification:**
   - **CRITICAL**: iso_score < -0.20 OR qty_vs_mean > 8×
   - **HIGH**: iso_score < -0.10 OR qty_vs_mean > 5×
   - **MEDIUM**: otherwise
6. **Alert Generation:** Creates descriptive message if anomalous

---

### 3. **POST /aggregate** - Demand Aggregation

**Handler:** `handle_aggregate(body)`

**Input Parameters:**

```json
{
  "forecasts": [float, ...]  // Array of individual pharmacy forecasts
}
```

**Output:**

```json
{
  "total_distributor_demand": int,     // Sum of all forecasts
  "num_pharmacies": int,               // Count of pharmacies
  "average_demand": float              // Average demand per pharmacy
}
```

**Logic:** Simple aggregation for distributor-level analytics.

---

### 4. **GET /health** - Health Check Endpoint

**Handler:** Built into `lambda_handler`

**Output:**

```json
{
  "status": "ok",
  "mape": float,                                          // Model MAPE metric
  "entity_stats_rows": int,                              // Count of pharmacy+SKU records
  "sample_pharmacy_ids": [string, ...],                  // First 5 pharmacy IDs (sorted)
  "sample_sku_ids": [string, ...]                        // First 5 SKU IDs (sorted)
}
```

---

## 🔐 Error Handling

- **Route Not Found:** Returns `{"error": "Unknown path: {path}"}` with 200 status
- **General Exception:** Returns `{"statusCode": 500, "body": "{\"error\": \"<error_message>\"}"}`
- **CORS Headers:** All responses include `Access-Control-Allow-Origin: *`

---

## 📊 Feature Engineering Details

### Demand Forecasting Features (31 total)

**Historical Lag Features (5):**

- lag_1, lag_7, lag_14, lag_28, lag_91

**Rolling Aggregations (7):**

- roll_7_mean, roll_7_std, roll_14_mean, roll_30_mean, roll_60_mean, roll_90_mean

**Trend Features (3):**

- Capture momentum: 7-day vs 30-day, 14-day vs 60-day, 30-day vs 90-day

**Cyclical Encoding (6):**

- Day-of-week (sin/cos), day-of-year (sin/cos), month (sin/cos)
- Preserves periodicity without artificial ordering

**Contextual Features (7):**

- month, quarter, city_tier, is_weekend, is_mhd_window, is_ngo_season, is_monsoon

**Entity Encoding (4):**

- sku_code, ph_code, city_code, cat_code

### Anomaly Detection Features (18)

1. qty_vs_mean, qty_vs_median, qty_vs_p95, qty_vs_max
2. qty_zscore
3. log1p(order_value), log1p(order_qty), log1p(historical_mean_qty)
4. cv (coefficient of variation)
5. log1p(p95_qty), total_orders, mean_qty, std_qty, p95_qty
6. order_month, order_dow, is_month_start, is_quarter_end

---

## 📈 Model Performance

### Demand Forecasting Model

- **Model Type:** LightGBMRegressor (1000 trees)
- **Training Data:** 49,665 samples (Jan 15 - May 1, 2024)
- **Test Data:** 6,300 samples (May 2 - Jun 30, 2024)
- **Metrics:**
  - MAE: 1.14 units/day
  - RMSE: 1.49 units/day
  - R²: 0.35
  - MAPE: (Note: value appears corrupted in metadata)
- **Safety Factor:** 1.2× (adds buffer to forecasts)
- **Forecast Horizon:** 7 days

### Anomaly Detection Model

- **Model Type:** Isolation Forest
- **Training:** Trained on historical entity_stats
- **Decision Threshold:**
  - CRITICAL if iso_score < -0.20 or qty_vs_mean > 8
  - HIGH if iso_score < -0.10 or qty_vs_mean > 5

---

## 📦 Products in Network

7 reusable period products tracked:

| SKU | Product Name | Price (₹) |

|-----|--------------|-----------|
| SKU_001 | Starter Pack with Wet Bag | 430 |
| SKU_002 | Sampler Pack with Pads | 450 |
| SKU_003 | Reusable Pantyliners for Daily Use | 480 |
| SKU_004 | Day Pads - Pack of 6 | 560 |
| SKU_005 | Value Pack with Wet Bag and Pouch | 690 |
| SKU_006 | Heavy Flow Pack | 699 |
| SKU_007 | Super Pack with Wet Bag and Pouch | 1,100 |

---

## 🏥 Network Scale

- **Pharmacies:** 15 in network
- **SKUs Tracked:** 7 products
- **Entity Records:** ~160+ pharmacy+SKU combinations in entity_stats

---

## 🗂️ File Structure

```bash
swasthya-api/
├── lambda_function.py              # Main API handler
├── Dockerfile                       # Container definition
├── models/
│   ├── demand_forecaster.pkl       # LightGBM model (1.1M)
│   ├── anomaly_detector.pkl        # Isolation Forest (3.6M)
│   ├── anomaly_scaler.pkl          # StandardScaler (1.0K)
│   ├── model_metadata.json         # Forecast model config
│   ├── anomaly_metadata.json       # Anomaly detection config
│   ├── dist_metadata.json          # Distributor config
│   ├── entity_stats.csv            # Pharmacy+SKU statistics (11K)
│   ├── pharmacy_forecasts.csv      # Forecast results
│   ├── reorder_suggestions.csv     # Reorder recommendations
│   ├── flagged_orders.csv          # Anomalous orders (217K)
│   ├── distributor_insights.csv    # Aggregated insights
│   ├── distributor_risk.csv        # Risk scores (7.3K)
│   └── aggregated_demand.csv       # Demand aggregation (8.1K)
└── lambda_function.py(old)         # Backup/previous version
```

---

## 🚀 Deployment Notes

1. **Container Build:** Uses AWS Lambda Python 3.11 base image
2. **System Dependencies:** libgomp required for LightGBM
3. **Binary Packages:** Uses `--only-binary=:all:` to avoid compilation
4. **Handler:** Entry point is `lambda_function.lambda_handler`
5. **Model Loading:** Models loaded at container startup for faster invocation times

---

## 🔄 Data Flow

```bash
Request (POST /forecast, /detect-anomaly, /aggregate, or GET /health)
    ↓
lambda_handler() - Route dispatcher
    ↓
    ├→ handle_forecast() - Predict daily demand + reorder logic
    ├→ handle_anomaly() - Detect unusual orders
    ├→ handle_aggregate() - Sum demand
    └→ health check - Return model metadata
    ↓
Response (JSON with status 200 or 500)
```

---

## 🔍 Key Design Patterns

1. **Eager Model Loading:** All models loaded at container startup (cold start optimization)
2. **Stateless Lambda:** No persistent state between invocations
3. **Vectorized Operations:** numpy arrays for efficient batch operations
4. **Safety Margins:** 1.2× multiplier prevents stockouts
5. **CORS Enabled:** Open API for cross-origin requests
6. **Graceful Degradation:** Unknown pharmacy+SKU returns anomaly alert rather than error

---

## ⚠️ Observations

1. **MAPE Metric Issue:** The MAPE value in metadata (1.13e+17) appears corrupted or incorrectly calculated
2. **Path Normalization:** `/default` prefix stripping suggests multi-stage deployment (dev/staging/prod stages)
3. **Entity Stats Data Cleaning:** pharmacy_id and sku_id stripped of whitespace for exact matching
4. **Limited Error Context:** Generic exception handling could mask specific failures
5. **Zone Encoding:** Features use trigonometric encoding for temporal periodicity rather than categorical

---

## 📝 Summary

**Swasthya API** is a specialized healthcare supply chain API focused on:

- 🎯 Predicting pharmacy demand for reusable period products
- 🚨 Detecting anomalous orders for fraud/error prevention
- 📊 Aggregating demand for distributor-level analytics

Built on AWS Lambda with pre-trained ML models for real-time decision support in a 15-pharmacy network across India. Emphasis on inventory optimization and risk management in pharmaceutical supply chains.
