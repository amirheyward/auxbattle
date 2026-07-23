from fastapi import FastAPI
import yt_dlp

ydl_opts = {
    "no_warnings": True,
    "no_playlist": True
}

ydl = yt_dlp.YoutubeDL(ydl_opts)

app = FastAPI()

@app.get("/find")
def find_song_url(q: str):
    results = ydl.extract_info(f"ytsearch1:{q}", download=False)
    video = results["entries"][0]
    return video["webpage_url"]

# run on :8000