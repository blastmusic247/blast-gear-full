from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import requests

# -------------------------
# hCaptcha Verification
# -------------------------
def verify_hcaptcha(token):
    secret = os.getenv("HCAPTCHA_SECRET")
    url = "https://hcaptcha.com/siteverify"
    
    data = {
        "secret": secret,
        "response": token
    }

    response = requests.post(url, data=data)
    result = response.json()
    return result.get("success", False)


# -------------------------
# Load ENV
# -------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


# -------------------------
# MongoDB Setup
# -------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


# -------------------------
# Main FastAPI App
# -------------------------
app = FastAPI()

# Create router with prefix /api
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "BLAST Gear API"}


# -------------------------
# Import & Setup Routes
# -------------------------
from routes.products import setup_products_routes
from routes.orders import setup_orders_routes
from routes.admin import setup_admin_routes
from routes.promo import setup_promo_routes
from routes.gallery import setup_gallery_routes
from routes import stripe_payment, upload, contact

products_router = setup_products_routes(db)
orders_router = setup_orders_routes(db)
admin_router = setup_admin_routes(db)
promo_router = setup_promo_routes(db)
gallery_router = setup_gallery_routes(db)

api_router.include_router(products_router, tags=["products"])
api_router.include_router(orders_router, tags=["orders"])
api_router.include_router(contact.router, tags=["contact"])
api_router.include_router(stripe_payment.router, tags=["payment"])
api_router.include_router(admin_router, tags=["admin"])
api_router.include_router(upload.router, tags=["upload"])
api_router.include_router(promo_router, tags=["promo"])
api_router.include_router(gallery_router, tags=["gallery"])


# Add router to main app
app.include_router(api_router)

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Logging
# -------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# -------------------------
# Startup Logic
# -------------------------
@app.on_event("startup")
async def startup_event():
    """Seed initial product data if collection is empty"""
    products_count = await db.products.count_documents({})

    if products_count == 0:
        logger.info("Seeding initial product data...")
        initial_products = [
            {
                "id": "1",
                "name": "Classic Vintage Tee",
                "description": "Premium cotton t-shirt with vintage-inspired design. Comfortable fit perfect for everyday wear.",
                "price": 34.99,
                "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "category": "vintage",
                "inStock": True
            },
            {
                "id": "2",
                "name": "Minimalist Black Tee",
                "description": "Elegant black t-shirt with subtle design. Made from premium organic cotton.",
                "price": 29.99,
                "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "category": "minimal",
                "inStock": True
            },
            {
                "id": "3",
                "name": "Artistic Expression Tee",
                "description": "Bold artistic design that makes a statement. Soft, breathable fabric.",
                "price": 39.99,
                "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "category": "artistic",
                "inStock": True
            },
            {
                "id": "4",
                "name": "Urban Street Tee",
                "description": "Modern streetwear design with premium quality. Perfect for urban lifestyle.",
                "price": 36.99,
                "image": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80",
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "category": "streetwear",
                "inStock": True
            },
            {
                "id": "5",
                "name": "Nature Inspired Tee",
                "description": "Beautiful nature-themed design. Eco-friendly and sustainable materials.",
                "price": 32.99,
                "image": "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80",
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "category": "nature",
                "inStock": True
            },
            {
                "id": "6",
                "name": "Geometric Pattern Tee",
                "description": "Contemporary geometric design. Unique style for the modern individual.",
                "price": 37.99,
                "image": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "category": "geometric",
                "inStock": True
            }
        ]

        await db.products.insert_many(initial_products)
        logger.info(f"Seeded {len(initial_products)} products")


# -------------------------
# Shutdown Logic
# -------------------------
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
