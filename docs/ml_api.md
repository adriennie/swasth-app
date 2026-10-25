# ML API: Docker and Hugging Face

The forecasting and anomaly models in `swasthya-api/` run as a FastAPI server (`server.py`) in one Docker image. The same image runs locally and on a Hugging Face Docker Space. `Dockerfile.lambda` keeps the AWS Lambda build.

The app reads the API address from `EXPO_PUBLIC_ML_API_URL` in `.env.local`. Without it, the app falls back to the AWS deployment. Restart Expo after changing it.

## Run locally with Docker

Requires Docker Desktop. The image is built for `linux/amd64` because LightGBM 3.3.5 only ships Intel Linux wheels; Apple Silicon runs it through emulation.

```bash
npm run ml:docker
```

The API serves on port 7860. Check it with http://localhost:7860/health, or browse the endpoints at http://localhost:7860/docs.

For Expo Go on a phone, use your Mac's Wi-Fi address, not `localhost`:

```env
EXPO_PUBLIC_ML_API_URL=http://192.168.1.95:7860
```

The address changes if your Mac joins a different network.

## Deploy to a Hugging Face Space

1. Create an access token at https://huggingface.co/settings/tokens with write access to Spaces.
2. Add to `.env.local` (never to an `EXPO_PUBLIC_` variable):

   ```env
   HF_TOKEN=hf_...
   HF_SPACE=your-username/swasthya-ml-api
   ```

3. Install the Hugging Face client once, then deploy:

   ```bash
   pip3 install huggingface_hub
   ```

   ```bash
   npm run ml:deploy
   ```

4. The Space builds for a few minutes. Then set the printed URL in `.env.local`:

   ```env
   EXPO_PUBLIC_ML_API_URL=https://your-username-swasthya-ml-api.hf.space
   ```

Free Spaces sleep after a period without traffic, so the first request afterwards takes longer.

## CORS

`server.py` allows any origin by default. To restrict browser access, set `CORS_ORIGINS` (comma-separated) as a Space variable or with `docker run -e`. Native apps are not affected by CORS.

## Known issue

`/health` reports a MAPE around 1e17. MAPE divides by actual demand, so days with zero sales make it meaningless. The roadmap's WAPE metric avoids this.
