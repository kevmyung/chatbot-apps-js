from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import os
import shutil
import sys
from typing import List

app = FastAPI()

class FilePaths(BaseModel):
    file_paths: List[str]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ["http://example.com"] 
    allow_credentials=True,
    allow_methods=["*"],  # ["POST", "GET"]
    allow_headers=["*"],  # ["*"]
)

@app.post("/process")
async def process(
    files: List[UploadFile] = File(...),
    embedding_model: str = Form(...),
    region: str = Form(...),
    vector_store: str = Form(...)
):
    try:
        file_paths = []
        for file in files:
            file_location = f"/tmp/{file.filename}"
            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append(file_location)

        result = subprocess.run(
            [sys.executable, 'py-backend/app/process.py', embedding_model, region, vector_store, *file_paths],
            capture_output=True,
            text=True
        )

        for path in file_paths:
            os.remove(path)

        return {"output": result.stdout, "error": result.stderr}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/initialize")
async def initialize(embedding_model: str = Form(...)):
    try:
        print("initializing")
        result = subprocess.run(
            [sys.executable, 'py-backend/app/initialize.py', embedding_model],
            capture_output=True,
            text=True
        )
        return {"output": result.stdout, "error": result.stderr}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/search")
async def search(text: str = Form(...), chat_mode: str = Form(...), search_settings: str = Form(...)):
    try:
        print("searching")
        result = subprocess.run(
            [sys.executable, 'py-backend/app/search.py', text, chat_mode, search_settings],
            capture_output=True,
            text=True
        )
        output = result.stdout.strip()
        print(output)
        return {"output": output, "error": result.stderr.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))