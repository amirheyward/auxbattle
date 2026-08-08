from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from contextlib import asynccontextmanager

import yt_dlp
import os
import shutil
import tempfile

app = FastAPI()

dir_names = []
# Can't use atexit for cleanup since the program is being managed by uvicorn
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield

    # Shutdown
    for d in dir_names:
        try:
            shutil.rmtree(d)
            print("Removed " + d)
        except:
            print("Error removing " + d)

app = FastAPI(lifespan=lifespan)

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
        dir_names.append(temp_dir) # for cleanup
      
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
        try: 
            results = ydl.extract_info(f"ytsearch1:{q}", download=True)
            v = results["entries"][0]

            filename = ydl.prepare_filename(v)
            print("\n\n" + filename + "\n\n")
            lobby_dirs[id]["queries"].append(q) # only add successful queries, since yt_dlp could fail
            return StreamingResponse(
                iter_file(filename),
                media_type="video/mp4",
            )
        except yt_dlp.utils.DownloadError:
            raise HTTPException(status_code=404, detail="Video unavailable") 

# run on :8000
