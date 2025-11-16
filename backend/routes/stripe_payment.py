from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import stripe
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


class CartItem(BaseModel):
    name: str
    price: float
    quantity: int


class CreatePaymentIntentRequest(BaseModel):
    amount: float
    items: List[CartItem]


@router.post("/create-payment-intent")
async def create_payment_intent(request: CreatePaymentIntentRequest):
    """Create a Stripe payment intent"""
    try:
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=int(request.amount * 100),  # Stripe uses cents
            currency='usd',
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'items': ', '.join([f"{item.name} x{item.quantity}" for item in request.items])
            }
        )
        
        return {
            'clientSecret': intent.client_secret,
            'paymentIntentId': intent.id
        }
        
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
