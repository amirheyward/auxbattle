from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from starlette.background import BackgroundTask


import yt_dlp
import os
import shutil
import tempfile

app = FastAPI()

origins = ["http://127.0.0.1:8000", "http://127.0.0.1:5173"]  # self  # react

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_origins=origins,
)

# actually useful yt-dlp functions are .download() and .exctract_info()
# if i have multiple people accessing the same file, i only want to delete when the file wont be requested anymore
# i also don't want to download the file multiple times if its going to be reused
lobby_dirs: dict[str, dict[str, list | str]] = (
    {}
)  # { idn: {queries: [], temp_dir: str} }


def iter_file(filename):
    with open(filename, "rb") as file:
        while chunk := file.read(1024 * 1024):  # Chunk = 1 MB
            yield chunk  # pauses function execution then resumes from here on the next call


@app.get("/find")
def find_song_url(q: str, id: str):
    # search relevant directory for previous queries
    temp_dir = None
    if lobby := lobby_dirs.get(id):
        queries = lobby["queries"]
        temp_dir = lobby["temp_dir"]
        if q in queries:
            filename = os.path.join(
                str(temp_dir), f"{q}.mp4"  # naming convention for yt dlp
            )
            print("\n\nRetrieving:\n" + filename + "\n\n")
            return StreamingResponse(
                iter_file(filename),
                media_type="video/mp4",
            )
            
    if not temp_dir:
        queries = []
        temp_dir = tempfile.mkdtemp()
        lobby_dirs[id] = {"queries": queries, "temp_dir": temp_dir}
    lobby_dirs[id]["queries"].append(q)
        
    ydl_opts = {
        "no_warnings": True,
        "no_playlist": True,
        "format": "bestvideo[height<=720]+bestaudio",  # ffmpeg must be installed on the system
        "merge_output_format": "mp4",
        "outtmpl": os.path.join(
            str(temp_dir), f"{q}.%(ext)s"  # naming convention for yt dlp
        ),
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        results = ydl.extract_info(f"ytsearch1:{q}", download=True)
        v = results["entries"][0]

        filename = ydl.prepare_filename(v)
        print("\n\n" + filename + "\n\n")
        return StreamingResponse(
            iter_file(filename),
            media_type="video/mp4",
        )


# run on :8000
