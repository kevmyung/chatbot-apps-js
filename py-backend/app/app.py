from fastapi import FastAPI, HTTPException, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import os
import shutil
import sys
from typing import List
import uvicorn
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

class FilePaths(BaseModel):
    file_paths: List[str]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(files: List[UploadFile] = File(...)):
    try:
        file_paths = []
        for file in files:
            file_location = f"/tmp/{file.filename}"
            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append(file_location)
            logging.info(f"Uploaded file: {file_location}")

        return {"file_paths": file_paths}
    except Exception as e:
        logging.error(f"Error during file upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process")
async def process(
    background_tasks: BackgroundTasks,
    file_paths: str = Form(...),
    embedding_model: str = Form(...),
    region: str = Form(...),
    vector_store: str = Form(...)
):
    try:
        file_paths = file_paths.split(',')
        logging.info(f"Processing files: {file_paths}")
        logging.info(f"Running subprocess for embedding_model: {embedding_model}, region: {region}, vector_store: {vector_store}")
        
        # Add the task to background tasks
        background_tasks.add_task(run_subprocess, file_paths, embedding_model, region, vector_store)

        return {"message": "Processing started"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def run_subprocess(file_paths: List[str], embedding_model: str, region: str, vector_store: str):
    try:
        result = subprocess.run(
            [sys.executable, 'py-backend/app/process.py', embedding_model, region, vector_store, *file_paths],
            capture_output=True,
            text=True,
            timeout=6000
        )
        logging.info("Subprocess completed")
        logging.info(f"Subprocess stdout: {result.stdout}")
        logging.info(f"Subprocess stderr: {result.stderr}")

        for path in file_paths:
            os.remove(path)

    except Exception as e:
        logging.error(f"Error in subprocess: {e}")

@app.post("/initialize")
async def initialize(embedding_model: str = Form(...)):
    try:
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
        result = subprocess.run(
            [sys.executable, 'py-backend/app/search.py', text, chat_mode, search_settings],
            capture_output=True,
            text=True
        )
        output = result.stdout.strip()
        return {"output": output, "error": result.stderr.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/websearch")
async def search(text: str = Form(...), chat_mode: str = Form(...), tavily_search_key: str = Form(...)):
    try:
        result = subprocess.run(
            [sys.executable, 'py-backend/app/websearch.py', text, chat_mode, tavily_search_key],
            capture_output=True,
            text=True
        )
        output = result.stdout.strip()
        return {"output": output, "error": result.stderr.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)