# ☁️ Deployment to Google Cloud Run

To make **Hikmat Vision (Camera Mode)** work online, you need to deploy the project to Google Cloud Run. I have already prepared the `Dockerfile` and a unified `server.js` for you.

## Option 1: Using Google Cloud Console (Recommended & Easiest)

1. **Upload to GitHub**: Upload your entire project folder to a GitHub repository.
2. **Go to Cloud Run**: Open the [Google Cloud Console](https://console.cloud.google.com/run).
3. **Create Service**: Click **"CREATE SERVICE"**.
4. **Source**: Select **"Continuously deploy from a repository"** and connect your GitHub repo.
5. **Configuration**:
   - **Service name**: `hikmat-ai`
   - **Region**: Choose one close to you (e.g., `us-central1`).
   - **Authentication**: Select **"Allow unauthenticated invocations"** (to make it public).
6. **Container Port**: Ensure the port is set to `8080` (this is the default).
7. **Deploy**: Click **"CREATE"**.

---

## Option 2: Using gcloud CLI (If installed)

Run these commands in your project folder:

```bash
# 1. Build and deploy
gcloud run deploy hikmat-ai --source . --allow-unauthenticated --region us-central1
```

---

## 🔑 important: API Key Security
To prevent leaking your API key on GitHub:
1. I have updated the code to use an **Environment Variable** named `GEMINI_API_KEY`.
2. **On Cloud Run Console**: During or after deployment, go to **Variables & Secrets** and add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `Your_Real_API_Key_Here`
3. The app will now fetch this key securely at runtime.

---

## 🚀 Option 3: Direct Upload (No GitHub)
If you don't want to use GitHub at all:
1. Open a terminal in your project folder.
2. If you have the Google Cloud SDK installed, run:
   ```bash
   gcloud run deploy hikmat-ai --source . --set-env-vars GEMINI_API_KEY=Your_Key_Here
   ```
3. This will zip your local files (excluding those in `.gitignore`) and deploy them directly.

---

## 📂 GitHub Preparation
- I have updated `.gitignore` to hide all `*.txt` and `.env` files.
- You can safely upload the entire folder to GitHub now.
- Users will need to create their own `.env` file based on `.env.example` to run it locally.

---
**Note:** I have already updated your files (Dockerfile, server.js, app.js, package.json) to be 100% secure and compatible.
