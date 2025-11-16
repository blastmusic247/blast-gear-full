from fastapi import APIRouter, HTTPException
from models import ContactForm
import os
import requests
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

RECAPTCHA_SECRET_KEY = os.getenv('RECAPTCHA_SECRET_KEY')


@router.post("/contact")
async def submit_contact_form(form: ContactForm):
    """Submit contact form with reCAPTCHA verification"""
    
    # Verify reCAPTCHA token
    recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify'
    recaptcha_data = {
        'secret': RECAPTCHA_SECRET_KEY,
        'response': form.recaptchaToken
    }
    
    try:
        recaptcha_response = requests.post(recaptcha_url, data=recaptcha_data)
        recaptcha_result = recaptcha_response.json()
        
        if not recaptcha_result.get('success'):
            logger.error(f"reCAPTCHA verification failed: {recaptcha_result}")
            raise HTTPException(status_code=400, detail="reCAPTCHA verification failed")
        
        # Here you would typically send an email or store the message
        # For now, we'll just log it
        logger.info(f"Contact form submitted by {form.name} ({form.email}): {form.message}")
        
        return {
            "success": True,
            "message": "Thank you for contacting us. We'll get back to you soon!"
        }
        
    except requests.RequestException as e:
        logger.error(f"Error verifying reCAPTCHA: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing contact form")
