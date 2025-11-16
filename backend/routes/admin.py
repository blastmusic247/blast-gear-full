from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import requests
import os
import logging
from utils.auth import authenticate_admin, create_access_token, verify_token
from models import Product, ProductCreate, ProductUpdate, Order, OrderStatusUpdate

router = APIRouter()
logger = logging.getLogger(__name__)

RECAPTCHA_SECRET_KEY = os.getenv('RECAPTCHA_SECRET_KEY')


class AdminLogin(BaseModel):
    username: str
    password: str
    recaptchaToken: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def setup_admin_routes(db):
    """Setup admin routes with database connection"""
    products_collection = db.products
    orders_collection = db.orders
    
    @router.post("/admin/login", response_model=AdminLoginResponse)
    async def admin_login(credentials: AdminLogin):
        """Admin login with reCAPTCHA verification"""
        
        # Temporary bypass for localhost development
        # TODO: Remove this bypass in production
        is_development = True  # Set to False in production
        
        if not is_development:
            # Verify reCAPTCHA
            recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify'
            recaptcha_data = {
                'secret': RECAPTCHA_SECRET_KEY,
                'response': credentials.recaptchaToken
            }
            
            try:
                recaptcha_response = requests.post(recaptcha_url, data=recaptcha_data)
                recaptcha_result = recaptcha_response.json()
                
                if not recaptcha_result.get('success'):
                    logger.error(f"reCAPTCHA verification failed: {recaptcha_result}")
                    raise HTTPException(status_code=400, detail="reCAPTCHA verification failed")
            except requests.RequestException as e:
                logger.error(f"Error verifying reCAPTCHA: {str(e)}")
                raise HTTPException(status_code=500, detail="Error processing login")
        
        # Authenticate admin
        if not authenticate_admin(credentials.username, credentials.password):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Create access token
        access_token = create_access_token(data={"sub": credentials.username})
        
        return AdminLoginResponse(access_token=access_token)
    
    @router.get("/admin/orders", response_model=List[Order])
    async def get_all_orders_admin(token: dict = Depends(verify_token)):
        """Get all orders (Admin only)"""
        orders = await orders_collection.find().sort("createdAt", -1).to_list(1000)
        return [Order(**order) for order in orders]
    
    @router.get("/admin/orders/{order_id}", response_model=Order)
    async def get_order_admin(order_id: str, token: dict = Depends(verify_token)):
        """Get single order (Admin only)"""
        order = await orders_collection.find_one({"orderId": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return Order(**order)
    
    @router.put("/admin/orders/{order_id}/status", response_model=Order)
    async def update_order_status_admin(
        order_id: str,
        status_update: OrderStatusUpdate,
        token: dict = Depends(verify_token)
    ):
        """Update order status (Admin only)"""
        result = await orders_collection.update_one(
            {"orderId": order_id},
            {"$set": {"status": status_update.status}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        updated_order = await orders_collection.find_one({"orderId": order_id})
        return Order(**updated_order)
    
    @router.get("/admin/products", response_model=List[Product])
    async def get_all_products_admin(token: dict = Depends(verify_token)):
        """Get all products (Admin only)"""
        products = await products_collection.find().to_list(1000)
        return [Product(**product) for product in products]
    
    @router.post("/admin/products", response_model=Product)
    async def create_product_admin(
        product: ProductCreate,
        token: dict = Depends(verify_token)
    ):
        """Create new product (Admin only)"""
        product_obj = Product(**product.dict())
        await products_collection.insert_one(product_obj.dict())
        return product_obj
    
    @router.put("/admin/products/{product_id}", response_model=Product)
    async def update_product_admin(
        product_id: str,
        product_update: ProductUpdate,
        token: dict = Depends(verify_token)
    ):
        """Update product (Admin only)"""
        existing_product = await products_collection.find_one({"id": product_id})
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        update_data = {k: v for k, v in product_update.dict().items() if v is not None}
        
        if update_data:
            await products_collection.update_one(
                {"id": product_id},
                {"$set": update_data}
            )
        
        updated_product = await products_collection.find_one({"id": product_id})
        return Product(**updated_product)
    
    @router.delete("/admin/products/{product_id}")
    async def delete_product_admin(
        product_id: str,
        token: dict = Depends(verify_token)
    ):
        """Delete product (Admin only)"""
        result = await products_collection.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    
    @router.post("/admin/orders/{order_id}/refund")
    async def refund_order_admin(
        order_id: str,
        token: dict = Depends(verify_token)
    ):
        """Refund order through Stripe (Admin only)"""
        import stripe
        import os
        
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        
        # Get order
        order = await orders_collection.find_one({"orderId": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Note: This is a simplified refund. In production, you'd need to store the Stripe payment_intent_id
        # For now, we'll just update the status
        try:
            # Update order status to Refunded
            await orders_collection.update_one(
                {"orderId": order_id},
                {"$set": {"status": "Refunded"}}
            )
            
            logger.info(f"Order {order_id} marked as Refunded")
            
            return {
                "success": True,
                "message": f"Order {order_id} has been refunded",
                "orderId": order_id
            }
        except Exception as e:
            logger.error(f"Error refunding order {order_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing refund: {str(e)}")
    
    @router.delete("/admin/orders/{order_id}")
    async def delete_order_admin(
        order_id: str,
        token: dict = Depends(verify_token)
    ):
        """Delete order (Admin only) - Use for fraudulent orders"""
        result = await orders_collection.delete_one({"orderId": order_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        logger.info(f"Order {order_id} deleted by admin")
        
        return {
            "success": True,
            "message": f"Order {order_id} has been deleted",
            "orderId": order_id
        }
    
    return router
