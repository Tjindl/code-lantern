# routes/upload.py
import os
import uuid
import zipfile
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

BASE_REPO_DIR = "processed_repos"   # where unzipped repos are stored
os.makedirs(BASE_REPO_DIR, exist_ok=True)

def cleanup_previous_projects():
    """Remove all previous projects to keep only current one"""
    if os.path.exists(BASE_REPO_DIR):
        # Remove all contents of the directory
        for item in os.listdir(BASE_REPO_DIR):
            item_path = os.path.join(BASE_REPO_DIR, item)
            if os.path.isfile(item_path):
                os.remove(item_path)
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)


@router.post("/upload")
async def upload_repo(file: UploadFile = File(...)):
    # validate file type
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are allowed")
    
    # cleanup all previous projects first
    cleanup_previous_projects()
    
    # generate unique repo id
    repo_id = str(uuid.uuid4())

    # paths
    zip_path = os.path.join(BASE_REPO_DIR, f"{repo_id}.zip")
    extract_path = os.path.join(BASE_REPO_DIR, repo_id)

    try:
        # save uploaded zip file
        with open(zip_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # unzip into folder
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_path)

        # cleanup - remove zip file after extraction
        os.remove(zip_path)

        return {
            "status": "ok",
            "repo_id": repo_id,
            "extracted_to": extract_path
        }
    
    except zipfile.BadZipFile:
        # cleanup on error
        if os.path.exists(zip_path):
            os.remove(zip_path)
        raise HTTPException(status_code=400, detail="Invalid ZIP file")
    except Exception as e:
        # cleanup on error
        if os.path.exists(zip_path):
            os.remove(zip_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
