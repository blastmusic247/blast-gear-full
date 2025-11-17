from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image: str
    sizes: List[str]
    category: str
    inStock: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    image: str
    sizes: List[str]
    category: str
    inStock: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    sizes: Optional[List[str]] = None
    category: Optional[str] = None
    inStock: Optional[bool] = None


class CustomerInfo(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    zipCode: str
    country: str


class OrderItem(BaseModel):
    productId: str
    name: str
    price: float
    size: str
    quantity: int
    image: str


class Order(BaseModel):
    orderId: str = Field(default_factory=lambda: f"ORD-{int(datetime.utcnow().timestamp() * 1000)}")
    customer: CustomerInfo
    items: List[OrderItem]
    subtotal: float
    shipping: float
    tax: float
    total: float
    status: str = "Processing"
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class OrderCreate(BaseModel):
    customer: CustomerInfo
    items: List[OrderItem]
    subtotal: float
    shipping: float
    tax: float
    total: float


class OrderStatusUpdate(BaseModel):
    status: str


class ContactForm(BaseModel):
    name: str
    email: str
    message: str
    hcaptchaToken: str


class PromoCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discountType: str  # "percentage" or "fixed"
    discountValue: float
    description: str = ""
    expiryDate: Optional[datetime] = None
    usageLimit: Optional[int] = None
    usedCount: int = 0
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class PromoCodeCreate(BaseModel):
    code: str
    discountType: str
    discountValue: float
    description: str = ""
    expiryDate: Optional[datetime] = None
    usageLimit: Optional[int] = None


class PromoCodeValidate(BaseModel):
    code: str
    orderTotal: float


class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    alt: str = ""
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class GalleryImageCreate(BaseModel):
    url: str
    alt: str = ""
    order: int = 0

