"""HTTP server for the Swasthya ML API.

Serves the same handlers as lambda_function.py over plain HTTP so the API
runs in Docker locally or on a Hugging Face Docker Space, with CORS handled
for browser clients.

Run locally: uvicorn server:app --host 0.0.0.0 --port 7860
"""

import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from lambda_function import (
    entity_stats,
    f1_meta,
    handle_aggregate,
    handle_anomaly,
    handle_forecast,
)

app = FastAPI(title="Swasthya ML API")

# Comma-separated origins, or "*" for any. Native apps send no Origin header,
# so this only affects browsers.
cors_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


async def run(handler, request: Request):
    try:
        body = await request.json()
    except ValueError:
        raise HTTPException(status_code=400, detail="Request body must be JSON.")
    try:
        return handler(body)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e.args[0]}")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "mape": f1_meta["metrics"]["MAPE"],
        "entity_stats_rows": len(entity_stats),
        "sample_pharmacy_ids": sorted(entity_stats["pharmacy_id"].unique().tolist())[:5],
        "sample_sku_ids": sorted(entity_stats["sku_id"].unique().tolist())[:5],
    }


@app.post("/forecast")
async def forecast(request: Request):
    return await run(handle_forecast, request)


@app.post("/detect-anomaly")
async def detect_anomaly(request: Request):
    return await run(handle_anomaly, request)


@app.post("/aggregate")
async def aggregate(request: Request):
    return await run(handle_aggregate, request)
