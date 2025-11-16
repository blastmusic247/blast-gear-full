from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
import os
import uuid
from pathlib import Path

router = APIRouter()

# Directory to store uploaded images
UPLOAD_DIR = Path(__file__).parent.parent.parent / "frontend" / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload product image"""
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP allowed.")
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return the URL path
        image_url = f"/uploads/{unique_filename}"
        
        return {
            "success": True,
            "url": image_url,
            "filename": unique_filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")
