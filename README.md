# Music Genre Classifier Frontend

A single-page Next.js App Router frontend for the Music Genre Classifier API.

Features:
- Record audio via MediaRecorder (up to 30s)
- Upload `.mp3` or `.wav`
- Sends multipart/form-data with field `file` to `POST /predict`
- Polished result card with predicted genre and confidence
- Spinner while waiting, and small history (last 3 predictions)
- Apple/FAANG-style UI (rounded cards, soft shadows, subtle animations)
- Environment-configurable API base URL (server-side)

## API Configuration

Default base:
- https://music-genre-detection-api-yv06.onrender.com

Override via environment variable (server-only):
- API_BASE_URL=https://your-api-base-url

The UI posts to `/api/predict`, which proxies to `${API_BASE_URL}/predict`.

## How it works

1. Record or upload a file.
2. The app sends `multipart/form-data` with `file` to the local route `/api/predict`.
3. The route forwards to the external API and returns its response.
4. The UI normalizes common response shapes into `{ genre, confidence }` and keeps the last 3 results in `localStorage`.

## Notes

- MediaRecorder may produce `audio/webm` (Chrome/Edge), `audio/ogg` (Firefox), or `audio/mp4` (Safari). Uploading from disk accepts `.mp3` and `.wav`.
- If your API only accepts certain formats, consider adding server-side transcoding.

## Install / Deploy

- In v0, open the preview menu to Download ZIP or push to GitHub, then Deploy on Vercel.
- In Project Settings, add `API_BASE_URL` if you need a custom endpoint.
