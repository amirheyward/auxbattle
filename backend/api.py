from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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

# actually useful functions are .download() and .exctract_info()


@app.get("/find")
def find_song_url(q: str):
    temp_dir = tempfile.mkdtemp()
    # not using with, because fastAPI will try to send the file after the context is closed
    ydl_opts = {
        "no_warnings": True,
        "no_playlist": True,
        "format": "bestvideo+bestaudio", # ffmpeg must be installed on the system
        "merge_output_format": "mp4",
        "outtmpl": os.path.join(
            str(temp_dir), "%(title)s.%(ext)s"  # naming convention for yt dlp
        ),
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        results = ydl.extract_info(f"ytsearch1:{q}", download=True)
        v = results["entries"][0]

        filename = ydl.prepare_filename(v)
        print("\n\n" + filename + "\n\n")
        return FileResponse(
            filename,
            media_type="video/mp4",
            filename=os.path.basename(filename),
            background=BackgroundTask(lambda: shutil.rmtree(temp_dir)),
        )


# run on :8000
