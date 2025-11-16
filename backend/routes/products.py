from fastapi import APIRouter, HTTPException
from typing import List
from models import Product, ProductCreate, ProductUpdate

router = APIRouter()


def setup_products_routes(db):
    """Setup products routes with database connection"""
    products_collection = db.products
    
    @router.get("/products", response_model=List[Product])
    async def get_products():
        """Get all products"""
        products = await products_collection.find().to_list(1000)
        return [Product(**product) for product in products]

    @router.get("/products/{product_id}", response_model=Product)
    async def get_product(product_id: str):
        """Get single product by ID"""
        product = await products_collection.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return Product(**product)

    @router.post("/products", response_model=Product)
    async def create_product(product: ProductCreate):
        """Create new product (Admin)"""
        product_obj = Product(**product.dict())
        await products_collection.insert_one(product_obj.dict())
        return product_obj

    @router.put("/products/{product_id}", response_model=Product)
    async def update_product(product_id: str, product_update: ProductUpdate):
        """Update product (Admin)"""
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

    @router.delete("/products/{product_id}")
    async def delete_product(product_id: str):
        """Delete product (Admin)"""
        result = await products_collection.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    
    return router
