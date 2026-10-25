# HTTP server for the Swasthya ML API (FastAPI + uvicorn).
# Runs locally with Docker and as a Hugging Face Docker Space.
# The AWS Lambda image is built from Dockerfile.lambda instead.
FROM python:3.11-slim

# LightGBM needs the OpenMP runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces run containers as user 1000.
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"
WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --only-binary=:all: -r requirements.txt

COPY --chown=user lambda_function.py server.py ./
COPY --chown=user models/ ./models/

# Hugging Face Spaces expect port 7860.
ENV PORT=7860
EXPOSE 7860
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT}"]
