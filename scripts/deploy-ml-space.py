#!/usr/bin/env python3
"""Deploys swasthya-api to a Hugging Face Docker Space.

Run with: npm run ml:deploy
Reads from .env.local (then .env):
  HF_TOKEN  Hugging Face access token with write access to Spaces
  HF_SPACE  Space id, e.g. your-username/swasthya-ml-api
Requires: pip install huggingface_hub
"""

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API_DIR = ROOT / "swasthya-api"


def load_env(path: Path) -> None:
    # Minimal .env reader; existing environment variables win.
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def main() -> int:
    load_env(ROOT / ".env.local")
    load_env(ROOT / ".env")

    token = os.environ.get("HF_TOKEN")
    space = os.environ.get("HF_SPACE")
    if not token or not space:
        print("Set HF_TOKEN and HF_SPACE (e.g. your-username/swasthya-ml-api) in .env.local.")
        return 1

    try:
        from huggingface_hub import HfApi
    except ImportError:
        print("Missing huggingface_hub. Install it with: pip3 install huggingface_hub")
        return 1

    api = HfApi(token=token)
    api.create_repo(repo_id=space, repo_type="space", space_sdk="docker", exist_ok=True)
    api.upload_folder(
        repo_id=space,
        repo_type="space",
        folder_path=str(API_DIR),
        ignore_patterns=["Dockerfile.lambda", "lambda_function.py(old)", "PROJECT_UNDERSTANDING.md", "__pycache__/*", "*.pyc"],
        commit_message="Deploy Swasthya ML API",
    )

    owner, name = space.split("/", 1)
    url = f"https://{owner.lower()}-{name.lower().replace('_', '-')}.hf.space"
    print(f"Deployed. The Space builds for a few minutes, then serves at:\n  {url}")
    print(f"Set EXPO_PUBLIC_ML_API_URL={url} in .env.local and restart Expo.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
