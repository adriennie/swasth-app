---
title: Swasthya ML API
emoji: 💊
colorFrom: purple
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Swasthya ML API

Demand forecasting (LightGBM) and order anomaly detection (Isolation Forest) for the Swasthya app.
The YAML header above configures this folder as a Hugging Face Docker Space.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Model status and sample ids |
| POST | `/forecast` | 7-day demand forecast and reorder suggestion |
| POST | `/detect-anomaly` | Flags unusual order quantities |
| POST | `/aggregate` | Sums pharmacy forecasts for a distributor |

Interactive docs are served at `/docs`.

## Files

| File | Purpose |
| --- | --- |
| `lambda_function.py` | Model loading and request handlers |
| `server.py` | FastAPI server with CORS, used by `Dockerfile` |
| `Dockerfile` | HTTP server image (local Docker and Hugging Face) |
| `Dockerfile.lambda` | AWS Lambda image |
| `models/` | Trained models and lookup tables |

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `7860` | Port the server listens on |
| `CORS_ORIGINS` | `*` | Comma-separated browser origins allowed to call the API |

Setup steps for Docker and Hugging Face are in `docs/ml_api.md` at the repository root.
