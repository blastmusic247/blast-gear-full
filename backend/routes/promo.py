from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import PromoCode, PromoCodeCreate, PromoCodeValidate
from datetime import datetime
from utils.auth import verify_token
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def setup_promo_routes(db):
    """Setup promo code routes with database connection"""
    promo_collection = db.promo_codes
    
    @router.post("/admin/promo-codes", response_model=PromoCode)
    async def create_promo_code(
        promo_data: PromoCodeCreate,
        token: dict = Depends(verify_token)
    ):
        """Create new promo code (Admin only)"""
        # Check if code already exists
        existing = await promo_collection.find_one({"code": promo_data.code.upper()})
        if existing:
            raise HTTPException(status_code=400, detail="Promo code already exists")
        
        # Create promo code with uppercase code
        promo_dict = promo_data.dict()
        promo_dict['code'] = promo_data.code.upper()
        
        # Create PromoCode instance without passing code again
        promo = PromoCode(
            code=promo_dict['code'],
            discountType=promo_dict['discountType'],
            discountValue=promo_dict['discountValue'],
            description=promo_dict.get('description', ''),
            expiryDate=promo_dict.get('expiryDate'),
            usageLimit=promo_dict.get('usageLimit')
        )
        await promo_collection.insert_one(promo.dict())
        
        logger.info(f"Promo code created: {promo.code}")
        return promo
    
    @router.get("/admin/promo-codes", response_model=List[PromoCode])
    async def get_all_promo_codes(token: dict = Depends(verify_token)):
        """Get all promo codes (Admin only)"""
        promos = await promo_collection.find().to_list(1000)
        return [PromoCode(**promo) for promo in promos]
    
    @router.put("/admin/promo-codes/{promo_id}", response_model=PromoCode)
    async def update_promo_code(
        promo_id: str,
        promo_data: PromoCodeCreate,
        token: dict = Depends(verify_token)
    ):
        """Update promo code (Admin only)"""
        result = await promo_collection.update_one(
            {"id": promo_id},
            {"$set": promo_data.dict()}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Promo code not found")
        
        updated_promo = await promo_collection.find_one({"id": promo_id})
        return PromoCode(**updated_promo)
    
    @router.delete("/admin/promo-codes/{promo_id}")
    async def delete_promo_code(
        promo_id: str,
        token: dict = Depends(verify_token)
    ):
        """Delete promo code (Admin only)"""
        result = await promo_collection.delete_one({"id": promo_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Promo code not found")
        
        return {"success": True, "message": "Promo code deleted"}
    
    @router.post("/validate-promo")
    async def validate_promo_code(promo_data: PromoCodeValidate):
        """Validate and calculate discount for promo code (Public)"""
        promo = await promo_collection.find_one({"code": promo_data.code.upper()})
        
        if not promo:
            raise HTTPException(status_code=404, detail="Invalid promo code")
        
        promo_obj = PromoCode(**promo)
        
        # Check if active
        if not promo_obj.isActive:
            raise HTTPException(status_code=400, detail="Promo code is no longer active")
        
        # Check expiry
        if promo_obj.expiryDate and datetime.utcnow() > promo_obj.expiryDate:
            raise HTTPException(status_code=400, detail="Promo code has expired")
        
        # Check usage limit
        if promo_obj.usageLimit and promo_obj.usedCount >= promo_obj.usageLimit:
            raise HTTPException(status_code=400, detail="Promo code usage limit reached")
        
        # Calculate discount
        if promo_obj.discountType == "percentage":
            discount_amount = (promo_data.orderTotal * promo_obj.discountValue) / 100
        else:  # fixed
            discount_amount = promo_obj.discountValue
        
        # Ensure discount doesn't exceed order total
        discount_amount = min(discount_amount, promo_data.orderTotal)
        new_total = promo_data.orderTotal - discount_amount
        
        return {
            "valid": True,
            "code": promo_obj.code,
            "discountType": promo_obj.discountType,
            "discountValue": promo_obj.discountValue,
            "discountAmount": round(discount_amount, 2),
            "newTotal": round(new_total, 2),
            "description": promo_obj.description
        }
    
    @router.post("/apply-promo/{code}")
    async def apply_promo_code(code: str):
        """Apply promo code and increment usage count"""
        result = await promo_collection.update_one(
            {"code": code.upper()},
            {"$inc": {"usedCount": 1}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Promo code not found")
        
        return {"success": True, "message": "Promo code applied"}
    
    return router
