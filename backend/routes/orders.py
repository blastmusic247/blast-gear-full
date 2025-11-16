from fastapi import APIRouter, HTTPException
from typing import List
from models import Order, OrderCreate, OrderStatusUpdate
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def setup_orders_routes(db):
    """Setup orders routes with database connection"""
    orders_collection = db.orders
    
    @router.post("/orders", response_model=Order)
    async def create_order(order_data: OrderCreate):
        """Create new order"""
        from utils.email_service import send_admin_order_notification, send_customer_order_confirmation
        
        order = Order(**order_data.dict())
        await orders_collection.insert_one(order.dict())
        
        # Send email notifications
        try:
            # Send to admin
            admin_sent = send_admin_order_notification(order)
            if admin_sent:
                logger.info(f"Admin notification sent for order {order.orderId}")
            else:
                logger.error(f"Failed to send admin notification for order {order.orderId}")
            
            # Send to customer
            customer_sent = send_customer_order_confirmation(order)
            if customer_sent:
                logger.info(f"Customer confirmation sent for order {order.orderId}")
            else:
                logger.error(f"Failed to send customer confirmation for order {order.orderId}")
        except Exception as e:
            logger.error(f"Error sending email notifications: {str(e)}")
            # Don't fail the order creation if email fails
        
        return order

    @router.get("/orders/{order_id}", response_model=Order)
    async def get_order(order_id: str):
        """Track order by ID"""
        order = await orders_collection.find_one({"orderId": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return Order(**order)

    @router.get("/orders", response_model=List[Order])
    async def get_all_orders():
        """Get all orders (Admin)"""
        orders = await orders_collection.find().sort("createdAt", -1).to_list(1000)
        return [Order(**order) for order in orders]

    @router.put("/orders/{order_id}/status", response_model=Order)
    async def update_order_status(order_id: str, status_update: OrderStatusUpdate):
        """Update order status (Admin)"""
        result = await orders_collection.update_one(
            {"orderId": order_id},
            {"$set": {"status": status_update.status}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        updated_order = await orders_collection.find_one({"orderId": order_id})
        return Order(**updated_order)
    
    return router
