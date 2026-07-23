from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

ydl_opts = {"no_warnings": True, "no_playlist": True}

ydl = yt_dlp.YoutubeDL(ydl_opts)

app = FastAPI()

origins = ["http://127.0.0.1:8000", "http://127.0.0.1:5173"]  # self  # react

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_origins=origins,
)

@app.get("/find")
def find_song_url(q: str):
    results = ydl.extract_info(f"ytsearch1:{q}", download=False)
    video = results["entries"][0]
    return {"url": video["webpage_url"]}

# run on :8000
