from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from models import GalleryImage, GalleryImageCreate
from utils.auth import verify_token
import logging
import uuid
from pathlib import Path

router = APIRouter()
logger = logging.getLogger(__name__)

# Directory to store uploaded images
UPLOAD_DIR = Path(__file__).parent.parent.parent / "frontend" / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def setup_gallery_routes(db):
    """Setup gallery routes with database connection"""
    gallery_collection = db.gallery_images
    
    @router.get("/gallery-images", response_model=List[GalleryImage])
    async def get_all_gallery_images():
        """Get all gallery images (Public)"""
        images = await gallery_collection.find().sort("order", 1).to_list(1000)
        return [GalleryImage(**image) for image in images]
    
    @router.post("/admin/gallery-images/bulk-upload")
    async def bulk_upload_gallery_images(
        files: List[UploadFile] = File(...),
        default_alt: Optional[str] = Form(""),
        token: dict = Depends(verify_token)
    ):
        """Bulk upload gallery images (Admin only)"""
        
        logger.info(f"[GALLERY] Bulk upload request received - Files: {len(files)}, Default alt: '{default_alt}'")
        
        # Validate number of files (max 10)
        if len(files) > 10:
            logger.error(f"[GALLERY] Too many files: {len(files)}")
            raise HTTPException(status_code=400, detail="Maximum 10 files allowed per upload")
        
        uploaded_images = []
        errors = []
        
        # Get current max order
        existing_images = await gallery_collection.find().sort("order", -1).limit(1).to_list(1)
        max_order = existing_images[0]["order"] if existing_images else 0
        logger.info(f"[GALLERY] Current max order: {max_order}")
        
        for idx, file in enumerate(files):
            try:
                logger.info(f"[GALLERY] Processing file {idx + 1}/{len(files)}: {file.filename} ({file.content_type})")
                
                # Validate file type
                allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
                if file.content_type not in allowed_types:
                    logger.warning(f"[GALLERY] Invalid file type: {file.content_type}")
                    errors.append(f"{file.filename}: Invalid file type")
                    continue
                
                # Validate file size (max 5MB)
                contents = await file.read()
                file_size_mb = len(contents) / (1024 * 1024)
                logger.info(f"[GALLERY] File size: {file_size_mb:.2f}MB")
                
                if len(contents) > 5 * 1024 * 1024:
                    logger.warning(f"[GALLERY] File too large: {file_size_mb:.2f}MB")
                    errors.append(f"{file.filename}: File too large (max 5MB)")
                    continue
                
                # Generate unique filename
                file_extension = file.filename.split(".")[-1]
                unique_filename = f"{uuid.uuid4()}.{file_extension}"
                file_path = UPLOAD_DIR / unique_filename
                
                # Save file
                with open(file_path, "wb") as f:
                    f.write(contents)
                logger.info(f"[GALLERY] File saved: {unique_filename}")
                
                # Create gallery image record
                image_url = f"/uploads/{unique_filename}"
                alt_text = default_alt if default_alt else file.filename
                
                gallery_image = GalleryImage(
                    url=image_url,
                    alt=alt_text,
                    order=max_order + idx + 1
                )
                
                await gallery_collection.insert_one(gallery_image.dict())
                uploaded_images.append(gallery_image)
                
                logger.info(f"[GALLERY] Image record created: {gallery_image.id} (order: {gallery_image.order})")
                
            except Exception as e:
                logger.error(f"[GALLERY] Error uploading {file.filename}: {str(e)}")
                errors.append(f"{file.filename}: {str(e)}")
        
        result = {
            "success": True,
            "added": len(uploaded_images),
            "errors": errors,
            "images": [img.dict() for img in uploaded_images]
        }
        
        logger.info(f"[GALLERY] Bulk upload complete - Success: {len(uploaded_images)}, Errors: {len(errors)}")
        return result
    
    @router.post("/admin/gallery-images", response_model=GalleryImage)
    async def create_gallery_image(
        image_data: GalleryImageCreate,
        token: dict = Depends(verify_token)
    ):
        """Create new gallery image (Admin only) - for single image with URL"""
        gallery_image = GalleryImage(**image_data.dict())
        await gallery_collection.insert_one(gallery_image.dict())
        
        logger.info(f"Gallery image created: {gallery_image.id}")
        return gallery_image
    
    @router.put("/admin/gallery-images/{image_id}")
    async def update_gallery_image(
        image_id: str,
        alt: Optional[str] = None,
        order: Optional[int] = None,
        token: dict = Depends(verify_token)
    ):
        """Update gallery image description and order (Admin only)"""
        
        # Build update dict with only provided fields
        update_data = {}
        if alt is not None:
            update_data["alt"] = alt
        if order is not None:
            update_data["order"] = order
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await gallery_collection.update_one(
            {"id": image_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Gallery image not found")
        
        updated_image = await gallery_collection.find_one({"id": image_id})
        logger.info(f"Gallery image updated: {image_id}")
        
        return {"success": True, "image": GalleryImage(**updated_image).dict()}
    
    @router.delete("/admin/gallery-images/{image_id}")
    async def delete_gallery_image(
        image_id: str,
        token: dict = Depends(verify_token)
    ):
        """Delete gallery image (Admin only)"""
        result = await gallery_collection.delete_one({"id": image_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Gallery image not found")
        
        logger.info(f"Gallery image deleted: {image_id}")
        return {"success": True, "message": "Gallery image deleted"}
    
    return router
